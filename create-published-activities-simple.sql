-- =====================================================
-- TABLA ULTRA SIMPLE PARA PUBLISHED ACTIVITIES
-- Basada en las columnas de la imagen + calorías
-- =====================================================

-- Eliminar tabla si existe
DROP TABLE IF EXISTS public.published_activities_simple CASCADE;

-- Crear tabla con las columnas exactas de la imagen + calorías
CREATE TABLE public.published_activities_simple (
  -- Columnas principales (según imagen)
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT NULL, -- Puede ser NULL para usuarios anónimos
  title TEXT NOT NULL DEFAULT 'Entrenamiento',
  description TEXT DEFAULT 'Entrenamiento completado',
  image_url TEXT DEFAULT NULL,
  distance REAL NOT NULL DEFAULT 0, -- En km (como se ve en imagen: 7.5, 5.2, 6.8)
  duration TEXT NOT NULL DEFAULT '00:00:00', -- En formato HH:MM:SS (como imagen: 00:32:15)
  
  -- Columnas adicionales útiles
  calories INTEGER DEFAULT 0, -- NUEVA: Calorías quemadas
  entrenamiento_id UUID DEFAULT gen_random_uuid(), -- ID único del entrenamiento
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Campos opcionales para compatibilidad
  activity_date TIMESTAMPTZ DEFAULT NOW(),
  is_public BOOLEAN DEFAULT true,
  user_email TEXT DEFAULT 'anonimo@app.com',
  workout_type TEXT DEFAULT 'carrera',
  gps_points JSONB DEFAULT '[]'::jsonb
);

-- RLS ULTRA PERMISIVO (permite todo)
ALTER TABLE public.published_activities_simple ENABLE ROW LEVEL SECURITY;

-- Política universal que permite TODO
DROP POLICY IF EXISTS "Allow all operations for everyone" ON public.published_activities_simple;
CREATE POLICY "Allow all operations for everyone"
ON public.published_activities_simple
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_published_simple_created ON public.published_activities_simple(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_published_simple_user ON public.published_activities_simple(user_id);
CREATE INDEX IF NOT EXISTS idx_published_simple_email ON public.published_activities_simple(user_email);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_published_simple_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_published_simple_updated_at
  BEFORE UPDATE ON public.published_activities_simple
  FOR EACH ROW
  EXECUTE FUNCTION update_published_simple_updated_at();

-- Permisos TOTALES
GRANT ALL PRIVILEGES ON TABLE public.published_activities_simple TO postgres;
GRANT ALL PRIVILEGES ON TABLE public.published_activities_simple TO anon;
GRANT ALL PRIVILEGES ON TABLE public.published_activities_simple TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.published_activities_simple TO service_role;

-- Datos de prueba (basados en la imagen)
INSERT INTO public.published_activities_simple (
  title, 
  description, 
  distance, 
  duration, 
  calories,
  user_email
) VALUES 
  (
    'Carrera de entrenamiento', 
    'Entrenamiento completado: 7.50 km en 00:32:15', 
    7.5, 
    '00:32:15', 
    450, -- ~60 cal/km * 7.5km
    'test@strideseeker.com'
  ),
  (
    'Entrenamiento matutino', 
    'Entrenamiento completado: 5.2 km en 00:28:45', 
    5.2, 
    '00:28:45', 
    312, -- ~60 cal/km * 5.2km
    'morning@runner.com'
  ),
  (
    'Entrenamiento final test', 
    'Entrenamiento completado: 6.80 km en 00:28:30', 
    6.8, 
    '00:28:30', 
    408, -- ~60 cal/km * 6.8km
    'final@test.com'
  );

-- Verificar creación exitosa
SELECT 
  COUNT(*) as total_records,
  'TABLA PUBLISHED_ACTIVITIES_SIMPLE CREADA EXITOSAMENTE' as status
FROM public.published_activities_simple;

-- Mostrar estructura
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'published_activities_simple' 
ORDER BY ordinal_position;
