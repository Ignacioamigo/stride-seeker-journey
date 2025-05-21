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
  min_similarity?: number;
  match_count?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Obtener datos de la petición
    const { userProfile, min_similarity = 0.6, match_count = 5 } = await req.json() as RequestBody;
    if (!userProfile || !userProfile.goal) {
      throw new Error('Missing required user profile information');
    }

    // 2. Generar el embedding del perfil llamando a la función generate-embedding
    const embeddingRes = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-embedding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        text: `Perfil del corredor:\nNombre: ${userProfile.name}\nEdad: ${userProfile.age}\nSexo: ${userProfile.gender}\nNivel: ${userProfile.experienceLevel}\nRitmo: ${userProfile.pace}\nDistancia máxima: ${userProfile.maxDistance}\nObjetivo: ${userProfile.goal}\nLesiones: ${userProfile.injuries}\nFrecuencia semanal: ${userProfile.weeklyWorkouts}`
      })
    });
    if (!embeddingRes.ok) throw new Error('Error generating embedding');
    const embeddingData = await embeddingRes.json();
    const embedding = embeddingData.embedding;
    if (!embedding || !Array.isArray(embedding)) throw new Error('No embedding returned');

    // 3. Recuperar fragmentos relevantes de la base de datos
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: fragments, error } = await supabase.rpc('match_fragments', {
      query_embedding: embedding,
      match_count,
      min_similarity
    });
    if (error) throw new Error('Error retrieving RAG fragments: ' + error.message);

    // 4. Preparar el contexto RAG
    const contextText = fragments && fragments.length > 0
      ? fragments.map((f: any, i: number) => `Fragmento ${i+1}:\n${f.content}`).join('\n\n')
      : '';

    // 5. Preparar el prompt siguiendo la estructura profesional
    const systemPrompt = `Eres un entrenador personal de running experimentado. Debes generar planes de entrenamiento semanales personalizados y seguros, basados en las mejores prácticas.`;
    const userProfileSection = `\nPERFIL DEL USUARIO:\nNombre: ${userProfile.name}\nEdad: ${userProfile.age || 'No especificada'}\nSexo: ${userProfile.gender || 'No especificado'}\nNivel de experiencia: ${userProfile.experienceLevel || 'No especificado'}\nRitmo actual: ${userProfile.pace || 'No especificado'} min/km\nDistancia máxima: ${userProfile.maxDistance || 'No especificada'} km\nObjetivo: ${userProfile.goal}\nLesiones o condiciones: ${userProfile.injuries || 'Ninguna'}\nFrecuencia semanal deseada: ${userProfile.weeklyWorkouts || '3'} entrenamientos por semana\n`;
    const ragSection = contextText ? `\nDOCUMENTOS RELEVANTES PARA REFERENCIA:\n${contextText}\n` : '';
    const mainInstruction = `\nINSTRUCCIÓN:\nGenera un plan de entrenamiento para los próximos 7 días (1 semana) adecuado para ${userProfile.name}, un corredor de ${userProfile.age || ''} años con ritmo ${userProfile.pace || 'no especificado'}, cuyo objetivo es ${userProfile.goal}.\nIncluye EXACTAMENTE ${userProfile.weeklyWorkouts || 3} sesiones de entrenamiento como indicó, especificando distancia/tiempo e intensidad de cada sesión.\nAsegúrate de que el plan sea seguro y progresivo.\nFormato: Proporciona el plan para cada día de la semana (Lunes a Domingo), con una breve descripción de cada sesión.\n\nIMPORTANTE:\n1. La distancia máxima del usuario es ${userProfile.maxDistance}km - NO crees entrenamientos que excedan esta distancia a menos que el usuario esté entrenando para un maratón y tenga experiencia suficiente.\n2. La variedad es esencial. Crea diferentes tipos de entrenamientos (intervalos, tempo, carrera larga) alineados con el objetivo del usuario.\n3. Genera una respuesta SOLO en formato JSON con esta estructura:\n{\n  "name": "...",\n  "description": "...",\n  "duration": "7 días",\n  "intensity": "...",\n  "workouts": [\n    {\n      "day": "Lunes",\n      "title": "...",\n      "description": "...",\n      "distance": número o null,\n      "duration": "...",\n      "type": "carrera|fuerza|descanso|flexibilidad"\n    },\n    ...para cada día de la semana\n  ]\n}`;
    const prompt = `${systemPrompt}\n${userProfileSection}${ragSection}${mainInstruction}`;

    // 6. Llamar a Gemini
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 7. Parsear la respuesta y devolver el plan
    let plan;
    try {
      plan = JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid response format from AI model');
    }
    return new Response(
      JSON.stringify(plan),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
