# 🗺️ CONFIGURACIÓN URGENTE - Google Maps API

## ⚠️ PROBLEMA ACTUAL
Error: "Esta página no puede cargar Google Maps correctamente"

**Causa**: La API Key necesita configuración en Google Cloud Console

---

## ✅ SOLUCIÓN RÁPIDA (5 minutos)

### **1️⃣ Accede a Google Cloud Console**
```
https://console.cloud.google.com
```

### **2️⃣ Selecciona o Crea un Proyecto**
- Si no tienes proyecto: Click "Nuevo Proyecto" → Nombre: "BeRun Maps"
- Si ya tienes proyecto: Selecciónalo en el menú superior

### **3️⃣ HABILITA FACTURACIÓN (OBLIGATORIO)**
```
URL: https://console.cloud.google.com/billing
```
- ⚠️ **Sin facturación, Google Maps NO funciona**
- 💰 Google da **$200 USD GRATIS** por 90 días
- 💰 Después: **10,000 cargas de mapa/mes GRATIS**
- Solo pagas si superas el uso gratuito (muy difícil en apps pequeñas)

**Pasos:**
1. Click "Vincular una cuenta de facturación"
2. Añade tarjeta de crédito/débito
3. Activa la cuenta de facturación

### **4️⃣ HABILITA LAS APIs**
```
URL: https://console.cloud.google.com/apis/library
```

**Busca y habilita (click en ENABLE):**
- ✅ **Maps SDK for iOS**
- ✅ **Maps SDK for Android**
- ✅ **Maps JavaScript API**

### **5️⃣ CREA UNA NUEVA API KEY**
```
URL: https://console.cloud.google.com/apis/credentials
```

1. Click **"+ CREATE CREDENTIALS"** → **"API Key"**
2. Se creará una nueva key (ejemplo: `AIzaSy...`)
3. **¡CÓPIALA!** (la necesitarás en el siguiente paso)

**IMPORTANTE para Testing:**
4. Click en **"EDIT API KEY"**
5. **Application restrictions**: Selecciona **"None"** 
6. **API restrictions**: Selecciona **"Don't restrict key"**
7. Click **"SAVE"**

---

## 📱 ACTUALIZAR LA APP

Una vez tengas tu **NUEVA API KEY** de Google Cloud:

```bash
# 1. Actualiza estos 3 archivos con tu NUEVA API KEY:

# Archivo 1: src/components/SimpleMapView.tsx (línea 10)
const WEB_API_KEY = 'TU_NUEVA_API_KEY_AQUI';

# Archivo 2: src/components/GoogleMapsRunView.tsx (línea 11)
const WEB_API_KEY = 'TU_NUEVA_API_KEY_AQUI';

# Archivo 3: ios/App/App/Info.plist (línea 37)
<string>TU_NUEVA_API_KEY_AQUI</string>

# Archivo 4: android/app/src/main/AndroidManifest.xml (línea 42)
android:value="TU_NUEVA_API_KEY_AQUI"
```

```bash
# 2. Reconstruir la app
npm run build
npx cap sync

# 3. Probar en iOS
npx cap open ios
# Ejecutar en dispositivo/simulador

# 4. Probar en Android  
npx cap open android
# Ejecutar en dispositivo/emulador
```

---

## 🔍 VERIFICAR QUE FUNCIONA

### **Test Rápido Web:**
Abre este URL en tu navegador (reemplaza TU_API_KEY):
```
https://maps.googleapis.com/maps/api/js?key=TU_API_KEY&callback=console.log
```

**✅ Si funciona**: Verás código JavaScript
**❌ Si falla**: Verás error de API o billing

---

## 🚨 ERRORES COMUNES

### Error 1: "You must enable Billing on the Google Cloud Project"
**Solución**: Ve al paso 3️⃣ y habilita facturación

### Error 2: "This API project is not authorized to use this API"
**Solución**: Ve al paso 4️⃣ y habilita las 3 APIs

### Error 3: "API key not valid"
**Solución**: Verifica que copiaste la API key completa sin espacios

### Error 4: "RefererNotAllowedMapError"
**Solución**: Quita las restricciones de la API key (paso 5️⃣, punto 5-6)

---

## 💰 PRECIOS (para que sepas)

**Nivel Gratuito de Google Maps:**
- ✅ $200 USD de crédito gratis (cada mes, permanente)
- ✅ Esto equivale a ~28,000 cargas de mapa por mes GRATIS
- ✅ Una "carga" = cada vez que se muestra el mapa a un usuario

**Para tu app:**
- Si tienes 1000 usuarios activos/día que abren el mapa 3 veces = 90,000 cargas/mes
- Costo estimado: ~$100/mes (pero tienes $200 gratis, así que $0)
- Solo pagarías si tienes mucho tráfico

---

## 📞 ¿NECESITAS AYUDA?

Si después de estos pasos sigue sin funcionar:
1. Verifica la consola del navegador (F12 → Console)
2. Busca el código de error exacto
3. Verifica que facturación está activa
4. Espera 5 minutos después de crear la API key (a veces tarda en propagarse)

---

## ✅ CHECKLIST

- [ ] Cuenta de Google Cloud creada
- [ ] Proyecto creado/seleccionado
- [ ] Facturación habilitada ⚠️
- [ ] Maps SDK for iOS habilitado
- [ ] Maps SDK for Android habilitado
- [ ] Maps JavaScript API habilitado
- [ ] API Key creada sin restricciones
- [ ] API Key actualizada en los 4 archivos
- [ ] `npm run build` ejecutado
- [ ] `npx cap sync` ejecutado
- [ ] App probada en dispositivo

---

**API Key actual en tu código**: `AIzaSyC84gYKVr3KaSXKoujFTMEEx7fk0iHuEzQ`

**Proyecto**: Necesitas verificar/configurar esto en Google Cloud Console



