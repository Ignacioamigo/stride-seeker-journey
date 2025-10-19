# Configuración Android para BeRun

## Pasos para configurar Android de manera segura

### 1. Instalar Android Studio
- Descargar e instalar Android Studio desde https://developer.android.com/studio
- Instalar Android SDK (API 33 o superior)
- Configurar variables de entorno:
  ```bash
  export ANDROID_HOME=$HOME/Android/Sdk
  export PATH=$PATH:$ANDROID_HOME/emulator
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```

### 2. Inicializar proyecto Android
```bash
# Usar la configuración específica de Android
npx cap add android --config=capacitor.config.android.ts
```

### 3. Configurar permisos Android
Los permisos necesarios se configurarán automáticamente en:
- `android/app/src/main/AndroidManifest.xml`

### 4. Scripts disponibles
- `npm run cap:android` - Ejecutar en Android
- `npm run cap:sync:android` - Sincronizar con Android
- `npm run cap:build:android` - Build y sincronizar

### 5. Configuración específica de Android
- Archivo de configuración: `capacitor.config.android.ts`
- Separado de la configuración de iOS
- No afecta la configuración existente de iOS

### 6. Estructura de archivos
```
android/                    # Proyecto Android (generado automáticamente)
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/
│   │   └── res/
│   └── build.gradle
└── build.gradle

ios/                       # Proyecto iOS (existente, no modificado)
├── App/
└── ...
```

### 7. Comandos de desarrollo
```bash
# Desarrollo web
npm run dev

# Build para Android
npm run cap:build:android

# Ejecutar en Android
npm run cap:android

# Solo sincronizar Android
npm run cap:sync:android
```

### 8. Notas importantes
- La configuración de iOS permanece intacta
- Cada plataforma tiene su propia configuración
- Los scripts están separados por plataforma
- El proyecto Android se genera en una carpeta separada
