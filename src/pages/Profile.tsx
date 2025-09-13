import React from "react";
import { User, Activity, Settings, ChevronRight, Zap } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const HEADER_HEIGHT = 44;

const Profile: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + HEADER_HEIGHT;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header title="Perfil" />

      <div 
        className="w-full flex justify-center"
        style={{ 
          paddingTop: insets.top + HEADER_HEIGHT + 16,
          paddingBottom: `calc(90px + ${insets.bottom}px)`, // Más espacio para el bottom nav
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <div className="w-full max-w-md mx-auto p-4">
        {/* User Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
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
              {/* Settings Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile-settings')}
                className="text-runapp-gray hover:text-runapp-purple hover:bg-runapp-light-purple/20 rounded-full p-2 h-10 w-10"
              >
                <span className="text-lg">⚙️</span>
              </Button>
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

          {/* Integrations */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/settings')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-orange-600" />
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

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-runapp-gray">
            Stride Seeker v1.0
          </p>
        </div>
              </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
