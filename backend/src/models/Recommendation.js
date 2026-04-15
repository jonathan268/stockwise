import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    type: {
      type: String,
      enum: ["restock", "popular", "dead_stock", "bundle"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    actionLabel: { type: String },
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    data: { type: mongoose.Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
    isDismissed: { type: Boolean, default: false },
    expiresAt: { type: Date },
  },
  { timestamps: true },
);

recommendationSchema.index({ organizationId: 1, createdAt: -1 });

export default mongoose.model("Recommendation", recommendationSchema);
