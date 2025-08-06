// Configuration for race scraping sources and data normalization

import type { ScrapingConfig, ProvinceMapping, DistanceNormalizer } from './types';

export const SCRAPING_CONFIG: ScrapingConfig = {
  sources: [
    // Major Commercial Platforms
    {
      name: 'runnea',
      baseUrl: 'https://www.runnea.com',
      enabled: true,
      scrapeInterval: 24, // hours
      priority: 9,
      rateLimitDelay: 2000,
      maxRetries: 3,
      timeout: 30000,
    },
    {
      name: 'clubrunning',
      baseUrl: 'https://www.clubrunning.es',
      enabled: true,
      scrapeInterval: 12, // hours - higher priority
      priority: 10,
      rateLimitDelay: 1500,
      maxRetries: 3,
      timeout: 30000,
    },
    {
      name: 'finishers',
      baseUrl: 'https://www.finishers.com',
      enabled: true,
      scrapeInterval: 24,
      priority: 8,
      rateLimitDelay: 2000,
      maxRetries: 3,
      timeout: 30000,
    },
    {
      name: 'corredorespopulares',
      baseUrl: 'https://corredorespopulares.es',
      enabled: true,
      scrapeInterval: 24,
      priority: 8,
      rateLimitDelay: 2000,
      maxRetries: 3,
      timeout: 30000,
    },
    {
      name: 'zonarunners',
      baseUrl: 'https://carreras.zonarunners.es',
      enabled: true,
      scrapeInterval: 12,
      priority: 9,
      rateLimitDelay: 1000,
      maxRetries: 3,
      timeout: 30000,
    },
    {
      name: 'sportmaniacs',
      baseUrl: 'https://sportmaniacs.com',
      enabled: true,
      scrapeInterval: 24,
      priority: 7,
      rateLimitDelay: 2000,
      maxRetries: 3,
      timeout: 30000,
    },
    {
      name: 'runnink',
      baseUrl: 'https://runnink.com',
      enabled: true,
      scrapeInterval: 24,
      priority: 7,
      rateLimitDelay: 2000,
      maxRetries: 3,
      timeout: 30000,
    },
    {
      name: 'atlea',
      baseUrl: 'https://www.atlea.es',
      enabled: true,
      scrapeInterval: 24,
      priority: 6,
      rateLimitDelay: 2000,
      maxRetries: 3,
      timeout: 30000,
    },
    
    // Timing & Management Platforms
    {
      name: 'cronorunner',
      baseUrl: 'https://cronorunner.com',
      enabled: true,
      scrapeInterval: 24,
      priority: 8,
      rateLimitDelay: 2000,
      maxRetries: 3,
      timeout: 30000,
    },
    {
      name: 'runatica',
      baseUrl: 'https://www.runatica.com',
      enabled: true,
      scrapeInterval: 24,
      priority: 7,
      rateLimitDelay: 2000,
      maxRetries: 3,
      timeout: 30000,
    },
    {
      name: 'deportime',
      baseUrl: 'https://www.deportime.com',
      enabled: true,
      scrapeInterval: 24,
      priority: 6,
      rateLimitDelay: 2000,
      maxRetries: 3,
      timeout: 30000,
    },
    {
      name: 'gesconchip',
      baseUrl: 'https://gesconchip.es',
      enabled: true,
      scrapeInterval: 24,
      priority: 6,
      rateLimitDelay: 2000,
      maxRetries: 3,
      timeout: 30000,
    },
    
    // Official Sources
    {
      name: 'rfea',
      baseUrl: 'https://atletismorfea.es',
      enabled: true,
      scrapeInterval: 48, // Less frequent for official sources
      priority: 9,
      rateLimitDelay: 3000,
      maxRetries: 3,
      timeout: 30000,
    },
  ],
  
  globalTimeout: 300000, // 5 minutes
  maxConcurrentJobs: 3,
  retryDelay: 5000,
  userAgent: 'Mozilla/5.0 (compatible; StrideSeeker/1.0; Race Information Aggregator)',
  enableHeadless: true,
  screenshots: false,
  debugMode: false,
};

// Spanish provinces and autonomous communities mapping
export const PROVINCE_MAPPING: ProvinceMapping = {
  'A Coruña': { 
    officialName: 'A Coruña', 
    autonomousCommunity: 'Galicia',
    aliases: ['La Coruña', 'Coruña', 'A Coruna', 'Coruna']
  },
  'Álava': { 
    officialName: 'Álava', 
    autonomousCommunity: 'País Vasco',
    aliases: ['Alava', 'Araba']
  },
  'Albacete': { 
    officialName: 'Albacete', 
    autonomousCommunity: 'Castilla-La Mancha',
    aliases: []
  },
  'Alicante': { 
    officialName: 'Alicante', 
    autonomousCommunity: 'Comunidad Valenciana',
    aliases: ['Alacant']
  },
  'Almería': { 
    officialName: 'Almería', 
    autonomousCommunity: 'Andalucía',
    aliases: ['Almeria']
  },
  'Asturias': { 
    officialName: 'Asturias', 
    autonomousCommunity: 'Principado de Asturias',
    aliases: ['Oviedo']
  },
  'Ávila': { 
    officialName: 'Ávila', 
    autonomousCommunity: 'Castilla y León',
    aliases: ['Avila']
  },
  'Badajoz': { 
    officialName: 'Badajoz', 
    autonomousCommunity: 'Extremadura',
    aliases: []
  },
  'Barcelona': { 
    officialName: 'Barcelona', 
    autonomousCommunity: 'Cataluña',
    aliases: []
  },
  'Burgos': { 
    officialName: 'Burgos', 
    autonomousCommunity: 'Castilla y León',
    aliases: []
  },
  'Cáceres': { 
    officialName: 'Cáceres', 
    autonomousCommunity: 'Extremadura',
    aliases: []
  },
  'Cádiz': { 
    officialName: 'Cádiz', 
    autonomousCommunity: 'Andalucía',
    aliases: ['Cadiz']
  },
  'Cantabria': { 
    officialName: 'Cantabria', 
    autonomousCommunity: 'Cantabria',
    aliases: ['Santander']
  },
  'Castellón': { 
    officialName: 'Castellón', 
    autonomousCommunity: 'Comunidad Valenciana',
    aliases: ['Castellon', 'Castello']
  },
  'Ciudad Real': { 
    officialName: 'Ciudad Real', 
    autonomousCommunity: 'Castilla-La Mancha',
    aliases: []
  },
  'Córdoba': { 
    officialName: 'Córdoba', 
    autonomousCommunity: 'Andalucía',
    aliases: ['Cordoba']
  },
  'Cuenca': { 
    officialName: 'Cuenca', 
    autonomousCommunity: 'Castilla-La Mancha',
    aliases: []
  },
  'Gerona': { 
    officialName: 'Girona', 
    autonomousCommunity: 'Cataluña',
    aliases: ['Girona', 'Gerona']
  },
  'Granada': { 
    officialName: 'Granada', 
    autonomousCommunity: 'Andalucía',
    aliases: []
  },
  'Guadalajara': { 
    officialName: 'Guadalajara', 
    autonomousCommunity: 'Castilla-La Mancha',
    aliases: []
  },
  'Guipúzcoa': { 
    officialName: 'Gipuzkoa', 
    autonomousCommunity: 'País Vasco',
    aliases: ['Guipuzcoa', 'Gipuzkoa']
  },
  'Huelva': { 
    officialName: 'Huelva', 
    autonomousCommunity: 'Andalucía',
    aliases: []
  },
  'Huesca': { 
    officialName: 'Huesca', 
    autonomousCommunity: 'Aragón',
    aliases: []
  },
  'Islas Baleares': { 
    officialName: 'Islas Baleares', 
    autonomousCommunity: 'Islas Baleares',
    aliases: ['Baleares', 'Illes Balears', 'Palma', 'Mallorca', 'Menorca', 'Ibiza', 'Formentera']
  },
  'Jaén': { 
    officialName: 'Jaén', 
    autonomousCommunity: 'Andalucía',
    aliases: ['Jaen']
  },
  'La Rioja': { 
    officialName: 'La Rioja', 
    autonomousCommunity: 'La Rioja',
    aliases: ['Rioja', 'Logroño', 'Logroño']
  },
  'Las Palmas': { 
    officialName: 'Las Palmas', 
    autonomousCommunity: 'Islas Canarias',
    aliases: ['Las Palmas de Gran Canaria', 'Gran Canaria']
  },
  'León': { 
    officialName: 'León', 
    autonomousCommunity: 'Castilla y León',
    aliases: ['Leon']
  },
  'Lérida': { 
    officialName: 'Lleida', 
    autonomousCommunity: 'Cataluña',
    aliases: ['Lerida', 'Lleida']
  },
  'Lugo': { 
    officialName: 'Lugo', 
    autonomousCommunity: 'Galicia',
    aliases: []
  },
  'Madrid': { 
    officialName: 'Madrid', 
    autonomousCommunity: 'Comunidad de Madrid',
    aliases: []
  },
  'Málaga': { 
    officialName: 'Málaga', 
    autonomousCommunity: 'Andalucía',
    aliases: ['Malaga']
  },
  'Murcia': { 
    officialName: 'Murcia', 
    autonomousCommunity: 'Región de Murcia',
    aliases: []
  },
  'Navarra': { 
    officialName: 'Navarra', 
    autonomousCommunity: 'Comunidad Foral de Navarra',
    aliases: ['Pamplona']
  },
  'Ourense': { 
    officialName: 'Ourense', 
    autonomousCommunity: 'Galicia',
    aliases: ['Orense']
  },
  'Palencia': { 
    officialName: 'Palencia', 
    autonomousCommunity: 'Castilla y León',
    aliases: []
  },
  'Pontevedra': { 
    officialName: 'Pontevedra', 
    autonomousCommunity: 'Galicia',
    aliases: ['Vigo']
  },
  'Salamanca': { 
    officialName: 'Salamanca', 
    autonomousCommunity: 'Castilla y León',
    aliases: []
  },
  'Santa Cruz de Tenerife': { 
    officialName: 'Santa Cruz de Tenerife', 
    autonomousCommunity: 'Islas Canarias',
    aliases: ['Tenerife', 'Santa Cruz']
  },
  'Segovia': { 
    officialName: 'Segovia', 
    autonomousCommunity: 'Castilla y León',
    aliases: []
  },
  'Sevilla': { 
    officialName: 'Sevilla', 
    autonomousCommunity: 'Andalucía',
    aliases: []
  },
  'Soria': { 
    officialName: 'Soria', 
    autonomousCommunity: 'Castilla y León',
    aliases: []
  },
  'Tarragona': { 
    officialName: 'Tarragona', 
    autonomousCommunity: 'Cataluña',
    aliases: []
  },
  'Teruel': { 
    officialName: 'Teruel', 
    autonomousCommunity: 'Aragón',
    aliases: []
  },
  'Toledo': { 
    officialName: 'Toledo', 
    autonomousCommunity: 'Castilla-La Mancha',
    aliases: []
  },
  'Valencia': { 
    officialName: 'Valencia', 
    autonomousCommunity: 'Comunidad Valenciana',
    aliases: ['València']
  },
  'Valladolid': { 
    officialName: 'Valladolid', 
    autonomousCommunity: 'Castilla y León',
    aliases: []
  },
  'Vizcaya': { 
    officialName: 'Bizkaia', 
    autonomousCommunity: 'País Vasco',
    aliases: ['Bizkaia', 'Bilbao']
  },
  'Zamora': { 
    officialName: 'Zamora', 
    autonomousCommunity: 'Castilla y León',
    aliases: []
  },
  'Zaragoza': { 
    officialName: 'Zaragoza', 
    autonomousCommunity: 'Aragón',
    aliases: []
  },
  'Ceuta': { 
    officialName: 'Ceuta', 
    autonomousCommunity: 'Ceuta',
    aliases: []
  },
  'Melilla': { 
    officialName: 'Melilla', 
    autonomousCommunity: 'Melilla',
    aliases: []
  },
};

// Distance and race type normalization patterns
export const DISTANCE_NORMALIZERS: DistanceNormalizer[] = [
  // Marathon distances
  { pattern: /maratón|maraton|marathon|42\.?2?k?m?|42\.195/i, type: 'maraton', distanceKm: 42.195 },
  
  // Half marathon distances
  { pattern: /media?\s*maratón|medio?\s*maratón|half.*marathon|21\.?1?k?m?|21\.097/i, type: 'media_maraton', distanceKm: 21.1 },
  
  // Trail running
  { pattern: /trail|montaña|monte|ultra.*trail|skyrace|vertical/i, type: 'trail_running' },
  { pattern: /ultra.*trail|ultra.*mountain/i, type: 'ultra_trail' },
  
  // Popular races by distance
  { pattern: /(\d+)\s*k(?:m)?(?:\s|$)/i, type: 'carrera_popular' },
  { pattern: /(\d+)\s*millas?/i, type: 'carrera_popular' },
  
  // Specific distances
  { pattern: /5\s*k(?:m)?|5000\s*m/i, type: 'carrera_popular', distanceKm: 5 },
  { pattern: /10\s*k(?:m)?|10000\s*m/i, type: 'carrera_popular', distanceKm: 10 },
  { pattern: /15\s*k(?:m)?|15000\s*m/i, type: 'carrera_popular', distanceKm: 15 },
  
  // Cross country
  { pattern: /cross|cros\s/i, type: 'cross' },
  
  // Night races
  { pattern: /nocturna|night|noche/i, type: 'nocturna' },
  
  // Solidarity races
  { pattern: /solidaria|benéfica|charity/i, type: 'solidaria' },
  
  // Canicross
  { pattern: /canicross|can.*cross/i, type: 'canicross' },
  
  // Triathlon
  { pattern: /triatlón|triathlon/i, type: 'triathlon' },
  { pattern: /duatlón|duathlon/i, type: 'duathlon' },
  { pattern: /acuatlón|aquathlon/i, type: 'acuathlon' },
  
  // Virtual races
  { pattern: /virtual|online/i, type: 'virtual' },
];

// Common keywords for extracting additional information
export const RACE_FEATURE_KEYWORDS = {
  includesTshirt: ['camiseta', 't-shirt', 'playera', 'prenda'],
  includesMedal: ['medalla', 'medal', 'trofeo'],
  wheelchairAccessible: ['silla de ruedas', 'adaptada', 'accessible'],
  refreshments: ['avituallamiento', 'refreshment', 'bebida', 'comida'],
  parking: ['parking', 'aparcamiento', 'estacionamiento'],
  shower: ['ducha', 'shower', 'vestuario'],
  baggage: ['consigna', 'baggage', 'equipaje'],
  toilets: ['aseos', 'baños', 'wc', 'servicios'],
  photography: ['fotografía', 'photo', 'imagen'],
  liveTracking: ['seguimiento', 'tracking', 'gps'],
  results: ['resultados', 'results', 'tiempos'],
};

// URLs patterns for different sources
export const URL_PATTERNS = {
  runnea: {
    calendar: '/carreras-populares/calendario/',
    race: '/carreras-populares/',
  },
  clubrunning: {
    calendar: '/calendario',
    race: '/carrera/',
  },
  finishers: {
    spain: '/es/d/europa/espana',
    race: '/es/races/',
  },
  zonarunners: {
    calendar: '/',
    search: '/?mes=',
  },
  corredorespopulares: {
    calendar: '/calendario/',
    inscripciones: '/inscripciones/',
  },
};

export default SCRAPING_CONFIG;