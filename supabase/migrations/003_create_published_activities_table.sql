-- Crear tabla para actividades publicadas
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

-- Habilitar RLS
ALTER TABLE published_activities ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view public activities"
  ON published_activities FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
  ON published_activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
  ON published_activities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
  ON published_activities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Índices para mejor rendimiento
CREATE INDEX idx_published_activities_user_id ON published_activities(user_id);
CREATE INDEX idx_published_activities_activity_date ON published_activities(activity_date DESC);
CREATE INDEX idx_published_activities_public ON published_activities(is_public) WHERE is_public = true;

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_published_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_published_activities_updated_at
  BEFORE UPDATE ON published_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_published_activities_updated_at();

-- Crear bucket para imágenes de actividades si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-images', 'activity-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política de storage para imágenes de actividades
CREATE POLICY "Public can view activity images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'activity-images');

CREATE POLICY "Authenticated users can upload activity images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'activity-images');

CREATE POLICY "Users can update their own activity images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'activity-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own activity images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'activity-images' AND auth.uid()::text = (storage.foldername(name))[1]);
