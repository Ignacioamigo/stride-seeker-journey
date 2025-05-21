
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserProfile {
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
  completedOnboarding: boolean;
}

interface RequestBody {
  userProfile: UserProfile;
  relevantFragments?: string[];
  min_similarity?: number;
  match_count?: number;
  previousWeekResults?: PreviousWeekResults;
}

interface PreviousWeekResults {
  weekNumber: number;
  workouts: Array<{
    day: string;
    title: string;
    completed: boolean;
    plannedDistance: number | null;
    actualDistance: number | null;
    plannedDuration: string | null;
    actualDuration: string | null;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Edge function generate-training-plan invoked\n");
    
    // Get request body
    const requestData = await req.json() as RequestBody;
    const { 
      userProfile, 
      min_similarity = 0.6, 
      match_count = 5,
      previousWeekResults,
      relevantFragments
    } = requestData;

    // Validate required fields
    if (!userProfile || !userProfile.name || !userProfile.goal) {
      throw new Error('Missing required user profile information');
    }

    // Checking for Gemini API key
    console.log("Checking Gemini API key...\n");
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    console.log(`API key found, length: ${apiKey.length}\n`);

    // Initialize Gemini
    console.log("Calling Gemini API to generate the plan\n");
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use gemini-1.5-pro for better context handling
    const modelName = "gemini-1.5-pro";
    console.log(`API URL: https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=[REDACTED]\n`);
    
    const model = genAI.getGenerativeModel({ model: modelName });

    // Prepare RAG context
    let contextText = '';
    
    // Use fragments provided by the client if available
    if (relevantFragments && relevantFragments.length > 0) {
      console.log(`Using ${relevantFragments.length} provided fragments for context`);
      contextText = relevantFragments
        .map((fragment, i) => `Documento relevante ${i+1}:\n${fragment}`)
        .join('\n\n');
    } else {
      // Get relevant fragments via a dedicated search
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      
      // Generate search query embedding
      console.log("Generating embedding for RAG search...\n");
      const searchQuery = `${userProfile.goal} ${userProfile.experienceLevel} running training plan ${userProfile.maxDistance}km pace ${userProfile.pace}`;
      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('generate-embedding', {
        body: { text: searchQuery }
      });
      
      if (embeddingError) {
        console.error("Error generating embedding for search:", embeddingError);
        throw new Error('Error generating embedding for RAG search');
      }
      
      if (!embeddingData || !embeddingData.embedding) {
        console.error("No embedding returned from generate-embedding function");
        throw new Error('Failed to generate embedding for RAG search');
      }
      
      console.log("Successfully generated embedding for RAG search\n");
      
      // Query fragments with the new function parameters
      const { data: fragments, error } = await supabase.rpc('match_fragments', {
        query_embedding: embeddingData.embedding,
        match_threshold: min_similarity,
        match_count
      });
      
      if (error) {
        console.error('Error retrieving fragments:', error.message);
        throw new Error('Error retrieving fragments: ' + error.message);
      }
      
      // Log fragments and similarity
      console.log(`Found ${fragments?.length || 0} relevant fragments for context:`);
      if (fragments && fragments.length > 0) {
        fragments.forEach((frag: any, i: number) => {
          console.log(`Fragment ${i+1}: sim=${frag.similarity?.toFixed(2) ?? 'N/A'}\n${frag.content.slice(0, 100)}...`);
        });
        
        // Build context
        contextText = fragments
          .map((f: any, i: number) => `Documento relevante ${i+1} (similitud ${f.similarity?.toFixed(2) ?? 'N/A'}):\n${f.content}`)
          .join('\n\n');
      } else {
        console.log("No relevant fragments found, proceeding with base knowledge");
      }
    }

    // Structured prompt following the specified format
    const systemPrompt = `Eres un entrenador personal de running experimentado. Debes generar planes de entrenamiento semanales personalizados y seguros, basados en las mejores prácticas. Tu objetivo es crear un plan de entrenamiento efectivo y personalizado que se adapte perfectamente a las necesidades y metas del usuario.`;
    
    // User profile section
    let userProfileSection = `
PERFIL DEL USUARIO:
Nombre: ${userProfile.name}
Edad: ${userProfile.age || 'No especificada'}
Sexo: ${userProfile.gender || 'No especificado'}
Nivel de experiencia: ${userProfile.experienceLevel || 'No especificado'}
Ritmo actual: ${userProfile.pace || 'No especificado'} min/km
Distancia máxima: ${userProfile.maxDistance || 'No especificada'} km
Objetivo: ${userProfile.goal}
Lesiones o condiciones: ${userProfile.injuries || 'Ninguna'}
Frecuencia semanal deseada: ${userProfile.weeklyWorkouts || '3'} entrenamientos por semana
`;

    // Previous week results context if available
    let previousWeekContext = "";
    if (previousWeekResults) {
      previousWeekContext = `
RESULTADOS DE LA SEMANA ANTERIOR (Semana ${previousWeekResults.weekNumber}):
${previousWeekResults.workouts.map(w => 
  `- ${w.day}: ${w.title} - ${w.completed ? 'COMPLETADO' : 'NO COMPLETADO'}
   Planificado: ${w.plannedDistance ? w.plannedDistance + 'km' : ''} ${w.plannedDuration || ''}
   Real: ${w.actualDistance ? w.actualDistance + 'km' : ''} ${w.actualDuration || ''}`
).join('\n')}

Basándote en estos resultados, ajusta el plan para proporcionar una progresión adecuada.
`;
    }

    // Main instruction
    const mainInstruction = `
INSTRUCCIÓN:
Genera un plan de entrenamiento para los próximos 7 días (1 semana) adecuado para ${userProfile.name}, un corredor de ${userProfile.age || ''} años con ritmo ${userProfile.pace || 'no especificado'}, cuyo objetivo es ${userProfile.goal}.
Incluye EXACTAMENTE ${userProfile.weeklyWorkouts || 3} sesiones de entrenamiento como indicó, especificando distancia/tiempo e intensidad de cada sesión.
Asegúrate de que el plan sea seguro y progresivo.
Formato: Proporciona el plan para cada día de la semana (Lunes a Domingo), con una breve descripción de cada sesión.

IMPORTANTE:
1. La distancia máxima del usuario es ${userProfile.maxDistance}km - NO crees entrenamientos que excedan esta distancia a menos que el usuario esté entrenando para un maratón y tenga experiencia suficiente.
2. La variedad es esencial. Crea diferentes tipos de entrenamientos (intervalos, tempo, carrera larga) alineados con el objetivo del usuario.
3. Genera una respuesta SOLO en formato JSON con esta estructura:
{
  "name": "..." (nombre del plan),
  "description": "..." (descripción breve),
  "duration": "7 días",
  "intensity": "..." (baja, media o alta según nivel),
  "workouts": [
    {
      "day": "Lunes",
      "title": "..." (título breve),
      "description": "..." (descripción detallada),
      "distance": número o null,
      "duration": "..." (duración estimada),
      "type": "carrera|fuerza|descanso|flexibilidad"
    },
    ...para cada día de la semana
  ]
}
`;

    // Complete prompt
    let prompt = `${systemPrompt}

${userProfileSection}

${contextText ? 'DOCUMENTOS RELEVANTES PARA REFERENCIA:\n' + contextText + '\n\n' : ''}

${previousWeekContext}

${mainInstruction}`;

    // Generate the plan
    console.log("Generating plan with Gemini...");
    const result = await model.generateContent(prompt);
    console.log("Response received from Gemini API\n");
    
    const response = await result.response;
    const text = response.text();
    console.log(`Generated text length: ${text.length}\n`);
    console.log("Text generated by Gemini, processing to extract the plan...\n");

    // Function to extract JSON from text that may contain markdown code blocks
    const extractJsonFromText = (text: string): string => {
      // Look for JSON blocks with triple backtick
      const jsonBlockRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/g;
      const match = jsonBlockRegex.exec(text);
      
      if (match && match[1]) {
        console.log("JSON extracted from markdown code blocks\n");
        return match[1].trim();
      }
      
      // If no code blocks, look for a JSON object directly
      const jsonRegex = /(\{[\s\S]*\})/g;
      const directMatch = jsonRegex.exec(text);
      
      if (directMatch && directMatch[1]) {
        return directMatch[1].trim();
      }
      
      // If no JSON found, return the original text
      return text;
    };

    // Extract and parse JSON
    const jsonText = extractJsonFromText(text);
    let plan;

    try {
      plan = JSON.parse(jsonText);
      console.log("Plan JSON parsed successfully\n");
      
      // Validate the number of active workout days
      const activeWorkouts = plan.workouts.filter((w: any) => w.type !== 'descanso');
      if (activeWorkouts.length !== userProfile.weeklyWorkouts) {
        console.warn(`Warning: Plan has ${activeWorkouts.length} active workouts but user requested ${userProfile.weeklyWorkouts}`);
        
        // Fix the plan to match requested workout days
        if (activeWorkouts.length > userProfile.weeklyWorkouts) {
          // Convert some active days to rest days
          const workoutsToKeep = activeWorkouts
            .sort((a: any, b: any) => {
              // Prioritize keeping runs with higher distance
              if (a.type === 'carrera' && b.type === 'carrera') {
                return (b.distance || 0) - (a.distance || 0);
              }
              // Priority: carrera > fuerza > flexibilidad
              const typePriority = { 'carrera': 3, 'fuerza': 2, 'flexibilidad': 1 };
              return typePriority[b.type as keyof typeof typePriority] - typePriority[a.type as keyof typeof typePriority];
            })
            .slice(0, userProfile.weeklyWorkouts)
            .map((w: any) => w.day);
            
          plan.workouts = plan.workouts.map((w: any) => {
            if (w.type !== 'descanso' && !workoutsToKeep.includes(w.day)) {
              return {
                ...w,
                title: "Día de descanso",
                description: "Descansa para recuperarte adecuadamente",
                distance: null,
                duration: null,
                type: "descanso"
              };
            }
            return w;
          });
          
          console.log("Adjusted plan to match requested workout days\n");
        }
      }
      
      // Check if the distances are appropriate for the user's level
      if (userProfile.maxDistance) {
        const maxPlanDistance = Math.max(...plan.workouts
          .filter((w: any) => w.distance)
          .map((w: any) => w.distance || 0));
          
        if (maxPlanDistance > userProfile.maxDistance * 1.1) {
          console.warn(`Warning: Plan contains distances (${maxPlanDistance}km) greater than user max (${userProfile.maxDistance}km)`);
          
          // Scale down distances
          plan.workouts = plan.workouts.map((w: any) => {
            if (w.distance && w.distance > userProfile.maxDistance) {
              const newDistance = Math.round(userProfile.maxDistance * 0.9 * 10) / 10;
              w.title = w.title.replace(/\d+(\.\d+)?/, newDistance.toString());
              w.description = w.description.replace(/\d+(\.\d+)?\s*km/, `${newDistance} km`);
              w.distance = newDistance;
            }
            return w;
          });
          
          console.log("Adjusted distances to match user's maximum\n");
        }
      }
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      throw new Error('Invalid response format from AI model');
    }

    console.log("Returning plan data\n");
    // Return the plan
    return new Response(
      JSON.stringify(plan),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
