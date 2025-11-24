-- Ver TODAS las actividades en published_activities_simple
SELECT 
  id,
  user_id,
  user_email,
  title,
  distance,
  imported_from_strava,
  strava_activity_id,
  created_at
FROM published_activities_simple
ORDER BY created_at DESC
LIMIT 10;

-- Ver tu user_id real
SELECT 
  id as tu_user_id,
  email
FROM auth.users
ORDER BY last_sign_in_at DESC
LIMIT 1;

-- Comparar IDs
SELECT 
  'Tu user_id' as tipo,
  id as user_id,
  email
FROM auth.users
ORDER BY last_sign_in_at DESC
LIMIT 1

UNION ALL

SELECT 
  'user_id en actividades' as tipo,
  DISTINCT user_id,
  user_email
FROM published_activities_simple
WHERE user_id IS NOT NULL;


