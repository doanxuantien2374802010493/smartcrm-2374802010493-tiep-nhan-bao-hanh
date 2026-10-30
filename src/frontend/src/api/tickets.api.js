import { request } from './client';

export const ticketsApi = {
  // Trả { data, page, size, total }; chuaXacMinh chỉ Quản lý dùng được
  danhSach: ({ page = 1, size = 20, chuaXacMinh = false } = {}) => {
    const q = new URLSearchParams({ page: String(page), size: String(size) });
    if (chuaXacMinh) q.set('warranty_verified', 'false');
    return request(`/api/tickets?${q}`);
  },
  chiTiet: (id) => request(`/api/tickets/${id}`),
  tiepNhan: (payload) => request('/api/tickets', { method: 'POST', body: JSON.stringify(payload) }),
  pheDuyet: (id, isWarranty, note) => request(`/api/tickets/${id}/approve-warranty`, {
    method: 'PATCH', body: JSON.stringify({ is_warranty: isWarranty, ...(note ? { note } : {}) }),
  }),
  lichSu: (id) => request(`/api/tickets/${id}/status-log`),
};
