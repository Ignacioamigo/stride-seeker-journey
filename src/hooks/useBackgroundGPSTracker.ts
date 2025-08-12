import { useState, useEffect, useRef } from 'react';
import { BackgroundGeolocationPlugin, ExtendedWatcherOptions } from '@capacitor-community/background-geolocation';
import { registerPlugin } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { saveCompletedWorkout } from '@/services/completedWorkoutService';
import { toast } from '@/hooks/use-toast';
import { markClosestSessionAsCompleted, getUserProfileId, loadLatestPlan } from '@/services/planService';

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

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

// Función para detectar si estamos en Capacitor
const isCapacitor = () => {
  return typeof window !== 'undefined' && 
         window.Capacitor && 
         window.Capacitor.isNative;
};

export const useBackgroundGPSTracker = () => {
  const [runSession, setRunSession] = useState<RunSession | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GPSPoint | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null); // null = checking, true = granted, false = denied
  const watcherIdRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const formatDuration = (startTime: Date, endTime?: Date): string => {
    const now = endTime || new Date();
    const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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

  const requestPermissions = async (): Promise<boolean> => {
    try {
      console.log('Solicitando permisos de ubicación...');
      
      // Use Capacitor's Geolocation plugin for permission requests
      const permissions = await Geolocation.requestPermissions();
      
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
      toast({
        title: "Error de permisos",
        description: "No se pudieron obtener los permisos de ubicación.",
        variant: "destructive",
      });
      return false;
    }
  };

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

      const watcherId = await BackgroundGeolocation.addWatcher(
        {
          backgroundMessage: "Tracking tu carrera en segundo plano.",
          backgroundTitle: "Stride Seeker",
          requestPermissions: true,
          stale: false,
          distanceFilter: 5,
          activityType: "fitness",
          desiredAccuracy: "high",
          stationaryRadius: 10,
          stopDetectionDelay: 5,
          stopTimeout: 5,
          batteryLevel: true,
          batteryLevelThreshold: 20,
          accuracy: {
            ios: "best",
            android: "high"
          },
          activityRecognitionInterval: 1000,
          stopOnTerminate: false,
          startForeground: true,
          foregroundService: {
            channelId: "location_service",
            channelName: "Location Tracking",
            title: "Stride Seeker",
            text: "Tracking tu carrera",
            icon: "ic_launcher",
            color: "#4CAF50"
          }
        } as ExtendedWatcherOptions,
        (location, error) => {
          if (error) {
            console.error('Error de GPS:', error);
            return;
          }

          if (location) {
            if (location.accuracy && location.accuracy > 10) {
              console.log('Lectura descartada por baja precisión:', location.accuracy);
              return;
            }

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

            setRunSession(prev => {
              if (!prev || prev.isPaused) return prev;
              
              let newDistance = prev.distance;
              
              if (prev.gpsPoints.length > 0) {
                const lastPoint = prev.gpsPoints[prev.gpsPoints.length - 1];
                const segmentDistance = calculateDistance(lastPoint, newPoint);
                
                // Solo sumar distancia si el movimiento es significativo y preciso
                if (segmentDistance > 5 && segmentDistance < 100 && 
                    newPoint.accuracy && newPoint.accuracy <= 10) {
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

  const pauseRun = async () => {
    console.log('Pausando carrera...');
    setIsPaused(true);
    setRunSession(prev => prev ? { ...prev, isPaused: true } : null);
    
    toast({
      title: "Carrera pausada",
      description: "Presiona reanudar para continuar",
    });
  };

  const resumeRun = async () => {
    console.log('Reanudando carrera...');
    setIsPaused(false);
    setRunSession(prev => prev ? { ...prev, isPaused: false } : null);
    
    toast({
      title: "Carrera reanudada",
      description: "Continúa tu entrenamiento",
    });
  };

  const finishRun = async () => {
    console.log('Finalizando carrera...');
    
    if (!runSession) return;

    try {
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

      const success = await saveCompletedWorkout(
        'Carrera con GPS',
        'carrera',
        finalDistance / 1000,
        finalDuration
        // No tenemos plan_id ni week_number para GPS tracker
      );

      if (success) {
        try {
          const userId = await getUserProfileId();
          const plan = await loadLatestPlan();
          if (userId && plan) {
            const sessionId = await markClosestSessionAsCompleted({
              userId,
              planId: plan.id,
              workoutTitle: 'Carrera con GPS',
              workoutType: 'carrera',
              actualDistance: finalDistance / 1000,
              actualDuration: finalDuration,
              workoutDate: new Date().toISOString().split('T')[0]
            });
            if (sessionId) {
              window.dispatchEvent(new Event('plan-updated'));
            }
          }
        } catch (e) {
          console.error('Error asociando entrenamiento GPS a slot del plan:', e);
        }

        toast({
          title: "¡Carrera completada!",
          description: `Distancia: ${(finalDistance / 1000).toFixed(2)} km • Pace: ${avgPace}`,
        });

        window.dispatchEvent(new CustomEvent('workoutCompleted'));
      } else {
        toast({
          title: "Carrera guardada localmente",
          description: "Se guardará en el servidor cuando tengas conexión",
          variant: "destructive",
        });
      }

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

  // Verificar permisos al inicializar el hook
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (isCapacitor()) {
          console.log('Verificando permisos de ubicación en Capacitor...');
          const permissions = await Geolocation.checkPermissions();
          console.log('Estado actual de permisos:', permissions);
          
          if (permissions.location === 'granted') {
            console.log('Permisos ya concedidos, obteniendo ubicación inicial...');
            setPermissionGranted(true);
            // Obtener ubicación inicial
            try {
              const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000
              });
              const newPoint: GPSPoint = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                altitude: position.coords.altitude || undefined,
                accuracy: position.coords.accuracy,
                speed: position.coords.speed || undefined,
                timestamp: new Date()
              };
              setCurrentLocation(newPoint);
            } catch (error) {
              console.error('Error obteniendo ubicación inicial:', error);
            }
          } else if (permissions.location === 'prompt-with-rationale') {
            console.log('Permisos en estado prompt-with-rationale');
            setPermissionGranted(true);
          } else {
            console.log('Permisos no concedidos:', permissions.location);
            setPermissionGranted(false);
          }
        } else {
          // En web, usar la API de geolocalización del navegador
          console.log('Verificando permisos de ubicación en web...');
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                console.log('Permisos concedidos en web, obteniendo ubicación...');
                setPermissionGranted(true);
                const newPoint: GPSPoint = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  altitude: position.coords.altitude || undefined,
                  accuracy: position.coords.accuracy,
                  speed: position.coords.speed || undefined,
                  timestamp: new Date()
                };
                setCurrentLocation(newPoint);
              },
              (error) => {
                console.log('Permisos no concedidos en web:', error.message);
                setPermissionGranted(false);
              },
              { enableHighAccuracy: true, timeout: 5000 }
            );
          } else {
            console.log('Geolocalización no disponible en este navegador');
            setPermissionGranted(false);
          }
        }
      } catch (error) {
        console.error('Error al verificar permisos:', error);
        // En caso de error, intentamos verificar de otra manera
        try {
          if (isCapacitor()) {
            // Intentar obtener una posición para verificar si los permisos están concedidos
            await Geolocation.getCurrentPosition();
            console.log('Permisos verificados mediante getCurrentPosition en Capacitor');
            setPermissionGranted(true);
          }
        } catch (getPositionError) {
          console.log('Permisos no disponibles:', getPositionError);
          setPermissionGranted(false);
        }
      }
    };

    checkPermissions();
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
