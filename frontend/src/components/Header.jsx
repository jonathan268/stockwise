import React, { useState } from "react";
import {
  Search,
  Bell,
  User,
  Sun,
  Moon,
  Menu,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = ({ onMenuClick }) => {
  const [theme, setTheme] = useState("light");
  const { user, logout, loading } = useAuthContext();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // ─── Helper : initiales de l'utilisateur ──────────────────────────────────
  const getUserInitials = () => {
    if (!user) return "?";
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || user.email?.[0].toUpperCase() || "U";
  };

  // ─── Helper : nom complet ──────────────────────────────────────────────────
  const getUserFullName = () => {
    if (!user) return "Chargement...";
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return user.email || "Utilisateur";
  };

  // ─── Helper : rôle formaté ─────────────────────────────────────────────────
  const getUserRole = () => {
    if (!user) return "";
    const roles = {
      owner: "Propriétaire",
      admin: "Admin",
      manager: "Manager",
      staff: "Employé",
    };
    return roles[user.role] || user.role || "";
  };

  return (
    <header className="sticky top-0 z-10 h-14 md:h-16 shadow-sm bg-base-100">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Menu Button - Desktop Only */}
        <button
          onClick={onMenuClick}
          className="hidden lg:flex btn btn-ghost btn-circle"
          title="Menu"
        >
          <Menu size={20} />
        </button>

        {/* Brand - Mobile Only (shows when sidebar isn't visible) */}
        <div className="lg:hidden flex items-center justify-center font-bold text-lg text-primary">
          StockWise
        </div>

        {/* Search Bar Placeholder */}
        <div className="hidden md:flex items-center flex-1 max-w-2xl gap-4"></div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle"
            title="Changer de thème"
          >
            {theme === "corporate" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Notifications */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <div className="indicator">
                <Bell size={20} />
              </div>
            </label>

            <div
              tabIndex={0}
              className="mt-3 shadow-2xl card card-compact dropdown-content w-80 bg-base-100"
            >
              <div className="card-body">
                <h3 className="mb-3 text-lg font-bold">Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-base-200">
                    <div className="p-2 rounded-lg bg-warning/20">
                      <Bell size={16} className="text-warning" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Stock bas détecté</p>
                      <p className="text-xs text-base-content/60">
                        iPhone 14 Pro - 5 unités restantes
                      </p>
                      <div className="mt-1 text-xs text-base-content/50">
                        Il y a 2h
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-base-200">
                    <div className="p-2 rounded-lg bg-success/20">
                      <Bell size={16} className="text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Commande livrée</p>
                      <p className="text-xs text-base-content/60">
                        Commande #12345 livrée avec succès
                      </p>
                      <p className="mt-1 text-xs text-base-content/50">
                        Il y a 5h
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-base-200">
                    <div className="p-2 rounded-lg bg-info/20">
                      <Bell size={16} className="text-info" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Prédiction IA</p>
                      <p className="text-xs text-base-content/60">
                        Hausse de demande prévue pour les accessoires
                      </p>
                      <p className="mt-1 text-xs text-base-content/50">
                        Il y a 1j
                      </p>
                    </div>
                  </div>
                </div>
                <div className="my-2 divider"></div>
                <button className="w-full btn btn-sm btn-ghost">
                  Voir toutes les notifications
                </button>
              </div>
            </div>
          </div>

          {/* ─── User Menu ──────────────────────────────────────────────────── */}
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="flex items-center gap-2 px-2 btn btn-ghost rounded-xl hover:bg-base-200"
            >
              {/* Avatar : photo Google ou initiales */}
              <div className="avatar placeholder">
                <div className="rounded-full w-9 ring ring-primary ring-offset-base-100 ring-offset-1 bg-primary text-primary-content">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={getUserFullName()}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-sm font-bold">
                      {loading ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        getUserInitials()
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Nom + rôle (masqué sur mobile) */}
              <div className="flex-col items-start hidden leading-tight md:flex">
                <span className="text-sm font-semibold">
                  {getUserFullName()}
                </span>
                {getUserRole() && (
                  <span className="text-xs text-base-content/50">
                    {getUserRole()}
                  </span>
                )}
              </div>

              <ChevronDown
                size={14}
                className="hidden md:block text-base-content/40"
              />
            </label>

            {/* Dropdown menu */}
            <ul
              tabIndex={0}
              className="w-64 p-2 mt-3 border shadow-2xl menu menu-compact dropdown-content bg-base-100 rounded-box border-base-200"
            >
              {/* Infos utilisateur en haut du menu */}
              <li className="px-3 py-3 mb-1 hover:bg-transparent">
                <div className="flex items-center gap-3 cursor-default hover:bg-transparent focus:bg-transparent active:bg-transparent">
                  <div className="avatar placeholder">
                    <div className="w-10 rounded-full bg-primary text-primary-content">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt=""
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="font-bold">{getUserInitials()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {getUserFullName()}
                    </p>
                    <p className="text-xs truncate text-base-content/50">
                      {user?.email}
                    </p>
                    {getUserRole() && (
                      <span className="mt-1 badge badge-primary badge-xs">
                        {getUserRole()}
                      </span>
                    )}
                  </div>
                </div>
              </li>

              <div className="my-0 divider"></div>

              <li>
                <a onClick={() => navigate("/app/settings")} className="gap-3">
                  <User size={16} />
                  Mon Profil
                </a>
              </li>

              <li>
                <a onClick={() => navigate("/app/settings")} className="gap-3">
                  <Settings size={16} />
                  Paramètres
                </a>
              </li>

              <div className="my-0 divider"></div>

              {/* Bouton Déconnexion */}
              <li>
                <button
                  onClick={() => logout()}
                  className="w-full gap-3 font-medium text-left text-error hover:bg-error/10"
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
