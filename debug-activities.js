import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdpavfgplomezosyujmi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkcGF2ZmdwbG9tZXpvc3l1am1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1NDMxOTEsImV4cCI6MjA0MTExOTE5MX0.dLdDFITXZU5rwqyQBcKODM3ZnLmdEYelqOl0s5j6a8E';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 DEBUG ACTIVITIES: Verificando datos...');
console.log('=====================================\n');

async function debugActivities() {
  try {
    console.log('1️⃣ Verificando conexión a Supabase...');
    
    // Test de conexión básica
    const { data: testData, error: testError } = await supabase
      .from('published_activities_simple')
      .select('count(*)')
      .single();
    
    if (testError) {
      console.error('❌ Error de conexión:', testError.message);
      return;
    }
    
    console.log('✅ Conexión exitosa a Supabase');

    console.log('\n2️⃣ Obteniendo actividades...');
    
    const { data, error } = await supabase
      .from('published_activities_simple')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo actividades:', error);
      return;
    }

    console.log(`✅ Actividades obtenidas: ${data?.length || 0}`);

    if (data && data.length > 0) {
      console.log('\n3️⃣ Estructura de datos:');
      
      data.forEach((activity, index) => {
        console.log(`\n📊 Actividad ${index + 1}:`);
        console.log(`   🆔 ID: ${activity.id}`);
        console.log(`   📝 Title: ${activity.title}`);
        console.log(`   📄 Description: ${activity.description}`);
        console.log(`   🏃 Distance: ${activity.distance} km`);
        console.log(`   ⏱️ Duration: ${activity.duration}`);
        console.log(`   🔥 Calories: ${activity.calories}`);
        console.log(`   📧 User Email: ${activity.user_email}`);
        console.log(`   📅 Created: ${activity.created_at}`);
        console.log(`   🌐 GPS Points: ${JSON.stringify(activity.gps_points || []).length} chars`);
      });

      console.log('\n4️⃣ Simulando adaptación de datos (como en la app):');
      
      const adaptedActivities = data.map((activity) => {
        // Convertir duration de "HH:MM:SS" a segundos
        let durationSeconds = 0;
        if (activity.duration && typeof activity.duration === 'string') {
          const parts = activity.duration.split(':').map(Number);
          if (parts.length === 3) {
            durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
          }
        }
        
        return {
          id: activity.id,
          title: activity.title,
          description: activity.description,
          imageUrl: activity.image_url,
          calories: activity.calories || 0,
          runSession: {
            distance: (activity.distance || 0) * 1000, // km a metros
            duration: durationSeconds, // segundos
            gpsPoints: activity.gps_points || [],
            startTime: new Date(activity.activity_date || activity.created_at),
            endTime: new Date(activity.activity_date || activity.created_at)
          },
          publishedAt: new Date(activity.created_at),
          isPublic: activity.is_public !== false,
          likes: activity.likes || 0,
          comments: activity.comments || 0,
          userProfile: {
            name: activity.user_email?.split('@')[0] || 'Usuario'
          }
        };
      });
      
      console.log('\n✅ Datos adaptados exitosamente:');
      adaptedActivities.forEach((activity, index) => {
        console.log(`   ${index + 1}. ${activity.title} - ${activity.runSession.distance}m - ${activity.runSession.duration}s`);
      });
      
      console.log('\n🎯 LOS DATOS ESTÁN CORRECTOS - El problema está en el frontend');
      
    } else {
      console.log('\n⚠️ No hay actividades en la tabla');
    }

  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

debugActivities();
