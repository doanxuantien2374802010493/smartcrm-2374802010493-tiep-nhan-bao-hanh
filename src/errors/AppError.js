class AppError extends Error {
  constructor(code, message, chiTiet = undefined) {
    super(message);
    this.name = 'AppError';
    this.code = code; // Mã nghiệp vụ: DU_LIEU_KHONG_HOP_LE, PHIEU_DANG_MO,...
    if (chiTiet !== undefined) this.chiTiet = chiTiet;
  }
}

module.exports = { AppError };