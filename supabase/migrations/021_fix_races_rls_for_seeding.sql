-- Fix RLS policies for races table to allow seeding

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can insert races" ON races;
DROP POLICY IF EXISTS "Authenticated users can update races" ON races;

-- Create more permissive policies for seeding
CREATE POLICY "Allow insert for anon and authenticated" ON races
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for anon and authenticated" ON races
  FOR UPDATE USING (true);

-- Keep the existing read policy
-- CREATE POLICY "Anyone can view races" ON races FOR SELECT USING (true);

-- Add comment explaining the permissive policy
COMMENT ON POLICY "Allow insert for anon and authenticated" ON races IS 'Temporary permissive policy to allow race seeding scripts to populate the database';
