
export interface GPSPoint {
  id?: string;
  entrenamiento_id: string;
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  speed?: number | null;
  heading?: number | null;
  timestamp: string;
  created_at?: string;
}

export interface TrackingSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  distance: number; // en metros
  duration: string; // formato HH:MM:SS
  isActive: boolean;
  gpsPoints: GPSPoint[];
  averagePace?: string;
  maxSpeed?: number;
}

export interface LocationPermissions {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

export interface TrackingConfig {
  enableHighAccuracy: boolean;
  maximumAge: number;
  timeout: number;
  distanceFilter: number; // metros mínimos para registrar punto
  updateInterval: number; // ms entre actualizaciones
}
