const { isString, isBlank, EMAIL, failIfAny } = require('./common');

// POST /api/customers: full_name + phone bắt buộc (định dạng SĐT kiểm ở service theo QT-01/QT-02)
function validateCreateCustomer(body = {}) {
  const f = {};
  if (isBlank(body.full_name)) f.full_name = 'Bắt buộc nhập họ tên';
  else if (!isString(body.full_name) || body.full_name.length > 120) f.full_name = 'Tối đa 120 ký tự';
  if (isBlank(body.phone)) f.phone = 'Bắt buộc nhập số điện thoại';
  if (!isBlank(body.email) && (!isString(body.email) || !EMAIL.test(body.email))) f.email = 'Email không đúng định dạng';
  failIfAny(f);
  return { fullName: body.full_name.trim(), phone: String(body.phone), email: isBlank(body.email) ? null : body.email.trim() };
}

function validateUpdateCustomer(body = {}) {
  const f = {};
  const out = {};
  if (body.full_name !== undefined) {
    if (isBlank(body.full_name) || !isString(body.full_name) || body.full_name.length > 120) f.full_name = 'Không được để trống, tối đa 120 ký tự';
    else out.fullName = body.full_name.trim();
  }
  if (body.phone !== undefined) {
    if (isBlank(body.phone)) f.phone = 'Không được để trống';
    else out.phone = String(body.phone);
  }
  if (body.email !== undefined) {
    if (!isBlank(body.email) && (!isString(body.email) || !EMAIL.test(body.email))) f.email = 'Email không đúng định dạng';
    else out.email = isBlank(body.email) ? null : body.email.trim();
  }
  if (Object.keys(f).length === 0 && Object.keys(out).length === 0) f.body = 'Cần ít nhất một trường: full_name, phone, email';
  failIfAny(f);
  return out;
}

module.exports = { validateCreateCustomer, validateUpdateCustomer };
