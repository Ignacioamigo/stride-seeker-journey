// Main scraping service that coordinates all scrapers and manages data persistence

import { supabase } from '@/integrations/supabase/client';
import type { 
  ScrapedRace, 
  ScrapingJob, 
  ScrapingResult, 
  ScrapingConfig,
  ScrapingSource 
} from './types';
import { SCRAPING_CONFIG } from './config';
import { ClubRunningScraper } from './scrapers/clubrunningScraper';
import { BaseScraper } from './scrapers/baseScraper';

export class RaceScrapingService {
  private config: ScrapingConfig;
  private runningJobs = new Map<string, ScrapingJob>();
  private scrapers = new Map<string, BaseScraper>();

  constructor(config: ScrapingConfig = SCRAPING_CONFIG) {
    this.config = config;
    this.initializeScrapers();
  }

  private initializeScrapers(): void {
    // Initialize available scrapers
    for (const source of this.config.sources) {
      if (!source.enabled) continue;

      let scraper: BaseScraper;
      
      switch (source.name) {
        case 'clubrunning':
          scraper = new ClubRunningScraper(source, this.config.userAgent, this.config.globalTimeout);
          break;
        // Add more scrapers here as they're implemented
        default:
          console.warn(`No scraper implementation for source: ${source.name}`);
          continue;
      }

      this.scrapers.set(source.name, scraper);
    }

    console.log(`🔧 Initialized ${this.scrapers.size} scrapers:`, Array.from(this.scrapers.keys()));
  }

  // Main entry point for scraping all sources
  async scrapeAllSources(fromDate: Date = new Date('2025-08-05')): Promise<ScrapingJob[]> {
    console.log(`🚀 Starting comprehensive race scraping from ${fromDate.toISOString()}`);
    
    const jobs: ScrapingJob[] = [];
    const enabledSources = this.config.sources
      .filter(source => source.enabled && this.scrapers.has(source.name))
      .sort((a, b) => b.priority - a.priority); // Higher priority first

    // Process sources with concurrency limit
    const batchSize = this.config.maxConcurrentJobs;
    for (let i = 0; i < enabledSources.length; i += batchSize) {
      const batch = enabledSources.slice(i, i + batchSize);
      const batchJobs = await Promise.all(
        batch.map(source => this.scrapeSingleSource(source, fromDate))
      );
      jobs.push(...batchJobs);
      
      // Delay between batches to be respectful
      if (i + batchSize < enabledSources.length) {
        await this.delay(this.config.retryDelay);
      }
    }

    // Generate summary
    this.logScrapingSummary(jobs);

    return jobs;
  }

  // Scrape a single source
  async scrapeSingleSource(source: ScrapingSource, fromDate: Date): Promise<ScrapingJob> {
    const job: ScrapingJob = {
      id: `${source.name}-${Date.now()}`,
      source: source.name,
      status: 'pending',
      racesFound: 0,
      racesInserted: 0,
      racesUpdated: 0,
      errors: [],
    };

    this.runningJobs.set(job.id, job);

    try {
      console.log(`🔍 Starting scrape: ${source.name} (priority: ${source.priority})`);
      
      job.status = 'running';
      job.startedAt = new Date();

      const scraper = this.scrapers.get(source.name);
      if (!scraper) {
        throw new Error(`No scraper found for source: ${source.name}`);
      }

      // Execute scraping
      const result = await scraper.scrapeRaces(fromDate);
      
      if (!result.success) {
        job.errors.push(...result.errors);
        throw new Error(`Scraping failed: ${result.errors.join(', ')}`);
      }

      job.racesFound = result.races.length;

      // Store races in database
      if (result.races.length > 0) {
        const { inserted, updated, errors } = await this.storeRaces(result.races);
        job.racesInserted = inserted;
        job.racesUpdated = updated;
        job.errors.push(...errors);
      }

      job.status = 'completed';
      console.log(`✅ Completed scrape: ${source.name} - Found: ${job.racesFound}, Inserted: ${job.racesInserted}, Updated: ${job.racesUpdated}`);

    } catch (error) {
      job.status = 'failed';
      job.lastError = error instanceof Error ? error.message : String(error);
      job.errors.push(job.lastError);
      console.error(`❌ Failed scrape: ${source.name} - ${job.lastError}`);
    } finally {
      job.completedAt = new Date();
      this.runningJobs.delete(job.id);
    }

    return job;
  }

  // Store scraped races in Supabase
  private async storeRaces(races: ScrapedRace[]): Promise<{ inserted: number; updated: number; errors: string[] }> {
    let inserted = 0;
    let updated = 0;
    const errors: string[] = [];

    console.log(`💾 Storing ${races.length} races in database...`);

    for (const race of races) {
      try {
        const dbRace = this.transformRaceForDatabase(race);
        
        // Check if race already exists
        const { data: existing } = await supabase
          .from('races')
          .select('id, updated_at')
          .eq('source_platform', race.sourcePlatform)
          .eq('source_event_id', race.sourceEventId)
          .single();

        if (existing) {
          // Update existing race
          const { error } = await supabase
            .from('races')
            .update({
              ...dbRace,
              updated_at: new Date().toISOString(),
              scraped_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

          if (error) {
            errors.push(`Update failed for ${race.name}: ${error.message}`);
          } else {
            updated++;
          }
        } else {
          // Insert new race
          const { error } = await supabase
            .from('races')
            .insert({
              ...dbRace,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              scraped_at: new Date().toISOString(),
              next_scrape_due: this.calculateNextScrapeTime(race.sourcePlatform),
            });

          if (error) {
            errors.push(`Insert failed for ${race.name}: ${error.message}`);
          } else {
            inserted++;
          }
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(`Processing failed for ${race.name}: ${errorMsg}`);
      }
    }

    console.log(`📊 Storage results - Inserted: ${inserted}, Updated: ${updated}, Errors: ${errors.length}`);
    
    return { inserted, updated, errors };
  }

  // Transform scraped race to database format
  private transformRaceForDatabase(race: ScrapedRace): any {
    const coordinates = race.coordinates 
      ? `POINT(${race.coordinates.longitude} ${race.coordinates.latitude})`
      : null;

    return {
      name: race.name,
      description: race.description,
      event_date: race.eventDate,
      event_time: race.eventTime,
      registration_deadline: race.registrationDeadline,
      
      city: race.city,
      province: race.province,
      autonomous_community: race.autonomousCommunity,
      venue: race.venue,
      start_location: race.startLocation,
      coordinates,
      
      race_type: race.raceType,
      distance_km: race.distanceKm,
      distance_text: race.distanceText,
      elevation_gain: race.elevationGain,
      difficulty_level: race.difficultyLevel,
      distances: race.distances,
      
      registration_price: race.registrationPrice,
      price_details: race.priceDetails,
      registration_url: race.registrationUrl,
      registration_status: race.registrationStatus,
      max_participants: race.maxParticipants,
      current_participants: race.currentParticipants,
      
      organizer: race.organizer,
      contact_email: race.contactEmail,
      contact_phone: race.contactPhone,
      website: race.website,
      social_media: race.socialMedia,
      
      timing_company: race.timingCompany,
      timing_system: race.timingSystem,
      results_url: race.resultsUrl,
      live_tracking_url: race.liveTrackingUrl,
      
      categories: race.categories,
      prizes: race.prizes,
      
      source_platform: race.sourcePlatform,
      source_url: race.sourceUrl,
      source_event_id: race.sourceEventId,
      image_url: race.imageUrl,
      poster_url: race.posterUrl,
      
      features: race.features,
      race_pack_info: race.racePackInfo,
      includes_tshirt: race.includesTshirt,
      includes_medal: race.includesMedal,
      
      is_qualifying_race: race.isQualifyingRace,
      qualifying_for: race.qualifyingFor,
      is_championship: race.isChampionship,
      championship_level: race.championshipLevel,
      
      series_name: race.seriesName,
      circuit_name: race.circuitName,
      series_points: race.seriesPoints,
      
      wheelchair_accessible: race.wheelchairAccessible,
      guide_runners_allowed: race.guideRunnersAllowed,
      special_categories: race.specialCategories,
      
      data_quality_score: this.calculateDataQualityScore(race),
      needs_manual_review: this.needsManualReview(race),
    };
  }

  // Calculate data quality score based on completeness
  private calculateDataQualityScore(race: ScrapedRace): number {
    const fields = [
      race.name,
      race.eventDate,
      race.city,
      race.province,
      race.raceType,
      race.distanceKm || race.distanceText,
      race.registrationUrl,
      race.organizer,
    ];

    const optionalFields = [
      race.description,
      race.venue,
      race.registrationPrice,
      race.website,
      race.contactEmail,
      race.imageUrl,
    ];

    const requiredScore = fields.filter(Boolean).length / fields.length;
    const optionalScore = optionalFields.filter(Boolean).length / optionalFields.length;
    
    return Math.round((requiredScore * 0.7 + optionalScore * 0.3) * 100) / 100;
  }

  // Determine if race needs manual review
  private needsManualReview(race: ScrapedRace): boolean {
    return (
      !race.distanceKm && !race.distanceText ||
      !race.province ||
      race.eventDate < '2025-08-05' ||
      this.calculateDataQualityScore(race) < 0.6
    );
  }

  // Calculate next scrape time based on source configuration
  private calculateNextScrapeTime(sourcePlatform: string): string {
    const source = this.config.sources.find(s => s.name === sourcePlatform);
    const hours = source?.scrapeInterval || 24;
    const nextScrape = new Date();
    nextScrape.setHours(nextScrape.getHours() + hours);
    return nextScrape.toISOString();
  }

  // Get races from database with filtering
  async getRaces(filters: {
    searchTerm?: string;
    raceTypes?: string[];
    provinces?: string[];
    dateFrom?: string;
    dateTo?: string;
    maxDistance?: number;
    limit?: number;
  } = {}): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('search_races', {
        search_term: filters.searchTerm || null,
        race_types: filters.raceTypes || null,
        provinces: filters.provinces || null,
        date_from: filters.dateFrom || null,
        date_to: filters.dateTo || null,
        max_distance: filters.maxDistance || null,
        limit_count: filters.limit || 50,
      });

      if (error) {
        console.error('Database query error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting races:', error);
      return [];
    }
  }

  // Get scraping statistics
  async getScrapingStats(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('races')
        .select(`
          source_platform,
          count(*),
          min(event_date),
          max(event_date),
          avg(data_quality_score),
          max(scraped_at)
        `)
        .groupBy('source_platform');

      return error ? [] : data;
    } catch (error) {
      console.error('Error getting scraping stats:', error);
      return [];
    }
  }

  // Utility methods
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private logScrapingSummary(jobs: ScrapingJob[]): void {
    const totalFound = jobs.reduce((sum, job) => sum + job.racesFound, 0);
    const totalInserted = jobs.reduce((sum, job) => sum + job.racesInserted, 0);
    const totalUpdated = jobs.reduce((sum, job) => sum + job.racesUpdated, 0);
    const totalErrors = jobs.reduce((sum, job) => sum + job.errors.length, 0);
    const successfulJobs = jobs.filter(job => job.status === 'completed').length;

    console.log(`
🏃‍♀️ SCRAPING SUMMARY
===================
Sources processed: ${jobs.length}
Successful: ${successfulJobs}
Failed: ${jobs.length - successfulJobs}

Races found: ${totalFound}
Races inserted: ${totalInserted}
Races updated: ${totalUpdated}
Total errors: ${totalErrors}

Sources: ${jobs.map(j => `${j.source} (${j.status})`).join(', ')}
===================
    `);
  }

  // Public method to trigger scraping manually
  async triggerScraping(): Promise<ScrapingJob[]> {
    return this.scrapeAllSources();
  }

  // Get current running jobs status
  getRunningJobs(): ScrapingJob[] {
    return Array.from(this.runningJobs.values());
  }
}

// Export singleton instance
export const raceScrapingService = new RaceScrapingService();