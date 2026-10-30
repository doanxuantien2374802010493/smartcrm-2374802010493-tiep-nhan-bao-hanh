// Quy tắc nghiệp vụ THUẦN (không biết HTTP, không biết CSDL). Mỗi quy tắc là MỘT hàm riêng, ghi mã QT-xx.
const { AppError } = require('../errors/AppError');

const VN_OFFSET_MS = 7 * 3600 * 1000; // múi giờ Việt Nam UTC+7
const SLA_HOURS = { CAO: 24, TRUNG_BINH: 72, THAP: 120 }; // QT-04

// QT-01: chuẩn hóa SĐT về 10 chữ số bắt đầu bằng 0 (nhận +84..., 84..., có khoảng trắng/chấm/gạch)
function normalizePhone(raw) {
  let s = String(raw ?? '').trim().replace(/[\s.\-()]/g, '');
  if (s.startsWith('+84')) s = `0${s.slice(3)}`;
  else if (/^84\d{9}$/.test(s)) s = `0${s.slice(2)}`;
  return s;
}

// QT-02: SĐT hợp lệ = đúng 10 chữ số, bắt đầu bằng 0
function isValidPhone(phone) {
  return /^0\d{9}$/.test(phone);
}

// QT-15 / NFR2: che 4 chữ số giữa (090****567)
function maskPhone(phone) {
  if (!phone || phone.length < 10) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
}

const isSunday = (ms) => new Date(ms + VN_OFFSET_MS).getUTCDay() === 0;

// QT-04: hạn cam kết = lúc tiếp nhận + số giờ theo mức ưu tiên, chỉ tính giờ thuộc T2–T7 (bỏ Chủ nhật, giờ VN)
function calculateDueDate(priority, receivedAt = new Date()) {
  const hours = SLA_HOURS[priority];
  if (!hours) throw new AppError('INVALID_PRIORITY', `Mức ưu tiên không hợp lệ: ${priority}`);
  let t = receivedAt.getTime();
  let left = hours;
  while (left > 0) {
    if (!isSunday(t)) left -= 1;
    t += 3600 * 1000;
  }
  return new Date(t);
}

function toVnDate(date) {
  return new Date(date.getTime() + VN_OFFSET_MS).toISOString().slice(0, 10);
}

// Cộng n tháng vào ngày 'YYYY-MM-DD'; ngày không tồn tại ở tháng đích thì lùi về ngày cuối tháng
function addMonths(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const total = (m - 1) + n;
  const yy = y + Math.floor(total / 12);
  const mm = ((total % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(yy, mm + 1, 0)).getUTCDate();
  const dd = Math.min(d, lastDay);
  return `${yy}-${String(mm + 1).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}

// QT-05: còn bảo hành nếu ngày tiếp nhận <= ngày mua + số tháng bảo hành.
// Ngày mua lấy từ hồ sơ thiết bị; rỗng thì dùng ngày nhân viên nhập (provided_purchase_date).
// Không có ngày nào -> luồng 5a: KHÔNG tự quyết định, warranty_verified = false, chờ Quản lý duyệt.
function checkWarranty(purchaseDate, warrantyMonths = 12, now = new Date()) {
  if (!purchaseDate) return { isWarranty: false, warrantyVerified: false };
  const expiry = addMonths(purchaseDate, warrantyMonths);
  return { isWarranty: toVnDate(now) <= expiry, warrantyVerified: true, expiry };
}

// Mã phiếu dạng BH-000123/2026 (theo API contract)
function buildTicketCode(ticketId, year) {
  return `BH-${String(ticketId).padStart(6, '0')}/${year}`;
}

// FR5: đề xuất nhóm sự cố từ mô tả lỗi bằng từ khóa (bỏ dấu, chữ thường). Không khớp -> KHAC.
const KEYWORDS = [
  ['NUOC_VAO', ['nuoc', 'am uot', 'ngam nuoc', 'roi xuong nuoc']],
  ['MAN_HINH', ['man hinh', 'soc', 'cam ung', 'vo kinh', 'loang', 'diem chet', 'nut man']],
  ['SAC', ['sac', 'cong sac', 'cap sac', 'khong nhan sac']],
  ['PIN', ['pin', 'tut pin', 'phong pin', 'sut pin']],
  ['PHAN_MEM', ['phan mem', 'treo', 'do may', 'cap nhat', 'lag', 'khoi dong lai', 'ung dung']],
];
function stripDiacritics(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}
function suggestCategoryName(issueDesc) {
  const text = stripDiacritics(issueDesc);
  let best = 'KHAC';
  let bestScore = 0;
  for (const [name, words] of KEYWORDS) {
    const score = words.filter((w) => text.includes(w)).length;
    if (score > bestScore) { best = name; bestScore = score; }
  }
  return best;
}

module.exports = {
  normalizePhone, isValidPhone, maskPhone, calculateDueDate, checkWarranty,
  addMonths, buildTicketCode, suggestCategoryName,
};
