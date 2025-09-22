# 🔧 Corrección Bundle ID para App Store Connect

## 🚨 Problema Detectado

**Bundle ID actual en proyecto:** `app.lovable.f20075a364dd4e768cac356cfec575f8`
**Bundle ID en App Store Connect:** `stride.seeker.watchkitapp`

❌ **NO COINCIDEN** - Esto impedirá que funcione Apple Pay en producción.

## ✅ Solución Recomendada: Actualizar Bundle ID del Proyecto

### Paso 1: Cambiar Bundle ID en Xcode

1. **Abrir Xcode:**
   ```bash
   cd /Users/nachoamigo/stride-seeker-journey/ios/App
   open App.xcworkspace
   ```

2. **Seleccionar el proyecto:**
   - Click en "App" en Project Navigator
   - Seleccionar target "App"

3. **Cambiar Bundle Identifier:**
   - En pestaña "General"
   - Cambiar "Bundle Identifier" de:
     `app.lovable.f20075a364dd4e768cac356cfec575f8`
   - A:
     `stride.seeker.app`

### Paso 2: Actualizar Capacitor Config

```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'stride.seeker.app',  // ← Cambiar esta línea
  appName: 'Stride Seeker',
  // ... resto de configuración
};
```

### Paso 3: Actualizar Configuration.storekit

```json
{
  "settings": {
    "_developerTeamID": "TU_TEAM_ID",
    "_applicationInternalID": "NUEVO_APP_ID_DE_APP_STORE_CONNECT"
  }
}
```

### Paso 4: Crear Nueva App en App Store Connect

1. **Borrar la app incorrecta** (stride.seeker.watchkitapp)
2. **Crear nueva app** con Bundle ID: `stride.seeker.app`
3. **Configurar productos In-App Purchase** nuevamente

## 🎯 Bundle IDs Sugeridos (Elige uno)

### Opción A: Para app principal
```
stride.seeker.app
```

### Opción B: Para empresa
```
com.tuempresa.strideseeker
```

### Opción C: Mantener consistencia con watchkit
```
stride.seeker.ios
```

## ⚠️ Importante

- **Apple Watch:** Si tienes Apple Watch app, usar `stride.seeker.watchkitapp` para la extensión
- **App principal:** NO debe usar `.watchkitapp` - ese sufijo es solo para Watch apps
- **Consistencia:** El Bundle ID debe ser único y consistente

## 🚀 Comandos Rápidos

### Verificar Bundle ID actual:
```bash
grep -r "PRODUCT_BUNDLE_IDENTIFIER" ios/App/App.xcodeproj/
```

### Verificar configuración Capacitor:
```bash
grep "appId" capacitor.config.ts
```

## 📋 Checklist de Cambios

- [ ] Cambiar Bundle ID en Xcode (General → Bundle Identifier)
- [ ] Actualizar capacitor.config.ts
- [ ] Actualizar Configuration.storekit
- [ ] Crear nueva app en App Store Connect
- [ ] Configurar productos In-App Purchase
- [ ] Crear nuevas cuentas sandbox
- [ ] Probar que todo funciona

## 💡 Recomendación

**Usa Bundle ID:** `stride.seeker.app`

Este es:
- ✅ Claro y profesional
- ✅ Consistente con el nombre de tu app
- ✅ Diferente del watchkit app
- ✅ Fácil de recordar

¿Quieres que haga estos cambios automáticamente?
