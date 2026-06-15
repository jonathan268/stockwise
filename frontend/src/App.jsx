import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useThemeStore } from "./store/themeStore";
import { useAuthStore } from "./store/authStore";
import axios from "./lib/axios";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import SuppliersPage from "./pages/SuppliersPage";
import SalesPage from "./pages/SalesPage";
import MovementsPage from "./pages/MovementsPage";
import AlertsPage from "./pages/AlertsPage";
import InsightsPage from "./pages/InsightsPage";
import SettingsPage from "./pages/SettingsPage";
import ConsolePage from "./pages/ConsolePage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import CookiesPage from "./pages/CookiesPage";

// Components
import PrivateRoute from "./routes/PrivateRoute";
import PageTransition from "./components/PageTransition";
import CookieConsentBanner from "./components/CookieConsentBanner";

export default function App() {
  const location = useLocation();
  const { theme } = useThemeStore();
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const setTokens = useAuthStore((s) => s.setTokens);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (refreshToken && !useAuthStore.getState().accessToken) {
      axios.post("/auth/refresh-token", { refreshToken })
        .then((res) => {
          const { accessToken, refreshToken: newRefresh } = res.data.data;
          setTokens(accessToken, newRefresh);
        })
        .catch(() => logout());
    }
  }, []);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/auth/forgot" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
        <Route path="/auth/reset/:token" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <PageTransition><DashboardPage /></PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/products"
          element={
            <PrivateRoute>
              <PageTransition><ProductsPage /></PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/suppliers"
          element={
            <PrivateRoute>
              <PageTransition><SuppliersPage /></PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <PrivateRoute>
              <PageTransition><SalesPage /></PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/movements"
          element={
            <PrivateRoute>
              <PageTransition><MovementsPage /></PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <PrivateRoute>
              <PageTransition><AlertsPage /></PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <PrivateRoute>
              <PageTransition><InsightsPage /></PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <PageTransition><SettingsPage /></PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/console"
          element={
            <PrivateRoute>
              <PageTransition><ConsolePage /></PageTransition>
            </PrivateRoute>
          }
        />

        {/* Legal Pages */}
        <Route path="/legal/terms" element={<PageTransition><TermsPage /></PageTransition>} />
        <Route path="/legal/privacy" element={<PageTransition><PrivacyPage /></PageTransition>} />
        <Route path="/legal/cookies" element={<PageTransition><CookiesPage /></PageTransition>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <CookieConsentBanner />
    </AnimatePresence>
  );
}