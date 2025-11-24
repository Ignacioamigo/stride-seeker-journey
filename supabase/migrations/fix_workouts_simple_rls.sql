-- Fix RLS policies for workouts_simple to allow viewing imported Strava workouts
-- This ensures statistics are updated correctly when activities are imported from Strava

-- First, drop existing policies if any
DROP POLICY IF EXISTS "Users can view own workouts" ON workouts_simple;
DROP POLICY IF EXISTS "Users can insert own workouts" ON workouts_simple;
DROP POLICY IF EXISTS "Users can update own workouts" ON workouts_simple;
DROP POLICY IF EXISTS "Users can delete own workouts" ON workouts_simple;

-- Enable RLS if not already enabled
ALTER TABLE workouts_simple ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own workouts (by user_email for now, will migrate to user_id later)
CREATE POLICY "Users can view own workouts"
  ON workouts_simple FOR SELECT
  USING (
    user_email = auth.email()
    OR user_email IS NULL  -- Allow viewing workouts without email (legacy/anonymous)
    OR user_email = 'anonimo@app.com'  -- Allow viewing anonymous workouts
  );

-- Policy 2: Users can insert their own workouts
CREATE POLICY "Users can insert own workouts"
  ON workouts_simple FOR INSERT
  WITH CHECK (
    user_email = auth.email()
    OR user_email IS NULL
    OR user_email = 'anonimo@app.com'
  );

-- Policy 3: Users can update their own workouts
CREATE POLICY "Users can update own workouts"
  ON workouts_simple FOR UPDATE
  USING (user_email = auth.email());

-- Policy 4: Users can delete their own workouts
CREATE POLICY "Users can delete own workouts"
  ON workouts_simple FOR DELETE
  USING (user_email = auth.email());

-- Add user_id column if it doesn't exist (for future migration from user_email to user_id)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workouts_simple' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE workouts_simple 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    CREATE INDEX IF NOT EXISTS idx_workouts_simple_user_id 
      ON workouts_simple(user_id);
  END IF;
END $$;

-- Create index for faster lookups by email
CREATE INDEX IF NOT EXISTS idx_workouts_simple_user_email 
  ON workouts_simple(user_email);

-- Add comment
COMMENT ON POLICY "Users can view own workouts" ON workouts_simple IS 
  'Allows users to view their own workouts, including those imported from Strava';

COMMENT ON TABLE workouts_simple IS 
  'Stores workout data for statistics. Currently uses user_email for identification, will migrate to user_id in the future.';


