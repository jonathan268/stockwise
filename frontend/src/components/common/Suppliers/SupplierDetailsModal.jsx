import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  CreditCard,
  Package,
  TrendingUp,
  Star,
  Calendar,
  FileText,
  Loader2
} from 'lucide-react';
import { SupplierService } from '../../../services/suppliersService';
import toast from 'react-hot-toast';

const SupplierDetailsModal = ({ isOpen, onClose, supplier }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // ==================== LOAD DATA ====================
  useEffect(() => {
    if (supplier && isOpen && activeTab === 'products') {
      loadProducts();
    }
  }, [supplier, isOpen, activeTab]);

  useEffect(() => {
    if (supplier && isOpen && activeTab === 'orders') {
      loadOrders();
    }
  }, [supplier, isOpen, activeTab]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await SupplierService.getSupplierProducts(supplier._id);
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (err) {
      console.error('Erreur chargement produits:', err);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await SupplierService.getSupplierOrders(supplier._id);
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!supplier) return null;

  // ==================== STATUS BADGE ====================
  const getStatusBadge = (status) => {
    const badges = {
      active: { class: 'badge-success', text: 'Actif' },
      inactive: { class: 'badge-ghost', text: 'Inactif' },
      blacklisted: { class: 'badge-error', text: 'Liste noire' }
    };
    return badges[status] || badges.active;
  };

  const statusBadge = getStatusBadge(supplier.status);

  // ==================== RENDER ====================
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplier.name}
      size="xl"
    >
      <div className="space-y-6">

        {/* Header avec badges */}
        <div className="flex flex-wrap gap-2">
          <div className={`badge ${statusBadge.class}`}>
            {statusBadge.text}
          </div>
          {supplier.code && (
            <div className="badge badge-ghost font-mono">
              {supplier.code}
            </div>
          )}
          {supplier.rating?.overall > 0 && (
            <div className="badge badge-warning gap-1">
              <Star size={12} fill="currentColor" />
              {supplier.rating.overall.toFixed(1)}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed">
          <button
            className={`tab ${activeTab === 'info' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <Building2 size={16} className="mr-2" />
            Informations
          </button>
          <button
            className={`tab ${activeTab === 'products' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={16} className="mr-2" />
            Produits
          </button>
          <button
            className={`tab ${activeTab === 'orders' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FileText size={16} className="mr-2" />
            Commandes
          </button>
          <button
            className={`tab ${activeTab === 'stats' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <TrendingUp size={16} className="mr-2" />
            Statistiques
          </button>
        </div>

        {/* Tab: Informations */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            
            {/* Contact */}
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg">Contact</h3>
                <div className="space-y-3">
                  {supplier.email && (
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-base-content/60" />
                      <a href={`mailto:${supplier.email}`} className="link link-primary">
                        {supplier.email}
                      </a>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-base-content/60" />
                      <a href={`tel:${supplier.phone}`} className="link link-primary">
                        {supplier.phone}
                      </a>
                    </div>
                  )}
                  {supplier.website && (
                    <div className="flex items-center gap-3">
                      <Globe size={18} className="text-base-content/60" />
                      <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="link link-primary">
                        {supplier.website}
                      </a>
                    </div>
                  )}
                  {supplier.address && (supplier.address.street || supplier.address.city) && (
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-base-content/60 mt-1" />
                      <div>
                        {supplier.address.street && <div>{supplier.address.street}</div>}
                        <div>
                          {[supplier.address.city, supplier.address.region, supplier.address.country]
                            .filter(Boolean)
                            .join(', ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Personne de contact */}
            {supplier.contactPerson?.name && (
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title text-lg flex items-center gap-2">
                    <User size={20} />
                    Personne de contact
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <div className="font-semibold">{supplier.contactPerson.name}</div>
                      {supplier.contactPerson.position && (
                        <div className="text-sm text-base-content/60">{supplier.contactPerson.position}</div>
                      )}
                    </div>
                    {supplier.contactPerson.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-base-content/60" />
                        <a href={`tel:${supplier.contactPerson.phone}`} className="link link-primary text-sm">
                          {supplier.contactPerson.phone}
                        </a>
                      </div>
                    )}
                    {supplier.contactPerson.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-base-content/60" />
                        <a href={`mailto:${supplier.contactPerson.email}`} className="link link-primary text-sm">
                          {supplier.contactPerson.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Conditions commerciales */}
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg flex items-center gap-2">
                  <CreditCard size={20} />
                  Conditions commerciales
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-base-content/60">Méthode de paiement</div>
                    <div className="font-semibold capitalize">
                      {supplier.paymentTerms?.method?.replace('_', ' ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-base-content/60">Devise</div>
                    <div className="font-semibold">{supplier.paymentTerms?.currency || 'XAF'}</div>
                  </div>
                  {supplier.paymentTerms?.creditDays > 0 && (
                    <div>
                      <div className="text-sm text-base-content/60">Délai de crédit</div>
                      <div className="font-semibold">{supplier.paymentTerms.creditDays} jours</div>
                    </div>
                  )}
                  {supplier.paymentTerms?.creditLimit > 0 && (
                    <div>
                      <div className="text-sm text-base-content/60">Limite de crédit</div>
                      <div className="font-semibold">
                        {supplier.paymentTerms.creditLimit.toLocaleString('fr-FR')} FCFA
                      </div>
                    </div>
                  )}
                  {supplier.shipping?.leadTime > 0 && (
                    <div>
                      <div className="text-sm text-base-content/60">Délai de livraison</div>
                      <div className="font-semibold">{supplier.shipping.leadTime} jours</div>
                    </div>
                  )}
                  {supplier.shipping?.minimumOrderAmount > 0 && (
                    <div>
                      <div className="text-sm text-base-content/60">Commande minimum</div>
                      <div className="font-semibold">
                        {supplier.shipping.minimumOrderAmount.toLocaleString('fr-FR')} FCFA
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Catégories */}
            {supplier.categories && supplier.categories.length > 0 && (
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title text-lg">Catégories de produits</h3>
                  <div className="flex flex-wrap gap-2">
                    {supplier.categories.map((category, index) => (
                      <div key={index} className="badge badge-primary">
                        {category}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            {supplier.tags && supplier.tags.length > 0 && (
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title text-lg">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {supplier.tags.map((tag, index) => (
                      <div key={index} className="badge badge-secondary">
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {supplier.notes && (
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title text-lg">Notes</h3>
                  <p className="text-base-content/80">{supplier.notes}</p>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab: Produits */}
        {activeTab === 'products' && (
          <div>
            {loadingProducts ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            ) : products.length > 0 ? (
              <div className="space-y-2">
                {products.map(product => (
                  <div key={product._id} className="card bg-base-200">
                    <div className="card-body p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-sm text-base-content/60">{product.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {(product.pricing?.sellingPrice || 0).toLocaleString('fr-FR')} FCFA
                          </div>
                          <div className="text-sm text-base-content/60">
                            Stock: {product.stock?.quantity || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-base-content/20 mb-4" />
                <p className="text-base-content/60">Aucun produit</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Commandes */}
        {activeTab === 'orders' && (
          <div>
            {loadingOrders ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-2">
                {orders.map(order => (
                  <div key={order._id} className="card bg-base-200">
                    <div className="card-body p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-mono font-semibold">{order.orderNumber}</div>
                          <div className="text-sm text-base-content/60">
                            {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {order.totals.total.toLocaleString('fr-FR')} FCFA
                          </div>
                          <div className={`badge badge-sm ${
                            order.status === 'completed' ? 'badge-success' :
                            order.status === 'cancelled' ? 'badge-error' :
                            'badge-warning'
                          }`}>
                            {order.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-base-content/20 mb-4" />
                <p className="text-base-content/60">Aucune commande</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Statistiques */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-title text-xs">Total commandes</div>
                <div className="stat-value text-2xl text-primary">
                  {supplier.stats?.totalOrders || 0}
                </div>
              </div>

              <div className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-title text-xs">Total dépensé</div>
                <div className="stat-value text-xl text-success">
                  {(supplier.stats?.totalSpent || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                </div>
                <div className="stat-desc">FCFA</div>
              </div>

              <div className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-title text-xs">Panier moyen</div>
                <div className="stat-value text-xl">
                  {(supplier.stats?.averageOrderValue || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                </div>
                <div className="stat-desc">FCFA</div>
              </div>

              <div className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-title text-xs">Livraison à temps</div>
                <div className="stat-value text-2xl text-warning">
                  {(supplier.stats?.onTimeDeliveryRate || 0).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Ratings */}
            {supplier.rating && (
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title text-lg flex items-center gap-2">
                    <Star size={20} />
                    Évaluations
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {supplier.rating.overall > 0 && (
                      <div>
                        <div className="text-sm text-base-content/60">Global</div>
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-lg">{supplier.rating.overall.toFixed(1)}</div>
                          <div className="rating rating-sm">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={i < Math.round(supplier.rating.overall) ? 'fill-warning text-warning' : 'text-base-content/20'}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {supplier.rating.quality > 0 && (
                      <div>
                        <div className="text-sm text-base-content/60">Qualité</div>
                        <div className="font-semibold">{supplier.rating.quality.toFixed(1)} / 5</div>
                      </div>
                    )}
                    {supplier.rating.delivery > 0 && (
                      <div>
                        <div className="text-sm text-base-content/60">Livraison</div>
                        <div className="font-semibold">{supplier.rating.delivery.toFixed(1)} / 5</div>
                      </div>
                    )}
                    {supplier.rating.pricing > 0 && (
                      <div>
                        <div className="text-sm text-base-content/60">Prix</div>
                        <div className="font-semibold">{supplier.rating.pricing.toFixed(1)} / 5</div>
                      </div>
                    )}
                    {supplier.rating.service > 0 && (
                      <div>
                        <div className="text-sm text-base-content/60">Service</div>
                        <div className="font-semibold">{supplier.rating.service.toFixed(1)} / 5</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Last Order */}
            {supplier.stats?.lastOrderDate && (
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title text-lg flex items-center gap-2">
                    <Calendar size={20} />
                    Dernière commande
                  </h3>
                  <div className="font-semibold">
                    {new Date(supplier.stats.lastOrderDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </Modal>
  );
};

export default SupplierDetailsModal;