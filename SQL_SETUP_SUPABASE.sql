-- =============================================
-- SCRIPT COMPLETO PARA CONFIGURAR SUPABASE
-- Copia y pega LÍNEA A LÍNEA en el SQL Editor
-- =============================================

-- 1. CREAR TABLA PRINCIPAL
CREATE TABLE IF NOT EXISTS published_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  distance REAL NOT NULL DEFAULT 0,
  duration TEXT NOT NULL DEFAULT '00:00:00',
  gps_points JSONB,
  is_public BOOLEAN NOT NULL DEFAULT true,
  activity_date TIMESTAMP WITH TIME ZONE NOT NULL,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. HABILITAR RLS (Row Level Security)
ALTER TABLE published_activities ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE SEGURIDAD - INSERTAR
CREATE POLICY "Users can insert their own activities"
  ON published_activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. POLÍTICAS DE SEGURIDAD - LEER PROPIAS
CREATE POLICY "Users can view their own activities"
  ON published_activities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. POLÍTICAS DE SEGURIDAD - LEER PÚBLICAS
CREATE POLICY "Users can view public activities"
  ON published_activities FOR SELECT
  TO authenticated
  USING (is_public = true);

-- 6. POLÍTICAS DE SEGURIDAD - ACTUALIZAR
CREATE POLICY "Users can update their own activities"
  ON published_activities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. POLÍTICAS DE SEGURIDAD - ELIMINAR
CREATE POLICY "Users can delete their own activities"
  ON published_activities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 8. ÍNDICES PARA RENDIMIENTO
CREATE INDEX idx_published_activities_user_id ON published_activities(user_id);
CREATE INDEX idx_published_activities_activity_date ON published_activities(activity_date DESC);
CREATE INDEX idx_published_activities_public ON published_activities(is_public) WHERE is_public = true;
CREATE INDEX idx_published_activities_created_at ON published_activities(created_at DESC);

-- 9. FUNCIÓN PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
CREATE OR REPLACE FUNCTION update_published_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. TRIGGER PARA updated_at
CREATE TRIGGER update_published_activities_updated_at
  BEFORE UPDATE ON published_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_published_activities_updated_at();

-- =============================================
-- VERIFICACIÓN - EJECUTA PARA COMPROBAR
-- =============================================

-- Verificar que la tabla se creó correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'published_activities'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'published_activities';
