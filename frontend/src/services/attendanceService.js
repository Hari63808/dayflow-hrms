import api from './api';

export const attendanceService = {
  checkIn: async () => {
    const response = await api.post('/attendance/check-in');
    return response.data;
  },

  checkOut: async () => {
    const response = await api.post('/attendance/check-out');
    return response.data;
  },

  getMyAttendance: async () => {
    const response = await api.get('/attendance/my');
    return response.data;
  },

  getTodayStatus: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  },

  getAllAttendance: async () => {
    const response = await api.get('/attendance');
    return response.data;
  }
};
