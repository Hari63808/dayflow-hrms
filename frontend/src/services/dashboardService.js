import api from './api';

export const dashboardService = {
  getAdminStats: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  getEmployeeStats: async () => {
    const response = await api.get('/dashboard/employee');
    return response.data;
  }
};
