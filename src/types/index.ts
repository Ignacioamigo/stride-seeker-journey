
export interface UserProfile {
  id?: string;
  name: string;
  age: number | null;
  gender: 'masculino' | 'femenino' | 'otro' | null;
  height: number | null;
  weight: number | null;
  maxDistance: number | null;
  pace: string | null;
  goal: string;
  // Nuevos campos para objetivos específicos
  targetDistance: number | null; // Distancia objetivo en km
  targetPace: number | null; // Ritmo objetivo en min/km
  targetTimeframe: number | null; // Tiempo objetivo
  targetTimeframeUnit: 'days' | 'months' | null; // Unidad del tiempo objetivo
  weeklyWorkouts: number | null;
  selectedDays?: WeekDay[];
  experienceLevel: 'principiante' | 'intermedio' | 'avanzado' | null;
  injuries: string;
  targetRace?: RaceEvent | null;
  completedOnboarding: boolean;
  email?: string | null; // Email opcional para recibir tips semanales
}

export interface RaceEvent {
  id: string;
  name: string;
  location: string;
  date: string;
  distance: string;
  type: 'carrera_popular' | 'media_maraton' | 'maraton' | 'trail' | 'ultra' | 'trail_running' | 'ultra_trail' | 'cross' | 'nocturna' | 'solidaria' | 'triathlon' | 'montaña' | 'otros';
  registrationUrl?: string;
  description?: string;
  // Additional fields from database
  organizer?: string;
  price?: number;
  maxParticipants?: number;
  imageUrl?: string;
  website?: string;
  province?: string;
  city?: string;
  venue?: string;
  elevationGain?: number;
  difficulty?: 'principiante' | 'intermedio' | 'avanzado' | 'elite';
  includesTshirt?: boolean;
  includesMedal?: boolean;
  wheelchairAccessible?: boolean;
  registrationStatus?: 'upcoming' | 'registration_open' | 'registration_closed' | 'completed' | 'cancelled' | 'postponed';
}

export interface FormQuestion {
  id: string;
  component: React.ComponentType<any>;
  initialValue: any;
}

export interface Workout {
  id: string;
  day: string;
  date?: string;
  title: string;
  description: string;
  distance: number | null;
  duration: string | null;
  type: 'carrera' | 'descanso' | 'fuerza' | 'flexibilidad' | 'otro';
  completed?: boolean;
  actualDistance?: number | null;
  actualDuration?: string | null;
  targetPace?: string | null;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  duration: string;
  intensity: string;
  workouts: Workout[];
  createdAt?: Date;
  weekNumber?: number;
  ragActive?: boolean; // Add this field to track if RAG was used
}

export interface RunStats {
  distance: number;
  time: string;
  pace: string;
  calories: number;
  date: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  completed: boolean;
}

export interface PreviousWeekResults {
  weekNumber: number;
  workouts: {
    day: string;
    title: string;
    completed: boolean;
    plannedDistance?: number | null;
    actualDistance?: number | null;
    plannedDuration?: string | null;
    actualDuration?: string | null;
  }[];
}

export interface WeekDay {
  id: number; // 0 = Lunes, 1 = Martes, ..., 6 = Domingo
  name: string; // "Lunes", "Martes", etc.
  shortName: string; // "L", "M", "M", "J", "V", "S", "D"
  date: string; // Fecha real de esta semana en formato YYYY-MM-DD
  selected: boolean;
}

export interface TrainingPlanRequest {
  userProfile: UserProfile;
  customPrompt?: string;
  previousWeekResults?: PreviousWeekResults;
}

// Nuevos tipos para actividades publicadas
export interface PublishedActivity {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  runSession: RunSession;
  publishedAt: Date;
  isPublic: boolean;
  likes?: number;
  comments?: number;
  userProfile: {
    name: string;
    avatar?: string;
  };
  syncStatus?: 'local' | 'pending' | 'synced';
}

export interface WorkoutPublishData {
  title: string;
  description: string;
  image?: File;
  runSession: RunSession;
  isPublic: boolean;
}

export interface WorkoutMetrics {
  totalDistance: number;
  totalDuration: string;
  averageSpeed: number;
  averagePace: string;
  elevationGain?: number;
  calories?: number;
  splitTimes: SplitTime[];
}

export interface SplitTime {
  kilometer: number;
  time: string;
  pace: string;
  speed: number;
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

export interface GPSPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  timestamp: Date;
}

// Import Capacitor types
import './capacitor';
