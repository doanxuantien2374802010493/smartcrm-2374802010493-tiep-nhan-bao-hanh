import { request, authStore } from './client';

export const authApi = {
  async dangNhap(username, password) {
    const res = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    authStore.save(res.token, res.user);
    return res.user;
  },
};
