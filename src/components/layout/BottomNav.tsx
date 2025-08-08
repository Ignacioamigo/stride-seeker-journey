import { Calendar, SendIcon, BarChart2, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const BottomNav: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const insets = useSafeAreaInsets();

  const navItems = [
    { name: "Plan", path: "/plan", icon: Calendar },
    { name: "Entrenar", path: "/train", icon: SendIcon },
    { name: "Estadísticas", path: "/stats", icon: BarChart2 },
    { name: "Perfil", path: "/profile", icon: User }
  ];

  return (
    <nav 
      className="fixed bottom-0 w-full flex justify-between items-center bg-white border-t border-gray-200 px-6 z-50 no-select"
      style={{
        paddingTop: '12px', // 3 en Tailwind (12px)
        paddingBottom: Math.max(insets.bottom + 8, 12), // Safe area + extra padding, mínimo 12px
        paddingLeft: Math.max(insets.left + 24, 24), // px-6 (24px) + safe area
        paddingRight: Math.max(insets.right + 24, 24), // px-6 (24px) + safe area
      }}
    >
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
  );
};

export default BottomNav;
