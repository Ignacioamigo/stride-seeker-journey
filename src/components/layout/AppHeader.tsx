import React from "react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, subtitle, children }) => {
  return (
    <header
      className="bg-runapp-purple text-white px-4"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)",
        paddingBottom: "16px",
        borderBottomLeftRadius: "18px",
        borderBottomRightRadius: "18px",
        minHeight: 64,
        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.03)",
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <h1 className="text-xl font-bold" style={{ margin: 0 }}>{title}</h1>
        {subtitle && <p className="text-sm opacity-90 mt-1">{subtitle}</p>}
        {children}
      </div>
    </header>
  );
};

export default AppHeader; 