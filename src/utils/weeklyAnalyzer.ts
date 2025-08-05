import { getCompletedWorkouts } from '@/services/completedWorkoutService';
import { WorkoutPlan } from '@/types';

export interface WeeklyInsights {
  performance: 'excellent' | 'good' | 'needs_improvement';
  personalizedMessage: string;
  dataHighlights: {
    totalDistance: number;
    averagePace: string;
    completedWorkouts: number;
    goalWorkouts: number;
    improvementVsPrevious: {
      distance: number; // percentage
      pace: number; // seconds faster/slower
    };
  };
  patterns: {
    favoriteDay: string;
    bestTimeOfDay: string;
    consistencyScore: number; // 0-100
  };
  recommendations: string[];
  motivationalQuote: string;
  nextWeekFocus: string;
}

const MOTIVATIONAL_QUOTES = [
  "Tu único límite eres tú mismo. ¡Sigue corriendo hacia tus sueños! 🏃‍♀️",
  "Cada kilómetro te acerca más a la mejor versión de ti mismo. 💪",
  "La constancia vence al talento cuando el talento no es constante. 🎯",
  "No se trata de ser el más rápido, sino de nunca rendirse. 🔥",
  "Hoy es más fuerte que ayer, mañana será más fuerte que hoy. ⭐"
];

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const generateWeeklyInsights = async (
  userName: string,
  weeklyGoal: number,
  currentWeekStats: any,
  currentPlan: WorkoutPlan
): Promise<WeeklyInsights> => {
  try {
    console.log('🧠 Generando insights semanales para', userName);
    
    // Obtener todos los entrenamientos para análisis histórico
    const allWorkouts = await getCompletedWorkouts();
    
    // Calcular fechas de la semana actual del plan
    const planWorkouts = currentPlan.workouts.filter(w => w.date); // Solo workouts con fecha
    const planDates = planWorkouts.map(w => new Date(w.date!));
    const planStartDate = new Date(Math.min(...planDates.map(d => d.getTime())));
    const planEndDate = new Date(Math.max(...planDates.map(d => d.getTime())));
    
    console.log('📅 Fechas del plan actual:', {
      weekNumber: currentPlan.weekNumber,
      startDate: planStartDate.toISOString().split('T')[0],
      endDate: planEndDate.toISOString().split('T')[0]
    });
    
    // Filtrar entrenamientos SOLO de la semana actual del plan
    const thisWeekWorkouts = allWorkouts.filter(w => {
      const workoutDate = new Date(w.fecha_completado);
      // Normalizar fechas para comparación (solo día, sin hora)
      const normalizedWorkoutDate = new Date(workoutDate.getFullYear(), workoutDate.getMonth(), workoutDate.getDate());
      const normalizedStartDate = new Date(planStartDate.getFullYear(), planStartDate.getMonth(), planStartDate.getDate());
      const normalizedEndDate = new Date(planEndDate.getFullYear(), planEndDate.getMonth(), planEndDate.getDate());
      
      return normalizedWorkoutDate >= normalizedStartDate && normalizedWorkoutDate <= normalizedEndDate;
    });
    
    // Para semana anterior, buscar entrenamientos de la semana de plan anterior (si existe)
    const lastWeekWorkouts = allWorkouts.filter(w => {
      if (currentPlan.weekNumber <= 1) return false; // No hay semana anterior si es la primera
      
      const workoutDate = new Date(w.fecha_completado);
      const oneWeekBefore = new Date(planStartDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksBefore = new Date(planStartDate.getTime() - 14 * 24 * 60 * 60 * 1000);
      
      return workoutDate >= twoWeeksBefore && workoutDate < oneWeekBefore;
    });
    
    console.log(`📊 Entrenamientos filtrados para semana ${currentPlan.weekNumber}:`, {
      thisWeek: thisWeekWorkouts.length,
      lastWeek: lastWeekWorkouts.length,
      thisWeekWorkouts: thisWeekWorkouts.map(w => ({
        fecha: w.fecha_completado,
        distancia: w.distancia_recorrida
      }))
    });

    // Calcular métricas clave
    const completedWorkouts = thisWeekWorkouts.length;
    const totalDistance = thisWeekWorkouts.reduce((sum, w) => sum + (w.distancia_recorrida || 0), 0);
    const lastWeekDistance = lastWeekWorkouts.reduce((sum, w) => sum + (w.distancia_recorrida || 0), 0);
    
    // Calcular rendimiento
    const completionRate = completedWorkouts / weeklyGoal;
    let performance: 'excellent' | 'good' | 'needs_improvement';
    
    if (completionRate >= 1.0) performance = 'excellent';
    else if (completionRate >= 0.7) performance = 'good';
    else performance = 'needs_improvement';

    // Analizar patrones
    const dayFrequency = new Map<number, number>();
    thisWeekWorkouts.forEach(w => {
      const day = new Date(w.fecha_completado).getDay();
      dayFrequency.set(day, (dayFrequency.get(day) || 0) + 1);
    });
    
    const favoriteDay = Array.from(dayFrequency.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    
    // Generar mensaje personalizado
    const personalizedMessage = generatePersonalizedMessage(
      userName, 
      performance, 
      completedWorkouts, 
      weeklyGoal,
      totalDistance,
      lastWeekDistance
    );

    // Generar recomendaciones
    const recommendations = generateRecommendations(
      performance, 
      completedWorkouts, 
      weeklyGoal, 
      totalDistance
    );

    // Calcular mejora
    const distanceImprovement = lastWeekDistance > 0 
      ? ((totalDistance - lastWeekDistance) / lastWeekDistance) * 100 
      : 0;

    return {
      performance,
      personalizedMessage,
      dataHighlights: {
        totalDistance: Math.round(totalDistance * 10) / 10,
        averagePace: currentWeekStats.averagePace || "0:00 min/km",
        completedWorkouts,
        goalWorkouts: weeklyGoal,
        improvementVsPrevious: {
          distance: Math.round(distanceImprovement),
          pace: 0 // TODO: calcular mejora de pace
        }
      },
      patterns: {
        favoriteDay: favoriteDay !== undefined ? DAY_NAMES[favoriteDay] : 'Lun',
        bestTimeOfDay: 'Tarde', // TODO: implementar análisis de horarios
        consistencyScore: Math.round(completionRate * 100)
      },
      recommendations,
      motivationalQuote: MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)],
      nextWeekFocus: generateNextWeekFocus(performance, totalDistance)
    };
    
  } catch (error) {
    console.error('Error generando insights:', error);
    // Fallback con datos básicos
    return generateFallbackInsights(userName, weeklyGoal);
  }
};

const generatePersonalizedMessage = (
  name: string,
  performance: string,
  completed: number,
  goal: number,
  distance: number,
  lastWeekDistance: number
): string => {
  const messages = {
    excellent: [
      `¡Increíble semana, ${name}! 🏆 Completaste ${completed}/${goal} entrenamientos. Tu dedicación es ejemplar y se nota en cada kilómetro recorrido.`,
      `¡Wow, ${name}! 🌟 Esta semana demostraste lo que significa ser constante. ${completed} entrenamientos completados como un verdadero atleta.`,
      `¡Chapeau, ${name}! 🎩 Tu semana ha sido perfecta: ${completed}/${goal} entrenamientos. Esto es lo que diferencia a los corredores excepcionales.`
    ],
    good: [
      `¡Buen trabajo, ${name}! 👏 ${completed} entrenamientos completados. Vas por muy buen camino, solo necesitas ese último empujón.`,
      `¡Sólido, ${name}! 💪 Con ${completed} entrenamientos has demostrado compromiso. Sigamos construyendo sobre esta base.`,
      `¡Bien hecho, ${name}! ✨ ${completed} salidas esta semana muestran tu determinación. El progreso está ahí.`
    ],
    needs_improvement: [
      `Hey ${name}, 💙 sé que esta semana fue desafiante con solo ${completed} entrenamientos. Pero recuerda: cada paso cuenta.`,
      `${name}, 🤗 todos tenemos semanas complicadas. Con ${completed} entrenamientos, ya pusiste el pie en el acelerador. ¡La próxima será mejor!`,
      `No te preocupes, ${name}. 🌱 ${completed} entrenamientos es un comienzo. Los grandes corredores también empezaron paso a paso.`
    ]
  };

  const selectedMessages = messages[performance as keyof typeof messages];
  let message = selectedMessages[Math.floor(Math.random() * selectedMessages.length)];

  // Añadir contexto de mejora
  if (distance > lastWeekDistance && lastWeekDistance > 0) {
    const improvement = ((distance - lastWeekDistance) / lastWeekDistance * 100).toFixed(1);
    message += ` Además, mejoraste ${improvement}% en distancia vs la semana pasada. ¡Eso es progreso real!`;
  }

  return message;
};

const generateRecommendations = (
  performance: string,
  completed: number,
  goal: number,
  distance: number
): string[] => {
  const recommendations: string[] = [];

  if (performance === 'excellent') {
    recommendations.push("Considera añadir un entrenamiento de intervalos para mejorar velocidad");
    recommendations.push("Perfecto momento para trabajar en técnica de respiración");
    recommendations.push("Mantén esta consistencia, ¡vas camino al éxito!");
  } else if (performance === 'good') {
    recommendations.push("Intenta planificar tus entrenamientos al inicio de la semana");
    recommendations.push("Considera entrenamientos más cortos si el tiempo es limitado");
    recommendations.push("Un día más por semana te llevará al siguiente nivel");
  } else {
    recommendations.push("Empieza con entrenamientos cortos de 20-30 minutos");
    recommendations.push("Encuentra un horario fijo que funcione para ti");
    recommendations.push("Recuerda: la constancia es más importante que la intensidad");
  }

  if (distance < 10) {
    recommendations.push("Aumenta gradualmente la distancia semana a semana");
  }

  return recommendations;
};

const generateNextWeekFocus = (performance: string, distance: number): string => {
  if (performance === 'excellent') {
    return "Semana de consolidación: mantén el nivel y añade trabajo técnico";
  } else if (performance === 'good') {
    return "Semana de consistencia: busca completar todos los entrenamientos planeados";
  } else {
    return "Semana de construcción: enfócate en crear el hábito con entrenamientos cortos";
  }
};

const generateFallbackInsights = (name: string, goal: number): WeeklyInsights => ({
  performance: 'good',
  personalizedMessage: `¡Hola ${name}! Sigamos trabajando juntos en tus objetivos de running. Cada paso cuenta en tu journey. 💪`,
  dataHighlights: {
    totalDistance: 0,
    averagePace: "0:00 min/km",
    completedWorkouts: 0,
    goalWorkouts: goal,
    improvementVsPrevious: { distance: 0, pace: 0 }
  },
  patterns: {
    favoriteDay: 'Lun',
    bestTimeOfDay: 'Tarde',
    consistencyScore: 0
  },
  recommendations: [
    "Comienza con entrenamientos cortos y regulares",
    "Establece un horario fijo para tus runs",
    "La constancia es clave para el progreso"
  ],
  motivationalQuote: MOTIVATIONAL_QUOTES[0],
  nextWeekFocus: "Semana de inicio: crear el hábito de entrenar regularmente"
}); 