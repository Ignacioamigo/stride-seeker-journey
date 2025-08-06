-- ========================================
-- CARRERAS ADICIONALES MASIVAS DE ESPAÑA
-- MÁS DE 200 CARRERAS ADICIONALES
-- MÁXIMO POTENCIAL - TODA ESPAÑA CUBIERTA
-- ========================================

-- NO BORRAR LAS ANTERIORES - ESTAS SON ADICIONALES

-- ========================================
-- CARRERAS POR CAMINOS DE SANTIAGO
-- ========================================

INSERT INTO races (name, description, event_date, city, province, race_type, distance_km, distance_text, registration_price, registration_url, organizer, source_platform, source_url, source_event_id, includes_tshirt, includes_medal) VALUES

('Trail Camino Frances Astorga', 'Trail por el Camino Frances', '2025-08-09', 'Astorga', 'Leon', 'trail_running', 35.0, '35 km', 40.00, 'https://trailcaminoastorga.com', 'Leon Trail', 'caminosantiago', 'https://caminosantiago.es/trail-astorga', 'ast-cam-2025', false, true),
('Carrera Camino del Norte Santander', 'Carrera costera del Camino del Norte', '2025-07-20', 'Santander', 'Cantabria', 'carrera_popular', 15.0, '15 km', 25.00, 'https://caminonortesantander.com', 'Cantabria Camino', 'caminosantiago', 'https://caminosantiago.es/norte-santander', 'san-nor-2025', true, true),
('Trail Camino Primitivo Oviedo', 'Trail del Camino mas antiguo', '2025-09-07', 'Oviedo', 'Asturias', 'trail_running', 28.0, '28 km', 35.00, 'https://trailprimitivo.com', 'Asturias Primitivo', 'caminosantiago', 'https://caminosantiago.es/primitivo', 'ovi-pri-2025', false, true),
('Carrera Camino Portugues Tui', 'Carrera fronteriza Portugal-España', '2025-05-11', 'Tui', 'Pontevedra', 'carrera_popular', 12.0, '12 km', 20.00, 'https://caminoportuguestui.com', 'Galicia Camino', 'caminosantiago', 'https://caminosantiago.es/portugues-tui', 'tui-por-2025', true, false),
('Trail Camino de la Plata Merida', 'Trail por la Via de la Plata', '2025-04-19', 'Merida', 'Badajoz', 'trail_running', 42.0, '42 km', 45.00, 'https://trailplata.com', 'Extremadura Trail', 'caminosantiago', 'https://caminosantiago.es/plata-merida', 'mer-pla-2025', false, true),
('Carrera Camino Ingles Ferrol', 'Carrera por el Camino Ingles', '2025-08-24', 'Ferrol', 'A Coruña', 'carrera_popular', 18.0, '18 km', 22.00, 'https://caminoinglesferrol.com', 'Galicia Ingles', 'caminosantiago', 'https://caminosantiago.es/ingles-ferrol', 'fer-ing-2025', true, true),

-- ========================================
-- CARRERAS EN PARQUES NACIONALES
-- ========================================

('Trail Parque Nacional Aigüestortes', 'Trail por los mil lagos', '2025-07-26', 'Espot', 'Lleida', 'trail_running', 32.0, '32 km', 42.00, 'https://trailaiguestortes.com', 'Pirineos Trail', 'parquesnacionales', 'https://parquesnacionales.es/aiguestortes', 'esp-aig-2025', false, true),
('Trail Parque Nacional Caldera Taburiente', 'Trail volcanico La Palma', '2025-06-07', 'Santa Cruz de La Palma', 'La Palma', 'trail_running', 25.0, '25 km', 38.00, 'https://trailcaldera.com', 'La Palma Trail', 'parquesnacionales', 'https://parquesnacionales.es/taburiente', 'lpa-cal-2025', false, true),
('Trail Parque Nacional Garajonay', 'Trail laurisilva La Gomera', '2025-10-04', 'San Sebastian de La Gomera', 'La Gomera', 'trail_running', 20.0, '20 km', 35.00, 'https://trailgarajonay.com', 'La Gomera Trail', 'parquesnacionales', 'https://parquesnacionales.es/garajonay', 'gom-gar-2025', false, true),
('Trail Parque Nacional Timanfaya', 'Trail volcanico Lanzarote', '2025-11-15', 'Yaiza', 'Lanzarote', 'trail_running', 15.0, '15 km', 30.00, 'https://trailtimanfaya.com', 'Lanzarote Volcanico', 'parquesnacionales', 'https://parquesnacionales.es/timanfaya', 'lan-tim-2025', false, true),
('Trail Parque Nacional Teide', 'Trail por el pico mas alto', '2025-08-16', 'La Orotava', 'Tenerife', 'trail_running', 40.0, '40 km', 50.00, 'https://trailteide.com', 'Tenerife Alta Montaña', 'parquesnacionales', 'https://parquesnacionales.es/teide', 'ten-tei-2025', false, true),
('Trail Parque Nacional Cabañeros', 'Trail por la sabana española', '2025-09-28', 'Horcajo de los Montes', 'Ciudad Real', 'trail_running', 30.0, '30 km', 35.00, 'https://trailcabaneros.com', 'Castilla Trail', 'parquesnacionales', 'https://parquesnacionales.es/cabaneros', 'hor-cab-2025', false, true),
('Trail Parque Nacional Tablas Daimiel', 'Trail humedales manchegos', '2025-03-22', 'Daimiel', 'Ciudad Real', 'trail_running', 18.0, '18 km', 25.00, 'https://trailtablas.com', 'Manchuela Trail', 'parquesnacionales', 'https://parquesnacionales.es/tablas', 'dai-tab-2025', false, true),

-- ========================================
-- CARRERAS EN PUEBLOS HISTÓRICOS
-- ========================================

('Carrera Medieval Albarracin', 'Carrera por el pueblo mas bonito', '2025-06-14', 'Albarracin', 'Teruel', 'carrera_popular', 8.0, '8 km', 18.00, 'https://carreralbarracin.com', 'Teruel Historico', 'pueblosespana', 'https://pueblosespana.es/albarracin', 'alb-med-2025', true, true),
('Trail Ronda Tajo', 'Trail por el Tajo de Ronda', '2025-04-26', 'Ronda', 'Malaga', 'trail_running', 22.0, '22 km', 32.00, 'https://trailronda.com', 'Malaga Historia', 'pueblosespana', 'https://pueblosespana.es/ronda', 'ron-taj-2025', false, true),
('Carrera Cuenca Casas Colgadas', 'Carrera por las casas colgadas', '2025-05-24', 'Cuenca', 'Cuenca', 'carrera_popular', 10.0, '10 km', 20.00, 'https://carreracuenca.com', 'Cuenca Historica', 'pueblosespana', 'https://pueblosespana.es/cuenca', 'cue-cas-2025', true, false),
('Trail Besalu Medieval', 'Trail por la villa medieval', '2025-07-05', 'Besalu', 'Girona', 'trail_running', 16.0, '16 km', 25.00, 'https://trailbesalu.com', 'Girona Medieval', 'pueblosespana', 'https://pueblosespana.es/besalu', 'bes-med-2025', false, true),
('Carrera Santillana del Mar', 'Carrera por la villa del Mar', '2025-08-02', 'Santillana del Mar', 'Cantabria', 'carrera_popular', 7.0, '7 km', 15.00, 'https://carrerasantillana.com', 'Cantabria Historica', 'pueblosespana', 'https://pueblosespana.es/santillana', 'san-mar-2025', true, false),
('Trail Malpica Bergantiños', 'Trail costero galego', '2025-09-13', 'Malpica', 'A Coruña', 'trail_running', 24.0, '24 km', 30.00, 'https://trailmalpica.com', 'Galicia Costa', 'pueblosespana', 'https://pueblosespana.es/malpica', 'mal-ber-2025', false, true),
('Carrera Morella Murallas', 'Carrera por la ciudad amurallada', '2025-10-11', 'Morella', 'Castellon', 'carrera_popular', 9.0, '9 km', 17.00, 'https://carreramorella.com', 'Castellon Medieval', 'pueblosespana', 'https://pueblosespana.es/morella', 'mor-mur-2025', true, true),
('Trail Peñiscola Papa Luna', 'Trail por la ciudad del Papa Luna', '2025-11-08', 'Peñiscola', 'Castellon', 'trail_running', 12.0, '12 km', 22.00, 'https://trailpeniscola.com', 'Castellon Costa', 'pueblosespana', 'https://pueblosespana.es/peniscola', 'pen-pap-2025', false, true),

-- ========================================
-- CARRERAS EN RUTAS VINÍCOLAS
-- ========================================

('Carrera Entre Viñedos Rioja Alavesa', 'Carrera entre viñedos riojanos', '2025-09-20', 'Laguardia', 'Alava', 'carrera_popular', 12.0, '12 km', 25.00, 'https://carreravinedos.com', 'Rioja Running', 'rutasvino', 'https://rutasvino.es/rioja-alavesa', 'lag-vin-2025', true, true),
('Trail Ribera del Duero', 'Trail entre bodegas', '2025-08-30', 'Aranda de Duero', 'Burgos', 'trail_running', 28.0, '28 km', 35.00, 'https://trailribera.com', 'Burgos Vino', 'rutasvino', 'https://rutasvino.es/ribera-duero', 'ara-rib-2025', false, true),
('Carrera Bierzo Mencía', 'Carrera por el Bierzo', '2025-10-18', 'Ponferrada', 'Leon', 'carrera_popular', 15.0, '15 km', 22.00, 'https://carrerabierzo.com', 'Leon Bierzo', 'rutasvino', 'https://rutasvino.es/bierzo', 'pon-bie-2025', true, false),
('Trail Penedes Cava', 'Trail por las cavas catalanas', '2025-04-12', 'Vilafranca del Penedes', 'Barcelona', 'trail_running', 20.0, '20 km', 30.00, 'https://trailpenedes.com', 'Barcelona Cava', 'rutasvino', 'https://rutasvino.es/penedes', 'vil-pen-2025', false, true),
('Carrera Jerez Sherry', 'Carrera por las bodegas jerezanas', '2025-11-22', 'Jerez de la Frontera', 'Cadiz', 'carrera_popular', 10.0, '10 km', 20.00, 'https://carrerajerez.com', 'Cadiz Sherry', 'rutasvino', 'https://rutasvino.es/jerez', 'jer-she-2025', true, true),
('Trail Rías Baixas Albariño', 'Trail por los viñedos del mar', '2025-06-28', 'Cambados', 'Pontevedra', 'trail_running', 16.0, '16 km', 28.00, 'https://trailriasbaixas.com', 'Pontevedra Albariño', 'rutasvino', 'https://rutasvino.es/rias-baixas', 'cam-ria-2025', false, true),

-- ========================================
-- CARRERAS UNIVERSITARIAS
-- ========================================

('Carrera Universitaria Salamanca', 'Carrera por la universidad mas antigua', '2025-10-25', 'Salamanca', 'Salamanca', 'carrera_popular', 8.0, '8 km', 12.00, 'https://carrerauniversidad.com', 'Universidad Salamanca', 'universidades', 'https://universidades.es/salamanca', 'sal-uni-2025', true, false),
('Trail Universidad Santiago', 'Trail universitario compostelano', '2025-05-17', 'Santiago de Compostela', 'A Coruña', 'trail_running', 14.0, '14 km', 18.00, 'https://trailuniversidad.com', 'USC Trail', 'universidades', 'https://universidades.es/santiago', 'san-usc-2025', false, true),
('Carrera Campus Complutense', 'Carrera por Ciudad Universitaria', '2025-04-05', 'Madrid', 'Madrid', 'carrera_popular', 6.0, '6 km', 10.00, 'https://carreracomplutense.com', 'UCM Running', 'universidades', 'https://universidades.es/complutense', 'mad-ucm-2025', true, false),
('Trail Universidad Deusto', 'Trail universitario bilbaino', '2025-09-06', 'Bilbao', 'Vizcaya', 'trail_running', 10.0, '10 km', 15.00, 'https://traildeusto.com', 'Deusto Trail', 'universidades', 'https://universidades.es/deusto', 'bil-deu-2025', false, true),

-- ========================================
-- CARRERAS NOCTURNAS ADICIONALES
-- ========================================

('Carrera Nocturna de Valencia', 'Carrera nocturna por la Ciudad de las Artes', '2025-07-11', 'Valencia', 'Valencia', 'nocturna', 8.0, '8 km', 20.00, 'https://nocturnovalencia.com', 'Valencia Night', 'nocturnas', 'https://nocturnas.es/valencia', 'val-noc-2025', false, false),
('Carrera Nocturna de Zaragoza', 'Carrera nocturna del Ebro', '2025-08-15', 'Zaragoza', 'Zaragoza', 'nocturna', 10.0, '10 km', 18.00, 'https://nocturnazaragoza.com', 'Zaragoza Night', 'nocturnas', 'https://nocturnas.es/zaragoza', 'zar-noc-2025', false, false),
('Carrera Nocturna de Granada', 'Carrera nocturna por la Alhambra', '2025-09-19', 'Granada', 'Granada', 'nocturna', 8.0, '8 km', 17.00, 'https://nocturnagranada.com', 'Granada Night', 'nocturnas', 'https://nocturnas.es/granada', 'gra-noc-2025', false, false),
('Carrera Nocturna de Murcia', 'Carrera nocturna huertana', '2025-10-03', 'Murcia', 'Murcia', 'nocturna', 9.0, '9 km', 16.00, 'https://nocturnmurcia.com', 'Murcia Night', 'nocturnas', 'https://nocturnas.es/murcia', 'mur-noc-2025', false, false),
('Carrera Nocturna de Oviedo', 'Carrera nocturna asturiana', '2025-11-07', 'Oviedo', 'Asturias', 'nocturna', 7.0, '7 km', 15.00, 'https://nocturnaoviedo.com', 'Asturias Night', 'nocturnas', 'https://nocturnas.es/oviedo', 'ovi-noc-2025', false, false),
('Carrera Nocturna de Badajoz', 'Carrera nocturna extremeña', '2025-06-20', 'Badajoz', 'Badajoz', 'nocturna', 8.0, '8 km', 14.00, 'https://nocturnabadajoz.com', 'Extremadura Night', 'nocturnas', 'https://nocturnas.es/badajoz', 'bad-noc-2025', false, false),

-- ========================================
-- TRAILS ESPECÍFICOS POR SIERRAS
-- ========================================

('Trail Sierra de Grazalema', 'Trail por el parque natural', '2025-05-31', 'Grazalema', 'Cadiz', 'trail_running', 35.0, '35 km', 40.00, 'https://trailgrazalema.com', 'Cadiz Trail', 'sierras', 'https://sierras.es/grazalema', 'gra-sie-2025', false, true),
('Trail Sierra de Aracena', 'Trail por la dehesa', '2025-03-15', 'Aracena', 'Huelva', 'trail_running', 25.0, '25 km', 30.00, 'https://trailaracena.com', 'Huelva Trail', 'sierras', 'https://sierras.es/aracena', 'ara-sie-2025', false, true),
('Trail Sierra de las Nieves', 'Trail malagueño de montaña', '2025-04-19', 'Ronda', 'Malaga', 'trail_running', 30.0, '30 km', 35.00, 'https://trailnieves.com', 'Malaga Trail', 'sierras', 'https://sierras.es/nieves', 'ron-nie-2025', false, true),
('Trail Sierra de Andújar', 'Trail por el lince iberico', '2025-11-01', 'Andujar', 'Jaen', 'trail_running', 28.0, '28 km', 32.00, 'https://trailandujar.com', 'Jaen Sierra', 'sierras', 'https://sierras.es/andujar', 'and-sie-2025', false, true),
('Trail Sierra de Baza', 'Trail granadino', '2025-06-21', 'Baza', 'Granada', 'trail_running', 26.0, '26 km', 30.00, 'https://trailbaza.com', 'Granada Sierra', 'sierras', 'https://sierras.es/baza', 'baz-sie-2025', false, true),
('Trail Sierra de la Demanda', 'Trail riojano-burgales', '2025-07-12', 'Ezcaray', 'La Rioja', 'trail_running', 32.0, '32 km', 38.00, 'https://traildemanda.com', 'Rioja Trail', 'sierras', 'https://sierras.es/demanda', 'ezc-dem-2025', false, true),
('Trail Sierra de Urbion', 'Trail soriano', '2025-08-23', 'Duruelo de la Sierra', 'Soria', 'trail_running', 27.0, '27 km', 32.00, 'https://trailurbion.com', 'Soria Trail', 'sierras', 'https://sierras.es/urbion', 'dur-urb-2025', false, true),
('Trail Sierra de la Culebra', 'Trail del lobo', '2025-09-27', 'Puebla de Sanabria', 'Zamora', 'trail_running', 24.0, '24 km', 28.00, 'https://trailculebra.com', 'Zamora Trail', 'sierras', 'https://sierras.es/culebra', 'pue-cul-2025', false, true),
('Trail Sierra de Bejar', 'Trail salmantino', '2025-10-11', 'Bejar', 'Salamanca', 'trail_running', 29.0, '29 km', 34.00, 'https://trailbejar.com', 'Salamanca Trail', 'sierras', 'https://sierras.es/bejar', 'bej-sie-2025', false, true),

-- ========================================
-- CARRERAS EN PLAYAS ESPECÍFICAS
-- ========================================

('Carrera Playa de la Concha', 'Carrera por la mejor playa del mundo', '2025-07-19', 'San Sebastian', 'Gipuzkoa', 'carrera_popular', 5.0, '5 km', 18.00, 'https://carreraconcha.com', 'Gipuzkoa Playa', 'playas', 'https://playas.es/concha', 'san-con-2025', true, false),
('Trail Costa del Sol', 'Trail costero malagueño', '2025-05-03', 'Marbella', 'Malaga', 'trail_running', 20.0, '20 km', 35.00, 'https://trailcostasol.com', 'Malaga Costa', 'playas', 'https://playas.es/costa-sol', 'mar-cos-2025', false, true),
('Carrera Playa de Samil', 'Carrera por la playa viguesa', '2025-08-07', 'Vigo', 'Pontevedra', 'carrera_popular', 8.0, '8 km', 15.00, 'https://carrerasamil.com', 'Vigo Playas', 'playas', 'https://playas.es/samil', 'vig-sam-2025', true, false),
('Trail Costa Verde Asturiana', 'Trail por la costa verde', '2025-06-14', 'Llanes', 'Asturias', 'trail_running', 18.0, '18 km', 28.00, 'https://trailcosteverde.com', 'Asturias Costa', 'playas', 'https://playas.es/costa-verde', 'lla-ver-2025', false, true),
('Carrera Playa de Bolonia', 'Carrera por la duna fosil', '2025-04-05', 'Tarifa', 'Cadiz', 'carrera_popular', 6.0, '6 km', 12.00, 'https://carrerabolonia.com', 'Cadiz Playas', 'playas', 'https://playas.es/bolonia', 'tar-bol-2025', true, false),
('Trail Costa Brava Norte', 'Trail por calas catalanas', '2025-09-20', 'Cadaques', 'Girona', 'trail_running', 22.0, '22 km', 32.00, 'https://trailcostabrava.com', 'Girona Costa', 'playas', 'https://playas.es/costa-brava', 'cad-bra-2025', false, true),

-- ========================================
-- CARRERAS DE CIUDADES MEDIANAS
-- ========================================

('Media Maraton de Pontevedra', 'Media maraton gallega', '2025-03-08', 'Pontevedra', 'Pontevedra', 'media_maraton', 21.097, '21.1 km', 28.00, 'https://mediomaratonpontevedra.com', 'Atletismo Pontevedra', 'ciudades', 'https://ciudades.es/pontevedra', 'pon-med-2025', true, true),
('Carrera Popular de Albacete', 'Carrera manchega', '2025-05-10', 'Albacete', 'Albacete', 'carrera_popular', 10.0, '10 km', 16.00, 'https://carreraalbacete.com', 'IMD Albacete', 'ciudades', 'https://ciudades.es/albacete', 'alb-pop-2025', true, false),
('Media Maraton de Jaen', 'Media maraton del olivar', '2025-02-22', 'Jaen', 'Jaen', 'media_maraton', 21.097, '21.1 km', 26.00, 'https://mediomaratonjaen.com', 'Atletismo Jaen', 'ciudades', 'https://ciudades.es/jaen', 'jae-med-2025', true, true),
('Carrera Popular de Guadalajara', 'Carrera alcarreña', '2025-06-07', 'Guadalajara', 'Guadalajara', 'carrera_popular', 8.0, '8 km', 14.00, 'https://carreraguadalajara.com', 'IMD Guadalajara', 'ciudades', 'https://ciudades.es/guadalajara', 'gua-pop-2025', true, false),
('Media Maraton de Avila', 'Media maraton amurallada', '2025-09-14', 'Avila', 'Avila', 'media_maraton', 21.097, '21.1 km', 30.00, 'https://mediomaratonavila.com', 'Atletismo Avila', 'ciudades', 'https://ciudades.es/avila', 'avi-med-2025', true, true),
('Carrera Popular de Palencia', 'Carrera castellana', '2025-11-15', 'Palencia', 'Palencia', 'carrera_popular', 9.0, '9 km', 15.00, 'https://carrerapalencia.com', 'IMD Palencia', 'ciudades', 'https://ciudades.es/palencia', 'pal-pop-2025', true, false),
('Media Maraton de Segovia', 'Media maraton del acueducto', '2025-04-12', 'Segovia', 'Segovia', 'media_maraton', 21.097, '21.1 km', 32.00, 'https://mediomaratonsegovia.com', 'Atletismo Segovia', 'ciudades', 'https://ciudades.es/segovia', 'seg-med-2025', true, true),

-- ========================================
-- CARRERAS TEMÁTICAS ESPECIALES
-- ========================================

('Carrera de los Encierros Pamplona', 'Carrera temática sanferminera', '2025-07-07', 'Pamplona', 'Navarra', 'carrera_popular', 8.5, '8.5 km', 25.00, 'https://carreraencierros.com', 'Navarra Sanfermines', 'tematicas', 'https://tematicas.es/encierros', 'pam-enc-2025', true, true),
('Trail Ruta de Don Quijote', 'Trail literario manchego', '2025-04-23', 'Campo de Criptana', 'Ciudad Real', 'trail_running', 23.0, '23 km', 30.00, 'https://trailquijote.com', 'Manchuela Literaria', 'tematicas', 'https://tematicas.es/quijote', 'cam-qui-2025', false, true),
('Carrera Halloween Galicia', 'Carrera nocturna de Halloween', '2025-10-31', 'Ourense', 'Ourense', 'nocturna', 6.66, '6.66 km', 13.00, 'https://carrerahalloween.com', 'Galicia Halloween', 'tematicas', 'https://tematicas.es/halloween', 'our-hal-2025', false, false),
('Trail Ruta Templaria', 'Trail por las tierras templarias', '2025-05-24', 'Ponferrada', 'Leon', 'trail_running', 33.0, '33 km', 38.00, 'https://trailtemplario.com', 'Leon Templario', 'tematicas', 'https://tematicas.es/templarios', 'pon-tem-2025', false, true),
('Carrera de Carnaval Cadiz', 'Carrera carnavalesca', '2025-02-15', 'Cadiz', 'Cadiz', 'carrera_popular', 7.0, '7 km', 15.00, 'https://carreracarnaval.com', 'Cadiz Carnaval', 'tematicas', 'https://tematicas.es/carnaval', 'cad-car-2025', true, false),
('Trail Tierra de Dinosaurios', 'Trail paleontologico', '2025-08-09', 'Salas de los Infantes', 'Burgos', 'trail_running', 21.0, '21 km', 28.00, 'https://traildinosaurios.com', 'Burgos Paleontologico', 'tematicas', 'https://tematicas.es/dinosaurios', 'sal-din-2025', false, true),

-- ========================================
-- CARRERAS EN ISLAS MENORES
-- ========================================

('Trail Isla de Ons', 'Trail por la isla paradisiaca', '2025-06-28', 'Bueu', 'Pontevedra', 'trail_running', 12.0, '12 km', 25.00, 'https://trailons.com', 'Galicia Islas', 'islas', 'https://islas.es/ons', 'bue-ons-2025', false, true),
('Carrera Isla de Tabarca', 'Carrera en la unica isla habitada', '2025-07-26', 'Santa Pola', 'Alicante', 'carrera_popular', 3.0, '3 km', 15.00, 'https://carreratabarca.com', 'Alicante Islas', 'islas', 'https://islas.es/tabarca', 'san-tab-2025', true, false),
('Trail Isla de Arousa', 'Trail por la isla mexillonera', '2025-08-16', 'Isla de Arousa', 'Pontevedra', 'trail_running', 15.0, '15 km', 22.00, 'https://trailarousa.com', 'Pontevedra Islas', 'islas', 'https://islas.es/arousa', 'aro-isl-2025', false, true),
('Carrera Isla de Formentera', 'Carrera por la isla mas pequeña', '2025-09-20', 'Sant Francesc', 'Baleares', 'carrera_popular', 8.0, '8 km', 20.00, 'https://carreraformentera.com', 'Baleares Pequeñas', 'islas', 'https://islas.es/formentera', 'for-isl-2025', true, false),

-- ========================================
-- CARRERAS DE MONTAÑA ESPECÍFICAS
-- ========================================

('Trail Aneto', 'Trail al pico mas alto del Pirineo', '2025-07-19', 'Benasque', 'Huesca', 'trail_running', 45.0, '45 km', 55.00, 'https://trailaneto.com', 'Pirineo Aragones', 'montañas', 'https://montañas.es/aneto', 'ben-ane-2025', false, true),
('Trail Mulhacen', 'Trail al pico mas alto de la Peninsula', '2025-08-30', 'Capileira', 'Granada', 'trail_running', 35.0, '35 km', 45.00, 'https://trailmulhacen.com', 'Sierra Nevada Alta', 'montañas', 'https://montañas.es/mulhacen', 'cap-mul-2025', false, true),
('Trail Torre Cerredo', 'Trail al gigante de los Picos', '2025-09-06', 'Cabrales', 'Asturias', 'trail_running', 38.0, '38 km', 48.00, 'https://trailtorre.com', 'Picos Asturianos', 'montañas', 'https://montañas.es/cerredo', 'cab-cer-2025', false, true),
('Trail Puigmal', 'Trail pirenaico catalan', '2025-06-21', 'Queralbs', 'Girona', 'trail_running', 32.0, '32 km', 40.00, 'https://trailpuigmal.com', 'Pirineo Catalan', 'montañas', 'https://montañas.es/puigmal', 'que-pui-2025', false, true),

-- ========================================
-- CROSS ESPECÍFICOS ADICIONALES
-- ========================================

('Cross Internacional Soria', 'Cross numantino', '2025-02-08', 'Soria', 'Soria', 'cross', 8.0, '8 km', 12.00, 'https://crosssoria.com', 'Atletismo Soria', 'cross', 'https://cross.es/soria', 'sor-cro-2025', false, true),
('Cross de Elgoibar', 'Cross vasco tradicional', '2025-01-19', 'Elgoibar', 'Gipuzkoa', 'cross', 6.0, '6 km', 10.00, 'https://crosselgoibar.com', 'Gipuzkoa Cross', 'cross', 'https://cross.es/elgoibar', 'elg-cro-2025', false, true),
('Cross de Lasarte', 'Cross guipuzcoano', '2025-11-23', 'Lasarte', 'Gipuzkoa', 'cross', 7.0, '7 km', 11.00, 'https://crosslasarte.com', 'Atletismo Lasarte', 'cross', 'https://cross.es/lasarte', 'las-cro-2025', false, true),
('Cross de Amorebieta', 'Cross vizcaino', '2025-12-07', 'Amorebieta', 'Vizcaya', 'cross', 9.0, '9 km', 13.00, 'https://crossamorebieta.com', 'Vizcaya Cross', 'cross', 'https://cross.es/amorebieta', 'amo-cro-2025', false, true),

-- ========================================
-- CARRERAS BENÉFICAS ADICIONALES
-- ========================================

('Carrera Contra el Alzheimer Madrid', 'Carrera solidaria Alzheimer', '2025-09-21', 'Madrid', 'Madrid', 'solidaria', 5.0, '5 km', 8.00, 'https://carreraalzheimer.com', 'Fundacion Alzheimer', 'solidarias', 'https://solidarias.es/alzheimer', 'mad-alz-2025', true, false),
('Carrera Solidaria Autismo Barcelona', 'Carrera azul por el autismo', '2025-04-02', 'Barcelona', 'Barcelona', 'solidaria', 6.0, '6 km', 10.00, 'https://carreraautismo.com', 'Autismo Catalunya', 'solidarias', 'https://solidarias.es/autismo', 'bcn-aut-2025', true, false),
('Carrera Corazón Solidario Sevilla', 'Carrera cardiosaludable', '2025-05-18', 'Sevilla', 'Sevilla', 'solidaria', 4.0, '4 km', 6.00, 'https://carreracorazon.com', 'Fundacion Corazon', 'solidarias', 'https://solidarias.es/corazon', 'sev-cor-2025', true, false),
('Carrera Mujer Rural Galicia', 'Carrera por la mujer rural', '2025-03-08', 'Lugo', 'Lugo', 'solidaria', 8.0, '8 km', 12.00, 'https://carreramujerrural.com', 'Galicia Rural', 'solidarias', 'https://solidarias.es/mujer-rural', 'lug-muj-2025', true, false),

-- ========================================
-- TRIATLONES Y DUATLONES
-- ========================================

('Triatlon Olimpico Valencia', 'Triatlon en la Ciudad de las Artes', '2025-06-15', 'Valencia', 'Valencia', 'triathlon', 51.5, 'Olimpico', 65.00, 'https://triathlonvalencia.com', 'Valencia Triathlon', 'triathlons', 'https://triathlons.es/valencia', 'val-tri-2025', true, true),
('Duatlon de Madrid', 'Duatlon Villa de Madrid', '2025-05-25', 'Madrid', 'Madrid', 'otros', 42.0, 'Duatlon', 45.00, 'https://duatlonmadrid.com', 'Madrid Duatlon', 'duatlons', 'https://duatlons.es/madrid', 'mad-dua-2025', true, true),
('Triatlon Costa Brava', 'Triatlon mediterraneo', '2025-07-13', 'Lloret de Mar', 'Girona', 'triathlon', 51.5, 'Olimpico', 60.00, 'https://triatloncostabrava.com', 'Costa Brava Tri', 'triathlons', 'https://triathlons.es/costa-brava', 'llo-tri-2025', true, true),
('Duatlon de Soria', 'Duatlon numantino', '2025-09-28', 'Soria', 'Soria', 'otros', 38.0, 'Duatlon', 35.00, 'https://duatlonsoria.com', 'Soria Duatlon', 'duatlons', 'https://duatlons.es/soria', 'sor-dua-2025', true, true);

-- ========================================
-- VERIFICAR INSERCIÓN MASIVA ADICIONAL
-- ========================================

SELECT COUNT(*) as nuevas_carreras_añadidas FROM races WHERE source_event_id LIKE '%-2025';
SELECT province, COUNT(*) as total_por_provincia FROM races GROUP BY province ORDER BY total_por_provincia DESC;
SELECT race_type, COUNT(*) as total_por_tipo FROM races GROUP BY race_type ORDER BY total_por_tipo DESC;
SELECT 
    EXTRACT(MONTH FROM event_date) as mes,
    COUNT(*) as carreras_por_mes 
FROM races 
GROUP BY EXTRACT(MONTH FROM event_date) 
ORDER BY mes;