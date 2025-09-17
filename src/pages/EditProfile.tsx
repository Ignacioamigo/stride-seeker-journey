import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, ArrowLeft, RotateCcw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const EditProfile: React.FC = () => {
  const { user, updateUser, resetUser } = useUser();
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();
  
  const [name, setName] = useState(user.name || '');
  const [age, setAge] = useState(user.age?.toString() || '');
  const [height, setHeight] = useState(user.height?.toString() || '');
  const [weight, setWeight] = useState(user.weight?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "El nombre es obligatorio",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      updateUser({
        name: name.trim(),
        age: age ? Number(age) : null,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
      });

      toast({
        title: "Perfil actualizado",
        description: "Tus datos se han guardado correctamente",
      });

      navigate("/profile");
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestartOnboarding = () => {
    // Resetear el usuario y redirigir al onboarding
    resetUser();
    toast({
      title: "Onboarding reiniciado",
      description: "Te redirigiremos al proceso de configuración inicial.",
      variant: "default"
    });
    navigate('/welcome');
  };

  return (
    <div 
      className="bg-gray-50 min-h-screen pb-6"
      style={{
        paddingTop: insets.top + 60,
        paddingLeft: Math.max(insets.left, 0),
        paddingRight: Math.max(insets.right, 0),
      }}
    >
      <div 
        className="fixed top-0 left-0 right-0 bg-runapp-purple text-white p-4 flex items-center z-50"
        style={{ paddingTop: insets.top + 16 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 mr-3"
          onClick={() => navigate("/profile")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold">Editar perfil</h1>
      </div>
      
      <div className="container max-w-md mx-auto px-4 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="age">Edad</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Tu edad"
                  min="13"
                  max="100"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Ej: 175"
                  min="100"
                  max="250"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ej: 70"
                  min="30"
                  max="300"
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/profile")}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-runapp-purple hover:bg-runapp-purple/90"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Restart Onboarding Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-orange-700">Configuración avanzada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
              <div className="mb-3">
                <p className="font-medium text-orange-800">Reiniciar configuración inicial</p>
                <p className="text-sm text-orange-600 mt-1">
                  Esto te llevará de vuelta al proceso de configuración inicial. 
                  Podrás cambiar tu perfil, objetivos y preferencias desde cero.
                </p>
              </div>
              <Button 
                onClick={handleRestartOnboarding}
                variant="outline"
                className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reiniciar Onboarding
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile; 