import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building,
  Phone,
  UserPlus,
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/auth/register",
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        },
      );

      const token = response.data.token;
      localStorage.setItem("token", token);
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10 p-4">
      <div className="w-full max-w-2xl">
        {/* Logo et Titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <UserPlus size={32} className="text-primary-content" />
          </div>
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Créer un compte
          </h1>
          <p className="text-base-content/70">
            Commencez à gérer votre stock intelligemment
          </p>
        </div>

        {/* Formulaire */}
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="alert alert-error">
                  <div>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Prénom & Nom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text font-semibold">Prénom</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={20} className="text-base-content/40" />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Votre prénom"
                      required
                      className="input input-bordered w-full pl-10"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text font-semibold">Nom</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={20} className="text-base-content/40" />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Votre nom"
                      required
                      className="input input-bordered w-full pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label mb-2">
                  <span className="label-text font-semibold">Email</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={20} className="text-base-content/40" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    required
                    className="input input-bordered w-full pl-10"
                  />
                </div>
              </div>

              {/* Téléphone & Entreprise */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text font-semibold">Téléphone</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={20} className="text-base-content/40" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+237 6 XX XX XX XX"
                      className="input input-bordered w-full pl-10"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text font-semibold">Entreprise</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building size={20} className="text-base-content/40" />
                    </div>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Mon Entreprise"
                      className="input input-bordered w-full pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Mot de passe */}
              <div className="form-control">
                <label className="label mb-2">
                  <span className="label-text font-semibold">Mot de passe</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-base-content/40" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="input input-bordered w-full pl-10 pr-10"
                  />
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

              {/* Confirmation mot de passe */}
              <div className="form-control">
                <label className="label mb-2">
                  <span className="label-text font-semibold">
                    Confirmer le mot de passe
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-base-content/40" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="input input-bordered w-full pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
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

              {/* Conditions d'utilisation */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text">
                    J'accepte les{" "}
                    <a href="#" className="link link-primary">
                      conditions d'utilisation
                    </a>{" "}
                    et la{" "}
                    <a href="#" className="link link-primary">
                      politique de confidentialité
                    </a>
                  </span>
                </label>
              </div>

              {/* Bouton d'inscription */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full gap-2 disabled:btn-disabled"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Créer mon compte
                  </>
                )}
              </button>
            </form>

            {/* Lien vers connexion */}
            <div className="text-center mt-6">
              <p className="text-sm text-base-content/70">
                Vous avez déjà un compte ?{" "}
                <a href="/login" className="link link-primary font-semibold">
                  Se connecter
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

export default Register;
