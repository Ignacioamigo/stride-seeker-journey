-- Eliminar la tabla fragments actual y recrearla para los nuevos documentos
DROP TABLE IF EXISTS fragments CASCADE;

-- Recrear tabla fragments
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE fragments (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(768),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsqueda vectorial
CREATE INDEX fragments_embedding_idx ON fragments USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

-- Habilitar RLS
ALTER TABLE fragments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Allow authenticated read access to fragments" ON fragments
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow service role to manage fragments" ON fragments
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_fragments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fragments_updated_at
  BEFORE UPDATE ON fragments
  FOR EACH ROW
  EXECUTE FUNCTION update_fragments_updated_at();
