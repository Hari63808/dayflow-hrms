import api from './api';

export const employeeService = {
  getProfile: async () => {
    const response = await api.get('/employees/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/employees/profile', data);
    return response.data;
  },

  uploadAvatar: async (formData) => {
    const response = await api.post('/employees/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getAllEmployees: async () => {
    const response = await api.get('/employees');
    return response.data;
  },

  addEmployee: async (data) => {
    const response = await api.post('/employees', data);
    return response.data;
  },

  updateEmployee: async (id, data) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  deleteEmployee: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  }
};
