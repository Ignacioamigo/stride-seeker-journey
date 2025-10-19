# 🎯 Próximos Pasos - Android Google Pay

## ✅ LO QUE YA ESTÁ HECHO

### **Código:**
- ✅ Build completado sin errores
- ✅ Android sincronizado correctamente
- ✅ PaywallModal actualizado con compras reales
- ✅ iOS intacto y funcionando

### **Google Play Console:**
- ✅ Suscripciones creadas:
  - `berun_premium_monthly` - €9.99/mes
  - `berun_premium_yearly` - €34.99/año

### **Plugins Capacitor Android:**
```
✅ @capacitor-community/background-geolocation@1.2.22
✅ @capacitor/app@7.0.2
✅ @capacitor/browser@7.0.2
✅ @capacitor/geolocation@7.1.2
✅ @capacitor/google-maps@7.1.0
✅ @capacitor/status-bar@7.0.3
✅ @revenuecat/purchases-capacitor@11.2.3
```

---

## 📋 SIGUIENTE: Configurar RevenueCat (15 minutos)

### **PASO 1: Service Account de Google Play (5 min)**

1. **Google Play Console:**
   ```
   https://play.google.com/console
   ```

2. **Navegar:**
   ```
   Configuración → Acceso a la API
   ```

3. **Crear Service Account:**
   - Click **"Crear nueva cuenta de servicio"**
   - Te redirige a Google Cloud Console
   - Nombre: `BeRun RevenueCat Service`
   - Crear y continuar

4. **Otorgar permisos en Google Play:**
   - Volver a Google Play Console
   - Click **"Otorgar acceso"** en la cuenta creada
   - Permisos: **"Administrador de finanzas (solo ver)"**
   - También marcar: **"Ver información de la aplicación"**
   - Enviar invitación

5. **Descargar JSON Key:**
   - Click en la cuenta de servicio
   - Claves → Agregar clave → Crear clave nueva
   - Tipo: **JSON**
   - Descargar y **GUARDAR DE FORMA SEGURA**

---

### **PASO 2: RevenueCat Dashboard (10 min)**

1. **Ir a RevenueCat:**
   ```
   https://app.revenuecat.com
   ```

2. **Añadir App Android:**
   - Apps → + Add App
   - Plataforma: **Google Play Store**
   - App name: `BeRun Android`
   - Bundle ID: `stride.seeker.app`

3. **Subir Service Account JSON:**
   - Google Play Service Credentials
   - Upload JSON (archivo del paso 1.5)
   - Save

4. **Crear Entitlement:**
   - Entitlements → + New
   - Identifier: `premium`
   - Display Name: `BeRun Premium`
   - Save

5. **Crear Productos:**
   - Products → + New
   
   **Producto 1:**
   ```
   Product ID: berun_premium_monthly
   App: BeRun Android (Google Play)
   Type: Subscription
   ```
   
   **Producto 2:**
   ```
   Product ID: berun_premium_yearly
   App: BeRun Android (Google Play)
   Type: Subscription
   ```

6. **Crear Offering:**
   - Offerings → + New
   - Identifier: `default`
   - Description: `BeRun Default Offering`
   
   **Añadir paquetes:**
   - Package 1: `monthly` → berun_premium_monthly → premium
   - Package 2: `yearly` → berun_premium_yearly → premium
   
   - **Set as current offering** → ON
   - Save

---

## 🧪 TESTING (10 minutos)

### **1. Configurar License Testing:**

**Google Play Console:**
```
Configuración → Testing de licencias
```
- Añadir tu email de Google
- Respuesta: **"LICENSED"**
- Guardar

---

### **2. Build y Probar:**

```bash
# Abrir Android Studio
npx cap open android
```

**En Android Studio:**
1. Conectar dispositivo Android (físico o emulador)
2. Seleccionar **debug** variant
3. Click **Run** (▶️)

**En el dispositivo:**
1. Abrir BeRun
2. Completar onboarding
3. Llegar al paywall
4. Seleccionar plan
5. Click "Iniciar mi prueba gratuita de 3 días"

**Debe aparecer:**
- ✅ Google Pay modal
- ✅ "3 días gratis"
- ✅ Precio correcto
- ✅ Método de pago

---

## 🔍 VERIFICACIÓN

### **En RevenueCat Dashboard:**
```
Dashboard → Customers
```
- Buscar tu usuario
- Verificar suscripción activa
- Verificar entitlement "premium"

### **En Google Play Console:**
```
Monetización → Pedidos de suscripción
```
- Verificar aparece la suscripción
- Estado: "Activa"
- Trial activo

---

## ⚠️ TROUBLESHOOTING

### **"No products available"**
- Productos deben estar **"Activos"** en Google Play
- IDs deben coincidir exactamente
- Esperar 2-3 horas propagación Google

### **"Purchase failed"**
- Verificar Service Account JSON subido
- Verificar email en License Testing
- Ver logs: `adb logcat | grep -i revenuecat`

### **Google Pay no aparece**
- Debe ser dispositivo Android real
- Verificar logs consola: `🤖 Iniciando compra Android...`

---

## 📱 COMANDOS ÚTILES

### **Build y Testing:**
```bash
# Build
npm run build

# Sync Android (no toca iOS)
npx cap sync android

# Abrir Android Studio
npx cap open android

# Ver logs
adb logcat | grep -i revenuecat
```

### **Verificar configuración:**
```bash
./scripts/verify-android-payment.sh
```

---

## 📊 ESTADO ACTUAL

```
✅ Código: 100% Completo
✅ Build: Exitoso
✅ Android: Sincronizado
✅ iOS: Intacto (sin cambios)
✅ Suscripciones Google Play: Creadas

⏳ RevenueCat Dashboard: Pendiente (15 min)
⏳ Testing: Pendiente (10 min)
```

---

## 🎯 RESUMEN

### **HOY (25 minutos):**
1. ✅ Configurar Service Account (5 min)
2. ✅ Configurar RevenueCat Dashboard (10 min)
3. ✅ Testing en dispositivo Android (10 min)

### **RESULTADO:**
- ✅ iOS: Apple Pay funcionando (sin cambios)
- ✅ Android: Google Pay funcionando
- ✅ Ambas plataformas operativas

---

## 📂 DOCUMENTACIÓN COMPLETA

- **Guía detallada:** `REVENUECAT_ANDROID_SETUP.md`
- **Estado actual:** `ANDROID_PAYMENT_STATUS.md`
- **Este documento:** `PROXIMOS_PASOS_ANDROID.md`

---

## 🚀 ACCIÓN INMEDIATA

**AHORA:**
1. Abrir Google Play Console
2. Crear Service Account
3. Descargar JSON
4. Ir a RevenueCat
5. Configurar según PASO 2
6. Testing según sección TESTING

**Total: 25 minutos** → Google Pay funcionando! 🎉

---

¡Todo listo para completar la configuración! 💪


