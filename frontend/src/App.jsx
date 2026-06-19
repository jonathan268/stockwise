import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useThemeStore } from "./store/themeStore";
import { useAuthStore } from "./store/authStore";
import axios from "./lib/axios";

// Pages - lazy loaded
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const SuppliersPage = lazy(() => import("./pages/SuppliersPage"));
const SalesPage = lazy(() => import("./pages/SalesPage"));
const MovementsPage = lazy(() => import("./pages/MovementsPage"));
const AlertsPage = lazy(() => import("./pages/AlertsPage"));
const InsightsPage = lazy(() => import("./pages/InsightsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const TeamPage = lazy(() => import("./pages/TeamPage"));
const AcceptInvitePage = lazy(() => import("./pages/AcceptInvitePage"));
const ConsolePage = lazy(() => import("./pages/ConsolePage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const CookiesPage = lazy(() => import("./pages/CookiesPage"));

// Components
import PrivateRoute from "./routes/PrivateRoute";
import PageTransition from "./components/PageTransition";
import CookieConsentBanner from "./components/CookieConsentBanner";
import { DashboardSkeleton, CardSkeleton } from "./components/Skeleton";

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl space-y-6">
        <div className="h-6 w-48 rounded bg-base-content/10 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
        </div>
        <div className="h-[300px] rounded-2xl bg-base-content/5 animate-pulse" />
      </div>
    </div>
  );
}

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
      <Suspense fallback={<PageSkeleton />}>
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
          path="/team"
          element={
            <PrivateRoute>
              <PageTransition><TeamPage /></PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/accept-invite/:token"
          element={
            <PrivateRoute>
              <PageTransition><AcceptInvitePage /></PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/support"
          element={
            <PrivateRoute>
              <PageTransition><SupportPage /></PageTransition>
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
      </Suspense>
    </AnimatePresence>
  );
}