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
      className="fixed bottom-0 left-0 right-0 flex justify-between items-center bg-white border-t border-gray-200 z-50 no-select"
      style={{
        paddingTop: 12,
        paddingBottom: `max(${insets.bottom}px + 12px, calc(env(safe-area-inset-bottom, 0px) + 12px))`,
        paddingLeft: Math.max(insets.left + 24, 24),
        paddingRight: Math.max(insets.right + 24, 24),
        minHeight: `calc(64px + ${insets.bottom}px)`,
        background: 'white',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
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
