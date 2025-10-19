import { useSafeAreaInsets } from "./useSafeAreaInsets";
import { usePlatform } from "./usePlatform";

/**
 * Hook para calcular el padding del header de manera consistente
 * entre diferentes plataformas (Android vs iOS)
 */
export function useHeaderPadding() {
  const insets = useSafeAreaInsets();
  const { isAndroid } = usePlatform();
  
  const HEADER_HEIGHT = 44;

  const getHeaderTopPadding = () => {
    if (isAndroid) {
      // Para Android, usar un padding más agresivo que considere el status bar
      // El status bar en Android típicamente es 24dp (aprox 24-48px según densidad)
      const androidStatusBarHeight = 44; // Altura fija más conservadora para Android
      return Math.max(insets.top, androidStatusBarHeight);
    } else {
      // Para iOS y web, mantener la lógica original
      return insets.top || 20;
    }
  };

  const getHeaderHeight = () => {
    if (isAndroid) {
      const androidStatusBarHeight = 44;
      return HEADER_HEIGHT + Math.max(insets.top, androidStatusBarHeight);
    } else {
      return HEADER_HEIGHT + (insets.top || 20);
    }
  };

  const getContentPaddingTop = (extraPadding: number = 20) => {
    const headerPadding = getHeaderTopPadding();
    const totalPadding = HEADER_HEIGHT + headerPadding + extraPadding;
    
    if (isAndroid) {
      return `${totalPadding}px`;
    } else {
      // Para iOS, usar la sintaxis CSS env() para máxima compatibilidad
      return `calc(${HEADER_HEIGHT}px + max(${insets.top}px, env(safe-area-inset-top, 20px)) + ${extraPadding}px)`;
    }
  };

  return {
    getHeaderTopPadding,
    getHeaderHeight,
    getContentPaddingTop,
    isAndroid
  };
}
