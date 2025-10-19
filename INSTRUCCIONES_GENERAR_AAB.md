# 🚀 Instrucciones Rápidas: Generar AAB para Google Play

## ✅ Estado Actual

Tu proyecto está **LISTO** para generar el Android App Bundle. La verificación muestra:

- ✅ Java, Node.js, npm instalados
- ✅ Estructura del proyecto correcta
- ✅ Configuración de la app correcta (stride.seeker.app v1.0.0)
- ✅ Dependencias instaladas
- ⚠️ Keystore pendiente (se generará automáticamente)

## 🎯 Opción 1: Generación Automática (RECOMENDADO)

### Ejecuta el script:

```bash
./scripts/generate-release-aab.sh
```

### El script te pedirá:

1. **Contraseña del keystore** (mínimo 6 caracteres)
   - Ejemplo: `BeRun2024!Secure`
   - ⚠️ **GUÁRDALA EN UN LUGAR SEGURO**

2. **Confirmar contraseña del keystore**

3. **Contraseña de la key** (puede ser la misma)

4. **Información del certificado:**
   - Nombre y apellidos: `Tu Nombre`
   - Unidad organizativa: `Desarrollo` o `Mobile Team`
   - Organización: `BeRun` o tu empresa
   - Ciudad: `Madrid` (o tu ciudad)
   - Estado/Provincia: `Madrid` (o tu provincia)
   - Código de país: `ES` (2 letras)

### ⏱️ Tiempo estimado: 3-5 minutos

El script hará automáticamente:
1. ✅ Generar keystore
2. ✅ Configurar propiedades
3. ✅ Compilar proyecto web
4. ✅ Sincronizar con Capacitor
5. ✅ Generar AAB firmado

### 📦 Resultado:

El archivo AAB estará en:
```
android/app/build/outputs/bundle/release/app-release.aab
android/app/release/app-release.aab (copia de respaldo)
```

## 🎯 Opción 2: Generación Manual

Si prefieres hacerlo paso a paso:

### 1. Generar keystore:

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

### 2. Crear keystore.properties:

```bash
cat > android/app/keystore.properties << 'EOF'
BERUN_RELEASE_STORE_FILE=/Users/nachoamigo/stride-seeker-journey/android/app/berun-release-key.keystore
BERUN_RELEASE_STORE_PASSWORD=TU_CONTRASEÑA_AQUI
BERUN_RELEASE_KEY_ALIAS=berun-key
BERUN_RELEASE_KEY_PASSWORD=TU_CONTRASEÑA_AQUI
EOF
```

### 3. Compilar y generar AAB:

```bash
cd /Users/nachoamigo/stride-seeker-journey

# Compilar web
npm run build

# Sincronizar Capacitor
npx cap sync android

# Generar AAB
cd android
./gradlew bundleRelease
```

## 📤 Subir a Google Play Console

### 1. Accede a Google Play Console:
https://play.google.com/console

### 2. Selecciona o crea tu app

### 3. Ve a: **Producción > Prueba interna**

### 4. Crea nueva versión y sube:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### 5. Completa la información:
- **Nombre de versión**: 1.0.0
- **Notas**: Primera versión de BeRun con sistema de entrenamiento personalizado

### 6. Añade testers y envía para revisión

## 🔐 MUY IMPORTANTE: Backup del Keystore

Después de generar el keystore, **INMEDIATAMENTE** haz backup:

```bash
# Crear backup
cp android/app/berun-release-key.keystore ~/Desktop/berun-keystore-backup.keystore
cp android/app/keystore.properties ~/Desktop/berun-keystore-properties-backup.txt

# Guarda estos archivos en:
# - Google Drive
# - 1Password / LastPass
# - Disco externo
# - Cualquier lugar SEGURO
```

### ⚠️ Si pierdes el keystore:
- ❌ NO podrás actualizar tu app en Google Play
- ❌ Tendrás que crear una nueva app con nuevo package ID
- ❌ Perderás todos los usuarios y reviews

## 🐛 Solución de Problemas

### Si el script falla:

```bash
# Ver logs detallados
cd android
./gradlew bundleRelease --stacktrace
```

### Si hay error de permisos:

```bash
chmod +x scripts/*.sh
```

### Si falta Java:

```bash
# macOS
brew install openjdk@17

# Verificar
java -version
```

## ✅ Checklist Final

Antes de subir a Google Play:

- [ ] AAB generado correctamente
- [ ] Keystore respaldado en 2+ lugares seguros
- [ ] Contraseñas guardadas en gestor de contraseñas
- [ ] App probada en dispositivo físico Android
- [ ] Screenshots preparados para Google Play
- [ ] Descripción de la app lista
- [ ] Política de privacidad publicada
- [ ] Lista de testers creada

## 📞 ¿Necesitas Ayuda?

Si encuentras algún problema:

1. Revisa los logs en: `android/app/build/outputs/logs/`
2. Ejecuta con más detalles: `./gradlew bundleRelease --info`
3. Consulta: `GUIA_GENERAR_AAB.md` para más información

---

**¡Éxito con tu lanzamiento en Google Play! 🚀**
