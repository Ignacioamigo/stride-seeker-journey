
import { Home, Calendar, SendIcon, BarChart2, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomNav: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: "Inicio", path: "/dashboard", icon: Home },
    { name: "Plan", path: "/plan", icon: Calendar },
    { name: "Entrenar", path: "/train", icon: SendIcon },
    { name: "Estadísticas", path: "/stats", icon: BarChart2 },
    { name: "Perfil", path: "/profile", icon: User }
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <Link 
          key={item.path} 
          to={item.path} 
          className={`nav-item ${currentPath === item.path ? "active" : ""}`}
        >
          <item.icon size={20} />
          <span className="mt-1">{item.name}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
