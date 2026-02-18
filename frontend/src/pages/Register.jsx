import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
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

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Validation côté frontend
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
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password =
        "Le mot de passe doit contenir au moins une majuscule";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password =
        "Le mot de passe doit contenir au moins une minuscule";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Le mot de passe doit contenir au moins un chiffre";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "La confirmation du mot de passe est requise";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    if (
      formData.phone &&
      !/^(\+237)?6[0-9]{8}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone =
        "Numéro de téléphone invalide (format: +237 6XX XX XX XX)";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Effacer l'erreur du champ quand on le modifie
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    // Valider le formulaire
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post("/api/v1/auth/register", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
      });

      const { accessToken, refreshToken } = response.data.data.tokens;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      setSuccessMessage("Inscription réussie! Redirection en cours...");

      // Attendre 2 secondes avant de rediriger
      setTimeout(() => {
        navigate("/app/dashboard");
      }, 2000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Une erreur est survenue lors de l'inscription";

      // Si l'erreur vient de la validation, extraire les champs
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ form: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const FormField = ({
    label,
    name,
    type = "text",
    placeholder,
    icon: Icon,
    required = true,
  }) => (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-medium">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon size={20} className="text-base-content/40" />
        </div>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`input input-bordered w-full pl-10 ${
            errors[name] ? "input-error" : ""
          }`}
          disabled={loading}
        />
      </div>
      {errors[name] && (
        <label className="label">
          <span className="label-text-alt text-error flex items-center gap-1">
            <AlertCircle size={16} />
            {errors[name]}
          </span>
        </label>
      )}
    </div>
  );

  const PasswordField = ({
    label,
    name,
    placeholder,
    showPassword,
    onToggle,
  }) => (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-medium">
          {label}
          <span className="text-error ml-1">*</span>
        </span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock size={20} className="text-base-content/40" />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`input input-bordered w-full pl-10 pr-10 ${
            errors[name] ? "input-error" : ""
          }`}
          disabled={loading}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/40 hover:text-base-content transition-colors"
          disabled={loading}
          tabIndex="-1"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {errors[name] && (
        <label className="label">
          <span className="label-text-alt text-error flex items-center gap-1">
            <AlertCircle size={16} />
            {errors[name]}
          </span>
        </label>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <UserPlus size={32} className="text-primary-content" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-base-content mb-2">
            Créer un compte
          </h1>
          <p className="text-base-content/70 text-sm md:text-base">
            Rejoignez nos utilisateurs pour gérer votre stock
          </p>
        </div>

        {/* Formulaire */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4 md:p-6 lg:p-8">
            {/* Message de succès */}
            {successMessage && (
              <div className="alert alert-success shadow-lg mb-4">
                <CheckCircle size={20} className="flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Erreur générale */}
            {errors.form && (
              <div className="alert alert-error shadow-lg mb-4">
                <AlertCircle size={20} className="flex-shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Prénom et Nom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Prénom"
                  name="firstName"
                  placeholder="Jean"
                  icon={User}
                />
                <FormField
                  label="Nom"
                  name="lastName"
                  placeholder="Dupont"
                  icon={User}
                />
              </div>

              {/* Email */}
              <FormField
                label="Email"
                name="email"
                type="email"
                placeholder="vous@example.com"
                icon={Mail}
              />

              {/* Téléphone */}
              <FormField
                label="Téléphone"
                name="phone"
                type="tel"
                placeholder="+237 6 XX XX XX XX"
                icon={Phone}
                required={false}
              />

              {/* Mots de passe */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PasswordField
                  label="Mot de passe"
                  name="password"
                  placeholder="••••••••"
                  showPassword={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                />
                <PasswordField
                  label="Confirmer le mot de passe"
                  name="confirmPassword"
                  placeholder="••••••••"
                  showPassword={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </div>

              {/* Conditions */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3 p-0">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    required
                    disabled={loading}
                  />
                  <span className="label-text text-xs md:text-sm">
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
                className="btn btn-primary w-full mt-6"
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

              {/* Divider */}
              <div className="divider my-2">ou</div>

              {/* Lien connexion */}
              <div className="text-center">
                <p className="text-base-content/70 text-sm">
                  Vous avez déjà un compte ?{" "}
                  <Link to="/login" className="link link-primary font-semibold">
                    Se connecter
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
