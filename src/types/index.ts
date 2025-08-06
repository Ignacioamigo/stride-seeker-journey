
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
  weeklyWorkouts: number | null;
  experienceLevel: 'principiante' | 'intermedio' | 'avanzado' | null;
  injuries: string;
  targetRace?: RaceEvent | null;
  completedOnboarding: boolean;
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

export interface TrainingPlanRequest {
  userProfile: UserProfile;
  customPrompt?: string;
  previousWeekResults?: PreviousWeekResults;
}
