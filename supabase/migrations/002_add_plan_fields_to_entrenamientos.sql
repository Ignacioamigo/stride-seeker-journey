-- Añadir plan_id y week_number a la tabla entrenamientos_completados
-- para permitir filtrado por semana de plan específica

-- Añadir columna plan_id (referencia opcional al plan)
ALTER TABLE entrenamientos_completados 
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES training_plans(id) ON DELETE SET NULL;

-- Añadir columna week_number (número de semana del plan)
ALTER TABLE entrenamientos_completados 
ADD COLUMN IF NOT EXISTS week_number INTEGER;

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_entrenamientos_plan_id ON entrenamientos_completados(plan_id);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_week_number ON entrenamientos_completados(week_number);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_plan_week ON entrenamientos_completados(plan_id, week_number);

-- Comentarios para documentar el propósito
COMMENT ON COLUMN entrenamientos_completados.plan_id IS 'ID del plan de entrenamiento asociado (opcional)';
COMMENT ON COLUMN entrenamientos_completados.week_number IS 'Número de semana dentro del plan de entrenamiento (opcional)';
