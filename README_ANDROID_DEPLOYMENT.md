# 📱 BeRun - Despliegue Android a Google Play Store

## 📚 ÍNDICE DE DOCUMENTACIÓN

He creado **4 guías completas** para ayudarte a subir BeRun a Google Play Store:

### 1. 🚀 **PASOS_RAPIDOS_GOOGLE_PLAY.md**
   - ⚡ **Para**: Si tienes prisa
   - 📄 **Contenido**: Versión express con comandos básicos
   - ⏱️ **Tiempo**: 5 minutos de lectura

### 2. 📖 **GUIA_SUBIR_ANDROID_A_GOOGLE_PLAY.md**
   - 📘 **Para**: Guía completa paso a paso
   - 📄 **Contenido**: Todo el proceso detallado
   - ⏱️ **Tiempo**: 15 minutos de lectura, 70 minutos de implementación

### 3. 📸 **GOOGLE_PLAY_VISUAL_GUIDE.md**
   - 🎨 **Para**: Referencia visual
   - 📄 **Contenido**: Screenshots, dimensiones, ejemplos visuales
   - ⏱️ **Tiempo**: 10 minutos de lectura

### 4. 🤖 **Script Automatizado**: `scripts/generate-release-aab.sh`
   - ⚙️ **Para**: Generar AAB automáticamente
   - 📄 **Contenido**: Script bash que hace todo
   - ⏱️ **Tiempo**: 5 minutos de ejecución

---

## ⚡ INICIO RÁPIDO

### Opción A: Script Automático (Recomendado)

```bash
cd /Users/nachoamigo/stride-seeker-journey
./scripts/generate-release-aab.sh
```

### Opción B: Manual en 3 Pasos

```bash
# 1. Crear keystore (solo primera vez)
cd android/app
keytool -genkey -v -keystore berun-release-key.keystore -alias berun-key -keyalg RSA -keysize 2048 -validity 10000

# 2. Configurar contraseñas
nano android/app/keystore.properties
# Añadir contraseñas del keystore

# 3. Generar AAB
cd /Users/nachoamigo/stride-seeker-journey
npm run build
npx cap sync android
cd android
./gradlew bundleRelease
```

**Archivo AAB estará en:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## 📋 PROCESO COMPLETO

```
┌─────────────────────────────────────────┐
│  1. PREPARAR APP                        │
│     ├─ Crear keystore                   │
│     ├─ Configurar firma                 │
│     └─ Generar AAB                      │
│                                          │
│  2. CREAR APP EN GOOGLE PLAY            │
│     ├─ Ir a play.google.com/console     │
│     ├─ Crear nueva app                  │
│     └─ Completar información básica     │
│                                          │
│  3. CONFIGURAR FICHA DE PLAY STORE      │
│     ├─ Descripción corta y completa     │
│     ├─ Subir icono (512x512)            │
│     ├─ Subir feature graphic            │
│     ├─ Subir screenshots (mín 2)        │
│     └─ Configurar categoría             │
│                                          │
│  4. COMPLETAR INFORMACIÓN REQUERIDA     │
│     ├─ Política de privacidad           │
│     ├─ Clasificación de contenido       │
│     ├─ Público objetivo                 │
│     └─ Declaración de datos             │
│                                          │
│  5. SUBIR AAB                           │
│     ├─ Producción → Nueva versión       │
│     ├─ Upload AAB                       │
│     ├─ Añadir notas de versión          │
│     └─ Enviar a revisión                │
│                                          │
│  6. CONFIGURAR SUSCRIPCIONES            │
│     ├─ Crear productos                  │
│     ├─ Configurar precios                │
│     └─ Conectar con RevenueCat          │
│                                          │
│  7. ESPERAR APROBACIÓN                  │
│     └─ 1-7 días de revisión             │
└─────────────────────────────────────────┘
```

---

## 🎯 INFORMACIÓN RÁPIDA

### 📱 Información de la App

```yaml
Nombre: BeRun
Package ID: stride.seeker.app
Versión: 1.0.0
Categoría: Salud y bienestar
Público: 18+
Precio: Gratis (con compras in-app)
```

### 🎨 Assets Requeridos

```yaml
Icono: 512 x 512 px PNG
Feature Graphic: 1024 x 500 px PNG/JPG
Screenshots: Mínimo 2 (1080 x 1920 px)
```

### 💳 Suscripciones

```yaml
Mensual:
  ID: berun_premium_monthly
  Precio: €9.99/mes
  Trial: 3 días gratis
  
Anual:
  ID: berun_premium_yearly
  Precio: €34.99/año
  Trial: 3 días gratis
```

### 🔗 URLs

```yaml
Política de privacidad: https://berun.app/privacy.html
Google Play Console: https://play.google.com/console
RevenueCat Dashboard: https://app.revenuecat.com
```

---

## 📝 DESCRIPCIONES LISTAS PARA USAR

### Corta (80 caracteres):
```
Tu entrenador personal de running con planes personalizados
```

### Completa:
```
🏃‍♂️ BeRun - Tu Entrenador Personal de Running

Transforma tu forma de correr con BeRun, la app que adapta el entrenamiento 
a tu nivel y objetivos. Desde principiantes hasta corredores avanzados, 
BeRun te guía hacia el éxito.

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

Descarga BeRun hoy y comienza tu transformación como corredor. 
Tu próximo récord personal está a solo un entrenamiento de distancia.

🔐 Privacidad y Seguridad:
Tus datos están protegidos y nunca se comparten sin tu consentimiento.
```

---

## ⏱️ TIEMPO ESTIMADO TOTAL

```
📊 DESGLOSE:

Preparación:
├─ Crear keystore:              5 min
├─ Generar AAB:                 5 min
└─ Preparar assets:            30 min
                              ─────────
                               40 min

Configuración Play Console:
├─ Crear app:                  10 min
├─ Completar información:      30 min
├─ Subir AAB:                   5 min
└─ Configurar suscripciones:   15 min
                              ─────────
                               60 min

Total:                        ~100 min (1h 40min)

Revisión de Google:            1-7 días
```

---

## ✅ CHECKLIST COMPLETO

```
PREPARACIÓN:
┌────────────────────────────────────┐
│ ☐ Keystore creado                 │
│ ☐ keystore.properties configurado │
│ ☐ AAB generado sin errores        │
│ ☐ Backup de keystore guardado     │
└────────────────────────────────────┘

ASSETS:
┌────────────────────────────────────┐
│ ☐ Icono 512x512 listo             │
│ ☐ Feature graphic 1024x500 listo  │
│ ☐ Mínimo 2 screenshots tomados    │
└────────────────────────────────────┘

GOOGLE PLAY CONSOLE:
┌────────────────────────────────────┐
│ ☐ Cuenta de desarrollador activa  │
│ ☐ App creada                       │
│ ☐ Descripción completa             │
│ ☐ Assets subidos                   │
│ ☐ Política de privacidad           │
│ ☐ Clasificación de contenido       │
│ ☐ Declaración de datos             │
│ ☐ AAB subido                        │
│ ☐ Notas de versión escritas        │
└────────────────────────────────────┘

MONETIZACIÓN:
┌────────────────────────────────────┐
│ ☐ Producto mensual creado          │
│ ☐ Producto anual creado            │
│ ☐ Service Account configurado      │
│ ☐ RevenueCat conectado             │
└────────────────────────────────────┘

LANZAMIENTO:
┌────────────────────────────────────┐
│ ☐ Todo revisado                    │
│ ☐ Enviado a revisión               │
│ ☐ Email de confirmación recibido   │
└────────────────────────────────────┘
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Problema: No puedo generar AAB

```bash
# Solución:
cd /Users/nachoamigo/stride-seeker-journey/android
./gradlew clean
./gradlew bundleRelease
```

### Problema: Error de firma

```bash
# Verificar que existe:
ls -la android/app/keystore.properties
ls -la android/app/berun-release-key.keystore

# Si faltan, seguir PASO 1 y 2 de la guía
```

### Problema: AAB muy grande

```
# Ya está configurado en build.gradle:
- minifyEnabled = true
- shrinkResources = true
- ProGuard activado

# Si aún es muy grande (>150MB), revisar:
- Eliminar assets no usados
- Optimizar imágenes
```

---

## 📞 RECURSOS ADICIONALES

### Documentación Oficial:
- **Google Play Console**: https://play.google.com/console/about/guides/
- **Android App Bundle**: https://developer.android.com/guide/app-bundle
- **RevenueCat Android**: https://docs.revenuecat.com/docs/android

### Herramientas Útiles:
- **Photopea** (editor imágenes gratis): https://www.photopea.com/
- **TinyPNG** (optimizar imágenes): https://tinypng.com/

---

## 🎯 SIGUIENTE PASO

### Si es tu primera vez:

1. **Lee primero**: `PASOS_RAPIDOS_GOOGLE_PLAY.md`
2. **Luego consulta**: `GUIA_SUBIR_ANDROID_A_GOOGLE_PLAY.md`
3. **Para dudas visuales**: `GOOGLE_PLAY_VISUAL_GUIDE.md`

### Si ya sabes qué hacer:

```bash
./scripts/generate-release-aab.sh
```

Y luego sube el AAB a Google Play Console.

---

## 🎉 ¡ÉXITO!

Con estas guías tienes **TODO** lo necesario para:
- ✅ Generar el AAB firmado
- ✅ Configurar Google Play Console
- ✅ Subir tu app
- ✅ Configurar suscripciones
- ✅ Lanzar BeRun en Play Store

**¡Tu app estará en Google Play muy pronto! 🚀**

---

## 📧 NOTAS FINALES

### ⚠️ IMPORTANTE - No perder:
- Keystore (berun-release-key.keystore)
- Contraseñas del keystore
- Hacer backup en lugar seguro

### 📱 Después del lanzamiento:
- Monitorear crashes en Play Console
- Responder a reviews de usuarios
- Actualizar basándote en feedback
- Mantener app actualizada

---

**Creado: 1 de Octubre, 2025**
**Versión: 1.0.0**
**App: BeRun - stride.seeker.app**


