import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Loader, ArrowLeft } from 'lucide-react';
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
    <div className="w-full max-w-md relative z-10">
      <div className="bg-white rounded-lg shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mot de passe oublié</h1>
          <p className="text-gray-600">
            {submitted ? 'Vérifiez votre email pour continuer' : 'Entrez votre email pour réinitialiser'}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-5 h-5 animate-spin" />}
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </button>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="mb-4 flex justify-center">
              <div className="bg-green-100 rounded-full p-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Un email a été envoyé à <strong>{email}</strong>. Vérifiez votre inbox et cliquez sur le lien pour réinitialiser votre mot de passe.
            </p>
            <button
              onClick={() => navigate('/auth/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Revenir à la connexion
            </button>
          </div>
        )}

        {/* Back to Login */}
        <Link
          to="/auth/login"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm mt-6 justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
