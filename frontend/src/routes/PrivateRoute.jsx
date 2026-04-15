import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Layout from "../components/Layout";

export default function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      {children}
    </Layout>
  );
}
