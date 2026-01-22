-- Migration: Update garmin_connections table for OAuth 2.0 PKCE
-- This updates the existing table to support OAuth 2.0 tokens with expiration

-- Add new columns for OAuth 2.0
ALTER TABLE garmin_connections
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refresh_token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;

-- Update column comments
COMMENT ON COLUMN garmin_connections.access_token IS 'OAuth 2.0 access token (expires in 24 hours)';
COMMENT ON COLUMN garmin_connections.refresh_token IS 'OAuth 2.0 refresh token (expires in ~3 months)';
COMMENT ON COLUMN garmin_connections.token_expires_at IS 'When the access token expires';
COMMENT ON COLUMN garmin_connections.refresh_token_expires_at IS 'When the refresh token expires';
COMMENT ON COLUMN garmin_connections.permissions IS 'User granted permissions (e.g., ACTIVITY_EXPORT, HEALTH_EXPORT)';

-- Create index for token expiration lookups (for automatic refresh)
CREATE INDEX IF NOT EXISTS idx_garmin_connections_token_expiration 
ON garmin_connections(token_expires_at) 
WHERE token_expires_at IS NOT NULL;

-- Create function to check if token needs refresh (expires in < 10 minutes)
CREATE OR REPLACE FUNCTION garmin_token_needs_refresh(user_auth_id UUID)
RETURNS BOOLEAN AS $$
SELECT token_expires_at < NOW() + INTERVAL '10 minutes'
FROM garmin_connections
WHERE user_auth_id = $1;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION garmin_token_needs_refresh IS 'Check if Garmin access token needs to be refreshed (expires in < 10 minutes)';







