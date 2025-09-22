
import React from 'react';
import BottomNav from "@/components/layout/BottomNav";
import DocumentUploader from "@/components/training/DocumentUploader";

const Admin: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-runapp-purple text-white p-4">
        <h1 className="text-xl font-bold mb-1">Administración</h1>
        <p className="text-sm opacity-90">Gestión de documentos para entrenamiento</p>
      </div>
      
      <div className="container max-w-md mx-auto p-4">
        <DocumentUploader />
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Admin;
