import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { App as CapacitorApp } from '@capacitor/app'

// Import Watch Connectivity Service
import './services/watchConnectivityService'

// 🔥 SOLUCIÓN DEFINITIVA ANTI-DESCUADRE - MÁXIMO POTENCIAL
const recalculateViewport = () => {
  console.log('🔄 MÁXIMO POTENCIAL - Recalculando layout...');
  
  // 1. Variables del viewport
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  
  // 2. MÉTODO ULTRA AGRESIVO - Forzar GPU layers en TODO
  const elementsToFix = [
    document.documentElement,
    document.body,
    document.getElementById('root'),
    ...Array.from(document.querySelectorAll('[style*="position: fixed"], .fixed, nav, header'))
  ].filter(Boolean) as HTMLElement[];
  
  elementsToFix.forEach((el, index) => {
    el.style.willChange = 'transform';
    el.style.transform = 'translate3d(0, 0, 0)';
    el.style.backfaceVisibility = 'hidden';
    el.style.webkitBackfaceVisibility = 'hidden';
    
    // Reset escalonado para evitar conflictos
    setTimeout(() => {
      el.style.willChange = '';
      el.style.transform = '';
    }, 50 + (index * 10));
  });
  
  // 3. Múltiples triggers de reflow
  document.body.offsetHeight;
  document.documentElement.offsetHeight;
  window.getComputedStyle(document.body).height;
  
  // 4. Forzar redraw del viewport
  const meta = document.querySelector('meta[name="viewport"]');
  if (meta) {
    const content = meta.getAttribute('content');
    meta.setAttribute('content', content + ', user-scalable=no');
    setTimeout(() => {
      meta.setAttribute('content', content || '');
    }, 50);
  }
  
  console.log('✅ MÁXIMO POTENCIAL - Layout estabilizado');
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

// 🔥 LISTENERS MEJORADOS PARA PREVENIR DESCUADRE
CapacitorApp.addListener('appStateChange', (state) => {
  console.log('📱 App state changed:', state.isActive ? 'ACTIVE' : 'BACKGROUND');
  if (state.isActive) {
    // Múltiples recálculos para asegurar estabilidad
    setTimeout(recalculateViewport, 50);
    setTimeout(recalculateViewport, 200);
    setTimeout(recalculateViewport, 500);
  }
});

// Listeners para cambios de viewport
window.addEventListener('orientationchange', () => {
  console.log('📱 Orientation changed');
  setTimeout(recalculateViewport, 100);
  setTimeout(recalculateViewport, 400);
});

window.addEventListener('resize', () => {
  console.log('📱 Window resized');
  recalculateViewport();
});

// Listener para cuando la página se vuelve visible
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    console.log('📱 Page became visible');
    setTimeout(recalculateViewport, 100);
  }
});

// Listener para iOS específico - cuando la app recupera el foco
window.addEventListener('focus', () => {
  console.log('📱 Window focused');
  setTimeout(recalculateViewport, 50);
});

// Ejecutar recálculo inicial y después de cargar
recalculateViewport();
window.addEventListener('load', recalculateViewport);

createRoot(document.getElementById("root")!).render(<App />);
