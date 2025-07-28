import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Workout } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { generateWorkoutFeedback } from "@/components/feedback/WorkoutFeedback";
import { saveCompletedWorkout } from "@/services/completedWorkoutService";

interface WorkoutCompletionFormProps {
  workout: Workout;
  planId: string;
  onComplete: (workoutId: string, actualDistance: number | null, actualDuration: string | null) => Promise<void>;
}

const WorkoutCompletionForm: React.FC<WorkoutCompletionFormProps> = ({ workout, planId, onComplete }) => {
  const [actualDistance, setActualDistance] = useState<string>("");
  const [actualDuration, setActualDuration] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      console.log("🔄 INICIANDO handleSubmit en WorkoutCompletionForm");
      
      const distanceValue = actualDistance ? Number(actualDistance) : null;
      const durationValue = actualDuration || null;
      
      console.log("📊 Valores del entrenamiento:", {
        workoutId: workout.id,
        actualDistance: distanceValue,
        actualDuration: durationValue
      });

      // Save to database first
      const savedToNewTable = await saveCompletedWorkout(
        workout.title,
        workout.type,
        distanceValue,
        durationValue
      );

      if (savedToNewTable) {
        console.log("✅ Guardado exitoso en DB");
        
        // Generate personalized feedback
        const feedback = generateWorkoutFeedback({
          workout,
          actualDistance: distanceValue || undefined,
          actualDuration: durationValue || undefined,
          // TODO: In the future, fetch previous best from database
          previousBestDistance: undefined,
          previousBestTime: undefined
        });
        
        // Show personalized toast with feedback
        toast({
          title: feedback.title,
          description: feedback.description,
          variant: "success" as any,
        });
        
        // Additional toast with achievements if any
        if (feedback.achievements.length > 1) {
          setTimeout(() => {
            toast({
              title: "🏆 Logros adicionales",
              description: feedback.achievements.slice(1).join(" • "),
              variant: "success" as any,
            });
          }, 1500);
        }
        
        // Update the parent component
        await onComplete(workout.id, distanceValue, durationValue);
        
        // Dispatch events for stats updates
        setTimeout(() => {
          console.log("🔄 Ejecutando forceUpdate");
          window.dispatchEvent(new CustomEvent('statsUpdated'));
          window.dispatchEvent(new CustomEvent('workoutCompleted'));
        }, 300);
        
        console.log("✅ Proceso de guardado completado exitosamente");
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

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setActualDistance(value);
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d{1,2}:\d{0,2}$/.test(value)) {
      setActualDuration(value);
    }
  };
  
  if (workout.completed) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-green-700 mb-1">✓ Entrenamiento completado</h4>
            {workout.actualDistance && (
              <p className="text-xs text-green-600">Distancia: {workout.actualDistance} km</p>
            )}
            {workout.actualDuration && (
              <p className="text-xs text-green-600">Duración: {workout.actualDuration}</p>
            )}
          </div>
          <div className="text-2xl">🎉</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <h4 className="text-sm font-medium text-runapp-navy mb-3">Registrar entrenamiento</h4>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="actualDistance" className="text-xs">Distancia recorrida (km)</Label>
          <Input
            type="number"
            id="actualDistance"
            value={actualDistance}
            onChange={handleDistanceChange}
            placeholder={workout.distance ? workout.distance.toString() : "Ej: 5.0"}
            step="0.1"
            min="0"
            className="text-sm"
          />
        </div>
        
        <div>
          <Label htmlFor="actualDuration" className="text-xs">Duración (MM:SS)</Label>
          <Input
            type="text"
            id="actualDuration"
            value={actualDuration}
            onChange={handleDurationChange}
            placeholder={workout.duration || "Ej: 25:30"}
            className="text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Formato: minutos:segundos</p>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            type="submit" 
            disabled={isSubmitting || (!actualDistance && !actualDuration)}
            className="flex-1 bg-runapp-purple hover:bg-runapp-purple/90 text-sm py-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              "Completar Entrenamiento"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WorkoutCompletionForm;
