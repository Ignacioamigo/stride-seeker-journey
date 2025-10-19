import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'stride.seeker.app',
  appName: 'BeRun',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    BackgroundGeolocation: {
      notificationTitle: "BeRun",
      notificationText: "Tracking tu carrera en segundo plano",
      enableHighAccuracy: true
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#1463FF",
      sound: "beep.wav",
    },
    Geolocation: {
      permissions: ["location"]
    },
    App: {
      handleUrlOpen: true
    },
    Browser: {
      presentationStyle: "popover"
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#1463FF",
      overlaysWebView: false
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: "#f9fafb",
    appendUserAgent: "BeRun Android App"
  }
};

export default config;
