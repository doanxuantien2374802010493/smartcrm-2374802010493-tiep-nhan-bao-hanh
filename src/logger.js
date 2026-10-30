// Log có cấu trúc, mỗi dòng một sự kiện JSON ra stdout: thời điểm + mức + mô tả + ngữ cảnh (requestId, id đối tượng).
// KHÔNG ghi SĐT, mật khẩu, token hay thân request (QT-15). Mức đọc từ biến LOG_LEVEL (mặc định info).
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

function write(level, msg, ctx = {}) {
  if (LEVELS[level] < (LEVELS[process.env.LOG_LEVEL] || LEVELS.info)) return;
  const { err, ...rest } = ctx;
  const line = { time: new Date().toISOString(), level, msg, ...rest };
  if (err) line.err = { name: err.name, message: err.message, stack: err.stack };
  process.stdout.write(`${JSON.stringify(line)}\n`);
}

module.exports = {
  debug: (m, c) => write('debug', m, c),
  info: (m, c) => write('info', m, c),
  warn: (m, c) => write('warn', m, c),
  error: (m, c) => write('error', m, c),
};
