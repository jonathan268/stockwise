import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  UserPlus,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import api from "../api/axios";

const Register = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  // Validation Frontend (basée sur ton modèle backend)
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "Le prénom doit contenir au moins 2 caractères";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Le nom doit contenir au moins 2 caractères";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 8) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (
      formData.phone &&
      !/^(\+237)?6[0-9]{8}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "Numéro invalide (ex: +237 6XXXXXXXX)";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Nettoyer erreur du champ en live
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return; // évite double submit

    setServerError("");
    setSuccessMessage("");

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/v1/auth/register", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        password: formData.password,
      });

      const { accessToken, refreshToken } = response.data.data.tokens;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      setSuccessMessage("Inscription réussie ! Redirection en cours...");

      setTimeout(() => {
        navigate("/app/dashboard");
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Une erreur est survenue";

      setServerError(msg);

      // Si ton backend renvoie un objet errors (optionnel)
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <UserPlus size={30} className="text-primary-content" />
          </div>

          <h1 className="text-3xl font-bold">Créer un compte</h1>
          <p className="text-base-content/70 mt-2">
            Inscris-toi pour gérer ton stock facilement.
          </p>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body space-y-4">
            {/* Success Message */}
            {successMessage && (
              <div className="alert alert-success">
                <CheckCircle size={20} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Server Error */}
            {serverError && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Firstname */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">
                    Prénom <span className="text-error">*</span>
                  </span>
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center text-base-content/40">
                    <User size={18} />
                  </div>

                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Jonathan"
                    className={`input input-bordered w-full pl-10 ${
                      errors.firstName ? "input-error" : ""
                    }`}
                  />
                </div>

                {errors.firstName && (
                  <p className="text-error text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              {/* Lastname */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">
                    Nom <span className="text-error">*</span>
                  </span>
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center text-base-content/40">
                    <User size={18} />
                  </div>

                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Dev"
                    className={`input input-bordered w-full pl-10 ${
                      errors.lastName ? "input-error" : ""
                    }`}
                  />
                </div>

                {errors.lastName && (
                  <p className="text-error text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">
                    Email <span className="text-error">*</span>
                  </span>
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center text-base-content/40">
                    <Mail size={18} />
                  </div>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vous@example.com"
                    className={`input input-bordered w-full pl-10 ${
                      errors.email ? "input-error" : ""
                    }`}
                  />
                </div>

                {errors.email && (
                  <p className="text-error text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Téléphone</span>
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center text-base-content/40">
                    <Phone size={18} />
                  </div>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+237 6XXXXXXXX"
                    className={`input input-bordered w-full pl-10 ${
                      errors.phone ? "input-error" : ""
                    }`}
                  />
                </div>

                {errors.phone && (
                  <p className="text-error text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">
                    Mot de passe <span className="text-error">*</span>
                  </span>
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center text-base-content/40">
                    <Lock size={18} />
                  </div>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`input input-bordered w-full pl-10 pr-10 ${
                      errors.password ? "input-error" : ""
                    }`}
                  />

                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-base-content/50 hover:text-base-content"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-error text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Terms */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    required
                  />
                  <span className="label-text text-sm">
                    J'accepte les{" "}
                    <a href="#" className="link link-primary">
                      conditions d'utilisation
                    </a>
                  </span>
                </label>
              </div>

              {/* Button */}
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Création...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Créer mon compte
                  </>
                )}
              </button>

              <div className="divider">ou</div>

              <p className="text-center text-sm text-base-content/70">
                Tu as déjà un compte ?{" "}
                <Link to="/login" className="link link-primary font-semibold">
                  Se connecter
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
