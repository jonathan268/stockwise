import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Eye,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Package,
  X,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Données des commandes
  const orders = [
    {
      id: 'CMD-001',
      supplier: 'TechDistrib SA',
      date: '2024-02-13',
      deliveryDate: '2024-02-20',
      products: 5,
      quantity: 150,
      total: 45750,
      status: 'pending',
      priority: 'high'
    },
    {
      id: 'CMD-002',
      supplier: 'ElectroWorld',
      date: '2024-02-12',
      deliveryDate: '2024-02-18',
      products: 3,
      quantity: 80,
      total: 23400,
      status: 'confirmed',
      priority: 'medium'
    },
    {
      id: 'CMD-003',
      supplier: 'MegaTech Distribution',
      date: '2024-02-11',
      deliveryDate: '2024-02-15',
      products: 8,
      quantity: 200,
      total: 67890,
      status: 'shipped',
      priority: 'high'
    },
    {
      id: 'CMD-004',
      supplier: 'TechDistrib SA',
      date: '2024-02-10',
      deliveryDate: '2024-02-14',
      products: 2,
      quantity: 50,
      total: 12500,
      status: 'delivered',
      priority: 'low'
    },
    {
      id: 'CMD-005',
      supplier: 'Global Electronics',
      date: '2024-02-09',
      deliveryDate: '2024-02-16',
      products: 4,
      quantity: 120,
      total: 34200,
      status: 'cancelled',
      priority: 'medium'
    },
  ];

  const getStatusInfo = (status) => {
    const statuses = {
      pending: { 
        icon: Clock, 
        class: 'badge-warning', 
        text: 'En attente',
        bgClass: 'bg-warning/10'
      },
      confirmed: { 
        icon: CheckCircle, 
        class: 'badge-info', 
        text: 'Confirmée',
        bgClass: 'bg-info/10'
      },
      shipped: { 
        icon: Truck, 
        class: 'badge-primary', 
        text: 'Expédiée',
        bgClass: 'bg-primary/10'
      },
      delivered: { 
        icon: Package, 
        class: 'badge-success', 
        text: 'Livrée',
        bgClass: 'bg-success/10'
      },
      cancelled: { 
        icon: XCircle, 
        class: 'badge-error', 
        text: 'Annulée',
        bgClass: 'bg-error/10'
      }
    };
    return statuses[status] || statuses.pending;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: { class: 'badge-error', text: 'Haute' },
      medium: { class: 'badge-warning', text: 'Moyenne' },
      low: { class: 'badge-ghost', text: 'Basse' }
    };
    return badges[priority] || badges.low;
  };

  const filteredOrders = orders.filter(order => {
    const matchSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       order.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingCart size={32} className="text-primary" />
            Commandes
          </h1>
          <p className="text-base-content/60 mt-1">
            Gérez vos commandes et réapprovisionnements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline gap-2">
            <Download size={20} />
            Exporter
          </button>
          <button className="btn btn-primary gap-2">
            <Plus size={20} />
            Nouvelle commande
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary">
            <ShoppingCart size={32} />
          </div>
          <div className="stat-title">Total Commandes</div>
          <div className="stat-value text-primary">{orders.length}</div>
          <div className="stat-desc">Ce mois-ci</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-warning">
            <Clock size={32} />
          </div>
          <div className="stat-title">En attente</div>
          <div className="stat-value text-warning">{statusCounts.pending}</div>
          <div className="stat-desc">À confirmer</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-info">
            <Truck size={32} />
          </div>
          <div className="stat-title">En transit</div>
          <div className="stat-value text-info">{statusCounts.shipped}</div>
          <div className="stat-desc">Livraison en cours</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-success">
            <DollarSign size={32} />
          </div>
          <div className="stat-title">Valeur totale</div>
          <div className="stat-value text-success">
            {orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()} FCFA
          </div>
          <div className="stat-desc">Toutes commandes</div>
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
                  <input
                    type="text"
                    placeholder="Rechercher par N° ou fournisseur..."
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

            {/* Status Tabs */}
            <div className="tabs tabs-boxed">
              <button 
                className={`tab ${selectedStatus === 'all' ? 'tab-active' : ''}`}
                onClick={() => setSelectedStatus('all')}
              >
                Toutes ({statusCounts.all})
              </button>
              <button 
                className={`tab ${selectedStatus === 'pending' ? 'tab-active' : ''}`}
                onClick={() => setSelectedStatus('pending')}
              >
                En attente ({statusCounts.pending})
              </button>
              <button 
                className={`tab ${selectedStatus === 'shipped' ? 'tab-active' : ''}`}
                onClick={() => setSelectedStatus('shipped')}
              >
                Expédiées ({statusCounts.shipped})
              </button>
              <button 
                className={`tab ${selectedStatus === 'delivered' ? 'tab-active' : ''}`}
                onClick={() => setSelectedStatus('delivered')}
              >
                Livrées ({statusCounts.delivered})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const statusInfo = getStatusInfo(order.status);
          const priorityBadge = getPriorityBadge(order.priority);
          const StatusIcon = statusInfo.icon;
          
          return (
            <div 
              key={order.id} 
              className={`card bg-base-100 shadow-lg hover:shadow-xl transition-shadow border-l-4 ${
                order.status === 'pending' ? 'border-warning' :
                order.status === 'confirmed' ? 'border-info' :
                order.status === 'shipped' ? 'border-primary' :
                order.status === 'delivered' ? 'border-success' :
                'border-error'
              }`}
            >
              <div className="card-body">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold">{order.id}</h3>
                        <div className="flex items-center gap-2 mt-1 text-base-content/70">
                          <User size={16} />
                          <span className="font-medium">{order.supplier}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className={`badge ${statusInfo.class} gap-2`}>
                          <StatusIcon size={12} />
                          {statusInfo.text}
                        </div>
                        <div className={`badge ${priorityBadge.class}`}>
                          {priorityBadge.text}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-base-content/60 mb-1">Date commande</div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-base-content/60" />
                          <span className="font-semibold">{order.date}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-base-content/60 mb-1">Livraison prévue</div>
                        <div className="flex items-center gap-2">
                          <Truck size={16} className="text-base-content/60" />
                          <span className="font-semibold">{order.deliveryDate}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-base-content/60 mb-1">Produits / Quantité</div>
                        <div className="flex items-center gap-2">
                          <Package size={16} className="text-base-content/60" />
                          <span className="font-semibold">{order.products} / {order.quantity}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-base-content/60 mb-1">Montant total</div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-success" />
                          <span className="font-bold text-success">{order.total.toLocaleString()} FCFA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <button className="btn btn-sm btn-ghost gap-2">
                      <Eye size={16} />
                      Détails
                    </button>
                    {order.status === 'pending' && (
                      <>
                        <button className="btn btn-sm btn-success gap-2">
                          <CheckCircle size={16} />
                          Confirmer
                        </button>
                        <button className="btn btn-sm btn-error gap-2">
                          <XCircle size={16} />
                          Annuler
                        </button>
                      </>
                    )}
                    {order.status === 'shipped' && (
                      <button className="btn btn-sm btn-primary gap-2">
                        <Truck size={16} />
                        Suivre
                      </button>
                    )}
                    {order.status === 'delivered' && (
                      <button className="btn btn-sm btn-outline gap-2">
                        <Download size={16} />
                        Facture
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body text-center py-12">
              <ShoppingCart size={48} className="mx-auto text-base-content/20 mb-4" />
              <h3 className="text-xl font-bold">Aucune commande trouvée</h3>
              <p className="text-base-content/60">
                Essayez de modifier vos filtres ou créez une nouvelle commande
              </p>
              <button className="btn btn-primary gap-2 mx-auto mt-4">
                <Plus size={20} />
                Nouvelle commande
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title mb-4">Fournisseurs principaux</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">TechDistrib SA</div>
              <div className="stat-value text-primary text-2xl">2</div>
              <div className="stat-desc">58,250 FCFA - 45% du total</div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">MegaTech Distribution</div>
              <div className="stat-value text-secondary text-2xl">1</div>
              <div className="stat-desc">67,890 FCFA - 38% du total</div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">ElectroWorld</div>
              <div className="stat-value text-accent text-2xl">1</div>
              <div className="stat-desc">23,400 FCFA - 13% du total</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;