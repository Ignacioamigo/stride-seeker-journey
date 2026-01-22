# 🔒 Activar SSL en Netlify (Gratis y Automático)

## Paso 1: Activar SSL en Netlify

1. Ve a tu dashboard de Netlify: https://app.netlify.com/
2. Selecciona tu sitio: `sage-puffpuff-06c024`
3. Ve a **"Domain settings"** (Configuración de dominio) en el menú izquierdo
4. Haz clic en **"Custom domains"** (Dominios personalizados)
5. Haz clic en **"Add custom domain"** (Agregar dominio personalizado)
6. Escribe: `berun.info`
7. Netlify te pedirá verificar el dominio

## Paso 2: Configurar DNS en IONOS

Netlify te dará instrucciones de DNS. Necesitas:

1. En IONOS, ve a **"DNS"** (no redirección)
2. Agrega estos registros DNS:

### Opción A: Usar CNAME (Recomendado)
- **Tipo**: CNAME
- **Nombre**: `@` o deja vacío
- **Valor**: `sage-puffpuff-06c024.netlify.app`
- **TTL**: 3600

### Opción B: Usar registros A (Si CNAME no funciona)
Netlify te dará direcciones IP específicas. Agrega:
- **Tipo**: A
- **Nombre**: `@` o deja vacío  
- **Valor**: (IP que te da Netlify)
- **TTL**: 3600

Repite para `www`:
- **Tipo**: CNAME
- **Nombre**: `www`
- **Valor**: `sage-puffpuff-06c024.netlify.app`

## Paso 3: Esperar y Verificar

1. Espera 5-15 minutos para que los cambios DNS se propaguen
2. Netlify activará automáticamente el certificado SSL (Let's Encrypt)
3. Verifica que `https://berun.info` funcione

## Paso 4: Eliminar la Redirección en IONOS

Una vez que DNS funcione:
1. En IONOS, ve a "Ajustar destino" > "Restablecer dominio"
2. Esto eliminará la redirección y usará DNS directamente

## ✅ Resultado Final

- ✅ `https://berun.info` funcionará con SSL
- ✅ `https://berun.info/privacy.html` funcionará con SSL
- ✅ Certificado SSL automático y gratuito de Netlify












