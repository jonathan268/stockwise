import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, AlertCircle, PackagePlus, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import axiosInstance from "../lib/axios";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
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
      if (user.role === "super_admin") {
        navigate("/console", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const code = err.response?.data?.code;
      const message = err.response?.data?.error || "Erreur de connexion";
      setError({ message, code });
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
      const user = data.data.user;
      if (user.role === "super_admin") {
        navigate("/console", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError({ message: err.response?.data?.message || err.response?.data?.error || "Erreur de connexion Google" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-base-100 font-body">
      {/* ─── LEFT PANEL (Form) ─── */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 p-8 sm:p-12 lg:p-24 xl:px-32 relative">
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 group">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
            <PackagePlus className="text-primary" size={24} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-base-content">
            StockWise
          </span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm mx-auto"
        >
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display mb-3 tracking-tight">
              Content de vous revoir
            </h1>
            <p className="text-base-content/60 text-base">
              Connectez-vous pour piloter votre inventaire en temps réel.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="alert alert-error bg-error/10 text-error border border-error/20 mb-6 rounded-2xl shadow-sm"
            >
              <AlertCircle size={18} />
              <span className="text-sm font-medium">{error.message}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-base-content/80 ml-1">Adresse email</label>
              <label className="input input-lg input-bordered flex items-center gap-3 bg-base-200/50 focus-within:bg-base-100 transition-colors rounded-2xl border-base-300">
                <Mail size={18} className="text-base-content/40" />
                <input
                  type="email"
                  placeholder="nom@entreprise.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                  className="grow font-medium"
                />
              </label>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-base-content/80">Mot de passe</label>
                <Link to="/auth/forgot" className="text-xs font-semibold text-primary hover:text-primary-focus transition-colors">
                  Oublié ?
                </Link>
              </div>
              <label className="input input-lg input-bordered flex items-center gap-3 bg-base-200/50 focus-within:bg-base-100 transition-colors rounded-2xl border-base-300">
                <Lock size={18} className="text-base-content/40" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  className="grow font-medium"
                />
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full gap-2 rounded-2xl shadow-lg shadow-primary/30 mt-4 group relative overflow-hidden"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner text-primary-content" />
              ) : (
                <>
                  <span className="relative z-10 font-semibold tracking-wide">Accéder à l'espace</span>
                  <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="divider text-base-content/40 text-sm my-6">OU</div>
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError({ message: "Échec de la connexion avec Google" })}
              useOneTap
              theme="outline"
              size="large"
              shape="rectangular"
              text="continue_with"
            />
          </div>

          <p className="text-center text-sm text-base-content/60 mt-8">
            Nouveau sur StockWise ?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline underline-offset-4">
              Créer un compte gratuit
            </Link>
          </p>
        </motion.div>
      </div>

      {/* ─── RIGHT PANEL (Illustration) ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center p-12 overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary-focus to-accent rounded-full blur-[80px] opacity-40 translate-x-1/3 -translate-y-1/3 mix-blend-multiply" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-secondary to-primary rounded-full blur-[60px] opacity-30 -translate-x-1/4 translate-y-1/4 mix-blend-multiply" />

        {/* Content Glass Card */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 max-w-lg w-full bg-base-100/10 backdrop-blur-xl border border-white/10 p-10 rounded-3xl text-primary-content shadow-2xl"
        >
          <div className="flex gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-error/80" />
            <div className="w-3 h-3 rounded-full bg-warning/80" />
            <div className="w-3 h-3 rounded-full bg-success/80" />
          </div>
          
          <h2 className="text-3xl font-bold font-display mb-4 leading-tight">
            L'IA qui transforme vos stocks en <span className="text-secondary/90">bénéfices</span>.
          </h2>
          <p className="text-primary-content/80 mb-8 text-lg leading-relaxed">
            Passez moins de temps sur Excel et plus de temps à faire croître votre PME. StockWise anticipe vos besoins avant même qu'ils ne surviennent.
          </p>

          <ul className="space-y-4">
            {[
              "Synchronisation instantanée multi-sites",
              "Alertes IA avant rupture de stock",
              "Rapports de rentabilité automatiques"
            ].map((item, idx) => (
              <motion.li 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (idx * 0.1) }}
                className="flex items-center gap-3 text-primary-content/90 font-medium"
              >
                <CheckCircle2 className="text-success shrink-0" size={20} />
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
