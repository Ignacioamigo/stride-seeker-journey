import { Calendar, SendIcon, BarChart2, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const BottomNav: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { top, right, bottom, left, isReady } = useSafeAreaInsets();
  
  // No renderizar hasta que los insets estén listos
  if (!isReady) {
    return null;
  }
  
  const insets = { top, right, bottom, left };

  const navItems = [
    { name: "Plan", path: "/plan", icon: Calendar },
    { name: "Entrenar", path: "/train", icon: SendIcon },
    { name: "Estadísticas", path: "/stats", icon: BarChart2 },
    { name: "Perfil", path: "/profile", icon: User }
  ];

  return (
    <div 
      className="no-select"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
        paddingTop: 12,
        paddingBottom: Math.max(insets.bottom + 12, 12),
        paddingLeft: Math.max(insets.left + 24, 24),
        paddingRight: Math.max(insets.right + 24, 24),
        minHeight: 64 + insets.bottom,
        zIndex: 50,
        // Webkit stability fixes for iOS
        willChange: 'transform',
        transform: 'translateZ(0)',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
      }}
    >
      <nav className="flex justify-between items-center no-select">
      {navItems.map((item) => (
        <Link 
          key={item.path} 
          to={item.path} 
          className={`nav-link flex flex-col items-center text-xs no-select ${
            currentPath === item.path ? 'text-runapp-purple' : 'text-gray-500'
          }`}
        >
          <item.icon size={20} className="no-select" />
          <span className="mt-1 no-select">{item.name}</span>
        </Link>
      ))}
      </nav>
    </div>
  );
};

export default BottomNav;
