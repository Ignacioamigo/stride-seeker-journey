-- Fix RLS policies for entrenamientos_completados table (corrected version)
-- entrenamientos_completados has FK to auth.users(id), not user_profiles(id)

-- Enable RLS on entrenamientos_completados if not already enabled
ALTER TABLE entrenamientos_completados ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own completed workouts" ON entrenamientos_completados;
DROP POLICY IF EXISTS "Allow anonymous completed workout creation" ON entrenamientos_completados;
DROP POLICY IF EXISTS "Allow anonymous read access to completed workouts" ON entrenamientos_completados;
DROP POLICY IF EXISTS "Allow service role to manage completed workouts" ON entrenamientos_completados;

-- Allow authenticated users to manage their own completed workouts
-- Use auth.uid() directly since entrenamientos_completados.user_id references auth.users(id)
CREATE POLICY "Users can manage their own completed workouts" ON entrenamientos_completados
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow anonymous users to create completed workouts (for workout completion)
CREATE POLICY "Allow anonymous completed workout creation" ON entrenamientos_completados
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anonymous users to read completed workouts
CREATE POLICY "Allow anonymous read access to completed workouts" ON entrenamientos_completados
  FOR SELECT TO anon
  USING (true);

-- Allow anonymous users to update completed workouts
CREATE POLICY "Allow anonymous update to completed workouts" ON entrenamientos_completados
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Allow service role full access (for Edge Functions and background services)
CREATE POLICY "Allow service role to manage completed workouts" ON entrenamientos_completados
  FOR ALL TO service_role 
  USING (true) 
  WITH CHECK (true);
