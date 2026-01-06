# 🚀 Guía para Desplegar BeRun en Netlify y Conectar con IONOS

## Paso 1: Crear cuenta en Netlify

1. Ve a https://www.netlify.com/
2. Haz clic en "Sign up" (Registrarse)
3. Puedes registrarte con GitHub, GitLab, Bitbucket o Email
4. Confirma tu cuenta

## Paso 2: Desplegar los archivos

### Opción A: Arrastrar y soltar (Más fácil)

1. En Netlify, haz clic en "Add new site" > "Deploy manually"
2. Arrastra la carpeta `public` completa a la zona de arrastrar
3. Netlify comenzará a desplegar automáticamente
4. Espera unos segundos hasta que veas "Site is live"
5. Copia la URL que te da Netlify (algo como: `https://random-name-123.netlify.app`)

### Opción B: Desde GitHub (Recomendado para actualizaciones)

1. Sube tu proyecto a GitHub
2. En Netlify, haz clic en "Add new site" > "Import an existing project"
3. Conecta con GitHub y selecciona tu repositorio
4. Configuración:
   - **Build command**: (dejar vacío)
   - **Publish directory**: `public`
5. Haz clic en "Deploy site"

## Paso 3: Conectar tu dominio en IONOS

1. En Netlify, ve a tu sitio desplegado
2. Ve a "Domain settings" > "Custom domains"
3. Haz clic en "Add custom domain"
4. Escribe tu dominio: `berun.info`
5. Netlify te dará instrucciones de DNS

### En IONOS:

1. Ve a la sección de tu dominio
2. Haz clic en **"> Redirija su dominio a un sitio web externo"** (la opción que viste en la pantalla)
3. Ingresa la URL de Netlify que obtuviste (ejemplo: `https://random-name-123.netlify.app`)
4. Guarda los cambios

**O si prefieres usar DNS directamente:**

1. En IONOS, ve a "DNS"
2. Agrega un registro CNAME:
   - **Nombre**: `@` o `www`
   - **Tipo**: CNAME
   - **Valor**: La URL de Netlify (sin https://, solo el dominio, ej: `random-name-123.netlify.app`)
3. Guarda los cambios

## Paso 4: Verificar que funciona

1. Espera 5-10 minutos para que los cambios DNS se propaguen
2. Visita `https://berun.info` - deberías ver tu página
3. Visita `https://berun.info/privacy.html` - deberías ver la política de privacidad

## ✅ Verificación para Garmin

Una vez desplegado, verifica que:
- ✅ `https://berun.info` muestra la página principal de BeRun
- ✅ `https://berun.info/privacy.html` muestra la política de privacidad
- ✅ Hay un enlace visible a la política de privacidad en la página principal

## 📝 Notas importantes

- Los cambios DNS pueden tardar hasta 24 horas en propagarse completamente
- Netlify es gratuito y perfecto para páginas estáticas
- Puedes actualizar los archivos HTML y volver a desplegar cuando quieras









