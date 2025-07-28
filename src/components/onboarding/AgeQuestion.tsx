
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const AgeQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const [age, setAge] = useState(user.age || "");
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();

  // Calculate header height: safe area + padding + content
  const headerHeight = insets.top + 24 + 32; // safe area + py-3 (12px*2) + estimated content height

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ age: Number(age) });
    navigate("/onboarding/gender");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) <= 120)) {
      setAge(value);
    }
  };

  const isValid = age !== "" && Number(age) > 0;

  return (
    <div 
      className="min-h-screen flex flex-col bg-gradient-to-b from-runapp-light-purple/30 to-white"
      style={{
        paddingTop: headerHeight,
        paddingBottom: insets.bottom + 80, // safe area + space for content
        paddingLeft: Math.max(insets.left, 16),
        paddingRight: Math.max(insets.right, 16),
      }}
    >
      <ProgressHeader currentStep={2} totalSteps={10} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-runapp-navy mb-2">
            ¿Cuál es tu fecha de nacimiento?
          </h2>
          <p className="text-runapp-gray mb-6">Queremos personalizar tu plan</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-runapp-gray mb-1">
                Edad
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="age"
                  value={age}
                  onChange={handleChange}
                  placeholder="Tu edad"
                  min="1"
                  max="120"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-runapp-purple focus:border-transparent"
                />
                <span className="ml-2 text-runapp-gray">años</span>
              </div>
            </div>
            
            <RunButton type="submit" disabled={!isValid}>
              Continuar
            </RunButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgeQuestion;
