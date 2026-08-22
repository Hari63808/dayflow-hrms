import api from './api';

export const documentService = {
  getDocuments: async () => {
    const res = await api.get('/documents');
    return res.data;
  },
  uploadDocumentRecord: async (data) => {
    const res = await api.post('/documents', data);
    return res.data;
  }
};
