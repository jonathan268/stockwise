import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  vatRate: { type: Number, default: 0 },
});

const saleSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    saleNumber: { type: String, unique: true },
    items: [saleItemSchema],
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "mobile_money", "card", "credit"],
      default: "cash",
    },
    customerName: { type: String },
    note: { type: String },
    soldBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["completed", "cancelled", "refunded"],
      default: "completed",
    },
  },
  { timestamps: true },
);

saleSchema.index({ organizationId: 1, createdAt: -1 });

// Auto-générer le numéro de vente avec un composant aléatoire
saleSchema.pre("save", async function () {
  if (this.isNew) {
    const year = new Date().getFullYear();
    // Génère une chaîne aléatoire de 6 caractères alphanumériques
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.saleNumber = `SW-${year}-${randomPart}`;
  }
});

export default mongoose.model("Sale", saleSchema);
