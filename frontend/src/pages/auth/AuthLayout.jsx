import React, { Suspense } from "react";
import { Outlet, Link } from "react-router-dom";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useTheme } from "../../context/ThemeContext";

/**
 * AuthLayout - Layout pour les pages d'authentification
 * Utilisation stricte de DaisyUI
 */
const AuthLayout = () => {
  const { theme, toggleTheme } = useTheme();

  // On s'assure que le data-theme de DaisyUI bascule bien comme sur la Landing 
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col relative overflow-hidden">
      
      {/* Header Auth */}
      <header className="w-full flex items-center justify-between p-4 md:px-8 absolute top-0 left-0 right-0 z-20">
        <Link to="/" className="btn btn-ghost gap-2">
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Retour à l'accueil</span>
        </Link>
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 w-full relative">
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      
    </div>
  );
};

export default AuthLayout;
