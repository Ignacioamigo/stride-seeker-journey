import { Capacitor } from '@capacitor/core';
import { supabase } from '../integrations/supabase/client';

export interface WatchWorkoutData {
  type: 'workout_completed';
  startTime: number; // timestamp
  endTime: number; // timestamp
  duration: number; // seconds
  distance: number; // meters
  averageHeartRate: number;
  activeEnergy: number; // calories
  gpsPoints: Array<{
    latitude: number;
    longitude: number;
    timestamp: number;
    altitude: number;
    speed: number;
  }>;
  activityType: string;
}

class WatchConnectivityService {
  private isNative: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    if (this.isNative) {
      this.setupWatchConnectivity();
    }
  }

  private async setupWatchConnectivity() {
    try {
      // Register for watch connectivity events
      if (window.webkit?.messageHandlers?.watchConnectivity) {
        window.webkit.messageHandlers.watchConnectivity.postMessage({
          action: 'setup',
        });
      }

      // Listen for messages from Watch
      window.addEventListener('watchMessage', this.handleWatchMessage.bind(this));
    } catch (error) {
      console.error('Error setting up watch connectivity:', error);
    }
  }

  private async handleWatchMessage(event: any) {
    const data = event.detail as WatchWorkoutData;
    
    if (data.type === 'workout_completed') {
      await this.processWatchWorkout(data);
    }
  }

  private async processWatchWorkout(workoutData: WatchWorkoutData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return;
      }

      // Convert watch data to our app format
      const activityData = {
        user_id: user.id,
        fecha: new Date(workoutData.startTime * 1000).toISOString().split('T')[0],
        hora_inicio: new Date(workoutData.startTime * 1000).toTimeString().split(' ')[0],
        distancia: workoutData.distance / 1000, // Convert to km
        duracion: Math.round(workoutData.duration / 60), // Convert to minutes
        velocidad_promedio: workoutData.distance > 0 ? (workoutData.distance / 1000) / (workoutData.duration / 3600) : 0, // km/h
        ritmo_promedio: workoutData.distance > 0 ? workoutData.duration / (workoutData.distance / 1000) : 0, // seconds per km
        calorias: Math.round(workoutData.activeEnergy),
        frecuencia_cardiaca_promedio: Math.round(workoutData.averageHeartRate),
        gps_points: workoutData.gpsPoints,
        temperatura: null,
        humedad: null,
        sensacion_termica: null,
        imported_from_watch: true,
        published: true
      };

      // Insert into published_activities table
      const { data: publishedActivity, error: publishError } = await supabase
        .from('published_activities')
        .insert(activityData)
        .select()
        .single();

      if (publishError) {
        console.error('Error publishing watch activity:', publishError);
        return;
      }

      console.log('Watch workout successfully imported:', publishedActivity);

      // Show success notification to user
      this.showSuccessNotification('Entrenamiento del Apple Watch importado correctamente');

    } catch (error) {
      console.error('Error processing watch workout:', error);
      this.showErrorNotification('Error al importar entrenamiento del Apple Watch');
    }
  }

  private showSuccessNotification(message: string) {
    // You can integrate with your existing toast/notification system
    if (window.showToast) {
      window.showToast({
        title: 'Éxito',
        description: message,
        variant: 'success'
      });
    } else {
      console.log('SUCCESS:', message);
    }
  }

  private showErrorNotification(message: string) {
    // You can integrate with your existing toast/notification system
    if (window.showToast) {
      window.showToast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    } else {
      console.error('ERROR:', message);
    }
  }

  // Method to send messages to Watch (for future use)
  public async sendMessageToWatch(message: any) {
    if (!this.isNative) return;

    try {
      if (window.webkit?.messageHandlers?.watchConnectivity) {
        window.webkit.messageHandlers.watchConnectivity.postMessage({
          action: 'sendMessage',
          data: message
        });
      }
    } catch (error) {
      console.error('Error sending message to watch:', error);
    }
  }

  // Check if Watch is connected and reachable
  public async isWatchReachable(): Promise<boolean> {
    if (!this.isNative) return false;

    try {
      if (window.webkit?.messageHandlers?.watchConnectivity) {
        return new Promise((resolve) => {
          const timeoutId = setTimeout(() => resolve(false), 2000);
          
          const handler = (event: any) => {
            if (event.detail.type === 'reachability') {
              clearTimeout(timeoutId);
              window.removeEventListener('watchMessage', handler);
              resolve(event.detail.reachable);
            }
          };

          window.addEventListener('watchMessage', handler);
          
          window.webkit.messageHandlers.watchConnectivity.postMessage({
            action: 'checkReachability'
          });
        });
      }
    } catch (error) {
      console.error('Error checking watch reachability:', error);
    }

    return false;
  }
}

// Export singleton instance
export const watchConnectivityService = new WatchConnectivityService();

// Extend window interface for TypeScript
declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        watchConnectivity?: {
          postMessage: (message: any) => void;
        };
      };
    };
    showToast?: (options: {
      title: string;
      description: string;
      variant: 'success' | 'destructive';
    }) => void;
  }
}
