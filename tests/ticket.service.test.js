const TicketService = require('../src/services/ticket.service');

const fakeDeviceRepo = {
  findById: async (id) => (id === 1 ? { device_id: 1, purchase_date: '2026-01-01', warranty_months: 12 } : null)
};

function makeFakeTicketRepo(openTicket = null) {
  return {
    findOpenTicketByDevice: async () => openTicket,
    nextTicketCode: async () => 'BH-1-00001/2026',
    createTicket: async (data) => ({ ticket_id: 100, ...data })
  };
}

describe('TicketService Core Rules', () => {
  // TC01: Luồng đúng
  test('TC01 - Luồng đúng: Tạo phiếu bảo hành thành công cho thiết bị còn hạn', async () => {
    const svc = new TicketService(makeFakeTicketRepo(), fakeDeviceRepo);
    const result = await svc.createTicket({
      deviceId: 1, centerId: 1, issueDesc: 'Sọc màn hình', priority: 'CAO'
    });
    expect(result.isWarranty).toBe(true);
    expect(result.warrantyVerified).toBe(true);
    expect(result.ticketCode).toBe('BH-1-00001/2026');
  });

  // TC02: Giá trị biên
  test('TC02 - Giá trị biên (QT-05): Ngày cuối cùng còn bảo hành vs ngày đầu tiên hết hạn', () => {
    const svc = new TicketService({}, {});
    const nowBoundaryPass = new Date('2027-01-01T00:00:00Z');
    const nowBoundaryFail = new Date('2027-01-02T00:00:00Z');

    expect(svc.checkWarranty('2026-01-01', 12, nowBoundaryPass).isWarranty).toBe(true);
    expect(svc.checkWarranty('2026-01-01', 12, nowBoundaryFail).isWarranty).toBe(false);
  });

  // TC03: Dữ liệu sai / Từ chối nghiệp vụ
  test('TC03 - Dữ liệu sai (QT-09): Thiết bị đã có phiếu đang mở thì bị từ chối với mã PHIEU_DANG_MO', async () => {
    const svc = new TicketService(
      makeFakeTicketRepo({ ticket_code: 'BH-1-00001/2026', status: 'MOI' }),
      fakeDeviceRepo
    );
    await expect(svc.createTicket({
      deviceId: 1, centerId: 1, issueDesc: 'Hỏng pin', priority: 'TRUNG_BINH'
    })).rejects.toMatchObject({ code: 'PHIEU_DANG_MO' });
  });
});