
import { useState } from "react";
import BottomNav from "@/components/layout/BottomNav";
import RunButton from "@/components/ui/RunButton";

const Train: React.FC = () => {
  const [time, setTime] = useState<string>("00:00:00");
  const [distance, setDistance] = useState<string>("0.00 km");

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-runapp-purple text-white p-4">
        <h1 className="text-xl font-bold">Entrenamiento</h1>
      </div>
      
      <div className="container max-w-md mx-auto p-4">
        <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <p className="text-sm text-runapp-gray">Tiempo</p>
              <p className="text-2xl font-bold text-runapp-navy">{time}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-runapp-gray">Distancia</p>
              <p className="text-2xl font-bold text-runapp-navy">{distance}</p>
            </div>
          </div>
          
          <div className="flex justify-center my-6">
            <button className="w-20 h-20 rounded-full bg-runapp-purple text-white flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded"></div>
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-runapp-purple">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 2L8 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M14 8L2 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-runapp-navy font-medium">Ruta actual</p>
            </div>
            <p className="text-runapp-gray text-sm">Inicia tu carrera para comenzar el seguimiento</p>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Train;
