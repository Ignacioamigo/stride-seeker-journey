-- Fix RLS policies for published_activities table
-- This will allow completed workouts to appear in "Mis Actividades"

-- Enable RLS on published_activities if not already enabled
ALTER TABLE published_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own published activities" ON published_activities;
DROP POLICY IF EXISTS "Users can insert their own published activities" ON published_activities;
DROP POLICY IF EXISTS "Users can update their own published activities" ON published_activities;
DROP POLICY IF EXISTS "Users can delete their own published activities" ON published_activities;
DROP POLICY IF EXISTS "Allow service role to manage published activities" ON published_activities;
DROP POLICY IF EXISTS "Allow anonymous users to create published activities" ON published_activities;
DROP POLICY IF EXISTS "Allow anonymous read access to published activities" ON published_activities;

-- Allow authenticated users to manage their own published activities
-- Use user_auth_id from user_profiles table for proper FK relationship
CREATE POLICY "Users can manage their own published activities" ON published_activities
  FOR ALL TO authenticated 
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE user_auth_id = auth.uid()
  ))
  WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE user_auth_id = auth.uid()
  ));

-- Allow anonymous users to create published activities (for workout completion)
CREATE POLICY "Allow anonymous published activity creation" ON published_activities
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anonymous users to read their own published activities
-- Since we can't identify anonymous users by auth, allow reading all for anon
CREATE POLICY "Allow anonymous read access to published activities" ON published_activities
  FOR SELECT TO anon
  USING (true);

-- Allow anonymous users to update activities (for completion updates)
CREATE POLICY "Allow anonymous update to published activities" ON published_activities
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Allow service role full access (for Edge Functions and background services)
CREATE POLICY "Allow service role to manage published activities" ON published_activities
  FOR ALL TO service_role 
  USING (true) 
  WITH CHECK (true);
