// Chạy migrations/*.sql rồi seeds/*.sql theo thứ tự tên tệp. Mọi tệp SQL đều chạy lại được (idempotent).
// Cách dùng: npm run db:setup
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const config = require('../src/config');

async function chay(pool, thuMuc) {
  const dir = path.join(__dirname, '..', thuMuc);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    await pool.query(fs.readFileSync(path.join(dir, f), 'utf8'));
    console.log(`đã chạy ${thuMuc}/${f}`);
  }
}

async function main() {
  const pool = new Pool(config.db);
  try {
    await chay(pool, 'migrations');
    await chay(pool, 'seeds');
  } finally {
    await pool.end();
  }
}

main().catch((e) => { console.error('db:setup lỗi:', e.message); process.exit(1); });
