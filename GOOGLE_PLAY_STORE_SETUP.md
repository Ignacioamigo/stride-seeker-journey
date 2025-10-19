# 🚀 Google Play Store Deployment Guide - BeRun

## 📋 Checklist de Despliegue

### ✅ Completado:
- [x] Proyecto Android generado
- [x] Build.gradle configurado para producción
- [x] Configuración específica de Android aplicada

### 🔄 En Progreso:
- [ ] Configuración de firma de aplicación (keystore)
- [ ] Generación de iconos para Android
- [ ] Configuración de permisos
- [ ] Creación de Google Play Console

---

## 🔐 1. Configuración de Firma de Aplicación (Keystore)

### Crear Keystore
```bash
# Navegar al directorio android/app
cd android/app

# Generar keystore (GUARDA ESTA INFORMACIÓN DE FORMA SEGURA)
keytool -genkey -v -keystore berun-release-key.keystore -alias berun-key -keyalg RSA -keysize 2048 -validity 10000

# Información a proporcionar:
# - Contraseña del keystore: [CREAR CONTRASEÑA SEGURA]
# - Contraseña de la clave: [CREAR CONTRASEÑA SEGURA]
# - Nombre y apellido: BeRun Team
# - Unidad organizacional: BeRun
# - Organización: BeRun
# - Ciudad: Madrid
# - Estado/Provincia: Madrid
# - Código de país: ES
```

### Configurar Gradle para Signing
Crear archivo `android/app/keystore.properties`:
```properties
storePassword=[TU_STORE_PASSWORD]
keyPassword=[TU_KEY_PASSWORD]
keyAlias=berun-key
storeFile=berun-release-key.keystore
```

---

## 🎨 2. Iconos de Aplicación

### Configuración de Iconos
- **Icono principal**: `public/BeRun_appicon_1024_blue1463FF.png` (1024x1024)
- **Fondo adaptable**: Se generará automáticamente
- **Icono redondo**: Se generará automáticamente

### Estructura de iconos Android:
```
android/app/src/main/res/
├── mipmap-mdpi/         (48x48)
├── mipmap-hdpi/         (72x72)
├── mipmap-xhdpi/        (96x96)
├── mipmap-xxhdpi/       (144x144)
└── mipmap-xxxhdpi/      (192x192)
```

---

## 📱 3. Información de la Aplicación

### Datos para Play Store:
- **Nombre de la app**: BeRun
- **Descripción corta**: Tu entrenador personal de running con planes personalizados
- **Descripción larga**: [Ver sección completa abajo]
- **Categoría**: Salud y bienestar
- **Clasificación de contenido**: Para todas las edades
- **Política de privacidad**: https://berun.app/privacy.html

### Versioning:
- **Version Code**: 1 (incrementar en cada release)
- **Version Name**: 1.0.0
- **Target SDK**: 34 (Android 14)
- **Min SDK**: 23 (Android 6.0)

---

## 🔧 4. Comandos de Build

### Development
```bash
# Build de desarrollo
npm run build
npm run cap:sync:android

# Abrir en Android Studio
npx cap open android
```

### Production Release
```bash
# Build optimizado
npm run build

# Sync con Android
npx cap sync android

# Generar AAB (Android App Bundle)
cd android
./gradlew bundleRelease

# El archivo AAB estará en:
# android/app/build/outputs/bundle/release/app-release.aab
```

---

## 📝 5. Permisos Requeridos

### AndroidManifest.xml - Permisos necesarios:
```xml
<!-- Localización (GPS tracking) -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

<!-- Red -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Almacenamiento -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

<!-- Notificaciones -->
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

<!-- Vibración -->
<uses-permission android:name="android.permission.VIBRATE" />
```

---

## 🎯 6. Google Play Console Setup

### Pasos para crear la aplicación:
1. **Ir a Google Play Console**: https://play.google.com/console
2. **Crear nueva aplicación**:
   - Nombre: BeRun
   - Idioma predeterminado: Español (España)
   - Tipo de aplicación: App
   - Gratis o de pago: Gratis (con compras in-app)

3. **Configurar ficha de Play Store**:
   - Descripción corta (80 caracteres)
   - Descripción completa (4000 caracteres)
   - Screenshots: mínimo 2, máximo 8
   - Icono: 512x512 PNG

4. **Configurar contenido de la aplicación**:
   - Clasificación de contenido
   - Público objetivo
   - Política de privacidad
   - Declaraciones de datos

---

## 📸 7. Assets para Play Store

### Screenshots requeridos:
- **Teléfono**: 2-8 screenshots (16:9 o 9:16)
- **Tablet 7"**: Opcional
- **Tablet 10"**: Opcional

### Tamaños recomendados:
- **Teléfono**: 1080x1920 o 1080x2340
- **Gráfico de funciones**: 1024x500 (opcional)

---

## 🔍 8. Testing

### Antes del release:
```bash
# Test en emulador
npx cap run android

# Test en dispositivo físico
# 1. Habilitar modo desarrollador
# 2. Habilitar depuración USB
# 3. Conectar dispositivo
npx cap run android --target=[DEVICE_ID]

# Verificar permisos
# Probar funcionalidades GPS
# Probar notificaciones
# Probar sincronización con Supabase
```

---

## 📄 9. Descripción de la App para Play Store

### Descripción Corta (80 caracteres):
"Tu entrenador personal de running con planes personalizados"

### Descripción Completa:
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

✅ Planes Freemium
• Versión gratuita con funcionalidades básicas
• Planes premium para entrenamientos avanzados
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

---

## ⚠️ IMPORTANTE - Información Confidencial

### 🔐 Keystore Security:
- **NUNCA** subir el keystore al control de versiones
- **GUARDAR** las contraseñas en un lugar seguro
- **HACER BACKUP** del keystore (perderlo significa no poder actualizar la app)

### 📂 Archivos a excluir de Git:
```gitignore
# Android signing
android/app/*.keystore
android/app/keystore.properties
android/app/berun-release-key.keystore
```

---

## 🚀 Próximos Pasos

1. [ ] Generar keystore para firma
2. [ ] Configurar iconos de aplicación
3. [ ] Revisar permisos en AndroidManifest.xml
4. [ ] Crear cuenta de Google Play Console
5. [ ] Generar AAB para upload
6. [ ] Configurar ficha de la app en Play Store
7. [ ] Subir primera versión para review

¡El proyecto Android está listo para el despliegue! 🎉
