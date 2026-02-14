const Alert = require("../models/Alert");
const Stock = require("../models/Stock");
const Product = require("../models/Product");

class AlertService {
  /**
   * Créer alerte stock bas
   */
  static async createLowStockAlert(stock, product) {
    return Alert.createAlert({
      organization: stock.organization,
      type: "low_stock",
      severity: stock.quantity <= stock.minThreshold / 2 ? "critical" : "high",
      title: `Stock bas: ${product.name}`,
      message: `Le stock de ${product.name} est bas (${stock.quantity} ${product.unit}). Seuil minimum: ${stock.minThreshold}`,
      relatedTo: {
        model: "Stock",
        id: stock._id,
        name: product.name,
      },
      actionRequired: true,
      actionUrl: `/inventory/products/${product._id}`,
      actionLabel: "Réapprovisionner",
      metadata: {
        currentQuantity: stock.quantity,
        minThreshold: stock.minThreshold,
        productSku: product.sku,
      },
    });
  }

  /**
   * Créer alerte rupture de stock
   */
  static async createOutOfStockAlert(stock, product) {
    return Alert.createAlert({
      organization: stock.organization,
      type: "out_of_stock",
      severity: "critical",
      title: `Rupture de stock: ${product.name}`,
      message: `${product.name} est en rupture de stock. Commande urgente nécessaire.`,
      relatedTo: {
        model: "Stock",
        id: stock._id,
        name: product.name,
      },
      actionRequired: true,
      actionUrl: `/orders/create?product=${product._id}`,
      actionLabel: "Commander maintenant",
      metadata: {
        productSku: product.sku,
      },
    });
  }

  /**
   * Créer alerte produit expirant bientôt
   */
  static async createExpiringProductAlert(product, stock, daysUntilExpiry) {
    return Alert.createAlert({
      organization: stock.organization,
      type: "expiring_soon",
      severity: daysUntilExpiry <= 3 ? "high" : "medium",
      title: `Produit expirant bientôt: ${product.name}`,
      message: `${product.name} expire dans ${daysUntilExpiry} jour(s). Quantité: ${stock.quantity}`,
      relatedTo: {
        model: "Product",
        id: product._id,
        name: product.name,
      },
      actionRequired: true,
      actionUrl: `/inventory/products/${product._id}`,
      actionLabel: "Voir détails",
      metadata: {
        daysUntilExpiry,
        quantity: stock.quantity,
        shelfLife: product.metadata.shelfLife,
      },
      expiresAt: new Date(Date.now() + daysUntilExpiry * 24 * 60 * 60 * 1000),
    });
  }

  /**
   * Créer alerte anomalie
   */
  static async createAnomalyAlert(organizationId, title, message, metadata) {
    return Alert.createAlert({
      organization: organizationId,
      type: "anomaly",
      severity: "high",
      title,
      message,
      actionRequired: true,
      metadata,
    });
  }

  /**
   * Créer alerte nouvelle commande
   */
  static async createNewOrderAlert(order) {
    return Alert.createAlert({
      organization: order.organization,
      type: "new_order",
      severity: "low",
      title: `Nouvelle commande: ${order.orderNumber}`,
      message: `Commande ${order.type === "purchase" ? "d'achat" : "de vente"} de ${order.totals.total} XAF reçue`,
      relatedTo: {
        model: "Order",
        id: order._id,
        name: order.orderNumber,
      },
      actionUrl: `/orders/${order._id}`,
      actionLabel: "Voir commande",
      metadata: {
        orderType: order.type,
        total: order.totals.total,
        itemsCount: order.items.length,
      },
    });
  }

  /**
   * Créer alerte changement statut commande
   */
  static async createOrderStatusAlert(order, newStatus) {
    const severityMap = {
      confirmed: "low",
      processing: "medium",
      completed: "low",
      cancelled: "medium",
    };

    return Alert.createAlert({
      organization: order.organization,
      type: "order_status",
      severity: severityMap[newStatus] || "low",
      title: `Commande ${order.orderNumber}: ${newStatus}`,
      message: `Le statut de la commande ${order.orderNumber} a changé à "${newStatus}"`,
      relatedTo: {
        model: "Order",
        id: order._id,
        name: order.orderNumber,
      },
      actionUrl: `/orders/${order._id}`,
      metadata: {
        previousStatus: order.status,
        newStatus,
      },
    });
  }

  /**
   * Créer alerte insight IA
   */
  static async createAIInsightAlert(organizationId, insight) {
    return Alert.createAlert({
      organization: organizationId,
      type: "ai_insight",
      severity: "medium",
      title: insight.title,
      message: insight.message,
      actionRequired: insight.actionRequired || false,
      actionUrl: insight.actionUrl,
      actionLabel: insight.actionLabel,
      metadata: insight.metadata,
    });
  }

  /**
   * Vérifier et créer alertes stock pour tous les produits
   */
  static async checkStockAlerts(organizationId) {
    const stocks = await Stock.find({
      organization: organizationId,
    }).populate("product");

    const alerts = [];

    for (const stock of stocks) {
      if (!stock.product) continue;

      // Rupture de stock
      if (stock.quantity === 0) {
        alerts.push(await this.createOutOfStockAlert(stock, stock.product));
      }
      // Stock bas
      else if (stock.quantity <= stock.minThreshold) {
        alerts.push(await this.createLowStockAlert(stock, stock.product));
      }

      // Produits périssables expirant
      if (
        stock.product.metadata.perishable &&
        stock.product.metadata.shelfLife
      ) {
        // Calculer jours restants (logique simplifiée)
        const daysUntilExpiry = 5; // TODO: Calculer réellement

        if (daysUntilExpiry <= 7) {
          alerts.push(
            await this.createExpiringProductAlert(
              stock.product,
              stock,
              daysUntilExpiry,
            ),
          );
        }
      }
    }

    return alerts;
  }
}

module.exports = AlertService;
