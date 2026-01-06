
import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserProfile } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { resetSession, deleteUserAccount } from '@/services/authService';
import { removeSavedPlan } from '@/services/planService';

interface UserContextProps {
  user: UserProfile;
  updateUser: (data: Partial<UserProfile>) => void;
  resetUser: () => void;
  deleteAccount: () => Promise<void>;
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
  // Nuevos campos para objetivos específicos
  targetDistance: null,
  targetPace: null,
  targetTimeframe: null,
  targetTimeframeUnit: null,
  weeklyWorkouts: null,
  selectedDays: [],
  experienceLevel: null,
  injuries: '',
  targetRace: null,
  completedOnboarding: false,
  email: null,
};

const UserContext = createContext<UserContextProps>({
  user: defaultUser,
  updateUser: () => {},
  resetUser: () => {},
  deleteAccount: async () => {},
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
      
      // 🧹 LIMPIAR TODOS LOS DATOS DE ENTRENAMIENTOS EN LOCALSTORAGE
      localStorage.removeItem('completedWorkouts');
      localStorage.removeItem('simpleWorkouts');
      
      // Limpiar planes guardados para asegurar un inicio limpio
      removeSavedPlan();
      
      // Disparar evento personalizado para notificar que se resetean las estadísticas
      window.dispatchEvent(new CustomEvent('resetStats'));
    }
  };

  const deleteAccount = async () => {
    try {
      // Intentar obtener el userId de diferentes fuentes
      let currentUserId = user.id;
      
      console.log('[UserContext] user.id:', currentUserId);
      
      // Si no hay user.id, intentar obtenerlo de Supabase Auth
      if (!currentUserId) {
        console.log('[UserContext] No hay user.id, obteniendo de Supabase Auth...');
        const { data: { session } } = await supabase.auth.getSession();
        currentUserId = session?.user?.id;
        console.log('[UserContext] Session user.id:', currentUserId);
      }
      
      // Si aún no hay userId, intentar obtenerlo de localStorage
      if (!currentUserId) {
        console.log('[UserContext] Intentando obtener de localStorage...');
        const savedUser = localStorage.getItem('runAdaptiveUser');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          currentUserId = parsedUser.id;
          console.log('[UserContext] localStorage user.id:', currentUserId);
        }
      }
      
      if (!currentUserId) {
        console.error('[UserContext] No se pudo encontrar currentUserId en ninguna fuente');
        throw new Error('No hay usuario para eliminar');
      }
      
      console.log('[UserContext] Eliminando cuenta para userId:', currentUserId);
      
      // Eliminar cuenta y todos los datos
      await deleteUserAccount(currentUserId);
      
      console.log('[UserContext] Datos eliminados, reseteando estado local...');
      
      // Resetear estado local
      setUser(defaultUser);
      
      // Disparar evento de reset
      window.dispatchEvent(new CustomEvent('resetStats'));
      window.dispatchEvent(new CustomEvent('accountDeleted'));
      
      console.log('[UserContext] Cuenta eliminada exitosamente');
    } catch (error) {
      console.error('[UserContext] Error en deleteAccount:', error);
      throw error; // Re-lanzar el error para que lo capture el componente
    }
  };

  return (
    <UserContext.Provider value={{ user, updateUser, resetUser, deleteAccount }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
