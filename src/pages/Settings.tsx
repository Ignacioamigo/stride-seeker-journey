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
      
      // Get the same userId we use for connection
      let userId = localStorage.getItem('stride_user_id');
      
      // FORCE REGENERATE if current ID is not a valid UUID
      if (!userId || !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        console.log('🔄 Generating new UUID for check (old format detected)');
        userId = crypto.randomUUID();
        localStorage.setItem('stride_user_id', userId);
        console.log('✅ New UUID generated for check:', userId);
      }
      
      if (!userId) {
        setIsStravaLinked(false);
        return;
      }

      const { data, error } = await supabase
        .from('strava_connections')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking Strava tokens:', error);
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

      // Generate a UUID-compatible user identifier for this session
      // This is a temporary solution until we implement proper auth
      let userId = localStorage.getItem('stride_user_id');
      
      // FORCE REGENERATE if current ID is not a valid UUID
      if (!userId || !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        console.log('🔄 Generating new UUID (old format detected)');
        // Generate a valid UUID v4
        userId = crypto.randomUUID();
        localStorage.setItem('stride_user_id', userId);
        console.log('✅ New UUID generated:', userId);
      }
      
      console.log('Using user ID for Strava connection:', userId);

      // Build Strava OAuth URL with proper parameters
      const stravaClientId = "172613";
      const redirectUri = `${SUPABASE_URL}/functions/v1/strava-public`;
      const redirectBack = window.location.href; // Current page URL
      const scope = "read,activity:read,activity:read_all";
      
      console.log('Strava auth parameters:', {
        stravaClientId,
        redirectUri,
        redirectBack,
        scope,
        userId
      });
      
      const stravaConnectUrl = `https://www.strava.com/oauth/authorize?client_id=${stravaClientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&redirect_to=${encodeURIComponent(redirectBack)}&approval_prompt=force&scope=${scope}&state=${userId}`;
      
      console.log('Strava Connect URL:', stravaConnectUrl);
      
      try {
        // Try to use Capacitor Browser plugin first
        await Browser.open({ url: stravaConnectUrl });
      } catch (browserError) {
        console.log('Browser plugin not available, using fallback:', browserError);
        // Fallback to regular window.open
        window.open(stravaConnectUrl, '_blank');
      }

      setTimeout(() => {
        checkStravaLink();
      }, 2000);
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

  const importFromStrava = useCallback(async () => {
    try {
      setImportingStrava(true);
      
      let userId = localStorage.getItem('stride_user_id');
      
      // FORCE REGENERATE if current ID is not a valid UUID
      if (!userId || !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        console.log('🔄 Generating new UUID for import (old format detected)');
        userId = crypto.randomUUID();
        localStorage.setItem('stride_user_id', userId);
        console.log('✅ New UUID generated for import:', userId);
      }
      
      if (!userId) {
        toast({
          title: "Error",
          description: "No se encontró ID de usuario",
          variant: "destructive"
        });
        return;
      }

      console.log('🚀 Iniciando importación de Strava para usuario:', userId);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/strava-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ user_id: userId })
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error HTTP:', response.status, errorText);
        
        let errorMessage = 'Error del servidor';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = `Error ${response.status}: ${errorText}`;
        }
        
        toast({
          title: "Error de Importación",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      const result = await response.json();
      console.log('📊 Resultado de importación:', result);
      
      if (result.success) {
        const message = `✅ Importadas ${result.imported_count || result.imported || 0} actividades de Strava`;
        console.log(message);
        
        toast({
          title: "Importación Exitosa",
          description: message,
          variant: "default"
        });
        
        // Refresh the Strava connection status
        setTimeout(() => {
          checkStravaLink();
        }, 1000);
      } else {
        const errorMessage = result.error || 'Error desconocido en la importación';
        console.error('❌ Error en resultado:', errorMessage);
        
        toast({
          title: "Error de Importación",
          description: errorMessage,
          variant: "destructive"
        });
      }
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
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="font-medium text-runapp-navy">Strava</p>
                    <p className="text-sm text-runapp-gray">Conecta tu cuenta para importar actividades.</p>
                  </div>
                  {isStravaLinked ? (
                    <span className="flex items-center text-green-600 text-sm">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Conectado
                    </span>
                  ) : (
                    <Button onClick={connectStrava} disabled={checkingStrava} className="bg-runapp-purple hover:bg-runapp-deep-purple text-white">
                      {checkingStrava ? 'Verificando...' : 'Conectar'}
                    </Button>
                  )}
                </div>
                
                {isStravaLinked && (
                  <div className="flex items-center justify-between py-1 pl-4 border-l-2 border-green-200">
                    <div>
                      <p className="font-medium text-runapp-navy text-sm">Importar actividades</p>
                      <p className="text-xs text-runapp-gray">Importa tus últimas 30 carreras de Strava</p>
                    </div>
                    <Button 
                      onClick={importFromStrava} 
                      disabled={importingStrava} 
                      variant="outline" 
                      size="sm"
                      className="text-runapp-purple border-runapp-purple hover:bg-runapp-purple hover:text-white"
                    >
                      {importingStrava ? 'Importando...' : 'Importar'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
};

export default Settings;
