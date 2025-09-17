import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Route, Activity, Heart, MessageCircle, ChevronLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PublishedActivity } from '@/types';
import { getPublishedActivitiesUltraSimple } from '@/services/ultraSimpleActivityService';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
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
      console.log('🔄 [Activities] Loading activities with ULTRA SIMPLE service...');
      
      // PRIMERA OPCIÓN: Servicio ultra simple
      let userActivities = [];
      
      try {
        userActivities = await getPublishedActivitiesUltraSimple();
        console.log(`✅ [Activities] Loaded from Supabase: ${userActivities.length} activities`);
      } catch (supabaseError) {
        console.warn('⚠️ [Activities] Error with Supabase, trying localStorage fallback:', supabaseError);
        
        // SEGUNDA OPCIÓN: Fallback localStorage
        try {
          const stored = localStorage.getItem('publishedActivities');
          userActivities = stored ? JSON.parse(stored) : [];
          console.log(`📱 [Activities] Loaded from localStorage: ${userActivities.length} activities`);
        } catch (localError) {
          console.error('❌ [Activities] Error with localStorage too:', localError);
          
          // TERCERA OPCIÓN: Datos de ejemplo
          userActivities = [
            {
              id: 'example-1',
              title: 'Entrenamiento de ejemplo',
              description: 'Datos de ejemplo mientras se resuelve la conexión',
              distance: 5.0,
              duration: '00:25:00',
              calories: 300,
              user_email: 'ejemplo@test.com',
              created_at: new Date().toISOString(),
              gps_points: []
            }
          ];
          console.log('🔧 [Activities] Using example data');
        }
      }
      
      // Adaptar datos de manera ULTRA SEGURA
      const adaptedActivities = userActivities.map((activity: any, index: number) => {
        console.log(`🔧 [Activities] Procesando actividad ${index + 1}:`, {
          id: activity.id,
          title: activity.title,
          duration: activity.duration,
          distance: activity.distance
        });
        
        // Convertir duration de manera MUY segura
        let durationSeconds = 1800; // 30 minutos por defecto
        
        if (activity.duration && typeof activity.duration === 'string') {
          // Limpiar la duración primero
          const cleanDuration = activity.duration.trim();
          
          // Verificar si contiene NaN
          if (cleanDuration.includes('NaN')) {
            console.warn(`⚠️ [Activities] Duration contiene NaN, usando default: ${cleanDuration}`);
            durationSeconds = 1800;
          } else {
            try {
              const parts = cleanDuration.split(':');
              console.log(`🔧 [Activities] Duration parts:`, parts);
              
              if (parts.length === 3) {
                const hours = parseInt(parts[0]) || 0;
                const minutes = parseInt(parts[1]) || 0;
                const seconds = parseInt(parts[2]) || 0;
                
                // Verificar que todos los valores sean válidos
                if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
                  durationSeconds = hours * 3600 + minutes * 60 + seconds;
                  console.log(`✅ [Activities] Duration parsed: ${hours}h ${minutes}m ${seconds}s = ${durationSeconds}s`);
                } else {
                  console.warn(`⚠️ [Activities] Partes de duration inválidas: ${parts}`);
                  durationSeconds = 1800;
                }
              } else {
                console.warn(`⚠️ [Activities] Duration format incorrecto: ${cleanDuration}`);
                durationSeconds = 1800;
              }
            } catch (durationError) {
              console.error(`❌ [Activities] Error parsing duration "${activity.duration}":`, durationError);
              durationSeconds = 1800;
            }
          }
        }
        
        // Validar distancia
        const safeDistance = Math.max(0, parseFloat(activity.distance) || 0);
        
        // Crear objeto final con validaciones
        const adaptedActivity = {
          id: activity.id || `activity-${Date.now()}-${index}`,
          title: activity.title || 'Entrenamiento',
          description: activity.description || 'Entrenamiento completado',
          imageUrl: activity.image_url || null,
          calories: Math.max(0, parseInt(activity.calories) || 0),
          runSession: {
            distance: safeDistance * 1000, // km a metros
            duration: durationSeconds, // segundos
            gpsPoints: Array.isArray(activity.gps_points) ? activity.gps_points : [],
            startTime: new Date(activity.activity_date || activity.created_at || new Date()),
            endTime: new Date(activity.activity_date || activity.created_at || new Date())
          },
          publishedAt: new Date(activity.created_at || new Date()),
          isPublic: activity.is_public !== false,
          likes: Math.max(0, parseInt(activity.likes) || 0),
          comments: Math.max(0, parseInt(activity.comments) || 0),
          userProfile: {
            name: (activity.user_email?.split('@')[0]) || 'Usuario'
          }
        };
        
        console.log(`✅ [Activities] Actividad ${index + 1} adaptada:`, {
          id: adaptedActivity.id,
          title: adaptedActivity.title,
          distance: adaptedActivity.runSession.distance,
          duration: adaptedActivity.runSession.duration
        });
        
        return adaptedActivity;
      });
      
      console.log('✅ [Activities] Datos adaptados exitosamente:', adaptedActivities.length);
      setActivities(adaptedActivities);
      
    } catch (error) {
      console.error('💥 [Activities] Error crítico:', error);
      
      // ÚLTIMO RECURSO: Array vacío para mostrar mensaje de "sin actividades"
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (meters: number): string => {
    try {
      const safeMeters = Math.max(0, parseFloat(meters?.toString()) || 0);
      if (safeMeters < 1000) {
        return `${safeMeters.toFixed(0)} m`;
      }
      return `${(safeMeters / 1000).toFixed(2)}`;
    } catch (error) {
      console.error('Error formatting distance:', error, 'meters:', meters);
      return '0';
    }
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
    try {
      // activity.runSession.duration viene como SEGUNDOS, no como string
      const durationSeconds = Math.max(0, parseFloat(activity.runSession.duration?.toString()) || 0);
      const kmDistance = Math.max(0, parseFloat(activity.runSession.distance?.toString()) || 0) / 1000;
      
      if (durationSeconds === 0 || kmDistance === 0) return "--,--";
      
      const totalHours = durationSeconds / 3600;
      const speed = kmDistance / totalHours; // km/h
      
      if (!isFinite(speed) || isNaN(speed)) return "--,--";
      
      return speed.toFixed(1);
    } catch (error) {
      console.error('❌ Error calculating average speed for activity:', activity?.id, error);
      return "--,--";
    }
  };

  const formatDuration = (durationSeconds: number): string => {
    try {
      const safeDuration = Math.max(0, Math.floor(parseFloat(durationSeconds?.toString()) || 0));
      const hours = Math.floor(safeDuration / 3600);
      const minutes = Math.floor((safeDuration % 3600) / 60);
      const seconds = Math.floor(safeDuration % 60);
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    } catch (error) {
      console.error('❌ Error formatting duration:', durationSeconds, error);
      return "0:00";
    }
  };

  const calculatePace = (activity: PublishedActivity): string => {
    try {
      // activity.runSession.duration viene como SEGUNDOS, no como string
      const durationSeconds = Math.max(0, parseFloat(activity.runSession.duration?.toString()) || 0);
      const kmDistance = Math.max(0, parseFloat(activity.runSession.distance?.toString()) || 0) / 1000;
      
      if (kmDistance === 0 || durationSeconds === 0) return "--:--";
      
      const paceSeconds = durationSeconds / kmDistance; // segundos por km
      const minutes = Math.floor(paceSeconds / 60);
      const seconds = Math.floor(paceSeconds % 60);
      
      return `${Math.max(0, minutes)}:${Math.max(0, seconds).toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('❌ Error calculating pace for activity:', activity?.id, error);
      return "--:--";
    }
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
      
      {/* Content area with perfect alignment */}
            <div 
        className="w-full flex justify-center"
        style={{ 
          paddingTop: (insets.top || 0) + HEADER_HEIGHT + 16,
          paddingBottom: `calc(90px + ${insets.bottom || 0}px)`, // Más espacio para el bottom nav
          paddingLeft: Math.max(insets.left || 0, 16),
          paddingRight: Math.max(insets.right || 0, 16),
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <div className="w-full max-w-md mx-auto p-4">
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
            <p className="text-runapp-gray mb-4">Completa tu primer entrenamiento para ver tus actividades aquí.</p>
            <div className="text-xs text-runapp-gray mb-6 bg-gray-100 p-3 rounded">
              📱 Debug: Verificando localStorage y Supabase<br/>
              🔍 Si completaste entrenamientos, abre la consola del navegador<br/>
              🔄 Usa "Recargar" si ves errores de conexión
            </div>
            <div className="space-x-2">
              <Button 
                onClick={() => navigate('/train')} 
                className="bg-runapp-purple hover:bg-runapp-deep-purple text-white"
              >
                Ir a entrenar
              </Button>
              <Button 
                onClick={() => {
                  console.log('🔄 Manual reload triggered');
                  loadActivities();
                }}
                variant="outline"
                className="border-runapp-purple text-runapp-purple hover:bg-runapp-light-purple"
              >
                Recargar
              </Button>
            </div>
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

                          <p className="text-white text-2xl font-bold leading-snug whitespace-nowrap font-mono mb-1">{formatDuration(activity.runSession.duration)}</p>
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
      
      <BottomNav />
    </div>
  );
};

export default Activities;
