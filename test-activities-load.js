// Test directo de carga de actividades
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://uprohtkbghujvjwjnqyv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcm9odGtiZ2h1anZqd2pucXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxODgwMjUsImV4cCI6MjA0NDc2NDAyNX0.C5sXJpxd_wlnTJFV11i0BCtAq7Lgg45nCEvhQlPEHr0'
);

async function testActivities() {
  console.log('Testing activity loading...');
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  console.log('User:', user?.email, user?.id);
  
  // Try loading activities
  const { data, error } = await supabase
    .from('published_activities_simple')
    .select('*')
    .order('created_at', { ascending: false });
  
  console.log('Activities:', data?.length || 0);
  console.log('Error:', error);
  console.log('Data:', data);
}

testActivities();
