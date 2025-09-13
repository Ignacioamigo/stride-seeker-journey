-- Migration: Fix training_plans foreign key constraint

-- Drop the incorrect foreign key constraint if it exists
ALTER TABLE training_plans DROP CONSTRAINT IF EXISTS training_plans_user_id_fkey;

-- Add the correct foreign key constraint pointing to user_profiles
ALTER TABLE training_plans 
ADD CONSTRAINT training_plans_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
