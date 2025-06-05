
import { useState, useEffect, useRef } from 'react';
import { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import { registerPlugin } from '@capacitor/core';
import { saveCompletedWorkout } from '@/services/completedWorkoutService';
import { toast } from '@/hooks/use-toast';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

export interface GPSPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  timestamp: Date;
}

export interface RunSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  distance: number; // en metros
  duration: string; // formato HH:MM:SS
  isActive: boolean;
  isPaused: boolean;
  gpsPoints: GPSPoint[];
  avgPace?: string;
}

export const useBackgroundGPSTracker = () => {
  const [runSession, setRunSession] = useState<RunSession | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GPSPoint | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const watcherIdRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calcular distancia entre dos puntos GPS (fórmula de Haversine)
  const calculateDistance = (point1: GPSPoint, point2: GPSPoint): number => {
    const R = 6371000; // Radio de la Tierra en metros
    const lat1Rad = (point1.latitude * Math.PI) / 180;
    const lat2Rad = (point2.latitude * Math.PI) / 180;
    const deltaLatRad = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const deltaLonRad = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
      Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Formatear duración en HH:MM:SS
  const formatDuration = (startTime: Date, endTime?: Date): string => {
    const now = endTime || new Date();
    const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calcular pace promedio
  const calculatePace = (distance: number, duration: string): string => {
    if (distance === 0) return '--:--';
    
    const durationParts = duration.split(':');
    const totalMinutes = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]) + parseInt(durationParts[2]) / 60;
    const kmDistance = distance / 1000;
    
    if (kmDistance === 0) return '--:--';
    
    const paceMinutes = totalMinutes / kmDistance;
    const minutes = Math.floor(paceMinutes);
    const seconds = Math.floor((paceMinutes - minutes) * 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
  };

  // Solicitar permisos
  const requestPermissions = async (): Promise<boolean> => {
    try {
      console.log('Solicitando permisos de ubicación...');
      
      const permissions = await BackgroundGeolocation.requestPermissions({
        permissions: ['location', 'background-location']
      });
      
      console.log('Permisos obtenidos:', permissions);
      
      if (permissions.location === 'granted') {
        setPermissionGranted(true);
        return true;
      }
      
      toast({
        title: "Permisos requeridos",
        description: "Necesitamos acceso a tu ubicación para hacer tracking del entrenamiento.",
        variant: "destructive",
      });
      
      return false;
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return false;
    }
  };

  // Iniciar tracking
  const startRun = async () => {
    console.log('Iniciando carrera...');
    
    if (!permissionGranted) {
      const granted = await requestPermissions();
      if (!granted) return;
    }

    try {
      const startTime = new Date();
      const sessionId = `run_${Date.now()}`;
      
      setRunSession({
        id: sessionId,
        startTime,
        distance: 0,
        duration: "00:00:00",
        isActive: true,
        isPaused: false,
        gpsPoints: []
      });

      setIsTracking(true);
      setIsPaused(false);

      // Configurar background geolocation
      const watcherId = await BackgroundGeolocation.addWatcher(
        {
          backgroundMessage: "Tracking tu carrera en segundo plano.",
          backgroundTitle: "Stride Seeker",
          requestPermissions: true,
          stale: false,
          distanceFilter: 5, // Mínimo 5 metros entre puntos
        },
        (location, error) => {
          if (error) {
            console.error('Error de GPS:', error);
            return;
          }

          if (location) {
            console.log('Nueva ubicación:', location);
            
            const newPoint: GPSPoint = {
              latitude: location.latitude,
              longitude: location.longitude,
              altitude: location.altitude || undefined,
              accuracy: location.accuracy,
              speed: location.speed || undefined,
              timestamp: new Date()
            };

            setCurrentLocation(newPoint);

            // Actualizar sesión solo si no está pausada
            setRunSession(prev => {
              if (!prev || prev.isPaused) return prev;
              
              let newDistance = prev.distance;
              
              // Calcular distancia si hay puntos previos
              if (prev.gpsPoints.length > 0) {
                const lastPoint = prev.gpsPoints[prev.gpsPoints.length - 1];
                const segmentDistance = calculateDistance(lastPoint, newPoint);
                
                // Filtrar ruido GPS (máximo 50m entre puntos)
                if (segmentDistance > 2 && segmentDistance < 50) {
                  newDistance += segmentDistance;
                }
              }

              return {
                ...prev,
                distance: newDistance,
                duration: formatDuration(startTime),
                gpsPoints: [...prev.gpsPoints, newPoint]
              };
            });
          }
        }
      );

      watcherIdRef.current = watcherId;

      // Timer para actualizar duración cada segundo
      intervalRef.current = setInterval(() => {
        setRunSession(prev => {
          if (!prev || prev.isPaused) return prev;
          return {
            ...prev,
            duration: formatDuration(prev.startTime)
          };
        });
      }, 1000);

      toast({
        title: "Carrera iniciada",
        description: "¡Comienza tu entrenamiento!",
      });

    } catch (error) {
      console.error('Error al iniciar tracking:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el tracking GPS",
        variant: "destructive",
      });
    }
  };

  // Pausar tracking
  const pauseRun = async () => {
    console.log('Pausando carrera...');
    setIsPaused(true);
    setRunSession(prev => prev ? { ...prev, isPaused: true } : null);
    
    toast({
      title: "Carrera pausada",
      description: "Presiona reanudar para continuar",
    });
  };

  // Reanudar tracking
  const resumeRun = async () => {
    console.log('Reanudando carrera...');
    setIsPaused(false);
    setRunSession(prev => prev ? { ...prev, isPaused: false } : null);
    
    toast({
      title: "Carrera reanudada",
      description: "Continúa tu entrenamiento",
    });
  };

  // Finalizar tracking y guardar en base de datos
  const finishRun = async () => {
    console.log('Finalizando carrera...');
    
    if (!runSession) return;

    try {
      // Detener tracking
      if (watcherIdRef.current) {
        await BackgroundGeolocation.removeWatcher({ id: watcherIdRef.current });
        watcherIdRef.current = null;
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      const endTime = new Date();
      const finalDuration = formatDuration(runSession.startTime, endTime);
      const finalDistance = runSession.distance;
      const avgPace = calculatePace(finalDistance, finalDuration);

      const finalSession = {
        ...runSession,
        endTime,
        duration: finalDuration,
        isActive: false,
        avgPace
      };

      setRunSession(finalSession);

      // Guardar en base de datos
      const success = await saveCompletedWorkout(
        'Carrera con GPS',
        'carrera',
        finalDistance / 1000, // convertir a km
        finalDuration
      );

      if (success) {
        toast({
          title: "¡Carrera completada!",
          description: `Distancia: ${(finalDistance / 1000).toFixed(2)} km • Pace: ${avgPace}`,
        });

        // Disparar evento para actualizar estadísticas
        window.dispatchEvent(new CustomEvent('workoutCompleted'));
      } else {
        toast({
          title: "Carrera guardada localmente",
          description: "Se guardará en el servidor cuando tengas conexión",
          variant: "destructive",
        });
      }

      // Limpiar estado
      setIsTracking(false);
      setIsPaused(false);
      setCurrentLocation(null);

    } catch (error) {
      console.error('Error al finalizar carrera:', error);
      toast({
        title: "Error al guardar",
        description: "La carrera se guardó localmente",
        variant: "destructive",
      });
    }
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (watcherIdRef.current) {
        BackgroundGeolocation.removeWatcher({ id: watcherIdRef.current });
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    runSession,
    isTracking,
    isPaused,
    currentLocation,
    permissionGranted,
    startRun,
    pauseRun,
    resumeRun,
    finishRun,
    requestPermissions
  };
};
