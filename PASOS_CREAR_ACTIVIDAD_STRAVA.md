# 🚨 PROBLEMA IDENTIFICADO: No Hay Actividades en la Base de Datos

## 📊 Estado Actual

```
published_activities_simple: 0 actividades
workouts_simple: 0 workouts
```

**Esto significa que el webhook NO ha procesado ninguna actividad todavía.**

---

## ✅ SOLUCIÓN: Crear una Actividad de Prueba

### Paso 1: Verificar Conexión de Strava

Ejecuta este SQL primero:
```sql
-- Copiar y ejecutar en Supabase SQL Editor
SELECT * FROM strava_connections;
```

**¿Qué debes ver?**
- ✅ Una fila con tu `user_auth_id`, `strava_user_id`, y tokens
- ❌ Si está vacío → Debes conectar Strava desde la app (Settings → Connect Strava)

### Paso 2: Crear Actividad Manual en Strava

**Opción A: En la App de Strava (Móvil)**
1. Abre Strava en tu móvil
2. Tap en "+" → "Actividad manual"
3. Completa:
   - Tipo: **Run** (IMPORTANTE: debe ser Run, no Walk ni Ride)
   - Fecha: Hoy
   - Hora: Ahora
   - Distancia: 1 km
   - Duración: 5 minutos
   - Título: "Prueba BeRun"
4. **Guarda**

**Opción B: En Strava Web**
1. Ve a: https://www.strava.com/
2. Click en "+" → "Create manual activity"
3. Completa:
   - Sport: **Running** (CRÍTICO)
   - Date: Hoy
   - Time: Ahora
   - Distance: 1 km
   - Duration: 5 minutos
   - Name: "Prueba BeRun"
4. **Save**

### Paso 3: Esperar el Webhook (5 minutos)

Después de guardar en Strava:

1. **Espera 1-5 minutos** (Strava tarda en enviar el webhook)

2. **Verifica los logs del webhook:**
   - Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions/strava-webhook/logs
   - Busca mensajes recientes (últimos 5 minutos)

3. **¿Qué debes ver en los logs?**
   ```
   ✅ "🔔 Strava webhook event received"
   ✅ "✅ Found connection for user"
   ✅ "✅ Activity details fetched"
   ✅ "✅ Activity saved to published_activities_simple"
   ✅ "✅ Activity saved to workouts_simple"
   ```

4. **Si NO ves estos logs:**
   - El webhook no se disparó
   - Verifica que el webhook esté configurado (ver abajo)

### Paso 4: Verificar que se Guardó

Ejecuta en SQL Editor:
```sql
-- Ver si llegó la actividad
SELECT 
  title,
  distance,
  duration,
  imported_from_strava,
  created_at
FROM published_activities_simple
WHERE imported_from_strava = TRUE
ORDER BY created_at DESC
LIMIT 5;
```

**Resultado esperado:**
- ✅ Debe aparecer "Prueba BeRun" con 1 km
- ❌ Si sigue en 0 → Problema con el webhook

---

## 🔧 Si el Webhook NO se Dispara

### Verificar Configuración del Webhook

1. **Verificar que existe:**
   ```bash
   curl -G https://www.strava.com/api/v3/push_subscriptions \
     -d client_id=186314 \
     -d client_secret=fa541a582f6dde856651e09cb546598865b000b15
   ```

2. **Debería devolver:**
   ```json
   [
     {
       "id": 316308,
       "application_id": 186314,
       "callback_url": "https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/strava-webhook",
       "created_at": "...",
       "updated_at": "..."
     }
   ]
   ```

3. **Si devuelve `[]` (vacío):**
   - El webhook NO está configurado
   - Ejecutar: `scripts/configure-strava-webhook.sh`

### Reconfigurar Webhook (si es necesario)

```bash
cd /Users/nachoamigo/stride-seeker-journey
bash scripts/configure-strava-webhook.sh
```

O manualmente:
```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=186314 \
  -F client_secret=fa541a582f6dde856651e09cb546598865b000b15 \
  -F callback_url=https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/strava-webhook \
  -F verify_token=berun_webhook_verify_2024
```

---

## 🎯 Checklist de Troubleshooting

- [ ] **Strava conectado en la app** (Settings → Connect Strava → Success)
- [ ] **Hay una fila en `strava_connections`** (ejecutar SELECT)
- [ ] **Webhook configurado en Strava** (ejecutar curl para verificar)
- [ ] **Edge Function desplegada** (verificar en Supabase Dashboard)
- [ ] **Actividad creada en Strava** (tipo: Run, no Walk/Ride)
- [ ] **Esperado 5 minutos** (webhook puede tardar)
- [ ] **Logs del webhook revisados** (buscar errores)
- [ ] **Actividad aparece en `published_activities_simple`** (ejecutar SELECT)

---

## 🐛 Errores Comunes en Logs

### Error 1: "No connection found for Strava athlete"
**Causa:** El `strava_user_id` no coincide  
**Solución:** Desconectar y reconectar Strava en la app

### Error 2: "Skipping non-running activity"
**Causa:** La actividad NO es de tipo "Run"  
**Solución:** Crear actividad con Sport/Type = Running

### Error 3: "Activity already imported"
**Causa:** La actividad ya existe (no es error)  
**Solución:** Crear una nueva actividad

### Error 4: "No user profile found"
**Causa:** No existe `user_profiles` para el usuario  
**Solución:** Completar onboarding en la app

---

## 📱 Flujo Completo Esperado

```
1. Usuario conecta Strava en la app
   ↓ (guarda en strava_connections)
   
2. Usuario crea actividad en Strava
   ↓ (tipo: Run)
   
3. Strava envía webhook (1-5 min)
   ↓ (POST a /functions/v1/strava-webhook)
   
4. Webhook procesa
   ↓ (busca conexión, obtiene datos)
   
5. Guarda en published_activities_simple
   ↓ (con user_id, imported_from_strava=true)
   
6. Guarda en workouts_simple
   ↓ (para estadísticas)
   
7. App detecta (auto-refresh 30s)
   ↓ (carga actividades)
   
8. ✅ Actividad visible en la app
```

---

## 🚀 Acción Inmediata

1. **Ejecuta:** `VERIFICACION_COMPLETA_STRAVA.sql` para ver el estado
2. **Si hay 0 actividades:** Crea una actividad manual en Strava (Paso 2 arriba)
3. **Espera 5 minutos**
4. **Verifica logs del webhook**
5. **Ejecuta SELECT** para ver si llegó
6. **Abre la app** y espera 30 segundos

---

**Si después de estos pasos sigue sin funcionar, copia y pega los logs del webhook aquí para diagnosticar el error exacto.**


