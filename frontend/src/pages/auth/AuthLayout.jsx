import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";

/**
 * AuthLayout - Layout pour les pages d'authentification
 * Pages publiques sans header/sidebar
 */
const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet />
      </Suspense>
    </div>
  );
};

export default AuthLayout;
