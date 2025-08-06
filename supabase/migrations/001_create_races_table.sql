-- Migration: Create races table for Spanish race events
-- This table stores comprehensive race data scraped from multiple Spanish sources

-- Create enum for race types
CREATE TYPE race_type AS ENUM (
  'carrera_popular',
  'trail_running', 
  'media_maraton',
  'maraton',
  'cross',
  'montaña',
  'ultra_trail',
  'canicross',
  'triathlon',
  'duathlon',
  'acuathlon',
  'solidaria',
  'nocturna',
  'virtual',
  'otros'
);

-- Create enum for race status
CREATE TYPE race_status AS ENUM (
  'upcoming',
  'registration_open',
  'registration_closed',
  'completed',
  'cancelled',
  'postponed'
);

-- Create enum for difficulty levels
CREATE TYPE difficulty_level AS ENUM (
  'principiante',
  'intermedio', 
  'avanzado',
  'elite'
);

-- Create races table
CREATE TABLE IF NOT EXISTS races (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Information
  name TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  registration_deadline DATE,
  
  -- Location
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  autonomous_community TEXT,
  country TEXT DEFAULT 'España',
  venue TEXT,
  start_location TEXT,
  coordinates POINT, -- PostGIS point for latitude/longitude
  
  -- Race Details
  race_type race_type NOT NULL,
  distance_km DECIMAL(6,2), -- Support for very long distances
  distance_text TEXT, -- For non-standard distances like "5K + 10K"
  elevation_gain INTEGER, -- meters
  difficulty_level difficulty_level,
  
  -- Multiple distances support
  distances JSONB, -- Array of {distance_km, distance_text, category}
  
  -- Registration & Cost
  registration_price DECIMAL(8,2),
  price_details JSONB, -- Different categories and prices
  registration_url TEXT,
  registration_status race_status DEFAULT 'upcoming',
  max_participants INTEGER,
  current_participants INTEGER,
  
  -- Organization
  organizer TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  social_media JSONB, -- {facebook, instagram, twitter, etc}
  
  -- Timing & Results
  timing_company TEXT,
  timing_system TEXT, -- 'chip', 'manual', 'photo', etc
  results_url TEXT,
  live_tracking_url TEXT,
  
  -- Categories & Prizes
  categories JSONB, -- Age groups, gender categories, etc
  prizes JSONB, -- Prize information
  
  -- Source & Scraping
  source_platform TEXT NOT NULL, -- 'runnea', 'clubrunning', etc
  source_url TEXT NOT NULL,
  source_event_id TEXT,
  image_url TEXT,
  poster_url TEXT,
  
  -- Additional Features
  features JSONB, -- shower, parking, refreshments, etc
  race_pack_info TEXT,
  includes_tshirt BOOLEAN DEFAULT false,
  includes_medal BOOLEAN DEFAULT false,
  
  -- Weather & Conditions
  expected_weather JSONB,
  surface_type TEXT, -- 'asphalt', 'trail', 'mixed', etc
  circuit_type TEXT, -- 'loop', 'point_to_point', 'out_and_back'
  
  -- Special Classifications
  is_qualifying_race BOOLEAN DEFAULT false,
  qualifying_for TEXT, -- What it qualifies for
  is_championship BOOLEAN DEFAULT false,
  championship_level TEXT, -- 'local', 'regional', 'national', 'international'
  
  -- Series & Circuits
  series_name TEXT,
  circuit_name TEXT,
  series_points INTEGER,
  
  -- Accessibility & Special Needs
  wheelchair_accessible BOOLEAN DEFAULT false,
  guide_runners_allowed BOOLEAN DEFAULT false,
  special_categories JSONB, -- Visually impaired, etc
  
  -- Data Quality & Processing
  data_quality_score DECIMAL(3,2), -- 0.00 to 1.00
  last_verified TIMESTAMP WITH TIME ZONE,
  needs_manual_review BOOLEAN DEFAULT false,
  review_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_scrape_due TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_date_range CHECK (event_date >= '2025-08-05'),
  CONSTRAINT valid_registration_deadline CHECK (registration_deadline <= event_date),
  CONSTRAINT valid_distance CHECK (distance_km IS NULL OR distance_km > 0),
  CONSTRAINT valid_price CHECK (registration_price IS NULL OR registration_price >= 0),
  CONSTRAINT valid_participants CHECK (
    max_participants IS NULL OR 
    current_participants IS NULL OR 
    current_participants <= max_participants
  ),
  CONSTRAINT valid_quality_score CHECK (
    data_quality_score IS NULL OR 
    (data_quality_score >= 0 AND data_quality_score <= 1)
  )
);

-- Create indexes for performance
CREATE INDEX idx_races_event_date ON races(event_date);
CREATE INDEX idx_races_city ON races(city);
CREATE INDEX idx_races_province ON races(province);
CREATE INDEX idx_races_race_type ON races(race_type);
CREATE INDEX idx_races_registration_status ON races(registration_status);
CREATE INDEX idx_races_source_platform ON races(source_platform);
CREATE INDEX idx_races_created_at ON races(created_at);
CREATE INDEX idx_races_location ON races USING GIST(coordinates);

-- Create composite indexes for common queries
CREATE INDEX idx_races_date_location ON races(event_date, province, city);
CREATE INDEX idx_races_type_date ON races(race_type, event_date);
CREATE INDEX idx_races_source_scraping ON races(source_platform, next_scrape_due);

-- Create full-text search index
CREATE INDEX idx_races_search ON races USING GIN(
  to_tsvector('spanish', 
    COALESCE(name, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(city, '') || ' ' ||
    COALESCE(organizer, '')
  )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_races_updated_at 
  BEFORE UPDATE ON races 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for public race data (without scraping metadata)
CREATE VIEW public_races AS
SELECT 
  id,
  name,
  description,
  event_date,
  event_time,
  registration_deadline,
  city,
  province,
  autonomous_community,
  venue,
  race_type,
  distance_km,
  distance_text,
  distances,
  elevation_gain,
  difficulty_level,
  registration_price,
  price_details,
  registration_url,
  registration_status,
  max_participants,
  current_participants,
  organizer,
  website,
  categories,
  prizes,
  image_url,
  poster_url,
  features,
  includes_tshirt,
  includes_medal,
  surface_type,
  circuit_type,
  is_qualifying_race,
  qualifying_for,
  is_championship,
  championship_level,
  series_name,
  circuit_name,
  wheelchair_accessible,
  guide_runners_allowed,
  special_categories,
  created_at,
  updated_at
FROM races
WHERE registration_status NOT IN ('cancelled')
AND event_date >= CURRENT_DATE;

-- Add RLS (Row Level Security) policies
ALTER TABLE races ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read public race data
CREATE POLICY "Anyone can view races" ON races
  FOR SELECT USING (true);

-- Policy: Only authenticated users can insert (for scraping service)
CREATE POLICY "Authenticated users can insert races" ON races
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only authenticated users can update (for scraping service)
CREATE POLICY "Authenticated users can update races" ON races
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create function to search races
CREATE OR REPLACE FUNCTION search_races(
  search_term TEXT DEFAULT NULL,
  race_types TEXT[] DEFAULT NULL,
  provinces TEXT[] DEFAULT NULL,
  date_from DATE DEFAULT NULL,
  date_to DATE DEFAULT NULL,
  max_distance DECIMAL DEFAULT NULL,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  event_date DATE,
  city TEXT,
  province TEXT,
  race_type race_type,
  distance_km DECIMAL,
  registration_url TEXT,
  registration_status race_status,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.event_date,
    r.city,
    r.province,
    r.race_type,
    r.distance_km,
    r.registration_url,
    r.registration_status,
    ts_rank(
      to_tsvector('spanish', 
        COALESCE(r.name, '') || ' ' || 
        COALESCE(r.description, '') || ' ' || 
        COALESCE(r.city, '') || ' ' ||
        COALESCE(r.organizer, '')
      ),
      plainto_tsquery('spanish', COALESCE(search_term, ''))
    ) as rank
  FROM races r
  WHERE 
    r.event_date >= CURRENT_DATE
    AND (search_term IS NULL OR to_tsvector('spanish', 
        COALESCE(r.name, '') || ' ' || 
        COALESCE(r.description, '') || ' ' || 
        COALESCE(r.city, '') || ' ' ||
        COALESCE(r.organizer, '')
      ) @@ plainto_tsquery('spanish', search_term))
    AND (race_types IS NULL OR r.race_type = ANY(race_types::race_type[]))
    AND (provinces IS NULL OR r.province = ANY(provinces))
    AND (date_from IS NULL OR r.event_date >= date_from)
    AND (date_to IS NULL OR r.event_date <= date_to)
    AND (max_distance IS NULL OR r.distance_km <= max_distance)
    AND r.registration_status NOT IN ('cancelled')
  ORDER BY 
    CASE WHEN search_term IS NOT NULL THEN rank END DESC,
    r.event_date ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Add comment to table
COMMENT ON TABLE races IS 'Comprehensive database of running races and events in Spain, populated by web scraping from multiple sources';