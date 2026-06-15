import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, FileText, Scale, AlertTriangle } from "lucide-react";

const sections = [
  {
    icon: FileText,
    title: "1. Objet",
    content:
      "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme StockWise, éditée par Darren Jonathan NDONGO NDONGO. En créant un compte, vous acceptez sans réserve l'intégralité des présentes conditions.",
  },
  {
    icon: Scale,
    title: "2. Services proposés",
    content:
      "StockWise est une solution de gestion de stock et d'orchestration prédictive. Elle offre notamment : la gestion de catalogue produits, le suivi des ventes et mouvements de stock, les alertes intelligentes, l'analyse IA des données, la génération de factures, et les intégrations de paiement mobile. Les fonctionnalités disponibles varient selon le plan souscrit (Starter, Pro, Enterprise).",
  },
  {
    icon: Shield,
    title: "3. Création de compte et responsabilités",
    content:
      "Vous êtes responsable de la confidentialité de vos identifiants. Toute action effectuée depuis votre compte vous est imputable. Vous vous engagez à fournir des informations exactes et à les mettre à jour en cas de modification. StockWise se réserve le droit de suspendre tout compte en cas d'utilisation abusive ou frauduleuse.",
  },
  {
    icon: AlertTriangle,
    title: "4. Obligations de l'utilisateur",
    content:
      "L'utilisateur s'interdit de : (a) utiliser la plateforme à des fins illégales, (b) tenter de contourner les limitations techniques ou de sécurité, (c) reproduire, copier ou détourner tout ou partie du service sans autorisation, (d)导入 ou stocker des données illicites via la plateforme.",
  },
  {
    icon: Scale,
    title: "5. Propriété intellectuelle",
    content:
      "L'ensemble du code source, des designs, des marques et du contenu de StockWise est protégé par le droit d'auteur et la propriété intellectuelle. Aucune reproduction, modification ou redistribution n'est autorisée sans accord écrit préalable. Les données que vous importez restent votre propriété.",
  },
  {
    icon: Shield,
    title: "6. Protection des données",
    content:
      "StockWise s'engage à protéger vos données personnelles conformément à la loi Informatique et Libertés et au Règlement Général sur la Protection des Données (RGPD). Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour toute demande, contactez-nous à contact@stockwise.app.",
  },
  {
    icon: AlertTriangle,
    title: "7. Limitation de responsabilité",
    content:
      "StockWise ne saurait être tenu responsable des dommages indirects résultant de l'utilisation du service, notamment les pertes de données, de chiffre d'affaires ou d'exploitation. La plateforme est fournie \"en l'état\" sans garantie absolue de disponibilité continue. Des interruptions peuvent survenir pour maintenance ou cas de force majeure.",
  },
  {
    icon: Scale,
    title: "8. Modification des conditions",
    content:
      "Les présentes conditions peuvent être modifiées à tout moment. Les utilisateurs seront informés par email ou notification dans la plateforme. L'utilisation continue du service après modification vaut acceptation des nouvelles conditions.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-base-200/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-base-content/50 hover:text-base-content transition-colors no-underline"
          >
            <ArrowLeft size={16} /> Retour à l'accueil
          </Link>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black font-display">
              Conditions d'utilisation
            </h1>
            <p className="text-base-content/60 mt-2">
              Dernière mise à jour : 15 juin 2026
            </p>
          </div>

          <p className="text-base-content/70 leading-relaxed">
            Veuillez lire attentivement les présentes conditions générales
            d'utilisation avant d'utiliser la plateforme StockWise.
            En accédant ou en utilisant nos services, vous acceptez
            d'être lié par ces conditions.
          </p>
        </motion.div>

        <div className="space-y-4">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card bg-base-100 shadow-sm border border-base-content/5"
            >
              <div className="card-body p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <section.icon size={20} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-display font-bold text-lg">
                      {section.title}
                    </h2>
                    <p className="text-sm sm:text-base text-base-content/70 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card bg-base-200/50 border border-base-content/5"
        >
          <div className="card-body p-6 text-center">
            <p className="text-sm text-base-content/50">
              Pour toute question relative aux conditions d'utilisation,
              contactez-nous à{" "}
              <a
                href="mailto:contact@stockwise.app"
                className="text-primary hover:text-primary/80 font-medium"
              >
                contact@stockwise.app
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
