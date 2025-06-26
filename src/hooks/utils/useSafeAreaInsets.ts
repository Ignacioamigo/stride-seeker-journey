import { useMemo } from "react";

/**
 * Hook para obtener los insets seguros usando CSS env() en web (iOS notch).
 * Devuelve { top, right, bottom, left } en px.
 */
export function useSafeAreaInsets() {
  // Solo funciona en navegador
  const getInset = (name: string) => {
    if (typeof window === "undefined") return 0;
    // Crea un elemento temporal para leer el valor de env()
    const el = document.createElement("div");
    el.style.cssText = `position: absolute; visibility: hidden; top: 0; left: 0; width: 0; height: 0; padding-top: env(${name}, 0px);`;
    document.body.appendChild(el);
    const computed = window.getComputedStyle(el).paddingTop;
    document.body.removeChild(el);
    return parseInt(computed) || 0;
  };

  return useMemo(
    () => ({
      top: getInset("safe-area-inset-top"),
      right: getInset("safe-area-inset-right"),
      bottom: getInset("safe-area-inset-bottom"),
      left: getInset("safe-area-inset-left"),
    }),
    []
  );
} 