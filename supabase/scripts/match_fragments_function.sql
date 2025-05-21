
-- Function to match fragments by vector similarity
CREATE OR REPLACE FUNCTION match_fragments(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 5
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
    1 - (fragments.embedding::vector <=> query_embedding) AS similarity
  FROM fragments
  WHERE 1 - (fragments.embedding::vector <=> query_embedding) > match_threshold
  ORDER BY fragments.embedding::vector <=> query_embedding
  LIMIT match_count;
END;
$$;
