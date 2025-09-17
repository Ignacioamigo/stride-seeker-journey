import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Función de prueba RAG con embedding fijo
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userProfile } = await req.json();
    
    // Crear cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log("TESTING RAG WITH FIXED EMBEDDING");
    
    // Obtener un embedding existente de la base de datos
    const { data: sampleFragment, error: sampleError } = await supabase
      .from('fragments')
      .select('embedding')
      .limit(1)
      .single();

    if (sampleError || !sampleFragment?.embedding) {
      throw new Error('No se pudo obtener embedding de muestra');
    }

    console.log("Using sample embedding with dimensions:", sampleFragment.embedding.length);

    // Extract distance goal from objective
    let distanceGoal = '';
    if (userProfile.goal.toLowerCase().includes('5k')) distanceGoal = '5k';
    else if (userProfile.goal.toLowerCase().includes('10k')) distanceGoal = '10k';
    else if (userProfile.goal.toLowerCase().includes('21k')) distanceGoal = '21k';
    else if (userProfile.goal.toLowerCase().includes('42k')) distanceGoal = '42k';

    // Probar búsqueda contextual
    const { data: contextualFragments, error: contextualError } = await supabase.rpc('contextual_search_fragments', {
      query_embedding: sampleFragment.embedding,
      user_level: userProfile.experienceLevel || '',
      workout_type: userProfile.goal.toLowerCase(),
      distance_goal: distanceGoal,
      match_threshold: 0.6,
      match_count: 5
    });

    console.log("Contextual search result:", { contextualFragments, contextualError });

    // Probar búsqueda híbrida como fallback
    const { data: hybridFragments, error: hybridError } = await supabase.rpc('hybrid_search_fragments', {
      query_embedding: sampleFragment.embedding,
      query_text: `entrenamiento ${distanceGoal} ${userProfile.experienceLevel}`,
      match_threshold: 0.5,
      match_count: 5
    });

    console.log("Hybrid search result:", { hybridFragments, hybridError });

    // Probar búsqueda básica como último recurso
    const { data: basicFragments, error: basicError } = await supabase.rpc('match_fragments', {
      query_embedding: sampleFragment.embedding,
      match_threshold: 0.4,
      match_count: 5
    });

    console.log("Basic search result:", { basicFragments, basicError });

    let fragments = [];
    let ragStrategy = 'none';

    if (!contextualError && contextualFragments && contextualFragments.length > 0) {
      fragments = contextualFragments;
      ragStrategy = 'contextual';
    } else if (!hybridError && hybridFragments && hybridFragments.length > 0) {
      fragments = hybridFragments;
      ragStrategy = 'hybrid';
    } else if (!basicError && basicFragments && basicFragments.length > 0) {
      fragments = basicFragments;
      ragStrategy = 'basic';
    }

    const ragActive = fragments.length > 0;

    console.log(`RAG Test Results:`, {
      ragActive,
      ragStrategy,
      fragmentsFound: fragments.length,
      contextualError: contextualError?.message,
      hybridError: hybridError?.message,
      basicError: basicError?.message
    });

    return new Response(
      JSON.stringify({
        success: true,
        ragActive,
        ragStrategy,
        fragmentsFound: fragments.length,
        fragments: fragments.slice(0, 3), // Solo primeros 3 para no saturar
        userProfile,
        distanceGoal,
        errors: {
          contextual: contextualError?.message,
          hybrid: hybridError?.message,
          basic: basicError?.message
        }
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error("Error in RAG test:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
