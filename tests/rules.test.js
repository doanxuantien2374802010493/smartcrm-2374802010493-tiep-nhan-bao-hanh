const rules = require('../src/services/rules');

describe('QT-04 hạn cam kết (T2-T7, giờ VN)', () => {
  const monday9am = new Date('2026-10-19T02:00:00Z');
  test('CAO 24h, TRUNG_BINH 72h, THAP 120h khi không vướng Chủ nhật', () => {
    expect(rules.calculateDueDate('CAO', monday9am).toISOString()).toBe('2026-10-20T02:00:00.000Z');
    expect(rules.calculateDueDate('TRUNG_BINH', monday9am).toISOString()).toBe('2026-10-22T02:00:00.000Z');
    expect(rules.calculateDueDate('THAP', monday9am).toISOString()).toBe('2026-10-24T02:00:00.000Z');
  });
  test('Bỏ Chủ nhật: thứ Bảy 09:00 + 24h -> thứ Hai 09:00', () => {
    expect(rules.calculateDueDate('CAO', new Date('2026-10-24T02:00:00Z')).toISOString()).toBe('2026-10-26T02:00:00.000Z');
  });
  test('Mức ưu tiên lạ bị từ chối bằng lỗi nghiệp vụ', () => {
    expect(() => rules.calculateDueDate('SIEU_GAP')).toThrow(expect.objectContaining({ code: 'INVALID_PRIORITY' }));
  });
});

describe('QT-05 bảo hành', () => {
  test('addMonths lùi về cuối tháng khi ngày không tồn tại', () => {
    expect(rules.addMonths('2025-01-31', 1)).toBe('2025-02-28');
    expect(rules.addMonths('2025-11-15', 3)).toBe('2026-02-15');
  });
  test('thiếu ngày mua -> chưa xác minh, không tự quyết định', () => {
    expect(rules.checkWarranty(null, 12, new Date())).toEqual({ isWarranty: false, warrantyVerified: false });
  });
});

describe('QT-01, QT-02, QT-15 và mã phiếu', () => {
  test('chuẩn hóa +84, 84 và ký tự phân cách về 10 chữ số', () => {
    expect(rules.normalizePhone('+84 901 234 567')).toBe('0901234567');
    expect(rules.normalizePhone('84901234567')).toBe('0901234567');
    expect(rules.normalizePhone('090.123.4567')).toBe('0901234567');
    expect(rules.isValidPhone('123')).toBe(false);
  });
  test('che 4 chữ số giữa', () => expect(rules.maskPhone('0901234567')).toBe('090****567'));
  test('mã phiếu dạng BH-000123/2026', () => expect(rules.buildTicketCode(123, 2026)).toBe('BH-000123/2026'));
});

describe('FR5 đề xuất nhóm sự cố', () => {
  test.each([
    ['Màn hình bị sọc ngang', 'MAN_HINH'],
    ['Máy sạc không vào, cáp sạc báo lỗi', 'SAC'],
    ['Pin tụt nhanh', 'PIN'],
    ['Rơi xuống nước, ẩm ướt', 'NUOC_VAO'],
    ['Máy hay treo khi cập nhật phần mềm', 'PHAN_MEM'],
    ['Loa rè khi nghe nhạc', 'KHAC'],
  ])('"%s" -> %s', (text, expected) => expect(rules.suggestCategoryName(text)).toBe(expected));
});
