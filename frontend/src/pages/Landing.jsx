import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Brain,
  Bell,
  Zap,
  ShieldCheck,
  Menu,
  CheckCircle,
  PlayCircle,
  Sparkles,
  BrainCircuit,
  Star,
  Check,
  Twitter,
  Facebook,
  Linkedin,
  Moon,
  Sun,
  X,
  ArrowRight,
  Rocket,
  BarChart3,
  Users,
  Home,
  CircuitBoard,
  Building,
} from "lucide-react";

// 🎬 Composant réutilisable : fade-in au scroll
function FadeInWhenVisible({
  children,
  delay = 0,
  direction = "up",
  className = "",
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
      x: direction === "left" ? 40 : direction === "right" ? -40 : 0,
      scale: direction === "scale" ? 0.85 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// 🎬 Composant réutilisable : enfants qui apparaissent en cascade
function StaggerChildren({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Landing() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("corporate");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => navigate("/register");
  const handleSignIn = () => navigate("/login");
  const toggleTheme = () =>
    setTheme(theme === "corporate" ? "business" : "corporate");

  return (
    <div
      data-theme={theme === "corporate" ? "corporate" : "business"}
      className="min-h-screen transition-colors duration-300 bg-base-100"
    >
      {/* ── Navbar : slide-down à l'ouverture ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-40 border-b shadow-lg navbar bg-base-100/80 backdrop-blur-lg border-base-300"
      >
        <div className="flex-1">
          <a
            className="gap-3 text-xl font-bold normal-case btn btn-ghost md:text-2xl"
            href="#"
          >
            <div className="p-2 rounded-lg bg-primary">
              <BrainCircuit className="w-6 h-6 text-base-100" />
            </div>
            <span className="hidden font-bold sm:inline text-primary">
              StockWise
            </span>
          </a>
        </div>
        <div className="hidden navbar-center lg:flex">
          <ul className="gap-1 menu menu-horizontal">
            <li>
              <a
                href="#home"
                className="transition-colors rounded-lg hover:bg-primary/10"
              >
                <Home size={20} />
                Acceuil
              </a>
            </li>
            <li>
              <a
                href="#features"
                className="transition-colors rounded-lg hover:bg-primary/10"
              >
                <CircuitBoard size={20} />
                Fonctionnalités
              </a>
            </li>
            <li>
              <a
                href="#pricing"
                className="transition-colors rounded-lg hover:bg-primary/10"
              >
                <Building size={20} />
                Abonnements
              </a>
            </li>
          </ul>
        </div>
        <div className="gap-2 navbar-end md:gap-4">
          {/* Toggle thème avec rotation */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle hover:bg-primary/20"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "corporate" ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleSignIn}
            className="hidden rounded-lg btn btn-ghost sm:inline-flex"
          >
            Connexion
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleGetStarted}
            className="gap-2 rounded-lg btn btn-primary"
          >
            <Rocket className="w-4 h-4" />
            Essai gratuit
          </motion.button>
          {/* Mobile menu avec AnimatePresence */}
          <div className="dropdown dropdown-end lg:hidden">
            <motion.button
              whileTap={{ scale: 0.9 }}
              tabIndex="0"
              className="btn btn-ghost btn-circle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={mobileMenuOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.ul
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  tabIndex="0"
                  className="p-2 border shadow dropdown-content z-1 menu bg-base-100 rounded-box w-52 border-base-300"
                >
                  <li>
                    <a
                      href="#features"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Fonctionnalités
                    </a>
                  </li>
                  <li>
                    <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>
                      Tarifs
                    </a>
                  </li>
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero : cascade de fade-in à l'ouverture ── */}
      <section
        id="home"
        className="relative min-h-screen pt-20 overflow-hidden hero bg-base-100"
      >
        <div className="relative z-10 flex-col max-w-4xl gap-12 text-center hero-content">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="gap-2 mx-auto mb-6 border-2 rounded-full badge badge-lg badge-ghost border-primary/30 animate-bounce"
            >
              <Sparkles className="w-4 h-4" />
              Propulsé par l'Intelligence Artificielle
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mb-6 text-5xl font-black leading-tight md:text-6xl lg:text-7xl"
            >
              <span className="block">Réduisez 95%</span>
              <span>des érreurs de stock</span>
              <span className="block">
                avec l'IA de <span className="text-primary">StockWise</span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="max-w-2xl mx-auto mb-8 text-lg leading-relaxed md:text-xl text-base-content/70"
            >
              Prédictions intelligentes, alertes automatisées et rapports en
              temps réel. Optimisez votre inventaire et augmentez votre
              efficacité operationnelle.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              className="flex flex-col justify-center gap-4 mb-8 sm:flex-row"
            >
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleGetStarted}
                className="gap-2 transition-all shadow-xl btn btn-lg btn-primary hover:shadow-2xl"
              >
                <Rocket className="w-5 h-5" />
                Commencer Gratuitement
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="gap-2 btn btn-lg btn-outline hover:bg-base-200"
              >
                <PlayCircle className="w-5 h-5" />
                Voir la démo
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-col justify-center gap-6 sm:flex-row"
            >
              {[
                "14 jours gratuit",
                "Aucune carte bancaire requise",
                "Support 24/7",
              ].map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="flex items-center justify-center gap-2"
                >
                  <div className="gap-1 rounded-full badge badge-success">
                    <CheckCircle className="w-4 h-4" />
                    {text}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats : stagger au scroll ── */}
      <section className="py-16 md:py-24 bg-base-200">
        <div className="container px-4 mx-auto">
          <StaggerChildren className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {[
              {
                value: "150+",
                label: "Entreprises actives",
                color: "text-primary",
              },
              {
                value: "99.9%",
                label: "Uptime garanti",
                color: "text-secondary",
              },
              {
                value: "95%",
                label: "Gain d'efficacité",
                color: "text-accent",
              },
              { value: "2M", label: "Stocks gérés", color: "text-warning" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={staggerItem}
                whileHover={{ y: -6, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="p-6 text-center rounded-lg shadow-lg cursor-default bg-base-100"
              >
                <div
                  className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2`}
                >
                  {stat.value}
                </div>
                <p className="font-medium text-base-content/70">{stat.label}</p>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Features : stagger + hover avec rotation d'icône ── */}
      <section id="features" className="py-16 md:py-24 bg-base-100">
        <div className="container px-4 mx-auto">
          <FadeInWhenVisible className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black md:text-5xl">
              Des features <span className="text-primary">magiques</span>
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-base-content/60">
              Tout ce dont vous avez besoin pour gérer votre stock
              intelligemment
            </p>
          </FadeInWhenVisible>
          <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Brain,
                title: "Prédictions IA",
                desc: "Anticipez les tendances et optimisez automatiquement vos commandes",
                color: "primary",
              },
              {
                icon: BarChart3,
                title: "Analyses en temps réel",
                desc: "Tableaux de bord dynamiques qui vous montrent ce qui se passe maintenant",
                color: "secondary",
              },
              {
                icon: Bell,
                title: "Alertes intelligentes",
                desc: "Recevez des notifications avant les problèmes, pas après",
                color: "accent",
              },
              {
                icon: Zap,
                title: "Automatisation complète",
                desc: "Économisez des heures avec des workflows automatisés",
                color: "warning",
              },
              {
                icon: ShieldCheck,
                title: "Sécurité maximum",
                desc: "Vos données sont encryptées et sauvegardées en toute sécurité",
                color: "success",
              },
              {
                icon: Users,
                title: "Collaboration d'équipe",
                desc: "Travaillez ensemble en temps réel avec votre équipe",
                color: "info",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  variants={staggerItem}
                  whileHover={{
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.2)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="cursor-pointer card bg-base-200"
                >
                  <div className="card-body rounded-xl">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className={`w-14 h-14 rounded-xl bg-${feature.color}/20 flex items-center justify-center mb-4`}
                    >
                      <Icon className={`w-7 h-7 text-${feature.color}`} />
                    </motion.div>
                    <h3 className="text-xl card-title">{feature.title}</h3>
                    <p className="text-base-content/70">{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Pricing : stagger + features qui glissent ── */}
      <section id="pricing" className="py-16 md:py-24 bg-base-200">
        <div className="container px-4 mx-auto">
          <FadeInWhenVisible className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black md:text-5xl">
              Tarifs <span className="text-primary">simples</span> et{" "}
              <span className="text-secondary">transparents</span>
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-base-content/60">
              Tous les plans incluent 14 jours gratuits. Aucune surprise.
            </p>
          </FadeInWhenVisible>
          <StaggerChildren
            className="grid max-w-6xl gap-6 mx-auto md:grid-cols-3"
            delay={0.1}
          >
            {[
              {
                name: "Starter",
                price: "3,000",
                desc: "Parfait pour démarrer",
                features: [
                  "Jusqu'à 100 produits",
                  "Alertes basiques",
                  "1 utilisateur",
                  "Rapports mensuels",
                  "Support par email",
                ],
              },
              {
                name: "Professionnel",
                price: "5,000",
                desc: "Pour les entreprises",
                popular: true,
                features: [
                  "Jusqu'à 500 produits",
                  "Prédictions IA avancées",
                  "5 utilisateurs",
                  "Rapports en temps réel",
                  "Support prioritaire 24/7",
                  "Intégrations API",
                ],
              },
              {
                name: "Enterprise",
                price: "15,000",
                desc: "Solution complète",
                features: [
                  "Produits illimités",
                  "IA personnalisée",
                  "Utilisateurs illimités",
                  "Gestionnaire dedié",
                  "Intégrations avancées",
                  "Formation personnalisée",
                ],
              },
            ].map((plan, idx) => (
              <motion.div
                key={idx}
                variants={staggerItem}
                whileHover={{
                  y: plan.popular ? -6 : -8,
                  scale: plan.popular ? 1.07 : 1.03,
                }}
                transition={{ type: "spring", stiffness: 280, damping: 20 }}
                className={`card transition-all ${plan.popular ? "ring-2 ring-primary shadow-2xl scale-105" : "shadow-lg"} bg-base-100`}
              >
                {plan.popular && (
                  <div className="absolute -translate-x-1/2 -top-4 left-1/2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.5 }}
                      className="gap-1 p-3 text-base badge badge-primary"
                    >
                      <Star className="w-4 h-4" />
                      Populaire
                    </motion.div>
                  </div>
                )}
                <div className="card-body">
                  <h3 className="text-2xl card-title">{plan.name}</h3>
                  <p className="text-sm text-base-content/60">{plan.desc}</p>
                  <div className="my-4">
                    <span className="text-5xl font-black text-primary">
                      {plan.price}
                    </span>
                    <span className="text-base-content/60"> FCFA/mois</span>
                  </div>
                  <ul className="mb-6 space-y-2">
                    {plan.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3"
                      >
                        <Check className="flex-shrink-0 w-5 h-5 text-success" />
                        <span className="text-sm">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleGetStarted}
                    className={`btn gap-2 ${plan.popular ? "btn-primary" : "btn-secondary"} w-full`}
                  >
                    Essayer
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── CTA : scale-in au scroll ── */}
      <section className="py-16 md:py-24 bg-base-100">
        <div className="container px-4 mx-auto">
          <FadeInWhenVisible direction="scale">
            <div className="max-w-3xl p-8 mx-auto text-center shadow-2xl bg-primary rounded-2xl md:p-16 text-primary-content">
              <h2 className="mb-6 text-4xl font-black md:text-5xl">
                Prêt à transformer votre gestion ?
              </h2>
              <p className="mb-8 text-lg md:text-xl opacity-90">
                Rejoignez des centaines d'entreprises qui font confiance à
                StockWise
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={handleGetStarted}
                  className="gap-2 btn btn-lg btn-white"
                >
                  <Rocket className="w-5 h-5" />
                  Commencer maintenant
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="gap-2 btn btn-lg btn-secondary"
                >
                  <PlayCircle className="w-5 h-5" />
                  Voir la démo
                </motion.button>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* ── Footer ── */}
      <FadeInWhenVisible>
        <footer className="bg-base-300 text-base-content">
          <div className="container px-4 py-12 mx-auto">
            <div className="grid gap-8 mb-8 md:grid-cols-5">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-primary">
                    <BrainCircuit className="w-5 h-5 text-base-100" />
                  </div>
                  <span className="text-lg font-bold">StockWise</span>
                </div>
                <p className="text-sm text-base-content/60">
                  L'IA au service de votre stock
                </p>
              </div>
              {[
                {
                  title: "Produit",
                  links: ["Fonctionnalités", "Tarifs", "Sécurité"],
                },
                {
                  title: "Entreprise",
                  links: ["À propos", "Blog", "Carrières"],
                },
                { title: "Support", links: ["Aide", "Contact", "Docs"] },
                {
                  title: "Légal",
                  links: ["Conditions", "Confidentialité", "Cookies"],
                },
              ].map((col, i) => (
                <div key={i}>
                  <h4 className="mb-4 font-bold">{col.title}</h4>
                  <ul className="space-y-2 text-sm">
                    {col.links.map((link, j) => (
                      <li key={j}>
                        <a className="link link-hover">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="divider"></div>
            <div className="flex flex-col items-center justify-between md:flex-row">
              <p className="text-sm text-base-content/60">
                © 2026 StockWise. Tous droits réservés.
              </p>
              <div className="flex gap-4 mt-4 md:mt-0">
                {[Twitter, Facebook, Linkedin].map((Icon, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="btn btn-ghost btn-circle btn-sm"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </FadeInWhenVisible>
    </div>
  );
}
