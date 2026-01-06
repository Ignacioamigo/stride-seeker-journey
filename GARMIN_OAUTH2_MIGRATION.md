# Migración de Garmin a OAuth 2.0 PKCE

## 🎉 Cambios Completados

Se ha migrado completamente la integración de Garmin de OAuth 1.0a a **OAuth 2.0 PKCE** según la documentación oficial de Garmin.

### ¿Por qué este cambio?

- OAuth 1.0a será retirado por Garmin el **31/12/2026**
- OAuth 2.0 es más seguro, escalable y moderno
- PKCE (Proof Key for Code Exchange) previene ataques de intercepción de código

---

## 📋 Archivos Modificados

### Edge Functions (Supabase)
1. **`garmin-auth-start`** - Inicia flujo OAuth 2.0 PKCE
2. **`garmin-auth-callback`** - Procesa callback y obtiene tokens
3. **`garmin-refresh-token`** (NUEVO) - Refresca tokens automáticamente

### Base de Datos
1. **Migration**: `20250101_update_garmin_connections_oauth2.sql`
   - Añade `token_expires_at`
   - Añade `refresh_token_expires_at`
   - Añade `permissions` (JSON)

### Frontend
1. **`ConnectGarmin.tsx`** - Actualizado para manejar OAuth 2.0 y refrescar tokens

---

## 🚀 Pasos para Desplegar

### Paso 1: Ejecutar Migration en Supabase

```sql
-- Ir a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/editor
-- Abrir el SQL Editor y ejecutar:

ALTER TABLE garmin_connections
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refresh_token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_garmin_connections_token_expiration 
ON garmin_connections(token_expires_at) 
WHERE token_expires_at IS NOT NULL;
```

### Paso 2: Desplegar Edge Functions

```bash
cd /Users/nachoamigo/stride-seeker-journey

# Desplegar las 3 funciones principales
supabase functions deploy garmin-auth-start --project-ref uprohtkbghujvjwjnqyv
supabase functions deploy garmin-auth-callback --project-ref uprohtkbghujvjwjnqyv
supabase functions deploy garmin-refresh-token --project-ref uprohtkbghujvjwjnqyv

# También redesplegar webhook si es necesario
supabase functions deploy garmin-webhook --project-ref uprohtkbghujvjwjnqyv
supabase functions deploy garmin-deregister --project-ref uprohtkbghujvjwjnqyv
```

### Paso 3: Verificar Variables de Entorno

Ir a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions

Verificar que existan:
- `GARMIN_CLIENT_ID` (tu Consumer Key)
- `GARMIN_CLIENT_SECRET` (tu Consumer Secret)
- `GARMIN_REDIRECT_URI` = `https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-auth-callback`
- `APP_URL` (opcional) = `https://berun.app` o tu dominio

### Paso 4: Build y Sync de la App

```bash
npm run build
export LANG=en_US.UTF-8
npx cap sync ios
```

### Paso 5: Probar la Conexión

1. Abre la app en el simulador/dispositivo
2. Ve a Settings → Integraciones
3. Haz clic en "Connect with Garmin"
4. Deberías ver la página de autorización de Garmin (OAuth 2.0)
5. Autoriza y verifica que aparece "Conectado"

---

## 🔄 Diferencias OAuth 1.0a vs OAuth 2.0

### OAuth 1.0a (ANTIGUO)
```
1. Request Token (con firma HMAC-SHA1)
2. Usuario autoriza
3. Access Token (con firma HMAC-SHA1)
4. Tokens permanentes
```

### OAuth 2.0 PKCE (NUEVO)
```
1. Generar code_verifier + code_challenge (SHA-256)
2. Authorization Request → Usuario autoriza
3. Token Exchange (code + code_verifier)
4. Recibe access_token (24h) + refresh_token (3 meses)
5. Auto-refresh antes de expiración
```

---

## 🔐 Seguridad OAuth 2.0

### Access Tokens
- **Duración**: 24 horas
- **Auto-refresh**: Cuando falta < 10 minutos para expirar
- **Almacenado**: En `garmin_connections.access_token`

### Refresh Tokens
- **Duración**: ~3 meses (7,775,998 segundos)
- **Uso**: Para obtener nuevos access tokens
- **Almacenado**: En `garmin_connections.refresh_token`
- **Rotación**: Cada refresh devuelve un nuevo refresh_token

### PKCE (Proof Key for Code Exchange)
- **code_verifier**: String aleatorio de 128 caracteres
- **code_challenge**: SHA-256(code_verifier) en base64url
- **Protección**: Previene ataques de intercepción del código de autorización

---

## 🛠️ Token Refresh Automático

El sistema refresca tokens automáticamente en dos escenarios:

### 1. Al Verificar Conexión (Frontend)
```typescript
// En ConnectGarmin.tsx
if (expiresAt < tenMinutesFromNow) {
  fetch('/functions/v1/garmin-refresh-token', { ... })
}
```

### 2. Cron Job (Recomendado)
Configurar en Supabase para ejecutar cada hora:
```bash
curl -X POST https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-refresh-token \
  -H "Authorization: Bearer SERVICE_ROLE_KEY"
```

---

## 📊 Endpoints OAuth 2.0 de Garmin

### Authorization
```
GET https://connect.garmin.com/oauth2Confirm
Parámetros:
- response_type=code
- client_id=YOUR_CLIENT_ID
- code_challenge=BASE64URL(SHA256(code_verifier))
- code_challenge_method=S256
- redirect_uri=YOUR_CALLBACK_URL
- state=RANDOM_STATE
```

### Token Exchange
```
POST https://diauth.garmin.com/di-oauth2-service/oauth/token
Body (x-www-form-urlencoded):
- grant_type=authorization_code
- client_id=YOUR_CLIENT_ID
- client_secret=YOUR_CLIENT_SECRET
- code=AUTHORIZATION_CODE
- code_verifier=ORIGINAL_VERIFIER
- redirect_uri=YOUR_CALLBACK_URL
```

### Token Refresh
```
POST https://diauth.garmin.com/di-oauth2-service/oauth/token
Body:
- grant_type=refresh_token
- client_id=YOUR_CLIENT_ID
- client_secret=YOUR_CLIENT_SECRET
- refresh_token=REFRESH_TOKEN
```

### User ID
```
GET https://apis.garmin.com/wellness-api/rest/user/id
Headers:
- Authorization: Bearer ACCESS_TOKEN
```

### User Permissions
```
GET https://apis.garmin.com/wellness-api/rest/user/permissions
Headers:
- Authorization: Bearer ACCESS_TOKEN
```

---

## ✅ Testing Checklist

- [ ] Migration ejecutada en Supabase
- [ ] Edge Functions desplegadas
- [ ] Variables de entorno configuradas
- [ ] App compilada y sincronizada
- [ ] Conexión con Garmin exitosa
- [ ] Usuario puede autorizar
- [ ] Tokens se almacenan correctamente
- [ ] Token refresh funciona automáticamente
- [ ] Webhook recibe actividades (si configurado)

---

## 🐛 Troubleshooting

### Error: "Invalid signature"
- Esto ya no debería ocurrir con OAuth 2.0 (no usa firmas)
- Si aparece, verifica que las Edge Functions estén desplegadas correctamente

### Error: "Invalid client_id"
- Verifica `GARMIN_CLIENT_ID` en variables de entorno
- Confirma que coincide con tu Consumer Key en el portal de Garmin

### Error: "Invalid code_verifier"
- El code_verifier debe coincidir exactamente con el usado para generar code_challenge
- Verifica que la tabla `garmin_oauth_temp` está limpiándose correctamente

### Token no se refresca automáticamente
- Verifica que `token_expires_at` está guardado correctamente
- Comprueba logs de `garmin-refresh-token`
- Considera configurar un cron job

---

## 📚 Referencias

- [Garmin OAuth 2.0 PKCE Spec](OAuth2PKCE_2.pdf)
- [Garmin OAuth 1 to 2 Migration Guide](OAuth2 Migration Guide.pdf)
- [RFC 7636 - PKCE](https://datatracker.ietf.org/doc/html/rfc7636)

---

## 🎯 Próximos Pasos Recomendados

1. **Configurar Cron Job** para token refresh cada hora
2. **Monitorear logs** de las Edge Functions
3. **Notificar usuarios** sobre la migración (si aplicable)
4. **Testear exhaustivamente** el flujo completo
5. **Documentar** cualquier problema encontrado

---

**¡La migración a OAuth 2.0 PKCE está completa!** 🎉




