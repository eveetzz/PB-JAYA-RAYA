import api from '../../../services/api';

export const authApi = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  me: () =>
    api.get('/auth/me'),

  logout: () =>
    api.post('/auth/logout'),
};
