// Bọc handler async để lỗi chuyển vào middleware lỗi (không nuốt lỗi)
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
