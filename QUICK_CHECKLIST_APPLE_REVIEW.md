# ✅ Checklist Rápida - Requisitos de Apple para Suscripciones

## 🚀 Paso a Paso para Pasar la Revisión de Apple

---

## ✅ PARTE 1: CÓDIGO (COMPLETADO) ✅

- [x] Título de suscripción visible en la app
- [x] Duración de suscripción mostrada
- [x] Precio completo por período mostrado
- [x] Enlaces funcionales a Privacy Policy
- [x] Enlaces funcionales a Terms of Use (EULA)
- [x] Texto completo de términos de renovación automática

**Archivos actualizados:**
- ✅ `ios/App/App/Views/PaywallView.swift`
- ✅ `src/pages/PaywallPage.tsx`
- ✅ `src/components/paywall/PaywallModal.tsx`

---

## 📱 PARTE 2: APP STORE CONNECT (DEBES COMPLETAR)

### 1️⃣ Privacy Policy URL
**Ubicación**: App Information → Privacy Policy URL

```
URL: https://wild-freon-354.notion.site/BeRun-Politica-de-privacidad-27aa985ca317809ebb86decee420e394
```

- [ ] Abierto App Store Connect
- [ ] Navegado a App Information
- [ ] Ingresado Privacy Policy URL
- [ ] Guardado cambios

---

### 2️⃣ Terms of Use (EULA)
**Ubicación**: App Information → End User License Agreement

**Opción Recomendada:**
```
☑️ Use Apple's Standard License Agreement
```

**O Alternativa:**
```
Custom EULA URL: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

- [ ] Seleccionado EULA (Standard o Custom)
- [ ] Guardado cambios

---

### 3️⃣ App Description
**Ubicación**: Version Information → Description

- [ ] Copiado texto de `APP_STORE_DESCRIPTION_EXAMPLE.md`
- [ ] Pegado en el campo Description
- [ ] Verificado que incluya sección de suscripciones
- [ ] Verificado que incluya precios y duraciones
- [ ] Verificado que incluya enlaces legales
- [ ] Guardado cambios

**Sección Mínima Requerida para incluir:**
```
💎 Suscripción BeRun Premium

• Mensual: 9,99 €/mes
• Anual: 34,99 €/año (2,91 €/mes)
• Prueba gratuita de 3 días

La suscripción se renueva automáticamente. 
El pago se carga a tu Apple ID al confirmar. 
Puedes cancelar desde el App Store.

Términos: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
Privacidad: https://wild-freon-354.notion.site/BeRun-Politica-de-privacidad-27aa985ca317809ebb86decee420e394
```

---

### 4️⃣ In-App Purchases & Subscriptions
**Ubicación**: Features → In-App Purchases and Subscriptions

**Para Suscripción Mensual:**
- [ ] Verificado nombre: "BeRun Premium - Mensual"
- [ ] Verificado precio: 9,99 €
- [ ] Verificado duración: 1 mes
- [ ] Descripción clara de beneficios
- [ ] Estado: Ready to Submit

**Para Suscripción Anual:**
- [ ] Verificado nombre: "BeRun Premium - Anual"
- [ ] Verificado precio: 34,99 €
- [ ] Verificado duración: 1 año
- [ ] Prueba gratuita: 3 días
- [ ] Descripción clara de beneficios
- [ ] Estado: Ready to Submit

---

### 5️⃣ App Review Information (Opcional pero Útil)
**Ubicación**: App Review Information → Notes

```
Subscription Information:

Our app offers two auto-renewable subscriptions:
- Monthly: €9.99/month
- Annual: €34.99/year (with 3-day free trial)

All required subscription information is displayed in the app:
- Subscription title and duration
- Complete pricing information
- Functional links to Privacy Policy and Terms of Use (EULA)
- Full auto-renewal and cancellation terms

Privacy Policy: https://wild-freon-354.notion.site/BeRun-Politica-de-privacidad-27aa985ca317809ebb86decee420e394
EULA: Apple Standard License Agreement

Test Account (if needed):
Email: [tu email de prueba]
Password: [tu contraseña de prueba]
```

- [ ] Agregado nota para el revisor (opcional)

---

## 🔨 PARTE 3: BUILD Y SUBMIT

### Compilar Nueva Build

**Opción A: Xcode**
```bash
cd ios/App
# Abrir en Xcode y hacer Archive
```

- [ ] Abierto proyecto en Xcode
- [ ] Seleccionado "Any iOS Device (arm64)"
- [ ] Product → Archive
- [ ] Esperado a que termine el archive
- [ ] Subido a App Store Connect
- [ ] Build procesado exitosamente

**Opción B: Command Line**
```bash
cd ios/App
xcodebuild -workspace App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath ./build/App.xcarchive \
  archive

xcodebuild -exportArchive \
  -archivePath ./build/App.xcarchive \
  -exportPath ./build \
  -exportOptionsPlist exportOptions.plist
```

---

### Subir Build

- [ ] Build subido a App Store Connect
- [ ] Build procesado (status: "Ready to Submit")
- [ ] Build seleccionado en la versión

---

### Submit for Review

- [ ] Todos los metadatos actualizados
- [ ] Build seleccionado
- [ ] Export compliance respondido
- [ ] Advertising identifier respondido
- [ ] Content rights respondido
- [ ] Click "Submit for Review"

---

## 🎯 VERIFICACIÓN FINAL

### En el Dispositivo/Simulador
- [ ] Los enlaces se abren correctamente
- [ ] Toda la información es legible
- [ ] No hay texto cortado
- [ ] El layout se ve bien

### En App Store Connect
- [ ] Privacy Policy URL visible y accesible
- [ ] EULA configurado
- [ ] Description completa con sección de suscripciones
- [ ] Suscripciones configuradas correctamente
- [ ] Screenshots incluyen pantalla de suscripción
- [ ] Build seleccionado
- [ ] Status: "Waiting for Review"

---

## 📞 Si Apple Rechaza Nuevamente

### 1. Lee el Mensaje de Rechazo Cuidadosamente
- Identifica exactamente qué falta
- Busca el número de la guideline (ej: 3.1.2)

### 2. Verifica que Tienes Todo
- [ ] Links funcionales en la app
- [ ] Links en App Store Connect
- [ ] Precios y duraciones claros
- [ ] Términos de renovación completos

### 3. Responde al Revisor
```
Thank you for the feedback. We have updated our app to fully comply with guideline 3.1.2:

IN-APP BINARY:
✓ Subscription title: "BeRun Premium - Annual/Monthly Subscription"
✓ Subscription length: Clearly displayed (3-day trial, then annual/monthly)
✓ Pricing: €34.99/year or €9.99/month (with per-month equivalent for annual)
✓ Functional links to Privacy Policy and Terms of Use
✓ Complete auto-renewal and cancellation terms

APP STORE CONNECT METADATA:
✓ Privacy Policy URL: [URL]
✓ EULA: Apple Standard License Agreement
✓ Subscription information in app description

All information complies with Schedule 2 of the Apple Developer Program License Agreement.

Please find the updated information at:
- Paywall screen shows all required details
- Footer contains clickable legal links
- Terms clearly explain auto-renewal and cancellation

Thank you for your time.
```

### 4. Toma Screenshots
Si es necesario, toma screenshots mostrando:
- Pantalla de suscripción completa
- Enlaces visibles
- Texto de términos legible

---

## 📚 Documentos de Referencia

- 📄 `SUBSCRIPTION_COMPLIANCE_SUMMARY.md` - Resumen completo de cambios
- 📄 `APP_STORE_SUBSCRIPTION_METADATA.md` - Guía detallada de metadatos
- 📄 `APP_STORE_DESCRIPTION_EXAMPLE.md` - Ejemplo de descripción completa
- 📄 `QUICK_CHECKLIST_APPLE_REVIEW.md` - Este documento

---

## 🎉 ¡Éxito!

Una vez que completes todos los checkboxes:
1. ✅ Código actualizado
2. ✅ Metadatos configurados
3. ✅ Build subido
4. ✅ Enviado a revisión

**¡Tu app debería ser aprobada!** 🚀

---

**Tiempo Estimado de Revisión**: 1-3 días  
**Status Check**: [App Store Connect](https://appstoreconnect.apple.com)

Good luck! 💪

