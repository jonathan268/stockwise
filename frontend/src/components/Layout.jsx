import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ArrowLeftRight,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  PackagePlus,
  Menu,
  X,
  Sparkles,
  CreditCard,
  Zap,
  Shield,
  MessageSquare,
  Building2,
} from "lucide-react";
import SubscriptionModal from "./SubscriptionModal";
import FeedbackModal from "./FeedbackModal";
import Toast from "./Toast";
import KeyboardShortcuts from "./KeyboardShortcuts";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Analyses IA", path: "/insights", icon: Sparkles },
  { label: "Produits", path: "/products", icon: Package },
  { label: "Ventes", path: "/sales", icon: ShoppingCart },
  { label: "Fournisseurs", path: "/suppliers", icon: Building2 },
  { label: "Mouvements", path: "/movements", icon: ArrowLeftRight },
  { label: "Alertes", path: "/alerts", icon: Bell },
  { label: "Paramètres", path: "/settings", icon: Settings },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, organization, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSubsModalOpen, setIsSubsModalOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const isSuperAdmin = user?.role === "super_admin";

  // Calcul des jours restants
  const getDaysRemaining = () => {
    const targetDate = organization?.trialEndsAt || organization?.currentPeriodEnd;
    if (!targetDate) return null;
    
    const remaining = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    return remaining > 0 ? remaining : 0;
  };
  
  const daysLeft = getDaysRemaining();

  // Fermer le drawer mobile quand on navigue
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Alertes non lues
  const { data: alertData } = useQuery({
    queryKey: ["alerts-unread-count"],
    queryFn: async () => {
      const res = await axiosInstance.get("/alerts/unread/count");
      return res.data;
    },
    refetchInterval: 30000,
  });
  const unreadAlerts = alertData?.data?.unreadCount || 0;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`;

  /* ── Sidebar Content (shared between desktop & mobile) ── */
  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-6 ${collapsed && !isMobile ? "justify-center" : ""}`}>
        <div className="bg-primary text-primary-content p-2 rounded-xl shrink-0">
          <PackagePlus size={22} strokeWidth={2.5} />
        </div>
        {(!collapsed || isMobile) && (
          <span className="font-display font-black text-lg tracking-tight text-base-content">
            StockWise
          </span>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative
                ${isActive
                  ? "bg-primary text-primary-content shadow-lg shadow-primary/20"
                  : "text-base-content/70 hover:bg-base-content/5 hover:text-base-content"
                }
                ${collapsed && !isMobile ? "justify-center px-3" : ""}
              `}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
              {(!collapsed || isMobile) && <span>{item.label}</span>}

              {/* Badge alertes */}
              {item.path === "/alerts" && unreadAlerts > 0 && (
                <span className={`absolute ${collapsed && !isMobile ? "top-0 right-0" : "right-3"} badge badge-error badge-sm text-error-content font-bold`}>
                  {unreadAlerts > 99 ? "99+" : unreadAlerts}
                </span>
              )}

              {/* Tooltip collapsed */}
              {collapsed && !isMobile && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-base-content text-base-100 text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}

        {/* Console super admin (visible uniquement pour super_admin) */}
        {isSuperAdmin && (
          <NavLink
            to="/console"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative mt-4 border border-warning/20 bg-warning/5
              ${location.pathname === "/console"
                ? "bg-warning text-warning-content"
                : "text-base-content/70 hover:bg-base-content/5 hover:text-base-content"
              }
              ${collapsed && !isMobile ? "justify-center px-3" : ""}
            `}
          >
            <Shield size={20} strokeWidth={2} className="shrink-0" />
            {(!collapsed || isMobile) && <span>Console Admin</span>}

            {collapsed && !isMobile && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-base-content text-base-100 text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
                Console Admin
              </div>
            )}
          </NavLink>
        )}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-2">
        {/* Feedback button */}
        <button
          onClick={() => setIsFeedbackOpen(true)}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base-content/60 hover:bg-base-content/5 hover:text-base-content transition-colors ${collapsed && !isMobile ? "justify-center px-3" : ""}`}
        >
          <MessageSquare size={20} />
          {(!collapsed || isMobile) && <span className="font-medium">Feedback</span>}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base-content/60 hover:bg-base-content/5 hover:text-base-content transition-colors ${collapsed && !isMobile ? "justify-center px-3" : ""}`}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          {(!collapsed || isMobile) && <span className="font-medium">{isDark ? "Mode Clair" : "Mode Sombre"}</span>}
        </button>

        {/* Collapse toggle (desktop only) */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base-content/60 hover:bg-base-content/5 hover:text-base-content transition-colors ${collapsed ? "justify-center px-3" : ""}`}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!collapsed && <span className="font-medium">Réduire</span>}
          </button>
        )}

        {/* User card */}
        <div className={`flex items-center gap-3 p-3 rounded-xl bg-base-content/5 ${collapsed && !isMobile ? "justify-center" : ""}`}>
          <div className="w-10 h-10 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold text-sm shrink-0">
            {initials}
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-base-content truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-base-content/50 truncate">{organization?.name}</p>
            </div>
          )}
          {(!collapsed || isMobile) && (
            <button onClick={handleLogout} className="btn btn-ghost btn-sm btn-circle text-base-content/50 hover:text-error">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-base-100 overflow-hidden">
      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden lg:flex flex-col border-r border-base-content/10 bg-base-100 transition-all duration-300 shrink-0
          ${collapsed ? "w-20" : "w-65"}
        `}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-base-content/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-70 bg-base-100 shadow-2xl z-50">
            <SidebarContent isMobile />
          </aside>
        </div>
      )}

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-base-content/10 flex items-center justify-between px-6 bg-base-100 shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden btn btn-ghost btn-sm btn-circle" onClick={() => setMobileOpen(true)}>
              <Menu size={22} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-base-content leading-tight">{organization?.name || "StockWise"}</h1>
              <div className="flex items-center gap-2">
                 <p className="text-[10px] uppercase font-black tracking-widest text-primary leading-none">{organization?.plan || "Starter"} Plan</p>
                 {daysLeft !== null && (
                   <span className="text-[10px] font-bold text-base-content/40">• {daysLeft} jours</span>
                 )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {organization?.isTrialActive && (
              <button 
                onClick={() => setIsSubsModalOpen(true)}
                className="btn btn-warning btn-xs gap-1 font-bold rounded-lg shadow-sm hover:shadow-md transition-all animate-pulse"
              >
                <Zap size={14} /> Essai 
              </button>
            )}
            {!organization?.isTrialActive && organization?.plan === "starter" && (
                <button 
                  onClick={() => setIsSubsModalOpen(true)}
                  className="btn btn-primary btn-xs gap-1 font-bold rounded-lg"
                >
                  <CreditCard size={14} /> Passer Pro
                </button>
            )}
            
            <NavLink to="/alerts" className="btn btn-ghost btn-sm btn-circle relative">
              <Bell size={20} />
              {unreadAlerts > 0 && (
                <span className="badge badge-error badge-xs absolute -top-1 -right-1 text-[10px]">{unreadAlerts}</span>
              )}
            </NavLink>
          </div>
        </header>

        {/* Subscription Modal */}
        <SubscriptionModal 
          isOpen={isSubsModalOpen} 
          onClose={() => setIsSubsModalOpen(false)} 
        />

        {/* Feedback Modal */}
        <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-base-200/50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <Toast />
      <KeyboardShortcuts />
    </div>
  );
}
