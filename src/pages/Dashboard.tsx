import BottomNav from "@/components/layout/BottomNav";
import NextWorkout from "@/components/dashboard/NextWorkout";
import WeeklyProgress from "@/components/dashboard/WeeklyProgress";
import WeeklyPlan from "@/components/dashboard/WeeklyPlan";
import RunStats from "@/components/dashboard/RunStats";
import { StatsProvider } from "@/context/StatsContext";
import { useUser } from "@/context/UserContext";

const Dashboard: React.FC = () => {
  const { user } = useUser();
  return (
    <StatsProvider>
      <div
        className="min-h-screen bg-gray-50 pb-20"
        style={{ paddingTop: "env(safe-area-inset-top, 20px)" }}
      >
        <div
          className="bg-runapp-purple text-white p-4"
          style={{ paddingTop: "env(safe-area-inset-top, 20px)" }}
        >
          <h1 className="text-xl font-bold mb-1">Hello, {user.name} 👋</h1>
          <p className="text-sm opacity-90">
            Your personalized training plan
          </p>
        </div>
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
