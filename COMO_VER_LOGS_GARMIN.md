# 🔍 Cómo Ver Logs de Garmin - Guía Completa

Esta guía te explica cómo monitorear la integración de Garmin para detectar problemas.

---

## 📋 Tabla de Contenidos

1. [Ver Logs en Tiempo Real](#1-ver-logs-en-tiempo-real)
2. [Ver Logs en el Dashboard de Supabase](#2-ver-logs-en-el-dashboard-de-supabase)
3. [Verificar Datos en la Base de Datos](#3-verificar-datos-en-la-base-de-datos)
4. [Qué Buscar en los Logs](#4-qué-buscar-en-los-logs)
5. [Problemas Comunes y Soluciones](#5-problemas-comunes-y-soluciones)

---

## 1. Ver Logs en Tiempo Real

### Opción A: Usando el Script Interactivo (Recomendado)

```bash
cd /Users/nachoamigo/stride-seeker-journey
chmod +x scripts/view-garmin-logs.sh
./scripts/view-garmin-logs.sh
```

Selecciona la opción **1** (Webhook) para ver las actividades que llegan de Garmin.

### Opción B: Comandos Directos

#### Ver logs del webhook (lo más importante para actividades)

```bash
supabase functions logs garmin-webhook --project-ref uprohtkbghujvjwjnqyv
```

#### Ver logs de autenticación

```bash
supabase functions logs garmin-auth-callback --project-ref uprohtkbghujvjwjnqyv
```

#### Ver logs de inicio de conexión

```bash
supabase functions logs garmin-auth-start --project-ref uprohtkbghujvjwjnqyv
```

---

## 2. Ver Logs en el Dashboard de Supabase

1. Ve a [https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv](https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv)
2. En el menú lateral, haz clic en **"Edge Functions"**
3. Selecciona la función que quieres monitorear:
   - `garmin-webhook` → Para ver actividades que llegan
   - `garmin-auth-callback` → Para problemas de conexión
4. Haz clic en la pestaña **"Logs"**
5. Verás los logs en tiempo real

**Ventaja:** Puedes ver logs con colores y filtros, y no necesitas terminal.

---

## 3. Verificar Datos en la Base de Datos

### Opción A: Usando el SQL Editor de Supabase (Recomendado)

1. Ve al Dashboard de Supabase → **"SQL Editor"**
2. Copia y pega las queries del archivo `scripts/check-garmin-data.sql`
3. Ejecuta cada query para verificar:
   - ✅ Conexión de Garmin guardada
   - 📊 Actividades importadas desde Garmin
   - 🏃 Entrenamientos completados automáticamente
   - 📈 Estadísticas de la semana

### Opción B: Queries Rápidas

#### Ver si tienes conexión de Garmin guardada

```sql
SELECT 
  user_auth_id,
  garmin_user_id,
  token_expires_at,
  created_at
FROM garmin_connections;
```

**Resultado esperado:** Una fila con tu `user_auth_id`.

#### Ver actividades importadas de Garmin

```sql
SELECT 
  title,
  distance,
  duration,
  garmin_activity_id,
  activity_date,
  created_at
FROM published_activities_simple
WHERE imported_from_garmin = true
ORDER BY activity_date DESC
LIMIT 10;
```

**Resultado esperado:** Las actividades que hiciste con Garmin.

#### Ver entrenamientos completados automáticamente

```sql
SELECT 
  workout_date,
  workout_type,
  distance_km as planificado,
  actual_distance_km as real,
  completed,
  completed_at
FROM simple_workouts
WHERE completed = true
  AND actual_distance_km IS NOT NULL
ORDER BY completed_at DESC
LIMIT 10;
```

**Resultado esperado:** Los entrenamientos que se marcaron como completados automáticamente.

---

## 4. Qué Buscar en los Logs

### ✅ Logs Correctos (Todo Funciona)

Cuando corres con Garmin y todo funciona, deberías ver esto en los logs del webhook:

```
🔔🔔🔔 ===== GARMIN WEBHOOK CALLED ===== 🔔🔔🔔
📅 Timestamp: 2026-01-06T...
📦 Received Garmin webhook payload: { ... }
📊 Processing activity: Morning Run (ID: 123456789)
👤 Garmin User ID: abc123
✅ Found connection for user: <tu-user-id>
💾 Saving activity to database...
✅✅✅ Activity saved successfully!
  - ID: <activity-id>
  - Title: Morning Run
  - Distance: 5.2 km
  - Duration: 00:25:30
🔍 Now checking if this completes a workout in the training plan...
✅ Found connection for user: <tu-user-id>
✅✅✅ Workout marked as completed successfully!
  - Workout ID: <workout-id>
  - Actual distance: 5.2 km
  - Actual duration: 25.5 min
```

### ❌ Logs de Problemas

#### Problema 1: Garmin no llama al webhook

**Síntoma:** No ves logs de `===== GARMIN WEBHOOK CALLED =====` después de correr.

**Causa posible:**
- El webhook no está configurado en el portal de Garmin Developer
- Garmin tarda en enviar las notificaciones (puede tardar hasta 30 minutos)

**Solución:**
1. Ve al [Garmin Developer Portal](https://developer.garmin.com/)
2. Verifica que el webhook URL esté configurado correctamente
3. Espera 15-30 minutos después de sincronizar tu actividad

#### Problema 2: No se encuentra la conexión

**Síntoma:**
```
❌ No connection found for Garmin user abc123
```

**Causa:** La conexión no se guardó correctamente o el `garmin_user_id` no coincide.

**Solución:**
1. Desconecta Garmin desde la app
2. Vuelve a conectar
3. Verifica en la base de datos que se guardó correctamente

#### Problema 3: Error al guardar actividad

**Síntoma:**
```
❌ Error inserting activity: ...
```

**Causa:** Problema con el esquema de la base de datos o RLS.

**Solución:**
1. Verifica que la tabla `published_activities_simple` tenga las columnas:
   - `garmin_activity_id`
   - `imported_from_garmin`
2. Verifica las políticas RLS

#### Problema 4: Actividad se guarda pero no se marca el entrenamiento

**Síntoma:**
```
✅✅✅ Activity saved successfully!
ℹ️ No active plan found
```
O:
```
ℹ️ No matching incomplete workout found
```

**Causa:** No hay plan activo o no hay entrenamientos pendientes que coincidan.

**Posible solución:**
- Verifica que tengas un plan activo
- Verifica que haya entrenamientos pendientes para esa fecha/tipo
- Verifica que la distancia coincida (tolerancia del 10%)

---

## 5. Problemas Comunes y Soluciones

### Problema: "Corrí con Garmin pero no veo la actividad en la app"

**Pasos de diagnóstico:**

1. **Ver logs del webhook:**
   ```bash
   supabase functions logs garmin-webhook --project-ref uprohtkbghujvjwjnqyv
   ```
   - ✅ Si ves logs: Garmin está llamando al webhook → problema en la app
   - ❌ Si NO ves logs: Garmin no está llamando → problema de configuración

2. **Verificar en la base de datos:**
   ```sql
   SELECT * FROM published_activities_simple 
   WHERE imported_from_garmin = true 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```
   - ✅ Si ves actividades: El backend funciona → problema en el frontend
   - ❌ Si NO ves actividades: El webhook no está guardando datos

3. **Si el backend funciona pero la app no muestra:**
   - El problema está en cómo la app carga las actividades
   - Verifica que la app haga un `refresh` de las actividades
   - Verifica que no haya filtros que oculten las actividades importadas

### Problema: "Se guarda la actividad pero no se marca el entrenamiento como completado"

**Pasos de diagnóstico:**

1. **Ver logs del webhook, sección de "checking workout":**
   ```
   🔍 Now checking if this completes a workout in the training plan...
   ```

2. **Verificar que tengas un plan activo:**
   ```sql
   SELECT id, name, current_week, is_active 
   FROM training_plans 
   WHERE is_active = true;
   ```

3. **Verificar entrenamientos pendientes:**
   ```sql
   SELECT id, workout_date, workout_type, distance_km, completed
   FROM simple_workouts
   WHERE completed = false
   ORDER BY workout_date;
   ```

---

## 📞 Si Nada Funciona

Si después de revisar todo sigue sin funcionar:

1. **Exporta los logs:**
   ```bash
   supabase functions logs garmin-webhook --project-ref uprohtkbghujvjwjnqyv > logs.txt
   ```

2. **Exporta los datos de la BD:**
   - Corre todas las queries de `scripts/check-garmin-data.sql`
   - Guarda los resultados

3. **Comparte los logs y resultados** para poder diagnosticar el problema específico.

---

## 🎯 Checklist Rápido

Antes de correr con Garmin, verifica:

- [ ] Tienes Garmin conectado en la app (Settings)
- [ ] La conexión está en la tabla `garmin_connections`
- [ ] El webhook está configurado en Garmin Developer Portal
- [ ] Las Edge Functions están desplegadas
- [ ] Los logs del webhook están vacíos (para ver nuevos logs limpios)

Después de correr:

- [ ] Espera 5-30 minutos (Garmin puede tardar en enviar)
- [ ] Revisa los logs del webhook
- [ ] Verifica que la actividad esté en `published_activities_simple`
- [ ] Verifica que el entrenamiento esté marcado como completado si corresponde

---

**¡Listo!** Con esta guía deberías poder diagnosticar cualquier problema con Garmin. 🎉

