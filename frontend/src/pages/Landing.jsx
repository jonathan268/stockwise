import React from "react";
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
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/register");
  };

  const handleSignIn = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Navbar */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4">
        <div className="navbar glass rounded-full shadow-2xl px-6">
          <div className="navbar-start">
            <div className="dropdown">
              <label
                tabIndex="0"
                className="btn btn-ghost btn-circle lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </label>
              <ul
                tabIndex="0"
                className="menu menu-sm dropdown-content mt-3 z-[1] p-4 shadow glass rounded-2xl w-52"
              >
                <li>
                  <a href="#features" className="rounded-lg">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="rounded-lg">
                    Tarifs
                  </a>
                </li>
                <li>
                  <a href="#contact" className="rounded-lg">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <a className="btn btn-ghost text-xl font-bold normal-case">
              <BrainCircuit className="w-6 h-6 text-primary" />
              <span className="hidden sm:inline">StockWise</span>
            </a>
          </div>
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1 gap-2">
              <li>
                <a
                  href="#features"
                  className="rounded-full hover:bg-primary/10"
                >
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a href="#pricing" className="rounded-full hover:bg-primary/10">
                  Tarifs
                </a>
              </li>
              <li>
                <a href="#contact" className="rounded-full hover:bg-primary/10">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div className="navbar-end gap-2">
            <button
              onClick={handleSignIn}
              className="btn btn-ghost rounded-full hidden sm:inline-flex"
            >
              Connexion
            </button>
            <button
              onClick={handleGetStarted}
              className="btn btn-primary rounded-full"
            >
              Essai gratuit
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 pt-32 relative overflow-hidden">
        {/* Floating shapes */}
        <div className="absolute top-[10%] left-[5%] w-80 h-80 bg-indigo-500 rounded-full opacity-10 animate-float"></div>
        <div
          className="absolute top-[60%] left-[15%] w-64 h-64 bg-purple-600 rounded-full opacity-10 animate-float"
          style={{ animationDelay: "5s" }}
        ></div>
        <div
          className="absolute top-[30%] right-[10%] w-72 h-72 bg-indigo-500 rounded-full opacity-10 animate-float"
          style={{ animationDelay: "10s" }}
        ></div>

        <div className="hero-content flex-col lg:flex-row-reverse max-w-7xl w-full px-4 gap-12 relative z-10">
          {/* Content */}
          <div className="flex-1 text-left">
            <div className="badge badge-lg glass mb-4 border border-primary/30">
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              Propulsé par l'Intelligence Artificielle
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-6xl font-bold mb-6 text-gray-800">
              Gérez votre stock avec <span className="text-primary">l'IA</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-600">
              Une solution intelligente pour optimiser votre inventaire, prédire
              les tendances et automatiser vos commandes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleGetStarted}
                className="btn btn-lg btn-primary shadow-xl hover:shadow-2xl"
              >
                <RocketIcon className="w-5 h-5 mr-2" />
                Commencer gratuitement
              </button>
              <button className="btn btn-lg glass hover:bg-white/80 border border-white/40">
                <PlayCircle className="w-5 h-5 mr-2" />
                Voir la démo
              </button>
            </div>
            <div className="mt-12 flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-5 h-5 text-success" />
                <span>Sans carte bancaire</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-5 h-5 text-success" />
                <span>14 jours d'essai</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-5 h-5 text-success" />
                <span>Support 24/7</span>
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="flex-1">
            <div className="w-full max-w-lg mx-auto drop-shadow-2xl">
              <svg
                viewBox="0 0 500 500"
                className="w-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="250"
                  cy="250"
                  r="200"
                  fill="#667eea"
                  opacity="0.1"
                />
                <rect
                  x="100"
                  y="150"
                  width="300"
                  height="200"
                  rx="10"
                  fill="#f8fafc"
                  stroke="#667eea"
                  strokeWidth="3"
                />
                <rect
                  x="100"
                  y="150"
                  width="300"
                  height="30"
                  rx="10"
                  fill="#667eea"
                />
                <circle cx="120" cy="165" r="5" fill="#fff" />
                <circle cx="140" cy="165" r="5" fill="#fff" />
                <circle cx="160" cy="165" r="5" fill="#fff" />
                <rect
                  x="120"
                  y="200"
                  width="80"
                  height="60"
                  rx="5"
                  fill="#e0f2fe"
                  stroke="#667eea"
                  strokeWidth="2"
                />
                <rect
                  x="210"
                  y="200"
                  width="80"
                  height="60"
                  rx="5"
                  fill="#fef3c7"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />
                <rect
                  x="300"
                  y="200"
                  width="80"
                  height="60"
                  rx="5"
                  fill="#dcfce7"
                  stroke="#10b981"
                  strokeWidth="2"
                />
                <rect
                  x="130"
                  y="280"
                  width="15"
                  height="40"
                  rx="3"
                  fill="#667eea"
                />
                <rect
                  x="155"
                  y="290"
                  width="15"
                  height="30"
                  rx="3"
                  fill="#667eea"
                  opacity="0.7"
                />
                <rect
                  x="180"
                  y="275"
                  width="15"
                  height="45"
                  rx="3"
                  fill="#667eea"
                  opacity="0.5"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Des fonctionnalités{" "}
              <span className="text-primary">puissantes</span>
            </h2>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer votre stock efficacement
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card glass shadow-xl hover:shadow-2xl transition-all border border-white/20">
              <div className="card-body">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="w-7 h-7 text-primary" />
                </div>
                <h3 className="card-title text-2xl">Prédictions IA</h3>
                <p className="text-base-content/70">
                  Anticipez vos besoins en stock grâce à des prédictions
                  précises basées sur l'IA et l'historique de vos ventes.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card glass shadow-xl hover:shadow-2xl transition-all border border-white/20">
              <div className="card-body">
                <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                  <Package className="w-7 h-7 text-success" />
                </div>
                <h3 className="card-title text-2xl">Gestion en temps réel</h3>
                <p className="text-base-content/70">
                  Suivez votre inventaire en direct avec des mises à jour
                  instantanées et des alertes intelligentes.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card glass shadow-xl hover:shadow-2xl transition-all border border-white/20">
              <div className="card-body">
                <div className="w-14 h-14 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-warning" />
                </div>
                <h3 className="card-title text-2xl">Analyses avancées</h3>
                <p className="text-base-content/70">
                  Visualisez vos données avec des tableaux de bord interactifs
                  et des rapports détaillés.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="card glass shadow-xl hover:shadow-2xl transition-all border border-white/20">
              <div className="card-body">
                <div className="w-14 h-14 rounded-xl bg-error/10 flex items-center justify-center mb-4">
                  <Bell className="w-7 h-7 text-error" />
                </div>
                <h3 className="card-title text-2xl">Alertes automatiques</h3>
                <p className="text-base-content/70">
                  Recevez des notifications pour les stocks faibles, les
                  ruptures et les opportunités de réapprovisionnement.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="card glass shadow-xl hover:shadow-2xl transition-all border border-white/20">
              <div className="card-body">
                <div className="w-14 h-14 rounded-xl bg-info/10 flex items-center justify-center mb-4">
                  <Zap className="w-7 h-7 text-info" />
                </div>
                <h3 className="card-title text-2xl">Automatisation</h3>
                <p className="text-base-content/70">
                  Automatisez vos commandes et optimisez vos processus de
                  réapprovisionnement.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="card glass shadow-xl hover:shadow-2xl transition-all border border-white/20">
              <div className="card-body">
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="card-title text-2xl">Sécurité maximale</h3>
                <p className="text-base-content/70">
                  Vos données sont cryptées et sauvegardées en toute sécurité
                  avec une disponibilité de 99,9%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-20 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Choisissez votre <span className="text-primary">plan</span>
            </h2>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              Des tarifs transparents adaptés à toutes les tailles d'entreprise
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <div className="card glass shadow-xl hover:shadow-2xl transition-all border border-white/20">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-6 h-6 text-primary" />
                  <h3 className="card-title text-2xl">Basic</h3>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold">3 000</span>
                  <span className="text-2xl text-base-content/70"> FCFA</span>
                  <p className="text-base-content/60 mt-2">par mois</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Jusqu'à 100 produits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Alertes de stock basiques</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Rapports mensuels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Support par email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>1 utilisateur</span>
                  </li>
                </ul>
                <button className="btn btn-outline btn-primary w-full">
                  Commencer
                </button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="card bg-primary text-primary-content shadow-2xl scale-105 border-4 border-primary relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="badge badge-accent badge-lg">Populaire</div>
              </div>
              <div className="card-body">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-6 h-6" />
                  <h3 className="card-title text-2xl">Pro</h3>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold">5 000</span>
                  <span className="text-2xl opacity-80"> FCFA</span>
                  <p className="opacity-70 mt-2">par mois</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Jusqu'à 500 produits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Prédictions IA avancées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Rapports en temps réel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Support prioritaire 24/7</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Jusqu'à 5 utilisateurs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Intégrations API</span>
                  </li>
                </ul>
                <button
                  onClick={handleGetStarted}
                  className="btn btn-outline btn-accent w-full"
                >
                  Essayer Pro
                </button>
              </div>
            </div>

            {/* Business Plan */}
            <div className="card glass shadow-xl hover:shadow-2xl transition-all border border-white/20">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-6 h-6 text-primary" />
                  <h3 className="card-title text-2xl">Business</h3>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold">15 000</span>
                  <span className="text-2xl text-base-content/70"> FCFA</span>
                  <p className="text-base-content/60 mt-2">par mois</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Produits illimités</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>IA personnalisée</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Tableaux de bord avancés</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Gestionnaire de compte dédié</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Utilisateurs illimités</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Intégrations avancées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Formation personnalisée</span>
                  </li>
                </ul>
                <button className="btn btn-outline btn-primary w-full">
                  Contacter les ventes
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-base-content/70">
              <Info className="w-4 h-4 inline mr-1" />
              Tous les plans incluent 14 jours d'essai gratuit. Aucune carte
              bancaire requise.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto glass p-12 rounded-3xl border border-white/20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              Prêt à transformer votre gestion de stock ?
            </h2>
            <p className="text-xl mb-8 text-gray-600">
              Rejoignez des centaines d'entreprises qui font confiance à
              StockWise pour optimiser leur inventaire
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="btn btn-lg btn-primary shadow-xl hover:shadow-2xl"
              >
                <RocketIcon className="w-5 h-5 mr-2" />
                Démarrer gratuitement
              </button>
              <button className="btn btn-lg glass hover:bg-white/80 border border-white/40">
                <PlayCircle className="w-5 h-5 mr-2" />
                Voir une démo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer p-10 bg-base-300 text-base-content">
        <nav>
          <h6 className="footer-title">Produit</h6>
          <a className="link link-hover">Fonctionnalités</a>
          <a className="link link-hover">Tarifs</a>
          <a className="link link-hover">Sécurité</a>
          <a className="link link-hover">Intégrations</a>
        </nav>
        <nav>
          <h6 className="footer-title">Entreprise</h6>
          <a className="link link-hover">À propos</a>
        </nav>
        <nav>
          <h6 className="footer-title">Support</h6>
          <a className="link link-hover">Centre d'aide</a>
          <a className="link link-hover">Contact</a>
          <a className="link link-hover">Documentation</a>
        </nav>
        <nav>
          <h6 className="footer-title">Légal</h6>
          <a className="link link-hover">Conditions d'utilisation</a>
          <a className="link link-hover">Politique de confidentialité</a>
        </nav>
      </footer>
      <footer className="footer px-10 py-4 border-t bg-base-300 text-base-content border-base-300">
        <aside className="items-center grid-flow-col">
          <BrainCircuit className="w-6 h-6 text-primary" />
          <p>StockWise © 2026 - Tous droits réservés</p>
        </aside>
        <nav className="md:place-self-center md:justify-self-end">
          <div className="grid grid-flow-col gap-4">
            <a>
              <Twitter className="w-6 h-6 cursor-pointer hover:text-primary transition-colors" />
            </a>
            <a>
              <Facebook className="w-6 h-6 cursor-pointer hover:text-primary transition-colors" />
            </a>
            <a>
              <Linkedin className="w-6 h-6 cursor-pointer hover:text-primary transition-colors" />
            </a>
          </div>
        </nav>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-30px) translateX(30px);
          }
          66% {
            transform: translateY(30px) translateX(-30px);
          }
        }
        .animate-float {
          animation: float 20s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
