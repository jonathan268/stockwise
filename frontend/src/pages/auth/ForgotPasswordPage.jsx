import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Loader, ArrowLeft, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';

/**
 * ForgotPasswordPage - Demande de réinitialisation de mot de passe
 */
const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Veuillez entrer votre email');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/api/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Email de réinitialisation envoyé !');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi');
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
                <KeyRound className="text-primary w-8 h-8" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-base-content mb-2 tracking-tight">Mot de passe oublié</h1>
            <p className="text-base-content/60 text-sm">
              {submitted ? 'Vérifiez votre boîte e-mail pour continuer' : 'Entrez votre adresse e-mail pour réinitialiser le mot de passe'}
            </p>
          </div>

          {!submitted ? (
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="input input-bordered w-full pl-11 bg-base-100 focus:input-primary transition-all"
                    disabled={loading}
                  />
                </div>
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
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer le lien"
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="mb-6 flex justify-center">
                <div className="bg-success/20 rounded-full p-5">
                  <Mail className="w-10 h-10 text-success" />
                </div>
              </div>
              <p className="text-base-content/70 mb-8 text-sm leading-relaxed">
                Un e-mail de réinitialisation a été envoyé à <strong>{email}</strong>. Cliquez sur le lien à l'intérieur pour réinitialiser votre mot de passe.
              </p>
              <button
                onClick={() => navigate('/auth/login')}
                className="btn btn-primary w-full"
              >
                Revenir à la connexion
              </button>
            </div>
          )}

          {/* Back to Login */}
          {!submitted && (
            <Link
              to="/auth/login"
              className="flex items-center gap-2 text-base-content/60 hover:text-base-content text-sm mt-8 justify-center transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
