// Tầng 1: kiểm định dạng cơ bản theo bảng validation của API contract. KHÔNG tin tầng này (client có thể gọi thẳng API).
const { isString, isBlank, isPositiveInt, failIfAny } = require('./common');

// POST /api/tickets: customer_id, device_id, issue_desc (10-2000 ký tự). center_id lấy từ token (QT-14).
function validateCreateTicket(body = {}) {
  const f = {};
  if (!isPositiveInt(body.customer_id)) f.customer_id = 'Bắt buộc, là số nguyên dương';
  if (!isPositiveInt(body.device_id)) f.device_id = 'Bắt buộc, là số nguyên dương';
  if (isBlank(body.issue_desc)) f.issue_desc = 'Trường bắt buộc, không được để trống';
  else if (!isString(body.issue_desc) || body.issue_desc.trim().length < 10 || body.issue_desc.length > 2000) {
    f.issue_desc = 'Mô tả lỗi phải có từ 10 đến 2000 ký tự';
  }
  if (!isBlank(body.provided_purchase_date)
      && !(isString(body.provided_purchase_date) && /^\d{4}-\d{2}-\d{2}$/.test(body.provided_purchase_date)
           && !Number.isNaN(Date.parse(body.provided_purchase_date)))) {
    f.provided_purchase_date = 'Phải có dạng YYYY-MM-DD';
  }
  failIfAny(f);
  return {
    customerId: body.customer_id,
    deviceId: body.device_id,
    issueDesc: body.issue_desc.trim(),
    providedPurchaseDate: isBlank(body.provided_purchase_date) ? null : body.provided_purchase_date,
  };
}

// PATCH /api/tickets/:id: sửa mô tả, nhóm sự cố, mức ưu tiên (chỉ khi phiếu còn MOI)
function validateUpdateTicket(body = {}) {
  const f = {};
  const out = {};
  if (body.issue_desc !== undefined) {
    if (!isString(body.issue_desc) || body.issue_desc.trim().length < 10 || body.issue_desc.length > 2000) f.issue_desc = 'Mô tả lỗi phải có từ 10 đến 2000 ký tự';
    else out.issueDesc = body.issue_desc.trim();
  }
  if (body.category_id !== undefined) {
    if (body.category_id !== null && !isPositiveInt(body.category_id)) f.category_id = 'Phải là số nguyên dương hoặc null';
    else out.categoryId = body.category_id;
  }
  if (body.priority !== undefined) {
    if (!['CAO', 'TRUNG_BINH', 'THAP'].includes(body.priority)) f.priority = 'Phải là CAO, TRUNG_BINH hoặc THAP';
    else out.priority = body.priority;
  }
  if (Object.keys(f).length === 0 && Object.keys(out).length === 0) f.body = 'Cần ít nhất một trường: issue_desc, category_id, priority';
  failIfAny(f);
  return out;
}

// PATCH /api/tickets/:id/approve-warranty: is_warranty bắt buộc là true/false
function validateApproveWarranty(body = {}) {
  const f = {};
  if (typeof body.is_warranty !== 'boolean') f.is_warranty = 'Bắt buộc, là true hoặc false';
  if (body.note !== undefined && (!isString(body.note) || body.note.length > 500)) f.note = 'Phải là chuỗi tối đa 500 ký tự';
  failIfAny(f);
  return { isWarranty: body.is_warranty, note: body.note ?? null };
}

function validateLogin(body = {}) {
  const f = {};
  if (isBlank(body.username)) f.username = 'Bắt buộc nhập tên đăng nhập';
  if (isBlank(body.password)) f.password = 'Bắt buộc nhập mật khẩu';
  failIfAny(f);
  return { username: String(body.username).trim(), password: String(body.password) };
}

module.exports = { validateCreateTicket, validateUpdateTicket, validateApproveWarranty, validateLogin };
