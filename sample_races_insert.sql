-- Insertar carreras de ejemplo para probar el sistema
-- Ejecuta esto en Supabase SQL Editor después de crear la tabla

INSERT INTO races (
  name, 
  description, 
  event_date, 
  city, 
  province, 
  race_type, 
  distance_km, 
  distance_text,
  registration_price,
  registration_url,
  organizer,
  source_platform,
  source_url,
  source_event_id,
  registration_status
) VALUES 
(
  'Maratón de Madrid',
  'El maratón más importante de España, recorriendo los lugares más emblemáticos de la capital',
  '2025-04-27',
  'Madrid',
  'Madrid',
  'maraton',
  42.195,
  '42.2 km',
  45.00,
  'https://example.com/maraton-madrid',
  'Club Atletismo Madrid',
  'fallback_data',
  'https://example.com/maraton-madrid',
  'madrid-maraton-2025',
  'registration_open'
),
(
  'Media Maratón Valencia',
  'Una de las mejores medias maratones del mundo, con recorrido rápido y plano',
  '2025-10-26',
  'Valencia',
  'Valencia',
  'media_maraton',
  21.097,
  '21.1 km',
  35.00,
  'https://example.com/media-valencia',
  'Valencia Ciudad del Running',
  'fallback_data',
  'https://example.com/media-valencia',
  'valencia-media-2025',
  'registration_open'
),
(
  'Trail Sierra de Guadarrama',
  'Trail de montaña por la Sierra de Guadarrama con vistas espectaculares',
  '2025-09-14',
  'Navacerrada',
  'Madrid',
  'trail_running',
  25.0,
  '25 km',
  30.00,
  'https://example.com/trail-guadarrama',
  'Club Montaña Madrid',
  'fallback_data',
  'https://example.com/trail-guadarrama',
  'trail-guadarrama-2025',
  'registration_open'
),
(
  'Carrera Popular de Barcelona',
  'Carrera familiar por el centro histórico de Barcelona',
  '2025-11-02',
  'Barcelona',
  'Barcelona',
  'carrera_popular',
  10.0,
  '10 km',
  20.00,
  'https://example.com/popular-barcelona',
  'Barcelona Running Club',
  'fallback_data',
  'https://example.com/popular-barcelona',
  'barcelona-popular-2025',
  'registration_open'
),
(
  'Ultra Trail Pirineos',
  'Ultra trail desafiante por los Pirineos aragoneses',
  '2025-08-16',
  'Jaca',
  'Huesca',
  'ultra_trail',
  100.0,
  '100 km',
  80.00,
  'https://example.com/ultra-pirineos',
  'Pirineos Trail Organization',
  'fallback_data',
  'https://example.com/ultra-pirineos',
  'ultra-pirineos-2025',
  'registration_open'
),
(
  'Carrera Nocturna Sevilla',
  'Carrera nocturna por el casco histórico de Sevilla',
  '2025-08-30',
  'Sevilla',
  'Sevilla',
  'nocturna',
  8.0,
  '8 km',
  15.00,
  'https://example.com/nocturna-sevilla',
  'Sevilla Night Runners',
  'fallback_data',
  'https://example.com/nocturna-sevilla',
  'sevilla-nocturna-2025',
  'registration_open'
),
(
  'Cross Universitario Valladolid',
  'Cross universitario en el campus de Valladolid',
  '2025-12-15',
  'Valladolid',
  'Valladolid',
  'cross',
  6.0,
  '6 km',
  12.00,
  'https://example.com/cross-valladolid',
  'Universidad de Valladolid',
  'fallback_data',
  'https://example.com/cross-valladolid',
  'cross-valladolid-2025',
  'registration_open'
),
(
  'Triatlón Costa Brava',
  'Triatlón olímpico en la hermosa Costa Brava',
  '2025-06-21',
  'Lloret de Mar',
  'Girona',
  'triathlon',
  51.5,
  'Olímpico (1.5km + 40km + 10km)',
  65.00,
  'https://example.com/triathlon-costa-brava',
  'Costa Brava Sports',
  'fallback_data',
  'https://example.com/triathlon-costa-brava',
  'triathlon-costa-brava-2025',
  'registration_open'
),
(
  'Carrera Solidaria Murcia',
  'Carrera benéfica en apoyo a organizaciones locales',
  '2025-10-12',
  'Murcia',
  'Murcia',
  'solidaria',
  5.0,
  '5 km',
  10.00,
  'https://example.com/solidaria-murcia',
  'ONG Murcia Solidaria',
  'fallback_data',
  'https://example.com/solidaria-murcia',
  'solidaria-murcia-2025',
  'registration_open'
),
(
  'Transgrancanaria HG',
  'Ultra trail por la isla de Gran Canaria, paisajes únicos',
  '2025-02-22',
  'Las Palmas',
  'Las Palmas',
  'ultra_trail',
  125.0,
  '125 km',
  120.00,
  'https://example.com/transgrancanaria',
  'Transgrancanaria Organization',
  'fallback_data',
  'https://example.com/transgrancanaria',
  'transgrancanaria-2025',
  'registration_open'
);

-- Actualizar algunas carreras con información adicional
UPDATE races 
SET 
  includes_tshirt = true,
  includes_medal = true,
  max_participants = 15000,
  autonomous_community = 'Comunidad de Madrid'
WHERE name = 'Maratón de Madrid';

UPDATE races 
SET 
  includes_tshirt = true,
  includes_medal = true,
  max_participants = 20000,
  autonomous_community = 'Comunidad Valenciana'
WHERE name = 'Media Maratón Valencia';

UPDATE races 
SET 
  includes_tshirt = false,
  includes_medal = true,
  max_participants = 800,
  autonomous_community = 'Comunidad de Madrid',
  elevation_gain = 1200
WHERE name = 'Trail Sierra de Guadarrama';

UPDATE races 
SET 
  includes_tshirt = true,
  includes_medal = false,
  max_participants = 5000,
  autonomous_community = 'Cataluña'
WHERE name = 'Carrera Popular de Barcelona';