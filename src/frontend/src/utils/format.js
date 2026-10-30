export const gio = (iso) => (iso ? new Date(iso).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '');

// Nhãn bảo hành: chờ duyệt / còn / hết (QT-05)
export function nhanBaoHanh(t) {
  if (!t.warranty_verified) return { text: 'Chờ Quản lý duyệt', color: '#9a6700', bg: '#fff4d6' };
  return t.is_warranty
    ? { text: 'Còn bảo hành', color: '#116329', bg: '#dcf5e3' }
    : { text: 'Hết bảo hành', color: '#a40e26', bg: '#fde2e2' };
}

export const quaHan = (t) => !['HOAN_TAT', 'DA_DONG', 'DA_HUY'].includes(t.status) && new Date(t.due_date) < new Date();
