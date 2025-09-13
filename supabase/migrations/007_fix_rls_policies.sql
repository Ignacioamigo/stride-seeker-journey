-- Migration: Fix RLS policies for all tables

-- 1. Arreglar políticas de user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON user_profiles;

CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 2. Arreglar políticas de training_plans
DROP POLICY IF EXISTS "Users can view their own training plans" ON training_plans;
DROP POLICY IF EXISTS "Users can insert their own training plans" ON training_plans;
DROP POLICY IF EXISTS "Users can update their own training plans" ON training_plans;
DROP POLICY IF EXISTS "Service role can manage training plans" ON training_plans;

CREATE POLICY "Users can view their own training plans" ON training_plans
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM user_profiles WHERE id = training_plans.user_id));

CREATE POLICY "Users can insert their own training plans" ON training_plans
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM user_profiles WHERE id = training_plans.user_id));

CREATE POLICY "Users can update their own training plans" ON training_plans
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM user_profiles WHERE id = training_plans.user_id));

-- 3. Arreglar políticas de entrenamientos_completados
DROP POLICY IF EXISTS "Users can view their own workouts" ON entrenamientos_completados;
DROP POLICY IF EXISTS "Users can insert their own workouts" ON entrenamientos_completados;
DROP POLICY IF EXISTS "Users can update their own workouts" ON entrenamientos_completados;
DROP POLICY IF EXISTS "Service role can manage workouts" ON entrenamientos_completados;

CREATE POLICY "Users can view their own workouts" ON entrenamientos_completados
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workouts" ON entrenamientos_completados
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts" ON entrenamientos_completados
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Arreglar políticas de activities
DROP POLICY IF EXISTS "Users can view their own activities" ON activities;
DROP POLICY IF EXISTS "Users can insert their own activities" ON activities;
DROP POLICY IF EXISTS "Users can update their own activities" ON activities;
DROP POLICY IF EXISTS "Service role can manage activities" ON activities;

CREATE POLICY "Users can view their own activities" ON activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" ON activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" ON activities
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. Políticas de service role para todas las tablas (para funciones Edge)
DROP POLICY IF EXISTS "Service role can manage all profiles" ON user_profiles;
CREATE POLICY "Service role can manage all profiles" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage all plans" ON training_plans;
CREATE POLICY "Service role can manage all plans" ON training_plans
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage all workouts" ON entrenamientos_completados;
CREATE POLICY "Service role can manage all workouts" ON entrenamientos_completados
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage all activities" ON activities;
CREATE POLICY "Service role can manage all activities" ON activities
  FOR ALL USING (auth.role() = 'service_role');
