
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const GenderQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();

  // Calculate header height: safe area + padding + content
  const headerHeight = insets.top + 24 + 32; // safe area + py-3 (12px*2) + estimated content height

  const handleSelect = (gender: 'masculino' | 'femenino' | 'otro') => {
    updateUser({ gender });
    navigate("/onboarding/height");
  };

  const genderOptions = [
    {
      id: 'masculino',
      label: 'Masculino',
      icon: '👨'
    },
    {
      id: 'femenino',
      label: 'Femenino',
      icon: '👩'
    },
    {
      id: 'otro',
      label: 'Otro',
      icon: '👤'
    }
  ];

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
      <ProgressHeader currentStep={3} totalSteps={10} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-runapp-navy mb-6">
            ¿Cuál es tu sexo?
          </h2>
          
          <div className="space-y-3">
            {genderOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id as any)}
                className={`tag-selector ${user.gender === option.id ? 'tag-selector-active' : ''}`}
              >
                <span className="text-xl mr-2">{option.icon}</span>
                <span className="font-medium">{option.label}</span>
                <div className="tag-selector-radio"></div>
              </button>
            ))}

            <div className="mt-6">
              <RunButton
                onClick={() => navigate("/onboarding/height")}
                variant="ghost"
              >
                Prefiero no responder
              </RunButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenderQuestion;
