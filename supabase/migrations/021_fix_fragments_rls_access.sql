-- Arreglar las políticas RLS de fragments para permitir acceso desde Edge Functions

-- Primero, eliminar las políticas existentes
DROP POLICY IF EXISTS "Allow authenticated read access to fragments" ON fragments;
DROP POLICY IF EXISTS "Allow service role to manage fragments" ON fragments;

-- Crear nuevas políticas que permitan:
-- 1. Lectura pública (necesario para las Edge Functions)
-- 2. Gestión completa para service_role

-- Política para permitir lectura a todos (incluyendo anon y edge functions)
CREATE POLICY "Allow public read access to fragments" ON fragments
  FOR SELECT 
  USING (TRUE);

-- Política para permitir todas las operaciones al service role
CREATE POLICY "Allow service role full access to fragments" ON fragments
  FOR ALL 
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Añadir comentario explicativo
COMMENT ON POLICY "Allow public read access to fragments" ON fragments IS 
'Permite lectura pública de fragmentos para que las Edge Functions puedan acceder a ellos durante la generación de planes con RAG';
