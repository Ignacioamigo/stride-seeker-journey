
import BottomNav from "@/components/layout/BottomNav";
import RunTracker from "@/components/RunTracker";

const Train: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-runapp-purple text-white p-4">
        <h1 className="text-xl font-bold">Entrenamiento GPS</h1>
        <p className="text-sm opacity-90">Tracking avanzado con background GPS</p>
      </div>
      
      <div className="container max-w-md mx-auto p-4">
        <RunTracker />
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Train;
