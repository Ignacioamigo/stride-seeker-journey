import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { App as CapacitorApp } from '@capacitor/app'

// Import Watch Connectivity Service
import './services/watchConnectivityService'
// Import StatusBar Service  
import { statusBarService } from './services/statusBarService';

// 🔥 ESTABILIZACIÓN COORDINADA Y ANTI-ZOOM
let isInitialStabilization = true;
let stabilizationTimeout: number | null = null;

// Función para forzar el reset del viewport y prevenir zoom
const forceViewportReset = () => {
  // 1. Asegurar que el meta viewport esté correcto
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
  }
  
  // 2. Variables del viewport
  const vh = window.innerHeight * 0.01;
  const vw = window.innerWidth * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  document.documentElement.style.setProperty('--vw', `${vw}px`);
  
  console.log('✅ Viewport reset', { vh: window.innerHeight, vw: window.innerWidth });
};

const recalculateViewport = () => {
  // Cancelar cualquier recálculo pendiente para evitar conflictos
  if (stabilizationTimeout) {
    clearTimeout(stabilizationTimeout);
  }
  
  stabilizationTimeout = window.setTimeout(() => {
    console.log(`🔄 Layout recalculation${isInitialStabilization ? ' (initial)' : ''}`);
    
    requestAnimationFrame(() => {
      forceViewportReset();
      
      // Durante la primera estabilización, marcar como completada
      if (isInitialStabilization) {
        setTimeout(() => {
          isInitialStabilization = false;
          console.log('✅ Initial stabilization complete');
        }, 500);
      }
    });
  }, isInitialStabilization ? 0 : 100); // Sin delay en la inicial, 100ms en las siguientes
};

// Handle iOS deep links for Strava (stride://strava-callback?code=...)
CapacitorApp.addListener('appUrlOpen', ({ url }) => {
  try {
    if (url && url.startsWith('stride://strava-callback')) {
      const query = url.split('?')[1] || ''
      window.location.href = `/settings?${query}`
    }
  } catch {}
})

// 🔥 LISTENERS COORDINADOS PARA PREVENIR DESCUADRE Y ZOOM
CapacitorApp.addListener('appStateChange', (state) => {
  console.log('📱 App state changed:', state.isActive ? 'ACTIVE' : 'BACKGROUND');
  if (state.isActive) {
    // Cuando la app vuelve al foreground, forzar reset del viewport
    forceViewportReset();
    recalculateViewport();
  }
});

// Listener para cambios de orientación
window.addEventListener('orientationchange', () => {
  console.log('📱 Orientation changed');
  forceViewportReset();
  setTimeout(recalculateViewport, 200); // Dar tiempo para que la orientación se complete
});

// Listener para resize (throttled automáticamente por el timeout en recalculateViewport)
let resizeDebounce: number | null = null;
window.addEventListener('resize', () => {
  if (resizeDebounce) clearTimeout(resizeDebounce);
  resizeDebounce = window.setTimeout(() => {
    console.log('📱 Window resized');
    recalculateViewport();
  }, 150);
});

// Listener para cuando la página se vuelve visible
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    console.log('📱 Page became visible');
    forceViewportReset();
    recalculateViewport();
  }
});

// Listener para iOS - cuando la app recupera el foco
window.addEventListener('focus', () => {
  console.log('📱 Window focused');
  forceViewportReset();
});

// Prevenir zoom por double-tap en iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, { passive: false });

// Ejecutar recálculo inicial y después de cargar
recalculateViewport();
window.addEventListener('load', recalculateViewport);

// Detectar Android de forma simple para CSS
if (navigator.userAgent.toLowerCase().includes('android')) {
  document.documentElement.setAttribute('data-android', 'true');
}

// Inicializar StatusBar service para Android/iOS
setTimeout(() => {
  statusBarService.initialize().then(() => {
    console.log('✅ StatusBar service initialized');
  }).catch(err => {
    console.warn('⚠️ StatusBar initialization failed:', err);
  });
}, 500); // Dar tiempo para que Capacitor se inicialice

createRoot(document.getElementById("root")!).render(<App />);
