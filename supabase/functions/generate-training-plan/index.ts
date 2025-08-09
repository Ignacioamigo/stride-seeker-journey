import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserProfile {
  id?: string;
  name: string;
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  maxDistance: number | null;
  pace: string | null;
  goal: string;
  weeklyWorkouts: number | null;
  experienceLevel: string | null;
  injuries: string;
  completedOnboarding?: boolean;
}

interface RequestBody {
  userProfile: UserProfile;
  previousWeekResults?: any;
  customPrompt?: string;
  min_similarity?: number;
  match_count?: number;
}

function getDayMapping(dayNumber: number): string {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  return days[dayNumber];
}

// Function to generate dates for the next 7 days starting from today
function generateDatesFromToday(): { date: Date, dayName: string }[] {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    date.setHours(0, 0, 0, 0);
    
    // Get day of week in Spanish
    const dayNumber = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    // Convert to our format where 0 = Monday
    const adjustedDayNumber = dayNumber === 0 ? 6 : dayNumber - 1;
    const dayName = getDayMapping(adjustedDayNumber);
    
    dates.push({ date, dayName });
  }
  
  return dates;
}

function generateDatesForSelectedDays(selectedDays: any[]): { date: Date, dayName: string }[] {
  if (!selectedDays || selectedDays.length === 0) {
    // Fallback to all week days if no selection
    return generateDatesFromToday();
  }
  
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
  
  // Get current week Monday
  const currentDayOfWeek = today.getDay();
  const daysToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysToMonday);
  
  // First, try to get remaining days from current week (from today onwards)
  for (const selectedDay of selectedDays) {
    if (selectedDay.selected) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + selectedDay.id); // selectedDay.id is 0-6 (Mon-Sun)
      date.setHours(0, 0, 0, 0);
      
      // Only include if the date is today or in the future
      if (date >= today) {
        const dayName = selectedDay.name;
        dates.push({ date, dayName });
      }
    }
  }
  
  // If no future dates this week, or we need more dates to complete a training week,
  // add dates from next week
  if (dates.length === 0) {
    // No more training days this week, get next week's selected days
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    
    for (const selectedDay of selectedDays) {
      if (selectedDay.selected) {
        const date = new Date(nextMonday);
        date.setDate(nextMonday.getDate() + selectedDay.id);
        date.setHours(0, 0, 0, 0);
        
        const dayName = selectedDay.name;
        dates.push({ date, dayName });
      }
    }
  } else {
    // We have some days this week, but let's also include next week for a full cycle
    // This ensures users can see the complete pattern
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    
    for (const selectedDay of selectedDays) {
      if (selectedDay.selected) {
        const date = new Date(nextMonday);
        date.setDate(nextMonday.getDate() + selectedDay.id);
        date.setHours(0, 0, 0, 0);
        
        const dayName = selectedDay.name;
        dates.push({ date, dayName });
      }
    }
  }
  
  // Sort by date to maintain chronological order
  dates.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Limit to next 7-14 days maximum to avoid too many future dates
  const maxDates = 14;
  return dates.slice(0, maxDates);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Get data from the request
    const { userProfile, previousWeekResults, customPrompt } = await req.json() as RequestBody;
    if (!userProfile || !userProfile.goal) {
      console.error('Missing required user profile information:', userProfile);
      return new Response(
        JSON.stringify({ error: 'Missing required user profile information', details: 'userProfile.goal is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }

    console.log("Processing request with user profile:", JSON.stringify(userProfile));
    
    // Generate dates based on selected days or fallback to next 7 days
    const nextWeekDates = userProfile.selectedDays && userProfile.selectedDays.length > 0 
      ? generateDatesForSelectedDays(userProfile.selectedDays)
      : generateDatesFromToday();
    
    console.log("Selected days from user:", userProfile.selectedDays);
    console.log("Generated dates:", nextWeekDates.map(d => `${d.dayName}: ${d.date.toISOString().split('T')[0]}`));

    // 2. Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials - URL:', !!supabaseUrl, 'Key:', !!supabaseKey);
      return new Response(
        JSON.stringify({ error: 'Server configuration error', details: 'Missing Supabase credentials' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 3. Prepare RAG context
    let contextText = '';
    let ragActive = false;
    
    try {
      console.log("Starting RAG process to retrieve relevant training knowledge...");
      
      // Generate embedding for the user's goal and profile
      const selectedDaysText = userProfile.selectedDays && userProfile.selectedDays.length > 0 
        ? userProfile.selectedDays.filter(d => d.selected).map(d => d.name).join(', ')
        : 'No especificados';
      
      const userQuery = `Perfil del corredor: Nombre: ${userProfile.name}, Edad: ${userProfile.age}, Sexo: ${userProfile.gender}, Nivel: ${userProfile.experienceLevel}, Ritmo: ${userProfile.pace}, Distancia máxima: ${userProfile.maxDistance}, Objetivo: ${userProfile.goal}, Lesiones: ${userProfile.injuries || 'Ninguna'}, Frecuencia semanal: ${userProfile.weeklyWorkouts}, Días de entrenamiento específicos: ${selectedDaysText}`;
      
      console.log("User query for embedding generation:", userQuery);
      
      const embeddingRes = await fetch(
        `${supabaseUrl}/functions/v1/generate-embedding`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ text: userQuery })
        }
      );
      
      if (!embeddingRes.ok) {
        throw new Error(`Error generating embedding: ${await embeddingRes.text()}`);
      }
      
      const embeddingData = await embeddingRes.json();
      if (!embeddingData.embedding || !Array.isArray(embeddingData.embedding)) {
        throw new Error('Invalid embedding response');
      }
      
      console.log("Embedding generated successfully with dimensions:", embeddingData.embedding.length);
      
      // Log dimension and type of user embedding
      console.log("User embedding length:", embeddingData.embedding.length, "Type:", typeof embeddingData.embedding[0]);
      // Log dimension and type of a fragment embedding
      const { data: sampleFragment } = await supabase.from('fragments').select('embedding').limit(1).single();
      if (sampleFragment) {
        console.log("Fragment embedding length:", sampleFragment.embedding.length, "Type:", typeof sampleFragment.embedding[0]);
      } else {
        console.log("No sample fragment found for embedding comparison");
      }
      
      // Call the match_fragments function with the correct parameter names
      const { data: fragments, error } = await supabase.rpc('match_fragments', {
        query_embedding: embeddingData.embedding,
        match_threshold: 0.6,
        match_count: 5
      });
      
      if (error) {
        console.error("Error in match_fragments RPC:", error);
        throw error;
      }
      
      if (fragments && fragments.length > 0) {
        ragActive = true;
        contextText = fragments.map((f, i) => `Fragmento ${i+1}:\n${f.content}`).join('\n\n');
        console.log("RAG Context retrieved successfully:", fragments.length, "fragments");
        console.log("First fragment content snippet:", fragments[0].content.substring(0, 100) + "...");
      } else {
        console.log("No relevant fragments found for RAG");
      }
    } catch (ragError) {
      console.error("Error during RAG processing:", ragError);
      // Continue without RAG context if there's an error
      contextText = "";
    }

    // 4. Prepare the prompt with or without RAG context
    const systemPrompt = `Eres un entrenador personal de running experimentado. Debes generar planes de entrenamiento semanales personalizados y seguros, basados en las mejores prácticas.`;
    
    // User profile section
    const selectedDaysInfo = userProfile.selectedDays && userProfile.selectedDays.length > 0 
      ? userProfile.selectedDays.filter(d => d.selected).map(d => `${d.name} (${d.date})`).join(', ')
      : 'No especificados - usar distribución general';
    
    const userProfileSection = `\nPERFIL DEL USUARIO:
Nombre: ${userProfile.name}
Edad: ${userProfile.age || 'No especificada'}
Sexo: ${userProfile.gender || 'No especificado'}
Nivel de experiencia: ${userProfile.experienceLevel || 'No especificado'}
Ritmo actual: ${userProfile.pace || 'No especificado'} min/km
Distancia máxima: ${userProfile.maxDistance || 'No especificada'} km
Objetivo: ${userProfile.goal}
Lesiones o condiciones: ${userProfile.injuries || 'Ninguna'}
Frecuencia semanal deseada: ${userProfile.weeklyWorkouts || '3'} entrenamientos por semana
Días específicos seleccionados: ${selectedDaysInfo}\n`;
    
    // RAG context section - make sure this part is used!
    const ragSection = contextText ? `\nDOCUMENTOS RELEVANTES PARA REFERENCIA:\n${contextText}\n` : '';
    
    // Previous week results section if available
    let previousResultsSection = '';
    if (previousWeekResults) {
      previousResultsSection = `\nRESULTADOS SEMANA ANTERIOR:
Semana número: ${previousWeekResults.weekNumber}
${previousWeekResults.workouts.map((w: any) => 
  `- ${w.day}: ${w.title} - ${w.completed ? 'Completado' : 'No completado'}
   Planeado: ${w.plannedDistance || 0}km, ${w.plannedDuration || 'N/A'}
   Real: ${w.actualDistance || 0}km, ${w.actualDuration || 'N/A'}`
).join('\n')}\n`;
    }
    
    // Dates for the plan (starting today)
    const datesList = nextWeekDates.map(d => 
      `${d.dayName} (${d.date.toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'})})`
    ).join(', ');
    
    // Check if user selected specific days
    const hasSelectedDays = userProfile.selectedDays && userProfile.selectedDays.length > 0;
    const trainingDaysText = hasSelectedDays 
      ? 'ÚNICAMENTE en los días específicos que seleccionó'
      : 'distribuidas adecuadamente en la semana';
    
    // Main instruction with dates
    const todayDate = new Date().toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'});
    
    const mainInstruction = `\nINSTRUCCIÓN:
Genera un plan de entrenamiento ${hasSelectedDays ? 'para los días específicos seleccionados por el usuario' : 'para los próximos días'} adecuado para ${userProfile.name}, un corredor ${userProfile.age ? `de ${userProfile.age} años` : ''} con ritmo ${userProfile.pace || 'no especificado'}, cuyo objetivo es ${userProfile.goal}.

HOY ES: ${todayDate}

${hasSelectedDays ? `CRÍTICO: El usuario ha seleccionado días específicos para entrenar. Las fechas proporcionadas son TODAS FUTURAS (hoy o posteriores). Crea entrenamientos SÓLO para estos días: ${datesList}

IMPORTANTE: NO generes entrenamientos para fechas pasadas. TODAS las fechas en la lista están en el futuro y son válidas para entrenar.` : `IMPORTANTE: TODAS las fechas proporcionadas son futuras (desde hoy en adelante). NO generes entrenamientos para fechas pasadas.`}

Incluye EXACTAMENTE ${nextWeekDates.length} sesiones de entrenamiento ${trainingDaysText}, especificando distancia/tiempo e intensidad de cada sesión.

Asegúrate de que el plan sea seguro y progresivo.

${hasSelectedDays ? 'DÍAS DE ENTRENAMIENTO FUTUROS SELECCIONADOS:' : 'DÍAS FUTUROS PARA ENTRENAR:'} ${datesList}

IMPORTANTE:
1. La distancia máxima del usuario es ${userProfile.maxDistance}km - NO crees entrenamientos que excedan esta distancia a menos que el usuario esté entrenando para un maratón y tenga experiencia suficiente.
2. La variedad es esencial. Crea diferentes tipos de entrenamientos (intervalos, tempo, carrera larga) alineados con el objetivo del usuario.
3. NO incluyas ninguna marca de formato como \`\`\`json o \`\`\`. Responde directamente con el objeto JSON sin ningún envoltorio.
4. Genera una respuesta en formato JSON siguiendo exactamente esta estructura:
{
  "name": "...",
  "description": "...",
  "duration": "7 días",
  "intensity": "...",
  "workouts": [
    {
      "day": "${nextWeekDates[0].dayName}",
      "date": "${nextWeekDates[0].date.toISOString().split('T')[0]}",
      "title": "...",
      "description": "...",
      "distance": número o null,
      "duration": "...",
      "type": "carrera|fuerza|descanso|flexibilidad"
    },
    ... para cada día de la semana
  ]
}`;

    // Custom prompt if provided
    const customPromptSection = customPrompt ? `\nINSTRUCCIONES PERSONALIZADAS:\n${customPrompt}\n` : '';
    
    // Build the final prompt
    const prompt = `${systemPrompt}\n${userProfileSection}${ragSection}${previousResultsSection}${customPromptSection}${mainInstruction}`;
    console.log("Prepared prompt for Gemini:", prompt.substring(0, 200) + "...");
    console.log("RAG active:", ragActive ? "YES" : "NO");
    console.log("RAG context length:", contextText.length);

    // 5. Call Gemini
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error', details: 'AI service not configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      );
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
    console.log("Calling Gemini API...");
    
    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError);
      return new Response(
        JSON.stringify({ 
          error: 'AI service error', 
          details: 'Failed to generate training plan content',
          originalError: geminiError.message 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 503,
        },
      );
    }
    
    const response = await result.response;
    const text = response.text();
    console.log("Received response from Gemini:", text.substring(0, 200) + "...");

    // 6. Parse the response and return the plan
    try {
      // Trim any extra characters or markdown that may be included
      let cleanJson = text.trim();
      
      // Remove any markdown code block indicators if present
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/```json\n/, '').replace(/\n```$/, '');
      } else if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/```\n/, '').replace(/\n```$/, '');
      }
      
      const plan = JSON.parse(cleanJson);
      
      // Ensure all workouts have a date field
      for (let i = 0; i < plan.workouts.length; i++) {
        if (!plan.workouts[i].date && i < nextWeekDates.length) {
          plan.workouts[i].date = nextWeekDates[i].date.toISOString().split('T')[0];
        }
      }
      
      // 7. Store the plan in Supabase
      console.log("Storing training plan in Supabase...");
      
      try {
        // First, check if we have a user profile in the database
        let userProfileId = userProfile.id;
        
        // If not, create a profile from the provided data
        if (!userProfileId) {
          const { data: userProfileData, error: userProfileError } = await supabase
            .from('user_profiles')
            .insert({
              name: userProfile.name,
              age: userProfile.age,
              gender: userProfile.gender,
              max_distance: userProfile.maxDistance,
              pace: userProfile.pace,
              goal: userProfile.goal,
              weekly_workouts: userProfile.weeklyWorkouts,
              experience_level: userProfile.experienceLevel,
              injuries: userProfile.injuries
            })
            .select('id')
            .single();
          
          if (userProfileError) {
            console.error("Error saving user profile:", userProfileError);
          } else {
            console.log("User profile saved successfully:", userProfileData);
            userProfileId = userProfileData.id;
          }
        }
        
        // Save the training plan
        const { data: trainingPlanData, error: trainingPlanError } = await supabase
          .from('training_plans')
          .insert({
            user_id: userProfileId,
            name: plan.name,
            description: plan.description,
            duration: plan.duration,
            intensity: plan.intensity,
            week_number: previousWeekResults?.weekNumber ? previousWeekResults.weekNumber + 1 : 1,
            start_date: new Date().toISOString().split('T')[0]
          })
          .select()
          .single();
        
        if (trainingPlanError) {
          console.error("Error saving training plan:", trainingPlanError);
        } else {
          console.log("Training plan saved successfully:", trainingPlanData);
          
          // Save each workout session
          const sessionsToInsert = plan.workouts.map((workout: any, index: number) => {
            // Ensure we have a valid date from the workout or calculate it
            let workoutDate = workout.date ? new Date(workout.date) : new Date();
            if (!workout.date) {
              workoutDate.setDate(new Date().getDate() + index);
            }
            
            return {
              plan_id: trainingPlanData.id,
              day_number: index + 1,
              day_date: workoutDate.toISOString().split('T')[0],
              title: workout.title,
              description: workout.description,
              type: workout.type,
              planned_distance: workout.distance,
              planned_duration: workout.duration,
              target_pace: userProfile.pace,
              completed: false
            };
          });
          
          const { data: sessionsData, error: sessionsError } = await supabase
            .from('training_sessions')
            .insert(sessionsToInsert);
          
          if (sessionsError) {
            console.error("Error saving workout sessions:", sessionsError);
          } else {
            console.log("Training sessions saved successfully:", sessionsData ? sessionsData.length : 0, "sessions");
          }
        }
      } catch (dbError) {
        console.error("Error storing data in Supabase:", dbError);
        // Continue to return the plan even if DB storage fails
      }
      
      // Add RAG status to the response
      plan.ragActive = ragActive;
      
      return new Response(
        JSON.stringify(plan),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      console.error("Raw response was:", text);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response format from AI model',
          details: 'Failed to parse AI response as valid JSON',
          rawResponse: text.substring(0, 500) + '...'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 502,
        },
      );
    }
  } catch (error) {
    console.error("Unexpected error in edge function:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
