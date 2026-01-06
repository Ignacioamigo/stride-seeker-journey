-- Script SQL para verificar datos de Garmin en Supabase
-- Copia y pega estas queries en el SQL Editor de Supabase

-- ========================================
-- 1. Verificar conexión de Garmin
-- ========================================
SELECT 
  id,
  user_auth_id,
  garmin_user_id,
  LEFT(access_token, 20) || '...' as access_token_preview,
  token_expires_at,
  created_at,
  updated_at
FROM garmin_connections
ORDER BY created_at DESC;

-- ========================================
-- 2. Verificar actividades importadas de Garmin
-- ========================================
SELECT 
  id,
  user_id,
  title,
  distance,
  duration,
  calories,
  workout_type,
  garmin_activity_id,
  imported_from_garmin,
  activity_date,
  created_at
FROM published_activities_simple
WHERE imported_from_garmin = true
ORDER BY activity_date DESC
LIMIT 20;

-- ========================================
-- 3. Contar actividades totales vs importadas
-- ========================================
SELECT 
  COUNT(*) FILTER (WHERE imported_from_garmin = true) as actividades_garmin,
  COUNT(*) FILTER (WHERE imported_from_garmin = false OR imported_from_garmin IS NULL) as actividades_manuales,
  COUNT(*) as total_actividades
FROM published_activities_simple;

-- ========================================
-- 4. Verificar entrenamientos completados automáticamente
-- ========================================
SELECT 
  id,
  user_id,
  workout_date,
  workout_type,
  distance_km as planificado_km,
  actual_distance_km as real_km,
  duration_minutes as planificado_min,
  actual_duration_minutes as real_min,
  completed,
  completed_at
FROM simple_workouts
WHERE completed = true
  AND actual_distance_km IS NOT NULL
ORDER BY completed_at DESC
LIMIT 20;

-- ========================================
-- 5. Ver estadísticas de la semana actual
-- ========================================
SELECT 
  user_id,
  workout_type,
  SUM(distance) as total_distance,
  COUNT(*) as total_workouts,
  SUM(CASE WHEN imported_from_garmin = true THEN 1 ELSE 0 END) as from_garmin
FROM published_activities_simple
WHERE activity_date >= date_trunc('week', CURRENT_DATE)
GROUP BY user_id, workout_type
ORDER BY user_id, workout_type;

-- ========================================
-- 6. Ver tokens OAuth temporales (debugging)
-- ========================================
SELECT 
  oauth_token,
  LEFT(oauth_token_secret, 20) || '...' as token_secret_preview,
  user_id,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutes_old
FROM garmin_oauth_temp
ORDER BY created_at DESC;

