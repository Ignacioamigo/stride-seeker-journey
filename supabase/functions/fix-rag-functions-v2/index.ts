import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Crear cliente Supabase con service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log("Testing current RAG functions...");

    // Test current functions first
    const sampleEmbedding = Array(768).fill(0.1);
    
    // Test contextual search
    const { data: contextualTest, error: contextualTestError } = await supabase.rpc('contextual_search_fragments', {
      query_embedding: sampleEmbedding,
      user_level: 'intermediate',
      workout_type: '10k',
      distance_goal: '10k',
      match_threshold: 0.6,
      match_count: 3
    });

    console.log("Contextual test:", { contextualTest, contextualTestError });

    // Test hybrid search
    const { data: hybridTest, error: hybridTestError } = await supabase.rpc('hybrid_search_fragments', {
      query_embedding: sampleEmbedding,
      query_text: 'entrenamiento 10k intermedio',
      match_threshold: 0.5,
      match_count: 3
    });

    console.log("Hybrid test:", { hybridTest, hybridTestError });

    // Test basic search (should work)
    const { data: basicTest, error: basicTestError } = await supabase.rpc('match_fragments', {
      query_embedding: sampleEmbedding,
      match_threshold: 0.4,
      match_count: 3
    });

    console.log("Basic test:", { basicTest, basicTestError });

    return new Response(
      JSON.stringify({
        success: true,
        tests: {
          contextual: {
            working: !contextualTestError,
            error: contextualTestError?.message,
            results: contextualTest?.length || 0
          },
          hybrid: {
            working: !hybridTestError,
            error: hybridTestError?.message,
            results: hybridTest?.length || 0
          },
          basic: {
            working: !basicTestError,
            error: basicTestError?.message,
            results: basicTest?.length || 0
          }
        },
        diagnosis: {
          contextual_error_type: contextualTestError?.code,
          hybrid_error_type: hybridTestError?.code,
          basic_works: !basicTestError
        }
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error("Error in test function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
