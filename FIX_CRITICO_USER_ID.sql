-- ============================================
-- FIX CRÍTICO: Corregir user_id en TODAS las actividades
-- ============================================

-- PASO 1: Identificar usuarios y sus actividades
-- ============================================

-- Ver todos los usuarios registrados
SELECT 
  '👥 USUARIOS REGISTRADOS' as seccion,
  id as user_id,
  email,
  to_char(created_at, 'DD/MM/YYYY') as registrado,
  to_char(last_sign_in_at, 'DD/MM/YYYY HH24:MI') as ultimo_login
FROM auth.users
ORDER BY last_sign_in_at DESC;

-- Ver user_profiles asociados
SELECT 
  '📋 USER PROFILES' as seccion,
  up.id as profile_id,
  up.user_auth_id,
  up.name,
  up.email,
  au.email as auth_email
FROM user_profiles up
LEFT JOIN auth.users au ON au.id = up.user_auth_id
ORDER BY up.created_at DESC;

-- PASO 2: Ver estado actual de actividades
-- ============================================

-- Actividades en published_activities_simple
SELECT 
  '📊 PUBLISHED ACTIVITIES' as seccion,
  user_id,
  user_email,
  COUNT(*) as cantidad,
  MIN(created_at) as primera,
  MAX(created_at) as ultima
FROM published_activities_simple
GROUP BY user_id, user_email
ORDER BY ultima DESC;

-- Workouts en workouts_simple
SELECT 
  '💪 WORKOUTS' as seccion,
  user_id,
  user_email,
  COUNT(*) as cantidad,
  MIN(created_at) as primera,
  MAX(created_at) as ultima
FROM workouts_simple
GROUP BY user_id, user_email
ORDER BY ultima DESC;

-- PASO 3: FIX - Asociar actividades por EMAIL
-- ============================================
-- Este enfoque usa el email para asociar actividades a usuarios

DO $$
DECLARE
  v_user RECORD;
  v_updated_activities INT;
  v_updated_workouts INT;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔧 INICIANDO CORRECCIÓN DE USER_ID POR EMAIL';
  RAISE NOTICE '================================================';
  
  -- Para cada usuario registrado
  FOR v_user IN 
    SELECT id, email FROM auth.users WHERE email IS NOT NULL
  LOOP
    RAISE NOTICE '';
    RAISE NOTICE '👤 Procesando usuario: % (%)', v_user.email, v_user.id;
    
    -- Actualizar published_activities_simple
    UPDATE published_activities_simple
    SET user_id = v_user.id
    WHERE (user_email = v_user.email OR user_email = 'anonimo@app.com')
      AND (user_id IS NULL OR user_id != v_user.id);
    
    GET DIAGNOSTICS v_updated_activities = ROW_COUNT;
    
    IF v_updated_activities > 0 THEN
      RAISE NOTICE '  ✅ Actividades actualizadas: %', v_updated_activities;
    END IF;
    
    -- Actualizar workouts_simple
    UPDATE workouts_simple
    SET user_id = v_user.id
    WHERE (user_email = v_user.email OR user_email = 'anonimo@app.com')
      AND (user_id IS NULL OR user_id != v_user.id);
    
    GET DIAGNOSTICS v_updated_workouts = ROW_COUNT;
    
    IF v_updated_workouts > 0 THEN
      RAISE NOTICE '  ✅ Workouts actualizados: %', v_updated_workouts;
    END IF;
    
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ CORRECCIÓN COMPLETADA';
  RAISE NOTICE '';
  
END $$;

-- PASO 4: Verificación final
-- ============================================
SELECT 
  '✅ VERIFICACIÓN FINAL - PUBLISHED ACTIVITIES' as seccion,
  user_id,
  user_email,
  COUNT(*) as cantidad
FROM published_activities_simple
GROUP BY user_id, user_email
ORDER BY cantidad DESC;

SELECT 
  '✅ VERIFICACIÓN FINAL - WORKOUTS' as seccion,
  user_id,
  user_email,
  COUNT(*) as cantidad
FROM workouts_simple
GROUP BY user_id, user_email
ORDER BY cantidad DESC;

-- Ver actividades sin user_id (PROBLEMA)
SELECT 
  '⚠️ ACTIVIDADES SIN USER_ID' as alerta,
  COUNT(*) as cantidad
FROM published_activities_simple
WHERE user_id IS NULL;

SELECT 
  '⚠️ WORKOUTS SIN USER_ID' as alerta,
  COUNT(*) as cantidad
FROM workouts_simple
WHERE user_id IS NULL;


