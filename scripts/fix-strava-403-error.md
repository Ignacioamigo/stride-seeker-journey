# 🔧 Solución Completa para Error 403 de Strava

## 🔍 Diagnóstico del Problema

**Error:** `Error 403: Se ha superado el límite de deportistas conectados`

**Causa:** Tu aplicación de Strava tiene un límite de **1 deportista conectado** y ya hay 1 conexión activa registrada en Strava (aunque no esté en tu base de datos).

---

## ✅ Solución Paso a Paso

### Paso 1: Desconectar TODAS las conexiones en Strava

#### Opción A: Desde la Web de Strava (Recomendado)

1. **Ve a tu cuenta de Strava:**
   ```
   https://www.strava.com/settings/apps
   ```

2. **Busca "BeRun"** en la lista de aplicaciones autorizadas

3. **Haz clic en "Revoke Access"** (Revocar acceso) o "Desautorizar"

4. **Confirma** la acción

5. **Espera 1-2 minutos** para que Strava actualice el contador

#### Opción B: Verificar desde la API (Avanzado)

Si quieres ver qué conexiones están activas, puedes usar este script:

```bash
# Ver conexiones activas (requiere tu access token personal)
curl -G "https://www.strava.com/api/v3/athlete" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_PERSONAL"
```

---

### Paso 2: Verificar el Contador en Strava Dashboard

1. **Ve a:** https://www.strava.com/settings/api
2. **Haz clic en tu aplicación "BeRun"**
3. **Verifica que muestre:**
   - **Número de deportistas conectados en este momento:** `0`
   - Si aún muestra `1`, espera unos minutos más o refresca la página

---

### Paso 3: Limpiar la Base de Datos (Opcional pero Recomendado)

Aunque la tabla esté vacía, es buena práctica asegurarse:

```sql
-- En Supabase SQL Editor
-- Verificar conexiones existentes
SELECT * FROM strava_connections;

-- Si hay alguna, eliminarla
DELETE FROM strava_connections;
```

---

### Paso 4: Intentar Conectar de Nuevo

1. **Abre la app BeRun**
2. **Ve a:** Perfil > Integraciones
3. **Haz clic en "Conectar"** en Strava
4. **Autoriza la aplicación**
5. **Verifica** que se guarde en `strava_connections`

---

## 🚨 Si el Problema Persiste

### Verificar Variables de Entorno

Asegúrate de que las variables estén configuradas en Supabase:

1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions
2. Verifica:
   ```
   STRAVA_CLIENT_ID = 186314
   STRAVA_CLIENT_SECRET = fa541a582f6dde856651e09cb546598865b000b15
   ```

### Verificar Logs de la Edge Function

1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions
2. Haz clic en `strava-auth`
3. Ve a la pestaña **"Logs"**
4. Intenta conectar de nuevo y revisa los logs para ver si hay errores

---

## 📧 Solicitar Aumento del Límite a Strava

Si necesitas más de 1 usuario conectado:

### Email a Strava Developer Support

**Para:** developers@strava.com  
**Asunto:** Request to Increase Connected Athletes Limit - BeRun App

**Cuerpo del email:**

```
Hello Strava Developer Support,

I am developing a fitness training application called "BeRun" (Client ID: 186314) 
that integrates with Strava to sync running activities automatically.

Currently, my application has a limit of 1 connected athlete, which is preventing 
me from testing the integration properly. I would like to request an increase in 
the connected athletes limit to allow for development and testing.

Use case:
- Personal fitness training app
- Users connect their Strava account to sync activities
- Activities automatically complete training sessions in their plan
- Currently in development/testing phase

Could you please increase the limit to at least 10-20 athletes for testing purposes?

Thank you for your assistance.

Best regards,
[Tu nombre]
```

---

## 🔍 Verificación Final

Después de desconectar, verifica:

1. ✅ Strava Dashboard muestra: "Número de deportistas conectados: 0"
2. ✅ Tabla `strava_connections` en Supabase está vacía
3. ✅ Variables de entorno configuradas en Supabase
4. ✅ Edge Function `strava-auth` desplegada y funcionando

---

## 💡 Prevención Futura

Para evitar este problema en el futuro:

1. **Desconecta conexiones de prueba** regularmente desde Strava settings/apps
2. **Usa cuentas de prueba separadas** para testing
3. **Solicita aumento del límite** cuando estés listo para producción
4. **Monitorea el contador** en Strava Dashboard regularmente

---

## 📞 Recursos

- **Strava API Docs:** https://developers.strava.com/docs
- **Strava Developer Support:** developers@strava.com
- **Strava Community:** https://communityhub.strava.com/developers-api-7/

