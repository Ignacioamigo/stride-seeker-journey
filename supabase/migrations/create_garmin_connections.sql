-- Create garmin_connections table for OAuth tokens
CREATE TABLE IF NOT EXISTS garmin_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garmin_user_id TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  athlete_name TEXT,
  athlete_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_auth_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_garmin_connections_user_auth_id ON garmin_connections(user_auth_id);
CREATE INDEX IF NOT EXISTS idx_garmin_connections_garmin_user_id ON garmin_connections(garmin_user_id);

-- Enable Row Level Security
ALTER TABLE garmin_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own connections
CREATE POLICY "Users can view own Garmin connections"
  ON garmin_connections FOR SELECT
  USING (auth.uid() = user_auth_id);

CREATE POLICY "Users can insert own Garmin connections"
  ON garmin_connections FOR INSERT
  WITH CHECK (auth.uid() = user_auth_id);

CREATE POLICY "Users can update own Garmin connections"
  ON garmin_connections FOR UPDATE
  USING (auth.uid() = user_auth_id);

CREATE POLICY "Users can delete own Garmin connections"
  ON garmin_connections FOR DELETE
  USING (auth.uid() = user_auth_id);

-- Service role can do everything (for Edge Functions)
CREATE POLICY "Service role full access to Garmin connections"
  ON garmin_connections FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Add garmin_activity_id to published_activities_simple if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'published_activities_simple' 
    AND column_name = 'garmin_activity_id'
  ) THEN
    ALTER TABLE published_activities_simple 
    ADD COLUMN garmin_activity_id BIGINT UNIQUE;
    
    CREATE INDEX IF NOT EXISTS idx_published_activities_simple_garmin_id 
    ON published_activities_simple(garmin_activity_id);
  END IF;
END $$;

-- Add imported_from_garmin flag if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'published_activities_simple' 
    AND column_name = 'imported_from_garmin'
  ) THEN
    ALTER TABLE published_activities_simple 
    ADD COLUMN imported_from_garmin BOOLEAN DEFAULT FALSE;
    
    CREATE INDEX IF NOT EXISTS idx_published_activities_simple_garmin_source 
    ON published_activities_simple(imported_from_garmin);
  END IF;
END $$;

COMMENT ON TABLE garmin_connections IS 'Stores Garmin OAuth connection data for each user';
COMMENT ON COLUMN garmin_connections.user_auth_id IS 'Foreign key to auth.users(id) - Supabase Auth user ID';
COMMENT ON COLUMN garmin_connections.garmin_user_id IS 'Garmin API User ID (persistent across token renewals)';
COMMENT ON COLUMN garmin_connections.access_token IS 'OAuth2 access token for Garmin API calls';
COMMENT ON COLUMN garmin_connections.refresh_token IS 'OAuth2 refresh token (optional, depends on Garmin implementation)';
COMMENT ON COLUMN garmin_connections.token_expires_at IS 'When the access token expires';




