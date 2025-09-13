-- Arreglar el esquema de entrenamientos_completados para que coincida con lo que espera la app
-- Los logs muestran que la app está enviando datos con nombres diferentes a los que espera la tabla

-- 1. Verificar estructura actual
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'entrenamientos_completados'
ORDER BY ordinal_position;

-- 2. Crear tabla entrenamientos_completados si no existe con el esquema correcto
CREATE TABLE IF NOT EXISTS entrenamientos_completados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_title TEXT,
  workout_type TEXT DEFAULT 'carrera',
  distancia_recorrida REAL,
  duracion INTEGER, -- Minutos como entero
  fecha_completado DATE DEFAULT CURRENT_DATE,
  plan_id UUID REFERENCES training_plans(id) ON DELETE SET NULL,
  week_number INTEGER,
  workout_id UUID DEFAULT gen_random_uuid(),
  satisfaccion INTEGER DEFAULT 4,
  dificultad INTEGER DEFAULT 3,
  condiciones_climaticas TEXT DEFAULT 'Soleado',
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Si ya existe la tabla, agregar las columnas que faltan
DO $$ 
BEGIN
  -- Agregar columnas si no existen
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entrenamientos_completados' AND column_name = 'workout_title') THEN
    ALTER TABLE entrenamientos_completados ADD COLUMN workout_title TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entrenamientos_completados' AND column_name = 'workout_type') THEN
    ALTER TABLE entrenamientos_completados ADD COLUMN workout_type TEXT DEFAULT 'carrera';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entrenamientos_completados' AND column_name = 'distancia_recorrida') THEN
    ALTER TABLE entrenamientos_completados ADD COLUMN distancia_recorrida REAL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entrenamientos_completados' AND column_name = 'duracion') THEN
    ALTER TABLE entrenamientos_completados ADD COLUMN duracion INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entrenamientos_completados' AND column_name = 'fecha_completado') THEN
    ALTER TABLE entrenamientos_completados ADD COLUMN fecha_completado DATE DEFAULT CURRENT_DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entrenamientos_completados' AND column_name = 'workout_id') THEN
    ALTER TABLE entrenamientos_completados ADD COLUMN workout_id UUID DEFAULT gen_random_uuid();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entrenamientos_completados' AND column_name = 'satisfaccion') THEN
    ALTER TABLE entrenamientos_completados ADD COLUMN satisfaccion INTEGER DEFAULT 4;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entrenamientos_completados' AND column_name = 'dificultad') THEN
    ALTER TABLE entrenamientos_completados ADD COLUMN dificultad INTEGER DEFAULT 3;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entrenamientos_completados' AND column_name = 'condiciones_climaticas') THEN
    ALTER TABLE entrenamientos_completados ADD COLUMN condiciones_climaticas TEXT DEFAULT 'Soleado';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entrenamientos_completados' AND column_name = 'notas') THEN
    ALTER TABLE entrenamientos_completados ADD COLUMN notas TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entrenamientos_completados' AND column_name = 'created_at') THEN
    ALTER TABLE entrenamientos_completados ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entrenamientos_completados' AND column_name = 'updated_at') THEN
    ALTER TABLE entrenamientos_completados ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- 4. Habilitar RLS
ALTER TABLE entrenamientos_completados ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas RLS correctas (usar auth.uid() = user_id)
DROP POLICY IF EXISTS "Users can view their own entrenamientos" ON entrenamientos_completados;
CREATE POLICY "Users can view their own entrenamientos"
  ON entrenamientos_completados FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own entrenamientos" ON entrenamientos_completados;
CREATE POLICY "Users can insert their own entrenamientos"
  ON entrenamientos_completados FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own entrenamientos" ON entrenamientos_completados;
CREATE POLICY "Users can update their own entrenamientos"
  ON entrenamientos_completados FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own entrenamientos" ON entrenamientos_completados;
CREATE POLICY "Users can delete their own entrenamientos"
  ON entrenamientos_completados FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Permitir inserts anónimos para usuarios no autenticados (con user_id NULL)
DROP POLICY IF EXISTS "Allow anonymous inserts" ON entrenamientos_completados;
CREATE POLICY "Allow anonymous inserts"
  ON entrenamientos_completados FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- 7. Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_entrenamientos_user_id ON entrenamientos_completados(user_id);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_fecha ON entrenamientos_completados(fecha_completado DESC);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_plan_id ON entrenamientos_completados(plan_id);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_week_number ON entrenamientos_completados(week_number);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_plan_week ON entrenamientos_completados(plan_id, week_number);

-- 8. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_entrenamientos_completados_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_entrenamientos_completados_updated_at ON entrenamientos_completados;
CREATE TRIGGER update_entrenamientos_completados_updated_at
  BEFORE UPDATE ON entrenamientos_completados
  FOR EACH ROW
  EXECUTE FUNCTION update_entrenamientos_completados_updated_at();

-- 10. Comentarios para documentar la tabla
COMMENT ON TABLE entrenamientos_completados IS 'Entrenamientos completados por usuarios';
COMMENT ON COLUMN entrenamientos_completados.user_id IS 'ID del usuario (auth.users.id) - NULL para anónimos';
COMMENT ON COLUMN entrenamientos_completados.plan_id IS 'ID del plan de entrenamiento asociado (opcional)';
COMMENT ON COLUMN entrenamientos_completados.week_number IS 'Número de semana dentro del plan de entrenamiento (opcional)';
