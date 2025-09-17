
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
  const { top, isReady } = useSafeAreaInsets();
  const progress = (currentStep / totalSteps) * 100;
  const safeTop = top || 0;

  if (!isReady) {
    return null; // Don't render until insets are ready
  }

  return (
    <header 
      className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 no-select shadow-sm"
      style={{ 
        paddingTop: safeTop,
        height: safeTop + 64 // safe area + content height
      }}
    >
      <div className="px-4 py-3 flex items-center h-16">
        {showBackButton && (
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors no-select"
          >
            <ArrowLeft size={20} className="no-select" />
          </button>
        )}
        <div className="flex-1 px-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-runapp-purple h-2 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProgressHeader;
