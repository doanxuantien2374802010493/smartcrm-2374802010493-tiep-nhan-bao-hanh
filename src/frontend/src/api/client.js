const BASE = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 204) return null;
  let body = null;
  try {
    body = await res.json();
  } catch {
    // Không phải JSON
  }

  if (!res.ok) {
    throw new ApiError(
      res.status, 
      body?.error, 
      body?.message || 'Không kết nối được tới hệ thống. Vui lòng thử lại.'
    );
  }

  return body?.data ?? body;
}