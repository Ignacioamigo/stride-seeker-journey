/**
 * MÉTODO ULTRA DIRECTO - Sin Supabase client, solo fetch puro
 */

export const saveWorkoutUltraDirect = async (
  workoutTitle: string,
  workoutType: string,
  distance: number | null,
  duration: string | null
): Promise<boolean> => {
  
  console.log('🚀 ULTRA DIRECT: Iniciando...');
  
  // Datos ultra simples
  const simpleData = {
    workout_title: workoutTitle,
    workout_type: workoutType,
    distancia_recorrida: distance,
    duracion: duration ? parseInt(duration.replace(/\D/g, '')) : null,
    fecha_completado: new Date().toISOString().split('T')[0],
    user_id: null, // Anónimo siempre
    created_at: new Date().toISOString()
  };

  console.log('📤 Datos ultra simples:', simpleData);

  // MÉTODO 1: Fetch directo con todas las headers posibles
  try {
    const response = await fetch('https://xdpavfgplomezosyujmi.supabase.co/rest/v1/entrenamientos_completados', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkcGF2ZmdwbG9tZXpvc3l1am1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1NDMxOTEsImV4cCI6MjA0MTExOTE5MX0.dLdDFITXZU5rwqyQBcKODM3ZnLmdEYelqOl0s5j6a8E',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkcGF2ZmdwbG9tZXpvc3l1am1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1NDMxOTEsImV4cCI6MjA0MTExOTE5MX0.dLdDFITXZU5rwqyQBcKODM3ZnLmdEYelqOl0s5j6a8E',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        'Accept': 'application/json',
        'X-Client-Info': 'supabase-js/2.0.0'
      },
      body: JSON.stringify(simpleData)
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('🎉 ULTRA DIRECT SUCCESS!', data);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Ultra direct error:', response.status, errorText);
    }
  } catch (error) {
    console.error('💥 Ultra direct fetch error:', error);
  }

  // MÉTODO 2: XMLHttpRequest (más básico)
  try {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://xdpavfgplomezosyujmi.supabase.co/rest/v1/entrenamientos_completados');
      xhr.setRequestHeader('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkcGF2ZmdwbG9tZXpvc3l1am1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1NDMxOTEsImV4cCI6MjA0MTExOTE5MX0.dLdDFITXZU5rwqyQBcKODM3ZnLmdEYelqOl0s5j6a8E');
      xhr.setRequestHeader('apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkcGF2ZmdwbG9tZXpvc3l1am1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1NDMxOTEsImV4cCI6MjA0MTExOTE5MX0.dLdDFITXZU5rwqyQBcKODM3ZnLmdEYelqOl0s5j6a8E');
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          console.log('🎉 XHR SUCCESS!', xhr.responseText);
          resolve(true);
        } else {
          console.error('❌ XHR Error:', xhr.status, xhr.responseText);
          resolve(false);
        }
      };
      
      xhr.onerror = () => {
        console.error('💥 XHR network error');
        resolve(false);
      };
      
      xhr.send(JSON.stringify(simpleData));
    });
  } catch (error) {
    console.error('💥 XHR setup error:', error);
    return false;
  }
};
