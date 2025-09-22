# 🧪 Configuración Entorno Sandbox Apple Pay

## 📋 Resumen
Esta guía te ayudará a configurar un entorno sandbox completo para probar Apple Pay en tu app Stride Seeker, usando tanto StoreKit testing local como el sandbox real de Apple.

## 🏗️ Configuraciones Disponibles

### 1. **StoreKit Testing Local** (Recomendado para desarrollo)
- ✅ **Ya configurado** en tu proyecto
- ✅ Productos definidos en `Configuration.storekit`
- ✅ No requiere internet
- ✅ Transacciones instantáneas
- ✅ Control total del flujo

### 2. **Apple Sandbox Real** (Para testing más realista)
- 🔄 Productos reales de App Store Connect
- 🔄 Simula flujo real de Apple Pay
- 🔄 Testing de renovaciones automáticas
- 🔄 Validación de receipts reales

## 🚀 Configuración Paso a Paso

### Fase 1: StoreKit Testing Local (YA TIENES ESTO)

Tu configuración actual en `Configuration.storekit`:
```json
{
  "identifier": "2B6A7E30",
  "settings": {
    "storefront": "ESP",
    "_applicationInternalID": "6449434109",
    "_developerTeamID": "XXXXXXXXXX",
    "_locale": "es_ES",
    "_storefront": "ESP"
  },
  "subscriptionGroups": [{
    "name": "Premium Subscription",
    "subscriptions": [
      {
        "productID": "stride_seeker_premium_monthly",
        "displayPrice": "9.99",
        "recurringSubscriptionPeriod": "P1M",
        "introductoryOffer": {
          "paymentMode": "free",
          "subscriptionPeriod": "P3D"
        }
      },
      {
        "productID": "stride_seeker_premium_yearly", 
        "displayPrice": "34.99",
        "recurringSubscriptionPeriod": "P1Y",
        "introductoryOffer": {
          "paymentMode": "free",
          "subscriptionPeriod": "P3D"
        }
      }
    ]
  }]
}
```

### Fase 2: Configurar Apple Sandbox Real

#### A. Crear Productos en App Store Connect

1. **Ir a App Store Connect:**
   - https://appstoreconnect.apple.com
   - Selecciona tu app "Stride Seeker"

2. **Crear Subscription Group:**
   ```
   Nombre: Premium Subscription
   Reference Name: Premium Subscription Group
   ```

3. **Crear Suscripción Mensual:**
   ```
   Product ID: stride_seeker_premium_monthly
   Reference Name: Premium Monthly
   Duration: 1 Month
   Price Tier: €9.99
   
   Oferta Introductoria:
   - Type: Free Trial
   - Duration: 3 Days
   - Territories: All
   ```

4. **Crear Suscripción Anual:**
   ```
   Product ID: stride_seeker_premium_yearly
   Reference Name: Premium Yearly  
   Duration: 1 Year
   Price Tier: €34.99
   
   Oferta Introductoria:
   - Type: Free Trial
   - Duration: 3 Days
   - Territories: All
   ```

#### B. Configurar Sandbox Testers

1. **Users and Access > Sandbox Testers**
2. **Crear nuevo tester:**
   ```
   First Name: Test
   Last Name: Runner
   Email: test.runner.strideseeker@gmail.com
   Password: TestRunner123!
   Date of Birth: 01/01/1990
   Country/Region: Spain
   ```

3. **Crear tester adicional para otros casos:**
   ```
   Email: test.premium.user@gmail.com
   Country: United States (para testing multi-región)
   ```

### Fase 3: Configuración de Xcode

#### A. Configurar Schemes para Testing

1. **StoreKit Local Testing:**
   ```
   Product > Scheme > Edit Scheme
   Run > Options
   StoreKit Configuration: Configuration.storekit
   ```

2. **Sandbox Real Testing:**
   ```
   Product > Scheme > Edit Scheme  
   Run > Options
   StoreKit Configuration: None (usar sandbox real)
   ```

#### B. Crear Script Build Helper

Crear script para cambiar fácilmente entre modos.

## 🧪 Cómo Probar

### Testing Local (StoreKit)

1. **Ejecutar app en simulador:**
   ```bash
   cd ios/App
   open App.xcworkspace
   # Seleccionar scheme con StoreKit Configuration
   # Cmd+R para ejecutar
   ```

2. **Flujo de testing:**
   - Completar onboarding
   - Llegar al paywall
   - Seleccionar plan
   - Apple Pay aparecerá como simulado
   - Verificar compra exitosa

3. **Debug en Xcode:**
   ```
   Console > filtrar por "StoreKit"
   Verás logs de transacciones locales
   ```

### Testing Sandbox Real

1. **Configurar dispositivo:**
   ```
   iPhone/iPad físico (recomendado)
   Settings > App Store > Sandbox Account
   Sign in con: test.runner.strideseeker@gmail.com
   ```

2. **Cambiar scheme a sandbox:**
   - Edit Scheme > StoreKit Configuration: None
   - Build y ejecutar en dispositivo

3. **Probar flujo completo:**
   - Apple Pay mostrará UI real de sandbox
   - Touch ID/Face ID funcionará
   - Receipts reales se generarán

## 📊 Configuración de Monitoreo

### A. Logs de Debug

```swift
// En StoreManager.swift, añadir para debug:
func debugPurchaseFlow(_ product: Product) {
    print("🛒 Iniciando compra: \(product.id)")
    print("💰 Precio: \(product.displayPrice)")
    print("🏪 Storefront: \(product.subscription?.subscriptionGroupID ?? "N/A")")
}
```

### B. Verificación de Estado

```swift
// Verificar entorno actual
func getCurrentEnvironment() -> String {
    #if DEBUG
        if Bundle.main.appStoreReceiptURL?.lastPathComponent == "sandboxReceipt" {
            return "Sandbox"
        } else {
            return "StoreKit Testing"
        }
    #else
        return "Production"
    #endif
}
```

## 🔄 Comandos Útiles

### Reset StoreKit Testing
```bash
# En simulador - Reset purchase history
Device > Erase All Content and Settings

# En Xcode
Product > Clean Build Folder
```

### Reset Sandbox Account
```bash
# En dispositivo físico
Settings > App Store > Sandbox Account > Sign Out
# Volver a entrar con cuenta sandbox
```

### Debug Console Logs
```bash
# En Terminal - ver logs de StoreKit
log stream --predicate 'subsystem == "com.apple.storekit"'
```

## 🎯 Flujos de Testing Específicos

### 1. Testing de Apple Pay UI
```
✅ Verificar Touch ID/Face ID aparece
✅ Verificar precios correctos (€9.99, €34.99)
✅ Verificar trial gratuito de 3 días
✅ Verificar cancelación funciona
✅ Verificar restore purchases
```

### 2. Testing de Estados de Suscripción
```
✅ No suscrito → Ver paywall
✅ Trial activo → Ver días restantes  
✅ Suscripción activa → Acceso premium
✅ Suscripción expirada → Ver paywall
✅ Renovación automática
```

### 3. Testing Multi-Dispositivo
```
✅ Compra en iPhone → Restore en iPad
✅ Compra en sandbox → Verificar en todos dispositivos
✅ Sincronización de estado premium
```

## 🚨 Troubleshooting

### Problema: "No products found"
```bash
# Verificar:
1. Product IDs coinciden exactamente
2. En sandbox: productos "Ready for Sale"  
3. Internet connection activa
4. Sandbox account signed in
```

### Problema: "Purchase failed"
```bash
# Verificar:
1. In-App Purchase capability en Xcode
2. Bundle ID correcto
3. No hay purchases pendientes
4. Sandbox account válida
```

### Problema: Apple Pay no aparece
```bash
# Verificar:
1. Dispositivo físico (no simulador para sandbox real)
2. Touch ID/Face ID configurado
3. Método de pago en Wallet app
4. StoreKit scheme correcto
```

## 📱 Testing en Diferentes Entornos

| Entorno | Ventajas | Desventajas | Cuándo Usar |
|---------|----------|-------------|-------------|
| **StoreKit Local** | Rápido, sin internet, control total | No es 100% realista | Desarrollo diario |
| **Sandbox Real** | Flujo realista, receipts reales | Requiere setup, más lento | Pre-launch testing |
| **TestFlight** | Beta testing real | Solo para testers externos | Testing final |

## 🎉 Próximos Pasos

1. **Actualizar configuración de sandbox** ✅
2. **Crear cuentas sandbox de testing** 
3. **Configurar productos en App Store Connect**
4. **Testing exhaustivo de flujos**
5. **Preparar para TestFlight**

¡Con esta configuración tendrás un entorno sandbox completo para probar Apple Pay! 🍎💳

## 🔗 Enlaces Útiles

- [App Store Connect](https://appstoreconnect.apple.com)
- [StoreKit Testing Guide](https://developer.apple.com/documentation/storekit/in-app_purchase/testing_in-app_purchases_with_storekit_testing_in_xcode)
- [Sandbox Testing Guide](https://developer.apple.com/documentation/storekit/in-app_purchase/testing_in-app_purchases_with_sandbox)
