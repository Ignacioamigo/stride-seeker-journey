
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Shield, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PermissionsScreen: React.FC = () => {
  const [permissionStep, setPermissionStep] = useState<'initial' | 'when-in-use' | 'always' | 'completed'>('initial');
  const navigate = useNavigate();

  const requestWhenInUsePermission = async () => {
    try {
      // Simular solicitud de permiso "When in Use"
      setPermissionStep('when-in-use');
      
      // En una app real, aquí usarías navigator.geolocation
      setTimeout(() => {
        setPermissionStep('always');
      }, 1000);
    } catch (error) {
      alert('No se pudieron obtener los permisos de ubicación');
    }
  };

  const requestAlwaysPermission = async () => {
    try {
      // Simular solicitud de permiso "Always"
      setPermissionStep('completed');
      
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (error) {
      alert('No se pudieron obtener los permisos de ubicación continua');
    }
  };

  const skipPermissions = () => {
    if (confirm('Sin permisos de ubicación, no podrás usar el tracking GPS. ¿Continuar?')) {
      navigate(-1);
    }
  };

  if (permissionStep === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="mx-4 max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-xl text-green-600">¡Listo!</CardTitle>
            <CardDescription>
              Ya puedes usar el tracking GPS completo
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (permissionStep === 'always') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex-1 flex items-center justify-center">
          <Card className="mx-4 max-w-md">
            <CardHeader>
              <Activity className="w-12 h-12 text-runapp-purple mx-auto mb-4" />
              <CardTitle className="text-center text-xl">Tracking en segundo plano</CardTitle>
              <CardDescription className="text-center">
                Para registrar tu entrenamiento completo, necesitamos acceso continuo a tu ubicación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">¿Por qué "Siempre"?</p>
                <p className="text-sm text-blue-700">
                  • Continúa el tracking si bloqueas la pantalla<br />
                  • Registra tu ruta completa sin interrupciones<br />
                  • Calcula estadísticas precisas de pace y distancia
                </p>
              </div>
              
              <Button 
                onClick={requestAlwaysPermission}
                className="bg-runapp-purple w-full"
              >
                Permitir acceso continuo
              </Button>
              
              <Button 
                variant="outline" 
                onClick={skipPermissions}
                className="w-full"
              >
                Usar sin tracking en segundo plano
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex-1 flex items-center justify-center">
        <Card className="mx-4 max-w-md">
          <CardHeader>
            <MapPin className="w-12 h-12 text-runapp-purple mx-auto mb-4" />
            <CardTitle className="text-center text-xl">Permisos de ubicación</CardTitle>
            <CardDescription className="text-center">
              AI Running Coach necesita acceso a tu ubicación para funcionar correctamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-runapp-purple rounded-full" />
                <span className="text-sm text-gray-700">Calcular distancia recorrida</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-runapp-purple rounded-full" />
                <span className="text-sm text-gray-700">Mostrar tu ruta en tiempo real</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-runapp-purple rounded-full" />
                <span className="text-sm text-gray-700">Generar estadísticas de pace</span>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-xs text-yellow-800">
                🔒 Tu ubicación se procesa localmente y solo se guarda cuando inicias un entrenamiento.
              </p>
            </div>
            
            <Button 
              onClick={requestWhenInUsePermission}
              className="bg-runapp-purple w-full"
            >
              Permitir acceso a ubicación
            </Button>
            
            <Button 
              variant="outline" 
              onClick={skipPermissions}
              className="w-full"
            >
              Continuar sin GPS
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PermissionsScreen;
