import { request } from './client';

export const customersApi = {
  // US1 + FR8: trả { customer, devices, warning }; 404 nếu SĐT chưa có
  traCuu: (phone, name) => {
    const q = new URLSearchParams({ phone });
    if (name) q.set('name', name);
    return request(`/api/customers?${q}`);
  },
  tao: (payload) => request('/api/customers', { method: 'POST', body: JSON.stringify(payload) }),
};
