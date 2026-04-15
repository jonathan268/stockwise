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

// Auto-générer le numéro de vente
saleSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose
      .model("Sale")
      .countDocuments({ organizationId: this.organizationId });
    const year = new Date().getFullYear();
    this.saleNumber = `SW-${year}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

export default mongoose.model("Sale", saleSchema);
