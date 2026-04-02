import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

/**
 * UnauthorizedPage - Page 401/403
 */
const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="bg-red-100 rounded-full p-6">
            <Lock className="w-12 h-12 text-red-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Accès refusé</h1>
        <p className="text-gray-400 mb-8">
          Vous n'avez pas les permissions nécessaires pour accéder à cette
          ressource.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Accueil
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
