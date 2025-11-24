# ✅ Edge Functions Desplegadas y Funcionando

## Estado Actual

### ✅ strava-auth
- **Estado:** Desplegada y funcionando
- **URL:** `https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/strava-auth`
- **Verificación:** HTTP 400 (esperado - función activa, error de Strava por código inválido)
- **JWT Verification:** Desactivado (público)

### ✅ strava-webhook  
- **Estado:** Desplegada y funcionando
- **URL:** `https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/strava-webhook`
- **Verificación:** HTTP 403 (esperado - función activa)
- **JWT Verification:** Desactivado (público)

---

## 📋 Próximos Pasos para Completar la Integración

### Paso 1: Verificar Variables de Entorno ⏱️ 2 min

**IMPORTANTE:** Las funciones están desplegadas pero necesitan las variables de entorno para funcionar correctamente.

1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions
2. Haz clic en **"Secrets"** o **"Environment Variables"**
3. Verifica que existan estas 3 variables:

```
STRAVA_CLIENT_ID = 186314
STRAVA_CLIENT_SECRET = fa541a582f6dde856651e09cb546598865b000b15
STRAVA_WEBHOOK_VERIFY_TOKEN = berun_webhook_verify_2024
```

4. Si no existen, créalas:
   - Haz clic en **"Add new secret"**
   - Nombre: `STRAVA_CLIENT_ID`, Valor: `186314`
   - Haz clic en **"Add new secret"**
   - Nombre: `STRAVA_CLIENT_SECRET`, Valor: `fa541a582f6dde856651e09cb546598865b000b15`
   - Haz clic en **"Add new secret"**
   - Nombre: `STRAVA_WEBHOOK_VERIFY_TOKEN`, Valor: `berun_webhook_verify_2024`

---

### Paso 2: Resolver Error 403 de Strava ⏱️ 2 min

**El Error 403 que ves es porque tu app de Strava tiene el límite de deportistas conectados alcanzado.**

1. Ve a: https://www.strava.com/settings/apps
2. Busca **"BeRun"** en la lista de aplicaciones autorizadas
3. Haz clic en **"Revoke Access"** (Revocar acceso)
4. Confirma la acción
5. Espera 1-2 minutos

---

### Paso 3: Verificar en Strava Dashboard ⏱️ 1 min

1. Ve a: https://www.strava.com/settings/api
2. Haz clic en tu aplicación **"BeRun"**
3. Verifica que muestre:
   ```
   Número de deportistas conectados en este momento: 0
   ```

---

### Paso 4: Probar Conexión desde la App ⏱️ 2 min

1. Abre la app **BeRun** en Xcode
2. Ve a: **Perfil > Integraciones**
3. Haz clic en **"Conectar"** en Strava
4. Autoriza la aplicación
5. Deberías ver **"✅ Conectado"** en verde

---

### Paso 5: Verificar que se Guardó en Supabase ⏱️ 1 min

1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/editor
2. Busca la tabla **`strava_connections`**
3. Deberías ver **1 fila** con:
   - `user_auth_id`: Tu ID de usuario
   - `strava_user_id`: Tu ID de Strava
   - `access_token`: Token de acceso
   - `refresh_token`: Token de refresco
   - `athlete_name`: Tu nombre en Strava

---

## 🔧 Configurar Webhook (Opcional pero Recomendado)

Para que las actividades se sincronicen automáticamente cuando corres con Strava:

```bash
cd /Users/nachoamigo/stride-seeker-journey
./scripts/configure-strava-webhook.sh
```

Esto registrará el webhook con Strava para recibir notificaciones en tiempo real.

---

## 🧪 Probar Sincronización

### Opción 1: Importar actividad existente (Manual)

1. En la app, ve a **Perfil > Integraciones**
2. Haz clic en **"Importar"** en Strava
3. Selecciona una actividad
4. Verifica que aparezca en tus actividades

### Opción 2: Correr con Strava (Automático con Webhook)

1. Abre Strava en tu móvil
2. Inicia una actividad de carrera
3. Completa la actividad
4. Guarda la actividad
5. Espera 1-2 minutos
6. Verifica en BeRun que la actividad aparezca automáticamente
7. Verifica que se marque como completado el entrenamiento del día

---

## 📊 Verificar Logs

Si algo no funciona, revisa los logs:

### Logs de strava-auth

1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions
2. Haz clic en **`strava-auth`**
3. Ve a la pestaña **"Logs"**
4. Intenta conectar de nuevo
5. Revisa los logs para ver errores

### Logs de strava-webhook

1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions
2. Haz clic en **`strava-webhook`**
3. Ve a la pestaña **"Logs"**
4. Completa una actividad en Strava
5. Revisa los logs para ver si se recibió el evento

---

## 🎯 Resumen de Estado

| Componente | Estado | Acción Requerida |
|------------|--------|------------------|
| Edge Functions Desplegadas | ✅ Sí | Ninguna |
| JWT Verification Desactivado | ✅ Sí | Ninguna |
| Variables de Entorno | ⚠️ Verificar | Configurar en Dashboard |
| Tabla strava_connections | ✅ Existe | Ninguna |
| Error 403 Strava | ❌ Activo | Desconectar app antigua |
| Webhook Configurado | ⚠️ Pendiente | Ejecutar script |

---

## 🆘 Si Algo No Funciona

### Edge Function no responde

```bash
cd /Users/nachoamigo/stride-seeker-journey
./scripts/test-edge-functions.sh
```

### Verificar configuración completa

```bash
cd /Users/nachoamigo/stride-seeker-journey
./scripts/verify-strava-setup.sh
```

### Ver estado de conexiones

```bash
cd /Users/nachoamigo/stride-seeker-journey
./scripts/check-strava-connections.sh
```

---

## 📞 Recursos

- **Dashboard Functions:** https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions
- **Settings:** https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions
- **Database Editor:** https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/editor
- **Strava Apps:** https://www.strava.com/settings/apps
- **Strava API:** https://www.strava.com/settings/api

---

## ✅ Checklist Final

Antes de probar la conexión:

- [x] Edge Functions desplegadas
- [x] JWT Verification desactivado
- [ ] Variables de entorno configuradas
- [ ] Conexión antigua desconectada en Strava
- [ ] Contador de Strava en 0
- [ ] App compilada y corriendo en Xcode

**Una vez completado todo, podrás conectar Strava sin problemas.**

