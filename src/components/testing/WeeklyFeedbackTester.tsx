import React from 'react';
import { useWeeklyFeedback } from '@/context/WeeklyFeedbackContext';
import { WorkoutPlan } from '@/types';

const WeeklyFeedbackTester: React.FC = () => {
  const { showWeeklyFeedback } = useWeeklyFeedback();

  const testFeedback = async () => {
    try {
      console.log('🧪 Testing Weekly Feedback System...');
      
      // Crear un plan mock para testing
      const mockPlan: WorkoutPlan = {
        id: 'test-plan',
        name: 'Plan de Prueba',
        description: 'Plan mock para testing',
        duration: '7 días',
        intensity: 'Moderada',
        weekNumber: 2, // Simular que estamos en semana 2
        workouts: [
          {
            id: '1',
            day: 'Lunes',
            date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Hace 6 días
            title: 'Entrenamiento Test 1',
            description: 'Test',
            distance: 5,
            duration: '30 min',
            type: 'carrera',
            completed: true
          },
          {
            id: '2',
            day: 'Miércoles',
            date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Hace 4 días
            title: 'Entrenamiento Test 2',
            description: 'Test',
            distance: 3,
            duration: '20 min',
            type: 'carrera',
            completed: true
          },
          {
            id: '3',
            day: 'Viernes',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Hace 2 días
            title: 'Entrenamiento Test 3',
            description: 'Test',
            distance: 4,
            duration: '25 min',
            type: 'carrera',
            completed: false
          }
        ]
      };
      
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