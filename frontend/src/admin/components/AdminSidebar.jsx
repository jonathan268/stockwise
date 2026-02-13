import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  Settings,
  LogOut,
  Menu,
  Shield,
  BarChart3,
  Bell,
  FileText,
  Database,
  Zap,
  Activity
} from 'lucide-react';

const AdminSidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Utilisateurs' },
    { path: '/admin/subscriptions', icon: CreditCard, label: 'Abonnements' },
    { path: '/admin/organizations', icon: Package, label: 'Organisations' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytiques' },
    { path: '/admin/activity', icon: Activity, label: 'Activité' },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
    { path: '/admin/reports', icon: FileText, label: 'Rapports' },
    { path: '/admin/database', icon: Database, label: 'Base de données' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside 
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-gradient-to-b from-neutral to-neutral-focus text-neutral-content transition-all duration-300 shadow-2xl flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-base-content/20 h-16">
        {isOpen && (
          <div className="flex items-center gap-2">
            <div className="bg-error rounded-lg p-1.5">
              <Shield size={20} className="text-error-content" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Admin Panel</h1>
              <p className="text-xs opacity-70">StockAI SaaS</p>
            </div>
          </div>
        )}
        {!isOpen && (
          <div className="bg-error rounded-lg p-1.5 mx-auto">
            <Shield size={20} className="text-error-content" />
          </div>
        )}
        <button 
          onClick={onToggle}
          className="btn btn-ghost btn-sm btn-circle text-neutral-content"
          title={isOpen ? 'Réduire' : 'Agrandir'}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Admin Badge */}
      {isOpen && (
        <div className="px-4 py-3">
          <div className="alert alert-error shadow-lg">
            <Shield size={16} />
            <span className="text-xs font-semibold">Mode Administrateur</span>
          </div>
        </div>
      )}

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
                ${active 
                  ? 'bg-error text-error-content shadow-lg scale-105' 
                  : 'hover:bg-base-content/10 text-neutral-content'
                }
                ${!isOpen && 'justify-center'}
              `}
              title={!isOpen ? item.label : ''}
            >
              <Icon size={20} />
              {isOpen && <span className="font-medium">{item.label}</span>}
              {active && isOpen && (
                <div className="ml-auto w-2 h-2 rounded-full bg-error-content animate-pulse"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-base-content/20 space-y-2">
        <Link
          to="/admin/settings"
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg transition-all
            ${isActive('/admin/settings')
              ? 'bg-error text-error-content shadow-lg'
              : 'hover:bg-base-content/10 text-neutral-content'
            }
            ${!isOpen && 'justify-center'}
          `}
          title={!isOpen ? 'Paramètres' : ''}
        >
          <Settings size={20} />
          {isOpen && <span className="font-medium">Paramètres</span>}
        </Link>
        
        <button 
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full
            text-error hover:bg-error/10
            ${!isOpen && 'justify-center'}
          `}
          title={!isOpen ? 'Quitter' : ''}
        >
          <LogOut size={20} />
          {isOpen && <span className="font-medium">Quitter Admin</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;