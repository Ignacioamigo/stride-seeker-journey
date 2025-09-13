-- Migration: Create fragments table for RAG (Retrieval-Augmented Generation) system
-- This table stores text fragments with their embeddings for semantic search

-- Enable the vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create fragments table
CREATE TABLE IF NOT EXISTS fragments (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(768), -- Gemini embedding-001 model produces 768-dimensional vectors
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fragments_embedding ON fragments USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_fragments_created_at ON fragments(created_at);
CREATE INDEX IF NOT EXISTS idx_fragments_metadata ON fragments USING GIN(metadata);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_fragments_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_fragments_updated_at 
  BEFORE UPDATE ON fragments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_fragments_updated_at_column();

-- Function to match fragments by vector similarity
CREATE OR REPLACE FUNCTION match_fragments(
  query_embedding vector(768),
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
    1 - (fragments.embedding <=> query_embedding) AS similarity
  FROM fragments
  WHERE fragments.embedding IS NOT NULL
  AND 1 - (fragments.embedding <=> query_embedding) > match_threshold
  ORDER BY fragments.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Enable RLS (Row Level Security) for fragments table
ALTER TABLE fragments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for service role
CREATE POLICY "Service role can manage fragments" ON fragments
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy to allow read access for authenticated users
CREATE POLICY "Authenticated users can read fragments" ON fragments
  FOR SELECT USING (auth.role() = 'authenticated');


