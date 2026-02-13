import React, { useState } from 'react';
import { Search, Bell, User, Sun, Moon } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  const [theme, setTheme] = useState('winter');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'synthwave' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <header className="bg-base-100 shadow-sm sticky top-0 z-10 h-16">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search Bar */}
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
         
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle"
            title="Changer de thème"
          >
            {theme === 'light' ? (
              <Moon size={20} />
            ) : (
              <Sun size={20} />
            )}
          </button>

          {/* Notifications */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <div className="indicator">
                <Bell size={20} />
                <span className="badge badge-primary badge-xs indicator-item">3</span>
              </div>
            </label>
            <div 
              tabIndex={0} 
              className="mt-3 card card-compact dropdown-content w-80 bg-base-100 shadow-2xl"
            >
              <div className="card-body">
                <h3 className="font-bold text-lg mb-3">Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 hover:bg-base-200 rounded-lg cursor-pointer">
                    <div className="bg-warning/20 p-2 rounded-lg">
                      <Bell size={16} className="text-warning" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Stock bas détecté</p>
                      <p className="text-xs text-base-content/60">iPhone 14 Pro - 5 unités restantes</p>
                      <p className="text-xs text-base-content/50 mt-1">Il y a 2h</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 hover:bg-base-200 rounded-lg cursor-pointer">
                    <div className="bg-success/20 p-2 rounded-lg">
                      <Bell size={16} className="text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Commande livrée</p>
                      <p className="text-xs text-base-content/60">Commande #12345 livrée avec succès</p>
                      <p className="text-xs text-base-content/50 mt-1">Il y a 5h</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 hover:bg-base-200 rounded-lg cursor-pointer">
                    <div className="bg-info/20 p-2 rounded-lg">
                      <Bell size={16} className="text-info" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Prédiction IA</p>
                      <p className="text-xs text-base-content/60">Hausse de demande prévue pour les accessoires</p>
                      <p className="text-xs text-base-content/50 mt-1">Il y a 1j</p>
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
          
          {/* User Menu */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-primary flex items-center justify-center">
                <User size={20} className="text-primary-content" />
              </div>
            </label>
            <ul 
              tabIndex={0} 
              className="mt-3 p-2 shadow-2xl menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
            >
              <li className="menu-title">
                <span>John Doe</span>
              </li>
              <li><a>
                <User size={16} />
                Mon Profil
              </a></li>
              <li><a>
                <Search size={16} />
                Paramètres
              </a></li>
              <li><a>
                <Bell size={16} />
                Notifications
              </a></li>
              <div className="divider my-0"></div>
              <li><a className="text-error">
                Déconnexion
              </a></li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
