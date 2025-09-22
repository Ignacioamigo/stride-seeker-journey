# 🧪 Scripts de Testing Apple Pay

Esta carpeta contiene scripts útiles para configurar y probar Apple Pay en diferentes entornos.

## 📁 Scripts Disponibles

### 🔍 `verify-apple-pay-setup.sh`
**Propósito:** Verifica que toda la configuración de Apple Pay está correcta

**Uso:**
```bash
cd ios/App/Scripts
./verify-apple-pay-setup.sh
```

**Lo que verifica:**
- ✅ Archivos de configuración existen
- ✅ StoreKit Configuration correcta
- ✅ Product IDs configurados
- ✅ Localizaciones presentes
- ✅ Estructura del proyecto

### 🧪 `sandbox-testing.sh`
**Propósito:** Facilita el cambio entre diferentes entornos de testing

**Uso:**
```bash
cd ios/App/Scripts
./sandbox-testing.sh
```

**Opciones disponibles:**
1. **StoreKit Testing Local** - Desarrollo rápido y offline
2. **Apple Sandbox Real** - Testing realista con Apple Pay real
3. **Ver estado actual** - Información del proyecto
4. **Limpiar datos** - Reset de historial de compras
5. **Configurar cuentas** - Información de cuentas sandbox
6. **Debug logs** - Comandos para debugging

## 🚀 Flujo Recomendado

### 1. Primera Verificación
```bash
./verify-apple-pay-setup.sh
```
Ejecuta este script primero para asegurar que todo está configurado correctamente.

### 2. Configurar Entorno de Testing
```bash
./sandbox-testing.sh
```
Selecciona el entorno que quieres usar y sigue las instrucciones.

### 3. Testing
- **Para desarrollo diario:** Usa StoreKit Testing Local
- **Para testing pre-lanzamiento:** Usa Apple Sandbox Real

## 🔧 Configuración de Entornos

### StoreKit Testing Local
- ✅ **Ventajas:** Rápido, offline, control total
- 🎯 **Uso:** Desarrollo diario
- 📱 **Dispositivos:** Simulador o dispositivo físico
- ⚙️ **Setup:** Scheme con Configuration.storekit

### Apple Sandbox Real  
- ✅ **Ventajas:** Apple Pay real, Touch ID/Face ID
- 🎯 **Uso:** Testing pre-lanzamiento
- 📱 **Dispositivos:** Solo dispositivo físico
- ⚙️ **Setup:** Scheme sin StoreKit Configuration + cuenta sandbox

## 📱 Cuentas Sandbox

### España (Principal)
```
Email: test.runner.strideseeker@gmail.com
Password: TestRunner123!
País: España
Moneda: EUR
```

### USA (Testing multi-región)
```
Email: test.premium.user@gmail.com
Password: TestPremium123!
País: United States
Moneda: USD
```

## 🔍 Debugging

### Logs útiles
```bash
# Ver logs de StoreKit en tiempo real
log stream --predicate 'subsystem == "com.apple.storekit"'

# Ver logs de la app
log stream --predicate 'process == "App"'
```

### Console.app
- Filtrar por: 'StoreKit' o 'transaction'
- Buscar mensajes de error específicos

## ⚠️ Problemas Comunes

### "No products found"
- ✅ Verificar Product IDs coinciden exactamente
- ✅ En sandbox: productos "Ready for Sale"
- ✅ Conexión a internet activa

### "Purchase failed" 
- ✅ In-App Purchase capability en Xcode
- ✅ Bundle ID correcto
- ✅ Sandbox account válida

### Apple Pay no aparece
- ✅ Dispositivo físico (requerido para sandbox)
- ✅ Touch ID/Face ID configurado
- ✅ Método de pago en Wallet app

## 📋 Checklist de Testing

### Antes de testing
- [ ] Ejecutar `verify-apple-pay-setup.sh`
- [ ] Configurar entorno con `sandbox-testing.sh`
- [ ] Verificar dispositivo y cuenta configurados

### Durante testing
- [ ] Completar onboarding en app
- [ ] Llegar al paywall
- [ ] Probar ambos planes (mensual/anual)
- [ ] Verificar Apple Pay aparece
- [ ] Confirmar compra exitosa
- [ ] Verificar estado premium activado

### Después de testing
- [ ] Verificar logs para errores
- [ ] Documentar cualquier problema
- [ ] Limpiar datos si es necesario

## 🔗 Enlaces Útiles

- [App Store Connect](https://appstoreconnect.apple.com)
- [StoreKit Testing Guide](https://developer.apple.com/documentation/storekit/in-app_purchase/testing_in-app_purchases_with_storekit_testing_in_xcode)
- [Sandbox Testing Guide](https://developer.apple.com/documentation/storekit/in-app_purchase/testing_in-app_purchases_with_sandbox)

---

**💡 Tip:** Siempre ejecuta `verify-apple-pay-setup.sh` después de hacer cambios en la configuración para asegurar que todo sigue funcionando correctamente.
