import React from 'react';
import Modal from '../Modal';
import { 
  Package, 
  Tag, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const ProductDetailsModal = ({ isOpen, onClose, product }) => {
  if (!product) return null;

  const getStatusBadge = () => {
    const stock = product.stock;
    
    if (!stock) {
      return { class: 'badge-ghost', text: 'Non défini', icon: AlertTriangle };
    }

    const quantity = stock.quantity || 0;
    const minThreshold = stock.minThreshold || 0;

    if (quantity === 0) {
      return { class: 'badge-ghost', text: 'Rupture', icon: AlertTriangle };
    } else if (quantity <= minThreshold / 2) {
      return { class: 'badge-error', text: 'Critique', icon: AlertTriangle };
    } else if (quantity <= minThreshold) {
      return { class: 'badge-warning', text: 'Stock bas', icon: AlertTriangle };
    } else {
      return { class: 'badge-success', text: 'En stock', icon: CheckCircle };
    }
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  const profitMargin = product.pricing?.cost && product.pricing?.sellingPrice
    ? (((product.pricing.sellingPrice - product.pricing.cost) / product.pricing.cost) * 100).toFixed(2)
    : 0;

  const profit = product.pricing?.sellingPrice && product.pricing?.cost
    ? (product.pricing.sellingPrice - product.pricing.cost)
    : 0;

  const totalValue = (product.stock?.quantity || 0) * (product.pricing?.sellingPrice || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails du produit"
      size="lg"
    >
      <div className="space-y-6">
        
        {/* Header avec image */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Image */}
          <div className="avatar placeholder">
            <div className="bg-neutral-focus text-neutral-content rounded-xl w-32 h-32">
              {product.image?.url ? (
                <img src={product.image.url} alt={product.name} className="object-cover" />
              ) : (
                <Package size={48} />
              )}
            </div>
          </div>

          {/* Info principale */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <div className={`badge ${statusBadge.class} gap-2`}>
                <StatusIcon size={14} />
                {statusBadge.text}
              </div>
              {product.category && (
                <div className="badge badge-ghost">
                  {product.category.name}
                </div>
              )}
              {product.metadata?.perishable && (
                <div className="badge badge-warning">Périssable</div>
              )}
              {product.metadata?.seasonal && (
                <div className="badge badge-info">Saisonnier</div>
              )}
            </div>

            {product.description && (
              <p className="text-base-content/70">{product.description}</p>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-figure text-primary">
              <Package size={32} />
            </div>
            <div className="stat-title">Stock disponible</div>
            <div className="stat-value text-primary">
              {product.stock?.quantity || 0}
            </div>
            <div className="stat-desc">{product.unit}</div>
          </div>

          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-figure text-success">
              <DollarSign size={32} />
            </div>
            <div className="stat-title">Prix de vente</div>
            <div className="stat-value text-success text-2xl">
              {(product.pricing?.sellingPrice || 0).toLocaleString('fr-FR')}
            </div>
            <div className="stat-desc">FCFA</div>
          </div>

          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-figure text-secondary">
              <TrendingUp size={32} />
            </div>
            <div className="stat-title">Valeur totale</div>
            <div className="stat-value text-secondary text-2xl">
              {totalValue.toLocaleString('fr-FR')}
            </div>
            <div className="stat-desc">FCFA</div>
          </div>
        </div>

        {/* Informations détaillées */}
        <div className="space-y-4">
          
          {/* Identification */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title text-lg">Identification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-base-content/60">SKU</div>
                  <div className="font-mono font-semibold">
                    {product.sku || 'Non défini'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-base-content/60">Unité</div>
                  <div className="font-semibold capitalize">{product.unit}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Prix */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title text-lg flex items-center gap-2">
                <DollarSign size={20} />
                Tarification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-base-content/60">Prix d'achat</div>
                  <div className="font-semibold text-lg">
                    {(product.pricing?.cost || 0).toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
                <div>
                  <div className="text-sm text-base-content/60">Prix de vente</div>
                  <div className="font-semibold text-lg text-success">
                    {(product.pricing?.sellingPrice || 0).toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
                <div>
                  <div className="text-sm text-base-content/60">Marge bénéficiaire</div>
                  <div className="font-semibold text-lg text-primary">
                    {profitMargin}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-base-content/60">Bénéfice par unité</div>
                  <div className="font-semibold text-lg">
                    {profit.toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
                {product.pricing?.taxRate > 0 && (
                  <div>
                    <div className="text-sm text-base-content/60">Taux de taxe</div>
                    <div className="font-semibold">{product.pricing.taxRate}%</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stock */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title text-lg flex items-center gap-2">
                <Package size={20} />
                Gestion du stock
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-base-content/60">Quantité actuelle</div>
                  <div className="font-semibold text-lg">
                    {product.stock?.quantity || 0} {product.unit}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-base-content/60">Seuil minimum</div>
                  <div className="font-semibold">
                    {product.stock?.minThreshold || 0} {product.unit}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-base-content/60">Seuil maximum</div>
                  <div className="font-semibold">
                    {product.stock?.maxThreshold || 0} {product.unit}
                  </div>
                </div>
                {product.stock?.location && (
                  <div>
                    <div className="text-sm text-base-content/60 flex items-center gap-1">
                      <MapPin size={14} />
                      Localisation
                    </div>
                    <div className="font-semibold">{product.stock.location}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Métadonnées */}
          {(product.metadata?.perishable || product.metadata?.seasonal) && (
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg">Informations complémentaires</h3>
                <div className="space-y-2">
                  {product.metadata.perishable && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-warning" />
                      <span>Produit périssable</span>
                      {product.metadata.shelfLife && (
                        <span className="badge badge-warning">
                          Durée: {product.metadata.shelfLife} jours
                        </span>
                      )}
                    </div>
                  )}
                  {product.metadata.seasonal && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-info" />
                      <span>Produit saisonnier</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dates */}
          {(product.createdAt || product.updatedAt) && (
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg flex items-center gap-2">
                  <Calendar size={20} />
                  Historique
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.createdAt && (
                    <div>
                      <div className="text-sm text-base-content/60">Créé le</div>
                      <div className="font-semibold">
                        {new Date(product.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  )}
                  {product.updatedAt && (
                    <div>
                      <div className="text-sm text-base-content/60">Dernière modification</div>
                      <div className="font-semibold">
                        {new Date(product.updatedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </Modal>
  );
};

export default ProductDetailsModal;