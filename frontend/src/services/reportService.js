import api from './api';

export const reportService = {
  getHRReports: async () => {
    const res = await api.get('/reports');
    return res.data;
  }
};
