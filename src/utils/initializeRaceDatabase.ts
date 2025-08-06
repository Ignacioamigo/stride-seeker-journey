// Script to initialize the race database with scraped data from Spanish sources

import { raceScrapingService } from '@/services/raceScraping/scrapingService';
import { supabase } from '@/integrations/supabase/client';

export interface InitializationResult {
  success: boolean;
  message: string;
  stats: {
    sourcesProcessed: number;
    racesFound: number;
    racesInserted: number;
    racesUpdated: number;
    errors: number;
  };
  sources: Array<{
    name: string;
    status: 'completed' | 'failed';
    racesFound: number;
    errors: string[];
  }>;
}

export async function initializeRaceDatabase(): Promise<InitializationResult> {
  console.log('🚀 Starting race database initialization...');
  
  const result: InitializationResult = {
    success: false,
    message: '',
    stats: {
      sourcesProcessed: 0,
      racesFound: 0,
      racesInserted: 0,
      racesUpdated: 0,
      errors: 0
    },
    sources: []
  };

  try {
    // Check if we can connect to Supabase
    const { data: testData, error: testError } = await supabase.from('races').select('count').limit(1);
    if (testError) {
      throw new Error(`Database connection failed: ${testError.message}`);
    }

    console.log('✅ Database connection successful');

    // Set start date for scraping (from August 5, 2025)
    const fromDate = new Date('2025-08-05');
    console.log(`📅 Scraping races from ${fromDate.toISOString()}`);

    // Run the comprehensive scraping
    const jobs = await raceScrapingService.scrapeAllSources(fromDate);
    
    // Process results
    result.stats.sourcesProcessed = jobs.length;
    
    for (const job of jobs) {
      result.stats.racesFound += job.racesFound;
      result.stats.racesInserted += job.racesInserted;
      result.stats.racesUpdated += job.racesUpdated;
      result.stats.errors += job.errors.length;

      result.sources.push({
        name: job.source,
        status: job.status,
        racesFound: job.racesFound,
        errors: job.errors
      });
    }

    const successfulSources = jobs.filter(job => job.status === 'completed').length;
    
    if (successfulSources > 0) {
      result.success = true;
      result.message = `✅ Database initialized successfully! Processed ${successfulSources}/${jobs.length} sources.`;
    } else {
      result.message = `❌ Initialization failed. No sources were processed successfully.`;
    }

    // Log detailed summary
    console.log(`
🎯 INITIALIZATION SUMMARY
========================
Sources processed: ${result.stats.sourcesProcessed}
Successful sources: ${successfulSources}
Failed sources: ${result.stats.sourcesProcessed - successfulSources}

Races found: ${result.stats.racesFound}
Races inserted: ${result.stats.racesInserted}
Races updated: ${result.stats.racesUpdated}
Total errors: ${result.stats.errors}

Source details:
${result.sources.map(s => `  ${s.name}: ${s.status} (${s.racesFound} races, ${s.errors.length} errors)`).join('\n')}
========================
    `);

    return result;

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    result.message = `❌ Initialization failed: ${error instanceof Error ? error.message : String(error)}`;
    return result;
  }
}

// Function to get current database status
export async function getDatabaseStatus(): Promise<{
  totalRaces: number;
  racesBySource: Record<string, number>;
  racesByType: Record<string, number>;
  racesByProvince: Record<string, number>;
  latestRaces: any[];
}> {
  try {
    // Get total races count
    const { data: totalData, error: totalError } = await supabase
      .from('races')
      .select('count')
      .gte('event_date', '2025-08-05');

    if (totalError) throw totalError;

    // Get races by source
    const { data: sourceData, error: sourceError } = await supabase
      .from('races')
      .select('source_platform, count(*)')
      .gte('event_date', '2025-08-05')
      .groupBy('source_platform');

    if (sourceError) throw sourceError;

    // Get races by type
    const { data: typeData, error: typeError } = await supabase
      .from('races')
      .select('race_type, count(*)')
      .gte('event_date', '2025-08-05')
      .groupBy('race_type');

    if (typeError) throw typeError;

    // Get races by province
    const { data: provinceData, error: provinceError } = await supabase
      .from('races')
      .select('province, count(*)')
      .gte('event_date', '2025-08-05')
      .groupBy('province')
      .order('count', { ascending: false })
      .limit(10);

    if (provinceError) throw provinceError;

    // Get latest races
    const { data: latestData, error: latestError } = await supabase
      .from('races')
      .select('name, city, province, event_date, race_type, source_platform')
      .gte('event_date', '2025-08-05')
      .order('created_at', { ascending: false })
      .limit(10);

    if (latestError) throw latestError;

    return {
      totalRaces: totalData?.[0]?.count || 0,
      racesBySource: Object.fromEntries((sourceData || []).map(item => [item.source_platform, item.count])),
      racesByType: Object.fromEntries((typeData || []).map(item => [item.race_type, item.count])),
      racesByProvince: Object.fromEntries((provinceData || []).map(item => [item.province, item.count])),
      latestRaces: latestData || []
    };

  } catch (error) {
    console.error('Error getting database status:', error);
    return {
      totalRaces: 0,
      racesBySource: {},
      racesByType: {},
      racesByProvince: {},
      latestRaces: []
    };
  }
}

// Function to manually trigger a refresh of race data
export async function refreshRaceData(): Promise<boolean> {
  try {
    console.log('🔄 Refreshing race data...');
    const jobs = await raceScrapingService.triggerScraping();
    const successful = jobs.filter(job => job.status === 'completed').length;
    console.log(`✅ Refresh completed. ${successful}/${jobs.length} sources successful.`);
    return successful > 0;
  } catch (error) {
    console.error('❌ Failed to refresh race data:', error);
    return false;
  }
}

// Utility function to clean up old or invalid race data
export async function cleanupRaceDatabase(): Promise<void> {
  try {
    console.log('🧹 Cleaning up race database...');
    
    // Remove races with past dates (before August 5, 2025)
    const { error: deleteError } = await supabase
      .from('races')
      .delete()
      .lt('event_date', '2025-08-05');

    if (deleteError) {
      console.error('Error deleting old races:', deleteError);
    } else {
      console.log('✅ Cleaned up old race data');
    }

    // Update data quality scores for races that need manual review
    const { error: updateError } = await supabase
      .from('races')
      .update({ needs_manual_review: true })
      .or('distance_km.is.null,province.is.null')
      .lt('data_quality_score', 0.6);

    if (updateError) {
      console.error('Error updating quality scores:', updateError);
    } else {
      console.log('✅ Updated data quality indicators');
    }

  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
  }
}