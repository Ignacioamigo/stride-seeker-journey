import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Square, MapPin, Clock, Route, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useBackgroundGPSTracker } from '@/hooks/useBackgroundGPSTracker';
import SimpleMapView from '@/components/SimpleMapView';

const RunTracker: React.FC = () => {
  const {
    runSession,
    isTracking,
    isPaused,
    currentLocation,
    permissionGranted,
    startRun,
    pauseRun,
    resumeRun,
    finishRun,
    requestPermissions
  } = useBackgroundGPSTracker();

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters.toFixed(0)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatPace = (): string => {
    if (!runSession || runSession.distance === 0) return "--:--";
    
    const durationParts = runSession.duration.split(':');
    const totalMinutes = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]) + parseInt(durationParts[2]) / 60;
    const kmDistance = runSession.distance / 1000;
    
    if (kmDistance === 0) return "--:--";
    
    const paceMinutes = totalMinutes / kmDistance;
    const minutes = Math.floor(paceMinutes);
    const seconds = Math.floor((paceMinutes - minutes) * 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
  };

  if (!permissionGranted) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <MapPin className="w-12 h-12 text-runapp-purple mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-runapp-navy mb-2">
            Permisos de ubicación requeridos
          </h3>
          <p className="text-runapp-gray mb-4">
            Para usar el tracking GPS necesitamos acceso a tu ubicación, incluso en segundo plano.
          </p>
          <Button onClick={requestPermissions} className="bg-runapp-purple w-full">
            Habilitar permisos GPS
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* Mapa en vivo */}
      <SimpleMapView 
        points={runSession?.gpsPoints || []} 
        currentLocation={currentLocation} 
        isTracking={isTracking} 
      />

      {/* Estado del GPS */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-runapp-purple" />
          <span className="text-sm font-medium text-runapp-navy">
            GPS {isTracking ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        {isTracking && (
          <Badge variant="secondary" className="bg-green-500 text-white">
            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
            {isPaused ? 'Pausado' : 'Tracking'}
          </Badge>
        )}
      </div>

      {/* Métricas principales */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-runapp-gray flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Tiempo
              </p>
              <p className="text-2xl font-bold text-runapp-navy">
                {runSession?.duration || "00:00:00"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-runapp-gray flex items-center gap-1 justify-end">
                <Route className="w-4 h-4" />
                Distancia
              </p>
              <p className="text-2xl font-bold text-runapp-navy">
                {runSession ? formatDistance(runSession.distance) : "0.00 km"}
              </p>
            </div>
          </div>

          {/* Pace y puntos GPS */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-runapp-gray">Pace promedio</p>
              <p className="text-lg font-semibold text-runapp-navy">
                {formatPace()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-runapp-gray">Puntos GPS</p>
              <p className="text-lg font-semibold text-runapp-navy">
                {runSession?.gpsPoints.length || 0}
              </p>
            </div>
          </div>
          
          {/* Controles principales */}
          <div className="flex justify-center gap-4">
            {!isTracking ? (
              <Button 
                onClick={startRun}
                className="bg-runapp-purple hover:bg-runapp-purple/90 w-16 h-16 rounded-full"
              >
                <Play className="w-6 h-6" />
              </Button>
            ) : isPaused ? (
              <Button 
                onClick={resumeRun}
                className="bg-runapp-purple hover:bg-runapp-purple/90 w-16 h-16 rounded-full"
              >
                <Play className="w-6 h-6" />
              </Button>
            ) : (
              <Button 
                onClick={pauseRun}
                className="bg-runapp-purple hover:bg-runapp-purple/90 w-16 h-16 rounded-full"
              >
                <Pause className="w-6 h-6" />
              </Button>
            )}
            
            {isTracking && (
              <Button 
                onClick={finishRun}
                variant="outline"
                className="w-16 h-16 rounded-full border-2"
              >
                <Square className="w-6 h-6" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ubicación actual */}
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-runapp-purple" />
            <p className="text-runapp-navy font-medium">Ubicación actual</p>
          </div>
          {currentLocation ? (
            <div className="text-sm text-runapp-gray space-y-1">
              <p>Lat: {currentLocation.latitude.toFixed(6)}</p>
              <p>Lng: {currentLocation.longitude.toFixed(6)}</p>
              {currentLocation.accuracy && (
                <p>Precisión: ±{currentLocation.accuracy.toFixed(0)}m</p>
              )}
              {currentLocation.speed && currentLocation.speed > 0 && (
                <p>Velocidad: {(currentLocation.speed * 3.6).toFixed(1)} km/h</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-runapp-gray">
              {isTracking ? "Obteniendo ubicación..." : "Inicia el tracking para ver tu ubicación"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RunTracker;
