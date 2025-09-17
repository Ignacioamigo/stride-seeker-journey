import React from "react";
import { 
  User, Activity, ChevronRight, Zap, Settings, Target, 
  Calendar, Ruler, Weight, Trophy, MapPin, Clock, Route,
  Edit, Users, Smartphone, Heart, TrendingUp
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";
import { useLayoutStability } from "@/hooks/useLayoutStability";

const HEADER_HEIGHT = 44;

const Profile: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  // 🔥 HOOK ANTI-DESCUADRE
  useLayoutStability();
  const { top, bottom, left, right, isReady } = useSafeAreaInsets();

  // Usar fallbacks seguros cuando isReady es false
  const safeTop = isReady ? (top || 0) : 44;
  const safeBottom = isReady ? (bottom || 0) : 34;
  const safeLeft = isReady ? left : 0;
  const safeRight = isReady ? right : 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header estándar como otras páginas */}
      <Header title="Perfil" subtitle={`Hola, ${user.name || 'Usuario'} 👋`} />
      
      {/* Content area con estructura correcta */}
      <div 
        className="w-full flex justify-center"
        style={{ 
          paddingTop: safeTop + HEADER_HEIGHT + 16, // Safe area + Header height + spacing
          paddingBottom: `calc(90px + ${safeBottom}px)`, // SOLO espacio para BottomNav
          paddingLeft: Math.max(safeLeft, 16),
          paddingRight: Math.max(safeRight, 16),
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <div className="w-full max-w-md mx-auto px-4">
          {/* Settings Button - Como en otras páginas */}
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile-settings')}
              className="text-runapp-gray hover:text-runapp-purple hover:bg-runapp-light-purple/20 rounded-full p-3"
            >
              <Settings size={20} />
            </Button>
          </div>

          {/* User Profile Card - Redesigned */}
          <Card className="mb-6 bg-gradient-to-br from-runapp-purple to-runapp-deep-purple text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-runapp-purple">
                      {user.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">{user.name || 'Ingrese su nombre'}</h2>
                  <p className="text-white/80 text-sm mb-1">
                    {user.age ? `${user.age} años` : 'Edad no definida'}
                  </p>
                  <div className="flex items-center space-x-1">
                    <Trophy size={14} className="text-yellow-300" />
                    <span className="text-xs text-white/90">
                      {user.experienceLevel ? 
                        user.experienceLevel.charAt(0).toUpperCase() + user.experienceLevel.slice(1) : 
                        'Corredor'
                      }
                    </span>
                  </div>
                </div>
              </div>
              {user.goal && (
                <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <Target size={16} className="text-white" />
                    <span className="text-sm font-medium">{user.goal}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Running Stats Widgets - Circular como las imágenes */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="bg-white">
              <CardContent className="p-6 text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-200 to-blue-300"></div>
                  <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{user.weeklyWorkouts || 0}</div>
                      <div className="text-xs text-gray-500">días</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700">Entrenamientos</p>
                <p className="text-xs text-gray-500">por semana</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-6 text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-200 to-green-300"></div>
                  <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{user.maxDistance || 0}</div>
                      <div className="text-xs text-gray-500">km</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700">Distancia</p>
                <p className="text-xs text-gray-500">máxima</p>
              </CardContent>
            </Card>
          </div>

          {/* Actividades e Integraciones */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/activities')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200 text-blue-700 rounded-xl"
                  variant="outline"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Mis Actividades</p>
                      <p className="text-xs text-blue-600">Ver todas tus carreras</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </Button>
                
                <Button
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-orange-200 text-orange-700 rounded-xl"
                  variant="outline"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Integraciones</p>
                      <p className="text-xs text-orange-600">Conecta con Strava</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Objetivo y Ritmo - Widget */}
          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-purple-800 mb-1">Ritmo objetivo</h4>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-6 h-6 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-700">
                      {user.pace || '--:--'}
                    </span>
                    <span className="text-sm text-purple-600">/km</span>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/profile-settings')}
                  className="bg-purple-500 hover:bg-purple-600 text-white rounded-full"
                  size="sm"
                >
                  Cambiar meta
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Personal Details Section */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-runapp-navy">Detalles personales</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/profile-settings')}
                  className="text-runapp-purple hover:text-runapp-deep-purple"
                >
                  <Edit size={16} />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Weight className="w-5 h-5 text-runapp-purple" />
                    <div>
                      <p className="font-medium text-runapp-navy">Peso actual</p>
                      <p className="text-sm text-runapp-gray">{user.weight || '--'} kg</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-runapp-gray" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Ruler className="w-5 h-5 text-runapp-purple" />
                    <div>
                      <p className="font-medium text-runapp-navy">Altura</p>
                      <p className="text-sm text-runapp-gray">{user.height || '--'} cm</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-runapp-gray" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-runapp-purple" />
                    <div>
                      <p className="font-medium text-runapp-navy">Ritmo objetivo</p>
                      <p className="text-sm text-runapp-gray">{user.pace || '--:--'} /km</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-runapp-gray" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inspirational Running Quote Card */}
          <Card className="mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white overflow-hidden">
            <CardContent className="p-0">
              <div className="relative p-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative z-10">
                  <TrendingUp className="w-8 h-8 mb-4 text-yellow-300" />
                  <h3 className="text-lg font-bold mb-2">¡El entrenamiento es más fácil juntos!</h3>
                  <p className="text-sm text-white/80 mb-4">Comparte tu progreso y motívate con otros corredores</p>
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-full">
                    <Users className="w-4 h-4 mr-2" />
                    Invitar amigos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Section - AL FINAL COMO PIDIÓ EL USUARIO */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-runapp-navy mb-4 flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                Legal
              </h3>
              <div className="space-y-3">
                <Button
                  onClick={() => window.open('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/', '_blank')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 text-runapp-navy rounded-lg"
                  variant="ghost"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs">📄</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">Términos y condiciones</p>
                      <p className="text-xs text-runapp-gray">Ver términos completos</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={() => navigate('/privacy-policy')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 text-runapp-navy rounded-lg"
                  variant="ghost"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs">🔒</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">Política de privacidad</p>
                      <p className="text-xs text-runapp-gray">Cómo protegemos tus datos</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* App Info */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-sm">
              <Heart size={14} className="text-red-500" />
              <p className="text-xs text-runapp-gray font-medium">
                Stride Seeker v1.0
              </p>
            </div>
          </div>

          {/* ESPACIO EXTRA PARA SCROLL - DENTRO DEL CONTENIDO */}
          <div style={{ height: '120px' }}></div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
