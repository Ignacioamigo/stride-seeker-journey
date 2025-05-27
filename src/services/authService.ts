
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uprohtkbghujvjwjnqyv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcm9odGtiZ2h1anZqd2pucXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA1NzAsImV4cCI6MjA2MzM0NjU3MH0.WQQ0jxNacORbXNZhMg_H5pW1g-VUJ8tiEiv44VBnnX4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});

export const ensureSession = async (): Promise<void> => {
  console.log("[ensureSession] Verificando sesión...");
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.log("[ensureSession] No hay sesión, creando sesión anónima...");
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) {
      console.error("[ensureSession] Error al crear sesión anónima:", error);
      throw error;
    }
    
    console.log("[ensureSession] Sesión anónima creada:", data.user?.id);
  } else {
    console.log("[ensureSession] Sesión existente:", session.user?.id);
  }
  
  // Asegurar que el perfil de usuario existe
  await ensureUserProfile();
};

const ensureUserProfile = async (): Promise<void> => {
  try {
    console.log("[ensureUserProfile] Verificando perfil de usuario...");
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("[ensureUserProfile] No hay usuario autenticado");
      return;
    }
    
    // Verificar si el perfil ya existe
    const { data: existingProfile, error: selectError } = await supabase
      .from('user_profile')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      console.error("[ensureUserProfile] Error al verificar perfil:", selectError);
      return;
    }
    
    if (!existingProfile) {
      console.log("[ensureUserProfile] Creando perfil de usuario...");
      
      // Crear el perfil de usuario
      const { error: insertError } = await supabase
        .from('user_profile')
        .insert({
          id: user.id
        });
      
      if (insertError) {
        console.error("[ensureUserProfile] Error al crear perfil:", insertError);
      } else {
        console.log("[ensureUserProfile] Perfil creado exitosamente");
      }
    } else {
      console.log("[ensureUserProfile] Perfil ya existe");
    }
  } catch (error) {
    console.error("[ensureUserProfile] Error inesperado:", error);
  }
};
