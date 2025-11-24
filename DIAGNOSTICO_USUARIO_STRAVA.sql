-- ============================================
-- DIAGNÓSTICO: ¿Por qué no aparecen las actividades?
-- Ejecutar en: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/sql/new
-- ============================================

-- PASO 1: Identificar tu usuario actual
-- ============================================
SELECT 
  id as user_auth_id,
  email,
  created_at
FROM auth.users
WHERE email = (
  SELECT email FROM auth.users 
  ORDER BY last_sign_in_at DESC 
  LIMIT 1
);

-- PASO 2: Ver TODAS las actividades de Strava (sin filtro)
-- ============================================
SELECT 
  id,
  user_id,
  user_email,
  user_name,
  title,
  distance,
  imported_from_strava,
  created_at
FROM published_activities_simple
WHERE imported_from_strava = TRUE
ORDER BY created_at DESC;

-- PASO 3: Ver qué user_profiles existe
-- ============================================
SELECT 
  id as profile_id,
  user_auth_id,
  name,
  email
FROM user_profiles
WHERE user_auth_id IN (
  SELECT id FROM auth.users 
  WHERE email = (
    SELECT email FROM auth.users 
    ORDER BY last_sign_in_at DESC 
    LIMIT 1
  )
);

-- PASO 4: Ver la conexión de Strava
-- ============================================
SELECT 
  user_auth_id,
  strava_user_id,
  athlete_name,
  athlete_email,
  updated_at
FROM strava_connections
ORDER BY updated_at DESC;

-- PASO 5: Comparar IDs
-- ============================================
WITH user_info AS (
  SELECT id FROM auth.users 
  WHERE email = (
    SELECT email FROM auth.users 
    ORDER BY last_sign_in_at DESC 
    LIMIT 1
  )
),
activity_users AS (
  SELECT DISTINCT user_id 
  FROM published_activities_simple
  WHERE imported_from_strava = TRUE
)
SELECT 
  (SELECT id FROM user_info) as tu_user_auth_id,
  user_id as user_id_en_actividades,
  CASE 
    WHEN user_id = (SELECT id FROM user_info) THEN '✅ COINCIDEN'
    ELSE '❌ NO COINCIDEN - ESTE ES EL PROBLEMA'
  END as estado
FROM activity_users;

