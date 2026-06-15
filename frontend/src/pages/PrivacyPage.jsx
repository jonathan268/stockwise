import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Database, Mail, Trash2, Cookie } from "lucide-react";

const sections = [
  {
    icon: Shield,
    title: "1. Données collectées",
    content:
      "Nous collectons les données nécessaires au fonctionnement de la plateforme : nom, prénom, adresse email, nom de l'organisation, et informations de paiement. Nous collectons également les données relatives à votre activité sur StockWise (produits, ventes, mouvements de stock) afin de fournir le service. Ces données sont stockées de manière sécurisée sur des serveurs situés en Europe.",
  },
  {
    icon: Eye,
    title: "2. Utilisation des données",
    content:
      "Vos données sont utilisées uniquement pour : (a) fournir et améliorer nos services, (b) générer des analyses et recommandations via notre IA, (c) vous contacter pour des informations administratives ou techniques, (d) respecter nos obligations légales et réglementaires. Nous n'utilisons pas vos données à des fins publicitaires sans votre consentement explicite.",
  },
  {
    icon: Lock,
    title: "3. Sécurité des données",
    content:
      "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction. Cela inclut le chiffrement des données en transit (TLS 1.3) et au repos (AES-256), des contrôles d'accès stricts, et des audits de sécurité réguliers.",
  },
  {
    icon: Database,
    title: "4. Partage des données",
    content:
      "Nous ne vendons pas vos données personnelles à des tiers. Vos données peuvent être partagées avec : (a) nos sous-traitants techniques (hébergement, paiement) dans le cadre strict de leurs prestations, (b) les autorités compétentes si la loi l'exige. Les données d'IA sont traitées via Google Gemini API sans être utilisées pour l'entraînement des modèles.",
  },
  {
    icon: Mail,
    title: "5. Vos droits",
    content:
      "Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants : droit d'accès, de rectification, d'effacement, à la limitation du traitement, à la portabilité des données, et d'opposition. Pour exercer ces droits, contactez-nous à contact@stockwise.app. Nous répondons à toute demande sous 30 jours maximum.",
  },
  {
    icon: Trash2,
    title: "6. Conservation et suppression",
    content:
      "Vos données sont conservées pendant toute la durée de votre abonnement actif. Après résiliation, elles sont conservées 90 jours avant suppression définitive, sauf obligation légale de conservation. Vous pouvez demander la suppression anticipée de vos données à tout moment en nous contactant.",
  },
  {
    icon: Cookie,
    title: "7. Cookies et traceurs",
    content:
      "Nous utilisons des cookies strictement nécessaires au fonctionnement de la plateforme (session, authentification). Des cookies analytics sont utilisés avec votre consentement pour améliorer nos services. Vous pouvez gérer vos préférences à tout moment via notre politique de cookies. Aucun cookie publicitaire n'est utilisé.",
  },
];

export default function PrivacyPage() {
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
              Politique de confidentialité
            </h1>
            <p className="text-base-content/60 mt-2">
              Dernière mise à jour : 15 juin 2026
            </p>
          </div>

          <p className="text-base-content/70 leading-relaxed">
            StockWise accorde une importance primordiale à la protection de
            vos données personnelles. La présente politique décrit comment
            nous collectons, utilisons et protégeons vos informations lorsque
            vous utilisez notre plateforme.
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
          <div className="card-body p-6 text-center space-y-2">
            <p className="text-sm text-base-content/50">
              Pour toute question relative à vos données personnelles,
              contactez notre Délégué à la Protection des Données :
            </p>
            <a
              href="mailto:contact@stockwise.app"
              className="text-primary hover:text-primary/80 font-medium text-sm"
            >
              contact@stockwise.app
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
