
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f20075a364dd4e768cac356cfec575f8',
  appName: 'Stride Seeker',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    BackgroundGeolocation: {
      notificationTitle: "Stride Seeker",
      notificationText: "Tracking tu carrera en segundo plano",
      enableHighAccuracy: true
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;
