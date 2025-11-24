# 🚀 Cómo Desplegar las Edge Functions de Strava

<html><body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2>âŒ Error</h2>
          <p>Error al obtener tokens de Strava</p>
          <p style="font-size: 12px; color: #666;">{"message":"Authorization Error","errors":[{"resource":"Application","field":"","code":"invalid"}]}</p>
          <script>setTimeout(() => window.close(), 3000);</script>
        </body></html>


## ⚠️ Problema Actual

Las Edge Functions `strava-auth` y `strava-webhook` **NO están desplegadas** en Supabase. Por eso obtienes Error 404.

## ✅ Solución: Desplegar desde Supabase Dashboard

### Opción 1: Desplegar desde el Dashboard (RECOMENDADO - Sin Docker)

#### Paso 1: Ir a Edge Functions en Supabase

1. Abre: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions
2. Verás la lista de funciones existentes

#### Paso 2: Desplegar strava-auth

1. Busca si existe una función llamada `strava-auth`

   - Si existe pero no está desplegada, haz clic en ella
   - Si no existe, haz clic en **"New function"** o **"Deploy a new function"**
2. Configura la función:

   - **Name:** `strava-auth`
   - **Click en "Select files"** o arrastra el archivo
   - Selecciona: `/Users/nachoamigo/stride-seeker-journey/supabase/functions/strava-auth/index.ts`
3. Haz clic en **"Deploy"**
4. Espera a que el deploy termine (verás un indicador de carga)

#### Paso 3: Desplegar strava-webhook

1. Repite el proceso para `strava-webhook`:

   - **Name:** `strava-webhook`
   - **Archivo:** `/Users/nachoamigo/stride-seeker-journey/supabase/functions/strava-webhook/index.ts`
2. Haz clic en **"Deploy"**

#### Paso 4: Configurar Variables de Entorno

**IMPORTANTE:** Antes de que las funciones funcionen, debes configurar las variables de entorno.

1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions
2. Haz clic en **"Add new secret"** o **"Environment variables"**
3. Añade estas 3 variables:

```
STRAVA_CLIENT_ID = 186314
STRAVA_CLIENT_SECRET = fa541a582f6dde856651e09cb546598865b000b15
STRAVA_WEBHOOK_VERIFY_TOKEN = berun_webhook_verify_2024
```

4. Guarda cada variable

#### Paso 5: Verificar que funcionen

Ejecuta este comando en tu terminal:

```bash
curl -s "https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/strava-auth?code=test"
```

**Resultado esperado:**

- ❌ ANTES: `{"code":"NOT_FOUND","message":"Requested function was not found"}`
- ✅ DESPUÉS: Un HTML con un mensaje de error de Strava (esto es normal, indica que la función está activa)

---

### Opción 2: Desplegar con Supabase CLI y Docker (Si Docker está corriendo)

Si Docker está corriendo, puedes usar CLI:

```bash
# 1. Iniciar Docker Desktop
open -a "Docker"

# 2. Esperar a que inicie (30 segundos)
sleep 30

# 3. Verificar que Docker esté corriendo
docker info

# 4. Navegar al proyecto
cd /Users/nachoamigo/stride-seeker-journey

# 5. Desplegar las funciones
supabase functions deploy strava-auth --project-ref uprohtkbghujvjwjnqyv
supabase functions deploy strava-webhook --project-ref uprohtkbghujvjwjnqyv
```

---

## 🔍 Verificar que las funciones están desplegadas

Después de desplegar, ejecuta:

```bash
cd /Users/nachoamigo/stride-seeker-journey
./scripts/verify-strava-setup.sh
```

Deberías ver:

```
✅ Función strava-auth está desplegada (HTTP 400 o 401)
✅ Función strava-webhook está desplegada (HTTP 200 o 405)
```

---

## 📋 Orden correcto de pasos

Para que Strava funcione completamente:

1. ✅ **PRIMERO:** Desplegar Edge Functions (esta guía)
2. ✅ **SEGUNDO:** Configurar variables de entorno en Supabase
3. ✅ **TERCERO:** Desconectar conexión antigua en Strava (Error 403)
4. ✅ **CUARTO:** Conectar de nuevo desde la app

---

## 🆘 Si tienes problemas

### Error al desplegar desde Dashboard

Si el Dashboard no permite subir archivos:

1. **Opción A:** Copiar y pegar el código

   - Abre el archivo `supabase/functions/strava-auth/index.ts`
   - Copia todo el contenido
   - En el Dashboard, crea una nueva función
   - Pega el código en el editor
   - Haz clic en "Deploy"
2. **Opción B:** Usar la API de Supabase

   - Requiere más configuración técnica
   - Contacta si necesitas ayuda con esto

### Docker no inicia

Si Docker no arranca:

1. Abre Docker Desktop manualmente desde Aplicaciones
2. Espera a que el icono de Docker en la barra superior esté activo
3. Luego ejecuta los comandos de deploy

---

## 📧 Contacto con Supabase Support

Si nada funciona, contacta a Supabase:

- **Email:** support@supabase.com
- **Discord:** https://discord.supabase.com
- **Menciona:** Project ref: uprohtkbghujvjwjnqyv

---

## ✅ Lista de verificación final

Antes de intentar conectar Strava:

- [ ] Edge Functions desplegadas (HTTP 400/401, NO 404)
- [ ] Variables de entorno configuradas en Supabase
- [ ] Tabla `strava_connections` existe en la base de datos
- [ ] Conexión antigua desconectada en Strava (Error 403)
- [ ] Contador de Strava muestra "0 deportistas conectados"

---

## 🔗 Enlaces útiles

- **Supabase Functions:** https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions
- **Supabase Settings:** https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions
- **Strava Apps:** https://www.strava.com/settings/apps
- **Strava API:** https://www.strava.com/settings/api
