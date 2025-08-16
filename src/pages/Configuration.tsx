import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Calendar, Ruler, Weight, Target, ChevronLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import Header from '@/components/layout/Header';
import { useSafeAreaInsets } from '@/hooks/utils/useSafeAreaInsets';

const HEADER_HEIGHT = 44;

const Configuration: React.FC = () => {
  const { user, resetUser } = useUser();
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header - let it handle its own fixed positioning */}
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
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-runapp-gray" />
                  <span className="text-runapp-navy">Nombre</span>
                </div>
                <span className="text-runapp-gray">{user?.name || 'No definido'}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-runapp-gray" />
                  <span className="text-runapp-navy">Email</span>
                </div>
                <span className="text-runapp-gray">{user?.email || 'No definido'}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-runapp-gray" />
                  <span className="text-runapp-navy">Edad</span>
                </div>
                <span className="text-runapp-gray">{user?.age ? `${user.age} años` : 'No definido'}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <Ruler className="w-4 h-4 mr-2 text-runapp-gray" />
                  <span className="text-runapp-navy">Altura</span>
                </div>
                <span className="text-runapp-gray">{user?.height ? `${user.height} cm` : 'No definido'}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <Weight className="w-4 h-4 mr-2 text-runapp-gray" />
                  <span className="text-runapp-navy">Peso</span>
                </div>
                <span className="text-runapp-gray">{user?.weight ? `${user.weight} kg` : 'No definido'}</span>
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
                <span className="text-runapp-navy">Objetivo</span>
                <span className="text-runapp-gray">{user?.goal || 'No definido'}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-runapp-navy">Experiencia</span>
                <span className="text-runapp-gray">{user?.experienceLevel || 'No definido'}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-runapp-navy">Entrenamientos por semana</span>
                <span className="text-runapp-gray">{user?.weeklyWorkouts || 'No definido'}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-runapp-navy">Distancia máxima</span>
                <span className="text-runapp-gray">{user?.maxDistance || 'No definido'}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-runapp-navy">Ritmo objetivo</span>
                <span className="text-runapp-gray">{user?.pace || 'No definido'}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-runapp-navy">Lesiones previas</span>
                <span className="text-runapp-gray">{user?.injuries || 'No definido'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-runapp-navy">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => navigate('/edit-profile')}
                variant="outline"
                className="w-full text-runapp-purple border-runapp-purple hover:bg-runapp-purple hover:text-white"
              >
                Editar Perfil
              </Button>
              
              <Button
                onClick={resetUser}
                variant="destructive"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reiniciar onboarding
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Configuration;
