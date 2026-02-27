import api from "./api";
import canteenAuthService from "./canteenAuthService";

const getCanteenAuthHeaders = () => {
  const owner = canteenAuthService.getCurrentCanteenOwner();
  return owner ? { Authorization: `Bearer ${owner.token}` } : {};
};

const comboDealService = {
  // Public endpoints
  getAllActiveComboDeals: async () => {
    const response = await api.get("/combo-deals/all");
    return response.data;
  },

  getCanteenComboDeals: async (canteenId) => {
    const response = await api.get(`/combo-deals/canteen/${canteenId}`);
    return response.data;
  },

  // User endpoint (requires user auth - handled by api interceptor)
  getRecommendedCombos: async () => {
    const response = await api.get("/combo-deals/recommended");
    return response.data;
  },

  // Canteen owner endpoints
  createComboDeal: async (canteenId, data) => {
    const response = await api.post(
      `/combo-deals?canteenId=${canteenId}`,
      data,
      {
        headers: getCanteenAuthHeaders(),
      },
    );
    return response.data;
  },

  updateComboDeal: async (id, canteenId, data) => {
    const response = await api.put(
      `/combo-deals/${id}?canteenId=${canteenId}`,
      data,
      {
        headers: getCanteenAuthHeaders(),
      },
    );
    return response.data;
  },

  deleteComboDeal: async (id, canteenId) => {
    const response = await api.delete(
      `/combo-deals/${id}?canteenId=${canteenId}`,
      {
        headers: getCanteenAuthHeaders(),
      },
    );
    return response.data;
  },
};

export default comboDealService;
