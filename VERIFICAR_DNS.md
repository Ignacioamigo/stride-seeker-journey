# 🔍 Verificar Configuración DNS para berun.info

## Problema Actual
El dominio `berun.info` muestra un error 404 de nginx, lo que indica que el DNS aún no está apuntando correctamente a Netlify.

## Pasos para Verificar y Solucionar

### Paso 1: Verificar DNS en línea
Ve a estos sitios para verificar qué servidores DNS tiene tu dominio:

1. **https://dnschecker.org/#NS/berun.info**
   - Deberías ver los servidores DNS de Netlify:
     - `dns1.p05.nsone.net`
     - `dns2.p05.nsone.net`
     - `dns3.p05.nsone.net`
     - `dns4.p05.nsone.net`

2. **https://mxtoolbox.com/SuperTool.aspx?action=ns%3aberun.info**
   - Verifica que los name servers sean los de Netlify

### Paso 2: Verificar en IONOS
1. Ve a tu dominio en IONOS
2. Verifica que los servidores DNS sean los de Netlify:
   - `dns1.p05.nsone.net`
   - `dns2.p05.nsone.net`
   - `dns3.p05.nsone.net`
   - `dns4.p05.nsone.net`

### Paso 3: Si los DNS no son los de Netlify
Si ves otros servidores DNS (como los de IONOS), necesitas cambiarlos:

1. En IONOS, ve a "Servidores DNS"
2. Cambia los servidores DNS a los de Netlify
3. Guarda los cambios
4. Espera 15-30 minutos

### Paso 4: Verificar que Netlify detecta el dominio
En Netlify:
1. Ve a Domain settings > Custom domains
2. Haz clic en `berun.info`
3. Verifica que diga "Netlify DNS" con check verde
4. Si hay algún warning, haz clic para ver los detalles

### Paso 5: Esperar propagación
- Los cambios DNS pueden tardar hasta 48 horas
- Normalmente toma 15-30 minutos
- Puedes verificar el progreso en dnschecker.org

## Solución Temporal
Mientras esperas la propagación DNS, puedes usar la redirección en IONOS:

1. En IONOS, activa la redirección temporalmente
2. Redirige a: `https://sage-puffpuff-06c024.netlify.app`
3. Esto funcionará hasta que DNS se propague completamente









