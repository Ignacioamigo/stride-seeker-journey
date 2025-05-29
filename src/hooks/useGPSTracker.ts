
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface GPSPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: Date;
}

export interface WorkoutSession {
  id: string;
  startTime: Date;
  distance: number;
  duration: string;
  isActive: boolean;
  gpsPoints: GPSPoint[];
}

export const useGPSTracker = () => {
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GPSPoint | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastLocationRef = useRef<GPSPoint | null>(null);

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

    return R * c; // Distancia en metros
  };

  // Formatear duración en HH:MM:SS
  const formatDuration = (startTime: Date): string => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Solicitar permisos de geolocalización
  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      if (!navigator.geolocation) {
        toast({
          title: "Error",
          description: "La geolocalización no está disponible en este dispositivo.",
          variant: "destructive",
        });
        return false;
      }

      // En una PWA, simplemente intentamos obtener la ubicación
      // Los permisos se solicitan automáticamente
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => {
            setPermissionGranted(true);
            resolve(true);
          },
          (error) => {
            console.error('Error al obtener permisos de ubicación:', error);
            toast({
              title: "Permisos requeridos",
              description: "Necesitamos acceso a tu ubicación para hacer tracking del entrenamiento.",
              variant: "destructive",
            });
            resolve(false);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return false;
    }
  };

  // Guardar punto GPS en la base de datos
  const saveGPSPoint = async (point: GPSPoint, entrenamientoId: string) => {
    try {
      const { error } = await supabase
        .from('gps_points')
        .insert({
          entrenamiento_id: entrenamientoId,
          latitude: point.latitude,
          longitude: point.longitude,
          altitude: point.altitude,
          accuracy: point.accuracy,
          speed: point.speed,
          heading: point.heading,
          timestamp: point.timestamp.toISOString()
        });

      if (error) {
        console.error('Error al guardar punto GPS:', error);
      }
    } catch (error) {
      console.error('Error inesperado al guardar GPS:', error);
    }
  };

  // Crear nuevo entrenamiento en la base de datos
  const createWorkout = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('entrenamientos_completados')
        .insert({
          workout_title: 'Carrera con GPS',
          workout_type: 'carrera',
          fecha_completado: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) {
        console.error('Error al crear entrenamiento:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error inesperado al crear entrenamiento:', error);
      return null;
    }
  };

  // Completar entrenamiento
  const completeWorkout = async (sessionId: string, distance: number, duration: string) => {
    try {
      const { error } = await supabase
        .from('entrenamientos_completados')
        .update({
          distancia_recorrida: distance / 1000, // Convertir a km
          duracion: duration
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error al completar entrenamiento:', error);
      }
    } catch (error) {
      console.error('Error inesperado al completar entrenamiento:', error);
    }
  };

  // Iniciar tracking
  const startTracking = async () => {
    console.log('Iniciando tracking GPS...');
    
    if (!permissionGranted) {
      const granted = await requestLocationPermission();
      if (!granted) return;
    }

    const entrenamientoId = await createWorkout();
    if (!entrenamientoId) {
      toast({
        title: "Error",
        description: "No se pudo crear el entrenamiento.",
        variant: "destructive",
      });
      return;
    }

    const startTime = new Date();
    setWorkoutSession({
      id: entrenamientoId,
      startTime,
      distance: 0,
      duration: "00:00:00",
      isActive: true,
      gpsPoints: []
    });

    setIsTracking(true);

    // Configurar tracking continuo
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPoint: GPSPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude || undefined,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
          timestamp: new Date()
        };

        setCurrentLocation(newPoint);

        // Calcular distancia recorrida
        let newDistance = 0;
        if (lastLocationRef.current) {
          const segmentDistance = calculateDistance(lastLocationRef.current, newPoint);
          // Solo contar si la distancia es razonable (filtrar ruido GPS)
          if (segmentDistance > 2 && segmentDistance < 100) {
            newDistance = segmentDistance;
          }
        }

        setWorkoutSession(prev => {
          if (!prev) return null;
          
          const updatedSession = {
            ...prev,
            distance: prev.distance + newDistance,
            duration: formatDuration(startTime),
            gpsPoints: [...prev.gpsPoints, newPoint]
          };

          return updatedSession;
        });

        // Guardar punto en la base de datos
        saveGPSPoint(newPoint, entrenamientoId);
        lastLocationRef.current = newPoint;
      },
      (error) => {
        console.error('Error de GPS:', error);
        toast({
          title: "Error de GPS",
          description: "No se pudo obtener la ubicación. Verifica que el GPS esté habilitado.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000
      }
    );

    toast({
      title: "Tracking iniciado",
      description: "¡Comienza tu entrenamiento!",
    });
  };

  // Detener tracking
  const stopTracking = async () => {
    console.log('Deteniendo tracking GPS...');
    
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (workoutSession) {
      await completeWorkout(
        workoutSession.id,
        workoutSession.distance,
        workoutSession.duration
      );

      toast({
        title: "Entrenamiento completado",
        description: `Distancia: ${(workoutSession.distance / 1000).toFixed(2)} km`,
      });
    }

    setIsTracking(false);
    setWorkoutSession(null);
    lastLocationRef.current = null;
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Actualizar duración cada segundo
  useEffect(() => {
    if (!workoutSession?.isActive) return;

    const interval = setInterval(() => {
      setWorkoutSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          duration: formatDuration(prev.startTime)
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [workoutSession?.isActive]);

  return {
    workoutSession,
    isTracking,
    currentLocation,
    permissionGranted,
    startTracking,
    stopTracking,
    requestLocationPermission
  };
};
