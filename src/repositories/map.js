// Đổi tên cột snake_case của CSDL sang camelCase cho lớp nghiệp vụ.
function camel(row) {
  if (!row) return undefined;
  const out = {};
  for (const [k, v] of Object.entries(row)) out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v;
  return out;
}
module.exports = { camel };
