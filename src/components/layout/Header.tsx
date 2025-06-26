import React from "react";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

interface HeaderProps {
  title: string;
  subtitle?: string;
  bgColor?: string;
}

const HEADER_HEIGHT = 56;
const RADIUS_TOP = 32;
const RADIUS_BOTTOM = 24;

const Header: React.FC<HeaderProps> = ({ title, subtitle, bgColor = "#B58CF4" }) => {
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + HEADER_HEIGHT;
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 1);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: bgColor,
        color: "#fff",
        paddingTop: insets.top,
        height: headerHeight,
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
        minHeight: 64,
      }}
    >
      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          margin: 0,
          letterSpacing: 0.1,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontSize: 14,
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