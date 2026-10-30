const crypto = require('crypto');

// Gắn requestId cho mỗi yêu cầu để truy từ thông báo lỗi người dùng về đúng dòng log.
module.exports = function requestId(req, res, next) {
  req.requestId = crypto.randomUUID().slice(0, 8);
  res.setHeader('X-Request-Id', req.requestId);
  next();
};
