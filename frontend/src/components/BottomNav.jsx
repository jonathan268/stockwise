import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Package,
  ShoppingCart,
  AlertTriangle,
  Sparkles,
  User,
  TrendingUp
} from "lucide-react";

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/app/dashboard", icon: BarChart3, label: "Accueil" },
    { path: "/app/inventaire", icon: Package, label: "Stocks" },
    { path: "/app/alerts", icon: AlertTriangle, label: "Alertes" },
    { path: "/app/commande", icon: ShoppingCart, label: "Achats" },
    { path: "/app/analytics", icon: Sparkles, label: "IA" },
    { path: "/app/suppliers", icon: TrendingUp, label: "Fournisseurs" },
    { path: "/app/settings", icon: User, label: "Profil" },

  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 border-t shadow-2xl bg-base-100 border-base-300 lg:hidden pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200 ${active ? "text-primary" : "text-base-content/50 hover:text-base-content/80"
              }`}
          >
            <div className={`relative flex items-center justify-center ${active ? "scale-110 mb-0.5" : ""}`}>
              <Icon size={active ? 22 : 20} strokeWidth={active ? 2.5 : 2} />
              {active && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </div>
            <span className={`text-[10px] font-medium leading-none ${active ? "font-bold" : ""}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
