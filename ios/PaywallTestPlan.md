# Plan de Testing - Paywall de Suscripción iOS

## Configuración Inicial

### 1. Configuración de StoreKit Testing

1. **Abrir Xcode** y seleccionar el proyecto `App.xcodeproj`
2. **Configurar StoreKit Testing:**
   - En Xcode, ir a `Product > Scheme > Edit Scheme`
   - Seleccionar `Run` en la sidebar izquierda
   - En la pestaña `Options`, encontrar `StoreKit Configuration`
   - Seleccionar `Configuration.storekit`
3. **Verificar productos configurados:**
   - `stride_seeker_premium_monthly`: €9.99/mes con prueba gratuita de 3 días
   - `stride_seeker_premium_yearly`: €34.99/año con prueba gratuita de 3 días

### 2. Configuración de App Store Connect Sandbox

1. **Crear cuenta de prueba en App Store Connect:**
   - Ir a App Store Connect > Users and Access > Sandbox Testers
   - Crear nuevo tester con email único
   - Usar región España para probar precios en euros

2. **Configurar productos en App Store Connect:**
   - Crear productos con los mismos IDs que en Configuration.storekit
   - Configurar precios: €9.99 mensual, €34.99 anual
   - Configurar oferta introductoria: 3 días gratis

## Casos de Prueba

### A. Testing Local con StoreKit Configuration

#### A1. Flujo de Onboarding Completo
**Objetivo:** Verificar que el paywall aparece después de completar el onboarding

**Pasos:**
1. Resetear app (desinstalar y reinstalar)
2. Completar flujo de onboarding hasta la última pregunta (lesiones)
3. Tocar "Continuar" en la pantalla de lesiones

**Resultado esperado:**
- El paywall aparece inmediatamente después de completar onboarding
- Se muestra la UI con 91%, timeline, y opciones de precio
- Plan anual está preseleccionado por defecto
- Badge "3 DAYS FREE" visible en plan anual

#### A2. Compra de Suscripción Mensual
**Objetivo:** Verificar compra de suscripción mensual

**Pasos:**
1. Abrir paywall (completar onboarding o usar botón debug)
2. Seleccionar plan mensual (€9.99/mes)
3. Tocar "Start My 3-Day Free Trial"
4. Confirmar compra en diálogo de StoreKit

**Resultado esperado:**
- Compra procesada exitosamente
- Paywall se cierra automáticamente
- Usuario tiene acceso premium
- Recordatorio programado para día 2

#### A3. Compra de Suscripción Anual
**Objetivo:** Verificar compra de suscripción anual

**Pasos:**
1. Abrir paywall
2. Plan anual debe estar preseleccionado (€34.99/año)
3. Verificar texto "2,91 €/mes" equivalente
4. Tocar "Start My 3-Day Free Trial"
5. Confirmar compra

**Resultado esperado:**
- Compra procesada exitosamente
- Texto equivalente mensual correcto
- Usuario obtiene acceso premium
- Recordatorio programado

#### A4. Cancelación de Compra
**Objetivo:** Verificar manejo de cancelación

**Pasos:**
1. Abrir paywall
2. Seleccionar cualquier plan
3. Tocar "Start My 3-Day Free Trial"
4. En diálogo de StoreKit, tocar "Cancel"

**Resultado esperado:**
- Paywall permanece abierto
- No se muestra error
- Usuario puede intentar de nuevo

#### A5. Restaurar Compras
**Objetivo:** Verificar funcionalidad de restore

**Pasos:**
1. Realizar compra exitosa (A2 o A3)
2. Simular pérdida de estado (reiniciar app)
3. Abrir paywall
4. Tocar "Restore" en esquina superior derecha

**Resultado esperado:**
- Compras restauradas exitosamente
- Mensaje de confirmación
- Paywall se cierra
- Usuario mantiene acceso premium

#### A6. Control de Acceso Premium
**Objetivo:** Verificar que features requieren premium

**Pasos:**
1. Sin suscripción, intentar generar plan personalizado
2. Verificar que paywall aparece
3. Completar compra
4. Intentar generar plan de nuevo

**Resultado esperado:**
- Sin suscripción: paywall aparece al intentar generar plan
- Con suscripción: plan se genera sin mostrar paywall

### B. Testing de Notificaciones

#### B1. Recordatorio de Prueba
**Objetivo:** Verificar recordatorio local

**Pasos:**
1. Completar compra de prueba gratuita
2. Cambiar fecha del sistema a 2 días después
3. Verificar notificación programada

**Resultado esperado:**
- Notificación aparece en día 2
- Texto correcto según idioma del sistema
- Al tocar notificación, abre paywall

#### B2. Permisos de Notificación
**Objetivo:** Verificar solicitud de permisos

**Pasos:**
1. Primera instalación de app
2. Completar onboarding y compra
3. Verificar solicitud de permisos

**Resultado esperado:**
- Sistema solicita permisos de notificación
- Si se otorgan: recordatorio se programa
- Si se niegan: funcionalidad continúa sin recordatorio

### C. Testing de Localización

#### C1. Idioma Español
**Objetivo:** Verificar localización en español

**Pasos:**
1. Configurar dispositivo en español
2. Abrir paywall
3. Verificar todos los textos

**Resultado esperado:**
- Todos los textos en español
- Precios en euros con formato correcto
- Fechas en formato español

#### C2. Idioma Inglés
**Objetivo:** Verificar localización en inglés

**Pasos:**
1. Configurar dispositivo en inglés
2. Abrir paywall
3. Verificar todos los textos

**Resultado esperado:**
- Todos los textos en inglés
- Precios en euros con formato correcto
- Fechas en formato inglés

### D. Testing de Estados de Suscripción

#### D1. Usuario No Suscrito
**Objetivo:** Verificar estado inicial

**Pasos:**
1. App sin compras previas
2. Verificar estado de suscripción

**Resultado esperado:**
- `status: "not_subscribed"`
- `isPremium: false`
- `trialDaysRemaining: 0`

#### D2. Usuario en Prueba Gratuita
**Objetivo:** Verificar estado durante prueba

**Pasos:**
1. Completar compra con prueba gratuita
2. Verificar estado inmediatamente

**Resultado esperado:**
- `status: "free_trial"`
- `isPremium: true`
- `trialDaysRemaining: 3` (o días restantes)

#### D3. Usuario Suscrito
**Objetivo:** Verificar estado después de prueba

**Pasos:**
1. Simular finalización de prueba gratuita
2. Verificar transición a suscripción pagada

**Resultado esperado:**
- `status: "subscribed"`
- `isPremium: true`
- `trialDaysRemaining: 0`

### E. Testing de Sandbox (App Store Connect)

#### E1. Configuración de Sandbox
**Objetivo:** Probar con productos reales

**Pasos:**
1. Cambiar scheme a usar productos reales (quitar StoreKit config)
2. Usar cuenta sandbox de App Store Connect
3. Repetir casos A1-A6

**Resultado esperado:**
- Mismos resultados que testing local
- Productos cargados desde App Store Connect
- Precios reales en euros

#### E2. Testing de Renovación
**Objetivo:** Verificar renovación automática

**Pasos:**
1. Comprar suscripción en sandbox
2. Esperar renovación (acelerada en sandbox)
3. Verificar estado de suscripción

**Resultado esperado:**
- Suscripción se renueva automáticamente
- Estado permanece como `subscribed`
- No se muestra paywall

## Casos Extremos y Errores

### F1. Sin Conexión a Internet
**Pasos:**
1. Desactivar WiFi y datos celulares
2. Intentar abrir paywall

**Resultado esperado:**
- Paywall se abre pero productos no cargan
- Mensaje de error apropiado
- Botón CTA deshabilitado

### F2. Productos No Disponibles
**Pasos:**
1. Configurar IDs de producto incorrectos
2. Abrir paywall

**Resultado esperado:**
- Error de carga de productos
- Mensaje de error al usuario
- Opción de reintentar

### F3. Fallo de Verificación
**Pasos:**
1. Simular fallo en verificación de transacción
2. Intentar compra

**Resultado esperado:**
- Error mostrado al usuario
- Transacción no completada
- Usuario puede reintentar

## Checklist Final

### Funcionalidad Core
- [ ] Paywall aparece después de onboarding
- [ ] Compra mensual funciona
- [ ] Compra anual funciona
- [ ] Restaurar compras funciona
- [ ] Control de acceso premium funciona

### UI/UX
- [ ] Diseño coincide con capturas de referencia
- [ ] Timeline muestra fechas correctas
- [ ] Precios formateados correctamente
- [ ] Animaciones fluidas
- [ ] Botones responden correctamente

### Localización
- [ ] Textos en español correctos
- [ ] Textos en inglés correctos
- [ ] Fechas formateadas por locale
- [ ] Precios en formato local

### Notificaciones
- [ ] Permisos solicitados correctamente
- [ ] Recordatorio programado en día 2
- [ ] Notificación abre paywall al tocar

### Estados de Suscripción
- [ ] Estado inicial correcto
- [ ] Transiciones entre estados
- [ ] Verificación de entitlements
- [ ] Sincronización con StoreKit

### Testing en Dispositivo
- [ ] iPhone (iOS 16+)
- [ ] iPad (opcional)
- [ ] Diferentes tamaños de pantalla
- [ ] Modo claro y oscuro

## Notas de Implementación

### Comandos Útiles para Testing

```bash
# Limpiar datos de la app
xcrun simctl privacy booted reset all com.yourapp.bundle

# Reset StoreKit testing
# En Xcode: Device > Erase All Content and Settings

# Ver logs de StoreKit
# En Console.app filtrar por "StoreKit"
```

### Variables de Entorno para Debug

```swift
// En scheme, añadir environment variables:
STOREKIT_DEBUG = 1
STOREKIT_VERBOSE_LOGGING = 1
```

### Verificación de Productos

```javascript
// En web console, verificar estado:
await subscriptionService.checkSubscriptionStatus()
await subscriptionService.hasAccessToFeature('personalized_training_plan')
```

Este plan de testing asegura que todas las funcionalidades del paywall están correctamente implementadas y funcionando según las especificaciones.
