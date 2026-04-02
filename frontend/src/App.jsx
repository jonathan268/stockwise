import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { HelmetAsync, HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { OrganizationProvider } from "./context/OrganizationContext";
import { NotificationProvider } from "./context/NotificationContext";
import "./index.css";

// Lazy loading des pages
const AuthLayout = lazy(() => import("./pages/auth/AuthLayout"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(
  () => import("./pages/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));

const MainLayout = lazy(() => import("./pages/layout/MainLayout"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const ProductsPage = lazy(() => import("./pages/products/ProductsPage"));
const ProductDetailPage = lazy(
  () => import("./pages/products/ProductDetailPage"),
);
const CreateProductPage = lazy(
  () => import("./pages/products/CreateProductPage"),
);
const EditProductPage = lazy(() => import("./pages/products/EditProductPage"));

const StockPage = lazy(() => import("./pages/stock/StockPage"));
const StockMovementPage = lazy(() => import("./pages/stock/StockMovementPage"));
const StockAlertsPage = lazy(() => import("./pages/stock/StockAlertsPage"));

const OrdersPage = lazy(() => import("./pages/orders/OrdersPage"));
const OrderDetailPage = lazy(() => import("./pages/orders/OrderDetailPage"));
const CreateOrderPage = lazy(() => import("./pages/orders/CreateOrderPage"));

const SuppliersPage = lazy(() => import("./pages/suppliers/SuppliersPage"));
const SupplierDetailPage = lazy(
  () => import("./pages/suppliers/SupplierDetailPage"),
);
const CreateSupplierPage = lazy(
  () => import("./pages/suppliers/CreateSupplierPage"),
);

const CategoriesPage = lazy(() => import("./pages/categories/CategoriesPage"));
const CreateCategoryPage = lazy(
  () => import("./pages/categories/CreateCategoryPage"),
);

const AnalyticsPage = lazy(() => import("./pages/analytics/AnalyticsPage"));
const ReportsPage = lazy(() => import("./pages/analytics/ReportsPage"));
const PredictionsPage = lazy(() => import("./pages/analytics/PredictionsPage"));

const SettingsPage = lazy(() => import("./pages/settings/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/settings/ProfilePage"));
const OrganizationSettingsPage = lazy(
  () => import("./pages/settings/OrganizationSettingsPage"),
);
const SubscriptionPage = lazy(
  () => import("./pages/subscription/SubscriptionPage"),
);

const NotificationsPage = lazy(
  () => import("./pages/notifications/NotificationsPage"),
);

// Admin Pages
const AdminDashboard = lazy(() => import("./admin/pages/Admindashboard"));
const UserManagement = lazy(() => import("./admin/pages/UserManagement"));
const OrganizationManagement = lazy(
  () => import("./admin/pages/OrganizationManagement"),
);
const SubscriptionManagement = lazy(
  () => import("./admin/pages/SubscriptionManagement"),
);
const SystemLogs = lazy(() => import("./admin/pages/SystemLogs"));
const AuditTrail = lazy(() => import("./admin/pages/AuditTrail"));

const NotFoundPage = lazy(() => import("./pages/errors/NotFoundPage"));
const UnauthorizedPage = lazy(() => import("./pages/errors/UnauthorizedPage"));

/**
 * @component
 * Composant principal de l'application
 * Centralise le routage, les providers et la gestion globale de l'état
 */
const App = () => {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <Providers>
            <AppRoutes />
            <Toaster
              position="top-right"
              reverseOrder={false}
              gutter={8}
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },
                success: {
                  duration: 3000,
                  theme: {
                    primary: "#4ade80",
                    secondary: "#e2e8f0",
                  },
                },
                error: {
                  duration: 4000,
                  theme: {
                    primary: "#ef4444",
                    secondary: "#e2e8f0",
                  },
                },
              }}
            />
          </Providers>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

/**
 * Fournisseurs d'état et contextes globaux
 */
const Providers = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OrganizationProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </OrganizationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

/**
 * Routes de l'application
 * Structures les routes publiques, protégées et admin
 */
const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* ==================== ROUTES PUBLIQUES (AUTHENTIFICATION) ==================== */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route
            path="/auth/forgot-password"
            element={<ForgotPasswordPage />}
          />
          <Route
            path="/auth/reset-password/:token"
            element={<ResetPasswordPage />}
          />
        </Route>

        {/* ==================== ROUTES PROTÉGÉES (AUTHENTIFIÉES) ==================== */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Gestion des Produits */}
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/products/create" element={<CreateProductPage />} />
          <Route path="/products/:id/edit" element={<EditProductPage />} />

          {/* Gestion des Stocks */}
          <Route path="/stock" element={<StockPage />} />
          <Route path="/stock/movements" element={<StockMovementPage />} />
          <Route path="/stock/alerts" element={<StockAlertsPage />} />

          {/* Gestion des Commandes */}
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/orders/create" element={<CreateOrderPage />} />

          {/* Gestion des Fournisseurs */}
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
          <Route path="/suppliers/create" element={<CreateSupplierPage />} />

          {/* Gestion des Catégories */}
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/create" element={<CreateCategoryPage />} />

          {/* Analytics et Rapports */}
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/analytics/reports" element={<ReportsPage />} />
          <Route path="/analytics/predictions" element={<PredictionsPage />} />

          {/* Notifications */}
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Paramètres */}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/profile" element={<ProfilePage />} />
          <Route
            path="/settings/organization"
            element={<OrganizationSettingsPage />}
          />
          <Route path="/settings/subscription" element={<SubscriptionPage />} />
        </Route>

        {/* ==================== ROUTES ADMIN (ADMINISTRATEURS SEULEMENT) ==================== */}
        <Route
          element={
            <AdminRoute>
              <MainLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route
            path="/admin/organizations"
            element={<OrganizationManagement />}
          />
          <Route
            path="/admin/subscriptions"
            element={<SubscriptionManagement />}
          />
          <Route path="/admin/logs" element={<SystemLogs />} />
          <Route path="/admin/audit-trail" element={<AuditTrail />} />
        </Route>

        {/* ==================== ROUTES D'ERREUR ==================== */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
