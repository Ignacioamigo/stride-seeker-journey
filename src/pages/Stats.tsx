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
  const headerHeight = insets.top + HEADER_HEIGHT;
  return (
    <StatsProvider>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Estadísticas" subtitle={`Hola, ${user.name} 👋 | Tu progreso semanal y estadísticas`} />
        <div className="container max-w-md mx-auto p-4" style={{ paddingTop: headerHeight }}>
          <WeeklyProgress />
          <RunStats />
        </div>
        <BottomNav />
      </div>
    </StatsProvider>
  );
};

export default Stats;
