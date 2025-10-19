import React, { useState, useEffect } from 'react';
import { usePlatform } from '@/hooks/utils/usePlatform';
import { useSafeAreaInsets } from '@/hooks/utils/useSafeAreaInsets';
import { useHeaderPadding } from '@/hooks/utils/useHeaderPadding';

/**
 * Componente de debug para verificar el layout en Android
 * Solo se muestra en desarrollo y en Android
 */
const AndroidLayoutDebug: React.FC = () => {
  const { platform, isAndroid, isNative } = usePlatform();
  const insets = useSafeAreaInsets();
  const { getHeaderTopPadding, getHeaderHeight } = useHeaderPadding();
  const [showDebug, setShowDebug] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>({});

  useEffect(() => {
    // Solo mostrar en desarrollo y si hay problemas
    const isDev = import.meta.env.DEV;
    setShowDebug(isDev && isAndroid);

    // Recopilar información del dispositivo
    if (typeof window !== 'undefined') {
      setDeviceInfo({
        userAgent: navigator.userAgent,
        innerHeight: window.innerHeight,
        innerWidth: window.innerWidth,
        screenHeight: window.screen?.height,
        screenWidth: window.screen?.width,
        devicePixelRatio: window.devicePixelRatio,
        capacitorPlatform: window.Capacitor?.getPlatform?.(),
        capacitorNative: window.Capacitor?.isNativePlatform?.(),
      });
    }
  }, [isAndroid]);

  if (!showDebug) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: 10,
        borderRadius: 8,
        fontSize: 12,
        maxWidth: 300,
        zIndex: 9999,
        fontFamily: 'monospace'
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
        🔍 Android Layout Debug
      </div>
      
      <div><strong>Platform:</strong> {platform}</div>
      <div><strong>Is Native:</strong> {isNative ? 'Yes' : 'No'}</div>
      <div><strong>Is Android:</strong> {isAndroid ? 'Yes' : 'No'}</div>
      
      <div style={{ marginTop: 8 }}>
        <strong>Safe Area Insets:</strong>
        <div>Top: {insets.top}px</div>
        <div>Bottom: {insets.bottom}px</div>
        <div>Left: {insets.left}px</div>
        <div>Right: {insets.right}px</div>
      </div>

      <div style={{ marginTop: 8 }}>
        <strong>Header Calculations:</strong>
        <div>Top Padding: {getHeaderTopPadding()}px</div>
        <div>Header Height: {getHeaderHeight()}px</div>
      </div>

      <div style={{ marginTop: 8 }}>
        <strong>Viewport:</strong>
        <div>Inner: {deviceInfo.innerWidth}x{deviceInfo.innerHeight}</div>
        <div>Screen: {deviceInfo.screenWidth}x{deviceInfo.screenHeight}</div>
        <div>DPR: {deviceInfo.devicePixelRatio}</div>
      </div>

      <div style={{ marginTop: 8 }}>
        <strong>Capacitor:</strong>
        <div>Platform: {deviceInfo.capacitorPlatform || 'N/A'}</div>
        <div>Native: {deviceInfo.capacitorNative ? 'Yes' : 'No'}</div>
      </div>

      <div style={{ marginTop: 8 }}>
        <strong>CSS Detection:</strong>
        <div>data-platform: {document.documentElement.getAttribute('data-platform')}</div>
        <div>android-platform class: {document.body.classList.contains('android-platform') ? 'Yes' : 'No'}</div>
      </div>

      <div style={{ marginTop: 8 }}>
        <strong>Applied Classes:</strong>
        <div>Header classes: {document.querySelector('.android-header-force')?.className || 'None'}</div>
        <div>Content classes: {document.querySelector('.android-content-force')?.className || 'None'}</div>
      </div>

      <button 
        onClick={() => setShowDebug(false)}
        style={{
          marginTop: 8,
          padding: '4px 8px',
          background: '#1463FF',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          fontSize: 11
        }}
      >
        Close Debug
      </button>
    </div>
  );
};

export default AndroidLayoutDebug;
