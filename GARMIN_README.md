# 🏃 Integración Garmin Connect - BeRun

## 📖 Índice de Documentación

### 🚀 Comienza aquí

1. **[GARMIN_INTEGRATION_SUMMARY.md](./GARMIN_INTEGRATION_SUMMARY.md)** ⭐
   - Resumen ejecutivo de toda la integración
   - Qué se implementó y cómo funciona
   - Inicio rápido en 5 pasos

2. **[GARMIN_IMPLEMENTATION_CHECKLIST.md](./GARMIN_IMPLEMENTATION_CHECKLIST.md)** ✅
   - Checklist paso a paso detallado
   - Comandos exactos para ejecutar
   - Tests y debugging

3. **[GARMIN_SETUP_GUIDE.md](./GARMIN_SETUP_GUIDE.md)** 📚
   - Guía completa y detallada
   - Arquitectura técnica
   - Troubleshooting avanzado

4. **[GARMIN_CREDENTIALS.md](./GARMIN_CREDENTIALS.md)** 🔑
   - Todas las credenciales en un solo lugar
   - URLs de las Edge Functions
   - Links útiles del portal

---

## 🎯 Inicio Rápido (5 minutos)

### 1. Crear tabla en Supabase
```bash
./scripts/create-garmin-connections.sh
```

### 2. Desplegar funciones
```bash
supabase login
./scripts/deploy-garmin-functions.sh
```

### 3. Configurar variables
1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions
2. Añade las variables del archivo `GARMIN_CREDENTIALS.md`
3. Redeploya: `./scripts/deploy-garmin-functions.sh`

### 4. Configurar webhook en Garmin
1. Ve a: https://connectapi.garmin.com/developer/dashboard
2. Añade webhook URL: `https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-webhook`

### 5. Añadir UI a la app
```tsx
// En src/pages/Settings.tsx
import { ConnectGarmin } from '@/components/garmin/ConnectGarmin';

<ConnectGarmin />
```

### 6. Testing
```bash
./scripts/test-garmin-integration.sh
```

---

## 📂 Estructura de Archivos

```
stride-seeker-journey/
│
├── 📄 Documentación
│   ├── GARMIN_README.md                          ← Estás aquí
│   ├── GARMIN_INTEGRATION_SUMMARY.md             ← Resumen ejecutivo
│   ├── GARMIN_IMPLEMENTATION_CHECKLIST.md        ← Checklist paso a paso
│   ├── GARMIN_SETUP_GUIDE.md                     ← Guía completa
│   └── GARMIN_CREDENTIALS.md                     ← Credenciales y URLs
│
├── 🗄️ Base de Datos
│   └── supabase/migrations/
│       └── create_garmin_connections.sql         ← Migración SQL
│
├── ⚡ Edge Functions
│   └── supabase/functions/
│       ├── garmin-auth-start/index.ts            ← Iniciar OAuth
│       ├── garmin-auth-callback/index.ts         ← Recibir token
│       ├── garmin-webhook/index.ts               ← Recibir actividades
│       └── garmin-deregister/index.ts            ← Desconectar
│
├── 🎨 UI Components
│   └── src/components/
│       ├── garmin/
│       │   └── ConnectGarmin.tsx                 ← Componente principal
│       └── ui/
│           └── GarminConnectButton.tsx           ← Botón de conexión
│
└── 🛠️ Scripts
    └── scripts/
        ├── create-garmin-connections.sh          ← Crear tabla
        ├── deploy-garmin-functions.sh            ← Desplegar funciones
        ├── test-garmin-integration.sh            ← Testing automático
        ├── resize-garmin-branding.sh             ← Redimensionar imagen
        └── upload-garmin-branding.js             ← Subir imagen
```

---

## 🔄 Flujo de Datos

### 1. Conexión Inicial (OAuth)
```
Usuario click "Conectar Garmin"
    ↓
App → garmin-auth-start (obtiene URL OAuth)
    ↓
Usuario autoriza en Garmin Connect
    ↓
Garmin → garmin-auth-callback (con oauth_token y verifier)
    ↓
Callback intercambia por access_token
    ↓
Guarda en garmin_connections (con user_auth_id como FK)
    ↓
Usuario ve "Conectado ✅"
```

### 2. Sincronización de Actividades
```
Usuario completa entrenamiento con reloj Garmin
    ↓
Garmin Connect recibe la actividad
    ↓
Garmin envía PUSH notification → garmin-webhook
    ↓
Webhook busca usuario por garmin_user_id
    ↓
Convierte datos de Garmin a formato BeRun
    ↓
Guarda en published_activities_simple
    ↓
Verifica si completa workout del plan
    ↓
Si coincide: marca workout como completado
    ↓
App muestra actividad automáticamente
```

---

## 🧪 Testing

### Test Automático
```bash
./scripts/test-garmin-integration.sh
```

Debe mostrar: `✅ Todos los tests pasaron! (5/5)`

### Test Manual
1. Conectar cuenta desde la app
2. Completar actividad con Garmin
3. Esperar 1-2 minutos
4. Verificar que aparezca en "Mis actividades"
5. Verificar que se marque workout como completado (si aplica)

### Ver Logs en Tiempo Real
```bash
# Webhook (actividades)
supabase functions logs garmin-webhook --project-ref uprohtkbghujvjwjnqyv

# OAuth callback
supabase functions logs garmin-auth-callback --project-ref uprohtkbghujvjwjnqyv
```

---

## 📊 Base de Datos

### Tabla Principal: `garmin_connections`
```sql
-- Ver todas las conexiones
SELECT 
  user_auth_id,
  garmin_user_id,
  athlete_name,
  created_at
FROM garmin_connections;
```

### Actividades Importadas
```sql
-- Ver actividades de Garmin
SELECT 
  id,
  title,
  distance,
  duration,
  garmin_activity_id,
  activity_date,
  imported_from_garmin
FROM published_activities_simple
WHERE imported_from_garmin = true
ORDER BY activity_date DESC
LIMIT 10;
```

---

## ⚠️ Notas Importantes

### OAuth 1.0a
Garmin usa OAuth 1.0a (diferente a Strava que usa OAuth 2.0):
- No expira automáticamente
- Usa `oauth_token` y `oauth_verifier`
- Más complejo pero más seguro

### Foreign Keys
La tabla `garmin_connections` está correctamente relacionada:
- `user_auth_id` → `auth.users(id)` con CASCADE DELETE
- Un usuario solo puede tener una conexión Garmin
- Si se borra el usuario, se borra la conexión automáticamente

### Webhook Configuration
El webhook debe configurarse **manualmente** en el Garmin Developer Portal. No hay endpoint API para esto.

### Activity Types
Garmin tiene 100+ tipos de actividades. La función `mapGarminActivityType()` mapea los más comunes.

---

## 🐛 Problemas Comunes

### Actividades no se importan
1. Verifica que el webhook esté configurado en Garmin Developer Portal
2. Verifica logs: `supabase functions logs garmin-webhook`
3. Verifica que `garmin_user_id` coincida en la base de datos

### OAuth falla
1. Verifica credenciales en variables de entorno
2. Redeploya funciones después de añadir variables
3. Verifica que la redirect URI coincida exactamente

### Entrenamientos no se auto-completan
1. Verifica que el usuario tenga un plan activo
2. Verifica que la distancia sea similar (±10%)
3. Verifica que el tipo de actividad coincida

---

## 🎉 Estado del Proyecto

| Componente | Estado | Notas |
|------------|--------|-------|
| Base de datos | ✅ Listo | Foreign keys correctas |
| Edge Functions | ✅ Listo | 4 funciones completadas |
| UI Components | ✅ Listo | Estilo consistente con Strava |
| Scripts | ✅ Listo | Deploy y testing automatizados |
| Documentación | ✅ Listo | Guías completas |
| **Despliegue** | ⏳ Pendiente | Tu ejecutas los scripts |
| **Testing** | ⏳ Pendiente | Tu pruebas en la app |

---

## 📚 Recursos Externos

### Documentación de Garmin
- [Activity API 1.2.4](./docs/Activity_API-1.2.4.pdf)
- [OAuth2 PKCE Spec](./docs/OAuth2PKCE_2.pdf)
- [Developer Start Guide](./docs/Garmin%20Developer%20Program_Start_Guide_1.2.pdf)

### URLs Útiles
- [Garmin Developer Portal](https://connectapi.garmin.com/developer/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv)
- [Edge Functions Settings](https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions)

---

## 💡 Próximas Mejoras (Opcional)

1. **Backfill de actividades históricas**
   - Importar actividades pasadas del usuario
   - Endpoint: `/backfill/activityDetails`

2. **GPS Points detallados**
   - Obtener track completo de la actividad
   - Mostrar mapa en detalle de actividad

3. **Health API Integration**
   - Frecuencia cardíaca
   - Datos de sueño
   - Nivel de estrés

4. **Sincronización manual**
   - Botón para forzar sincronización
   - Útil para testing

5. **Notificaciones push**
   - Notificar cuando se importa actividad
   - Notificar cuando se completa workout

---

## ✅ Checklist Final

Antes de dar por completada la integración:

- [ ] Tabla `garmin_connections` creada en Supabase
- [ ] 4 Edge Functions desplegadas
- [ ] Variables de entorno configuradas
- [ ] Webhook configurado en Garmin Developer Portal
- [ ] Componente `ConnectGarmin` añadido a Settings
- [ ] Test automático pasa (5/5)
- [ ] OAuth flow funciona correctamente
- [ ] Actividad de prueba se importa automáticamente
- [ ] Workout se marca como completado automáticamente
- [ ] Desconexión funciona correctamente

---

## 🆘 Soporte

Si encuentras problemas:

1. **Lee los logs**:
   ```bash
   supabase functions logs garmin-webhook --project-ref uprohtkbghujvjwjnqyv
   ```

2. **Ejecuta el test**:
   ```bash
   ./scripts/test-garmin-integration.sh
   ```

3. **Consulta la guía detallada**:
   [GARMIN_SETUP_GUIDE.md](./GARMIN_SETUP_GUIDE.md)

4. **Verifica la base de datos**:
   SQL queries en `GARMIN_IMPLEMENTATION_CHECKLIST.md`

---

**Implementado:** Diciembre 15, 2025  
**Versión:** 1.0  
**Estado:** ✅ Listo para desplegar

---

## 📝 Licencia y Créditos

- **Implementación**: AI Assistant (Claude Sonnet 4.5)
- **Proyecto**: BeRun - AI Running Coach
- **API**: Garmin Connect Developer Program




