-- Create temporary table for OAuth 1.0a flow
-- Stores request tokens temporarily during OAuth flow

CREATE TABLE IF NOT EXISTS garmin_oauth_temp (
  oauth_token TEXT PRIMARY KEY,
  oauth_token_secret TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for user lookup
CREATE INDEX IF NOT EXISTS idx_garmin_oauth_temp_user_id ON garmin_oauth_temp(user_id);

-- Auto-delete old tokens (older than 10 minutes)
CREATE INDEX IF NOT EXISTS idx_garmin_oauth_temp_created_at ON garmin_oauth_temp(created_at);

-- Disable RLS for this temporary table (only used by Edge Functions)
ALTER TABLE garmin_oauth_temp DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE garmin_oauth_temp IS 'Temporary storage for Garmin OAuth 1.0a request tokens (auto-cleaned after 10 minutes)';







