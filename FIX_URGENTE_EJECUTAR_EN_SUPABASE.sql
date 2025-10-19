-- =====================================================
-- 🚨 EJECUTAR ESTO EN SUPABASE SQL EDITOR
-- =====================================================
-- Este script arregla los problemas de training_plans y training_sessions

-- 1. Agregar columnas faltantes a training_plans
ALTER TABLE training_plans 
ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE;

ALTER TABLE training_plans 
ADD COLUMN IF NOT EXISTS duration TEXT;

ALTER TABLE training_plans 
ADD COLUMN IF NOT EXISTS intensity TEXT;

ALTER TABLE training_plans 
ADD COLUMN IF NOT EXISTS week_number INTEGER DEFAULT 1;

-- 2. Verificar que training_sessions existe
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

-- 3. Agregar training_session_id a published_activities_simple
ALTER TABLE published_activities_simple
ADD COLUMN IF NOT EXISTS training_session_id UUID REFERENCES training_sessions(id) ON DELETE SET NULL;

-- 4. Crear o reemplazar función auto-completar
CREATE OR REPLACE FUNCTION auto_complete_training_session()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.training_session_id IS NOT NULL THEN
    UPDATE training_sessions
    SET 
      completed = true,
      completion_date = NOW(),
      actual_distance = NEW.distance,
      actual_duration = NEW.duration
    WHERE id = NEW.training_session_id
    AND completed = false;
    
    RAISE NOTICE 'Training session % marked as completed', NEW.training_session_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Eliminar trigger anterior si existe y crear nuevo
DROP TRIGGER IF EXISTS trigger_auto_complete_training_session ON published_activities_simple;

CREATE TRIGGER trigger_auto_complete_training_session
AFTER INSERT ON published_activities_simple
FOR EACH ROW
EXECUTE FUNCTION auto_complete_training_session();

-- 6. Crear índices
CREATE INDEX IF NOT EXISTS idx_training_plans_user_id ON training_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_plan_id ON training_sessions(plan_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_day_date ON training_sessions(day_date);
CREATE INDEX IF NOT EXISTS idx_published_activities_training_session ON published_activities_simple(training_session_id);

-- 7. Verificar estructura final
SELECT 
  'training_plans' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'training_plans'
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
  'training_sessions' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'training_sessions'
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
  'published_activities_simple' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'published_activities_simple'
AND column_name = 'training_session_id';

-- ✅ Si todo está bien, deberías ver las columnas listadas arriba

