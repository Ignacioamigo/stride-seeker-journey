
# Configuración del proyecto iOS

## Team ID configurado: 8XU2YSP537

## Pasos para Xcode:

### 1. Abrir el proyecto
```bash
cd ios
pod install
open AiRunningCoach.xcworkspace
```

### 2. Configurar Bundle Identifier
- Seleccionar el proyecto "AiRunningCoach" en el navegador
- En "Signing & Capabilities":
  - Bundle Identifier: `com.airunningcoach.app`
  - Team: Seleccionar el team con ID `8XU2YSP537`

### 3. Activar capacidades requeridas
En "Signing & Capabilities", añadir:
- **Background Modes** → ✅ Location updates

### 4. Verificar configuración
- Display Name: "AI Running Coach"
- Version: 1.0
- Build: 1
- Deployment Target: iOS 12.0 o superior

### 5. App Icons
Necesitarás generar y añadir estos tamaños en `Images.xcassets/AppIcon.appiconset/`:
- 20x20, 40x40, 60x60 (Notification, Settings)
- 29x29, 58x58, 87x87 (Settings)
- 40x40, 80x80, 120x120 (Spotlight)
- 60x60, 120x120, 180x180 (App icon)
- 76x76, 152x152 (iPad)
- 167x167 (iPad Pro)
- 1024x1024 (App Store)

### 6. Compilar y probar
```bash
# Para simulador
npx react-native run-ios

# Para dispositivo (requiere certificado de desarrollo)
npx react-native run-ios --device
```

### 7. Archive para TestFlight
- Product → Archive
- Distribuir → App Store Connect
- Upload

## Checklist de App Store:
- ✅ Privacy strings configurados
- ✅ Background modes justificados
- ✅ Política de privacidad accesible
- ✅ App icons en todas las dimensiones
- ✅ Launch screen configurado
- ✅ Localización básica (es/en)

## Próximos pasos:
1. Configurar certificados de desarrollo/distribución
2. Probar en dispositivo real
3. Validar tracking GPS en segundo plano
4. Crear build para TestFlight
5. Configurar App Store Connect con screenshots
