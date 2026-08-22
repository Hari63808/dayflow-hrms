import api from './api';

export const announcementService = {
  getAnnouncements: async () => {
    const res = await api.get('/announcements');
    return res.data;
  },
  createAnnouncement: async (data) => {
    const res = await api.post('/announcements', data);
    return res.data;
  }
};
