
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
    // TEMPORAL: Para demo/desarrollo, solo resetear datos locales
    // TODO: Implementar autenticación y eliminar solo datos del usuario actual
    console.warn('Reiniciando onboarding - Solo datos locales (sin autenticación implementada)');
    
    // Resetear solo el usuario local
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
