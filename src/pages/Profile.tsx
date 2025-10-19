import React, { useState } from "react";
import { User, Activity, Settings, ChevronRight, Zap, Users, FileText, Shield, Clock, Edit, Trash2, AlertTriangle } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";
import { useLayoutStability } from "@/hooks/useLayoutStability";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const HEADER_HEIGHT = 44;

const Profile: React.FC = () => {
  const { user, deleteAccount } = useUser();
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const HEADER_HEIGHT = 44;
  const headerHeight = insets.top + HEADER_HEIGHT;
  
  // Hook para estabilidad de layout
  useLayoutStability();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setShowDeleteDialog(false); // Cerrar el diálogo inmediatamente
    
    try {
      console.log('Iniciando eliminación de cuenta...');
      await deleteAccount();
      console.log('Cuenta eliminada, redirigiendo al onboarding...');
      // Pequeño delay para asegurar que se completen todas las operaciones
      setTimeout(() => {
        navigate('/onboarding', { replace: true });
      }, 500);
    } catch (error) {
      console.error('Error al eliminar la cuenta:', error);
      setIsDeleting(false);
      alert('Hubo un error al eliminar tu cuenta. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div 
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f9fafb'
      }}
    >
      {/* Header */}
      <Header title="Perfil" subtitle={`Hola, ${user.name} 👋`} />

      {/* Scrollable Content */}
      <div 
        style={{
          flex: 1,
          overflow: 'auto',
          paddingTop: `calc(${HEADER_HEIGHT}px + max(${insets.top}px, env(safe-area-inset-top, 20px)) + 20px)`,
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
          paddingBottom: Math.max(insets.bottom + 80, 96), // 64px min height + 16px padding + safe area
        }}
      >
        <div className="w-full max-w-md mx-auto px-4">
          
          {/* User Profile Section */}
          <Card className="mb-6 bg-gradient-to-r from-runapp-purple to-runapp-deep-purple text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'N'}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{user.name || 'Usuario'}</h2>
                  <p className="text-white/80 text-sm">{user.age || 23} años</p>
                  <div className="flex items-center mt-2">
                    <div className="w-4 h-4 bg-yellow-400 rounded mr-2 flex items-center justify-center">
                      <span className="text-xs">🏆</span>
                    </div>
                    <span className="text-sm">
                      {user.experienceLevel ? 
                        user.experienceLevel.charAt(0).toUpperCase() + user.experienceLevel.slice(1) : 
                        'Intermedio'
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Goal */}
              <div className="mt-4 flex items-center">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm">🎯</span>
                </div>
                <span className="text-white/90 text-sm">
                  {user.goal || 'Correr mi primera media maratón'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Stats in Circles */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray="60, 100"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">{user.weeklyWorkouts || 3}</span>
                  </div>
                </div>
                <p className="font-semibold text-runapp-navy">Entrenamientos</p>
                <p className="text-sm text-runapp-gray">por semana</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="80, 100"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">{user.maxDistance || 4}</span>
                  </div>
                </div>
                <p className="font-semibold text-runapp-navy">Distancia</p>
                <p className="text-sm text-runapp-gray">máxima</p>
              </CardContent>
            </Card>
          </div>

          {/* Pace Goal Section */}
          <Card className="mb-6 bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-runapp-purple/20 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-runapp-purple" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-runapp-navy text-lg">Ritmo objetivo</h3>
                    <p className="text-2xl font-bold text-runapp-purple">{user.pace || '05:30'} <span className="text-sm font-normal">/km</span></p>
                  </div>
                </div>
                <Button 
                  className="bg-runapp-purple hover:bg-runapp-deep-purple text-white rounded-full px-6"
                  onClick={() => navigate('/profile-settings')}
                >
                  Cambiar meta
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invite Friends Section */}
          <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">📈</span>
                <div>
                  <h3 className="font-bold text-lg">¡El entrenamiento es más fácil juntos!</h3>
                  <p className="text-white/80 text-sm mt-1">
                    Comparte tu progreso y motívate con otros corredores
                  </p>
                </div>
              </div>
              <Button 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-full w-full"
                variant="outline"
              >
                <Users className="w-4 h-4 mr-2" />
                Invitar amigos
              </Button>
            </CardContent>
          </Card>

          {/* Main Actions - Keeping existing functionality */}
          <div className="space-y-3 mb-6">
            {/* Edit Profile */}
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/edit-profile')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-runapp-light-purple rounded-lg flex items-center justify-center">
                      <Edit className="w-4 h-4 text-runapp-purple" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-runapp-navy">Editar perfil</h3>
                      <p className="text-sm text-runapp-gray">Actualiza tu información personal</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-runapp-gray" />
                </div>
              </CardContent>
            </Card>

            {/* My Activities Button - MAINTAINING FUNCTIONALITY */}
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/activities')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-runapp-light-purple rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-runapp-purple" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-runapp-navy">Mis Actividades</h3>
                      <p className="text-sm text-runapp-gray">Ver todas tus carreras publicadas</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-runapp-gray" />
                </div>
              </CardContent>
            </Card>

            {/* Integrations - MAINTAINING FUNCTIONALITY */}
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/settings')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-runapp-navy">Integraciones</h3>
                      <p className="text-sm text-runapp-gray">Conecta con Strava y otras apps</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-runapp-gray" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Legal Section */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-runapp-gray mr-2" />
              <h3 className="font-semibold text-runapp-navy">Legal</h3>
            </div>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer mb-3" onClick={() => navigate('/terms-and-conditions')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-runapp-navy">Términos y condiciones</h3>
                      <p className="text-sm text-runapp-gray">Ver términos completos</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-runapp-gray" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/privacy-policy')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-runapp-navy">Política de privacidad</h3>
                      <p className="text-sm text-runapp-gray">Cómo protegemos tus datos</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-runapp-gray" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer mt-3" onClick={() => setShowDeleteDialog(true)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-600">Eliminar cuenta</h3>
                      <p className="text-sm text-runapp-gray">Borrar permanentemente mi cuenta</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-runapp-gray" />
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <BottomNav />

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="flex items-center justify-center gap-2 text-red-600 text-base font-bold">
              <AlertTriangle className="w-5 h-5" />
              ¿Estás seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-gray-700 space-y-2">
              <p className="font-semibold">Esta acción no se puede deshacer.</p>
              <p className="text-xs leading-relaxed">
                Al eliminar tu cuenta se borrarán permanentemente todos tus datos: perfil, planes de entrenamiento, historial de actividades y conexiones.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 mt-4">
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="w-full bg-red-600 hover:bg-red-700 text-white order-1"
            >
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
            <AlertDialogCancel disabled={isDeleting} className="w-full order-2">
              Cancelar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
