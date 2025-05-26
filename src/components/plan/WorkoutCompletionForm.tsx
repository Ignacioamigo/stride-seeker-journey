
import { useState } from "react";
import { Workout } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WorkoutCompletionFormProps {
  workout: Workout;
  planId: string;
  onComplete: (workoutId: string, actualDistance: number | null, actualDuration: string | null) => Promise<void>;
  onStatsUpdate?: () => void; // Nueva prop para actualizar estadísticas
}

const WorkoutCompletionForm: React.FC<WorkoutCompletionFormProps> = ({ 
  workout, 
  planId, 
  onComplete,
  onStatsUpdate
}) => {
  const [actualDistance, setActualDistance] = useState<string>(workout.actualDistance?.toString() || '');
  const [actualDuration, setActualDuration] = useState<string>(workout.actualDuration || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Para entrenamientos de descanso, no necesitamos recopilar datos
  const isRestDay = workout.type === 'descanso';
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    setIsSubmitting(true);
    try {
      // Conversión de tipos para la distancia
      const distanceValue = actualDistance && actualDistance.trim() ? parseFloat(actualDistance) : null;
      const durationValue = actualDuration && actualDuration.trim() ? actualDuration.trim() : null;
      
      console.log("WorkoutCompletionForm: Enviando datos:", {
        workoutId: workout.id,
        planId,
        distanceValue,
        durationValue
      });
      
      await onComplete(workout.id, distanceValue, durationValue);
      
      // Actualizar estadísticas después de completar el entrenamiento
      if (onStatsUpdate) {
        onStatsUpdate();
      }
      
      toast({
        title: "¡Entrenamiento completado!",
        description: "Los datos se han guardado correctamente y las estadísticas se han actualizado.",
      });
    } catch (error) {
      console.error("WorkoutCompletionForm: Error al guardar:", error);
      
      toast({
        title: "Error",
        description: "No se pudieron guardar los datos del entrenamiento. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (workout.completed) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-green-700 mb-2">✓ Entrenamiento completado</h4>
        {workout.actualDistance && (
          <p className="text-xs text-runapp-gray">Distancia: {workout.actualDistance} km</p>
        )}
        {workout.actualDuration && (
          <p className="text-xs text-runapp-gray">Duración: {workout.actualDuration}</p>
        )}
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-gray-100">
      <h4 className="text-sm font-medium text-runapp-navy mb-3">Completar entrenamiento</h4>
      
      {isRestDay ? (
        <p className="text-xs text-runapp-gray mb-3">Este es un día de descanso. Simplemente marca como completado.</p>
      ) : (
        <>
          {workout.type === 'carrera' && (
            <div className="mb-3">
              <label htmlFor="actualDistance" className="block text-xs text-runapp-gray mb-1">
                Distancia recorrida (km)
              </label>
              <Input
                id="actualDistance"
                type="number"
                step="0.01"
                placeholder="Ej: 5.2"
                value={actualDistance}
                onChange={(e) => setActualDistance(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          )}
          
          <div className="mb-3">
            <label htmlFor="actualDuration" className="block text-xs text-runapp-gray mb-1">
              Duración (ej: 45min)
            </label>
            <Input
              id="actualDuration"
              type="text"
              placeholder="Ej: 45min"
              value={actualDuration}
              onChange={(e) => setActualDuration(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </>
      )}
      
      <Button 
        type="submit" 
        className="w-full bg-runapp-purple hover:bg-runapp-purple/90 text-sm h-9"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          "Marcar como completado"
        )}
      </Button>
    </form>
  );
};

export default WorkoutCompletionForm;
