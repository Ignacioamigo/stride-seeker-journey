-- =====================================================
-- MIGRACIÓN: Vincular actividades GPS con sesiones de entrenamiento
-- Fecha: 2025-10-19
-- Permite iniciar entrenamientos desde el plan y marcarlos automáticamente como completados
-- =====================================================

-- PASO 1: Crear tabla training_plans si no existe
CREATE TABLE IF NOT EXISTS training_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  duration_weeks INTEGER DEFAULT 1,
  difficulty_level TEXT DEFAULT 'intermedio',
  target_distance REAL,
  target_pace TEXT,
  workouts JSONB NOT NULL DEFAULT '[]'::jsonb,
  start_date DATE NOT NULL,
  duration TEXT,
  intensity TEXT,
  week_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASO 2: Crear tabla training_sessions si no existe
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES training_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  day_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  planned_distance NUMERIC,
  planned_duration TEXT,
  target_pace TEXT,
  completed BOOLEAN DEFAULT false,
  completion_date TIMESTAMPTZ,
  actual_distance NUMERIC,
  actual_duration TEXT,
  notes TEXT
);

-- PASO 3: Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_training_plans_user_id ON training_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_plan_id ON training_sessions(plan_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_day_date ON training_sessions(day_date);

-- PASO 4: Habilitar RLS en las tablas
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- PASO 5: Crear políticas RLS para training_plans
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'training_plans' AND policyname = 'Users can view their own plans') THEN
    CREATE POLICY "Users can view their own plans" ON training_plans
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'training_plans' AND policyname = 'Users can insert their own plans') THEN
    CREATE POLICY "Users can insert their own plans" ON training_plans
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- PASO 6: Crear políticas RLS para training_sessions
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'training_sessions' AND policyname = 'Users can view sessions from their plans') THEN
    CREATE POLICY "Users can view sessions from their plans" ON training_sessions
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM training_plans 
          WHERE training_plans.id = training_sessions.plan_id 
          AND training_plans.user_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'training_sessions' AND policyname = 'Users can update their sessions') THEN
    CREATE POLICY "Users can update their sessions" ON training_sessions
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM training_plans 
          WHERE training_plans.id = training_sessions.plan_id 
          AND training_plans.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- PASO 7: AHORA SÍ, agregar training_session_id a published_activities_simple
ALTER TABLE published_activities_simple 
ADD COLUMN IF NOT EXISTS training_session_id UUID DEFAULT NULL;

COMMENT ON COLUMN published_activities_simple.training_session_id IS 
'ID de la sesión de entrenamiento del plan. Vincula actividades GPS con entrenamientos planificados para completarlos automáticamente.';

-- PASO 8: Crear índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_published_activities_training_session 
ON published_activities_simple(training_session_id);

-- PASO 9: Agregar Foreign Key con ON DELETE SET NULL (si se borra la sesión, la actividad se mantiene)
ALTER TABLE published_activities_simple
DROP CONSTRAINT IF EXISTS fk_published_activities_training_session;

ALTER TABLE published_activities_simple
ADD CONSTRAINT fk_published_activities_training_session
FOREIGN KEY (training_session_id) 
REFERENCES training_sessions(id) 
ON DELETE SET NULL;

-- 4. Agregar también a workouts_simple (como TEXT porque no tiene user_id real)
ALTER TABLE workouts_simple 
ADD COLUMN IF NOT EXISTS training_session_id TEXT DEFAULT NULL;

COMMENT ON COLUMN workouts_simple.training_session_id IS 
'ID de la sesión de entrenamiento (como texto). No puede ser FK real porque workouts_simple usa user_email.';

CREATE INDEX IF NOT EXISTS idx_workouts_simple_training_session 
ON workouts_simple(training_session_id);

-- 5. Crear función para auto-completar training_session después de actividad
CREATE OR REPLACE FUNCTION auto_complete_training_session()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la actividad tiene training_session_id, marcar esa sesión como completada
  IF NEW.training_session_id IS NOT NULL THEN
    UPDATE training_sessions
    SET 
      completed = true,
      completion_date = NOW(),
      actual_distance = NEW.distance,
      actual_duration = NEW.duration
    WHERE id = NEW.training_session_id
    AND completed = false; -- Solo si no estaba completada
    
    RAISE NOTICE 'Training session % marked as completed', NEW.training_session_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para ejecutar la función automáticamente
DROP TRIGGER IF EXISTS trigger_auto_complete_training_session ON published_activities_simple;

CREATE TRIGGER trigger_auto_complete_training_session
AFTER INSERT ON published_activities_simple
FOR EACH ROW
EXECUTE FUNCTION auto_complete_training_session();

-- 7. Verificación - Mostrar ejemplo de cómo usar
COMMENT ON FUNCTION auto_complete_training_session() IS 
'Función trigger que automáticamente marca una training_session como completada cuando se inserta una actividad vinculada.';

-- Ejemplo de uso:
-- INSERT INTO published_activities_simple (
--   user_id, user_name, title, distance, duration, 
--   training_session_id  -- ← Esto dispara el auto-completado
-- ) VALUES (
--   'user-uuid', 'Nacho', 'Carrera matutina', 5.5, '00:30:00',
--   'session-uuid'  -- ← La sesión se marcará como completada automáticamente
-- );

