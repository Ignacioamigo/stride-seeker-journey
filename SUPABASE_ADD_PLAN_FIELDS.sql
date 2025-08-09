-- SCRIPT PARA AÑADIR CAMPOS DE PLAN A ENTRENAMIENTOS_COMPLETADOS
-- Ejecutar en Supabase Dashboard > SQL Editor

-- 1. Verificar estructura actual de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'entrenamientos_completados'
ORDER BY ordinal_position;

-- 2. Añadir columna plan_id (referencia opcional al plan)
ALTER TABLE entrenamientos_completados 
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES training_plans(id) ON DELETE SET NULL;

-- 3. Añadir columna week_number (número de semana del plan)
ALTER TABLE entrenamientos_completados 
ADD COLUMN IF NOT EXISTS week_number INTEGER;

-- 4. Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_entrenamientos_plan_id ON entrenamientos_completados(plan_id);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_week_number ON entrenamientos_completados(week_number);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_plan_week ON entrenamientos_completados(plan_id, week_number);

-- 5. Verificar que las columnas se añadieron correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'entrenamientos_completados'
AND column_name IN ('plan_id', 'week_number')
ORDER BY ordinal_position;

-- 6. Mostrar algunas filas de ejemplo para verificar
SELECT id, workout_title, fecha_completado, plan_id, week_number
FROM entrenamientos_completados
ORDER BY fecha_completado DESC
LIMIT 5;
