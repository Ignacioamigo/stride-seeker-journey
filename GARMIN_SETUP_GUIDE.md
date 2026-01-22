# 🏃 Guía Completa de Integración Garmin - BeRun

## 📋 Resumen

Esta guía describe la configuración **COMPLETA** de la integración de Garmin Connect con BeRun. Esta configuración permite:

- ✅ Conectar cuenta de Garmin desde la app
- ✅ Importar actividades automáticamente vía webhook
- ✅ Mostrar actividades en "Mis actividades"
- ✅ Actualizar estadísticas automáticamente
- ✅ Auto-completar entrenamientos del plan
- ✅ Sincronizar cuando el usuario sube actividades desde su reloj Garmin

---

## 🔑 Credenciales de Garmin

```
Client ID: b8e7d840-e16b-4db5-84ba-b110a8e7a516
Client Secret: nc4ZgcLZP5JD6y/TJIxzDiK2t6XXEVYg31yCFf3jYk0
Redirect URI: https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-auth-callback
Webhook URI: https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-webhook
```

---

## 🏗️ Arquitectura del Sistema

### 1. Tablas de Base de Datos

#### `garmin_connections`
```sql
- id (UUID) - Primary Key
- user_auth_id (UUID) - Foreign Key → auth.users(id) ✅
- garmin_user_id (TEXT) - Garmin API User ID (UNIQUE)
- access_token (TEXT) - OAuth access token
- refresh_token (TEXT) - OAuth refresh token (nullable)
- token_expires_at (TIMESTAMPTZ) - Token expiration (nullable)
- athlete_name (TEXT) - User's name
- athlete_email (TEXT) - User's email
- created_at, updated_at (TIMESTAMP)
```

**Constraints clave:**
- `user_auth_id` es UNIQUE - un usuario solo puede tener una conexión Garmin
- `garmin_user_id` es UNIQUE - una cuenta Garmin solo puede conectarse a un usuario
- `ON DELETE CASCADE` - si se borra el usuario, se borra la conexión

#### Columnas añadidas a `published_activities_simple`
```sql
- garmin_activity_id (BIGINT) - UNIQUE, ID de Garmin
- imported_from_garmin (BOOLEAN) - Flag para saber el origen
```

---

## 📦 PASO 1: Crear Tabla en Supabase

### Opción A: Desde el SQL Editor (Recomendado)

1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/editor
2. Abre el archivo: `supabase/migrations/create_garmin_connections.sql`
3. Copia TODO el contenido
4. Pégalo en el SQL Editor
5. Haz clic en **"Run"**

### Opción B: Desde el script

```bash
./scripts/create-garmin-connections.sh
```

Esto te mostrará las instrucciones para copiar el SQL.

### ✅ Verificar que se creó correctamente

Ejecuta en el SQL Editor:

```sql
-- Verificar tabla
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'garmin_connections';

-- Verificar constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'garmin_connections';

-- Verificar RLS policies
SELECT * FROM pg_policies WHERE tablename = 'garmin_connections';
```

---

## 🚀 PASO 2: Desplegar Edge Functions

### 2.1 Instalar Supabase CLI (si no lo tienes)

```bash
brew install supabase/tap/supabase
```

### 2.2 Login a Supabase

```bash
supabase login
```

### 2.3 Desplegar las 4 funciones

```bash
cd /Users/nachoamigo/stride-seeker-journey

# Función 1: Iniciar OAuth
supabase functions deploy garmin-auth-start --project-ref uprohtkbghujvjwjnqyv

# Función 2: Callback OAuth
supabase functions deploy garmin-auth-callback --project-ref uprohtkbghujvjwjnqyv

# Función 3: Webhook de actividades
supabase functions deploy garmin-webhook --project-ref uprohtkbghujvjwjnqyv

# Función 4: Desconectar Garmin
supabase functions deploy garmin-deregister --project-ref uprohtkbghujvjwjnqyv
```

---

## ⚙️ PASO 3: Configurar Variables de Entorno en Supabase

Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions

Añade estas variables:

```bash
GARMIN_CLIENT_ID=b8e7d840-e16b-4db5-84ba-b110a8e7a516
GARMIN_CLIENT_SECRET=nc4ZgcLZP5JD6y/TJIxzDiK2t6XXEVYg31yCFf3jYk0
GARMIN_REDIRECT_URI=https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-auth-callback
```

⚠️ **IMPORTANTE:** Después de añadir las variables, **redeploya las funciones** para que tomen efecto:

```bash
supabase functions deploy garmin-auth-start --project-ref uprohtkbghujvjwjnqyv --no-verify-jwt
supabase functions deploy garmin-auth-callback --project-ref uprohtkbghujvjwjnqyv --no-verify-jwt
supabase functions deploy garmin-webhook --project-ref uprohtkbghujvjwjnqyv --no-verify-jwt
supabase functions deploy garmin-deregister --project-ref uprohtkbghujvjwjnqyv
```

---

## 🔗 PASO 4: Configurar Webhook en Garmin Developer Portal

### 4.1 Registrar el webhook

Según la documentación de Garmin, necesitas registrar la URL del webhook en el Garmin Developer Portal:

1. Ve a: https://connectapi.garmin.com/developer/dashboard
2. Selecciona tu aplicación
3. Ve a la sección "Push Notifications"
4. Añade la URL del webhook:
   ```
   https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-webhook
   ```

### 4.2 Backfill inicial (opcional)

Garmin permite hacer un "backfill" para obtener actividades históricas:

```bash
# Desde Postman o curl
POST https://apis.garmin.com/wellness-api/rest/backfill/activityDetails
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json

{
  "summaryStartTimeInSeconds": 1640995200,  # Fecha inicio
  "summaryEndTimeInSeconds": 1672531200     # Fecha fin
}
```

---

## 🎨 PASO 5: Añadir UI en la App

### 5.1 Crear componente ConnectGarmin

El componente ya está creado (ver más abajo en este documento).

### 5.2 Añadir botón en Settings

Añade el componente `ConnectGarmin` en la pantalla de configuración:

```tsx
import { ConnectGarmin } from '@/components/garmin/ConnectGarmin';

// En tu Settings.tsx
<ConnectGarmin />
```

---

## 📱 Flujo de Usuario Completo

### 1. Conectar Cuenta

```
Usuario presiona "Conectar Garmin"
    ↓
App llama a garmin-auth-start
    ↓
Se abre navegador con OAuth de Garmin
    ↓
Usuario aprueba permisos
    ↓
Garmin redirige a garmin-auth-callback
    ↓
Se guarda conexión en garmin_connections
    ↓
Usuario vuelve a la app
```

### 2. Sincronización Automática

```
Usuario completa actividad en reloj Garmin
    ↓
Garmin sincroniza con Garmin Connect
    ↓
Garmin envía PUSH notification a garmin-webhook
    ↓
garmin-webhook procesa la actividad
    ↓
Se guarda en published_activities_simple
    ↓
Se verifica si completa un entrenamiento del plan
    ↓
Si coincide: se marca como completado en simple_workouts
    ↓
App muestra actividad en "Mis actividades"
```

### 3. Desconectar

```
Usuario presiona "Desconectar Garmin"
    ↓
App llama a garmin-deregister
    ↓
Se deregistra del API de Garmin
    ↓
Se elimina conexión de garmin_connections
    ↓
Usuario puede reconectar cuando quiera
```

---

## 🔍 Testing y Debugging

### Verificar conexión de un usuario

```sql
SELECT 
  gc.user_auth_id,
  gc.garmin_user_id,
  gc.athlete_name,
  gc.created_at,
  gc.token_expires_at
FROM garmin_connections gc
WHERE user_auth_id = 'tu-user-id';
```

### Ver actividades importadas

```sql
SELECT 
  id,
  title,
  distance,
  duration,
  garmin_activity_id,
  activity_date,
  imported_from_garmin
FROM published_activities_simple
WHERE user_id = 'tu-user-id' 
  AND imported_from_garmin = true
ORDER BY activity_date DESC;
```

### Ver logs de las funciones

```bash
# Ver logs en tiempo real
supabase functions logs garmin-webhook --project-ref uprohtkbghujvjwjnqyv
```

O desde el dashboard:
https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/logs/edge-functions

---

## ⚠️ Diferencias con Strava

### OAuth Flow
- **Strava**: OAuth 2.0 simple con client_secret
- **Garmin**: OAuth 1.0a con signing (más complejo)

### Webhook Format
- **Strava**: Envía solo ID de actividad, hay que hacer fetch
- **Garmin**: Envía summary completo de la actividad

### Token Management
- **Strava**: Tokens expiran cada 6 horas
- **Garmin**: Tokens OAuth 1.0a no expiran

### Activity Types
- **Strava**: Limitados tipos de actividades
- **Garmin**: Más de 100 tipos diferentes de actividades

---

## 📚 Documentación de Referencia

- [Garmin Developer Start Guide](./docs/Garmin%20Developer%20Program_Start_Guide_1.2.pdf)
- [Garmin OAuth2 PKCE Spec](./docs/OAuth2PKCE_2.pdf)
- [Garmin Activity API](./docs/Activity_API-1.2.4.pdf)
- [Garmin Health API](./docs/Health_API_1.2.3.pdf)

---

## 🐛 Troubleshooting

### Error: "Invalid access token"
- Verifica que las credenciales estén correctas en Supabase
- Verifica que el token no haya expirado (aunque Garmin usa OAuth 1.0a sin expiración)

### Error: "User not found"
- Verifica que `user_auth_id` coincida con el usuario autenticado
- Verifica que exista conexión en `garmin_connections`

### Actividades no se importan automáticamente
- Verifica que el webhook esté configurado en Garmin Developer Portal
- Verifica logs de `garmin-webhook`: `supabase functions logs garmin-webhook`
- Verifica que el `garmin_user_id` coincida entre la conexión y el webhook

### Entrenamientos no se marcan como completados
- Verifica que el usuario tenga un plan activo
- Verifica que el tipo de actividad coincida (`workout_type`)
- Verifica que la distancia esté dentro del 10% de tolerancia

---

## ✅ Checklist de Implementación

- [ ] ✅ Tabla `garmin_connections` creada con foreign keys correctas
- [ ] ✅ Columnas `garmin_activity_id` e `imported_from_garmin` añadidas a `published_activities_simple`
- [ ] Edge Functions desplegadas:
  - [ ] `garmin-auth-start`
  - [ ] `garmin-auth-callback`
  - [ ] `garmin-webhook`
  - [ ] `garmin-deregister`
- [ ] Variables de entorno configuradas en Supabase
- [ ] Webhook registrado en Garmin Developer Portal
- [ ] Componente `ConnectGarmin` añadido a la app
- [ ] Testing completo de flujo OAuth
- [ ] Testing de sincronización de actividades
- [ ] Testing de auto-completado de entrenamientos

---

## 🎯 Próximos Pasos

Una vez completada la implementación básica, considera añadir:

1. **Backfill de actividades históricas**: Importar actividades previas del usuario
2. **Detalles de actividad**: Obtener GPS points y métricas adicionales
3. **Health Data**: Integrar datos de salud (HR, sleep, etc) usando Health API
4. **Sincronización manual**: Botón para forzar sincronización
5. **Notificaciones**: Notificar al usuario cuando se importa una actividad

---

**Creado:** Diciembre 2025  
**Última actualización:** Diciembre 2025  
**Estado:** ✅ Listo para implementar







