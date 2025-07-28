import React from 'react';
import { Workout } from '@/types';

interface WorkoutFeedbackData {
  workout: Workout;
  actualDistance?: number;
  actualDuration?: string;
  previousBestDistance?: number;
  previousBestTime?: string;
}

export const generateWorkoutFeedback = (data: WorkoutFeedbackData): {
  title: string;
  description: string;
  achievements: string[];
  improvements: string[];
  nextWorkoutTip: string;
} => {
  const { workout, actualDistance, actualDuration, previousBestDistance, previousBestTime } = data;
  
  let title = "🎉 ¡Entrenamiento completado!";
  let description = `¡Excelente trabajo completando ${workout.title}!`;
  const achievements: string[] = [];
  const improvements: string[] = [];
  let nextWorkoutTip = "¡Sigue con este gran momentum!";

  // Analyze distance performance
  if (actualDistance && workout.distance) {
    const distanceRatio = actualDistance / workout.distance;
    
    if (distanceRatio >= 1.1) {
      title = "🚀 ¡Superaste tu objetivo!";
      achievements.push(`Corriste ${actualDistance}km (${((distanceRatio - 1) * 100).toFixed(0)}% más de lo planeado)`);
      improvements.push("Tu resistencia está mejorando notablemente");
    } else if (distanceRatio >= 1.0) {
      achievements.push("Cumpliste exactamente tu objetivo de distancia");
      improvements.push("Tu disciplina para seguir el plan es excelente");
    } else if (distanceRatio >= 0.8) {
      achievements.push("Te mantuviste cerca de tu objetivo");
      nextWorkoutTip = "La próxima vez intenta mantener un ritmo constante para completar la distancia planeada";
    }
  }

  // Analyze duration if available
  if (actualDuration && workout.duration) {
    const actualMinutes = parseTimeToMinutes(actualDuration);
    const plannedMinutes = parseTimeToMinutes(workout.duration);
    
    if (actualMinutes <= plannedMinutes * 0.9) {
      achievements.push("¡Terminaste más rápido de lo esperado!");
      improvements.push("Tu velocidad está mejorando");
    } else if (actualMinutes <= plannedMinutes * 1.1) {
      achievements.push("Te mantuviste en el tiempo planeado");
    }
  }

  // Compare with previous performance
  if (previousBestDistance && actualDistance && actualDistance > previousBestDistance) {
    title = "🏆 ¡Nuevo récord personal!";
    achievements.push(`¡Nuevo récord! Superaste tu mejor marca por ${(actualDistance - previousBestDistance).toFixed(1)}km`);
    improvements.push("Has alcanzado un nuevo nivel de rendimiento");
  }

  // Workout type specific feedback
  switch (workout.type) {
    case 'carrera':
      if (achievements.length === 0) {
        achievements.push("Mantuviste un buen ritmo de carrera");
      }
      nextWorkoutTip = "Recuerda hidratarte bien y hacer estiramientos";
      break;
    case 'fuerza':
      achievements.push("Fortaleciste tu cuerpo para mejorar tu running");
      nextWorkoutTip = "El entrenamiento de fuerza te ayudará a prevenir lesiones";
      break;
    case 'flexibilidad':
      achievements.push("Mejoraste tu flexibilidad y movilidad");
      nextWorkoutTip = "La flexibilidad es clave para un running eficiente";
      break;
  }

  // Motivational enhancements based on workout completion
  const motivationalMessages = [
    "Cada kilómetro cuenta para tu progreso",
    "Tu constancia es tu mejor fortaleza",
    "Estás construyendo una versión más fuerte de ti",
    "Tu dedicación marca la diferencia"
  ];

  if (improvements.length === 0) {
    improvements.push(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
  }

  return {
    title,
    description: `${description} ${achievements.length > 0 ? achievements[0] : ''}`,
    achievements,
    improvements,
    nextWorkoutTip
  };
};

const parseTimeToMinutes = (timeString: string): number => {
  const [minutes, seconds] = timeString.split(':').map(Number);
  return minutes + (seconds || 0) / 60;
};

export default generateWorkoutFeedback; 