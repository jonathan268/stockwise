import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./src/components/Layout";
import Dashboard from "./src/pages/Dashboard";
import Login from "./src/pages/Login";
import Register from "./src/pages/Register";
import Inventaire from "./src/pages/Inventaire";
import Commande from "./src/pages/Commande";
import Alerts from "./src/pages/Alert";
import Settings from "./src/pages/Settings";
import Analytics from "./src/pages/Analyse";
import Suppliers from "./src/pages/Suppliers";

/* Admin Pages
import AdminLayout from "./admin/components/AdminLayout";
import AdminDashboard from "./admin/components/AdminDashboard";
import AdminUsers from "./admin/components/AdminUsers";
import AdminSubscriptions from "./admin/components/AdminSubscriptions";
import AdminOrganizations from "./admin/components/AdminOrganizations";

*/

// Pages exemples (à créer selon vos besoins)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route de connexion (publique) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes de l'application (avec Layout) */}
        <Route path="/" element={<Layout />}>
          {/* Redirection de la racine vers dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Pages de l'application */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventaire" element={<Inventaire />} />
          <Route path="commande" element={<Commande />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="suppliers" element={<Suppliers />} />
        </Route>
     
        

        {/* Route 404 - Page non trouvée */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
