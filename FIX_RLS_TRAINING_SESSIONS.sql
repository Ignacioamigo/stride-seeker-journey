-- =====================================================
-- 🚨 EJECUTAR ESTO EN SUPABASE AHORA
-- =====================================================
-- Arregla las políticas RLS que bloquean los INSERT

-- 1. ELIMINAR políticas restrictivas
DROP POLICY IF EXISTS "Users can view their own sessions" ON training_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON training_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON training_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON training_sessions;

-- 2. CREAR política ULTRA PERMISIVA (igual que published_activities_simple)
CREATE POLICY "Allow all operations for everyone"
ON training_sessions
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 3. Verificar que funciona
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'training_sessions';

-- ✅ Deberías ver UNA política: "Allow all operations for everyone"

