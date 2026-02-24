import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  AlertCircle,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package
} from 'lucide-react';
import { OrderService } from '../services/orderService';
import OrderModal from '../components/common/Orders/orderModal';
import OrderDetailsModal from '../components/common/Orders/orderDetailsModal';
import toast from 'react-hot-toast';

const Commandes = () => {
  // ==================== STATE ====================
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filters
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ==================== FETCH ORDERS ====================
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await OrderService.getAllOrders();

      if (response.success && response.data) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
      setError(err.message || 'Erreur lors du chargement des commandes');
      toast.error('Erreur lors du chargement des commandes');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ==================== REFRESH ====================
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
    toast.success('Commandes actualisées');
  };

  // ==================== MODAL HANDLERS ====================
  const handleAddOrder = () => {
    setSelectedOrder(null);
    setShowOrderModal(true);
  };

  const handleEditOrder = (order) => {
    if (!order.canBeModified && order.status !== 'draft' && order.status !== 'pending') {
      toast.error('Cette commande ne peut plus être modifiée');
      return;
    }
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleOrderSaved = () => {
    fetchOrders();
  };

  // ==================== STATUS ACTIONS ====================
  const handleConfirmOrder = async (orderId) => {
    try {
      await OrderService.confirmOrder(orderId);
      toast.success('Commande confirmée');
      fetchOrders();
    } catch (err) {
      console.error('Erreur confirmation:', err);
      toast.error('Erreur lors de la confirmation');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    if (!window.confirm('Marquer cette commande comme terminée ?')) {
      return;
    }

    try {
      await OrderService.completeOrder(orderId);
      toast.success('Commande complétée');
      fetchOrders();
    } catch (err) {
      console.error('Erreur complétion:', err);
      toast.error('Erreur lors de la complétion');
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = prompt('Raison de l\'annulation:');
    if (!reason) return;

    try {
      await OrderService.cancelOrder(orderId, reason);
      toast.success('Commande annulée');
      fetchOrders();
    } catch (err) {
      console.error('Erreur annulation:', err);
      toast.error('Erreur lors de l\'annulation');
    }
  };

  // ==================== DELETE ====================
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      return;
    }

    try {
      await OrderService.deleteOrder(orderId);
      setOrders(orders.filter(o => o._id !== orderId));
      toast.success('Commande supprimée');
    } catch (err) {
      console.error('Erreur suppression:', err);
      toast.error('Erreur lors de la suppression');
    }
  };

  // ==================== STATUS BADGE ====================
  const getStatusBadge = (status) => {
    const badges = {
      draft: { class: 'badge-ghost', text: 'Brouillon' },
      pending: { class: 'badge-warning', text: 'En attente' },
      confirmed: { class: 'badge-info', text: 'Confirmée' },
      processing: { class: 'badge-primary', text: 'En traitement' },
      completed: { class: 'badge-success', text: 'Complétée' },
      cancelled: { class: 'badge-error', text: 'Annulée' }
    };
    return badges[status] || badges.draft;
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', text: 'En attente' },
      partial: { class: 'badge-info', text: 'Partiel' },
      paid: { class: 'badge-success', text: 'Payé' },
      refunded: { class: 'badge-error', text: 'Remboursé' }
    };
    return badges[status] || badges.pending;
  };

  // ==================== FILTERING ====================
  const filteredOrders = orders.filter(order => {
    const matchType = filterType === 'all' || order.type === filterType;
    const matchStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchSearch = 
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchType && matchStatus && matchSearch;
  });

  // ==================== STATS ====================
  const calculateStats = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => o.type === 'sale' && o.status === 'completed')
      .reduce((sum, o) => sum + o.totals.total, 0);
    const totalPurchases = orders
      .filter(o => o.type === 'purchase' && o.status === 'completed')
      .reduce((sum, o) => sum + o.totals.total, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    return {
      totalOrders,
      totalRevenue,
      totalPurchases,
      pendingOrders
    };
  };

  const stats = calculateStats();

  // ==================== PAGINATION ====================
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredOrders.length, currentPage, totalPages]);

  // ==================== RENDER LOADING ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-base-content/60">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  // ==================== RENDER ERROR ====================
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card bg-base-100 shadow-xl w-full max-w-md">
          <div className="card-body text-center">
            <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
            <h2 className="card-title justify-center">Erreur de chargement</h2>
            <p className="text-base-content/60">{error}</p>
            <div className="card-actions justify-center mt-4">
              <button className="btn btn-primary" onClick={fetchOrders}>
                <RefreshCw size={20} />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingCart size={32} className="text-primary" />
            Commandes
          </h1>
          <p className="text-base-content/60 mt-1">
            Gérez vos commandes d'achat et de vente
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost gap-2"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            Actualiser
          </button>
          <button className="btn btn-primary gap-2" onClick={handleAddOrder}>
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
          <div className="stat-value text-primary">{stats.totalOrders}</div>
          <div className="stat-desc">Toutes catégories</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-success">
            <TrendingUp size={32} />
          </div>
          <div className="stat-title">Ventes</div>
          <div className="stat-value text-success text-2xl">
            {stats.totalRevenue.toLocaleString('fr-FR')}
          </div>
          <div className="stat-desc">FCFA (complétées)</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-error">
            <TrendingDown size={32} />
          </div>
          <div className="stat-title">Achats</div>
          <div className="stat-value text-error text-2xl">
            {stats.totalPurchases.toLocaleString('fr-FR')}
          </div>
          <div className="stat-desc">FCFA (complétées)</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-warning">
            <Package size={32} />
          </div>
          <div className="stat-title">En attente</div>
          <div className="stat-value text-warning">{stats.pendingOrders}</div>
          <div className="stat-desc">À traiter</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher par numéro, client, fournisseur..."
                className="input input-bordered w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div className="form-control w-full md:w-48">
              <select
                className="select select-bordered"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Tous types</option>
                <option value="purchase">Achats</option>
                <option value="sale">Ventes</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="form-control w-full md:w-48">
              <select
                className="select select-bordered"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tous statuts</option>
                <option value="draft">Brouillon</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmée</option>
                <option value="processing">En traitement</option>
                <option value="completed">Complétée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Type</th>
                  <th>Client/Fournisseur</th>
                  <th>Date</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Paiement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => {
                  const statusBadge = getStatusBadge(order.status);
                  const paymentBadge = getPaymentStatusBadge(order.paymentStatus);

                  return (
                    <tr key={order._id} className="hover">
                      <td>
                        <span className="font-mono font-semibold">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td>
                        <div className="badge badge-ghost">
                          {order.type === 'purchase' ? 'Achat' : 'Vente'}
                        </div>
                      </td>
                      <td>
                        {order.type === 'purchase'
                          ? order.supplier?.name || 'N/A'
                          : order.customer?.name || 'N/A'}
                      </td>
                      <td>
                        {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="font-semibold">
                        {order.totals.total.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td>
                        <div className={`badge ${statusBadge.class}`}>
                          {statusBadge.text}
                        </div>
                      </td>
                      <td>
                        <div className={`badge ${paymentBadge.class}`}>
                          {paymentBadge.text}
                        </div>
                      </td>
                      <td>
                        <div className="dropdown dropdown-end">
                          <label tabIndex={0} className="btn btn-ghost btn-xs">
                            Actions
                          </label>
                          <ul
                            tabIndex={0}
                            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                          >
                            <li>
                              <button onClick={() => handleViewDetails(order)}>
                                <Eye size={16} />
                                Voir détails
                              </button>
                            </li>
                            {(order.status === 'draft' || order.status === 'pending') && (
                              <>
                                <li>
                                  <button onClick={() => handleEditOrder(order)}>
                                    <Edit size={16} />
                                    Modifier
                                  </button>
                                </li>
                                {order.status === 'pending' && (
                                  <li>
                                    <button onClick={() => handleConfirmOrder(order._id)}>
                                      <CheckCircle size={16} />
                                      Confirmer
                                    </button>
                                  </li>
                                )}
                              </>
                            )}
                            {order.status === 'confirmed' && (
                              <li>
                                <button onClick={() => handleCompleteOrder(order._id)}>
                                  <CheckCircle size={16} />
                                  Compléter
                                </button>
                              </li>
                            )}
                            {order.status !== 'completed' && order.status !== 'cancelled' && (
                              <li>
                                <button
                                  onClick={() => handleCancelOrder(order._id)}
                                  className="text-error"
                                >
                                  <XCircle size={16} />
                                  Annuler
                                </button>
                              </li>
                            )}
                            {order.status === 'draft' && (
                              <li>
                                <button
                                  onClick={() => handleDeleteOrder(order._id)}
                                  className="text-error"
                                >
                                  <Trash2 size={16} />
                                  Supprimer
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Empty State */}
            {paginatedOrders.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart size={48} className="mx-auto text-base-content/20 mb-4" />
                <p className="text-base-content/60">
                  {orders.length === 0
                    ? 'Aucune commande'
                    : 'Aucune commande trouvée avec ces filtres'}
                </p>
                {orders.length === 0 && (
                  <button className="btn btn-primary mt-4 gap-2" onClick={handleAddOrder}>
                    <Plus size={20} />
                    Créer votre première commande
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredOrders.length > itemsPerPage && (
            <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
              <div className="text-sm text-base-content/60">
                Affichage de {(currentPage - 1) * itemsPerPage + 1} à{' '}
                {Math.min(currentPage * itemsPerPage, filteredOrders.length)} sur{' '}
                {filteredOrders.length} commandes
              </div>

              <div className="btn-group">
                <button
                  className="btn btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  «
                </button>

                {[...Array(totalPages)].map((_, idx) => {
                  const page = idx + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        className={`btn btn-sm ${currentPage === page ? 'btn-active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <button key={page} className="btn btn-sm btn-disabled">
                        ...
                      </button>
                    );
                  }
                  return null;
                })}

                <button
                  className="btn btn-sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <OrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        order={selectedOrder}
        onSuccess={handleOrderSaved}
      />

      <OrderDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default Commandes;
