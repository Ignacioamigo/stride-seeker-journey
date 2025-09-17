import BottomNav from "@/components/layout/BottomNav";
import DarkRunTracker from "@/components/DarkRunTracker";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const HEADER_HEIGHT = 56;

const Train: React.FC = () => {
  const { top, bottom, left, right, isReady } = useSafeAreaInsets();
  
  // Usar fallbacks seguros cuando isReady es false
  const safeTop = isReady ? (top || 0) : 44;
  const safeBottom = isReady ? (bottom || 0) : 34;
  const safeLeft = isReady ? left : 0;
  const safeRight = isReady ? right : 0;
  
  return (
    <div
      className="bg-gray-50 flex flex-col h-screen overflow-hidden"
      style={{
        paddingTop: safeTop,
        paddingLeft: Math.max(safeLeft, 0),
        paddingRight: Math.max(safeRight, 0),
        paddingBottom: 0, // BottomNav maneja su propio safe area
      }}
    >
      {/* Full screen training interface */}
      <div className="flex-1 relative overflow-hidden">
        <DarkRunTracker />
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Train;
