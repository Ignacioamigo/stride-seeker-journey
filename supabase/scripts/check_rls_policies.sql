-- Script para verificar el estado de las políticas RLS
-- Ejecutar este script para diagnosticar problemas

-- 1. Verificar si RLS está habilitado en las tablas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('training_sessions', 'training_plans', 'user_profiles')
ORDER BY tablename;

-- 2. Mostrar todas las políticas existentes
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

-- 3. Verificar la estructura de las tablas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('training_sessions', 'training_plans', 'user_profiles')
ORDER BY table_name, ordinal_position;

-- 4. Verificar las relaciones entre tablas
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('training_sessions', 'training_plans', 'user_profiles');

-- 5. Verificar datos de ejemplo para debugging
SELECT 'training_plans' as tabla, COUNT(*) as total FROM training_plans
UNION ALL
SELECT 'training_sessions' as tabla, COUNT(*) as total FROM training_sessions
UNION ALL
SELECT 'user_profiles' as tabla, COUNT(*) as total FROM user_profiles;

-- 6. Verificar un plan específico y sus sesiones
SELECT 
    tp.id as plan_id,
    tp.name as plan_name,
    tp.user_id,
    up.user_auth_id,
    COUNT(ts.id) as sessions_count
FROM training_plans tp
LEFT JOIN user_profiles up ON tp.user_id = up.id
LEFT JOIN training_sessions ts ON tp.id = ts.plan_id
WHERE tp.id = 'a33d71a1-a0a9-4c90-b76f-94fa7be5c70f'
GROUP BY tp.id, tp.name, tp.user_id, up.user_auth_id; 