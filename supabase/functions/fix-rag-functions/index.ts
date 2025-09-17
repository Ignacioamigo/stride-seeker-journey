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

    console.log("Applying RAG function fixes...");

    // Fix contextual_search_fragments function
    const contextualFix = `
      CREATE OR REPLACE FUNCTION contextual_search_fragments(
        query_embedding vector(768),
        user_level text DEFAULT '',
        workout_type text DEFAULT '',
        distance_goal text DEFAULT '',
        match_threshold float DEFAULT 0.65,
        match_count int DEFAULT 12
      )
      RETURNS TABLE (
        id text,
        content text,
        similarity real,
        relevance_boost real,
        final_score real,
        metadata jsonb
      )
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RETURN QUERY
        SELECT
          fragments.id,
          fragments.content,
          (1 - (fragments.embedding <=> query_embedding))::real AS similarity,
          CASE 
            WHEN user_level != '' AND (
              (user_level ILIKE '%principiante%' AND fragments.metadata->>'filename' ILIKE '%P-%') OR
              (user_level ILIKE '%intermedio%' AND fragments.metadata->>'filename' ILIKE '%INT-%') OR
              (user_level ILIKE '%avanzado%' AND fragments.metadata->>'filename' ILIKE '%ADV-%')
            ) THEN 1.3::real
            WHEN workout_type != '' AND (
              fragments.content ILIKE '%' || workout_type || '%' OR
              fragments.metadata->>'filename' ILIKE '%' || workout_type || '%'
            ) THEN 1.2::real
            WHEN distance_goal != '' AND (
              fragments.metadata->>'filename' ILIKE '%' || distance_goal || '%' OR
              fragments.content ILIKE '%' || distance_goal || '%'
            ) THEN 1.4::real
            ELSE 1.0::real
          END AS relevance_boost,
          ((1 - (fragments.embedding <=> query_embedding)) * 
           CASE 
             WHEN user_level != '' AND (
               (user_level ILIKE '%principiante%' AND fragments.metadata->>'filename' ILIKE '%P-%') OR
               (user_level ILIKE '%intermedio%' AND fragments.metadata->>'filename' ILIKE '%INT-%') OR
               (user_level ILIKE '%avanzado%' AND fragments.metadata->>'filename' ILIKE '%ADV-%')
             ) THEN 1.3
             WHEN workout_type != '' AND (
               fragments.content ILIKE '%' || workout_type || '%' OR
               fragments.metadata->>'filename' ILIKE '%' || workout_type || '%'
             ) THEN 1.2
             WHEN distance_goal != '' AND (
               fragments.metadata->>'filename' ILIKE '%' || distance_goal || '%' OR
               fragments.content ILIKE '%' || distance_goal || '%'
             ) THEN 1.4
             ELSE 1.0
           END)::real AS final_score,
          fragments.metadata
        FROM fragments
        WHERE fragments.embedding IS NOT NULL
        AND 1 - (fragments.embedding <=> query_embedding) > match_threshold
        ORDER BY final_score DESC
        LIMIT match_count;
      END;
      $$;
    `;

    const { error: contextualError } = await supabase.rpc('sql', { query: contextualFix });
    if (contextualError) {
      console.error("Error fixing contextual function:", contextualError);
    } else {
      console.log("✅ Contextual function fixed");
    }

    // Fix hybrid_search_fragments function
    const hybridFix = `
      CREATE OR REPLACE FUNCTION hybrid_search_fragments(
        query_embedding vector(768),
        query_text text,
        match_threshold float DEFAULT 0.55,
        match_count int DEFAULT 8
      )
      RETURNS TABLE (
        id text,
        content text,
        similarity real,
        text_score real,
        hybrid_score real,
        metadata jsonb
      )
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RETURN QUERY
        SELECT
          fragments.id,
          fragments.content,
          (1 - (fragments.embedding <=> query_embedding))::real AS similarity,
          CASE 
            WHEN query_text != '' AND fragments.content ILIKE '%' || query_text || '%' THEN 0.8::real
            WHEN query_text != '' AND fragments.content ILIKE '%' || split_part(query_text, ' ', 1) || '%' THEN 0.6::real
            WHEN query_text != '' AND fragments.content ILIKE '%' || split_part(query_text, ' ', 2) || '%' THEN 0.4::real
            ELSE 0.0::real
          END AS text_score,
          (
            (1 - (fragments.embedding <=> query_embedding)) * 0.7 +
            CASE 
              WHEN query_text != '' AND fragments.content ILIKE '%' || query_text || '%' THEN 0.8 * 0.3
              WHEN query_text != '' AND fragments.content ILIKE '%' || split_part(query_text, ' ', 1) || '%' THEN 0.6 * 0.3
              WHEN query_text != '' AND fragments.content ILIKE '%' || split_part(query_text, ' ', 2) || '%' THEN 0.4 * 0.3
              ELSE 0.0
            END
          )::real AS hybrid_score,
          fragments.metadata
        FROM fragments
        WHERE fragments.embedding IS NOT NULL
        AND 1 - (fragments.embedding <=> query_embedding) > match_threshold
        ORDER BY hybrid_score DESC
        LIMIT match_count;
      END;
      $$;
    `;

    const { error: hybridError } = await supabase.rpc('sql', { query: hybridFix });
    if (hybridError) {
      console.error("Error fixing hybrid function:", hybridError);
    } else {
      console.log("✅ Hybrid function fixed");
    }

    return new Response(
      JSON.stringify({
        success: true,
        contextual_fixed: !contextualError,
        hybrid_fixed: !hybridError,
        contextual_error: contextualError?.message,
        hybrid_error: hybridError?.message
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error("Error in fix function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
