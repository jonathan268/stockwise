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
  },
  { timestamps: true },
);

// Indexes
productSchema.index({ organizationId: 1, isDeleted: 1 });
productSchema.index(
  { organizationId: 1, sku: 1 },
  { unique: true, sparse: true },
);

// Virtual
productSchema.virtual("stockStatus").get(function () {
  if (this.currentStock === 0) return "out";
  if (this.currentStock <= this.minimumStock) return "low";
  return "ok";
});

productSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Product", productSchema);
