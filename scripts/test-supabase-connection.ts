import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qfhqzkvccgpqzxkjlgsr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaHF6a3ZjY2dwcXp4a2psZ3NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzMDEzNzAsImV4cCI6MjA0NTg3NzM3MH0.ixqzGKXyLPOWRNDNzd1K2ZqJi_z4o_U5NKBqQ9kGAv8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log('🔌 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('published_activities')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Table access error:', testError);
      
      // Try to check if table exists
      const { data: tables, error: tablesError } = await supabase
        .rpc('get_tables');
        
      if (tablesError) {
        console.error('❌ Cannot check tables:', tablesError);
      } else {
        console.log('📋 Available tables:', tables);
      }
      
      return false;
    }
    
    console.log('✅ Table accessible!');
    return true;
    
  } catch (error) {
    console.error('💥 Connection failed:', error);
    return false;
  }
}

async function createTableDirectly() {
  console.log('🔨 Creating table directly...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS published_activities (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          image_url TEXT,
          distance REAL NOT NULL DEFAULT 0,
          duration TEXT NOT NULL DEFAULT '00:00:00',
          gps_points JSONB,
          is_public BOOLEAN NOT NULL DEFAULT true,
          activity_date TIMESTAMP WITH TIME ZONE NOT NULL,
          likes INTEGER DEFAULT 0,
          comments INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        ALTER TABLE published_activities ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can insert their own activities"
          ON published_activities FOR INSERT
          TO authenticated
          WITH CHECK (auth.uid() = user_id);
          
        CREATE POLICY "Users can view their own activities"
          ON published_activities FOR SELECT
          TO authenticated
          USING (auth.uid() = user_id);
      `
    });
    
    if (error) {
      console.error('❌ Create table error:', error);
      return false;
    }
    
    console.log('✅ Table created successfully!');
    return true;
    
  } catch (error) {
    console.error('💥 Create table failed:', error);
    return false;
  }
}

async function testInsert() {
  console.log('🧪 Testing insert...');
  
  try {
    const testActivity = {
      user_id: '6e86cc1d-5a4e-4540-ad6d-12441bb901c7',
      title: 'Test Activity',
      description: 'Test description',
      distance: 1000,
      duration: '00:10:00',
      gps_points: [{"latitude": 40.4614, "longitude": -3.8775, "timestamp": new Date().toISOString()}],
      is_public: true,
      activity_date: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('published_activities')
      .insert(testActivity)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Insert test failed:', error);
      return false;
    }
    
    console.log('✅ Insert test successful:', data.id);
    return true;
    
  } catch (error) {
    console.error('💥 Insert test error:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Supabase diagnostics...\n');
  
  const connectionOk = await testSupabaseConnection();
  
  if (!connectionOk) {
    console.log('\n🔧 Attempting to create table...');
    const createOk = await createTableDirectly();
    
    if (createOk) {
      console.log('\n🔄 Retesting connection...');
      await testSupabaseConnection();
    }
  }
  
  console.log('\n🧪 Testing insert operation...');
  await testInsert();
  
  console.log('\n🏁 Diagnostics complete!');
}

main().catch(console.error);
