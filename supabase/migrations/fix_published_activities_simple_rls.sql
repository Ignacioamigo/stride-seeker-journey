-- Fix RLS policies for published_activities_simple to allow viewing imported Strava activities
-- This ensures users can see activities imported from Strava via webhook

-- First, drop existing policies if any
DROP POLICY IF EXISTS "Users can view own activities" ON published_activities_simple;
DROP POLICY IF EXISTS "Users can insert own activities" ON published_activities_simple;
DROP POLICY IF EXISTS "Users can update own activities" ON published_activities_simple;
DROP POLICY IF EXISTS "Users can delete own activities" ON published_activities_simple;

-- Enable RLS if not already enabled
ALTER TABLE published_activities_simple ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own activities (by user_id)
CREATE POLICY "Users can view own activities"
  ON published_activities_simple FOR SELECT
  USING (
    auth.uid() = user_id 
    OR user_id IS NULL  -- Allow viewing activities without user_id (legacy/anonymous)
  );

-- Policy 2: Users can insert their own activities
CREATE POLICY "Users can insert own activities"
  ON published_activities_simple FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR user_id IS NULL  -- Allow inserting anonymous activities
  );

-- Policy 3: Service role can insert activities (for webhook)
-- This is handled by service_role key, no policy needed

-- Policy 4: Users can update their own activities
CREATE POLICY "Users can update own activities"
  ON published_activities_simple FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy 5: Users can delete their own activities
CREATE POLICY "Users can delete own activities"
  ON published_activities_simple FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON POLICY "Users can view own activities" ON published_activities_simple IS 
  'Allows users to view their own activities, including those imported from Strava';

-- Verify the table has the required columns
DO $$ 
BEGIN
  -- Check if user_id column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'published_activities_simple' 
    AND column_name = 'user_id'
  ) THEN
    RAISE EXCEPTION 'Column user_id does not exist in published_activities_simple';
  END IF;
  
  -- Check if imported_from_strava column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'published_activities_simple' 
    AND column_name = 'imported_from_strava'
  ) THEN
    ALTER TABLE published_activities_simple 
    ADD COLUMN imported_from_strava BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_published_activities_simple_user_id 
  ON published_activities_simple(user_id);

CREATE INDEX IF NOT EXISTS idx_published_activities_simple_imported_strava 
  ON published_activities_simple(imported_from_strava) 
  WHERE imported_from_strava = TRUE;


