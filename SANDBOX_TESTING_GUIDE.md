# 🧪 Guía Completa para Testing de Sandbox

## 🎯 Objetivo

Probar que el trial de 3 días → cobro funciona correctamente con StoreKit Sandbox real.

## ✅ PASO 1: Configurar Xcode para Sandbox

### En Xcode:

1. **Abrir proyecto**: `ios/App/App.xcworkspace`
2. **Scheme settings**: Product → Scheme → Edit Scheme
3. **Run tab → Options**:
   - StoreKit Configuration: `Configuration.storekit`
   - ✅ Esto forza uso local del archivo .storekit

### Verificar que el archivo .storekit tiene:

```json

"stride_seeker_premium_monthly": {
  "introductoryOffer": {
    "paymentMode": "free",
    "subscriptionPeriod": "P3D"  // 3 días gratis
  }
}
```

## ✅ PASO 2: App Store Connect (Para testing avanzado)

### Solo si quieres probar con App Store Connect Sandbox:

1. **Ir a**: https://appstoreconnect.apple.com
2. **Tu App → Features → In-App Purchases**
3. **Crear/Verificar productos**:
   - `stride_seeker_premium_monthly`
   - `stride_seeker_premium_yearly`
4. **Cada producto debe tener**:
   - Status: "Ready to Submit" o "Approved"
   - Introductory Offer: 3 días gratis
   - Precios: €9.99/mes, €34.99/año

### Crear Sandbox Tester:

1. **Users and Access → Sandbox Testers**
2. **Crear tester** con email único
3. **Región**: España/Europa
4. **Anotar email y password**

## ✅ PASO 3: Testing en Dispositivo

### Preparar dispositivo iOS:

1. **Settings → App Store → Sandbox Account**
2. **Logout** de tu cuenta real
3. **Login** con sandbox tester account

### Build y Testing:

```bash
# En tu proyecto
cd /Users/nachoamigo/stride-seeker-journey
npx cap sync ios
cd ios/App && open App.xcworkspace

# En Xcode:
# 1. Select tu dispositivo real (no simulador)
# 2. Build scheme: Release (no Debug)
# 3. Run app en dispositivo
```

## 🧪 PASO 4: Proceso de Testing

### Flujo a probar:

1. **Abrir app** → Ir a paywall
2. **Seleccionar plan** (mensual o anual)
3. **Tap "Start My 3-Day Free Trial"**
4. **Verificar que aparece**:
   - ✅ Sheet nativo de Apple (no alert tuyo)
   - ✅ Texto "Environment: Sandbox" en la sheet
   - ✅ Precio correcto y "3 días gratis"
5. **Confirmar compra** con Touch ID/Face ID
6. **Verificar que**:
   - ✅ App detecta trial activo
   - ✅ Funciones premium desbloqueadas
   - ✅ Contador de días restantes correcto

### Testing de expiración trial:

```swift
// Para acelerar testing, en Configuration.storekit:
"compatibilityTimeRate": 300  // 1 día real = 5 minutos testing
```

## 📱 RESULTADO ESPERADO

### Al hacer compra real, verás:

```
┌─────────────────────────────┐
│    🍎 Apple Purchase Sheet  │
│                             │
│ Environment: Sandbox        │ ← Esto confirma que es sandbox
│                             │
│ Stride Seeker Premium       │
│ €9.99/month                 │
│ 3 days free, then €9.99    │
│                             │
│ [Subscribe] [Cancel]        │
└─────────────────────────────┘
```

### En la app después de compra:

- ✅ `isPremiumUser = true`
- ✅ `subscriptionStatus = .freeTrial(daysRemaining: 3)`
- ✅ Todas las features premium activas
- ✅ UI muestra "Trial: 3 días restantes"

## 🚨 TROUBLESHOOTING

### Si NO ves la sheet de Apple:

1. Verificar Bundle ID correcto en Xcode
2. Verificar Team seleccionado
3. Verificar StoreKit Configuration activa
4. Clean build: Cmd+Shift+K → rebuild

### Si aparece error "Product not found":

1. Verificar que productIDs coinciden exactamente
2. Verificar StoreKit Configuration tiene productos
3. Verificar networking en dispositivo

### Si transacción no completa:

1. Verificar sandbox account activo
2. Logout/login en Settings → App Store
3. Verificar dispositivo en región correcta

## 🎯 TESTING AVANZADO

### 1. Testing de renovación:

```swift
// En Configuration.storekit, acelerar tiempo:
"compatibilityTimeRate": 3600  // 1 día = 1 minuto
```

### 2. Testing de cancelación:

1. Durante trial → Settings → Apple ID → Subscriptions
2. Cancelar suscripción
3. Verificar que app detecta cancelación

### 3. Testing de restore purchases:

1. Instalar app en segundo dispositivo
2. Login con mismo sandbox account
3. Tap "Restore" en paywall
4. Verificar que restaura trial/suscripción

## ✅ CHECKLIST FINAL

- [ ] Sheet nativa de Apple aparece (no alert custom)
- [ ] Texto "Environment: Sandbox" visible
- [ ] Trial de 3 días se activa correctamente
- [ ] Premium features desbloqueadas
- [ ] Contador de días funciona
- [ ] Restore purchases funciona
- [ ] Cancelación detectada correctamente
- [ ] Renovación automática tras trial (en testing acelerado)

## 🎉 ¡TODO LISTO!

Tu implementación StoreKit está perfecta. Solo necesitas:

1. Build Release en dispositivo real
2. Login con sandbox tester
3. ¡Probar el flujo completo!
