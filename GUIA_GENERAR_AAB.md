# 🚀 Guía: Generar Android App Bundle (.aab) para Google Play

Esta guía te ayudará a generar un **Android App Bundle (.aab)** firmado para subir tu app a Google Play Console (prueba interna o producción).

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Node.js** y **npm** (para compilar el proyecto web)
- ✅ **Java JDK 17+** (para firmar el AAB)
- ✅ **Android SDK** (instalado con Android Studio)
- ✅ **Gradle** (incluido en el proyecto)

### Verificar Java

```bash
java -version
# Debe mostrar versión 17 o superior
```

Si no tienes Java instalado:
- **macOS**: `brew install openjdk@17`
- **Linux**: `sudo apt install openjdk-17-jdk`
- **Windows**: Descarga desde [Oracle](https://www.oracle.com/java/technologies/downloads/)

## 🎯 Método 1: Script Automatizado (Recomendado)

### Primera vez (con generación de keystore)

```bash
# Dar permisos de ejecución
chmod +x scripts/generate-release-aab.sh

# Ejecutar script
./scripts/generate-release-aab.sh
```

El script te pedirá:
1. **Contraseña del keystore** (guárdala en un lugar seguro)
2. **Contraseña de la key** (puede ser la misma)
3. **Información del certificado**:
   - Nombre y apellidos
   - Unidad organizativa (ej: "Desarrollo")
   - Organización (ej: "BeRun")
   - Ciudad
   - Estado/Provincia
   - Código de país (2 letras, ej: "ES")

### Siguientes veces (keystore ya configurado)

```bash
# Script rápido
chmod +x scripts/quick-release-aab.sh
./scripts/quick-release-aab.sh
```

## 🔧 Método 2: Paso a Paso Manual

### Paso 1: Generar Keystore (solo primera vez)

```bash
cd android/app

keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore berun-release-key.keystore \
  -alias berun-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Guarda las contraseñas en un lugar seguro** (las necesitarás para futuras actualizaciones).

### Paso 2: Configurar keystore.properties

Crea el archivo `android/app/keystore.properties`:

```properties
BERUN_RELEASE_STORE_FILE=/ruta/completa/al/berun-release-key.keystore
BERUN_RELEASE_STORE_PASSWORD=tu_contraseña_store
BERUN_RELEASE_KEY_ALIAS=berun-key
BERUN_RELEASE_KEY_PASSWORD=tu_contraseña_key
```

### Paso 3: Compilar el proyecto web

```bash
npm run build
```

### Paso 4: Sincronizar con Capacitor

```bash
npx cap sync android
```

### Paso 5: Generar el AAB

```bash
cd android
./gradlew bundleRelease
```

El archivo se generará en:
```
android/app/build/outputs/bundle/release/app-release.aab
```

## 📦 Verificar el AAB Generado

### Ver información del AAB

```bash
# Verificar firma
jarsigner -verify -verbose -certs android/app/build/outputs/bundle/release/app-release.aab

# Ver contenido
unzip -l android/app/build/outputs/bundle/release/app-release.aab
```

### Verificar tamaño

```bash
ls -lh android/app/build/outputs/bundle/release/app-release.aab
```

## 🎯 Subir a Google Play Console

### 1. Acceder a Google Play Console

Ve a: https://play.google.com/console

### 2. Seleccionar tu app

- Si es nueva: **Crear aplicación**
- Si ya existe: Selecciona tu app de la lista

### 3. Ir a Prueba Interna

```
Producción > Prueba interna > Crear nueva versión
```

### 4. Subir el AAB

- Haz clic en **"Subir"**
- Selecciona: `android/app/build/outputs/bundle/release/app-release.aab`
- Espera a que se procese

### 5. Completar información

- **Nombre de la versión**: 1.0.0 (o el número que corresponda)
- **Notas de la versión**: Describe los cambios o características
  ```
  Primera versión de BeRun:
  - Sistema de entrenamiento personalizado
  - Seguimiento de carreras
  - Integración con Strava
  - Planes de entrenamiento adaptativos
  ```

### 6. Configurar testers (Prueba interna)

- Crea una lista de testers
- Añade emails de las personas que probarán la app
- Guarda y envía

### 7. Enviar para revisión

- Revisa toda la información
- Haz clic en **"Enviar para revisión"**
- Google revisará tu app (puede tardar unas horas o días)

## 🔐 Seguridad del Keystore

### ⚠️ MUY IMPORTANTE

El archivo `berun-release-key.keystore` es **CRÍTICO**:

- ❌ **NUNCA** lo subas a Git o repositorios públicos
- ✅ **SIEMPRE** haz backup en un lugar seguro (Drive, 1Password, etc.)
- ✅ **GUARDA** las contraseñas en un gestor de contraseñas
- ⚠️ Si lo pierdes, **NO PODRÁS** actualizar tu app en Google Play

### Backup recomendado

```bash
# Crear backup cifrado
tar -czf berun-keystore-backup-$(date +%Y%m%d).tar.gz \
  android/app/berun-release-key.keystore \
  android/app/keystore.properties

# Guardar en lugar seguro (Drive, 1Password, etc.)
```

## 🐛 Solución de Problemas

### Error: "keystore.properties not found"

```bash
# Crea el archivo basándote en el ejemplo
cp android/app/keystore.properties.example android/app/keystore.properties
# Edita con tus valores reales
```

### Error: "keytool: command not found"

```bash
# Instala Java JDK
brew install openjdk@17  # macOS
# o
sudo apt install openjdk-17-jdk  # Linux
```

### Error: "Execution failed for task ':app:bundleRelease'"

```bash
# Limpia y vuelve a intentar
cd android
./gradlew clean
./gradlew bundleRelease
```

### Error: "Build failed" durante npm run build

```bash
# Verifica dependencias
npm install

# Intenta de nuevo
npm run build
```

### Error: "JAVA_HOME not set"

```bash
# macOS/Linux
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# O añade a ~/.zshrc o ~/.bashrc
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
```

## 📊 Información de la App

- **Package ID**: `stride.seeker.app`
- **Version Code**: 1
- **Version Name**: 1.0.0
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 34 (Android 14)

## 🔄 Actualizar la App

Para versiones futuras:

1. **Actualiza el versionCode y versionName** en `android/app/build.gradle`:
   ```gradle
   versionCode 2
   versionName "1.0.1"
   ```

2. **Genera nuevo AAB**:
   ```bash
   ./scripts/quick-release-aab.sh
   ```

3. **Sube a Google Play Console** (mismo proceso)

## 📚 Recursos Adicionales

- [Documentación oficial de Android App Bundle](https://developer.android.com/guide/app-bundle)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)

## ✅ Checklist Final

Antes de subir a Google Play:

- [ ] AAB generado y firmado correctamente
- [ ] Keystore respaldado en lugar seguro
- [ ] Contraseñas guardadas en gestor de contraseñas
- [ ] Version code y version name actualizados
- [ ] App probada en dispositivo físico
- [ ] Permisos necesarios declarados en AndroidManifest.xml
- [ ] Iconos y assets incluidos
- [ ] Notas de la versión preparadas
- [ ] Lista de testers creada (para prueba interna)

---

**¿Necesitas ayuda?** Revisa la sección de solución de problemas o consulta los logs de Gradle en `android/app/build/outputs/logs/`.
