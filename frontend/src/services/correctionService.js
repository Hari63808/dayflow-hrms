import api from './api';

export const correctionService = {
  getCorrections: async () => {
    const res = await api.get('/corrections');
    return res.data;
  },
  requestCorrection: async (data) => {
    const res = await api.post('/corrections', data);
    return res.data;
  },
  reviewCorrection: async (id, data) => {
    const res = await api.put(`/corrections/${id}/review`, data);
    return res.data;
  }
};
