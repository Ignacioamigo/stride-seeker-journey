
-- Function to match fragments by vector similarity (optimized for Gemini embeddings)
CREATE OR REPLACE FUNCTION match_fragments(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 8
)
RETURNS TABLE (
  id text,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fragments.id,
    fragments.content,
    1 - (fragments.embedding <=> query_embedding) AS similarity
  FROM fragments
  WHERE fragments.embedding IS NOT NULL
  AND 1 - (fragments.embedding <=> query_embedding) > match_threshold
  ORDER BY fragments.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
