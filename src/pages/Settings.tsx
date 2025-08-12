import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Calendar, Ruler, Weight, Target, ChevronLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/layout/Header';
import { useSafeAreaInsets } from '@/hooks/utils/useSafeAreaInsets';

const HEADER_HEIGHT = 56;

const Settings: React.FC = () => {
  const { user, resetUser } = useUser();
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + HEADER_HEIGHT;

  const handleResetOnboarding = async () => {
    if (window.confirm("¿Estás seguro que deseas reiniciar el proceso de onboarding? Se borrarán todos tus datos de perfil.")) {
      try {
        await resetUser();
        toast({
          title: "Perfil reiniciado",
          description: "Serás redirigido al inicio del onboarding.",
        });
        setTimeout(() => navigate("/onboarding/name"), 1000);
      } catch (error) {
        console.error("Error al reiniciar onboarding:", error);
        toast({
          title: "Error",
          description: "Hubo un problema al reiniciar el perfil. Intenta de nuevo.",
          variant: "destructive",
        });
      }
    }
  };

  const getExperienceLevelText = (level: string | null) => {
    switch (level) {
      case 'principiante': return 'Principiante';
      case 'intermedio': return 'Intermedio';
      case 'avanzado': return 'Avanzado';
      default: return 'No especificado';
    }
  };

  const getGenderText = (gender: string | null) => {
    switch (gender) {
      case 'masculino': return 'Masculino';
      case 'femenino': return 'Femenino';
      case 'otro': return 'Otro';
      default: return 'No especificado';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Configuración" />
      
      <div className="container max-w-md mx-auto p-4" style={{ paddingTop: headerHeight }}>
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/profile')}
          className="mb-4 text-runapp-navy"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Volver al perfil
        </Button>

        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-runapp-navy">
              <User className="w-5 h-5 mr-2" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-runapp-purple" />
                <div>
                  <p className="font-medium text-runapp-navy">Nombre</p>
                  <p className="text-sm text-runapp-gray">{user.name || 'No especificado'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-runapp-purple" />
                <div>
                  <p className="font-medium text-runapp-navy">Edad</p>
                  <p className="text-sm text-runapp-gray">{user.age ? `${user.age} años` : 'No especificada'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-runapp-purple" />
                <div>
                  <p className="font-medium text-runapp-navy">Género</p>
                  <p className="text-sm text-runapp-gray">{getGenderText(user.gender)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Ruler className="w-5 h-5 text-runapp-purple" />
                <div>
                  <p className="font-medium text-runapp-navy">Altura</p>
                  <p className="text-sm text-runapp-gray">{user.height ? `${user.height} cm` : 'No especificada'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Weight className="w-5 h-5 text-runapp-purple" />
                <div>
                  <p className="font-medium text-runapp-navy">Peso</p>
                  <p className="text-sm text-runapp-gray">{user.weight ? `${user.weight} kg` : 'No especificado'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Running Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-runapp-navy">
              <Target className="w-5 h-5 mr-2" />
              Información de Running
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-runapp-purple" />
                <div>
                  <p className="font-medium text-runapp-navy">Nivel de experiencia</p>
                  <p className="text-sm text-runapp-gray">{getExperienceLevelText(user.experienceLevel)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-runapp-purple" />
                <div>
                  <p className="font-medium text-runapp-navy">Objetivo</p>
                  <p className="text-sm text-runapp-gray">{user.goal || 'No especificado'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-runapp-purple" />
                <div>
                  <p className="font-medium text-runapp-navy">Distancia máxima</p>
                  <p className="text-sm text-runapp-gray">{user.maxDistance ? `${user.maxDistance} km` : 'No especificada'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-runapp-purple" />
                <div>
                  <p className="font-medium text-runapp-navy">Ritmo objetivo</p>
                  <p className="text-sm text-runapp-gray">{user.pace || 'No especificado'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-runapp-purple" />
                <div>
                  <p className="font-medium text-runapp-navy">Entrenamientos semanales</p>
                  <p className="text-sm text-runapp-gray">{user.weeklyWorkouts ? `${user.weeklyWorkouts} días` : 'No especificado'}</p>
                </div>
              </div>
            </div>

            {user.injuries && (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-runapp-purple" />
                  <div>
                    <p className="font-medium text-runapp-navy">Lesiones</p>
                    <p className="text-sm text-runapp-gray">{user.injuries}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-runapp-navy">Acciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => navigate('/profile/edit')}
              className="w-full bg-runapp-purple hover:bg-runapp-deep-purple text-white"
            >
              Editar perfil
            </Button>
            
            <Button 
              onClick={handleResetOnboarding}
              variant="outline" 
              className="w-full border-red-500 text-red-500 hover:bg-red-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reiniciar onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
