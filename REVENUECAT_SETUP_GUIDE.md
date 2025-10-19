# 🚀 RevenueCat Setup Guide - Pagos Multiplataforma iOS/Android

## ✅ Lo que ya está configurado:

### 📦 **Instalación Completa**
- ✅ Plugin `@revenuecat/purchases-capacitor` instalado
- ✅ Servicio `revenueCatService.ts` creado
- ✅ PaywallPage.tsx actualizado para usar RevenueCat
- ✅ Configuraciones de Capacitor actualizadas (iOS y Android)
- ✅ Proyecto Android sincronizado

---

## 🔧 Configuración de RevenueCat Dashboard

### 1. **Crear Cuenta en RevenueCat**
1. Ve a https://app.revenuecat.com
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto llamado "BeRun"

### 2. **Configurar Apps en RevenueCat**

#### **App iOS:**
1. **Add App** → **iOS**
2. **Bundle ID**: `stride.seeker.app`
3. **App Name**: `BeRun iOS`
4. **App Store Connect**: Conectar con tu Apple Developer Account

#### **App Android:**
1. **Add App** → **Android** 
2. **Package Name**: `stride.seeker.app`
3. **App Name**: `BeRun Android`
4. **Google Play Console**: Conectar con tu Google Play Developer Account

### 3. **Obtener API Keys**

Después de configurar las apps, obtén las API keys:

#### **Para iOS:**
```
Copia la clave: appl_XXXXXXXXXXXXXXXX
```

#### **Para Android:**
```
Copia la clave: goog_XXXXXXXXXXXXXXXX
```

---

## 🔑 Configurar API Keys en el Código

### Actualizar `revenueCatService.ts`:

```typescript
// En líneas 6-7, reemplaza con tus API keys reales:
const REVENUECAT_API_KEY_IOS = 'appl_TU_CLAVE_IOS_AQUI';
const REVENUECAT_API_KEY_ANDROID = 'goog_TU_CLAVE_ANDROID_AQUI';
```

---

## 📱 Configurar Productos en RevenueCat

### 1. **Crear Entitlements**
1. Ve a **Entitlements** en RevenueCat Dashboard
2. Crea un entitlement llamado: `premium`
3. Descripción: "BeRun Premium Features"

### 2. **Crear Productos**

#### **Producto Mensual:**
- **Product ID**: `berun_premium_monthly`
- **Type**: Subscription
- **Duration**: 1 month
- **Introductory Offer**: 3 days free trial
- **Precio**: €9.99/mes

#### **Producto Anual:**
- **Product ID**: `berun_premium_yearly` 
- **Type**: Subscription
- **Duration**: 1 year
- **Introductory Offer**: 3 days free trial
- **Precio**: €34.99/año

### 3. **Crear Offerings**
1. Ve a **Offerings** en RevenueCat Dashboard
2. Crea un offering llamado: `default`
3. Añade ambos productos (monthly y yearly)

---

## 🍎 Configuración iOS (App Store Connect)

### 1. **Crear Productos en App Store Connect**
1. Ve a https://appstoreconnect.apple.com
2. **Tu App** → **Features** → **In-App Purchases**
3. Crear productos con **exactamente** estos IDs:
   - `berun_premium_monthly`
   - `berun_premium_yearly`
4. **Configurar trial de 3 días** para ambos productos

### 2. **Sincronizar con RevenueCat**
- RevenueCat automáticamente detectará los productos
- Verifica que aparezcan en RevenueCat Dashboard

---

## 🤖 Configuración Android (Google Play Console)

### 1. **Crear Productos en Google Play Console**
1. Ve a https://play.google.com/console
2. **Tu App** → **Monetización** → **Productos** → **Suscripciones**
3. Crear suscripciones con **exactamente** estos IDs:
   - `berun_premium_monthly`
   - `berun_premium_yearly`
4. **Configurar trial de 3 días** para ambos productos

### 2. **Configurar Service Account**
1. En Google Play Console: **Setup** → **API access**
2. Crear o vincular Service Account
3. Otorgar permisos de **"Administrador de finanzas"**
4. Descargar JSON key
5. Subir JSON key a RevenueCat Dashboard

---

## 🧪 Testing

### **Testing iOS:**
1. **StoreKit Testing Local**: Ya configurado con `Configuration.storekit`
2. **Sandbox Real**: Usar cuenta sandbox de Apple
3. **TestFlight**: Para testing final

### **Testing Android:**
1. **Google Play Console**: Crear cuenta de testing
2. **Internal Testing**: Configurar grupo de testing interno
3. **Closed Testing**: Para testing más amplio

---

## 🔄 Flujo de Compra

### **El flujo ahora funciona así:**

1. **Usuario selecciona plan** en PaywallPage
2. **RevenueCat detecta plataforma** (iOS/Android)
3. **Muestra UI nativa**:
   - **iOS**: Apple Pay con Touch ID/Face ID
   - **Android**: Google Pay con método de pago configurado
4. **RevenueCat maneja todo**:
   - Validación de receipts
   - Sincronización entre dispositivos
   - Restaurar compras
   - Analytics de conversión

---

## 🚀 Comandos para Testing

### **Build para testing:**
```bash
# Android
npm run build
npx cap sync android
npx cap open android

# iOS (cuando se resuelva el problema de CocoaPods)
npm run build
export LANG=en_US.UTF-8
npx cap sync ios
npx cap open ios
```

### **Verificar integración:**
```bash
# Ver logs de RevenueCat en desarrollo
# Los logs aparecerán en la consola del navegador/device
```

---

## 🎯 Siguientes Pasos

### **1. Inmediato (Hoy):**
- [ ] Crear cuenta RevenueCat
- [ ] Obtener API keys
- [ ] Actualizar `revenueCatService.ts` con API keys reales
- [ ] Configurar productos en RevenueCat Dashboard

### **2. Esta Semana:**
- [ ] Configurar productos en App Store Connect
- [ ] Configurar productos en Google Play Console  
- [ ] Testing en dispositivos reales
- [ ] Verificar flujo completo de compra

### **3. Antes del Lanzamiento:**
- [ ] Testing exhaustivo en ambas plataformas
- [ ] Configurar webhooks de RevenueCat (opcional)
- [ ] Monitoreo de conversión
- [ ] Documentar flujo para soporte al cliente

---

## 💡 Ventajas de RevenueCat

### **Vs. Configuración Manual:**
- ✅ **Simplifica** gestión de suscripciones
- ✅ **Unifica** iOS y Android en un solo código
- ✅ **Maneja** validación de receipts automáticamente
- ✅ **Proporciona** analytics detallados
- ✅ **Sincroniza** compras entre dispositivos
- ✅ **Gratis** hasta $10k MRR

### **Funcionalidades Avanzadas:**
- 📊 **Dashboard analytics** en tiempo real
- 🔄 **Cross-platform restoration** automática
- 📈 **A/B testing** de precios y offerings
- 🎯 **Customer segmentation**
- 📧 **Integración con tools de marketing**

---

## ⚠️ Importante

### **Claves de Seguridad:**
- ⚠️ **NUNCA** commitear API keys a Git
- ✅ Usar variables de entorno en producción
- ✅ Rotar keys periódicamente

### **Testing:**
- ⚠️ **SIEMPRE** probar en dispositivos reales antes del lanzamiento
- ✅ Usar cuentas sandbox para testing
- ✅ Verificar flujo completo: compra → validación → acceso

### **Producción:**
- ⚠️ **VERIFICAR** que productos estén "Ready to Submit" en stores
- ✅ Tener plan de rollback en caso de problemas
- ✅ Monitorear logs y analytics post-lanzamiento

---

## 📞 Soporte

- **RevenueCat Docs**: https://docs.revenuecat.com
- **RevenueCat Support**: https://community.revenuecat.com
- **Capacitor Plugin**: https://github.com/RevenueCat/purchases-capacitor

¡Tu app ahora está preparada para manejar pagos multiplataforma de manera profesional! 🎉
