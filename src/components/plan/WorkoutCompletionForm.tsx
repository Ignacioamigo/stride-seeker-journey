import { useState } from "react";
import { Workout } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { saveCompletedWorkout } from "@/services/completedWorkoutService";
import { useStats } from "@/context/StatsContext";

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
  const [actualDistance, setActualDistance] = useState<string>(workout.actualDistance?.toString() || '');
  const [actualDuration, setActualDuration] = useState<string>(workout.actualDuration || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { forceUpdate, updateCounter } = useStats();
  
  const isRestDay = workout.type === 'descanso';
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    console.log("=== INICIANDO SUBMIT DEL FORMULARIO ===");
    console.log("Counter antes del submit:", updateCounter);
    
    setIsSubmitting(true);
    try {
      const distanceValue = actualDistance && actualDistance.trim() ? parseFloat(actualDistance) : null;
      const durationValue = actualDuration && actualDuration.trim() ? actualDuration.trim() : null;
      
      console.log("WorkoutCompletionForm: Guardando entrenamiento:", {
        workoutId: workout.id,
        workoutTitle: workout.title,
        workoutType: workout.type,
        planId,
        distanceValue,
        durationValue
      });
      
      // Guardar en la base de datos
      const savedToNewTable = await saveCompletedWorkout(
        workout.title,
        workout.type,
        distanceValue,
        durationValue
      );

      if (savedToNewTable) {
        console.log("✅ Guardado exitoso en DB");
        
        // Actualizar el estado local del workout
        await onComplete(workout.id, distanceValue, durationValue);
        
        // FORZAR ACTUALIZACIÓN COMPLETA
        console.log("🔄 FORZANDO ACTUALIZACIÓN CON FORCE UPDATE");
        
        setTimeout(() => {
          console.log("🔄 Ejecutando forceUpdate");
          forceUpdate();
          window.dispatchEvent(new CustomEvent('statsUpdated'));
          window.dispatchEvent(new CustomEvent('workoutCompleted'));
        }, 300);
        
        toast({
          title: "🎉 ¡Entrenamiento completado!",
          description: `¡Excelente trabajo! Has completado ${workout.title}`,
          variant: "success" as any,
        });
      } else {
        throw new Error("No se pudieron guardar los datos en la base de datos");
      }
    } catch (error) {
      console.error("❌ Error en handleSubmit:", error);
      
      toast({
        title: "❌ Error al guardar",
        description: "No se pudo guardar el entrenamiento. Revisa tu conexión e inténtalo de nuevo.",
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
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                placeholder="Ej: 5.2"
                value={actualDistance}
                onChange={(e) => {
                  // Solo permitir números, punto y coma
                  const val = e.target.value.replace(/[^0-9.,]/g, "");
                  setActualDistance(val);
                }}
                className="h-8 text-sm"
                style={{ fontSize: 16 }}
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
              style={{ fontSize: 16 }}
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
