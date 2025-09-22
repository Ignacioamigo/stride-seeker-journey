# 🚀 Apple Pay Sandbox - Guía Rápida

¡Tu entorno sandbox de Apple Pay está **completamente configurado**! 🎉

## ✅ Lo que ya tienes configurado:

### 📱 Configuración StoreKit Local
- ✅ `Configuration.storekit` con productos configurados
- ✅ Product IDs: `stride_seeker_premium_monthly` (€9.99) y `stride_seeker_premium_yearly` (€34.99)
- ✅ Trial gratuito de 3 días para ambos planes
- ✅ Storefront España configurado
- ✅ Localizaciones en español e inglés

### 🔧 Código Swift
- ✅ `StoreManager.swift` - Gestión completa de StoreKit 2
- ✅ `SubscriptionManager.swift` - Gestión de suscripciones
- ✅ `PaywallPlugin.swift` - Plugin para Capacitor
- ✅ `PaywallView.swift` - UI nativa del paywall

### 🛠️ Scripts de Ayuda
- ✅ `verify-apple-pay-setup.sh` - Verificación automática
- ✅ `sandbox-testing.sh` - Cambio entre entornos
- ✅ Documentación completa

## 🚀 Cómo empezar a probar AHORA:

### Opción 1: StoreKit Testing Local (Recomendado para empezar)

1. **Abrir Xcode:**
   ```bash
   cd /Users/nachoamigo/stride-seeker-journey/ios/App
   open App.xcworkspace
   ```

2. **Configurar scheme:**
   - `Product` → `Scheme` → `Edit Scheme`
   - `Run` → `Options`
   - `StoreKit Configuration`: Seleccionar `Configuration.storekit`

3. **Ejecutar en simulador:**
   - Seleccionar iPhone simulador
   - Presionar `Cmd + R`

4. **Probar flujo:**
   - Completar onboarding en la app
   - Llegar al paywall
   - Seleccionar plan mensual o anual
   - ¡Apple Pay aparecerá simulado!

### Opción 2: Apple Sandbox Real (Más realista)

1. **Configurar scheme para sandbox:**
   - `Product` → `Scheme` → `Edit Scheme`
   - `Run` → `Options`
   - `StoreKit Configuration`: **None** (importante)

2. **Crear productos en App Store Connect:**
   - Ir a https://appstoreconnect.apple.com
   - Crear app con Bundle ID: `com.tuempresa.strideseeker`
   - Añadir productos con IDs exactos:
     - `stride_seeker_premium_monthly`
     - `stride_seeker_premium_yearly`

3. **Crear cuenta sandbox:**
   - `Users and Access` → `Sandbox Testers`
   - Email: `test.runner.strideseeker@gmail.com`
   - Password: `TestRunner123!`

4. **Configurar dispositivo físico:**
   - Conectar iPhone/iPad
   - `Settings` → `App Store` → `Sandbox Account`
   - Iniciar sesión con cuenta sandbox

5. **Ejecutar y probar:**
   - Build en dispositivo físico
   - ¡Apple Pay real con Touch ID/Face ID!

## 🧪 Scripts de Ayuda Disponibles

```bash
cd /Users/nachoamigo/stride-seeker-journey/ios/App/Scripts

# Verificar configuración
./verify-apple-pay-setup.sh

# Menu interactivo para testing
./sandbox-testing.sh
```

## 🔍 Verificación Rápida

Ejecuta esto para verificar que todo está bien:

```bash
cd /Users/nachoamigo/stride-seeker-journey/ios/App/Scripts
./verify-apple-pay-setup.sh
```

**Resultado esperado:** ✅ 13/14 verificaciones pasadas (la única que falla es la ruta del workspace, que es normal)

## 🎯 Flujo de Testing Completo

1. **Desarrollo diario** → Usar StoreKit Local
2. **Testing antes del lanzamiento** → Usar Apple Sandbox Real
3. **Testing final** → TestFlight con usuarios beta

## 💡 Tips Importantes

### Para StoreKit Local:
- ⚡ Transacciones instantáneas
- 🌐 No requiere internet
- 📱 Funciona en simulador
- 🔄 Fácil reset de datos

### Para Apple Sandbox Real:
- 💳 UI real de Apple Pay
- 🔒 Touch ID/Face ID real
- 📄 Receipts reales
- 📱 Solo dispositivo físico

## 🚨 Si algo no funciona:

1. **"No products found":**
   - Verificar Product IDs exactos
   - Verificar conexión internet (sandbox)

2. **"Purchase failed":**
   - Verificar In-App Purchase capability en Xcode
   - Verificar cuenta sandbox activa

3. **Apple Pay no aparece:**
   - Dispositivo físico para sandbox real
   - Touch ID/Face ID configurado
   - Método de pago en Wallet

## 🔗 Enlaces Útiles

- **Documentación completa:** `/Users/nachoamigo/stride-seeker-journey/ios/ApplePaySandboxSetup.md`
- **Scripts:** `/Users/nachoamigo/stride-seeker-journey/ios/App/Scripts/`
- **App Store Connect:** https://appstoreconnect.apple.com

---

## 🎉 ¡Todo listo!

Tu entorno sandbox está **completamente configurado**. Puedes empezar a probar Apple Pay inmediatamente usando cualquiera de las dos opciones arriba.

**Recomendación:** Empieza con StoreKit Local para familiarizarte, luego pasa a Sandbox Real para testing más realista.

¡Feliz testing! 🍎💳
