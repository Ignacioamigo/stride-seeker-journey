import React from "react";
import { User, Activity, Settings, ChevronRight } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const HEADER_HEIGHT = 56;

const Profile: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + HEADER_HEIGHT;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with Settings Button */}
      <div className="bg-white shadow-sm sticky top-0 z-10" style={{ paddingTop: insets.top }}>
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-runapp-navy">Perfil</h1>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/settings')}
            className="text-runapp-navy"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="container max-w-md mx-auto p-4" style={{ paddingTop: 16 }}>
        {/* User Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-runapp-light-purple rounded-full flex items-center justify-center">
                <User size={32} className="text-runapp-purple" />
              </div>
              <div className="ml-4 flex-1">
                <h2 className="text-xl font-bold text-runapp-navy">{user.name}</h2>
                <p className="text-runapp-gray">
                  {user.experienceLevel ? 
                    user.experienceLevel.charAt(0).toUpperCase() + user.experienceLevel.slice(1) : 
                    'Corredor'
                  }
                </p>
                {user.goal && (
                  <p className="text-sm text-runapp-purple font-medium mt-1">
                    {user.goal}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-runapp-navy">
                {user.weeklyWorkouts || 0}
              </div>
              <div className="text-sm text-runapp-gray">
                Días/semana
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-runapp-navy">
                {user.maxDistance || 0}
              </div>
              <div className="text-sm text-runapp-gray">
                Max KM
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-runapp-navy">
                {user.pace || '--:--'}
              </div>
              <div className="text-sm text-runapp-gray">
                Ritmo
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="space-y-3">
          {/* My Activities Button */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/activities')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-runapp-light-purple rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-runapp-purple" />
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

          {/* Stats & Progress */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/stats')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-runapp-navy">Estadísticas</h3>
                    <p className="text-sm text-runapp-gray">Ver tu progreso y métricas</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-runapp-gray" />
              </div>
            </CardContent>
          </Card>

          {/* Training Plan */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/plan')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-runapp-navy">Plan de Entrenamiento</h3>
                    <p className="text-sm text-runapp-gray">Gestiona tu plan actual</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-runapp-gray" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-runapp-gray">
            Stride Seeker v1.0
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
