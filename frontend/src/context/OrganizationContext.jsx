import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import apiClient from "../api/axios";
import toast from "react-hot-toast";

/**
 * OrganizationContext - Gestion du contexte organisationnel
 * Multi-tenant: permet aux utilisateurs de basculer entre les organisations
 */
const OrganizationContext = createContext();

export const OrganizationProvider = ({ children }) => {
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupère la liste des organisations de l'utilisateur
  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/organizations");
      setOrganizations(response.data.data || []);

      // Récupère l'organisation sélectionnée (depuis localStorage ou la première)
      const savedOrgId = localStorage.getItem("selectedOrganizationId");
      const defaultOrg = savedOrgId
        ? response.data.data.find((org) => org.id === savedOrgId)
        : response.data.data[0];

      if (defaultOrg) {
        setCurrentOrganization(defaultOrg);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error("Erreur lors du chargement des organisations");
    } finally {
      setLoading(false);
    }
  }, []);

  // Charge les organisations au montage
  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Change l'organisation actuelle
  const switchOrganization = useCallback(
    async (organizationId) => {
      try {
        const org = organizations.find((o) => o.id === organizationId);
        if (org) {
          setCurrentOrganization(org);
          localStorage.setItem("selectedOrganizationId", org.id);

          // Notifie le backend du changement (pour les logs, context tenant, etc.)
          await apiClient.post("/api/organizations/select", { organizationId });
          toast.success(`Organisation changée: ${org.name}`);
        }
      } catch (err) {
        toast.error("Erreur lors du changement d'organisation");
      }
    },
    [organizations],
  );

  // Met à jour l'organisation actuelle
  const updateCurrentOrganization = useCallback(
    async (data) => {
      try {
        const response = await apiClient.put(
          `/api/organizations/${currentOrganization.id}`,
          data,
        );
        setCurrentOrganization(response.data.data);
        toast.success("Organisation mise à jour");
      } catch (err) {
        toast.error("Erreur lors de la mise à jour");
      }
    },
    [currentOrganization?.id],
  );

  // Crée une nouvelle organisation
  const createOrganization = useCallback(async (data) => {
    try {
      const response = await apiClient.post("/api/organizations", data);
      const newOrg = response.data.data;
      setOrganizations((prev) => [...prev, newOrg]);
      toast.success("Organisation créée");
      return newOrg;
    } catch (err) {
      toast.error("Erreur lors de la création");
      throw err;
    }
  }, []);

  // Supprime une organisation
  const deleteOrganization = useCallback(
    async (organizationId) => {
      try {
        await apiClient.delete(`/api/organizations/${organizationId}`);
        setOrganizations((prev) => prev.filter((o) => o.id !== organizationId));

        // Si c'était l'organisation actuelle, change vers une autre
        if (currentOrganization?.id === organizationId) {
          const remaining = organizations.filter(
            (o) => o.id !== organizationId,
          );
          if (remaining.length > 0) {
            switchOrganization(remaining[0].id);
          } else {
            setCurrentOrganization(null);
          }
        }

        toast.success("Organisation supprimée");
      } catch (err) {
        toast.error("Erreur lors de la suppression");
      }
    },
    [currentOrganization, organizations, switchOrganization],
  );

  const value = {
    currentOrganization,
    organizations,
    loading,
    error,
    switchOrganization,
    updateCurrentOrganization,
    createOrganization,
    deleteOrganization,
    fetchOrganizations,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

/**
 * Hook pour utiliser le contexte organisationnel
 */
export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within OrganizationProvider");
  }
  return context;
};
