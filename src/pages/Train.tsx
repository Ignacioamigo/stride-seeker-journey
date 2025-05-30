
import { useEffect } from "react";
import BottomNav from "@/components/layout/BottomNav";
import { useGPSTracker } from "@/hooks/useGPSTracker";
import { Button } from "@/components/ui/button";
import { Play, Square, MapPin, Clock, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Train: React.FC = () => {
  const {
    workoutSession,
    isTracking,
    currentLocation,
    permissionGranted,
    startTracking,
    stopTracking,
    requestLocationPermission
  } = useGPSTracker();

  // Solicitar permisos al cargar la página
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters.toFixed(0)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatPace = (): string => {
    if (!workoutSession || workoutSession.distance === 0) return "--:--";
    
    const durationParts = workoutSession.duration.split(':');
    const totalMinutes = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]) + parseInt(durationParts[2]) / 60;
    const kmDistance = workoutSession.distance / 1000;
    
    if (kmDistance === 0) return "--:--";
    
    const paceMinutes = totalMinutes / kmDistance;
    const minutes = Math.floor(paceMinutes);
    const seconds = Math.floor((paceMinutes - minutes) * 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-runapp-purple text-white p-4">
        <h1 className="text-xl font-bold">Entrenamiento GPS</h1>
        <div className="flex items-center gap-2 mt-2">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">
            {permissionGranted ? "GPS habilitado" : "GPS deshabilitado"}
          </span>
          {isTracking && (
            <Badge variant="secondary" className="bg-green-500 text-white">
              <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
              Tracking activo
            </Badge>
          )}
        </div>
      </div>
      
      <div className="container max-w-md mx-auto p-4">
        {/* Métricas principales */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-runapp-gray flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Tiempo
              </p>
              <p className="text-2xl font-bold text-runapp-navy">
                {workoutSession?.duration || "00:00:00"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-runapp-gray flex items-center gap-1 justify-end">
                <Route className="w-4 h-4" />
                Distancia
              </p>
              <p className="text-2xl font-bold text-runapp-navy">
                {workoutSession ? formatDistance(workoutSession.distance) : "0.00 km"}
              </p>
            </div>
          </div>

          {/* Métricas adicionales */}
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
                {workoutSession?.gpsPoints.length || 0}
              </p>
            </div>
          </div>
          
          {/* Botón de control principal */}
          <div className="flex justify-center my-6">
            {!isTracking ? (
              <Button
                onClick={startTracking}
                disabled={!permissionGranted}
                className="w-20 h-20 rounded-full bg-runapp-purple hover:bg-runapp-purple/90 text-white flex items-center justify-center"
              >
                <Play className="w-8 h-8" />
              </Button>
            ) : (
              <Button
                onClick={stopTracking}
                className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
              >
                <Square className="w-6 h-6" />
              </Button>
            )}
          </div>

          {/* Información de ubicación actual */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-runapp-purple" />
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
          </div>

          {/* Información adicional */}
          {!permissionGranted && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Necesitas habilitar los permisos de ubicación para usar el tracking GPS.
              </p>
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={requestLocationPermission}
                  variant="outline"
                  size="sm"
                >
                  Habilitar GPS
                </Button>
                <Button
                  onClick={() => window.location.href = '/permissions'}
                  variant="outline"
                  size="sm"
                  className="text-runapp-purple"
                >
                  Configurar permisos
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas de la sesión */}
        {workoutSession && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-runapp-navy mb-3">Estadísticas de la sesión</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-runapp-gray">Tiempo transcurrido</p>
                <p className="font-medium">{workoutSession.duration}</p>
              </div>
              <div>
                <p className="text-runapp-gray">Distancia total</p>
                <p className="font-medium">{formatDistance(workoutSession.distance)}</p>
              </div>
              <div>
                <p className="text-runapp-gray">Pace actual</p>
                <p className="font-medium">{formatPace()}</p>
              </div>
              <div>
                <p className="text-runapp-gray">Estado</p>
                <p className="font-medium text-green-600">
                  {isTracking ? "Activo" : "Detenido"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Train;
