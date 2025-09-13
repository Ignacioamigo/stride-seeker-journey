# 🏗️ RECREAR TABLA ENTRENAMIENTOS_COMPLETADOS

## 🎯 PROPÓSITO
Crear la tabla `entrenamientos_completados` desde cero con el esquema correcto y todas las configuraciones profesionales necesarias.

## 📋 CARACTERÍSTICAS DE LA NUEVA TABLA

### ✅ CAMPOS PRINCIPALES:
- `id` (UUID, Primary Key)
- `created_at` / `updated_at` (Timestamps automáticos)
- `user_id` (Referencia a auth.users, NULL para anónimos)
- `plan_id` (Referencia a training_plans, opcional)

### ✅ DATOS DEL ENTRENAMIENTO:
- `workout_id` (UUID único del entrenamiento)
- `workout_title` (Título del entrenamiento)
- `workout_type` (Tipo: carrera, descanso, etc.)
- `distancia_recorrida` (REAL, kilómetros)
- `duracion` (INTEGER, minutos)
- `fecha_completado` (DATE)

### ✅ CONTEXTO Y MÉTRICAS:
- `week_number` (Semana del plan)
- `satisfaccion` (1-5, default 4)
- `dificultad` (1-5, default 3)
- `condiciones_climaticas` (TEXT, default 'Soleado')
- `notas` (TEXT)

### ✅ CARACTERÍSTICAS PROFESIONALES:
- **RLS habilitado** con políticas para usuarios autenticados y anónimos
- **Índices optimizados** para consultas frecuentes
- **Constraints de validación** para integridad de datos
- **Trigger automático** para updated_at
- **Comentarios completos** para documentación
- **Grants de permisos** adecuados

## 🚀 INSTRUCCIONES DE EJECUCIÓN

### PASO 1: Ir a Supabase Dashboard
1. Abrir: https://supabase.com/dashboard
2. Seleccionar proyecto: **stride-seeker-journey**
3. Ir a: **SQL Editor**

### PASO 2: Ejecutar la Migración Completa
Copiar y ejecutar todo el contenido del archivo:
`supabase/migrations/020_recreate_entrenamientos_completados.sql`

### PASO 3: Verificar Resultados
La migración incluye verificaciones automáticas que mostrarán:
- ✅ Confirmación de creación exitosa
- ✅ Estructura final de la tabla
- ✅ Datos de prueba insertados

## 🎯 RESULTADOS ESPERADOS

### ✅ TABLA COMPLETAMENTE FUNCIONAL:
- Esquema correcto con todos los campos necesarios
- Políticas RLS configuradas para seguridad
- Índices para rendimiento óptimo
- Validaciones para integridad de datos

### ✅ COMPATIBILIDAD TOTAL:
- Coincide exactamente con el código de la app
- Soporta usuarios autenticados y anónimos
- Manejo correcto de planes opcionales
- Campos adicionales para métricas

### ✅ PROFESIONAL Y ESCALABLE:
- Documentación completa en comentarios
- Estructura preparada para futuras funcionalidades
- Configuración de seguridad robusta
- Rendimiento optimizado

## 🔍 VERIFICACIÓN POST-MIGRACIÓN

### Ejecutar estas consultas para verificar:

```sql
-- 1. Verificar estructura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'entrenamientos_completados'
ORDER BY ordinal_position;

-- 2. Verificar políticas RLS
SELECT policyname, permissive, roles
FROM pg_policies 
WHERE tablename = 'entrenamientos_completados';

-- 3. Verificar datos de prueba
SELECT * FROM entrenamientos_completados ORDER BY created_at DESC LIMIT 1;

-- 4. Verificar índices
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'entrenamientos_completados';
```

## ⚠️ IMPORTANTE
Esta migración **ELIMINA** la tabla existente y la recrea desde cero. Esto es necesario para garantizar que el esquema sea 100% correcto y compatible con el código de la aplicación.

Después de ejecutar esta migración, los entrenamientos completados en la app se guardarán correctamente en Supabase.
