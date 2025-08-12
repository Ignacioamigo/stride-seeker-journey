-- =============================================
-- CONFIGURACIÓN DE STORAGE PARA IMÁGENES
-- Ve a: Storage > Create new bucket
-- =============================================

-- 1. CREAR BUCKET (puedes hacer esto en la UI también)
-- Nombre: activity-images
-- Público: true
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- 2. POLÍTICAS DE STORAGE (Ejecuta en SQL Editor)

-- Permitir a usuarios autenticados subir imágenes
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-images', 'activity-images', true)
ON CONFLICT (id) DO UPDATE SET
  public = true;

-- 3. POLÍTICAS DE ACCESO

-- Política para VER imágenes (público)
CREATE POLICY "Public can view activity images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'activity-images');

-- Política para SUBIR imágenes (solo autenticados)
CREATE POLICY "Authenticated users can upload activity images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'activity-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Política para ACTUALIZAR imágenes (solo propietario)
CREATE POLICY "Users can update their own activity images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'activity-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Política para ELIMINAR imágenes (solo propietario)
CREATE POLICY "Users can delete their own activity images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'activity-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================
-- VERIFICACIÓN DE STORAGE
-- =============================================

-- Verificar bucket
SELECT * FROM storage.buckets WHERE id = 'activity-images';

-- Verificar políticas de storage
SELECT 
  policyname, 
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%activity%';
