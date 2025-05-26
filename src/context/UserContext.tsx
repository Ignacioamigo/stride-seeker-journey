
import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserProfile } from '@/types';
import { supabase } from '@/integrations/supabase/client';

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
  experienceLevel: null,
  injuries: '',
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
        
        // Eliminar entrenamientos realizados del usuario actual usando JOIN
        const { error: entrenamientosError } = await supabase
          .from('entrenamientos_realizados')
          .delete()
          .in('plan_id', 
            supabase
              .from('training_plans')
              .select('id')
              .eq('user_id', currentUserId)
          );

        if (entrenamientosError) {
          console.error('Error eliminando entrenamientos realizados:', entrenamientosError);
        }

        // Eliminar entrenamientos completados del usuario actual usando JOIN
        const { error: completedError } = await supabase
          .from('completed_workouts')
          .delete()
          .in('plan_id', 
            supabase
              .from('training_plans')
              .select('id')
              .eq('user_id', currentUserId)
          );

        if (completedError) {
          console.error('Error eliminando entrenamientos completados:', completedError);
        }

        console.log('Entrenamientos del usuario eliminados correctamente');
      }
    } catch (error) {
      console.error('Error al eliminar entrenamientos del usuario:', error);
    }
    
    // Resetear el usuario local
    setUser(defaultUser);
    localStorage.removeItem('runAdaptiveUser');
    
    // Disparar evento personalizado para notificar que se resetean las estadísticas
    window.dispatchEvent(new CustomEvent('resetStats'));
  };

  return (
    <UserContext.Provider value={{ user, updateUser, resetUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
