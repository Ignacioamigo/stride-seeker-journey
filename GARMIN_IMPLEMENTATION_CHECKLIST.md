# ✅ Checklist de Implementación Garmin Connect

## 🎯 Objetivo

Integrar Garmin Connect con BeRun para que las actividades se sincronicen automáticamente cuando el usuario completa un entrenamiento con su reloj Garmin.

---

## 📦 Archivos Creados

### Base de Datos
- ✅ `supabase/migrations/create_garmin_connections.sql` - Migración de tabla con foreign keys

### Edge Functions
- ✅ `supabase/functions/garmin-auth-start/index.ts` - Inicia OAuth
- ✅ `supabase/functions/garmin-auth-callback/index.ts` - Recibe token OAuth
- ✅ `supabase/functions/garmin-webhook/index.ts` - Recibe actividades
- ✅ `supabase/functions/garmin-deregister/index.ts` - Desconecta cuenta

### UI Components
- ✅ `src/components/garmin/ConnectGarmin.tsx` - Componente principal
- ✅ `src/components/ui/GarminConnectButton.tsx` - Botón de conexión

### Scripts de Deploy/Test
- ✅ `scripts/create-garmin-connections.sh` - Crear tabla
- ✅ `scripts/deploy-garmin-functions.sh` - Desplegar funciones
- ✅ `scripts/test-garmin-integration.sh` - Probar integración

### Documentación
- ✅ `GARMIN_SETUP_GUIDE.md` - Guía completa
- ✅ `GARMIN_IMPLEMENTATION_CHECKLIST.md` - Este archivo

---

## 🚀 Pasos de Implementación

### PASO 1: Crear Tabla en Supabase ✅

**Opción A: SQL Editor (Recomendado)**

1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/editor
2. Copia el contenido de: `supabase/migrations/create_garmin_connections.sql`
3. Pégalo en el SQL Editor
4. Click "Run"

**Opción B: Script**

```bash
./scripts/create-garmin-connections.sh
# Lee las instrucciones que te muestra
```

**Verificar:**

```sql
-- En SQL Editor
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'garmin_connections';

-- Debe mostrar:
-- id, user_auth_id, garmin_user_id, access_token, etc.
```

---

### PASO 2: Desplegar Edge Functions ⏳

```bash
# 1. Login a Supabase (si no lo has hecho)
supabase login

# 2. Desplegar todas las funciones
./scripts/deploy-garmin-functions.sh
```

**Verifica** que se desplegaron:
```bash
./scripts/test-garmin-integration.sh
```

---

### PASO 3: Configurar Variables de Entorno ⚠️

1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions

2. Añade estas variables:

```
GARMIN_CLIENT_ID=b8e7d840-e16b-4db5-84ba-b110a8e7a516
GARMIN_CLIENT_SECRET=nc4ZgcLZP5JD6y/TJIxzDiK2t6XXEVYg31yCFf3jYk0
GARMIN_REDIRECT_URI=https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-auth-callback
```

3. **IMPORTANTE**: Después de añadir las variables, redeploya:

```bash
./scripts/deploy-garmin-functions.sh
```

---

### PASO 4: Configurar Webhook en Garmin ⚠️

1. Ve al Garmin Developer Portal:
   https://connectapi.garmin.com/developer/dashboard

2. Selecciona tu aplicación

3. Ve a "Push Notifications" o "Webhooks"

4. Añade esta URL:
   ```
   https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-webhook
   ```

5. Guarda los cambios

**Nota:** La configuración exacta depende del portal de Garmin. Consulta la documentación oficial si no encuentras esta opción.

---

### PASO 5: Añadir UI a la App 🎨

**Opción A: Añadir en Settings existente**

Edita `src/pages/Settings.tsx`:

```tsx
import { ConnectGarmin } from '@/components/garmin/ConnectGarmin';

// Dentro del render, después de ConnectStrava:
<ConnectGarmin />
```

**Opción B: Crear pantalla dedicada**

Crea `src/pages/Integrations.tsx` y añade ambos componentes (Strava y Garmin).

---

### PASO 6: Testing Completo 🧪

#### Test 1: Infraestructura

```bash
./scripts/test-garmin-integration.sh
```

Debe mostrar: `✅ Todos los tests pasaron!`

#### Test 2: OAuth Flow

1. Abre la app
2. Ve a Settings
3. Click en "Connect with Garmin"
4. Completa la autorización en Garmin Connect
5. Verifica que aparezca "Conectado como [tu nombre]"

#### Test 3: Sincronización de Actividades

**Opción A: Actividad real**
1. Sal a correr con tu Garmin
2. Sincroniza con Garmin Connect
3. Espera 1-2 minutos
4. Abre BeRun → "Mis actividades"
5. Verifica que aparezca la actividad

**Opción B: Backfill (actividades pasadas)**
```bash
# Usa Postman o curl
POST https://apis.garmin.com/wellness-api/rest/backfill/activityDetails
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json

{
  "summaryStartTimeInSeconds": 1704067200,  # Fecha inicio
  "summaryEndTimeInSeconds": 1735689600     # Fecha fin
}
```

#### Test 4: Auto-completado de Entrenamientos

1. Crea un plan de entrenamiento con un workout para hoy
2. Completa una actividad que coincida (tipo y distancia similar)
3. Verifica que el workout se marque como completado automáticamente

#### Test 5: Desconexión

1. En Settings, click "Desconectar Garmin"
2. Verifica que desaparezca la conexión
3. Reconecta para verificar que funciona

---

## 🔍 Debugging

### Ver logs en tiempo real

```bash
# Webhook (actividades)
supabase functions logs garmin-webhook --project-ref uprohtkbghujvjwjnqyv

# OAuth callback
supabase functions logs garmin-auth-callback --project-ref uprohtkbghujvjwjnqyv
```

### Consultas SQL útiles

```sql
-- Ver conexiones de Garmin
SELECT 
  user_auth_id,
  garmin_user_id,
  athlete_name,
  created_at
FROM garmin_connections;

-- Ver actividades importadas de Garmin
SELECT 
  id,
  title,
  distance,
  duration,
  garmin_activity_id,
  activity_date
FROM published_activities_simple
WHERE imported_from_garmin = true
ORDER BY activity_date DESC
LIMIT 10;

-- Ver entrenamientos auto-completados
SELECT 
  id,
  workout_title,
  distance_km,
  actual_distance_km,
  completed,
  completed_at
FROM simple_workouts
WHERE completed = true
  AND actual_distance_km IS NOT NULL
ORDER BY completed_at DESC
LIMIT 10;
```

### Errores comunes

#### Error: "Invalid access token"
- **Causa**: Token expirado o credenciales incorrectas
- **Solución**: Verifica las variables de entorno en Supabase

#### Error: "User not found"
- **Causa**: Foreign key no coincide
- **Solución**: Verifica que `user_auth_id` sea el del usuario autenticado

#### Actividades no se importan
- **Causa**: Webhook no configurado o garmin_user_id no coincide
- **Solución**: 
  1. Verifica webhook en Garmin Developer Portal
  2. Verifica logs: `supabase functions logs garmin-webhook`
  3. Verifica que `garmin_user_id` coincida

#### Entrenamientos no se marcan como completados
- **Causa**: No hay plan activo o la actividad no coincide
- **Solución**: 
  1. Verifica que el usuario tenga un plan activo
  2. Verifica que el tipo y distancia coincidan (±10%)

---

## 📊 Checklist Final

### Infraestructura
- [ ] Tabla `garmin_connections` creada
- [ ] Columnas `garmin_activity_id` e `imported_from_garmin` añadidas
- [ ] RLS policies configuradas correctamente

### Edge Functions
- [ ] `garmin-auth-start` desplegada
- [ ] `garmin-auth-callback` desplegada
- [ ] `garmin-webhook` desplegada
- [ ] `garmin-deregister` desplegada
- [ ] Variables de entorno configuradas

### Garmin Developer Portal
- [ ] Aplicación creada
- [ ] Credenciales obtenidas (Client ID y Secret)
- [ ] Redirect URI configurado
- [ ] Webhook configurado

### UI
- [ ] Componente `ConnectGarmin` añadido
- [ ] Botón visible en Settings
- [ ] Diseño consistente con Strava

### Testing
- [ ] Script de test pasa (5/5)
- [ ] OAuth flow funciona
- [ ] Actividades se importan automáticamente
- [ ] Entrenamientos se auto-completan
- [ ] Desconexión funciona

---

## 🎉 ¡Listo!

Una vez completado el checklist, la integración de Garmin estará 100% funcional.

**Próximas mejoras opcionales:**
1. Backfill de actividades históricas
2. Obtener GPS points detallados
3. Integrar datos de salud (Health API)
4. Botón de sincronización manual
5. Notificaciones push cuando se importa actividad

---

**Fecha de creación:** Diciembre 2025  
**Última actualización:** Diciembre 2025  
**Estado:** ✅ Listo para implementar




