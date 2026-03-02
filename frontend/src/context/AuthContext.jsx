import { createContext, useContext } from "react";
import { useAuth } from "../hooks/useAuth";

// ─── Création du Context ─────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider : entoure toute l'app ─────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// ─── Hook : utiliser l'auth partout facilement ───────────────────────────────
// Usage : const { user, logout, isAuthenticated } = useAuthContext();
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext doit être utilisé dans un <AuthProvider>");
  }
  return context;
};
