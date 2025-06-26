import BottomNav from "@/components/layout/BottomNav";
import RunTracker from "@/components/RunTracker";
import AppHeader from "@/components/layout/AppHeader";
import Header from "@/components/layout/Header";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const HEADER_HEIGHT = 56;

const Train: React.FC = () => {
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + HEADER_HEIGHT;
  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col"
      style={{
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <Header title="Entrenamiento GPS" subtitle="Tracking avanzado con background GPS" />
      {/* Main content container */}
      <main className="flex-1 px-4 py-4 flex flex-col" style={{ paddingTop: headerHeight }}>
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
          <RunTracker />
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Train;
