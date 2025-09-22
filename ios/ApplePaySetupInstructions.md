# 🍎 Configuración Apple Pay/Touch ID - Instrucciones Rápidas

## ✅ **Lo que he implementado:**

1. **✅ Integración nativa** con StoreKit 2
2. **✅ Método `purchaseProduct`** en el plugin que activa Apple Pay/Touch ID
3. **✅ Detección automática** - usa nativo en dispositivo, fallback en simulador
4. **✅ Manejo de errores** completo

## 🔧 **Configuración requerida en Xcode:**

### 1. **Añadir archivos Swift al proyecto**
Los archivos ya están creados, pero necesitas añadirlos manualmente:

1. **Abrir Xcode**: `cd ios/App && open App.xcworkspace`
2. **Click derecho** en grupo `App` → "Add Files to 'App'..."
3. **Seleccionar estos archivos**:
   - `Configuration.storekit`
   - `Store/StoreManager.swift`
   - `Store/SubscriptionManager.swift`
   - `Views/PaywallView.swift`
   - `Plugins/PaywallPlugin.swift`
   - `es.lproj/Localizable.strings`
   - `en.lproj/Localizable.strings`

### 2. **Configurar StoreKit Testing**
1. **Product** → **Scheme** → **Edit Scheme**
2. **Run** → **Options** tab
3. **StoreKit Configuration**: Seleccionar `Configuration.storekit`

### 3. **Verificar Capabilities**
En target `App` → **Signing & Capabilities**:
- ✅ **In-App Purchase** (debe estar añadido)

## 🧪 **Cómo funciona ahora:**

### **En Simulador:**
- Muestra alert: "En dispositivo real aparecería Apple Pay/Touch ID"
- Simula compra exitosa

### **En Dispositivo Real:**
- **Aparecerá el diálogo nativo** de Apple Pay/Touch ID
- **Precios reales**: €9.99/mes, €34.99/año
- **Prueba gratuita**: 3 días automáticos
- **Cobro automático** después de 3 días

## 🎯 **Flujo completo:**

```
1. Usuario completa onboarding
2. Ve las 3 páginas: Setup → Felicitaciones → Paywall
3. Selecciona plan (anual/mensual)
4. Toca "Iniciar mi prueba gratuita de 3 días"
5. 📱 APARECE APPLE PAY/TOUCH ID (en dispositivo real)
6. Usuario confirma con Touch ID/Face ID
7. ✅ Suscripción activada con 3 días gratis
8. 💰 Cobro automático después de 3 días
```

## 🚀 **Para probar:**

1. **Compilar en Xcode** con configuración correcta
2. **Ejecutar en dispositivo real** (no simulador)
3. **Completar onboarding** → Llegar al paywall
4. **Seleccionar plan** → Tocar botón de compra
5. **¡Debería aparecer Apple Pay/Touch ID!**

## ⚠️ **Notas importantes:**

- **Simulador**: Solo muestra fallback (mensaje simulado)
- **Dispositivo real**: Muestra Apple Pay/Touch ID real
- **StoreKit Configuration**: Debe estar seleccionada para testing
- **Productos**: Configurados con prueba gratuita de 3 días

## 🐛 **Si no funciona:**

1. **Verificar** que archivos Swift están en el proyecto
2. **Verificar** StoreKit Configuration seleccionada
3. **Limpiar build**: Product → Clean Build Folder
4. **Probar en dispositivo real**, no simulador

---

**¡Ahora tu app tiene Apple Pay/Touch ID real integrado!** 🍎💳
