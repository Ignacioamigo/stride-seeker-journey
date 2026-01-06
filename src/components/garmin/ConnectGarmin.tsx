import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import GarminConnectButton from '../ui/GarminConnectButton';

const SUPABASE_URL = 'https://uprohtkbghujvjwjnqyv.supabase.co';

export const ConnectGarmin: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [garminUserName, setGarminUserName] = useState<string | null>(null);
  const { toast } = useToast();

  const checkGarminConnection = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      console.log('🔍 Checking Garmin connection for user:', user.id);

      const { data, error } = await supabase
        .from('garmin_connections')
        .select('garmin_user_id, athlete_name, access_token, token_expires_at')
        .eq('user_auth_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking Garmin connection:', error);
        setIsConnected(false);
        setIsLoading(false);
        return;
      }

      if (data && data.access_token) {
        console.log('✅ Garmin connected:', data.garmin_user_id);
        setIsConnected(true);
        setGarminUserName(data.athlete_name || `Usuario ${data.garmin_user_id || 'Garmin'}`);
      } else {
        console.log('❌ No Garmin connection found');
        setIsConnected(false);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error in checkGarminConnection:', error);
      setIsConnected(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkGarminConnection();

    // Listen for app resume to check connection (user might have completed auth)
    const setupAppListener = async () => {
      try {
        await App.addListener('appStateChange', ({ isActive }) => {
          if (isActive) {
            console.log('📱 App resumed, checking Garmin connection...');
            setTimeout(() => checkGarminConnection(), 1000);
          }
        });
      } catch (e) {
        // App plugin not available (web)
        console.log('App listener not available');
      }
    };

    setupAppListener();

    // Check URL for garmin success parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('garmin') === 'success') {
      console.log('✅ Garmin auth success detected in URL');
      checkGarminConnection();
      toast({
        title: "¡Conectado!",
        description: "Tu cuenta de Garmin ha sido conectada exitosamente",
      });
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }

    return () => {
      App.removeAllListeners().catch(() => {});
    };
  }, [checkGarminConnection, toast]);

  const connectGarmin = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        toast({
          title: "Error",
          description: "Debes estar autenticado para conectar con Garmin",
          variant: "destructive"
        });
        return;
      }

      console.log('🔗 Connecting to Garmin for user:', authUser.id);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/garmin-auth-start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('❌ Error response data:', errorData);
        } catch {
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch {}
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      const { authUrl } = responseData;
      
      if (!authUrl) {
        throw new Error('No authUrl in response');
      }
      
      console.log('✅ Got auth URL:', authUrl);

      try {
        // Use Capacitor Browser plugin
        await Browser.open({ url: authUrl });
        
        // Listen for browser close to check connection
        Browser.addListener('browserFinished', () => {
          console.log('🔄 Browser closed, checking connection...');
          setTimeout(() => checkGarminConnection(), 2000);
        });
      } catch (browserError) {
        console.log('Browser plugin not available, using fallback:', browserError);
        window.open(authUrl, '_blank');
      }

      toast({
        title: "Conectando...",
        description: "Completa la autorización en Garmin Connect",
      });
    } catch (error) {
      console.error('❌ Error connecting to Garmin:', error);
      
      let errorMessage = 'Error desconocido al conectar con Garmin';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Error",
        description: `Error al conectar con Garmin: ${errorMessage}`,
        variant: "destructive"
      });
    }
  }, [checkGarminConnection, toast]);

  const disconnectGarmin = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      console.log('🔌 Disconnecting from Garmin...');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/garmin-deregister`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disconnect Garmin');
      }

      console.log('✅ Garmin disconnected:', data);

      setIsConnected(false);
      setGarminUserName(null);

      toast({
        title: "Desconectado",
        description: "Tu cuenta de Garmin ha sido desconectada",
      });
    } catch (error) {
      console.error('Error disconnecting from Garmin:', error);
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      toast({
        title: "Error",
        description: `Error al desconectar Garmin: ${errorMessage}`,
        variant: "destructive"
      });
    }
  }, [toast]);

  const syncGarminActivities = useCallback(async () => {
    try {
      setIsSyncing(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      console.log('🔄 Syncing Garmin activities...');

      toast({
        title: "Sincronizando...",
        description: "Obteniendo tus actividades de Garmin",
      });

      const response = await fetch(`${SUPABASE_URL}/functions/v1/garmin-sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync activities');
      }

      console.log('✅ Sync completed:', data);

      toast({
        title: "¡Sincronizado!",
        description: data.message || `${data.activitiesImported} actividades importadas`,
      });

      // Trigger a refresh of activities
      window.dispatchEvent(new CustomEvent('garmin-sync-completed'));

    } catch (error) {
      console.error('Error syncing Garmin activities:', error);
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      toast({
        title: "Error",
        description: `Error al sincronizar: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  }, [toast]);

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#007CC3]"></div>
          <span className="text-gray-600">Cargando estado de Garmin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">Garmin Connect</h3>
          <p className="text-sm text-gray-600 mb-3">
            {isConnected 
              ? `Conectado como ${garminUserName}. Tus actividades se sincronizan automáticamente.`
              : 'Conecta tu cuenta de Garmin para sincronizar tus entrenamientos automáticamente.'
            }
          </p>
          
          {isConnected ? (
            <div className="flex gap-2">
              <button
                onClick={syncGarminActivities}
                disabled={isSyncing}
                className="px-4 py-2 bg-[#007CC3] text-white rounded hover:bg-[#005a8c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="animate-spin-slow"
                    >
                      <path 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                        fill="currentColor"
                      />
                    </svg>
                    Sincronizar actividades
                  </>
                )}
              </button>
              <button
                onClick={disconnectGarmin}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Desconectar
              </button>
            </div>
          ) : (
            <GarminConnectButton onClick={connectGarmin} />
          )}
        </div>
        
        {/* Garmin Logo Badge */}
        <div className="ml-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#007CC3' }}
          >
            <svg 
              width="28" 
              height="28" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M12 2L2 20H22L12 2Z" 
                fill="white"
              />
              <path 
                d="M12 8L8 16H16L12 8Z" 
                fill="#007CC3"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
