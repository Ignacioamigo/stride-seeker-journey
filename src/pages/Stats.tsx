import BottomNav from "@/components/layout/BottomNav";
import WeeklyProgress from "@/components/dashboard/WeeklyProgress";
import RunStats from "@/components/dashboard/RunStats";
import { StatsProvider } from "@/context/StatsContext";
import { useUser } from "@/context/UserContext";
import Header from "@/components/layout/Header";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const HEADER_HEIGHT = 56;

const Stats: React.FC = () => {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  
  return (
    <StatsProvider>
      <div 
        className="bg-gray-50 flex flex-col h-screen overflow-hidden"
        style={{
          paddingTop: insets.top,
          paddingLeft: Math.max(insets.left, 0),
          paddingRight: Math.max(insets.right, 0),
        }}
      >
        <Header title="Estadísticas" subtitle={`Hola, ${user.name} 👋 | Tu progreso semanal y estadísticas`} />
        
        {/* Content area with proper spacing */}
        <div 
          className="flex-1 overflow-y-auto pb-20"
          style={{ 
            paddingTop: HEADER_HEIGHT + 16, // Header height + spacing
          }}
        >
          <div className="container max-w-md mx-auto px-4">
            <WeeklyProgress />
            <RunStats />
          </div>
        </div>
        
        <BottomNav />
      </div>
    </StatsProvider>
  );
};

export default Stats;
