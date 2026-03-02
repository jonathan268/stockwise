import React, { useMemo } from "react";
import { CreditCard, AlertCircle, Clock, Zap } from "lucide-react";
import { useSubscription } from "../../hooks/useSubscribtion";

const SubscriptionBadge = () => {
  const { subscription, loading, error } = useSubscription();

  const { displayText, badgeColor, icon } = useMemo(() => {
    if (loading || !subscription) {
      return { displayText: "", badgeColor: "badge-info", icon: null };
    }

    let text = "";
    let color = "badge-info";
    let IconComponent = CreditCard;

    // Déterminer le texte et la couleur du badge
    if (subscription.status === "trial" && subscription.trial?.daysRemaining) {
      text = ` Essai: ${subscription.trial.daysRemaining}j restants`;
      color = "badge-warning";
      IconComponent = Clock;
    } else if (subscription.status === "active") {
      // Afficher le type de plan avec un emoji approprié
      const planNames = {
        free: "Gratuit",
        basic: "Starter",
        smart: "Pro",
        premium: "Entreprise",
      };
      text = ` ${planNames[subscription.plan] || subscription.plan}`;
      color = "badge-success";
      IconComponent = Zap;
    } else if (subscription.status === "past_due") {
      text = " Paiement en retard";
      color = "badge-error";
      IconComponent = AlertCircle;
    } else if (subscription.status === "expired") {
      text = " Abonnement expiré";
      color = "badge-error";
      IconComponent = AlertCircle;
    } else if (subscription.status === "cancelled") {
      text = " Annulé";
      color = "badge-neutral";
      IconComponent = AlertCircle;
    }

    return { displayText: text, badgeColor: color, icon: IconComponent };
  }, [subscription, loading]);

  if (loading) {
    return (
      <div className="gap-2 px-3 py-2 badge badge-ghost animate-pulse">
        <Clock size={16} />
        <span className="loading loading-spinner"></span>
      </div>
    );
  }

  if (error || !subscription) {
    return null;
  }

  const Icon = icon;

  return (
    <div
      className={`badge ${badgeColor} gap-2 px-3 py-2 font-semibold text-sm text-white cursor-pointer transition-all hover:shadow-md`}
      title={
        subscription.status === "trial"
          ? `Abonnement d'essai jusqu'au ${new Date(subscription.trial?.endDate).toLocaleDateString("fr-FR")}`
          : "Accéder aux paramètres d'abonnement"
      }
    >
      {Icon && <Icon size={16} />}
      {displayText}
    </div>
  );
};

export default SubscriptionBadge;
