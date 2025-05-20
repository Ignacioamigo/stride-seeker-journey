
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";

const NameQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const [name, setName] = useState(user.name || "");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name });
    navigate("/onboarding/age");
  };

  const isValid = name.trim().length > 0;

  return (
    <div className="min-h-screen pt-16 pb-20 flex flex-col bg-gradient-to-b from-runapp-light-purple/30 to-white">
      <ProgressHeader currentStep={1} totalSteps={10} />
      
      <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-runapp-navy mb-2">RunAdaptive</h1>
          <p className="text-lg text-runapp-gray">Tu entrenador personal para correr</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-runapp-navy mb-6">
            Empecemos por tu nombre
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-runapp-gray mb-1">
                ¿Cómo te llamas?
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-runapp-purple focus:border-transparent"
              />
            </div>
            
            <RunButton type="submit" disabled={!isValid}>
              Siguiente
            </RunButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NameQuestion;
