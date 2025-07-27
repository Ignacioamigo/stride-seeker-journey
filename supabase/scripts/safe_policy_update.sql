-- Script seguro para actualizar políticas RLS
-- Este script hace backup, actualiza y verifica las políticas

-- PASO 1: Crear backup de políticas existentes
DO $$
BEGIN
    RAISE NOTICE '=== INICIANDO BACKUP DE POLÍTICAS EXISTENTES ===';
END $$;

-- Crear tabla temporal para almacenar las políticas existentes
CREATE TABLE IF NOT EXISTS backup_rls_policies (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    policy_name TEXT NOT NULL,
    policy_definition TEXT NOT NULL,
    backup_date TIMESTAMP DEFAULT NOW()
);

-- Limpiar backup anterior si existe
DELETE FROM backup_rls_policies;

-- Backup de políticas existentes
INSERT INTO backup_rls_policies (table_name, policy_name, policy_definition)
SELECT 
    tablename as table_name,
    policyname as policy_name,
    COALESCE(qual, with_check) as policy_definition
FROM pg_policies 
WHERE tablename IN ('training_sessions', 'training_plans', 'user_profiles');

-- Mostrar políticas respaldadas
DO $$
DECLARE
    backup_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO backup_count FROM backup_rls_policies;
    RAISE NOTICE 'Políticas respaldadas: %', backup_count;
END $$;

-- PASO 2: Eliminar políticas existentes
DO $$
BEGIN
    RAISE NOTICE '=== ELIMINANDO POLÍTICAS EXISTENTES ===';
END $$;

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

-- PASO 3: Crear nuevas políticas
DO $$
BEGIN
    RAISE NOTICE '=== CREANDO NUEVAS POLÍTICAS ===';
END $$;

-- Habilitar RLS en las tablas
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para training_sessions
CREATE POLICY "Users can insert their own training sessions" ON training_sessions
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM training_plans tp
    JOIN user_profiles up ON tp.user_id = up.id
    WHERE tp.id = training_sessions.plan_id
    AND up.user_auth_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own training sessions" ON training_sessions
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM training_plans tp
    JOIN user_profiles up ON tp.user_id = up.id
    WHERE tp.id = training_sessions.plan_id
    AND up.user_auth_id = auth.uid()
  )
);

CREATE POLICY "Users can read their own training sessions" ON training_sessions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM training_plans tp
    JOIN user_profiles up ON tp.user_id = up.id
    WHERE tp.id = training_sessions.plan_id
    AND up.user_auth_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own training sessions" ON training_sessions
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM training_plans tp
    JOIN user_profiles up ON tp.user_id = up.id
    WHERE tp.id = training_sessions.plan_id
    AND up.user_auth_id = auth.uid()
  )
);

-- Políticas para training_plans
CREATE POLICY "Users can insert their own training plans" ON training_plans
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = training_plans.user_id
    AND up.user_auth_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own training plans" ON training_plans
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = training_plans.user_id
    AND up.user_auth_id = auth.uid()
  )
);

CREATE POLICY "Users can read their own training plans" ON training_plans
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = training_plans.user_id
    AND up.user_auth_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own training plans" ON training_plans
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = training_plans.user_id
    AND up.user_auth_id = auth.uid()
  )
);

-- Políticas para user_profiles
CREATE POLICY "Users can insert their own profile" ON user_profiles
FOR INSERT WITH CHECK (user_auth_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
FOR UPDATE USING (user_auth_id = auth.uid());

CREATE POLICY "Users can read their own profile" ON user_profiles
FOR SELECT USING (user_auth_id = auth.uid());

CREATE POLICY "Users can delete their own profile" ON user_profiles
FOR DELETE USING (user_auth_id = auth.uid());

-- PASO 4: Verificar que las políticas se crearon correctamente
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICANDO POLÍTICAS CREADAS ===';
END $$;

-- Mostrar todas las políticas creadas
SELECT 
    tablename as tabla,
    policyname as politica,
    cmd as comando,
    permissive as permisiva
FROM pg_policies 
WHERE tablename IN ('training_sessions', 'training_plans', 'user_profiles')
ORDER BY tablename, policyname;

-- Contar políticas por tabla
SELECT 
    tablename,
    COUNT(*) as total_politicas
FROM pg_policies 
WHERE tablename IN ('training_sessions', 'training_plans', 'user_profiles')
GROUP BY tablename
ORDER BY tablename;

DO $$
BEGIN
    RAISE NOTICE '=== ACTUALIZACIÓN COMPLETADA ===';
    RAISE NOTICE 'Si hay problemas, ejecuta restore_policies.sql para restaurar desde el backup';
END $$; 