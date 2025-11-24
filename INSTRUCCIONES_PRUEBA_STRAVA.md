# 🚀 Instrucciones para Probar la Conexión de Strava

## ✅ Estado Actual

- ✅ Edge Functions desplegadas y activas
- ✅ JWT Verification desactivado
- ✅ Tabla `strava_connections` existe
- ✅ Acceso revocado en Strava (contador en 0)
- ✅ **LISTO PARA PROBAR**

---

## 📱 Pasos para Probar desde la App

### 1. Abre la App BeRun

Si Xcode está abierto con el proyecto:
- Presiona **▶️ Play** o **Cmd+R** para ejecutar la app
- Espera a que la app se compile e instale

Si Xcode no está abierto:
```bash
open /Users/nachoamigo/stride-seeker-journey/ios/App/App.xcworkspace
```

### 2. Navega a la Sección de Integraciones

En la app:
1. Toca el icono de **Perfil** (abajo a la derecha)
2. Busca la sección **"Integraciones"** o **"Strava"**
3. Deberías ver un botón **"Conectar Strava"** o similar

### 3. Inicia la Conexión

1. Toca **"Conectar Strava"**
2. Se abrirá una ventana del navegador con Strava
3. Verás la página de autorización de Strava

### 4. Autoriza la Aplicación

En la ventana de Strava:
1. Revisa los permisos solicitados:
   - Leer datos de actividades
   - Ver actividades privadas
2. Toca **"Authorize"** (Autorizar)
3. La ventana debería cerrarse automáticamente
4. Verás un mensaje: "✅ ¡Conectado con éxito!"

### 5. Verifica la Conexión

En la app BeRun:
- Deberías ver **"✅ Conectado"** en verde
- O un indicador de que Strava está conectado

---

## 🔍 Verificar que se Guardó en Supabase

### Opción 1: Desde el Dashboard

1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/editor
2. Busca la tabla **`strava_connections`**
3. Deberías ver **1 fila nueva** con:
   - `user_auth_id`: Tu ID de usuario
   - `strava_user_id`: Tu ID de Strava
   - `access_token`: Token de acceso (cifrado)
   - `refresh_token`: Token de refresco
   - `athlete_name`: Tu nombre en Strava
   - `created_at`: Fecha/hora de la conexión

### Opción 2: Desde Terminal (Monitoreo en Tiempo Real)

En una nueva terminal, ejecuta:

```bash
cd /Users/nachoamigo/stride-seeker-journey
./scripts/monitor-strava-connection.sh
```

Este script monitoreará la tabla cada 3 segundos y te avisará cuando detecte una nueva conexión.

---

## 📊 Qué Esperar en los Logs

### Logs de Xcode (Consola de la App)

Deberías ver mensajes como:

```
🔗 Connecting to Strava for user: [tu-user-id]
Strava Connect URL: https://www.strava.com/oauth/authorize?client_id=186314&...
```

### Logs de Supabase Edge Function

1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions
2. Haz clic en **`strava-auth`**
3. Ve a la pestaña **"Logs"**
4. Deberías ver logs como:

```
🚀 Strava OAuth callback initiated
📥 OAuth parameters: code: present, state: present
🔄 Exchanging code for tokens...
✅ Tokens received from Strava
💾 Saving connection to database...
✅ Connection saved successfully
```

---

## ⚠️ Posibles Problemas y Soluciones

### Error 403: Límite de deportistas alcanzado

**Causa:** Aún hay una conexión activa en Strava

**Solución:**
1. Ve a: https://www.strava.com/settings/apps
2. Busca "BeRun" y revoca el acceso
3. Espera 1-2 minutos
4. Intenta conectar de nuevo

### Error 401: Unauthorized

**Causa:** Variables de entorno no configuradas

**Solución:**
1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions
2. Verifica que existan:
   - `STRAVA_CLIENT_ID`
   - `STRAVA_CLIENT_SECRET`
   - `STRAVA_WEBHOOK_VERIFY_TOKEN`

### La ventana no se cierra automáticamente

**Causa:** Normal en algunos navegadores

**Solución:**
- Cierra la ventana manualmente
- Vuelve a la app
- La conexión debería estar guardada

### No aparece el botón "Conectar Strava"

**Causa:** La UI puede estar en otro lugar

**Solución:**
- Revisa en Perfil > Configuración
- O busca "Integraciones" en la app

---

## 🧪 Probar Sincronización de Actividades

Una vez conectado, puedes probar la sincronización:

### Opción 1: Importar Actividad Existente (Manual)

1. En la app, busca el botón **"Importar desde Strava"**
2. Selecciona una actividad reciente
3. Verifica que aparezca en tus actividades

### Opción 2: Correr con Strava (Webhook Automático)

**Nota:** Requiere configurar el webhook primero

1. Abre Strava en tu móvil
2. Inicia una actividad de carrera
3. Completa la carrera
4. Guarda la actividad
5. Espera 1-2 minutos
6. Abre BeRun y verifica que la actividad aparezca automáticamente

---

## 📞 Si Necesitas Ayuda

### Ver Logs de la App

En Xcode:
- Ve a la pestaña **Console** (abajo)
- Busca mensajes que contengan "Strava" o "Error"

### Ver Logs de Edge Functions

https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions

### Ejecutar Scripts de Verificación

```bash
# Verificar estado general
./scripts/verify-strava-setup.sh

# Verificar Edge Functions
./scripts/test-edge-functions.sh

# Ver estado de conexiones
./scripts/check-strava-connections.sh

# Monitorear conexión en tiempo real
./scripts/monitor-strava-connection.sh
```

---

## ✅ Checklist de Verificación

Antes de probar:

- [x] Edge Functions desplegadas
- [x] JWT Verification desactivado
- [ ] Variables de entorno configuradas en Supabase
- [x] Acceso revocado en Strava
- [x] Contador de Strava en 0
- [ ] App compilada y corriendo

Después de conectar:

- [ ] Ventana de Strava se cerró automáticamente
- [ ] Mensaje de éxito visible
- [ ] Estado "Conectado" en la app
- [ ] Fila nueva en tabla `strava_connections`
- [ ] Logs sin errores en Supabase

---

## 🎯 Resultado Esperado

Si todo funciona correctamente:

1. ✅ La autorización de Strava se completa
2. ✅ La ventana se cierra automáticamente
3. ✅ Ves "✅ Conectado" en la app
4. ✅ Hay una fila en `strava_connections`
5. ✅ Puedes importar actividades desde Strava

---

## 🔗 Enlaces Útiles

- **Supabase Dashboard:** https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv
- **Supabase Functions:** https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions
- **Supabase Editor:** https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/editor
- **Strava Apps:** https://www.strava.com/settings/apps
- **Strava API:** https://www.strava.com/settings/api

---

## 🚀 ¡Adelante!

Todo está listo para probar. Abre la app y conecta tu cuenta de Strava siguiendo los pasos de arriba.

¡Buena suerte! 🎉

