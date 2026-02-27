const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    // Multi-tenant
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    // Type de transaction
    type: {
      type: String,
      enum: [
        "sale",
        "purchase",
        "adjustment",
        "return",
        "loss",
        "transfer_in",
        "transfer_out",
        "damage",
      ],
      required: true,
      index: true,
    },

    // Produit concerné
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    // Référence (commande, bon, etc.)
    reference: {
      type: String,
      trim: true,
    },

    // Quantité modifiée
    quantity: {
      type: Number,
      required: true,
    },

    // Valeur unitaire
    unitPrice: {
      type: Number,
      default: 0,
    },

    // Valeur totale
    totalValue: {
      type: Number,
      default: function () {
        return this.quantity * this.unitPrice;
      },
    },

    // Motif (ajustement, raison perte, etc.)
    reason: {
      type: String,
      trim: true,
    },

    // Emplacement/Stock impliqué
    location: {
      type: String,
      default: "Principal",
    },

    // Utilisateur qui a créé la transaction
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Notes supplémentaires
    notes: {
      type: String,
      trim: true,
    },

    // Date de la transaction
    transactionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Métadonnées additionnelles
    metadata: {
      orderId: mongoose.Schema.Types.ObjectId,
      supplierId: mongoose.Schema.Types.ObjectId,
      customerId: mongoose.Schema.Types.ObjectId,
      batchNumber: String,
      expiryDate: Date,
    },

    // État/Statut
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled", "reversed"],
      default: "completed",
    },
  },
  {
    timestamps: true,
    collection: "transactions",
  },
);

// Index pour recherche rapide
transactionSchema.index({ organization: 1, product: 1, transactionDate: -1 });
transactionSchema.index({ organization: 1, type: 1, transactionDate: -1 });
transactionSchema.index({ organization: 1, createdBy: 1, transactionDate: -1 });

// Méthod pour récupérer les transactions par période
transactionSchema.statics.getByDateRange = function (
  organizationId,
  startDate,
  endDate,
) {
  return this.find({
    organization: organizationId,
    transactionDate: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .populate("product", "name sku")
    .populate("createdBy", "firstName lastName");
};

// Méthode pour calculer les totaux par type
transactionSchema.statics.getSummary = function (organizationId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        organization: new mongoose.Types.ObjectId(organizationId),
        transactionDate: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        totalQuantity: { $sum: "$quantity" },
        totalValue: { $sum: "$totalValue" },
      },
    },
  ]);
};

module.exports = mongoose.model("Transaction", transactionSchema);
