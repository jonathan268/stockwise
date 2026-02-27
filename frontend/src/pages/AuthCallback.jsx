// src/pages/AuthCallback.jsx
// Page de callback OAuth — à ajouter dans ton router React

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error) {
      toast.error("Échec de la connexion avec Google");
      navigate("/login");
      return;
    }

    if (token) {
      // Stocker le token (même endroit que ton auth classique)
      localStorage.setItem("token", token);

      toast.success("Connecté avec Google !");
      navigate("/dashboard");
    } else {
      toast.error("Token manquant");
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-4 text-base-content/60">Connexion en cours...</p>
      </div>
    </div>
  );
};

export default AuthCallback;