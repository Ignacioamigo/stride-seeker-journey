// Types for race scraping system

export interface ScrapedRace {
  // Basic Information
  name: string;
  description?: string;
  eventDate: string; // ISO date string
  eventTime?: string;
  registrationDeadline?: string;
  
  // Location
  city: string;
  province: string;
  autonomousCommunity?: string;
  venue?: string;
  startLocation?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  
  // Race Details
  raceType: RaceType;
  distanceKm?: number;
  distanceText?: string;
  elevationGain?: number;
  difficultyLevel?: DifficultyLevel;
  
  // Multiple distances support
  distances?: Array<{
    distanceKm?: number;
    distanceText: string;
    category?: string;
  }>;
  
  // Registration & Cost
  registrationPrice?: number;
  priceDetails?: Record<string, any>;
  registrationUrl?: string;
  registrationStatus?: RegistrationStatus;
  maxParticipants?: number;
  currentParticipants?: number;
  
  // Organization
  organizer?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  socialMedia?: Record<string, string>;
  
  // Timing & Results
  timingCompany?: string;
  timingSystem?: string;
  resultsUrl?: string;
  liveTrackingUrl?: string;
  
  // Categories & Prizes
  categories?: Record<string, any>;
  prizes?: Record<string, any>;
  
  // Source & Scraping
  sourcePlatform: string;
  sourceUrl: string;
  sourceEventId?: string;
  imageUrl?: string;
  posterUrl?: string;
  
  // Additional Features
  features?: Record<string, any>;
  racePackInfo?: string;
  includesTshirt?: boolean;
  includesMedal?: boolean;
  
  // Special Classifications
  isQualifyingRace?: boolean;
  qualifyingFor?: string;
  isChampionship?: boolean;
  championshipLevel?: string;
  
  // Series & Circuits
  seriesName?: string;
  circuitName?: string;
  seriesPoints?: number;
  
  // Accessibility
  wheelchairAccessible?: boolean;
  guideRunnersAllowed?: boolean;
  specialCategories?: Record<string, any>;
}

export type RaceType = 
  | 'carrera_popular'
  | 'trail_running'
  | 'media_maraton'
  | 'maraton'
  | 'cross'
  | 'montaña'
  | 'ultra_trail'
  | 'canicross'
  | 'triathlon'
  | 'duathlon'
  | 'acuathlon'
  | 'solidaria'
  | 'nocturna'
  | 'virtual'
  | 'otros';

export type DifficultyLevel = 
  | 'principiante'
  | 'intermedio'
  | 'avanzado'
  | 'elite';

export type RegistrationStatus = 
  | 'upcoming'
  | 'registration_open'
  | 'registration_closed'
  | 'completed'
  | 'cancelled'
  | 'postponed';

export interface ScrapingSource {
  name: string;
  baseUrl: string;
  enabled: boolean;
  lastScraped?: Date;
  nextScrapeTime?: Date;
  scrapeInterval: number; // hours
  priority: number; // 1-10, higher = more important
  rateLimitDelay: number; // ms between requests
  maxRetries: number;
  timeout: number; // ms
}

export interface ScrapingJob {
  id: string;
  source: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  racesFound: number;
  racesInserted: number;
  racesUpdated: number;
  errors: string[];
  lastError?: string;
}

export interface ScrapingConfig {
  sources: ScrapingSource[];
  globalTimeout: number;
  maxConcurrentJobs: number;
  retryDelay: number;
  userAgent: string;
  enableHeadless: boolean;
  screenshots: boolean;
  debugMode: boolean;
}

export interface ProvinceMapping {
  [key: string]: {
    officialName: string;
    autonomousCommunity: string;
    aliases: string[];
  };
}

export interface DistanceNormalizer {
  pattern: RegExp;
  type: RaceType;
  distanceKm?: number;
  category?: string;
}

export interface ScrapingResult {
  success: boolean;
  races: ScrapedRace[];
  errors: string[];
  source: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}