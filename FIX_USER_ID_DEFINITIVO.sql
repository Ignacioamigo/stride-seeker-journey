-- ============================================
-- FIX DEFINITIVO: Corregir user_id en actividades
-- Ejecutar en: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/sql/new
-- ============================================

DO $$
DECLARE
  v_user_auth_id UUID;
  v_user_email TEXT;
  v_profile_id UUID;
  v_updated_count INT;
BEGIN
  RAISE NOTICE '🔧 INICIANDO CORRECCIÓN DE USER_ID';
  RAISE NOTICE '';
  
  -- Obtener el usuario más reciente que se ha logueado
  SELECT id, email INTO v_user_auth_id, v_user_email
  FROM auth.users
  ORDER BY last_sign_in_at DESC
  LIMIT 1;
  
  IF v_user_auth_id IS NULL THEN
    RAISE NOTICE '❌ No se encontró ningún usuario';
    RETURN;
  END IF;
  
  RAISE NOTICE '👤 Usuario identificado:';
  RAISE NOTICE '   Email: %', v_user_email;
  RAISE NOTICE '   Auth ID: %', v_user_auth_id;
  RAISE NOTICE '';
  
  -- Obtener el profile.id si existe
  SELECT id INTO v_profile_id
  FROM user_profiles
  WHERE user_auth_id = v_user_auth_id;
  
  IF v_profile_id IS NOT NULL THEN
    RAISE NOTICE '📋 Profile ID encontrado: %', v_profile_id;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🔄 ACTUALIZANDO ACTIVIDADES...';
  RAISE NOTICE '';
  
  -- ACTUALIZACIÓN 1: Actividades con profile.id incorrecto
  IF v_profile_id IS NOT NULL THEN
    UPDATE published_activities_simple
    SET user_id = v_user_auth_id
    WHERE user_id = v_profile_id
      AND user_id != v_user_auth_id;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    IF v_updated_count > 0 THEN
      RAISE NOTICE '✅ Actualizadas % actividades con profile.id → auth.id', v_updated_count;
    END IF;
  END IF;
  
  -- ACTUALIZACIÓN 2: Actividades por email
  UPDATE published_activities_simple
  SET user_id = v_user_auth_id
  WHERE user_email = v_user_email
    AND (user_id IS NULL OR user_id != v_user_auth_id);
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  IF v_updated_count > 0 THEN
    RAISE NOTICE '✅ Actualizadas % actividades por email', v_updated_count;
  END IF;
  
  -- ACTUALIZACIÓN 3: Actividades importadas de Strava sin user_id correcto
  UPDATE published_activities_simple
  SET user_id = v_user_auth_id
  WHERE imported_from_strava = TRUE
    AND user_email = v_user_email
    AND (user_id IS NULL OR user_id != v_user_auth_id);
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  IF v_updated_count > 0 THEN
    RAISE NOTICE '✅ Actualizadas % actividades de Strava', v_updated_count;
  END IF;
  
  -- ACTUALIZACIÓN 4: Actualizar workouts_simple con user_id
  UPDATE workouts_simple
  SET user_id = v_user_auth_id
  WHERE user_email = v_user_email
    AND (user_id IS NULL OR user_id != v_user_auth_id);
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  IF v_updated_count > 0 THEN
    RAISE NOTICE '✅ Actualizados % workouts', v_updated_count;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 VERIFICACIÓN FINAL:';
  
END $$;

-- VERIFICACIÓN: Mostrar actividades actualizadas
SELECT 
  'published_activities_simple' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN user_id = (SELECT id FROM auth.users ORDER BY last_sign_in_at DESC LIMIT 1) THEN 1 END) as con_user_id_correcto,
  COUNT(CASE WHEN imported_from_strava = TRUE THEN 1 END) as de_strava
FROM published_activities_simple
WHERE user_email = (SELECT email FROM auth.users ORDER BY last_sign_in_at DESC LIMIT 1)

UNION ALL

SELECT 
  'workouts_simple' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN user_id = (SELECT id FROM auth.users ORDER BY last_sign_in_at DESC LIMIT 1) THEN 1 END) as con_user_id_correcto,
  0 as de_strava
FROM workouts_simple
WHERE user_email = (SELECT email FROM auth.users ORDER BY last_sign_in_at DESC LIMIT 1);

-- MOSTRAR ÚLTIMAS ACTIVIDADES
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📋 ÚLTIMAS 5 ACTIVIDADES:';
END $$;

SELECT 
  title,
  distance || ' km' as distance,
  duration,
  CASE 
    WHEN user_id = (SELECT id FROM auth.users ORDER BY last_sign_in_at DESC LIMIT 1) THEN '✅'
    ELSE '❌'
  END as user_id_ok,
  imported_from_strava as de_strava,
  to_char(created_at, 'DD/MM HH24:MI') as fecha
FROM published_activities_simple
WHERE user_email = (SELECT email FROM auth.users ORDER BY last_sign_in_at DESC LIMIT 1)
ORDER BY created_at DESC
LIMIT 5;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ CORRECCIÓN COMPLETADA';
  RAISE NOTICE '';
  RAISE NOTICE '📱 PRÓXIMO PASO:';
  RAISE NOTICE '   1. Abre la app en Xcode';
  RAISE NOTICE '   2. Compila y ejecuta';
  RAISE NOTICE '   3. Espera 30 segundos (auto-refresh)';
  RAISE NOTICE '   4. Las actividades deberían aparecer ahora';
  RAISE NOTICE '';
END $$;

