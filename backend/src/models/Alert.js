import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    type: {
      type: String,
      enum: ["low_stock", "out_of_stock", "ai_recommendation", "system"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "error"],
      default: "warning",
    },
    message: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    readBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

alertSchema.index({ organizationId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Alert", alertSchema);
