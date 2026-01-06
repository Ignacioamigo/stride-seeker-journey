-- Migration: Add access_token_secret for OAuth 1.0a support
-- OAuth 1.0a requires storing both access_token and access_token_secret

-- Add access_token_secret column if not exists
ALTER TABLE garmin_connections
ADD COLUMN IF NOT EXISTS access_token_secret TEXT;

-- Make garmin_user_id nullable (might not get it on first call)
ALTER TABLE garmin_connections
ALTER COLUMN garmin_user_id DROP NOT NULL;

-- Update column comments for OAuth 1.0a
COMMENT ON COLUMN garmin_connections.access_token IS 'OAuth 1.0a access token (permanent)';
COMMENT ON COLUMN garmin_connections.access_token_secret IS 'OAuth 1.0a access token secret (permanent)';

-- Drop the unique constraint on garmin_user_id if it exists (it can be null initially)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'garmin_connections_garmin_user_id_key'
  ) THEN
    ALTER TABLE garmin_connections DROP CONSTRAINT garmin_connections_garmin_user_id_key;
  END IF;
END $$;

-- Add unique constraint that allows null
CREATE UNIQUE INDEX IF NOT EXISTS idx_garmin_connections_garmin_user_id_unique 
ON garmin_connections(garmin_user_id) 
WHERE garmin_user_id IS NOT NULL;

COMMENT ON TABLE garmin_connections IS 'Stores Garmin OAuth 1.0a connection data for each user';



