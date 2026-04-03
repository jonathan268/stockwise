import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Building2,
  Eye,
  EyeOff,
  Loader,
  Phone,
  PackagePlus
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../api/axios";

/**
 * RegisterPage - Inscription utilisateur
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    phone: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Le nom est requis";
    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email invalide";
    if (!formData.password) newErrors.password = "Le mot de passe est requis";
    if (formData.password.length < 8) newErrors.password = "Min 8 caractères";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    if (!formData.organizationName.trim())
      newErrors.organizationName = "Obligatoire";
    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = "Vous devez accepter";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }

    try {
      setLoading(true);
      await apiClient.post("/api/auth/register", {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        organizationName: formData.organizationName,
        phone: formData.phone,
      });

      toast.success("Inscription réussie ! Veuillez vous connecter.");
      navigate("/auth/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl my-8">
      <div className="card bg-base-100 border border-base-300 shadow-2xl overflow-hidden">
        <div className="card-body p-8 sm:p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <PackagePlus className="text-primary w-8 h-8" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-base-content mb-2 tracking-tight">Créez votre compte</h1>
            <p className="text-base-content/60 text-sm">Rejoignez StockWise pour gérer votre inventaire</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium text-base-content/80">Nom complet</span>
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 text-base-content/40 w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Jean Dupont"
                    className={`input input-bordered w-full pl-11 bg-base-100 transition-all ${
                      errors.fullName ? "input-error" : "focus:input-primary"
                    }`}
                    disabled={loading}
                  />
                </div>
                {errors.fullName && <span className="label-text-alt text-error mt-1">{errors.fullName}</span>}
              </div>

              {/* Email */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium text-base-content/80">E-mail</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 text-base-content/40 w-5 h-5 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vous@exemple.com"
                    className={`input input-bordered w-full pl-11 bg-base-100 transition-all ${
                      errors.email ? "input-error" : "focus:input-primary"
                    }`}
                    disabled={loading}
                  />
                </div>
                {errors.email && <span className="label-text-alt text-error mt-1">{errors.email}</span>}
              </div>

              {/* Organization */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium text-base-content/80">Nom de l'organisation</span>
                </label>
                <div className="relative flex items-center">
                  <Building2 className="absolute left-4 text-base-content/40 w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    placeholder="Mon entreprise"
                    className={`input input-bordered w-full pl-11 bg-base-100 transition-all ${
                      errors.organizationName ? "input-error" : "focus:input-primary"
                    }`}
                    disabled={loading}
                  />
                </div>
                {errors.organizationName && <span className="label-text-alt text-error mt-1">{errors.organizationName}</span>}
              </div>

              {/* Phone */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium text-base-content/80">Téléphone (Optionnel)</span>
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-4 text-base-content/40 w-5 h-5 pointer-events-none" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+237612345678"
                    className="input input-bordered w-full pl-11 bg-base-100 focus:input-primary transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

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
                  <span className="label-text font-medium text-base-content/80">Confirmer mot de passe</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 text-base-content/40 w-5 h-5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`input input-bordered w-full pl-11 bg-base-100 transition-all ${
                      errors.confirmPassword ? "input-error" : "focus:input-primary"
                    }`}
                    disabled={loading}
                  />
                </div>
                {errors.confirmPassword && <span className="label-text-alt text-error mt-1">{errors.confirmPassword}</span>}
              </div>
            </div>

            {/* Terms */}
            <div className="form-control mt-4">
              <label className="label cursor-pointer justify-start gap-3 items-start">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className={`checkbox checkbox-sm rounded mt-1 ${errors.agreeToTerms ? "checkbox-error" : "checkbox-primary"}`}
                />
                <span className="label-text text-base-content/70">
                  J'accepte les{" "}
                  <Link to="#" className="text-primary hover:text-primary-focus">
                    conditions d'utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link to="#" className="text-primary hover:text-primary-focus">
                    politique de confidentialité
                  </Link>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-4"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Inscription...
                </>
              ) : (
                "S'inscrire"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider text-base-content/40 text-sm mt-6 mb-4">Ou via</div>

          {/* Google Register */}
          <button
            type="button"
            className="btn btn-outline border-base-300 hover:border-base-content/30 w-full hover:bg-base-200 text-base-content"
          >
            <img
              src="https://www.gstatic.com/firebaseapp/v8.10.1/images/firebaseui-logo.png"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            S'inscrire avec Google
          </button>

          {/* Sign In Link */}
          <p className="text-center text-sm text-base-content/70 mt-8">
            Vous avez déjà un compte ?{" "}
            <Link
              to="/auth/login"
              className="text-primary hover:text-primary-focus font-semibold transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
