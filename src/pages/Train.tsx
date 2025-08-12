import BottomNav from "@/components/layout/BottomNav";
import DarkRunTracker from "@/components/DarkRunTracker";
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
        paddingBottom: Math.max(insets.bottom, 0),
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
