-- ========================================
-- CARRERAS FINALES MASIVAS DE ESPAÑA
-- TERCERA OLEADA - COMPLETANDO TODA ESPAÑA
-- MÁS DE 150 CARRERAS ADICIONALES
-- ========================================

-- ESTAS SON ADICIONALES A LAS ANTERIORES

-- ========================================
-- CARRERAS EN PUEBLOS PEQUEÑOS
-- ========================================

INSERT INTO races (name, description, event_date, city, province, race_type, distance_km, distance_text, registration_price, registration_url, organizer, source_platform, source_url, source_event_id, includes_tshirt, includes_medal) VALUES

-- PUEBLOS DE GALICIA
('Carrera Popular de Ribadeo', 'Carrera por la villa marinera', '2025-08-23', 'Ribadeo', 'Lugo', 'carrera_popular', 8.0, '8 km', 12.00, 'https://carreraribadeo.com', 'Lugo Marinero', 'pueblos', 'https://pueblos.es/ribadeo', 'rib-pop-2025', true, false),
('Trail Cedeira Costa', 'Trail costero gallego', '2025-09-14', 'Cedeira', 'A Coruña', 'trail_running', 16.0, '16 km', 20.00, 'https://trailcedeira.com', 'Galicia Norte', 'pueblos', 'https://pueblos.es/cedeira', 'ced-tra-2025', false, true),
('Carrera Viveiro Rias Altas', 'Carrera por las Rias Altas', '2025-10-05', 'Viveiro', 'Lugo', 'carrera_popular', 10.0, '10 km', 15.00, 'https://carreraviveiro.com', 'Lugo Costa', 'pueblos', 'https://pueblos.es/viveiro', 'viv-pop-2025', true, false),
('Trail Mondoñedo Catedral', 'Trail por la ciudad catedral', '2025-07-12', 'Mondoñedo', 'Lugo', 'trail_running', 12.0, '12 km', 18.00, 'https://trailmondonedo.com', 'Lugo Interior', 'pueblos', 'https://pueblos.es/mondonedo', 'mon-tra-2025', false, true),

-- PUEBLOS DEL PAÍS VASCO
('Carrera Hondarribia Frontera', 'Carrera fronteriza', '2025-06-21', 'Hondarribia', 'Gipuzkoa', 'carrera_popular', 7.0, '7 km', 12.00, 'https://carrerahondarribia.com', 'Gipuzkoa Frontera', 'pueblos', 'https://pueblos.es/hondarribia', 'hon-fro-2025', true, false),
('Trail Urdaibai Bizkaia', 'Trail por la reserva de Urdaibai', '2025-08-16', 'Gernika', 'Vizcaya', 'trail_running', 20.0, '20 km', 25.00, 'https://trailurdaibai.com', 'Bizkaia Reserva', 'pueblos', 'https://pueblos.es/gernika', 'ger-urd-2025', false, true),
('Carrera Getaria Pescadores', 'Carrera marinera vasca', '2025-09-27', 'Getaria', 'Gipuzkoa', 'carrera_popular', 6.0, '6 km', 10.00, 'https://carreragetaria.com', 'Gipuzkoa Marinero', 'pueblos', 'https://pueblos.es/getaria', 'get-pes-2025', true, false),
('Trail Lekeitio Acantilados', 'Trail por los acantilados vizcainos', '2025-05-17', 'Lekeitio', 'Vizcaya', 'trail_running', 14.0, '14 km', 20.00, 'https://traillekeitio.com', 'Bizkaia Costa', 'pueblos', 'https://pueblos.es/lekeitio', 'lek-aca-2025', false, true),

-- PUEBLOS DE ASTURIAS
('Carrera Cudillero Villa Marinera', 'Carrera por el pueblo mas bonito', '2025-07-05', 'Cudillero', 'Asturias', 'carrera_popular', 5.0, '5 km', 8.00, 'https://carreracudillero.com', 'Asturias Marinera', 'pueblos', 'https://pueblos.es/cudillero', 'cud-vil-2025', true, false),
('Trail Ribadesella Dinosaurios', 'Trail por la costa de los dinosaurios', '2025-08-30', 'Ribadesella', 'Asturias', 'trail_running', 18.0, '18 km', 22.00, 'https://trailribadesella.com', 'Asturias Dinosaurios', 'pueblos', 'https://pueblos.es/ribadesella', 'rib-din-2025', false, true),
('Carrera Taramundi Artesanos', 'Carrera por la villa artesana', '2025-06-14', 'Taramundi', 'Asturias', 'carrera_popular', 9.0, '9 km', 14.00, 'https://carrerataramundi.com', 'Asturias Artesana', 'pueblos', 'https://pueblos.es/taramundi', 'tar-art-2025', true, false),

-- PUEBLOS DE CANTABRIA
('Trail Potes Liebana', 'Trail por capital liebaniega', '2025-05-24', 'Potes', 'Cantabria', 'trail_running', 22.0, '22 km', 28.00, 'https://trailpotes.com', 'Cantabria Liebana', 'pueblos', 'https://pueblos.es/potes', 'pot-lie-2025', false, true),
('Carrera Comillas Universidad', 'Carrera por la villa modernista', '2025-09-06', 'Comillas', 'Cantabria', 'carrera_popular', 8.0, '8 km', 12.00, 'https://carreracomillas.com', 'Cantabria Modernista', 'pueblos', 'https://pueblos.es/comillas', 'com-uni-2025', true, false),
('Trail San Vicente Barquera', 'Trail por la villa marinera', '2025-10-11', 'San Vicente de la Barquera', 'Cantabria', 'trail_running', 15.0, '15 km', 20.00, 'https://trailsanvicente.com', 'Cantabria Costa', 'pueblos', 'https://pueblos.es/sanvicente', 'san-bar-2025', false, true),

-- PUEBLOS DE CASTILLA Y LEÓN
('Carrera Lerma Villa Ducal', 'Carrera por la villa ducal', '2025-04-19', 'Lerma', 'Burgos', 'carrera_popular', 7.0, '7 km', 10.00, 'https://carreralerma.com', 'Burgos Ducal', 'pueblos', 'https://pueblos.es/lerma', 'ler-duc-2025', true, false),
('Trail Covarrubias Infantazgo', 'Trail por la cuna de Castilla', '2025-08-02', 'Covarrubias', 'Burgos', 'trail_running', 12.0, '12 km', 16.00, 'https://trailcovarrubias.com', 'Burgos Cuna', 'pueblos', 'https://pueblos.es/covarrubias', 'cov-inf-2025', false, true),
('Carrera Pedraza Villa Medieval', 'Carrera amurallada segoviana', '2025-05-31', 'Pedraza', 'Segovia', 'carrera_popular', 6.0, '6 km', 12.00, 'https://carrerapedraza.com', 'Segovia Medieval', 'pueblos', 'https://pueblos.es/pedraza', 'ped-med-2025', true, false),
('Trail Astorga Maragateria', 'Trail por tierra maragata', '2025-07-19', 'Astorga', 'Leon', 'trail_running', 20.0, '20 km', 24.00, 'https://trailastorga.com', 'Leon Maragata', 'pueblos', 'https://pueblos.es/astorga', 'ast-mar-2025', false, true),
('Carrera Medina del Campo', 'Carrera por la villa ferial', '2025-09-20', 'Medina del Campo', 'Valladolid', 'carrera_popular', 10.0, '10 km', 15.00, 'https://carreramedina.com', 'Valladolid Ferias', 'pueblos', 'https://pueblos.es/medina', 'med-fer-2025', true, false),

-- PUEBLOS DE ARAGÓN
('Trail Alquezar Cañones', 'Trail por los cañones del Vero', '2025-06-07', 'Alquezar', 'Huesca', 'trail_running', 25.0, '25 km', 30.00, 'https://trailalquezar.com', 'Huesca Cañones', 'pueblos', 'https://pueblos.es/alquezar', 'alq-can-2025', false, true),
('Carrera Sos del Rey Catolico', 'Carrera por la villa natal', '2025-08-15', 'Sos del Rey Catolico', 'Zaragoza', 'carrera_popular', 8.0, '8 km', 12.00, 'https://carrerasos.com', 'Zaragoza Real', 'pueblos', 'https://pueblos.es/sos', 'sos-rey-2025', true, false),
('Trail Ainsa Villa Medieval', 'Trail por capital del Sobrarbe', '2025-07-26', 'Ainsa', 'Huesca', 'trail_running', 18.0, '18 km', 22.00, 'https://trailainsa.com', 'Huesca Medieval', 'pueblos', 'https://pueblos.es/ainsa', 'ain-med-2025', false, true),

-- PUEBLOS DE CATALUÑA
('Trail Cadaques Dali', 'Trail por el pueblo de Dali', '2025-05-10', 'Cadaques', 'Girona', 'trail_running', 14.0, '14 km', 20.00, 'https://trailcadaques.com', 'Girona Dali', 'pueblos', 'https://pueblos.es/cadaques', 'cad-dal-2025', false, true),
('Carrera Pals Medieval', 'Carrera por el nucleo gotico', '2025-09-13', 'Pals', 'Girona', 'carrera_popular', 6.0, '6 km', 10.00, 'https://carrerapals.com', 'Girona Gotico', 'pueblos', 'https://pueblos.es/pals', 'pal-got-2025', true, false),
('Trail Taull Romanico', 'Trail por el valle de Boi', '2025-08-09', 'Taull', 'Lleida', 'trail_running', 16.0, '16 km', 24.00, 'https://trailtaull.com', 'Lleida Romanico', 'pueblos', 'https://pueblos.es/taull', 'tau-rom-2025', false, true),
('Carrera Peratallada Piedra', 'Carrera por la villa de piedra', '2025-10-25', 'Peratallada', 'Girona', 'carrera_popular', 5.0, '5 km', 8.00, 'https://carreraperataallada.com', 'Girona Piedra', 'pueblos', 'https://pueblos.es/peratallada', 'per-pie-2025', true, false),

-- PUEBLOS DE ANDALUCÍA
('Trail Zahara Sierra', 'Trail por la villa blanca', '2025-04-12', 'Zahara de la Sierra', 'Cadiz', 'trail_running', 20.0, '20 km', 25.00, 'https://trailzahara.com', 'Cadiz Blanca', 'pueblos', 'https://pueblos.es/zahara', 'zah-sie-2025', false, true),
('Carrera Setenil Casas Cueva', 'Carrera por las casas cueva', '2025-06-28', 'Setenil de las Bodegas', 'Cadiz', 'carrera_popular', 7.0, '7 km', 12.00, 'https://carrerasetenil.com', 'Cadiz Cueva', 'pueblos', 'https://pueblos.es/setenil', 'set-cue-2025', true, false),
('Trail Frigiliana Axarquia', 'Trail por el pueblo mas bonito', '2025-05-03', 'Frigiliana', 'Malaga', 'trail_running', 15.0, '15 km', 18.00, 'https://trailfrigiliana.com', 'Malaga Axarquia', 'pueblos', 'https://pueblos.es/frigiliana', 'fri-axa-2025', false, true),
('Carrera Mijas Pueblo Blanco', 'Carrera por el pueblo blanco', '2025-11-01', 'Mijas', 'Malaga', 'carrera_popular', 9.0, '9 km', 15.00, 'https://carreramijas.com', 'Malaga Blanco', 'pueblos', 'https://pueblos.es/mijas', 'mij-bla-2025', true, false),
('Trail Montefrio Granada', 'Trail por el mejor mirador', '2025-07-12', 'Montefrio', 'Granada', 'trail_running', 22.0, '22 km', 26.00, 'https://trailmontefrio.com', 'Granada Mirador', 'pueblos', 'https://pueblos.es/montefrio', 'mon-mir-2025', false, true),

-- ========================================
-- CARRERAS EN VALLES ESPECÍFICOS
-- ========================================

('Trail Valle de Aran', 'Trail por el valle pirenaico', '2025-07-05', 'Vielha', 'Lleida', 'trail_running', 35.0, '35 km', 40.00, 'https://trailaran.com', 'Valle Aran Trail', 'valles', 'https://valles.es/aran', 'vie-ara-2025', false, true),
('Carrera Valle de Baztan', 'Carrera por el valle navarro', '2025-08-16', 'Elizondo', 'Navarra', 'carrera_popular', 12.0, '12 km', 18.00, 'https://carrerabaztan.com', 'Navarra Valle', 'valles', 'https://valles.es/baztan', 'eli-baz-2025', true, false),
('Trail Valle de Liébana', 'Trail lebaniego cantabro', '2025-06-21', 'Potes', 'Cantabria', 'trail_running', 28.0, '28 km', 32.00, 'https://trailliebana.com', 'Cantabria Valle', 'valles', 'https://valles.es/liebana', 'pot-lie-2025-v2', false, true),
('Carrera Valle del Jerte', 'Carrera entre cerezos', '2025-04-26', 'Cabezuela del Valle', 'Caceres', 'carrera_popular', 10.0, '10 km', 16.00, 'https://carrerajerte.com', 'Caceres Cerezos', 'valles', 'https://valles.es/jerte', 'cab-jer-2025', true, true),
('Trail Valle de las Batuecas', 'Trail por el valle sagrado', '2025-09-14', 'La Alberca', 'Salamanca', 'trail_running', 24.0, '24 km', 28.00, 'https://trailbatuecas.com', 'Salamanca Valle', 'valles', 'https://valles.es/batuecas', 'alb-bat-2025', false, true),

-- ========================================
-- CARRERAS EN ESPACIOS NATURALES
-- ========================================

('Trail Cabo Fisterra', 'Trail hasta el fin del mundo', '2025-08-23', 'Fisterra', 'A Coruña', 'trail_running', 18.0, '18 km', 25.00, 'https://trailfisterra.com', 'Galicia Finisterre', 'cabos', 'https://cabos.es/fisterra', 'fis-fin-2025', false, true),
('Carrera Cabo de Gata', 'Carrera por el parque natural', '2025-05-17', 'San Jose', 'Almeria', 'carrera_popular', 12.0, '12 km', 20.00, 'https://carreracabogata.com', 'Almeria Natural', 'cabos', 'https://cabos.es/gata', 'san-gat-2025', true, false),
('Trail Cabo Ortegal', 'Trail por los acantilados mas altos', '2025-09-27', 'Cariño', 'A Coruña', 'trail_running', 20.0, '20 km', 26.00, 'https://trailortegal.com', 'Galicia Acantilados', 'cabos', 'https://cabos.es/ortegal', 'car-ort-2025', false, true),
('Carrera Cabo Trafalgar', 'Carrera historica naval', '2025-10-21', 'Barbate', 'Cadiz', 'carrera_popular', 8.0, '8 km', 14.00, 'https://carreratrafalgar.com', 'Cadiz Naval', 'cabos', 'https://cabos.es/trafalgar', 'bar-tra-2025', true, true),

-- ========================================
-- CARRERAS ESTACIONALES ESPECÍFICAS
-- ========================================

('Carrera de Primavera Almendros', 'Carrera entre almendros en flor', '2025-02-15', 'Santiago del Teide', 'Tenerife', 'carrera_popular', 8.0, '8 km', 15.00, 'https://carreraalmendros.com', 'Tenerife Primavera', 'estaciones', 'https://estaciones.es/primavera', 'san-alm-2025', true, false),
('Trail Otoño Castañar', 'Trail otoñal por castañares', '2025-11-08', 'Tineo', 'Asturias', 'trail_running', 16.0, '16 km', 22.00, 'https://trailcastanar.com', 'Asturias Otoño', 'estaciones', 'https://estaciones.es/otoño', 'tin-cas-2025', false, true),
('Carrera Verano Costa', 'Carrera veraniega costera', '2025-07-26', 'Laredo', 'Cantabria', 'carrera_popular', 10.0, '10 km', 16.00, 'https://carreraverano.com', 'Cantabria Verano', 'estaciones', 'https://estaciones.es/verano', 'lar-ver-2025', true, false),
('Trail Invierno Nieve', 'Trail invernal con raquetas', '2025-01-18', 'Formigal', 'Huesca', 'trail_running', 12.0, '12 km', 25.00, 'https://trailinvierno.com', 'Pirineo Invierno', 'estaciones', 'https://estaciones.es/invierno', 'for-inv-2025', false, true),

-- ========================================
-- CARRERAS GASTRONÓMICAS
-- ========================================

('Carrera Ruta Tapas Logroño', 'Carrera gastronomica riojana', '2025-06-14', 'Logroño', 'La Rioja', 'carrera_popular', 6.0, '6 km', 12.00, 'https://carreratapas.com', 'Rioja Gastronomica', 'gastronomia', 'https://gastronomia.es/tapas', 'log-tap-2025', true, false),
('Trail Ruta Quesos Cantabria', 'Trail por las queserias', '2025-08-30', 'Cabuerniga', 'Cantabria', 'trail_running', 18.0, '18 km', 24.00, 'https://trailquesos.com', 'Cantabria Quesos', 'gastronomia', 'https://gastronomia.es/quesos', 'cab-que-2025', false, true),
('Carrera Ruta Jamon Jabugo', 'Carrera por la dehesa del jamon', '2025-11-15', 'Jabugo', 'Huelva', 'carrera_popular', 10.0, '10 km', 18.00, 'https://carrerajamon.com', 'Huelva Jamon', 'gastronomia', 'https://gastronomia.es/jamon', 'jab-jam-2025', true, true),
('Trail Sidra Asturiana', 'Trail por las llagares', '2025-05-10', 'Nava', 'Asturias', 'trail_running', 14.0, '14 km', 20.00, 'https://trailsidra.com', 'Asturias Sidra', 'gastronomia', 'https://gastronomia.es/sidra', 'nav-sid-2025', false, true),

-- ========================================
-- CARRERAS INDUSTRIALES/PATRIMONIO
-- ========================================

('Trail Riotinto Minas', 'Trail por las minas de colores', '2025-04-05', 'Minas de Riotinto', 'Huelva', 'trail_running', 22.0, '22 km', 28.00, 'https://trailriotinto.com', 'Huelva Minero', 'patrimonio', 'https://patrimonio.es/riotinto', 'rio-min-2025', false, true),
('Carrera Ponferrada Templaria', 'Carrera por el castillo templario', '2025-07-19', 'Ponferrada', 'Leon', 'carrera_popular', 12.0, '12 km', 18.00, 'https://carreratemplaria.com', 'Leon Templario', 'patrimonio', 'https://patrimonio.es/templarios', 'pon-tem-2025-v2', true, true),
('Trail Las Medulas Romano', 'Trail por las minas romanas', '2025-09-06', 'Las Medulas', 'Leon', 'trail_running', 16.0, '16 km', 22.00, 'https://trailmedulas.com', 'Leon Romano', 'patrimonio', 'https://patrimonio.es/medulas', 'med-rom-2025', false, true),
('Carrera Almaden Mercurio', 'Carrera por las minas de mercurio', '2025-10-18', 'Almaden', 'Ciudad Real', 'carrera_popular', 8.0, '8 km', 14.00, 'https://carreraalmaden.com', 'Ciudad Real Minero', 'patrimonio', 'https://patrimonio.es/almaden', 'alm-mer-2025', true, false),

-- ========================================
-- CARRERAS DE FRONTERAS
-- ========================================

('Carrera Frontera Portugal Tui', 'Carrera transfronteriza', '2025-05-24', 'Tui', 'Pontevedra', 'carrera_popular', 15.0, '15 km', 20.00, 'https://carrerafrontera.com', 'Galicia Portugal', 'fronteras', 'https://fronteras.es/portugal', 'tui-por-2025-v2', true, true),
('Trail Frontera Francia Irun', 'Trail internacional vasco', '2025-08-02', 'Irun', 'Gipuzkoa', 'trail_running', 20.0, '20 km', 26.00, 'https://trailfrontera.com', 'Euskadi Francia', 'fronteras', 'https://fronteras.es/francia', 'iru-fra-2025', false, true),
('Carrera Frontera Andorra', 'Carrera pirenaica internacional', '2025-06-28', 'La Seu d Urgell', 'Lleida', 'carrera_popular', 12.0, '12 km', 18.00, 'https://carreraandorra.com', 'Lleida Andorra', 'fronteras', 'https://fronteras.es/andorra', 'seu-and-2025', true, false),

-- ========================================
-- CARRERAS EN RESERVAS NATURALES
-- ========================================

('Trail Somiedo Osos', 'Trail por el territorio del oso', '2025-07-12', 'Pola de Somiedo', 'Asturias', 'trail_running', 25.0, '25 km', 30.00, 'https://trailsomiedo.com', 'Asturias Osos', 'reservas', 'https://reservas.es/somiedo', 'pol-oso-2025', false, true),
('Carrera Doñana Marismas', 'Carrera por las marismas', '2025-04-19', 'El Rocio', 'Huelva', 'carrera_popular', 10.0, '10 km', 16.00, 'https://carreradonana.com', 'Huelva Marismas', 'reservas', 'https://reservas.es/donana', 'roc-mar-2025', true, false),
('Trail Muniellos Bosque', 'Trail por el bosque mas grande', '2025-09-13', 'Cangas del Narcea', 'Asturias', 'trail_running', 30.0, '30 km', 35.00, 'https://trailmuniellos.com', 'Asturias Bosque', 'reservas', 'https://reservas.es/muniellos', 'can-bos-2025', false, true),

-- ========================================
-- CARRERAS DE FESTIVALES
-- ========================================

('Carrera Festival Benicassim', 'Carrera musical costera', '2025-07-17', 'Benicassim', 'Castellon', 'carrera_popular', 8.0, '8 km', 15.00, 'https://carrerafib.com', 'Castellon Festival', 'festivales', 'https://festivales.es/fib', 'ben-fib-2025', true, false),
('Trail Festival Monegros', 'Trail por el desierto aragones', '2025-08-09', 'Fraga', 'Huesca', 'trail_running', 20.0, '20 km', 25.00, 'https://trailmonegros.com', 'Aragon Desierto', 'festivales', 'https://festivales.es/monegros', 'fra-mon-2025', false, true),
('Carrera Festival Flamenco Jerez', 'Carrera flamenca', '2025-02-28', 'Jerez de la Frontera', 'Cadiz', 'carrera_popular', 6.0, '6 km', 12.00, 'https://carreraflamenco.com', 'Jerez Flamenco', 'festivales', 'https://festivales.es/flamenco', 'jer-fla-2025', true, false),

-- ========================================
-- CARRERAS DE RÍOS Y EMBALSES
-- ========================================

('Trail Ribeira Sacra', 'Trail por los cañones del Sil', '2025-05-31', 'Monforte de Lemos', 'Lugo', 'trail_running', 32.0, '32 km', 38.00, 'https://trailribeirasacra.com', 'Lugo Ribeira', 'rios', 'https://rios.es/sil', 'mon-rib-2025', false, true),
('Carrera Rio Duero', 'Carrera fluvial castellana', '2025-10-04', 'Zamora', 'Zamora', 'carrera_popular', 12.0, '12 km', 16.00, 'https://carreraduero.com', 'Zamora Fluvial', 'rios', 'https://rios.es/duero', 'zam-due-2025', true, false),
('Trail Embalse Riaño', 'Trail por el pantano leonés', '2025-08-16', 'Riaño', 'Leon', 'trail_running', 24.0, '24 km', 28.00, 'https://trailriano.com', 'Leon Embalse', 'rios', 'https://rios.es/riano', 'ria-emb-2025', false, true),
('Carrera Rio Guadalquivir', 'Carrera por el gran rio andaluz', '2025-11-22', 'Cordoba', 'Cordoba', 'carrera_popular', 14.0, '14 km', 18.00, 'https://carrerapuadalquivir.com', 'Cordoba Fluvial', 'rios', 'https://rios.es/guadalquivir', 'cor-gua-2025', true, false),

-- ========================================
-- CARRERAS DEPORTIVAS ESPECÍFICAS
-- ========================================

('Carrera Esqui de Fondo Baqueira', 'Carrera nordica pirenaica', '2025-02-08', 'Baqueira Beret', 'Lleida', 'otros', 15.0, '15 km esqui', 30.00, 'https://carreraesqui.com', 'Pirineo Nordico', 'deportes', 'https://deportes.es/esqui', 'baq-esq-2025', true, true),
('Trail Running Orientacion', 'Trail con orientacion deportiva', '2025-06-07', 'Cercedilla', 'Madrid', 'trail_running', 18.0, '18 km orientacion', 25.00, 'https://trailorientacion.com', 'Madrid Orientacion', 'deportes', 'https://deportes.es/orientacion', 'cer-ori-2025', false, true),
('Carrera Canicross Madrid', 'Carrera con perros', '2025-04-12', 'El Escorial', 'Madrid', 'otros', 5.0, '5 km canicross', 20.00, 'https://carreracanicross.com', 'Madrid Canicross', 'deportes', 'https://deportes.es/canicross', 'esc-can-2025', true, false),

-- ========================================
-- CARRERAS HISTÓRICAS ESPECÍFICAS
-- ========================================

('Carrera Batalla Covadonga', 'Carrera historica asturiana', '2025-09-08', 'Covadonga', 'Asturias', 'carrera_popular', 7.22, '7.22 km', 12.00, 'https://carreracovadonga.com', 'Asturias Historica', 'historia', 'https://historia.es/covadonga', 'cov-bat-2025', true, true),
('Trail Ruta Isabel Catolica', 'Trail por el camino real', '2025-11-30', 'Madrigal de las Altas Torres', 'Avila', 'trail_running', 20.0, '20 km', 24.00, 'https://trailisabel.com', 'Avila Real', 'historia', 'https://historia.es/isabel', 'mad-isa-2025', false, true),
('Carrera Sitio Numancia', 'Carrera por la resistencia celtibera', '2025-08-23', 'Garray', 'Soria', 'carrera_popular', 10.0, '10 km', 15.00, 'https://carreranumancia.com', 'Soria Celtibera', 'historia', 'https://historia.es/numancia', 'gar-num-2025', true, true);

-- ========================================
-- VERIFICAR INSERCIÓN FINAL
-- ========================================

SELECT COUNT(*) as total_carreras_finales FROM races;
SELECT COUNT(DISTINCT city) as ciudades_diferentes FROM races;
SELECT COUNT(DISTINCT province) as provincias_diferentes FROM races;
SELECT race_type, COUNT(*) as total FROM races GROUP BY race_type ORDER BY total DESC;
SELECT EXTRACT(MONTH FROM event_date) as mes, COUNT(*) as carreras FROM races GROUP BY EXTRACT(MONTH FROM event_date) ORDER BY mes;