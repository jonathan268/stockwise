import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Package,
  TrendingUp,
  Bell,
  Zap,
  ShieldCheck,
  Menu,
  CheckCircle,
  RocketIcon,
  PlayCircle,
  Sparkles,
  BrainCircuit,
  Star,
  Building2,
  Info,
  Check,
  Twitter,
  Facebook,
  Linkedin,
  Moon,
  Sun,
  X,
  ArrowRight,
  Lightbulb,
  Target,
  Rocket,
  BarChart3,
  Cpu,
  Users,
  Home,
  CircuitBoard,
  DollarSign,
  Building,
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("forest");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => {
    navigate("/register");
  };

  const handleSignIn = () => {
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "forest" ? "light" : "forest");
  };

  return (
    <div
      data-theme={theme === "light" ? "light" : "forest"}
      className="min-h-screen bg-base-100 transition-colors duration-300"
    >
      {/* Navbar */}
      <nav className="navbar sticky top-0 z-40 bg-base-100/80 backdrop-blur-lg border-b border-base-300 shadow-lg">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl md:text-2xl font-bold normal-case gap-3" href="#">
            <div className="p-2 rounded-lg bg-primary">
              <BrainCircuit className="w-6 h-6 text-base-100" />
            </div>
            <span className="hidden sm:inline text-primary font-bold">
              StockWise
            </span>
          </a>
        </div>

        {/* Desktop Menu */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-1">
            <li>
              <a
                href="#home"
                className="hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Home size={20}/>
                Acceuil
              </a>
            </li>
            <li>
              <a
                href="#features"
                className="hover:bg-primary/10 rounded-lg transition-colors"
              >
                <CircuitBoard size={20}/>
                Fonctionnalités
              </a>
            </li>
             <li>
              <a
                href="#pricing"
                className="hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Building size={20}/>
                Abonnements
              </a>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="navbar-end gap-2 md:gap-4">
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle transition-all hover:bg-primary/20"
            title={`Thème ${theme === "light" ? "Synthwave" : "Light"}`}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={handleSignIn}
            className="btn btn-ghost rounded-lg hidden sm:inline-flex"
          >
            Connexion
          </button>
          <button
            onClick={handleGetStarted}
            className="btn btn-primary gap-2 rounded-lg"
          >
            <Rocket className="w-4 h-4" />
            <span className="hidden sm:inline">Essai gratuit</span>
            <span className="sm:hidden">Essai</span>
          </button>

          {/* Mobile Menu Button */}
          <div className="dropdown dropdown-end lg:hidden">
            <button
              tabIndex="0"
              className="btn btn-ghost btn-circle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            {mobileMenuOpen && (
              <ul
                tabIndex="0"
                className="dropdown-content z-1 menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-300"
              >
                <li>
                  <a href="#features" onClick={() => setMobileMenuOpen(false)}>
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>
                    Tarifs
                  </a>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero min-h-screen bg-base-100 relative overflow-hidden pt-20">
        <div className="hero-content flex-col max-w-4xl gap-12 relative z-10 text-center">
          {/* Content */}
          <div className="flex-1">
            <div className="badge badge-lg badge-ghost gap-2 mb-6 border-2 border-primary/30 mx-auto">
              <Sparkles className="w-4 h-4" />
              Alimenté par l'Intelligence Artificielle 
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="block">Transformez votre</span>
              <span className="">gestion de stock</span>
              <span className="block">avec <span className="text-primary animate-bounce">l'IA</span></span>
            </h1>

            <p className="text-lg md:text-xl text-base-content/70 mb-8 max-w-2xl mx-auto leading-relaxed">
              Prédictions intelligentes, alertes automatisées et rapports en
              temps réel. Optimisez votre inventaire et augmentez votre
              efficacité operationnelle.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={handleGetStarted}
                className="btn btn-lg btn-primary gap-2 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                <Rocket className="w-5 h-5" />
                Commencer Gratuitement
              </button>
              <button className="btn btn-lg btn-outline gap-2 hover:bg-base-200">
                <PlayCircle className="w-5 h-5" />
                Voir la démo
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 text-sm sm:text-base justify-center">
              <div className="flex items-center gap-2 justify-center">
                <div className="badge badge-success gap-1">
                  <CheckCircle className="w-4 h-4" />
                  14 jours gratuit
                </div>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <div className="badge badge-success gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Aucune carte bancaire requise
                </div>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <div className="badge badge-success gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Support 24/7
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg bg-base-100 shadow-lg">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                500+
              </div>
              <p className="text-base-content/70 font-medium">
                Entreprises actives
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-base-100 shadow-lg">
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">
                99.9%
              </div>
              <p className="text-base-content/70 font-medium">Uptime garanti</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-base-100 shadow-lg">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                40%
              </div>
              <p className="text-base-content/70 font-medium">
                Gain d'efficacité
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-base-100 shadow-lg">
              <div className="text-4xl md:text-5xl font-bold text-warning mb-2">
                $2M
              </div>
              <p className="text-base-content/70 font-medium">Stocks gérés</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Des features <span className="text-primary">magiques</span>
            </h2>
            <p className="text-lg text-base-content/60 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer votre stock
              intelligemment
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div
                  key={idx}
                  className="card bg-base-200 hover:shadow-2xl transition-all hover:scale-105 group cursor-pointer"
                >
                  <div className="card-body">
                    <div
                      className={`w-14 h-14 rounded-xl bg-${feature.color}/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className={`w-7 h-7 text-${feature.color}`} />
                    </div>
                    <h3 className="card-title text-xl">{feature.title}</h3>
                    <p className="text-base-content/70">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Tarifs <span className="text-primary">simples</span> et{" "}
              <span className="text-secondary">transparents</span>
            </h2>
            <p className="text-lg text-base-content/60 max-w-2xl mx-auto">
              Tous les plans incluent 14 jours gratuits. Aucune surprise.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
              <div
                key={idx}
                className={`card transition-all ${
                  plan.popular
                    ? "ring-2 ring-primary shadow-2xl scale-105"
                    : "shadow-lg"
                } bg-base-100`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="badge badge-primary gap-1 text-base p-3">
                      <Star className="w-4 h-4" />
                      Populaire
                    </div>
                  </div>
                )}
                <div className="card-body">
                  <h3 className="card-title text-2xl">{plan.name}</h3>
                  <p className="text-base-content/60 text-sm">{plan.desc}</p>
                  <div className="my-4">
                    <span className="text-5xl font-black text-primary">
                      {plan.price}
                    </span>
                    <span className="text-base-content/60"> FCFA/mois</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-success flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleGetStarted}
                    className={`btn gap-2 ${
                      plan.popular ? "btn-primary" : "btn-secondary"
                    } w-full`}
                  >
                    Essayer
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-primary rounded-2xl shadow-2xl p-8 md:p-16 text-center text-primary-content">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Prêt à transformer votre gestion ?
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Rejoignez des centaines d'entreprises qui font confiance à
              StockWise
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="btn btn-lg btn-white gap-2 hover:bg-primary"
              >
                <Rocket className="w-5 h-5" />
                Commencer maintenant
              </button>
              <button className="btn btn-lg btn-secondary gap-2 hover:bg-white/20">
                <PlayCircle className="w-5 h-5" />
                Voir la démo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-base-300 text-base-content">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-primary">
                  <BrainCircuit className="w-5 h-5 text-base-100" />
                </div>
                <span className="font-bold text-lg">StockWise</span>
              </div>
              <p className="text-sm text-base-content/60">
                L'IA au service de votre stock
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a className="link link-hover">Fonctionnalités</a>
                </li>
                <li>
                  <a className="link link-hover">Tarifs</a>
                </li>
                <li>
                  <a className="link link-hover">Sécurité</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a className="link link-hover">À propos</a>
                </li>
                <li>
                  <a className="link link-hover">Blog</a>
                </li>
                <li>
                  <a className="link link-hover">Carrières</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a className="link link-hover">Aide</a>
                </li>
                <li>
                  <a className="link link-hover">Contact</a>
                </li>
                <li>
                  <a className="link link-hover">Docs</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a className="link link-hover">Conditions</a>
                </li>
                <li>
                  <a className="link link-hover">Confidentialité</a>
                </li>
                <li>
                  <a className="link link-hover">Cookies</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="divider"></div>

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-base-content/60">
              © 2026 StockWise. Tous droits réservés.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <button className="btn btn-ghost btn-circle btn-sm">
                <Twitter className="w-5 h-5" />
              </button>
              <button className="btn btn-ghost btn-circle btn-sm">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="btn btn-ghost btn-circle btn-sm">
                <Linkedin className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: slideInUp 0.6s ease-out;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(0deg, transparent 24%, rgba(255,255,255, 0.05) 25%, rgba(255,255,255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255, 0.05) 75%, rgba(255,255,255, 0.05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(255,255,255, 0.05) 25%, rgba(255,255,255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255, 0.05) 75%, rgba(255,255,255, 0.05) 76%, transparent 77%, transparent);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
}
