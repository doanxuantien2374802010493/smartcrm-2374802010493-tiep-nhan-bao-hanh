import { request } from './client';

export const ticketsApi = {
  danhSach: ({ trang = 1, trangThai, tuKhoa } = {}) => {
    const q = new URLSearchParams({ trang: String(trang) });
    if (trangThai) q.set('trang_thai', trangThai);
    if (tuKhoa) q.set('tu_khoa', tuKhoa);
    return request(`/api/tickets?${q}`);
  },
  chiTiet: (id) => request(`/api/tickets/${id}`),
  tiepNhan: (payload) => request('/api/tickets', {
    method: 'POST', 
    body: JSON.stringify(payload)
  }),
  phanCong: (id, ktv) => request(`/api/tickets/${id}/technician`, {
    method: 'PATCH', 
    body: JSON.stringify({ technicianId: ktv })
  }),
};