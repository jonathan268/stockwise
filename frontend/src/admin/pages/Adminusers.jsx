import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  Shield,
  Ban,
  CheckCircle,
  X,
  Clock,
  MapPin
} from 'lucide-react';

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Données utilisateurs
  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+237 6 90 12 34 56',
      plan: 'Pro',
      status: 'active',
      joinDate: '2024-01-15',
      lastLogin: '2024-02-13 14:30',
      organization: 'TechCorp',
      location: 'Douala, CM',
      storage: 15.5,
      storageLimit: 50,
      users: 5,
      usersLimit: 10
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+33 1 23 45 67 89',
      plan: 'Enterprise',
      status: 'active',
      joinDate: '2023-11-20',
      lastLogin: '2024-02-13 09:15',
      organization: 'MegaCorp SA',
      location: 'Paris, FR',
      storage: 145.2,
      storageLimit: 500,
      users: 45,
      usersLimit: 100
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@startup.io',
      phone: '+1 555 123 4567',
      plan: 'Free',
      status: 'active',
      joinDate: '2024-02-10',
      lastLogin: '2024-02-12 18:45',
      organization: 'StartupIO',
      location: 'New York, US',
      storage: 2.1,
      storageLimit: 5,
      users: 1,
      usersLimit: 3
    },
    {
      id: 4,
      name: 'Alice Brown',
      email: 'alice.brown@company.com',
      phone: '+44 20 1234 5678',
      plan: 'Pro',
      status: 'suspended',
      joinDate: '2023-08-05',
      lastLogin: '2024-01-28 11:20',
      organization: 'AliceCo Ltd',
      location: 'London, UK',
      storage: 28.7,
      storageLimit: 50,
      users: 7,
      usersLimit: 10
    },
    {
      id: 5,
      name: 'Charlie Wilson',
      email: 'charlie@example.com',
      phone: '+237 6 99 88 77 66',
      plan: 'Starter',
      status: 'pending',
      joinDate: '2024-02-13',
      lastLogin: 'Jamais',
      organization: 'WilsonCo',
      location: 'Yaoundé, CM',
      storage: 0.5,
      storageLimit: 10,
      users: 1,
      usersLimit: 5
    },
  ];

  const plans = ['all', 'Free', 'Starter', 'Pro', 'Enterprise'];
  const statuses = ['all', 'active', 'pending', 'suspended'];

  const getStatusBadge = (status) => {
    const badges = {
      active: { class: 'badge-success', text: 'Actif', icon: CheckCircle },
      pending: { class: 'badge-warning', text: 'En attente', icon: Clock },
      suspended: { class: 'badge-error', text: 'Suspendu', icon: Ban }
    };
    return badges[status] || badges.active;
  };

  const getPlanBadge = (plan) => {
    const badges = {
      Enterprise: { class: 'badge-error', text: 'Enterprise' },
      Pro: { class: 'badge-warning', text: 'Pro' },
      Starter: { class: 'badge-info', text: 'Starter' },
      Free: { class: 'badge-ghost', text: 'Free' }
    };
    return badges[plan] || badges.Free;
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(uId => uId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPlan = selectedPlan === 'all' || user.plan === selectedPlan;
    const matchStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const pendingUsers = users.filter(u => u.status === 'pending').length;
  const suspendedUsers = users.filter(u => u.status === 'suspended').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users size={32} className="text-primary" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-base-content/60 mt-1">
            Gérez tous les utilisateurs de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline gap-2">
            <Download size={20} />
            Exporter
          </button>
          <button className="btn btn-primary gap-2">
            <UserPlus size={20} />
            Ajouter Utilisateur
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary">
            <Users size={32} />
          </div>
          <div className="stat-title">Total Utilisateurs</div>
          <div className="stat-value text-primary">{totalUsers}</div>
          <div className="stat-desc">Sur la plateforme</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-success">
            <CheckCircle size={32} />
          </div>
          <div className="stat-title">Actifs</div>
          <div className="stat-value text-success">{activeUsers}</div>
          <div className="stat-desc">{Math.round(activeUsers / totalUsers * 100)}% du total</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-warning">
            <Clock size={32} />
          </div>
          <div className="stat-title">En attente</div>
          <div className="stat-value text-warning">{pendingUsers}</div>
          <div className="stat-desc">À valider</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-error">
            <Ban size={32} />
          </div>
          <div className="stat-title">Suspendus</div>
          <div className="stat-value text-error">{suspendedUsers}</div>
          <div className="stat-desc">Action requise</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="form-control">
                <div className="input-group">
                  <span className="bg-base-200">
                    <Search size={20} />
                  </span>
                  <input
                    type="text"
                    placeholder="Rechercher par nom, email ou organisation..."
                    className="input input-bordered w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      className="btn btn-ghost btn-square"
                      onClick={() => setSearchQuery('')}
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Plan Filter */}
            <div className="form-control w-full md:w-48">
              <select 
                className="select select-bordered"
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
              >
                <option value="all">Tous les plans</option>
                {plans.slice(1).map(plan => (
                  <option key={plan} value={plan}>{plan}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="form-control w-full md:w-48">
              <select 
                className="select select-bordered"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="pending">En attente</option>
                <option value="suspended">Suspendus</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedPlan !== 'all' || selectedStatus !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-base-content/60">Filtres actifs:</span>
              {searchQuery && (
                <div className="badge badge-primary gap-2">
                  {searchQuery}
                  <button onClick={() => setSearchQuery('')}>
                    <X size={14} />
                  </button>
                </div>
              )}
              {selectedPlan !== 'all' && (
                <div className="badge badge-secondary gap-2">
                  {selectedPlan}
                  <button onClick={() => setSelectedPlan('all')}>
                    <X size={14} />
                  </button>
                </div>
              )}
              {selectedStatus !== 'all' && (
                <div className="badge badge-accent gap-2">
                  {getStatusBadge(selectedStatus).text}
                  <button onClick={() => setSelectedStatus('all')}>
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          {selectedUsers.length > 0 && (
            <div className="alert shadow-lg mb-4">
              <div className="flex-1">
                <span>{selectedUsers.length} utilisateur(s) sélectionné(s)</span>
              </div>
              <div className="flex-none gap-2">
                <button className="btn btn-sm btn-success gap-2">
                  <CheckCircle size={16} />
                  Activer
                </button>
                <button className="btn btn-sm btn-warning gap-2">
                  <Ban size={16} />
                  Suspendre
                </button>
                <button className="btn btn-sm btn-error gap-2">
                  <Trash2 size={16} />
                  Supprimer
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Utilisateur</th>
                  <th>Organisation</th>
                  <th>Plan</th>
                  <th>Usage</th>
                  <th>Statut</th>
                  <th>Dernière connexion</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const statusBadge = getStatusBadge(user.status);
                  const planBadge = getPlanBadge(user.plan);
                  const StatusIcon = statusBadge.icon;
                  
                  return (
                    <tr key={user.id} className="hover">
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-neutral-focus text-neutral-content rounded-full w-12">
                              <span>{user.name.split(' ').map(n => n[0]).join('')}</span>
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">{user.name}</div>
                            <div className="text-sm text-base-content/60 flex items-center gap-1">
                              <Mail size={12} />
                              {user.email}
                            </div>
                            <div className="text-xs text-base-content/50 flex items-center gap-1 mt-1">
                              <MapPin size={10} />
                              {user.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold">{user.organization}</div>
                        <div className="text-sm text-base-content/60">
                          {user.users}/{user.usersLimit} utilisateurs
                        </div>
                      </td>
                      <td>
                        <div className={`badge ${planBadge.class}`}>
                          {planBadge.text}
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="text-xs text-base-content/60">Stockage</div>
                          <div className="flex items-center gap-2">
                            <progress 
                              className="progress progress-primary w-20" 
                              value={user.storage} 
                              max={user.storageLimit}
                            ></progress>
                            <span className="text-xs font-semibold">
                              {user.storage}/{user.storageLimit} GB
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={`badge ${statusBadge.class} gap-2`}>
                          <StatusIcon size={12} />
                          {statusBadge.text}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm flex items-center gap-1">
                          <Calendar size={12} className="text-base-content/60" />
                          {user.lastLogin}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-ghost btn-xs" title="Voir">
                            <Eye size={16} />
                          </button>
                          <button className="btn btn-ghost btn-xs" title="Modifier">
                            <Edit size={16} />
                          </button>
                          <button className="btn btn-ghost btn-xs text-error" title="Supprimer">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-base-content/20 mb-4" />
                <p className="text-base-content/60">Aucun utilisateur trouvé</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="flex justify-center mt-6">
              <div className="btn-group">
                <button className="btn btn-sm">«</button>
                <button className="btn btn-sm btn-active">1</button>
                <button className="btn btn-sm">2</button>
                <button className="btn btn-sm">3</button>
                <button className="btn btn-sm">»</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;