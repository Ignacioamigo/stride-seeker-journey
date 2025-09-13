import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, RotateCcw, ChevronLeft, Edit, Mail, Calendar, Ruler, Weight, Target, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/layout/Header';
import { useSafeAreaInsets } from '@/hooks/utils/useSafeAreaInsets';

const HEADER_HEIGHT = 44;

const ProfileSettings: React.FC = () => {
  const { user, resetUser } = useUser();
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();

  const handleRestartOnboarding = () => {
    // Resetear el usuario y redirigir al onboarding
    resetUser();
    toast({
      title: "Onboarding reiniciado",
      description: "Te redirigiremos al proceso de configuración inicial.",
      variant: "default"
    });
    navigate('/welcome');
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <Header title="Configuración" />
      
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

          {/* Profile Information Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-runapp-navy">
                <User className="w-5 h-5 mr-2" />
                Información del Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Profile Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-runapp-purple" />
                  <div>
                    <p className="font-medium text-runapp-navy">Nombre</p>
                    <p className="text-sm text-runapp-gray">{user.name || 'No definido'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Activity className="w-5 h-5 text-runapp-purple" />
                  <div>
                    <p className="font-medium text-runapp-navy">Nivel de experiencia</p>
                    <p className="text-sm text-runapp-gray">
                      {user.experienceLevel 
                        ? user.experienceLevel.charAt(0).toUpperCase() + user.experienceLevel.slice(1) 
                        : 'No definido'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Target className="w-5 h-5 text-runapp-purple" />
                  <div>
                    <p className="font-medium text-runapp-navy">Objetivo</p>
                    <p className="text-sm text-runapp-gray">{user.goal || 'No definido'}</p>
                  </div>
                </div>

                {user.age && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-runapp-purple" />
                    <div>
                      <p className="font-medium text-runapp-navy">Edad</p>
                      <p className="text-sm text-runapp-gray">{user.age} años</p>
                    </div>
                  </div>
                )}

                {user.height && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Ruler className="w-5 h-5 text-runapp-purple" />
                    <div>
                      <p className="font-medium text-runapp-navy">Altura</p>
                      <p className="text-sm text-runapp-gray">{user.height} cm</p>
                    </div>
                  </div>
                )}

                {user.weight && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Weight className="w-5 h-5 text-runapp-purple" />
                    <div>
                      <p className="font-medium text-runapp-navy">Peso</p>
                      <p className="text-sm text-runapp-gray">{user.weight} kg</p>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleEditProfile}
                className="w-full bg-runapp-purple hover:bg-runapp-deep-purple text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-runapp-navy">
                <RotateCcw className="w-5 h-5 mr-2" />
                Acciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                  <div className="mb-3">
                    <p className="font-medium text-orange-800">Reiniciar Configuración</p>
                    <p className="text-sm text-orange-600">
                      Esto te llevará de vuelta al proceso de configuración inicial. 
                      Podrás cambiar tu perfil, objetivos y preferencias.
                    </p>
                  </div>
                  <Button 
                    onClick={handleRestartOnboarding}
                    variant="outline"
                    className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reiniciar Onboarding
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App Info */}
          <div className="text-center">
            <p className="text-xs text-runapp-gray">
              Stride Seeker v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
