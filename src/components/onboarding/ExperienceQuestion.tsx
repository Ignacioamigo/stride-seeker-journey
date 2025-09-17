
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";

const ExperienceQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();

  const handleSelect = (level: 'principiante' | 'intermedio' | 'avanzado') => {
    updateUser({ experienceLevel: level });
    navigate("/onboarding/injuries");
  };

  const experienceLevels = [
    {
      id: 'principiante',
      label: 'Principiante',
      description: 'Nunca he corrido o apenas estoy empezando',
      icon: '🌱'
    },
    {
      id: 'intermedio',
      label: 'Intermedio',
      description: 'He corrido con regularidad por varios meses',
      icon: '🏃'
    },
    {
      id: 'avanzado',
      label: 'Avanzado',
      description: 'Llevo años corriendo y/o he participado en carreras',
      icon: '🏆'
    }
  ];

  return (
    <div className="min-h-screen pt-16 pb-20 flex flex-col bg-gradient-to-b from-runapp-light-purple/30 to-white">
      <ProgressHeader currentStep={10} totalSteps={10} />

      <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-runapp-navy mb-6">
            ¿Cuál es tu nivel de experiencia?
          </h2>
          
          <div className="space-y-3">
            {experienceLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => handleSelect(level.id as any)}
                className={`tag-selector ${user.experienceLevel === level.id ? 'tag-selector-active' : ''}`}
              >
                <div className="flex flex-col items-start">
                  <div className="flex items-center mb-1">
                    <span className="text-xl mr-2">{level.icon}</span>
                    <span className="font-medium">{level.label}</span>
                  </div>
                  <span className="text-sm text-runapp-gray">{level.description}</span>
                </div>
                <div className="tag-selector-radio"></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceQuestion;
