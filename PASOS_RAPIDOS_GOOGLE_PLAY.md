# 🚀 GUÍA RÁPIDA: Subir BeRun a Google Play Store

## ⚡ VERSIÓN EXPRESS (Si tienes prisa)

### 🎯 OPCIÓN 1: Usar el Script Automatizado

```bash
cd /Users/nachoamigo/stride-seeker-journey
./scripts/generate-release-aab.sh
```

El script hace TODO automáticamente:
- ✅ Build del proyecto
- ✅ Sync con Android
- ✅ Genera el AAB firmado
- ✅ Te dice dónde está el archivo

---

### 🎯 OPCIÓN 2: Manual (Paso a Paso)

#### 1️⃣ Crear Keystore (Solo primera vez)

```bash
cd /Users/nachoamigo/stride-seeker-journey/android/app

keytool -genkey -v -keystore berun-release-key.keystore -alias berun-key -keyalg RSA -keysize 2048 -validity 10000
```

**Completa la información:**
- Contraseña: [CREA UNA Y GUÁRDALA]
- Nombre: BeRun Team
- Organización: BeRun
- Ciudad: Madrid
- Provincia: Madrid
- País: ES

#### 2️⃣ Configurar Contraseñas

```bash
nano /Users/nachoamigo/stride-seeker-journey/android/app/keystore.properties
```

Copia esto (reemplaza TU_CONTRASEÑA):
```
BERUN_RELEASE_STORE_FILE=berun-release-key.keystore
BERUN_RELEASE_STORE_PASSWORD=TU_CONTRASEÑA
BERUN_RELEASE_KEY_ALIAS=berun-key
BERUN_RELEASE_KEY_PASSWORD=TU_CONTRASEÑA
```

Guardar: `Ctrl+X`, luego `Y`, luego `Enter`

#### 3️⃣ Generar AAB

```bash
cd /Users/nachoamigo/stride-seeker-journey
npm run build
npx cap sync android
cd android
./gradlew bundleRelease
```

El archivo estará en:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## 📤 SUBIR A GOOGLE PLAY CONSOLE

### Paso 1: Ir a Google Play Console
```
🌐 https://play.google.com/console
```

### Paso 2: Crear App (Primera vez)
- Click en **"Create app"**
- Nombre: **BeRun**
- Idioma: **Español (España)**
- Tipo: **Aplicación**
- Gratis/Pago: **Gratis** (con compras in-app)

### Paso 3: Subir AAB
1. Ir a **"Producción"** (Production)
2. Click **"Crear nueva versión"**
3. **"Upload"** → Seleccionar `app-release.aab`
4. Completar **"Notas de la versión"**:

```
🎉 Primera versión de BeRun

✨ Funcionalidades:
• Planes de entrenamiento personalizados
• Seguimiento GPS de entrenamientos
• Integración con Strava
• Análisis de rendimiento
• Planes premium con 3 días gratis
```

5. Click **"Guardar"** y luego **"Enviar a revisión"**

---

## 📋 INFORMACIÓN QUE NECESITARÁS

### 📝 Descripciones

**Corta** (80 caracteres):
```
Tu entrenador personal de running con planes personalizados
```

**Completa**:
```
🏃‍♂️ BeRun - Tu Entrenador Personal de Running

Transforma tu forma de correr con BeRun, la app que adapta el entrenamiento a tu nivel y objetivos.

🎯 CARACTERÍSTICAS:
✅ Planes personalizados para 5K, 10K, media maratón y maratón
✅ Seguimiento GPS avanzado
✅ Análisis inteligente de rendimiento
✅ Integración con Strava
✅ 3 días de prueba gratis

🏆 PERFECTO PARA:
• Principiantes que quieren empezar
• Corredores que buscan mejorar
• Atletas preparando competencias

Descarga BeRun y comienza tu transformación hoy.
```

### 🎨 Gráficos Requeridos

**1. Icono (512 x 512 px)**
- Ubicación: `public/BeRun_appicon_1024_blue1463FF.png`
- Acción: Redimensionar a 512x512

**2. Screenshots (Mínimo 2)**
- Tamaño: 1080 x 1920 px
- Acción: Capturar pantallas de la app en Android

### 🔗 URLs

**Política de privacidad:**
```
https://berun.app/privacy.html
```

### 🏷️ Categoría
```
Categoría: Salud y bienestar
Público: 18+
```

---

## 💳 CONFIGURAR SUSCRIPCIONES

### En Google Play Console → Monetización → Suscripciones

#### Producto 1: Mensual
```yaml
ID: berun_premium_monthly
Nombre: BeRun Premium Mensual
Precio: €9.99
Período: 1 mes
Prueba gratis: 3 días
Estado: Activo
```

#### Producto 2: Anual
```yaml
ID: berun_premium_yearly
Nombre: BeRun Premium Anual
Precio: €34.99
Período: 1 año
Prueba gratis: 3 días
Estado: Activo
```

---

## ⏱️ TIEMPO ESTIMADO

```
🔐 Crear keystore:           5 minutos
📦 Generar AAB:              5 minutos
📱 Crear app en console:     10 minutos
📝 Completar información:    30 minutos
📤 Subir AAB:                5 minutos
💳 Configurar suscripciones: 15 minutos
─────────────────────────────────────
⏰ TOTAL:                    ~70 minutos
```

---

## ✅ CHECKLIST MÍNIMO

Para lanzar solo necesitas:

- [ ] Keystore creado
- [ ] AAB generado
- [ ] App creada en Play Console
- [ ] Descripción corta y completa
- [ ] Icono 512x512 subido
- [ ] 2 screenshots mínimo
- [ ] Política de privacidad URL
- [ ] Clasificación de contenido completada
- [ ] AAB subido
- [ ] Enviado a revisión

---

## 🆘 COMANDOS DE EMERGENCIA

### Si algo falla, empieza de cero:

```bash
cd /Users/nachoamigo/stride-seeker-journey
rm -rf android/app/build
npm run build
npx cap sync android
cd android
./gradlew clean
./gradlew bundleRelease
```

### Verificar que el AAB existe:

```bash
ls -lh /Users/nachoamigo/stride-seeker-journey/android/app/build/outputs/bundle/release/app-release.aab
```

---

## 📞 SI NECESITAS AYUDA DETALLADA

Lee el archivo completo:
```
GUIA_SUBIR_ANDROID_A_GOOGLE_PLAY.md
```

---

## 🎉 ¡ESO ES TODO!

**3 comandos principales:**
```bash
# 1. Crear keystore (solo primera vez)
keytool -genkey -v -keystore android/app/berun-release-key.keystore -alias berun-key -keyalg RSA -keysize 2048 -validity 10000

# 2. Generar AAB
./scripts/generate-release-aab.sh

# 3. Subir a Google Play Console
# (manual en https://play.google.com/console)
```

**¡Tu app estará en Google Play en 1-7 días! 🚀**

