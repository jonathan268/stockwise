import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";
import axiosInstance from "../lib/axios";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function AcceptInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axiosInstance.post(`/auth/accept-invite/${token}`);
      const store = useAuthStore.getState();
      store.updateOrganization(data.data.organization);
      setAccepted(true);
      useToastStore.getState().success(data.message);
      setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
    } catch (err) {
      setError(
        err.response?.data?.error || err.response?.data?.message || "Erreur lors de l'acceptation",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-base-200/50 flex items-center justify-center p-4">
        <div className="card bg-base-100 shadow-xl border border-base-content/10 max-w-md w-full">
          <div className="card-body text-center py-12">
            <div className="w-16 h-16 bg-warning/10 text-warning rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h1 className="text-xl font-bold font-display">Connexion requise</h1>
            <p className="text-base-content/60 text-sm mt-2">
              Vous devez être connecté pour accepter cette invitation.
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <Link to="/login" className="btn btn-primary">
                Se connecter
              </Link>
              <Link to="/register" className="btn btn-ghost">
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-base-200/50 flex items-center justify-center p-4">
        <div className="card bg-base-100 shadow-xl border border-base-content/10 max-w-md w-full">
          <div className="card-body text-center py-12">
            <div className="w-16 h-16 bg-success/10 text-success rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h1 className="text-xl font-bold font-display">Invitation acceptée !</h1>
            <p className="text-base-content/60 text-sm mt-2">Redirection vers le tableau de bord...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200/50 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl border border-base-content/10 max-w-md w-full">
        <div className="card-body text-center py-12">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h1 className="text-xl font-bold font-display">Invitation à rejoindre une organisation</h1>
          <p className="text-base-content/60 text-sm mt-2">
            Vous avez été invité(e) à rejoindre une organisation sur StockWise.
          </p>
          <p className="text-sm text-base-content/50 mt-1 mb-6">
            Connecté en tant que <strong>{user?.email}</strong>
          </p>

          {error && (
            <div className="alert alert-error text-sm py-2 mb-4">
              <AlertCircle size={16} /> <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleAccept}
            disabled={loading}
            className="btn btn-primary gap-2 w-full"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <CheckCircle size={18} />
            )}
            Accepter l'invitation
          </button>
        </div>
      </div>
    </div>
  );
}
