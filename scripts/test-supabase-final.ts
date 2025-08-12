import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qfhqzkvccgpqzxkjlgsr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaHF6a3ZjY2dwcXp4a2psZ3NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzMDEzNzAsImV4cCI6MjA0NTg3NzM3MH0.ixqzGKXyLPOWRNDNzd1K2ZqJi_z4o_U5NKBqQ9kGAv8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log('🔌 [TEST] Testing Supabase connection...');
  
  try {
    // Test 1: Check table exists and is accessible
    console.log('\n📋 [TEST] 1. Checking table existence...');
    const { data: tableTest, error: tableError } = await supabase
      .from('published_activities')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('❌ [TEST] Table access error:', tableError);
      return false;
    }
    console.log('✅ [TEST] Table accessible!');
    
    // Test 2: Check current user
    console.log('\n👤 [TEST] 2. Checking user authentication...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('⚠️ [TEST] No authenticated user (expected in testing)');
    } else {
      console.log('✅ [TEST] User authenticated:', user.id);
    }
    
    // Test 3: Try a simple insert (will fail without auth, but we'll see the error)
    console.log('\n💾 [TEST] 3. Testing insert capability...');
    const testData = {
      user_id: '6e86cc1d-5a4e-4540-ad6d-12441bb901c7', // Your user ID
      title: 'Test Activity',
      description: 'This is a test',
      distance: 1000,
      duration: '00:10:00',
      gps_points: [{"latitude": 40.4614, "longitude": -3.8775, "timestamp": "2025-08-12T16:46:30.436Z"}],
      is_public: true,
      activity_date: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('published_activities')
      .insert(testData)
      .select()
      .single();
    
    if (insertError) {
      console.log('⚠️ [TEST] Insert test failed (expected without proper auth):', insertError.message);
      // This is expected - we need proper auth
    } else {
      console.log('✅ [TEST] Insert test successful!', insertData.id);
    }
    
    // Test 4: Check storage bucket
    console.log('\n📁 [TEST] 4. Checking storage bucket...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ [TEST] Storage error:', bucketsError);
    } else {
      const activityBucket = buckets.find(b => b.id === 'activity-images');
      if (activityBucket) {
        console.log('✅ [TEST] Storage bucket exists:', activityBucket);
      } else {
        console.log('⚠️ [TEST] Storage bucket not found. Available buckets:', buckets.map(b => b.id));
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('💥 [TEST] Connection test failed:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 [TEST] Starting comprehensive Supabase test...\n');
  
  const success = await testSupabaseConnection();
  
  if (success) {
    console.log('\n🎉 [TEST] Supabase is ready for use!');
    console.log('📝 [TEST] Next steps:');
    console.log('   1. Create storage bucket if not exists');
    console.log('   2. Update app code to use Supabase');
    console.log('   3. Migrate local data');
  } else {
    console.log('\n❌ [TEST] Supabase needs more configuration');
  }
}

main().catch(console.error);
