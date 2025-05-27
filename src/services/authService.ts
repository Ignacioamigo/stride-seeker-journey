
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

export const resetSession = async (): Promise<string> => {
  console.log("[resetSession] Iniciando reset completo de sesión...");
  
  // 1. Cerrar completamente la sesión actual
  await supabase.auth.signOut();
  console.log("[resetSession] Sesión cerrada");
  
  // 2. Crear nueva sesión anónima
  const { data, error } = await supabase.auth.signInAnonymously();
  
  if (error) {
    console.error("[resetSession] Error al crear nueva sesión anónima:", error);
    throw error;
  }
  
  const newUserId = data.user?.id;
  if (!newUserId) {
    throw new Error("No se pudo obtener el ID del nuevo usuario");
  }
  
  console.log("[resetSession] Nueva sesión anónima creada:", newUserId);
  
  // 3. Crear nueva fila en user_profile
  const { error: profileError } = await supabase
    .from('user_profile')
    .insert({ id: newUserId });
  
  if (profileError) {
    console.error("[resetSession] Error al crear perfil:", profileError);
    throw profileError;
  }
  
  console.log("[resetSession] Nuevo perfil creado para usuario:", newUserId);
  
  return newUserId;
};

export const ensureSession = async (): Promise<void> => {
  console.log("[ensureSession] Verificando sesión...");
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Solo actuar si no hay sesión válida
  if (!session) {
    console.log("[ensureSession] No hay sesión, creando sesión anónima...");
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) {
      console.error("[ensureSession] Error al crear sesión anónima:", error);
      throw error;
    }
    
    console.log("[ensureSession] Sesión anónima creada:", data.user?.id);
    console.log("[ensureSession] El trigger creará automáticamente el perfil de usuario");
  } else {
    console.log("[ensureSession] Sesión existente:", session.user?.id);
  }
};
