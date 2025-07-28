import React from 'react';
import { WorkoutPlan, Workout } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, TrendingUp, Calendar, Clock, MapPin } from 'lucide-react';

interface WeeklyFeedbackProps {
  isOpen: boolean;
  onClose: () => void;
  plan: WorkoutPlan;
  onGenerateNextWeek: () => void;
}

interface WeeklyStats {
  completedWorkouts: number;
  totalWorkouts: number;
  totalDistance: number;
  totalDuration: number; // in minutes
  completionRate: number;
  consistency: number; // days in a row
  improvements: string[];
  achievements: string[];
}

const WeeklyFeedback: React.FC<WeeklyFeedbackProps> = ({
  isOpen,
  onClose,
  plan,
  onGenerateNextWeek
}) => {
  
  const calculateWeeklyStats = (): WeeklyStats => {
    const workouts = plan.workouts.filter(w => w.type !== 'descanso');
    const completedWorkouts = workouts.filter(w => w.completed);
    const totalWorkouts = workouts.length;
    
    const totalDistance = completedWorkouts.reduce((sum, w) => {
      return sum + (w.actualDistance || 0);
    }, 0);
    
    const totalDuration = completedWorkouts.reduce((sum, w) => {
      if (w.actualDuration) {
        const [minutes, seconds] = w.actualDuration.split(':').map(Number);
        return sum + minutes + (seconds / 60);
      }
      return sum;
    }, 0);
    
    const completionRate = totalWorkouts > 0 ? (completedWorkouts.length / totalWorkouts) * 100 : 0;
    
    // Calculate consistency (simplified)
    const consistency = completedWorkouts.length;
    
    // Generate improvements based on performance
    const improvements = [];
    if (completionRate >= 80) {
      improvements.push("¡Excelente consistencia esta semana!");
    }
    if (totalDistance > 10) {
      improvements.push("Has corrido una distancia impresionante");
    }
    if (completedWorkouts.length >= 3) {
      improvements.push("Tu disciplina está mejorando notablemente");
    }
    
    // Generate achievements
    const achievements = [];
    if (completionRate === 100) {
      achievements.push("🏆 Semana perfecta - 100% completada");
    }
    if (totalDistance >= 15) {
      achievements.push("🏃‍♂️ Maratonista - Más de 15km esta semana");
    }
    if (completedWorkouts.length >= 4) {
      achievements.push("💪 Guerrero del fitness - 4+ entrenamientos");
    }
    if (consistency >= 3) {
      achievements.push("🔥 Racha de fuego - 3+ días seguidos");
    }
    
    return {
      completedWorkouts: completedWorkouts.length,
      totalWorkouts,
      totalDistance,
      totalDuration,
      completionRate,
      consistency,
      improvements,
      achievements
    };
  };

  const stats = calculateWeeklyStats();

  const getMotivationalMessage = () => {
    if (stats.completionRate >= 90) {
      return "¡Increíble! Has tenido una semana excepcional. Tu dedicación es inspiradora.";
    } else if (stats.completionRate >= 70) {
      return "¡Muy bien! Has mantenido un buen ritmo esta semana. Sigue así.";
    } else if (stats.completionRate >= 50) {
      return "Buen trabajo esta semana. Cada entrenamiento cuenta para tu progreso.";
    } else if (stats.completionRate >= 25) {
      return "Has dado algunos pasos importantes esta semana. ¡La próxima semana será aún mejor!";
    } else {
      return "No te preocupes, todos tenemos semanas difíciles. Lo importante es volver a empezar.";
    }
  };

  const getEncouragementText = () => {
    if (stats.completionRate >= 80) {
      return "Estás en una excelente racha. ¡Mantén este momentum!";
    } else {
      return "Recuerda: el progreso no siempre es lineal. ¡La próxima semana es una nueva oportunidad!";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-runapp-navy">
            📊 Resumen Semanal
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Motivational Message */}
          <Card className="bg-gradient-to-r from-runapp-purple/10 to-runapp-light-purple/10">
            <CardContent className="pt-4">
              <p className="text-sm text-center text-runapp-navy font-medium">
                {getMotivationalMessage()}
              </p>
            </CardContent>
          </Card>

          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Target className="h-4 w-4 mr-1 text-runapp-purple" />
                  Completado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-runapp-navy">
                  {stats.completedWorkouts}/{stats.totalWorkouts}
                </div>
                <Progress value={stats.completionRate} className="mt-2" />
                <p className="text-xs text-gray-500 mt-1">{stats.completionRate.toFixed(0)}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-green-600" />
                  Distancia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-runapp-navy">
                  {stats.totalDistance.toFixed(1)} km
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Total recorrida
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-blue-600" />
                  Tiempo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-runapp-navy">
                  {Math.round(stats.totalDuration)}min
                </div>
                <p className="text-xs text-gray-500">Entrenando</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1 text-orange-600" />
                  Racha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-runapp-navy">
                  {stats.consistency} días
                </div>
                <p className="text-xs text-gray-500">Consistencia</p>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          {stats.achievements.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Trophy className="h-4 w-4 mr-1 text-yellow-600" />
                  Logros Desbloqueados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center p-2 bg-yellow-50 rounded-lg">
                      <span className="text-sm text-runapp-navy">{achievement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Improvements */}
          {stats.improvements.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">✨ Lo que has mejorado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {stats.improvements.map((improvement, index) => (
                    <p key={index} className="text-sm text-runapp-gray">
                      • {improvement}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Encouragement */}
          <Card className="bg-runapp-light-purple/20">
            <CardContent className="pt-4">
              <p className="text-sm text-center text-runapp-navy">
                {getEncouragementText()}
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Revisar Plan
            </Button>
            <Button 
              onClick={() => {
                onGenerateNextWeek();
                onClose();
              }}
              className="flex-1 bg-runapp-purple hover:bg-runapp-purple/90"
            >
              Próxima Semana
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyFeedback; 