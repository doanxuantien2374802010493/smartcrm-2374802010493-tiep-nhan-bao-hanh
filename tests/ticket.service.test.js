const { makeService, input, MANAGER, STAFF } = require('./helpers');
const { validateCreateTicket } = require('../src/validators/ticket.validator');
const TicketService = require('../src/services/ticket.service');

describe('TicketService - 3 loại kiểm thử bắt buộc của BT2', () => {
  // TC01 - LUỒNG ĐÚNG
  test('TC01 - Luồng đúng: thiết bị còn bảo hành thì tạo được phiếu, có mã, hạn cam kết và dòng log đầu tiên', async () => {
    const { service, data } = makeService();
    const t = await service.createTicket(STAFF, input());
    expect(t.ticketCode).toBe('BH-000100/2026');
    expect(t.isWarranty).toBe(true);
    expect(t.warrantyVerified).toBe(true);
    expect(t.priority).toBe('CAO'); // FR5: "màn hình" -> MAN_HINH -> CAO
    expect(t.dueDate.toISOString()).toBe('2026-10-20T02:00:00.000Z'); // QT-04: +24h
    expect(data.logs).toEqual([{ ticketId: 100, fromStatus: null, toStatus: 'MOI', changedBy: STAFF.employeeId }]); // QT-06
  });

  // TC02 - GIÁ TRỊ BIÊN
  test('TC02 - Giá trị biên (QT-05): ngày cuối cùng còn bảo hành vs ngày đầu tiên hết hạn', () => {
    const svc = new TicketService({}, {}, {}, {});
    expect(svc.checkWarranty('2025-10-19', 12, new Date('2026-10-19T03:00:00Z')).isWarranty).toBe(true); // ngày cuối
    expect(svc.checkWarranty('2025-10-19', 12, new Date('2026-10-20T03:00:00Z')).isWarranty).toBe(false); // ngày đầu hết hạn
  });

  // TC03 - DỮ LIỆU SAI
  test('TC03 - Dữ liệu sai: thiếu issue_desc bị từ chối, nêu đúng tên trường', () => {
    expect.assertions(2);
    try {
      validateCreateTicket({ customer_id: 1, device_id: 1, issue_desc: '' });
    } catch (e) {
      expect(e.code).toBe('VALIDATION_FAILED');
      expect(e.chiTiet).toHaveProperty('issue_desc');
    }
  });
});

describe('TicketService - quy tắc nghiệp vụ khác', () => {
  test('QT-03: thiết bị không thuộc khách hàng thì bị từ chối và không tạo phiếu', async () => {
    const { service, data } = makeService();
    await expect(service.createTicket(STAFF, input({ deviceId: 3 }))).rejects.toMatchObject({
      code: 'VALIDATION_FAILED', chiTiet: { device_id: 'Thiết bị không thuộc về khách hàng này' },
    });
    expect(data.tickets).toHaveLength(0);
  });

  test('QT-05 luồng 5a: thiết bị thiếu ngày mua -> warranty_verified = false, chờ Quản lý duyệt', async () => {
    const { service } = makeService();
    const t = await service.createTicket(STAFF, input({ deviceId: 2 }));
    expect(t.warrantyVerified).toBe(false);
    expect(t.isWarranty).toBe(false);
    expect(t.message).toMatch(/Quản lý phê duyệt/);
  });

  test('QT-05: thiếu ngày mua ở hồ sơ nhưng nhân viên nhập tay thì dùng ngày nhập tay', async () => {
    const { service } = makeService();
    const t = await service.createTicket(STAFF, input({ deviceId: 2, providedPurchaseDate: '2026-05-01' }));
    expect(t.warrantyVerified).toBe(true);
    expect(t.isWarranty).toBe(true);
  });

  test('QT-15: nhân viên thấy SĐT đã che, Quản lý thấy đầy đủ', async () => {
    const { service } = makeService();
    const t = await service.createTicket(MANAGER, input());
    expect((await service.getTicket(STAFF, t.ticketId)).customerPhone).toBe('090****567');
    expect((await service.getTicket(MANAGER, t.ticketId)).customerPhone).toBe('0901234567');
  });

  test('QT-14: nhân viên trung tâm khác không xem được phiếu (FORBIDDEN)', async () => {
    const { service } = makeService();
    const t = await service.createTicket(STAFF, input());
    await expect(service.getTicket({ ...STAFF, centerId: 2 }, t.ticketId)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  test('Phê duyệt bảo hành: chỉ Quản lý, và chỉ một lần (409)', async () => {
    const { service } = makeService();
    const t = await service.createTicket(STAFF, input({ deviceId: 2 }));
    await expect(service.approveWarranty(STAFF, t.ticketId, { isWarranty: true })).rejects.toMatchObject({ code: 'FORBIDDEN' });
    const ok = await service.approveWarranty(MANAGER, t.ticketId, { isWarranty: true });
    expect(ok.warrantyVerified).toBe(true);
    await expect(service.approveWarranty(MANAGER, t.ticketId, { isWarranty: true })).rejects.toMatchObject({ code: 'WARRANTY_ALREADY_VERIFIED' });
  });

  test('QT-13: xóa mềm chỉ đặt cờ is_deleted, phiếu vẫn còn dữ liệu', async () => {
    const { service, data } = makeService();
    const t = await service.createTicket(MANAGER, input());
    await service.softDeleteTicket(MANAGER, t.ticketId);
    expect(data.tickets).toHaveLength(1);
    expect(data.tickets[0].isDeleted).toBe(true);
    await expect(service.getTicket(MANAGER, t.ticketId)).rejects.toMatchObject({ code: 'TICKET_NOT_FOUND' });
  });

  test('QT-04: đổi mức ưu tiên thì tính lại hạn cam kết từ lúc tiếp nhận', async () => {
    const { service } = makeService();
    const t = await service.createTicket(STAFF, input());
    const sua = await service.updateTicket(STAFF, t.ticketId, { priority: 'THAP' });
    expect(sua.dueDate.toISOString()).toBe('2026-10-24T02:00:00.000Z'); // +120h
  });

  test('Chỉ sửa được phiếu khi còn trạng thái MOI', async () => {
    const { service, data } = makeService();
    const t = await service.createTicket(STAFF, input());
    data.tickets[0].status = 'DANG_XU_LY';
    await expect(service.updateTicket(STAFF, t.ticketId, { priority: 'THAP' })).rejects.toMatchObject({ code: 'TICKET_NOT_EDITABLE' });
  });
});
