const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Snapshot des infos produit au moment de la commande
    productSnapshot: {
      name: String,
      sku: String,
      unit: String,
    },

    quantity: {
      type: Number,
      required: true,
      min: [1, "La quantité doit être au moins 1"],
    },

    unitPrice: {
      type: Number,
      required: true,
      min: [0, "Le prix unitaire ne peut pas être négatif"],
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100, // Pourcentage
    },

    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    subtotal: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      default: 0,
    },

    notes: String,
  },
  { _id: true },
);

const orderSchema = new mongoose.Schema(
  {
    // Multi-tenant
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    // Numéro de commande unique
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    // Type de commande
    type: {
      type: String,
      enum: ["purchase", "sale"],
      required: true,
    },

    // Fournisseur (si purchase)
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },

    // Client (si sale)
    customer: {
      name: String,
      email: String,
      phone: String,
      address: {
        street: String,
        city: String,
        country: String,
        postalCode: String,
      },
      taxId: String,
    },

    // Items de commande
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: "Une commande doit contenir au moins un article",
      },
    },

    // Totaux
    totals: {
      subtotal: {
        type: Number,
        default: 0,
        min: 0,
      },
      discount: {
        type: Number,
        default: 0,
        min: 0,
      },
      discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      tax: {
        type: Number,
        default: 0,
        min: 0,
      },
      shipping: {
        type: Number,
        default: 0,
        min: 0,
      },
      total: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    currency: {
      type: String,
      default: "XAF",
      enum: ["XAF", "EUR", "USD"],
    },

    // Statut commande
    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "confirmed",
        "processing",
        "completed",
        "cancelled",
      ],
      default: "draft",
    },

    // Statut paiement
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid", "refunded"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "mobile_money", "bank_transfer", "check", "credit"],
      default: "cash",
    },

    paymentDetails: {
      transactionId: String,
      paidAmount: {
        type: Number,
        default: 0,
        min: 0,
      },
      paidAt: Date,
      dueDate: Date,
    },

    // Livraison
    delivery: {
      method: {
        type: String,
        enum: ["pickup", "delivery", "shipping"],
      },
      address: {
        street: String,
        city: String,
        country: String,
        postalCode: String,
      },
      trackingNumber: String,
      estimatedDate: Date,
      deliveredAt: Date,
      notes: String,
    },

    // Dates
    orderDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    expectedDeliveryDate: Date,
    completedAt: Date,
    cancelledAt: Date,

    // Notes et références
    notes: {
      type: String,
      maxlength: 1000,
    },

    internalNotes: {
      type: String,
      maxlength: 1000,
    },

    reference: String, // Référence externe (bon de commande client, facture fournisseur, etc.)

    // Documents attachés
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Historique des changements de statut
    statusHistory: [
      {
        status: String,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],

    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Flags
    isRecurring: {
      type: Boolean,
      default: false,
    },

    recurringConfig: {
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
      },
      nextOrderDate: Date,
      endDate: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index composés
orderSchema.index({ organization: 1, orderNumber: 1 }, { unique: true });
orderSchema.index({ organization: 1, type: 1, status: 1 });
orderSchema.index({ organization: 1, orderDate: -1 });
orderSchema.index({ organization: 1, supplier: 1 });
orderSchema.index({ organization: 1, "customer.name": 1 });

// Virtual: Montant restant à payer
orderSchema.virtual("remainingAmount").get(function () {
  return this.totals.total - (this.paymentDetails.paidAmount || 0);
});

// Virtual: Statut paiement calculé
orderSchema.virtual("calculatedPaymentStatus").get(function () {
  const paid = this.paymentDetails.paidAmount || 0;
  const total = this.totals.total;

  if (paid === 0) return "pending";
  if (paid >= total) return "paid";
  return "partial";
});

// Hook: Générer orderNumber avant sauvegarde
orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    const prefix = this.type === "purchase" ? "PO" : "SO";
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    // Compter commandes du jour pour séquence
    const count = await this.constructor.countDocuments({
      organization: this.organization,
      type: this.type,
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    });

    const sequence = String(count + 1).padStart(4, "0");
    this.orderNumber = `${prefix}-${year}${month}${day}-${sequence}`;
  }

  next();
});

// Hook: Calculer totaux avant sauvegarde
orderSchema.pre("save", function (next) {
  if (this.isModified("items") || this.isNew) {
    // Calculer chaque item
    this.items.forEach((item) => {
      const subtotal = item.quantity * item.unitPrice;
      const discountAmount = (subtotal * item.discount) / 100;
      const subtotalAfterDiscount = subtotal - discountAmount;
      const taxAmount = (subtotalAfterDiscount * item.taxRate) / 100;

      item.subtotal = subtotal;
      item.total = subtotalAfterDiscount + taxAmount;
    });

    // Calculer totaux commande
    this.totals.subtotal = this.items.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );

    // Appliquer réduction globale
    const globalDiscountAmount =
      (this.totals.subtotal * this.totals.discountPercentage) / 100;
    this.totals.discount = globalDiscountAmount;

    const subtotalAfterDiscount = this.totals.subtotal - globalDiscountAmount;

    // Calculer taxes totales
    this.totals.tax = this.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = (itemSubtotal * item.discount) / 100;
      const itemTax = ((itemSubtotal - itemDiscount) * item.taxRate) / 100;
      return sum + itemTax;
    }, 0);

    // Total final
    this.totals.total =
      subtotalAfterDiscount + this.totals.tax + this.totals.shipping;
  }

  next();
});

// Hook: Mettre à jour stock quand statut change à 'completed'
orderSchema.post("save", async function (doc) {
  // Si statut passe à 'completed' et pas déjà traité
  if (doc.status === "completed" && !doc._wasCompleted) {
    const Stock = mongoose.model("Stock");
    const Transaction = mongoose.model("Transaction");

    for (const item of doc.items) {
      try {
        // Trouver stock
        const stock = await Stock.findOne({
          organization: doc.organization,
          product: item.product,
        });

        if (!stock) continue;

        // Calculer nouvelle quantité
        let newQuantity = stock.quantity;
        let transactionType;

        if (doc.type === "purchase") {
          newQuantity += item.quantity;
          transactionType = "purchase";
        } else if (doc.type === "sale") {
          newQuantity -= item.quantity;
          transactionType = "sale";
        }

        // Vérifier stock suffisant pour ventes
        if (doc.type === "sale" && newQuantity < 0) {
          console.error(`Stock insuffisant pour produit ${item.product}`);
          continue;
        }

        // Mettre à jour stock
        stock.quantity = newQuantity;
        stock.updatedBy = doc.confirmedBy || doc.createdBy;
        stock.addTransaction(
          transactionType,
          doc.type === "sale" ? -item.quantity : item.quantity,
          item.total,
          doc.orderNumber,
          `Commande ${doc.orderNumber}`,
        );

        await stock.save();

        // Créer transaction dans historique
        await Transaction.create({
          organization: doc.organization,
          product: item.product,
          type: transactionType,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalAmount: item.total,
          reference: doc.orderNumber,
          notes: `Commande ${doc.type === "purchase" ? "d'achat" : "de vente"} ${doc.orderNumber}`,
          performedBy: doc.confirmedBy || doc.createdBy,
          transactionDate: doc.completedAt || new Date(),
        });
      } catch (error) {
        console.error("Erreur mise à jour stock:", error);
      }
    }

    doc._wasCompleted = true;
  }
});

// Méthode: Ajouter item
orderSchema.methods.addItem = function (itemData) {
  this.items.push(itemData);
  return this;
};

// Méthode: Retirer item
orderSchema.methods.removeItem = function (itemId) {
  this.items = this.items.filter(
    (item) => item._id.toString() !== itemId.toString(),
  );
  return this;
};

// Méthode: Mettre à jour statut
orderSchema.methods.updateStatus = function (newStatus, userId, notes = "") {
  this.status = newStatus;
  this.updatedBy = userId;

  this.statusHistory.push({
    status: newStatus,
    changedBy: userId,
    notes,
  });

  if (newStatus === "completed") {
    this.completedAt = new Date();
    this.confirmedBy = userId;
  }

  if (newStatus === "cancelled") {
    this.cancelledAt = new Date();
  }

  return this;
};

// Méthode: Enregistrer paiement
orderSchema.methods.recordPayment = function (
  amount,
  method = "cash",
  transactionId = "",
) {
  const currentPaid = this.paymentDetails.paidAmount || 0;
  const newPaidAmount = currentPaid + amount;

  this.paymentDetails.paidAmount = newPaidAmount;
  this.paymentDetails.paidAt = new Date();

  if (method) {
    this.paymentMethod = method;
  }

  if (transactionId) {
    this.paymentDetails.transactionId = transactionId;
  }

  // Mettre à jour statut paiement
  if (newPaidAmount >= this.totals.total) {
    this.paymentStatus = "paid";
  } else if (newPaidAmount > 0) {
    this.paymentStatus = "partial";
  }

  return this;
};

// Méthode: Vérifier si peut être modifiée
orderSchema.methods.canBeModified = function () {
  return ["draft", "pending"].includes(this.status);
};

// Méthode: Vérifier si peut être annulée
orderSchema.methods.canBeCancelled = function () {
  return !["completed", "cancelled"].includes(this.status);
};

// Méthode statique: Statistiques commandes
orderSchema.statics.getOrderStats = async function (
  organizationId,
  startDate,
  endDate,
) {
  const match = {
    organization: organizationId,
    status: { $ne: "cancelled" },
  };

  if (startDate || endDate) {
    match.orderDate = {};
    if (startDate) match.orderDate.$gte = new Date(startDate);
    if (endDate) match.orderDate.$lte = new Date(endDate);
  }

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        totalAmount: { $sum: "$totals.total" },
        avgAmount: { $avg: "$totals.total" },
      },
    },
  ]);

  return stats;
};

module.exports = mongoose.model("Order", orderSchema);
