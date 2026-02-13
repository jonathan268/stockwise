import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Mail,
  Lock,
  Save,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  Building,
  Phone,
  MapPin,
  CreditCard,
  Zap
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    lowStock: true,
    orders: true,
    aiInsights: false
  });

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'company', label: 'Entreprise', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'ai', label: 'IA & Automatisation', icon: Zap },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <SettingsIcon size={32} className="text-primary" />
          Paramètres
        </h1>
        <p className="text-base-content/60 mt-1">
          Gérez les paramètres de votre compte et de l'application
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto pb-2">
        <div className="tabs tabs-boxed">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab gap-2 ${activeTab === tab.id ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4">Informations personnelles</h2>
              
              {/* Avatar */}
              <div className="flex items-center gap-6 mb-6">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-24 h-24">
                    <span className="text-3xl"></span>
                  </div>
                </div>
                <div>
                  <button className="btn btn-primary btn-sm" type="file" >Changer la photo</button>
                  <p className="text-sm text-base-content/60 mt-2">JPG, PNG ou GIF. Max 2MB.</p>
                </div>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Prénom</span>
                  </label>
                  <input type="text" placeholder="John" className="input input-bordered" defaultValue="John" />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Nom</span>
                  </label>
                  <input type="text" placeholder="Doe" className="input input-bordered" defaultValue="Doe" />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Email</span>
                  </label>
                  <input type="email" placeholder="john.doe@example.com" className="input input-bordered" defaultValue="john.doe@example.com" />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Téléphone</span>
                  </label>
                  <input type="tel" placeholder="+237 6 XX XX XX XX" className="input input-bordered" defaultValue="+237 6 90 12 34 56" />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text font-semibold">Poste</span>
                  </label>
                  <input type="text" placeholder="Responsable Stock" className="input input-bordered" defaultValue="Gestionnaire d'inventaire" />
                </div>
              </div>

              <div className="card-actions justify-end mt-6">
                <button className="btn btn-ghost">Annuler</button>
                <button className="btn btn-primary gap-2">
                  <Save size={20} />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Tab */}
      {activeTab === 'company' && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Informations entreprise</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold">Nom de l'entreprise</span>
                </label>
                <input type="text" placeholder="Mon Entreprise" className="input input-bordered" defaultValue="StockAI Solutions" />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Secteur d'activité</span>
                </label>
                <select className="select select-bordered">
                  <option>Distribution électronique</option>
                  <option>Retail</option>
                  <option>E-commerce</option>
                  <option>Logistique</option>
                  <option>Autre</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Taille de l'entreprise</span>
                </label>
                <select className="select select-bordered">
                  <option>1-10 employés</option>
                  <option>11-50 employés</option>
                  <option>51-200 employés</option>
                  <option>201-500 employés</option>
                  <option>500+ employés</option>
                </select>
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold">Adresse</span>
                </label>
                <input type="text" placeholder="123 Rue de la République" className="input input-bordered" />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Ville</span>
                </label>
                <input type="text" placeholder="Douala" className="input input-bordered" />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Code postal</span>
                </label>
                <input type="text" placeholder="12345" className="input input-bordered" />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Pays</span>
                </label>
                <select className="select select-bordered">
                  <option>Cameroun</option>
                  <option>France</option>
                  <option>Belgique</option>
                  <option>Suisse</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">N° TVA</span>
                </label>
                <input type="text" placeholder="FR12345678901" className="input input-bordered" />
              </div>
            </div>

            <div className="card-actions justify-end mt-6">
              <button className="btn btn-ghost">Annuler</button>
              <button className="btn btn-primary gap-2">
                <Save size={20} />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4">Préférences de notifications</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Mail size={24} className="text-primary" />
                    <div>
                      <div className="font-semibold">Notifications par email</div>
                      <div className="text-sm text-base-content/60">Recevoir des emails pour les événements importants</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={notifications.email}
                    onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Bell size={24} className="text-primary" />
                    <div>
                      <div className="font-semibold">Notifications push</div>
                      <div className="text-sm text-base-content/60">Recevoir des notifications dans le navigateur</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={notifications.push}
                    onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                  />
                </div>

                <div className="divider">Alertes spécifiques</div>

                <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Database size={24} className="text-warning" />
                    <div>
                      <div className="font-semibold">Alertes de stock bas</div>
                      <div className="text-sm text-base-content/60">Être notifié quand le stock est en dessous du seuil</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-warning"
                    checked={notifications.lowStock}
                    onChange={(e) => setNotifications({...notifications, lowStock: e.target.checked})}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <CreditCard size={24} className="text-success" />
                    <div>
                      <div className="font-semibold">Mises à jour des commandes</div>
                      <div className="text-sm text-base-content/60">Recevoir les confirmations et mises à jour</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-success"
                    checked={notifications.orders}
                    onChange={(e) => setNotifications({...notifications, orders: e.target.checked})}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Zap size={24} className="text-info" />
                    <div>
                      <div className="font-semibold">Insights IA</div>
                      <div className="text-sm text-base-content/60">Recevoir les recommandations et prédictions IA</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-info"
                    checked={notifications.aiInsights}
                    onChange={(e) => setNotifications({...notifications, aiInsights: e.target.checked})}
                  />
                </div>
              </div>

              <div className="card-actions justify-end mt-6">
                <button className="btn btn-primary gap-2">
                  <Save size={20} />
                  Enregistrer les préférences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4">Changer le mot de passe</h2>
              
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Mot de passe actuel</span>
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••" 
                      className="input input-bordered w-full pr-10"
                    />
                    <button 
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Nouveau mot de passe</span>
                  </label>
                  <input type="password" placeholder="••••••••" className="input input-bordered" />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Confirmer le mot de passe</span>
                  </label>
                  <input type="password" placeholder="••••••••" className="input input-bordered" />
                </div>
              </div>

              <div className="card-actions justify-end mt-6">
                <button className="btn btn-primary gap-2">
                  <Lock size={20} />
                  Changer le mot de passe
                </button>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4">Authentification à deux facteurs</h2>
              <p className="text-base-content/70 mb-4">
                Ajoutez une couche de sécurité supplémentaire à votre compte
              </p>
              <button className="btn btn-outline btn-success gap-2">
                <Shield size={20} />
                Activer l'authentification à deux facteurs
              </button>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg border-error">
            <div className="card-body">
              <h2 className="card-title text-error mb-4">Zone dangereuse</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Supprimer le compte</div>
                    <div className="text-sm text-base-content/60">Action irréversible</div>
                  </div>
                  <button className="btn btn-error btn-outline gap-2">
                    <Trash2 size={20} />
                    Supprimer le compte
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Personnalisation de l'apparence</h2>
            
            <div className="space-y-6">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Thème</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['light', 'synthwave', 'cupcake', 'corporate'].map((theme) => (
                    <button 
                      key={theme}
                      className="btn btn-outline capitalize"
                      onClick={() => document.documentElement.setAttribute('data-theme', theme)}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Langue</span>
                </label>
                <select className="select select-bordered w-full max-w-xs">
                  <option>Français</option>
                  <option>English</option>
                  <option>Español</option>
                  <option>Deutsch</option>
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Format de date</span>
                </label>
                <select className="select select-bordered w-full max-w-xs">
                  <option>JJ/MM/AAAA</option>
                  <option>MM/JJ/AAAA</option>
                  <option>AAAA-MM-JJ</option>
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Devise</span>
                </label>
                <select className="select select-bordered w-full max-w-xs">
                  <option>Euro (€)</option>
                  <option>Dollar ($)</option>
                  <option>Franc CFA (FCFA)</option>
                </select>
              </div>
            </div>

            <div className="card-actions justify-end mt-6">
              <button className="btn btn-primary gap-2">
                <Save size={20} />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Tab */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4">
                <Zap className="text-primary" size={24} />
                Paramètres IA
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                  <div>
                    <div className="font-semibold">Prédictions automatiques</div>
                    <div className="text-sm text-base-content/60">Générer des prédictions de demande quotidiennes</div>
                  </div>
                  <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                  <div>
                    <div className="font-semibold">Recommandations de commande</div>
                    <div className="text-sm text-base-content/60">Suggérer automatiquement les produits à commander</div>
                  </div>
                  <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                  <div>
                    <div className="font-semibold">Détection d'anomalies</div>
                    <div className="text-sm text-base-content/60">Identifier les comportements inhabituels dans les ventes</div>
                  </div>
                  <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Niveau de confiance minimum</span>
                  </label>
                  <input type="range" min="50" max="100" defaultValue="75" className="range range-primary" step="5" />
                  <div className="w-full flex justify-between text-xs px-2 mt-2">
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div className="card-actions justify-end mt-6">
                <button className="btn btn-primary gap-2">
                  <Save size={20} />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4">Maintenance</h2>
              <div className="space-y-3">
                <button className="btn btn-outline w-full justify-start gap-2">
                  <RefreshCw size={20} />
                  Réentraîner les modèles IA
                </button>
                <button className="btn btn-outline w-full justify-start gap-2">
                  <Database size={20} />
                  Exporter les données d'entraînement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;