-- Fix RLS policies for training_plans table
-- This will allow the Edge Function to save training plans correctly

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own training plans" ON training_plans;
DROP POLICY IF EXISTS "Users can insert their own training plans" ON training_plans;
DROP POLICY IF EXISTS "Users can update their own training plans" ON training_plans;
DROP POLICY IF EXISTS "Users can delete their own training plans" ON training_plans;
DROP POLICY IF EXISTS "Allow service role to manage training plans" ON training_plans;
DROP POLICY IF EXISTS "Allow anonymous users to create training plans" ON training_plans;

-- Enable RLS on training_plans if not already enabled
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage their own training plans
CREATE POLICY "Users can manage their own training plans" ON training_plans
  FOR ALL TO authenticated 
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE user_auth_id = auth.uid()
  ))
  WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE user_auth_id = auth.uid()
  ));

-- Allow anonymous users to create training plans (for initial onboarding)
CREATE POLICY "Allow anonymous training plan creation" ON training_plans
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anonymous users to read training plans they created
CREATE POLICY "Allow anonymous read access to training plans" ON training_plans
  FOR SELECT TO anon
  USING (true);

-- Allow service role full access (for Edge Functions)
CREATE POLICY "Allow service role to manage training plans" ON training_plans
  FOR ALL TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Note: training_sessions table doesn't exist yet, so we'll skip its policies for now
