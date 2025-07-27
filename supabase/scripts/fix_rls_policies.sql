-- Script para arreglar las políticas RLS con un enfoque más simple
-- Ejecutar este script para resolver el problema de permisos

-- PASO 1: Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can insert their own training sessions" ON training_sessions;
DROP POLICY IF EXISTS "Users can update their own training sessions" ON training_sessions;
DROP POLICY IF EXISTS "Users can read their own training sessions" ON training_sessions;
DROP POLICY IF EXISTS "Users can delete their own training sessions" ON training_sessions;

DROP POLICY IF EXISTS "Users can insert their own training plans" ON training_plans;
DROP POLICY IF EXISTS "Users can update their own training plans" ON training_plans;
DROP POLICY IF EXISTS "Users can read their own training plans" ON training_plans;
DROP POLICY IF EXISTS "Users can delete their own training plans" ON training_plans;

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;

-- PASO 2: Habilitar RLS en todas las tablas
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- PASO 3: Crear políticas más simples y directas

-- Políticas para user_profiles (más simple)
CREATE POLICY "Enable all for authenticated users" ON user_profiles
FOR ALL USING (auth.uid() = user_auth_id);

-- Políticas para training_plans (más simple)
CREATE POLICY "Enable all for authenticated users" ON training_plans
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = training_plans.user_id 
    AND user_profiles.user_auth_id = auth.uid()
  )
);

-- Políticas para training_sessions (más simple)
CREATE POLICY "Enable all for authenticated users" ON training_sessions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM training_plans tp
    JOIN user_profiles up ON tp.user_id = up.id
    WHERE tp.id = training_sessions.plan_id
    AND up.user_auth_id = auth.uid()
  )
);

-- PASO 4: Verificar que las políticas se crearon
SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename IN ('training_sessions', 'training_plans', 'user_profiles')
ORDER BY tablename, policyname;

-- PASO 5: Mostrar resumen
SELECT 
    tablename,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename IN ('training_sessions', 'training_plans', 'user_profiles')
GROUP BY tablename
ORDER BY tablename; 