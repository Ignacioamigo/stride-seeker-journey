# 🔑 Credenciales y URLs de Garmin Connect

## 📋 Credenciales de la Aplicación

```
Client ID: b8e7d840-e16b-4db5-84ba-b110a8e7a516
Client Secret: nc4ZgcLZP5JD6y/TJIxzDiK2t6XXEVYg31yCFf3jYk0
```

---

## 🔗 URLs Configuradas

### OAuth Redirect URI
```
https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-auth-callback
```

### Webhook URI
```
https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-webhook
```

### Branding Image (300x300px)
```
https://uprohtkbghujvjwjnqyv.supabase.co/storage/v1/object/public/activity-images/garmin-branding-300x300.png
```

---

## 🌐 Edge Functions URLs

### garmin-auth-start
```
https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-auth-start
```

### garmin-auth-callback
```
https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-auth-callback
```

### garmin-webhook
```
https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-webhook
```

### garmin-deregister
```
https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-deregister
```

---

## ⚙️ Variables de Entorno para Supabase

Estas variables deben añadirse en:
https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions

```bash
GARMIN_CLIENT_ID=b8e7d840-e16b-4db5-84ba-b110a8e7a516
GARMIN_CLIENT_SECRET=nc4ZgcLZP5JD6y/TJIxzDiK2t6XXEVYg31yCFf3jYk0
GARMIN_REDIRECT_URI=https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-auth-callback
```

---

## 🏢 Garmin Developer Portal

### Dashboard
```
https://connectapi.garmin.com/developer/dashboard
```

### Configuración de Webhook
1. Ve al dashboard
2. Selecciona tu aplicación
3. Ve a "Push Notifications" o "Webhooks"
4. Añade la URL del webhook:
   ```
   https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-webhook
   ```

---

## 📊 Supabase URLs

### SQL Editor
```
https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/editor
```

### Edge Functions Settings
```
https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions
```

### Edge Functions Logs
```
https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/logs/edge-functions
```

### Storage (para branding image)
```
https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/storage/buckets/activity-images
```

---

## 🔐 Seguridad

⚠️ **IMPORTANTE:** Este archivo contiene credenciales sensibles. 

- ❌ **NO** lo subas a repositorios públicos
- ❌ **NO** lo compartas públicamente
- ✅ Usa las variables de entorno en Supabase (más seguro)
- ✅ Mantén el archivo en local o en gestores de secretos

---

**Última actualización:** Diciembre 15, 2025







