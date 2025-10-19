# App Store Connect - Metadata de Suscripciones

## 📋 Requisitos de Apple para Suscripciones Auto-renovables

Apple requiere que incluyas información específica sobre las suscripciones tanto en el **binario de la app** como en **App Store Connect**.

---

## ✅ En el Binario (COMPLETADO)

Ya hemos actualizado tu app para incluir:

1. **✅ Título de la suscripción**: 
   - "BeRun Premium - Suscripción Anual"
   - "BeRun Premium - Suscripción Mensual"

2. **✅ Duración de la suscripción**:
   - "3 días gratis, luego 34,99 € por año" (Anual)
   - "3 días gratis, luego 9,99 € por mes" (Mensual)

3. **✅ Precio y precio por unidad**:
   - Anual: 34,99 €/año (2,91 €/mes)
   - Mensual: 9,99 €/mes

4. **✅ Enlaces funcionales**:
   - Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
   - Privacy Policy: https://wild-freon-354.notion.site/BeRun-Politica-de-privacidad-27aa985ca317809ebb86decee420e394

5. **✅ Información de términos**:
   - Texto completo sobre renovación automática, cancelación y gestión de suscripciones

---

## 📱 En App Store Connect (DEBES HACER ESTO)

### 1. Acceder a App Store Connect

1. Ve a [App Store Connect](https://appstoreconnect.apple.com)
2. Inicia sesión con tu cuenta de desarrollador
3. Selecciona tu app "BeRun" / "Stride Seeker"

### 2. Actualizar Privacy Policy URL

**Ubicación**: App Information > Privacy Policy

1. Ve a **App Information** (en el menú lateral)
2. Busca el campo **Privacy Policy URL**
3. Ingresa: `https://wild-freon-354.notion.site/BeRun-Politica-de-privacidad-27aa985ca317809ebb86decee420e394`
4. Haz clic en **Save** (Guardar)

### 3. Agregar Terms of Use (EULA)

Tienes **DOS OPCIONES**:

#### **Opción A: Usar EULA Estándar de Apple (RECOMENDADO)**

Esta es la opción más simple y la que Apple recomienda para la mayoría de apps:

1. Ve a **App Information**
2. Busca **Apple's Standard License Agreement**
3. Selecciona "Use Apple's Standard License Agreement" (si está disponible)
4. No necesitas agregar nada más - Apple ya maneja esto

#### **Opción B: EULA Personalizado**

Si necesitas términos personalizados:

1. Ve a **App Information** 
2. Busca el campo **End User License Agreement (EULA)**
3. Puedes:
   - **Opción 1**: Ingresa el texto completo de tus términos personalizados
   - **Opción 2**: Ingresa un enlace: `https://www.apple.com/legal/internet-services/itunes/dev/stdeula/`

### 4. Actualizar App Description (Descripción de la App)

**IMPORTANTE**: Debes mencionar las suscripciones en la descripción.

1. Ve a la sección de tu versión de la app
2. Busca **Description** o **App Description**
3. Añade una sección sobre las suscripciones, por ejemplo:

```
SUSCRIPCIÓN PREMIUM

BeRun ofrece una suscripción Premium con las siguientes opciones:
• Suscripción Mensual: 9,99 €/mes
• Suscripción Anual: 34,99 €/año (2,91 €/mes)
• Prueba gratuita de 3 días disponible

La suscripción se renueva automáticamente a menos que se cancele al menos 24 horas antes del final del período actual. El pago se cargará a tu cuenta de Apple ID al confirmar la compra. Puedes gestionar y cancelar tu suscripción desde la configuración de tu cuenta en el App Store.

Términos de uso: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
Política de privacidad: https://wild-freon-354.notion.site/BeRun-Politica-de-privacidad-27aa985ca317809ebb86decee420e394
```

### 5. Configurar Información de Suscripción

1. Ve a **Features** > **In-App Purchases and Subscriptions**
2. Para cada producto de suscripción (mensual y anual):
   - Haz clic en el producto
   - Verifica que el **Subscription Display Name** sea descriptivo:
     - "BeRun Premium - Mensual"
     - "BeRun Premium - Anual"
   - Verifica que la **Description** explique claramente qué incluye
   - Confirma que el **precio** y la **duración** sean correctos
   - Si tienes prueba gratuita, asegúrate de que esté configurada correctamente

### 6. Agregar Marketing URL (Opcional pero Recomendado)

1. Ve a **App Information**
2. Busca **Marketing URL** (opcional)
3. Si tienes un sitio web, agrégalo aquí
4. Ejemplo: `https://strideseeker.com` o tu dominio

---

## 🔍 Verificación Final

Antes de enviar a revisión, verifica que:

- [ ] Privacy Policy URL esté configurada en App Store Connect
- [ ] EULA esté configurado (Standard de Apple o personalizado)
- [ ] La descripción mencione las suscripciones con precios y duración
- [ ] Los enlaces en tu app funcionen correctamente
- [ ] La información en el binario coincida con App Store Connect
- [ ] Las suscripciones estén configuradas en "In-App Purchases and Subscriptions"

---

## 📚 Referencias de Apple

- [App Store Review Guidelines 3.1.2](https://developer.apple.com/app-store/review/guidelines/#in-app-purchase)
- [Apple Developer Program License Agreement Schedule 2](https://developer.apple.com/support/terms/)
- [Auto-Renewable Subscriptions](https://developer.apple.com/app-store/subscriptions/)

---

## 🆘 Si Apple Rechaza tu App

Si Apple rechaza tu app por este motivo, responde con:

```
We have updated the app to include all required subscription information:

1. In-App Binary:
   - Subscription title: "BeRun Premium - Annual/Monthly Subscription"
   - Subscription length: Clearly displayed (3-day trial, then annual/monthly)
   - Price information: Clearly shown (€34.99/year or €9.99/month)
   - Functional links to both Privacy Policy and Terms of Use (EULA)
   - Full subscription terms and cancellation information

2. App Store Connect Metadata:
   - Privacy Policy URL: [tu URL]
   - Terms of Use (EULA): Apple Standard License Agreement
   - Subscription details in app description

All information is now compliant with App Store Review Guidelines 3.1.2 and Schedule 2 of the Apple Developer Program License Agreement.
```

---

## ✅ Siguiente Paso

1. **Compila y sube una nueva build** con los cambios del código
2. **Actualiza los metadatos** en App Store Connect siguiendo las instrucciones arriba
3. **Envía la app a revisión**

¡Buena suerte! 🚀

