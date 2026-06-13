import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, AlertCircle, Building2, PackagePlus, ArrowRight, CheckCircle, Eye, EyeOff, Sparkles } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import axiosInstance from "../lib/axios";
import { GoogleLogin } from "@react-oauth/google";

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", organizationName: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.post("/auth/register", form);
      setAuth(data.data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.post("/auth/google", { idToken: credentialResponse.credential });
      setAuth(data.data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de connexion Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(var(--color-primary-rgb),0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(var(--color-primary-rgb),0.03),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'1\' fill=\'%23ffffff\'/%3E%3C/svg%3E")' }} />

      {/* ─── LEFT PANEL (Illustration) ─── */}
      <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center p-12 overflow-hidden border-r border-base-content/5">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105" style={{
          backgroundImage: 'url(/126208.jpg)',
          backgroundPosition: '50% 30%',
        }} />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-base-100/60 to-base-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-transparent to-base-100/20" />

        <div className="relative z-10 max-w-sm">
          <Link to="/" className="flex items-center gap-2.5 group mb-16">
            <div className="bg-primary text-primary-content p-2.5 rounded-xl shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <PackagePlus size={24} strokeWidth={2.5} />
            </div>
            <span className="font-display font-black text-2xl tracking-tight text-base-content">StockWise</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-extrabold font-display mb-6 leading-tight text-base-content">
              Prenez de l'avance,<br />
              <span className="text-primary">ne subissez plus.</span>
            </h2>

            <div className="space-y-6 mt-12">
              {[
                { title: "Installation en 2 minutes", desc: "Aucune carte bancaire requise." },
                { title: "Essai complet 30 jours", desc: "Accès total aux prédictions Intelligence Artificielle." },
                { title: "Le contrôle absolu", desc: "Une traçabilité parfaite, du fournisseur au client final." },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="flex gap-4 items-start"
                >
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle size={17} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base-content text-sm">{feature.title}</h4>
                    <p className="text-xs text-base-content/50 leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="mt-16 border-t border-base-content/10 pt-6">
            <p className="text-[10px] text-base-content/25 font-mono tracking-widest uppercase">Propulsé par Google Gemini</p>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL (Form) ─── */}
      <div className="flex flex-col justify-center w-full lg:w-[55%] p-6 sm:p-12 lg:p-16 xl:px-24 relative z-10">
        <Link to="/" className="lg:hidden absolute top-8 left-6 flex items-center gap-2 group">
          <div className="bg-primary text-primary-content p-2 rounded-xl shadow-lg shadow-primary/20">
            <PackagePlus size={20} strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-lg text-base-content">StockWise</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px] mx-auto mt-20 lg:mt-0"
        >
          <div className="mb-8">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
              <PackagePlus size={22} />
            </div>
            <h1 className="text-3xl font-extrabold font-display mb-2">Créer un compte</h1>
            <p className="text-base-content/50">Rejoignez des centaines de PME performantes.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="flex items-center gap-3 bg-error/10 border border-error/20 rounded-2xl px-5 py-4">
                  <AlertCircle size={18} className="text-error shrink-0" />
                  <span className="text-sm font-medium text-error">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative group">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/25 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Prénom"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                  className="input w-full pl-10 pr-4 py-3 bg-base-200/40 border border-base-content/10 focus:border-primary/50 focus:bg-base-100 rounded-xl transition-all duration-300 font-medium text-sm placeholder:text-base-content/25"
                />
              </div>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Nom"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                  className="input w-full pl-4 pr-4 py-3 bg-base-200/40 border border-base-content/10 focus:border-primary/50 focus:bg-base-100 rounded-xl transition-all duration-300 font-medium text-sm placeholder:text-base-content/25"
                />
              </div>
            </div>

            <div className="relative group">
              <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/25 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Nom de l'entreprise"
                value={form.organizationName}
                onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                required
                className="input w-full pl-10 pr-4 py-3 bg-base-200/40 border border-base-content/10 focus:border-primary/50 focus:bg-base-100 rounded-xl transition-all duration-300 font-medium text-sm placeholder:text-base-content/25"
              />
            </div>

            <div className="relative group">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/25 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                placeholder="Adresse email pro"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="input w-full pl-10 pr-4 py-3 bg-base-200/40 border border-base-content/10 focus:border-primary/50 focus:bg-base-100 rounded-xl transition-all duration-300 font-medium text-sm placeholder:text-base-content/25"
              />
            </div>

            <div className="relative group">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/25 group-focus-within:text-primary transition-colors" />
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Mot de passe sécurisé"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                className="input w-full pl-10 pr-12 py-3 bg-base-200/40 border border-base-content/10 focus:border-primary/50 focus:bg-base-100 rounded-xl transition-all duration-300 font-medium text-sm placeholder:text-base-content/25"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/25 hover:text-base-content/50 transition-colors"
                tabIndex={-1}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full gap-2 rounded-xl h-12 mt-2 shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  <span className="font-semibold tracking-wide">Démarrer l'essai gratuit</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-base-content/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-base-100 px-4 text-xs font-medium text-base-content/25">OU</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Échec de la connexion Google")}
              useOneTap
              theme="outline"
              size="large"
              shape="rectangular"
              text="signup_with"
            />
          </div>

          <p className="text-center text-sm text-base-content/50 mt-8">
            Vous avez déjà un compte ?{" "}
            <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}