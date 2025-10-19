import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { App as CapacitorApp } from '@capacitor/app'

// Import Watch Connectivity Service
import './services/watchConnectivityService'
// Import StatusBar Service  
import { statusBarService } from './services/statusBarService';

// 🔥 ESTABILIZACIÓN COORDINADA Y SUAVE
let isInitialStabilization = true;
let stabilizationCount = 0;

const recalculateViewport = () => {
  stabilizationCount++;
  console.log(`🔄 Layout recalculation #${stabilizationCount}${isInitialStabilization ? ' (initial)' : ''}`);
  
  // Durante la primera estabilización, ser más suave
  if (isInitialStabilization) {
    // Solo variables críticas durante el arranque inicial
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Marcar que la inicialización inicial ya pasó
    setTimeout(() => {
      isInitialStabilization = false;
    }, 1000);
    
    console.log('✅ Initial layout stabilization complete');
    return;
  }
  
  // Para recálculos posteriores, usar la lógica completa pero suave
  requestAnimationFrame(() => {
    // 1. Variables del viewport
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // 2. Estabilización selectiva y suave
    const elementsToFix = document.querySelectorAll(
      '[style*="position: fixed"], .fixed, nav, header'
    );
    
    elementsToFix.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.transform = 'translate3d(0, 0, 0)';
        el.style.backfaceVisibility = 'hidden';
        el.style.webkitBackfaceVisibility = 'hidden';
      }
    });
    
    // 3. Un reflow suave
    document.body.offsetHeight;
    
    console.log('✅ Layout stabilization complete');
  });
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

// 🔥 LISTENERS COORDINADOS PARA PREVENIR DESCUADRE
CapacitorApp.addListener('appStateChange', (state) => {
  console.log('📱 App state changed:', state.isActive ? 'ACTIVE' : 'BACKGROUND');
  if (state.isActive && !isInitialStabilization) {
    // Solo un recálculo suave después de la inicialización
    setTimeout(recalculateViewport, 100);
  }
});

// Listeners coordinados para cambios de viewport
window.addEventListener('orientationchange', () => {
  console.log('📱 Orientation changed');
  if (!isInitialStabilization) {
    setTimeout(recalculateViewport, 150); // Un solo recálculo por evento
  }
});

window.addEventListener('resize', () => {
  console.log('📱 Window resized');
  if (!isInitialStabilization) {
    recalculateViewport();
  }
});

// Listener para cuando la página se vuelve visible
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !isInitialStabilization) {
    console.log('📱 Page became visible');
    setTimeout(recalculateViewport, 100);
  }
});

// Listener para iOS específico - cuando la app recupera el foco
window.addEventListener('focus', () => {
  console.log('📱 Window focused');
  if (!isInitialStabilization) {
    setTimeout(recalculateViewport, 50);
  }
});

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
