import api from './api';

export const taskService = {
  getTasks: async () => {
    const res = await api.get('/tasks');
    return res.data;
  },
  addTask: async (data) => {
    const res = await api.post('/tasks', data);
    return res.data;
  },
  updateTaskStatus: async (id, status) => {
    const res = await api.put(`/tasks/${id}/status`, { status });
    return res.data;
  }
};
