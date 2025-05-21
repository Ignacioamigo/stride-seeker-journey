
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/layout/BottomNav";
import { useUser } from "@/context/UserContext";
import { toast } from "@/components/ui/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RefreshCw, User, CalendarDays, Activity, Goal, Award, AlertTriangle } from "lucide-react";

const Profile = () => {
  const { user, resetUser } = useUser();
  const navigate = useNavigate();
  
  const handleResetOnboarding = () => {
    resetUser();
    toast({
      title: "Perfil reiniciado",
      description: "Se ha reiniciado tu perfil. Serás redirigido al formulario inicial.",
    });
    navigate("/");
  };

  // Formatear información del perfil
  const userDetails = [
    { icon: <User className="h-4 w-4" />, label: "Nombre", value: user.name || "No especificado" },
    { icon: <CalendarDays className="h-4 w-4" />, label: "Edad", value: user.age ? `${user.age} años` : "No especificada" },
    { icon: <Activity className="h-4 w-4" />, label: "Nivel", value: user.experienceLevel ? 
      (user.experienceLevel === "principiante" ? "Principiante" : 
       user.experienceLevel === "intermedio" ? "Intermedio" : "Avanzado") 
      : "No especificado" },
    { icon: <Goal className="h-4 w-4" />, label: "Objetivo", value: user.goal || "No especificado" },
    { icon: <Award className="h-4 w-4" />, label: "Experiencia", value: user.weeklyWorkouts ? 
      `${user.weeklyWorkouts} entrenamientos semanales` : "No especificada" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-runapp-purple text-white p-4">
        <h1 className="text-xl font-bold">Mi Perfil</h1>
      </div>
      
      <div className="container max-w-md mx-auto p-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Información personal</CardTitle>
            <CardDescription>Estos datos se usan para personalizar tu entrenamiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userDetails.map((detail, index) => (
                <div key={index} className="flex items-center">
                  <div className="mr-3 text-runapp-purple">{detail.icon}</div>
                  <div>
                    <div className="text-sm text-gray-500">{detail.label}</div>
                    <div className="font-medium">{detail.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/edit-profile")}
            >
              Editar perfil
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="mb-4 border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-amber-800">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
              Reiniciar formulario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 text-sm">
              Esto eliminará tu perfil actual y te llevará al formulario de inicio como nuevo usuario.
            </p>
          </CardContent>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-100">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reiniciar formulario de onboarding
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará todos tus datos de perfil y tendrás que completar
                    nuevamente el proceso de onboarding. Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetOnboarding} className="bg-red-500 hover:bg-red-600">
                    Sí, reiniciar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Profile;
