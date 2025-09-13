-- CREAR ACTIVIDAD DE PRUEBA PARA VERIFICAR SISTEMA
-- Usa el mismo user_id que aparece en los logs: 85ec39fa-c387-4902-adfe-c609f5c2900f

-- 1. Crear entrenamiento completado
INSERT INTO public.entrenamientos_completados (
    user_id,
    workout_title,
    workout_type,
    distancia_recorrida,
    duracion,
    fecha_completado,
    created_at
) VALUES (
    '85ec39fa-c387-4902-adfe-c609f5c2900f',
    'Carrera de prueba',
    'carrera',
    5000,
    '00:25:30',
    CURRENT_DATE,
    NOW()
) RETURNING id;

-- 2. Crear actividad publicada (usando el ID del entrenamiento anterior)
-- Nota: Ejecuta este INSERT después del anterior, reemplazando ENTRENAMIENTO_ID con el ID devuelto
INSERT INTO public.published_activities (
    user_id,
    entrenamiento_id,
    title,
    description,
    is_public,
    imported_from_strava,
    created_at
) VALUES (
    '85ec39fa-c387-4902-adfe-c609f5c2900f',
    1, -- Reemplazar con el ID real del entrenamiento
    'Carrera de prueba',
    'Entrenamiento completado: 5.00 km en 00:25:30',
    true,
    false,
    NOW()
);

-- 3. Verificar que se crearon correctamente
SELECT 'Entrenamientos completados:' as tabla, count(*) as total 
FROM entrenamientos_completados 
WHERE user_id = '85ec39fa-c387-4902-adfe-c609f5c2900f'

UNION ALL

SELECT 'Actividades publicadas:' as tabla, count(*) as total 
FROM published_activities 
WHERE user_id = '85ec39fa-c387-4902-adfe-c609f5c2900f';
