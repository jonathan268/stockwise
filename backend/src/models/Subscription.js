const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "canceled", "expired", "trial", "past_due"],
      default: "trial",
    },
    startsAt: {
      type: Date,
      required: true,
    },
    endsAt: {
      type: Date,
    },
    trialEndsAt: {
      type: Date,
    },
    canceledAt: {
      type: Date,
    },
    paymentMethod: {
      type: {
        type: String,
      },
      customerId: String,
      subscriptionId: String,
    },
  },
  {
    timestamps: true,
  },
);

// Index pour recherche rapide
subscriptionSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("Subscription", subscriptionSchema);
