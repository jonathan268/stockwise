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

// Note: Nettoyer l'ancien index s'il existe (pour éviter l'erreur E11000)
subscriptionSchema.post('init', async function() {
  try {
    await mongoose.connection.collections['subscriptions'].dropIndex('organization_1');
  } catch (err) {
    // Index non trouvé, silencieuse l'erreur
  }
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

// On essaie de supprimer l'index au chargement du modèle aussi, pour être sûr
Subscription.collection.dropIndex('organization_1').catch(() => {});

export default Subscription;
