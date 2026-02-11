import React from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10 p-4">
      <div className="w-full max-w-md">
        {/* Logo et Titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <Mail size={32} className="text-primary-content" />
          </div>
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Mot de passe oublié ?
          </h1>
          <p className="text-base-content/70">
            Entrez votre email pour réinitialiser votre mot de passe
          </p>
        </div>

        {/* Formulaire */}
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body">
            <form className="space-y-4">
              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Adresse email</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={20} className="text-base-content/40" />
                  </div>
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    className="input input-bordered w-full pl-10"
                  />
                </div>
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Nous vous enverrons un lien de réinitialisation
                  </span>
                </label>
              </div>

              {/* Bouton d'envoi */}
              <button type="submit" className="btn btn-primary w-full gap-2">
                <Send size={20} />
                Envoyer le lien
              </button>

              {/* Lien retour */}
              <a href="#" className="btn btn-ghost w-full gap-2">
                <ArrowLeft size={20} />
                Retour à la connexion
              </a>
            </form>
          </div>
        </div>

        {/* Aide */}
        <div className="card bg-base-100 shadow-lg mt-6">
          <div className="card-body py-4">
            <div className="flex items-start gap-3">
              <div className="bg-info/20 p-2 rounded-lg">
                <Mail size={20} className="text-info" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-base-content mb-1">Besoin d'aide ?</p>
                <p className="text-base-content/70">
                  Contactez notre support à{' '}
                  <a href="mailto:support@stockai.com" className="link link-primary">
                    support@stockwise.com
                  </a>
                </p>
              </div>
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

export default ForgotPassword;