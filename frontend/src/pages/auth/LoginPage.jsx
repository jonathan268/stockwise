import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader, PackagePlus } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../api/axios";

/**
 * LoginPage - Authentification utilisateur
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = response.data.data;

      // Sauvegarde le token
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (formData.rememberMe) {
        localStorage.setItem("rememberEmail", formData.email);
      }

      toast.success("Connexion réussie !");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="card bg-base-100 border border-base-300 shadow-2xl overflow-hidden">
        <div className="card-body p-8 sm:p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <PackagePlus className="text-primary w-8 h-8" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-base-content mb-2 tracking-tight">Bon retour parmi nous</h1>
            <p className="text-base-content/60 text-sm">Connectez-vous pour accéder à votre espace StockWise</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium text-base-content/80">Adresse e-mail</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 text-base-content/40 w-5 h-5 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="vous@exemple.com"
                  className="input input-bordered w-full pl-11 bg-base-100 focus:input-primary transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium text-base-content/80">Mot de passe</span>
                <Link
                  to="/auth/forgot-password"
                  className="label-text-alt text-primary hover:text-primary-focus font-medium transition-colors"
                >
                  Oublié ?
                </Link>
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-base-content/40 w-5 h-5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input input-bordered w-full pl-11 pr-11 bg-base-100 focus:input-primary transition-all"
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
            </div>

            {/* Remember Me */}
            <div className="form-control mt-2">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="checkbox checkbox-sm checkbox-primary rounded"
                />
                <span className="label-text text-base-content/70">Se souvenir de moi</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider text-base-content/40 text-sm mt-6 mb-4">Ou continuer avec</div>

          {/* Google Login (Visuellement adapté) */}
          <button
            type="button"
            className="btn btn-outline border-base-300 hover:border-base-content/30 w-full hover:bg-base-200 text-base-content"
          >
            <img
              src="https://www.gstatic.com/firebaseapp/v8.10.1/images/firebaseui-logo.png"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Google
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-base-content/70 mt-8">
            Pas encore de compte ?{" "}
            <Link
              to="/auth/register"
              className="text-primary hover:text-primary-focus font-semibold transition-colors"
            >
              S'inscrire gratuitement
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
