import api from './api';

export const reviewService = {
  getReviews: async () => {
    const res = await api.get('/reviews');
    return res.data;
  },
  addReview: async (data) => {
    const res = await api.post('/reviews', data);
    return res.data;
  }
};
