
-- Esta función permite buscar fragmentos similares en base a un embedding de consulta
CREATE OR REPLACE FUNCTION match_fragments(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  content text,
  title text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fragments.id,
    fragments.content,
    fragments.title,
    1 - (fragments.embedding <=> query_embedding) AS similarity
  FROM fragments
  WHERE 1 - (fragments.embedding <=> query_embedding) > match_threshold
  ORDER BY fragments.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
