import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useSafeAreaInsets } from '@/hooks/utils/useSafeAreaInsets';

interface DebugInfo {
  timestamp: string;
  userState: any;
  safeAreaInsets: any;
  location: string;
  errors: any[];
}

const DebugOnboarding: React.FC = () => {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [debugInfo, setDebugInfo] = useState<DebugInfo[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const newDebugInfo: DebugInfo = {
      timestamp: new Date().toISOString(),
      userState: { ...user },
      safeAreaInsets: { ...insets },
      location: window.location.pathname,
      errors: JSON.parse(localStorage.getItem('app_error_logs') || '[]')
    };

    setDebugInfo(prev => [...prev.slice(-9), newDebugInfo]); // Keep last 10 entries

    // Log to console for debugging
    console.log('🔍 DEBUG ONBOARDING:', newDebugInfo);
  }, [user, insets, window.location.pathname]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-[9999] bg-red-500 text-white p-2 rounded-full text-xs"
        style={{ fontSize: '10px' }}
      >
        🐛
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold">🔍 Debug Onboarding</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Current State */}
          <div>
            <h4 className="font-semibold mb-2">📊 Estado Actual</h4>
            <div className="bg-gray-100 p-3 rounded text-xs">
              <div><strong>Ubicación:</strong> {window.location.pathname}</div>
              <div><strong>Onboarding Completado:</strong> {user.completedOnboarding ? '✅ Sí' : '❌ No'}</div>
              <div><strong>Safe Area Ready:</strong> {insets.isReady ? '✅ Sí' : '❌ No'}</div>
              <div><strong>Safe Area Insets:</strong> {JSON.stringify({
                top: insets.top,
                bottom: insets.bottom,
                left: insets.left,
                right: insets.right
              })}</div>
            </div>
          </div>

          {/* User Data */}
          <div>
            <h4 className="font-semibold mb-2">👤 Datos Usuario</h4>
            <div className="bg-gray-100 p-3 rounded text-xs max-h-32 overflow-auto">
              <pre>{JSON.stringify(user, null, 2)}</pre>
            </div>
          </div>

          {/* Error Logs */}
          <div>
            <h4 className="font-semibold mb-2">🚨 Logs de Errores</h4>
            <div className="bg-red-50 p-3 rounded text-xs max-h-40 overflow-auto">
              {debugInfo[debugInfo.length - 1]?.errors?.length > 0 ? (
                debugInfo[debugInfo.length - 1].errors.map((error, index) => (
                  <div key={index} className="mb-2 p-2 bg-red-100 rounded">
                    <div><strong>Tiempo:</strong> {error.timestamp}</div>
                    <div><strong>Error:</strong> {error.error}</div>
                    <div><strong>URL:</strong> {error.url}</div>
                  </div>
                ))
              ) : (
                <div className="text-green-600">✅ No hay errores registrados</div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            >
              🔄 Reset Completo
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('app_error_logs');
                console.log('Error logs cleared');
              }}
              className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
            >
              🧹 Limpiar Logs
            </button>
            <button
              onClick={() => {
                console.log('Current debug info:', debugInfo);
                navigator.clipboard?.writeText(JSON.stringify(debugInfo, null, 2));
              }}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
              📋 Copiar Debug
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugOnboarding;
