/**
 * Fix directo para Android que se ejecuta vía JavaScript
 * Este es el último recurso para forzar el layout correcto
 */

export const forceAndroidLayout = () => {
  if (typeof window === 'undefined') return;

  const isAndroid = navigator.userAgent.toLowerCase().includes('android') ||
                   (window.Capacitor?.getPlatform?.() === 'android');

  if (!isAndroid) return;

  console.log('🤖 Forcing Android layout via JavaScript...');

  // 1. Forzar padding en headers fixed
  const fixedHeaders = document.querySelectorAll('div[style*="position: fixed"][style*="top: 0"]');
  fixedHeaders.forEach(header => {
    const element = header as HTMLElement;
    element.style.paddingTop = '56px';
    element.style.minHeight = '100px';
    element.style.height = 'auto';
    console.log('🔧 Fixed header padding:', element);
  });

  // 2. Forzar padding en contenido
  const contentDivs = document.querySelectorAll('div[style*="paddingTop"]');
  contentDivs.forEach(content => {
    const element = content as HTMLElement;
    if (element.style.paddingTop.includes('calc')) {
      element.style.paddingTop = '120px';
      console.log('🔧 Fixed content padding:', element);
    }
  });

  // 3. Agregar clases de backup
  document.documentElement.setAttribute('data-platform', 'android');
  document.body.classList.add('android-platform');

  // 4. Observer para cambios dinámicos
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Re-aplicar fixes a elementos nuevos
        setTimeout(() => forceAndroidLayout(), 100);
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('✅ Android layout forced via JavaScript');
};

// Ejecutar cuando el DOM esté listo
export const initAndroidLayoutFix = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceAndroidLayout);
  } else {
    forceAndroidLayout();
  }

  // También ejecutar en intervalos para asegurar
  setInterval(forceAndroidLayout, 2000);
};
