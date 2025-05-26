
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
      // Eliminar todos los entrenamientos realizados de la base de datos
      const { error: entrenamientosError } = await supabase
        .from('entrenamientos_realizados')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos los registros

      if (entrenamientosError) {
        console.error('Error eliminando entrenamientos realizados:', entrenamientosError);
      }

      // Eliminar todos los entrenamientos completados de la base de datos
      const { error: completedError } = await supabase
        .from('completed_workouts')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos los registros

      if (completedError) {
        console.error('Error eliminando entrenamientos completados:', completedError);
      }

      console.log('Entrenamientos eliminados de la base de datos');
    } catch (error) {
      console.error('Error al eliminar entrenamientos:', error);
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
