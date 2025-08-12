import { useState, useEffect, useRef } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import { registerPlugin } from '@capacitor/core';
import { toast } from '@/hooks/use-toast';

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
  distance: number;
  duration: string;
  isActive: boolean;
  isPaused: boolean;
  gpsPoints: GPSPoint[];
  avgPace?: string;
}

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

const isCapacitor = () => {
  try {
    return typeof window !== 'undefined' && 
           window.Capacitor && 
           window.Capacitor.isNativePlatform && 
           window.Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

export const useSimpleGPSTracker = () => {
  const [runSession, setRunSession] = useState<RunSession | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GPSPoint | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundWatcherIdRef = useRef<string | null>(null);

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

  // Función simple para obtener ubicación actual
  const getCurrentPosition = async (): Promise<GPSPoint | null> => {
    try {
      console.log('Obteniendo ubicación actual...');
      console.log('Es Capacitor?', isCapacitor());
      console.log('Navigator.geolocation disponible?', !!navigator.geolocation);
      
      if (isCapacitor()) {
        console.log('Usando Capacitor Geolocation...');
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 8000, // Reducido de 15s a 8s para ser más rápido
          maximumAge: 30000 // Reducido de 60s a 30s para posiciones más frescas
        });
        
        console.log('Ubicación obtenida (Capacitor):', position);
        
        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude || undefined,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || undefined,
          timestamp: new Date()
        };
      } else {
        console.log('Usando Web Geolocation API...');
        
        if (!navigator.geolocation) {
          console.error('Geolocalización no disponible en este navegador');
          throw new Error('Geolocalización no disponible');
        }

        return new Promise((resolve, reject) => {
          const successCallback = (position: GeolocationPosition) => {
            console.log('Ubicación obtenida (Web):', position);
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude || undefined,
              accuracy: position.coords.accuracy,
              speed: position.coords.speed || undefined,
              timestamp: new Date()
            });
          };

          const errorCallback = (error: GeolocationPositionError) => {
            console.error('Error geolocalización web:', {
              code: error.code,
              message: error.message,
              PERMISSION_DENIED: error.PERMISSION_DENIED,
              POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
              TIMEOUT: error.TIMEOUT
            });
            
            let errorMessage = 'Error desconocido';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Permisos de ubicación denegados';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Ubicación no disponible';
                break;
              case error.TIMEOUT:
                errorMessage = 'Timeout obteniendo ubicación';
                break;
            }
            
            reject(new Error(errorMessage));
          };

          navigator.geolocation.getCurrentPosition(
            successCallback,
            errorCallback,
            {
              enableHighAccuracy: true,
              timeout: 8000, // Reducido de 15s a 8s para ser más rápido
              maximumAge: 30000 // Reducido de 60s a 30s para posiciones más frescas
            }
          );
        });
      }
    } catch (error) {
      console.error('Error obteniendo posición:', error);
      return null;
    }
  };

  // Solicitar permisos explícitamente
  const requestPermissions = async (): Promise<boolean> => {
    try {
      console.log('Solicitando permisos de ubicación...');
      console.log('Es Capacitor?', isCapacitor());
      
      if (isCapacitor()) {
        console.log('Solicitando permisos con Capacitor...');
        const permissions = await Geolocation.requestPermissions();
        console.log('Permisos obtenidos:', permissions);
        
        if (permissions.location === 'granted') {
          setPermissionGranted(true);
          const location = await getCurrentPosition();
          if (location) {
            setCurrentLocation(location);
            return true;
          } else {
            console.log('Permisos concedidos pero no se pudo obtener ubicación');
            setPermissionGranted(false);
            return false;
          }
        } else {
          console.log('Permisos denegados en Capacitor');
          setPermissionGranted(false);
          return false;
        }
      } else {
        console.log('Solicitando permisos en Web (navigator.geolocation)...');
        
        // En web, intentar obtener ubicación directamente (esto solicita permisos automáticamente)
        try {
          const location = await getCurrentPosition();
          if (location) {
            console.log('Ubicación obtenida exitosamente en web');
            setPermissionGranted(true);
            setCurrentLocation(location);
            return true;
          } else {
            console.log('No se pudo obtener ubicación en web');
            setPermissionGranted(false);
            return false;
          }
        } catch (webError) {
          console.error('Error obteniendo ubicación en web:', webError);
          setPermissionGranted(false);
          return false;
        }
      }
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      setPermissionGranted(false);
      return false;
    }
  };

  // Inicializar permisos y ubicación al montar
  useEffect(() => {
    const initializeGPS = async () => {
      console.log('Inicializando GPS...');
      console.log('Window Capacitor:', window.Capacitor);
      console.log('Navigator geolocation:', navigator.geolocation);
      
      try {
        if (isCapacitor()) {
          console.log('Inicializando en Capacitor...');
          // En Capacitor, primero verificar permisos existentes
          const permissions = await Geolocation.checkPermissions();
          console.log('Permisos actuales en Capacitor:', permissions);
          
          if (permissions.location === 'granted') {
            console.log('Permisos ya concedidos en Capacitor');
            setPermissionGranted(true);
            const location = await getCurrentPosition();
            if (location) {
              setCurrentLocation(location);
            } else {
              console.log('Permisos OK pero fallo ubicación');
              setPermissionGranted(false);
            }
          } else {
            console.log('Permisos no concedidos, marcando como false');
            setPermissionGranted(false);
          }
        } else {
          console.log('Inicializando en Web...');
          // En web, no intentamos obtener ubicación automáticamente
          // Dejamos que el usuario presione el botón para solicitar permisos
          setPermissionGranted(false);
        }
      } catch (error) {
        console.error('Error inicializando GPS:', error);
        setPermissionGranted(false);
      }
    };

    initializeGPS();
  }, []);

  // Cleanup al desmontar componente
  useEffect(() => {
    return () => {
      // Limpiar interval si existe
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Limpiar watchers si existen
      if (isCapacitor() && backgroundWatcherIdRef.current) {
        try {
          BackgroundGeolocation.removeWatcher({ id: backgroundWatcherIdRef.current });
        } catch (error) {
          console.error('Error en cleanup background watcher:', error);
        }
      } else if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Funciones de control simplificadas
  const startRun = async () => {
    console.log('Iniciando carrera...');
    
    if (permissionGranted !== true) {
      const granted = await requestPermissions();
      if (!granted) return;
    }

    const sessionId = `run_${Date.now()}`;
    const startTime = new Date();
    
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

    // Configurar interval para actualizar duración cada segundo
    intervalRef.current = setInterval(() => {
      setRunSession(prev => {
        if (!prev || prev.isPaused) return prev;
        return {
          ...prev,
          duration: formatDuration(prev.startTime)
        };
      });
    }, 1000);

    // Configurar tracking GPS continuo
    if (isCapacitor()) {
      // Para Capacitor (iOS/Android) - usar BackgroundGeolocation para tracking en background
      console.log('Iniciando tracking GPS en Capacitor...');
      try {
        const watcherId = await BackgroundGeolocation.addWatcher(
          {
            backgroundMessage: "Stride Seeker está registrando tu carrera.",
            backgroundTitle: "Tracking de Carrera",
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
              channelName: "Stride Seeker GPS",
              title: "Registrando carrera",
              text: "Tracking activo en segundo plano",
              icon: "ic_launcher",
              color: "#9f7aea"
            }
          },
          (location, error) => {
            if (error) {
              console.error('Error de GPS en background:', error);
              return;
            }

            if (location) {
              // Filtrar por precisión
              if (location.accuracy && location.accuracy > 20) {
                console.log('Lectura descartada por baja precisión:', location.accuracy);
                return;
              }

              console.log('Nueva ubicación (background):', location);
              
              const newPoint: GPSPoint = {
                latitude: location.latitude,
                longitude: location.longitude,
                altitude: location.altitude || undefined,
                accuracy: location.accuracy,
                speed: location.speed || undefined,
                timestamp: new Date()
              };

              setCurrentLocation(newPoint);

              // Actualizar sesión con nuevo punto GPS
              setRunSession(prev => {
                if (!prev || prev.isPaused) return prev;
                
                let newDistance = prev.distance;
                
                if (prev.gpsPoints.length > 0) {
                  const lastPoint = prev.gpsPoints[prev.gpsPoints.length - 1];
                  const segmentDistance = calculateDistance(lastPoint, newPoint);
                  
                  // Solo sumar distancia si el movimiento es significativo y preciso
                  if (segmentDistance > 3 && segmentDistance < 80 && 
                      newPoint.accuracy && newPoint.accuracy <= 15) {
                    newDistance += segmentDistance;
                  }
                }

                return {
                  ...prev,
                  distance: newDistance,
                  gpsPoints: [...prev.gpsPoints, newPoint]
                };
              });
            }
          }
        );

        backgroundWatcherIdRef.current = watcherId;
        console.log('Background GPS watcher iniciado:', watcherId);
      } catch (error) {
        console.error('Error iniciando background GPS:', error);
      }
    } else {
      // Para web - usar watchPosition
      console.log('Iniciando tracking GPS en web...');
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newPoint: GPSPoint = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed || undefined,
            timestamp: new Date()
          };

          setCurrentLocation(newPoint);

          // Actualizar sesión con nuevo punto GPS
          setRunSession(prev => {
            if (!prev || prev.isPaused) return prev;
            
            let newDistance = prev.distance;
            
            if (prev.gpsPoints.length > 0) {
              const lastPoint = prev.gpsPoints[prev.gpsPoints.length - 1];
              const segmentDistance = calculateDistance(lastPoint, newPoint);
              
              // Solo sumar distancia si el movimiento es significativo y preciso
              if (segmentDistance > 3 && segmentDistance < 80 && 
                  newPoint.accuracy && newPoint.accuracy <= 20) {
                newDistance += segmentDistance;
              }
            }

            return {
              ...prev,
              distance: newDistance,
              gpsPoints: [...prev.gpsPoints, newPoint]
            };
          });
        },
        (error) => {
          console.error('Error en watchPosition:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 5000
        }
      );
    }

    toast({
      title: "Carrera iniciada",
      description: "¡Comienza tu entrenamiento!",
    });
  };

  const pauseRun = () => {
    setIsPaused(true);
    setRunSession(prev => prev ? { ...prev, isPaused: true } : null);
    
    toast({
      title: "Carrera pausada",
      description: "Presiona reanudar para continuar",
    });
  };

  const resumeRun = () => {
    setIsPaused(false);
    setRunSession(prev => prev ? { ...prev, isPaused: false } : null);
    
    toast({
      title: "Carrera reanudada",
      description: "Continúa tu entrenamiento",
    });
  };

  const finishRun = () => {
    console.log('Finalizando carrera...');
    
    // Limpiar interval de duración
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Limpiar tracking GPS
    if (isCapacitor() && backgroundWatcherIdRef.current) {
      // Limpiar background GPS watcher en Capacitor
      try {
        BackgroundGeolocation.removeWatcher({ id: backgroundWatcherIdRef.current });
        backgroundWatcherIdRef.current = null;
        console.log('Background GPS watcher removido');
      } catch (error) {
        console.error('Error removiendo background watcher:', error);
      }
    } else if (watchIdRef.current !== null) {
      // Limpiar web GPS watcher
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      console.log('Web GPS watcher removido');
    }
    
    if (runSession) {
      const endTime = new Date();
      const finalDuration = formatDuration(runSession.startTime, endTime);

      toast({
        title: "¡Carrera completada!",
        description: `Distancia: ${(runSession.distance / 1000).toFixed(2)} km - Duración: ${finalDuration}`,
      });
    }

    setIsTracking(false);
    setIsPaused(false);
    setRunSession(null);
  };

  const formatDuration = (startTime: Date, endTime?: Date): string => {
    const now = endTime || new Date();
    const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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
