# ✅ Bundle ID - Pasos Completados y Siguientes

## ✅ COMPLETADO:

### ✅ Paso 2: Capacitor Config actualizado
```typescript
// capacitor.config.ts
appId: 'stride.seeker.app' ✅
```

### ✅ Paso 3: Configuration.storekit preparado
```json
{
  "settings": {
    "_applicationInternalID": "TU_NUEVO_APP_ID_AQUI", 
    "_developerTeamID": "TU_TEAM_ID_AQUI"
  }
}
```

## 🔧 PRÓXIMOS PASOS REQUERIDOS:

### 🎯 Paso 1: Cambiar Bundle ID en Xcode (IMPORTANTE)

1. **Abrir Xcode:**
   ```bash
   cd /Users/nachoamigo/stride-seeker-journey/ios/App
   open App.xcworkspace
   ```

2. **En Xcode:**
   - Click en "App" en Project Navigator (arriba izquierda)
   - Seleccionar target "App" (no "App WatchKit Extension")
   - Ir a pestaña "General"
   - En "Bundle Identifier", cambiar de:
     ```
     app.lovable.f20075a364dd4e768cac356cfec575f8
     ```
   - A:
     ```
     stride.seeker.app
     ```

### 🍎 Paso 4: Crear nueva app en App Store Connect

1. **Ir a App Store Connect:**
   https://appstoreconnect.apple.com

2. **Eliminar app incorrecta (si existe):**
   - Buscar app con Bundle ID: `stride.seeker.watchkitapp`
   - Si existe, eliminarla

3. **Crear nueva app:**
   - Clic en "Nueva App"
   - **Bundle ID:** `stride.seeker.app`
   - **Nombre:** Stride Seeker
   - **Plataforma:** iOS
   - **Idioma principal:** Español

4. **Obtener datos importantes:**
   - **App ID:** (aparecerá después de crear la app)
   - **Team ID:** (en tu perfil de desarrollador)

### 🔧 Paso 5: Completar Configuration.storekit

Una vez que tengas los datos de App Store Connect:

```json
{
  "settings": {
    "_applicationInternalID": "EL_APP_ID_DE_APP_STORE_CONNECT",
    "_developerTeamID": "TU_TEAM_ID_DE_DEVELOPER_ACCOUNT"
  }
}
```

### 📱 Paso 6: Configurar productos In-App Purchase

En App Store Connect:

1. **Ir a Features > In-App Purchases**

2. **Crear Subscription Group:**
   - Nombre: "Premium Subscription"

3. **Crear producto mensual:**
   - Product ID: `stride_seeker_premium_monthly`
   - Tipo: Auto-Renewable Subscription
   - Precio: €9.99
   - Duración: 1 Month
   - Oferta introductoria: 3 días gratis

4. **Crear producto anual:**
   - Product ID: `stride_seeker_premium_yearly`
   - Tipo: Auto-Renewable Subscription
   - Precio: €34.99
   - Duración: 1 Year
   - Oferta introductoria: 3 días gratis

### 🧪 Paso 7: Crear cuentas sandbox

1. **Users and Access > Sandbox Testers**
2. **Crear tester:**
   - Email: `test.strideseeker@gmail.com`
   - Password: `TestStride123!`
   - País: España

## 📋 Checklist de Verificación

- [ ] **Paso 1:** Bundle ID cambiado en Xcode a `stride.seeker.app`
- [ ] **Paso 2:** ✅ Capacitor config actualizado 
- [ ] **Paso 3:** ✅ Configuration.storekit preparado
- [ ] **Paso 4:** Nueva app creada en App Store Connect
- [ ] **Paso 5:** Configuration.storekit completado con datos reales
- [ ] **Paso 6:** Productos In-App Purchase configurados
- [ ] **Paso 7:** Cuentas sandbox creadas

## 🚨 IMPORTANTE:

### Después de cambiar Bundle ID en Xcode:

1. **Sincronizar Capacitor:**
   ```bash
   cd /Users/nachoamigo/stride-seeker-journey
   npx cap sync ios
   ```

2. **Limpiar build:**
   - En Xcode: Product > Clean Build Folder

3. **Verificar que todo funciona:**
   ```bash
   cd /Users/nachoamigo/stride-seeker-journey/ios/App/Scripts
   ./verify-apple-pay-setup.sh
   ```

## 💡 Si necesitas ayuda:

- **Team ID:** Lo encuentras en Apple Developer Account > Membership
- **App ID:** Aparece en App Store Connect después de crear la app
- **Bundle ID debe ser único:** No puede existir otra app con `stride.seeker.app`

## 🎯 Resultado esperado:

Una vez completados todos los pasos:
- ✅ Bundle ID consistente en todo el proyecto
- ✅ App Store Connect configurada correctamente  
- ✅ Apple Pay funcionando en sandbox
- ✅ Listo para testing y producción

¿Necesitas ayuda con alguno de estos pasos?
