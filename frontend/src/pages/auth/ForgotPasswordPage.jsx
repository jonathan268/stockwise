import React, { useState, useEffect } from 'react';import React, { useState } from 'react';





























































































































































































export default ResetPasswordPage;};  );    </div>      </div>        )}          </div>            </p>              Votre mot de passe a été réinitialisé avec succès ! Redirection vers la connexion...            <p className="text-gray-600">            </div>              </div>                <CheckCircle className="w-8 h-8 text-green-600" />              <div className="bg-green-100 rounded-full p-4">            <div className="mb-4 flex justify-center">          <div className="text-center py-8">        ) : (          </form>            </button>              {loading ? 'Réinitialisation...' : 'Réinitialiser'}              {loading && <Loader className="w-5 h-5 animate-spin" />}            >              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"              disabled={loading}              type="submit"            <button            {/* Submit */}            </div>              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}              </div>                />                  disabled={loading}                  }`}                    errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${                  placeholder="••••••••"                  onChange={handleChange}                  value={formData.confirmPassword}                  name="confirmPassword"                  type={showPassword ? 'text' : 'password'}                <input                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />              <div className="relative">              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer</label>            <div>            {/* Confirm Password */}            </div>              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}              </div>                </button>                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}                >                  className="absolute right-3 top-3 text-gray-400"                  onClick={() => setShowPassword(!showPassword)}                  type="button"                <button                />                  disabled={loading}                  }`}                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 ${                  placeholder="••••••••"                  onChange={handleChange}                  value={formData.password}                  name="password"                  type={showPassword ? 'text' : 'password'}                <input                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />              <div className="relative">              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>            <div>            {/* Password */}          <form onSubmit={handleSubmit} className="space-y-5">        {!success ? (        </div>          <p className="text-gray-600">Créez un nouveau mot de passe sécurisé</p>          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nouveau mot de passe</h1>        <div className="text-center mb-8">        {/* Header */}      <div className="bg-white rounded-lg shadow-2xl p-8">    <div className="w-full max-w-md relative z-10">  return (  }    return null;  if (!tokenValid) {  }    );      </div>        </div>          <p className="text-gray-600">Vérification du lien...</p>          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />        <div className="bg-white rounded-lg shadow-2xl p-8 text-center">      <div className="w-full max-w-md relative z-10">    return (  if (validating) {  };    }      setLoading(false);    } finally {      toast.error(error.response?.data?.message || 'Erreur lors de la réinitialisation');    } catch (error) {      setTimeout(() => navigate('/auth/login'), 2000);      toast.success('Mot de passe réinitialisé avec succès !');      setSuccess(true);      });        password: formData.password,        token,      await apiClient.post('/api/auth/reset-password', {      setLoading(true);    try {    }      return;      toast.error('Veuillez corriger les erreurs');    if (!validateForm()) {    e.preventDefault();  const handleSubmit = async (e) => {  };    return Object.keys(newErrors).length === 0;    setErrors(newErrors);    }      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';    if (formData.password !== formData.confirmPassword) {    if (formData.password.length < 8) newErrors.password = 'Min 8 caractères';    if (!formData.password) newErrors.password = 'Le mot de passe est requis';    const newErrors = {};  const validateForm = () => {  };    }      setErrors(prev => ({ ...prev, [name]: '' }));    if (errors[name]) {    setFormData(prev => ({ ...prev, [name]: value }));    const { name, value } = e.target;  const handleChange = (e) => {  }, [token, navigate]);    }      validateToken();    if (token) {    };      }        setValidating(false);      } finally {        setTimeout(() => navigate('/auth/forgot-password'), 2000);        toast.error('Lien de réinitialisation invalide ou expiré');      } catch (error) {        setTokenValid(true);        await apiClient.post('/api/auth/validate-reset-token', { token });      try {    const validateToken = async () => {  useEffect(() => {  // Valide le token au chargement  const [errors, setErrors] = useState({});  });    confirmPassword: '',    password: '',  const [formData, setFormData] = useState({  const [success, setSuccess] = useState(false);  const [showPassword, setShowPassword] = useState(false);  const [tokenValid, setTokenValid] = useState(false);  const [validating, setValidating] = useState(true);  const [loading, setLoading] = useState(false);  const navigate = useNavigate();  const { token } = useParams();const ResetPasswordPage = () => { */ * ResetPasswordPage - Réinitialisation de mot de passe avec token/**import apiClient from '../../api/axios';import toast from 'react-hot-toast';import { Lock, Eye, EyeOff, Loader, CheckCircle } from 'lucide-react';import { useParams, useNavigate } from 'react-router-dom';import { useNavigate, Link } from 'react-router-dom';
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
