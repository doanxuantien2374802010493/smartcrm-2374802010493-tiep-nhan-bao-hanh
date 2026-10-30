// Lớp client DUY NHẤT: mọi lệnh gọi API đi qua request(). Không nơi nào khác gọi fetch.
const BASE = import.meta.env?.VITE_API_BASE_URL ?? '';

export class ApiError extends Error {
  // fields: lỗi theo từng trường (VALIDATION_FAILED); details: dữ liệu kèm theo (vd. khách đã tồn tại)
  constructor(status, code, message, fields, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.details = details;
  }
}

export const authStore = {
  token: () => localStorage.getItem('token'),
  user: () => JSON.parse(localStorage.getItem('user') || 'null'),
  save(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    window.dispatchEvent(new Event('auth-changed'));
  },
  clear() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-changed'));
  },
};

export async function request(path, options = {}) {
  const token = authStore.token();
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    // Không in chi tiết kỹ thuật ra màn hình
    throw new ApiError(0, 'NETWORK', 'Không kết nối được tới hệ thống. Kiểm tra mạng hoặc máy chủ rồi thử lại.');
  }

  let body = null;
  try { body = await res.json(); } catch { /* không có thân JSON */ }

  if (!res.ok) {
    const e = body?.error;
    if (res.status === 401 && path !== '/api/auth/login') authStore.clear(); // hết phiên -> về màn đăng nhập
    throw new ApiError(res.status, e?.code, e?.message || 'Hệ thống phản hồi không đọc được. Vui lòng thử lại.', e?.fields, e?.details);
  }
  return body;
}
