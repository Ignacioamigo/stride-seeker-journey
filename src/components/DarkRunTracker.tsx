import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, MapPin } from 'lucide-react';
import { useSimpleGPSTracker } from '@/hooks/useSimpleGPSTracker';
import SimpleMapView from '@/components/SimpleMapView';

const DarkRunTracker: React.FC = () => {
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
  } = useSimpleGPSTracker();

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters.toFixed(0)} m`;
    }
    return `${(meters / 1000).toFixed(2)}`;
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
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatSpeed = (): string => {
    if (!currentLocation?.speed || currentLocation.speed <= 0) return "0,00";
    return (currentLocation.speed * 3.6).toFixed(2);
  };

  // Mostrar pantalla de permisos solo si fueron explícitamente denegados
  if (permissionGranted === false) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <MapPin className="w-16 h-16 text-green-500 mb-6" />
        <h3 className="text-xl font-semibold mb-4 text-center">
          Permisos de ubicación requeridos
        </h3>
        <p className="text-gray-400 mb-8 text-center">
          Para usar el tracking GPS necesitamos acceso a tu ubicación, incluso en segundo plano.
        </p>
        <Button 
          onClick={async () => {
            console.log('Botón de permisos presionado');
            const result = await requestPermissions();
            console.log('Resultado de requestPermissions:', result);
          }} 
          className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 rounded-full text-lg"
        >
          Habilitar permisos GPS
        </Button>
      </div>
    );
  }

  // PANTALLA 1: Solo mapa + botón INICIAR (antes de empezar a correr)
  if (!isTracking) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        {/* Mapa pantalla completa */}
        <div className="flex-1">
          <SimpleMapView 
            points={runSession?.gpsPoints || []} 
            currentLocation={currentLocation} 
            isTracking={isTracking} 
          />
        </div>

        {/* Botón INICIAR estilo rectangular como en la imagen */}
        <div className="absolute bottom-28 left-4 right-4">
          <Button 
            onClick={startRun}
            className="bg-black hover:bg-gray-800 text-white font-bold w-full h-16 rounded-xl text-xl shadow-lg flex items-center justify-between px-6"
          >
            <div className="flex items-center space-x-3">
              <span>INICIAR EN DIRECTO</span>
            </div>
            <div className="text-sm opacity-75">Running</div>
            <div className="text-2xl">→</div>
          </Button>
        </div>
      </div>
    );
  }

  // PANTALLA 2: Métricas grandes cuando está corriendo
  return (
    <div className="h-full flex flex-col bg-black text-white">
      {/* GPS Status Bar */}
      <div className="bg-runapp-success text-white text-center py-2 font-semibold text-sm">
        SEÑAL GPS ADQUIRIDA
      </div>

      {/* Main Metrics - Pantalla completa con padding seguro */}
      <div className="flex-1 flex flex-col justify-center px-4 py-4 space-y-6">
        {/* Duration - Large Display */}
        <div className="text-center">
          <p className="text-gray-400 text-sm font-medium tracking-wide mb-2">DURACIÓN</p>
          <p className="text-white text-5xl font-light tracking-wider">
            {runSession?.duration || "00:00:00"}
          </p>
        </div>

        <hr className="border-gray-600 mx-6" />

        {/* Speed */}
        <div className="text-center">
          <p className="text-gray-400 text-sm font-medium tracking-wide mb-2">VELOCIDAD MEDIA</p>
          <div className="flex items-end justify-center">
            <span className="text-white text-4xl font-light">
              {formatSpeed()}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">KM/H</p>
        </div>

        <hr className="border-gray-600 mx-6" />

        {/* Distance */}
        <div className="text-center">
          <p className="text-gray-400 text-sm font-medium tracking-wide mb-2">DISTANCIA</p>
          <div className="flex items-end justify-center">
            <span className="text-white text-4xl font-light">
              {runSession ? formatDistance(runSession.distance) : "0"}
            </span>
            <span className="text-white text-2xl font-light ml-2">m</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">KILÓMETROS</p>
        </div>
      </div>

      {/* Control Buttons - Subidos para evitar corte con área inferior */}
      <div className="flex justify-center pb-12 px-4">
        {isPaused ? (
          <div className="flex gap-4">
            <Button 
              onClick={resumeRun}
              className="bg-runapp-purple hover:bg-runapp-deep-purple text-white font-bold w-20 h-20 rounded-full shadow-lg"
            >
              <Play className="w-6 h-6" />
            </Button>
            <Button 
              onClick={finishRun}
              className="bg-runapp-gray hover:bg-gray-600 text-white font-bold w-20 h-20 rounded-full shadow-lg"
            >
              <Square className="w-6 h-6" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Button 
              onClick={pauseRun}
              className="bg-runapp-purple hover:bg-runapp-deep-purple text-white font-bold w-20 h-20 rounded-full shadow-lg"
            >
              <Pause className="w-6 h-6" />
            </Button>
            <Button 
              onClick={finishRun}
              className="bg-runapp-gray hover:bg-gray-600 text-white font-bold w-20 h-20 rounded-full shadow-lg"
            >
              <Square className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>

      {/* Bottom indicator */}
      <div className="pb-2">
        <div className="w-16 h-1 bg-white rounded-full mx-auto"></div>
      </div>
    </div>
  );
};

export default DarkRunTracker;
