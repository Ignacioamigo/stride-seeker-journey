-- Añadir campo is_premium a user_profiles
-- Ejecutar este SQL en Supabase Dashboard > SQL Editor

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- También añadir fecha de inicio de suscripción para tracking
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS premium_started_at TIMESTAMPTZ DEFAULT NULL;

-- Comentario para documentación
COMMENT ON COLUMN user_profiles.is_premium IS 'Indica si el usuario tiene suscripción premium activa';
COMMENT ON COLUMN user_profiles.premium_started_at IS 'Fecha en que el usuario activó premium';





