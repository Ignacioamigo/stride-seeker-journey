# Instrucciones de Configuración - Paywall iOS

## 🚀 Configuración Inicial

### 1. Configuración de Xcode

1. **Abrir el proyecto iOS:**
   ```bash
   cd ios/App
   open App.xcworkspace
   ```

2. **Verificar configuración de StoreKit:**
   - El archivo `Configuration.storekit` debe estar incluido en el proyecto
   - En Project Navigator, verificar que aparece en el grupo `App`

3. **Configurar Scheme para testing:**
   - Product > Scheme > Edit Scheme
   - Seleccionar `Run` > `Options`
   - En `StoreKit Configuration`, seleccionar `Configuration.storekit`

### 2. Configuración de Bundle ID y Team

1. **Actualizar Bundle Identifier:**
   - Seleccionar target `App` en Project Navigator
   - En `General` tab, cambiar `Bundle Identifier` a tu ID único
   - Ejemplo: `com.tuempresa.strideseeker`

2. **Configurar Team:**
   - En `Signing & Capabilities`, seleccionar tu Development Team
   - Verificar que `Automatically manage signing` está habilitado

### 3. Configuración de Capabilities

1. **Añadir In-App Purchase capability:**
   - Seleccionar target `App`
   - Ir a `Signing & Capabilities`
   - Hacer clic en `+ Capability`
   - Añadir `In-App Purchase`

2. **Verificar Push Notifications (para recordatorios):**
   - Debe estar presente `Push Notifications` capability
   - Si no está, añadirla desde `+ Capability`

### 4. Configuración de Info.plist

El archivo `Info.plist` ya está configurado con los permisos necesarios:
- `NSUserNotificationUsageDescription` (para recordatorios locales)

### 5. Actualizar Configuration.storekit

**IMPORTANTE:** Actualizar los siguientes campos en `Configuration.storekit`:

```json
{
  "settings": {
    "_developerTeamID": "TU_TEAM_ID_AQUI",
    "_applicationInternalID": "TU_APP_ID_AQUI"
  }
}
```

## 🛠 Configuración de App Store Connect

### 1. Crear App en App Store Connect

1. **Crear nueva app:**
   - Bundle ID debe coincidir con Xcode
   - Nombre: "Stride Seeker" o tu nombre preferido
   - Categoría: Health & Fitness

2. **Configurar información básica:**
   - Descripción de la app
   - Keywords para ASO
   - Screenshots (requeridos para review)

### 2. Configurar In-App Purchases

1. **Crear Subscription Group:**
   - Ir a `Features` > `In-App Purchases`
   - Crear nuevo Subscription Group: "Premium Subscription"

2. **Crear Suscripción Mensual:**
   - Product ID: `stride_seeker_premium_monthly`
   - Reference Name: `Premium Monthly`
   - Subscription Duration: `1 Month`
   - Price: `€9.99`
   
   **Oferta Introductoria:**
   - Type: `Free Trial`
   - Duration: `3 Days`
   - Territories: `All Territories`

3. **Crear Suscripción Anual:**
   - Product ID: `stride_seeker_premium_yearly`
   - Reference Name: `Premium Yearly`
   - Subscription Duration: `1 Year`
   - Price: `€34.99`
   
   **Oferta Introductoria:**
   - Type: `Free Trial`
   - Duration: `3 Days`
   - Territories: `All Territories`

4. **Configurar Localizaciones:**
   - Español: "Premium Mensual" / "Premium Anual"
   - Inglés: "Premium Monthly" / "Premium Yearly"
   - Descripciones según los archivos de localización

### 3. Crear Sandbox Testers

1. **Ir a Users and Access > Sandbox Testers**
2. **Crear nuevo tester:**
   - Email único (no usar email real de Apple ID)
   - Password seguro
   - Territorio: España (para testing de euros)
   - Fecha de nacimiento: Mayor de edad

## 🧪 Configuración de Testing

### 1. Testing Local con StoreKit

**Ventajas:**
- No requiere conexión a internet
- Transacciones instantáneas
- Fácil reset de estado

**Configuración:**
- Scheme configurado con `Configuration.storekit`
- Productos definidos localmente

### 2. Testing de Sandbox

**Ventajas:**
- Productos reales de App Store Connect
- Testing de renovaciones
- Verificación de receipts reales

**Configuración:**
1. Cambiar scheme para NO usar StoreKit Configuration
2. Usar cuenta sandbox en dispositivo
3. Productos deben estar aprobados en App Store Connect

### 3. Comandos de Debug

```bash
# Limpiar datos de simulador
xcrun simctl privacy booted reset all com.tuapp.bundle

# Ver logs de StoreKit
# En Console.app, filtrar por "StoreKit"

# Reset de testing en dispositivo
# Settings > iTunes & App Store > Sandbox Account > Sign Out
```

## 📱 Integración Web

### 1. Verificar Plugin Capacitor

El plugin `PaywallPlugin` debe estar registrado en:
- `capacitor.config.json` en `packageClassList`
- Importado correctamente en el proyecto iOS

### 2. Usar el Servicio de Suscripción

```typescript
import { subscriptionService, PremiumFeature } from '@/services/subscriptionService';

// Mostrar paywall
await subscriptionService.showPaywall();

// Verificar acceso a feature
const hasAccess = await subscriptionService.hasAccessToFeature(
  PremiumFeature.PERSONALIZED_TRAINING_PLAN
);

// Verificar estado de suscripción
const status = await subscriptionService.checkSubscriptionStatus();
```

### 3. Hook de React

```typescript
import { useSubscription } from '@/services/subscriptionService';

function MyComponent() {
  const { 
    isPremium, 
    isInFreeTrial, 
    trialDaysRemaining, 
    showPaywall 
  } = useSubscription();

  if (!isPremium) {
    return <button onClick={showPaywall}>Upgrade to Premium</button>;
  }

  return <div>Premium Content</div>;
}
```

## 🔒 Configuración de Seguridad

### 1. Receipt Validation

Para producción, implementar validación de receipts en tu backend:

```swift
// En StoreManager.swift, añadir después de purchase exitoso:
if let appStoreReceiptURL = Bundle.main.appStoreReceiptURL,
   FileManager.default.fileExists(atPath: appStoreReceiptURL.path) {
    // Enviar receipt a tu servidor para validación
}
```

### 2. Server-to-Server Notifications

Configurar webhooks en App Store Connect para recibir cambios de estado:
- URL de tu servidor
- Shared Secret para verificación

## 📋 Checklist de Configuración

### Xcode
- [ ] Proyecto abre sin errores
- [ ] Bundle ID configurado
- [ ] Team seleccionado
- [ ] In-App Purchase capability añadida
- [ ] StoreKit Configuration presente
- [ ] Scheme configurado para testing

### App Store Connect
- [ ] App creada
- [ ] Subscription Group creado
- [ ] Productos configurados (mensual y anual)
- [ ] Ofertas introductorias configuradas
- [ ] Localizaciones añadidas
- [ ] Sandbox testers creados

### Testing
- [ ] Testing local funciona
- [ ] Productos cargan correctamente
- [ ] Compras se procesan
- [ ] Estados de suscripción correctos
- [ ] Notificaciones funcionan

### Integración Web
- [ ] Plugin registrado en Capacitor
- [ ] Servicio de suscripción integrado
- [ ] Paywall aparece después de onboarding
- [ ] Control de acceso premium funciona

## ⚠️ Problemas Comunes

### 1. "No products found"
- Verificar Product IDs coinciden exactamente
- En sandbox: productos deben estar "Ready for Sale"
- Verificar conexión a internet

### 2. "Purchase failed"
- Verificar que In-App Purchase capability está añadida
- En sandbox: usar cuenta sandbox válida
- Verificar que no hay compras pendientes

### 3. "Receipt validation failed"
- En desarrollo: usar StoreKit testing
- En sandbox: verificar receipt format
- Verificar shared secret en servidor

### 4. Paywall no aparece
- Verificar que plugin está registrado
- Verificar imports en TypeScript
- Revisar logs de consola para errores

## 🚀 Deploy a Producción

### 1. Preparación
- [ ] Cambiar a productos reales (quitar StoreKit config)
- [ ] Testing completo en TestFlight
- [ ] Screenshots y metadata preparados
- [ ] Políticas de privacidad actualizadas

### 2. Submission
- [ ] Build subido a App Store Connect
- [ ] In-App Purchases en estado "Ready for Sale"
- [ ] App review information completa
- [ ] Submit for review

### 3. Post-Launch
- [ ] Monitorear métricas de conversión
- [ ] Verificar receipts en servidor
- [ ] Responder a reviews de usuarios
- [ ] Optimizar precios basado en datos

¡Con esta configuración tendrás un paywall completamente funcional integrado con tu app de running! 🏃‍♂️💰
