
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
  context?: string;
  relevantFragments?: string[]; // Ahora aceptamos fragmentos relevantes
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Edge function generate-training-plan invocada\n");
    
    // Get request body
    const { userProfile, context, relevantFragments } = await req.json() as RequestBody;

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
    
    // Si tenemos fragmentos relevantes, los usamos para construir el contexto
    if (relevantFragments && relevantFragments.length > 0) {
      ragContext = `Aquí tienes información relevante sobre entrenamientos y mejores prácticas para running que debes usar para generar un plan mejor adaptado:\n\n`;
      relevantFragments.forEach((fragment, index) => {
        ragContext += `Documento ${index + 1}:\n${fragment}\n\n`;
      });
    } else if (context) {
      // Usar el contexto directo si se proporcionó
      ragContext = `Aquí tienes información relevante sobre entrenamientos y mejores prácticas:\n${context}\n`;
    }

    // Create the prompt with RAG context
    const prompt = `
    Eres un experto entrenador de running que genera planes de entrenamiento personalizados.
    
    ${ragContext ? ragContext : ''}
    
    Genera un plan de entrenamiento semanal para el siguiente perfil:
    - Nombre: ${userProfile.name}
    - Edad: ${userProfile.age || 'No especificada'}
    - Género: ${userProfile.gender || 'No especificado'}
    - Nivel de experiencia: ${userProfile.experienceLevel || 'No especificado'}
    - Distancia máxima recorrida: ${userProfile.maxDistance ? `${userProfile.maxDistance} km` : 'No especificada'}
    - Ritmo actual: ${userProfile.pace || 'No especificado'}
    - Objetivo: ${userProfile.goal}
    - Entrenamientos semanales: ${userProfile.weeklyWorkouts || 'No especificado'}
    - Lesiones o limitaciones: ${userProfile.injuries || 'Ninguna'}

    El plan debe incluir:
    1. Un nombre descriptivo
    2. Una descripción general
    3. La duración del plan
    4. El nivel de intensidad
    5. Una lista de entrenamientos para cada día de la semana, incluyendo:
       - Día de la semana
       - Título del entrenamiento
       - Descripción detallada
       - Distancia (en km) si aplica
       - Duración (en minutos)
       - Tipo de entrenamiento (carrera, fuerza, descanso, flexibilidad)

    Responde en formato JSON con la siguiente estructura:
    {
      "name": "string",
      "description": "string",
      "duration": "string",
      "intensity": "string",
      "workouts": [
        {
          "day": "string",
          "title": "string",
          "description": "string",
          "distance": number | null,
          "duration": "string",
          "type": "carrera" | "fuerza" | "descanso" | "flexibilidad"
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
