-- Crear tabla training_plans que falta para las foreign keys
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para training_plans
CREATE POLICY "Users can view their own training plans"
  ON training_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training plans"
  ON training_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training plans"
  ON training_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training plans"
  ON training_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_training_plans_user_id ON training_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_training_plans_created_at ON training_plans(created_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_training_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_training_plans_updated_at
  BEFORE UPDATE ON training_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_training_plans_updated_at();

-- Comentarios para documentar la tabla
COMMENT ON TABLE training_plans IS 'Planes de entrenamiento generados para usuarios';
COMMENT ON COLUMN training_plans.user_id IS 'ID del usuario propietario del plan';
COMMENT ON COLUMN training_plans.name IS 'Nombre del plan de entrenamiento';
COMMENT ON COLUMN training_plans.goal IS 'Objetivo del plan (ej: 5K en menos de 30min)';
COMMENT ON COLUMN training_plans.workouts IS 'Array JSON con los entrenamientos del plan';
