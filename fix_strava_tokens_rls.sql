-- Script para verificar y arreglar políticas RLS de strava_tokens

-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'strava_tokens';

-- Verificar si RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'strava_tokens';

-- Deshabilitar RLS temporalmente para testing
ALTER TABLE public.strava_tokens DISABLE ROW LEVEL SECURITY;

-- O alternativamente, crear políticas más permisivas
-- DROP POLICY IF EXISTS "Users can manage their own Strava tokens" ON public.strava_tokens;

-- CREATE POLICY "Users can manage their own Strava tokens" 
-- ON public.strava_tokens 
-- FOR ALL 
-- TO authenticated 
-- USING (auth.uid() = user_id) 
-- WITH CHECK (auth.uid() = user_id);

-- También permitir al service role acceso completo
-- CREATE POLICY "Service role can manage all Strava tokens" 
-- ON public.strava_tokens 
-- FOR ALL 
-- TO service_role 
-- USING (true) 
-- WITH CHECK (true);

-- Verificar que la tabla existe y tiene las columnas correctas
\d public.strava_tokens;
