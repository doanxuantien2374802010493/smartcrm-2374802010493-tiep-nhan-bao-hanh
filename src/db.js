const { Pool, types } = require('pg');

// BIGINT -> number; DATE -> chuỗi 'YYYY-MM-DD'; TIMESTAMP (lưu UTC) -> Date
types.setTypeParser(20, (v) => Number(v));
types.setTypeParser(1082, (v) => v);
types.setTypeParser(1114, (v) => new Date(`${v.replace(' ', 'T')}Z`));

function createPool(dbConfig) {
  // timezone=UTC để TIMESTAMP không lệch theo múi giờ máy chủ
  return new Pool({ ...dbConfig, options: '-c timezone=UTC' });
}

module.exports = { createPool };
