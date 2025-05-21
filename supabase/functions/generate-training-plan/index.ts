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
  embedding: number[];
}

interface RequestBody {
  userProfile: UserProfile;
  relevantFragments?: string[];
  min_similarity?: number;
  match_count?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Edge function generate-training-plan invocada\n");
    
    // Get request body
    const { userProfile, min_similarity = 0.6, match_count = 5 } = await req.json() as RequestBody;

    // Validate required fields
    if (!userProfile || !userProfile.name || !userProfile.goal) {
      throw new Error('Missing required user profile information');
    }

    // Verificando la clave de API de Gemini
    console.log("Verificando la clave de API de Gemini...\n");
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    console.log(`Clave de API encontrada, longitud: ${apiKey.length}\n`);

    // Initialize Gemini
    console.log("Llamando a la API de Gemini para generar el plan\n");
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use gemini-1.5-pro for better context handling
    const modelName = "gemini-1.5-pro";
    console.log(`URL de la API: https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=[REDACTED]\n`);
    
    const model = genAI.getGenerativeModel({ model: modelName });

    // Prepare RAG context
    let ragContext = '';
    
    // Obtener embedding del perfil
    // (Aquí deberías tener el embedding generado y pasado, o generarlo aquí si tienes la función)
    // Por simplicidad, asumimos que ya tienes el embedding en la petición o lo generas aquí

    // Recuperar fragmentos relevantes
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const query_embedding = userProfile.embedding; // Debes pasar el embedding en la petición o generarlo aquí
    const { data: fragments, error } = await supabase.rpc('match_fragments', {
      query_embedding,
      match_count,
      min_similarity
    });
    if (error) throw new Error('Error al recuperar fragmentos: ' + error.message);

    // Logging de fragmentos y similitud
    console.log('Selected fragments for context:');
    fragments.forEach((frag, i) => {
      console.log(`Fragment ${i+1}: sim=${frag.similarity?.toFixed(2) ?? 'N/A'}\n${frag.content.slice(0, 100)}...`);
    });

    // Construir el contexto
    const contextText = fragments
      .map((f, i) => `Fragmento ${i+1} (similitud ${f.similarity?.toFixed(2) ?? 'N/A'}):\n${f.content}`)
      .join('\n\n');

    // Prompt mejorado
    const prompt = `
Eres un asistente experto en running. Usa SOLO el contexto proporcionado para personalizar el plan.

Contexto:
${contextText}

Perfil del usuario:
${JSON.stringify(userProfile, null, 2)}

Genera un plan semanal en formato JSON:
{
  "name": "...",
  "description": "...",
  "duration": "...",
  "intensity": "...",
  "workouts": [
    {
      "day": "...",
      "title": "...",
      "description": "...",
      "distance": ...,
      "duration": "...",
      "type": "carrera|fuerza|descanso|flexibilidad"
    }
  ]
}
`;

    // Generate the plan
    console.log("Generando plan con Gemini...");
    const result = await model.generateContent(prompt);
    console.log("Respuesta recibida de la API de Gemini\n");
    
    const response = await result.response;
    const text = response.text();
    console.log(`Longitud del texto generado: ${text.length}\n`);
    console.log("Texto generado por Gemini, procesando para extraer el plan...\n");

    // Función para extraer JSON de texto que puede contener bloques de código markdown
    const extractJsonFromText = (text: string): string => {
      // Buscar bloques de código JSON con triple backtick
      const jsonBlockRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/g;
      const match = jsonBlockRegex.exec(text);
      
      if (match && match[1]) {
        console.log("JSON extraído de bloques de código markdown\n");
        return match[1].trim();
      }
      
      // Si no hay bloques de código, buscar un objeto JSON directamente
      const jsonRegex = /(\{[\s\S]*\})/g;
      const directMatch = jsonRegex.exec(text);
      
      if (directMatch && directMatch[1]) {
        return directMatch[1].trim();
      }
      
      // Si no se encuentra JSON, devolver el texto original
      return text;
    };

    // Extraer y parsear el JSON
    const jsonText = extractJsonFromText(text);
    let plan;

    try {
      plan = JSON.parse(jsonText);
      console.log("JSON del plan analizado correctamente\n");
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      throw new Error('Invalid response format from AI model');
    }

    console.log("Devolviendo datos del plan\n");
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
