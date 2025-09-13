# 🚀 INSTRUCCIONES PARA ARREGLAR ENTRENAMIENTOS_COMPLETADOS

## 🎯 PROBLEMA:
Los entrenamientos NO se guardan en Supabase porque:
1. ❌ Falta la tabla `training_plans` 
2. ❌ La tabla `entrenamientos_completados` tiene esquema incorrecto

## 🔧 SOLUCIÓN:

### PASO 1: Ir a Supabase Dashboard
1. Abrir: https://supabase.com/dashboard
2. Seleccionar proyecto: **stride-seeker-journey**
3. Ir a: **SQL Editor**

### PASO 2: Ejecutar Migración 1 - Crear training_plans
```sql
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

-- Comentarios para documentar la tabla
COMMENT ON TABLE training_plans IS 'Planes de entrenamiento generados para usuarios';
COMMENT ON COLUMN training_plans.user_id IS 'ID del usuario propietario del plan';
COMMENT ON COLUMN training_plans.name IS 'Nombre del plan de entrenamiento';
COMMENT ON COLUMN training_plans.goal IS 'Objetivo del plan (ej: 5K en menos de 30min)';
COMMENT ON COLUMN training_plans.workouts IS 'Array JSON con los entrenamientos del plan';
```

### PASO 3: Ejecutar Migración 2 - Arreglar entrenamientos_completados
```sql
-- Arreglar el esquema de entrenamientos_completados para que coincida con lo que espera la app

-- Crear tabla entrenamientos_completados si no existe con el esquema correcto
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

-- Si ya existe la tabla, agregar las columnas que faltan
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

-- Habilitar RLS
ALTER TABLE entrenamientos_completados ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS correctas (usar auth.uid() = user_id)
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

-- Permitir inserts anónimos para usuarios no autenticados (con user_id NULL)
DROP POLICY IF EXISTS "Allow anonymous inserts" ON entrenamientos_completados;
CREATE POLICY "Allow anonymous inserts"
  ON entrenamientos_completados FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_entrenamientos_user_id ON entrenamientos_completados(user_id);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_fecha ON entrenamientos_completados(fecha_completado DESC);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_plan_id ON entrenamientos_completados(plan_id);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_week_number ON entrenamientos_completados(week_number);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_plan_week ON entrenamientos_completados(plan_id, week_number);

-- Comentarios para documentar la tabla
COMMENT ON TABLE entrenamientos_completados IS 'Entrenamientos completados por usuarios';
COMMENT ON COLUMN entrenamientos_completados.user_id IS 'ID del usuario (auth.users.id) - NULL para anónimos';
COMMENT ON COLUMN entrenamientos_completados.plan_id IS 'ID del plan de entrenamiento asociado (opcional)';
COMMENT ON COLUMN entrenamientos_completados.week_number IS 'Número de semana dentro del plan de entrenamiento (opcional)';
```

### PASO 4: Verificar que funcionó
```sql
-- Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('training_plans', 'entrenamientos_completados');

-- Verificar estructura de entrenamientos_completados
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'entrenamientos_completados'
ORDER BY ordinal_position;
```

## ✅ RESULTADO ESPERADO:
Después de ejecutar estas migraciones:
1. ✅ La tabla `training_plans` existirá
2. ✅ La tabla `entrenamientos_completados` tendrá las columnas correctas
3. ✅ Los entrenamientos SE GUARDARÁN en Supabase (no solo localStorage)
4. ✅ Verás nuevas filas en `entrenamientos_completados` cuando completes entrenamientos

## 🎯 PARA VERIFICAR:
1. Ejecuta las migraciones arriba
2. Abre la app en iOS
3. Completa un entrenamiento
4. Ve a Supabase Dashboard > Table Editor > entrenamientos_completados
5. ¡Deberías ver la nueva fila!
