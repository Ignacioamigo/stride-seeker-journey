
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

interface ProgressHeaderProps {
  currentStep: number;
  totalSteps: number;
  showBackButton?: boolean;
}

const ProgressHeader: React.FC<ProgressHeaderProps> = ({ 
  currentStep, 
  totalSteps, 
  showBackButton = false 
}) => {
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();
  const progress = (currentStep / totalSteps) * 100;

  return (
    <header 
      className="fixed top-0 left-0 right-0 bg-white z-10 no-select"
      style={{ paddingTop: insets.top }}
    >
      <div className="px-4 py-3 flex items-center">
        {showBackButton && (
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 no-select"
          >
            <ArrowLeft size={20} className="no-select" />
          </button>
        )}
        <div className="w-full px-4">
          <div className="progress-bar no-select">
            <div className="progress-value no-select" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProgressHeader;
