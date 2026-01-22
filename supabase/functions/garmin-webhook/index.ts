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
  activities?: GarminActivitySummary[];  // Garmin also sends as "activities"
  activityDetails?: Array<{              // And sometimes as "activityDetails"
    userId: string;
    summaryId: string;
    activityId: number;
    summary: GarminActivitySummary;
  }>;
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

      // Handle different Garmin payload formats
      let activitiesToProcess: GarminActivitySummary[] = [];
      
      if (payload.activitySummaries && payload.activitySummaries.length > 0) {
        console.log('📋 Found activitySummaries format');
        activitiesToProcess = payload.activitySummaries;
      } else if (payload.activities && payload.activities.length > 0) {
        console.log('📋 Found activities format');
        activitiesToProcess = payload.activities;
      } else if (payload.activityDetails && payload.activityDetails.length > 0) {
        console.log('📋 Found activityDetails format');
        // Extract summaries from activityDetails
        activitiesToProcess = payload.activityDetails.map(detail => ({
          ...detail.summary,
          userId: detail.userId,
          summaryId: detail.summaryId,
          activityId: detail.activityId,
        }));
      }

      if (activitiesToProcess.length === 0) {
        console.log('ℹ️ No activities found in payload');
        return new Response('OK', { status: 200 });
      }
      
      console.log(`✅ Found ${activitiesToProcess.length} activities to process`);

      const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Missing Supabase credentials');
        return new Response('Server configuration error', { status: 500 });
      }

      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Minimum thresholds for activities to be counted
      const MIN_DURATION_SECONDS = 60;  // 1 minute minimum
      const MIN_DISTANCE_METERS = 100;   // 100 meters minimum

      // Process each activity
      for (const activity of activitiesToProcess) {
        try {
          console.log(`\n📊 Processing activity: ${activity.activityName} (ID: ${activity.activityId})`);
          console.log(`👤 Garmin User ID: ${activity.userId}`);
          console.log(`⏱️ Duration: ${activity.durationInSeconds}s, Distance: ${activity.distanceInMeters || 0}m`);

          // Filter out activities that are too short (less than 1 minute OR less than 100 meters)
          if (activity.durationInSeconds < MIN_DURATION_SECONDS || 
              (activity.distanceInMeters && activity.distanceInMeters < MIN_DISTANCE_METERS)) {
            console.log(`⚠️ Activity too short (min: ${MIN_DURATION_SECONDS}s / ${MIN_DISTANCE_METERS}m), skipping`);
            continue;
          }

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

        // Get user's active plan to include plan_id and week_number
        console.log('🔍 Looking for active plan...');
        let planId = null;
        let weekNumber = null;
        
        const { data: activePlan } = await supabaseAdmin
          .from('training_plans')
          .select('id, week_number')
          .eq('user_id', connection.user_auth_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (activePlan) {
          planId = activePlan.id;
          weekNumber = activePlan.week_number || 1;
          console.log(`✅ Found active plan: ${planId}, week ${weekNumber}`);
        } else {
          console.log('ℹ️ No active plan found, using null values');
        }

        // Also save to simple_workouts for statistics calculation (the table the app uses)
        console.log('📊 Saving to simple_workouts for statistics...');

        const simpleWorkoutsData = {
          user_id: connection.user_auth_id,
          workout_title: activity.activityName || `${activity.activityType} Activity`,
          workout_type: workoutType,
          distance_km: distanceKm,
          duration_minutes: Math.floor(activity.durationInSeconds / 60),
          workout_date: activityDate.split('T')[0],
          plan_id: planId,
          week_number: weekNumber
        };

        const { error: simpleWorkoutsError } = await supabaseAdmin
          .from('simple_workouts')
          .insert(simpleWorkoutsData);

        if (simpleWorkoutsError) {
          console.error('⚠️ Error saving to simple_workouts:', simpleWorkoutsError);
        } else {
          console.log('✅ Saved to simple_workouts with plan_id:', planId, 'week_number:', weekNumber);
        }

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

// Helper function to auto-complete the next pending workout
async function checkAndCompleteWorkout(
  supabase: any,
  userId: string,
  workoutType: string,
  distanceKm: number,
  durationMinutes: number,
  activityDate: string
) {
  try {
    console.log('🔍 Looking for next pending workout to auto-complete...');

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

    console.log(`✅ Found active plan: ${activePlan.id}`);

    // Find the next incomplete workout (ordered by date, any type)
    const { data: nextWorkout } = await supabase
      .from('simple_workouts')
      .select('id, workout_title, distance_km, workout_type')
      .eq('user_id', userId)
      .eq('plan_id', activePlan.id)
      .eq('completed', false)
      .order('workout_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!nextWorkout) {
      console.log('ℹ️ No pending workouts found in plan');
      return;
    }

    console.log(`📋 Found next pending workout: ${nextWorkout.workout_title} (ID: ${nextWorkout.id})`);
    console.log(`✅ Auto-completing workout with Garmin activity data...`);
    
    const { error: updateError } = await supabase
      .from('simple_workouts')
      .update({
        completed: true,
        actual_distance_km: distanceKm,
        actual_duration_minutes: durationMinutes,
        completed_at: activityDate
      })
      .eq('id', nextWorkout.id);

    if (updateError) {
      console.error('❌ Error updating workout:', updateError);
    } else {
      console.log('✅✅✅ Workout auto-completed successfully!');
      console.log('  - Workout ID:', nextWorkout.id);
      console.log('  - Workout title:', nextWorkout.workout_title);
      console.log('  - Actual distance:', distanceKm, 'km');
      console.log('  - Actual duration:', durationMinutes, 'min');
    }

  } catch (error) {
    console.error('❌ Error in auto-complete workout:', error);
  }
}




