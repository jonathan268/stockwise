import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Package,
  ShoppingCart,
  AlertTriangle,
  Activity,
  Settings,
  LogOut,
  Menu,
  TrendingUp,
  Clock,
} from "lucide-react";

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();

  const menuItems = [
    { path: "/app/dashboard", icon: BarChart3, label: "Tableau de bord" },
    { path: "/app/inventaire", icon: Package, label: "Inventaire" },
    { path: "/app/commande", icon: ShoppingCart, label: "Commandes" },
    { path: "/app/alerts", icon: AlertTriangle, label: "Alertes" },
    { path: "/app/analytics", icon: Activity, label: "Analytiques IA" },
    { path: "/app/suppliers", icon: TrendingUp, label: "Fournisseurs" },
    { path: "/app/history", icon: Clock, label: "Historique" },
  ];
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Backdrop/Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-40 bg-base-100 shadow-xl flex flex-col transition-all duration-300 ${
          isOpen
            ? "w-64 translate-x-0"
            : "-translate-x-full lg:translate-x-0 lg:w-20"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300 h-16">
          {isOpen && (
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-1.5">
                <TrendingUp size={20} className="text-primary-content" />
              </div>
              <h1 className="text-xl font-bold text-primary">StockWise</h1>
            </div>
          )}
          {!isOpen && (
            <div className="bg-primary rounded-lg p-1.5 mx-auto">
              <TrendingUp size={20} className="text-primary-content" />
            </div>
          )}
          <button
            onClick={onToggle}
            className="btn btn-ghost btn-sm btn-circle"
            title={isOpen ? "Réduire" : "Agrandir"}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${
                  active
                    ? "bg-primary text-primary-content shadow-lg"
                    : "hover:bg-base-200 text-base-content"
                }
                ${!isOpen && "justify-center"}
              `}
                title={!isOpen ? item.label : ""}
              >
                <Icon size={20} />
                {isOpen && <span className="font-medium">{item.label}</span>}
                {active && isOpen && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-content"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-base-300 space-y-2">
          <Link
            to="/settings"
            className={`
            flex items-center gap-3 px-4 py-3 rounded-lg transition-all
            ${
              isActive("/settings")
                ? "bg-primary text-primary-content shadow-lg"
                : "hover:bg-base-200 text-base-content"
            }
            ${!isOpen && "justify-center"}
          `}
            title={!isOpen ? "Paramètres" : ""}
          >
            <Settings size={20} />
            {isOpen && <span className="font-medium">Paramètres</span>}
          </Link>

          <button
            className={`
            flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full
            text-error hover:bg-error/10
            ${!isOpen && "justify-center"}
          `}
            title={!isOpen ? "Déconnexion" : ""}
          >
            <LogOut size={20} />
            {isOpen && <span className="font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
