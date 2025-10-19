# ⚡ Comandos Rápidos - Android Release

## 🎯 Generar AAB (Todo en Uno)

```bash
# Menú interactivo (RECOMENDADO)
./scripts/android-release-helper.sh

# Primera vez (con keystore)
./scripts/generate-release-aab.sh

# Rápido (keystore ya existe)
./scripts/quick-release-aab.sh
```

## 🔍 Verificación

```bash
# Verificar que todo está listo
./scripts/verify-release-ready.sh

# Ver información del proyecto
./scripts/android-release-helper.sh  # Opción 5
```

## 🔨 Build Manual

```bash
# Compilar web
npm run build

# Sincronizar Capacitor
npx cap sync android

# Generar AAB
cd android && ./gradlew bundleRelease

# Limpiar y generar
cd android && ./gradlew clean bundleRelease
```

## 🔑 Keystore

```bash
# Generar keystore manualmente
cd android/app
keytool -genkeypair -v -storetype PKCS12 \
  -keystore berun-release-key.keystore \
  -alias berun-key -keyalg RSA -keysize 2048 \
  -validity 10000

# Ver información del keystore
keytool -list -v -keystore android/app/berun-release-key.keystore

# Verificar firma del AAB
jarsigner -verify -verbose -certs android/app/build/outputs/bundle/release/app-release.aab
```

## 💾 Backup

```bash
# Backup del keystore
cp android/app/berun-release-key.keystore ~/Desktop/berun-keystore-backup.keystore
cp android/app/keystore.properties ~/Desktop/berun-keystore-backup.properties

# Backup comprimido con fecha
tar -czf ~/Desktop/berun-keystore-$(date +%Y%m%d).tar.gz \
  android/app/berun-release-key.keystore \
  android/app/keystore.properties
```

## 🧹 Limpieza

```bash
# Limpiar build de Android
cd android && ./gradlew clean

# Limpiar todo (Android + Web)
rm -rf android/app/build dist node_modules/.vite

# Limpiar y reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 📦 Información del AAB

```bash
# Ver tamaño del AAB
ls -lh android/app/build/outputs/bundle/release/app-release.aab

# Ver contenido del AAB
unzip -l android/app/build/outputs/bundle/release/app-release.aab

# Copiar AAB al escritorio
cp android/app/build/outputs/bundle/release/app-release.aab ~/Desktop/
```

## 🔄 Actualizar Versión

```bash
# Editar versión manualmente
nano android/app/build.gradle

# O con sed (incrementar versionCode)
sed -i '' 's/versionCode [0-9]*/versionCode 2/' android/app/build.gradle
sed -i '' 's/versionName "[^"]*"/versionName "1.0.1"/' android/app/build.gradle
```

## 🐛 Debug

```bash
# Ver logs de Gradle
cd android && ./gradlew bundleRelease --info

# Ver logs con stacktrace
cd android && ./gradlew bundleRelease --stacktrace

# Ver logs completos
cd android && ./gradlew bundleRelease --debug > build.log 2>&1

# Ver manifest final
cat android/app/build/outputs/logs/manifest-merger-release-report.txt
```

## 🧪 Testing

```bash
# Ejecutar en emulador
npm run cap:android

# Instalar AAB en dispositivo (requiere bundletool)
bundletool build-apks --bundle=android/app/build/outputs/bundle/release/app-release.aab \
  --output=app.apks --mode=universal
bundletool install-apks --apks=app.apks
```

## ⚙️ Configuración

```bash
# Ver versión de Java
java -version

# Ver versión de Gradle
cd android && ./gradlew --version

# Ver versión de Node
node --version

# Ver versión de npm
npm --version

# Ver versión de Capacitor
npx cap --version
```

## 📱 Capacitor

```bash
# Sincronizar todo
npx cap sync

# Sincronizar solo Android
npx cap sync android

# Actualizar Capacitor
npx cap update android

# Abrir en Android Studio
npx cap open android
```

## 🔐 Permisos Scripts

```bash
# Dar permisos a todos los scripts
chmod +x scripts/*.sh

# Dar permisos individuales
chmod +x scripts/generate-release-aab.sh
chmod +x scripts/quick-release-aab.sh
chmod +x scripts/verify-release-ready.sh
chmod +x scripts/android-release-helper.sh
```

## 🌐 URLs Útiles

```bash
# Abrir Google Play Console
open https://play.google.com/console

# Abrir documentación Android
open https://developer.android.com/guide/app-bundle

# Abrir documentación Capacitor
open https://capacitorjs.com/docs/android
```

## 📊 Estadísticas del Proyecto

```bash
# Líneas de código
find src -name "*.tsx" -o -name "*.ts" | xargs wc -l

# Tamaño del proyecto
du -sh .

# Tamaño de node_modules
du -sh node_modules

# Tamaño del build web
du -sh dist

# Tamaño del build Android
du -sh android/app/build
```

## 🎨 Assets

```bash
# Ver assets de Android
ls -lh android/app/src/main/res/

# Ver iconos
ls -lh android/app/src/main/res/mipmap-*/

# Ver assets web
ls -lh android/app/src/main/assets/
```

## 🔍 Búsqueda Rápida

```bash
# Buscar en código
grep -r "stride.seeker.app" android/

# Buscar versionCode
grep -r "versionCode" android/app/build.gradle

# Buscar applicationId
grep -r "applicationId" android/app/build.gradle

# Buscar permisos
grep -r "uses-permission" android/app/src/main/AndroidManifest.xml
```

---

## 🎯 Workflow Completo (Copy-Paste)

```bash
# 1. Verificar
./scripts/verify-release-ready.sh

# 2. Generar AAB
./scripts/generate-release-aab.sh

# 3. Backup
cp android/app/berun-release-key.keystore ~/Desktop/
cp android/app/keystore.properties ~/Desktop/

# 4. Verificar AAB
ls -lh android/app/build/outputs/bundle/release/app-release.aab

# 5. Copiar al escritorio para subir
cp android/app/build/outputs/bundle/release/app-release.aab ~/Desktop/

# ✅ Listo para subir a Google Play Console
```

---

## 📞 Ayuda Rápida

```bash
# Ver ayuda de los scripts
./scripts/android-release-helper.sh

# Ver documentación completa
cat README_ANDROID_RELEASE.md

# Ver resumen ejecutivo
cat RESUMEN_ANDROID_RELEASE.md
```
