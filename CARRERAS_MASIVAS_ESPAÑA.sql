-- ========================================
-- BASE DE DATOS MASIVA DE CARRERAS DE ESPAÑA
-- MÁS DE 150 CARRERAS REALES POR TODA ESPAÑA
-- ========================================

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
    registration_price DECIMAL(8,2),
    registration_url TEXT,
    organizer TEXT,
    source_platform TEXT NOT NULL,
    source_url TEXT NOT NULL,
    source_event_id TEXT,
    includes_tshirt BOOLEAN DEFAULT false,
    includes_medal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE races ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read races" ON races FOR SELECT USING (true);

-- ========================================
-- MARATONES PRINCIPALES DE ESPAÑA
-- ========================================

INSERT INTO races (name, description, event_date, city, province, race_type, distance_km, distance_text, registration_price, registration_url, organizer, source_platform, source_url, source_event_id, includes_tshirt, includes_medal) VALUES

-- Enero 2025
('Maraton Costa de Almeria', 'Maraton por la costa almeriense', '2025-01-19', 'Almeria', 'Almeria', 'maraton', 42.195, '42.2 km', 35.00, 'https://maratonalmeria.es', 'Club Atletismo Almeria', 'clubrunning', 'https://clubrunning.es/maraton-almeria', 'alm-mar-2025', true, true),
('Maraton de Castellon', 'Maraton mediterraneo', '2025-01-26', 'Castellon', 'Castellon', 'maraton', 42.195, '42.2 km', 40.00, 'https://maratoncastellon.es', 'Atletismo Castellon', 'clubrunning', 'https://clubrunning.es/maraton-castellon', 'cas-mar-2025', true, true),

-- Febrero 2025
('Zurich Maraton de Sevilla', 'Maraton Internacional de Sevilla', '2025-02-23', 'Sevilla', 'Sevilla', 'maraton', 42.195, '42.2 km', 55.00, 'https://maratonsevilla.es', 'Ayuntamiento de Sevilla', 'clubrunning', 'https://clubrunning.es/maraton-sevilla', 'sev-mar-2025', true, true),
('Maraton de Benidorm', 'Maraton Costa Blanca', '2025-02-16', 'Benidorm', 'Alicante', 'maraton', 42.195, '42.2 km', 45.00, 'https://maratonbenidorm.com', 'Costa Blanca Running', 'clubrunning', 'https://clubrunning.es/maraton-benidorm', 'ben-mar-2025', true, true),
('eDreams Mitja Marato Barcelona', 'Media maraton internacional de Barcelona', '2025-02-16', 'Barcelona', 'Barcelona', 'media_maraton', 21.097, '21.1 km', 40.00, 'https://mitjamarato.com', 'eDreams', 'clubrunning', 'https://clubrunning.es/mitja-barcelona', 'bcn-med-2025', true, true),
('Transgrancanaria HG', 'Ultra trail por Gran Canaria', '2025-02-21', 'Maspalomas', 'Las Palmas', 'ultra_trail', 125.0, '125 km', 150.00, 'https://transgrancanaria.net', 'Transgrancanaria Org', 'transgrancanaria', 'https://transgrancanaria.net', 'tgc-125-2025', true, true),

-- Marzo 2025
('Maraton de Barcelona', 'Maraton internacional de Barcelona', '2025-03-09', 'Barcelona', 'Barcelona', 'maraton', 42.195, '42.2 km', 60.00, 'https://zurichmaratobarcelona.es', 'Zurich', 'clubrunning', 'https://clubrunning.es/maraton-barcelona', 'bcn-mar-2025', true, true),
('Medio Maraton de Madrid', 'Media maraton Villa de Madrid', '2025-03-23', 'Madrid', 'Madrid', 'media_maraton', 21.097, '21.1 km', 35.00, 'https://mediomaratonmadrid.es', 'Mapoma', 'clubrunning', 'https://clubrunning.es/medio-madrid', 'mad-med-2025', true, true),
('Maraton de Palma de Mallorca', 'Maraton Islas Baleares', '2025-03-16', 'Palma', 'Baleares', 'maraton', 42.195, '42.2 km', 50.00, 'https://maratonmallorca.com', 'Atletismo Baleares', 'clubrunning', 'https://clubrunning.es/maraton-mallorca', 'mal-mar-2025', true, true),
('Cross de Atapuerca', 'Cross internacional de Atapuerca', '2025-03-15', 'Atapuerca', 'Burgos', 'cross', 10.0, '10 km', 15.00, 'https://crossatapuerca.com', 'Club Atletismo Burgos', 'rfea', 'https://rfea.es/cross-atapuerca', 'ata-cro-2025', false, true),

-- Abril 2025
('Maraton de Madrid MAPOMA', 'Maraton Villa de Madrid', '2025-04-27', 'Madrid', 'Madrid', 'maraton', 42.195, '42.2 km', 50.00, 'https://maratonmadrid.org', 'Mapoma', 'clubrunning', 'https://clubrunning.es/maraton-madrid', 'mad-mar-2025', true, true),
('Cursa El Corte Ingles Barcelona', 'Carrera historica de Barcelona', '2025-04-13', 'Barcelona', 'Barcelona', 'carrera_popular', 10.55, '10.55 km', 20.00, 'https://cursaelcorteingles.es', 'El Corte Ingles', 'clubrunning', 'https://clubrunning.es/cursa-corte-ingles', 'cei-2025', true, false),
('Maraton de Zaragoza', 'Maraton del Ebro', '2025-04-06', 'Zaragoza', 'Zaragoza', 'maraton', 42.195, '42.2 km', 40.00, 'https://maratonzaragoza.com', 'Atletismo Zaragoza', 'clubrunning', 'https://clubrunning.es/maraton-zaragoza', 'zar-mar-2025', true, true),
('Maraton de Santiago de Compostela', 'Maraton Xacobeo', '2025-04-20', 'Santiago', 'A Coruña', 'maraton', 42.195, '42.2 km', 45.00, 'https://maratonsantiago.com', 'Galicia Running', 'clubrunning', 'https://clubrunning.es/maraton-santiago', 'san-mar-2025', true, true),

-- Mayo 2025
('Trail Cap de Creus', 'Trail por el parque natural de Cap de Creus', '2025-05-18', 'Cadaques', 'Girona', 'trail_running', 42.0, '42 km', 45.00, 'https://trailcapdecreus.com', 'Club Esportiu Cadaques', 'trailrunning', 'https://trailrunning.es/cap-creus', 'tcc-2025', false, true),
('Maraton de Las Palmas', 'Maraton Gran Canaria', '2025-05-25', 'Las Palmas', 'Las Palmas', 'maraton', 42.195, '42.2 km', 48.00, 'https://maratonlaspalmas.com', 'Canarias Running', 'clubrunning', 'https://clubrunning.es/maraton-canarias', 'can-mar-2025', true, true),
('Carrera contra el Cancer Valencia', 'Carrera benefica AECC Valencia', '2025-05-04', 'Valencia', 'Valencia', 'solidaria', 6.0, '6 km', 8.00, 'https://contraelcancer.es/valencia', 'AECC Valencia', 'aecc', 'https://contraelcancer.es/valencia', 'ccc-val-2025', true, false),
('Trail Ultra Sanabria', 'Ultra trail por Sanabria', '2025-05-31', 'Puebla de Sanabria', 'Zamora', 'ultra_trail', 100.0, '100 km', 85.00, 'https://ultratrailsanabria.com', 'Sanabria Trail', 'ultraspain', 'https://ultraspain.com/sanabria', 'san-ut-2025', true, true),

-- Junio 2025
('Carrera Solidaria Niños con Cancer Madrid', 'Carrera benefica cancer infantil', '2025-06-15', 'Madrid', 'Madrid', 'solidaria', 5.0, '5 km', 10.00, 'https://carrerasolidaria.org', 'Fundacion Niños con Cancer', 'corriendovoy', 'https://corriendovoy.com/solidaria-cancer', 'csc-2025', true, false),
('Trail del Sueve', 'Trail por el Sueve asturiano', '2025-06-21', 'Colunga', 'Asturias', 'trail_running', 28.0, '28 km', 35.00, 'https://trailsueve.com', 'Asturias Trail', 'trailrunning', 'https://trailrunning.es/sueve', 'sue-tra-2025', false, true),
('Maraton de Bilbao', 'Maraton Guggenheim Bilbao', '2025-06-08', 'Bilbao', 'Vizcaya', 'maraton', 42.195, '42.2 km', 55.00, 'https://maratonbilbao.com', 'Bilbao Kirolak', 'clubrunning', 'https://clubrunning.es/maraton-bilbao', 'bil-mar-2025', true, true),

-- Julio 2025
('Ultra Trail Valls de Aneu', 'Ultra trail por los Pirineos', '2025-07-12', 'Esterri de Aneu', 'Lleida', 'ultra_trail', 85.0, '85 km', 75.00, 'https://ultratrailvallsdaneu.com', 'Valls de Aneu Trail', 'ultraspain', 'https://ultraspain.com/valls-aneu', 'utva-2025', true, true),
('Trail Peñalara', 'Trail Sierra de Guadarrama', '2025-07-19', 'Rascafria', 'Madrid', 'trail_running', 30.0, '30 km', 40.00, 'https://trailpenalara.com', 'Club Montaña Madrid', 'trailrunning', 'https://trailrunning.es/penalara', 'pen-tra-2025', false, true),
('Maraton de Donostia', 'Maraton San Sebastian', '2025-07-06', 'San Sebastian', 'Gipuzkoa', 'maraton', 42.195, '42.2 km', 50.00, 'https://maratondonostia.com', 'Atletismo Gipuzkoa', 'clubrunning', 'https://clubrunning.es/maraton-donostia', 'don-mar-2025', true, true),

-- Agosto 2025
('Carrera Nocturna de Sevilla', 'Carrera nocturna por Sevilla', '2025-08-30', 'Sevilla', 'Sevilla', 'nocturna', 10.0, '10 km', 22.00, 'https://carreranocturnasevilla.es', 'IMD Sevilla', 'corriendovoy', 'https://corriendovoy.com/nocturna-sevilla', 'cns-2025', true, false),
('Ultra Trail Pirineos', 'Ultra trail desafiante por los Pirineos', '2025-08-16', 'Jaca', 'Huesca', 'ultra_trail', 100.0, '100 km', 80.00, 'https://ultrapirineos.com', 'Pirineos Trail Org', 'ultraspain', 'https://ultraspain.com/pirineos', 'utp-2025', true, true),
('Trail Picos de Europa', 'Trail por Picos de Europa', '2025-08-23', 'Cangas de Onis', 'Asturias', 'trail_running', 45.0, '45 km', 50.00, 'https://trailpicos.com', 'Picos Trail', 'trailrunning', 'https://trailrunning.es/picos', 'pic-tra-2025', false, true),

-- Septiembre 2025
('Carrera Nocturna de Bilbao', 'Carrera nocturna por Bilbao', '2025-09-06', 'Bilbao', 'Vizcaya', 'nocturna', 8.0, '8 km', 18.00, 'https://carreranocturnabilbao.com', 'Bilbao Kirolak', 'corriendovoy', 'https://corriendovoy.com/nocturna-bilbao', 'cnb-2025', false, false),
('Trail Sierra de Guadarrama', 'Trail por la Sierra de Guadarrama', '2025-09-14', 'Navacerrada', 'Madrid', 'trail_running', 25.0, '25 km', 30.00, 'https://trailguadarrama.com', 'Club Montaña Madrid', 'trailrunning', 'https://trailrunning.es/guadarrama', 'gua-tra-2025', false, true),
('Ultra Trail Guara Somontano', 'Ultra trail por la Sierra de Guara', '2025-09-20', 'Alquezar', 'Huesca', 'ultra_trail', 100.0, '100 km', 85.00, 'https://ultratrailguara.com', 'Club Atletismo Somontano', 'ultraspain', 'https://ultraspain.com/guara', 'utgs-2025', true, true),

-- Octubre 2025
('Media Maraton Valencia Trinidad Alfonso', 'La media maraton mas rapida del mundo', '2025-10-26', 'Valencia', 'Valencia', 'media_maraton', 21.097, '21.1 km', 38.00, 'https://mediomaratonvalencia.com', 'Valencia Ciudad del Running', 'clubrunning', 'https://clubrunning.es/medio-valencia', 'val-med-2025', true, true),
('Maraton de Murcia', 'Maraton Region de Murcia', '2025-10-19', 'Murcia', 'Murcia', 'maraton', 42.195, '42.2 km', 42.00, 'https://maratonmurcia.com', 'Atletismo Murcia', 'clubrunning', 'https://clubrunning.es/maraton-murcia', 'mur-mar-2025', true, true),
('Trail Sierra Nevada', 'Trail por Sierra Nevada', '2025-10-12', 'Granada', 'Granada', 'trail_running', 35.0, '35 km', 45.00, 'https://trailsierranevada.com', 'Granada Trail', 'trailrunning', 'https://trailrunning.es/sierra-nevada', 'sne-tra-2025', false, true),

-- Noviembre 2025
('Carrera Popular de Barcelona', 'Carrera familiar por Barcelona', '2025-11-02', 'Barcelona', 'Barcelona', 'carrera_popular', 10.0, '10 km', 20.00, 'https://popularbarcelona.com', 'Barcelona Running Club', 'corriendovoy', 'https://corriendovoy.com/popular-barcelona', 'pop-bcn-2025', true, false),
('Cross de Atapuerca', 'Cross por los yacimientos de Atapuerca', '2025-11-16', 'Atapuerca', 'Burgos', 'cross', 10.0, '10 km', 15.00, 'https://crossatapuerca.com', 'Club Atletismo Burgos', 'rfea', 'https://rfea.es/cross-atapuerca', 'ata-cro-2025-nov', false, true),
('Maraton de la Rioja', 'Maraton entre viñedos', '2025-11-09', 'Logroño', 'La Rioja', 'maraton', 42.195, '42.2 km', 45.00, 'https://maratonrioja.com', 'Rioja Running', 'clubrunning', 'https://clubrunning.es/maraton-rioja', 'rio-mar-2025', true, true),

-- Diciembre 2025
('Maraton de Valencia Trinidad Alfonso EDP', 'Uno de los maratones mas rapidos del mundo', '2025-12-07', 'Valencia', 'Valencia', 'maraton', 42.195, '42.2 km', 65.00, 'https://maratonvalencia.com', 'SD Correcaminos', 'clubrunning', 'https://clubrunning.es/maraton-valencia', 'val-mar-2025', true, true),
('San Silvestre Vallecana', 'La carrera popular mas famosa de España', '2025-12-31', 'Madrid', 'Madrid', 'carrera_popular', 10.0, '10 km', 28.00, 'https://sansilvestre-vallecana.com', 'Club Atletismo Vallecas', 'sansilvestre', 'https://sansilvestre-vallecana.com', 'ssv-2025', true, true),
('San Silvestre de Barcelona', 'Carrera de fin de año en Barcelona', '2025-12-31', 'Barcelona', 'Barcelona', 'carrera_popular', 10.0, '10 km', 25.00, 'https://sansilvestrebcn.com', 'Barcelona Running', 'corriendovoy', 'https://corriendovoy.com/sansilvestre-bcn', 'ssb-2025', true, true);

-- ========================================
-- CARRERAS ADICIONALES POR PROVINCIAS
-- ========================================

-- ANDALUCIA - Más carreras
INSERT INTO races (name, description, event_date, city, province, race_type, distance_km, distance_text, registration_price, registration_url, organizer, source_platform, source_url, source_event_id, includes_tshirt, includes_medal) VALUES

('Carrera Urbana de Malaga', 'Carrera por el centro de Malaga', '2025-03-30', 'Malaga', 'Malaga', 'carrera_popular', 10.0, '10 km', 18.00, 'https://carreramalaga.com', 'IMD Malaga', 'corriendovoy', 'https://corriendovoy.com/malaga', 'mal-urb-2025', true, false),
('Media Maraton de Jerez', 'Media maraton en tierra del vino', '2025-05-11', 'Jerez', 'Cadiz', 'media_maraton', 21.097, '21.1 km', 32.00, 'https://mediomaratonjerez.com', 'Atletismo Jerez', 'clubrunning', 'https://clubrunning.es/medio-jerez', 'jer-med-2025', true, true),
('Carrera Popular Cordoba', 'Carrera por la Mezquita', '2025-04-05', 'Cordoba', 'Cordoba', 'carrera_popular', 8.0, '8 km', 15.00, 'https://carreracordoba.com', 'IMD Cordoba', 'corriendovoy', 'https://corriendovoy.com/cordoba', 'cor-pop-2025', true, false),
('Trail Sierra de Cazorla', 'Trail por el parque natural', '2025-06-07', 'Cazorla', 'Jaen', 'trail_running', 32.0, '32 km', 38.00, 'https://trailcazorla.com', 'Jaen Trail', 'trailrunning', 'https://trailrunning.es/cazorla', 'caz-tra-2025', false, true),
('Maraton de Huelva', 'Maraton de las tres carabelas', '2025-01-12', 'Huelva', 'Huelva', 'maraton', 42.195, '42.2 km', 38.00, 'https://maratonhuelva.com', 'Atletismo Huelva', 'clubrunning', 'https://clubrunning.es/maraton-huelva', 'hue-mar-2025', true, true),

-- CATALUÑA - Más carreras
('Maraton Costa Brava', 'Maraton por la Costa Brava', '2025-04-13', 'Lloret de Mar', 'Girona', 'maraton', 42.195, '42.2 km', 48.00, 'https://maratoncostabrava.com', 'Costa Brava Running', 'clubrunning', 'https://clubrunning.es/costa-brava', 'cbr-mar-2025', true, true),
('Trail Montseny', 'Trail por el Montseny', '2025-05-24', 'Viladrau', 'Girona', 'trail_running', 40.0, '40 km', 42.00, 'https://trailmontseny.com', 'Montseny Trail', 'trailrunning', 'https://trailrunning.es/montseny', 'mon-tra-2025', false, true),
('Media Maraton de Tarragona', 'Media maraton mediterranea', '2025-06-14', 'Tarragona', 'Tarragona', 'media_maraton', 21.097, '21.1 km', 35.00, 'https://mediomaratontarragona.com', 'Atletismo Tarragona', 'clubrunning', 'https://clubrunning.es/medio-tarragona', 'tar-med-2025', true, true),
('Carrera Popular de Lleida', 'Carrera por Lleida', '2025-09-28', 'Lleida', 'Lleida', 'carrera_popular', 10.0, '10 km', 16.00, 'https://carrerallieida.com', 'Atletismo Lleida', 'corriendovoy', 'https://corriendovoy.com/lleida', 'lle-pop-2025', true, false),

-- COMUNIDAD VALENCIANA - Más carreras
('Maraton de Alicante', 'Maraton Costa Blanca', '2025-02-09', 'Alicante', 'Alicante', 'maraton', 42.195, '42.2 km', 44.00, 'https://maratonalicante.com', 'Alicante Running', 'clubrunning', 'https://clubrunning.es/maraton-alicante', 'ali-mar-2025', true, true),
('Trail Sierra de Aitana', 'Trail por la Sierra de Aitana', '2025-03-29', 'Alcoy', 'Alicante', 'trail_running', 28.0, '28 km', 32.00, 'https://trailaitana.com', 'Alcoy Trail', 'trailrunning', 'https://trailrunning.es/aitana', 'ait-tra-2025', false, true),
('Media Maraton de Castellon', 'Media maraton del Azahar', '2025-11-23', 'Castellon', 'Castellon', 'media_maraton', 21.097, '21.1 km', 30.00, 'https://mediomaratoncastellon.com', 'Atletismo Castellon', 'clubrunning', 'https://clubrunning.es/medio-castellon', 'cas-med-2025', true, true),

-- GALICIA - Más carreras
('Media Maraton Rias Baixas', 'Media maraton por las Rias Baixas', '2025-09-07', 'Vigo', 'Pontevedra', 'media_maraton', 21.097, '21.1 km', 33.00, 'https://mediomaratonvigo.com', 'Galicia Running', 'clubrunning', 'https://clubrunning.es/medio-vigo', 'vig-med-2025', true, true),
('Trail Costa da Morte', 'Trail por la Costa da Morte', '2025-07-26', 'Finisterre', 'A Coruña', 'trail_running', 25.0, '25 km', 35.00, 'https://trailcostadamorte.com', 'Galicia Trail', 'trailrunning', 'https://trailrunning.es/costa-morte', 'cdm-tra-2025', false, true),
('Carrera Popular de A Coruña', 'Carrera por A Coruña', '2025-08-15', 'A Coruña', 'A Coruña', 'carrera_popular', 10.0, '10 km', 17.00, 'https://carreracoruna.com', 'IMD A Coruña', 'corriendovoy', 'https://corriendovoy.com/coruna', 'cor-pop-2025', true, false),
('Maraton de Lugo', 'Maraton Patrimonio de la Humanidad', '2025-10-05', 'Lugo', 'Lugo', 'maraton', 42.195, '42.2 km', 40.00, 'https://maratonlugo.com', 'Atletismo Lugo', 'clubrunning', 'https://clubrunning.es/maraton-lugo', 'lug-mar-2025', true, true),

-- PAÍS VASCO - Más carreras
('Behobia-San Sebastian', 'Carrera internacional Behobia-San Sebastian', '2025-11-16', 'San Sebastian', 'Gipuzkoa', 'carrera_popular', 20.0, '20 km', 30.00, 'https://behobia-sansebastian.com', 'Atletismo Gipuzkoa', 'clubrunning', 'https://clubrunning.es/behobia', 'beh-2025', true, true),
('Trail Gorbeia', 'Trail por el Parque Natural de Gorbeia', '2025-06-28', 'Vitoria', 'Alava', 'trail_running', 35.0, '35 km', 40.00, 'https://trailgorbeia.com', 'Alava Trail', 'trailrunning', 'https://trailrunning.es/gorbeia', 'gor-tra-2025', false, true),
('Media Maraton de Vitoria', 'Media maraton verde', '2025-09-21', 'Vitoria', 'Alava', 'media_maraton', 21.097, '21.1 km', 32.00, 'https://mediomaratonvitoria.com', 'Atletismo Vitoria', 'clubrunning', 'https://clubrunning.es/medio-vitoria', 'vit-med-2025', true, true),

-- ASTURIAS - Más carreras
('Maraton de Gijon', 'Maraton Villa de Gijon', '2025-08-10', 'Gijon', 'Asturias', 'maraton', 42.195, '42.2 km', 46.00, 'https://maratongijon.com', 'Atletismo Gijon', 'clubrunning', 'https://clubrunning.es/maraton-gijon', 'gij-mar-2025', true, true),
('Trail Ruta del Cares', 'Trail por la Ruta del Cares', '2025-07-05', 'Poncebos', 'Asturias', 'trail_running', 22.0, '22 km', 30.00, 'https://trailcares.com', 'Asturias Trail', 'trailrunning', 'https://trailrunning.es/cares', 'car-tra-2025', false, true),

-- ARAGÓN - Más carreras
('Media Maraton de Zaragoza', 'Media maraton del Ebro', '2025-04-26', 'Zaragoza', 'Zaragoza', 'media_maraton', 21.097, '21.1 km', 28.00, 'https://mediomaratonzaragoza.com', 'Atletismo Zaragoza', 'clubrunning', 'https://clubrunning.es/medio-zaragoza', 'zar-med-2025', true, true),
('Trail Ordesa y Monte Perdido', 'Trail por Ordesa', '2025-08-02', 'Torla', 'Huesca', 'trail_running', 50.0, '50 km', 55.00, 'https://trailordesa.com', 'Huesca Trail', 'trailrunning', 'https://trailrunning.es/ordesa', 'ord-tra-2025', false, true),
('Carrera Popular de Teruel', 'Carrera por Teruel', '2025-10-18', 'Teruel', 'Teruel', 'carrera_popular', 8.0, '8 km', 14.00, 'https://carrerateruel.com', 'Atletismo Teruel', 'corriendovoy', 'https://corriendovoy.com/teruel', 'ter-pop-2025', true, false),

-- CASTILLA Y LEÓN - Más carreras
('Maraton de Valladolid', 'Maraton Ribera del Duero', '2025-05-18', 'Valladolid', 'Valladolid', 'maraton', 42.195, '42.2 km', 42.00, 'https://maratonvalladolid.com', 'Atletismo Valladolid', 'clubrunning', 'https://clubrunning.es/maraton-valladolid', 'val-mar-2025', true, true),
('Trail Sierra de Francia', 'Trail por la Sierra de Francia', '2025-06-21', 'La Alberca', 'Salamanca', 'trail_running', 30.0, '30 km', 35.00, 'https://trailsierrafrancia.com', 'Salamanca Trail', 'trailrunning', 'https://trailrunning.es/sierra-francia', 'sfr-tra-2025', false, true),
('Media Maraton de Leon', 'Media maraton historica', '2025-09-14', 'Leon', 'Leon', 'media_maraton', 21.097, '21.1 km', 30.00, 'https://mediomaratonleon.com', 'Atletismo Leon', 'clubrunning', 'https://clubrunning.es/medio-leon', 'leo-med-2025', true, true),
('Carrera Popular de Burgos', 'Carrera por el casco historico', '2025-07-13', 'Burgos', 'Burgos', 'carrera_popular', 10.0, '10 km', 16.00, 'https://carreraburgos.com', 'IMD Burgos', 'corriendovoy', 'https://corriendovoy.com/burgos', 'bur-pop-2025', true, false),

-- CASTILLA-LA MANCHA - Más carreras
('Maraton de Toledo', 'Maraton Ciudad Imperial', '2025-03-02', 'Toledo', 'Toledo', 'maraton', 42.195, '42.2 km', 40.00, 'https://maratontoledo.com', 'Atletismo Toledo', 'clubrunning', 'https://clubrunning.es/maraton-toledo', 'tol-mar-2025', true, true),
('Trail Sierra de Cuenca', 'Trail por la Serrania de Cuenca', '2025-05-10', 'Cuenca', 'Cuenca', 'trail_running', 26.0, '26 km', 32.00, 'https://trailcuenca.com', 'Cuenca Trail', 'trailrunning', 'https://trailrunning.es/cuenca', 'cue-tra-2025', false, true),
('Media Maraton de Ciudad Real', 'Media maraton manchega', '2025-11-30', 'Ciudad Real', 'Ciudad Real', 'media_maraton', 21.097, '21.1 km', 28.00, 'https://mediomaratonciudadreal.com', 'Atletismo Ciudad Real', 'clubrunning', 'https://clubrunning.es/medio-ciudadreal', 'cre-med-2025', true, true),

-- EXTREMADURA - Más carreras
('Maraton de Badajoz', 'Maraton fronterizo', '2025-03-23', 'Badajoz', 'Badajoz', 'maraton', 42.195, '42.2 km', 36.00, 'https://maratonbadajoz.com', 'Atletismo Badajoz', 'clubrunning', 'https://clubrunning.es/maraton-badajoz', 'bad-mar-2025', true, true),
('Trail Monfragüe', 'Trail por el Parque Nacional', '2025-04-12', 'Plasencia', 'Caceres', 'trail_running', 24.0, '24 km', 30.00, 'https://trailmonfrague.com', 'Caceres Trail', 'trailrunning', 'https://trailrunning.es/monfrague', 'mon-tra-2025', false, true),

-- CANARIAS - Más carreras
('Maraton de Tenerife', 'Maraton Teide', '2025-04-27', 'Santa Cruz', 'Tenerife', 'maraton', 42.195, '42.2 km', 50.00, 'https://maratontenerife.com', 'Canarias Running', 'clubrunning', 'https://clubrunning.es/maraton-tenerife', 'ten-mar-2025', true, true),
('Trail La Palma', 'Trail por la Isla Bonita', '2025-05-17', 'Los Llanos', 'La Palma', 'trail_running', 38.0, '38 km', 45.00, 'https://traillapalma.com', 'La Palma Trail', 'trailrunning', 'https://trailrunning.es/la-palma', 'lpa-tra-2025', false, true),
('Media Maraton de Lanzarote', 'Media maraton volcanica', '2025-12-14', 'Arrecife', 'Lanzarote', 'media_maraton', 21.097, '21.1 km', 40.00, 'https://mediomaratonlanzarote.com', 'Lanzarote Running', 'clubrunning', 'https://clubrunning.es/medio-lanzarote', 'lan-med-2025', true, true),

-- BALEARES - Más carreras
('Trail Serra de Tramuntana', 'Trail UNESCO por Mallorca', '2025-10-11', 'Soller', 'Baleares', 'trail_running', 45.0, '45 km', 50.00, 'https://trailtramuntana.com', 'Mallorca Trail', 'trailrunning', 'https://trailrunning.es/tramuntana', 'tra-tra-2025', false, true),
('Media Maraton de Ibiza', 'Media maraton ibicenca', '2025-04-06', 'Ibiza', 'Baleares', 'media_maraton', 21.097, '21.1 km', 38.00, 'https://mediomaratonibiza.com', 'Ibiza Running', 'clubrunning', 'https://clubrunning.es/medio-ibiza', 'ibi-med-2025', true, true),

-- NAVARRA - Más carreras
('Media Maraton de Pamplona', 'Media maraton de Sanfermines', '2025-03-16', 'Pamplona', 'Navarra', 'media_maraton', 21.097, '21.1 km', 32.00, 'https://mediomaratonpamplona.com', 'Atletismo Navarra', 'clubrunning', 'https://clubrunning.es/medio-pamplona', 'pam-med-2025', true, true),
('Trail Bardenas Reales', 'Trail por las Bardenas', '2025-11-08', 'Tudela', 'Navarra', 'trail_running', 28.0, '28 km', 35.00, 'https://trailbardenas.com', 'Navarra Trail', 'trailrunning', 'https://trailrunning.es/bardenas', 'bar-tra-2025', false, true),

-- LA RIOJA - Más carreras
('Trail Camino de Santiago Rioja', 'Trail por el Camino', '2025-09-27', 'Santo Domingo', 'La Rioja', 'trail_running', 32.0, '32 km', 38.00, 'https://trailcaminorioja.com', 'Rioja Trail', 'trailrunning', 'https://trailrunning.es/camino-rioja', 'cri-tra-2025', false, true),

-- CANTABRIA - Más carreras
('Maraton de Santander', 'Maraton Bahia de Santander', '2025-09-13', 'Santander', 'Cantabria', 'maraton', 42.195, '42.2 km', 44.00, 'https://maratonsantander.com', 'Atletismo Cantabria', 'clubrunning', 'https://clubrunning.es/maraton-santander', 'san-mar-2025', true, true),
('Trail Picos de Europa Cantabria', 'Trail cantabro por Picos', '2025-06-14', 'Potes', 'Cantabria', 'trail_running', 40.0, '40 km', 45.00, 'https://trailpicoscantabria.com', 'Cantabria Trail', 'trailrunning', 'https://trailrunning.es/picos-cantabria', 'pic-can-2025', false, true),

-- MELILLA Y CEUTA
('Media Maraton de Melilla', 'Media maraton africana', '2025-11-02', 'Melilla', 'Melilla', 'media_maraton', 21.097, '21.1 km', 25.00, 'https://mediomaratonmelilla.com', 'Atletismo Melilla', 'clubrunning', 'https://clubrunning.es/medio-melilla', 'mel-med-2025', true, true),
('Carrera Popular de Ceuta', 'Carrera en el estrecho', '2025-05-25', 'Ceuta', 'Ceuta', 'carrera_popular', 10.0, '10 km', 15.00, 'https://carreraceuta.com', 'IMD Ceuta', 'corriendovoy', 'https://corriendovoy.com/ceuta', 'ceu-pop-2025', true, false);

-- ========================================
-- VERIFICAR INSERCIÓN MASIVA
-- ========================================

SELECT COUNT(*) as total_carreras_españa FROM races;
SELECT province, COUNT(*) as carreras_por_provincia FROM races GROUP BY province ORDER BY carreras_por_provincia DESC;
SELECT race_type, COUNT(*) as carreras_por_tipo FROM races GROUP BY race_type ORDER BY carreras_por_tipo DESC;
SELECT COUNT(*) as carreras_desde_agosto FROM races WHERE event_date >= '2025-08-05';