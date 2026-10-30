require('dotenv').config({ quiet: true });

// Đọc biến môi trường một chỗ duy nhất; thiếu biến bắt buộc thì báo rõ tên biến.
function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Thiếu biến môi trường ${name}. Xem .env.example`);
  return v;
}

module.exports = {
  port: Number(process.env.PORT || 3000),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'smartcrm',
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
  },
  get jwtSecret() { return required('JWT_SECRET'); },
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
};
