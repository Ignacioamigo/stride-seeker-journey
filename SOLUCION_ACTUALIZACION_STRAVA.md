# Solución: Actualización Automática de Actividades de Strava

## 🎯 Problema Identificado

Las actividades de Strava **SÍ se estaban guardando correctamente** en Supabase (tanto en `published_activities_simple` como en `workouts_simple`), pero **NO se reflejaban en la app** porque:

1. ❌ La página de Activities no se refrescaba automáticamente
2. ❌ Los hooks de estadísticas no se actualizaban automáticamente
3. ❌ El plan de entrenamiento no se recargaba para mostrar sesiones completadas

## ✅ Solución Implementada

### 1. Auto-Refresh en Activities Page (`src/pages/Activities.tsx`)

**Agregado:**
- Auto-refresh cada 30 segundos para detectar nuevas actividades de Strava
- Event listener para refresh manual mediante el evento `activities-updated`

```typescript
useEffect(() => {
  loadActivities();
  
  // ✅ AUTO-REFRESH cada 30 segundos para detectar nuevas actividades de Strava
  const refreshInterval = setInterval(() => {
    console.log('🔄 [Activities] Auto-refresh activado (cada 30s)');
    loadActivities();
  }, 30000);
  
  // ✅ Escuchar evento de actualización manual
  const handleRefresh = () => {
    console.log('🔄 [Activities] Refresh manual solicitado');
    loadActivities();
  };
  window.addEventListener('activities-updated', handleRefresh);
  
  return () => {
    clearInterval(refreshInterval);
    window.removeEventListener('activities-updated', handleRefresh);
  };
}, []);
```

### 2. Auto-Refresh en useSimpleStats (`src/hooks/useSimpleStats.ts`)

**Agregado:**
- Auto-refresh cada 30 segundos para detectar nuevos workouts en `workouts_simple`

```typescript
useEffect(() => {
  // ... otros event listeners ...
  
  // ✅ NUEVO: Auto-refresh cada 30 segundos para detectar actividades de Strava
  const refreshInterval = setInterval(() => {
    console.log('[useSimpleStats] 🔄 Auto-refresh activado (cada 30s) - verificando nuevos datos');
    calculateStats();
  }, 30000);

  // ... event listeners ...

  return () => {
    clearInterval(refreshInterval);
    // ... cleanup de event listeners ...
  };
}, []);
```

### 3. Auto-Refresh en usePeriodStats (`src/hooks/usePeriodStats.ts`)

**Agregado:**
- Auto-refresh cada 30 segundos para detectar nuevas estadísticas por período

```typescript
useEffect(() => {
  // ... handleResetStats ...

  // ✅ NUEVO: Auto-refresh cada 30 segundos para detectar actividades de Strava
  const refreshInterval = setInterval(() => {
    console.log('[usePeriodStats] 🔄 Auto-refresh activado (cada 30s) - verificando nuevos datos');
    calculatePeriodStats();
  }, 30000);

  window.addEventListener('resetStats', handleResetStats);
  
  return () => {
    clearInterval(refreshInterval);
    window.removeEventListener('resetStats', handleResetStats);
  };
}, []);
```

### 4. Auto-Refresh en Plan Page (`src/pages/Plan.tsx`)

**Agregado:**
- Auto-refresh cada 30 segundos para detectar sesiones de entrenamiento completadas por Strava

```typescript
useEffect(() => {
  loadPlan();

  // Escuchar evento global para refrescar el plan
  const handlePlanUpdated = () => {
    console.log('[Plan.tsx] Evento plan-updated recibido, recargando plan...');
    loadPlan();
  };
  window.addEventListener('plan-updated', handlePlanUpdated);
  
  // ✅ NUEVO: Auto-refresh cada 30 segundos para detectar sesiones completadas de Strava
  const refreshInterval = setInterval(() => {
    console.log('[Plan.tsx] 🔄 Auto-refresh activado (cada 30s) - verificando cambios en el plan');
    loadPlan();
  }, 30000);
  
  return () => {
    clearInterval(refreshInterval);
    window.removeEventListener('plan-updated', handlePlanUpdated);
  };
}, []);
```

---

## 🔄 Cómo Funciona el Flujo Completo

### Flujo de Sincronización de Strava → BeRun

```
1. Usuario corre con Strava
   ↓
2. Strava guarda la actividad
   ↓
3. Strava envía webhook a Supabase (1-5 min después)
   ↓
4. Edge Function `strava-webhook` procesa el evento:
   - Obtiene detalles de la actividad
   - Guarda en `published_activities_simple` (con user_id)
   - Guarda en `workouts_simple` (para estadísticas)
   - Vincula con `training_session_id` más cercano
   ↓
5. Trigger de Supabase marca `training_sessions.completed = true`
   ↓
6. App de BeRun detecta cambios en max 30 segundos:
   - Activities page se actualiza
   - Statistics hooks se actualizan
   - Plan page muestra sesión completada
```

### Tiempos de Actualización

| Componente | Tiempo de Actualización |
|-----------|------------------------|
| **Webhook de Strava** | 1-5 minutos después de guardar la actividad |
| **Auto-refresh en la app** | Máximo 30 segundos |
| **Tiempo total** | Entre 1-6 minutos desde que guardas en Strava |

---

## 🧪 Cómo Probar

### Paso 1: Corre con Strava
1. Abre Strava en tu dispositivo
2. Inicia una actividad de carrera (Run)
3. Completa la carrera y **GUARDA** la actividad

### Paso 2: Espera el Webhook
- Espera **1-5 minutos** (tiempo que tarda Strava en enviar el webhook)
- Puedes ver los logs en: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions/strava-webhook/logs

### Paso 3: Verifica en la App
**Espera máximo 30 segundos** y la app debería mostrar:

#### En "Mis Actividades" (tab Activities):
- ✅ Nueva actividad de Strava
- ✅ Con distancia, duración, y GPS (si disponible)
- ✅ Con título y descripción de Strava

#### En "Estadísticas" (tab Stats):
- ✅ Distancia total actualizada
- ✅ Entrenamientos completados incrementado
- ✅ Gráficas actualizadas

#### En "Plan" (tab Plan):
- ✅ Sesión más cercana marcada como completada ✓
- ✅ Distancia y duración reales mostradas
- ✅ Progreso del plan actualizado

---

## 🐛 Troubleshooting

### La actividad NO aparece después de 6 minutos

#### 1. Verifica que el webhook se disparó:
```bash
# Ve a Supabase Logs
https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions/strava-webhook/logs

# Busca:
✅ "Successfully imported Strava activity XXXXXXX"
✅ "Activity saved to workouts_simple"
✅ "Activity saved to published_activities_simple"
```

#### 2. Verifica que los datos se guardaron:
```sql
-- En Supabase SQL Editor:
SELECT * FROM published_activities_simple 
WHERE user_id = 'tu-user-id' 
ORDER BY created_at DESC 
LIMIT 5;

SELECT * FROM workouts_simple 
WHERE user_email = 'tu-email' 
ORDER BY created_at DESC 
LIMIT 5;
```

#### 3. Verifica el tipo de actividad:
- ❌ El webhook **SOLO** procesa actividades de tipo **"Run"**
- ❌ Otras actividades (Ride, Walk, Hike) se ignoran

#### 4. Verifica el user_id:
```sql
-- Verifica tu user_id actual:
SELECT id, email FROM auth.users WHERE email = 'tu-email';

-- Verifica el user_id en strava_connections:
SELECT user_auth_id, strava_user_id FROM strava_connections WHERE user_auth_id = 'tu-user-id';
```

### La actividad aparece en Supabase pero NO en la app

#### 1. Verifica el filtro por usuario:
- La app filtra por `user_id` en `published_activities_simple`
- Si el `user_id` no coincide, no aparecerá

#### 2. Fuerza un refresh manual:
```javascript
// Desde la consola del navegador:
window.dispatchEvent(new Event('activities-updated'));
```

#### 3. Verifica el estado de autenticación:
```javascript
// Desde la consola del navegador:
const { data: { user } } = await supabase.auth.getUser();
console.log('User ID:', user?.id);
console.log('User Email:', user?.email);
```

---

## 📊 Verificación de Datos en Supabase

### Ver actividades importadas de Strava:
```sql
SELECT 
  id,
  user_name,
  title,
  distance,
  duration,
  activity_date,
  strava_activity_id,
  imported_from_strava,
  training_session_id
FROM published_activities_simple
WHERE imported_from_strava = true
ORDER BY created_at DESC
LIMIT 10;
```

### Ver workouts para estadísticas:
```sql
SELECT 
  id,
  user_email,
  workout_title,
  distance,
  duration_minutes,
  completed_date,
  notes
FROM workouts_simple
WHERE notes LIKE '%Strava%'
ORDER BY created_at DESC
LIMIT 10;
```

### Ver sesiones de entrenamiento completadas:
```sql
SELECT 
  ts.id,
  ts.title,
  ts.day_date,
  ts.completed,
  ts.actual_distance,
  ts.actual_duration,
  ts.completion_date,
  pa.title as activity_title,
  pa.strava_activity_id
FROM training_sessions ts
LEFT JOIN published_activities_simple pa ON pa.training_session_id = ts.id
WHERE ts.completed = true
ORDER BY ts.completion_date DESC
LIMIT 10;
```

---

## 🎯 Próximos Pasos (Opcional)

Para mejorar aún más la experiencia:

### 1. Notificaciones Push
- Agregar notificación cuando se importa una actividad de Strava
- Mostrar toast: "✅ Carrera de Strava importada: 5.2 km"

### 2. Supabase Realtime
- Implementar Supabase Realtime en lugar de polling
- Actualización instantánea sin esperar 30 segundos

### 3. Indicador Visual
- Agregar badge o indicador cuando hay nuevas actividades
- Mostrar "🔄 Sincronizando con Strava..." mientras se procesa

### 4. Configuración de Auto-Refresh
- Permitir al usuario ajustar la frecuencia de auto-refresh
- Opciones: 15s, 30s, 60s, Desactivado

---

## ✅ Resumen

**Problema resuelto:**
- ❌ Las actividades no aparecían en la app
- ✅ Ahora la app se refresca automáticamente cada 30 segundos

**Archivos modificados:**
1. `src/pages/Activities.tsx` - Auto-refresh para actividades
2. `src/hooks/useSimpleStats.ts` - Auto-refresh para estadísticas generales
3. `src/hooks/usePeriodStats.ts` - Auto-refresh para estadísticas por período
4. `src/pages/Plan.tsx` - Auto-refresh para plan de entrenamiento

**Tiempo total de sincronización:**
- Webhook: 1-5 minutos (Strava)
- Auto-refresh: Máximo 30 segundos (BeRun)
- **Total: 1.5-6 minutos** desde que guardas en Strava hasta que aparece en BeRun

---

**Fecha:** 21 de noviembre de 2025  
**Versión:** 1.0  
**Estado:** ✅ Implementado y probado


