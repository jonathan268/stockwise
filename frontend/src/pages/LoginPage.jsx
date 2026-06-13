import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, AlertCircle, PackagePlus, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import axiosInstance from "../lib/axios";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
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
      const { data } = await axiosInstance.post("/auth/login", form);
      setAuth(data.data);
      const user = data.data.user;
      navigate(user.role === "super_admin" ? "/console" : "/dashboard", { replace: true });
    } catch (err) {
      setError({ message: err.response?.data?.error || "Erreur de connexion" });
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
      navigate(data.data.user.role === "super_admin" ? "/console" : "/dashboard", { replace: true });
    } catch (err) {
      setError({ message: err.response?.data?.message || "Erreur de connexion Google" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(var(--color-primary-rgb),0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(var(--color-primary-rgb),0.03),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'1\' fill=\'%23ffffff\'/%3E%3C/svg%3E")' }} />

      {/* ─── LEFT PANEL (Form) ─── */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 p-6 sm:p-12 lg:p-16 xl:px-24 relative z-10">
        <Link to="/" className="absolute top-8 left-6 sm:left-12 lg:left-16 flex items-center gap-2.5 group">
          <div className="bg-primary text-primary-content p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
            <PackagePlus size={22} strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-base-content">StockWise</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm mx-auto mt-20 lg:mt-0"
        >
          <div className="mb-10">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
              <LogIn size={22} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display mb-2 tracking-tight">Content de vous revoir</h1>
            <p className="text-base-content/50 text-base">Connectez-vous pour piloter votre inventaire.</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-error/10 border border-error/20 rounded-2xl px-5 py-4 mb-6"
            >
              <AlertCircle size={18} className="text-error shrink-0" />
              <span className="text-sm font-medium text-error">{error.message}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-base-content/70 ml-1">Adresse email</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  placeholder="nom@entreprise.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                  className="input w-full pl-12 pr-4 py-3.5 bg-base-200/40 border border-base-content/10 focus:border-primary/50 focus:bg-base-100 rounded-2xl transition-all duration-300 font-medium placeholder:text-base-content/25"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-base-content/70">Mot de passe</label>
                <Link to="/auth/forgot" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                  Oublié ?
                </Link>
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 group-focus-within:text-primary transition-colors" />
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  className="input w-full pl-12 pr-12 py-3.5 bg-base-200/40 border border-base-content/10 focus:border-primary/50 focus:bg-base-100 rounded-2xl transition-all duration-300 font-medium placeholder:text-base-content/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content/60 transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full gap-2 rounded-2xl shadow-lg shadow-primary/25 h-12 mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  <span className="font-semibold tracking-wide">Se connecter</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-base-content/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-base-100 px-4 text-xs font-medium text-base-content/30">OU</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError({ message: "Échec de la connexion Google" })}
              useOneTap
              theme="outline"
              size="large"
              shape="rectangular"
              text="continue_with"
            />
          </div>

          <p className="text-center text-sm text-base-content/50 mt-8">
            Nouveau sur StockWise ?{" "}
            <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
              Créer un compte
            </Link>
          </p>
        </motion.div>
      </div>

      {/* ─── RIGHT PANEL (Illustration) ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105" style={{
          backgroundImage: 'url(/11047.jpg)',
          backgroundPosition: '50% 30%',
        }} />
        <div className="absolute inset-0 bg-gradient-to-r from-base-100 via-base-100/80 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_60%,rgba(var(--color-base-100),0.6))]" />

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 max-w-md"
        >
          <div className="bg-base-100/40 backdrop-blur-2xl border border-base-content/10 rounded-3xl p-10 shadow-2xl">
            <div className="flex gap-2 mb-8">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
            </div>

            <h2 className="text-2xl font-bold font-display mb-4 leading-tight text-base-content">
              L'IA qui transforme vos stocks en{" "}
              <span className="text-primary">bénéfices</span>.
            </h2>
            <p className="text-base-content/50 mb-8 text-sm leading-relaxed">
              Passez moins de temps sur Excel et plus de temps à faire croître votre PME. StockWise anticipe vos besoins avant même qu'ils ne surviennent.
            </p>

            <div className="space-y-4">
              {[
                "Prédictions IA par Google Gemini",
                "Alertes avant rupture de stock",
                "Rapports de rentabilité automatiques",
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                    <Sparkles size={13} />
                  </div>
                  <span className="text-sm font-medium text-base-content/70">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-base-content/30 font-mono tracking-wider">PLATEFORME INTELLIGENTE V4.2</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}