-- Corregir tipos de datos en funciones RAG

-- 1. Corregir función match_fragments
DROP FUNCTION IF EXISTS match_fragments(vector, float, int);

CREATE OR REPLACE FUNCTION match_fragments(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 8
)
RETURNS TABLE (
  id text,
  content text,
  similarity double precision,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fragments.id,
    fragments.content,
    (1 - (fragments.embedding <=> query_embedding))::double precision AS similarity,
    fragments.metadata
  FROM fragments
  WHERE fragments.embedding IS NOT NULL
  AND (1 - (fragments.embedding <=> query_embedding)) > match_threshold
  ORDER BY fragments.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 2. Corregir función hybrid_search_fragments
DROP FUNCTION IF EXISTS hybrid_search_fragments(vector, text, float, int);

CREATE OR REPLACE FUNCTION hybrid_search_fragments(
  query_embedding vector(768),
  query_text text DEFAULT '',
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id text,
  content text,
  similarity double precision,
  text_rank double precision,
  combined_score double precision,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fragments.id,
    fragments.content,
    (1 - (fragments.embedding <=> query_embedding))::double precision AS similarity,
    CASE 
      WHEN query_text != '' THEN 
        ts_rank_cd(to_tsvector('spanish', fragments.content), plainto_tsquery('spanish', query_text))::double precision
      ELSE 0.0::double precision
    END AS text_rank,
    CASE 
      WHEN query_text != '' THEN
        (((1 - (fragments.embedding <=> query_embedding)) * 0.7) + 
        (ts_rank_cd(to_tsvector('spanish', fragments.content), plainto_tsquery('spanish', query_text)) * 0.3))::double precision
      ELSE
        (1 - (fragments.embedding <=> query_embedding))::double precision
    END AS combined_score,
    fragments.metadata
  FROM fragments
  WHERE fragments.embedding IS NOT NULL
  AND (
    (1 - (fragments.embedding <=> query_embedding)) > match_threshold
    OR 
    (query_text != '' AND to_tsvector('spanish', fragments.content) @@ plainto_tsquery('spanish', query_text))
  )
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$;

-- 3. Corregir función contextual_search_fragments
DROP FUNCTION IF EXISTS contextual_search_fragments(vector, text, text, text, float, int);

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
  similarity double precision,
  relevance_boost double precision,
  final_score double precision,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fragments.id,
    fragments.content,
    (1 - (fragments.embedding <=> query_embedding))::double precision AS similarity,
    CASE 
      -- Boost por nivel de experiencia
      WHEN user_level != '' AND (
        (user_level ILIKE '%principiante%' AND fragments.metadata->>'filename' ILIKE '%P-%') OR
        (user_level ILIKE '%intermedio%' AND fragments.metadata->>'filename' ILIKE '%INT-%') OR
        (user_level ILIKE '%avanzado%' AND fragments.metadata->>'filename' ILIKE '%ADV-%')
      ) THEN 1.2::double precision
      -- Boost por tipo de entrenamiento
      WHEN workout_type != '' AND (
        (workout_type ILIKE '%tempo%' AND fragments.content ILIKE '%tempo%') OR
        (workout_type ILIKE '%intervalo%' AND fragments.content ILIKE '%interval%') OR
        (workout_type ILIKE '%fartlek%' AND fragments.content ILIKE '%fartlek%') OR
        (workout_type ILIKE '%fuerza%' AND fragments.content ILIKE '%fuerza%')
      ) THEN 1.15::double precision
      -- Boost por distancia objetivo
      WHEN distance_goal != '' AND (
        (distance_goal ILIKE '%5k%' AND fragments.metadata->>'filename' ILIKE '%5K-%') OR
        (distance_goal ILIKE '%10k%' AND fragments.metadata->>'filename' ILIKE '%10K-%') OR
        (distance_goal ILIKE '%21k%' AND fragments.metadata->>'filename' ILIKE '%21K-%') OR
        (distance_goal ILIKE '%42k%' AND fragments.metadata->>'filename' ILIKE '%42K-%')
      ) THEN 1.25::double precision
      ELSE 1.0::double precision
    END AS relevance_boost,
    (((1 - (fragments.embedding <=> query_embedding)) * 
     CASE 
       WHEN user_level != '' AND (
         (user_level ILIKE '%principiante%' AND fragments.metadata->>'filename' ILIKE '%P-%') OR
         (user_level ILIKE '%intermedio%' AND fragments.metadata->>'filename' ILIKE '%INT-%') OR
         (user_level ILIKE '%avanzado%' AND fragments.metadata->>'filename' ILIKE '%ADV-%')
       ) THEN 1.2
       WHEN workout_type != '' AND (
         (workout_type ILIKE '%tempo%' AND fragments.content ILIKE '%tempo%') OR
         (workout_type ILIKE '%intervalo%' AND fragments.content ILIKE '%interval%') OR
         (workout_type ILIKE '%fartlek%' AND fragments.content ILIKE '%fartlek%')
       ) THEN 1.15
       WHEN distance_goal != '' AND (
         (distance_goal ILIKE '%5k%' AND fragments.metadata->>'filename' ILIKE '%5K-%') OR
         (distance_goal ILIKE '%10k%' AND fragments.metadata->>'filename' ILIKE '%10K-%') OR
         (distance_goal ILIKE '%21k%' AND fragments.metadata->>'filename' ILIKE '%21K-%') OR
         (distance_goal ILIKE '%42k%' AND fragments.metadata->>'filename' ILIKE '%42K-%')
       ) THEN 1.25
       ELSE 1.0
     END))::double precision AS final_score,
    fragments.metadata
  FROM fragments
  WHERE fragments.embedding IS NOT NULL
  AND (1 - (fragments.embedding <=> query_embedding)) > match_threshold
  ORDER BY final_score DESC
  LIMIT match_count;
END;
$$;
