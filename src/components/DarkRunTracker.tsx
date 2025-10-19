import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, MapPin } from 'lucide-react';
import { useSimpleGPSTracker } from '@/hooks/useSimpleGPSTracker';
import SimpleMapView from '@/components/SimpleMapView';
import WorkoutSummaryScreen from '@/components/training/WorkoutSummaryScreen';
import ActivityDetailsScreen from '@/components/training/ActivityDetailsScreen';
import { publishActivityUltraSimple } from '@/services/ultraSimpleActivityService';
import { WorkoutPublishData, PublishedActivity, RunSession } from '@/types';
import { toast } from '@/hooks/use-toast';

type ScreenState = 'pre-run' | 'running' | 'summary' | 'details';

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
    finishRun: originalFinishRun,
    requestPermissions
  } = useSimpleGPSTracker();

  const [screenState, setScreenState] = useState<ScreenState>('pre-run');
  const [completedSession, setCompletedSession] = useState<RunSession | null>(null);
  const [publishedActivity, setPublishedActivity] = useState<PublishedActivity | null>(null);
  const [trainingSessionId, setTrainingSessionId] = useState<string | null>(null);

  // Leer training_session_id de localStorage al cargar el componente
  useEffect(() => {
    const sessionId = localStorage.getItem('active_training_session_id');
    if (sessionId) {
      setTrainingSessionId(sessionId);
      console.log('🎯 [DARK RUN TRACKER] Training session ID detectado:', sessionId);
      
      toast({
        title: "Entrenamiento del plan",
        description: "Este entrenamiento se vinculará a tu plan automáticamente.",
        duration: 3000,
      });
    }
  }, []);

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters.toFixed(0)} m`;
    }
    return `${(meters / 1000).toFixed(2)}`;
  };

  const formatSpeed = (): string => {
    if (!currentLocation?.speed || currentLocation.speed <= 0) return "0,00";
    return (currentLocation.speed * 3.6).toFixed(2);
  };

  const handleStartRun = () => {
    startRun();
    setScreenState('running');
  };

  const handleFinishRun = () => {
    if (runSession) {
      // Crear una copia completa de la sesión antes de limpiarla
      const sessionCopy: RunSession = {
        ...runSession,
        endTime: new Date(),
        isActive: false
      };
      
      setCompletedSession(sessionCopy);
      originalFinishRun();
      setScreenState('summary');
    }
  };

  const handlePublishActivity = async (workoutData: WorkoutPublishData) => {
    try {
      console.log('🚀 [DARK RUN TRACKER] Publicando actividad con servicio ULTRA SIMPLE...');
      
      // Pasar training_session_id si existe
      const activityId = await publishActivityUltraSimple(workoutData, trainingSessionId);
      
      const publishedActivity: PublishedActivity = {
        id: activityId,
        title: workoutData.title,
        description: workoutData.description,
        imageUrl: workoutData.image ? URL.createObjectURL(workoutData.image) : undefined,
        runSession: workoutData.runSession,
        publishedAt: new Date(),
        isPublic: workoutData.isPublic,
        likes: 0,
        comments: 0,
        userProfile: {
          name: 'Usuario' // This should come from user context
        }
      };
      
      setPublishedActivity(publishedActivity);
      setScreenState('details');
      
      // Limpiar training_session_id después de publicar
      if (trainingSessionId) {
        localStorage.removeItem('active_training_session_id');
        setTrainingSessionId(null);
        console.log('✅ [DARK RUN TRACKER] Training session vinculado y completado');
        
        // Disparar evento para que el plan se actualice
        window.dispatchEvent(new Event('workoutCompleted'));
      }
      
      toast({
        title: "¡Actividad publicada!",
        description: trainingSessionId 
          ? "Tu entrenamiento del plan ha sido completado automáticamente." 
          : "Tu entrenamiento ha sido guardado exitosamente.",
      });
    } catch (error) {
      console.error('Error publishing activity:', error);
      toast({
        title: "Error",
        description: "No se pudo publicar la actividad. Se guardó localmente.",
        variant: "destructive",
      });
    }
  };

  const handleBackFromDetails = () => {
    // Reset to initial state
    setScreenState('pre-run');
    setCompletedSession(null);
    setPublishedActivity(null);
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
          Continuar
        </Button>
      </div>
    );
  }

  // PANTALLA RESUMEN POST-ENTRENAMIENTO (SIN OPCIÓN SALTAR)
  if (screenState === 'summary' && completedSession) {
    return (
      <WorkoutSummaryScreen
        runSession={completedSession}
        onPublish={handlePublishActivity}
      />
    );
  }

  // PANTALLA DETALLES DE ACTIVIDAD
  if (screenState === 'details' && publishedActivity) {
    return (
      <ActivityDetailsScreen
        activity={publishedActivity}
        onBack={handleBackFromDetails}
      />
    );
  }

  // PANTALLA 1: Solo mapa + botón INICIAR (antes de empezar a correr)
  if (screenState === 'pre-run' || !isTracking) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        {/* Mapa pantalla completa */}
        <div className="flex-1">
          <SimpleMapView 
            points={runSession?.gpsPoints || []} 
            currentLocation={currentLocation} 
            isTracking={false} 
          />
        </div>

        {/* Botón INICIAR estilo rectangular como en la imagen */}
        <div className="absolute bottom-8 left-4 right-4">
          <Button 
            onClick={handleStartRun}
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
      <div className="flex justify-center pb-32 px-4">
        {isPaused ? (
          <div className="flex gap-4">
            <Button 
              onClick={resumeRun}
              className="bg-runapp-purple hover:bg-runapp-deep-purple text-white font-bold w-20 h-20 rounded-full shadow-lg"
            >
              <Play className="w-6 h-6" />
            </Button>
            <Button 
              onClick={handleFinishRun}
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
              onClick={handleFinishRun}
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
