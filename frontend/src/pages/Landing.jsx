import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Brain,
  ShieldCheck,
  TrendingUp,
  Bell,
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
  Menu,
  X,
  Sun,
  Moon,
  Package,
  ClipboardList,
  UserPlus,
  LogIn,
  LayoutDashboard,
  ChevronDown,
  Quote,
  Lock,
  BadgeCheck,
  AlertTriangle,
  Boxes,
  Users,
  Globe,
  Award,
  Cpu,
  FileText,
  RefreshCw,
  Smartphone,
  HeadphonesIcon,
  Building2,
  MapPin,
  Mail,
  Phone,
  Check,
  Minus,
  Crown,
  Twitter,
  Linkedin,
  Github,
  BarChart2,
  ScanBarcode,
  ShoppingCart,
  FileBarChart,
  BellRing,
  Layers,
  LucidePackageSearch,
  LucidePackagePlus,
  PackagePlus,
  Sparkles,
  Clock,
} from "lucide-react";

import SEO from "../components/common/SEO";

/* ─────────────────────────────────────────
   Animation Variants
───────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const slideLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─────────────────────────────────────────
   Animated Section Wrapper
───────────────────────────────────────── */
function AnimatedSection({
  children,
  className = "",
  variants = fadeUp,
  custom = 0,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={custom}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Animated Counter
───────────────────────────────────────── */
function Counter({ target, suffix = "", duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
export default function LandingPage() {
  const [theme, setTheme] = useState("light");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [billingAnnual, setBillingAnnual] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setDrawerOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isDark = theme === "dark";

  const navLinks = [
    { label: "Fonctionnalités", href: "#features" },
    { label: "Statistiques", href: "#stats" },
    { label: "Tarifs", href: "#pricing" },
    { label: "Témoignages", href: "#testimonials" },
    { label: "Démarrer", href: "#steps" },
  ];

  const scrollToSection = (href) => {
    setDrawerOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const plans = [
    {
      name: "Starter",
      icon: <Package size={22} className="text-base-content/60" />,
      tagline: "Pour démarrer sans risque",
      monthlyPrice: 0,
      annualPrice: 0,
      priceLabel: "Gratuit",
      cta: "Commencer gratuitement",
      ctaVariant: "btn-outline",
      highlight: false,
      features: [
        { text: "Jusqu'à 100 références produits", included: true },
        { text: "1 utilisateur", included: true },
        { text: "Tableau de bord basique", included: true },
        { text: "Alertes de rupture", included: true },
        { text: "Export CSV", included: false },
        { text: "Analyse IA", included: false },
        { text: "Rapports avancés", included: false },
        { text: "Support prioritaire", included: false },
      ],
    },
    {
      name: "Pro",
      icon: <Zap size={22} className="text-primary" />,
      tagline: "Pour les PME en croissance",
      monthlyPrice: 9900,
      annualPrice: 7900,
      priceLabel: null,
      cta: "Essayer 14 jours gratuit",
      ctaVariant: "btn-primary",
      highlight: true,
      badge: "Le plus populaire",
      features: [
        { text: "Références illimitées", included: true },
        { text: "Jusqu'à 5 utilisateurs", included: true },
        { text: "Tableau de bord avancé", included: true },
        { text: "Alertes intelligentes (IA)", included: true },
        { text: "Export CSV & PDF", included: true },
        { text: "Analyse IA complète", included: true },
        { text: "Rapports hebdomadaires auto", included: true },
        { text: "Support prioritaire", included: false },
      ],
    },
    {
      name: "Entreprise",
      icon: <Building2 size={22} className="text-secondary" />,
      tagline: "Pour les structures multi-sites",
      monthlyPrice: 29900,
      annualPrice: 23900,
      priceLabel: null,
      cta: "Contacter l'équipe",
      ctaVariant: "btn-secondary",
      highlight: false,
      features: [
        { text: "Références illimitées", included: true },
        { text: "Utilisateurs illimités", included: true },
        { text: "Multi-dépôts & multi-sites", included: true },
        { text: "Alertes & prévisions IA avancées", included: true },
        { text: "Exports & intégrations API", included: true },
        { text: "Analyse IA + conseil mensuel", included: true },
        { text: "Rapports personnalisés", included: true },
        { text: "Support dédié 24/7", included: true },
      ],
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "StockWise",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "XAF"
    },
    "description": "Logiciel de gestion de stock intelligente basé sur l'IA pour les PME.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1200"
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-base-100 text-base-content">
      <SEO 
        title="Logiciel de Gestion de Stock & Inventaire Intelligent" 
        description="Prenez le contrôle de votre inventaire avec StockWise. Anticipez les ruptures de stock grâce à l'Intelligence Artificielle et optimisez vos commandes automatiquement."
        keywords="logiciel gestion de stock, inventaire, IA prédictive, gestion PME Afrique, Cameroun"
        structuredData={structuredData}
      />
      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed top-0 left-0 z-50 flex flex-col h-full shadow-2xl w-72 bg-base-200 lg:hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-base-300">
                <div className="flex items-center gap-2">
                  <LucidePackagePlus className="text-primary" size={22} />
                  <span className="text-lg font-bold tracking-tight">
                    StockWise
                  </span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex flex-col flex-1 gap-1 p-4 overflow-y-auto">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => scrollToSection(link.href)}
                    className="justify-start text-base font-medium btn btn-ghost"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
              <div className="flex flex-col gap-2 p-4 border-t border-base-300">
                <a
                  href="/login"
                  className="w-full gap-2 btn btn-outline btn-primary"
                >
                  <LogIn size={16} /> Connexion
                </a>
                <a href="/register" className="w-full gap-2 btn btn-primary">
                  <UserPlus size={16} /> Essai gratuit
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
          scrolled
            ? "bg-base-100/90 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between h-16 max-w-6xl gap-4 px-4 mx-auto">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <PackagePlus className="text-primary" size={24} />
            <span className="text-lg font-bold tracking-tight">StockWise</span>
          </a>
          <nav className="absolute items-center hidden gap-1 -translate-x-1/2 lg:flex left-1/2">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-sm font-medium btn btn-ghost btn-sm"
              >
                {link.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a href="/login" className="hidden btn btn-ghost btn-sm lg:flex">
              Connexion
            </a>
            <a
              href="/register"
              className="hidden gap-1 btn btn-primary btn-sm lg:flex"
            >
              Essai gratuit <ArrowRight size={14} />
            </a>
            <button
              onClick={() => setDrawerOpen(true)}
              className="btn btn-ghost btn-sm btn-circle lg:hidden"
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative flex items-center justify-center min-h-screen pt-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 rounded-full w-96 h-96 bg-secondary/5 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl px-4 py-20 mx-auto text-center">
          <AnimatedSection custom={0}>
            <div className="gap-2 px-4 py-3 mb-6 text-sm font-medium rounded-full badge badge-primary badge-outline animate-bounce">
              <Sparkles size={14} /> Alimentée par Intelligence Artificielle
            </div>
          </AnimatedSection>
          <AnimatedSection custom={1}>
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Votre stock perd de l'argent.{" "}
              <span className="text-primary">
                Chaque jour que vous attendez.
              </span>
            </h1>
          </AnimatedSection>
          <AnimatedSection custom={2}>
            <p className="max-w-2xl mx-auto mb-10 text-lg leading-relaxed sm:text-xl text-base-content/70">
              StockWise analyse votre inventaire en temps réel, anticipe vos
              ruptures et vous dit exactement quoi commander avant que ça
              coûte.
            </p>
          </AnimatedSection>
          <AnimatedSection custom={3}>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <a href="/register" className="gap-2 btn btn-primary btn-lg">
                Commencer gratuitement <ArrowRight size={18} />
              </a>
              <button
                onClick={() => scrollToSection("#steps")}
                className="gap-2 btn btn-outline btn-lg"
              >
                Comment ça marche <ChevronDown size={18} />
              </button>
            </div>
          </AnimatedSection>
          <AnimatedSection custom={4}>
            <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-white">
              {[
                { icon: <ShieldCheck size={15} />, text: "Aucun engagement" },
                { icon: <Clock size={15} />, text: "Configuration en 5 min" },
                { icon: <Lock size={15} />, text: "Données sécurisées" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-1.5 badge badge-success text-white">
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PROBLEM
      ══════════════════════════════════════ */}
      <section id="problem" className="py-20 bg-base-200">
        <div className="max-w-5xl px-4 mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="badge badge-error badge-outline mb-4 py-2 px-3 gap-1.5 text-sm">
              <AlertTriangle size={13} /> Le problème réel
            </div>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              Vous gérez votre stock à{" "}
              <span className="text-error">l'ancienne</span>. Et ça se voit.
            </h2>
          </AnimatedSection>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: <ClipboardList size={28} className="text-error" />,
                title: "Tableaux Excel interminables",
                text: "Des heures perdues chaque semaine à saisir manuellement des données déjà obsolètes le lendemain.",
                custom: 0,
              },
              {
                icon: <AlertTriangle size={28} className="text-warning" />,
                title: "Ruptures de stock imprévues",
                text: "Un client commande. Vous n'avez plus rien. Il part chez un concurrent. Il n'y a pas de deuxième chance.",
                custom: 1,
              },
              {
                icon: <TrendingUp size={28} className="text-error" />,
                title: "Décisions prises dans le flou",
                text: "Sans données fiables, vous sur-stockez ou sous-stockez. Dans les deux cas, c'est de l'argent qui s'évapore.",
                custom: 2,
              },
            ].map((card) => (
              <AnimatedSection key={card.title} custom={card.custom}>
                <div className="h-full transition-shadow duration-300 border card bg-base-100 border-base-300 hover:shadow-md">
                  <div className="gap-4 card-body">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-base-200">
                      {card.icon}
                    </div>
                    <h3 className="text-lg font-bold">{card.title}</h3>
                    <p className="text-sm leading-relaxed text-base-content/65">
                      {card.text}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection className="mt-12 text-center" custom={3}>
            <p className="max-w-xl mx-auto text-base text-base-content/60">
              Ce n'est pas un manque de travail. C'est un manque d'outil adapté
              à votre réalité.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SOLUTION
      ══════════════════════════════════════ */}
      <section id="solution" className="py-20">
        <div className="max-w-5xl px-4 mx-auto">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <AnimatedSection variants={slideLeft} custom={0}>
                <div className="badge badge-primary badge-outline mb-4 py-2 px-3 gap-1.5 text-sm">
                  <Brain size={13} /> La solution
                </div>
              </AnimatedSection>
              <AnimatedSection variants={slideLeft} custom={1}>
                <h2 className="mb-5 text-3xl font-bold leading-tight sm:text-4xl">
                  Une IA qui voit votre stock{" "}
                  <span className="text-primary">mieux que vous</span>
                </h2>
              </AnimatedSection>
              <AnimatedSection variants={slideLeft} custom={2}>
                <p className="mb-8 leading-relaxed text-base-content/70">
                  StockWise connecte votre inventaire, analyse vos tendances et
                  vous donne des recommandations précises pas des rapports,
                  des décisions prêtes à exécuter.
                </p>
              </AnimatedSection>
              <div className="flex flex-col gap-3">
                {[
                  "Alertes automatiques avant chaque rupture de stock",
                  "Prévisions de demande basées sur vos historiques réels",
                  "Tableau de bord unifié tout en un seul endroit",
                  "Paiement intégré via Mobile Money (NotchPay)",
                ].map((point, i) => (
                  <AnimatedSection
                    key={point}
                    custom={i + 3}
                    variants={slideLeft}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        size={18}
                        className="text-primary shrink-0 mt-0.5"
                      />
                      <span className="text-sm text-base-content/80">
                        {point}
                      </span>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
            <AnimatedSection custom={0}>
              <div className="relative">
                <div className="p-6 border shadow-xl card bg-base-200 border-base-300 rounded-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/15">
                      <BarChart3 size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        Analyse IA en cours
                      </p>
                      <p className="text-xs text-base-content/50">
                        Mis à jour à l'instant
                      </p>
                    </div>
                    <span className="ml-auto badge badge-success badge-sm">
                      Live
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      {
                        label: "Articles suivis",
                        value: "1 248",
                        color: "text-primary",
                      },
                      {
                        label: "Alertes actives",
                        value: "3",
                        color: "text-warning",
                      },
                      {
                        label: "Économies ce mois",
                        value: "142k XAF",
                        color: "text-success",
                      },
                      {
                        label: "Score de santé",
                        value: "94 %",
                        color: "text-info",
                      },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="p-3 border bg-base-100 rounded-xl border-base-300"
                      >
                        <p className={`text-xl font-bold ${m.color}`}>
                          {m.value}
                        </p>
                        <p className="text-xs text-base-content/50 mt-0.5">
                          {m.label}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3">
                    {[
                      {
                        label: "Farine (25 kg)",
                        pct: 72,
                        color: "progress-success",
                      },
                      {
                        label: "Huile de palme",
                        pct: 18,
                        color: "progress-error",
                      },
                      {
                        label: "Sucre raffiné",
                        pct: 45,
                        color: "progress-warning",
                      },
                    ].map((bar) => (
                      <div key={bar.label}>
                        <div className="flex justify-between mb-1 text-xs text-base-content/60">
                          <span>{bar.label}</span>
                          <span>{bar.pct}%</span>
                        </div>
                        <progress
                          className={`progress ${bar.color} w-full`}
                          value={bar.pct}
                          max="100"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="absolute -bottom-4 -right-4 card bg-base-100 border border-base-300 shadow-lg p-3 rounded-xl flex flex-row items-center gap-3 max-w-[210px]"
                >
                  <Bell size={16} className="text-warning shrink-0" />
                  <p className="text-xs text-base-content/80">
                    Stock critique <strong>Huile de palme</strong>
                  </p>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATISTICS
      ══════════════════════════════════════ */}
      <section id="stats" className="py-20 bg-primary text-primary-content">
        <div className="max-w-5xl px-4 mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="badge bg-primary-content/20 text-primary-content border-primary-content/30 mb-4 py-2 px-3 gap-1.5 text-sm">
              <BarChart2 size={13} /> StockWise en chiffres
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Des résultats mesurables, pas des promesses
            </h2>
            <p className="max-w-xl mx-auto mt-3 text-sm text-primary-content/70">
              Depuis le lancement, des PME locales font confiance à StockWise
              pour piloter leur activité.
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {[
              {
                icon: <Users size={28} />,
                value: 1200,
                suffix: "+",
                label: "PME actives",
                custom: 0,
              },
              {
                icon: <Package size={28} />,
                value: 850000,
                suffix: "+",
                label: "Références gérées",
                custom: 1,
              },
              {
                icon: <TrendingUp size={28} />,
                value: 38,
                suffix: "%",
                label: "Réduction des pertes en moyenne",
                custom: 2,
              },
              {
                icon: <Globe size={28} />,
                value: 5,
                suffix: " villes",
                label: "Couverture au Cameroun",
                custom: 3,
              },
            ].map((stat) => (
              <AnimatedSection
                key={stat.label}
                custom={stat.custom}
                variants={scaleIn}
              >
                <div className="h-full text-center border card bg-primary-content/10 border-primary-content/20">
                  <div className="items-center gap-3 py-8 card-body">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-content/15">
                      {stat.icon}
                    </div>
                    <p className="text-3xl font-extrabold sm:text-4xl">
                      <Counter target={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-sm leading-snug text-primary-content/70">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <div className="grid gap-5 mt-5 sm:grid-cols-3">
            {[
              {
                icon: <Award size={22} />,
                value: "4.8/5",
                label: "Note moyenne utilisateurs",
                custom: 4,
              },
              {
                icon: <RefreshCw size={22} />,
                value: "99.7%",
                label: "Disponibilité de la plateforme",
                custom: 5,
              },
              {
                icon: <Zap size={22} />,
                value: "< 5 min",
                label: "Temps de configuration moyen",
                custom: 6,
              },
            ].map((stat) => (
              <AnimatedSection
                key={stat.label}
                custom={stat.custom}
                variants={scaleIn}
              >
                <div className="border card bg-primary-content/10 border-primary-content/20">
                  <div className="flex-row items-center gap-4 py-5 card-body">
                    <div className="flex items-center justify-center rounded-full w-11 h-11 bg-primary-content/15 shrink-0">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold">{stat.value}</p>
                      <p className="text-xs text-primary-content/65">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════ */}
      <section id="features" className="py-20">
        <div className="max-w-5xl px-4 mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="badge badge-primary badge-outline mb-4 py-2 px-3 gap-1.5 text-sm">
              <Layers size={13} /> Fonctionnalités
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Tout ce dont votre PME a besoin,{" "}
              <span className="text-primary">rien de superflu</span>
            </h2>
            <p className="max-w-xl mx-auto mt-3 text-sm text-base-content/60">
              Chaque fonctionnalité est pensée pour les réalités du marché local pas copiée d'un SaaS occidental.
            </p>
          </AnimatedSection>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Brain size={26} className="text-primary" />,
                title: "IA Prédictive",
                text: "Notre moteur analyse vos ventes passées et prédit vos besoins avant que vous ne le réalisiez. Plus de commandes à l'aveugle.",
                custom: 0,
              },
              {
                icon: <BellRing size={26} className="text-warning" />,
                title: "Alertes en temps réel",
                text: "Recevez une notification immédiate dès qu'un article tombe sous le seuil critique. Sur mobile, par email, ou les deux.",
                custom: 1,
              },
              {
                icon: <ScanBarcode size={26} className="text-secondary" />,
                title: "Scan & entrée rapide",
                text: "Saisissez vos entrées de stock en quelques secondes depuis votre smartphone. Fini les feuilles de papier perdues.",
                custom: 2,
              },
              {
                icon: <FileBarChart size={26} className="text-success" />,
                title: "Rapports automatiques",
                text: "Chaque semaine, un rapport clair vous attend : ce qui tourne bien, ce qui stagne, ce qu'il faut commander.",
                custom: 3,
              },
              {
                icon: <ShoppingCart size={26} className="text-info" />,
                title: "Gestion des commandes",
                text: "Suivez l'ensemble du cycle de commande fournisseur depuis l'application. Du bon de commande à la réception.",
                custom: 4,
              },
              {
                icon: <Smartphone size={26} className="text-accent" />,
                title: "100% Mobile-first",
                text: "Conçu pour fonctionner parfaitement sur smartphone. Parce que vous ne gérez pas votre stock depuis un bureau.",
                custom: 5,
              },
              {
                icon: <Users size={26} className="text-primary" />,
                title: "Gestion des utilisateurs",
                text: "Attribuez des rôles et des permissions à votre équipe. Chacun voit ce dont il a besoin, rien de plus.",
                custom: 6,
              },
              {
                icon: <FileText size={26} className="text-secondary" />,
                title: "Export multi-format",
                text: "Exportez vos données en CSV ou PDF à tout moment, pour vos comptables, partenaires ou archivage interne.",
                custom: 7,
              },
              {
                icon: <ShieldCheck size={26} className="text-success" />,
                title: "Sécurité des données",
                text: "Vos données sont chiffrées, sauvegardées quotidiennement. Elles vous appartiennent — toujours.",
                custom: 8,
              },
            ].map((feat) => (
              <AnimatedSection key={feat.title} custom={feat.custom}>
                <div className="h-full transition-all duration-300 border card bg-base-200 border-base-300 hover:border-primary/40 hover:shadow-md group">
                  <div className="gap-4 card-body">
                    <div className="flex items-center justify-center w-12 h-12 transition-transform duration-300 border rounded-xl bg-base-100 border-base-300 group-hover:scale-110">
                      {feat.icon}
                    </div>
                    <h3 className="font-bold">{feat.title}</h3>
                    <p className="text-sm leading-relaxed text-base-content/65">
                      {feat.text}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          BENEFITS
      ══════════════════════════════════════ */}
      <section id="benefits" className="py-20 bg-base-200">
        <div className="max-w-5xl px-4 mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="badge badge-secondary badge-outline mb-4 py-2 px-3 gap-1.5 text-sm">
              <Zap size={13} /> Ce que vous gagnez vraiment
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              5 bénéfices concrets, pas des promesses
            </h2>
          </AnimatedSection>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <TrendingUp size={24} className="text-primary" />,
                title: "Plus de pertes inutiles",
                text: "Connaître son stock en temps réel, c'est ne plus jamais jeter ce qui aurait pu être vendu.",
                custom: 0,
              },
              {
                icon: <Brain size={24} className="text-secondary" />,
                title: "Décisions sans hésitation",
                text: "L'IA analyse à votre place. Vous n'avez plus qu'à valider ou déléguer.",
                custom: 1,
              },
              {
                icon: <Bell size={24} className="text-warning" />,
                title: "Zéro surprise désagréable",
                text: "Les alertes préventives vous préviennent avant le problème, pas après.",
                custom: 2,
              },
              {
                icon: <Package size={24} className="text-success" />,
                title: "Approvisionnement optimisé",
                text: "Commandez exactement ce qu'il faut, au bon moment. Ni trop, ni trop peu.",
                custom: 3,
              },
              {
                icon: <LayoutDashboard size={24} className="text-info" />,
                title: "Clarté totale sur votre activité",
                text: "Un tableau de bord qui parle votre langue pas des chiffres noyés dans des tableurs.",
                custom: 4,
              },
            ].map((benefit) => (
              <AnimatedSection key={benefit.title} custom={benefit.custom}>
                <div className="h-full transition-all duration-300 border card bg-base-100 border-base-300 hover:border-primary/40 hover:shadow-md group">
                  <div className="gap-4 card-body">
                    <div className="flex items-center justify-center transition-transform duration-300 w-11 h-11 rounded-xl bg-base-200 group-hover:scale-110">
                      {benefit.icon}
                    </div>
                    <h3 className="font-bold">{benefit.title}</h3>
                    <p className="text-sm leading-relaxed text-base-content/65">
                      {benefit.text}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          OBJECTION CRUSHER
      ══════════════════════════════════════ */}
      <section className="py-20">
        <div className="max-w-4xl px-4 mx-auto">
          <AnimatedSection className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Vous hésitez encore ?{" "}
              <span className="text-primary">
                Voilà pourquoi vous pouvez y aller.
              </span>
            </h2>
          </AnimatedSection>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: <ShieldCheck size={26} className="text-success" />,
                title: "Aucun risque financier",
                text: "Essai gratuit. Aucune carte requise. Vous testez sur vos vraies données, vous décidez ensuite.",
                custom: 0,
              },
              {
                icon: <BadgeCheck size={26} className="text-primary" />,
                title: "Aucune promesse floue",
                text: "Chaque fonctionnalité est documentée. Vous voyez exactement ce que vous achetez avant de signer.",
                custom: 1,
              },
              {
                icon: <Zap size={26} className="text-warning" />,
                title: "En production en moins d'une heure",
                text: "Pas de formation de 3 jours. L'interface est pensée pour quelqu'un qui n'a pas de temps à perdre.",
                custom: 2,
              },
            ].map((obj) => (
              <AnimatedSection key={obj.title} custom={obj.custom}>
                <div className="h-full text-center border card bg-base-200 border-base-300">
                  <div className="items-center gap-4 card-body">
                    <div className="flex items-center justify-center border rounded-full w-14 h-14 bg-base-100 border-base-300">
                      {obj.icon}
                    </div>
                    <h3 className="font-bold">{obj.title}</h3>
                    <p className="text-sm leading-relaxed text-base-content/65">
                      {obj.text}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════ */}
      <section id="testimonials" className="py-20 bg-base-200">
        <div className="max-w-5xl px-4 mx-auto">
          <AnimatedSection className="mb-12 text-center">
            <div className="badge badge-primary badge-outline mb-4 py-2 px-3 gap-1.5 text-sm">
              <Star size={13} /> Ils ont fait le pas
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ce que disent nos utilisateurs
            </h2>
          </AnimatedSection>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                quote:
                  "Avant StockWise, je découvrais mes ruptures quand les clients se plaignaient. Maintenant j'anticipe. Ça a changé ma façon de gérer l'épicerie.",
                name: "Martine Essomba",
                role: "Gérante Épicerie,  Douala",
                rating: 5,
                custom: 0,
              },
              {
                quote:
                  "J'étais sceptique j'ai déjà vu trop d'outils qui ne tiennent pas leurs promesses. Mais en deux semaines, j'avais déjà récupéré plus que ce que ça coûte.",
                name: "Patrick Nkeng",
                role: "Responsable logistique, Yaoundé",
                rating: 5,
                custom: 1,
              },
              {
                quote:
                  "Simple, rapide, efficace. Mon équipe a appris à l'utiliser en une matinée. Le rapport IA hebdomadaire seul vaut l'abonnement.",
                name: "Sylvie Mbarga",
                role: "Directrice, Grossiste alimentaire Bafoussam",
                rating: 5,
                custom: 2,
              },
            ].map((t) => (
              <AnimatedSection key={t.name} custom={t.custom}>
                <div className="h-full transition-shadow duration-300 border card bg-base-100 border-base-300 hover:shadow-md">
                  <div className="gap-4 card-body">
                    <Quote size={20} className="text-primary opacity-40" />
                    <p className="text-sm italic leading-relaxed text-base-content/75">
                      "{t.quote}"
                    </p>
                    <div className="flex gap-0.5 mt-auto">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className="text-warning fill-warning"
                        />
                      ))}
                    </div>
                    <div className="pt-3 border-t border-base-300">
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-base-content/50">{t.role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PRICING
      ══════════════════════════════════════ */}
      <section id="pricing" className="py-20">
        <div className="max-w-5xl px-4 mx-auto">
          <AnimatedSection className="mb-10 text-center">
            <div className="badge badge-primary badge-outline mb-4 py-2 px-3 gap-1.5 text-sm">
              <Crown size={13} /> Tarifs
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Un plan pour chaque étape de votre croissance
            </h2>
            <p className="max-w-xl mx-auto mt-3 text-sm text-base-content/60">
              Commencez gratuitement. Évoluez quand vous êtes prêt. Annulez à
              tout moment.
            </p>
          </AnimatedSection>

          {/* Billing toggle */}
          <AnimatedSection className="flex justify-center mb-10" custom={1}>
            <div className="flex items-center gap-3 bg-base-200 border border-base-300 rounded-full px-5 py-2.5">
              <span
                className={`text-sm font-medium transition-colors ${!billingAnnual ? "text-base-content" : "text-base-content/50"}`}
              >
                Mensuel
              </span>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={billingAnnual}
                onChange={() => setBillingAnnual(!billingAnnual)}
              />
              <span
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${billingAnnual ? "text-base-content" : "text-base-content/50"}`}
              >
                Annuel
                <span className="text-xs badge badge-success badge-sm">
                  -20%
                </span>
              </span>
            </div>
          </AnimatedSection>

          <div className="grid items-stretch gap-5 md:grid-cols-3">
            {plans.map((plan, i) => (
              <AnimatedSection key={plan.name} custom={i} variants={scaleIn}>
                <div
                  className={`card h-full border transition-all duration-300 ${
                    plan.highlight
                      ? "border-primary shadow-xl shadow-primary/10 bg-base-100 relative"
                      : "border-base-300 bg-base-200 hover:border-primary/30 hover:shadow-md"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <span className="px-4 py-2 text-xs font-bold shadow badge badge-primary">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  <div className="gap-5 card-body pt-7">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          plan.highlight
                            ? "bg-primary/15"
                            : "bg-base-100 border border-base-300"
                        }`}
                      >
                        {plan.icon}
                      </div>
                      <div>
                        <p className="text-lg font-extrabold">{plan.name}</p>
                        <p className="text-xs text-base-content/50">
                          {plan.tagline}
                        </p>
                      </div>
                    </div>
                    <div className="py-4 border-t border-b border-base-300">
                      {plan.priceLabel ? (
                        <p className="text-4xl font-extrabold">
                          {plan.priceLabel}
                        </p>
                      ) : (
                        <div className="flex items-end gap-1">
                          <p className="text-4xl font-extrabold">
                            {(billingAnnual
                              ? plan.annualPrice
                              : plan.monthlyPrice
                            ).toLocaleString("fr-FR")}
                          </p>
                          <span className="mb-1 text-sm text-base-content/50">
                            XAF / mois
                          </span>
                        </div>
                      )}
                      {billingAnnual && plan.monthlyPrice > 0 && (
                        <p className="flex items-center gap-1 mt-1 text-xs text-success">
                          <TrendingUp size={11} />
                          Soit{" "}
                          {(
                            (plan.monthlyPrice - plan.annualPrice) *
                            12
                          ).toLocaleString("fr-FR")}{" "}
                          XAF économisés / an
                        </p>
                      )}
                    </div>
                    <ul className="flex flex-col gap-2.5 flex-1">
                      {plan.features.map((feat) => (
                        <li
                          key={feat.text}
                          className={`flex items-start gap-2.5 text-sm ${!feat.included ? "opacity-35" : ""}`}
                        >
                          {feat.included ? (
                            <Check
                              size={15}
                              className="text-primary shrink-0 mt-0.5"
                            />
                          ) : (
                            <Minus size={15} className="shrink-0 mt-0.5" />
                          )}
                          <span>{feat.text}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href={
                        plan.name === "Entreprise" ? "/contact" : "/register"
                      }
                      className={`btn w-full gap-2 ${plan.ctaVariant}`}
                    >
                      {plan.cta} <ArrowRight size={15} />
                    </a>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mt-8 text-center" custom={3}>
            <p className="text-sm text-base-content/50 flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-success" />
              Paiement sécurisé via NotchPay (Mobile Money, Orange Money)
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STEPS
      ══════════════════════════════════════ */}
      <section id="steps" className="py-20 bg-base-200">
        <div className="max-w-4xl px-4 mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="badge badge-accent badge-outline mb-4 py-2 px-3 gap-1.5 text-sm">
              <LayoutDashboard size={13} /> Démarrer en 4 étapes
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Votre stock sous contrôle{" "}
              <span className="text-primary">aujourd'hui même</span>
            </h2>
          </AnimatedSection>
          <div className="flex flex-col gap-4">
            {[
              {
                step: "01",
                icon: <UserPlus size={22} className="text-primary" />,
                title: "Créez votre compte gratuitement",
                text: "Nom, email, mot de passe. C'est tout. Aucune carte bancaire demandée pour commencer.",
                custom: 0,
              },
              {
                step: "02",
                icon: <Package size={22} className="text-secondary" />,
                title: "Importez votre inventaire",
                text: "Ajoutez vos produits manuellement ou via fichier CSV. L'IA structure tout automatiquement.",
                custom: 1,
              },
              {
                step: "03",
                icon: <Brain size={22} className="text-accent" />,
                title: "Activez l'analyse IA",
                text: "En quelques secondes, StockWise analyse vos données et génère votre premier rapport de santé.",
                custom: 2,
              },
              {
                step: "04",
                icon: <LayoutDashboard size={22} className="text-success" />,
                title: "Pilotez depuis votre tableau de bord",
                text: "Suivez, décidez, agissez tout au même endroit, depuis n'importe quel appareil.",
                custom: 3,
              },
            ].map((s) => (
              <AnimatedSection key={s.step} custom={s.custom}>
                <div className="transition-colors duration-300 border card bg-base-100 border-base-300 hover:border-primary/40">
                  <div className="flex-row items-start gap-5 py-5 card-body">
                    <div className="w-10 pt-1 text-3xl font-black leading-none text-primary/20 shrink-0">
                      {s.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {s.icon}
                        <h3 className="font-bold">{s.title}</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-base-content/65">
                        {s.text}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════ */}
      <section className="py-20">
        <div className="max-w-3xl px-4 mx-auto">
          <AnimatedSection>
            <div className="shadow-2xl card bg-primary text-primary-content">
              <div className="gap-6 px-6 py-12 text-center card-body sm:px-10">
                <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                  Votre concurrent a déjà commencé. Vous, vous attendez quoi ?
                </h2>
                <p className="max-w-xl mx-auto leading-relaxed text-primary-content/80">
                  Rejoignez les PME qui ont arrêté de perdre du stock et de
                  l'argent en passant à une gestion intelligente.
                </p>
                <a
                  href="/register"
                  className="gap-2 mx-auto font-bold border-0 btn btn-lg bg-base-100 text-base-content hover:bg-base-200"
                >
                  Commencer gratuitement <span className="animate-pulse"><ArrowRight size={18} /></span> 
                </a>
                <p className="text-sm text-primary-content/60">
                  Sans engagement. Sans carte bancaire. Configuration en moins
                  de 5 minutes.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER — SaaS PRO
      ══════════════════════════════════════ */}
      <footer className="border-t bg-base-200 border-base-300">
        {/* PS Banner */}
        <div className="border-b border-base-300">
          <div className="max-w-5xl px-4 py-4 mx-auto">
            <AnimatedSection>
              <div className="flex items-start gap-3">
                <Bell size={16} className="text-warning shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed text-base-content/65">
                  <strong className="text-base-content">Note :</strong> L'offre
                  d'accès gratuit est limitée dans le temps. Une fois le quota
                  de beta-utilisateurs atteint, le plan gratuit sera retiré. Si
                  vous lisez ceci, vous êtes encore à temps.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="max-w-5xl px-4 mx-auto py-14">
          <AnimatedSection>
            <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
              {/* Brand */}
              <div className="flex flex-col col-span-2 gap-5 md:col-span-1">
                <a href="/" className="flex items-center gap-2">
                  <PackagePlus className="text-primary" size={22} />
                  <span className="text-lg font-extrabold tracking-tight">
                    StockWise
                  </span>
                </a>
                <p className="text-sm leading-relaxed text-base-content/55">
                  La plateforme de gestion de stock alimentée par l'IA, pensée
                  pour les PME d'Afrique centrale.
                </p>
                <div className="flex gap-3">
                  <a
                    href="#"
                    aria-label="Twitter"
                    className="border btn btn-ghost btn-sm btn-circle border-base-300"
                  >
                    <Twitter size={15} />
                  </a>
                  <a
                    href="#"
                    aria-label="LinkedIn"
                    className="border btn btn-ghost btn-sm btn-circle border-base-300"
                  >
                    <Linkedin size={15} />
                  </a>
                  <a
                    href="#"
                    aria-label="GitHub"
                    className="border btn btn-ghost btn-sm btn-circle border-base-300"
                  >
                    <Github size={15} />
                  </a>
                </div>
              </div>

              {/* Product */}
              <div className="flex flex-col gap-4">
                <p className="text-xs font-bold tracking-widest uppercase text-base-content/40">
                  Produit
                </p>
                <ul className="flex flex-col gap-2.5 text-sm text-base-content/65">
                  {[
                    { label: "Fonctionnalités", href: "#features" },
                    { label: "Tarifs", href: "#pricing" },
                    { label: "Témoignages", href: "#testimonials" },
                    { label: "Changelog", href: "/changelog" },
                    { label: "Roadmap", href: "/#steps" },
                  ].map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="transition-colors hover:text-primary"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ressources */}
              <div className="flex flex-col gap-4">
                <p className="text-xs font-bold tracking-widest uppercase text-base-content/40">
                  Ressources
                </p>
                <ul className="flex flex-col gap-2.5 text-sm text-base-content/65">
                  {[
                    { label: "Documentation", href: "/docs" },
                    { label: "Blog", href: "/blog" },
                    { label: "API Reference", href: "/api" },
                    { label: "Guide de démarrage", href: "/guide" },
                    { label: "Support", href: "/support" },
                  ].map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="transition-colors hover:text-primary"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div className="flex flex-col gap-4">
                <p className="text-xs font-bold tracking-widest uppercase text-base-content/40">
                  Contact
                </p>
                <ul className="flex flex-col gap-3 text-sm text-base-content/65">
                  <li className="flex items-start gap-2.5">
                    <MapPin
                      size={15}
                      className="text-primary shrink-0 mt-0.5"
                    />
                    <span>Yaoundé, Cameroun</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Mail size={15} className="text-primary shrink-0" />
                    <a
                      href="mailto:hello@stockwise.cm"
                      className="transition-colors hover:text-primary"
                    >
                      hello@stockwise.cm
                    </a>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Phone size={15} className="text-primary shrink-0" />
                    <a
                      href="tel:+237690000000"
                      className="transition-colors hover:text-primary"
                    >
                      +237 690 000 000
                    </a>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <HeadphonesIcon
                      size={15}
                      className="text-primary shrink-0"
                    />
                    <a
                      href="/support"
                      className="transition-colors hover:text-primary"
                    >
                      Support en ligne
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-base-300">
          <div className="flex flex-col items-center justify-between max-w-5xl gap-3 px-4 py-5 mx-auto text-xs sm:flex-row text-base-content/40">
            <p>© {new Date().getFullYear()} StockWise. Tous droits réservés.</p>
            <div className="flex items-center gap-4">
              <a
                href="/privacy"
                className="transition-colors hover:text-primary"
              >
                Confidentialité
              </a>
              <span>·</span>
              <a href="/terms" className="transition-colors hover:text-primary">
                Conditions d'utilisation
              </a>
              <span>·</span>
              <a
                href="/cookies"
                className="transition-colors hover:text-primary"
              >
                Cookies
              </a>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span>Tous les systèmes opérationnels</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
