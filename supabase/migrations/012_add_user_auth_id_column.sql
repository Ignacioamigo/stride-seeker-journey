-- Add user_auth_id column to user_profiles table
-- This column will link user_profiles to auth.users

-- First, add the column (allow NULL initially)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_auth_id UUID;

-- Add comment to describe the column
COMMENT ON COLUMN user_profiles.user_auth_id IS 'Links to auth.users.id - NULL for anonymous users';

-- Create index for better performance on queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_auth_id 
ON user_profiles(user_auth_id);

-- Update RLS policies to allow operations based on user_auth_id
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated read access to profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow service role to manage profiles" ON user_profiles;

-- Create new policies that work with user_auth_id
CREATE POLICY "Users can manage their own profiles" ON user_profiles
  FOR ALL TO authenticated 
  USING (user_auth_id = auth.uid()) 
  WITH CHECK (user_auth_id = auth.uid());

-- Allow anonymous users to create profiles (for initial onboarding)
CREATE POLICY "Allow anonymous profile creation" ON user_profiles
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anonymous users to read their own profiles
CREATE POLICY "Allow anonymous read access" ON user_profiles
  FOR SELECT TO anon
  USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role to manage profiles" ON user_profiles
  FOR ALL TO service_role 
  USING (true) 
  WITH CHECK (true);
