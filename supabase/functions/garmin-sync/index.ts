import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Garmin API endpoints (OAuth 2.0)
// Use backfill endpoint for pulling historical activities
const BACKFILL_URL = 'https://apis.garmin.com/wellness-api/rest/backfill/activities';
const TOKEN_URL = 'https://connectapi.garmin.com/di-oauth2-service/oauth/token';

// Function to refresh expired Garmin token
async function refreshGarminToken(
  supabaseAdmin: any,
  connection: any
): Promise<{ access_token: string; expires_at: Date } | null> {
  console.log('🔄 Attempting to refresh Garmin token...');
  
  const GARMIN_CLIENT_ID = Deno.env.get('GARMIN_CLIENT_ID');
  const GARMIN_CLIENT_SECRET = Deno.env.get('GARMIN_CLIENT_SECRET');
  
  if (!GARMIN_CLIENT_ID || !GARMIN_CLIENT_SECRET) {
    console.error('❌ Missing Garmin client credentials');
    return null;
  }
  
  if (!connection.refresh_token) {
    console.error('❌ No refresh token available');
    return null;
  }
  
  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: connection.refresh_token,
      client_id: GARMIN_CLIENT_ID,
      client_secret: GARMIN_CLIENT_SECRET,
    });
    
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Token refresh failed:', response.status, errorText);
      return null;
    }
    
    const tokenData = await response.json();
    console.log('✅ Token refreshed successfully');
    
    // Calculate new expiration time (usually 1 hour from now)
    const expiresIn = tokenData.expires_in || 3600; // Default 1 hour
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    
    // Update the connection in the database
    const { error: updateError } = await supabaseAdmin
      .from('garmin_connections')
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || connection.refresh_token, // Use new one if provided
        token_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection.id);
    
    if (updateError) {
      console.error('❌ Error updating token in database:', updateError);
      return null;
    }
    
    console.log('✅ Token updated in database, expires at:', expiresAt.toISOString());
    
    return {
      access_token: tokenData.access_token,
      expires_at: expiresAt,
    };
  } catch (error) {
    console.error('❌ Error refreshing token:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting Garmin manual sync...');

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase configuration');
    }

    // Get user
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    console.log('👤 User ID:', user.id);

    // Get Garmin connection
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: connection, error: connError } = await supabaseAdmin
      .from('garmin_connections')
      .select('*')
      .eq('user_auth_id', user.id)
      .maybeSingle();

    if (connError || !connection) {
      console.error('❌ No Garmin connection found');
      throw new Error('Garmin not connected. Please connect your Garmin account first.');
    }

    console.log('✅ Found Garmin connection');
    console.log('🔑 Access token (first 20 chars):', connection.access_token?.substring(0, 20) + '...');

    // Check if token is expired and refresh if needed
    let accessToken = connection.access_token;
    
    if (connection.token_expires_at) {
      const expiresAt = new Date(connection.token_expires_at);
      const now = new Date();
      
      // Refresh if expired or expiring in the next 5 minutes
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
      
      if (expiresAt < fiveMinutesFromNow) {
        console.log('⚠️ Access token expired or expiring soon, attempting refresh...');
        
        const refreshResult = await refreshGarminToken(supabaseAdmin, connection);
        
        if (refreshResult) {
          accessToken = refreshResult.access_token;
          console.log('✅ Using refreshed token');
        } else {
          console.error('❌ Token refresh failed');
          throw new Error('Garmin token expired and refresh failed. Please reconnect your Garmin account.');
        }
      } else {
        console.log('⏰ Token valid until:', expiresAt.toISOString());
      }
    }

    // Garmin API limits queries to 24 hours (86400 seconds) max
    // Fetch last 7 days in 24-hour chunks
    const SECONDS_PER_DAY = 86400;
    const DAYS_TO_FETCH = 7;
    const allActivities: any[] = [];
    
    const now = Math.floor(Date.now() / 1000);
    
    console.log(`📅 Fetching activities from the last ${DAYS_TO_FETCH} days (in 24h chunks)...`);

    for (let day = 0; day < DAYS_TO_FETCH; day++) {
      const endTime = now - (day * SECONDS_PER_DAY);
      const startTime = endTime - SECONDS_PER_DAY;
      
      console.log(`📆 Day ${day + 1}: ${new Date(startTime * 1000).toISOString().split('T')[0]}`);
      
      // Use backfill endpoint with summaryStartTimeInSeconds/summaryEndTimeInSeconds
      const queryParams = `summaryStartTimeInSeconds=${startTime}&summaryEndTimeInSeconds=${endTime}`;
      const fullUrl = `${BACKFILL_URL}?${queryParams}`;

      console.log(`  🔗 URL: ${fullUrl}`);

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Day ${day + 1} error:`, response.status, errorText);
        // Continue with other days instead of failing completely
        continue;
      }

      const dayActivities = await response.json();
      if (dayActivities && dayActivities.length > 0) {
        console.log(`  ✅ Found ${dayActivities.length} activities`);
        allActivities.push(...dayActivities);
      } else {
        console.log(`  ℹ️ No activities`);
      }
    }

    const activities = allActivities;
    console.log(`📊 Total activities found: ${activities.length}`);

    if (!activities || activities.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No new activities found',
          activitiesImported: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Process each activity (using same logic as webhook)
    let importedCount = 0;
    let skippedCount = 0;

    for (const activity of activities) {
      try {
        console.log(`\n📊 Processing activity: ${activity.activityName} (ID: ${activity.activityId})`);

        // Check if activity already exists
        const { data: existingActivity } = await supabaseAdmin
          .from('published_activities_simple')
          .select('id')
          .eq('garmin_activity_id', activity.activityId.toString())
          .maybeSingle();

        if (existingActivity) {
          console.log(`⚠️ Activity ${activity.activityId} already exists, skipping`);
          skippedCount++;
          continue;
        }

        // Map activity type
        const workoutType = mapGarminActivityType(activity.activityType);
        
        // Convert distance from meters to kilometers
        const distanceKm = activity.distanceInMeters 
          ? Math.round(activity.distanceInMeters / 1000 * 100) / 100 
          : 0;

        // Convert duration to HH:MM:SS format
        const duration = formatDuration(activity.durationInSeconds);

        // Convert start time to ISO string
        const activityDate = new Date(activity.startTimeInSeconds * 1000).toISOString();

        // Prepare activity data
        const activityData = {
          user_id: user.id,
          title: activity.activityName || `${activity.activityType} Activity`,
          description: `Imported from Garmin - ${activity.deviceName || 'Unknown device'}`,
          distance: distanceKm,
          duration: duration,
          calories: activity.activeKilocalories || null,
          workout_type: workoutType,
          is_public: false,
          garmin_activity_id: activity.activityId.toString(),
          imported_from_garmin: true,
          activity_date: activityDate,
          gps_points: [],
          created_at: new Date().toISOString(),
        };

        console.log('💾 Saving activity to database...');

        // Insert activity
        const { data: savedActivity, error: insertError } = await supabaseAdmin
          .from('published_activities_simple')
          .insert(activityData)
          .select()
          .single();

        if (insertError) {
          console.error('❌ Error inserting activity:', insertError);
          continue;
        }

        console.log(`✅ Activity saved successfully: ${savedActivity.id}`);
        importedCount++;

        // Check if this completes a workout in the plan
        await checkAndCompleteWorkout(
          supabaseAdmin,
          user.id,
          workoutType,
          distanceKm,
          activity.durationInSeconds / 60,
          activityDate
        );

      } catch (activityError) {
        console.error(`❌ Error processing activity ${activity.activityId}:`, activityError);
      }
    }

    console.log(`\n✅ Sync completed: ${importedCount} imported, ${skippedCount} skipped`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully imported ${importedCount} activities`,
        activitiesImported: importedCount,
        activitiesSkipped: skippedCount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error in garmin-sync:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});

// Helper functions (same as webhook)

function mapGarminActivityType(garminType: string): string {
  const typeMap: Record<string, string> = {
    'RUNNING': 'carrera',
    'TRAIL_RUNNING': 'carrera',
    'TREADMILL_RUNNING': 'carrera',
    'TRACK_RUNNING': 'carrera',
    'VIRTUAL_RUN': 'carrera',
    'CYCLING': 'ciclismo',
    'ROAD_BIKING': 'ciclismo',
    'MOUNTAIN_BIKING': 'ciclismo',
    'GRAVEL_CYCLING': 'ciclismo',
    'VIRTUAL_RIDE': 'ciclismo',
    'INDOOR_CYCLING': 'ciclismo',
    'WALKING': 'caminata',
    'HIKING': 'caminata',
    'CASUAL_WALKING': 'caminata',
    'SWIMMING': 'natacion',
    'LAP_SWIMMING': 'natacion',
    'OPEN_WATER_SWIMMING': 'natacion',
    'STRENGTH_TRAINING': 'entrenamiento',
    'CARDIO': 'entrenamiento',
    'YOGA': 'entrenamiento',
  };

  return typeMap[garminType] || 'otro';
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(Math.floor(secs)).padStart(2, '0')}`;
}

async function checkAndCompleteWorkout(
  supabase: any,
  userId: string,
  workoutType: string,
  distanceKm: number,
  durationMinutes: number,
  activityDate: string
) {
  try {
    console.log('🔍 Checking for matching workout in plan...');

    const { data: activePlan } = await supabase
      .from('training_plans')
      .select('id, current_week')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (!activePlan) {
      console.log('ℹ️ No active plan found');
      return;
    }

    const activityDateOnly = activityDate.split('T')[0];
    
    const { data: matchingWorkout } = await supabase
      .from('simple_workouts')
      .select('id, distance_km, duration_minutes')
      .eq('user_id', userId)
      .eq('plan_id', activePlan.id)
      .eq('completed', false)
      .eq('workout_type', workoutType)
      .gte('workout_date', activityDateOnly)
      .order('workout_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!matchingWorkout) {
      console.log('ℹ️ No matching incomplete workout found');
      return;
    }

    const distanceTolerance = matchingWorkout.distance_km * 0.1;
    const distanceMatch = Math.abs(distanceKm - matchingWorkout.distance_km) <= distanceTolerance;

    if (distanceMatch) {
      console.log(`✅ Marking workout ${matchingWorkout.id} as completed`);
      
      const { error: updateError } = await supabase
        .from('simple_workouts')
        .update({
          completed: true,
          actual_distance_km: distanceKm,
          actual_duration_minutes: durationMinutes,
          completed_at: activityDate
        })
        .eq('id', matchingWorkout.id);

      if (updateError) {
        console.error('❌ Error updating workout:', updateError);
      } else {
        console.log('✅ Workout marked as completed');
      }
    } else {
      console.log(`ℹ️ Distance doesn't match (expected: ${matchingWorkout.distance_km}km, got: ${distanceKm}km)`);
    }

  } catch (error) {
    console.error('❌ Error checking workout completion:', error);
  }
}



