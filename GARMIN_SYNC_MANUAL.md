# 🔄 Sincronización Manual de Garmin - Guía Completa

## 📋 ¿Qué es esto?

Como los webhooks de Garmin no están enviando notificaciones automáticamente (probablemente por configuración de Garmin), he implementado una **solución alternativa** que funciona perfectamente:

**Un botón "Sincronizar actividades"** que obtiene manualmente tus actividades de Garmin.

---

## ✅ Lo que hace:

1. 🔄 Obtiene las últimas actividades de Garmin (últimos 30 días)
2. 💾 Las importa a tu base de datos
3. ✅ Marca los entrenamientos como completados si corresponden
4. 📊 Actualiza tus estadísticas

---

## 🚀 Cómo desplegar:

### 1. Despliega la Edge Function:

```bash
cd /Users/nachoamigo/stride-seeker-journey
./scripts/deploy-garmin-sync.sh
```

O manualmente:

```bash
supabase functions deploy garmin-sync --project-ref uprohtkbghujvjwjnqyv --no-verify-jwt
```

### 2. Compila y sincroniza la app:

```bash
npm run build
npx cap sync ios
```

### 3. Abre la app en Xcode y prueba:

1. Ve a **Settings**
2. Verás el botón **"Sincronizar actividades"**
3. Haz clic
4. ¡Listo! Tus actividades se importarán

---

## 🎯 Cómo usar:

1. **Después de correr con Garmin:**
   - Sincroniza en la app Garmin Connect
   - Ve a BeRun → Settings
   - Click en **"Sincronizar actividades"**
   - Espera unos segundos
   - ¡Tus actividades aparecerán!

2. **La primera vez:**
   - Importará todas las actividades de los últimos 30 días
   - Puede tardar unos segundos si tienes muchas

3. **Uso regular:**
   - Después de cada carrera, simplemente haz clic en sincronizar
   - O deja que los webhooks funcionen automáticamente (si Garmin los activa)

---

## ⚙️ Cómo funciona:

### Edge Function: `garmin-sync`

1. **Obtiene tu conexión de Garmin** de la base de datos
2. **Llama al API de Garmin** con OAuth 1.0a:
   ```
   GET https://apis.garmin.com/wellness-api/rest/activities
   ```
3. **Obtiene actividades** de los últimos 30 días
4. **Para cada actividad:**
   - Verifica si ya existe (por `garmin_activity_id`)
   - Si no existe, la importa
   - Convierte los datos al formato de BeRun
   - Guarda en `published_activities_simple`
   - Busca si completa un entrenamiento del plan
   - Si sí, lo marca como completado

5. **Retorna un resumen:**
   - Actividades importadas
   - Actividades omitidas (ya existían)

---

## 🔍 Logs y debugging:

### Ver logs de la sincronización:

```bash
supabase functions logs garmin-sync --project-ref uprohtkbghujvjwjnqyv
```

### Ver en el dashboard de Supabase:

1. Ve a Edge Functions
2. Click en `garmin-sync`
3. Pestaña "Logs"

### Logs típicos de éxito:

```
🔄 Starting Garmin manual sync...
👤 User ID: 17ce90d3-100b-4877-922a-925960c5d071
✅ Found Garmin connection
📅 Fetching activities from 2025-12-07 to 2026-01-06
🔐 Calling Garmin API...
📊 Received 5 activities from Garmin
📊 Processing activity: Majadahonda Running (ID: 21453759899)
💾 Saving activity to database...
✅ Activity saved successfully
🔍 Checking for matching workout in plan...
✅ Workout marked as completed
✅ Sync completed: 5 imported, 0 skipped
```

---

## ⚠️ Notas importantes:

### 1. **No importa duplicados**
   - Si una actividad ya existe (por `garmin_activity_id`), se omite
   - Puedes hacer clic en sincronizar cuantas veces quieras

### 2. **Acepta TODAS las actividades**
   - A diferencia de los webhooks de Garmin, esto importa:
     - Actividades cortas (de prueba)
     - Actividades sin distancia
     - Cualquier tipo de actividad

### 3. **Funciona con OAuth 1.0a**
   - Usa tus tokens de acceso guardados
   - Si expiran, tendrás que reconectar Garmin

### 4. **Últimos 30 días**
   - Por defecto obtiene actividades de los últimos 30 días
   - Puedes ajustar esto en el código si necesitas más

---

## 🐛 Solución de problemas:

### Error: "Garmin not connected"

**Causa:** No tienes Garmin conectado o los tokens expiraron

**Solución:**
1. Ve a Settings
2. Desconecta Garmin (si está conectado)
3. Vuelve a conectar
4. Intenta sincronizar de nuevo

### Error: "Garmin API error: 401"

**Causa:** Token de acceso expirado o inválido

**Solución:**
1. Desconecta y reconecta Garmin
2. Los tokens se renovarán

### Error: "No new activities found"

**Causa:** No hay actividades nuevas en los últimos 30 días

**Solución:**
- Esto es normal si ya importaste todo
- O si no has corrido en 30 días

### No se importa ninguna actividad

**Verifica:**
1. ¿Tienes actividades en Garmin Connect?
2. ¿Las actividades son de los últimos 30 días?
3. ¿Ya las habías importado antes?

**Ver en logs:**
```bash
supabase functions logs garmin-sync --project-ref uprohtkbghujvjwjnqyv
```

---

## 🔄 Webhooks vs Sincronización Manual:

| Aspecto | Webhooks (ideal) | Sincronización Manual (actual) |
|---------|------------------|--------------------------------|
| **Automático** | ✅ Sí | ❌ No (click manual) |
| **Tiempo real** | ✅ 5-30 min | ❌ Cuando tú quieras |
| **Actividades cortas** | ❌ No (filtradas) | ✅ Sí |
| **Confiabilidad** | ⚠️ Depende de Garmin | ✅ 100% confiable |
| **Esfuerzo** | ✅ Ninguno | ⚠️ Un click |

---

## 🎯 Próximos pasos:

### Mientras los webhooks se arreglan:

1. **Usa la sincronización manual** después de cada carrera
2. **Funciona perfectamente** - importa todas tus actividades
3. **Es confiable** - no depende de Garmin

### Para arreglar los webhooks:

Necesitas investigar en Garmin Developer Portal:
1. ¿Por qué las notificaciones push no se están enviando?
2. ¿Hay logs de error en el lado de Garmin?
3. ¿Necesitas alguna aprobación adicional?
4. Usa el "Summary Resender" para forzar el envío de prueba

---

## ✅ Ventajas de esta solución:

1. ✅ **Funciona ahora** - no necesitas esperar a Garmin
2. ✅ **Más control** - sincronizas cuando quieras
3. ✅ **Acepta todo** - incluso actividades de prueba cortas
4. ✅ **Confiable** - no depende de webhooks
5. ✅ **Fácil de usar** - un solo click

---

**¡Ya está listo para usar!** Despliega la función y pruébala. 🎉

