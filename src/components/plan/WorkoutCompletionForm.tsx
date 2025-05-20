import { useState } from 'react';
import { Workout } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RunButton from '@/components/ui/RunButton';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface WorkoutCompletionFormProps {
  workout: Workout;
  planId: string;
  onComplete: (workoutId: string, actualDistance: number | null, actualDuration: string | null) => Promise<void>;
}

const WorkoutCompletionForm: React.FC<WorkoutCompletionFormProps> = ({ 
  workout, 
  planId,
  onComplete 
}) => {
  const [actualDistance, setActualDistance] = useState<string>(
    workout.actualDistance ? workout.actualDistance.toString() : ''
  );
  const [actualDuration, setActualDuration] = useState<string>(
    workout.actualDuration || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      // Convert distance to number or null
      const distanceValue = actualDistance.trim() !== '' ? parseFloat(actualDistance) : null;
      
      // Keep duration as string or null
      const durationValue = actualDuration.trim() !== '' ? actualDuration : null;
      
      await onComplete(workout.id, distanceValue, durationValue);
      
      toast({
        title: "¡Entrenamiento completado!",
        description: "Los resultados han sido registrados correctamente.",
      });
    } catch (error) {
      console.error("Error al registrar el entrenamiento:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los resultados.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (workout.completed) {
    return (
      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100 flex items-center">
        <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
        <div className="text-sm text-green-800">
          <p className="font-medium">¡Entrenamiento completado!</p>
          {workout.actualDistance && (
            <p>Distancia: {workout.actualDistance} km</p>
          )}
          {workout.actualDuration && (
            <p>Duración: {workout.actualDuration}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="font-medium text-runapp-navy mb-3">Registrar resultados</h4>
      
      {workout.type !== 'descanso' && (
        <>
          <div className="space-y-4 mb-4">
            {workout.distance !== null && (
              <div>
                <Label htmlFor="actual-distance" className="text-sm">
                  Distancia real (km)
                </Label>
                <Input 
                  id="actual-distance"
                  type="number"
                  step="0.01"
                  placeholder={workout.distance?.toString()}
                  value={actualDistance}
                  onChange={(e) => setActualDistance(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
            
            {workout.duration && (
              <div>
                <Label htmlFor="actual-duration" className="text-sm">
                  Duración real
                </Label>
                <Input 
                  id="actual-duration"
                  placeholder={workout.duration}
                  value={actualDuration}
                  onChange={(e) => setActualDuration(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </>
      )}
      
      <RunButton 
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          "Marcar como completado"
        )}
      </RunButton>
    </form>
  );
};

export default WorkoutCompletionForm;
