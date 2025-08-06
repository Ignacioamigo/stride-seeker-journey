// Base scraper class with common functionality

import type { ScrapedRace, ScrapingResult, ScrapingSource } from '../types';
import { PROVINCE_MAPPING, DISTANCE_NORMALIZERS, RACE_FEATURE_KEYWORDS } from '../config';

export abstract class BaseScraper {
  protected source: ScrapingSource;
  protected userAgent: string;
  protected timeout: number;

  constructor(source: ScrapingSource, userAgent: string, timeout: number) {
    this.source = source;
    this.userAgent = userAgent;
    this.timeout = timeout;
  }

  // Abstract method to be implemented by each scraper
  abstract scrapeRaces(fromDate: Date): Promise<ScrapingResult>;

  // Common utility methods
  protected async fetchWithRetry(url: string, retries = 3): Promise<Response> {
    let lastError: Error;
    
    for (let i = 0; i < retries; i++) {
      try {
        await this.delay(this.source.rateLimitDelay);
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Cache-Control': 'no-cache',
          },
          signal: AbortSignal.timeout(this.timeout)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${i + 1} failed for ${url}:`, error);
        
        if (i < retries - 1) {
          await this.delay(1000 * (i + 1)); // Exponential backoff
        }
      }
    }

    throw lastError!;
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Normalize province names
  protected normalizeProvince(provinceText: string): { province: string; autonomousCommunity?: string } {
    const cleaned = provinceText.trim();
    
    // Direct match
    if (PROVINCE_MAPPING[cleaned]) {
      return {
        province: PROVINCE_MAPPING[cleaned].officialName,
        autonomousCommunity: PROVINCE_MAPPING[cleaned].autonomousCommunity
      };
    }

    // Search through aliases
    for (const [officialName, data] of Object.entries(PROVINCE_MAPPING)) {
      if (data.aliases.some(alias => 
        alias.toLowerCase() === cleaned.toLowerCase() ||
        cleaned.toLowerCase().includes(alias.toLowerCase())
      )) {
        return {
          province: data.officialName,
          autonomousCommunity: data.autonomousCommunity
        };
      }
    }

    // Fallback: return as-is
    return { province: cleaned };
  }

  // Extract and normalize distance information
  protected normalizeDistance(text: string): {
    raceType: string;
    distanceKm?: number;
    distanceText: string;
  } {
    const normalizedText = text.toLowerCase().trim();
    
    for (const normalizer of DISTANCE_NORMALIZERS) {
      const match = normalizedText.match(normalizer.pattern);
      if (match) {
        let distanceKm = normalizer.distanceKm;
        
        // If pattern captures a number, use it
        if (match[1] && !distanceKm) {
          const captured = parseFloat(match[1]);
          if (!isNaN(captured)) {
            distanceKm = captured;
          }
        }

        return {
          raceType: normalizer.type,
          distanceKm,
          distanceText: text.trim()
        };
      }
    }

    // Default to popular race if no pattern matches
    return {
      raceType: 'carrera_popular',
      distanceText: text.trim()
    };
  }

  // Extract features from text
  protected extractFeatures(text: string): Record<string, boolean> {
    const features: Record<string, boolean> = {};
    const lowerText = text.toLowerCase();

    for (const [feature, keywords] of Object.entries(RACE_FEATURE_KEYWORDS)) {
      features[feature] = keywords.some(keyword => 
        lowerText.includes(keyword.toLowerCase())
      );
    }

    return features;
  }

  // Clean and validate race data
  protected cleanRaceData(race: Partial<ScrapedRace>): ScrapedRace | null {
    // Required fields validation
    if (!race.name || !race.city || !race.eventDate) {
      return null;
    }

    // Date validation
    const eventDate = new Date(race.eventDate);
    if (isNaN(eventDate.getTime()) || eventDate < new Date('2025-08-05')) {
      return null;
    }

    // Normalize location
    const locationInfo = this.normalizeProvince(race.province || race.city);
    
    // Normalize distance if provided
    let raceType = race.raceType;
    let distanceKm = race.distanceKm;
    
    if (race.distanceText && !raceType) {
      const distanceInfo = this.normalizeDistance(race.distanceText);
      raceType = distanceInfo.raceType as any;
      distanceKm = distanceInfo.distanceKm || distanceKm;
    }

    return {
      name: this.cleanText(race.name),
      description: race.description ? this.cleanText(race.description) : undefined,
      eventDate: race.eventDate,
      eventTime: race.eventTime,
      registrationDeadline: race.registrationDeadline,
      
      city: this.cleanText(race.city),
      province: locationInfo.province,
      autonomousCommunity: locationInfo.autonomousCommunity,
      venue: race.venue ? this.cleanText(race.venue) : undefined,
      startLocation: race.startLocation ? this.cleanText(race.startLocation) : undefined,
      coordinates: race.coordinates,
      
      raceType: raceType || 'carrera_popular',
      distanceKm,
      distanceText: race.distanceText ? this.cleanText(race.distanceText) : undefined,
      elevationGain: race.elevationGain,
      difficultyLevel: race.difficultyLevel,
      distances: race.distances,
      
      registrationPrice: race.registrationPrice,
      priceDetails: race.priceDetails,
      registrationUrl: race.registrationUrl,
      registrationStatus: race.registrationStatus || 'upcoming',
      maxParticipants: race.maxParticipants,
      currentParticipants: race.currentParticipants,
      
      organizer: race.organizer ? this.cleanText(race.organizer) : undefined,
      contactEmail: race.contactEmail,
      contactPhone: race.contactPhone,
      website: race.website,
      socialMedia: race.socialMedia,
      
      timingCompany: race.timingCompany ? this.cleanText(race.timingCompany) : undefined,
      timingSystem: race.timingSystem,
      resultsUrl: race.resultsUrl,
      liveTrackingUrl: race.liveTrackingUrl,
      
      categories: race.categories,
      prizes: race.prizes,
      
      sourcePlatform: this.source.name,
      sourceUrl: race.sourceUrl || '',
      sourceEventId: race.sourceEventId,
      imageUrl: race.imageUrl,
      posterUrl: race.posterUrl,
      
      features: race.features,
      racePackInfo: race.racePackInfo ? this.cleanText(race.racePackInfo) : undefined,
      includesTshirt: race.includesTshirt,
      includesMedal: race.includesMedal,
      
      isQualifyingRace: race.isQualifyingRace,
      qualifyingFor: race.qualifyingFor,
      isChampionship: race.isChampionship,
      championshipLevel: race.championshipLevel,
      
      seriesName: race.seriesName ? this.cleanText(race.seriesName) : undefined,
      circuitName: race.circuitName ? this.cleanText(race.circuitName) : undefined,
      seriesPoints: race.seriesPoints,
      
      wheelchairAccessible: race.wheelchairAccessible,
      guideRunnersAllowed: race.guideRunnersAllowed,
      specialCategories: race.specialCategories,
    } as ScrapedRace;
  }

  // Clean text content
  protected cleanText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .replace(/\u00A0/g, ' '); // Non-breaking space
  }

  // Parse date from various Spanish formats
  protected parseSpanishDate(dateStr: string): string | null {
    if (!dateStr) return null;

    const cleaned = dateStr.trim().toLowerCase();
    
    // Try ISO format first
    const isoMatch = cleaned.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    }

    // Spanish months
    const months: Record<string, string> = {
      'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
      'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
      'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
    };

    // Pattern: "15 de marzo de 2025" or "15 marzo 2025"
    const spanishMatch = cleaned.match(/(\d{1,2})\s+(?:de\s+)?(\w+)\s+(?:de\s+)?(\d{4})/);
    if (spanishMatch) {
      const day = spanishMatch[1].padStart(2, '0');
      const monthName = spanishMatch[2];
      const year = spanishMatch[3];
      
      if (months[monthName]) {
        return `${year}-${months[monthName]}-${day}`;
      }
    }

    // Pattern: "15/03/2025" or "15-03-2025"
    const slashMatch = cleaned.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (slashMatch) {
      const day = slashMatch[1].padStart(2, '0');
      const month = slashMatch[2].padStart(2, '0');
      const year = slashMatch[3];
      return `${year}-${month}-${day}`;
    }

    return null;
  }

  // Extract price from text
  protected extractPrice(text: string): number | undefined {
    const priceMatch = text.match(/(\d+(?:[.,]\d{2})?)\s*€/);
    if (priceMatch) {
      return parseFloat(priceMatch[1].replace(',', '.'));
    }
    return undefined;
  }

  // Generate unique source event ID
  protected generateEventId(race: Partial<ScrapedRace>): string {
    const name = (race.name || '').toLowerCase().replace(/\s+/g, '-');
    const city = (race.city || '').toLowerCase().replace(/\s+/g, '-');
    const date = race.eventDate ? race.eventDate.replace(/-/g, '') : 'nodate';
    
    return `${this.source.name}-${name}-${city}-${date}`;
  }
}