import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, MapPin, Clock, Route, Activity, ChevronRight, Share } from 'lucide-react';
import { RunSession, WorkoutPublishData } from '@/types';
import { useSafeAreaInsets } from '@/hooks/utils/useSafeAreaInsets';
import { supabase } from '@/integrations/supabase/client';

interface WorkoutSummaryScreenProps {
  runSession: RunSession;
  onPublish: (workoutData: WorkoutPublishData) => void;
  publishedActivityId?: string; // ID of the published activity for Strava upload
}

const WorkoutSummaryScreen: React.FC<WorkoutSummaryScreenProps> = ({
  runSession,
  onPublish,
  publishedActivityId
}) => {
  const [title, setTitle] = useState('Mi carrera matutina');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string>('');
  const [isUploadingToStrava, setIsUploadingToStrava] = useState(false);
  const [stravaUploadStatus, setStravaUploadStatus] = useState<string>('');
  const [showStravaButton, setShowStravaButton] = useState(false);
  const insets = useSafeAreaInsets();

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters.toFixed(0)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const calculateAverageSpeed = (): string => {
    if (!runSession || runSession.distance === 0) return "--,--";
    const durationParts = runSession.duration.split(':');
    const totalMinutes = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]) + parseInt(durationParts[2]) / 60;
    const kmDistance = runSession.distance / 1000;
    if (totalMinutes === 0) return "--,--";
    const speed = (kmDistance / totalMinutes) * 60; // km/h
    return speed.toFixed(1);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    if (isPublishing) return; // Prevent double-click
    setIsPublishing(true);
    setPublishStatus('Guardando actividad...');
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      const workoutData: WorkoutPublishData = { title, description, image: image || undefined, runSession, isPublic };
      await onPublish(workoutData);
      setPublishStatus('Actividad publicada');
      
      // Check if user has Strava connected
      checkStravaConnection();
    } catch (error) {
      console.error('Error publishing:', error);
      setPublishStatus('Error al publicar');
      setIsPublishing(false);
    }
  };

  const checkStravaConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: tokenData } = await supabase
        .from('strava_connections')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (tokenData) {
        setShowStravaButton(true);
      }
    } catch (error) {
      console.error('Error checking Strava connection:', error);
    }
  };

  const handleUploadToStrava = async () => {
    if (!publishedActivityId || isUploadingToStrava) return;
    
    setIsUploadingToStrava(true);
    setStravaUploadStatus('Subiendo a Strava...');
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error('No access token');
      }

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/strava-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          activityId: publishedActivityId,
          title,
          description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload to Strava');
      }

      const result = await response.json();
      setStravaUploadStatus('¡Subido a Strava exitosamente!');
      setShowStravaButton(false); // Hide button after successful upload
      
    } catch (error) {
      console.error('Error uploading to Strava:', error);
      setStravaUploadStatus('Error al subir a Strava');
    } finally {
      setIsUploadingToStrava(false);
      setTimeout(() => setStravaUploadStatus(''), 3000);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50" style={{ paddingTop: Math.max(insets.top, 0) }}>
      {/* Header fijo con botón */}
      <div className="flex-shrink-0 bg-gray-50 px-4 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-runapp-navy mb-4">¡Entrenamiento completado!</h1>
        {/* BOTÓN PRINCIPAL ARRIBA */}
        <Button
          onClick={handlePublish}
          disabled={isPublishing}
          className={`w-full font-semibold py-4 text-lg rounded-full transition-all ${
            isPublishing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-runapp-deep-purple hover:bg-runapp-purple'
          } text-white`}
        >
          {isPublishing ? (
            <>
              <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              {publishStatus}
            </>
          ) : (
            <>
              <MapPin className="w-5 h-5 mr-2" />
              Publicar actividad
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {/* Quick Stats Card */}
        <Card className="mb-6 bg-gradient-to-r from-runapp-purple to-runapp-deep-purple text-white rounded-2xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center mb-2">
                  <Route className="w-5 h-5 mr-1" />
                </div>
                <p className="text-2xl font-bold">{formatDistance(runSession.distance)}</p>
                <p className="text-sm opacity-80">Distancia</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 mr-1" />
                </div>
                <p className="text-2xl font-bold">{runSession.duration}</p>
                <p className="text-sm opacity-80">Duración</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-2">
                  <Activity className="w-5 h-5 mr-1" />
                </div>
                <p className="text-2xl font-bold">{calculateAverageSpeed()}</p>
                <p className="text-sm opacity-80">km/h medio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workout Details Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-runapp-navy">Detalles del entrenamiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-runapp-navy mb-2">Título</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Carrera matutina por el parque" className="w-full text-base form-input" style={{ fontSize: '16px' }} />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-runapp-navy mb-2">Descripción (opcional)</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="¿Cómo te sentiste? ¿Alguna observación especial?" rows={3} className="w-full text-base resize-none form-input" style={{ fontSize: '16px' }} />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-runapp-navy mb-2">Añadir foto (opcional)</label>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" id="camera-upload" />
                  <label htmlFor="camera-upload" className="flex-1 flex items-center justify-center p-3 border-2 border-dashed border-runapp-purple rounded-lg cursor-pointer hover:bg-runapp-light-purple/20 transition-colors">
                    <Camera className="w-5 h-5 text-runapp-purple mr-2" />
                    <span className="text-sm font-medium text-runapp-purple">Tomar foto</span>
                  </label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="gallery-upload" />
                  <label htmlFor="gallery-upload" className="flex-1 flex items-center justify-center p-3 border-2 border-dashed border-runapp-purple rounded-lg cursor-pointer hover:bg-runapp-light-purple/20 transition-colors">
                    <svg className="w-5 h-5 text-runapp-purple mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-sm font-medium text-runapp-purple">Del álbum</span>
                  </label>
                </div>
                {imagePreview && (
                  <div className="mt-3">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                    <Button variant="ghost" size="sm" onClick={() => { setImage(null); setImagePreview(null); }} className="mt-2 text-runapp-purple hover:text-runapp-deep-purple">Quitar imagen</Button>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy Setting */}
            <div className="flex items-center justify-between p-4 bg-runapp-light-purple/10 rounded-lg">
              <div>
                <p className="font-medium text-runapp-navy">Hacer público</p>
                <p className="text-sm text-runapp-gray">Otros usuarios podrán ver tu entrenamiento</p>
              </div>
              <button onClick={() => setIsPublic(!isPublic)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublic ? 'bg-runapp-purple' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Botón de publicar también al final */}
        <div className="mt-6 space-y-3">
          <Button onClick={handlePublish} disabled={isPublishing} className={`w-full font-semibold py-4 text-lg rounded-full transition-all ${isPublishing ? 'bg-gray-400 cursor-not-allowed' : 'bg-runapp-deep-purple hover:bg-runapp-purple'} text-white`}>
            {isPublishing ? (
              <>
                <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                {publishStatus}
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5 mr-2" />
                Publicar actividad
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          {/* Strava Upload Button */}
          {showStravaButton && (
            <Button 
              onClick={handleUploadToStrava} 
              disabled={isUploadingToStrava}
              className={`w-full font-semibold py-4 text-lg rounded-full transition-all border-2 ${
                isUploadingToStrava 
                  ? 'bg-gray-400 border-gray-400 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600 border-orange-500'
              } text-white`}
            >
              {isUploadingToStrava ? (
                <>
                  <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {stravaUploadStatus}
                </>
              ) : (
                <>
                  <Share className="w-5 h-5 mr-2" />
                  Subir a Strava
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          )}

          {/* Status Message */}
          {stravaUploadStatus && !isUploadingToStrava && (
            <div className={`text-center text-sm font-medium ${
              stravaUploadStatus.includes('exitosamente') ? 'text-green-600' : 'text-red-600'
            }`}>
              {stravaUploadStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutSummaryScreen;
