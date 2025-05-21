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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get request body
    const { userProfile, context } = await req.json() as RequestBody;

    // Validate required fields
    if (!userProfile || !userProfile.name || !userProfile.goal) {
      throw new Error('Missing required user profile information');
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create the prompt with RAG context
    const prompt = `
    Eres un experto entrenador de running que genera planes de entrenamiento personalizados.
    
    ${context ? `Aquí tienes información relevante sobre entrenamientos y mejores prácticas:
    ${context}
    ` : ''}
    
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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let plan;
    try {
      plan = JSON.parse(text);
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      throw new Error('Invalid response format from AI model');
    }

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
