import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, PackagePlus, ArrowLeft, AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";
import axiosInstance from "../lib/axios";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.post("/auth/reset-password", { token, password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: 'url(/126208.jpg)',
        backgroundPosition: '30% 50%',
      }} />
      <div className="absolute inset-0 bg-gradient-to-r from-base-100 via-base-100/90 to-base-100/60" />
      <div className="absolute opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'1\' fill=\'%23ffffff\'/%3E%3C/svg%3E")' }} />

      <div className="flex flex-col justify-center w-full max-w-sm mx-auto p-6 relative z-10">
        <Link to="/" className="flex items-center gap-2.5 group mb-16 self-start">
          <div className="bg-primary text-primary-content p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
            <PackagePlus size={22} strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-base-content">StockWise</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-10">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
              <KeyRound size={22} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display mb-2 tracking-tight">
              {done ? "Mot de passe réinitialisé" : "Nouveau mot de passe"}
            </h1>
            <p className="text-base-content/50 text-base">
              {done
                ? "Votre mot de passe a été modifié avec succès."
                : "Choisissez un nouveau mot de passe sécurisé pour votre compte."}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-error/10 border border-error/20 rounded-2xl px-5 py-4 mb-6"
            >
              <AlertCircle size={18} className="text-error shrink-0" />
              <span className="text-sm font-medium text-error">{error}</span>
            </motion.div>
          )}

          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 bg-success/10 border border-success/20 rounded-2xl px-5 py-4">
                <CheckCircle2 size={18} className="text-success shrink-0" />
                <span className="text-sm font-medium text-success">Mot de passe modifié</span>
              </div>

              <Link
                to="/login"
                className="btn btn-primary w-full gap-2 rounded-2xl shadow-lg shadow-primary/25 h-12"
              >
                <ArrowLeft size={16} /> Se connecter
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-base-content/70 ml-1">Nouveau mot de passe</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="Minimum 8 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
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

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-base-content/70 ml-1">Confirmer le mot de passe</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    placeholder="Retapez votre mot de passe"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={8}
                    className="input w-full pl-12 pr-4 py-3.5 bg-base-200/40 border border-base-content/10 focus:border-primary/50 focus:bg-base-100 rounded-2xl transition-all duration-300 font-medium placeholder:text-base-content/25"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full gap-2 rounded-2xl shadow-lg shadow-primary/25 h-12"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    <span className="font-semibold tracking-wide">Réinitialiser</span>
                    <KeyRound size={16} />
                  </>
                )}
              </button>

              <Link
                to="/login"
                className="btn btn-ghost w-full gap-2 rounded-2xl text-base-content/50 hover:text-base-content"
              >
                <ArrowLeft size={16} /> Retour à la connexion
              </Link>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}