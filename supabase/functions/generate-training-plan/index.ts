
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
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    
    // Get day of week in Spanish
    const dayNumber = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    // Convert to our format where 0 = Monday
    const adjustedDayNumber = dayNumber === 0 ? 6 : dayNumber - 1;
    const dayName = getDayMapping(adjustedDayNumber);
    
    dates.push({ date, dayName });
  }
  
  return dates;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Get data from the request
    const { userProfile, previousWeekResults, customPrompt } = await req.json() as RequestBody;
    if (!userProfile || !userProfile.goal) {
      throw new Error('Missing required user profile information');
    }

    console.log("Processing request with user profile:", JSON.stringify(userProfile));
    
    // Generate the dates from today for the next 7 days
    const nextWeekDates = generateDatesFromToday();
    console.log("Generated dates:", nextWeekDates.map(d => `${d.dayName}: ${d.date.toISOString().split('T')[0]}`));

    // 2. Prepare RAG context
    let contextText = '';
    try {
      // Try to get relevant RAG content from the database
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      // Generate embedding for the user's goal and profile
      const embeddingRes = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-embedding`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            text: `Perfil del corredor: Nombre: ${userProfile.name}, Edad: ${userProfile.age}, Sexo: ${userProfile.gender}, Nivel: ${userProfile.experienceLevel}, Ritmo: ${userProfile.pace}, Distancia máxima: ${userProfile.maxDistance}, Objetivo: ${userProfile.goal}, Lesiones: ${userProfile.injuries}, Frecuencia semanal: ${userProfile.weeklyWorkouts}`
          })
        }
      );
      
      if (embeddingRes.ok) {
        const embeddingData = await embeddingRes.json();
        const embedding = embeddingData.embedding;
        
        if (embedding && Array.isArray(embedding)) {
          // Retrieve relevant fragments using vector similarity search
          const { data: fragments, error } = await supabase.rpc('match_fragments', {
            query_embedding: embedding,
            match_threshold: 0.6,
            match_count: 5
          });
          
          if (!error && fragments && fragments.length > 0) {
            contextText = fragments.map((f: any, i: number) => 
              `Fragmento ${i+1}:\n${f.content}`
            ).join('\n\n');
            console.log("Retrieved RAG context successfully");
          } else {
            console.log("No relevant RAG fragments found or error:", error);
          }
        }
      }
    } catch (ragError) {
      console.error("Error during RAG processing:", ragError);
      // Continue without RAG if there's an error
    }

    // 3. Prepare the prompt following the structure defined in the requirements
    const systemPrompt = `Eres un entrenador personal de running experimentado. Debes generar planes de entrenamiento semanales personalizados y seguros, basados en las mejores prácticas.`;
    
    // User profile section
    const userProfileSection = `\nPERFIL DEL USUARIO:
Nombre: ${userProfile.name}
Edad: ${userProfile.age || 'No especificada'}
Sexo: ${userProfile.gender || 'No especificado'}
Nivel de experiencia: ${userProfile.experienceLevel || 'No especificado'}
Ritmo actual: ${userProfile.pace || 'No especificado'} min/km
Distancia máxima: ${userProfile.maxDistance || 'No especificada'} km
Objetivo: ${userProfile.goal}
Lesiones o condiciones: ${userProfile.injuries || 'Ninguna'}
Frecuencia semanal deseada: ${userProfile.weeklyWorkouts || '3'} entrenamientos por semana\n`;
    
    // RAG context section
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
    
    // Main instruction with dates
    const mainInstruction = `\nINSTRUCCIÓN:
Genera un plan de entrenamiento para los próximos 7 días comenzando desde HOY (${nextWeekDates[0].date.toLocaleDateString('es-ES')}) adecuado para ${userProfile.name}, un corredor ${userProfile.age ? `de ${userProfile.age} años` : ''} con ritmo ${userProfile.pace || 'no especificado'}, cuyo objetivo es ${userProfile.goal}.

Incluye EXACTAMENTE ${userProfile.weeklyWorkouts || 3} sesiones de entrenamiento como indicó, distribuidas adecuadamente en la semana, especificando distancia/tiempo e intensidad de cada sesión.

Asegúrate de que el plan sea seguro y progresivo.

Los días de la semana para este período son: ${datesList}

IMPORTANTE:
1. La distancia máxima del usuario es ${userProfile.maxDistance}km - NO crees entrenamientos que excedan esta distancia a menos que el usuario esté entrenando para un maratón y tenga experiencia suficiente.
2. La variedad es esencial. Crea diferentes tipos de entrenamientos (intervalos, tempo, carrera larga) alineados con el objetivo del usuario.
3. NO incluyas ninguna marca de formato como \`\`\`json o ```. Responde directamente con el objeto JSON sin ningún envoltorio.
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
    console.log("Prepared prompt for LLM:", prompt.substring(0, 200) + "...");

    // 4. Call Gemini
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    console.log("Calling Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Received response from Gemini:", text.substring(0, 200) + "...");

    // 5. Parse the response and return the plan
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
      
      return new Response(
        JSON.stringify(plan),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    } catch (e) {
      console.error("Failed to parse LLM response:", e, "Response was:", text);
      throw new Error('Invalid response format from AI model');
    }
  } catch (error) {
    console.error("Error in edge function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
