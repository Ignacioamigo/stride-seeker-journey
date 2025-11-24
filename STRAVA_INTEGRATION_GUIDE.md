# 🏃 Guía de Integración de Strava - BeRun

## 📋 Resumen

Esta guía te ayudará a configurar la integración completa de Strava con BeRun, permitiendo que las actividades se sincronicen automáticamente y se completen los entrenamientos del plan.

---

## ✅ Credenciales de Strava

Según tu captura de pantalla:

```
Client ID: 186314
Client Secret: fa541a582f6dde856651e09cb546598865b000b15
```

---

## 🔧 Paso 1: Aplicar migración de base de datos

Ejecuta la migración SQL en Supabase:

```bash
# Opción 1: Desde Supabase Dashboard
# 1. Ve a SQL Editor en Supabase
# 2. Copia el contenido de supabase/migrations/create_strava_connections.sql
# 3. Ejecuta el SQL

# Opción 2: Desde CLI (si tienes Supabase CLI instalado)
supabase db push
```

Esto creará:
- Tabla `strava_connections` con RLS
- Columna `strava_activity_id` en `published_activities_simple`
- Índices para búsquedas rápidas

---

## 🚀 Paso 2: Desplegar Edge Functions

### 2.1 Configurar variables de entorno en Supabase

Ve a: **Project Settings > Edge Functions > Secrets**

Añade estas variables:

```bash
STRAVA_CLIENT_ID=186314
STRAVA_CLIENT_SECRET=fa541a582f6dde856651e09cb546598865b000b15
STRAVA_WEBHOOK_VERIFY_TOKEN=berun_webhook_verify_2024
```

### 2.2 Desplegar las funciones

```bash
# Navegar a la carpeta del proyecto
cd /Users/nachoamigo/stride-seeker-journey

# Desplegar strava-auth
supabase functions deploy strava-auth

# Desplegar strava-webhook
supabase functions deploy strava-webhook
```

Si no tienes Supabase CLI instalado:
```bash
npm install -g supabase
supabase login
```

---

## 🔗 Paso 3: Configurar webhook en Strava

Una vez desplegadas las Edge Functions, ejecuta:

```bash
cd /Users/nachoamigo/stride-seeker-journey
./scripts/configure-strava-webhook.sh
```

Esto creará la subscription del webhook en Strava.

**Importante:** Guarda el `subscription_id` que te devuelva.

### Verificar webhook existente

```bash
curl -G https://www.strava.com/api/v3/push_subscriptions \
  -d client_id=186314 \
  -d client_secret=fa541a582f6dde856651e09cb546598865b000b15
```

### Eliminar webhook (si necesitas recrearlo)

```bash
curl -X DELETE https://www.strava.com/api/v3/push_subscriptions/{SUBSCRIPTION_ID} \
  -F client_id=186314 \
  -F client_secret=fa541a582f6dde856651e09cb546598865b000b15
```

---

## 🧪 Paso 4: Probar la integración

### 4.1 Conectar cuenta de Strava

1. Abre BeRun
2. Ve a **Perfil > Integraciones**
3. Haz clic en **"Conectar"** en la sección de Strava
4. Autoriza la aplicación en Strava
5. Deberías ver "Conectado" en verde

### 4.2 Probar sincronización automática

1. Corre con la app de Strava (en tu teléfono o dispositivo Garmin)
2. Completa la carrera
3. Espera ~1-2 minutos
4. Abre BeRun y ve a **Activities**
5. Deberías ver tu carrera importada automáticamente

### 4.3 Verificar autocompletado de entrenamiento

Si tienes un plan de entrenamiento activo:

1. Verifica que tengas un entrenamiento de tipo "carrera" pendiente en tu plan
2. Corre con Strava en una fecha cercana a ese entrenamiento (máximo 2 días de diferencia)
3. Después de la sincronización, el entrenamiento debería marcarse como completado automáticamente
4. Ve a **Plan** y verifica que aparezca como ✅ completado

---

## 📊 Cómo funciona

### Flujo de conexión OAuth

```
Usuario → Botón "Conectar Strava" 
  ↓
Strava OAuth (autorización)
  ↓
Callback a strava-auth Edge Function
  ↓
Guardar tokens en strava_connections
  ↓
Usuario ve "Conectado"
```

### Flujo de sincronización automática

```
Usuario corre con Strava
  ↓
Strava detecta nueva actividad
  ↓
Strava envía webhook a strava-webhook Edge Function
  ↓
Función verifica que sea carrera (Run)
  ↓
Busca plan activo del usuario
  ↓
Encuentra training_session más cercana por fecha
  ↓
Guarda en published_activities_simple con training_session_id
  ↓
Trigger automático marca training_session como completada
  ↓
Guarda también en workouts_simple (estadísticas)
  ↓
Usuario ve actividad en Activities y entrenamiento completado en Plan
```

---

## 🗄️ Estructura de datos

### strava_connections
```sql
- user_auth_id (UUID) → auth.users.id
- strava_user_id (BIGINT) → ID del atleta en Strava
- access_token (TEXT) → Token de acceso actual
- refresh_token (TEXT) → Token para renovar
- expires_at (BIGINT) → Timestamp de expiración
- athlete_name (TEXT) → Nombre del atleta
- athlete_email (TEXT) → Email del atleta
```

### published_activities_simple (actualizada)
```sql
+ strava_activity_id (BIGINT) → ID de la actividad en Strava (evita duplicados)
```

---

## 🔍 Debugging

### Ver logs de Edge Functions

```bash
# Logs de strava-auth
supabase functions logs strava-auth --tail

# Logs de strava-webhook
supabase functions logs strava-webhook --tail
```

### Verificar conexión en base de datos

```sql
-- Ver conexiones de Strava
SELECT 
  user_auth_id, 
  strava_user_id, 
  athlete_name, 
  created_at 
FROM strava_connections;

-- Ver actividades importadas de Strava
SELECT 
  title, 
  distance, 
  duration, 
  strava_activity_id, 
  training_session_id,
  created_at
FROM published_activities_simple
WHERE strava_activity_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

### Problemas comunes

#### 1. "Webhook verification failed"
- Verifica que `STRAVA_WEBHOOK_VERIFY_TOKEN` esté configurado en Supabase
- Asegúrate que la Edge Function `strava-webhook` esté desplegada

#### 2. "No user found for Strava athlete"
- El usuario debe haber conectado su cuenta primero
- Verifica que `strava_user_id` se guardó correctamente en `strava_connections`

#### 3. "Activity already imported"
- Esto es normal, evita duplicados
- El sistema detecta si la actividad ya existe por `strava_activity_id`

#### 4. "Training session not found"
- El usuario debe tener un plan activo
- El entrenamiento debe ser de tipo "carrera"
- La fecha de la carrera debe estar dentro de ±2 días del entrenamiento planificado

---

## 🎯 Funcionalidades implementadas

✅ OAuth flow completo con Strava
✅ Almacenamiento seguro de tokens con RLS
✅ Refresh automático de tokens expirados
✅ Webhook para sincronización en tiempo real
✅ Filtrado de actividades (solo carreras/Run)
✅ Prevención de duplicados
✅ Importación de GPS points (hasta 1000 puntos)
✅ Auto-completado de training_sessions
✅ Actualización de estadísticas
✅ UI con estado de conexión
✅ Botón de desconexión

---

## 🔐 Seguridad

- ✅ RLS habilitado en `strava_connections`
- ✅ Tokens almacenados de forma segura
- ✅ Service Role Key solo en Edge Functions
- ✅ Verificación de webhook con token secreto
- ✅ Usuarios solo pueden ver sus propias conexiones

---

## 📱 Próximos pasos opcionales

1. **Garmin Connect**: Seguir el mismo patrón para Garmin
2. **Apple Health**: Integración con HealthKit
3. **Backfill manual**: Botón para importar actividades históricas
4. **Configuración avanzada**: Permitir elegir qué sincronizar

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs de las Edge Functions
2. Verifica las variables de entorno
3. Confirma que el webhook está activo en Strava
4. Consulta la sección de Debugging

---

**¡La integración está completa y lista para usar! 🎉**

