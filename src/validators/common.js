const { AppError } = require('../errors/AppError');

const isString = (v) => typeof v === 'string';
const isBlank = (v) => v === undefined || v === null || (isString(v) && v.trim() === '');
const isPositiveInt = (v) => Number.isInteger(v) && v > 0;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Gom lỗi theo từng trường rồi ném MỘT lỗi VALIDATION_FAILED (400) theo API contract: fields = { tên_trường: thông báo }
function failIfAny(fields) {
  if (Object.keys(fields).length > 0) throw new AppError('VALIDATION_FAILED', 'Dữ liệu không hợp lệ', fields);
}

function parseId(raw, name = 'id') {
  const n = Number(raw);
  if (!isPositiveInt(n)) throw new AppError('VALIDATION_FAILED', 'Dữ liệu không hợp lệ', { [name]: 'Phải là số nguyên dương' });
  return n;
}

// page từ 1, size mặc định 20, tối đa 100 (API contract mục 2)
function parsePaging(query) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const size = query.size === undefined ? 20 : Number(query.size);
  const fields = {};
  if (!isPositiveInt(page)) fields.page = 'Phải là số nguyên từ 1';
  if (!isPositiveInt(size) || size > 100) fields.size = 'Phải là số nguyên từ 1 đến 100';
  failIfAny(fields);
  return { page, size, limit: size, offset: (page - 1) * size };
}

module.exports = { isString, isBlank, isPositiveInt, EMAIL, failIfAny, parseId, parsePaging };
