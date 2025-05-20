
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userProfile, context } = await req.json();

    if (!userProfile) {
      return new Response(
        JSON.stringify({ error: 'Missing user profile' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Get API key from environment variable
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Create system prompt with running expertise
    const systemPrompt = `Eres un entrenador de running profesional y experto. 
    Tu tarea es crear un plan de entrenamiento personalizado de 7 días para un corredor, basado en su perfil 
    y en tus conocimientos sobre entrenamiento de running.
    
    El plan debe estar adaptado al nivel del corredor y tener en cuenta sus objetivos, lesiones, y capacidades.
    Incluye descansos apropiados y variación en los tipos de entrenamiento.
    
    La respuesta debe estar en español y debe estar estructurada en formato JSON como este:
    {
      "name": "Nombre del plan",
      "description": "Descripción general del plan",
      "duration": "7 días",
      "intensity": "Intensidad general del plan",
      "workouts": [
        {
          "day": "Lunes",
          "title": "Título del entrenamiento",
          "description": "Descripción detallada",
          "distance": null o número en km,
          "duration": "Duración estimada",
          "type": "carrera|descanso|fuerza|flexibilidad|otro"
        },
        // Repetir para cada día de la semana
      ]
    }
    
    CONOCIMIENTOS ESPECÍFICOS DE RUNNING:
    ${context || 'Basa tu plan en principios generales de entrenamiento de running.'}
    `;

    // Format user profile for prompt
    const userPrompt = `
    Perfil del corredor:
    - Nombre: ${userProfile.name}
    - Edad: ${userProfile.age || 'No especificado'}
    - Género: ${userProfile.gender || 'No especificado'} 
    - Altura: ${userProfile.height ? `${userProfile.height} cm` : 'No especificado'}
    - Peso: ${userProfile.weight ? `${userProfile.weight} kg` : 'No especificado'}
    - Nivel de experiencia: ${userProfile.experienceLevel || 'No especificado'}
    - Distancia máxima recorrida: ${userProfile.maxDistance ? `${userProfile.maxDistance} km` : 'No especificado'}
    - Ritmo actual: ${userProfile.pace || 'No especificado'}
    - Objetivo: ${userProfile.goal}
    - Entrenamientos semanales deseados: ${userProfile.weeklyWorkouts || 'No especificado'}
    - Lesiones o limitaciones: ${userProfile.injuries || 'Ninguna'}
    
    Genera un plan de entrenamiento personalizado de 7 días para este corredor.
    `;

    // Call the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemPrompt },
                { text: userPrompt }
              ]
            }
          ],
          generation_config: {
            temperature: 0.2,
            top_p: 0.95,
            top_k: 40,
            max_output_tokens: 8192
          }
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response 
    // (sometimes Gemini includes markdown code blocks or additional text)
    let jsonString = generatedText;
    const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                      generatedText.match(/```\n([\s\S]*?)\n```/) ||
                      generatedText.match(/{[\s\S]*}/);
                      
    if (jsonMatch) {
      jsonString = jsonMatch[0].replace(/```json\n|```\n|```/g, '');
    }
    
    // Parse the JSON plan
    let plan;
    try {
      plan = JSON.parse(jsonString);
    } catch (e) {
      // If JSON parsing fails, use a regex approach to extract the plan
      console.error("JSON parsing failed, attempting to extract plan manually");
      plan = {
        name: "Plan de entrenamiento personalizado",
        description: "Plan adaptado a tu perfil y objetivos",
        duration: "7 días",
        intensity: "Adaptada a tu nivel",
        workouts: extractWorkoutsFromText(generatedText)
      };
    }

    return new Response(
      JSON.stringify({ plan }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});

// Fallback function to extract workouts from text if JSON parsing fails
function extractWorkoutsFromText(text) {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const workouts = [];
  
  for (const day of days) {
    const dayRegex = new RegExp(`${day}[\\s\\S]*?(?=${days.filter(d => d !== day).join('|')}|$)`, 'i');
    const match = text.match(dayRegex);
    
    if (match) {
      const content = match[0];
      const titleMatch = content.match(/(?:${day}:?\s*)([^\n]+)/i);
      const descriptionMatch = content.match(/(?:descripción|description):?\s*([^\n]+)/i);
      const distanceMatch = content.match(/(?:distancia|distance):?\s*(\d+(?:\.\d+)?)\s*km/i);
      const durationMatch = content.match(/(?:duración|duration):?\s*([^\n]+?)(?:min|$)/i);
      const typeMatch = content.match(/(?:tipo|type):?\s*([^\n]+)/i);
      
      workouts.push({
        day,
        title: titleMatch ? titleMatch[1].trim() : `Entrenamiento de ${day}`,
        description: descriptionMatch ? descriptionMatch[1].trim() : content.split('\n').slice(1).join(' ').trim(),
        distance: distanceMatch ? parseFloat(distanceMatch[1]) : null,
        duration: durationMatch ? durationMatch[1].trim() : null,
        type: determineWorkoutType(content)
      });
    } else {
      // If no match for this day, create a rest day
      workouts.push({
        day,
        title: `Descanso`,
        description: "Día de recuperación",
        distance: null,
        duration: null,
        type: "descanso"
      });
    }
  }
  
  return workouts;
}

function determineWorkoutType(content) {
  const content_lower = content.toLowerCase();
  if (content_lower.includes('descanso') || content_lower.includes('rest') || content_lower.includes('recuperación')) {
    return 'descanso';
  } else if (content_lower.includes('fuerza') || content_lower.includes('strength')) {
    return 'fuerza';
  } else if (content_lower.includes('flexibilidad') || content_lower.includes('flexibility') || content_lower.includes('estiramientos')) {
    return 'flexibilidad';
  } else if (content_lower.includes('otro')) {
    return 'otro';
  } else {
    return 'carrera';
  }
}
