import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: {
      type: String,
      enum: ["in", "out", "adjustment", "sale", "return"],
      required: true,
    },
    quantity: { type: Number, required: true },
    quantityBefore: { type: Number, required: true },
    quantityAfter: { type: Number, required: true },
    reason: { type: String },
    reference: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    saleId: { type: mongoose.Schema.Types.ObjectId, ref: "Sale" },
  },
  { timestamps: true },
);

stockMovementSchema.index({ organizationId: 1, product: 1, createdAt: -1 });

export default mongoose.model("StockMovement", stockMovementSchema);
