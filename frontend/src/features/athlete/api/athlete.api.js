import api from '../../../services/api';

// Endpoint modul atlet. Semua request multipart dikirim sebagai FormData,
// sehingga header Content-Type diserahkan ke browser (boundary otomatis).
export const athleteApi = {
  // params: { search, status, page, limit, sortBy, sortOrder }
  fetchAthletes: (params = {}) => api.get('/athlete', { params }),

  fetchAthleteById: (id) => api.get(`/athlete/${id}`),

  createAthlete: (formData) =>
    api.post('/athlete/import-data', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateAthlete: (id, formData) =>
    api.patch(`/athlete/edit/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteAthlete: (id) => api.delete(`/athlete/delete/${id}`),

  // dryRun true = cek data saja, false = simpan
  importExcel: (formData) =>
    api.post('/athlete/import-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  downloadTemplate: () =>
    api.get('/athlete/import-template', { responseType: 'blob' }),
};