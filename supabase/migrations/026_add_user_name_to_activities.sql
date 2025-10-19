-- =====================================================
-- MIGRACIÓN: Agregar nombre de usuario a actividades
-- Fecha: 2025-10-19
-- Para mostrar nombre real en lugar de "anonimo"
-- =====================================================

-- 1. Agregar columna user_name a published_activities_simple
ALTER TABLE published_activities_simple 
ADD COLUMN IF NOT EXISTS user_name TEXT DEFAULT 'Usuario Anónimo';

-- 2. Agregar comentario explicativo
COMMENT ON COLUMN published_activities_simple.user_name IS 
'Nombre del usuario para mostrar en la UI. Se obtiene de user_profiles.name';

-- 3. Crear índice para búsquedas por nombre (opcional pero útil)
CREATE INDEX IF NOT EXISTS idx_published_activities_user_name 
ON published_activities_simple(user_name);

-- 4. Actualizar registros existentes con nombre desde user_profiles
UPDATE published_activities_simple pas
SET user_name = COALESCE(up.name, 'Usuario Anónimo')
FROM user_profiles up
WHERE pas.user_id = up.id
AND pas.user_name IS NULL;

-- 5. También actualizar workouts_simple para consistencia
ALTER TABLE workouts_simple 
ADD COLUMN IF NOT EXISTS user_name TEXT DEFAULT 'Usuario Anónimo';

COMMENT ON COLUMN workouts_simple.user_name IS 
'Nombre del usuario para referencias y estadísticas';

CREATE INDEX IF NOT EXISTS idx_workouts_simple_user_name 
ON workouts_simple(user_name);

