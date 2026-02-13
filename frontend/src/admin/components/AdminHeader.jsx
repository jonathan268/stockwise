import React, { useState } from 'react';
import { Search, Bell, User, Shield, Server, Activity, AlertTriangle } from 'lucide-react';

const AdminHeader = ({ onMenuClick }) => {
  const [systemStatus, setSystemStatus] = useState({
    api: 'operational',
    database: 'operational',
    cache: 'degraded',
  });

  const getStatusColor = (status) => {
    if (status === 'operational') return 'badge-success';
    if (status === 'degraded') return 'badge-warning';
    return 'badge-error';
  };

  const getStatusText = (status) => {
    if (status === 'operational') return 'Opérationnel';
    if (status === 'degraded') return 'Dégradé';
    return 'Hors ligne';
  };

  return (
    <header className="bg-base-100 shadow-md sticky top-0 z-10 h-16 border-b-2 border-error">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section - System Status */}
        <div className="flex items-center gap-4">
          <div className="badge badge-error badge-lg gap-2">
            <Shield size={16} />
            ADMIN
          </div>
          
          <div className="hidden lg:flex items-center gap-2">
            <div className="dropdown dropdown-hover">
              <label tabIndex={0} className="btn btn-ghost btn-sm gap-2">
                <Server size={16} />
                Statut Système
              </label>
              <div tabIndex={0} className="dropdown-content card card-compact w-64 p-2 shadow-2xl bg-base-100 z-50">
                <div className="card-body">
                  <h3 className="font-bold mb-2">État des Services</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API</span>
                      <div className={`badge ${getStatusColor(systemStatus.api)} badge-sm`}>
                        {getStatusText(systemStatus.api)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Base de données</span>
                      <div className={`badge ${getStatusColor(systemStatus.database)} badge-sm`}>
                        {getStatusText(systemStatus.database)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cache</span>
                      <div className={`badge ${getStatusColor(systemStatus.cache)} badge-sm`}>
                        {getStatusText(systemStatus.cache)}
                      </div>
                    </div>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Dernière vérif.</span>
                    <span className="font-semibold">Il y a 2 min</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="stats shadow-sm">
              <div className="stat py-2 px-4">
                <div className="stat-title text-xs">Utilisateurs actifs</div>
                <div className="stat-value text-lg text-success">1,247</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="form-control hidden md:block">
            <div className="input-group input-group-sm">
              <span className="bg-base-200">
                <Search size={16} />
              </span>
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="input input-bordered input-sm w-64"
              />
            </div>
          </div>

          {/* System Alerts */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
              <div className="indicator">
                <AlertTriangle size={20} className="text-warning" />
                <span className="badge badge-warning badge-xs indicator-item">2</span>
              </div>
            </label>
            <div 
              tabIndex={0} 
              className="mt-3 card card-compact dropdown-content w-80 bg-base-100 shadow-2xl z-50"
            >
              <div className="card-body">
                <h3 className="font-bold text-lg mb-3">Alertes Système</h3>
                <div className="space-y-3">
                  <div className="alert alert-warning">
                    <AlertTriangle size={16} />
                    <span className="text-sm">Cache Redis dégradé - Performance réduite</span>
                  </div>
                  <div className="alert alert-info">
                    <Activity size={16} />
                    <span className="text-sm">Pic de trafic détecté - 150% de la normale</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
              <div className="indicator">
                <Bell size={20} />
                <span className="badge badge-primary badge-xs indicator-item">5</span>
              </div>
            </label>
            <div 
              tabIndex={0} 
              className="mt-3 card card-compact dropdown-content w-80 bg-base-100 shadow-2xl z-50"
            >
              <div className="card-body">
                <h3 className="font-bold text-lg mb-3">Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 hover:bg-base-200 rounded-lg cursor-pointer">
                    <div className="bg-success/20 p-2 rounded-lg">
                      <User size={16} className="text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nouvel utilisateur</p>
                      <p className="text-xs text-base-content/60">john.doe@example.com s'est inscrit</p>
                      <p className="text-xs text-base-content/50 mt-1">Il y a 5 min</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 hover:bg-base-200 rounded-lg cursor-pointer">
                    <div className="bg-warning/20 p-2 rounded-lg">
                      <Server size={16} className="text-warning" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Limite atteinte</p>
                      <p className="text-xs text-base-content/60">Organisation "TechCorp" a atteint 90% de sa limite</p>
                      <p className="text-xs text-base-content/50 mt-1">Il y a 1h</p>
                    </div>
                  </div>
                </div>
                <div className="divider my-2"></div>
                <button className="btn btn-sm btn-ghost w-full">
                  Voir toutes les notifications
                </button>
              </div>
            </div>
          </div>
          
          {/* Admin User Menu */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-error flex items-center justify-center ring ring-error ring-offset-2">
                <Shield size={20} className="text-error-content" />
              </div>
            </label>
            <ul 
              tabIndex={0} 
              className="mt-3 p-2 shadow-2xl menu menu-compact dropdown-content bg-base-100 rounded-box w-52 z-50"
            >
              <li className="menu-title">
                <span className="flex items-center gap-2">
                  <Shield size={14} />
                  Administrateur
                </span>
              </li>
              <li><a>
                <User size={16} />
                Mon Profil Admin
              </a></li>
              <li><a>
                <Activity size={16} />
                Logs d'activité
              </a></li>
              <li><a>
                <Server size={16} />
                Console système
              </a></li>
              <div className="divider my-0"></div>
              <li><a className="text-error">
                <Shield size={16} />
                Quitter le mode Admin
              </a></li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;