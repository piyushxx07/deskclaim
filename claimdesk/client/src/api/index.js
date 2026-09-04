import api from './axios';

export const authApi = {
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const voucherApi = {
  list: (params = {}) => api.get('/vouchers', { params }).then((r) => r.data),
  get: (id) => api.get(`/vouchers/${id}`).then((r) => r.data),
  create: (payload) => api.post('/vouchers', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/vouchers/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/vouchers/${id}`).then((r) => r.data),
  submit: (id, signatureFile) => {
    const fd = new FormData();
    fd.append('signature', signatureFile);
    return api.post(`/vouchers/${id}/submit`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },
  approve: (id, signatureFile) => {
    const fd = new FormData();
    fd.append('signature', signatureFile);
    return api.post(`/vouchers/${id}/approve`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },
  reject: (id, reason) => api.post(`/vouchers/${id}/reject`, { reason }).then((r) => r.data),
  dashboard: () => api.get('/vouchers/dashboard').then((r) => r.data),
  analyze: (id) => api.get(`/vouchers/${id}/analyze`).then((r) => r.data),
};

export const userApi = {
  list: () => api.get('/users').then((r) => r.data),
};