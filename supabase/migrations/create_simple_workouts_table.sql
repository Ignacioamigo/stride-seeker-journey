-- 🏃‍♂️ TABLA SIMPLE DE ENTRENAMIENTOS
-- Esta tabla reemplaza todas las tablas complicadas existentes
-- Diseñada para ser simple, funcional y sin campos null innecesarios

-- Eliminar tabla existente si existe
DROP TABLE IF EXISTS simple_workouts;

-- Crear nueva tabla simple y limpia
CREATE TABLE simple_workouts (
    -- ID único del entrenamiento
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- ID del usuario (usando auth.users.id)
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Información básica del entrenamiento
    workout_title TEXT NOT NULL,
    workout_type TEXT NOT NULL DEFAULT 'carrera',
    
    -- Datos de rendimiento (sin null, valores por defecto)
    distance_km DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    
    -- Fecha del entrenamiento (solo fecha, sin complicaciones de timezone)
    workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Información del plan (opcional, puede ser null)
    plan_id TEXT,
    week_number INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para optimizar consultas
CREATE INDEX idx_simple_workouts_user_id ON simple_workouts(user_id);
CREATE INDEX idx_simple_workouts_date ON simple_workouts(workout_date);
CREATE INDEX idx_simple_workouts_user_date ON simple_workouts(user_id, workout_date);

-- RLS (Row Level Security) para que cada usuario solo vea sus datos
ALTER TABLE simple_workouts ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios solo vean sus propios entrenamientos
CREATE POLICY "Users can view own workouts" ON simple_workouts
    FOR SELECT USING (auth.uid() = user_id);

-- Política para que usuarios solo puedan insertar sus propios entrenamientos
CREATE POLICY "Users can insert own workouts" ON simple_workouts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que usuarios solo puedan actualizar sus propios entrenamientos
CREATE POLICY "Users can update own workouts" ON simple_workouts
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para que usuarios solo puedan eliminar sus propios entrenamientos
CREATE POLICY "Users can delete own workouts" ON simple_workouts
    FOR DELETE USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_simple_workouts_updated_at 
    BEFORE UPDATE ON simple_workouts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentar la tabla
COMMENT ON TABLE simple_workouts IS 'Tabla simple para almacenar entrenamientos de usuarios';
COMMENT ON COLUMN simple_workouts.user_id IS 'ID del usuario que realizó el entrenamiento';
COMMENT ON COLUMN simple_workouts.workout_title IS 'Título/nombre del entrenamiento';
COMMENT ON COLUMN simple_workouts.workout_type IS 'Tipo de entrenamiento (carrera, intervalo, etc.)';
COMMENT ON COLUMN simple_workouts.distance_km IS 'Distancia recorrida en kilómetros';
COMMENT ON COLUMN simple_workouts.duration_minutes IS 'Duración del entrenamiento en minutos';
COMMENT ON COLUMN simple_workouts.workout_date IS 'Fecha cuando se realizó el entrenamiento';
COMMENT ON COLUMN simple_workouts.plan_id IS 'ID del plan de entrenamiento (opcional)';
COMMENT ON COLUMN simple_workouts.week_number IS 'Número de semana del plan (opcional)';
