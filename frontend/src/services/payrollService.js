import api from './api';

export const payrollService = {
  getMyPayroll: async () => {
    const response = await api.get('/payroll/my');
    return response.data;
  },

  getAllPayroll: async () => {
    const response = await api.get('/payroll');
    return response.data;
  },

  addPayroll: async (payrollData) => {
    const response = await api.post('/payroll', payrollData);
    return response.data;
  },

  updatePayroll: async (id, data) => {
    const response = await api.put(`/payroll/${id}`, data);
    return response.data;
  },

  deletePayroll: async (id) => {
    const response = await api.delete(`/payroll/${id}`);
    return response.data;
  }
};
