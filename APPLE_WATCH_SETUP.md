# 🍎 Apple Watch Setup - Stride Seeker

## ✅ Archivos Creados

Ya se han creado todos los archivos necesarios para la Apple Watch app:

### 📱 Watch Extension (Lógica)
- `ios/App/Watch Extension/WorkoutManager.swift` - Gestión de entrenamientos
- `ios/App/Watch Extension/ContentView.swift` - Interfaz de usuario
- `ios/App/Watch Extension/StrideSeekerWatchApp.swift` - Punto de entrada
- `ios/App/Watch Extension/ExtensionDelegate.swift` - Delegado de la extensión
- `ios/App/Watch Extension/Info.plist` - Configuración con capabilities

### ⌚ Watch App (UI)
- `ios/App/Watch App/Info.plist` - Permisos de ubicación

### 📲 iPhone Integration
- `src/services/watchConnectivityService.ts` - Servicio de conectividad
- `ios/App/App/AppDelegate.swift` - Recepción de datos del Watch
- `src/main.tsx` - Importación del servicio

## 🔧 Configuración en Xcode

### 1️⃣ Abrir el Proyecto
```bash
open ios/App/App.xcworkspace
```

### 2️⃣ Añadir Archivos al Target Correcto

1. **Selecciona los archivos Swift en el Project Navigator:**
   - `WorkoutManager.swift`
   - `ContentView.swift` 
   - `StrideSeekerWatchApp.swift`
   - `ExtensionDelegate.swift`

2. **En el File Inspector (panel derecho), marca "Target Membership":**
   - ✅ **Stride Seeker Watch Extension** (para todos los .swift)
   - ❌ Stride Seeker (desmarcado)
   - ❌ Stride Seeker Watch (desmarcado)

### 3️⃣ Configurar Capabilities - Watch Extension

1. **Selecciona el target "Stride Seeker Watch Extension"**
2. **Ve a "Signing & Capabilities"**
3. **Añade estas capabilities:**

   **Background Modes:**
   - ✅ Workout processing
   - ✅ Location updates

   **HealthKit:**
   - ✅ Clinical Health Records (automático)
   - ✅ HealthKit (automático)

### 4️⃣ Configurar Capabilities - Watch App

1. **Selecciona el target "Stride Seeker Watch"**
2. **Ve a "Signing & Capabilities"**
3. **Asegúrate de que tiene:**
   - ✅ WatchKit App (debería estar automáticamente)

### 5️⃣ Verificar Info.plist Files

Los archivos `Info.plist` ya están creados con la configuración correcta:

**Watch Extension Info.plist:**
- ✅ `UIBackgroundModes` (workout-processing, location)
- ✅ `NSLocationWhenInUseUsageDescription`
- ✅ `NSHealthShareUsageDescription`
- ✅ `NSHealthUpdateUsageDescription`

**Watch App Info.plist:**
- ✅ `NSLocationWhenInUseUsageDescription`
- ✅ `NSLocationTemporaryUsageDescriptionDictionary`

### 6️⃣ Configurar Bundle Identifiers

Verifica que los Bundle IDs son correctos:

- **Stride Seeker:** `com.stridseeker.app`
- **Stride Seeker Watch:** `com.stridseeker.app.watchkitapp`
- **Stride Seeker Watch Extension:** `com.stridseeker.app.watchkitapp.watchkitextension`

## 🚀 Compilar y Probar

### 1️⃣ Seleccionar Scheme
- En Xcode, selecciona el scheme: **"Stride Seeker Watch (Complication)"**
- Target: **Apple Watch** (simulador o dispositivo físico)

### 2️⃣ Build & Run
```
⌘ + R
```

### 3️⃣ Verificar Funcionalidad

**En el Apple Watch:**
1. Se abre la app "Stride Seeker"
2. Presiona "Iniciar" para comenzar entrenamiento
3. Ve métricas en tiempo real: tiempo, distancia, ritmo, frecuencia cardíaca
4. Usa botones Pause/Resume/Stop
5. Al finalizar, los datos se envían automáticamente al iPhone

**En el iPhone:**
1. Los entrenamientos del Watch aparecen automáticamente en la app
2. Se guardan en Supabase en la tabla `published_activities`
3. Marcados con `imported_from_watch: true`

## 🔄 Flujo Completo

1. **Apple Watch:** Usuario inicia entrenamiento
2. **HealthKit + CoreLocation:** Captura métricas y GPS
3. **WatchConnectivity:** Envía datos al iPhone al finalizar
4. **iPhone AppDelegate:** Recibe los datos y los pasa al WebView
5. **watchConnectivityService:** Procesa y guarda en Supabase
6. **App React:** Muestra automáticamente la nueva actividad

## 🐛 Troubleshooting

### Error de Certificados
- Ve a **Signing & Capabilities**
- Activa **"Automatically manage signing"**
- Selecciona tu **Apple Developer Team**

### Watch No Conecta
- Asegúrate de que el iPhone y Watch están emparejados
- Verifica que ambos dispositivos tienen la app instalada
- Reinicia ambos dispositivos si es necesario

### Permisos No Funcionan
- Revisa que los `Info.plist` tienen los permisos correctos
- Ve a Configuración del iPhone > Privacidad > Localización > Stride Seeker
- Ve a Configuración del iPhone > Privacidad > Salud > Stride Seeker

## ✨ Funcionalidades

### Métricas en Tiempo Real
- ⏱️ **Tiempo:** Cronómetro preciso
- 📏 **Distancia:** GPS tracking
- 🏃 **Ritmo:** min/km calculado automáticamente
- ❤️ **Frecuencia Cardíaca:** Desde HealthKit
- 🔥 **Calorías:** Cálculo automático

### Controles
- ▶️ **Iniciar:** Comienza el entrenamiento
- ⏸️ **Pausar:** Pausa temporalmente
- ▶️ **Reanudar:** Continúa el entrenamiento
- ⏹️ **Finalizar:** Termina y envía al iPhone

### Sincronización Automática
- 📲 Los entrenamientos se sincronizan automáticamente
- 💾 Se guardan en tu perfil de Stride Seeker
- 📊 Aparecen en tus estadísticas y historial
- 🔄 No necesitas hacer nada manual

¡Disfruta corriendo con tu Apple Watch! 🏃‍♂️⌚

