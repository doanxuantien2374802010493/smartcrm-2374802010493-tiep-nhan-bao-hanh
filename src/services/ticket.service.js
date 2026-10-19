const { AppError } = require('../errors/AppError');

// QT-04: Thời gian SLA tính bằng giờ
const SLA_HOURS = { CAO: 24, TRUNG_BINH: 72, THAP: 120 };

class TicketService {
  constructor(ticketRepo, deviceRepo) {
    this.ticketRepo = ticketRepo;
    this.deviceRepo = deviceRepo;
  }

  // QT-05: Kiểm tra thời hạn bảo hành
  checkWarranty(purchaseDate, warrantyMonths = 12, now = new Date()) {
    if (!purchaseDate) {
      return { isWarranty: false, warrantyVerified: false }; // Luồng 5a: Chờ duyệt
    }
    const expiry = new Date(purchaseDate);
    expiry.setMonth(expiry.getMonth() + warrantyMonths);
    return { isWarranty: now <= expiry, warrantyVerified: true };
  }

  // QT-04: Tính due_date
  calculateDueDate(priority, receivedAt = new Date()) {
    const hours = SLA_HOURS[priority];
    if (!hours) throw new AppError('UU_TIEN_KHONG_HOP_LE', 'Mức ưu tiên không đúng');
    return new Date(receivedAt.getTime() + hours * 3600 * 1000);
  }

  async createTicket(input) {
    // 1. Kiểm tra thiết bị tồn tại
    const device = await this.deviceRepo.findById(input.deviceId);
    if (!device) throw new AppError('THIET_BI_KHONG_TON_TAI', 'Không tìm thấy thiết bị');

    // 2. QT-09: Kiểm tra phiếu trùng đang mở trên thiết bị
    const openTicket = await this.ticketRepo.findOpenTicketByDevice(input.deviceId);
    if (openTicket) {
      throw new AppError('PHIEU_DANG_MO', `Thiết bị đã có phiếu ${openTicket.ticket_code} đang xử lý`);
    }

    // 3. QT-05: Xác định hạn bảo hành
    const purchaseDate = device.purchase_date || input.providedPurchaseDate;
    const { isWarranty, warrantyVerified } = this.checkWarranty(purchaseDate, device.warranty_months);

    // 4. QT-04: Tính deadline SLA
    const dueDate = this.calculateDueDate(input.priority);

    // 5. Sinh mã phiếu & Lưu
    const ticketCode = await this.ticketRepo.nextTicketCode(input.centerId);
    return await this.ticketRepo.createTicket({
      ...input,
      ticketCode,
      isWarranty,
      warrantyVerified,
      dueDate
    });
  }
}

module.exports = TicketService;