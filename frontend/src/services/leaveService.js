import api from './api';

export const leaveService = {
  applyLeave: async (leaveData) => {
    const response = await api.post('/leaves', leaveData);
    return response.data;
  },

  getMyLeaves: async () => {
    const response = await api.get('/leaves/my');
    return response.data;
  },

  getAllLeaves: async () => {
    const response = await api.get('/leaves');
    return response.data;
  },

  updateLeaveStatus: async (id, data) => {
    const response = await api.put(`/leaves/${id}/status`, data);
    return response.data;
  }
};
