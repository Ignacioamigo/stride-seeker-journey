-- EJECUTA ESTO EN SUPABASE DASHBOARD → SQL EDITOR
-- Script simplificado para crear tabla de carreras

-- Crear tipos enumerados
DO $$ BEGIN
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
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE race_status AS ENUM (
        'upcoming',
        'registration_open',
        'registration_closed',
        'completed',
        'cancelled',
        'postponed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Crear tabla races
CREATE TABLE IF NOT EXISTS races (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Información básica
    name TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    
    -- Ubicación
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    
    -- Detalles de carrera
    race_type race_type NOT NULL,
    distance_km DECIMAL(6,2),
    distance_text TEXT,
    elevation_gain INTEGER,
    
    -- Registro y costo
    registration_price DECIMAL(8,2),
    registration_url TEXT,
    registration_status race_status DEFAULT 'upcoming',
    max_participants INTEGER,
    
    -- Organización
    organizer TEXT,
    website TEXT,
    
    -- Fuente de datos
    source_platform TEXT NOT NULL,
    source_url TEXT NOT NULL,
    source_event_id TEXT,
    
    -- Características adicionales
    includes_tshirt BOOLEAN DEFAULT false,
    includes_medal BOOLEAN DEFAULT false,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricciones
    CONSTRAINT valid_date_range CHECK (event_date >= '2025-08-05'),
    CONSTRAINT valid_distance CHECK (distance_km IS NULL OR distance_km > 0),
    CONSTRAINT valid_price CHECK (registration_price IS NULL OR registration_price >= 0)
);

-- Crear índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_races_event_date ON races(event_date);
CREATE INDEX IF NOT EXISTS idx_races_city ON races(city);
CREATE INDEX IF NOT EXISTS idx_races_province ON races(province);
CREATE INDEX IF NOT EXISTS idx_races_race_type ON races(race_type);

-- Habilitar RLS (Row Level Security)
ALTER TABLE races ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede leer carreras
DROP POLICY IF EXISTS "Anyone can view races" ON races;
CREATE POLICY "Anyone can view races" ON races
    FOR SELECT USING (true);

-- Función de búsqueda de carreras
CREATE OR REPLACE FUNCTION search_races(
    search_term TEXT DEFAULT NULL,
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
    registration_status race_status
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
        r.registration_status
    FROM races r
    WHERE 
        r.event_date >= CURRENT_DATE
        AND (search_term IS NULL OR 
             r.name ILIKE '%' || search_term || '%' OR 
             r.city ILIKE '%' || search_term || '%' OR
             r.organizer ILIKE '%' || search_term || '%')
        AND r.registration_status NOT IN ('cancelled')
    ORDER BY r.event_date ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;