import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Route, Activity, ChevronLeft, Share2, Heart, MessageCircle } from 'lucide-react';
import { PublishedActivity, WorkoutMetrics } from '@/types';
import { calculateWorkoutMetrics } from '@/services/activityService';
import SimpleMapView from '@/components/SimpleMapView';

interface ActivityDetailsScreenProps {
  activity: PublishedActivity;
  onBack: () => void;
}

const ActivityDetailsScreen: React.FC<ActivityDetailsScreenProps> = ({
  activity,
  onBack
}) => {
  const metrics = calculateWorkoutMetrics(activity.runSession);

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters.toFixed(0)} m`;
    }
    return `${(meters / 1000).toFixed(2)}`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header fijo */}
      <div className="flex-shrink-0 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" onClick={onBack} className="text-runapp-navy">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Volver
          </Button>
          <Button variant="ghost" className="text-runapp-navy">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-runapp-purple rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {activity.userProfile.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-runapp-navy">{activity.userProfile.name}</h3>
            <p className="text-sm text-runapp-gray">{formatDate(activity.publishedAt)}</p>
          </div>
        </div>

        {/* Title and Description */}
        <div>
          <h1 className="text-2xl font-bold text-runapp-navy mb-2">{activity.title}</h1>
          {activity.description && (
            <p className="text-runapp-gray">{activity.description}</p>
          )}
        </div>

        {/* Main Stats */}
        <Card className="bg-gradient-to-r from-runapp-purple to-runapp-deep-purple text-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Route className="w-6 h-6 mx-auto mb-2" />
                <p className="text-3xl font-bold">{formatDistance(metrics.totalDistance)}</p>
                <p className="text-sm opacity-80">Distancia (km)</p>
              </div>
              <div>
                <Clock className="w-6 h-6 mx-auto mb-2" />
                <p className="text-3xl font-bold">{metrics.totalDuration}</p>
                <p className="text-sm opacity-80">Duración</p>
              </div>
              <div>
                <Activity className="w-6 h-6 mx-auto mb-2" />
                <p className="text-3xl font-bold">{metrics.averageSpeed.toFixed(1)}</p>
                <p className="text-sm opacity-80">Velocidad media (km/h)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card>
          <CardHeader>
            <CardTitle className="text-runapp-navy flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Recorrido
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-64 rounded-b-lg overflow-hidden">
              <SimpleMapView 
                points={activity.runSession.gpsPoints} 
                currentLocation={null}
                isTracking={false} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-runapp-navy">Métricas de rendimiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-runapp-light-purple/10 rounded-lg">
                <p className="text-2xl font-bold text-runapp-navy">{metrics.averagePace}</p>
                <p className="text-sm text-runapp-gray">Ritmo medio</p>
                <p className="text-xs text-runapp-gray">min/km</p>
              </div>
              <div className="text-center p-4 bg-runapp-light-purple/10 rounded-lg">
                <p className="text-2xl font-bold text-runapp-navy">{metrics.calories || 0}</p>
                <p className="text-sm text-runapp-gray">Calorías</p>
                <p className="text-xs text-runapp-gray">estimadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Split Times */}
        {metrics.splitTimes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-runapp-navy">Tiempos por kilómetro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.splitTimes.map((split) => (
                  <div key={split.kilometer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-runapp-purple text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {split.kilometer}
                      </div>
                      <span className="font-medium text-runapp-navy">Kilómetro {split.kilometer}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-runapp-navy">{split.pace}</p>
                      <p className="text-sm text-runapp-gray">{split.speed.toFixed(1)} km/h</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Image */}
        {activity.imageUrl && (
          <Card>
            <CardContent className="p-0">
              <img 
                src={activity.imageUrl} 
                alt="Foto del entrenamiento"
                className="w-full h-64 object-cover rounded-lg"
              />
            </CardContent>
          </Card>
        )}

        {/* Social Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-around">
              <Button variant="ghost" className="flex items-center space-x-2 text-runapp-gray">
                <Heart className="w-5 h-5" />
                <span>{activity.likes || 0}</span>
              </Button>
              <Button variant="ghost" className="flex items-center space-x-2 text-runapp-gray">
                <MessageCircle className="w-5 h-5" />
                <span>{activity.comments || 0}</span>
              </Button>
              <Button variant="ghost" className="flex items-center space-x-2 text-runapp-gray">
                <Share2 className="w-5 h-5" />
                <span>Compartir</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivityDetailsScreen;
