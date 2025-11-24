-- ============================================
-- VERIFICACIÓN COMPLETA: ¿Dónde están las actividades?
-- Ejecutar en: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/sql/new
-- ============================================

-- 1. ¿HAY USUARIOS EN EL SISTEMA?
-- ============================================
SELECT '1. USUARIOS EN EL SISTEMA' as seccion;

SELECT 
  id,
  email,
  to_char(created_at, 'DD/MM/YYYY HH24:MI') as creado,
  to_char(last_sign_in_at, 'DD/MM/YYYY HH24:MI') as ultimo_login
FROM auth.users
ORDER BY last_sign_in_at DESC
LIMIT 3;

-- 2. ¿HAY CONEXIONES DE STRAVA?
-- ============================================
SELECT '2. CONEXIONES DE STRAVA' as seccion;

SELECT 
  user_auth_id,
  strava_user_id,
  athlete_name,
  athlete_email,
  to_char(updated_at, 'DD/MM/YYYY HH24:MI') as ultima_actualizacion
FROM strava_connections
ORDER BY updated_at DESC;

-- 3. ¿HAY ACTIVIDADES EN published_activities_simple?
-- ============================================
SELECT '3. ACTIVIDADES EN published_activities_simple' as seccion;

-- Todas las actividades (sin filtro)
SELECT COUNT(*) as total_actividades FROM published_activities_simple;
SELECT COUNT(*) as actividades_strava FROM published_activities_simple WHERE imported_from_strava = TRUE;
SELECT COUNT(*) as actividades_con_user_id FROM published_activities_simple WHERE user_id IS NOT NULL;

-- Últimas 10 actividades (cualquier usuario)
SELECT 
  id,
  user_id,
  user_email,
  user_name,
  title,
  distance,
  imported_from_strava as de_strava,
  to_char(created_at, 'DD/MM HH24:MI') as fecha
FROM published_activities_simple
ORDER BY created_at DESC
LIMIT 10;

-- 4. ¿HAY WORKOUTS EN workouts_simple?
-- ============================================
SELECT '4. WORKOUTS EN workouts_simple' as seccion;

SELECT COUNT(*) as total_workouts FROM workouts_simple;
SELECT COUNT(*) as workouts_con_user_id FROM workouts_simple WHERE user_id IS NOT NULL;

-- Últimos 10 workouts (cualquier usuario)
SELECT 
  id,
  user_email,
  workout_title,
  distance,
  duration_minutes,
  to_char(completed_date, 'DD/MM/YYYY') as fecha,
  to_char(created_at, 'DD/MM HH24:MI') as creado
FROM workouts_simple
ORDER BY created_at DESC
LIMIT 10;

-- 5. ¿HAY ACTIVIDADES EN published_activities (tabla antigua)?
-- ============================================
SELECT '5. ACTIVIDADES EN published_activities (tabla antigua)' as seccion;

SELECT COUNT(*) as total_actividades_legacy FROM published_activities;

-- 6. RESUMEN Y DIAGNÓSTICO
-- ============================================
SELECT '6. DIAGNÓSTICO FINAL' as seccion;

DO $$
DECLARE
  v_users_count INT;
  v_strava_connections INT;
  v_activities_count INT;
  v_workouts_count INT;
BEGIN
  SELECT COUNT(*) INTO v_users_count FROM auth.users;
  SELECT COUNT(*) INTO v_strava_connections FROM strava_connections;
  SELECT COUNT(*) INTO v_activities_count FROM published_activities_simple;
  SELECT COUNT(*) INTO v_workouts_count FROM workouts_simple;
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESUMEN COMPLETO:';
  RAISE NOTICE '==================';
  RAISE NOTICE 'Usuarios registrados: %', v_users_count;
  RAISE NOTICE 'Conexiones Strava: %', v_strava_connections;
  RAISE NOTICE 'Actividades en DB: %', v_activities_count;
  RAISE NOTICE 'Workouts en DB: %', v_workouts_count;
  RAISE NOTICE '';
  
  IF v_users_count = 0 THEN
    RAISE NOTICE '❌ NO HAY USUARIOS - Debes registrarte en la app primero';
  ELSIF v_strava_connections = 0 THEN
    RAISE NOTICE '❌ NO HAY CONEXIÓN DE STRAVA - Debes conectar Strava desde Settings';
  ELSIF v_activities_count = 0 THEN
    RAISE NOTICE '❌ NO HAY ACTIVIDADES - El webhook no ha recibido actividades o hay un error';
    RAISE NOTICE '';
    RAISE NOTICE '🔍 POSIBLES CAUSAS:';
    RAISE NOTICE '1. No has creado ninguna actividad en Strava después de conectar';
    RAISE NOTICE '2. El webhook no está configurado correctamente';
    RAISE NOTICE '3. La actividad no es de tipo "Run" (solo se importan carreras)';
    RAISE NOTICE '4. Hubo un error al procesar el webhook (revisar logs)';
  ELSE
    RAISE NOTICE '✅ HAY ACTIVIDADES EN LA BASE DE DATOS';
    RAISE NOTICE '';
    RAISE NOTICE '🔍 SI NO APARECEN EN LA APP:';
    RAISE NOTICE '1. Verifica que el user_id coincida con tu usuario';
    RAISE NOTICE '2. Limpia el caché de la app (localStorage)';
    RAISE NOTICE '3. Espera 30 segundos (auto-refresh)';
  END IF;
  
  RAISE NOTICE '';
END $$;


