import { useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Link } from "react-router-dom";
import { useThemeStore } from "../store/themeStore";
import {
  PackagePlus,
  ArrowRight,
  BarChart3,
  Brain,
  ShieldCheck,
  TrendingUp,
  LayoutDashboard,
  Zap,
  Globe,
  Bell,
  Check,
  Menu,
  X,
  CreditCard,
  Sun,
  Moon,
  Quote,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

/* ─── Animation Variants ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: d, ease: [0.16, 1, 0.3, 1] },
  }),
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: (d = 0) => ({ opacity: 1, transition: { duration: 0.6, delay: d } }),
};

/* ─── Reusable Section Header ─────────────────────────────────── */
const SectionHeader = ({ label, title, subtitle }) => (
  <div className="mb-16">
    <div className="flex items-center gap-3 mb-6 text-primary tracking-[0.16em] uppercase text-[0.6875rem] font-medium">
      <div className="w-6 h-px bg-primary" />
      {label}
    </div>
    <h2 className="font-display font-extrabold text-[clamp(2rem,4vw,3rem)] leading-[1.15] tracking-tight text-base-content mb-5 max-w-xl">
      {title}
    </h2>
    {subtitle && (
      <p className="text-[1.0625rem] text-base-content/60 max-w-[520px] leading-relaxed font-normal">
        {subtitle}
      </p>
    )}
  </div>
);

/* ─── FEATURES DATA ───────────────────────────────────────────── */
const features = [
  {
    icon: LayoutDashboard,
    title: "Interface Unifiée",
    desc: "Hub central pour ventes, mouvements et alertes. Conçu pour la productivité maximale, aucune friction.",
  },
  {
    icon: Zap,
    title: "Temps Réel Absolu",
    desc: "WebSockets natifs. Chaque modification d'inventaire se synchronise instantanément sur tous vos écrans.",
  },
  {
    icon: ShieldCheck,
    title: "Traçabilité Atomique",
    desc: "Sessions Mongoose. Zéro vente conflictuelle, zéro stock négatif. Une rigueur d'ingénierie bancaire.",
  },
  {
    icon: Globe,
    title: "Multi-Tenant",
    desc: "Isolation mathématique des données par tenant. Vos informations sont protégées par architecture.",
  },
  {
    icon: CreditCard,
    title: "Facturation NotchPay",
    desc: "Paiements Mobile Money natifs. Abonnements, résiliations et suivi — sans quitter l'interface.",
  },
  {
    icon: Brain,
    title: "Agent IA Nocturne",
    desc: "Gemini analyse vos métriques chaque nuit. Au réveil : des recommandations, pas des chiffres.",
  },
];

/* ─── PRICING DATA ────────────────────────────────────────────── */
const plans = [
  {
    name: "Starter",
    price: "Gratuit",
    sub: "Pour démarrer",
    featured: false,
    cta: "Créer mon compte",
    features: [
      "Jusqu'à 50 références",
      "2 utilisateurs",
      "Tableaux de bord de base",
      "Support par email",
    ],
    excluded: [
      "Intelligence Artificielle Prédictive",
      "Multi-sites & Transferts",
    ],
  },
  {
    name: "Professionnel",
    price: "9 900",
    unit: "XAF / mois",
    sub: "Le plus populaire",
    featured: true,
    cta: "Essai 30 jours gratuit",
    features: [
      "Références illimitées",
      "Utilisateurs illimités",
      "Multi-sites & Mouvements intra-dépôts",
      "IA Gemini Copilot activé",
      "Alertes proactives en temps réel",
    ],
    excluded: [],
  },
  {
    name: "Entreprise",
    price: "29 900",
    unit: "XAF / mois",
    sub: "Croissance avancée",
    featured: false,
    cta: "Contacter le support",
    features: [
      "Multi-organisations",
      "Entrepôts illimités",
      "Support téléphonique H24",
      "API d'intégration externe",
      "SLA garanti 99.9%",
    ],
    excluded: [],
  },
];

/* ─── TESTIMONIALS ────────────────────────────────────────────── */
const testimonials = [
  {
    name: "Marie N.",
    role: "Gérante Quincaillerie",
    text: "Depuis StockWise, fini les ruptures de ciment. L'IA anticipe mes commandes à la perfection.",
  },
  {
    name: "Paul K.",
    role: "Grossiste Alimentaire",
    text: "L'interface est d'une fluidité incroyable. Le suivi temps réel entre dépôts a sauvé notre trésorerie.",
  },
  {
    name: "Sonia B.",
    role: "CEO Boutique Mode",
    text: "Le meilleur investissement de l'année. Les insights nocturnes me font gagner 2h de gestion chaque matin.",
  },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, -60]);
  const heroO = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, [theme]);

  return (
    <div className="relative min-h-screen bg-base-100 text-base-content font-body overflow-x-hidden selection:bg-primary/30">
      {/* ── Grain Overlay ── */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.028] grain-overlay" />

      {/* ── Ambient Glows ── */}
      <div
        className="absolute top-[-20%] right-[-15%] w-[700px] h-[700px] rounded-full pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(var(--color-primary-rgb),0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(var(--color-secondary-rgb),0.06) 0%, transparent 70%)",
        }}
      />

      {/* ════════════════════════════════════════════════════════════════════════
          NAV
      ════════════════════════════════════════════════════════════════════════ */}
      <nav
        className={`fixed top-5 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-6xl z-[100] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled ? "top-3" : ""}`}
      >
        <div
          className={`flex items-center justify-between px-6 transition-all duration-300 rounded-3xl border border-base-content/10 bg-base-100/65 backdrop-blur-xl shadow-lg border-base-300 ${scrolled ? "py-2 bg-base-100/85 shadow-xl" : "py-3"}`}
        >
          <Link
            to="/"
            className="flex items-center gap-2.5 no-underline text-base-content group"
          >
            <div className="w-9 h-9 bg-primary text-primary-content rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
              <PackagePlus size={20} strokeWidth={2.5} />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight">
              StockWise
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-9">
            {["#features", "#ia", "#pricing"].map((href, i) => (
              <a
                key={i}
                href={href}
                className="text-[0.8125rem] font-medium text-base-content/60 no-underline tracking-wide hover:text-base-content transition-colors"
              >
                {["Fonctionnalités", "Intelligence IA", "Tarification"][i]}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle btn-sm"
              aria-label="Thème"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link
              to="/login"
              className="btn btn-ghost btn-sm px-5 font-semibold text-base-content/70"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="btn btn-primary btn-sm px-6 rounded-xl font-bold gap-1.5 shadow-lg shadow-primary/20"
            >
              Démarrer <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden btn btn-ghost btn-circle"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-xs z-50 bg-base-100 p-8 sm:p-12 flex flex-col gap-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-2.5 text-base-content no-underline">
                  <div className="w-9 h-9 bg-primary text-primary-content rounded-xl flex items-center justify-center">
                    <PackagePlus size={20} strokeWidth={2.5} />
                  </div>
                  <span className="font-display font-extrabold text-lg tracking-tight">
                    StockWise
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleTheme}
                    className="btn btn-ghost btn-circle"
                    aria-label="Thème"
                  >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="btn btn-ghost btn-circle"
                  >
                    <X size={26} />
                  </button>
                </div>
              </div>

              {["Fonctionnalités", "Intelligence IA", "Tarification"].map(
                (l, i) => (
                  <a
                    key={i}
                    href={["#features", "#ia", "#pricing"][i]}
                    onClick={() => setMenuOpen(false)}
                    className="text-2xl font-display font-bold text-base-content no-underline"
                  >
                    {l}
                  </a>
                ),
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 pt-[clamp(120px,15vw,180px)] pb-[clamp(60px,10vw,100px)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="flex flex-col items-center text-center">
            <motion.div
              style={{
                y: heroY,
                opacity: heroO,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3 mb-8 text-primary tracking-[0.16em] uppercase text-[0.6875rem] font-semibold"
              >
                <div className="w-6 h-px bg-primary" />
                StockWise V1.0 est disponible
              </motion.div>

              <motion.h1
                custom={0.05}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="font-display font-extrabold text-[clamp(2.75rem,7vw,5rem)] leading-[1.05] tracking-tighter text-base-content mb-7 max-w-4xl"
              >
                La gestion de stock.
                <br />
                <span className="text-primary">Redéfinie</span> par l'IA.
              </motion.h1>

              <motion.p
                custom={0.15}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="text-[clamp(1rem,2vw,1.25rem)] text-base-content/60 leading-relaxed max-w-2xl mb-12 font-normal"
              >
                Une plateforme qui anticipe vos ruptures, orchestre vos ventes
                et protège votre trésorerie avec une précision mathématique.
              </motion.p>

              <motion.div
                custom={0.25}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="flex flex-wrap justify-center gap-4"
              >
                <Link
                  to="/register"
                  className="btn btn-primary btn-lg px-9 rounded-2xl font-bold gap-2.5 shadow-xl shadow-primary/30"
                >
                  Créer un compte <ArrowRight size={18} />
                </Link>
                <a
                  href="#features"
                  className="btn btn-outline btn-lg px-9 rounded-2xl font-bold border-base-content/10 hover:border-base-content/30"
                >
                  Découvrir la plateforme
                </a>
              </motion.div>

              {/* Social proof */}
              <motion.div
                custom={0.35}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="mt-16 flex flex-col items-center gap-4"
              >
                <div className="flex -space-x-3">
                  {["M", "P", "S", "A"].map((l, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-base-100 flex items-center justify-center text-xs font-bold text-white bg-primary/80 ring-2 ring-primary/20"
                      style={{ filter: `hue-rotate(${i * 45}deg)` }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-base-content/60 font-medium">
                  <span className="text-base-content font-bold">+120 PME</span>{" "}
                  font confiance à StockWise
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="features" className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12 mb-20">
            <div className="flex-1">
              <SectionHeader
                label="01 — L'ingénierie du détail"
                title={
                  <>
                    Une architecture robuste.
                    <br />
                    Une interface sans friction.
                  </>
                }
                subtitle="Chaque fonctionnalité a été pensée pour éliminer la complexité opérationnelle, pas l'ajouter."
              />
            </div>
            <div className="hidden lg:block font-display font-extrabold text-[clamp(80px,12vw,140px)] text-base-content/5 leading-none tracking-tighter select-none -mt-4">
              01
            </div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
              >
                <div className="card bg-base-200/50 border border-base-content/5 p-10 h-full transition-all duration-300 hover:bg-base-200 hover:border-primary/20 hover:-translate-y-1 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial-[circle_at_20%_20%,var(--color-primary-dim),transparent_60%] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="font-display font-medium text-[0.6875rem] text-base-content/40 tracking-widest uppercase mb-4">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center mb-8">
                      <f.icon size={22} strokeWidth={1.75} />
                    </div>
                    <h3 className="font-display font-bold text-xl text-base-content mb-4">
                      {f.title}
                    </h3>
                    <p className="text-sm text-base-content/60 leading-relaxed font-normal">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          AI SECTION
      ════════════════════════════════════════════════════════════════════════ */}
      <section
        id="ia"
        className="relative z-10 py-32 bg-base-200/30 border-y border-base-content/5 overflow-hidden"
      >
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12 mb-20">
            <div className="flex-1">
              <SectionHeader
                label="02 — Intelligence artificielle"
                title={
                  <>
                    Ne devinez plus.
                    <br />
                    Laissez l'IA décider.
                  </>
                }
                subtitle="StockWise intègre Google Gemini pour analyser silencieusement vos stocks chaque nuit. Au réveil, vous ne consultez pas des statistiques — vous appliquez des recommandations."
              />
            </div>
            <div className="hidden lg:block font-display font-extrabold text-[clamp(80px,12vw,140px)] text-base-content/5 leading-none tracking-tighter select-none -mt-4">
              02
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left — checklist */}
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex flex-col gap-5"
            >
              {[
                {
                  title: "Sur-stockage identifié",
                  desc: "Plan de liquidation généré avec estimation des pertes potentielles sur 30 jours.",
                },
                {
                  title: "Ruptures anticipées",
                  desc: "Prédiction des risques à J+30 basée sur l'historique de rotation et les tendances marché.",
                },
                {
                  title: "Ajustements de prix",
                  desc: "Suggestions tarifaires dynamiques calculées sur la vélocité de rotation de chaque référence.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex gap-5 p-6 bg-base-100 border border-base-content/5 rounded-2xl transition-colors hover:border-primary/30 group"
                >
                  <div className="w-10 h-10 flex-shrink-0 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                    <Check size={18} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-base-content mb-1.5">
                      {item.title}
                    </h4>
                    <p className="text-[0.8125rem] text-base-content/60 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Right — Terminal insight card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <div className="mockup-code bg-base-300 text-base-content border border-base-content/10 shadow-2xl before:opacity-30">
                <div className="px-6 pb-2 pt-1 border-b border-base-content/5 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-base-content/40">
                    gemini.insight — 23:47:12
                  </span>
                  <div className="badge badge-primary badge-outline text-[10px] font-bold tracking-widest">
                    GÉNÉRÉ
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center">
                      <Brain size={18} />
                    </div>
                    <h4 className="font-display font-bold text-sm text-base-content tracking-tight">
                      Recommandation Stratégique
                    </h4>
                  </div>

                  <div className="bg-base-100/50 border border-base-content/5 rounded-xl p-6 mb-8">
                    <p className="text-sm text-base-content/70 leading-relaxed">
                      Le produit{" "}
                      <span className="text-base-content font-bold border-b border-primary/40 pb-0.5">
                        Tôle Ondulée 3m
                      </span>{" "}
                      affiche une accélération de ventes de{" "}
                      <span className="text-primary font-bold font-mono">
                        +45%
                      </span>{" "}
                      cette semaine. Commandez{" "}
                      <span className="text-base-content font-bold font-mono">
                        150 unités
                      </span>{" "}
                      dès aujourd'hui pour éviter une perte estimée à{" "}
                      <span className="text-error font-bold font-mono">
                        450 000 XAF
                      </span>{" "}
                      la semaine prochaine.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button className="btn btn-primary btn-sm flex-1 rounded-lg font-bold">
                      Approuver
                    </button>
                    <button className="btn btn-ghost btn-outline btn-sm rounded-lg font-bold border-base-content/10">
                      Ignorer
                    </button>
                  </div>

                  <div className="mt-8 pt-6 border-t border-base-content/5">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-base-content/40 font-bold">
                        Confiance IA
                      </span>
                      <span className="font-mono text-[11px] text-primary font-black tracking-tighter">
                        94.7%
                      </span>
                    </div>
                    <div className="h-1.5 bg-base-content/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "94.7%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.5 }}
                        className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.5)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          PRICING (Corrigé entièrement en Tailwind)
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="relative z-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12 mb-20">
            <div className="flex-1">
              <SectionHeader
                label="03 — Tarification"
                title="Transparent par principe."
                subtitle="Démarrez gratuitement, évoluez au rythme de votre croissance. Aucune surprise sur votre facture."
              />
            </div>
            <div className="hidden lg:block font-display font-extrabold text-[clamp(80px,12vw,140px)] text-base-content/5 leading-none tracking-tighter select-none -mt-4">
              03
            </div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          >
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                }}
              >
                <div
                  className={`relative h-full p-8 rounded-2xl border transition-all duration-300 ${
                    plan.featured
                      ? "bg-primary/5 border-primary/30 shadow-xl shadow-primary/10 scale-105 md:scale-100"
                      : "bg-base-200/50 border-base-content/10 hover:border-base-content/30"
                  }`}
                >
                  {/* Badge */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-[0.625rem] tracking-[0.12em] uppercase text-base-content/50 font-medium mb-1">
                        {plan.sub}
                      </p>
                      <h3 className="text-xl font-display font-bold text-base-content">
                        {plan.name}
                      </h3>
                    </div>
                    {plan.featured && (
                      <span className="bg-primary text-primary-content text-[0.625rem] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Populaire
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-4xl font-display font-extrabold tracking-tight ${
                          plan.featured ? "text-primary" : "text-base-content"
                        }`}
                      >
                        {plan.price}
                      </span>
                      {plan.unit && (
                        <span className="text-xs text-base-content/60 font-medium">
                          {plan.unit}
                        </span>
                      )}
                    </div>
                  </div>

                  <hr className="border-base-content/10 mb-6" />

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 ${
                            plan.featured
                              ? "bg-primary/20 border border-primary/30 text-primary"
                              : "bg-base-300 border border-base-content/20 text-base-content/60"
                          }`}
                        >
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="text-sm text-base-content/80">
                          {f}
                        </span>
                      </li>
                    ))}
                    {plan.excluded.map((f, j) => (
                      <li
                        key={`x-${j}`}
                        className="flex items-start gap-3 opacity-40"
                      >
                        <div className="w-5 h-5 rounded-md bg-base-300 border border-base-content/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <X
                            size={11}
                            strokeWidth={2.5}
                            className="text-base-content/40"
                          />
                        </div>
                        <span className="text-sm text-base-content/50 line-through">
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    {plan.featured ? (
                      <Link
                        to="/register"
                        className="btn btn-primary w-full justify-center gap-2 rounded-xl font-bold"
                      >
                        {plan.cta} <ArrowRight size={15} />
                      </Link>
                    ) : (
                      <Link
                        to={i === 2 ? "/contact" : "/register"}
                        className="btn btn-outline w-full justify-center rounded-xl font-bold border-base-content/20 hover:border-base-content/40"
                      >
                        {plan.cta}
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          TESTIMONIALS (Corrigé entièrement en Tailwind)
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 md:py-32 bg-base-200/40 border-y border-base-content/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12 mb-20">
            <div className="flex-1">
              <SectionHeader
                label="04 — Témoignages"
                title="Ce que disent nos clients."
                subtitle="Une communauté de PME qui a transformé sa logistique grâce à l'intelligence artificielle."
              />
            </div>
            <div className="hidden lg:block font-display font-extrabold text-[clamp(80px,12vw,140px)] text-base-content/5 leading-none tracking-tighter select-none -mt-4">
              04
            </div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                }}
                className="h-full"
              >
                <div className="bg-base-100/80 backdrop-blur-sm border border-base-content/10 rounded-2xl p-8 h-full flex flex-col shadow-sm hover:shadow-md transition-shadow">
                  <Quote size={28} className="text-primary/40 mb-5" />
                  <p className="text-base text-base-content/80 italic leading-relaxed mb-6 flex-1">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-4 mt-2 pt-4 border-t border-base-content/10">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white border border-base-content/20"
                      style={{ background: `hsl(${i * 100 + 160}, 35%, 28%)` }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-base-content">{t.name}</p>
                      <p className="text-xs text-base-content/50">{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          CTA (Corrigé entièrement en Tailwind)
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-3xl bg-base-200/40 border border-base-content/10 p-10 md:p-16 text-center"
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(var(--color-primary-rgb),0.06), transparent 60%)",
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-6 text-primary tracking-[0.16em] uppercase text-[0.6875rem] font-medium">
                <div className="w-6 h-px bg-primary" />
                05 — Commencer
              </div>
              <h2 className="font-display font-extrabold text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] tracking-tight text-base-content mb-5">
                Prêt à moderniser
                <br />
                votre gestion de stock ?
              </h2>
              <p className="text-lg text-base-content/70 max-w-xl mx-auto mb-10">
                Rejoignez-nous et constatez comment une gestion intelligente
                booste votre rentabilité dès les 30 premiers jours.
              </p>
              <div className="flex justify-center mb-12">
                <Link
                  to="/register"
                  className="btn btn-primary btn-lg px-8 md:px-10 rounded-xl font-bold gap-3 shadow-xl shadow-primary/30"
                >
                  Démarrer mon essai <ArrowRight size={18} />
                </Link>
              </div>

              <div className="pt-8 border-t border-base-content/10 flex flex-wrap items-center justify-center gap-6 md:gap-12">
                {[
                  { icon: Mail, text: "contact@stockwise.app" },
                  { icon: Phone, text: "+237 695 476 255" },
                  { icon: MapPin, text: "Yaoundé, Cameroun" },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-base-content/60"
                  >
                    <c.icon size={18} />
                    <span className="text-sm font-medium">{c.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          FOOTER (Corrigé entièrement en Tailwind)
      ════════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-base-content/10 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
            <div className="col-span-1 lg:col-span-1">
              <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-primary text-primary-content rounded-xl flex items-center justify-center">
                  <PackagePlus size={20} strokeWidth={2.5} />
                </div>
                <span className="font-display font-extrabold text-lg tracking-tight text-base-content">
                  StockWise
                </span>
              </Link>
              <p className="text-sm text-base-content/60 leading-relaxed max-w-xs">
                La solution intelligente de pilotage de stock et d'orchestration
                prédictive pour les PME africaines.
              </p>
            </div>

            {[
              {
                title: "Plateforme",
                links: [
                  "Fonctionnalités",
                  "Tarification",
                  "Intelligence IA",
                  "Témoignages",
                ],
              },
              {
                title: "Légal",
                links: ["Conditions", "Confidentialité", "Cookies"],
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-[0.625rem] tracking-[0.14em] uppercase text-base-content/40 font-medium mb-5">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((l, j) => (
                    <li key={j}>
                      <a
                        href="#"
                        className="text-sm text-base-content/60 hover:text-base-content transition-colors"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <hr className="border-base-content/10 mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-base-content/50">
            <p>© 2026 StockWise Inc. Tous droits réservés.</p>
            <p className="flex items-center gap-1">
              Conçu et développé au Cameroun par{" "}
              <span>
                <a
                  href="https://www.johnfullstack.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-content transition-colors"
                >
                  Darren Jonathan NDONGO NDONGO
                </a>
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
