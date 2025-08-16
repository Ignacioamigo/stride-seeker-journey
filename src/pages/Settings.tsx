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
      
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        console.log('No authenticated user found:', authError);
        setIsStravaLinked(false);
        return;
      }

      const { data, error } = await supabase
        .from('strava_tokens')
        .select('user_id')
        .eq('user_id', authUser.id)
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

      // Get access token for auth state
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;
      
      if (!accessToken) {
        toast({
          title: "Error",
          description: "No se pudo obtener el token de sesión",
          variant: "destructive"
        });
        return;
      }

      // Build Strava OAuth URL with proper parameters
      const stravaClientId = "172613";
      const redirectUri = `${SUPABASE_URL}/functions/v1/strava-auth`;
      const scope = "read,activity:read,activity:read_all";
      
      const stravaConnectUrl = `https://www.strava.com/oauth/authorize?client_id=${stravaClientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=${scope}&state=${accessToken}`;
      
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
      
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        alert('❌ Error: No estás autenticado');
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/strava-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ user_id: authUser.id })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert(`✅ Importadas ${result.imported_count} actividades de Strava`);
      } else {
        alert(`❌ Error importando: ${result.error}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('❌ Error inesperado importando actividades');
    } finally {
      setImportingStrava(false);
    }
  }, []);

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
