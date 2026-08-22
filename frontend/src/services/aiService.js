import api from './api';

export const aiService = {
  sendMessage: async (message, history = []) => {
    const res = await api.post('/ai/chat', { message, history });
    return res.data;
  }
};
