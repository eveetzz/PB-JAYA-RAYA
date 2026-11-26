import api from '../../../services/api';

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export const coachOfficialApi = {
  // params: { tipe, search, status, page, limit }
  fetchList: (params = {}) => api.get('/pelatih-official', { params }),

  fetchSektors: () => api.get('/sektor'),

  fetchCoach: (id) => api.get(`/coach/detail/${id}`),

  createCoach: (formData) =>
    api.post('/coach/import-data', formData, multipart),

  updateCoach: (id, formData) =>
    api.put(`/coach/edit/${id}`, formData, multipart),

  deleteCoach: (id) => api.delete(`/coach/delete/${id}`),

  importCoach: (formData) =>
    api.post('/coach/import-excel', formData, multipart),

  downloadCoachTemplate: () =>
    api.get('/coach/import-template', { responseType: 'blob' }),

  fetchOfficial: (id) => api.get(`/official/detail/${id}`),

  createOfficial: (formData) =>
    api.post('/official/import-data', formData, multipart),

  updateOfficial: (id, formData) =>
    api.put(`/official/edit/${id}`, formData, multipart),

  deleteOfficial: (id) => api.delete(`/official/delete/${id}`),

  importOfficial: (formData) =>
    api.post('/official/import-excel', formData, multipart),

  downloadOfficialTemplate: () =>
    api.get('/official/import-template', { responseType: 'blob' }),
};