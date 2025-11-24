-- Create strava_connections table for OAuth tokens
CREATE TABLE IF NOT EXISTS strava_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strava_user_id BIGINT UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at BIGINT NOT NULL,
  athlete_name TEXT,
  athlete_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_auth_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_strava_connections_user_auth_id ON strava_connections(user_auth_id);
CREATE INDEX IF NOT EXISTS idx_strava_connections_strava_user_id ON strava_connections(strava_user_id);

-- Enable Row Level Security
ALTER TABLE strava_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own connections
CREATE POLICY "Users can view own Strava connections"
  ON strava_connections FOR SELECT
  USING (auth.uid() = user_auth_id);

CREATE POLICY "Users can insert own Strava connections"
  ON strava_connections FOR INSERT
  WITH CHECK (auth.uid() = user_auth_id);

CREATE POLICY "Users can update own Strava connections"
  ON strava_connections FOR UPDATE
  USING (auth.uid() = user_auth_id);

CREATE POLICY "Users can delete own Strava connections"
  ON strava_connections FOR DELETE
  USING (auth.uid() = user_auth_id);

-- Add strava_activity_id to published_activities_simple if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'published_activities_simple' 
    AND column_name = 'strava_activity_id'
  ) THEN
    ALTER TABLE published_activities_simple 
    ADD COLUMN strava_activity_id BIGINT UNIQUE;
    
    CREATE INDEX IF NOT EXISTS idx_published_activities_simple_strava_id 
    ON published_activities_simple(strava_activity_id);
  END IF;
END $$;

COMMENT ON TABLE strava_connections IS 'Stores Strava OAuth connection data for each user';

