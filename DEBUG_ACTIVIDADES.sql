-- ============================================
-- DEBUG: Ver TODAS las actividades sin filtros
-- ============================================

-- 1. Ver TODAS las actividades (sin importar imported_from_strava)
SELECT 
  '1. TODAS LAS ACTIVIDADES (sin filtro)' as seccion,
  COUNT(*) as total
FROM published_activities_simple;

-- 2. Ver las primeras 5 actividades con TODOS los campos
SELECT 
  id,
  user_id,
  user_email,
  user_name,
  title,
  distance,
  duration,
  workout_type,
  imported_from_strava,
  strava_activity_id,
  to_char(activity_date, 'DD/MM/YYYY HH24:MI') as activity_date,
  to_char(created_at, 'DD/MM/YYYY HH24:MI') as created_at
FROM published_activities_simple
ORDER BY created_at DESC
LIMIT 5;

-- 3. Ver cuántas tienen imported_from_strava en TRUE vs FALSE vs NULL
SELECT 
  CASE 
    WHEN imported_from_strava = TRUE THEN '✅ TRUE'
    WHEN imported_from_strava = FALSE THEN '❌ FALSE'
    WHEN imported_from_strava IS NULL THEN '⚠️ NULL'
  END as imported_from_strava,
  COUNT(*) as cantidad
FROM published_activities_simple
GROUP BY imported_from_strava;

-- 4. Ver tu user_id
SELECT 
  id as tu_user_id,
  email
FROM auth.users
ORDER BY last_sign_in_at DESC
LIMIT 1;

-- 5. Ver qué user_id tienen las actividades
SELECT 
  user_id,
  user_email,
  COUNT(*) as cantidad_actividades
FROM published_activities_simple
GROUP BY user_id, user_email
ORDER BY cantidad_actividades DESC;

-- 6. Ver workouts_simple
SELECT 
  id,
  user_id,
  user_email,
  workout_title,
  distance,
  duration_minutes,
  to_char(completed_date, 'DD/MM/YYYY') as fecha,
  notes
FROM workouts_simple
ORDER BY created_at DESC
LIMIT 5;

