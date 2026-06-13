import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  PackagePlus,
  ArrowRight,
  Brain,
  TrendingUp,
  LayoutDashboard,
  Zap,
  Bell,
  Check,
  Menu,
  Sun,
  Moon,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  ScanBarcode,
  Radio,
  Bitcoin,
  X,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const plans = [
  {
    name: 'Starter',
    price: '0',
    currency: 'XAF',
    period: '/mois',
    desc: 'Pour decouvrir la puissance de StockWise.',
    cta: 'Creer mon compte',
    href: '/register',
    features: [
      "Jusqu'a 50 references",
      '2 utilisateurs',
      'Tableau de bord de base',
      'Alertes email',
      'Support par email',
    ],
    notIncluded: [
      'IA Predictive Gemini',
      'Multi-sites & Transferts',
      'Export CSV avance',
    ],
  },
  {
    name: 'Professionnel',
    price: '9 900',
    currency: 'XAF',
    period: '/mois',
    desc: 'Pour les PME qui veulent passer a la vitesse superieure.',
    cta: 'Essai 30 jours gratuit',
    href: '/register',
    popular: true,
    features: [
      'References illimitees',
      'Utilisateurs illimites',
      'IA Gemini Copilot activee',
      'Multi-sites & Transferts',
      'Alertes en temps reel',
      'Export CSV avance',
      'Support prioritaire',
    ],
    notIncluded: [],
  },
  {
    name: 'Entreprise',
    price: '29 900',
    currency: 'XAF',
    period: '/mois',
    desc: 'Pour les organisations avec des besoins sur mesure.',
    cta: 'Contacter le support',
    href: '#',
    features: [
      'Multi-organisations',
      'Entrepots illimites',
      "API d'integration externe",
      'Support telephonique 24/7',
      'SLA garanti 99.9%',
      'Onboarding dedie',
      'Audit & Rapports avances',
    ],
    notIncluded: [],
  },
];

const testimonials = [
  {
    name: 'Marie N.',
    role: 'Gerante Quincaillerie, Douala',
    text: "Depuis StockWise, fini les ruptures de ciment. L'IA anticipe mes commandes a la perfection. Je ne consulte meme plus mes stocks manuellement.",
    rating: 5,
    img: 'https://picsum.photos/seed/marie/200/200',
  },
  {
    name: 'Paul K.',
    role: 'Grossiste Alimentaire, Yaounde',
    text: "L'interface est d'une fluidite incroyable. Le suivi temps reel entre depots a sauve notre tresorerie. On a reduit les pertes de 35%.",
    rating: 5,
    img: 'https://picsum.photos/seed/paul/200/200',
  },
  {
    name: 'Sonia B.',
    role: 'CEO Boutique Mode, Douala',
    text: "Le meilleur investissement de l'annee. Les insights nocturnes me font gagner 2h de gestion chaque matin. Le ROI a ete immediat.",
    rating: 5,
    img: 'https://picsum.photos/seed/sonia/200/200',
  },
];

const heroImages = ['/11047.jpg', '/8924.jpg', '/126208.jpg'];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [currentBg, setCurrentBg] = useState(0);
  const [nextBg, setNextBg] = useState(null);
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const aiRef = useRef(null);
  const aiTextRef = useRef(null);
  const pricingRef = useRef(null);
  const ctaRef = useRef(null);
  const testimonialRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, [theme]);

  useEffect(() => {
    if (heroImages.length < 2) return;
    const interval = setInterval(() => {
      let next;
      do { next = Math.floor(Math.random() * heroImages.length); } while (next === currentBg);
      setNextBg(next);
      setTimeout(() => {
        setCurrentBg(next);
        setNextBg(null);
      }, 2000);
    }, 8000);
    return () => clearInterval(interval);
  }, [currentBg]);

  const initGsap = useCallback(() => {
    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      const cards = gsap.utils.toArray('.stack-card');
      if (cards.length) {
        cards.forEach((card, i) => {
          if (i === 0) return;
          gsap.set(card, { y: 60, opacity: 0.6, scale: 0.95 });
        });

        ScrollTrigger.create({
          trigger: featuresRef.current,
          start: 'top 10%',
          end: 'bottom bottom',
          onUpdate: (self) => {
            const progress = self.progress;
            cards.forEach((card, i) => {
              if (i === 0) return;
              const threshold = (i + 1) / cards.length;
              if (progress > threshold * 0.5) {
                const p = Math.min(
                  (progress - threshold * 0.5) / (0.5 / cards.length),
                  1
                );
                gsap.to(card, {
                  y: 60 - p * 60,
                  opacity: 0.6 + p * 0.4,
                  scale: 0.95 + p * 0.05,
                  duration: 0.1,
                  overwrite: 'auto',
                });
              }
            });
          },
        });
      }

      const aiWords = aiTextRef.current;
      if (aiWords) {
        const words = aiWords.querySelectorAll('.word');
        words.forEach((word) => {
          gsap.set(word, { opacity: 0.15 });
        });

        ScrollTrigger.create({
          trigger: aiRef.current,
          start: 'top 70%',
          end: 'center center',
          scrub: 1.5,
          onUpdate: (self) => {
            const progress = self.progress;
            words.forEach((word, i) => {
              const wordProgress = Math.min(
                Math.max((progress * words.length - i) / 1.5, 0),
                1
              );
              word.style.opacity = 0.15 + wordProgress * 0.85;
            });
          },
        });
      }
    });

    return () => mm.revert();
  }, []);

  useEffect(() => {
    const kill = initGsap();
    return () => {
      if (kill) kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [initGsap]);

  useEffect(() => {
    let timer;
    const tick = () => {
      setActiveTestimonial((p) => (p + 1) % testimonials.length);
    };
    timer = setInterval(tick, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="relative min-h-screen bg-base-100 text-base-content font-body overflow-x-hidden w-full max-w-full selection:bg-primary/30">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBndW1ibGVTdHlsZT0ic2ltcGxlIiAvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoNjAwdjYwMEgweiIgZmlsdGVyPSJ1cmwoI2YpIiBvcGFjaXR5PSIuMiIgLz48L3N2Zz4=')]" />

      <div className="fixed top-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none z-0 bg-radial-[circle_at_center,var(--color-primary)/0.06,transparent_70%]" />
      <div className="fixed bottom-[5%] left-[-8%] w-[500px] h-[500px] rounded-full pointer-events-none z-0 bg-radial-[circle_at_center,var(--color-secondary)/0.04,transparent_70%]" />

      {/* NAV */}
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-6xl z-[100] transition-all duration-500 ease-out-expo ${
          scrolled ? 'top-2' : ''
        }`}
      >
        <div
          className={`flex items-center justify-between px-5 transition-all duration-300 rounded-2xl border border-base-content/10 bg-base-100/70 backdrop-blur-2xl shadow-lg ${
            scrolled
              ? 'py-2 bg-base-100/85 shadow-xl shadow-base-900/5'
              : 'py-2.5'
          }`}
        >
          <Link
            to="/"
            className="flex items-center gap-2.5 no-underline text-base-content group"
          >
            <div className="w-8 h-8 bg-primary text-primary-content rounded-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
              <PackagePlus size={18} strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-base tracking-tight">
              StockWise
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Fonctionnalités', href: '#features' },
              { label: 'Intelligence IA', href: '#ia' },
              { label: 'Tarification', href: '#pricing' },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                className="text-[0.8125rem] font-medium text-base-content/60 no-underline tracking-wide hover:text-base-content transition-colors duration-300"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle btn-sm"
              aria-label="Basculer le thème"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link
              to="/login"
              className="btn btn-ghost btn-sm px-4 font-semibold text-base-content/70 text-[0.8125rem]"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="btn btn-primary btn-sm px-5 rounded-lg font-bold gap-1.5 text-[0.8125rem] shadow-lg shadow-primary/20"
            >
              Démarrer <ArrowRight size={13} />
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden btn btn-ghost btn-circle btn-sm"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <div
        className={`fixed inset-0 z-[99] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          menuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-xs z-[100] bg-base-100 shadow-2xl transition-transform duration-500 ease-out-expo ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-base-content/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary text-primary-content rounded-lg flex items-center justify-center">
              <PackagePlus size={18} strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-base tracking-tight">
              StockWise
            </span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="btn btn-ghost btn-circle btn-sm"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-6">
          {[
            { label: 'Fonctionnalités', href: '#features' },
            { label: 'Intelligence IA', href: '#ia' },
            { label: 'Tarification', href: '#pricing' },
          ].map((item, i) => (
            <a
              key={i}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-xl font-display font-bold text-base-content/80 no-underline hover:text-base-content transition-colors"
            >
              {item.label}
            </a>
          ))}
          <hr className="border-base-content/10 my-2" />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle"
              aria-label="Basculer le thème"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          <Link
            to="/login"
            className="btn btn-outline w-full justify-center rounded-lg font-bold"
          >
            Connexion
          </Link>
          <Link
            to="/register"
            className="btn btn-primary w-full justify-center rounded-lg font-bold gap-2"
          >
            Démarrer <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* HERO - Full Background with African Woman */}
      <section
        ref={heroRef}
        className="relative z-10 min-h-[90vh] flex items-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
            style={{
              backgroundImage: `url(${heroImages[currentBg]})`,
              backgroundPosition: '50% 25%',
            }}
          />
          {nextBg !== null && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
              style={{
                backgroundImage: `url(${heroImages[nextBg]})`,
                backgroundPosition: '50% 25%',
                animation: 'heroFade 2s ease-in-out forwards',
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-base-100 via-base-100/85 to-base-100/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-base-100/20 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-32 md:py-40">
          <div className="max-w-2xl 2xl:max-w-3xl">
            <div className="flex items-center gap-2 mb-6 text-primary/70">
              <div className="w-8 h-px bg-primary/50" />
              <span className="text-[0.625rem] font-medium tracking-[0.18em] uppercase">
                Plateforme Intelligente
              </span>
            </div>

            <h1 className="font-display font-extrabold text-[clamp(2.5rem,5.5vw,4.75rem)] leading-[1.05] tracking-tighter text-base-content mb-8 max-w-4xl">
              La gestion de stock. Redéfinie par
              <span className="text-primary"> l'IA.</span>
            </h1>

            <p className="text-[clamp(1rem,1.5vw,1.2rem)] text-base-content/60 leading-relaxed max-w-xl mb-10 font-normal">
              Une plateforme qui anticipe vos ruptures, orchestre vos ventes et
              protège votre trésorerie avec une précision chirurgicale.
              Propulsée par Google Gemini.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="btn btn-primary btn-lg px-8 rounded-xl font-bold gap-2.5 shadow-xl shadow-primary/25 text-base"
              >
                Créer un compte gratuit <ArrowRight size={18} />
              </Link>
              <a
                href="#features"
                className="btn btn-outline btn-lg px-8 rounded-xl font-bold border-base-content/15 hover:border-base-content/40 text-base"
              >
                Découvrir
              </a>
            </div>

            <div className="flex items-center gap-6 mt-14 pt-8 border-t border-base-content/10">
              <div className="flex -space-x-2.5">
                {[
                  'https://picsum.photos/seed/user1/200/200',
                  'https://picsum.photos/seed/user2/200/200',
                  'https://picsum.photos/seed/user3/200/200',
                  'https://picsum.photos/seed/user4/200/200',
                ].map((src, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-base-100 bg-cover bg-center ring-1 ring-base-content/10"
                    style={{ backgroundImage: `url(${src})` }}
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-base-content">+120 PME</p>
                <p className="text-xs text-base-content/50">
                  font confiance à StockWise
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES - Bento Grid + Card Stacking GSAP */}
      <section
        id="features"
        ref={featuresRef}
        className="relative z-10 py-32 md:py-48"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="mb-20">
            <div className="flex items-center gap-2 mb-4 text-primary/60">
              <div className="w-8 h-px bg-primary/50" />
              <span className="text-[0.625rem] font-medium tracking-[0.18em] uppercase">
                Architecture
              </span>
            </div>
            <h2 className="font-display font-extrabold text-[clamp(2.2rem,4.5vw,4rem)] leading-[1.08] tracking-tighter text-base-content max-w-3xl mb-5">
              Tout ce dont vous avez besoin pour
              <span className="text-primary"> maîtriser</span> votre inventaire.
            </h2>
            <p className="text-base sm:text-lg text-base-content/60 max-w-2xl leading-relaxed">
              Chaque fonctionnalité a été conçue pour éliminer la complexité
              opérationnelle, pas l'ajouter. De la prédiction IA à la
              facturation mobile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 grid-flow-dense">
            {/* Card 1 - Product Management (col-span-2, row-span-2) */}
            <div className="stack-card col-span-1 md:col-span-2 row-span-1 md:row-span-2 group relative overflow-hidden rounded-2xl border border-base-content/10 bg-base-200/40 hover:bg-base-200/60 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10 h-full p-8 md:p-10 flex flex-col">
                <div className="w-11 h-11 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <ScanBarcode size={22} strokeWidth={1.75} />
                </div>
                <h3 className="font-display font-bold text-xl md:text-2xl text-base-content mb-4">
                  Catalogue Intelligent
                </h3>
                <p className="text-sm md:text-base text-base-content/60 leading-relaxed mb-6 flex-1">
                  Gérez vos produits avec une précision atomique. Catégories,
                  SKU, stocks, seuils. Chaque mouvement est tracé et historisé.
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    'CRUD complet',
                    'Catégories',
                    'SKU auto',
                    'Stock tracking',
                  ].map((tag, i) => (
                    <span
                      key={i}
                      className="text-[0.625rem] font-bold tracking-wider uppercase px-3 py-1.5 rounded-lg bg-base-300/80 text-base-content/60 border border-base-content/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div
                  className="absolute bottom-0 right-0 w-48 h-48 opacity-[0.04] bg-cover bg-center pointer-events-none"
                  style={{
                    backgroundImage:
                      'url(https://picsum.photos/seed/products/400/400)',
                  }}
                />
              </div>
            </div>

            {/* Card 2 - Real-time */}
            <div className="stack-card col-span-1 group relative overflow-hidden rounded-2xl border border-base-content/10 bg-gradient-to-br from-violet-500/5 to-transparent hover:from-violet-500/10 transition-all duration-500">
              <div className="relative z-10 p-7 md:p-8 h-full flex flex-col">
                <div className="w-10 h-10 bg-violet-500/10 text-violet-500 border border-violet-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                  <Radio size={20} strokeWidth={1.75} />
                </div>
                <h3 className="font-display font-bold text-lg text-base-content mb-3">
                  Temps Réel
                </h3>
                <p className="text-sm text-base-content/60 leading-relaxed flex-1">
                  WebSockets natifs. Chaque modification se synchronise
                  instantanément.
                </p>
                <div className="mt-5 pt-4 border-t border-base-content/10">
                  <span className="text-xs font-mono text-violet-400 font-bold tracking-wider">
                    Synchro 120ms
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3 - Alerts */}
            <div className="stack-card col-span-1 group relative overflow-hidden rounded-2xl border border-base-content/10 bg-gradient-to-br from-rose-500/5 to-transparent hover:from-rose-500/10 transition-all duration-500">
              <div className="relative z-10 p-7 md:p-8 h-full flex flex-col">
                <div className="w-10 h-10 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                  <Bell size={20} strokeWidth={1.75} />
                </div>
                <h3 className="font-display font-bold text-lg text-base-content mb-3">
                  Alertes
                </h3>
                <p className="text-sm text-base-content/60 leading-relaxed flex-1">
                  Seuils intelligents. Notifications avant la rupture.
                </p>
                <div className="mt-5 pt-4 border-t border-base-content/10">
                  <span className="text-xs font-mono text-rose-400 font-bold tracking-wider">
                    Temps réel
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4 - AI Agent (col-span-2) */}
            <div className="stack-card col-span-1 md:col-span-2 group relative overflow-hidden rounded-2xl border border-base-content/10 bg-gradient-to-br from-amber-500/5 to-transparent hover:from-amber-500/10 transition-all duration-500">
              <div className="relative z-10 p-7 md:p-8 h-full flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-11 h-11 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl flex items-center justify-center mb-4 md:mb-0 group-hover:scale-110 transition-transform duration-500">
                    <Brain size={22} strokeWidth={1.75} />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg md:text-xl text-base-content mb-2">
                    Agent IA Nocturne
                  </h3>
                  <p className="text-sm text-base-content/60 leading-relaxed">
                    Gemini 2.5 Flash analyse vos données chaque nuit et génère
                    des recommandations stratégiques. Sur-stockage, ruptures
                    anticipées, ajustements de prix.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                    <Zap size={12} /> Confiance 94.7%
                  </span>
                </div>
              </div>
            </div>

            {/* Card 5 - Dashboard */}
            <div className="stack-card col-span-1 group relative overflow-hidden rounded-2xl border border-base-content/10 bg-gradient-to-br from-blue-500/5 to-transparent hover:from-blue-500/10 transition-all duration-500">
              <div className="relative z-10 p-7 md:p-8 h-full flex flex-col">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                  <LayoutDashboard size={20} strokeWidth={1.75} />
                </div>
                <h3 className="font-display font-bold text-lg text-base-content mb-3">
                  Tableau de Bord KPI
                </h3>
                <p className="text-sm text-base-content/60 leading-relaxed flex-1">
                  Métriques en temps réel, graphiques, tendances. Une vue 360°
                  de votre activité.
                </p>
              </div>
            </div>

            {/* Card 6 - NotchPay */}
            <div className="stack-card col-span-1 group relative overflow-hidden rounded-2xl border border-base-content/10 bg-gradient-to-br from-cyan-500/5 to-transparent hover:from-cyan-500/10 transition-all duration-500">
              <div className="relative z-10 p-7 md:p-8 h-full flex flex-col">
                <div className="w-10 h-10 bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                  <Bitcoin size={20} strokeWidth={1.75} />
                </div>
                <h3 className="font-display font-bold text-lg text-base-content mb-3">
                  Paiement Mobile
                </h3>
                <p className="text-sm text-base-content/60 leading-relaxed flex-1">
                  MTN & Orange Money. Abonnements, factures, tout-en-un.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI SECTION - GSAP Scrubbing Text Reveals */}
      <section id="ia" ref={aiRef} className="relative z-10 py-32 md:py-48">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20">
            <div className="lg:col-span-2">
              <div className="sticky top-32">
                <div className="flex items-center gap-2 mb-4 text-primary/60">
                  <div className="w-8 h-px bg-primary/50" />
                  <span className="text-[0.625rem] font-medium tracking-[0.18em] uppercase">
                    Intelligence Artificielle
                  </span>
                </div>
                <h2 className="font-display font-extrabold text-[clamp(2rem,4vw,3.5rem)] leading-[1.08] tracking-tighter text-base-content max-w-xl mb-6">
                  Votre stock analysé par
                  <span className="text-primary"> Gemini.</span>
                </h2>
                <p className="text-base text-base-content/60 leading-relaxed mb-10">
                  Chaque nuit, pendant que vous dormez, notre agent IA analyse
                  vos données de vente, historiques et tendances. Le matin, vous
                  appliquez des décisions éclairées.
                </p>
                <div className="space-y-4">
                  {[
                    {
                      label: 'Sur-stockage identifié',
                      desc: 'Plan de liquidation avec estimation des pertes potentielles',
                    },
                    {
                      label: 'Ruptures anticipées',
                      desc: 'Prédiction des risques à J+30 basée sur la rotation',
                    },
                    {
                      label: 'Ajustements de prix',
                      desc: 'Suggestions tarifaires dynamiques par référence',
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-4 p-4 rounded-xl bg-base-200/30 border border-base-content/5 hover:border-primary/20 transition-all duration-300 group"
                    >
                      <div className="w-8 h-8 flex-shrink-0 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Check size={15} strokeWidth={3} />
                      </div>
                      <div>
                        <p className="font-display font-bold text-sm text-base-content mb-0.5">
                          {item.label}
                        </p>
                        <p className="text-xs text-base-content/50 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3" ref={aiTextRef}>
              <div className="rounded-2xl border border-base-content/10 bg-base-200/30 overflow-hidden shadow-2xl">
                <div className="px-6 py-3 border-b border-base-content/10 flex items-center justify-between bg-base-300/20">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-base-content/30 ml-3">
                      gemini.insight &mdash; analyse nocturne
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Actif
                  </span>
                </div>

                <div className="p-8 md:p-10 space-y-6">
                  <p className="text-sm md:text-base text-base-content/70 leading-[1.9] tracking-wide">
                    <span className="word text-base-content font-semibold">
                      Bonjour.
                    </span>{' '}
                    <span className="word">Analyse</span>{' '}
                    <span className="word">nocturne</span>{' '}
                    <span className="word">terminée.</span>{' '}
                    <span className="word">Voici</span>{' '}
                    <span className="word">vos</span>{' '}
                    <span className="word">recommandations</span>{' '}
                    <span className="word">prioritaires</span>{' '}
                    <span className="word">pour</span>{' '}
                    <span className="word">aujourd'hui.</span>
                  </p>

                  <div className="bg-base-100/50 border border-base-content/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-base-content font-display">
                          Alerte stratégique
                        </p>
                        <p className="text-[10px] text-base-content/40 font-mono">
                          Priorité haute &mdash; 23:47 GMT+1
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-base-content/70 leading-relaxed">
                      Le produit{' '}
                      <span className="text-base-content font-bold border-b border-primary/40">
                        Tôle Ondulée 3m
                      </span>{' '}
                      affiche une accélération de{' '}
                      <span className="text-primary font-bold font-mono">
                        +45%
                      </span>{' '}
                      cette semaine. Commandez{' '}
                      <span className="text-base-content font-bold font-mono">
                        150 unités
                      </span>{' '}
                      pour éviter une perte estimée à{' '}
                      <span className="text-rose-500 font-bold font-mono">
                        450 000 XAF
                      </span>
                      .
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button className="btn btn-primary btn-sm flex-1 rounded-lg font-bold text-xs">
                      Approuver la recommandation
                    </button>
                    <button className="btn btn-ghost btn-outline btn-sm rounded-lg font-bold text-xs border-base-content/10">
                      Ignorer
                    </button>
                  </div>

                  <div className="pt-4 border-t border-base-content/10">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-base-content/30 font-bold">
                        Indice de confiance
                      </span>
                      <span className="text-xs font-mono text-primary font-black tracking-tighter">
                        94.7%
                      </span>
                    </div>
                    <div className="h-1.5 bg-base-content/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.5)]"
                        style={{ width: '94.7%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        ref={pricingRef}
        className="relative z-10 py-32 md:py-48 bg-base-200/20 border-y border-base-content/5"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="mb-20 text-center">
            <div className="flex items-center justify-center gap-2 mb-4 text-primary/60">
              <div className="w-8 h-px bg-primary/50" />
              <span className="text-[0.625rem] font-medium tracking-[0.18em] uppercase">
                Tarification
              </span>
              <div className="w-8 h-px bg-primary/50" />
            </div>
            <h2 className="font-display font-extrabold text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.08] tracking-tighter text-base-content mb-5">
              Un plan pour chaque étape.
            </h2>
            <p className="text-base sm:text-lg text-base-content/60 max-w-xl mx-auto leading-relaxed">
              Démarrez gratuitement, évoluez au rythme de votre croissance.
              Aucune surprise sur votre facture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative flex flex-col rounded-2xl border transition-all duration-500 ${
                  plan.popular
                    ? 'bg-primary/5 border-primary/30 shadow-xl shadow-primary/10 scale-[1.02] md:scale-105 z-10'
                    : 'bg-base-100/50 border-base-content/10 hover:border-base-content/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-content text-[0.5625rem] font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    Le plus populaire
                  </div>
                )}

                <div className="p-8">
                  <div className="mb-6">
                    <p className="text-[0.625rem] tracking-[0.12em] uppercase text-base-content/40 font-medium mb-1">
                      {plan.desc}
                    </p>
                    <h3 className="text-xl font-display font-bold text-base-content">
                      {plan.name}
                    </h3>
                  </div>

                  <div className="flex items-baseline gap-1 mb-8">
                    <span
                      className={`text-4xl md:text-5xl font-display font-extrabold tracking-tight ${
                        plan.popular ? 'text-primary' : 'text-base-content'
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span className="text-xs text-base-content/50 font-medium">
                      {plan.currency}
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 ${
                            plan.popular
                              ? 'bg-primary/20 border border-primary/30 text-primary'
                              : 'bg-base-300 border border-base-content/20 text-base-content/60'
                          }`}
                        >
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span className="text-sm text-base-content/80">
                          {f}
                        </span>
                      </li>
                    ))}
                    {plan.notIncluded.map((f, j) => (
                      <li
                        key={`x-${j}`}
                        className="flex items-start gap-3 opacity-40"
                      >
                        <div className="w-5 h-5 rounded-md bg-base-300 border border-base-content/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <X
                            size={10}
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
                </div>

                <div className="px-8 pb-8 mt-auto">
                  {plan.popular ? (
                    <Link
                      to={plan.href}
                      className="btn btn-primary w-full justify-center gap-2 rounded-xl font-bold"
                    >
                      {plan.cta} <ArrowRight size={15} />
                    </Link>
                  ) : (
                    <Link
                      to={plan.href}
                      className="btn btn-outline w-full justify-center rounded-xl font-bold border-base-content/20 hover:border-base-content/40"
                    >
                      {plan.cta}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - Carousel fluide */}
      <section ref={testimonialRef} className="relative z-10 py-32 md:py-48">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="flex items-center justify-between mb-20">
            <div>
              <div className="flex items-center gap-2 mb-4 text-primary/60">
                <div className="w-8 h-px bg-primary/50" />
                <span className="text-[0.625rem] font-medium tracking-[0.18em] uppercase">
                  Témoignages
                </span>
              </div>
              <h2 className="font-display font-extrabold text-[clamp(2rem,4vw,3.25rem)] leading-[1.08] tracking-tighter text-base-content max-w-2xl">
                La parole à nos clients.
              </h2>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() =>
                  setActiveTestimonial(
                    (p) => (p - 1 + testimonials.length) % testimonials.length
                  )
                }
                className="btn btn-ghost btn-circle btn-sm border border-base-content/10 hover:border-base-content/30 transition-all duration-300"
                aria-label="Témoignage précédent"
              >
                <ArrowUpRight size={16} className="rotate-180" />
              </button>
              <button
                onClick={() =>
                  setActiveTestimonial((p) => (p + 1) % testimonials.length)
                }
                className="btn btn-ghost btn-circle btn-sm border border-base-content/10 hover:border-base-content/30 transition-all duration-300"
                aria-label="Témoignage suivant"
              >
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-out-expo"
              style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
            >
              {testimonials.map((t, i) => (
                <div key={i} className="w-full flex-shrink-0 px-1">
                  <div className="rounded-2xl border border-base-content/10 bg-base-200/30 p-8 md:p-10 h-full max-w-2xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className="w-14 h-14 rounded-full bg-cover bg-center ring-2 ring-primary/20 flex-shrink-0"
                        style={{ backgroundImage: `url(${t.img})` }}
                      />
                      <div>
                        <p className="font-display font-bold text-base text-base-content">
                          {t.name}
                        </p>
                        <p className="text-sm text-base-content/50">{t.role}</p>
                      </div>
                    </div>

                    <div className="flex gap-1 mb-5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <div
                          key={j}
                          className="w-2 h-2 rounded-full bg-primary/60 transition-all duration-300"
                          style={{
                            transform:
                              i === activeTestimonial
                                ? 'scale(1.2)'
                                : 'scale(1)',
                          }}
                        />
                      ))}
                    </div>

                    <p className="text-base text-base-content/70 leading-relaxed italic">
                      &ldquo;{t.text}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mt-10">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`transition-all duration-500 rounded-full ${
                  i === activeTestimonial
                    ? 'bg-primary h-2 w-8'
                    : 'bg-base-content/20 h-2 w-2 hover:bg-base-content/40'
                }`}
                aria-label={`Témoignage ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="relative z-10 py-32 md:py-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="relative overflow-hidden rounded-3xl bg-base-200/40 border border-base-content/10 p-10 md:p-20 text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(var(--color-primary-rgb),0.06),transparent_60%)] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-6 text-primary/60">
                <div className="w-8 h-px bg-primary/50" />
                <span className="text-[0.625rem] font-medium tracking-[0.18em] uppercase">
                  Prêt à passer à l'action ?
                </span>
                <div className="w-8 h-px bg-primary/50" />
              </div>

              <h2 className="font-display font-extrabold text-[clamp(2rem,4vw,3.5rem)] leading-[1.08] tracking-tighter text-base-content mb-5">
                Prêt à moderniser
                <span className="text-primary"> votre gestion</span> de stock ?
              </h2>

              <p className="text-base sm:text-lg text-base-content/60 max-w-lg mx-auto mb-10 leading-relaxed">
                Rejoignez les PME qui ont transformé leur logistique et boosté
                leur rentabilité dès les 30 premiers jours.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-14">
                <Link
                  to="/register"
                  className="btn btn-primary btn-lg px-10 rounded-xl font-bold gap-3 shadow-xl shadow-primary/25 text-base"
                >
                  Démarrer mon essai gratuit <ArrowRight size={18} />
                </Link>
                <a
                  href="#features"
                  className="btn btn-outline btn-lg px-10 rounded-xl font-bold border-base-content/15 hover:border-base-content/40 text-base"
                >
                  Découvrir la plateforme
                </a>
              </div>

              <div className="pt-8 border-t border-base-content/10 flex flex-wrap items-center justify-center gap-6 md:gap-12">
                {[
                  { icon: Mail, text: 'contact@stockwise.app' },
                  { icon: Phone, text: '+237 695 476 255' },
                  { icon: MapPin, text: 'Yaoundé, Cameroun' },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-base-content/50"
                  >
                    <c.icon size={16} />
                    <span className="text-sm font-medium">{c.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-base-content/10 py-14 md:py-20 bg-base-200/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 mb-12">
            <div className="lg:col-span-2">
              <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-content rounded-lg flex items-center justify-center">
                  <PackagePlus size={18} strokeWidth={2.5} />
                </div>
                <span className="font-display font-bold text-base tracking-tight text-base-content">
                  StockWise
                </span>
              </Link>
              <p className="text-sm text-base-content/50 leading-relaxed max-w-xs mb-6">
                La solution intelligente de pilotage de stock et d'orchestration
                prédictive pour les PME africaines.
              </p>
              <div className="flex gap-3">
                {[Mail, Phone, MapPin].map((Icon, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-lg bg-base-300/50 border border-base-content/10 flex items-center justify-center text-base-content/40 hover:text-base-content hover:border-base-content/30 transition-all duration-300 cursor-pointer"
                  >
                    <Icon size={14} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[0.625rem] tracking-[0.14em] uppercase text-base-content/40 font-medium mb-5">
                Plateforme
              </h4>
              <ul className="space-y-3">
                {[
                  'Fonctionnalités',
                  'Tarification',
                  'Intelligence IA',
                  'Témoignages',
                ].map((l, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-sm text-base-content/50 hover:text-base-content transition-colors duration-300"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[0.625rem] tracking-[0.14em] uppercase text-base-content/40 font-medium mb-5">
                Légal
              </h4>
              <ul className="space-y-3">
                {["Conditions d'utilisation", 'Confidentialité', 'Cookies'].map(
                  (l, i) => (
                    <li key={i}>
                      <a
                        href="#"
                        className="text-sm text-base-content/50 hover:text-base-content transition-colors duration-300"
                      >
                        {l}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-[0.625rem] tracking-[0.14em] uppercase text-base-content/40 font-medium mb-5">
                Contact
              </h4>
              <ul className="space-y-3">
                <li className="text-sm text-base-content/50">
                  contact@stockwise.app
                </li>
                <li className="text-sm text-base-content/50">
                  +237 695 476 255
                </li>
                <li className="text-sm text-base-content/50">
                  Yaoundé, Cameroun
                </li>
              </ul>
            </div>
          </div>

          <hr className="border-base-content/10 mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-base-content/40">
            <p>&copy; 2026 StockWise Inc. Tous droits réservés.</p>
            <p>
              Conçu et développé au Cameroun par{' '}
              <a
                href="https://www.johnfullstack.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors duration-300"
              >
                Darren Jonathan NDONGO NDONGO
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
