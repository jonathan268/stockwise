import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, LogIn, PackageCheck } from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try{
      const response = await axios.post('localhost:3000/api/auth/login', {email, password});
      const token = response.data.token;
      localStorage.setItem('token', token);
      window.location.href = 'dashbord';
    } catch (error){
      setError(error.response.data.message);
    } finally{
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10 p-4">
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
                    value={email} onChange={(event)=> setEmail(event.target.value)}
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
                    type={showPassword ? 'text' : 'password'}
                    value={password} onChange={(event)=> setPassword(event.target.value)}
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
                      <EyeOff size={20} className="text-base-content/40 hover:text-base-content" />
                    ) : (
                      <Eye size={20} className="text-base-content/40 hover:text-base-content" />
                    )}
                  </button>
                </div>
              </div>

              {/* Se souvenir & Mot de passe oublié */}
              <div className="flex items-center justify-between">
                <label className="label cursor-pointer gap-2">
                  <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" />
                  <span className="label-text">Se souvenir de moi</span>
                </label>
                <a href="#" className="label-text link link-primary link-hover">
                  Mot de passe oublié ?
                </a>
              </div>

              {/* Bouton de connexion */}
              <button type="submit" disabled={loading} className="btn btn-primary w-full gap-2">
                <LogIn size={20} />
               {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            {/* Divider */}
            <div className="divider">OU</div>

            {/* Boutons OAuth */}
            <div className="space-y-2">
              <button className="btn btn-soft btn-info w-full gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuer avec Google
              </button>
              
            </div>

            {/* Lien vers inscription */}
            <div className="text-center mt-6">
              <p className="text-sm text-base-content/70">
                Vous n'avez pas de compte ?{' '}
                <a href="#" className="link link-primary font-semibold">
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