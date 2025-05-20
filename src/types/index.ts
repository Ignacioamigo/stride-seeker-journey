
export interface UserProfile {
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
  completedOnboarding: boolean;
}

export interface FormQuestion {
  id: string;
  component: React.ComponentType<any>;
  initialValue: any;
}

export interface Workout {
  id: string;
  day: string;
  title: string;
  description: string;
  distance: number | null;
  duration: string | null;
  type: 'carrera' | 'descanso' | 'fuerza' | 'flexibilidad' | 'otro';
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  duration: string;
  intensity: string;
  workouts: Workout[];
  createdAt?: Date;
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

export interface TrainingPlanRequest {
  userProfile: UserProfile;
  customPrompt?: string;
}
