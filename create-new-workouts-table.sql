-- ====================================================================
-- TABLA NUEVA SIMPLE PARA ENTRENAMIENTOS - SIN COMPLICACIONES
-- ====================================================================

-- Eliminar tabla si existe
DROP TABLE IF EXISTS public.workouts_simple CASCADE;

-- Crear tabla ultra simple
CREATE TABLE public.
 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT DEFAULT 'anonimo@app.com', -- Usar email en vez de FK complicado
  workout_title TEXT NOT NULL DEFAULT 'Entrenamiento',
  workout_type TEXT DEFAULT 'carrera',
  distance REAL DEFAULT 0, -- Distancia en km
  duration_minutes INTEGER DEFAULT 0, -- Duración en minutos
  completed_date DATE DEFAULT CURRENT_DATE,
  plan_info TEXT, -- Plan ID como texto simple
  week_number INTEGER DEFAULT 1,
  notes TEXT DEFAULT 'Entrenamiento completado',
  app_version TEXT DEFAULT 'v1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS ULTRA PERMISIVO
ALTER TABLE public.workouts_simple ENABLE ROW LEVEL SECURITY;

-- Política que permite TODO a TODOS
DROP POLICY IF EXISTS "Allow everything to everyone" ON public.workouts_simple;
CREATE POLICY "Allow everything to everyone" 
ON public.workouts_simple 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_workouts_simple_user ON public.workouts_simple(user_email);
CREATE INDEX IF NOT EXISTS idx_workouts_simple_date ON public.workouts_simple(completed_date DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_simple_created ON public.workouts_simple(created_at DESC);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_workouts_simple_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workouts_simple_updated_at
  BEFORE UPDATE ON public.workouts_simple
  FOR EACH ROW
  EXECUTE FUNCTION update_workouts_simple_updated_at();

-- Permisos TOTALES para todos los roles
GRANT ALL PRIVILEGES ON TABLE public.workouts_simple TO postgres;
GRANT ALL PRIVILEGES ON TABLE public.workouts_simple TO anon;
GRANT ALL PRIVILEGES ON TABLE public.workouts_simple TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.workouts_simple TO service_role;

-- Insertar datos de prueba para verificar que funciona
INSERT INTO public.workouts_simple (
  user_email, 
  workout_title, 
  workout_type, 
  distance, 
  duration_minutes, 
  notes
) VALUES 
  ('test@strideseeker.com', 'Entrenamiento de Prueba', 'carrera', 5.0, 30, 'Prueba inicial de la tabla'),
  ('anonimo@app.com', 'Entrenamiento Anónimo', 'caminata', 3.0, 25, 'Usuario anónimo'),
  ('demo@app.com', 'Demo Workout', 'sprint', 1.0, 10, 'Demo para verificar funcionamiento');

-- Verificar que todo funcionó
SELECT 
  COUNT(*) as total_records,
  'TABLA CREADA EXITOSAMENTE - LISTA PARA USAR' as status
FROM public.workouts_simple;
