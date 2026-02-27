import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import  GoogleLoginButton  from "../components/GoogleLoginButton";
import { Mail, Lock, Eye, EyeOff, LogIn, PackageCheck } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/api/v1/auth/login", {
        email,
        password,
      });
      const { accessToken, refreshToken } = response.data.data.tokens;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      navigate("/app/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200  p-4">
      <div className="w-full max-w-md">
        {/* Logo et Titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <LogIn size={32} className="text-primary-content" />
          </div>
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Bienvenue sur StockWise
          </h1>
          <p className="text-base-content/70">
            Connectez-vous pour gérer votre stock
          </p>
        </div>

        {/* Formulaire */}
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Email</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={20} className="text-base-content/40" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="votre@email.com"
                    className="input input-bordered w-full pl-10"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Mot de passe</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-base-content/40" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="input input-bordered w-full pl-10 pr-10"
                  />
                  {error && <p className="text-red"> {error} </p>}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff
                        size={20}
                        className="text-base-content/40 hover:text-base-content"
                      />
                    ) : (
                      <Eye
                        size={20}
                        className="text-base-content/40 hover:text-base-content"
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* Se souvenir & Mot de passe oublié */}
              <div className="flex items-center justify-between">
                <label className="label cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                  />
                  <span className="label-text">Se souvenir de moi</span>
                </label>
                <a href="#" className="label-text link link-primary link-hover">
                  Mot de passe oublié ?
                </a>
              </div>

              {/* Bouton de connexion */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full gap-2"
              >
                <LogIn size={20} />
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>

            {/* Divider */}
            <div className="divider">OU</div>

            {/* Boutons OAuth */}

            <GoogleLoginButton />

            {/* Lien vers inscription */}
            <div className="text-center mt-6">
              <p className="text-sm text-base-content/70">
                Vous n'avez pas de compte ?{" "}
                <a href="/register" className="link link-primary font-semibold">
                  Créer un compte
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-base-content/60">
          <p>© {new Date().getFullYear()} StockWise. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
