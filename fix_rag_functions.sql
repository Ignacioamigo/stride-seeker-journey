-- Arreglar las funciones RAG para que los tipos coincidan

-- Función contextual_search_fragments corregida
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
      -- Boost por nivel de experiencia
      WHEN user_level != '' AND (
        (user_level ILIKE '%principiante%' AND fragments.metadata->>'filename' ILIKE '%P-%') OR
        (user_level ILIKE '%intermedio%' AND fragments.metadata->>'filename' ILIKE '%INT-%') OR
        (user_level ILIKE '%avanzado%' AND fragments.metadata->>'filename' ILIKE '%ADV-%')
      ) THEN 1.3::real
      
      -- Boost por tipo de entrenamiento
      WHEN workout_type != '' AND (
        fragments.content ILIKE '%' || workout_type || '%' OR
        fragments.metadata->>'filename' ILIKE '%' || workout_type || '%'
      ) THEN 1.2::real
      
      -- Boost por distancia objetivo
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

-- Función hybrid_search_fragments corregida
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
