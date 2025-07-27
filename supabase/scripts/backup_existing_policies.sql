-- Script para hacer backup de las políticas RLS existentes
-- Ejecutar este script ANTES de aplicar los cambios

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

-- Backup de políticas de training_sessions
INSERT INTO backup_rls_policies (table_name, policy_name, policy_definition)
SELECT 
    'training_sessions' as table_name,
    policyname as policy_name,
    COALESCE(qual, with_check) as policy_definition
FROM pg_policies 
WHERE tablename = 'training_sessions';

-- Backup de políticas de training_plans
INSERT INTO backup_rls_policies (table_name, policy_name, policy_definition)
SELECT 
    'training_plans' as table_name,
    policyname as policy_name,
    COALESCE(qual, with_check) as policy_definition
FROM pg_policies 
WHERE tablename = 'training_plans';

-- Backup de políticas de user_profiles
INSERT INTO backup_rls_policies (table_name, policy_name, policy_definition)
SELECT 
    'user_profiles' as table_name,
    policyname as policy_name,
    COALESCE(qual, with_check) as policy_definition
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Mostrar las políticas que se han respaldado
SELECT 
    table_name,
    policy_name,
    policy_definition,
    backup_date
FROM backup_rls_policies
ORDER BY table_name, policy_name;

-- Comentario: Para restaurar las políticas desde el backup, usar el script restore_policies.sql 