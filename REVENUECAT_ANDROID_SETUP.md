# 🤖 Configuración RevenueCat para Android - Paso a Paso

## ✅ Ya Completado:
- ✅ Suscripciones creadas en Google Play Console
- ✅ Código Android implementado
- ✅ API Key configurada
- ✅ iOS intacto (sin cambios)

---

## 🎯 Siguiente Paso: Configurar RevenueCat Dashboard

### **Tiempo estimado: 15 minutos**

---

## 📋 PASO 1: Conectar Google Play con RevenueCat

### 1.1 - Crear Service Account en Google Play Console

1. **Ir a Google Play Console:**
   ```
   https://play.google.com/console
   ```

2. **Navegar a API Access:**
   ```
   Configuración → Acceso a la API
   ```

3. **Crear nueva cuenta de servicio:**
   - Click en **"Crear nueva cuenta de servicio"**
   - Te redirigirá a Google Cloud Console

4. **En Google Cloud Console:**
   - Nombre de cuenta: `BeRun RevenueCat Service`
   - ID de cuenta: `berun-revenuecat` (se genera automático)
   - Click **"Crear y continuar"**

5. **Otorgar permisos:**
   - Seleccionar rol: **"Service Account User"**
   - Click **"Continuar"** y luego **"Listo"**

6. **Volver a Google Play Console:**
   - Verás la cuenta de servicio creada
   - Click en **"Otorgar acceso"**
   - Permisos: Seleccionar **"Administrador de finanzas (solo ver)"**
   - **IMPORTANTE:** También marcar **"Ver información de la aplicación"**
   - Click **"Invitar usuario"** y luego **"Enviar invitación"**

7. **Descargar JSON Key:**
   - Click en la cuenta de servicio que acabas de crear
   - Click en **"Claves"** → **"Agregar clave"** → **"Crear clave nueva"**
   - Tipo: **JSON**
   - Click **"Crear"**
   - Se descargará automáticamente el archivo JSON
   - **GUARDAR ESTE ARCHIVO DE FORMA SEGURA**

---

## 📋 PASO 2: Configurar RevenueCat Dashboard

### 2.1 - Añadir App Android en RevenueCat

1. **Ir a RevenueCat:**
   ```
   https://app.revenuecat.com
   ```

2. **Ir a tu proyecto** (o crear uno nuevo si no existe)

3. **Añadir app Android:**
   - Click en **"Apps"** en el menú izquierdo
   - Click **"+ Add App"**
   - Plataforma: **Google Play Store**
   - App name: `BeRun Android`
   - Bundle ID: `stride.seeker.app`

4. **Subir Service Account JSON:**
   - En la sección **"Google Play Service Credentials"**
   - Click **"Upload JSON"**
   - Seleccionar el archivo JSON descargado en el paso 1.7
   - Click **"Save"**

✅ **Verificación:** Debería aparecer un mensaje de éxito indicando que la conexión fue exitosa.

---

### 2.2 - Configurar Entitlements

1. **Ir a Entitlements:**
   - Click en **"Entitlements"** en el menú izquierdo
   - Click **"+ New"**

2. **Crear entitlement:**
   ```yaml
   Identifier: premium
   Display Name: BeRun Premium
   Description: Access to all premium features
   ```

3. Click **"Save"**

---

### 2.3 - Crear Productos

1. **Ir a Products:**
   - Click en **"Products"** en el menú izquierdo
   - Click **"+ New"**

2. **Producto Mensual:**
   ```yaml
   Product ID: berun_premium_monthly
   App: BeRun Android (Google Play)
   Type: Subscription
   ```
   - Click **"Add"**

3. **Producto Anual:**
   ```yaml
   Product ID: berun_premium_yearly
   App: BeRun Android (Google Play)
   Type: Subscription
   ```
   - Click **"Add"**

---

### 2.4 - Crear Offering

1. **Ir a Offerings:**
   - Click en **"Offerings"** en el menú izquierdo
   - Click **"+ New"**

2. **Crear offering default:**
   ```yaml
   Identifier: default
   Description: BeRun Default Offering
   ```

3. **Añadir paquetes:**
   
   **Paquete 1 - Mensual:**
   ```yaml
   Identifier: monthly
   Product: berun_premium_monthly
   Entitlement: premium
   ```

   **Paquete 2 - Anual:**
   ```yaml
   Identifier: yearly
   Product: berun_premium_yearly
   Entitlement: premium
   ```

4. **Marcar como Current Offering:**
   - Toggle **"Set as current offering"** → ON
   - Click **"Save"**

---

## 📋 PASO 3: Configurar Testing

### 3.1 - Añadir Testers en Google Play Console

1. **Google Play Console:**
   ```
   https://play.google.com/console
   ```

2. **Ir a License Testing:**
   ```
   Configuración → Testing de licencias
   ```

3. **Añadir emails de testing:**
   - Añadir tu email de Google
   - Respuesta de prueba de licencia: **"LICENSED"**
   - Click **"Guardar"**

### 3.2 - Crear Track de Testing Interno

1. **Ir a Testing:**
   ```
   Testing → Testing interno
   ```

2. **Crear nueva versión:**
   - Click **"Crear nueva versión"**
   - Subir AAB (lo generaremos después)

3. **Añadir testers:**
   - Crear lista de testers
   - Añadir emails para testing
   - Click **"Guardar"**

---

## 🚀 PASO 4: Build y Testing

### 4.1 - Generar Build de Android

```bash
# 1. Build del proyecto
npm run build

# 2. Sincronizar con Android (SOLO Android, no afecta iOS)
npx cap sync android

# 3. Abrir en Android Studio
npx cap open android
```

### 4.2 - Testing en Dispositivo

**En Android Studio:**

1. **Conectar dispositivo Android** (físico o emulador)
2. **Seleccionar variante:** `debug`
3. **Click en Run** (▶️)

**En el dispositivo:**

1. Abrir **BeRun**
2. Completar onboarding
3. Llegar al **paywall**
4. **Seleccionar plan** (mensual o anual)
5. **Click en "Iniciar mi prueba gratuita de 3 días"**

**Debe ocurrir:**
- ✅ Se abre Google Play modal
- ✅ Muestra "3 días gratis"
- ✅ Precio correcto (€9.99 o €34.99)
- ✅ Método de pago configurado
- ✅ Botón "Suscribirse"

6. **Completar suscripción**
7. **Verificar en app:**
   - Usuario marcado como premium
   - Acceso a funcionalidades premium

---

## 🔍 PASO 5: Verificación

### 5.1 - Verificar en RevenueCat Dashboard

1. **Ir a Customers:**
   ```
   Dashboard → Customers
   ```

2. **Buscar tu usuario** (por email o ID)

3. **Verificar:**
   - ✅ Suscripción activa
   - ✅ Entitlement "premium" activo
   - ✅ Período de prueba activo
   - ✅ Fecha de renovación correcta

### 5.2 - Verificar en Google Play Console

1. **Ir a Pedidos:**
   ```
   Monetización → Pedidos de suscripción
   ```

2. **Verificar:**
   - ✅ Suscripción aparece
   - ✅ Estado: "Activa"
   - ✅ Período de prueba visible

---

## 📊 VERIFICACIÓN COMPLETA

### ✅ Checklist Final:

**Google Play Console:**
- [ ] Service Account creado y configurado
- [ ] Permisos otorgados correctamente
- [ ] JSON key descargado
- [ ] Suscripciones creadas (monthly y yearly)
- [ ] License testing configurado
- [ ] Email de testing añadido

**RevenueCat Dashboard:**
- [ ] App Android añadida
- [ ] Service Account JSON subido
- [ ] Entitlement "premium" creado
- [ ] Productos creados (monthly y yearly)
- [ ] Offering "default" creado
- [ ] Offering marcado como "current"

**Testing:**
- [ ] Build compilado sin errores
- [ ] App instalada en dispositivo Android
- [ ] Paywall muestra precios correctos
- [ ] Google Pay se abre correctamente
- [ ] Compra se completa exitosamente
- [ ] Usuario marcado como premium
- [ ] Transacción visible en RevenueCat

---

## 🔧 TROUBLESHOOTING

### Error: "No products available"

**Solución:**
1. Verificar que productos están **"Activos"** en Google Play Console
2. Verificar IDs coinciden exactamente en RevenueCat
3. Esperar 2-3 horas para propagación de Google Play
4. Verificar Service Account tiene permisos correctos

### Error: "Purchase failed"

**Solución:**
1. Verificar Service Account JSON subido en RevenueCat
2. Verificar email está en License Testing
3. Verificar internet en dispositivo
4. Ver logs: `adb logcat | grep -i revenuecat`

### Google Pay no aparece

**Solución:**
1. Verificar que estás en dispositivo Android (no iOS, no web)
2. Verificar logs de consola:
   ```
   🤖 Iniciando compra Android con Google Play...
   ```
3. Verificar `googlePlayBillingService.isAvailable()` retorna `true`

---

## 📱 RESUMEN

### **iOS (Sin cambios):**
```
✅ Tu implementación original con StoreKit
✅ Apple Pay funcionando
✅ Cero modificaciones
✅ App Store submission intacta
```

### **Android (Nuevo):**
```
✅ Google Play Billing con RevenueCat
✅ Google Pay integrado
✅ Suscripciones configuradas
✅ Testing listo
```

---

## 🎯 PRÓXIMOS PASOS

1. **HOY:** Completar pasos 1-3 (configuración dashboards)
2. **HOY:** Testing básico en dispositivo Android
3. **ESTA SEMANA:** Testing exhaustivo
4. **ANTES LAUNCH:** Generar AAB para producción

---

## 📞 RECURSOS

- **RevenueCat Docs:** https://docs.revenuecat.com/docs/android
- **Google Play Docs:** https://developer.android.com/google/play/billing
- **Tu API Key Android:** `sk_svesByUuhqTSWBZsjerCLblaFMSsH`

---

¡Sigue estos pasos y tendrás Google Pay funcionando perfectamente en Android! 🚀

