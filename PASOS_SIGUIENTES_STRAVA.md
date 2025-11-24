# 🎯 Pasos Siguientes - Configuración de Strava

## ✅ Lo que ya está hecho

He configurado completamente la integración de Strava desde cero:

1. ✅ **Tabla `strava_connections`** creada con RLS y políticas de seguridad
2. ✅ **Edge Function `strava-auth`** para OAuth callback
3. ✅ **Edge Function `strava-webhook`** para recibir actividades automáticamente
4. ✅ **UI actualizada** en Settings con botón de conexión/desconexión
5. ✅ **Script de configuración** del webhook listo
6. ✅ **Documentación completa** de la integración

---

## 📝 Lo que TÚ debes hacer ahora

### Paso 1: Aplicar la migración SQL ⏱️ ~2 minutos

1. Ve a tu **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecciona tu proyecto `uprohtkbghujvjwjnqyv`
3. Ve a **SQL Editor** (icono de base de datos en el menú izquierdo)
4. Haz clic en **"+ New query"**
5. Copia TODO el contenido de este archivo:
   ```
   supabase/migrations/create_strava_connections.sql
   ```
6. Pega el contenido en el editor SQL
7. Haz clic en **"Run"** (botón verde abajo a la derecha)
8. Deberías ver: **"Success. No rows returned"**

✅ Esto creará la tabla `strava_connections` y añadirá la columna `strava_activity_id` a `published_activities_simple`.

---

### Paso 2: Configurar variables de entorno ⏱️ ~3 minutos

1. En tu Supabase Dashboard, ve a **Project Settings** (icono de engranaje)
2. En el menú izquierdo, haz clic en **Edge Functions**
3. Haz clic en la pestaña **"Secrets"** o **"Environment Variables"**
4. Añade estas 3 variables (botón **"Add secret"** o **"New secret"**):

```
STRAVA_CLIENT_ID
186314

STRAVA_CLIENT_SECRET
fa541a582f6dde856651e09cb546598865b000b15

STRAVA_WEBHOOK_VERIFY_TOKEN
berun_webhook_verify_2024
```

**Importante:** Asegúrate de que:
- Los nombres estén exactamente como aparecen (sin espacios)
- Los valores se copien completos (sin espacios al inicio/final)
- Haz clic en **"Save"** o **"Add"** después de cada variable

---

### Paso 3: Desplegar las Edge Functions ⏱️ ~5 minutos

#### Opción A: Usar Supabase CLI (Recomendado)

1. Si no tienes Supabase CLI instalado:
   ```bash
   npm install -g supabase
   ```

2. Iniciar sesión:
   ```bash
   supabase login
   ```

3. Navegar a tu proyecto:
   ```bash
   cd /Users/nachoamigo/stride-seeker-journey
   ```

4. Vincular el proyecto:
   ```bash
   supabase link --project-ref uprohtkbghujvjwjnqyv
   ```

5. Desplegar las funciones:
   ```bash
   supabase functions deploy strava-auth
   supabase functions deploy strava-webhook
   ```

#### Opción B: Desde el Dashboard (Si CLI no funciona)

1. Ve a **Edge Functions** en tu Supabase Dashboard
2. Haz clic en **"Deploy a new function"**
3. Sube manualmente cada función:
   - **Función 1**: `strava-auth`
     - Archivo: `supabase/functions/strava-auth/index.ts`
   - **Función 2**: `strava-webhook`
     - Archivo: `supabase/functions/strava-webhook/index.ts`

---

### Paso 4: Configurar el webhook en Strava ⏱️ ~2 minutos

Una vez que las Edge Functions estén desplegadas:

1. Abre tu terminal
2. Navega al proyecto:
   ```bash
   cd /Users/nachoamigo/stride-seeker-journey
   ```

3. Ejecuta el script:
   ```bash
   ./scripts/configure-strava-webhook.sh
   ```

4. Si todo va bien, verás:
   ```
   ✅ Webhook configurado exitosamente!
      Subscription ID: XXXXXX
   ```

5. **GUARDA EL SUBSCRIPTION ID** para referencia futura

**Si hay error:**
- Verifica que las Edge Functions estén desplegadas
- Verifica que las variables de entorno estén configuradas
- Espera 1-2 minutos y vuelve a intentar

---

### Paso 5: Probar la integración ⏱️ ~5 minutos

#### 5.1 Conectar tu cuenta de Strava

1. Abre la app BeRun
2. Ve a **Perfil** (icono de usuario)
3. Haz clic en **"Integraciones"**
4. En la sección de Strava, haz clic en **"Conectar"**
5. Se abrirá una ventana de Strava
6. Haz clic en **"Authorize"** (Autorizar)
7. La ventana se cerrará automáticamente
8. Deberías ver "✅ Conectado" en verde

#### 5.2 Probar sincronización automática

**Opción 1: Con actividad real (recomendado)**
1. Abre la app de Strava en tu teléfono
2. Registra una carrera (puede ser corta, 5-10 minutos)
3. Completa y guarda la actividad
4. Espera 1-2 minutos
5. Abre BeRun → Ve a **Activities**
6. Deberías ver tu carrera importada automáticamente

**Opción 2: Ver logs para debugging**
```bash
# Si usas Supabase CLI
supabase functions logs strava-webhook --tail
```

#### 5.3 Verificar autocompletado de entrenamiento

1. Asegúrate de tener un plan de entrenamiento activo
2. Verifica que tengas un entrenamiento de tipo "carrera" pendiente
3. Corre con Strava en una fecha cercana (máximo ±2 días)
4. Después de la sincronización, ve a **Plan**
5. El entrenamiento debería aparecer como ✅ completado

---

## 🔍 Cómo verificar que todo funciona

### En Supabase (SQL Editor):

```sql
-- Ver tus conexiones de Strava
SELECT * FROM strava_connections;

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
ORDER BY created_at DESC;

-- Ver training_sessions completadas automáticamente
SELECT 
  ts.title,
  ts.completed,
  ts.actual_distance,
  ts.actual_duration,
  ts.completion_date
FROM training_sessions ts
WHERE ts.completed = true
  AND ts.actual_distance IS NOT NULL
ORDER BY ts.completion_date DESC;
```

---

## 📊 Resumen de la integración

### Flujo completo:

```
1. Usuario conecta Strava (OAuth)
   ↓
2. Tokens guardados en strava_connections
   ↓
3. Usuario corre con app Strava
   ↓
4. Strava detecta nueva actividad
   ↓
5. Strava envía webhook a tu Edge Function
   ↓
6. Edge Function:
   - Verifica que sea carrera (Run)
   - Busca plan activo del usuario
   - Encuentra training_session más cercana
   - Guarda en published_activities_simple (con strava_activity_id)
   - Vincula con training_session_id
   ↓
7. Trigger automático marca training_session como completada
   ↓
8. También guarda en workouts_simple (estadísticas)
   ↓
9. Usuario ve:
   - Actividad en Activities
   - Entrenamiento completado en Plan
   - Estadísticas actualizadas
```

---

## 🆘 Problemas comunes

### "No se pudo conectar con Strava"
- ✅ Verifica que las Edge Functions estén desplegadas
- ✅ Verifica que las variables de entorno estén configuradas
- ✅ Verifica que el Client ID sea correcto: `186314`

### "Webhook verification failed"
- ✅ Verifica que `STRAVA_WEBHOOK_VERIFY_TOKEN` esté en Supabase
- ✅ Verifica que la función `strava-webhook` esté desplegada
- ✅ Espera 1-2 minutos y ejecuta el script de nuevo

### "Activity not showing in BeRun"
- ✅ Verifica que la actividad sea de tipo "Run" en Strava
- ✅ Verifica que el webhook esté activo (ejecuta el script de verificación)
- ✅ Revisa los logs de `strava-webhook` para ver errores

### "Training session not auto-completed"
- ✅ Verifica que tengas un plan activo
- ✅ Verifica que el entrenamiento sea de tipo "carrera"
- ✅ Verifica que la fecha de la carrera esté cerca del entrenamiento (±2 días)

---

## 📚 Documentación adicional

- **Guía completa**: `STRAVA_INTEGRATION_GUIDE.md`
- **Base de datos**: `INFORMACION_BASES_DATOS.md` (sección strava_connections)
- **Migración SQL**: `supabase/migrations/create_strava_connections.sql`
- **Edge Functions**:
  - `supabase/functions/strava-auth/index.ts`
  - `supabase/functions/strava-webhook/index.ts`

---

## 🎉 ¡Listo!

Una vez completados estos pasos, la integración estará 100% funcional:

✅ Conexión OAuth con Strava
✅ Sincronización automática de actividades
✅ Auto-completado de entrenamientos del plan
✅ Actualización de estadísticas
✅ Prevención de duplicados
✅ Importación de GPS points

**¡Tu app ahora se sincroniza automáticamente con Strava!** 🚀

