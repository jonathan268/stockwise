import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

/**
 * Route protégée réservée aux SuperAdmins
 */
export const AdminRoute = ({ children }) => {
  const { user, loading, isSuperAdmin } = useAuthContext();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};
