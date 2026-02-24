import React from 'react';
import Modal from '../Modal';
import { 
  Package, 
  User, 
  Calendar,
  DollarSign,
  Truck,
  FileText,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  const getStatusBadge = (status) => {
    const badges = {
      draft: { class: 'badge-ghost', text: 'Brouillon', icon: FileText },
      pending: { class: 'badge-warning', text: 'En attente', icon: Clock },
      confirmed: { class: 'badge-info', text: 'Confirmée', icon: CheckCircle },
      processing: { class: 'badge-primary', text: 'En traitement', icon: Package },
      completed: { class: 'badge-success', text: 'Complétée', icon: CheckCircle },
      cancelled: { class: 'badge-error', text: 'Annulée', icon: XCircle }
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

  const statusBadge = getStatusBadge(order.status);
  const paymentBadge = getPaymentStatusBadge(order.paymentStatus);
  const StatusIcon = statusBadge.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Commande ${order.orderNumber}`}
      size="xl"
    >
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <div className={`badge ${statusBadge.class} gap-2`}>
              <StatusIcon size={14} />
              {statusBadge.text}
            </div>
            <div className={`badge ${paymentBadge.class}`}>
              {paymentBadge.text}
            </div>
            <div className="badge badge-ghost">
              {order.type === 'purchase' ? 'Achat' : 'Vente'}
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-success">
              {order.totals.total.toLocaleString('fr-FR')} FCFA
            </div>
            <div className="text-sm text-base-content/60">
              {new Date(order.orderDate).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>

        {/* Client/Fournisseur */}
        {order.type === 'purchase' && order.supplier && (
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title text-lg flex items-center gap-2">
                <Package size={20} />
                Fournisseur
              </h3>
              <div>
                <div className="font-semibold text-lg">{order.supplier.name}</div>
                {order.supplier.email && (
                  <div className="text-sm text-base-content/60">{order.supplier.email}</div>
                )}
                {order.supplier.phone && (
                  <div className="text-sm text-base-content/60">{order.supplier.phone}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {order.type === 'sale' && order.customer && (
          <div className="card bg-base-200">
            <div className="card-body">
          <h3 className="card-title text-lg flex items-center gap-2">
            <User size={20} />
            Client
          </h3>
          <div>
            <div className="font-semibold text-lg">{order.customer.name}</div>
            {order.customer.email && (
              <div className="text-sm text-base-content/60">{order.customer.email}</div>
            )}
            {order.customer.phone && (
              <div className="text-sm text-base-content/60">{order.customer.phone}</div>
            )}
            {order.customer.address?.city && (
              <div className="text-sm text-base-content/60">{order.customer.address.city}</div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Articles */}
    <div className="card bg-base-200">
      <div className="card-body">
        <h3 className="card-title text-lg mb-4">Articles</h3>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Remise</th>
                <th>Taxe</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="font-medium">
                      {item.productSnapshot?.name || item.product?.name || 'Produit'}
                    </div>
                    <div className="text-sm text-base-content/60">
                      {item.productSnapshot?.sku || item.product?.sku}
                    </div>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{item.unitPrice.toLocaleString('fr-FR')} FCFA</td>
                  <td>{item.discount}%</td>
                  <td>{item.taxRate}%</td>
                  <td className="text-right font-semibold">
                    {item.total.toLocaleString('fr-FR')} FCFA
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Totaux */}
    <div className="card bg-base-200">
      <div className="card-body">
        <h3 className="card-title text-lg mb-4">Totaux</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Sous-total:</span>
            <span className="font-semibold">
              {order.totals.subtotal.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
          {order.totals.discount > 0 && (
            <div className="flex justify-between text-warning">
              <span>Remise ({order.totals.discountPercentage}%):</span>
              <span className="font-semibold">
                - {order.totals.discount.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Taxes:</span>
            <span className="font-semibold">
              {order.totals.tax.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
          {order.totals.shipping > 0 && (
            <div className="flex justify-between">
              <span>Livraison:</span>
              <span className="font-semibold">
                {order.totals.shipping.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          )}
          <div className="divider my-2"></div>
          <div className="flex justify-between text-xl">
            <span className="font-bold">TOTAL:</span>
            <span className="font-bold text-success">
              {order.totals.total.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Paiement */}
    <div className="card bg-base-200">
      <div className="card-body">
        <h3 className="card-title text-lg flex items-center gap-2 mb-4">
          <DollarSign size={20} />
          Paiement
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-base-content/60">Méthode</div>
            <div className="font-semibold capitalize">
              {order.paymentMethod?.replace('_', ' ')}
            </div>
          </div>
          <div>
            <div className="text-sm text-base-content/60">Montant payé</div>
            <div className="font-semibold">
              {(order.paymentDetails?.paidAmount || 0).toLocaleString('fr-FR')} FCFA
            </div>
          </div>
          {order.remainingAmount > 0 && (
            <div>
              <div className="text-sm text-base-content/60">Reste à payer</div>
              <div className="font-semibold text-warning">
                {order.remainingAmount.toLocaleString('fr-FR')} FCFA
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Livraison */}
    {order.delivery && (
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title text-lg flex items-center gap-2 mb-4">
            <Truck size={20} />
            Livraison
          </h3>
          <div>
            <div className="text-sm text-base-content/60">Mode de livraison</div>
            <div className="font-semibold capitalize">
              {order.delivery.method?.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Notes */}
    {order.notes && (
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title text-lg mb-2">Notes</h3>
          <p className="text-base-content/80">{order.notes}</p>
        </div>
      </div>
    )}

    {/* Dates */}
    <div className="card bg-base-200">
      <div className="card-body">
        <h3 className="card-title text-lg flex items-center gap-2 mb-4">
          <Calendar size={20} />
          Historique
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-base-content/60">Date de commande</div>
            <div className="font-semibold">
              {new Date(order.orderDate).toLocaleString('fr-FR')}
            </div>
          </div>
          {order.completedAt && (
            <div>
              <div className="text-sm text-base-content/60">Date de complétion</div>
              <div className="font-semibold">
                {new Date(order.completedAt).toLocaleString('fr-FR')}
              </div>
            </div>
          )}
          {order.cancelledAt && (
            <div>
              <div className="text-sm text-base-content/60">Date d'annulation</div>
              <div className="font-semibold">
                {new Date(order.cancelledAt).toLocaleString('fr-FR')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

  </div>
</Modal>
);
};
export default OrderDetailsModal;
         