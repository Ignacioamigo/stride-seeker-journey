# 🏃 Configuración Completa de Integración Strava - BeRun

## 📋 Resumen

Este documento describe la configuración **FUNCIONAL Y COMPLETA** de la integración de Strava con BeRun. Esta configuración permite:

- ✅ Conectar cuenta de Strava desde la app
- ✅ Importar actividades automáticamente vía webhook
- ✅ Mostrar actividades en "Mis actividades"
- ✅ Actualizar estadísticas automáticamente
- ✅ Auto-completar entrenamientos del plan
- ✅ Resetear estadísticas semanalmente

---

## 🔑 Credenciales de Strava

```
Client ID: 186314
Client Secret: fa541a582f6dde856651e09cb546598865b00b15
Webhook Verify Token: berun_webhook_verify_2024
```

---

## 🏗️ Arquitectura del Sistema

### 1. Tablas de Base de Datos

#### `strava_connections`
```sql
- user_auth_id (UUID) - ID del usuario en Supabase Auth
- strava_user_id (BIGINT) - ID del atleta en Strava (UNIQUE)
- access_token (TEXT) - Token de acceso OAuth
- refresh_token (TEXT) - Token para renovar acceso
- expires_at (BIGINT) - Timestamp de expiración
- athlete_name (TEXT) - Nombre del atleta
- athlete_email (TEXT) - Email del atleta
- created_at, updated_at (TIMESTAMP)
```

**Constraint clave:** `strava_user_id` es UNIQUE - una cuenta de Strava solo puede conectarse a un usuario.

#### `published_activities_simple`
```sql
- id (UUID)
- user_id (UUID) - user_auth_id del usuario
- title (TEXT)
- description (TEXT)
- distance (NUMERIC) - En kilómetros
- duration (TEXT) - Formato HH:MM:SS
- calories (INTEGER)
- workout_type (TEXT) - 'carrera'
- is_public (BOOLEAN)
- strava_activity_id (BIGINT) - UNIQUE, ID de Strava
- imported_from_strava (BOOLEAN)
- activity_date (TIMESTAMP)
- gps_points (JSONB)
- created_at (TIMESTAMP)
```

#### `simple_workouts`
```sql
- id (UUID)
- user_id (UUID) - user_auth_id del usuario
- workout_title (TEXT)
- workout_type (TEXT)
- distance_km (NUMERIC)
- duration_minutes (INTEGER)
- workout_date (DATE)
- plan_id (UUID) - Referencia al plan activo
- week_number (INTEGER) - CRÍTICO para reseteo semanal
- created_at, updated_at (TIMESTAMP)
```

#### `training_sessions`
```sql
- id (UUID)
- plan_id (UUID)
- day_date (DATE)
- title (TEXT)
- planned_distance (NUMERIC)
- planned_duration (TEXT)
- completed (BOOLEAN)
- actual_distance (NUMERIC)
- actual_duration (TEXT)
- completion_date (TIMESTAMP)
```

---

## 🔧 Edge Functions

### 1. `strava-auth` - Autenticación OAuth

**URL:** `https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/strava-auth`

**Flujo:**
1. Usuario hace clic en "Connect Strava"
2. App abre URL de autorización de Strava con `state=user_auth_id`
3. Strava redirige a strava-auth con `code`
4. strava-auth intercambia code por tokens
5. **IMPORTANTE:** Guarda conexión con `onConflict: 'strava_user_id'`
   - Esto permite reconexión sin errores de duplicate key
   - Si el mismo usuario de Strava se reconecta, actualiza la conexión existente

**Configuración:**
- `.edge-runtime`: `{ "verify_jwt": false }`
- Variables de entorno necesarias:
  - `STRAVA_CLIENT_ID`
  - `STRAVA_CLIENT_SECRET`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 2. `strava-webhook` - Importación Automática

**URL:** `https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/strava-webhook`

**Configuración:**
- `.edge-runtime`: `{ "verify_jwt": false }` (CRÍTICO - webhook debe ser público)
- Despliegue: `supabase functions deploy strava-webhook --no-verify-jwt`

**Webhook Subscription en Strava:**
```
ID: 316308
Callback URL: https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/strava-webhook
Verify Token: berun_webhook_verify_2024
Status: Activo
```

**Flujo Completo:**

1. **Verificación (GET request)**
   ```javascript
   if (hubMode === 'subscribe' && hubVerifyToken === 'berun_webhook_verify_2024') {
     return { 'hub.challenge': hubChallenge };
   }
   ```

2. **Recepción de evento (POST request)**
   - Strava envía evento cuando se crea actividad
   - Filtra: solo `activity` + `create` + tipo `Run`

3. **Búsqueda de usuario**
   ```javascript
   // Buscar por strava_user_id (owner_id del evento)
   const connection = await supabaseAdmin
     .from('strava_connections')
     .select('user_auth_id, access_token, refresh_token, expires_at')
     .eq('strava_user_id', event.owner_id)
     .maybeSingle();
   ```

4. **Refresh de token si es necesario**
   ```javascript
   if (now > connection.expires_at) {
     // Renovar token con Strava
     // Actualizar en strava_connections usando user_auth_id
   }
   ```

5. **Obtener detalles de actividad**
   ```javascript
   const activity = await fetch(
     `https://www.strava.com/api/v3/activities/${event.object_id}`,
     { headers: { Authorization: `Bearer ${accessToken}` }}
   );
   ```

6. **Guardar en `published_activities_simple`**
   ```javascript
   const distanceKm = Math.round((distanceInMeters / 1000) * 100) / 100;
   const durationMinutes = Math.round(durationInSeconds / 60);
   
   await supabaseAdmin.from('published_activities_simple').insert({
     user_id: connection.user_auth_id,
     title: activity.name,
     distance: distanceKm,
     duration: durationString, // HH:MM:SS
     calories: Math.round(distanceKm * 60),
     workout_type: 'carrera',
     strava_activity_id: event.object_id,
     imported_from_strava: true,
     activity_date: activity.start_date,
     gps_points: []
   });
   ```

7. **Obtener plan activo y week_number**
   ```javascript
   // 1. Obtener user_profile.id desde user_auth_id
   const userProfile = await supabaseAdmin
     .from('user_profiles')
     .select('id')
     .eq('user_auth_id', connection.user_auth_id)
     .single();
   
   // 2. Obtener plan más reciente
   const activePlan = await supabaseAdmin
     .from('training_plans')
     .select('id, week_number')
     .eq('user_id', userProfile.id)
     .order('created_at', { ascending: false })
     .limit(1)
     .maybeSingle();
   
   const planId = activePlan?.id;
   const weekNumber = activePlan?.week_number || 1;
   ```

8. **Guardar en `simple_workouts` (para estadísticas)**
   ```javascript
   await supabaseAdmin.from('simple_workouts').insert({
     user_id: connection.user_auth_id,
     workout_title: activity.name,
     workout_type: 'carrera',
     distance_km: distanceKm,
     duration_minutes: durationMinutes,
     workout_date: activityDate,
     plan_id: planId,
     week_number: weekNumber // CRÍTICO para reseteo semanal
   });
   ```

9. **Auto-completar sesión del plan**
   ```javascript
   // Buscar sesiones incompletas en el plan
   const sessions = await supabaseAdmin
     .from('training_sessions')
     .select('id, day_date, title, planned_distance, completed')
     .eq('plan_id', planId)
     .eq('completed', false)
     .order('day_date', { ascending: true });
   
   // Encontrar mejor coincidencia:
   // - Fecha más cercana (preferir hoy o anterior)
   // - Distancia similar
   // - Dentro de ±7 días
   
   const bestMatch = /* algoritmo de scoring */;
   
   // Marcar como completada
   await supabaseAdmin
     .from('training_sessions')
     .update({
       completed: true,
       actual_distance: distanceKm,
       actual_duration: durationString,
       completion_date: new Date().toISOString()
     })
     .eq('id', bestMatch.id);
   ```

10. **Importar puntos GPS (opcional)**
    ```javascript
    if (activity.map?.summary_polyline) {
      const streams = await fetch(
        `https://www.strava.com/api/v3/activities/${event.object_id}/streams?keys=latlng,time,altitude`,
        { headers: { Authorization: `Bearer ${accessToken}` }}
      );
      // Actualizar gps_points en published_activities_simple
    }
    ```

---

## 📊 Sistema de Estadísticas

### Hook: `usePeriodStats`

**Filtrado ESTRICTO por week_number:**

```javascript
// Para "Esta semana"
if (period === 'current_week' && plan) {
  const currentWeekNumber = plan.weekNumber || 1;
  
  workouts = allWorkouts?.filter(w => {
    // SOLO incluir si tiene week_number Y coincide exactamente
    return w.week_number === currentWeekNumber;
  });
}
```

**Resultado:**
- ✅ Semana 1: Solo muestra workouts con `week_number: 1`
- ✅ Semana 2: Solo muestra workouts con `week_number: 2`
- ✅ Al generar nuevo plan, estadísticas empiezan en 0

### Reseteo Semanal

1. Usuario genera plan → `training_plans.week_number = 1`
2. Actividades de Strava se guardan con `week_number: 1`
3. Estadísticas muestran solo `week_number: 1`
4. Usuario genera plan siguiente semana → `week_number = 2`
5. Nuevas actividades se guardan con `week_number: 2`
6. **Estadísticas se resetean** (solo muestran `week_number: 2`)

---

## 🔄 Flujo Completo de Usuario

### 1. Conexión Inicial
```
App → Settings → Connect Strava
  ↓
Strava OAuth
  ↓
strava-auth (Edge Function)
  ↓
Guarda en strava_connections (onConflict: strava_user_id)
  ↓
✅ Conexión exitosa
```

### 2. Importación Automática
```
Usuario corre y sube a Strava
  ↓
Strava envía webhook event
  ↓
strava-webhook recibe evento
  ↓
1. Busca usuario por strava_user_id
2. Obtiene detalles de actividad
3. Guarda en published_activities_simple
4. Obtiene plan activo + week_number
5. Guarda en simple_workouts con week_number
6. Busca sesión del plan más cercana
7. Auto-completa entrenamiento
8. Importa puntos GPS
  ↓
✅ Actividad importada y entrenamiento completado
```

### 3. Visualización en App
```
Usuario abre app
  ↓
Página "Mis actividades"
  → Lee published_activities_simple
  → Muestra todas las actividades
  ↓
Página "Estadísticas"
  → Lee simple_workouts
  → Filtra por week_number actual
  → Muestra solo estadísticas de esta semana
  ↓
Página "Plan"
  → Lee training_sessions
  → Muestra entrenamientos completados ✅
```

---

## 🛠️ Comandos Útiles

### Verificar Webhook Subscription
```bash
curl -G https://www.strava.com/api/v3/push_subscriptions \
  -d client_id=186314 \
  -d client_secret=fa541a582f6dde856651e09cb546598865b00b15
```

### Recrear Webhook Subscription
```bash
# 1. Eliminar existente
curl -X DELETE https://www.strava.com/api/v3/push_subscriptions/316308 \
  -F client_id=186314 \
  -F client_secret=fa541a582f6dde856651e09cb546598865b00b15

# 2. Crear nueva
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=186314 \
  -F client_secret=fa541a582f6dde856651e09cb546598865b00b15 \
  -F callback_url=https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/strava-webhook \
  -F verify_token=berun_webhook_verify_2024
```

### Desplegar Edge Functions
```bash
# strava-auth
supabase functions deploy strava-auth

# strava-webhook (IMPORTANTE: usar --no-verify-jwt)
supabase functions deploy strava-webhook --no-verify-jwt
```

### Limpiar Workouts sin week_number
```sql
-- Ver workouts sin week_number
SELECT id, workout_title, workout_date, week_number 
FROM simple_workouts 
WHERE week_number IS NULL;

-- Opción 1: Eliminarlos
DELETE FROM simple_workouts WHERE week_number IS NULL;

-- Opción 2: Asignar a semana 1
UPDATE simple_workouts SET week_number = 1 WHERE week_number IS NULL;
```

---

## ✅ Checklist de Verificación

### Edge Functions
- [ ] `strava-auth` desplegada
- [ ] `strava-auth` tiene `.edge-runtime` con `verify_jwt: false`
- [ ] `strava-webhook` desplegada con `--no-verify-jwt`
- [ ] `strava-webhook` tiene `.edge-runtime` con `verify_jwt: false`
- [ ] Variables de entorno configuradas en Supabase

### Webhook Subscription
- [ ] Subscription creada en Strava (ID: 316308)
- [ ] Callback URL correcto
- [ ] Verify token correcto (`berun_webhook_verify_2024`)
- [ ] Webhook responde correctamente a GET de verificación

### Base de Datos
- [ ] Tabla `strava_connections` existe con constraint único en `strava_user_id`
- [ ] Tabla `published_activities_simple` existe
- [ ] Tabla `simple_workouts` existe con columna `week_number`
- [ ] Tabla `training_sessions` existe

### Frontend
- [ ] Hook `usePeriodStats` filtra por `week_number`
- [ ] Página "Mis actividades" muestra actividades importadas
- [ ] Página "Estadísticas" se actualiza con nuevas actividades
- [ ] Página "Plan" muestra entrenamientos completados

---

## 🐛 Troubleshooting

### Webhook no recibe eventos
1. Verificar que subscription existe: `curl -G https://www.strava.com/api/v3/push_subscriptions ...`
2. Verificar que webhook responde a GET: `curl -G "https://...strava-webhook?hub.mode=subscribe&hub.challenge=test&hub.verify_token=berun_webhook_verify_2024"`
3. Revisar logs en Supabase Dashboard

### Estadísticas no se resetean
1. Verificar que actividades tienen `week_number` asignado
2. Limpiar workouts sin `week_number`: `DELETE FROM simple_workouts WHERE week_number IS NULL`
3. Verificar que `usePeriodStats` filtra correctamente

### Entrenamientos no se autocompletar
1. Revisar logs del webhook para ver algoritmo de matching
2. Verificar que hay sesiones incompletas en el plan
3. Verificar que la fecha de la actividad está ±7 días de alguna sesión

### Error "duplicate key strava_user_id"
1. Verificar que `strava-auth` usa `onConflict: 'strava_user_id'`
2. Redesplegar: `supabase functions deploy strava-auth`

---

## 📝 Notas Importantes

1. **week_number es CRÍTICO**: Sin él, las estadísticas no se resetean semanalmente
2. **verify_jwt: false**: El webhook DEBE ser público para que Strava pueda llamarlo
3. **onConflict: strava_user_id**: Permite reconexiones sin errores
4. **user_auth_id vs user_profile.id**: 
   - `strava_connections` usa `user_auth_id` (Supabase Auth)
   - `training_plans` usa `user_id` (user_profiles.id)
   - El webhook debe convertir entre ambos

---

## 🎉 Resultado Final

Con esta configuración:
- ✅ Los usuarios pueden conectar Strava sin errores
- ✅ Las actividades se importan automáticamente
- ✅ Las estadísticas se actualizan en tiempo real
- ✅ Los entrenamientos se completan automáticamente
- ✅ Las estadísticas se resetean cada semana
- ✅ Todo funciona sin intervención manual

**¡Integración 100% funcional!** 🚀

