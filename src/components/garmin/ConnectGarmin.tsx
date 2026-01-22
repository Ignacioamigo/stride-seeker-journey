import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import GarminConnectButton from '../ui/GarminConnectButton';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUPABASE_URL = 'https://uprohtkbghujvjwjnqyv.supabase.co';

export const ConnectGarmin: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
        title: "Te has conectado correctamente a Garmin",
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

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#007CC3]"></div>
        <span className="text-sm text-runapp-gray">Cargando estado de Garmin...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center py-4">
        <p className="text-sm text-runapp-gray mb-4 text-center">
          Conecta tu cuenta de Garmin para sincronizar tus actividades automáticamente
        </p>
        <GarminConnectButton onClick={connectGarmin} />
      </div>
    );
  }

  // Connected state - same style as Strava
  return (
    <>
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
          <div>
            <p className="font-medium text-runapp-navy">Garmin conectado</p>
            <p className="text-sm text-runapp-gray">Sincronización automática activa</p>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-runapp-navy text-sm">Sincronización automática</p>
            <p className="text-xs text-runapp-gray">Tus carreras se sincronizarán automáticamente</p>
          </div>
          <Button 
            onClick={disconnectGarmin} 
            variant="outline" 
            size="sm"
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Desconectar
          </Button>
        </div>
      </div>
    </>
  );
};
