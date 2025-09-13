-- MIGRACION: Recrear tabla entrenamientos_completados
-- PROPOSITO: Crear tabla desde cero con esquema correcto
-- FECHA: 2025-09-08

-- 1. ELIMINAR TABLA EXISTENTE SI EXISTE
DROP TABLE IF EXISTS public.entrenamientos_completados CASCADE;

-- 2. CREAR TABLA CON ESQUEMA CORRECTO
CREATE TABLE public.entrenamientos_completados (
    -- Campos primarios
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Relaciones
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.training_plans(id) ON DELETE SET NULL,
    
    -- Datos del entrenamiento
    workout_id UUID DEFAULT gen_random_uuid() NOT NULL,
    workout_title TEXT NOT NULL,
    workout_type TEXT NOT NULL DEFAULT 'carrera',
    
    -- Metricas del entrenamiento
    distancia_recorrida REAL CHECK (distancia_recorrida >= 0),
    duracion INTEGER CHECK (duracion >= 0),
    fecha_completado DATE DEFAULT CURRENT_DATE NOT NULL,
    
    -- Contexto del plan
    week_number INTEGER CHECK (week_number > 0),
    
    -- Datos adicionales
    satisfaccion INTEGER CHECK (satisfaccion >= 1 AND satisfaccion <= 5) DEFAULT 4,
    dificultad INTEGER CHECK (dificultad >= 1 AND dificultad <= 5) DEFAULT 3,
    condiciones_climaticas TEXT DEFAULT 'Soleado',
    notas TEXT,
    
    -- Constraints
    CONSTRAINT valid_workout_data CHECK (
        (workout_type = 'descanso') OR 
        (distancia_recorrida IS NOT NULL AND duracion IS NOT NULL)
    )
);

-- 3. COMENTARIOS PARA DOCUMENTACION
COMMENT ON TABLE public.entrenamientos_completados IS 'Registro de entrenamientos completados por usuarios';
COMMENT ON COLUMN public.entrenamientos_completados.user_id IS 'Usuario que completo el entrenamiento (NULL para anonimos)';
COMMENT ON COLUMN public.entrenamientos_completados.plan_id IS 'Plan de entrenamiento asociado (opcional)';
COMMENT ON COLUMN public.entrenamientos_completados.workout_id IS 'ID unico del entrenamiento especifico';
COMMENT ON COLUMN public.entrenamientos_completados.workout_title IS 'Titulo/nombre del entrenamiento';
COMMENT ON COLUMN public.entrenamientos_completados.workout_type IS 'Tipo: carrera, descanso, fuerza, etc.';
COMMENT ON COLUMN public.entrenamientos_completados.distancia_recorrida IS 'Distancia real completada en kilometros';
COMMENT ON COLUMN public.entrenamientos_completados.duracion IS 'Duracion real en minutos';
COMMENT ON COLUMN public.entrenamientos_completados.fecha_completado IS 'Fecha cuando se completo el entrenamiento';
COMMENT ON COLUMN public.entrenamientos_completados.week_number IS 'Semana del plan (1, 2, 3, etc.)';
COMMENT ON COLUMN public.entrenamientos_completados.satisfaccion IS 'Nivel de satisfaccion (1-5)';
COMMENT ON COLUMN public.entrenamientos_completados.dificultad IS 'Nivel de dificultad percibida (1-5)';

-- 4. INDICES PARA RENDIMIENTO
CREATE INDEX idx_entrenamientos_user_id ON public.entrenamientos_completados(user_id);
CREATE INDEX idx_entrenamientos_fecha ON public.entrenamientos_completados(fecha_completado DESC);
CREATE INDEX idx_entrenamientos_plan_id ON public.entrenamientos_completados(plan_id);
CREATE INDEX idx_entrenamientos_week ON public.entrenamientos_completados(week_number);
CREATE INDEX idx_entrenamientos_plan_week ON public.entrenamientos_completados(plan_id, week_number);
CREATE INDEX idx_entrenamientos_created_at ON public.entrenamientos_completados(created_at DESC);
CREATE INDEX idx_entrenamientos_workout_type ON public.entrenamientos_completados(workout_type);

-- 5. HABILITAR ROW LEVEL SECURITY
ALTER TABLE public.entrenamientos_completados ENABLE ROW LEVEL SECURITY;

-- 6. POLITICAS DE SEGURIDAD

-- Politica para usuarios autenticados (pueden ver sus propios entrenamientos)
CREATE POLICY "authenticated_users_select_own" ON public.entrenamientos_completados
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Politica para usuarios autenticados (pueden insertar sus propios entrenamientos)
CREATE POLICY "authenticated_users_insert_own" ON public.entrenamientos_completados
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Politica para usuarios autenticados (pueden actualizar sus propios entrenamientos)
CREATE POLICY "authenticated_users_update_own" ON public.entrenamientos_completados
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

-- Politica para usuarios autenticados (pueden eliminar sus propios entrenamientos)
CREATE POLICY "authenticated_users_delete_own" ON public.entrenamientos_completados
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Politica para usuarios anonimos (pueden insertar con user_id NULL)
CREATE POLICY "anonymous_users_insert" ON public.entrenamientos_completados
    FOR INSERT TO anon
    WITH CHECK (user_id IS NULL);

-- Politica para usuarios anonimos (pueden ver entrenamientos anonimos)
CREATE POLICY "anonymous_users_select" ON public.entrenamientos_completados
    FOR SELECT TO anon
    USING (user_id IS NULL);

-- 7. FUNCION PARA ACTUALIZAR updated_at AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.update_entrenamientos_completados_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. TRIGGER PARA updated_at
CREATE TRIGGER trigger_update_entrenamientos_completados_updated_at
    BEFORE UPDATE ON public.entrenamientos_completados
    FOR EACH ROW
    EXECUTE FUNCTION public.update_entrenamientos_completados_updated_at();

-- 9. GRANTS DE PERMISOS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entrenamientos_completados TO authenticated;
GRANT SELECT, INSERT ON public.entrenamientos_completados TO anon;

-- 10. INSERTAR DATOS DE EJEMPLO PARA VERIFICAR
INSERT INTO public.entrenamientos_completados (
    user_id,
    workout_title,
    workout_type,
    distancia_recorrida,
    duracion,
    fecha_completado,
    plan_id,
    week_number,
    notas
) VALUES (
    NULL,
    'Test de creacion de tabla',
    'carrera',
    5.0,
    30,
    CURRENT_DATE,
    NULL,
    1,
    'Entrenamiento de prueba para verificar que la tabla funciona correctamente'
);

-- 11. VERIFICACION FINAL
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO test_count FROM public.entrenamientos_completados;
    
    IF test_count > 0 THEN
        RAISE NOTICE 'TABLA CREADA EXITOSAMENTE - % registros encontrados', test_count;
    ELSE
        RAISE EXCEPTION 'ERROR: La tabla se creo pero no se pudo insertar datos de prueba';
    END IF;
END $$;
