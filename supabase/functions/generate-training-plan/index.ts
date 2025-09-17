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
  
  console.log("Selected days received:", selectedDays);
  
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Filter only selected days
  const actualSelectedDays = selectedDays.filter(day => day.selected);
  console.log("Actually selected days:", actualSelectedDays);
  
  if (actualSelectedDays.length === 0) {
    return generateDatesFromToday();
  }
  
  // Get dates for the next 4 weeks to ensure we have enough training dates
  for (let week = 0; week < 4; week++) {
    for (const selectedDay of actualSelectedDays) {
      const dayId = selectedDay.id; // 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
      
      // Calculate the date for this day in the current week iteration
      const targetDate = new Date(today);
      
      // Find the next occurrence of this day of the week
      const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Convert dayId (0=Mon, 1=Tue, etc.) to JavaScript day format (0=Sun, 1=Mon, etc.)
      const jsTargetDay = dayId === 6 ? 0 : dayId + 1; // Convert: 6(Sunday) -> 0, others -> +1
      
      // Calculate days to add to get to the target day
      let daysToAdd = jsTargetDay - currentDayOfWeek;
      if (daysToAdd < 0) {
        daysToAdd += 7; // Move to next week if the day has already passed
      }
      
      // Add the week offset
      daysToAdd += (week * 7);
      
      targetDate.setDate(today.getDate() + daysToAdd);
      targetDate.setHours(0, 0, 0, 0);
      
      // Only include future dates
      if (targetDate >= today) {
        const dayName = selectedDay.name;
        dates.push({ date: new Date(targetDate), dayName });
      }
    }
  }
  
  // Sort by date to maintain chronological order
  dates.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  console.log("Generated dates:", dates.map(d => ({ date: d.date.toISOString().split('T')[0], dayName: d.dayName })));
  
  // Return the first 14 dates
  return dates.slice(0, 14);
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
    
    // Log user selected days for debugging
    console.log("User selected days:", userProfile.selectedDays);
    
    // Generate dates based on selected days or fallback to next 7 days
    const nextWeekDates = userProfile.selectedDays && userProfile.selectedDays.length > 0 
      ? generateDatesForSelectedDays(userProfile.selectedDays)
      : generateDatesFromToday();
    
    console.log("Generated dates result:", nextWeekDates.map(d => `${d.dayName}: ${d.date.toISOString().split('T')[0]}`));

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
    
    // 3. Advanced RAG Context Retrieval
    let contextText = '';
    let ragActive = false;
    let ragStrategy = 'none';
    
    try {
      console.log("Starting advanced RAG process...");
      
      // Enhanced user query construction
      const selectedDaysText = userProfile.selectedDays && userProfile.selectedDays.length > 0 
        ? userProfile.selectedDays.filter(d => d.selected).map(d => d.name).join(', ')
        : 'No especificados';
      
      // Multi-layered query construction for better context retrieval
      const baseQuery = `${userProfile.goal} ${userProfile.experienceLevel} ${userProfile.pace}`;
      const contextualQuery = `Entrenamiento para ${userProfile.goal.toLowerCase()} nivel ${userProfile.experienceLevel} ritmo ${userProfile.pace} distancia máxima ${userProfile.maxDistance}km`;
      const detailedQuery = `Corredor ${userProfile.experienceLevel} de ${userProfile.age} años, objetivo: ${userProfile.goal}, ritmo actual: ${userProfile.pace}, máximo ${userProfile.maxDistance}km, ${userProfile.weeklyWorkouts} entrenamientos/semana`;
      
      console.log("Multi-query RAG approach:", {baseQuery, contextualQuery, detailedQuery});
      
      // Strategy 1: Contextual search (most specific)
      let fragments = [];
      const embeddingRes = await fetch(
        `${supabaseUrl}/functions/v1/generate-embedding`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ 
            text: contextualQuery,
            taskType: 'RETRIEVAL_QUERY' 
          })
        }
      );
      
      if (embeddingRes.ok) {
        const embeddingData = await embeddingRes.json();
        if (embeddingData.embedding && Array.isArray(embeddingData.embedding)) {
          console.log("Embedding generated successfully with dimensions:", embeddingData.embedding.length);
          
          // Extract distance goal from objective
          let distanceGoal = '';
          if (userProfile.goal.toLowerCase().includes('5k')) distanceGoal = '5k';
          else if (userProfile.goal.toLowerCase().includes('10k')) distanceGoal = '10k';
          else if (userProfile.goal.toLowerCase().includes('21k') || userProfile.goal.toLowerCase().includes('media maratón')) distanceGoal = '21k';
          else if (userProfile.goal.toLowerCase().includes('42k') || userProfile.goal.toLowerCase().includes('maratón')) distanceGoal = '42k';
          
          // Try contextual search first (best strategy)
          const { data: contextualFragments, error: contextualError } = await supabase.rpc('contextual_search_fragments', {
            query_embedding: embeddingData.embedding,
            user_level: userProfile.experienceLevel || '',
            workout_type: baseQuery.toLowerCase(),
            distance_goal: distanceGoal,
            match_threshold: 0.6,
            match_count: 10
          });
          
          if (!contextualError && contextualFragments && contextualFragments.length > 0) {
            fragments = contextualFragments;
            ragStrategy = 'contextual';
            console.log(`RAG Strategy: Contextual - Found ${fragments.length} relevant fragments`);
          } else {
            // Fallback to hybrid search
            const { data: hybridFragments, error: hybridError } = await supabase.rpc('hybrid_search_fragments', {
              query_embedding: embeddingData.embedding,
              query_text: baseQuery,
              match_threshold: 0.55,
              match_count: 8
            });
            
            if (!hybridError && hybridFragments && hybridFragments.length > 0) {
              fragments = hybridFragments;
              ragStrategy = 'hybrid';
              console.log(`RAG Strategy: Hybrid - Found ${fragments.length} relevant fragments`);
            } else {
              // Final fallback to basic semantic search
              const { data: basicFragments, error: basicError } = await supabase.rpc('match_fragments', {
                query_embedding: embeddingData.embedding,
                match_threshold: 0.5,
                match_count: 6
              });
              
              if (!basicError && basicFragments && basicFragments.length > 0) {
                fragments = basicFragments;
                ragStrategy = 'basic';
                console.log(`RAG Strategy: Basic - Found ${fragments.length} relevant fragments`);
              }
            }
          }
        }
      }
      
      // Process and rank retrieved fragments
      if (fragments && fragments.length > 0) {
        ragActive = true;
        
        // Intelligent fragment reranking and selection
        const rankedFragments = fragments
          .map((f, i) => ({
            ...f,
            priority: calculateFragmentPriority(f, userProfile),
            originalIndex: i
          }))
          .sort((a, b) => b.priority - a.priority)
          .slice(0, 6); // Take top 6 most relevant
        
        // Create rich context with metadata
        contextText = rankedFragments.map((f, i) => {
          const source = f.metadata?.filename || 'Documento especializado';
          const level = extractLevel(source);
          const distance = extractDistance(source);
          const phase = extractPhase(source);
          
          let header = `**FRAGMENTO ${i+1}**`;
          if (level) header += ` [${level}]`;
          if (distance) header += ` [${distance}]`;
          if (phase) header += ` [${phase}]`;
          header += `:`;
          
          return `${header}\n${f.content}`;
        }).join('\n\n');
        
        console.log(`RAG active with ${ragStrategy} strategy:`, {
          fragmentsFound: fragments.length,
          fragmentsUsed: rankedFragments.length,
          contextLength: contextText.length,
          topFragmentScore: rankedFragments[0]?.final_score || rankedFragments[0]?.similarity || 'N/A'
        });
      } else {
        console.log("No relevant fragments found across all strategies");
      }
      
    } catch (ragError) {
      console.error("Error during advanced RAG processing:", ragError);
      console.error("RAG Error Details:", {
        errorMessage: ragError.message,
        errorStack: ragError.stack,
        ragStrategy: ragStrategy,
        contextLength: contextText.length
      });
      
      // More detailed error tracking
      if (ragError.message && ragError.message.includes('API key not configured')) {
        console.error("❌ CRITICAL: GEMINI_API_KEY is not configured in Supabase Edge Functions environment");
        ragStrategy = 'missing_api_key';
      } else if (ragError.message && ragError.message.includes('Embedding API error')) {
        console.error("❌ ERROR: Gemini Embedding API returned an error - check API key validity");
        ragStrategy = 'api_error';
      } else {
        ragStrategy = 'error';
      }
      
      contextText = "";
    }
    
    // Helper functions for fragment processing
    function calculateFragmentPriority(fragment: any, profile: any): number {
      let score = fragment.final_score || fragment.combined_score || fragment.similarity || 0;
      
      // Boost based on user profile alignment
      if (fragment.metadata?.filename) {
        const filename = fragment.metadata.filename.toLowerCase();
        
        // Level alignment boost
        if (profile.experienceLevel) {
          if (profile.experienceLevel.includes('principiante') && filename.includes('-p-')) score += 0.15;
          if (profile.experienceLevel.includes('intermedio') && filename.includes('-int-')) score += 0.15;
          if (profile.experienceLevel.includes('avanzado') && filename.includes('-adv-')) score += 0.15;
        }
        
        // Goal alignment boost
        if (profile.goal) {
          const goal = profile.goal.toLowerCase();
          if (goal.includes('5k') && filename.includes('5k-')) score += 0.2;
          if (goal.includes('10k') && filename.includes('10k-')) score += 0.2;
          if ((goal.includes('21k') || goal.includes('media')) && filename.includes('21k-')) score += 0.2;
          if ((goal.includes('42k') || goal.includes('maratón')) && filename.includes('42k-')) score += 0.2;
        }
        
        // Content relevance boost
        const content = fragment.content.toLowerCase();
        if (content.includes('tempo') || content.includes('intervalos') || content.includes('fartlek')) score += 0.1;
        if (content.includes('recuperación') || content.includes('descanso')) score += 0.05;
      }
      
      return score;
    }
    
    function extractLevel(filename: string): string {
      if (filename.includes('-P-')) return 'Principiante';
      if (filename.includes('-INT-')) return 'Intermedio';
      if (filename.includes('-ADV-')) return 'Avanzado';
      return '';
    }
    
    function extractDistance(filename: string): string {
      if (filename.includes('5K-')) return '5K';
      if (filename.includes('10K-')) return '10K';
      if (filename.includes('21K-')) return '21K';
      if (filename.includes('42K-')) return '42K';
      return '';
    }
    
    function extractPhase(filename: string): string {
      if (filename.includes('-BASE-')) return 'Base';
      if (filename.includes('-CONSTRUCCION-')) return 'Construcción';
      if (filename.includes('-PICO-')) return 'Pico';
      if (filename.includes('-TAPERING-')) return 'Tapering';
      return '';
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
    
    // Enhanced RAG context section with strategy information
    const ragSection = contextText ? `\nCONOCIMIENTO ESPECIALIZADO GANI (Estrategia: ${ragStrategy.toUpperCase()}):\n\nUtiliza este conocimiento profesional de entrenamiento para crear un plan más preciso y especializado. Los fragmentos están ordenados por relevancia para el perfil del usuario:\n\n${contextText}\n\nIMPORTANTE: Integra las técnicas, metodologías y principios de entrenamiento de estos fragmentos en tu plan. No copies literalmente, sino adapta el conocimiento al perfil específico del usuario.\n` : '\nNOTA: Generando plan con conocimiento base (RAG no disponible).\n';
    
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
        let userProfileId = null;
        
        // Get the authenticated user (if any)
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (user) {
          // Check if profile already exists in database for authenticated user
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_auth_id', user.id)
            .single();
          
          if (existingProfile) {
            userProfileId = existingProfile.id;
            console.log("Using existing user profile:", userProfileId);
          }
        }
        
        // If no profile exists, create one (works for both authenticated and anonymous users)
        if (!userProfileId) {
          console.log("Creating new user profile. User authenticated:", !!user);
          
          console.log("Attempting to insert user profile with data:", {
            user_auth_id: user?.id || null,
            name: userProfile.name,
            age: userProfile.age,
            gender: userProfile.gender,
            height: userProfile.height,
            weight: userProfile.weight
          });
          
          const { data: userProfileData, error: userProfileError } = await supabase
            .from('user_profiles')
            .insert({
              user_auth_id: user?.id || null,  // user_auth_id (null para usuarios anónimos)
              name: userProfile.name,
              age: userProfile.age,
              gender: userProfile.gender,
              height: userProfile.height,  // ¡AÑADIR height!
              weight: userProfile.weight,  // ¡AÑADIR weight!
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
            console.error("❌ ERROR saving user profile:", userProfileError);
            console.error("Error details:", JSON.stringify(userProfileError, null, 2));
          } else {
            console.log("✅ User profile saved successfully:", userProfileData);
            userProfileId = userProfileData.id;
          }
        }
        
        // Ensure we have a valid userProfileId before saving training plan
        if (!userProfileId) {
          console.error("❌ CRITICAL: Cannot save training plan - userProfileId is null");
          console.log("🔍 Debug info:", {
            userAuthenticated: !!user,
            userAuthId: user?.id || 'null',
            profileCreationAttempted: true
          });
        } else {
          console.log("✅ About to save training plan with userProfileId:", userProfileId);
          console.log("📋 Training plan data:", {
            user_id: userProfileId,
            name: plan.name,
            week_number: previousWeekResults?.weekNumber ? previousWeekResults.weekNumber + 1 : 1
          });
          
          // Save the training plan
          const { data: trainingPlanData, error: trainingPlanError } = await supabase
            .from('training_plans')
            .insert({
              user_id: userProfileId,
              name: plan.name,
              description: plan.description,
              duration_weeks: 1, // Usar el campo correcto
              difficulty_level: plan.intensity || 'Moderada', // Usar el campo correcto
              goal: userProfile.goal,
              is_active: true
            })
            .select()
            .single();
          
          if (trainingPlanError) {
            console.error("❌ ERROR saving training plan:", trainingPlanError);
            console.error("Training plan error details:", JSON.stringify(trainingPlanError, null, 2));
            console.error("Attempted to insert with user_id:", userProfileId);
          } else {
            console.log("✅ Training plan saved successfully:", trainingPlanData);
            
            // Save each workout session
            console.log("📋 About to save training sessions for plan:", trainingPlanData.id);
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
            
            console.log("📋 Sessions to insert:", sessionsToInsert.length);
            
            const { data: sessionsData, error: sessionsError } = await supabase
              .from('training_sessions')
              .insert(sessionsToInsert);
            
            if (sessionsError) {
              console.error("❌ ERROR saving workout sessions:", sessionsError);
              console.error("Sessions error details:", JSON.stringify(sessionsError, null, 2));
            } else {
              console.log("✅ Training sessions saved successfully:", sessionsData ? sessionsData.length : 0, "sessions");
            }
          }
        }
      } catch (dbError) {
        console.error("Error storing data in Supabase:", dbError);
        // Continue to return the plan even if DB storage fails
      }
      
      // Add enhanced RAG status to the response
      plan.ragActive = ragActive;
      plan.ragStrategy = ragStrategy;
      plan.ragFragmentsUsed = ragActive ? contextText.split('**FRAGMENTO').length - 1 : 0;
      
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
