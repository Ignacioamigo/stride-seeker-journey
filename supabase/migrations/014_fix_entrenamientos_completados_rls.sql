-- Fix RLS policies for entrenamientos_completados table
-- This will allow saving completed workouts correctly

-- Enable RLS on entrenamientos_completados if not already enabled
ALTER TABLE entrenamientos_completados ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own completed workouts" ON entrenamientos_completados;
DROP POLICY IF EXISTS "Users can insert their own completed workouts" ON entrenamientos_completados;
DROP POLICY IF EXISTS "Users can update their own completed workouts" ON entrenamientos_completados;
DROP POLICY IF EXISTS "Users can delete their own completed workouts" ON entrenamientos_completados;
DROP POLICY IF EXISTS "Allow service role to manage completed workouts" ON entrenamientos_completados;
DROP POLICY IF EXISTS "Allow anonymous users to create completed workouts" ON entrenamientos_completados;

-- Allow authenticated users to manage their own completed workouts
CREATE POLICY "Users can manage their own completed workouts" ON entrenamientos_completados
  FOR ALL TO authenticated 
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE user_auth_id = auth.uid()
  ))
  WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE user_auth_id = auth.uid()
  ));

-- Allow anonymous users to create completed workouts (for initial onboarding)
CREATE POLICY "Allow anonymous completed workout creation" ON entrenamientos_completados
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anonymous users to read completed workouts they created
CREATE POLICY "Allow anonymous read access to completed workouts" ON entrenamientos_completados
  FOR SELECT TO anon
  USING (true);

-- Allow service role full access (for Edge Functions and background services)
CREATE POLICY "Allow service role to manage completed workouts" ON entrenamientos_completados
  FOR ALL TO service_role 
  USING (true) 
  WITH CHECK (true);
