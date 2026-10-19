const { AppError } = require('../errors/AppError');

function validateCreateTicket(body = {}) {
  const loi = [];

  if (!body.phone || !/^0[0-9]{9}$/.test(body.phone.trim())) {
    loi.push({ truong: 'phone', ly_do: 'Số điện thoại phải đúng 10 chữ số, bắt đầu bằng 0 (QT-02)' });
  }
  if (!body.deviceId || !Number.isInteger(body.deviceId) || body.deviceId <= 0) {
    loi.push({ truong: 'deviceId', ly_do: 'Thiết bị không hợp lệ' });
  }
  if (!body.issueDesc || typeof body.issueDesc !== 'string' || body.issueDesc.trim().length === 0) {
    loi.push({ truong: 'issueDesc', ly_do: 'Mô tả lỗi bắt buộc phải có (8a)' });
  }
  if (!['CAO', 'TRUNG_BINH', 'THAP'].includes(body.priority)) {
    loi.push({ truong: 'priority', ly_do: 'Mức ưu tiên phải là CAO, TRUNG_BINH hoặc THAP' });
  }

  if (loi.length > 0) {
    throw new AppError('DU_LIEU_KHONG_HOP_LE', 'Dữ liệu đầu vào không hợp lệ', loi);
  }

  return { ...body, phone: body.phone.trim(), issueDesc: body.issueDesc.trim() };
}

module.exports = { validateCreateTicket };