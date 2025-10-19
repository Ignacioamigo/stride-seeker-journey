# 📊 INFORMACIÓN COMPLETA DE BASES DE DATOS - STRIDE SEEKER

**Última actualización:** 19 de Octubre, 2025

Este documento contiene la documentación completa de todas las tablas en Supabase, sus columnas, relaciones, y cómo se utilizan en el código de la aplicación.

---

## 📑 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Tablas Principales](#tablas-principales)
   - [user_profiles](#1-user_profiles)
   - [training_plans](#2-training_plans)
   - [training_sessions](#3-training_sessions)
   - [simple_workouts](#4-simple_workouts)
   - [workouts_simple](#5-workouts_simple)
   - [published_activities_simple](#6-published_activities_simple)
   - [published_activities](#7-published_activities)
3. [Tablas Secundarias](#tablas-secundarias)
   - [fragments](#8-fragments)
   - [public_races / races](#9-public_races--races)
   - [activities](#10-activities)
   - [strava_tokens](#11-strava_tokens)
4. [Problemas Conocidos](#problemas-conocidos)
5. [Diagrama de Relaciones](#diagrama-de-relaciones)

---

## 🎯 RESUMEN EJECUTIVO

### Tablas por Función

| Función | Tablas Utilizadas | Estado |
|---------|------------------|--------|
| **Perfil de Usuario** | `user_profiles` | ✅ Operativa |
| **Plan de Entrenamiento** | `training_plans`, `training_sessions` | ✅ Operativa |
| **Entrada Manual de Datos** | `simple_workouts` | ✅ Operativa |
| **GPS Tracker - Estadísticas** | `workouts_simple` | ⚠️ user_id no funciona (usa user_email) |
| **GPS Tracker - Galería** | `published_activities_simple` | ✅ Operativa (user_id funciona) |
| **Sistema Antiguo** | `published_activities` | ⚠️ Legacy - No se usa |
| **RAG/Embeddings** | `fragments` | ✅ Operativa (sistema RAG) |
| **Carreras** | `public_races`, `races` | ✅ Operativa |

### ⚠️ PROBLEMAS CRÍTICOS IDENTIFICADOS

1. **Duplicidad**: `workouts_simple` y `published_activities_simple` se llenan AMBAS cuando se completa un entrenamiento GPS
2. **user_id roto**: En `workouts_simple` el campo `user_id` NO funciona correctamente
3. **user_id vs user_auth_id**: En `user_profiles`, el campo que FUNCIONA es `user_auth_id`, NO `user_id`
4. **Tabla legacy**: `published_activities` existe pero ya no se usa activamente

---

## 📊 TABLAS PRINCIPALES

### 1. `user_profiles`

**Descripción:** Almacena el perfil completo de cada usuario con sus características físicas y objetivos de entrenamiento.

#### Columnas

| Columna | Tipo | Descripción | Notas |
|---------|------|-------------|-------|
| `id` | UUID | ID único del perfil | PRIMARY KEY |
| `user_auth_id` | UUID | ID del usuario en auth.users | ✅ **ESTE ES EL QUE FUNCIONA** |
| `name` | TEXT | Nombre del usuario | Required |
| `goal` | TEXT | Objetivo del usuario | Required |
| `age` | INT4 | Edad del usuario | Nullable |
| `gender` | TEXT | Género del usuario | Nullable |
| `height` | NUMERIC | Altura en cm | Nullable |
| `weight` | NUMERIC | Peso en kg | Nullable |
| `experience_level` | TEXT | Nivel de experiencia | Nullable |
| `max_distance` | NUMERIC | Distancia máxima que puede recorrer | Nullable |
| `pace` | TEXT | Ritmo objetivo (min/km) | Nullable |
| `weekly_workouts` | INT4 | Entrenamientos por semana | Nullable |
| `injuries` | TEXT | Lesiones actuales | Nullable |
| `registration_date` | TIMESTAMPTZ | Fecha de registro | Nullable |
| `last_updated` | TIMESTAMPTZ | Última actualización | Nullable |
| `completed_onboarding` | BOOL | Si completó el onboarding | Nullable |
| `selected_days` | JSONB | Días seleccionados para entrenar | Nullable |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auto |
| `updated_at` | TIMESTAMPTZ | Fecha de actualización | Auto |

#### Relaciones
- **NO tiene Foreign Keys** (es tabla raíz)
- **Relacionada con:** `training_plans` (via `user_auth_id`)

#### ⚠️ PROBLEMA CONOCIDO
```
❌ user_id: NO FUNCIONA - Este campo existe pero no se usa
✅ user_auth_id: FUNCIONA CORRECTAMENTE - Usar siempre este campo
```

#### Uso en el código
```typescript
// src/services/planService.ts
const { data: userProfile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_auth_id', userId)  // ✅ Usar user_auth_id
  .single();
```

---

### 2. `training_plans`

**Descripción:** Almacena los planes de entrenamiento generados por IA para cada usuario.

#### Columnas

| Columna | Tipo | Descripción | Notas |
|---------|------|-------------|-------|
| `id` | UUID | ID único del plan | PRIMARY KEY |
| `user_id` | UUID | ID del usuario (FK a user_profiles) | Nullable |
| `name` | TEXT | Nombre del plan | Required |
| `description` | TEXT | Descripción del plan | Nullable |
| `goal` | TEXT | Objetivo del plan | Nullable |
| `duration_weeks` | INT4 | Duración en semanas | Default: 1 |
| `difficulty_level` | TEXT | Nivel de dificultad | Default: 'intermedio' |
| `target_distance` | REAL | Distancia objetivo | Nullable |
| `target_pace` | TEXT | Ritmo objetivo | Nullable |
| `workouts` | JSONB | Array de entrenamientos | Default: [] |
| `start_date` | DATE | Fecha de inicio | Required |
| `duration` | TEXT | Duración (texto) | Nullable |
| `intensity` | TEXT | Intensidad del plan | Nullable |
| `week_number` | INT4 | Número de semana actual | Nullable |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auto |
| `updated_at` | TIMESTAMPTZ | Fecha de actualización | Auto |

#### Relaciones
```
training_plans.user_id → user_profiles.id (Foreign Key)
```

#### ⚠️ NOTA IMPORTANTE
Esta tabla se generaba con el onboarding anterior. Con el nuevo onboarding (3 preguntas cerradas), puede que no esté siendo utilizada completamente. Los campos `goal`, `difficulty_level` etc. pueden estar desactualizados.

#### Uso en el código
```typescript
// supabase/functions/generate-training-plan/index.ts (líneas 790-810)
const { data: trainingPlanData, error: trainingPlanError } = await supabase
  .from('training_plans')
  .insert({
    user_id: userProfileId,
    name: plan.name,
    description: plan.description,
    duration: plan.duration,
    intensity: plan.intensity,
    start_date: new Date().toISOString().split('T')[0]
  })
  .select()
  .single();
```

---

### 3. `training_sessions`

**Descripción:** Almacena cada sesión de entrenamiento individual dentro de un plan de entrenamiento.

#### Columnas

| Columna | Tipo | Descripción | Notas |
|---------|------|-------------|-------|
| `id` | UUID | ID único de la sesión | PRIMARY KEY |
| `plan_id` | UUID | ID del plan (FK a training_plans) | Nullable |
| `day_number` | INT4 | Número del día en el plan | Required |
| `day_date` | DATE | Fecha programada del entrenamiento | Required |
| `title` | TEXT | Título del entrenamiento | Required |
| `description` | TEXT | Descripción detallada | Nullable |
| `type` | TEXT | Tipo de entrenamiento (carrera, descanso, etc.) | Required |
| `planned_distance` | NUMERIC | Distancia planificada (km) | Nullable |
| `planned_duration` | TEXT | Duración planificada | Nullable |
| `target_pace` | TEXT | Ritmo objetivo | Nullable |
| `completed` | BOOL | Si está completado | Default: false |
| `completion_date` | TIMESTAMPTZ | Fecha de completado | Nullable |
| `actual_distance` | NUMERIC | Distancia real completada | Nullable |
| `actual_duration` | TEXT | Duración real completada | Nullable |
| `notes` | TEXT | Notas adicionales | Nullable |

#### Relaciones
```
training_sessions.plan_id → training_plans.id (Foreign Key)
training_sessions.id ← published_activities_simple.training_session_id (Referenced by)
```

#### Estados de una sesión
```typescript
// Una training_session puede estar en estos estados:
1. ❌ No completada (completed = false)
   - Usuario aún no ha hecho el entrenamiento
   - Puede iniciarlo con el botón "Iniciar entrenamiento"

2. ✅ Completada manualmente (completed = true, NO tiene activity vinculada)
   - Usuario ingresó datos manualmente
   - Se marca vía formulario "Meter datos entrenamiento"

3. 🏃 Completada con GPS (completed = true, training_session_id en published_activities_simple)
   - Usuario corrió con GPS tracker
   - Se marca automáticamente al finalizar la carrera
```

#### Uso en el código
```typescript
// src/services/planService.ts (líneas 356-383)
const sessionsToInsert = plan.workouts.map((workout, index) => ({
  plan_id: trainingPlan.id,
  day_number: index + 1,
  day_date: workoutDate.toISOString().split('T')[0],
  title: workout.title,
  description: workout.description,
  type: workout.type,
  planned_distance: workout.distance,
  planned_duration: workout.duration,
  target_pace: workout.targetPace,
  completed: workout.completed || false
}));

await supabase.from('training_sessions').insert(sessionsToInsert);
```

```typescript
// src/components/plan/TrainingPlanDisplay.tsx (líneas 167-245)
const handleCompleteWorkout = async (workoutId: string, actualDistance: number | null, actualDuration: string | null) => {
  // Marca el entrenamiento como completado
  // Actualiza actual_distance y actual_duration
};
```

---

### 4. `simple_workouts`

**Descripción:** Tabla para cuando el usuario MANUALMENTE ingresa los datos de un entrenamiento completado desde la sección del Plan.

#### Columnas

| Columna | Tipo | Descripción | Notas |
|---------|------|-------------|-------|
| `id` | UUID | ID único | PRIMARY KEY |
| `user_id` | UUID | ID del usuario (FK a auth.users) | ✅ FUNCIONA correctamente |
| `workout_title` | TEXT | Título del entrenamiento | Required |
| `workout_type` | TEXT | Tipo de entrenamiento | Default: 'carrera' |
| `distance_km` | DECIMAL(5,2) | Distancia en km | Default: 0.0 |
| `duration_minutes` | INT4 | Duración en minutos | Default: 0 |
| `workout_date` | DATE | Fecha del entrenamiento | Default: hoy |
| `plan_id` | TEXT | ID del plan (opcional) | Nullable |
| `week_number` | INT4 | Número de semana | Nullable |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auto |
| `updated_at` | TIMESTAMPTZ | Fecha de actualización | Auto |

#### Relaciones
```
simple_workouts.user_id → auth.users.id (Foreign Key)
```

#### RLS (Row Level Security)
```sql
-- Los usuarios solo pueden ver sus propios entrenamientos
CREATE POLICY "Users can view own workouts" ON simple_workouts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" ON simple_workouts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### Uso en el código
```typescript
// src/services/simpleWorkoutsService.ts (líneas 25-103)
export const saveSimpleWorkout = async (
  workoutTitle: string,
  workoutType: string,
  distanceKm: number,
  durationMinutes: number,
  planId?: string | null,
  weekNumber?: number | null
): Promise<boolean> => {
  // Obtiene user.id de auth
  const { data: { user } } = await supabase.auth.getUser();
  
  const workoutData = {
    user_id: user.id,  // ✅ user_id funciona aquí
    workout_title: workoutTitle,
    workout_type: workoutType,
    distance_km: distanceKm,
    duration_minutes: durationMinutes,
    workout_date: new Date().toISOString().split('T')[0],
    plan_id: planId,
    week_number: weekNumber
  };

  await supabase.from('simple_workouts').insert(workoutData);
};
```

#### Diferencia con `workouts_simple`
- **simple_workouts**: Entrada manual de datos (✅ user_id funciona)
- **workouts_simple**: GPS tracker (⚠️ user_id NO funciona, usa user_email)

---

### 5. `workouts_simple`

**Descripción:** Tabla que se llena AUTOMÁTICAMENTE cuando el usuario completa un entrenamiento con GPS. Guarda estadísticas del entrenamiento para cálculos.

#### Columnas

| Columna | Tipo | Descripción | Notas |
|---------|------|-------------|-------|
| `id` | UUID | ID único | PRIMARY KEY |
| `user_email` | TEXT | Email del usuario | ⚠️ USA EMAIL, NO ID |
| `workout_title` | TEXT | Título del entrenamiento | Default: 'Entrenamiento' |
| `workout_type` | TEXT | Tipo de entrenamiento | Default: 'carrera' |
| `distance` | REAL | Distancia en km | Default: 0 |
| `duration_minutes` | INT4 | Duración en minutos | Default: 0 |
| `completed_date` | DATE | Fecha de completado | Default: hoy |
| `plan_info` | TEXT | Info del plan (texto simple) | Nullable |
| `week_number` | INT4 | Número de semana | Default: 1 |
| `notes` | TEXT | Notas adicionales | Default: 'Entrenamiento completado' |
| `app_version` | TEXT | Versión de la app | Default: 'v1.0' |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auto |
| `updated_at` | TIMESTAMPTZ | Fecha de actualización | Auto |

#### ⚠️ PROBLEMA CRÍTICO
```
❌ NO tiene columna user_id
✅ USA user_email en su lugar
⚠️ Esto causa problemas de aislamiento entre usuarios
```

#### RLS (Row Level Security)
```sql
-- Política ULTRA PERMISIVA (permite todo)
CREATE POLICY "Allow everything to everyone" 
ON public.workouts_simple FOR ALL TO public
USING (true) WITH CHECK (true);
```

#### Uso en el código
```typescript
// src/services/simpleWorkoutService.ts (líneas 21-136)
export const saveWorkoutSimple = async (
  workoutTitle: string,
  workoutType: string,
  distance: number | null,
  duration: string | null,
  planId?: string | null,
  weekNumber?: number | null
): Promise<boolean> => {
  
  // 1. Obtener email del usuario (NO ID)
  let userEmail = 'anonimo@app.com';
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email) {
    userEmail = user.email;  // ⚠️ Usa email
  }

  const workoutData = {
    user_email: userEmail,  // ⚠️ NO usa user_id
    workout_title: workoutTitle,
    workout_type: workoutType,
    distance: distance || 0,
    duration_minutes: durationMinutes,
    completed_date: new Date().toISOString().split('T')[0],
    plan_info: planId,
    week_number: weekNumber
  };

  await supabase.from('workouts_simple').insert(workoutData);
};
```

```typescript
// src/services/ultraSimpleActivityService.ts (líneas 16-49)
// Se llama cuando se finaliza un GPS tracking
const workoutSaved = await saveWorkoutSimple(
  data.title,
  'carrera',
  distanceKm,
  `${durationMinutes} min`,
  null,
  null
);
```

---

### 6. `published_activities_simple`

**Descripción:** Tabla que se llena AUTOMÁTICAMENTE cuando el usuario completa un entrenamiento con GPS. Esta tabla se usa para mostrar las actividades en la galería de "Activities".

#### Columnas

| Columna | Tipo | Descripción | Notas |
|---------|------|-------------|-------|
| `id` | UUID | ID único | PRIMARY KEY |
| `user_id` | UUID | ID del usuario | ✅ **FUNCIONA CORRECTAMENTE** |
| `title` | TEXT | Título de la actividad | Default: 'Entrenamiento' |
| `description` | TEXT | Descripción | Default: 'Entrenamiento completado' |
| `image_url` | TEXT | URL de imagen (si hay) | Nullable |
| `distance` | REAL | Distancia en km (ej: 7.5, 5.2) | Required |
| `duration` | TEXT | Duración en formato HH:MM:SS | Default: '00:00:00' |
| `calories` | INT4 | Calorías quemadas | Default: 0 |
| `entrenamiento_id` | UUID | ID único del entrenamiento | Auto-generado |
| `activity_date` | TIMESTAMPTZ | Fecha de la actividad | Default: ahora |
| `is_public` | BOOL | Si es pública | Default: true |
| `user_email` | TEXT | Email del usuario | Default: 'anonimo@app.com' |
| `user_name` | TEXT | Nombre del usuario | ✅ Default: 'Usuario Anónimo' |
| `training_session_id` | UUID | ID de la sesión del plan | ✅ **NUEVO** Nullable - FK a training_sessions |
| `workout_type` | TEXT | Tipo de entrenamiento | Default: 'carrera' |
| `gps_points` | JSONB | Puntos GPS del recorrido | Default: [] |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auto |
| `updated_at` | TIMESTAMPTZ | Fecha de actualización | Auto |

#### Relaciones
```
published_activities_simple.training_session_id → training_sessions.id (Foreign Key)
  - ON DELETE SET NULL (si se borra la sesión, la actividad se mantiene)
```

#### RLS (Row Level Security)
```sql
-- Política ULTRA PERMISIVA (permite todo)
CREATE POLICY "Allow all operations for everyone"
ON public.published_activities_simple FOR ALL TO public
USING (true) WITH CHECK (true);
```

#### ⭐ Auto-Completado de Sesiones
Esta tabla tiene un **trigger automático** que marca una `training_session` como completada cuando se inserta una actividad vinculada:

```sql
-- Función que se ejecuta automáticamente
CREATE FUNCTION auto_complete_training_session()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.training_session_id IS NOT NULL THEN
    UPDATE training_sessions
    SET 
      completed = true,
      completion_date = NOW(),
      actual_distance = NEW.distance,
      actual_duration = NEW.duration
    WHERE id = NEW.training_session_id
    AND completed = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que ejecuta la función
CREATE TRIGGER trigger_auto_complete_training_session
AFTER INSERT ON published_activities_simple
FOR EACH ROW
EXECUTE FUNCTION auto_complete_training_session();
```

**Flujo automático:**
1. Usuario hace clic en "Iniciar entrenamiento" en el plan
2. Se guarda `training_session_id` en localStorage
3. Usuario corre con GPS tracker
4. Al finalizar, se guarda la actividad con `training_session_id`
5. 🎉 **El trigger marca automáticamente la sesión como completada**

#### Uso en el código
```typescript
// src/services/ultraSimpleActivityService.ts (actualizado 2025-10-19)
export const publishActivityUltraSimple = async (data: WorkoutPublishData): Promise<string> => {
  
  // 1. PRIMERO guarda en workouts_simple (para estadísticas)
  await saveWorkoutSimple(data.title, 'carrera', distanceKm, `${durationMinutes} min`, null, null);

  // 2. OBTENER USUARIO Y SU NOMBRE
  const { data: { user } } = await supabase.auth.getUser();
  let userName = 'Usuario Anónimo';
  
  if (user) {
    // Obtener nombre del perfil
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('user_auth_id', user.id)
      .single();
    
    if (userProfile?.name) {
      userName = userProfile.name;  // ✅ Nombre real
    }
  }
  
  // 3. GUARDAR en published_activities_simple (para galería)
  const activityData = {
    user_id: user?.id || null,  // ✅ user_id funciona aquí
    user_name: userName,  // ✅ NUEVO: Nombre real del usuario
    title: data.title,
    description: data.description,
    distance: distanceKm,  // en km
    duration: durationFormatted,  // HH:MM:SS
    calories: Math.round(distanceKm * 60),
    user_email: user?.email || 'anonimo@app.com',
    workout_type: 'carrera',
    activity_date: new Date().toISOString(),
    is_public: data.isPublic !== false,
    gps_points: data.runSession.gpsPoints?.slice(0, 50) || []
  };

  const { data: savedActivity } = await supabase
    .from('published_activities_simple')
    .insert(activityData)
    .select()
    .single();

  return savedActivity.id;
};
```

```typescript
// src/pages/Activities.tsx (líneas 26-64)
const loadActivities = async () => {
  // Carga actividades desde published_activities_simple
  const userActivities = await getPublishedActivitiesUltraSimple();
  setActivities(userActivities);
};
```

```typescript
// src/services/ultraSimpleActivityService.ts (líneas 150-283)
export const getPublishedActivitiesUltraSimple = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  let query = supabase
    .from('published_activities_simple')
    .select('*');
  
  // Filtrar por usuario
  if (user) {
    query = query.eq('user_id', user.id);  // ✅ user_id funciona
  } else {
    query = query.is('user_id', null);
  }
  
  const { data } = await query
    .order('created_at', { ascending: false })
    .limit(50);

  return data;
};
```

---

### 7. `published_activities`

**Descripción:** Tabla ANTIGUA/LEGACY para actividades publicadas. Ya NO se usa activamente en la versión actual de la app.

#### Columnas

| Columna | Tipo | Descripción | Notas |
|---------|------|-------------|-------|
| `id` | UUID | ID único | PRIMARY KEY |
| `user_id` | UUID | ID del usuario (FK a auth.users) | Required |
| `title` | TEXT | Título de la actividad | Required |
| `description` | TEXT | Descripción | Nullable |
| `image_url` | TEXT | URL de imagen | Nullable |
| `distance` | REAL | Distancia en km | Default: 0 |
| `duration` | TEXT | Duración HH:MM:SS | Default: '00:00:00' |
| `gps_points` | JSONB | Puntos GPS | Nullable |
| `is_public` | BOOL | Si es pública | Default: true |
| `activity_date` | TIMESTAMPTZ | Fecha de la actividad | Required |
| `likes` | INT4 | Número de likes | Default: 0 |
| `comments` | INT4 | Número de comentarios | Default: 0 |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auto |
| `updated_at` | TIMESTAMPTZ | Fecha de actualización | Auto |
| `strava_activity_id` | INT8 | ID de Strava (si importado) | Nullable |
| `imported_from_strava` | BOOL | Si vino de Strava | Default: false |

#### Relaciones
```
published_activities.user_id → auth.users.id (Foreign Key)
```

#### RLS (Row Level Security)
```sql
-- Política: Ver actividades públicas o propias
CREATE POLICY "Users can view public activities"
  ON published_activities FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = user_id);

-- Política: Insertar solo propias
CREATE POLICY "Users can insert their own activities"
  ON published_activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

#### ⚠️ ESTADO: LEGACY
Esta tabla existe pero la app actual usa `published_activities_simple`. Solo se mantiene por:
- Integración con Strava (webhook)
- Compatibilidad con versiones anteriores
- Posible migración futura

#### Uso limitado en el código
```typescript
// supabase/functions/strava-webhook/index.ts (líneas 181-196)
// Solo se usa para actividades importadas de Strava
const { data: publishedActivity } = await supabaseAdmin
  .from('published_activities')
  .insert({
    user_id: tokenData.user_id,
    title: activity.name || 'Carrera desde Strava',
    description: activity.description || '',
    distance: distanceInMeters,
    duration: durationString,
    is_public: !activity.private,
    strava_activity_id: event.object_id,
    imported_from_strava: true,
    activity_date: new Date(activity.start_date).toISOString(),
    gps_points: []
  });
```

---

## 🗄️ TABLAS SECUNDARIAS

### 8. `fragments`

**Descripción:** Almacena fragmentos de texto con sus embeddings para el sistema RAG (Retrieval-Augmented Generation) que alimenta la IA.

#### Columnas

| Columna | Tipo | Descripción | Notas |
|---------|------|-------------|-------|
| `id` | UUID | ID único del fragmento | PRIMARY KEY |
| `content` | TEXT | Contenido del fragmento | Nullable |
| `embedding` | VECTOR | Vector de embedding | Nullable |
| `metadata` | JSONB | Metadatos adicionales | Nullable |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auto |
| `updated_at` | TIMESTAMPTZ | Fecha de actualización | Auto |

#### Relaciones
- **NO tiene Foreign Keys**

#### Uso en el código
```typescript
// Función: match_fragments (en Database.Functions)
// src/integrations/supabase/types.ts (líneas 414-425)
match_fragments: {
  Args: {
    query_embedding: string
    match_threshold?: number
    match_count?: number
  }
  Returns: {
    fragment_id: string
    content: string
    similarity: number
  }[]
}
```

```typescript
// supabase/functions/generate-embedding/index.ts
// Se usa para generar embeddings de contenido de entrenamiento
```

---

### 9. `public_races` / `races`

**Descripción:** Almacena información de carreras populares (maratones, medias maratones, 10K, etc.) disponibles en España y otros lugares.

#### Columnas (public_races)

Basado en las imágenes proporcionadas:

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| `id` | UUID | ID único de la carrera | - |
| `event_name` | TEXT | Nombre de la carrera | "Maratón de Madrid" |
| `city` | TEXT | Ciudad donde se realiza | "Madrid" |
| `province` | TEXT | Provincia | "Madrid" |
| `community` | TEXT | Comunidad Autónoma | "Comunidad de Madrid" |
| `country` | TEXT | País | "España" |
| `event_type` | TEXT | Tipo de carrera | "marathon", "half_marathon", "10k" |
| `distance_km` | NUMERIC | Distancia en km | 42.195, 21.097, 10, 5 |
| `elevation_gain` | NUMERIC | Desnivel positivo | Nullable |
| `difficulty` | TEXT | Dificultad | "Fácil", "Medio", "Difícil" |
| `start_date` | DATE | Fecha de inicio | "2025-10-20" |
| `end_date` | DATE | Fecha de fin | Nullable |
| `registration_deadline` | DATE | Fecha límite de inscripción | Nullable |
| `registration_url` | TEXT | URL para inscripción | Nullable |
| `description` | TEXT | Descripción de la carrera | Nullable |
| `price_range` | TEXT | Rango de precios | "30-50€" |
| `max_participants` | INT4 | Máximo de participantes | Nullable |
| `website_url` | TEXT | Sitio web oficial | Nullable |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auto |
| `updated_at` | TIMESTAMPTZ | Fecha de actualización | Auto |

#### Uso en el código
```typescript
// Se usa en la pregunta de onboarding sobre carreras objetivo
// src/components/onboarding/RaceSelectionQuestion.tsx (probable)
const { data: races } = await supabase
  .from('public_races')
  .select('*')
  .order('start_date', { ascending: true })
  .limit(100);
```

---

### 10. `activities`

**Descripción:** Tabla de actividades. Basado en las imágenes, parece ser otra tabla relacionada con entrenamientos.

#### Columnas (basado en imagen 1)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | ID único |
| `user_id` | UUID | ID del usuario |
| `name` | TEXT | Nombre de la actividad |
| `type` | TEXT | Tipo de actividad |
| `start_time` | TIMESTAMPTZ | Hora de inicio |
| `end_time` | TIMESTAMPTZ | Hora de fin |
| `duration` | INT4 | Duración |
| `distance` | NUMERIC | Distancia |
| `average_pace` | TEXT | Ritmo promedio |
| `max_pace` | TEXT | Ritmo máximo |
| `calories` | INT4 | Calorías |
| `route` | JSONB | Ruta GPS |
| `elevation_gain` | NUMERIC | Desnivel |
| `weather_conditions` | JSONB | Condiciones climáticas |
| `notes` | TEXT | Notas |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

#### Estado
⚠️ No está claro si esta tabla está siendo usada activamente en el código actual. Puede ser otra tabla legacy o en desarrollo.

---

### 11. `strava_tokens`

**Descripción:** Almacena tokens de acceso de Strava para usuarios que conectan su cuenta.

#### Columnas (basado en código)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | ID único |
| `user_id` | UUID | ID del usuario (FK a auth.users) |
| `access_token` | TEXT | Token de acceso de Strava |
| `refresh_token` | TEXT | Token de refresco |
| `expires_at` | TIMESTAMPTZ | Fecha de expiración |
| `athlete_id` | TEXT | ID del atleta en Strava |
| `created_at` | TIMESTAMPTZ | Fecha de creación |
| `updated_at` | TIMESTAMPTZ | Fecha de actualización |

#### Uso en el código
```typescript
// supabase/functions/strava-webhook/index.ts
// Se usa para obtener tokens y sincronizar actividades desde Strava
const { data: tokenData } = await supabaseAdmin
  .from('strava_tokens')
  .select('*')
  .eq('athlete_id', event.owner_id)
  .single();
```

---

## ⚠️ PROBLEMAS CONOCIDOS

### 1. Duplicidad: `workouts_simple` vs `published_activities_simple`

**Problema:** Cuando un usuario completa un entrenamiento con GPS, se guardan datos en AMBAS tablas simultáneamente.

```typescript
// src/services/ultraSimpleActivityService.ts (líneas 16-49)
export const publishActivityUltraSimple = async (data: WorkoutPublishData) => {
  
  // 1. GUARDAR EN workouts_simple (para estadísticas)
  await saveWorkoutSimple(
    data.title, 'carrera', distanceKm, `${durationMinutes} min`, null, null
  );
  
  // 2. GUARDAR EN published_activities_simple (para galería)
  await supabase.from('published_activities_simple').insert(activityData);
};
```

**Impacto:**
- ✅ `workouts_simple`: Se usa para cálculos de estadísticas
- ✅ `published_activities_simple`: Se usa para mostrar en la galería de Activities
- ⚠️ Datos duplicados en dos tablas

**Recomendación futura:** Consolidar en una sola tabla o establecer relación clara entre ambas.

---

### 2. user_id no funciona en `workouts_simple`

**Problema:** La tabla `workouts_simple` NO tiene columna `user_id`, usa `user_email` en su lugar.

```sql
-- workouts_simple
CREATE TABLE workouts_simple (
  id UUID PRIMARY KEY,
  user_email TEXT DEFAULT 'anonimo@app.com',  -- ⚠️ USA EMAIL
  ...
);
```

vs.

```sql
-- simple_workouts (correcto)
CREATE TABLE simple_workouts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),  -- ✅ USA USER_ID
  ...
);
```

**Impacto:**
- Problemas de aislamiento entre usuarios
- No se puede usar RLS apropiadamente
- Si un usuario cambia su email, se pierden referencias

**Solución temporal:**
```typescript
// Se filtra por email
const { data } = await supabase
  .from('workouts_simple')
  .select('*')
  .eq('user_email', userEmail);
```

---

### 3. user_id vs user_auth_id en `user_profiles`

**Problema:** En la tabla `user_profiles` existen DOS columnas de ID de usuario:

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID,  -- ❌ NO FUNCIONA
  user_auth_id UUID,  -- ✅ FUNCIONA
  ...
);
```

**Uso correcto:**
```typescript
// ❌ INCORRECTO
.eq('user_id', userId)

// ✅ CORRECTO
.eq('user_auth_id', userId)
```

**Recomendación:** Eliminar la columna `user_id` para evitar confusiones.

---

### 4. Tabla `training_plans` desactualizada

**Problema:** Los campos `goal`, `difficulty_level` y otros se llenaban con el onboarding anterior (pregunta abierta). Con el nuevo onboarding (3 preguntas cerradas: distancia, tiempo, plazo), estos campos pueden no estar siendo utilizados.

**Campos potencialmente obsoletos:**
- `goal` (era texto libre, ahora está estructurado)
- `difficulty_level` (ya no se pregunta directamente)

**Recomendación:** Revisar si esta tabla necesita actualizarse para reflejar el nuevo flujo de onboarding.

---

## 🔗 DIAGRAMA DE RELACIONES

```
┌─────────────────┐
│   auth.users    │ (Tabla de Supabase Auth)
│   (user auth)   │
└────────┬────────┘
         │
         ├────────────────────────────────┬──────────────────────────┐
         │                                │                          │
         ▼                                ▼                          ▼
┌─────────────────┐              ┌──────────────────┐     ┌──────────────────┐
│  user_profiles  │              │  simple_workouts │     │ strava_tokens    │
│                 │              │                  │     │                  │
│ user_auth_id ✅ │              │   user_id ✅     │     │   user_id ✅     │
│ user_id ❌      │              └──────────────────┘     └──────────────────┘
└────────┬────────┘                                         │
         │                                                  │
         ▼                                                  ▼
┌─────────────────┐                              ┌──────────────────────┐
│ training_plans  │                              │published_activities  │
│                 │                              │  (legacy/strava)     │
│   user_id       │                              │    user_id ✅        │
└────────┬────────┘                              └──────────────────────┘
         │
         ▼
┌─────────────────────┐           ┌───────────────────────────┐
│ training_sessions   │◄──────────│published_activities_simple│
│                     │           │                           │
│     plan_id         │           │  training_session_id ✅   │
│     id ────────────────────────►│  (vincula actividad GPS)  │
└─────────────────────┘           │                           │
         ▲                        │  ⚡ Trigger automático:   │
         │                        │  marca sesión completada  │
         │                        └───────────────────────────┘
         │
    [Trigger: auto_complete_training_session]
    Cuando se inserta actividad con training_session_id,
    marca la sesión como completed = true


┌────────────────────────────────────────────────────────┐
│        SISTEMA GPS TRACKER (Duplicidad)                │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────┐    ┌───────────────────────┐│
│  │  workouts_simple     │    │published_activities_  ││
│  │                      │    │      simple           ││
│  │  user_email ⚠️       │    │   user_id ✅          ││
│  │  (para estadísticas) │    │   (para galería)      ││
│  └──────────────────────┘    └───────────────────────┘│
│           ▲                            ▲               │
│           │                            │               │
│           └────────┬───────────────────┘               │
│                    │                                   │
│         publishActivityUltraSimple()                   │
│         (guarda en AMBAS tablas)                       │
└────────────────────────────────────────────────────────┘


┌─────────────────┐         ┌─────────────────┐
│   fragments     │         │  public_races   │
│   (RAG system)  │         │   (carreras)    │
│                 │         │                 │
│ (sin relaciones)│         │ (sin relaciones)│
└─────────────────┘         └─────────────────┘
```

---

## 📝 RESUMEN DE FLUJOS PRINCIPALES

### Flujo 1: Onboarding y Creación de Plan
```
1. Usuario completa onboarding
   ↓
2. Se crea registro en user_profiles (con user_auth_id)
   ↓
3. Se genera plan con IA
   ↓
4. Se crea registro en training_plans
   ↓
5. Se crean múltiples registros en training_sessions (uno por día)
```

### Flujo 2: Entrada Manual de Datos de Entrenamiento
```
1. Usuario va a su Plan
   ↓
2. Hace clic en "Completar" en un entrenamiento
   ↓
3. Ingresa distancia y duración manualmente
   ↓
4. Se guarda en simple_workouts (✅ con user_id correcto)
   ↓
5. Se actualiza training_sessions (marca completed = true)
```

### Flujo 3: Entrenamiento con GPS Tracker (Desde Plan) ⭐ NUEVO
```
1. Usuario ve su plan de entrenamiento
   ↓
2. Hace clic en "Iniciar entrenamiento" en una sesión
   ↓
3. Se guarda training_session_id en localStorage
   ↓
4. Navega automáticamente a GPS tracker
   ↓
5. Corre y completa el entrenamiento
   ↓
6. Presiona "Finalizar"
   ↓
7. publishActivityUltraSimple() se ejecuta CON training_session_id
   ↓
8. Guarda en workouts_simple (⚠️ con user_email)
   ↓
9. Guarda en published_activities_simple (✅ con user_id + training_session_id)
   ↓
10. ⚡ TRIGGER auto_complete_training_session se ejecuta
   ↓
11. 🎉 training_session se marca como completed = true automáticamente
   ↓
12. Se muestra en Activities + Plan actualizado con ✅
```

### Flujo 3B: Entrenamiento con GPS Tracker (Sin Plan)
```
1. Usuario inicia GPS tracker directamente
   ↓
2. Corre y completa el entrenamiento
   ↓
3. Presiona "Finalizar"
   ↓
4. publishActivityUltraSimple() se ejecuta SIN training_session_id
   ↓
5. Guarda en workouts_simple (⚠️ con user_email)
   ↓
6. Guarda en published_activities_simple (✅ con user_id, training_session_id = NULL)
   ↓
7. Se muestra en la página Activities (sin vincular a plan)
```

### Flujo 4: Sincronización con Strava
```
1. Usuario conecta cuenta de Strava
   ↓
2. Se guardan tokens en strava_tokens
   ↓
3. Webhook de Strava detecta nueva actividad
   ↓
4. Se guarda en published_activities (tabla legacy)
```

---

## ✅ RECOMENDACIONES DE MEJORA

### ✨ Implementado Recientemente (2025-10-19)
1. ✅ **Campo user_name**: Ahora se muestra el nombre real en lugar de "anonimo"
2. ✅ **Vinculación GPS con Plan**: Sistema de `training_session_id` implementado
3. ✅ **Auto-completado**: Trigger que marca sesiones automáticamente al finalizar GPS
4. ✅ **Botón "Iniciar entrenamiento"**: Permite iniciar GPS desde el plan

### Prioridad Alta
1. **Arreglar workouts_simple**: Agregar columna `user_id` y eliminar dependencia de `user_email`
2. **Eliminar duplicidad**: Decidir si consolidar `workouts_simple` y `published_activities_simple` o establecer relación FK entre ellas
3. **Limpiar user_profiles**: Eliminar columna `user_id` que no funciona, dejar solo `user_auth_id`

### Prioridad Media
4. **Actualizar training_plans**: Adaptar campos al nuevo flujo de onboarding
5. **Documentar activities**: Clarificar si se usa o es legacy
6. **RLS mejorado**: Implementar políticas de seguridad más estrictas en `workouts_simple` y `published_activities_simple`

### Prioridad Baja
7. **Migración de published_activities**: Decidir si migrar datos antiguos a `published_activities_simple` o mantener ambas
8. **Índices adicionales**: Agregar índices compuestos para consultas frecuentes
9. **Auditoría**: Implementar triggers para auditar cambios importantes

---

## 📅 HISTORIAL DE CAMBIOS

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2025-10-19 | Documentación inicial completa | Sistema |
| 2025-10-19 | ✅ Agregado campo `user_name` a published_activities_simple | Sistema |
| 2025-10-19 | ✅ Agregado campo `training_session_id` + trigger auto-completar | Sistema |
| 2025-10-19 | ✅ Creadas tablas training_plans y training_sessions | Sistema |
| 2025-10-19 | ✅ Sistema completo de vinculación GPS con plan | Sistema |
| - | Nuevo onboarding con 3 preguntas cerradas | - |
| - | Creación de `published_activities_simple` | - |
| - | Creación de `workouts_simple` | - |

---

**Fin del documento**

