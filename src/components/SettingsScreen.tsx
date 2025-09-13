
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Shield, FileText, Info, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { supabase, SUPABASE_URL } from '@/integrations/supabase/client';

const SettingsScreen: React.FC = () => {
  const openPrivacyPolicy = () => {
    const url = 'https://airunningcoach.com/privacy';
    window.open(url, '_blank');
  };

  const openTermsOfService = () => {
    const url = 'https://airunningcoach.com/terms';
    window.open(url, '_blank');
  };

  const showAcknowledgements = () => {
    alert(
      'Reconocimientos\n\n' +
      'Esta app utiliza:\n\n' +
      '• React Geolocation API\n' +
      '• Supabase\n' +
      '• Lucide React Icons\n\n' +
      'Gracias a todos los desarrolladores de código abierto.'
    );
  };

  const [isStravaLinked, setIsStravaLinked] = useState(false);
  const [checkingStrava, setCheckingStrava] = useState(true);

  const checkStravaLink = useCallback(async () => {
    try {
      setCheckingStrava(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsStravaLinked(false);
        return;
      }
      const { data, error } = await supabase
        .from('strava_connections')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) {
        setIsStravaLinked(false);
        return;
      }
      setIsStravaLinked(!!data);
    } finally {
      setCheckingStrava(false);
    }
  }, []);

  useEffect(() => {
    checkStravaLink();
  }, [checkStravaLink]);

  const connectStrava = useCallback(async () => {
    const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID as string;
    if (!clientId) {
      alert('Configura VITE_STRAVA_CLIENT_ID en tu .env');
      return;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      alert('Debes iniciar sesión para conectar Strava');
      return;
    }
    const supabaseUrl = (supabase as any).supabaseUrl || SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
    
    // Detectar si estamos en móvil iOS (Capacitor)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isCapacitor = !!(window as any).Capacitor;
    
    const redirectBack = (isIOS && isCapacitor) 
      ? 'stride://strava-callback' 
      : `${window.location.origin}/settings`;
    
    const edgeCallback = `${supabaseUrl}/functions/v1/strava-auth?redirect_to=${encodeURIComponent(redirectBack)}`;
    const authorizeUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(edgeCallback)}&approval_prompt=auto&scope=read,activity:read_all&state=${accessToken}`;
    window.location.href = authorizeUrl;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="flex-1">
        <div className="bg-runapp-purple text-white p-4">
          <h1 className="text-xl font-bold text-white">Configuración</h1>
        </div>

        <div className="p-4 space-y-4">
          {/* Integraciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LinkIcon className="w-5 h-5 text-runapp-purple mr-2" />
                Integraciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Strava</p>
                  <p className="text-sm text-gray-600">Conecta tu cuenta para importar actividades.</p>
                </div>
                {isStravaLinked ? (
                  <span className="flex items-center text-green-600 text-sm">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Conectado
                  </span>
                ) : (
                  <Button onClick={connectStrava} disabled={checkingStrava}>Conectar</Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Privacidad y Datos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 text-runapp-purple mr-2" />
                Privacidad y Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Tu privacidad es importante para nosotros. Revisa cómo manejamos tus datos.
                </p>
                
                <Button 
                  variant="outline" 
                  onClick={openPrivacyPolicy}
                  className="flex items-center justify-between w-full"
                >
                  <span>Política de Privacidad</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
              
              <Separator />
              
              <Button 
                variant="outline" 
                onClick={openTermsOfService}
                className="flex items-center justify-between w-full"
              >
                <span>Términos de Servicio</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Información de la App */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="w-5 h-5 text-runapp-purple mr-2" />
                Información de la App
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Versión</span>
                <span className="font-medium">1.0.0</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between">
                <span className="text-gray-600">Build</span>
                <span className="font-medium">1</span>
              </div>
              
              <Separator />
              
              <Button 
                variant="outline" 
                onClick={showAcknowledgements}
                className="flex items-center justify-between w-full"
              >
                <span>Reconocimientos</span>
                <FileText className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Información de GPS */}
          <Card>
            <CardHeader>
              <CardTitle>Uso de Ubicación</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Esta app utiliza tu ubicación únicamente durante los entrenamientos para:
                <br /><br />
                • Calcular distancia recorrida<br />
                • Generar estadísticas de pace<br />
                • Mostrar tu progreso en tiempo real<br /><br />
                Los datos de ubicación se procesan localmente y se almacenan de forma segura en nuestros servidores.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default SettingsScreen;
