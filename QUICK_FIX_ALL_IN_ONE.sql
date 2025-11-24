-- ============================================
-- QUICK FIX: Actividades de Strava No Aparecen
-- ============================================
-- Ejecutar este script completo en Supabase SQL Editor
-- https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/sql/new
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '🚀 INICIANDO FIX DE RLS PARA ACTIVIDADES DE STRAVA';
  RAISE NOTICE '';
END $$;

-- ============================================
-- PARTE 1: Fix published_activities_simple
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '1️⃣ Arreglando published_activities_simple...';
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own activities" ON published_activities_simple;
DROP POLICY IF EXISTS "Users can insert own activities" ON published_activities_simple;
DROP POLICY IF EXISTS "Users can update own activities" ON published_activities_simple;
DROP POLICY IF EXISTS "Users can delete own activities" ON published_activities_simple;

-- Enable RLS
ALTER TABLE published_activities_simple ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can view own activities"
  ON published_activities_simple FOR SELECT
  USING (
    auth.uid() = user_id 
    OR user_id IS NULL
  );

CREATE POLICY "Users can insert own activities"
  ON published_activities_simple FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR user_id IS NULL
  );

CREATE POLICY "Users can update own activities"
  ON published_activities_simple FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON published_activities_simple FOR DELETE
  USING (auth.uid() = user_id);

-- Add columns if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'published_activities_simple' 
    AND column_name = 'imported_from_strava'
  ) THEN
    ALTER TABLE published_activities_simple 
    ADD COLUMN imported_from_strava BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_published_activities_simple_user_id 
  ON published_activities_simple(user_id);

CREATE INDEX IF NOT EXISTS idx_published_activities_simple_imported_strava 
  ON published_activities_simple(imported_from_strava) 
  WHERE imported_from_strava = TRUE;

DO $$
BEGIN
  RAISE NOTICE '✅ published_activities_simple arreglado';
  RAISE NOTICE '';
END $$;

-- ============================================
-- PARTE 2: Fix workouts_simple
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '2️⃣ Arreglando workouts_simple...';
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own workouts" ON workouts_simple;
DROP POLICY IF EXISTS "Users can insert own workouts" ON workouts_simple;
DROP POLICY IF EXISTS "Users can update own workouts" ON workouts_simple;
DROP POLICY IF EXISTS "Users can delete own workouts" ON workouts_simple;

-- Enable RLS
ALTER TABLE workouts_simple ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can view own workouts"
  ON workouts_simple FOR SELECT
  USING (
    user_email = auth.email()
    OR user_email IS NULL
    OR user_email = 'anonimo@app.com'
  );

CREATE POLICY "Users can insert own workouts"
  ON workouts_simple FOR INSERT
  WITH CHECK (
    user_email = auth.email()
    OR user_email IS NULL
    OR user_email = 'anonimo@app.com'
  );

CREATE POLICY "Users can update own workouts"
  ON workouts_simple FOR UPDATE
  USING (user_email = auth.email());

CREATE POLICY "Users can delete own workouts"
  ON workouts_simple FOR DELETE
  USING (user_email = auth.email());

-- Add user_id column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workouts_simple' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE workouts_simple 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    CREATE INDEX IF NOT EXISTS idx_workouts_simple_user_id 
      ON workouts_simple(user_id);
  END IF;
END $$;

-- Create index for email
CREATE INDEX IF NOT EXISTS idx_workouts_simple_user_email 
  ON workouts_simple(user_email);

DO $$
BEGIN
  RAISE NOTICE '✅ workouts_simple arreglado';
  RAISE NOTICE '';
END $$;

-- ============================================
-- PARTE 3: Verificación
-- ============================================

DO $$
DECLARE
  activities_count INT;
  workouts_count INT;
  strava_activities_count INT;
BEGIN
  RAISE NOTICE '3️⃣ Verificando resultados...';
  RAISE NOTICE '';
  
  -- Count activities
  SELECT COUNT(*) INTO activities_count 
  FROM published_activities_simple;
  
  SELECT COUNT(*) INTO strava_activities_count 
  FROM published_activities_simple 
  WHERE imported_from_strava = TRUE;
  
  SELECT COUNT(*) INTO workouts_count 
  FROM workouts_simple;
  
  RAISE NOTICE '📊 RESUMEN:';
  RAISE NOTICE '   - Actividades totales: %', activities_count;
  RAISE NOTICE '   - Actividades de Strava: %', strava_activities_count;
  RAISE NOTICE '   - Workouts totales: %', workouts_count;
  RAISE NOTICE '';
  
  IF strava_activities_count > 0 THEN
    RAISE NOTICE '✅ HAY ACTIVIDADES DE STRAVA EN LA BASE DE DATOS';
    RAISE NOTICE '✅ Ahora deberían aparecer en la app';
  ELSE
    RAISE NOTICE '⚠️  NO HAY ACTIVIDADES DE STRAVA EN LA BASE DE DATOS';
    RAISE NOTICE '⚠️  Verifica que:';
    RAISE NOTICE '    1. El webhook se haya disparado';
    RAISE NOTICE '    2. La actividad sea tipo "Run"';
    RAISE NOTICE '    3. Los logs del webhook no tengan errores';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 FIX COMPLETADO';
  RAISE NOTICE '';
  RAISE NOTICE '📱 PRÓXIMO PASO:';
  RAISE NOTICE '   1. Abre la app (o espera 30 segundos si ya está abierta)';
  RAISE NOTICE '   2. Ve al tab "Actividades"';
  RAISE NOTICE '   3. Deberías ver tus carreras de Strava';
  RAISE NOTICE '';
END $$;

-- ============================================
-- BONUS: Mostrar últimas actividades de Strava
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '📋 ÚLTIMAS ACTIVIDADES DE STRAVA:';
  RAISE NOTICE '';
END $$;

SELECT 
  title,
  distance || ' km' as distance,
  duration,
  to_char(activity_date, 'YYYY-MM-DD HH24:MI') as fecha,
  user_name
FROM published_activities_simple
WHERE imported_from_strava = TRUE
ORDER BY created_at DESC
LIMIT 5;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Si ves actividades arriba, todo está funcionando correctamente';
  RAISE NOTICE '';
END $$;


