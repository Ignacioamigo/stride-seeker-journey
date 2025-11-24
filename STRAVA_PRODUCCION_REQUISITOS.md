# 🚀 Requisitos para Lanzar la App con Integración de Strava

## ⚠️ Situación Actual

Tu aplicación está en **"Modo de un solo jugador"** (Development Mode):
- ✅ Solo tú puedes conectarte (límite de 1 deportista)
- ✅ Funciona para desarrollo y testing
- ❌ **NO puedes lanzar a producción** con este límite

---

## 📋 Requisitos para Producción

Para lanzar tu app con integración de Strava y permitir que múltiples usuarios se conecten, **DEBES solicitar aprobación a Strava** mediante el **Programa para Desarrolladores de Strava**.

---

## ✅ Pasos para Solicitar Aprobación

### Paso 1: Revisar Requisitos Previos

Antes de solicitar, asegúrate de cumplir:

#### 1.1 Términos de la API de Strava

- ✅ Lee y acepta el **Acuerdo de API de Strava** (actualizado Nov 2024)
- 📄 Documento: https://developers.strava.com/docs/terms
- ⚠️ **Importante:** Revisa especialmente:
  - Privacidad de datos de usuarios
  - Cómo se muestran los datos de Strava en tu app
  - Restricciones de uso comercial

#### 1.2 Directrices de Marca

- ✅ Cumple con las **Directrices de Marca de Strava**
- 📄 Documento: https://developers.strava.com/docs/brand
- ⚠️ **Importante:**
  - Uso correcto del logo de Strava
  - Colores y tipografía permitidos
  - Cómo mostrar el botón "Conectar con Strava"

#### 1.3 Demanda Existente

- ✅ Strava suele aprobar apps que están cerca de alcanzar su límite actual
- 📊 Verifica en: https://www.strava.com/settings/api
- 📈 Si tienes usuarios esperando o demanda real, menciona esto en tu solicitud

---

### Paso 2: Preparar Material para la Solicitud

Necesitarás proporcionar:

#### 2.1 Capturas de Pantalla

**Obligatorias:**

1. **Botón "Conectar con Strava"**
   - Captura de cómo se muestra en tu app
   - Debe seguir las directrices de marca
   - Ubicación: Perfil > Integraciones

2. **Datos de Strava en tu App**
   - Cómo se muestran las actividades importadas
   - Cómo se muestran los datos de Strava
   - Ejemplo: Lista de actividades, estadísticas, etc.

3. **Pantalla de Autorización**
   - Flujo completo de OAuth
   - Cómo se explica al usuario qué permisos solicitas

**Opcionales pero Recomendados:**

4. **Vídeo Demo** (opcional)
   - Flujo completo de conexión
   - Importación de actividades
   - Sincronización automática

#### 2.2 Información de la Aplicación

Prepara esta información:

- **Nombre de la App:** BeRun
- **Descripción:** App de entrenamiento personal que sincroniza actividades con Strava
- **URL de la App:** (si está publicada)
- **Client ID:** 186314
- **Casos de Uso:**
  - Sincronización automática de actividades
  - Completar entrenamientos del plan cuando corres con Strava
  - Actualizar estadísticas con datos de Strava

#### 2.3 Justificación del Aumento

Explica por qué necesitas más usuarios:

- **Número de usuarios objetivo:** (ej: 100, 1000, etc.)
- **Demanda actual:** (si tienes usuarios esperando)
- **Casos de uso:** Qué beneficios ofrece a los usuarios

---

### Paso 3: Completar el Formulario

#### 3.1 Acceder al Formulario

1. Ve a: https://developers.strava.com/docs/rate-limits
2. Busca la sección **"Request an Increase"** o **"Developer Program"**
3. O contacta directamente: **developers@strava.com**

#### 3.2 Información a Incluir

**Asunto del Email:**
```
Request to Increase Connected Athletes Limit - BeRun App (Client ID: 186314)
```

**Cuerpo del Email:**

```
Hello Strava Developer Support,

I am developing a fitness training application called "BeRun" (Client ID: 186314) 
that integrates with Strava to sync running activities automatically.

APPLICATION DETAILS:
- App Name: BeRun
- Client ID: 186314
- Description: Personal fitness training app that syncs activities with Strava
- Use Case: Users connect their Strava account to automatically sync activities, 
  complete training sessions, and update statistics

CURRENT STATUS:
- Application is in development/testing phase
- Currently limited to 1 connected athlete
- Ready for production launch but need to increase athlete limit

REQUESTED INCREASE:
- Initial request: [X] athletes (e.g., 100, 500, 1000)
- Expected growth: [Y] athletes in first 6 months

COMPLIANCE:
- ✅ Reviewed and agree to Strava API Agreement (Nov 2024)
- ✅ Follow Strava Brand Guidelines
- ✅ Implement proper OAuth flow
- ✅ Handle user data according to privacy requirements

ATTACHMENTS:
- Screenshots of "Connect with Strava" button implementation
- Screenshots showing how Strava data is displayed in the app
- [Optional] Video demo of the integration

Thank you for your consideration. I'm happy to provide any additional 
information or clarification needed.

Best regards,
[Tu nombre]
[Tu email]
[Tu teléfono - opcional]
```

---

### Paso 4: Proceso de Revisión

#### 4.1 Tiempo de Respuesta

- **Típico:** 1-2 semanas
- **Puede variar:** Depende de la complejidad y demanda

#### 4.2 Durante la Revisión

Strava puede:
- ✅ Solicitar información adicional
- ✅ Pedir cambios en la implementación
- ✅ Revisar tu app en detalle
- ✅ Hacer preguntas sobre el uso de datos

#### 4.3 Posibles Resultados

**Aprobado:**
- ✅ Límite aumentado (ej: 100, 500, 1000+ deportistas)
- ✅ Puedes lanzar a producción
- ✅ Recibirás confirmación por email

**Rechazado o Pendiente:**
- ⚠️ Pueden pedir cambios
- ⚠️ Pueden solicitar más información
- ⚠️ Pueden sugerir mejoras

---

## 📊 Límites Actuales vs. Producción

### Modo Desarrollo (Actual)

```
Límite de deportistas conectados: 1
Límite de solicitudes: 100 cada 15 min, 1,000 diarias
Estado: Solo para desarrollo/testing
```

### Modo Producción (Después de Aprobación)

```
Límite de deportistas conectados: Variable (según aprobación)
Límite de solicitudes: Puede aumentar según necesidad
Estado: Listo para usuarios reales
```

---

## ⚠️ Importante: Antes de Solicitar

### Checklist de Cumplimiento

Antes de enviar la solicitud, verifica:

- [ ] **Términos de API:** Leídos y aceptados
- [ ] **Directrices de Marca:** Implementadas correctamente
- [ ] **Botón "Conectar con Strava":** Sigue las directrices
- [ ] **Privacidad:** Política de privacidad actualizada
- [ ] **Manejo de Datos:** Cumple con GDPR/privacidad
- [ ] **OAuth Flow:** Implementado correctamente
- [ ] **Capturas de Pantalla:** Preparadas
- [ ] **Descripción de la App:** Clara y completa

---

## 🎯 Estrategia Recomendada

### Opción 1: Solicitar Ahora (Recomendado)

**Ventajas:**
- ✅ Proceso puede tardar 1-2 semanas
- ✅ Ya tienes todo implementado
- ✅ Puedes lanzar tan pronto como aprueben

**Cuándo hacerlo:**
- Cuando la app esté casi lista para producción
- Cuando tengas capturas de pantalla finales
- Cuando cumplas todos los requisitos

### Opción 2: Esperar a Tener Usuarios

**Ventajas:**
- ✅ Puedes mostrar demanda real
- ✅ Strava ve que hay interés

**Desventajas:**
- ❌ No puedes aceptar usuarios hasta aprobación
- ❌ Puede retrasar el lanzamiento

---

## 📧 Contacto con Strava

### Email Principal

**developers@strava.com**

### Recursos Útiles

- **Documentación:** https://developers.strava.com/docs
- **Términos de API:** https://developers.strava.com/docs/terms
- **Directrices de Marca:** https://developers.strava.com/docs/brand
- **Límites y Cuotas:** https://developers.strava.com/docs/rate-limits
- **Comunidad:** https://communityhub.strava.com/developers-api-7/

---

## 🔄 Alternativa: Modo Híbrido

Si necesitas lanzar antes de la aprobación:

1. **Lanza sin Strava** inicialmente
2. **Solicita aprobación** mientras tanto
3. **Añade Strava** cuando aprueben

Esto permite:
- ✅ Lanzar la app sin esperar
- ✅ Añadir Strava después sin relanzar
- ✅ Tener usuarios mientras esperas aprobación

---

## ✅ Resumen

**Para lanzar con Strava en producción:**

1. ✅ **SÍ necesitas solicitar aprobación** a Strava
2. ✅ **Completa el formulario** del Programa para Desarrolladores
3. ✅ **Cumple con términos y directrices** de Strava
4. ✅ **Proporciona capturas de pantalla** y documentación
5. ✅ **Espera 1-2 semanas** para revisión
6. ✅ **Recibe aprobación** y aumenta límite
7. ✅ **Lanza a producción** con integración completa

---

## 🚀 Próximos Pasos Inmediatos

1. **Lee los términos:** https://developers.strava.com/docs/terms
2. **Revisa directrices de marca:** https://developers.strava.com/docs/brand
3. **Prepara capturas de pantalla** de tu implementación
4. **Redacta el email** usando la plantilla de arriba
5. **Envía la solicitud** a developers@strava.com

---

## 💡 Consejos

- **Sé específico:** Explica claramente qué hace tu app
- **Muestra valor:** Demuestra cómo beneficia a los usuarios de Strava
- **Sé paciente:** El proceso puede tardar
- **Sé profesional:** Presenta tu app de manera profesional
- **Sé honesto:** No exageres números o demanda

---

## 📞 Si Necesitas Ayuda

Si tienes dudas sobre:
- Cómo cumplir con los términos
- Cómo implementar las directrices de marca
- Qué información incluir en la solicitud
- Cómo preparar las capturas de pantalla

Puedo ayudarte a:
- ✅ Revisar tu implementación
- ✅ Preparar el email de solicitud
- ✅ Crear capturas de pantalla
- ✅ Verificar cumplimiento de requisitos

---

**¡Buena suerte con tu solicitud!** 🎉

