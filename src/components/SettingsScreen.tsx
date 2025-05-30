
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Shield, FileText, Info } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';

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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="flex-1">
        <div className="bg-runapp-purple text-white p-4">
          <h1 className="text-xl font-bold text-white">Configuración</h1>
        </div>

        <div className="p-4 space-y-4">
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
