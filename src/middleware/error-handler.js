// Middleware lỗi DUY NHẤT: dịch mã lỗi -> mã HTTP, ghi log đúng MỘT lần, che chi tiết kỹ thuật với người dùng.
const logger = require('../logger');
const { toApi } = require('../routes/presenter');

const HTTP_BY_CODE = {
  VALIDATION_FAILED: 400,
  INVALID_PRIORITY: 400,
  UNAUTHORIZED: 401,
  INVALID_CREDENTIALS: 401,
  FORBIDDEN: 403,
  CUSTOMER_NOT_FOUND: 404,
  DEVICE_NOT_FOUND: 404,
  TICKET_NOT_FOUND: 404,
  CATEGORY_NOT_FOUND: 404,
  PHONE_EXISTS: 409,
  WARRANTY_ALREADY_VERIFIED: 409,
  TICKET_NOT_EDITABLE: 409,
};
const DB_DOWN = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', '57P01', '08006', '08001', '08004'];

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const ctx = { requestId: req.requestId, method: req.method, path: req.path };

  if (err && err.type === 'entity.parse.failed') {
    logger.info('JSON không hợp lệ', ctx);
    return res.status(400).json({ error: { code: 'VALIDATION_FAILED', message: 'Nội dung gửi lên không phải JSON hợp lệ' } });
  }

  const status = err && err.code && HTTP_BY_CODE[err.code];
  if (status) {
    // Lỗi người dùng/nghiệp vụ là bình thường: INFO, không phải ERROR
    logger.info(`vi phạm nghiệp vụ ${err.code}`, ctx);
    const body = { code: err.code, message: err.message };
    if (err.chiTiet) body[err.code === 'VALIDATION_FAILED' ? 'fields' : 'details'] = toApi(err.chiTiet);
    return res.status(status).json({ error: body });
  }

  // Lỗi hệ thống: log đầy đủ kèm ngăn xếp, người dùng chỉ thấy thông báo chung + mã tra cứu
  logger.error('lỗi hệ thống', { ...ctx, err });
  const dbDown = err && DB_DOWN.includes(err.code);
  return res.status(dbDown ? 503 : 500).json({
    error: {
      code: dbDown ? 'DB_UNAVAILABLE' : 'INTERNAL_ERROR',
      message: `Hệ thống đang gặp sự cố, vui lòng thử lại sau. Mã tra cứu: ${req.requestId}`,
    },
  });
}

module.exports = errorHandler;
