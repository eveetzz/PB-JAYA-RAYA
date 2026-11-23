import api from '../../../services/api';

export const userManagementApi = {
  // params: { page, limit, role, status, search }
  fetchUsers: (params = {}) =>
    api.get('/user', { params }),

  registerUser: (data) =>
    api.post('/user/register', data),

  updateEmail: (uidUser, email) =>
    api.patch(`/user/${uidUser}/email`, { email }),

  updateStatus: (uidUser, statusAkun) =>
    api.patch(`/user/${uidUser}/status`, { statusAkun }),

  addRoles: (payload, type) =>
    api.post(`/user/add-roles?type=${type}`, payload),
};
