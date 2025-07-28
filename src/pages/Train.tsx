import BottomNav from "@/components/layout/BottomNav";
import RunTracker from "@/components/RunTracker";
import AppHeader from "@/components/layout/AppHeader";
import Header from "@/components/layout/Header";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const HEADER_HEIGHT = 56;

const Train: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <div
      className="bg-gray-50 flex flex-col h-screen overflow-hidden"
      style={{
        paddingTop: insets.top,
        paddingLeft: Math.max(insets.left, 0),
        paddingRight: Math.max(insets.right, 0),
      }}
    >
      <Header title="Entrenamiento GPS" subtitle="Tracking avanzado con background GPS" />
      
      {/* Main content container - centered and contained */}
      <main 
        className="flex-1 flex flex-col justify-center px-4 pb-20"
        style={{ 
          paddingTop: HEADER_HEIGHT + 16, // Header height + spacing
        }}
      >
        <div className="max-w-md mx-auto w-full">
          <RunTracker />
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Train;
