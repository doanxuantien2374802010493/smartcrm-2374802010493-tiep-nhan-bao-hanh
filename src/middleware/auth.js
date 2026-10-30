const jwt = require('jsonwebtoken');
const { AppError } = require('../errors/AppError');

// Xác thực JWT cơ bản: đọc "Authorization: Bearer <token>" rồi gắn req.user cho các route phía sau.
module.exports = function requireAuth(jwtSecret) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next(new AppError('UNAUTHORIZED', 'Bạn chưa đăng nhập'));
    try {
      const p = jwt.verify(token, jwtSecret);
      req.user = { employeeId: p.employeeId, fullName: p.fullName, role: p.role, centerId: p.centerId };
      return next();
    } catch {
      return next(new AppError('UNAUTHORIZED', 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn'));
    }
  };
};
