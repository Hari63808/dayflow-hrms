import api from './api';

export const holidayService = {
  getHolidays: async () => {
    const res = await api.get('/holidays');
    return res.data;
  },
  addHoliday: async (data) => {
    const res = await api.post('/holidays', data);
    return res.data;
  }
};
