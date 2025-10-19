import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Servicio para manejar el Status Bar de manera específica por plataforma
 * Especialmente importante para Android donde necesitamos control preciso
 */
class StatusBarService {
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      // Verificar si StatusBar está disponible (solo en dispositivos nativos)
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
        
        // Configurar para Android
        if (window.Capacitor.getPlatform() === 'android') {
          await StatusBar.setStyle({
            style: Style.Dark
          });

          await StatusBar.setBackgroundColor({
            color: '#1463FF'
          });

          // Asegurar que el WebView no se superponga al status bar
          await StatusBar.setOverlaysWebView({
            overlay: false
          });

          console.log('📱 StatusBar configurado para Android');
        }
        
        // Configurar para iOS
        else if (window.Capacitor.getPlatform() === 'ios') {
          await StatusBar.setStyle({
            style: Style.Light // Texto blanco para header azul
          });

          console.log('📱 StatusBar configurado para iOS');
        }

        this.initialized = true;
      }
    } catch (error) {
      console.warn('⚠️ Error inicializando StatusBar:', error);
    }
  }

  async setHeaderStyle(headerColor: string = '#1463FF') {
    try {
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
        
        if (window.Capacitor.getPlatform() === 'android') {
          await StatusBar.setBackgroundColor({
            color: headerColor
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ Error configurando header style:', error);
    }
  }

  async hide() {
    try {
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
        await StatusBar.hide();
      }
    } catch (error) {
      console.warn('⚠️ Error ocultando StatusBar:', error);
    }
  }

  async show() {
    try {
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
        await StatusBar.show();
      }
    } catch (error) {
      console.warn('⚠️ Error mostrando StatusBar:', error);
    }
  }
}

export const statusBarService = new StatusBarService();
