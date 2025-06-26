import { WatcherOptions } from '@capacitor-community/background-geolocation';

declare module '@capacitor-community/background-geolocation' {
  interface ExtendedWatcherOptions extends WatcherOptions {
    activityType?: 'fitness' | 'automotive' | 'other' | 'airborne';
    desiredAccuracy?: 'high' | 'medium' | 'low';
    stationaryRadius?: number;
    stopDetectionDelay?: number;
    stopTimeout?: number;
    batteryLevel?: boolean;
    batteryLevelThreshold?: number;
    accuracy?: {
      ios?: 'best' | 'high' | 'medium' | 'low';
      android?: 'high' | 'medium' | 'low';
    };
    activityRecognitionInterval?: number;
    stopOnTerminate?: boolean;
    startForeground?: boolean;
    foregroundService?: {
      channelId: string;
      channelName: string;
      title: string;
      text: string;
      icon: string;
      color: string;
    };
  }
}

// Declaración de tipos para Capacitor
declare global {
  interface Window {
    Capacitor?: {
      isNative: boolean;
      platform: string;
    };
  }
} 