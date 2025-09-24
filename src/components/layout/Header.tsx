import React from "react";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

interface HeaderProps {
  title: string | React.ReactNode;
  subtitle?: string;
  bgColor?: string;
}

const HEADER_HEIGHT = 44;
const RADIUS_TOP = 28;
const RADIUS_BOTTOM = 0;

const Header: React.FC<HeaderProps> = ({ title, subtitle, bgColor = "#1463FF" }) => {
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + HEADER_HEIGHT;
  const [scrolled, setScrolled] = React.useState(false);
  
  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 1);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Asegurar que el header se renderice correctamente
  React.useEffect(() => {
    // Forzar un reflow después del montaje para asegurar posicionamiento correcto
    requestAnimationFrame(() => {
      document.body.offsetHeight;
    });
  }, [insets.top]);

  return (
    <div
      className="no-select"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 100,
        background: bgColor,
        color: "#fff",
        paddingTop: `max(${insets.top}px, env(safe-area-inset-top, 20px))`,
        height: `calc(${HEADER_HEIGHT}px + max(${insets.top}px, env(safe-area-inset-top, 20px)))`,
        minHeight: `calc(${HEADER_HEIGHT}px + max(${insets.top}px, env(safe-area-inset-top, 20px)))`,
        borderTopLeftRadius: RADIUS_TOP,
        borderTopRightRadius: RADIUS_TOP,
        borderBottomLeftRadius: RADIUS_BOTTOM,
        borderBottomRightRadius: RADIUS_BOTTOM,
        boxShadow: scrolled
          ? "0 4px 16px 0 rgba(0,0,0,0.10)"
          : "0 2px 8px 0 rgba(0,0,0,0.03)",
        transition: "box-shadow 0.2s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        // 🔥 MÁXIMA ESTABILIDAD ANTI-DESCUADRE
        willChange: "transform",
        transform: "translate3d(0, 0, 0)",
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
        WebkitTransform: "translate3d(0, 0, 0)",
        contain: "layout style paint",
        // Prevenir cualquier movimiento inesperado
        boxSizing: "border-box",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        // Forzar posición absoluta
        position: "fixed" as const,
        top: "0 !important" as any,
        left: "0 !important" as any,
        right: "0 !important" as any,
      }}
    >
      <h1
        className="no-select"
        style={{
          fontSize: 16,
          fontWeight: 600,
          margin: 0,
          letterSpacing: 0.1,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className="no-select"
          style={{
            fontSize: 12,
            fontWeight: 400,
            opacity: 0.85,
            marginTop: 2,
            marginBottom: 0,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default Header; 