-- Fix RLS policies for published_activities table (corrected version)
-- published_activities has FK to auth.users(id), not user_profiles(id)

-- Enable RLS on published_activities if not already enabled
ALTER TABLE published_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own published activities" ON published_activities;
DROP POLICY IF EXISTS "Allow anonymous published activity creation" ON published_activities;
DROP POLICY IF EXISTS "Allow anonymous read access to published activities" ON published_activities;
DROP POLICY IF EXISTS "Allow anonymous update to published activities" ON published_activities;
DROP POLICY IF EXISTS "Allow service role to manage published activities" ON published_activities;

-- Allow authenticated users to manage their own published activities
-- Use auth.uid() directly since published_activities.user_id references auth.users(id)
CREATE POLICY "Users can manage their own published activities" ON published_activities
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow anonymous users to create published activities (for workout completion)
CREATE POLICY "Allow anonymous published activity creation" ON published_activities
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anonymous users to read published activities
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
