import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: ["starter", "pro", "enterprise"],
      default: "starter",
    },
    status: {
      type: String,
      enum: ["trial", "active", "past_due", "cancelled", "expired"],
      default: "trial",
    },
    trialEndsAt: { type: Date },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelledAt: { type: Date },
    gracePeriodEndsAt: { type: Date },
    notchpayCustomerId: { type: String },

    invoices: [
      {
        reference: { type: String, required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: "XAF" },
        status: {
          type: String,
          enum: ["pending", "complete", "failed", "cancelled"],
        },
        paidAt: { type: Date },
        channel: { type: String },
      },
    ],
  },
  { timestamps: true },
);



export default mongoose.model("Subscription", subscriptionSchema);
