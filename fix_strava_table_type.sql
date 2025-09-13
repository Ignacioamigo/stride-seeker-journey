-- Cambiar el tipo de user_id de UUID a TEXT para mayor flexibilidad
-- Esto permite usar cualquier string como user_id

-- Primero, eliminar cualquier constraint que dependa de user_id
ALTER TABLE public.strava_tokens DROP CONSTRAINT IF EXISTS strava_tokens_pkey;

-- Cambiar el tipo de columna de UUID a TEXT
ALTER TABLE public.strava_tokens ALTER COLUMN user_id TYPE TEXT;

-- Recrear la primary key
ALTER TABLE public.strava_tokens ADD PRIMARY KEY (user_id);

-- Verificar que el cambio se aplicó correctamente
\d public.strava_tokens;
