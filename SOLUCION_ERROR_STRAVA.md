# 🔧 Solución al Error "Authorization Error" de Strava

## ❌ Error Actual

```
{"message":"Authorization Error","errors":[{"resource":"Application","field":"","code":"invalid"}]}
```

Este error ocurre cuando Strava rechaza el intercambio del código de autorización por tokens.

---

## 🔍 Causas Más Comunes

### 1. ❌ Redirect URI no configurado en Strava (MÁS PROBABLE)

**Problema:** El `redirect_uri` que usa tu app no está registrado en Strava.

**Solución:**

1. Ve a: https://www.strava.com/settings/api
2. Haz clic en tu aplicación **"BeRun"**
3. Busca la sección **"Authorization Callback Domain"** o **"Website"**
4. Añade el dominio:
   ```
   uprohtkbghujvjwjnqyv.supabase.co
   ```
5. O el URI completo (si Strava lo permite):
   ```
   https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/strava-auth
   ```
6. **Guarda los cambios**
7. Espera 1-2 minutos para que se actualice
8. Intenta conectar de nuevo

---

### 2. ❌ Variables de Entorno no Configuradas

**Problema:** La Edge Function no tiene acceso a `STRAVA_CLIENT_SECRET`.

**Solución:**

1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions
2. Haz clic en **"Secrets"** o **"Environment Variables"**
3. Verifica que existan estas variables:

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

5. **Guarda cada variable**
6. Espera 1-2 minutos
7. Intenta conectar de nuevo

---

### 3. ❌ Client Secret Incorrecto

**Problema:** El `STRAVA_CLIENT_SECRET` en Supabase no coincide con el de Strava.

**Solución:**

1. Ve a: https://www.strava.com/settings/api
2. Haz clic en **"BeRun"**
3. Busca **"Client Secret"**
4. Haz clic en **"Mostrar"** para ver el secreto actual
5. Compara con el que tienes en Supabase:
   - Supabase: `fa541a582f6dde856651e09cb546598865b000b15`
   - Strava: (debe coincidir exactamente)
6. Si no coincide:
   - Copia el secreto de Strava
   - Actualiza la variable en Supabase
   - Guarda los cambios
7. Intenta conectar de nuevo

---

### 4. ❌ Código de Autorización ya Usado o Expirado

**Problema:** El código de autorización solo se puede usar una vez y expira rápido.

**Solución:**

1. Cierra la ventana de error
2. Intenta conectar de nuevo desde la app
3. Autoriza en Strava
4. La ventana debería cerrarse automáticamente

---

## 🔍 Cómo Verificar el Problema Exacto

### Ver Logs de la Edge Function

1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions
2. Haz clic en **`strava-auth`**
3. Ve a la pestaña **"Logs"**
4. Intenta conectar de nuevo desde la app
5. Revisa los logs inmediatamente después

**Busca estos mensajes:**

- ✅ `🔑 Environment check:` → Verifica qué variables están presentes
- ❌ `❌ Missing environment variables` → Variables no configuradas
- ❌ `❌ Strava token exchange failed:` → Error de Strava (ver mensaje específico)

---

## ✅ Checklist de Verificación

Antes de intentar conectar de nuevo, verifica:

- [ ] **Redirect URI configurado en Strava**
  - Ve a: https://www.strava.com/settings/api
  - Verifica que el dominio esté añadido

- [ ] **Variables de entorno configuradas en Supabase**
  - Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions
  - Verifica las 3 variables mencionadas

- [ ] **Client Secret coincide**
  - Compara el secreto en Strava con el de Supabase
  - Deben ser idénticos

- [ ] **Edge Function desplegada**
  - Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions
  - Verifica que `strava-auth` esté desplegada

---

## 🚀 Pasos para Solucionar (En Orden)

### Paso 1: Configurar Redirect URI en Strava (CRÍTICO)

1. Ve a: https://www.strava.com/settings/api
2. Haz clic en **"BeRun"**
3. Busca **"Authorization Callback Domain"** o **"Website"**
4. Añade: `uprohtkbghujvjwjnqyv.supabase.co`
5. Guarda

### Paso 2: Verificar Variables de Entorno

1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions
2. Verifica las 3 variables
3. Si faltan, créalas

### Paso 3: Verificar Client Secret

1. Compara el secreto en Strava con Supabase
2. Si no coincide, actualiza en Supabase

### Paso 4: Probar de Nuevo

1. Espera 1-2 minutos después de hacer cambios
2. Intenta conectar desde la app
3. Revisa los logs si sigue fallando

---

## 📞 Si el Problema Persiste

### Información para Debugging

Si después de seguir todos los pasos sigue fallando, necesitarás:

1. **Logs de la Edge Function:**
   - Copia los últimos logs de `strava-auth`
   - Busca mensajes de error específicos

2. **Configuración de Strava:**
   - Captura de pantalla de la configuración de la app
   - Muestra el "Authorization Callback Domain"

3. **Variables de Entorno:**
   - Verifica que las 3 variables existan (sin mostrar valores)
   - Confirma que están activas

---

## 💡 Notas Importantes

- **Redirect URI:** Strava puede requerir solo el dominio o el URI completo. Prueba ambos.
- **Tiempo de Actualización:** Los cambios en Strava pueden tardar 1-2 minutos en aplicarse.
- **Código de Autorización:** Solo se puede usar una vez. Si falla, intenta conectar de nuevo.
- **Variables de Entorno:** Deben estar en la sección "Secrets" de Supabase Functions.

---

## 🔗 Enlaces Útiles

- **Strava API Settings:** https://www.strava.com/settings/api
- **Supabase Functions:** https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions
- **Supabase Settings:** https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions
- **Strava API Docs:** https://developers.strava.com/docs/authentication

---

**¡Empieza por el Paso 1 (Redirect URI) que es la causa más común!** 🚀

