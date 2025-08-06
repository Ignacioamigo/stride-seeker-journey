// ClubRunning.es scraper - one of the largest Spanish running platforms

import { BaseScraper } from './baseScraper';
import type { ScrapedRace, ScrapingResult } from '../types';

export class ClubRunningScraper extends BaseScraper {
  async scrapeRaces(fromDate: Date): Promise<ScrapingResult> {
    const result: ScrapingResult = {
      success: false,
      races: [],
      errors: [],
      source: this.source.name,
      timestamp: new Date(),
    };

    try {
      console.log(`🏃 Starting ClubRunning scrape from ${fromDate.toISOString()}`);
      
      // Get race listing page
      const races = await this.scrapeRaceListings(fromDate);
      result.races = races;
      
      // For each race found, get detailed information
      const detailedRaces: ScrapedRace[] = [];
      for (const race of races) {
        try {
          const detailed = await this.scrapeRaceDetails(race);
          if (detailed) {
            detailedRaces.push(detailed);
          }
          
          // Rate limiting
          await this.delay(this.source.rateLimitDelay);
        } catch (error) {
          console.warn(`Error scraping details for race ${race.name}:`, error);
          result.errors.push(`Failed to get details for ${race.name}: ${error}`);
        }
      }

      result.races = detailedRaces;
      result.success = true;
      
      console.log(`✅ ClubRunning scrape completed: ${result.races.length} races found`);
      
    } catch (error) {
      console.error('ClubRunning scraper failed:', error);
      result.errors.push(`Scraping failed: ${error}`);
    }

    return result;
  }

  private async scrapeRaceListings(fromDate: Date): Promise<ScrapedRace[]> {
    const races: ScrapedRace[] = [];
    
    // ClubRunning uses AJAX for race listings, we'll scrape the main page and paginate
    const baseUrl = `${this.source.baseUrl}/`;
    
    try {
      const response = await this.fetchWithRetry(baseUrl);
      const html = await response.text();
      
      // Extract race cards from the main page
      const raceCards = this.extractRaceCardsFromHtml(html);
      
      for (const card of raceCards) {
        const race = this.parseRaceCard(card);
        if (race && new Date(race.eventDate) >= fromDate) {
          races.push(race);
        }
      }

      // Try to get more races from subsequent pages
      await this.scrapeAdditionalPages(races, fromDate, 2, 5); // Start page 2, max 5 pages
      
    } catch (error) {
      throw new Error(`Failed to scrape ClubRunning listings: ${error}`);
    }

    return races;
  }

  private extractRaceCardsFromHtml(html: string): string[] {
    const cards: string[] = [];
    
    // ClubRunning race cards are typically in divs with specific classes
    // This is a simplified extraction - in real implementation you'd use a proper HTML parser
    const cardPattern = /<div[^>]*class="[^"]*(?:carrera|race|event)[^"]*"[^>]*>.*?<\/div>/gis;
    let match;
    
    while ((match = cardPattern.exec(html)) !== null) {
      cards.push(match[0]);
    }

    return cards;
  }

  private parseRaceCard(cardHtml: string): ScrapedRace | null {
    try {
      // Extract basic race information from the card HTML
      // This is a simplified parser - real implementation would be more robust
      
      const name = this.extractBetweenTags(cardHtml, 'h3', 'h4', 'span');
      const city = this.extractLocation(cardHtml);
      const dateStr = this.extractDate(cardHtml);
      const distance = this.extractDistance(cardHtml);
      const url = this.extractRaceUrl(cardHtml);
      
      if (!name || !city || !dateStr) {
        return null;
      }

      const eventDate = this.parseSpanishDate(dateStr);
      if (!eventDate) {
        return null;
      }

      const { raceType, distanceKm, distanceText } = this.normalizeDistance(distance || '');
      const { province, autonomousCommunity } = this.normalizeProvince(city);

      const race: Partial<ScrapedRace> = {
        name: this.cleanText(name),
        eventDate,
        city: this.cleanText(city),
        province,
        autonomousCommunity,
        raceType: raceType as any,
        distanceKm,
        distanceText,
        sourceUrl: url ? `${this.source.baseUrl}${url}` : '',
        sourceEventId: this.generateEventId({ name, city, eventDate }),
      };

      return this.cleanRaceData(race);
      
    } catch (error) {
      console.warn('Error parsing race card:', error);
      return null;
    }
  }

  private extractBetweenTags(html: string, ...tags: string[]): string | null {
    for (const tag of tags) {
      const pattern = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, 'i');
      const match = html.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  }

  private extractLocation(html: string): string | null {
    // Look for location patterns in ClubRunning
    const patterns = [
      /(?:ciudad|location|lugar)["'][^"']*["']\s*:\s*["']([^"']+)["']/i,
      /<span[^>]*class="[^"]*location[^"]*"[^>]*>([^<]+)<\/span>/i,
      /<div[^>]*class="[^"]*ciudad[^"]*"[^>]*>([^<]+)<\/div>/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  private extractDate(html: string): string | null {
    // Common date patterns in ClubRunning
    const patterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/,
      /(\d{1,2}\s+(?:de\s+)?(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(?:de\s+)?\d{4})/i,
      /<time[^>]*>([^<]+)<\/time>/i,
      /<span[^>]*class="[^"]*date[^"]*"[^>]*>([^<]+)<\/span>/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  private extractDistance(html: string): string | null {
    // Distance patterns in ClubRunning
    const patterns = [
      /(\d+\s*k(?:m)?)/i,
      /(\d+\s*miles?)/i,
      /(maratón|media\s*maratón|trail)/i,
      /<span[^>]*class="[^"]*distance[^"]*"[^>]*>([^<]+)<\/span>/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  private extractRaceUrl(html: string): string | null {
    // Extract relative URL to race detail page
    const patterns = [
      /<a[^>]*href="([^"]*carrera[^"]*)"[^>]*>/i,
      /<a[^>]*href="([^"]*inscripcion[^"]*)"[^>]*>/i,
      /<a[^>]*href="([^"]*event[^"]*)"[^>]*>/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  private async scrapeAdditionalPages(races: ScrapedRace[], fromDate: Date, startPage: number, maxPages: number): Promise<void> {
    for (let page = startPage; page <= maxPages; page++) {
      try {
        // ClubRunning pagination - adjust URL pattern based on actual implementation
        const pageUrl = `${this.source.baseUrl}/?page=${page}`;
        
        const response = await this.fetchWithRetry(pageUrl);
        const html = await response.text();
        
        const pageCards = this.extractRaceCardsFromHtml(html);
        
        if (pageCards.length === 0) {
          // No more races, stop pagination
          break;
        }

        let foundRecentRaces = false;
        for (const card of pageCards) {
          const race = this.parseRaceCard(card);
          if (race && new Date(race.eventDate) >= fromDate) {
            races.push(race);
            foundRecentRaces = true;
          }
        }

        // If no recent races found on this page, likely all older races
        if (!foundRecentRaces) {
          break;
        }

        // Rate limiting between pages
        await this.delay(this.source.rateLimitDelay * 2);
        
      } catch (error) {
        console.warn(`Error scraping page ${page}:`, error);
        break;
      }
    }
  }

  private async scrapeRaceDetails(race: ScrapedRace): Promise<ScrapedRace | null> {
    if (!race.sourceUrl) {
      return race;
    }

    try {
      const response = await this.fetchWithRetry(race.sourceUrl);
      const html = await response.text();
      
      // Extract additional details from the race detail page
      const details = this.parseRaceDetailsPage(html);
      
      // Merge with existing race data
      return {
        ...race,
        ...details,
      };
      
    } catch (error) {
      console.warn(`Failed to get details for ${race.name}:`, error);
      return race; // Return original race if details fail
    }
  }

  private parseRaceDetailsPage(html: string): Partial<ScrapedRace> {
    const details: Partial<ScrapedRace> = {};

    // Extract detailed information
    details.description = this.extractDescription(html);
    details.organizer = this.extractOrganizer(html);
    details.registrationUrl = this.extractRegistrationUrl(html);
    details.registrationPrice = this.extractRegistrationPrice(html);
    details.website = this.extractWebsite(html);
    details.contactEmail = this.extractEmail(html);
    details.contactPhone = this.extractPhone(html);
    details.imageUrl = this.extractImageUrl(html);
    details.elevationGain = this.extractElevationGain(html);
    details.maxParticipants = this.extractMaxParticipants(html);
    
    // Extract features
    const featuresText = html.toLowerCase();
    details.includesTshirt = featuresText.includes('camiseta') || featuresText.includes('t-shirt');
    details.includesMedal = featuresText.includes('medalla');
    details.wheelchairAccessible = featuresText.includes('silla de ruedas') || featuresText.includes('adaptada');
    
    return details;
  }

  private extractDescription(html: string): string | undefined {
    const patterns = [
      /<div[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)<\/div>/i,
      /<p[^>]*class="[^"]*descripcion[^"]*"[^>]*>([^<]+)<\/p>/i,
      /<meta[^>]*name="description"[^>]*content="([^"]+)"/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        return this.cleanText(match[1]);
      }
    }

    return undefined;
  }

  private extractOrganizer(html: string): string | undefined {
    const patterns = [
      /organizador?\s*:\s*([^\n<]+)/i,
      /organiza\s*:\s*([^\n<]+)/i,
      /<span[^>]*class="[^"]*organizer[^"]*"[^>]*>([^<]+)<\/span>/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        return this.cleanText(match[1]);
      }
    }

    return undefined;
  }

  private extractRegistrationUrl(html: string): string | undefined {
    const patterns = [
      /<a[^>]*href="([^"]*inscripcion[^"]*)"[^>]*>/i,
      /<a[^>]*href="([^"]*registration[^"]*)"[^>]*>/i,
      /<a[^>]*href="([^"]*inscribir[^"]*)"[^>]*>/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        let url = match[1];
        if (!url.startsWith('http')) {
          url = `${this.source.baseUrl}${url}`;
        }
        return url;
      }
    }

    return undefined;
  }

  private extractRegistrationPrice(html: string): number | undefined {
    const patterns = [
      /precio\s*:\s*(\d+(?:[.,]\d{2})?)\s*€/i,
      /inscripción\s*:\s*(\d+(?:[.,]\d{2})?)\s*€/i,
      /(\d+(?:[.,]\d{2})?)\s*€/,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        return parseFloat(match[1].replace(',', '.'));
      }
    }

    return undefined;
  }

  private extractWebsite(html: string): string | undefined {
    const patterns = [
      /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>(?:web|website|sitio)/i,
      /web\s*:\s*(https?:\/\/[^\s<]+)/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }

  private extractEmail(html: string): string | undefined {
    const pattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const match = html.match(pattern);
    return match ? match[1] : undefined;
  }

  private extractPhone(html: string): string | undefined {
    const patterns = [
      /(\+34\s*\d{3}\s*\d{3}\s*\d{3})/,
      /(\d{3}\s*\d{3}\s*\d{3})/,
      /tel[^:]*:\s*([^<\n]+)/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  private extractImageUrl(html: string): string | undefined {
    const patterns = [
      /<img[^>]*src="([^"]*cartel[^"]*)"[^>]*>/i,
      /<img[^>]*src="([^"]*poster[^"]*)"[^>]*>/i,
      /<img[^>]*class="[^"]*race[^"]*"[^>]*src="([^"]+)"[^>]*>/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        let url = match[1];
        if (!url.startsWith('http')) {
          url = `${this.source.baseUrl}${url}`;
        }
        return url;
      }
    }

    return undefined;
  }

  private extractElevationGain(html: string): number | undefined {
    const patterns = [
      /desnivel\s*:\s*(\d+)\s*m/i,
      /elevation\s*:\s*(\d+)\s*m/i,
      /(\d+)\s*m\s*desnivel/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }

    return undefined;
  }

  private extractMaxParticipants(html: string): number | undefined {
    const patterns = [
      /plazas\s*:\s*(\d+)/i,
      /participantes\s*:\s*(\d+)/i,
      /máximo\s*:\s*(\d+)/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }

    return undefined;
  }
}