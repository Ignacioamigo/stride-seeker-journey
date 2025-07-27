-- Eliminar políticas existentes si existen
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

-- Políticas RLS para training_sessions
-- Habilitar RLS en la tabla
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción de sesiones de entrenamiento
CREATE POLICY "Users can insert their own training sessions" ON training_sessions
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM training_plans tp
    JOIN user_profiles up ON tp.user_id = up.id
    WHERE tp.id = training_sessions.plan_id
    AND up.user_auth_id = auth.uid()
  )
);

-- Política para permitir actualización de sesiones de entrenamiento
CREATE POLICY "Users can update their own training sessions" ON training_sessions
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM training_plans tp
    JOIN user_profiles up ON tp.user_id = up.id
    WHERE tp.id = training_sessions.plan_id
    AND up.user_auth_id = auth.uid()
  )
);

-- Política para permitir lectura de sesiones de entrenamiento
CREATE POLICY "Users can read their own training sessions" ON training_sessions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM training_plans tp
    JOIN user_profiles up ON tp.user_id = up.id
    WHERE tp.id = training_sessions.plan_id
    AND up.user_auth_id = auth.uid()
  )
);

-- Política para permitir eliminación de sesiones de entrenamiento
CREATE POLICY "Users can delete their own training sessions" ON training_sessions
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM training_plans tp
    JOIN user_profiles up ON tp.user_id = up.id
    WHERE tp.id = training_sessions.plan_id
    AND up.user_auth_id = auth.uid()
  )
);

-- Políticas RLS para training_plans
-- Habilitar RLS en la tabla
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción de planes de entrenamiento
CREATE POLICY "Users can insert their own training plans" ON training_plans
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = training_plans.user_id
    AND up.user_auth_id = auth.uid()
  )
);

-- Política para permitir actualización de planes de entrenamiento
CREATE POLICY "Users can update their own training plans" ON training_plans
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = training_plans.user_id
    AND up.user_auth_id = auth.uid()
  )
);

-- Política para permitir lectura de planes de entrenamiento
CREATE POLICY "Users can read their own training plans" ON training_plans
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = training_plans.user_id
    AND up.user_auth_id = auth.uid()
  )
);

-- Política para permitir eliminación de planes de entrenamiento
CREATE POLICY "Users can delete their own training plans" ON training_plans
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = training_plans.user_id
    AND up.user_auth_id = auth.uid()
  )
);

-- Políticas RLS para user_profiles
-- Habilitar RLS en la tabla
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción de perfiles de usuario
CREATE POLICY "Users can insert their own profile" ON user_profiles
FOR INSERT WITH CHECK (user_auth_id = auth.uid());

-- Política para permitir actualización de perfiles de usuario
CREATE POLICY "Users can update their own profile" ON user_profiles
FOR UPDATE USING (user_auth_id = auth.uid());

-- Política para permitir lectura de perfiles de usuario
CREATE POLICY "Users can read their own profile" ON user_profiles
FOR SELECT USING (user_auth_id = auth.uid());

-- Política para permitir eliminación de perfiles de usuario
CREATE POLICY "Users can delete their own profile" ON user_profiles
FOR DELETE USING (user_auth_id = auth.uid()); 