
import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserProfile } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { resetSession } from '@/services/authService';
import { removeSavedPlan } from '@/services/planService';
import { clearAllUserStats } from '@/services/simpleWorkoutService';

interface UserContextProps {
  user: UserProfile;
  updateUser: (data: Partial<UserProfile>) => void;
  resetUser: () => void;
}

const defaultUser: UserProfile = {
  name: '',
  age: null,
  gender: null,
  height: null,
  weight: null,
  maxDistance: null,
  pace: null,
  goal: '',
  weeklyWorkouts: null,
  selectedDays: [],
  experienceLevel: null,
  injuries: '',
  targetRace: null,
  completedOnboarding: false,
};

const UserContext = createContext<UserContextProps>({
  user: defaultUser,
  updateUser: () => {},
  resetUser: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const savedUser = localStorage.getItem('runAdaptiveUser');
    return savedUser ? JSON.parse(savedUser) : defaultUser;
  });

  useEffect(() => {
    localStorage.setItem('runAdaptiveUser', JSON.stringify(user));
  }, [user]);

  const updateUser = (data: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  const resetUser = async () => {
    try {
      const currentUserId = user.id;
      
      if (currentUserId) {
        console.log('Eliminando entrenamientos del usuario:', currentUserId);
        
        try {
          // Eliminar de la tabla entrenamientos_completados
          const { error: completedError } = await supabase
            .from('entrenamientos_completados')
            .delete()
            .eq('user_id', currentUserId);

          if (completedError) {
            console.error('Error eliminando entrenamientos completados:', completedError);
          }

          // Obtener los IDs de los planes del usuario
          const { data: userPlans, error: plansError } = await supabase
            .from('training_plans')
            .select('id')
            .eq('user_id', currentUserId);

          if (plansError) {
            console.error('Error obteniendo planes del usuario:', plansError);
          } else if (userPlans && userPlans.length > 0) {
            const planIds = userPlans.map(plan => plan.id);
            
            // Eliminar sesiones de entrenamiento del usuario actual
            const { error: sessionsError } = await supabase
              .from('training_sessions')
              .delete()
              .in('plan_id', planIds);

            if (sessionsError) {
              console.error('Error eliminando sesiones de entrenamiento:', sessionsError);
            }

            console.log('Entrenamientos del usuario eliminados correctamente');
          } else {
            console.log('No se encontraron planes para el usuario');
          }
        } catch (dbError) {
          console.error('Error en operaciones de base de datos:', dbError);
          // Continuar con el reset local aunque falle la base de datos
        }
      }

      try {
        // Usar la nueva función resetSession para crear una nueva sesión
        const newUserId = await resetSession();
        console.log('Nueva sesión creada con user_id:', newUserId);
      } catch (sessionError) {
        console.error('Error al resetear sesión:', sessionError);
        // Continuar con el reset local aunque falle la sesión
      }
      
    } catch (error) {
      console.error('Error general al resetear usuario:', error);
    } finally {
      // Asegurar que siempre se resetee el estado local
      console.log('Reseteando estado local del usuario...');
      setUser(defaultUser);
      localStorage.removeItem('runAdaptiveUser');
      
      // 🧹🔥 LIMPIEZA TOTAL ROBUSTA PARA RESET DE USUARIO
      console.log('🧹🔥 Iniciando limpieza total durante reset de usuario...');
      
      try {
        // 1. Limpiar planes
        removeSavedPlan();
        console.log('✅ Planes eliminados durante reset');
        
        // 2. LIMPIEZA TOTAL DE ESTADÍSTICAS (Supabase + localStorage)
        await clearAllUserStats();
        console.log('✅ Estadísticas completamente limpiadas durante reset');
        
      } catch (cleanupError) {
        console.error('🔥 Error durante limpieza en reset:', cleanupError);
        // Continuar con el fallback manual si falla
        localStorage.removeItem('completedWorkouts');
        localStorage.removeItem('simpleWorkouts');
        localStorage.removeItem('savedPlan');
      }
      
      // Disparar evento personalizado para notificar que se resetean las estadísticas
      window.dispatchEvent(new CustomEvent('resetStats'));
    }
  };

  return (
    <UserContext.Provider value={{ user, updateUser, resetUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
