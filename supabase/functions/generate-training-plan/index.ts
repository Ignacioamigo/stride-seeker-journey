
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';

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
    console.log("Edge function generate-training-plan invocada");
    
    const { userProfile, context, previousWeekResults } = await req.json();

    if (!userProfile) {
      console.error("Perfil de usuario no proporcionado");
      return new Response(
        JSON.stringify({ error: 'Missing user profile' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Get API key from environment variable
    console.log("Verificando la clave de API de Gemini...");
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!apiKey) {
      console.error("GEMINI_API_KEY no encontrada en las variables de entorno");
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured',
          message: 'La variable de entorno GEMINI_API_KEY no está configurada en los secrets de Supabase',
          details: 'Es necesario configurar esta variable en la sección de Secrets en el panel de administración de Supabase Edge Functions'
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    } else {
      console.log("Clave de API encontrada, longitud:", apiKey.length);
    }
    
    // Create system prompt with running expertise and RAG context
    let systemPrompt = `Actúa como un entrenador de running de élite con experiencia en preparación de atletas de todos los niveles. 
    Tu tarea es diseñar un plan de entrenamiento personalizado para un corredor, basado en su perfil 
    y aplicando principios científicos avanzados de entrenamiento deportivo.
    
    El plan debe estar meticulosamente adaptado al nivel del corredor, considerando sus objetivos específicos,
    historial de lesiones, y capacidades actuales. Incluye una distribución óptima de estímulos de entrenamiento,
    con períodos de recuperación estratégicos y variación metodológica en los tipos de entrenamiento.
    
    Para cada sesión de entrenamiento, debes especificar:
    - Ritmo objetivo por kilómetro (ejemplo: 5:30/km)
    - Distancia precisa en kilómetros
    - Duración estimada del entrenamiento
    - Descripción detallada con instrucciones técnicas

    La respuesta debe estar en español y debe estar estructurada en formato JSON como este:
    {
      "name": "Nombre del plan",
      "description": "Descripción general del plan con enfoque metodológico",
      "duration": "Duración total del plan",
      "intensity": "Intensidad general del plan",
      "workouts": [
        {
          "day": "Lunes",
          "title": "Título descriptivo del entrenamiento",
          "description": "Descripción técnica detallada",
          "distance": null o número en km,
          "duration": "Duración estimada",
          "type": "carrera|descanso|fuerza|flexibilidad|otro",
          "targetPace": "5:30/km o null si no aplica"
        },
        // Repetir para cada día de la semana
      ]
    }
    
    IMPORTANTE: DEBES devolver SOLO un objeto JSON válido, sin texto adicional.
    
    CONOCIMIENTOS ESPECÍFICOS DE RUNNING:
    ${context || 'Aplica los principios fundamentales de periodización, progresión gradual y especificidad del entrenamiento.'}
    `;

    // Format user profile for prompt
    let userPrompt = `
    Perfil detallado del corredor:
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
    
    Requisitos específicos:
    - Plan para principiantes enfocado en alcanzar los 10K en menos de 50 minutos
    - Énfasis en construir una base sólida con carreras cortas y recuperación adecuada
    `;
    
    // Add previous week results if available
    if (previousWeekResults) {
      userPrompt += `\nResultados de la semana anterior (Semana ${previousWeekResults.weekNumber}):\n`;
      
      previousWeekResults.workouts.forEach((workout) => {
        userPrompt += `- ${workout.day}: ${workout.title}. `;
        if (workout.completed) {
          userPrompt += `Completado. `;
          if (workout.plannedDistance && workout.actualDistance) {
            userPrompt += `Distancia planificada: ${workout.plannedDistance}km, Distancia real: ${workout.actualDistance}km. `;
          }
          if (workout.plannedDuration && workout.actualDuration) {
            userPrompt += `Duración planificada: ${workout.plannedDuration}, Duración real: ${workout.actualDuration}. `;
          }
        } else {
          userPrompt += `No completado. `;
        }
        userPrompt += '\n';
      });
      
      userPrompt += `\nPor favor, genera un plan para la Semana ${previousWeekResults.weekNumber + 1} ajustando la intensidad y progresión en función de los resultados de la semana anterior.`;
    } else {
      userPrompt += `\nGenera un plan de entrenamiento personalizado para este corredor (Semana 1).`;
    }

    console.log("Llamando a la API de Gemini para generar el plan");
    console.log("URL de la API:", `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=[REDACTED]`);
    
    try {
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

      console.log("Estado de la respuesta de Gemini:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error en la API de Gemini:", errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      console.log("Respuesta recibida de la API de Gemini");
      
      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0].text) {
        console.error("Formato de respuesta de Gemini inesperado:", JSON.stringify(data));
        throw new Error("Formato de respuesta de Gemini inesperado");
      }
      
      const generatedText = data.candidates[0].content.parts[0].text;
      
      console.log("Texto generado por Gemini, procesando para extraer el plan...");
      console.log("Longitud del texto generado:", generatedText.length);
      
      // Extract JSON from the response 
      // (sometimes Gemini includes markdown code blocks or additional text)
      let jsonString = generatedText;
      const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                        generatedText.match(/```\n([\s\S]*?)\n```/) ||
                        generatedText.match(/{[\s\S]*}/);
                        
      if (jsonMatch) {
        jsonString = jsonMatch[0].replace(/```json\n|```\n|```/g, '');
        console.log("JSON extraído de bloques de código markdown");
      }
      
      // Parse the JSON plan
      let plan;
      try {
        plan = JSON.parse(jsonString);
        console.log("JSON del plan analizado correctamente");
      } catch (e) {
        // If JSON parsing fails, use a regex approach to extract the plan
        console.error("Error al analizar JSON:", e);
        console.log("Intentando extraer plan manualmente...");
        console.log("Contenido recibido (primeras 200 caracteres):", generatedText.substring(0, 200) + "...");
        
        plan = {
          name: previousWeekResults 
            ? `Plan de entrenamiento: Semana ${previousWeekResults.weekNumber + 1}` 
            : "Plan de entrenamiento personalizado: Semana 1",
          description: "Plan adaptado a tu perfil y objetivos",
          duration: "7 días",
          intensity: "Adaptada a tu nivel",
          workouts: extractWorkoutsFromText(generatedText)
        };
      }

      console.log("Devolviendo datos del plan");
      
      return new Response(
        JSON.stringify({ plan }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    } catch (apiError) {
      console.error("Error al llamar a la API de Gemini:", apiError);
      return new Response(
        JSON.stringify({ 
          error: apiError.message || String(apiError),
          type: 'api_error'
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }
  } catch (error) {
    console.error("Error en generate-training-plan:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || String(error),
        stack: error.stack,
        type: 'general_error'
      }),
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
  
  // For debugging
  console.log("Extracting workouts manually from text");
  
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
      const paceMatch = content.match(/(?:ritmo|pace):?\s*([^\n]+?)(?:\/km|$)/i);
      
      workouts.push({
        day,
        title: titleMatch ? titleMatch[1].trim() : `Entrenamiento de ${day}`,
        description: descriptionMatch ? descriptionMatch[1].trim() : content.split('\n').slice(1).join(' ').trim(),
        distance: distanceMatch ? parseFloat(distanceMatch[1]) : null,
        duration: durationMatch ? durationMatch[1].trim() : null,
        type: determineWorkoutType(content),
        targetPace: paceMatch ? paceMatch[1].trim() : null
      });
      
      console.log(`Extracted workout for ${day}: ${titleMatch ? titleMatch[1].trim() : `Entrenamiento de ${day}`}`);
    } else {
      // If no match for this day, create a rest day
      workouts.push({
        day,
        title: `Descanso`,
        description: "Día de recuperación",
        distance: null,
        duration: null,
        type: "descanso",
        targetPace: null
      });
      
      console.log(`No match found for ${day}, created rest day`);
    }
  }
  
  console.log(`Total workouts extracted: ${workouts.length}`);
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
