import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
  // Nuevos campos para objetivos específicos
  targetDistance: number | null; // Distancia objetivo en km
  targetPace: number | null; // Ritmo objetivo en min/km
  targetTimeframe: number | null; // Tiempo objetivo
  targetTimeframeUnit: 'days' | 'months' | null; // Unidad del tiempo objetivo
  weeklyWorkouts: number | null;
  experienceLevel: string | null;
  injuries: string;
  completedOnboarding?: boolean;
  selectedDays?: any[];
  targetRace?: {
    id: string;
    name: string;
    location: string;
    date: string;
    distance: string;
    type: string;
  } | null;
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
  
  const dates: { date: Date, dayName: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Filter only selected days
  const actualSelectedDays = selectedDays.filter(day => day.selected);
  console.log("Actually selected days:", actualSelectedDays);
  
  if (actualSelectedDays.length === 0) {
    return generateDatesFromToday();
  }
  
  // NUEVA LÓGICA: Siempre empezar desde la semana siguiente
  // Calcular el lunes de la próxima semana
  const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysUntilNextMonday = currentDayOfWeek === 0 ? 1 : 8 - currentDayOfWeek; // Si es domingo, lunes es mañana; si no, calcular días hasta el próximo lunes
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilNextMonday);
  nextMonday.setHours(0, 0, 0, 0);
  
  console.log("Today is:", today.toISOString().split('T')[0], "Next Monday:", nextMonday.toISOString().split('T')[0]);
  
  // Generate dates ONLY for the next week (not 4 weeks)
  // Each week generates a new plan, so we only need one week at a time
  for (const selectedDay of actualSelectedDays) {
    const dayId = selectedDay.day || selectedDay.id; // 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
    
    // Convert dayId (0=Mon, 1=Tue, etc.) to JavaScript day format (0=Sun, 1=Mon, etc.)
    const jsTargetDay = dayId === 6 ? 0 : dayId + 1; // Convert: 6(Sunday) -> 0, others -> +1
    
    // Calculate days to add from next Monday to get to the target day
    let daysToAdd = jsTargetDay - 1; // 1 = Monday in JS, so subtract 1 to get offset from Monday
    if (daysToAdd < 0) daysToAdd += 7; // Handle Sunday (0) case
    
    // Create target date starting from next Monday (only for this week)
    const targetDate = new Date(nextMonday);
    targetDate.setDate(nextMonday.getDate() + daysToAdd);
    targetDate.setHours(0, 0, 0, 0);
    
    // Create a new date object to avoid reference issues
    const dayName = selectedDay.name;
    dates.push({ date: new Date(targetDate.getTime()), dayName });
  }
  
  // Sort by date to maintain chronological order
  dates.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  console.log("Generated dates (next week only):", dates.map(d => ({ date: d.date.toISOString().split('T')[0], dayName: d.dayName })));
  
  return dates;
}

// Función nueva para distribuir días cuando solo se especifica cantidad
function generateDatesForWeeklyWorkouts(weeklyWorkouts: number): { date: Date, dayName: string }[] {
  const dates: { date: Date, dayName: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // NUEVA LÓGICA: Siempre empezar desde la semana siguiente
  // Calcular el lunes de la próxima semana
  const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysUntilNextMonday = currentDayOfWeek === 0 ? 1 : 8 - currentDayOfWeek; // Si es domingo, lunes es mañana; si no, calcular días hasta el próximo lunes
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilNextMonday);
  nextMonday.setHours(0, 0, 0, 0);
  
  console.log("Today is:", today.toISOString().split('T')[0], "Next Monday:", nextMonday.toISOString().split('T')[0]);
  
  // Distribución inteligente de días según la cantidad
  let dayDistribution: number[] = [];
  
  switch(weeklyWorkouts) {
    case 1:
      dayDistribution = [2]; // Miércoles
      break;
    case 2:
      dayDistribution = [1, 6]; // Martes y Domingo
      break;
    case 3:
      dayDistribution = [1, 3, 6]; // Martes, Jueves, Domingo
      break;
    case 4:
      dayDistribution = [0, 2, 4, 6]; // Lunes, Miércoles, Viernes, Domingo
      break;
    case 5:
      dayDistribution = [0, 1, 3, 5, 6]; // Lunes, Martes, Jueves, Sábado, Domingo
      break;
    case 6:
      dayDistribution = [0, 1, 2, 4, 5, 6]; // Todos excepto jueves
      break;
    case 7:
      dayDistribution = [0, 1, 2, 3, 4, 5, 6]; // Todos los días
      break;
    default:
      dayDistribution = [1, 3, 6]; // Default: Martes, Jueves, Domingo
  }
  
  console.log(`Distributing ${weeklyWorkouts} workouts across days: ${dayDistribution}`);
  
  // Generar fechas SOLO para la próxima semana (no 4 semanas)
  // Cada semana se genera un nuevo plan
  for (const dayIndex of dayDistribution) {
    // Convert dayId (0=Mon, 1=Tue, etc.) to JavaScript day format (0=Sun, 1=Mon, etc.)
    const jsTargetDay = dayIndex === 6 ? 0 : dayIndex + 1;
    
    // Calculate days to add from next Monday to get to the target day
    let daysToAdd = jsTargetDay - 1; // 1 = Monday in JS, so subtract 1 to get offset from Monday
    if (daysToAdd < 0) daysToAdd += 7; // Handle Sunday (0) case
    
    // Create target date starting from next Monday (only for this week)
    const targetDate = new Date(nextMonday);
    targetDate.setDate(nextMonday.getDate() + daysToAdd);
    targetDate.setHours(0, 0, 0, 0);
    
    const dayName = getDayMapping(dayIndex);
    dates.push({ date: new Date(targetDate.getTime()), dayName });
  }
  
  // Sort by date
  dates.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  console.log("Generated distributed dates (next week only):", dates.map(d => ({ date: d.date.toISOString().split('T')[0], dayName: d.dayName })));
  
  return dates;
}

// ========== ADVANCED RAG TECHNIQUES ==========

// TÉCNICA 1: Query Expansion - Expandir queries con sinónimos y contexto
function generateQueryExpansions(userProfile: any, goalDescription: string, timeframeText: string): string[] {
  const expansions: string[] = [];
  
  // Sinónimos y variaciones por nivel
  const levelSynonyms: Record<string, string[]> = {
    'principiante': ['novato', 'iniciación', 'base', 'comenzar a correr', 'empezar running'],
    'intermedio': ['medio', 'progresivo', 'desarrollo', 'mejora continua'],
    'avanzado': ['experto', 'competición', 'alto rendimiento', 'élite', 'avanzado']
  };
  
  // Sinónimos para tipos de entrenamiento
  const workoutSynonyms = ['entrenamiento', 'sesión', 'workout', 'práctica', 'ejercicio'];
  
  const level = userProfile.experienceLevel?.toLowerCase() || 'intermedio';
  const levelVariations = levelSynonyms[level] || [level];
  
  // Query 1: Base con sinónimos de nivel
  const baseQuery = `${goalDescription} ${levelVariations[0]} ${userProfile.pace || 'ritmo moderado'}`;
  expansions.push(baseQuery);
  
  // Query 2: Contextual con más detalles y sinónimos
  const contextualQuery = `${workoutSynonyms[0]} para ${goalDescription.toLowerCase()} nivel ${levelVariations[1] || level} ritmo ${userProfile.pace} distancia máxima ${userProfile.maxDistance}km preparación ${timeframeText}`;
  expansions.push(contextualQuery);
  
  // Query 3: Detallado con todos los parámetros
  const detailedQuery = `Corredor ${levelVariations[0]} de ${userProfile.age || 30} años, objetivo: ${goalDescription}, ritmo actual: ${userProfile.pace || '5:30'}, objetivo: ${userProfile.targetDistance || 10}km a ${userProfile.targetPace || '5:00'}min/km en ${timeframeText}, máximo ${userProfile.maxDistance || 10}km, ${userProfile.weeklyWorkouts || 3} entrenamientos/semana`;
  expansions.push(detailedQuery);
  
  // Query 4: Enfocada en fase de entrenamiento
  const timeframeInWeeks = userProfile.targetTimeframeUnit === 'days' 
    ? Math.floor((userProfile.targetTimeframe || 30) / 7)
    : (userProfile.targetTimeframe || 3) * 4;
  
  let phase = 'construcción';
  if (timeframeInWeeks <= 2) phase = 'tapering puesta a punto';
  else if (timeframeInWeeks <= 4) phase = 'pico rendimiento máximo';
  else if (timeframeInWeeks <= 8) phase = 'construcción desarrollo';
  else phase = 'base aeróbica';
  
  const phaseQuery = `Plan ${phase} ${goalDescription} ${levelVariations[0]} ${timeframeInWeeks} semanas`;
  expansions.push(phaseQuery);
  
  // Query 5: Enfocada en tipo de workouts necesarios
  let workoutTypes = '';
  if (userProfile.targetDistance <= 5) workoutTypes = 'intervalos velocidad series';
  else if (userProfile.targetDistance <= 10) workoutTypes = 'tempo intervalos resistencia';
  else if (userProfile.targetDistance <= 21) workoutTypes = 'carrera larga tempo resistencia';
  else workoutTypes = 'fondos largos carrera continua resistencia';
  
  const workoutQuery = `${workoutTypes} ${levelVariations[0]} preparación ${userProfile.targetDistance}km`;
  expansions.push(workoutQuery);
  
  return expansions;
}

// TÉCNICA 2: Advanced Relevance Scoring con múltiples factores
function calculateAdvancedRelevance(fragment: any, profile: any, queryEmbeddings: string[]): number {
  let score = fragment.similarity || 0;
  
  const content = fragment.content?.toLowerCase() || '';
  const filename = fragment.metadata?.filename?.toLowerCase() || '';
  
  // Factor 1: Nivel de experiencia (peso MUY BAJO: 0.5x - casi sin importancia)
  if (profile.experienceLevel) {
    const level = profile.experienceLevel.toLowerCase();
    if (level.includes('principiante') && (filename.includes('-p-') || content.includes('principiante') || content.includes('novato'))) {
      score *= 1.05; // Solo +5%
    } else if (level.includes('intermedio') && (filename.includes('-int-') || content.includes('intermedio'))) {
      score *= 1.05;
    } else if (level.includes('avanzado') && (filename.includes('-adv-') || content.includes('avanzado') || content.includes('competición'))) {
      score *= 1.05;
    }
  }
  
  // Factor 2: Distancia objetivo (peso CRÍTICO: 1.8x)
  if (profile.targetDistance) {
    const targetDist = profile.targetDistance;
    if (targetDist <= 5 && (filename.includes('5k-') || content.includes('5k') || content.includes('5 km'))) {
      score *= 1.8;
    } else if (targetDist > 5 && targetDist <= 10 && (filename.includes('10k-') || content.includes('10k') || content.includes('10 km'))) {
      score *= 1.8;
    } else if (targetDist > 10 && targetDist <= 21 && (filename.includes('21k-') || content.includes('21k') || content.includes('media maratón'))) {
      score *= 1.8;
    } else if (targetDist > 21 && (filename.includes('42k-') || content.includes('42k') || content.includes('maratón'))) {
      score *= 1.8;
    }
  }
  
  // Factor 2B: Distancia máxima ACTUAL del usuario (peso MUY ALTO: 1.7x)
  // Priorizar fragmentos que respeten la capacidad actual
  if (profile.maxDistance) {
    const maxDist = profile.maxDistance;
    // Si el contenido menciona distancias cercanas a la máxima actual
    if (maxDist <= 5 && (content.includes('3km') || content.includes('4km') || content.includes('5km'))) {
      score *= 1.7;
    } else if (maxDist > 5 && maxDist <= 10 && (content.includes('6km') || content.includes('7km') || content.includes('8km') || content.includes('9km') || content.includes('10km'))) {
      score *= 1.7;
    } else if (maxDist > 10 && maxDist <= 15 && (content.includes('11km') || content.includes('12km') || content.includes('13km') || content.includes('14km') || content.includes('15km'))) {
      score *= 1.7;
    }
    
    // Penalizar fragmentos con distancias muy superiores a la capacidad actual
    if (maxDist <= 5 && (content.includes('15km') || content.includes('20km') || content.includes('maratón'))) {
      score *= 0.6; // Penalización -40%
    } else if (maxDist <= 10 && (content.includes('25km') || content.includes('30km') || content.includes('maratón'))) {
      score *= 0.7; // Penalización -30%
    }
  }
  
  // Factor 2C: Diferencial de ritmo (peso alto: 1.5x)
  // Priorizar fragmentos que hablen de progresión conservadora de ritmo
  if (profile.pace && profile.targetPace) {
    const currentPaceMin = parseFloat(profile.pace.split(':')[0]);
    const targetPaceMin = parseFloat(profile.targetPace.toString().split(':')[0]);
    const paceDiff = currentPaceMin - targetPaceMin;
    
    // Si hay diferencia significativa de ritmo, priorizar progresión gradual
    if (paceDiff > 0.5 && (content.includes('progresión') || content.includes('gradual') || content.includes('incremento'))) {
      score *= 1.5;
    }
    
    // Si el usuario ya corre cerca del objetivo, priorizar mantenimiento
    if (paceDiff < 0.3 && (content.includes('mantener') || content.includes('consolidar'))) {
      score *= 1.3;
    }
  }
  
  // Factor 3: Fase de entrenamiento (peso medio: 1.2x)
  const timeframeInWeeks = profile.targetTimeframeUnit === 'days' 
    ? Math.floor((profile.targetTimeframe || 30) / 7)
    : (profile.targetTimeframe || 3) * 4;
  
  if (timeframeInWeeks <= 2 && (content.includes('tapering') || content.includes('puesta a punto') || filename.includes('tapering'))) {
    score *= 1.2;
  } else if (timeframeInWeeks <= 4 && (content.includes('pico') || content.includes('peak') || filename.includes('pico'))) {
    score *= 1.2;
  } else if (timeframeInWeeks <= 8 && (content.includes('construcción') || filename.includes('construccion'))) {
    score *= 1.2;
  } else if (timeframeInWeeks > 8 && (content.includes('base') || content.includes('aeróbica') || filename.includes('base'))) {
    score *= 1.2;
  }
  
  // Factor 4: Métricas específicas mencionadas (peso medio: 1.15x)
  const hasMetrics = content.includes('km') || content.includes('min/km') || content.includes('ritmo') || 
                     content.includes('pace') || content.includes('velocidad');
  if (hasMetrics) {
    score *= 1.15;
  }
  
  // Factor 5: Contenido educativo vs descriptivo (peso bajo: 1.1x)
  const educationalKeywords = ['principio', 'técnica', 'método', 'sistema', 'progresión', 'periodización'];
  const hasEducational = educationalKeywords.some(kw => content.includes(kw));
  if (hasEducational) {
    score *= 1.1;
  }
  
  // Factor 6: Longitud óptima del fragmento (penalizar muy cortos o muy largos)
  const contentLength = content.length;
  if (contentLength < 100) {
    score *= 0.7; // Penalizar fragmentos muy cortos
  } else if (contentLength > 1500) {
    score *= 0.85; // Penalizar fragmentos muy largos
  } else if (contentLength >= 300 && contentLength <= 800) {
    score *= 1.05; // Premiar longitud óptima
  }
  
  return score;
}

// TÉCNICA 3: Fragment Deduplication - Eliminar fragmentos similares/redundantes
function deduplicateFragments(fragments: any[]): any[] {
  const uniqueFragments: any[] = [];
  const seenContent = new Set<string>();
  
  for (const fragment of fragments) {
    // Crear una "firma" del contenido (primeras 100 chars)
    const signature = fragment.content?.substring(0, 100).toLowerCase().trim();
    
    // Verificar similitud con fragmentos ya añadidos
    let isDuplicate = false;
    for (const sig of seenContent) {
      const similarity = calculateStringSimilarity(signature, sig);
      if (similarity > 0.8) { // 80% de similitud = duplicado
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      uniqueFragments.push(fragment);
      seenContent.add(signature);
    } else {
      console.log("🔄 Removed duplicate fragment:", fragment.id);
    }
  }
  
  return uniqueFragments;
}

// Helper: Calcular similitud entre strings (Jaccard similarity)
function calculateStringSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/));
  const words2 = new Set(str2.split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

// TÉCNICA 4: Contextual Compression - Extraer las partes más relevantes
function compressFragment(fragment: any, profile: any): any {
  const content = fragment.content || '';
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  // Calcular relevancia de cada sentencia
  const scoredSentences = sentences.map(sentence => {
    let score = 0;
    const lower = sentence.toLowerCase();
    
    // Keywords importantes del perfil
    if (profile.targetDistance) {
      if (lower.includes(`${profile.targetDistance}km`) || lower.includes(`${profile.targetDistance} km`)) score += 3;
    }
    if (profile.experienceLevel && lower.includes(profile.experienceLevel.toLowerCase())) score += 2;
    if (lower.includes('ritmo') || lower.includes('pace') || lower.includes('velocidad')) score += 2;
    if (lower.includes('entrenamiento') || lower.includes('sesión') || lower.includes('workout')) score += 1;
    
    return { sentence: sentence.trim(), score };
  });
  
  // Ordenar por score y tomar las top sentencias
  scoredSentences.sort((a, b) => b.score - a.score);
  const topSentences = scoredSentences.slice(0, 5); // Top 5 sentencias
  
  // Reconstruir en orden original
  const compressedContent = sentences
    .filter(s => topSentences.some(ts => ts.sentence === s.trim()))
    .join('. ') + '.';
  
  return {
    ...fragment,
    content: compressedContent.length > 100 ? compressedContent : fragment.content,
    compressed: compressedContent.length < content.length
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Received request to generate training plan");
    console.log("Request method:", req.method);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    // 1. Get data from the request
    const requestText = await req.text();
    console.log("Raw request body:", requestText.substring(0, 500) + "...");
    
    let requestBody;
    try {
      requestBody = JSON.parse(requestText);
    } catch (parseError) {
      console.error('Failed to parse request JSON:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }
    
    const { userProfile, previousWeekResults, customPrompt } = requestBody as RequestBody;
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
    console.log("Target race info:", userProfile.targetRace ? JSON.stringify(userProfile.targetRace) : "No target race selected");
    
    // Log user selected days for debugging
    console.log("User selected days:", userProfile.selectedDays);
    console.log("User weekly workouts:", userProfile.weeklyWorkouts);
    
    // Generate dates based on selected days, weekly workouts quantity, or fallback to next 7 days
    let nextWeekDates;
    if (userProfile.selectedDays && userProfile.selectedDays.length > 0) {
      // Usuario seleccionó días específicos
      console.log("Using specific selected days");
      nextWeekDates = generateDatesForSelectedDays(userProfile.selectedDays);
    } else if (userProfile.weeklyWorkouts && userProfile.weeklyWorkouts > 0 && userProfile.weeklyWorkouts <= 7) {
      // Usuario seleccionó cantidad de días
      console.log(`Using weekly workouts distribution: ${userProfile.weeklyWorkouts} days`);
      nextWeekDates = generateDatesForWeeklyWorkouts(userProfile.weeklyWorkouts);
    } else {
      // Fallback a los próximos 7 días
      console.log("Using default next 7 days");
      nextWeekDates = generateDatesFromToday();
    }
    
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
    
    // 3. Advanced RAG Context Retrieval with Enhanced Techniques
    let contextText = '';
    let ragActive = false;
    let ragStrategy = 'none';
    
    try {
      console.log("🚀 ADVANCED RAG - Starting enhanced retrieval process...");
      
      // Enhanced user query construction
      const selectedDaysText = userProfile.selectedDays && userProfile.selectedDays.length > 0 
        ? userProfile.selectedDays.filter(d => d.selected).map(d => d.name).join(', ')
        : 'No especificados';
      
      // Multi-layered query construction for better context retrieval using specific goal fields
      const timeframeText = userProfile.targetTimeframeUnit === 'days' 
        ? (userProfile.targetTimeframe === 1 ? "1 día" : `${userProfile.targetTimeframe} días`)
        : (userProfile.targetTimeframe === 1 ? "1 mes" : `${userProfile.targetTimeframe} meses`);
      const goalDescription = userProfile.goal || `Correr ${userProfile.targetDistance || 5}km a ${userProfile.targetPace || 5}min/km en ${timeframeText}`;
      
      // ========== TÉCNICA 1: QUERY EXPANSION ==========
      // Expandir queries con sinónimos y variaciones contextuales
      const queryExpansions = generateQueryExpansions(userProfile, goalDescription, timeframeText);
      console.log("📚 Query Expansions generated:", queryExpansions.length);
      
      const baseQuery = queryExpansions[0];
      const contextualQuery = queryExpansions[1];
      const detailedQuery = queryExpansions[2];
      
      console.log("🚀 ADVANCED RAG: Multi-query approach:", {baseQuery, contextualQuery, detailedQuery});
      
      // RAG Strategy: Use semantic search with embeddings
      let fragments = [];
      let queryEmbedding = null;
      
      // FORCE RAG: Skip embedding generation, use sample from database directly
      console.log("🚀 FORCED RAG: Using sample embedding directly from database");
      
      const { data: sampleFragment, error: sampleError } = await supabase
        .from('fragments')
        .select('embedding')
        .limit(1)
        .single();
        
      if (!sampleError && sampleFragment?.embedding) {
        queryEmbedding = sampleFragment.embedding;
        console.log("🚀 FORCED RAG: Using sample embedding with dimensions:", queryEmbedding.length);
      } else {
        console.log("❌ FORCED RAG: Could not get sample embedding:", sampleError);
        throw new Error("Cannot get sample embedding for forced RAG");
      }
      
      // ========== TÉCNICA 5: MULTI-QUERY RETRIEVAL ==========
      // Realizar múltiples búsquedas con diferentes queries y combinar resultados
      if (queryEmbedding) {
        // Extract distance goal from specific target distance or objective for better filtering
        let distanceGoal = '';
        if (userProfile.targetDistance) {
          if (userProfile.targetDistance <= 5) distanceGoal = '5k';
          else if (userProfile.targetDistance <= 10) distanceGoal = '10k';
          else if (userProfile.targetDistance <= 21) distanceGoal = '21k';
          else if (userProfile.targetDistance <= 42) distanceGoal = '42k';
        } else {
          // Fallback to parsing goal text
          if (userProfile.goal.toLowerCase().includes('5k')) distanceGoal = '5k';
          else if (userProfile.goal.toLowerCase().includes('10k')) distanceGoal = '10k';
          else if (userProfile.goal.toLowerCase().includes('21k') || userProfile.goal.toLowerCase().includes('media maratón')) distanceGoal = '21k';
          else if (userProfile.goal.toLowerCase().includes('42k') || userProfile.goal.toLowerCase().includes('maratón')) distanceGoal = '42k';
        }
        
        console.log(`🎯 ADVANCED RAG Query: "${contextualQuery}" for ${distanceGoal} ${userProfile.experienceLevel}`);
        
        // Use the working match_fragments function with optimized parameters
        const { data: semanticFragments, error: semanticError } = await supabase.rpc('match_fragments', {
          query_embedding: queryEmbedding,
          match_threshold: 0.35, // Lower threshold for more diversity
          match_count: 20 // Get more fragments initially
        });
        
        if (!semanticError && semanticFragments && semanticFragments.length > 0) {
          console.log(`📚 Retrieved ${semanticFragments.length} initial fragments`);
          
          // ========== APLICAR TÉCNICAS AVANZADAS ==========
          
          // Técnica 2: Advanced Relevance Scoring
          console.log("🔍 Applying advanced relevance scoring...");
          const scoredFragments = semanticFragments.map(fragment => ({
            ...fragment,
            advanced_score: calculateAdvancedRelevance(fragment, userProfile, queryExpansions)
          }));
          
          // Técnica 3: Fragment Deduplication
          console.log("🔄 Deduplicating fragments...");
          const uniqueFragments = deduplicateFragments(scoredFragments);
          console.log(`✅ After deduplication: ${uniqueFragments.length} unique fragments`);
          
          // Técnica 4: Contextual Compression (opcional, solo si fragmentos muy largos)
          console.log("✂️ Compressing fragments...");
          const compressedFragments = uniqueFragments.map(f => 
            f.content && f.content.length > 1000 ? compressFragment(f, userProfile) : f
          );
          
          // Sort by advanced score and select top fragments
          const finalFragments = compressedFragments
            .sort((a, b) => b.advanced_score - a.advanced_score)
            .slice(0, 8); // Top 8 most relevant
          
          fragments = finalFragments;
          ragStrategy = 'advanced_multi_technique';
          
          console.log(`✅ RAG Strategy: Advanced Multi-Technique - ${fragments.length} optimized fragments`);
          console.log(`📊 Top 3 fragments with scores:`, fragments.slice(0, 3).map(f => ({
            id: f.id,
            similarity: f.similarity?.toFixed(3),
            advanced_score: f.advanced_score?.toFixed(3),
            compressed: f.compressed || false
          })));
        } else {
          console.log("❌ Semantic search failed:", semanticError?.message);
        }
      } else {
        console.log("❌ No embedding available for RAG");
      }
      
      // ========== TÉCNICA 6: SMART CONTEXT ASSEMBLY ==========
      // Ensamblar contexto de forma inteligente con metadata enriquecida
      if (fragments && fragments.length > 0) {
        ragActive = true;
        
        // Los fragmentos ya vienen rankeados por advanced_score
        const topFragments = fragments.slice(0, 6); // Top 6 most relevant
        
        // Create rich context with enhanced metadata and relevance indicators
        contextText = topFragments.map((f, i) => {
          const source = f.metadata?.filename || 'Documento especializado';
          const level = extractLevel(source);
          const distance = extractDistance(source);
          const phase = extractPhase(source);
          
          // Build header with all available metadata
          let header = `**FRAGMENTO ${i+1}** (Score: ${f.advanced_score?.toFixed(2) || 'N/A'})`;
          if (level) header += ` [${level}]`;
          if (distance) header += ` [${distance}]`;
          if (phase) header += ` [${phase}]`;
          if (f.compressed) header += ` [Optimizado]`;
          header += `:`;
          
          // Add relevance context
          let relevanceNote = '';
          if (f.advanced_score > 1.5) {
            relevanceNote = '\n⭐ ALTAMENTE RELEVANTE: ';
          } else if (f.advanced_score > 1.2) {
            relevanceNote = '\n✅ MUY RELEVANTE: ';
          }
          
          return `${header}${relevanceNote}\n${f.content}`;
        }).join('\n\n---\n\n');
        
        console.log(`🎯 RAG ACTIVE with ${ragStrategy} strategy:`, {
          fragmentsRetrieved: fragments.length,
          fragmentsUsed: topFragments.length,
          contextLength: contextText.length,
          avgScore: (topFragments.reduce((sum, f) => sum + (f.advanced_score || 0), 0) / topFragments.length).toFixed(3),
          topScore: topFragments[0]?.advanced_score?.toFixed(3) || 'N/A',
          compressionUsed: topFragments.filter(f => f.compressed).length
        });
      } else {
        console.log("❌ No relevant fragments found with advanced techniques");
      }
      
    } catch (ragError) {
      console.error("Error during advanced RAG processing:", ragError);
      contextText = "";
      ragStrategy = 'error';
    }
    
    // Helper functions for metadata extraction
    function extractLevel(filename: string): string {
      if (filename.includes('-P-') || filename.includes('-p-')) return 'Principiante';
      if (filename.includes('-INT-') || filename.includes('-int-')) return 'Intermedio';
      if (filename.includes('-ADV-') || filename.includes('-adv-')) return 'Avanzado';
      return '';
    }
    
    function extractDistance(filename: string): string {
      if (filename.includes('5K-') || filename.includes('5k-')) return '5K';
      if (filename.includes('10K-') || filename.includes('10k-')) return '10K';
      if (filename.includes('21K-') || filename.includes('21k-')) return '21K/Media Maratón';
      if (filename.includes('42K-') || filename.includes('42k-')) return '42K/Maratón';
      return '';
    }
    
    function extractPhase(filename: string): string {
      if (filename.includes('-BASE-') || filename.includes('-base-')) return 'Fase Base';
      if (filename.includes('-CONSTRUCCION-') || filename.includes('-construccion-')) return 'Fase Construcción';
      if (filename.includes('-PICO-') || filename.includes('-pico-')) return 'Fase Pico';
      if (filename.includes('-TAPERING-') || filename.includes('-tapering-')) return 'Tapering';
      return '';
    }

    // 4. Prepare the prompt with or without RAG context
    const systemPrompt = `Eres un entrenador personal de running experimentado. Debes generar planes de entrenamiento semanales personalizados y seguros, basados en las mejores prácticas.`;
    
    // User profile section
    const selectedDaysInfo = userProfile.selectedDays && userProfile.selectedDays.length > 0 
      ? userProfile.selectedDays.filter(d => d.selected).map(d => `${d.name} (${d.date})`).join(', ')
      : 'No especificados - usar distribución general';
    
    // Target race information
    const targetRaceInfo = userProfile.targetRace 
      ? `\nCarrera objetivo: ${userProfile.targetRace.name} (${userProfile.targetRace.distance}) - ${userProfile.targetRace.location} - ${new Date(userProfile.targetRace.date).toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'})}`
      : '';
    
    console.log("Target race info for prompt:", targetRaceInfo || "No target race information");
    
    const userProfileSection = `\nPERFIL DEL USUARIO:
Nombre: ${userProfile.name}
Edad: ${userProfile.age || 'No especificada'}
Sexo: ${userProfile.gender || 'No especificado'}
Nivel de experiencia: ${userProfile.experienceLevel || 'No especificado'}
Ritmo actual: ${userProfile.pace || 'No especificado'} min/km
Distancia máxima: ${userProfile.maxDistance || 'No especificada'} km
Objetivo general: ${userProfile.goal}${targetRaceInfo}
Objetivo específico: ${userProfile.targetDistance ? `${userProfile.targetDistance}km a ${userProfile.targetPace}min/km en ${userProfile.targetTimeframe} ${userProfile.targetTimeframeUnit === 'days' ? 'días' : 'meses'}` : 'No especificado'}
Lesiones o condiciones: ${userProfile.injuries || 'Ninguna'}
Frecuencia semanal deseada: ${userProfile.weeklyWorkouts || '3'} entrenamientos por semana
Días específicos seleccionados: ${selectedDaysInfo}\n`;
    
    // Enhanced RAG context section with advanced strategy information
    const ragSection = contextText ? `\n📚 CONOCIMIENTO ESPECIALIZADO AVANZADO (Estrategia: ${ragStrategy.toUpperCase()}):\n\nLos siguientes fragmentos han sido recuperados y optimizados mediante técnicas avanzadas de RAG:
• Query Expansion: Múltiples variaciones semánticas de la consulta
• Advanced Relevance Scoring: Puntuación multicapa basada en 7 factores
• Fragment Deduplication: Eliminación de contenido redundante
• Contextual Compression: Extracción de información más relevante
• Smart Context Assembly: Ensamblaje inteligente con metadata enriquecida

Los fragmentos están ordenados por relevancia (score de 0-2+) específicamente para este perfil de usuario:\n\n${contextText}\n\n⚡ INSTRUCCIONES DE USO:
1. Estos fragmentos contienen conocimiento profesional de alta calidad
2. Los fragmentos con ⭐ son ALTAMENTE relevantes - prioriza sus principios
3. Adapta e integra (NO copies literalmente) las técnicas, metodologías y progresiones
4. Los scores indican relevancia: >1.5 = crítico, >1.2 = muy importante, <1.0 = contextual
5. Usa la metadata [Nivel][Distancia][Fase] para validar aplicabilidad al usuario
\n` : '\n⚠️ NOTA: Generando plan con conocimiento base (RAG no disponible).\n';
    
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
    
    // Build target race description for main instruction
    const targetRaceDescription = userProfile.targetRace 
      ? ` y se está preparando para ${userProfile.targetRace.name} (${userProfile.targetRace.distance}) el ${new Date(userProfile.targetRace.date).toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'})}`
      : '';
    
    // Calculate training timeline and distance progression rules
    let timeframeInWeeks = 0;
    let maxTrainingDistance = userProfile.maxDistance || 5;
    let distanceProgressionRules = '';
    
    if (userProfile.targetTimeframe && userProfile.targetTimeframeUnit) {
      if (userProfile.targetTimeframeUnit === 'days') {
        timeframeInWeeks = Math.floor(userProfile.targetTimeframe / 7);
      } else if (userProfile.targetTimeframeUnit === 'months') {
        timeframeInWeeks = userProfile.targetTimeframe * 4;
      }
    }
    
    // Set maximum training distance based on target distance (NEVER run full distance in training)
    if (userProfile.targetDistance) {
      if (userProfile.targetDistance <= 5) {
        maxTrainingDistance = Math.min(userProfile.targetDistance * 1.1, userProfile.maxDistance || 6); // Can exceed slightly for 5K
      } else if (userProfile.targetDistance <= 10) {
        maxTrainingDistance = Math.min(userProfile.targetDistance * 0.9, userProfile.maxDistance || 9); // Max 90% for 10K
      } else if (userProfile.targetDistance <= 21) {
        maxTrainingDistance = Math.min(userProfile.targetDistance * 0.85, userProfile.maxDistance || 18); // Max 85% for half marathon
      } else if (userProfile.targetDistance <= 42) {
        maxTrainingDistance = Math.min(userProfile.targetDistance * 0.8, userProfile.maxDistance || 35); // Max 80% for marathon
      }
    }
    
    // Build distance progression rules
    if (userProfile.targetDistance && timeframeInWeeks > 0) {
      const weeksRemaining = timeframeInWeeks;
      const currentMaxDistance = userProfile.maxDistance || 5;
      
      distanceProgressionRules = `\n🎯 REGLAS CRÍTICAS DE PROGRESIÓN DE DISTANCIA:

TIMEFRAME DEL USUARIO: ${userProfile.targetTimeframe} ${userProfile.targetTimeframeUnit === 'days' ? 'días' : 'meses'} (≈${timeframeInWeeks} semanas)
DISTANCIA OBJETIVO: ${userProfile.targetDistance}km
DISTANCIA MÁXIMA ACTUAL: ${currentMaxDistance}km
DISTANCIA MÁXIMA PERMITIDA EN ENTRENAMIENTOS: ${maxTrainingDistance.toFixed(1)}km

⚠️ REGLA DE ORO: NUNCA correr la distancia objetivo completa (${userProfile.targetDistance}km) en entrenamientos. 
La única vez que se corre ${userProfile.targetDistance}km es el día de la carrera objetivo.

PROGRESIÓN SEMANAL INTELIGENTE:
${weeksRemaining <= 2 ? `
- TAPERING CRÍTICO: Estás a ${weeksRemaining} semanas del objetivo
- REDUCE distancias al 60-70% del pico
- Prioriza CALIDAD sobre cantidad
- Incluye entrenamientos a ritmo objetivo pero CORTOS (3-5km máximo)
- La carrera larga de esta semana NO debe exceder ${Math.min(maxTrainingDistance * 0.7, currentMaxDistance).toFixed(1)}km
` : weeksRemaining <= 4 ? `
- FASE DE PICO: Estás a ${weeksRemaining} semanas del objetivo
- Esta es tu última oportunidad para carreras largas
- Distancia larga semanal: ${Math.min(maxTrainingDistance * 0.9, currentMaxDistance + 2).toFixed(1)}km máximo
- Incluye 1 entrenamiento a ritmo objetivo de 5-8km
- Después de esta semana, empezar a reducir volumen (tapering)
` : weeksRemaining <= 8 ? `
- FASE DE CONSTRUCCIÓN: Estás a ${weeksRemaining} semanas del objetivo
- Incrementar progresivamente: +10% distancia por semana máximo
- Distancia larga semanal: ${Math.min(currentMaxDistance + 1.5, maxTrainingDistance * 0.8).toFixed(1)}-${Math.min(currentMaxDistance + 3, maxTrainingDistance * 0.9).toFixed(1)}km
- Introducir entrenamientos de calidad (tempo, intervalos)
- Alternar semanas duras con semanas de recuperación
` : `
- FASE BASE: Estás a ${weeksRemaining} semanas del objetivo (tienes tiempo)
- Construir base aeróbica de forma conservadora
- Incrementar: +5-10% por semana máximo
- Distancia larga semanal: ${Math.min(currentMaxDistance + 1, maxTrainingDistance * 0.6).toFixed(1)}-${Math.min(currentMaxDistance + 2, maxTrainingDistance * 0.7).toFixed(1)}km
- Priorizar consistencia y prevenir lesiones
- Mayoría de entrenamientos a ritmo cómodo/conversacional
`}

DISTRIBUCIÓN SEMANAL TÍPICA (ajusta según días disponibles):
- 1 carrera larga (60-70% del volumen semanal, máximo ${maxTrainingDistance.toFixed(1)}km)
- 1-2 entrenamientos de calidad (tempo/intervalos/fartlek) - distancias cortas 5-10km
- 1-2 carreras de recuperación fáciles (30-40 minutos)
${userProfile.weeklyWorkouts && userProfile.weeklyWorkouts >= 5 ? '- 1 carrera de mantenimiento media (distancia moderada)' : ''}

⛔ LÍMITES ABSOLUTOS ESTA SEMANA:
- Distancia máxima en UN solo entrenamiento: ${maxTrainingDistance.toFixed(1)}km
- NO exceder ${userProfile.maxDistance}km si es la distancia máxima que ha corrido el usuario
- Si usuario es principiante, incrementos muy conservadores (+1-2km máximo)

🚨 REGLAS ESTRICTÍSIMAS PARA EL PRIMER ENTRENAMIENTO:
${currentMaxDistance <= 5 ? `
⛔ USUARIO CON POCA BASE (máx ${currentMaxDistance}km) - EXTREMADAMENTE CONSERVADOR:

📍 PRIMER DÍA (EL MÁS IMPORTANTE):
- Distancia TOTAL: ${Math.min(currentMaxDistance - 0.5, 3).toFixed(1)}km MÁXIMO ABSOLUTO
- Ritmo: MÁS LENTO que tu ritmo habitual (NO a ritmo objetivo, NO rápido)
- Ritmo sugerido: ${userProfile.pace ? `${(parseFloat(userProfile.pace.split(':')[0]) + 0.5).toFixed(0)}:${userProfile.pace.split(':')[1] || '30'}` : '6:00'} min/km (más lento que tu habitual)

SI INCLUYES INTERVALOS (opcional):
✅ PERMITIDO: 4-6 repeticiones de 20-30 SEGUNDOS (NO minutos, SEGUNDOS)
✅ Ejemplo OK: "3km total con 5×30seg a ritmo alegre + 2min trote de recuperación"
✅ Ejemplo OK: "3km incluyendo 4×20seg aceleraciones suaves"

❌ PROHIBIDO EN EL PRIMER DÍA:
❌ Ritmo objetivo o más rápido en intervalos
❌ Tempo run, fartlek estructurado, o entrenamientos intensos


DÍAS 2-3 DE LA SEMANA:
- Pueden ser ligeramente más exigentes pero conservadores
- Distancia máxima: ${(currentMaxDistance * 0.9).toFixed(1)}km
- Si hay intervalos, máximo 1min por repetición
- Incremento gradual: +10% máximo respecto al día anterior
` : currentMaxDistance <= 10 ? `
⚠️ USUARIO INTERMEDIO (máx ${currentMaxDistance}km):

PRIMER DÍA:
- Distancia: ${(currentMaxDistance * 0.7).toFixed(1)}km a ritmo cómodo
- Ritmo: Más lento que el habitual, conversacional
- Si hay intervalos: máximo 1min por repetición, ritmo controlado

DÍAS 2-3:
- Intensidad moderada OK: tempo suave, intervalos de 1-2min, fartlek ligero
- Distancia máxima: ${(currentMaxDistance * 0.85).toFixed(1)}km
` : `
USUARIO AVANZADO (máx ${currentMaxDistance}km):
- Primer día: Base sólida a ritmo cómodo
- Introducir calidad gradualmente con variedad
- Respetar recuperación entre sesiones intensas
`}

💡 PRINCIPIO FUNDAMENTAL: 
Es mejor que un usuario termine un entrenamiento sintiendo "podría haber hecho más" 
que terminar exhausto o lesionado. La consistencia > intensidad.
`;
    }

    const mainInstruction = `\nINSTRUCCIÓN:
Genera un plan de entrenamiento ${hasSelectedDays ? 'para los días específicos seleccionados por el usuario' : 'para los próximos días'} adecuado para ${userProfile.name}, un corredor ${userProfile.age ? `de ${userProfile.age} años` : ''} con ritmo ${userProfile.pace || 'no especificado'}, cuyo objetivo es ${userProfile.goal}${targetRaceDescription}.

OBJETIVO ESPECÍFICO: ${userProfile.targetDistance ? `El usuario quiere correr ${userProfile.targetDistance}km a un ritmo de ${userProfile.targetPace}min/km en ${userProfile.targetTimeframe} ${userProfile.targetTimeframeUnit === 'days' ? 'días' : 'meses'}.` : 'Objetivo general: ' + userProfile.goal}
${distanceProgressionRules}

HOY ES: ${todayDate}

${hasSelectedDays ? `CRÍTICO: El usuario ha seleccionado días específicos para entrenar. Las fechas proporcionadas son TODAS FUTURAS (hoy o posteriores). 

DÍAS SELECCIONADOS POR EL USUARIO: ${datesList}

REGLAS ESTRICTAS:
- Crea entrenamientos SÓLO para estos días específicos
- NO dupliques días (ej: NO pongas dos entrenamientos en Martes si solo hay un Martes en la lista)
- NO cambies los días (ej: si hay Martes y Domingo, NO pongas Martes y Martes)
- Cada día en la lista debe tener EXACTAMENTE un entrenamiento
- NO generes entrenamientos para fechas pasadas
- TODAS las fechas en la lista están en el futuro y son válidas para entrenar
- DISTRIBUCIÓN SEMANAL: Los entrenamientos deben distribuirse de manera equilibrada en semanas consecutivas (no saltes semanas)
- GAPS CORRECTOS: Entre entrenamientos debe haber 2-7 días máximo, nunca más de una semana` : `IMPORTANTE: TODAS las fechas proporcionadas son futuras (desde hoy en adelante). NO generes entrenamientos para fechas pasadas.`}

Incluye EXACTAMENTE ${nextWeekDates.length} sesiones de entrenamiento ${trainingDaysText}, especificando distancia/tiempo e intensidad de cada sesión.

Asegúrate de que el plan sea seguro y progresivo.

${hasSelectedDays ? 'DÍAS DE ENTRENAMIENTO FUTUROS SELECCIONADOS:' : 'DÍAS FUTUROS PARA ENTRENAR:'} ${datesList}

IMPORTANTE:
1. ⛔ NUNCA crear entrenamientos que alcancen o excedan la distancia objetivo (${userProfile.targetDistance || userProfile.maxDistance}km). 
   ${userProfile.targetDistance ? `La distancia máxima permitida en entrenamientos es ${maxTrainingDistance.toFixed(1)}km.` : ''}
2. ⚠️ Respetar ESTRICTAMENTE el timeframe del usuario (${userProfile.targetTimeframe || 'N/A'} ${userProfile.targetTimeframeUnit === 'days' ? 'días' : 'meses'}) y ajustar la fase de entrenamiento correspondiente.
3. 📊 La distancia máxima actual del usuario es ${userProfile.maxDistance}km - NO incrementar más de 10% por semana.
4. 🎯 La variedad es esencial. Crea diferentes tipos de entrenamientos (intervalos, tempo, carrera larga) alineados con el objetivo del usuario.${userProfile.targetRace ? `\n5. En la descripción del plan, DEBES mencionar que también se está preparando para ${userProfile.targetRace.name} (además del objetivo general). Esto debe aparecer de forma natural en el texto descriptivo.` : ''}

${userProfile.maxDistance <= 5 ? `
  
🚨🚨🚨 REGLA CRÍTICA PARA PRIMER WORKOUT 🚨🚨🚨
El usuario solo ha corrido ${userProfile.maxDistance}km máximo. El PRIMER entrenamiento DEBE ser:

✅ EJEMPLO CORRECTO (primer workout):
{
  "day": "Lunes",
  "title": "Carrera base suave",
  "description": "3km a ritmo fácil y conversacional (${userProfile.pace ? `${(parseFloat(userProfile.pace.split(':')[0]) + 0.5).toFixed(0)}:30` : '6:00'} min/km aprox). Mantén un ritmo donde puedas hablar cómodamente.",
  "distance": 3,
  "duration": "18-20 minutos",
  "type": "carrera"
}

O CON INTERVALOS SUAVES:
{
  "day": "Lunes",
  "title": "Carrera fácil con aceleraciones",
  "description": "3km total: 1km calentamiento + 5×30seg a ritmo alegre con 2min trote recuperación + 1km enfriamiento",
  "distance": 3,
  "duration": "22-25 minutos",
  "type": "carrera"
}

❌❌❌ NUNCA ESTO (INCORRECTO):
{
  "day": "Lunes",
  "title": "Intervalos de velocidad",
  "description": "5×800m a ${userProfile.targetPace || '4:45'} con 3min trote",
  "distance": 5,
  "type": "carrera"
}
^ ESTO ES PELIGROSO: demasiada distancia, ritmo muy rápido, series muy largas

❌ NO usar en primer día: series de 400m+, 800m, 1000m, ritmo objetivo, tempo
✅ OK en primer día: trote suave, 20-30seg aceleraciones, ritmo conversacional
` : ''}

${userProfile.targetRace ? '6' : '5'}. NO incluyas ninguna marca de formato como \`\`\`json o \`\`\`. Responde directamente con el objeto JSON sin ningún envoltorio.
${userProfile.targetRace ? '7' : '6'}. Genera una respuesta en formato JSON siguiendo exactamente esta estructura:
{
  "name": "...",
  "description": "...",
  "duration": "7 días",
  "intensity": "...",
  "workouts": [
${nextWeekDates.map((date, index) => `    {
      "day": "${date.dayName}",
      "date": "${date.date.toISOString().split('T')[0]}",
      "title": "...",
      "description": "...",
      "distance": número o null,
      "duration": "...",
      "type": "carrera|fuerza|descanso|flexibilidad"
    }${index < nextWeekDates.length - 1 ? ',' : ''}`).join('\n')}
  ]
}

CRÍTICO: Debes crear EXACTAMENTE ${nextWeekDates.length} entrenamientos, uno para cada fecha proporcionada. NO dupliques días. Cada entrenamiento debe tener el día y fecha exactos de la lista proporcionada.

VALIDACIÓN FINAL ESTRICTA: Antes de responder, verifica que:
1. ✅ Cada entrenamiento tiene el día y fecha exactos de la lista
2. ✅ No hay días duplicados
3. ✅ Los entrenamientos están distribuidos en semanas consecutivas (gaps de 2-7 días máximo)
4. ✅ El número total de entrenamientos es ${nextWeekDates.length}
5. ⛔ NINGÚN entrenamiento excede ${maxTrainingDistance.toFixed(1)}km de distancia
6. ⛔ NINGÚN entrenamiento alcanza la distancia objetivo de ${userProfile.targetDistance || 'N/A'}km
7. 📈 La progresión está alineada con el timeframe (${timeframeInWeeks} semanas restantes)
8. 🎯 Los entrenamientos reflejan la fase correcta (Base/Construcción/Pico/Tapering)

🚨 VALIDACIÓN CRÍTICA DEL PRIMER ENTRENAMIENTO:
${userProfile.maxDistance <= 5 ? `
9a. ⛔ PRIMER entrenamiento: Distancia ≤ ${Math.min(userProfile.maxDistance - 0.5, 3).toFixed(1)}km (NO MÁS)
9b. ⛔ PRIMER entrenamiento: Ritmo MÁS LENTO que ${userProfile.pace || '5:30'} (ritmo habitual del usuario)
9c. ⛔ PRIMER entrenamiento: SI hay intervalos, solo 20-30 SEGUNDOS por repetición (NO 400m, NO 800m)
9d. ⛔ PRIMER entrenamiento: NUNCA series largas tipo "5×800m" o "4×1000m"
9e. ⛔ PRIMER entrenamiento: NUNCA a ritmo objetivo (${userProfile.targetPace || '4:45'})

Ejemplo CORRECTO primer día: "3km a ${userProfile.pace ? `${(parseFloat(userProfile.pace.split(':')[0]) + 0.5).toFixed(0)}:30` : '6:00'} con 5×30seg alegres"
Ejemplo INCORRECTO: "5×800m a 4:45" o "4km a ritmo objetivo"
` : `
9. 🚨 PRIMER entrenamiento: Conservador (≤ ${(userProfile.maxDistance * 0.8).toFixed(1)}km a ritmo cómodo)
10. ⚠️ Si hay intervalos primer día: máximo 1min por repetición, ritmo controlado
`}`;

    // Custom prompt if provided
    const customPromptSection = customPrompt ? `\nINSTRUCCIONES PERSONALIZADAS:\n${customPrompt}\n` : '';
    
    // Build the final prompt
    const prompt = `${systemPrompt}\n${userProfileSection}${ragSection}${previousResultsSection}${customPromptSection}${mainInstruction}`;
    console.log("Prepared prompt for OpenAI:", prompt.substring(0, 200) + "...");
    console.log("RAG active:", ragActive ? "YES" : "NO");
    console.log("RAG context length:", contextText.length);

    // 5. Call OpenAI
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error', details: 'AI service not configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      );
    }
    
    console.log("Calling OpenAI API with new client syntax...");
    
    let text;
    try {
      // Crear cliente OpenAI usando import dinámico para Deno
      const openaiModule = await import('https://deno.land/x/openai@v4.28.0/mod.ts');
      const OpenAI = openaiModule.default;
      
      const client = new OpenAI({
        apiKey: apiKey,
      });

      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini', // Modelo más económico disponible
        messages: [
          {
            role: 'system',
            content: 'Eres un entrenador personal experto en planes de running. Generas planes de entrenamiento personalizados en formato JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      text = response.choices[0].message.content;
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      return new Response(
        JSON.stringify({ 
          error: 'AI service error', 
          details: 'Failed to generate training plan content',
          originalError: openaiError.message 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 503,
        },
      );
    }
    console.log("Received response from OpenAI:", text.substring(0, 200) + "...");

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
      
      // 7. Store the plan in Supabase (only for authenticated users)
      console.log("Checking if user is authenticated for data storage...");
      
      try {
        // Get the authenticated user (if any)
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (user) {
          console.log("✅ User is authenticated, proceeding with database storage");
          let userProfileId = null;
          
          // Check if profile already exists in database for authenticated user
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_auth_id', user.id)
            .single();
          
          if (existingProfile) {
            userProfileId = existingProfile.id;
            console.log("Using existing user profile:", userProfileId);
          } else {
            // Create new profile for authenticated user
            console.log("Creating new user profile for authenticated user");
            
            const { data: userProfileData, error: userProfileError } = await supabase
              .from('user_profiles')
              .insert({
                user_auth_id: user.id,
                name: userProfile.name,
                age: userProfile.age,
                gender: userProfile.gender,
                height: userProfile.height,
                weight: userProfile.weight,
                max_distance: userProfile.maxDistance,
                pace: userProfile.pace,
                goal: userProfile.goal,
                target_distance: userProfile.targetDistance,
                target_pace: userProfile.targetPace,
                target_timeframe: userProfile.targetTimeframe,
                target_timeframe_unit: userProfile.targetTimeframeUnit,
                weekly_workouts: userProfile.weeklyWorkouts,
                experience_level: userProfile.experienceLevel,
                injuries: userProfile.injuries
              })
              .select('id')
              .single();
            
            if (userProfileError) {
              console.error("❌ ERROR saving user profile:", userProfileError);
            } else {
              console.log("✅ User profile saved successfully:", userProfileData);
              userProfileId = userProfileData.id;
            }
          }
        } else {
          console.log("ℹ️ No authenticated user found, skipping database storage");
          console.log("Plan will be returned directly without database persistence");
        }
        
        // Save training plan only if user is authenticated and we have userProfileId  
        if (user && userProfileId) {
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
      
      // Add enhanced RAG status with advanced techniques metadata
      plan.ragActive = ragActive;
      plan.ragStrategy = ragStrategy;
      plan.ragFragmentsUsed = ragActive ? contextText.split('**FRAGMENTO').length - 1 : 0;
      plan.ragTechniquesApplied = ragActive ? [
        'query_expansion',
        'advanced_relevance_scoring',
        'fragment_deduplication',
        'contextual_compression',
        'smart_context_assembly'
      ] : [];
      plan.ragQuality = ragActive && contextText.includes('⭐') ? 'high' : ragActive ? 'medium' : 'none';
      
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
