-- ============================================
-- FIX FINAL: Corregir user_id en actividades de Strava
-- Este script corrige el user_id para que coincida con auth.users.id
-- ============================================

-- PASO 1: Verificar el problema
-- ============================================
SELECT '🔍 PASO 1: DIAGNÓSTICO' as titulo;

-- Ver qué user_id tienen las actividades de Strava
SELECT 
  'Actividades de Strava' as tipo,
  user_id,
  COUNT(*) as cantidad
FROM published_activities_simple 
WHERE imported_from_strava = TRUE
GROUP BY user_id;

-- Ver tu user_id real (auth.users)
SELECT 
  'Tu usuario real' as tipo,
  id as user_id,
  email,
  1 as cantidad
FROM auth.users 
ORDER BY last_sign_in_at DESC 
LIMIT 1;

-- PASO 2: Verificar si coinciden
-- ============================================
SELECT '🎯 PASO 2: ¿COINCIDEN LOS IDs?' as titulo;

WITH 
  tu_user_id AS (
    SELECT id FROM auth.users 
    ORDER BY last_sign_in_at DESC 
    LIMIT 1
  ),
  actividades_user_ids AS (
    SELECT DISTINCT user_id 
    FROM published_activities_simple 
    WHERE imported_from_strava = TRUE
  )
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM actividades_user_ids 
      WHERE user_id = (SELECT id FROM tu_user_id)
    ) THEN '✅ SÍ COINCIDEN - No hay problema'
    ELSE '❌ NO COINCIDEN - Hay que corregir'
  END as resultado;

-- PASO 3: Corregir el user_id
-- ============================================
SELECT '🔧 PASO 3: CORRIGIENDO...' as titulo;

-- Corregir published_activities_simple
UPDATE published_activities_simple
SET user_id = (
  SELECT id FROM auth.users 
  ORDER BY last_sign_in_at DESC 
  LIMIT 1
)
WHERE imported_from_strava = TRUE
  AND user_id != (
    SELECT id FROM auth.users 
    ORDER BY last_sign_in_at DESC 
    LIMIT 1
  );

-- Corregir workouts_simple también
UPDATE workouts_simple
SET user_id = (
  SELECT id FROM auth.users 
  ORDER BY last_sign_in_at DESC 
  LIMIT 1
)
WHERE notes LIKE '%Strava%'
  AND (
    user_id IS NULL 
    OR user_id != (
      SELECT id FROM auth.users 
      ORDER BY last_sign_in_at DESC 
      LIMIT 1
    )
  );

-- PASO 4: Verificar que se corrigió
-- ============================================
SELECT '✅ PASO 4: VERIFICACIÓN FINAL' as titulo;

WITH tu_user_id AS (
  SELECT id FROM auth.users 
  ORDER BY last_sign_in_at DESC 
  LIMIT 1
)
SELECT 
  title,
  distance || ' km' as distancia,
  duration as duracion,
  CASE 
    WHEN user_id = (SELECT id FROM tu_user_id) THEN '✅ ID CORRECTO'
    ELSE '❌ ID INCORRECTO'
  END as estado,
  user_id,
  to_char(created_at, 'DD/MM HH24:MI') as fecha
FROM published_activities_simple
WHERE imported_from_strava = TRUE
ORDER BY created_at DESC;

-- RESUMEN
SELECT 
  '📊 RESUMEN' as titulo,
  COUNT(*) as total_actividades,
  COUNT(CASE WHEN user_id = (SELECT id FROM auth.users ORDER BY last_sign_in_at DESC LIMIT 1) THEN 1 END) as con_user_id_correcto,
  COUNT(CASE WHEN user_id != (SELECT id FROM auth.users ORDER BY last_sign_in_at DESC LIMIT 1) THEN 1 END) as con_user_id_incorrecto
FROM published_activities_simple
WHERE imported_from_strava = TRUE;


