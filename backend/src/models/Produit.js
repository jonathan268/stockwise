const mongoose = require("mongoose");
const produitSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true, // Index pour performance
    },

    quantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },

    fournisseur: {
      type: String,
    },

    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    montant: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },

    category: String,
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true },
);

produitSchema.index({ tenantId: 1, sku: 1 }, { unique: true });

module.exports = mongoose.model("Produit", produitSchema);
