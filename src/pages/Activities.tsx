import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Route, Activity, Heart, MessageCircle, ChevronLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PublishedActivity } from '@/types';
import { getUserActivities } from '@/services/activityService';
import Header from '@/components/layout/Header';
import SimpleMapView from '@/components/SimpleMapView';
import { useSafeAreaInsets } from '@/hooks/utils/useSafeAreaInsets';

const HEADER_HEIGHT = 44;

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<PublishedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + HEADER_HEIGHT;

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      console.log('🔄 [Activities] Loading user activities...');
      const userActivities = await getUserActivities();
      console.log(`✅ [Activities] Loaded ${userActivities.length} activities`);
      setActivities(userActivities);
    } catch (error) {
      console.error('❌ [Activities] Error loading activities:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error para mostrar al usuario:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters.toFixed(0)} m`;
    }
    return `${(meters / 1000).toFixed(2)}`;
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${Math.floor(diffInHours)} horas`;
    if (diffInHours < 48) return 'Ayer';
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} días`;
  };

  const calculateAverageSpeed = (activity: PublishedActivity): string => {
    const durationParts = activity.runSession.duration.split(':');
    const totalMinutes = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]) + parseInt(durationParts[2]) / 60;
    const kmDistance = activity.runSession.distance / 1000;
    if (totalMinutes === 0) return "--,--";
    const speed = (kmDistance / totalMinutes) * 60; // km/h
    return speed.toFixed(1);
  };

  const calculatePace = (activity: PublishedActivity): string => {
    const durationParts = activity.runSession.duration.split(':');
    const totalMinutes = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]) + parseInt(durationParts[2]) / 60;
    const kmDistance = activity.runSession.distance / 1000;
    if (kmDistance === 0) return "--:--";
    const paceMinutes = totalMinutes / kmDistance;
    const minutes = Math.floor(paceMinutes);
    const seconds = Math.floor((paceMinutes - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 border-4 border-runapp-purple border-t-transparent rounded-full animate-spin mb-6"></div>
          <h3 className="text-lg font-semibold text-runapp-navy mb-2">📱 Cargando actividades</h3>
          <p className="text-sm text-runapp-gray">Obteniendo tus entrenamientos locales...</p>
          <div className="mt-4 text-xs text-runapp-gray">💾 Local • 🔄 Auto-sync • 📱 Siempre disponible</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - let it handle its own fixed positioning */}
      <Header title="Actividades" />
      
      {/* Content area with proper spacing */}
      <div 
        className="container max-w-md mx-auto p-4 pb-20"
        style={{ 
          paddingTop: insets.top + HEADER_HEIGHT + 16,
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
        }}
      >
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/profile')}
          className="mb-4 text-runapp-navy"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Volver al perfil
        </Button>

        {activities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-runapp-gray mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-runapp-navy mb-2">No hay actividades</h3>
            <p className="text-runapp-gray mb-6">Completa tu primer entrenamiento para ver tus actividades aquí.</p>
            <Button onClick={() => navigate('/train')} className="bg-runapp-purple hover:bg-runapp-deep-purple text-white">Ir a entrenar</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {activities.map((activity) => (
              <Card key={activity.id} className="overflow-hidden shadow-lg">
                <CardContent className="p-0">
                  {/* Header with user info */}
                  <div className="p-4 pb-3">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-runapp-purple rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-runapp-navy">{activity.userProfile.name}</h4>
                          <div className="flex items-center space-x-2">
                            {/* Strava badge */}
                            {(activity as any).imported_from_strava && (
                              <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                                🏃‍♂️ Strava
                              </div>
                            )}
                            <p className="text-xs text-runapp-gray">{getTimeAgo(activity.publishedAt)}</p>
                          </div>
                        </div>
                        <p className="text-xs text-runapp-gray">{formatDate(activity.publishedAt)}</p>
                      </div>
                    </div>
                    <h3 className="font-bold text-runapp-navy text-lg mb-2">{activity.title}</h3>
                    {activity.description && (<p className="text-sm text-runapp-gray mb-3">{activity.description}</p>)}
                  </div>

                  {/* Large Stats Display */}
                  <div className="px-4 pb-4">
                    <div className="bg-black text-white rounded-2xl p-4">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-white text-2xl font-bold leading-snug whitespace-nowrap mb-1">{formatDistance(activity.runSession.distance)}</p>
                          <p className="text-gray-300 text-xs">Distancia (km)</p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-white text-2xl font-bold leading-snug whitespace-nowrap font-mono mb-1">{activity.runSession.duration}</p>
                          <p className="text-gray-300 text-xs">Duración</p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-white text-xl font-semibold leading-snug whitespace-nowrap mb-1">{calculatePace(activity)}</p>
                          <p className="text-gray-300 text-xs">Ritmo medio</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mini Map */}
                  {activity.runSession.gpsPoints && activity.runSession.gpsPoints.length > 0 && (
                    <div className="mx-4 mb-4">
                      <div className="h-48 rounded-lg overflow-hidden border border-gray-200">
                        <SimpleMapView 
                          points={activity.runSession.gpsPoints} 
                          currentLocation={null}
                          isTracking={false} 
                        />
                      </div>
                    </div>
                  )}

                  {/* Activity Image */}
                  {activity.imageUrl && (
                    <div className="mx-4 mb-4">
                      <img src={activity.imageUrl} alt="Foto del entrenamiento" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  )}

                  {/* Performance Metrics */}
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-runapp-light-purple/10 rounded-lg">
                        <p className="text-sm text-runapp-gray mb-1">Velocidad media</p>
                        <p className="text-xl font-bold text-runapp-navy">{calculateAverageSpeed(activity)} km/h</p>
                      </div>
                      <div className="text-center p-3 bg-runapp-light-purple/10 rounded-lg">
                        <p className="text-sm text-runapp-gray mb-1">Calorías</p>
                        <p className="text-xl font-bold text-runapp-navy">{Math.round(activity.runSession.distance / 1000 * 60)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Social actions */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center space-x-6">
                      <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-runapp-gray hover:text-red-500">
                        <Heart className="w-5 h-5" />
                        <span className="text-sm font-medium">{activity.likes || 0}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-runapp-gray hover:text-blue-500">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{activity.comments || 0}</span>
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-runapp-gray">{activity.isPublic ? 'Público' : 'Privado'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;
