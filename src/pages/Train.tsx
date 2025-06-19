import BottomNav from "@/components/layout/BottomNav";
import RunTracker from "@/components/RunTracker";

const Train: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col"
      style={{
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Header sticky y safe area */}
      <header
        className="bg-runapp-purple text-white px-4 pt-2 pb-4"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)",
        }}
      >
        <h1 className="text-xl font-bold">Entrenamiento GPS</h1>
        <p className="text-sm opacity-90">Tracking avanzado con background GPS</p>
      </header>
      
      {/* Main content container */}
      <main className="flex-1 px-4 py-4 flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
          <RunTracker />
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Train;
