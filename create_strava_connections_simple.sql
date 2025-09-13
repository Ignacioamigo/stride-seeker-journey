-- Script simple para crear tabla strava_connections
-- Ejecutar este SQL en Supabase Dashboard -> SQL Editor

-- Eliminar tabla anterior si existe
DROP TABLE IF EXISTS public.strava_connections CASCADE;

-- Crear nueva tabla con estructura simple y sin RLS
CREATE TABLE public.strava_connections (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    strava_user_id BIGINT,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at BIGINT NOT NULL,
    athlete_name TEXT,
    athlete_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NO aplicar RLS - tabla completamente abierta
ALTER TABLE public.strava_connections DISABLE ROW LEVEL SECURITY;

-- Crear índice para búsquedas rápidas
CREATE INDEX idx_strava_connections_user_id ON public.strava_connections(user_id);
CREATE INDEX idx_strava_connections_strava_user_id ON public.strava_connections(strava_user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_strava_connections_updated_at ON public.strava_connections;
CREATE TRIGGER update_strava_connections_updated_at
    BEFORE UPDATE ON public.strava_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla strava_connections creada exitosamente' as status;
SELECT count(*) as registros_iniciales FROM public.strava_connections;
