import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true },
    description: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    image: { type: String },

    // Prix
    sellingPrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    vatRate: { type: Number, default: 0, min: 0, max: 100 },

    // Stock
    currentStock: { type: Number, default: 0, min: 0 },
    minimumStock: { type: Number, default: 5, min: 0 },
    unit: { type: String, default: "unité" },

    // Statut
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

    // IA metrics
    salesVelocity: { type: Number, default: 0 },
    lastSoldAt: { type: Date },

    // Supplier
    preferredSupplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
  },
  { timestamps: true },
);

// Indexes
productSchema.index({ organizationId: 1, isDeleted: 1 });
productSchema.index(
  { organizationId: 1, sku: 1 },
  { unique: true, sparse: true },
);
productSchema.index({ organizationId: 1, salesVelocity: -1, currentStock: 1 });

// Auto-génération du SKU si non fourni
productSchema.pre("save", function () {
  if (!this.sku) {
    const slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 20);
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.sku = `SW-${slug}-${rand}`;
  }
});

// Virtual
productSchema.virtual("stockStatus").get(function () {
  if (this.currentStock === 0) return "out";
  if (this.currentStock <= this.minimumStock) return "low";
  return "ok";
});

productSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Product", productSchema);
