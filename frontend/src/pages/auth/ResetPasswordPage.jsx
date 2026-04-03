import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader, CheckCircle, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../api/axios";

/**
 * ResetPasswordPage - Réinitialisation de mot de passe avec token
 */
const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  // Valide le token au chargement
  useEffect(() => {
    const validateToken = async () => {
      try {
        await apiClient.post("/api/auth/validate-reset-token", { token });
        setTokenValid(true);
      } catch (error) {
        toast.error("Lien de réinitialisation invalide ou expiré");
        setTimeout(() => navigate("/auth/forgot-password"), 2000);
      } finally {
        setValidating(false);
      }
    };

    if (token) {
      validateToken();
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) newErrors.password = "Requis";
    if (formData.password.length < 8) newErrors.password = "Min 8 caractères";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs");
      return;
    }

    try {
      setLoading(true);
      await apiClient.post("/api/auth/reset-password", {
        token,
        password: formData.password,
      });

      setSuccess(true);
      toast.success("Mot de passe réinitialisé de manière sécurisée !");
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la réinitialisation",
      );
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="w-full max-w-md my-auto">
        <div className="card bg-base-100 border border-base-300 shadow-2xl p-8 text-center">
          <Loader className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-base-content/70 font-medium">Vérification de la sécurité du lien...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return null;
  }

  return (
    <div className="w-full max-w-md">
      <div className="card bg-base-100 border border-base-300 shadow-2xl overflow-hidden">
        <div className="card-body p-8 sm:p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="text-primary w-8 h-8" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-base-content mb-2 tracking-tight">Nouveau mot de passe</h1>
            <p className="text-base-content/60 text-sm">Créez un nouveau mot de passe fort et sécurisé</p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Password */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium text-base-content/80">Mot de passe</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 text-base-content/40 w-5 h-5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`input input-bordered w-full pl-11 pr-11 bg-base-100 transition-all ${
                      errors.password ? "input-error" : "focus:input-primary"
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1 text-base-content/40 hover:text-base-content/70 transition-colors bg-transparent border-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <span className="label-text-alt text-error mt-1">{errors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium text-base-content/80">Confirmer le mot de passe</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 text-base-content/40 w-5 h-5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`input input-bordered w-full pl-11 pr-11 bg-base-100 transition-all ${
                      errors.confirmPassword ? "input-error" : "focus:input-primary"
                    }`}
                    disabled={loading}
                  />
                </div>
                {errors.confirmPassword && <span className="label-text-alt text-error mt-1">{errors.confirmPassword}</span>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full mt-6"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Réinitialisation...
                  </>
                ) : (
                  "Réinitialiser le mot de passe"
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="mb-6 flex justify-center">
                <div className="bg-success/20 rounded-full p-5">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
              </div>
              <p className="text-base-content/70 mb-2 font-medium">
                Mot de passe mis à jour !
              </p>
              <p className="text-base-content/60 text-sm mb-6">Redirection vers la connexion en cours...</p>
              <div className="progress progress-primary w-full h-1"></div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
