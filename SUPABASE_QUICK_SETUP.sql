-- PASO 1: EJECUTA ESTO EN SUPABASE SQL EDITOR
-- Crea la tabla races de forma simplificada

CREATE TABLE IF NOT EXISTS races (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    race_type TEXT NOT NULL,
    distance_km DECIMAL(6,2),
    distance_text TEXT,
    elevation_gain INTEGER,
    registration_price DECIMAL(8,2),
    registration_url TEXT,
    registration_status TEXT DEFAULT 'registration_open',
    max_participants INTEGER,
    organizer TEXT,
    website TEXT,
    source_platform TEXT NOT NULL,
    source_url TEXT NOT NULL,
    source_event_id TEXT,
    includes_tshirt BOOLEAN DEFAULT false,
    includes_medal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE races ENABLE ROW LEVEL SECURITY;

-- Permitir lectura a todos
CREATE POLICY "Everyone can read races" ON races FOR SELECT USING (true);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_races_date ON races(event_date);
CREATE INDEX IF NOT EXISTS idx_races_city ON races(city);
CREATE INDEX IF NOT EXISTS idx_races_type ON races(race_type);

-- Insertar datos de ejemplo inmediatamente
INSERT INTO races (
    name, description, event_date, city, province, race_type, 
    distance_km, distance_text, registration_price, registration_url, 
    organizer, source_platform, source_url, source_event_id, 
    registration_status, includes_tshirt, includes_medal, max_participants
) VALUES 

('Maratón de Madrid 2025', 
 'El maratón más importante de España, recorriendo los lugares más emblemáticos de la capital',
 '2025-04-27', 'Madrid', 'Madrid', 'maraton', 
 42.195, '42.2 km', 45.00, 'https://maratonmadrid.org',
 'Club Atletismo Madrid', 'manual_entry', 'https://maratonmadrid.org', 'madrid-maraton-2025',
 'registration_open', true, true, 15000),

('Media Maratón Valencia Trinidad Alfonso 2025',
 'Una de las mejores medias maratones del mundo, con recorrido rápido y plano',
 '2025-10-26', 'Valencia', 'Valencia', 'media_maraton',
 21.097, '21.1 km', 35.00, 'https://mediomaratonvalencia.com',
 'Valencia Ciudad del Running', 'manual_entry', 'https://mediomaratonvalencia.com', 'valencia-media-2025',
 'registration_open', true, true, 20000),

('Trail Sierra de Guadarrama',
 'Trail de montaña por la Sierra de Guadarrama con vistas espectaculares',
 '2025-09-14', 'Navacerrada', 'Madrid', 'trail_running',
 25.0, '25 km', 30.00, 'https://trailguadarrama.com',
 'Club Montaña Madrid', 'manual_entry', 'https://trailguadarrama.com', 'trail-guadarrama-2025',
 'registration_open', false, true, 800),

('Carrera Popular de Barcelona',
 'Carrera familiar por el centro histórico de Barcelona',
 '2025-11-02', 'Barcelona', 'Barcelona', 'carrera_popular',
 10.0, '10 km', 20.00, 'https://popularbarcelona.com',
 'Barcelona Running Club', 'manual_entry', 'https://popularbarcelona.com', 'barcelona-popular-2025',
 'registration_open', true, false, 5000),

('Ultra Trail Pirineos',
 'Ultra trail desafiante por los Pirineos aragoneses',
 '2025-08-16', 'Jaca', 'Huesca', 'ultra_trail',
 100.0, '100 km', 80.00, 'https://ultrapirineos.com',
 'Pirineos Trail Organization', 'manual_entry', 'https://ultrapirineos.com', 'ultra-pirineos-2025',
 'registration_open', true, true, 500),

('Carrera Nocturna Sevilla',
 'Carrera nocturna por el casco histórico de Sevilla',
 '2025-08-30', 'Sevilla', 'Sevilla', 'nocturna',
 8.0, '8 km', 15.00, 'https://nocturnasevilla.com',
 'Sevilla Night Runners', 'manual_entry', 'https://nocturnasevilla.com', 'sevilla-nocturna-2025',
 'registration_open', false, false, 3000),

('San Silvestre Vallecana',
 'La carrera popular más famosa de fin de año en España',
 '2025-12-31', 'Madrid', 'Madrid', 'carrera_popular',
 10.0, '10 km', 25.00, 'https://sansilvestre-vallecana.com',
 'Club Atletismo Vallecas', 'manual_entry', 'https://sansilvestre-vallecana.com', 'sansilvestre-2025',
 'registration_open', true, true, 40000),

('Transgrancanaria HG 2025',
 'Ultra trail por la isla de Gran Canaria, paisajes únicos',
 '2025-02-22', 'Las Palmas', 'Las Palmas', 'ultra_trail',
 125.0, '125 km', 120.00, 'https://transgrancanaria.net',
 'Transgrancanaria Organization', 'manual_entry', 'https://transgrancanaria.net', 'transgrancanaria-2025',
 'registration_open', true, true, 1500),

('Cross País Alcobendas',
 'Cross tradicional en terreno natural',
 '2025-03-15', 'Alcobendas', 'Madrid', 'cross',
 8.0, '8 km', 12.00, 'https://crossalcobendas.com',
 'Club Atletismo Alcobendas', 'manual_entry', 'https://crossalcobendas.com', 'cross-alcobendas-2025',
 'registration_open', false, true, 800),

('Maratón de Sevilla',
 'Maratón por la ciudad más bella de Andalucía',
 '2025-02-16', 'Sevilla', 'Sevilla', 'maraton',
 42.195, '42.2 km', 40.00, 'https://maratonsevilla.org',
 'Sevilla Running', 'manual_entry', 'https://maratonsevilla.org', 'sevilla-maraton-2025',
 'registration_open', true, true, 8000);

-- Confirmar inserción
SELECT COUNT(*) as total_carreras FROM races;