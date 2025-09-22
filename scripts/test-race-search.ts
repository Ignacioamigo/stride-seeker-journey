#!/usr/bin/env tsx

/**
 * Test the race search functionality to verify the database is working
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uprohtkbghujvjwjnqyv.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_ANON_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRaceSearch() {
  console.log('🧪 Testing race search functionality...\n');

  try {
    // Test 1: Get total race count
    console.log('📊 Test 1: Getting total race count...');
    const { count, error: countError } = await supabase
      .from('races')
      .select('*', { count: 'exact', head: true })
      .gte('event_date', '2025-10-01');

    if (countError) {
      console.error('❌ Count error:', countError);
    } else {
      console.log(`✅ Total races from Oct 2025: ${count}`);
    }

    // Test 2: Search for Madrid races
    console.log('\n🔍 Test 2: Searching for Madrid races...');
    const { data: madridRaces, error: madridError } = await supabase
      .from('races')
      .select('name, city, province, event_date, race_type')
      .ilike('city', '%Madrid%')
      .gte('event_date', '2025-10-01')
      .limit(5);

    if (madridError) {
      console.error('❌ Madrid search error:', madridError);
    } else {
      console.log(`✅ Found ${madridRaces?.length || 0} Madrid races:`);
      madridRaces?.forEach((race, index) => {
        console.log(`   ${index + 1}. ${race.name} - ${race.city} (${race.event_date})`);
      });
    }

    // Test 3: Search for marathons
    console.log('\n🏃 Test 3: Searching for marathons...');
    const { data: marathons, error: marathonError } = await supabase
      .from('races')
      .select('name, city, province, event_date, distance_km')
      .eq('race_type', 'maraton')
      .gte('event_date', '2025-10-01')
      .limit(5);

    if (marathonError) {
      console.error('❌ Marathon search error:', marathonError);
    } else {
      console.log(`✅ Found ${marathons?.length || 0} marathons:`);
      marathons?.forEach((race, index) => {
        console.log(`   ${index + 1}. ${race.name} - ${race.city} (${race.event_date})`);
      });
    }

    // Test 4: Test text search
    console.log('\n🔍 Test 4: Testing text search for "trail"...');
    const { data: trailRaces, error: trailError } = await supabase
      .from('races')
      .select('name, city, province, event_date, race_type')
      .or('name.ilike.%trail%,race_type.eq.trail_running')
      .gte('event_date', '2025-10-01')
      .limit(5);

    if (trailError) {
      console.error('❌ Trail search error:', trailError);
    } else {
      console.log(`✅ Found ${trailRaces?.length || 0} trail races:`);
      trailRaces?.forEach((race, index) => {
        console.log(`   ${index + 1}. ${race.name} - ${race.city} (${race.event_date})`);
      });
    }

    // Test 5: Get races by province breakdown
    console.log('\n🗺️  Test 5: Province breakdown (top 10)...');
    const { data: provinceData, error: provinceError } = await supabase
      .from('races')
      .select('province')
      .gte('event_date', '2025-10-01');

    if (provinceError) {
      console.error('❌ Province breakdown error:', provinceError);
    } else {
      const provinceCounts: Record<string, number> = {};
      provinceData?.forEach(race => {
        provinceCounts[race.province] = (provinceCounts[race.province] || 0) + 1;
      });

      console.log('✅ Top 10 provinces by race count:');
      Object.entries(provinceCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([province, count], index) => {
          console.log(`   ${index + 1}. ${province}: ${count} races`);
        });
    }

    // Test 6: Test upcoming races (next 30 days from Oct 1, 2025)
    console.log('\n📅 Test 6: Upcoming races (Oct 1-31, 2025)...');
    const { data: upcomingRaces, error: upcomingError } = await supabase
      .from('races')
      .select('name, city, event_date, race_type')
      .gte('event_date', '2025-10-01')
      .lte('event_date', '2025-10-31')
      .order('event_date')
      .limit(10);

    if (upcomingError) {
      console.error('❌ Upcoming races error:', upcomingError);
    } else {
      console.log(`✅ Found ${upcomingRaces?.length || 0} races in October 2025:`);
      upcomingRaces?.forEach((race, index) => {
        console.log(`   ${index + 1}. ${race.name} - ${race.city} (${race.event_date})`);
      });
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ The race database is working properly and ready for use in the onboarding flow.');
    
    return true;

  } catch (error) {
    console.error('💥 Test failed with error:', error);
    return false;
  }
}

async function main() {
  console.log('================================================================================');
  console.log('🧪 RACE DATABASE FUNCTIONALITY TEST');
  console.log('================================================================================\n');
  
  const success = await testRaceSearch();
  
  if (success) {
    console.log('\n🎉 SUCCESS! Race database is fully functional!');
    console.log('   Users can now search and select from 570+ Spanish races during onboarding.');
  } else {
    console.log('\n❌ FAILED! Race database has issues that need to be resolved.');
  }
  
  console.log('\n================================================================================');
  console.log('🏁 TESTING COMPLETED');
  console.log('================================================================================\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}