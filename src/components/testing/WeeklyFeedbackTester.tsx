import React from 'react';
import { useWeeklyFeedback } from '@/context/WeeklyFeedbackContext';
import { WorkoutPlan } from '@/types';

const WeeklyFeedbackTester: React.FC = () => {
  const { showWeeklyFeedback } = useWeeklyFeedback();

  const testFeedback = async () => {
    try {
      console.log('🧪 Testing Weekly Feedback System...');
      
      // Obtener el plan actual desde localStorage para testing real
      const savedPlan = localStorage.getItem('savedPlan');
      let mockPlan: WorkoutPlan;
      
      if (savedPlan) {
        mockPlan = JSON.parse(savedPlan);
        console.log('🧪 Usando plan real para testing:', mockPlan.id);
      } else {
        // Fallback: crear un plan mock si no hay plan guardado
        mockPlan = {
          id: 'test-plan-' + Date.now(),
          name: 'Plan de Prueba',
          description: 'Plan mock para testing',
          duration: '7 días',
          intensity: 'Moderada',
          weekNumber: 2,
          workouts: [
            {
              id: 'test-workout-1',
              day: 'Lunes',
              date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              title: 'Entrenamiento Test 1',
              description: 'Test',
              distance: 5,
              duration: '30 min',
              type: 'carrera',
              completed: true,
              actualDistance: 5.2,
              actualDuration: '32:15'
            },
            {
              id: 'test-workout-2',
              day: 'Miércoles',
              date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              title: 'Entrenamiento Test 2',
              description: 'Test',
              distance: 3,
              duration: '20 min',
              type: 'carrera',
              completed: true,
              actualDistance: 3.1,
              actualDuration: '21:30'
            },
            {
              id: 'test-workout-3',
              day: 'Viernes',
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              title: 'Entrenamiento Test 3',
              description: 'Test',
              distance: 4,
              duration: '25 min',
              type: 'carrera',
              completed: false
            }
          ]
        };
        console.log('🧪 Usando plan mock para testing:', mockPlan.id);
      }
      
      // Llamar directamente al sistema de feedback con el plan mock
      await showWeeklyFeedback(mockPlan, () => {
        console.log('✅ Modal de feedback cerrado desde el test');
        alert('¡Feedback test completado! El modal se ha cerrado.');
      });
      
    } catch (error) {
      console.error('❌ Error en test:', error);
      alert('Error en el test. Revisa la consola.');
    }
  };

  // Solo mostrar en modo desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        onClick={testFeedback}
        className="bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-red-600"
        style={{ fontSize: '10px' }}
      >
        🧪 TEST FEEDBACK
      </button>
    </div>
  );
};

export default WeeklyFeedbackTester; 