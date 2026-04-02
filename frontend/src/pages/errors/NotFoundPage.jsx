import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

/**
 * NotFoundPage - Page 404
 */
const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="text-9xl font-bold text-blue-500">404</div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Page non trouvée</h1>
        <p className="text-gray-400 mb-8">
          La page que vous recherchez n'existe pas ou a été supprimée.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
