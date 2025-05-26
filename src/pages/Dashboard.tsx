
import BottomNav from "@/components/layout/BottomNav";
import NextWorkout from "@/components/dashboard/NextWorkout";
import WeeklyProgress from "@/components/dashboard/WeeklyProgress";
import WeeklyPlan from "@/components/dashboard/WeeklyPlan";
import RunStats from "@/components/dashboard/RunStats";
import { StatsProvider } from "@/context/StatsContext";

const Dashboard: React.FC = () => {
  return (
    <StatsProvider>
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="container max-w-md mx-auto p-4">
          <WeeklyProgress />
          <NextWorkout />
          <WeeklyPlan />
          <RunStats />
        </div>
        
        <BottomNav />
      </div>
    </StatsProvider>
  );
};

export default Dashboard;
