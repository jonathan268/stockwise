import api from "../api/axios";

const SubscriptionService = {
  // GET /api/v1/subscriptions/plans
  getPlans: async () => {
    const response = await api.get("/api/v1/subscriptions/plans");
    return response.data;
  },

  // GET /api/v1/subscriptions/current
  getCurrent: async () => {
    const response = await api.get("/api/v1/subscriptions/current");
    return response.data;
  },

  // POST /api/v1/subscriptions/upgrade
  upgrade: async (planId, paymentData) => {
    const response = await api.post("/api/v1/subscriptions/upgrade", {
      planId,
      ...paymentData,
    });
    return response.data;
  },

  // POST /api/v1/subscriptions/downgrade
  downgrade: async (planId) => {
    const response = await api.post("/api/v1/subscriptions/downgrade", {
      planId,
    });
    return response.data;
  },

  // GET /api/v1/subscriptions/usage
  getUsage: async () => {
    const response = await api.get("/api/v1/subscriptions/usage");
    return response.data;
  },

  // POST /api/v1/subscriptions/cancel
  cancel: async () => {
    const response = await api.post("/api/v1/subscriptions/cancel");
    return response.data;
  },
};

export default SubscriptionService;
