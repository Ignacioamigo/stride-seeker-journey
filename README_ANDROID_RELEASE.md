# 📱 BeRun - Android Release Guide

Guía completa para generar y publicar el Android App Bundle (.aab) en Google Play.

## 🚀 Inicio Rápido

### Opción 1: Helper Interactivo (Más Fácil)

```bash
./scripts/android-release-helper.sh
```

Este script te mostrará un menú con todas las opciones disponibles.

### Opción 2: Script Automático

```bash
# Primera vez (genera keystore)
./scripts/generate-release-aab.sh

# Siguientes veces (keystore ya existe)
./scripts/quick-release-aab.sh
```

## 📋 Scripts Disponibles

| Script | Descripción | Cuándo usar |
|--------|-------------|-------------|
| `android-release-helper.sh` | Menú interactivo con todas las opciones | Siempre (recomendado) |
| `verify-release-ready.sh` | Verifica que todo está listo | Antes de generar AAB |
| `generate-release-aab.sh` | Genera AAB completo (con keystore) | Primera vez |
| `quick-release-aab.sh` | Genera AAB rápido | Actualizaciones |

## 🔑 Keystore

### Primera Generación

El keystore se genera automáticamente la primera vez que ejecutas el script. Se te pedirá:

1. **Contraseña del keystore** (mínimo 6 caracteres)
2. **Contraseña de la key** (puede ser la misma)
3. **Información del certificado**:
   - Nombre completo
   - Unidad organizativa
   - Organización
   - Ciudad
   - Estado/Provincia
   - Código de país (2 letras)

### Ubicación del Keystore

```
android/app/berun-release-key.keystore
android/app/keystore.properties
```

### ⚠️ CRÍTICO: Backup del Keystore

**Después de generar el keystore, INMEDIATAMENTE haz backup:**

```bash
# Crear backup
mkdir -p ~/BeRun-Keystore-Backup
cp android/app/berun-release-key.keystore ~/BeRun-Keystore-Backup/
cp android/app/keystore.properties ~/BeRun-Keystore-Backup/

# Comprimir con fecha
tar -czf ~/BeRun-Keystore-Backup-$(date +%Y%m%d).tar.gz ~/BeRun-Keystore-Backup/
```

**Guarda el backup en:**
- ✅ Google Drive / Dropbox
- ✅ 1Password / LastPass (como documento seguro)
- ✅ Disco externo
- ✅ Repositorio privado (NO el mismo repo de la app)

**Si pierdes el keystore:**
- ❌ NO podrás actualizar tu app
- ❌ Tendrás que crear nueva app con nuevo package ID
- ❌ Perderás usuarios, reviews y estadísticas

## 📦 Proceso de Generación del AAB

### Paso 1: Verificación

```bash
./scripts/verify-release-ready.sh
```

Verifica:
- ✅ Java JDK instalado
- ✅ Node.js y npm
- ✅ Estructura del proyecto
- ✅ Configuración de firma
- ✅ Dependencias

### Paso 2: Generación

```bash
./scripts/generate-release-aab.sh
```

El script ejecuta automáticamente:

1. **Genera/verifica keystore**
2. **Limpia builds anteriores**
3. **Compila proyecto web** (`npm run build`)
4. **Sincroniza Capacitor** (`npx cap sync android`)
5. **Genera AAB firmado** (`./gradlew bundleRelease`)

### Paso 3: Resultado

El AAB se genera en:

```
android/app/build/outputs/bundle/release/app-release.aab
android/app/release/app-release.aab (copia de respaldo)
```

## 📤 Subir a Google Play Console

### 1. Acceder a Google Play Console

https://play.google.com/console

### 2. Crear o Seleccionar App

- **Nueva app**: Crear aplicación
- **App existente**: Seleccionar de la lista

### 3. Configurar Prueba Interna

```
Producción > Prueba interna > Crear nueva versión
```

### 4. Subir AAB

- Click en **"Subir"**
- Seleccionar: `app-release.aab`
- Esperar procesamiento (1-5 minutos)

### 5. Completar Información

**Nombre de la versión:** 1.0.0

**Notas de la versión (español):**
```
Primera versión de BeRun - Tu entrenador personal de running

✨ Características principales:
• Sistema de entrenamiento personalizado basado en IA
• Seguimiento GPS en tiempo real de tus carreras
• Integración con Strava
• Planes de entrenamiento adaptativos
• Estadísticas detalladas de rendimiento
• Preparación para carreras específicas

🏃‍♂️ ¡Comienza tu viaje hacia tu mejor versión como corredor!
```

**Notas de la versión (inglés):**
```
First release of BeRun - Your personal running coach

✨ Key features:
• AI-powered personalized training system
• Real-time GPS tracking for your runs
• Strava integration
• Adaptive training plans
• Detailed performance statistics
• Race-specific preparation

🏃‍♂️ Start your journey to become your best runner self!
```

### 6. Configurar Testers

- Crear lista de testers
- Añadir emails (máximo 100 para prueba interna)
- Guardar

### 7. Enviar para Revisión

- Revisar toda la información
- Click en **"Enviar para revisión"**
- Tiempo de revisión: 1-3 días

## 🔄 Actualizar la App

Para versiones futuras:

### 1. Actualizar Versión

Edita `android/app/build.gradle`:

```gradle
versionCode 2        // Incrementar en 1
versionName "1.0.1"  // Actualizar según semantic versioning
```

### 2. Generar Nuevo AAB

```bash
./scripts/quick-release-aab.sh
```

### 3. Subir a Google Play

Mismo proceso que la primera vez, pero en una nueva versión.

## 📊 Información del Proyecto

- **Package ID**: `stride.seeker.app`
- **Version Code**: 1
- **Version Name**: 1.0.0
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 34 (Android 14)
- **Compile SDK**: 34

## 🐛 Solución de Problemas

### Error: "keystore.properties not found"

```bash
# El script lo genera automáticamente
./scripts/generate-release-aab.sh
```

### Error: "keytool: command not found"

```bash
# Instalar Java JDK
brew install openjdk@17  # macOS
sudo apt install openjdk-17-jdk  # Linux

# Verificar
java -version
```

### Error: "JAVA_HOME not set"

```bash
# macOS
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc

# Linux
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
```

### Error durante bundleRelease

```bash
# Limpiar y reintentar
cd android
./gradlew clean
./gradlew bundleRelease --stacktrace
```

### Error: "npm run build" falla

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
npm run build
```

### AAB muy grande (>150MB)

```bash
# Verificar assets
du -sh android/app/src/main/assets/*

# Limpiar assets innecesarios
cd android/app/src/main/assets
# Eliminar archivos no necesarios
```

## 📋 Checklist Pre-Release

Antes de subir a Google Play:

### Técnico
- [ ] AAB generado correctamente
- [ ] Keystore respaldado en 2+ lugares
- [ ] Contraseñas guardadas en gestor seguro
- [ ] Version code y name actualizados
- [ ] App probada en dispositivo físico
- [ ] No hay errores de compilación
- [ ] Permisos correctos en AndroidManifest.xml

### Google Play Console
- [ ] App creada en Google Play Console
- [ ] Información de la app completada
- [ ] Descripción corta y larga
- [ ] Screenshots (mínimo 2, máximo 8)
- [ ] Icono de la app (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Categoría seleccionada
- [ ] Política de privacidad publicada
- [ ] Contacto de soporte configurado

### Legal
- [ ] Política de privacidad accesible
- [ ] Términos y condiciones
- [ ] Declaración de permisos
- [ ] Cumplimiento GDPR (si aplica)

## 🎨 Assets Requeridos para Google Play

### Iconos
- **App Icon**: 512x512 PNG (32-bit con alpha)
- **Feature Graphic**: 1024x500 PNG

### Screenshots
- **Mínimo**: 2 screenshots
- **Máximo**: 8 screenshots
- **Tamaño**: 320-3840 px (ancho y alto)
- **Formato**: PNG o JPEG
- **Orientación**: Portrait o Landscape

### Video (Opcional)
- YouTube URL del video promocional

## 📞 Soporte

### Logs

```bash
# Ver logs de Gradle
cat android/app/build/outputs/logs/manifest-merger-release-report.txt

# Ver logs detallados
cd android
./gradlew bundleRelease --info > build.log 2>&1
```

### Documentación Oficial

- [Android App Bundle](https://developer.android.com/guide/app-bundle)
- [Google Play Console](https://support.google.com/googleplay/android-developer)
- [Capacitor Android](https://capacitorjs.com/docs/android)

## 🎯 Próximos Pasos

Después de subir el AAB:

1. **Esperar revisión** (1-3 días)
2. **Invitar testers** (prueba interna)
3. **Recopilar feedback**
4. **Iterar y mejorar**
5. **Promover a prueba cerrada** (más testers)
6. **Promover a prueba abierta** (público limitado)
7. **Lanzar a producción** 🚀

---

**¡Éxito con tu lanzamiento en Google Play! 🎉**

Para más información, consulta:
- `GUIA_GENERAR_AAB.md` - Guía detallada
- `INSTRUCCIONES_GENERAR_AAB.md` - Instrucciones rápidas
