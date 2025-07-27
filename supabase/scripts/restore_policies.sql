-- Script para restaurar las políticas RLS desde el backup
-- Ejecutar este script SOLO si hay problemas con las nuevas políticas

-- Verificar que existe el backup
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_rls_policies') THEN
        RAISE EXCEPTION 'No se encontró tabla de backup. Ejecuta primero backup_existing_policies.sql';
    END IF;
END $$;

-- Eliminar todas las políticas actuales de las tablas
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

-- Restaurar políticas desde el backup
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT table_name, policy_name, policy_definition 
        FROM backup_rls_policies 
        ORDER BY table_name, policy_name
    LOOP
        BEGIN
            EXECUTE format('CREATE POLICY "%s" ON %I FOR ALL USING (%s)', 
                          policy_record.policy_name, 
                          policy_record.table_name, 
                          policy_record.policy_definition);
            RAISE NOTICE 'Política restaurada: % en tabla %', policy_record.policy_name, policy_record.table_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error restaurando política % en tabla %: %', policy_record.policy_name, policy_record.table_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Mostrar las políticas restauradas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('training_sessions', 'training_plans', 'user_profiles')
ORDER BY tablename, policyname;

-- Opcional: Eliminar la tabla de backup después de la restauración
-- DROP TABLE IF EXISTS backup_rls_policies; 