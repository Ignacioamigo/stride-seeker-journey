import { supabase } from '@/integrations/supabase/client';
import { PublishedActivity, WorkoutPublishData, WorkoutMetrics, SplitTime, GPSPoint } from '@/types';

// Calculate distance between two GPS points using Haversine formula
const calculateDistance = (point1: GPSPoint, point2: GPSPoint): number => {
  const R = 6371000; // Earth's radius in meters
  const lat1Rad = (point1.latitude * Math.PI) / 180;
  const lat2Rad = (point2.latitude * Math.PI) / 180;
  const deltaLatRad = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const deltaLonRad = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const publishActivity = async (data: WorkoutPublishData): Promise<string> => {
  console.log('🚀 [SUPABASE-FIRST] Publishing activity:', data.title);
  
  // Generate unique ID for fallback
  const fallbackId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // 1. TRY SUPABASE FIRST (PRIMARY)
    console.log('☁️ [SUPABASE] Attempting direct save to Supabase...');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!userError && user) {
      console.log('✅ [SUPABASE] User authenticated:', user.id);
      
      // Get user profile ID
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_auth_id', user.id)
        .single();
      
      if (!userProfile) {
        console.error('❌ [SUPABASE] User profile not found for auth user:', user.id);
        throw new Error('User profile not found');
      }
      
      console.log('✅ [SUPABASE] User profile found:', userProfile.id);
      
      // Handle image upload if provided
      let imageUrl = null;
      if (data.image) {
        console.log('📸 [SUPABASE] Uploading image...');
        
        try {
          const fileExt = data.image.name.split('.').pop() || 'jpg';
          const fileName = `${user.id}/activity_${Date.now()}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('activity-images')
            .upload(fileName, data.image, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (!uploadError && uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('activity-images')
              .getPublicUrl(fileName);
            imageUrl = publicUrl;
            console.log('✅ [SUPABASE] Image uploaded:', imageUrl);
          } else {
            console.warn('⚠️ [SUPABASE] Image upload failed, continuing without image:', uploadError);
          }
        } catch (imageError) {
          console.warn('⚠️ [SUPABASE] Image upload error:', imageError);
        }
      }
      
      // Prepare data for Supabase
      // ✅ FIX: distance viene en metros, convertir a km
      const distanceKm = Math.round(data.runSession.distance / 1000 * 100) / 100;
      
      const supabaseData = {
        user_id: userProfile.id,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        image_url: imageUrl,
        distance: distanceKm,
        duration: data.runSession.duration, // Ya es string HH:MM:SS
        gps_points: data.runSession.gpsPoints || [],
        is_public: data.isPublic,
        activity_date: data.runSession.startTime.toISOString(),
      };
      
      console.log('💾 [SUPABASE] Inserting activity...');
      
      const { data: savedActivity, error: insertError } = await supabase
        .from('published_activities')
        .insert(supabaseData)
        .select()
        .single();
      
      if (!insertError && savedActivity) {
        console.log('✅ [SUPABASE] Activity saved successfully to cloud:', savedActivity.id);
        
        // Also cache locally for quick access
        const localData = {
          id: savedActivity.id,
          ...supabaseData,
          supabase_id: savedActivity.id,
          created_at: savedActivity.created_at,
          sync_status: 'synced'
        };
        
        saveToLocalCache(localData);
        
        return savedActivity.id;
      } else {
        console.warn('⚠️ [SUPABASE] Insert failed, falling back to local:', insertError);
      }
    } else {
      console.log('⚠️ [SUPABASE] No authenticated user, falling back to local');
    }
    
  } catch (supabaseError) {
    console.warn('⚠️ [SUPABASE] Primary save failed, falling back to local:', supabaseError);
  }
  
  // 2. FALLBACK TO LOCAL STORAGE
  console.log('📱 [FALLBACK] Saving to local storage...');
  
  // ✅ FIX: distance viene en metros, convertir a km
  const fallbackDistanceKm = Math.round(data.runSession.distance / 1000 * 100) / 100;
  
  const activityData = {
    id: fallbackId,
    user_id: 'local_user',
    title: data.title.trim(),
    description: data.description?.trim() || null,
    image_url: null, // Images saved separately in local
    distance: fallbackDistanceKm,
    duration: data.runSession.duration, // Ya es string HH:MM:SS
    gps_points: data.runSession.gpsPoints || [],
    is_public: data.isPublic,
    activity_date: data.runSession.startTime.toISOString(),
    created_at: new Date().toISOString(),
    likes: 0,
    comments: 0,
    sync_status: 'pending'
  };
  
  try {
    saveToLocalCache(activityData);
    console.log('✅ [FALLBACK] Activity saved locally');
    
    // Try sync in background
    syncWithSupabaseInBackground(activityData);
    
    return fallbackId;
    
  } catch (localError) {
    console.error('💥 [CRITICAL] Even fallback failed:', localError);
    throw new Error('Error crítico: No se pudo guardar la actividad.');
  }
};

// Helper function to save to local cache
function saveToLocalCache(activityData: any) {
  const existingActivities = localStorage.getItem('userActivities');
  const activities = existingActivities ? JSON.parse(existingActivities) : [];
  
  // Check if already exists
  const existingIndex = activities.findIndex((a: any) => a.id === activityData.id);
  if (existingIndex >= 0) {
    activities[existingIndex] = activityData; // Update existing
  } else {
    activities.unshift(activityData); // Add new
  }
  
  // Keep last 100 activities
  if (activities.length > 100) {
    activities.splice(100);
  }
  
  localStorage.setItem('userActivities', JSON.stringify(activities));
}

// Background sync function (non-blocking)
async function syncWithSupabaseInBackground(activityData: any) {
  try {
    console.log('🔄 [SYNC] Attempting background sync with Supabase...');
    
    // Get user with timeout
    const userPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 10000) // Increased timeout
    );
    
    const { data: { user }, error: userError } = await Promise.race([
      userPromise, 
      timeoutPromise
    ]) as any;
    
    if (userError || !user) {
      console.log('⚠️ [SYNC] No authenticated user, keeping local');
      return false;
    }
    
    console.log('✅ [SYNC] User authenticated:', user.id);
    
    // Get user profile ID
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_auth_id', user.id)
      .single();
    
    if (!userProfile) {
      console.error('❌ [SYNC] User profile not found for auth user:', user.id);
      return false;
    }
    
    console.log('✅ [SYNC] User profile found:', userProfile.id);
    
    // Prepare data for Supabase
    const supabaseData = {
      user_id: userProfile.id,
      title: activityData.title,
      description: activityData.description,
      image_url: activityData.image_url,
      distance: activityData.distance,
      duration: activityData.duration,
      gps_points: activityData.gps_points,
      is_public: activityData.is_public,
      activity_date: activityData.activity_date,
      likes: activityData.likes || 0,
      comments: activityData.comments || 0
    };
    
    console.log('💾 [SYNC] Inserting to Supabase:', supabaseData);
    
    const { data: savedActivity, error: insertError } = await supabase
      .from('published_activities')
      .insert(supabaseData)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ [SYNC] Supabase insert failed:', insertError);
      console.error('❌ [SYNC] Error details:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
      return false;
    }
    
    console.log('✅ [SYNC] Activity synced successfully:', savedActivity.id);
    
    // Update local record with Supabase ID and sync status
    const localActivities = JSON.parse(localStorage.getItem('userActivities') || '[]');
    const activityIndex = localActivities.findIndex((a: any) => a.id === activityData.id);
    
    if (activityIndex >= 0) {
      localActivities[activityIndex] = {
        ...localActivities[activityIndex],
        supabase_id: savedActivity.id,
        sync_status: 'synced'
      };
      localStorage.setItem('userActivities', JSON.stringify(localActivities));
      console.log('✅ [SYNC] Local record updated with sync status');
    }
    
    return true;
    
  } catch (syncError) {
    console.error('💥 [SYNC] Background sync failed:', syncError);
    return false;
  }
}

export const getUserActivities = async (): Promise<PublishedActivity[]> => {
  console.log('📱 [NEW-SYSTEM] Loading user activities...');
  
  try {
    // 🔥 USAR SUPABASE AUTH COMO FUENTE ÚNICA DE VERDAD
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    let userId: string | null = null;
    
    if (!userError && user) {
      // Get user profile ID
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_auth_id', user.id)
        .single();
      
      if (userProfile) {
        userId = userProfile.id;
        console.log('✅ [SUPABASE-AUTH] Using user profile ID:', userId);
        
        // Sincronizar con localStorage para compatibilidad
        localStorage.setItem('stride_user_id', userId);
      } else {
        console.error('❌ [SUPABASE-AUTH] User profile not found for auth user:', user.id);
        // Fallback al comportamiento anterior
        userId = localStorage.getItem('stride_user_id');
        if (!userId || !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
          userId = crypto.randomUUID();
          localStorage.setItem('stride_user_id', userId);
        }
      }
    } else {
      // Fallback a localStorage solo si no hay autenticación
      userId = localStorage.getItem('stride_user_id');
      if (!userId || !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        console.log('🔄 Generando nuevo UUID para activities (fallback)');
        userId = crypto.randomUUID();
        localStorage.setItem('stride_user_id', userId);
      }
      console.log('📝 [FALLBACK] Using localStorage user ID:', userId);
    }
    
    // 1. TRY SUPABASE FIRST (PRIMARY) - CON USUARIO CORRECTO
    console.log('☁️ [SUPABASE] Attempting to load from cloud...');
    
    if (userId) {
      console.log('✅ [SUPABASE] User ID found:', userId);
      
      const { data: supabaseActivities, error: fetchError } = await supabase
        .from('published_activities')
        .select(`
          id,
          title,
          description,
          image_url,
          distance,
          duration,
          gps_points,
          is_public,
          activity_date,
          created_at,
          likes,
          comments
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (!fetchError && supabaseActivities) {
        console.log(`✅ [SUPABASE] Loaded ${supabaseActivities.length} activities from cloud`);
        
        // Transform Supabase data
        const transformedSupabaseActivities = supabaseActivities.map(activity => ({
          id: activity.id,
          title: activity.title,
          description: activity.description || '',
          imageUrl: activity.image_url,
          runSession: {
            id: activity.id,
            startTime: new Date(activity.activity_date),
            distance: activity.distance,
            duration: activity.duration,
            gpsPoints: activity.gps_points || [],
            isActive: false,
            isPaused: false
          },
          publishedAt: new Date(activity.created_at),
          isPublic: activity.is_public,
          likes: activity.likes || 0,
          comments: activity.comments || 0,
          userProfile: {
            name: 'Usuario',
          },
          syncStatus: 'synced' as const
        }));
        
        // Update local cache with Supabase data
        const cacheData = supabaseActivities.map(activity => ({
          ...activity,
          sync_status: 'synced',
          supabase_id: activity.id
        }));
        localStorage.setItem('userActivities', JSON.stringify(cacheData));
        console.log('💾 [CACHE] Updated local cache with Supabase data');
        
        // Try to sync any pending local activities
        syncPendingActivitiesInBackground();
        
        return transformedSupabaseActivities;
      } else {
        console.warn('⚠️ [SUPABASE] Failed to load from cloud, falling back to local:', fetchError);
      }
    } else {
      console.log('⚠️ [SUPABASE] No user ID found, falling back to local');
    }
    
  } catch (supabaseError) {
    console.warn('⚠️ [SUPABASE] Cloud load failed, falling back to local:', supabaseError);
  }
  
  // 2. FALLBACK TO LOCAL STORAGE
  console.log('📱 [FALLBACK] Loading from local storage...');
  
  try {
    const localActivities = localStorage.getItem('userActivities');
    if (!localActivities) {
      console.log('📝 [LOCAL] No local activities found');
      return [];
    }
    
    const activities = JSON.parse(localActivities);
    console.log(`✅ [LOCAL] Found ${activities.length} local activities`);
    
    // Transform local data
    const transformedActivities = activities.map((activity: any) => ({
      id: activity.id,
      title: activity.title,
      description: activity.description || '',
      imageUrl: activity.image_url,
      runSession: {
        id: activity.id,
        startTime: new Date(activity.activity_date),
        distance: activity.distance,
        duration: activity.duration,
        gpsPoints: Array.isArray(activity.gps_points) ? activity.gps_points : [],
        isActive: false,
        isPaused: false
      },
      publishedAt: new Date(activity.created_at),
      isPublic: activity.is_public,
      likes: activity.likes || 0,
      comments: activity.comments || 0,
      userProfile: {
        name: 'Usuario',
      },
      syncStatus: activity.sync_status || 'local' as const
    }));
    
    // Try to sync pending activities in background
    syncPendingActivitiesInBackground();
    
    return transformedActivities;
    
  } catch (error) {
    console.error('💥 [FALLBACK] Failed to load local activities:', error);
    return [];
  }
};

// Background sync for pending activities
async function syncPendingActivitiesInBackground() {
  try {
    console.log('🔄 [SYNC] Checking for pending activities to sync...');
    
    const localActivities = JSON.parse(localStorage.getItem('userActivities') || '[]');
    const pendingActivities = localActivities.filter((a: any) => a.sync_status === 'pending');
    
    if (pendingActivities.length === 0) {
      console.log('✅ [SYNC] All activities are synced');
      return;
    }
    
    console.log(`🔄 [SYNC] Found ${pendingActivities.length} pending activities`);
    
    let syncedCount = 0;
    // Try to sync each pending activity
    for (const activity of pendingActivities) {
      const success = await syncWithSupabaseInBackground(activity);
      if (success) {
        syncedCount++;
      }
      // Small delay between syncs to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`✅ [SYNC] Successfully synced ${syncedCount}/${pendingActivities.length} activities`);
    
  } catch (error) {
    console.warn('⚠️ [SYNC] Background sync of pending activities failed:', error);
  }
}

// Manual function to migrate all local data to Supabase
export const migrateAllLocalDataToSupabase = async (): Promise<{success: number, failed: number}> => {
  console.log('🚀 [MIGRATION] Starting migration of all local data to Supabase...');
  
  try {
    const localActivities = JSON.parse(localStorage.getItem('userActivities') || '[]');
    
    if (localActivities.length === 0) {
      console.log('📝 [MIGRATION] No local activities to migrate');
      return {success: 0, failed: 0};
    }
    
    console.log(`📊 [MIGRATION] Found ${localActivities.length} local activities to migrate`);
    
    let success = 0;
    let failed = 0;
    
    for (const activity of localActivities) {
      console.log(`🔄 [MIGRATION] Migrating: ${activity.title}`);
      
      const migrationSuccess = await syncWithSupabaseInBackground(activity);
      if (migrationSuccess) {
        success++;
        console.log(`✅ [MIGRATION] Successfully migrated: ${activity.title}`);
      } else {
        failed++;
        console.log(`❌ [MIGRATION] Failed to migrate: ${activity.title}`);
      }
      
      // Delay between migrations
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    console.log(`🎉 [MIGRATION] Migration complete! Success: ${success}, Failed: ${failed}`);
    return {success, failed};
    
  } catch (error) {
    console.error('💥 [MIGRATION] Migration failed:', error);
    return {success: 0, failed: 0};
  }
};

// Cache functions for offline support
const getLocalCache = (): PublishedActivity[] => {
  try {
    console.log('💾 [CACHE] Reading cached activities...');
    
    // Try new cache format first
    const cachedActivities = localStorage.getItem('cachedActivities');
    if (cachedActivities) {
      const activities = JSON.parse(cachedActivities);
      console.log(`💾 [CACHE] Found ${activities.length} cached activities`);
      
      return activities.map((activity: any) => ({
        id: activity.id,
        title: activity.title,
        description: activity.description || '',
        imageUrl: activity.image_url,
        runSession: {
          id: activity.id,
          startTime: new Date(activity.activity_date),
          distance: activity.distance,
          duration: activity.duration,
          gpsPoints: activity.gps_points ? JSON.parse(activity.gps_points) : [],
          isActive: false,
          isPaused: false
        },
        publishedAt: new Date(activity.created_at),
        isPublic: activity.is_public,
        likes: activity.likes || 0,
        comments: activity.comments || 0,
        userProfile: {
          name: 'Usuario',
        }
      }));
    }
    
    // Fallback to old localStorage format (migration support)
    const legacyActivities = localStorage.getItem('publishedActivities');
    if (legacyActivities) {
      console.log('🔄 [MIGRATION] Found legacy activities, migrating...');
      const activities = JSON.parse(legacyActivities);
      
      const migratedActivities = activities.map((activity: any) => ({
        id: activity.id,
        title: activity.title,
        description: activity.description || '',
        imageUrl: activity.image_url,
        runSession: {
          id: activity.id,
          startTime: new Date(activity.activity_date),
          distance: activity.distance,
          duration: activity.duration,
          gpsPoints: activity.gps_points ? JSON.parse(activity.gps_points) : [],
          isActive: false,
          isPaused: false
        },
        publishedAt: new Date(activity.created_at),
        isPublic: activity.is_public,
        likes: 0,
        comments: 0,
        userProfile: {
          name: 'Usuario',
        }
      }));
      
      // Clean up old format
      localStorage.removeItem('publishedActivities');
      
      return migratedActivities;
    }
    
    console.log('💾 [CACHE] No cached activities found');
    return [];
  } catch (error) {
    console.error('❌ [CACHE] Error reading cache:', error);
    return [];
  }
};

// Clear all local data (for debugging/reset)
export const clearLocalData = () => {
  localStorage.removeItem('cachedActivities');
  localStorage.removeItem('publishedActivities');
  console.log('🗑️ [CACHE] All local data cleared');
};

export const calculateWorkoutMetrics = (runSession: any): WorkoutMetrics => {
  const totalDistance = runSession.distance;
  const totalDuration = runSession.duration;
  
  // Calculate average speed
  const durationParts = totalDuration.split(':');
  const totalMinutes = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]) + parseInt(durationParts[2]) / 60;
  const averageSpeed = totalMinutes > 0 ? (totalDistance / 1000) / (totalMinutes / 60) : 0;
  
  // Calculate average pace
  const kmDistance = totalDistance / 1000;
  const averagePaceMinutes = kmDistance > 0 ? totalMinutes / kmDistance : 0;
  const paceMin = Math.floor(averagePaceMinutes);
  const paceSec = Math.floor((averagePaceMinutes - paceMin) * 60);
  const averagePace = `${paceMin}:${paceSec.toString().padStart(2, '0')}`;
  
  // Calculate split times (per kilometer)
  const splitTimes: SplitTime[] = [];
  const points = runSession.gpsPoints || [];
  
  if (points.length > 1) {
    let currentKm = 1;
    let kmStartIndex = 0;
    let accumulatedDistance = 0;
    
    for (let i = 1; i < points.length; i++) {
      const segmentDistance = calculateDistance(points[i-1], points[i]);
      accumulatedDistance += segmentDistance;
      
      if (accumulatedDistance >= currentKm * 1000 && currentKm <= 100) {
        const kmStartTime = new Date(points[kmStartIndex].timestamp);
        const kmEndTime = new Date(points[i].timestamp);
        const kmDuration = (kmEndTime.getTime() - kmStartTime.getTime()) / 1000;
        
        const kmMin = Math.floor(kmDuration / 60);
        const kmSec = Math.floor(kmDuration % 60);
        const kmTime = `${kmMin}:${kmSec.toString().padStart(2, '0')}`;
        
        const kmSpeed = kmDuration > 0 ? 3600 / kmDuration : 0;
        
        splitTimes.push({
          kilometer: currentKm,
          time: kmTime,
          pace: kmTime,
          speed: kmSpeed
        });
        
        currentKm++;
        kmStartIndex = i;
      }
    }
  }
  
  // Estimate calories (rough calculation)
  const estimatedCalories = Math.round(totalDistance / 1000 * 60); // ~60 cal per km
  
  // Calculate elevation gain (desnivel positivo)
  let elevationGain = 0;
  if (points.length > 1) {
    for (let i = 1; i < points.length; i++) {
      const prevAltitude = points[i - 1].altitude;
      const currentAltitude = points[i].altitude;
      
      // Solo sumar si ambas altitudes existen y hay subida
      if (prevAltitude !== undefined && currentAltitude !== undefined) {
        const altitudeDiff = currentAltitude - prevAltitude;
        // Solo contar subidas (desnivel positivo), filtrar ruido menor a 1m
        if (altitudeDiff > 1) {
          elevationGain += altitudeDiff;
        }
      }
    }
  }
  
  return {
    totalDistance,
    totalDuration,
    averageSpeed,
    averagePace,
    calories: estimatedCalories,
    elevationGain: Math.round(elevationGain),
    splitTimes
  };
};

export const deleteActivity = async (id: string): Promise<void> => {
  try {
    // Try database first
    const { error } = await supabase
      .from('published_activities')
      .delete()
      .eq('id', id);
    
    if (!error) return;
  } catch (error) {
    console.log('Database delete failed, trying localStorage');
  }
  
  // Fallback to localStorage
  const localActivities = localStorage.getItem('publishedActivities');
  if (localActivities) {
    const activities = JSON.parse(localActivities);
    const filteredActivities = activities.filter((activity: any) => activity.id !== id);
    localStorage.setItem('publishedActivities', JSON.stringify(filteredActivities));
  }
};
