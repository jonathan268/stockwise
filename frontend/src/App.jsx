import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useThemeStore } from "./store/themeStore";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import SalesPage from "./pages/SalesPage";
import MovementsPage from "./pages/MovementsPage";
import AlertsPage from "./pages/AlertsPage";
import InsightsPage from "./pages/InsightsPage";
import SettingsPage from "./pages/SettingsPage";
import ConsolePage from "./pages/ConsolePage";

// Components
import PrivateRoute from "./routes/PrivateRoute";

export default function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Sync theme with DOM
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/forgot" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset/:token" element={<ResetPasswordPage />} />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/products"
        element={
          <PrivateRoute>
            <ProductsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <PrivateRoute>
            <SalesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/movements"
        element={
          <PrivateRoute>
            <MovementsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/alerts"
        element={
          <PrivateRoute>
            <AlertsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/insights"
        element={
          <PrivateRoute>
            <InsightsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <SettingsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/console"
        element={
          <PrivateRoute>
            <ConsolePage />
          </PrivateRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}