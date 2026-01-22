#!/usr/bin/env tsx

/**
 * Script para añadir 300 carreras NUEVAS y DIFERENTES para 2026
 * Ejecutar: npx tsx scripts/add-300-new-races-2026.ts
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const SUPABASE_URL = "https://uprohtkbghujvjwjnqyv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcm9odGtiZ2h1anZqd2pucXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA1NzAsImV4cCI6MjA2MzM0NjU3MH0.WQQ0jxNacORbXNZhMg_H5pW1g-VUJ8tiEiv44VBnnX4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Provincias y ciudades adicionales de España (diferentes a las existentes)
interface Location {
  city: string;
  province: string;
  community: string;
}

const SPANISH_LOCATIONS: Location[] = [
  // Andalucía - ciudades adicionales
  { city: 'Roquetas de Mar', province: 'Almería', community: 'Andalucía' },
  { city: 'El Ejido', province: 'Almería', community: 'Andalucía' },
  { city: 'Linares', province: 'Jaén', community: 'Andalucía' },
  { city: 'Úbeda', province: 'Jaén', community: 'Andalucía' },
  { city: 'Baeza', province: 'Jaén', community: 'Andalucía' },
  { city: 'Antequera', province: 'Málaga', community: 'Andalucía' },
  { city: 'Ronda', province: 'Málaga', community: 'Andalucía' },
  { city: 'Estepona', province: 'Málaga', community: 'Andalucía' },
  { city: 'Vélez-Málaga', province: 'Málaga', community: 'Andalucía' },
  { city: 'Écija', province: 'Sevilla', community: 'Andalucía' },
  { city: 'Carmona', province: 'Sevilla', community: 'Andalucía' },
  { city: 'Sanlúcar de Barrameda', province: 'Cádiz', community: 'Andalucía' },
  { city: 'Arcos de la Frontera', province: 'Cádiz', community: 'Andalucía' },
  { city: 'Guadix', province: 'Granada', community: 'Andalucía' },
  { city: 'Loja', province: 'Granada', community: 'Andalucía' },
  { city: 'Cabra', province: 'Córdoba', community: 'Andalucía' },
  { city: 'Montoro', province: 'Córdoba', community: 'Andalucía' },
  { city: 'Lepe', province: 'Huelva', community: 'Andalucía' },
  { city: 'Ayamonte', province: 'Huelva', community: 'Andalucía' },
  
  // Aragón
  { city: 'Teruel', province: 'Teruel', community: 'Aragón' },
  { city: 'Alcañiz', province: 'Teruel', community: 'Aragón' },
  { city: 'Barbastro', province: 'Huesca', community: 'Aragón' },
  { city: 'Monzón', province: 'Huesca', community: 'Aragón' },
  { city: 'Fraga', province: 'Huesca', community: 'Aragón' },
  
  // Asturias
  { city: 'Llanes', province: 'Asturias', community: 'Principado de Asturias' },
  { city: 'Cangas de Onís', province: 'Asturias', community: 'Principado de Asturias' },
  { city: 'Villaviciosa', province: 'Asturias', community: 'Principado de Asturias' },
  { city: 'Navia', province: 'Asturias', community: 'Principado de Asturias' },
  
  // Baleares
  { city: 'Ibiza', province: 'Baleares', community: 'Islas Baleares' },
  { city: 'Mahón', province: 'Baleares', community: 'Islas Baleares' },
  { city: 'Ciudadela', province: 'Baleares', community: 'Islas Baleares' },
  { city: 'Sóller', province: 'Baleares', community: 'Islas Baleares' },
  { city: 'Pollença', province: 'Baleares', community: 'Islas Baleares' },
  
  // Canarias
  { city: 'Puerto del Rosario', province: 'Las Palmas', community: 'Canarias' },
  { city: 'Arrecife', province: 'Las Palmas', community: 'Canarias' },
  { city: 'Puerto de la Cruz', province: 'Tenerife', community: 'Canarias' },
  { city: 'Los Cristianos', province: 'Tenerife', community: 'Canarias' },
  { city: 'La Orotava', province: 'Tenerife', community: 'Canarias' },
  { city: 'Güímar', province: 'Tenerife', community: 'Canarias' },
  
  // Cantabria
  { city: 'Reinosa', province: 'Cantabria', community: 'Cantabria' },
  { city: 'Santoña', province: 'Cantabria', community: 'Cantabria' },
  { city: 'Suances', province: 'Cantabria', community: 'Cantabria' },
  { city: 'Comillas', province: 'Cantabria', community: 'Cantabria' },
  
  // Castilla-La Mancha
  { city: 'Puertollano', province: 'Ciudad Real', community: 'Castilla-La Mancha' },
  { city: 'Tomelloso', province: 'Ciudad Real', community: 'Castilla-La Mancha' },
  { city: 'Alcázar de San Juan', province: 'Ciudad Real', community: 'Castilla-La Mancha' },
  { city: 'Hellín', province: 'Albacete', community: 'Castilla-La Mancha' },
  { city: 'Villarrobledo', province: 'Albacete', community: 'Castilla-La Mancha' },
  { city: 'Almansa', province: 'Albacete', community: 'Castilla-La Mancha' },
  { city: 'Tarancón', province: 'Cuenca', community: 'Castilla-La Mancha' },
  { city: 'Sigüenza', province: 'Guadalajara', community: 'Castilla-La Mancha' },
  
  // Castilla y León
  { city: 'Aranda de Duero', province: 'Burgos', community: 'Castilla y León' },
  { city: 'Miranda de Ebro', province: 'Burgos', community: 'Castilla y León' },
  { city: 'Medina del Campo', province: 'Valladolid', community: 'Castilla y León' },
  { city: 'Benavente', province: 'Zamora', community: 'Castilla y León' },
  { city: 'Toro', province: 'Zamora', community: 'Castilla y León' },
  { city: 'Béjar', province: 'Salamanca', community: 'Castilla y León' },
  { city: 'Ciudad Rodrigo', province: 'Salamanca', community: 'Castilla y León' },
  { city: 'El Espinar', province: 'Segovia', community: 'Castilla y León' },
  { city: 'Cuéllar', province: 'Segovia', community: 'Castilla y León' },
  { city: 'Arévalo', province: 'Ávila', community: 'Castilla y León' },
  { city: 'El Barco de Ávila', province: 'Ávila', community: 'Castilla y León' },
  { city: 'Sahagún', province: 'León', community: 'Castilla y León' },
  { city: 'La Bañeza', province: 'León', community: 'Castilla y León' },
  { city: 'El Burgo de Osma', province: 'Soria', community: 'Castilla y León' },
  { city: 'Aguilar de Campoo', province: 'Palencia', community: 'Castilla y León' },
  
  // Cataluña
  { city: 'Vic', province: 'Barcelona', community: 'Cataluña' },
  { city: 'Manresa', province: 'Barcelona', community: 'Cataluña' },
  { city: 'Igualada', province: 'Barcelona', community: 'Cataluña' },
  { city: 'Vilafranca del Penedès', province: 'Barcelona', community: 'Cataluña' },
  { city: 'Sitges', province: 'Barcelona', community: 'Cataluña' },
  { city: 'Blanes', province: 'Girona', community: 'Cataluña' },
  { city: 'Figueres', province: 'Girona', community: 'Cataluña' },
  { city: 'Olot', province: 'Girona', community: 'Cataluña' },
  { city: 'Palafrugell', province: 'Girona', community: 'Cataluña' },
  { city: 'Reus', province: 'Tarragona', community: 'Cataluña' },
  { city: 'Tortosa', province: 'Tarragona', community: 'Cataluña' },
  { city: 'Cambrils', province: 'Tarragona', community: 'Cataluña' },
  { city: 'Valls', province: 'Tarragona', community: 'Cataluña' },
  { city: 'Balaguer', province: 'Lleida', community: 'Cataluña' },
  { city: 'Tàrrega', province: 'Lleida', community: 'Cataluña' },
  { city: 'La Seu d\'Urgell', province: 'Lleida', community: 'Cataluña' },
  
  // Comunidad Valenciana
  { city: 'Castellón de la Plana', province: 'Castellón', community: 'Comunidad Valenciana' },
  { city: 'Villarreal', province: 'Castellón', community: 'Comunidad Valenciana' },
  { city: 'Burriana', province: 'Castellón', community: 'Comunidad Valenciana' },
  { city: 'Vinaròs', province: 'Castellón', community: 'Comunidad Valenciana' },
  { city: 'Peñíscola', province: 'Castellón', community: 'Comunidad Valenciana' },
  { city: 'Dénia', province: 'Alicante', community: 'Comunidad Valenciana' },
  { city: 'Jávea', province: 'Alicante', community: 'Comunidad Valenciana' },
  { city: 'Calpe', province: 'Alicante', community: 'Comunidad Valenciana' },
  { city: 'Altea', province: 'Alicante', community: 'Comunidad Valenciana' },
  { city: 'Villena', province: 'Alicante', community: 'Comunidad Valenciana' },
  { city: 'Novelda', province: 'Alicante', community: 'Comunidad Valenciana' },
  { city: 'Requena', province: 'Valencia', community: 'Comunidad Valenciana' },
  { city: 'Ontinyent', province: 'Valencia', community: 'Comunidad Valenciana' },
  { city: 'Sueca', province: 'Valencia', community: 'Comunidad Valenciana' },
  
  // Extremadura
  { city: 'Plasencia', province: 'Cáceres', community: 'Extremadura' },
  { city: 'Navalmoral de la Mata', province: 'Cáceres', community: 'Extremadura' },
  { city: 'Trujillo', province: 'Cáceres', community: 'Extremadura' },
  { city: 'Don Benito', province: 'Badajoz', community: 'Extremadura' },
  { city: 'Villanueva de la Serena', province: 'Badajoz', community: 'Extremadura' },
  { city: 'Almendralejo', province: 'Badajoz', community: 'Extremadura' },
  { city: 'Zafra', province: 'Badajoz', community: 'Extremadura' },
  
  // Galicia
  { city: 'Ourense', province: 'Ourense', community: 'Galicia' },
  { city: 'Ribadavia', province: 'Ourense', community: 'Galicia' },
  { city: 'Verín', province: 'Ourense', community: 'Galicia' },
  { city: 'Monforte de Lemos', province: 'Lugo', community: 'Galicia' },
  { city: 'Viveiro', province: 'Lugo', community: 'Galicia' },
  { city: 'Ribadeo', province: 'Lugo', community: 'Galicia' },
  { city: 'Vigo', province: 'Pontevedra', community: 'Galicia' },
  { city: 'Marín', province: 'Pontevedra', community: 'Galicia' },
  { city: 'Cangas', province: 'Pontevedra', community: 'Galicia' },
  { city: 'Sanxenxo', province: 'Pontevedra', community: 'Galicia' },
  { city: 'Cambados', province: 'Pontevedra', community: 'Galicia' },
  { city: 'Betanzos', province: 'A Coruña', community: 'Galicia' },
  { city: 'Carballo', province: 'A Coruña', community: 'Galicia' },
  { city: 'Ribeira', province: 'A Coruña', community: 'Galicia' },
  
  // La Rioja
  { city: 'Calahorra', province: 'La Rioja', community: 'La Rioja' },
  { city: 'Arnedo', province: 'La Rioja', community: 'La Rioja' },
  { city: 'Haro', province: 'La Rioja', community: 'La Rioja' },
  { city: 'Nájera', province: 'La Rioja', community: 'La Rioja' },
  { city: 'Santo Domingo de la Calzada', province: 'La Rioja', community: 'La Rioja' },
  
  // Madrid
  { city: 'Aranjuez', province: 'Madrid', community: 'Comunidad de Madrid' },
  { city: 'San Lorenzo de El Escorial', province: 'Madrid', community: 'Comunidad de Madrid' },
  { city: 'Collado Villalba', province: 'Madrid', community: 'Comunidad de Madrid' },
  { city: 'Majadahonda', province: 'Madrid', community: 'Comunidad de Madrid' },
  { city: 'Las Rozas', province: 'Madrid', community: 'Comunidad de Madrid' },
  { city: 'Pozuelo de Alarcón', province: 'Madrid', community: 'Comunidad de Madrid' },
  { city: 'Boadilla del Monte', province: 'Madrid', community: 'Comunidad de Madrid' },
  { city: 'Tres Cantos', province: 'Madrid', community: 'Comunidad de Madrid' },
  { city: 'San Sebastián de los Reyes', province: 'Madrid', community: 'Comunidad de Madrid' },
  { city: 'Alcobendas', province: 'Madrid', community: 'Comunidad de Madrid' },
  { city: 'Torrejón de Ardoz', province: 'Madrid', community: 'Comunidad de Madrid' },
  { city: 'Coslada', province: 'Madrid', community: 'Comunidad de Madrid' },
  { city: 'Rivas-Vaciamadrid', province: 'Madrid', community: 'Comunidad de Madrid' },
  { city: 'Arganda del Rey', province: 'Madrid', community: 'Comunidad de Madrid' },
  { city: 'Pinto', province: 'Madrid', community: 'Comunidad de Madrid' },
  { city: 'Valdemoro', province: 'Madrid', community: 'Comunidad de Madrid' },
  { city: 'Parla', province: 'Madrid', community: 'Comunidad de Madrid' },
  { city: 'Navalcarnero', province: 'Madrid', community: 'Comunidad de Madrid' },
  
  // Murcia
  { city: 'Yecla', province: 'Murcia', community: 'Región de Murcia' },
  { city: 'Jumilla', province: 'Murcia', community: 'Región de Murcia' },
  { city: 'Cieza', province: 'Murcia', community: 'Región de Murcia' },
  { city: 'Totana', province: 'Murcia', community: 'Región de Murcia' },
  { city: 'Mazarrón', province: 'Murcia', community: 'Región de Murcia' },
  { city: 'San Javier', province: 'Murcia', community: 'Región de Murcia' },
  { city: 'La Manga', province: 'Murcia', community: 'Región de Murcia' },
  
  // Navarra
  { city: 'Tudela', province: 'Navarra', community: 'Navarra' },
  { city: 'Estella', province: 'Navarra', community: 'Navarra' },
  { city: 'Tafalla', province: 'Navarra', community: 'Navarra' },
  { city: 'Sangüesa', province: 'Navarra', community: 'Navarra' },
  { city: 'Alsasua', province: 'Navarra', community: 'Navarra' },
  { city: 'Elizondo', province: 'Navarra', community: 'Navarra' },
  
  // País Vasco
  { city: 'Eibar', province: 'Guipúzcoa', community: 'País Vasco' },
  { city: 'Zarautz', province: 'Guipúzcoa', community: 'País Vasco' },
  { city: 'Irún', province: 'Guipúzcoa', community: 'País Vasco' },
  { city: 'Hondarribia', province: 'Guipúzcoa', community: 'País Vasco' },
  { city: 'Tolosa', province: 'Guipúzcoa', community: 'País Vasco' },
  { city: 'Durango', province: 'Vizcaya', community: 'País Vasco' },
  { city: 'Gernika', province: 'Vizcaya', community: 'País Vasco' },
  { city: 'Bermeo', province: 'Vizcaya', community: 'País Vasco' },
  { city: 'Plentzia', province: 'Vizcaya', community: 'País Vasco' },
  { city: 'Llodio', province: 'Álava', community: 'País Vasco' },
  { city: 'Amurrio', province: 'Álava', community: 'País Vasco' },
  { city: 'Salvatierra', province: 'Álava', community: 'País Vasco' },
];

// Nombres creativos de carreras para evitar duplicados
const RACE_NAME_TEMPLATES = [
  // Carreras temáticas
  { prefix: 'Ruta del Vino de', type: 'carrera_popular', distances: [10, 15], prices: [15, 20] },
  { prefix: 'Carrera del Castillo de', type: 'carrera_popular', distances: [5, 10], prices: [12, 15] },
  { prefix: 'Travesía Urbana de', type: 'carrera_popular', distances: [8, 10], prices: [14, 18] },
  { prefix: 'Ruta Histórica de', type: 'carrera_popular', distances: [10, 12], prices: [15, 20] },
  { prefix: 'Carrera de la Primavera de', type: 'carrera_popular', distances: [5, 10], prices: [10, 15] },
  { prefix: 'Carrera del Verano de', type: 'carrera_popular', distances: [5, 8], prices: [10, 12] },
  { prefix: 'Circuito Urbano de', type: 'carrera_popular', distances: [5, 10, 15], prices: [12, 16, 20] },
  { prefix: 'Carrera Familiar de', type: 'carrera_popular', distances: [3, 5], prices: [8, 10] },
  { prefix: 'Running Festival de', type: 'carrera_popular', distances: [5, 10, 21.1], prices: [15, 20, 30] },
  { prefix: 'Desafío Running de', type: 'carrera_popular', distances: [10, 15], prices: [18, 22] },
  
  // Medias maratones
  { prefix: 'Media Maratón Nocturna de', type: 'media_maraton', distances: [21.1], prices: [35, 40] },
  { prefix: 'Media Maratón de la Costa de', type: 'media_maraton', distances: [21.1], prices: [38, 45] },
  { prefix: 'Media Maratón de Montaña de', type: 'media_maraton', distances: [21.1], prices: [40, 50] },
  { prefix: 'Media Maratón Ciudad de', type: 'media_maraton', distances: [21.1], prices: [30, 35] },
  { prefix: 'Half Marathon de', type: 'media_maraton', distances: [21.1], prices: [35, 42] },
  { prefix: '21K de', type: 'media_maraton', distances: [21.1], prices: [32, 38] },
  
  // Maratones
  { prefix: 'Maratón Internacional de', type: 'maraton', distances: [42.2], prices: [60, 80] },
  { prefix: 'Maratón de Montaña de', type: 'maraton', distances: [42.2], prices: [70, 90] },
  { prefix: 'Maratón Nocturno de', type: 'maraton', distances: [42.2], prices: [65, 85] },
  { prefix: '42K de', type: 'maraton', distances: [42.2], prices: [55, 70] },
  
  // Trails
  { prefix: 'Trail de los Bosques de', type: 'trail_running', distances: [15, 20, 25, 30], prices: [25, 30, 35, 40] },
  { prefix: 'Trail del Valle de', type: 'trail_running', distances: [18, 25, 35], prices: [28, 35, 45] },
  { prefix: 'Trail de la Sierra de', type: 'trail_running', distances: [20, 30, 40], prices: [30, 40, 50] },
  { prefix: 'Mountain Trail de', type: 'trail_running', distances: [22, 32], prices: [35, 45] },
  { prefix: 'Trail Run de', type: 'trail_running', distances: [12, 18, 25], prices: [22, 28, 35] },
  { prefix: 'Vertical Race de', type: 'trail_running', distances: [8, 12], prices: [20, 25] },
  { prefix: 'Trail Costa de', type: 'trail_running', distances: [15, 22], prices: [25, 32] },
  { prefix: 'Trail del Río de', type: 'trail_running', distances: [18, 28], prices: [28, 38] },
  
  // Nocturnas
  { prefix: 'Night Run de', type: 'nocturna', distances: [5, 10], prices: [15, 20] },
  { prefix: 'Carrera de la Luna de', type: 'nocturna', distances: [8, 10], prices: [16, 20] },
  { prefix: 'Nocturna Urbana de', type: 'nocturna', distances: [10, 15], prices: [18, 24] },
  { prefix: 'Carrera de las Estrellas de', type: 'nocturna', distances: [5, 10], prices: [14, 18] },
  { prefix: 'Run Night de', type: 'nocturna', distances: [8, 12], prices: [16, 22] },
  
  // Solidarias
  { prefix: 'Carrera por la Paz de', type: 'solidaria', distances: [5, 10], prices: [10, 15] },
  { prefix: 'Running Solidario de', type: 'solidaria', distances: [5, 8], prices: [8, 12] },
  { prefix: 'Carrera Benéfica de', type: 'solidaria', distances: [5, 10], prices: [10, 15] },
  { prefix: 'Carrera por la Igualdad de', type: 'solidaria', distances: [5, 8], prices: [8, 12] },
  { prefix: 'Carrera Inclusiva de', type: 'solidaria', distances: [3, 5, 10], prices: [5, 8, 12] },
  { prefix: 'Color Run de', type: 'solidaria', distances: [5], prices: [20, 25] },
  
  // Cross
  { prefix: 'Cross del Parque de', type: 'cross', distances: [6, 8, 10], prices: [10, 12, 15] },
  { prefix: 'Cross Urbano de', type: 'cross', distances: [5, 8], prices: [8, 12] },
  { prefix: 'Cross de Otoño de', type: 'cross', distances: [6, 10], prices: [10, 14] },
  { prefix: 'Cross de Invierno de', type: 'cross', distances: [8, 12], prices: [12, 16] },
  { prefix: 'Cross Campo a Través de', type: 'cross', distances: [6, 8, 10], prices: [8, 10, 12] },
];

// Función para generar fecha aleatoria en 2026 (desde febrero hasta diciembre)
function generateRandomDate2026(): string {
  const start = new Date('2026-02-01');
  const end = new Date('2026-12-31');
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime).toISOString().split('T')[0];
}

// Función para generar hora aleatoria
function generateRandomTime(): string {
  const hours = 7 + Math.floor(Math.random() * 5); // 7-11 AM
  const minutes = Math.random() > 0.5 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
}

// Función para generar hora nocturna
function generateNightTime(): string {
  const hours = 19 + Math.floor(Math.random() * 3); // 19-21
  const minutes = Math.random() > 0.5 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
}

// Generar carreras
async function generateNewRaces(): Promise<any[]> {
  const races: any[] = [];
  const usedNames = new Set<string>();
  
  // Obtener nombres existentes para evitar duplicados
  const { data: existingRaces } = await supabase
    .from('races')
    .select('name');
  
  if (existingRaces) {
    existingRaces.forEach(r => usedNames.add(r.name.toLowerCase()));
  }
  
  console.log(`📋 Nombres de carreras existentes: ${usedNames.size}`);
  
  let raceId = 1;
  
  // Iterar sobre ubicaciones y plantillas
  while (races.length < 300) {
    const location = SPANISH_LOCATIONS[Math.floor(Math.random() * SPANISH_LOCATIONS.length)];
    const template = RACE_NAME_TEMPLATES[Math.floor(Math.random() * RACE_NAME_TEMPLATES.length)];
    
    const name = `${template.prefix} ${location.city}`;
    
    // Evitar duplicados
    if (usedNames.has(name.toLowerCase())) {
      continue;
    }
    
    usedNames.add(name.toLowerCase());
    
    const distance = template.distances[Math.floor(Math.random() * template.distances.length)];
    const price = template.prices[Math.floor(Math.random() * template.prices.length)];
    const eventDate = generateRandomDate2026();
    const isNocturna = template.type === 'nocturna';
    const eventTime = isNocturna ? generateNightTime() : generateRandomTime();
    
    let distanceText: string;
    if (distance === 42.2) {
      distanceText = 'Maratón';
    } else if (distance === 21.1) {
      distanceText = 'Media Maratón';
    } else {
      distanceText = `${distance}K`;
    }
    
    const race = {
      name,
      description: `${name}. Una carrera única con recorrido espectacular por ${location.city}, ${location.province}. Apta para corredores de todos los niveles.`,
      event_date: eventDate,
      event_time: eventTime,
      city: location.city,
      province: location.province,
      autonomous_community: location.community,
      race_type: template.type,
      distance_km: distance,
      distance_text: distanceText,
      registration_price: price,
      registration_url: `https://inscripciones.es/${location.city.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')}-${raceId}`,
      organizer: `Club Atlético ${location.city}`,
      website: `https://carrera-${location.city.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')}.es`,
      source_platform: 'NewRaces2026_Script',
      source_url: `https://newraces2026.com/race/${raceId}`,
      source_event_id: `new-2026-${raceId}`,
      includes_tshirt: Math.random() > 0.25,
      includes_medal: Math.random() > 0.35,
      wheelchair_accessible: Math.random() > 0.6,
      max_participants: Math.floor(Math.random() * 5000) + 500,
      registration_status: 'registration_open'
    };
    
    races.push(race);
    raceId++;
  }
  
  return races;
}

async function addNewRaces() {
  console.log('🏃 Generando 300 nuevas carreras para 2026...\n');
  
  const races = await generateNewRaces();
  
  console.log(`✅ Generadas ${races.length} carreras nuevas\n`);
  console.log('📤 Insertando en la base de datos...\n');
  
  let insertedCount = 0;
  let errorCount = 0;
  const batchSize = 50;
  
  // Insertar en lotes
  for (let i = 0; i < races.length; i += batchSize) {
    const batch = races.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('races')
      .insert(batch);
    
    if (error) {
      console.error(`❌ Error insertando lote ${Math.floor(i/batchSize) + 1}:`, error.message);
      errorCount += batch.length;
    } else {
      insertedCount += batch.length;
      console.log(`✅ Lote ${Math.floor(i/batchSize) + 1}: ${batch.length} carreras insertadas (Total: ${insertedCount})`);
    }
    
    // Pequeña pausa
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN:');
  console.log('='.repeat(60));
  console.log(`✅ Carreras insertadas: ${insertedCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  
  // Verificar estado final
  console.log('\n🔍 Verificando estado final...\n');
  
  const { data: finalRaces } = await supabase
    .from('races')
    .select('*')
    .gte('event_date', '2026-01-22');
  
  if (finalRaces) {
    console.log(`📊 Total de carreras futuras: ${finalRaces.length}`);
    
    // Distribución por tipo
    console.log('\n📊 DISTRIBUCIÓN POR TIPO:');
    const typeCount: Record<string, number> = {};
    finalRaces.forEach(r => {
      typeCount[r.race_type] = (typeCount[r.race_type] || 0) + 1;
    });
    Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
    
    // Distribución por provincia (top 15)
    console.log('\n📊 TOP 15 PROVINCIAS:');
    const provinceCount: Record<string, number> = {};
    finalRaces.forEach(r => {
      provinceCount[r.province] = (provinceCount[r.province] || 0) + 1;
    });
    Object.entries(provinceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .forEach(([province, count]) => {
        console.log(`   ${province}: ${count}`);
      });
  }
}

// Ejecutar
addNewRaces()
  .then(() => {
    console.log('\n🎉 ¡300 nuevas carreras añadidas para 2026!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
