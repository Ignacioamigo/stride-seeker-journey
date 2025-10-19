# 🚀 GUÍA COMPLETA: Subir App Android a Google Play Console

## 📋 RESUMEN RÁPIDO

Para subir tu app de Android Studio a Google Play Console necesitas:
1. ✅ Crear un **keystore** (firma digital)
2. ✅ Generar un **AAB** (Android App Bundle)
3. ✅ Crear app en **Google Play Console**
4. ✅ Subir el AAB
5. ✅ Completar información requerida

**Tiempo estimado: 1-2 horas**

---

## 🔐 PASO 1: Crear Keystore (Firma Digital)

### ¿Qué es un keystore?
Es como tu "firma digital" para la app. **MUY IMPORTANTE**: Si pierdes este archivo, **nunca podrás actualizar tu app**.

### Crear el keystore:

```bash
# 1. Navegar al directorio android/app
cd /Users/nachoamigo/stride-seeker-journey/android/app

# 2. Generar keystore
keytool -genkey -v -keystore berun-release-key.keystore -alias berun-key -keyalg RSA -keysize 2048 -validity 10000
```

### Te pedirá información:

```
1. Contraseña del keystore: [CREA UNA CONTRASEÑA SEGURA - GUÁRDALA]
   Ejemplo: BeRun2024!Secure

2. Repetir contraseña

3. ¿Cuál es su nombre y apellido?
   → BeRun Team

4. ¿Cuál es el nombre de su unidad organizacional?
   → BeRun

5. ¿Cuál es el nombre de su organización?
   → BeRun

6. ¿Cuál es el nombre de su ciudad o localidad?
   → Madrid

7. ¿Cuál es el nombre de su estado o provincia?
   → Madrid

8. ¿Cuál es el código de país de dos letras para esta unidad?
   → ES

9. Contraseña de la clave (presiona ENTER para usar la misma contraseña)
   → [ENTER]
```

### ⚠️ IMPORTANTE: Guardar el keystore

```bash
# 1. Hacer backup del keystore
cp berun-release-key.keystore ~/Desktop/berun-release-key.keystore.backup

# 2. Guardar las contraseñas en un lugar seguro
# - Usa un gestor de contraseñas (1Password, LastPass, etc.)
# - O guárdalas en un documento seguro
```

---

## 🔑 PASO 2: Configurar Keystore en el Proyecto

### Crear archivo de configuración:

```bash
# Crear archivo keystore.properties
nano /Users/nachoamigo/stride-seeker-journey/android/app/keystore.properties
```

### Contenido del archivo:

```properties
BERUN_RELEASE_STORE_FILE=berun-release-key.keystore
BERUN_RELEASE_STORE_PASSWORD=TU_CONTRASEÑA_AQUI
BERUN_RELEASE_KEY_ALIAS=berun-key
BERUN_RELEASE_KEY_PASSWORD=TU_CONTRASEÑA_AQUI
```

**Reemplaza** `TU_CONTRASEÑA_AQUI` con la contraseña que creaste.

### Guardar el archivo:
- Presiona `Ctrl + X`
- Presiona `Y`
- Presiona `Enter`

---

## 📦 PASO 3: Generar AAB (Android App Bundle)

### ¿Qué es un AAB?
Es el archivo que subes a Google Play Console. Google lo convierte automáticamente en APKs optimizados para cada dispositivo.

### Generar el AAB:

```bash
# 1. Volver al directorio raíz
cd /Users/nachoamigo/stride-seeker-journey

# 2. Build del proyecto web
npm run build

# 3. Sincronizar con Android
npx cap sync android

# 4. Ir a directorio Android
cd android

# 5. Generar AAB firmado
./gradlew bundleRelease

# 6. El archivo estará en:
# android/app/build/outputs/bundle/release/app-release.aab
```

### Verificar que se creó:

```bash
ls -lh app/build/outputs/bundle/release/app-release.aab
```

Deberías ver algo como:
```
-rw-r--r--  1 nachoamigo  staff   25M Oct  1 12:30 app-release.aab
```

---

## 🌐 PASO 4: Crear App en Google Play Console

### A. Crear cuenta de desarrollador (si no tienes):

1. Ve a https://play.google.com/console
2. Clic en **"Create developer account"**
3. Paga la cuota única de **$25 USD**
4. Completa la información solicitada

### B. Crear nueva aplicación:

1. **Ir a Google Play Console**: https://play.google.com/console
2. Clic en **"Create app"** o **"Crear aplicación"**
3. Completar:

```yaml
Nombre de la app: BeRun
Idioma predeterminado: Español (España)
Tipo de aplicación: Aplicación
¿Gratis o de pago?: Gratis
```

4. **Declaraciones**:
   - ✅ Esta app cumple con las políticas de Google Play
   - ✅ Esta app cumple con las leyes de exportación de EE. UU.

5. Clic en **"Crear aplicación"**

---

## 📱 PASO 5: Configurar Información de la App

### A. Panel de información (Dashboard):

Verás un checklist de tareas. Vamos a completarlas:

### B. Configurar la ficha de Play Store:

#### 1. **Descripción de la app**:

**Nombre de la app**: BeRun

**Descripción corta** (80 caracteres máx):
```
Tu entrenador personal de running con planes personalizados
```

**Descripción completa**:
```
🏃‍♂️ BeRun - Tu Entrenador Personal de Running

Transforma tu forma de correr con BeRun, la app que adapta el entrenamiento a tu nivel y objetivos. Desde principiantes hasta corredores avanzados, BeRun te guía hacia el éxito.

🎯 CARACTERÍSTICAS PRINCIPALES:

✅ Planes de Entrenamiento Personalizados
• Algoritmos inteligentes que se adaptan a tu nivel
• Planes específicos para 5K, 10K, media maratón y maratón
• Ajustes automáticos según tu progreso

✅ Seguimiento GPS Avanzado
• Tracking preciso de distancia, ritmo y ruta
• Mapas detallados de tus entrenamientos
• Estadísticas en tiempo real

✅ Análisis Inteligente
• Métricas avanzadas de rendimiento
• Seguimiento de tu progreso semanal
• Recomendaciones personalizadas

✅ Integración con Strava
• Sincronización automática de actividades
• Mantén tu historial de entrenamientos
• Comparte tus logros con la comunidad

✅ Planes Premium
• Versión gratuita con funcionalidades básicas
• Planes premium para entrenamientos avanzados
• 3 días de prueba gratis
• Sin compromisos, cancela cuando quieras

🏆 PARA QUIÉN ES BERUN:

• Principiantes que quieren empezar a correr
• Corredores recreativos que buscan mejorar
• Atletas que preparan competencias específicas
• Cualquiera que quiera un entrenamiento estructurado

💡 POR QUÉ ELEGIR BERUN:

• Interfaz intuitiva y fácil de usar
• Planes creados por expertos en running
• Seguimiento preciso sin complicaciones
• Motivación constante para alcanzar tus metas

Descarga BeRun hoy y comienza tu transformación como corredor. Tu próximo récord personal está a solo un entrenamiento de distancia.

🔐 Privacidad y Seguridad:
Tus datos están protegidos y nunca se comparten sin tu consentimiento.
```

#### 2. **Gráficos de la app**:

Necesitas preparar:

**Icono de la aplicación** (512 x 512 px, PNG):
- Tienes: `/Users/nachoamigo/stride-seeker-journey/public/BeRun_appicon_1024_blue1463FF.png`
- Necesitas redimensionarlo a 512x512

**Gráfico destacado** (1024 x 500 px, JPG o PNG 24 bits):
- Puedes crear uno simple con el logo y texto "BeRun - Tu entrenador personal"

**Screenshots de teléfono** (Mínimo 2, máximo 8):
- Formato: 1080 x 1920 px o similar
- Captura pantallas de tu app en un dispositivo Android
- Recomendado: 4-6 screenshots mostrando las funcionalidades principales

**CÓMO TOMAR SCREENSHOTS:**
```bash
# 1. Ejecutar app en dispositivo Android
npx cap open android

# 2. Usar Android Studio para tomar screenshots:
# - View → Tool Windows → Logcat
# - Click en el icono de cámara en la barra de herramientas
# - O usar el dispositivo físico y tomar screenshots normalmente
```

#### 3. **Categorización**:

```yaml
Categoría: Salud y bienestar
Etiquetas: running, entrenamiento, fitness, salud
```

---

## 📋 PASO 6: Completar Información Requerida

### A. Política de privacidad:

```
URL: https://berun.app/privacy.html
```

(Ya tienes el archivo en: `/Users/nachoamigo/stride-seeker-journey/dist/privacy.html`)

### B. Clasificación de contenido:

1. Ir a **"Clasificación de contenido"**
2. Seleccionar categoría: **"Referencia, fitness o educación"**
3. Completar cuestionario (todas las respuestas serán "No" para violencia, contenido sexual, etc.)

### C. Público objetivo:

```
Edad objetivo: 18 años en adelante
```

### D. Declaración de privacidad de datos:

Completar el formulario sobre qué datos recopilas:

```yaml
¿Recopila datos de usuarios?: Sí

Datos recopilados:
- ✅ Ubicación (para GPS tracking)
- ✅ Información de salud y fitness
- ✅ Información de la cuenta (email)

¿Cómo se usan los datos?:
- Para funcionalidad de la app
- Para personalización
- Para análisis

¿Se comparten datos con terceros?: Sí
- Supabase (backend)
- Strava (integración opcional)
```

### E. Declaración sobre anuncios:

```
¿Tu app muestra anuncios?: No
```

---

## 📤 PASO 7: Subir el AAB

### A. Crear versión de producción:

1. En Google Play Console, ir a **"Producción"** o **"Production"**
2. Clic en **"Crear nueva versión"**
3. **Subir el AAB**:
   - Clic en "Upload"
   - Seleccionar archivo: `/Users/nachoamigo/stride-seeker-journey/android/app/build/outputs/bundle/release/app-release.aab`

### B. Información de la versión:

```yaml
Nombre de la versión: 1.0.0
Código de versión: 1

Notas de la versión:
🎉 Primera versión de BeRun

✨ Funcionalidades:
• Planes de entrenamiento personalizados
• Seguimiento GPS de entrenamientos
• Integración con Strava
• Análisis de rendimiento
• Planes premium con 3 días gratis
```

### C. Guardar y continuar

---

## 🧪 PASO 8: Testing (Opcional pero Recomendado)

### Crear pista de testing interno:

Antes de lanzar a producción, puedes probar con testers:

1. Ir a **"Testing interno"**
2. Crear nueva versión
3. Subir el mismo AAB
4. Añadir emails de testers
5. Compartir link de testing

**Ventaja**: Probar la versión exacta que van a usar los usuarios.

---

## 🚀 PASO 9: Enviar a Revisión

### A. Revisar todo:

En el dashboard, verifica que todos los elementos estén completados:
- ✅ Ficha de Play Store completa
- ✅ Clasificación de contenido
- ✅ Público objetivo
- ✅ Política de privacidad
- ✅ Declaración de datos
- ✅ AAB subido

### B. Enviar a revisión:

1. Clic en **"Enviar a revisión"** o **"Submit for review"**
2. Confirmar

### C. Tiempo de revisión:

```
⏰ Tiempo estimado: 1-7 días
📧 Recibirás email cuando esté revisado
```

---

## 🔄 PASO 10: Configurar Suscripciones (RevenueCat)

### Mientras esperas la revisión, configura los productos:

1. **Ir a Monetización** → **Productos** → **Suscripciones**

2. **Crear suscripción mensual**:

```yaml
ID del producto: berun_premium_monthly
Nombre: BeRun Premium Mensual
Descripción: Acceso premium a todos los planes de entrenamiento

Precio: €9.99 EUR (España)

Período de suscripción: 1 mes (P1M)

Prueba gratuita:
  ✅ Activada
  Duración: 3 días (P3D)

Renovación automática: ✅ Sí

Estado: Activo
```

3. **Crear suscripción anual**:

```yaml
ID del producto: berun_premium_yearly
Nombre: BeRun Premium Anual
Descripción: Acceso premium anual - Ahorra €85/año

Precio: €34.99 EUR (España)

Período de suscripción: 1 año (P1Y)

Prueba gratuita:
  ✅ Activada
  Duración: 3 días (P3D)

Renovación automática: ✅ Sí

Estado: Activo
```

4. **Configurar Service Account**:
   - **API Access** → Crear Service Account
   - Descargar JSON
   - Subir a RevenueCat Dashboard

---

## 📊 COMANDOS RESUMEN

### Guardar para futuras actualizaciones:

```bash
#!/bin/bash
# Script para generar nueva versión

# 1. Actualizar versionCode y versionName en:
# android/app/build.gradle

# 2. Build
cd /Users/nachoamigo/stride-seeker-journey
npm run build
npx cap sync android

# 3. Generar AAB
cd android
./gradlew bundleRelease

# 4. El AAB estará en:
# app/build/outputs/bundle/release/app-release.aab

echo "✅ AAB generado exitosamente"
echo "📍 Ubicación: app/build/outputs/bundle/release/app-release.aab"
```

---

## ⚠️ IMPORTANTE: Seguridad

### ❌ NUNCA subir a Git:

```bash
# Añadir a .gitignore
echo "android/app/*.keystore" >> .gitignore
echo "android/app/keystore.properties" >> .gitignore
```

### ✅ Hacer backup seguro:

```bash
# Guardar en lugar seguro (USB, cloud cifrado)
# - berun-release-key.keystore
# - keystore.properties (o las contraseñas por separado)
```

---

## 🎯 CHECKLIST FINAL

Antes de enviar a revisión:

- [ ] Keystore creado y respaldado
- [ ] keystore.properties configurado
- [ ] AAB generado exitosamente
- [ ] App creada en Google Play Console
- [ ] Descripción completa
- [ ] Icono 512x512 subido
- [ ] Screenshots subidos (mínimo 2)
- [ ] Política de privacidad configurada
- [ ] Clasificación de contenido completada
- [ ] Público objetivo definido
- [ ] Declaración de datos completada
- [ ] AAB subido
- [ ] Notas de versión escritas
- [ ] Productos de suscripción creados
- [ ] Service Account configurado
- [ ] Todo revisado y enviado

---

## 🆘 PROBLEMAS COMUNES

### Error: "keystore.properties not found"

```bash
# Verificar que existe:
ls -la /Users/nachoamigo/stride-seeker-journey/android/app/keystore.properties

# Si no existe, crearlo como se indicó en PASO 2
```

### Error: "Signing config release not found"

```bash
# Verificar que el keystore existe:
ls -la /Users/nachoamigo/stride-seeker-journey/android/app/berun-release-key.keystore

# Verificar que las rutas en keystore.properties son correctas
```

### Error: "Build failed"

```bash
# Limpiar y volver a intentar:
cd /Users/nachoamigo/stride-seeker-journey/android
./gradlew clean
./gradlew bundleRelease
```

### AAB muy grande (> 150 MB):

```bash
# Revisar que minifyEnabled y shrinkResources estén en true
# Ya están configurados en tu build.gradle
```

---

## 📞 RECURSOS ÚTILES

### Documentación oficial:
- **Google Play Console**: https://play.google.com/console/about/guides/
- **Android App Bundle**: https://developer.android.com/guide/app-bundle

### Herramientas útiles:
- **Redimensionar imágenes**: https://www.photopea.com/ (alternativa gratuita a Photoshop)
- **Screenshots**: Usa Android Studio o dispositivo real

---

## 🎉 ¡FELICIDADES!

Si has llegado hasta aquí, tu app está en camino a Google Play Store.

**Próximos pasos después de la aprobación:**
1. ✅ Monitorear crashes y errores en Play Console
2. ✅ Responder a reviews de usuarios
3. ✅ Verificar que las suscripciones funcionan
4. ✅ Actualizar regularmente basándote en feedback

**¡Éxito con el lanzamiento de BeRun! 🚀**

