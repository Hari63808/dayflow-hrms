import api from './api';

export const departmentService = {
  getDepartments: async () => {
    const res = await api.get('/departments');
    return res.data;
  },
  addDepartment: async (data) => {
    const res = await api.post('/departments', data);
    return res.data;
  }
};
