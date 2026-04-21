import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, LogIn, AlertCircle, Building2, PackagePlus, ArrowRight, CheckCircle } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import axiosInstance from "../lib/axios";
import { GoogleLogin } from "@react-oauth/google";

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    organizationName: "",
  });
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
      setError(err.response?.data?.message || err.response?.data?.error || "Erreur de connexion Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-base-100 font-body">
      
      {/* ─── LEFT PANEL (Illustration) ─── */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-base-300 overflow-hidden items-center justify-center border-r border-base-200">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-base-300 to-secondary/10" />
        <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 px-12 xl:px-20">
          <Link to="/" className="flex items-center gap-2 group mb-12">
            <div className="bg-primary p-2 rounded-xl text-primary-content shadow-lg shadow-primary/30">
              <PackagePlus size={28} />
            </div>
            <span className="font-display font-black text-3xl tracking-tight text-base-content">
              StockWise
            </span>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-4xl font-extrabold font-display mb-6 leading-tight text-base-content">
              Prenez de l'avance,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">ne subissez plus.</span>
            </h2>
            
            <div className="space-y-6 mt-12">
              {[
                { title: "Installation en 2 minutes", desc: "Aucune carte bancaire requise." },
                { title: "Essai complet 30 jours", desc: "Accès total aux prédictions Intelligence Artificielle." },
                { title: "Le contrôle absolu", desc: "Une traçabilité parfaite, du fournisseur au client final." }
              ].map((feature, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (idx * 0.1) }}
                  className="flex gap-4 items-start"
                >
                  <div className="bg-base-100 p-2 rounded-full shadow-sm shrink-0">
                    <CheckCircle className="text-success" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base-content">{feature.title}</h4>
                    <p className="text-sm text-base-content/60 leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── RIGHT PANEL (Form) ─── */}
      <div className="flex flex-col justify-center w-full lg:w-[55%] p-6 sm:p-12 lg:p-20 relative">
        <Link to="/" className="lg:hidden absolute top-8 left-6 flex items-center gap-2 group">
          <div className="bg-primary/10 p-2 rounded-xl">
            <PackagePlus className="text-primary" size={20} />
          </div>
          <span className="font-display font-bold text-lg text-base-content">
            StockWise
          </span>
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px] mx-auto mt-12 lg:mt-0"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold font-display mb-2">Créer un compte</h1>
            <p className="text-base-content/60">
              Rejoignez des centaines de PME performantes.
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="alert alert-error bg-error/10 text-error border border-error/20 rounded-2xl shadow-sm">
                  <AlertCircle size={18} />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="input input-bordered flex items-center gap-3 bg-base-200/40 focus-within:bg-base-100 rounded-xl border-base-300">
                <User size={18} className="text-base-content/40" />
                <input
                  type="text"
                  placeholder="Prénom"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                  className="grow font-medium w-full"
                />
              </label>
              <label className="input input-bordered flex items-center gap-3 bg-base-200/40 focus-within:bg-base-100 rounded-xl border-base-300">
                <input
                  type="text"
                  placeholder="Nom"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                  className="grow font-medium w-full"
                />
              </label>
            </div>

            <label className="input input-bordered flex items-center gap-3 bg-base-200/40 focus-within:bg-base-100 rounded-xl border-base-300">
              <Building2 size={18} className="text-base-content/40 shrink-0" />
              <input
                type="text"
                placeholder="Nom de l'entreprise"
                value={form.organizationName}
                onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                required
                className="grow font-medium"
              />
            </label>

            <label className="input input-bordered flex items-center gap-3 bg-base-200/40 focus-within:bg-base-100 rounded-xl border-base-300">
              <Mail size={18} className="text-base-content/40 shrink-0" />
              <input
                type="email"
                placeholder="Adresse email pro"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="grow font-medium"
              />
            </label>

            <label className="input input-bordered flex items-center gap-3 bg-base-200/40 focus-within:bg-base-100 rounded-xl border-base-300">
              <Lock size={18} className="text-base-content/40 shrink-0" />
              <input
                type="password"
                placeholder="Mot de passe sécurisé"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                className="grow font-medium"
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary w-full gap-2 rounded-xl mt-6 group relative overflow-hidden"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner text-primary-content" />
              ) : (
                <>
                  <span className="relative z-10 font-semibold tracking-wide">Démarrer l'essai gratuit</span>
                  <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="divider text-base-content/40 text-sm my-6">OU</div>
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Échec de la configuration avec Google")}
              useOneTap
              theme="outline"
              size="large"
              shape="rectangular"
              text="signup_with"
            />
          </div>

          <p className="text-center text-sm text-base-content/60 mt-8">
            Vous avez déjà un compte ?{" "}
            <Link to="/login" className="font-semibold text-primary hover:text-primary-focus underline-offset-4 hover:underline transition-all">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
