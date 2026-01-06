import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Garmin Activity Summary structure (from Activity API docs)
interface GarminActivitySummary {
  userId: string; // Garmin User ID
  summaryId: string;
  activityId: number;
  activityName: string;
  durationInSeconds: number;
  startTimeInSeconds: number;
  startTimeOffsetInSeconds: number;
  activityType: string; // RUNNING, CYCLING, etc
  distanceInMeters?: number;
  averageHeartRateInBeatsPerMinute?: number;
  averageRunCadenceInStepsPerMinute?: number;
  averagePaceInMinutesPerKilometer?: number;
  averageSpeedInMetersPerSecond?: number;
  activeKilocalories?: number;
  deviceName?: string;
  maxHeartRateInBeatsPerMinute?: number;
  manual: boolean;
}

interface GarminWebhookPayload {
  activitySummaries?: GarminActivitySummary[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Garmin sends PUSH notifications as POST requests with JSON data
  if (req.method === 'POST') {
    try {
      console.log('🔔🔔🔔 ===== GARMIN WEBHOOK CALLED ===== 🔔🔔🔔');
      console.log('📅 Timestamp:', new Date().toISOString());
      console.log('📍 Request URL:', req.url);
      console.log('📬 Request method:', req.method);
      
      const payload = await req.json() as GarminWebhookPayload;
      console.log('📦 Received Garmin webhook payload:', JSON.stringify(payload, null, 2));

      if (!payload.activitySummaries || payload.activitySummaries.length === 0) {
        console.log('ℹ️ No activity summaries in payload');
        return new Response('OK', { status: 200 });
      }

      const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Missing Supabase credentials');
        return new Response('Server configuration error', { status: 500 });
      }

      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Process each activity
      for (const activity of payload.activitySummaries) {
        try {
          console.log(`\n📊 Processing activity: ${activity.activityName} (ID: ${activity.activityId})`);
          console.log(`👤 Garmin User ID: ${activity.userId}`);

          // Find user by Garmin User ID
          const { data: connection, error: connError } = await supabaseAdmin
            .from('garmin_connections')
            .select('user_auth_id, access_token')
            .eq('garmin_user_id', activity.userId)
            .maybeSingle();

          if (connError || !connection) {
            console.log(`❌ No connection found for Garmin user ${activity.userId}`);
            continue;
          }

          console.log(`✅ Found connection for user: ${connection.user_auth_id}`);

          // Check if activity already exists
          const { data: existingActivity } = await supabaseAdmin
            .from('published_activities_simple')
            .select('id')
            .eq('garmin_activity_id', activity.activityId)
            .maybeSingle();

          if (existingActivity) {
            console.log(`⚠️ Activity ${activity.activityId} already exists, skipping`);
            continue;
          }

          // Map Garmin activity type to our internal types
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
            user_id: connection.user_auth_id,
            title: activity.activityName || `${activity.activityType} Activity`,
            description: `Imported from Garmin - ${activity.deviceName || 'Unknown device'}`,
            distance: distanceKm,
            duration: duration,
            calories: activity.activeKilocalories || null,
            workout_type: workoutType,
            is_public: false, // Default to private for imported activities
            garmin_activity_id: activity.activityId,
            imported_from_garmin: true,
            activity_date: activityDate,
            gps_points: [], // We don't get GPS points in the summary
            created_at: new Date().toISOString(),
          };

          console.log('💾 Saving activity to database...');
          console.log('Activity data:', JSON.stringify(activityData, null, 2));

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

          console.log(`✅✅✅ Activity saved successfully!`);
          console.log('📊 Saved activity details:');
          console.log('  - ID:', savedActivity.id);
          console.log('  - Title:', savedActivity.title);
          console.log('  - Distance:', savedActivity.distance, 'km');
          console.log('  - Duration:', savedActivity.duration);
          console.log('  - Garmin Activity ID:', savedActivity.garmin_activity_id);
          console.log('  - User ID:', savedActivity.user_id);

          // Check if this completes a workout in the plan
          console.log('🔍 Now checking if this completes a workout in the training plan...');
          await checkAndCompleteWorkout(
            supabaseAdmin,
            connection.user_auth_id,
            workoutType,
            distanceKm,
            activity.durationInSeconds / 60, // duration in minutes
            activityDate
          );

        } catch (activityError) {
          console.error(`❌ Error processing activity ${activity.activityId}:`, activityError);
        }
      }

      return new Response('OK', { status: 200 });

    } catch (error) {
      console.error('❌ Error processing Garmin webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
});

// Helper function to map Garmin activity types to internal types
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

// Helper function to format duration from seconds to HH:MM:SS
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(Math.floor(secs)).padStart(2, '0')}`;
}

// Helper function to check and complete workout
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

    // Get user's active plan
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

    // Find matching incomplete workout
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

    // Check if distance is close enough (within 10%)
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
        console.log('✅✅✅ Workout marked as completed successfully!');
        console.log('  - Workout ID:', matchingWorkout.id);
        console.log('  - Actual distance:', distanceKm, 'km');
        console.log('  - Actual duration:', durationMinutes, 'min');
      }
    } else {
      console.log(`ℹ️ Distance doesn't match (expected: ${matchingWorkout.distance_km}km, got: ${distanceKm}km)`);
    }

  } catch (error) {
    console.error('❌ Error checking workout completion:', error);
  }
}




