// Đổi dữ liệu từ lớp nghiệp vụ (camelCase) sang JSON của API contract: snake_case, thời gian ISO 8601 +07:00.
const VN_OFFSET_MS = 7 * 3600 * 1000;

function formatVn(date) {
  return `${new Date(date.getTime() + VN_OFFSET_MS).toISOString().slice(0, 19)}+07:00`;
}

function toApi(v) {
  if (v instanceof Date) return formatVn(v);
  if (Array.isArray(v)) return v.map(toApi);
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).map(([k, val]) => [k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`), toApi(val)]));
  }
  return v;
}

module.exports = { toApi, formatVn };
