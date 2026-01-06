import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Calendar, Ruler, Weight, Target, ChevronLeft, RefreshCw, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/layout/Header';
import { useSafeAreaInsets } from '@/hooks/utils/useSafeAreaInsets';
import { supabase, SUPABASE_URL } from '@/integrations/supabase/client';
import { Browser } from '@capacitor/browser';
import StravaConnectButton from '@/components/ui/StravaConnectButton';
import { ConnectGarmin } from '@/components/garmin/ConnectGarmin';

const HEADER_HEIGHT = 44;

const Settings: React.FC = () => {
  const { user, resetUser } = useUser();
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();

  // Strava integration state
  const [isStravaLinked, setIsStravaLinked] = useState(false);
  const [checkingStrava, setCheckingStrava] = useState(true);
  const [importingStrava, setImportingStrava] = useState(false);

  const checkStravaLink = useCallback(async () => {
    try {
      setCheckingStrava(true);
      
      // Get authenticated user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        setIsStravaLinked(false);
        return;
      }

      const { data, error } = await supabase
        .from('strava_connections')
        .select('user_auth_id')
        .eq('user_auth_id', authUser.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking Strava connection:', error);
        setIsStravaLinked(false);
        return;
      }
      
      setIsStravaLinked(!!data);
    } catch (error) {
      console.error('Error in checkStravaLink:', error);
      setIsStravaLinked(false);
    } finally {
      setCheckingStrava(false);
    }
  }, []);

  useEffect(() => {
    checkStravaLink();
  }, [checkStravaLink]);

  const connectStrava = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        toast({
          title: "Error",
          description: "Debes estar autenticado para conectar con Strava",
          variant: "destructive"
        });
        return;
      }

      console.log('🔗 Connecting to Strava for user:', authUser.id);

      // Build Strava OAuth URL with proper parameters
      const stravaClientId = "186314"; // New Client ID from screenshot
      const redirectUri = `${SUPABASE_URL}/functions/v1/strava-auth`;
      const scope = "read,activity:read,activity:read_all";
      
      console.log('Strava auth parameters:', {
        stravaClientId,
        redirectUri,
        scope,
        userAuthId: authUser.id
      });
      
      // Use user_auth_id as state parameter
      const stravaConnectUrl = `https://www.strava.com/oauth/authorize?client_id=${stravaClientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=${scope}&state=${authUser.id}`;
      
      console.log('Strava Connect URL:', stravaConnectUrl);
      
      try {
        // Try to use Capacitor Browser plugin first
        await Browser.open({ url: stravaConnectUrl });
      } catch (browserError) {
        console.log('Browser plugin not available, using fallback:', browserError);
        // Fallback to regular window.open
        window.open(stravaConnectUrl, '_blank');
      }

      // Check connection status after a delay
      setTimeout(() => {
        checkStravaLink();
      }, 3000);
    } catch (error) {
      console.error('Error connecting to Strava:', error);
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      toast({
        title: "Error",
        description: `Error al conectar con Strava: ${errorMessage}`,
        variant: "destructive"
      });
    }
  }, [checkStravaLink]);

  const disconnectStrava = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { error } = await supabase
        .from('strava_connections')
        .delete()
        .eq('user_auth_id', authUser.id);

      if (error) {
        console.error('Error disconnecting Strava:', error);
        toast({
          title: "Error",
          description: "No se pudo desconectar Strava",
          variant: "destructive"
        });
        return;
      }

      setIsStravaLinked(false);
      toast({
        title: "Desconectado",
        description: "Tu cuenta de Strava ha sido desconectada",
      });
    } catch (error) {
      console.error('Error disconnecting Strava:', error);
    }
  }, []);

  const importFromStrava = useCallback(async () => {
    try {
      setImportingStrava(true);
      
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        toast({
          title: "Error",
          description: "Debes estar autenticado",
          variant: "destructive"
        });
        return;
      }

      console.log('🚀 Iniciando importación de Strava para usuario:', authUser.id);

      toast({
        title: "Sincronización automática",
        description: "Las actividades de Strava se sincronizarán automáticamente cuando corras",
      });
      
      // Refresh the connection status
      setTimeout(() => {
        checkStravaLink();
      }, 1000);
    } catch (error) {
      console.error('💥 Error inesperado importando actividades:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado';
      toast({
        title: "Error Inesperado",
        description: `Error al importar: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setImportingStrava(false);
    }
  }, [checkStravaLink]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header - let it handle its own fixed positioning */}
      <Header title="Integraciones" />
      
      {/* Content area with proper spacing */}
      <div 
        style={{ 
          paddingTop: insets.top + HEADER_HEIGHT + 16,
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
        }}
        className="pb-20"
      >
        <div className="container max-w-md mx-auto p-4">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile')}
            className="mb-4 text-runapp-navy"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Volver al perfil
          </Button>

          {/* Integraciones */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-runapp-navy">
                <LinkIcon className="w-5 h-5 mr-2" />
                Integraciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                {!isStravaLinked ? (
                  <div className="flex flex-col items-center py-4">
                    <p className="text-sm text-runapp-gray mb-4 text-center">
                      Conecta tu cuenta de Strava para sincronizar tus actividades automáticamente
                    </p>
                    <StravaConnectButton 
                      onClick={connectStrava} 
                      disabled={checkingStrava}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center">
                      <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                      <div>
                        <p className="font-medium text-runapp-navy">Strava conectado</p>
                        <p className="text-sm text-runapp-gray">Sincronización automática activa</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {isStravaLinked && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-runapp-navy text-sm">Sincronización automática</p>
                        <p className="text-xs text-runapp-gray">Tus carreras se sincronizarán automáticamente</p>
                      </div>
                      <Button 
                        onClick={disconnectStrava} 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Desconectar
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Garmin Integration */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <ConnectGarmin />
                </div>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
};

export default Settings;
