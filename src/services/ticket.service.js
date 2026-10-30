// Lớp nghiệp vụ: QT-03, QT-04, QT-05, QT-06, QT-13, QT-14, QT-15 + FR5.
// Không phụ thuộc HTTP: nhận và trả dữ liệu thuần; repository được tiêm vào (để test bằng bản giả).
const { AppError } = require('../errors/AppError');
const rules = require('./rules');
const { ROLE } = require('./roles');

class TicketService {
  constructor(ticketRepo, customerRepo, deviceRepo, categoryRepo, now = () => new Date()) {
    this.ticketRepo = ticketRepo;
    this.customerRepo = customerRepo;
    this.deviceRepo = deviceRepo;
    this.categoryRepo = categoryRepo;
    this.now = now;
  }

  // Giữ tên hàm cũ để dùng lại trong test: QT-05 và QT-04
  checkWarranty(purchaseDate, warrantyMonths, now) { return rules.checkWarranty(purchaseDate, warrantyMonths, now); }
  calculateDueDate(priority, receivedAt) { return rules.calculateDueDate(priority, receivedAt); }

  // QT-15
  present(user, t) {
    return user.role === ROLE.MANAGER ? t : { ...t, customerPhone: rules.maskPhone(t.customerPhone) };
  }

  requireManager(user) {
    if (user.role !== ROLE.MANAGER) throw new AppError('FORBIDDEN', 'Chỉ Quản lý trung tâm được thực hiện thao tác này');
  }

  // QT-14: chỉ thao tác trên phiếu của trung tâm mình
  async getOwnTicket(user, id) {
    const t = await this.ticketRepo.findById(id);
    if (!t || t.isDeleted) throw new AppError('TICKET_NOT_FOUND', 'Không tìm thấy phiếu bảo hành');
    if (t.centerId !== user.centerId) throw new AppError('FORBIDDEN', 'Phiếu này thuộc trung tâm khác, bạn không có quyền truy cập');
    return t;
  }

  // UC2: tạo phiếu bảo hành mới (FR3-FR6)
  async createTicket(user, input) {
    const customer = await this.customerRepo.findById(input.customerId);
    if (!customer || customer.isDeleted) throw new AppError('CUSTOMER_NOT_FOUND', 'Không tìm thấy khách hàng');

    const device = await this.deviceRepo.findById(input.deviceId);
    if (!device || device.isDeleted) throw new AppError('DEVICE_NOT_FOUND', 'Không tìm thấy thiết bị');

    // QT-03: thiết bị phải thuộc về khách hàng
    if (device.customerId !== customer.customerId) {
      throw new AppError('VALIDATION_FAILED', 'Dữ liệu không hợp lệ', { device_id: 'Thiết bị không thuộc về khách hàng này' });
    }

    // FR5: đề xuất nhóm sự cố và mức ưu tiên theo mô tả lỗi
    const category = await this.categoryRepo.findByName(rules.suggestCategoryName(input.issueDesc));
    const priority = (category && category.defaultPriority) || 'TRUNG_BINH';

    const receivedAt = this.now();
    // QT-05: ngày mua từ hồ sơ thiết bị, rỗng thì dùng ngày nhân viên nhập
    const warranty = this.checkWarranty(device.purchaseDate || input.providedPurchaseDate, device.warrantyMonths, receivedAt);
    // QT-04
    const dueDate = this.calculateDueDate(priority, receivedAt);

    const ticketId = await this.ticketRepo.nextId();
    const ticket = await this.ticketRepo.createWithLog({
      ticketId,
      ticketCode: rules.buildTicketCode(ticketId, receivedAt.getUTCFullYear()),
      deviceId: device.deviceId,
      categoryId: category ? category.categoryId : null,
      centerId: user.centerId, // QT-14: lấy từ token, client không gửi
      issueDesc: input.issueDesc,
      priority,
      providedPurchaseDate: input.providedPurchaseDate,
      isWarranty: warranty.isWarranty,
      warrantyVerified: warranty.warrantyVerified,
      receivedAt,
      dueDate,
    }, user.employeeId); // QT-06: dòng log đầu tiên ghi cùng transaction
    return {
      ...this.present(user, ticket),
      ...(warranty.warrantyVerified ? {} : { message: 'Không xác định được ngày mua, cần Quản lý phê duyệt' }),
    };
  }

  async getTicket(user, id) {
    return this.present(user, await this.getOwnTicket(user, id));
  }

  // GET /api/tickets: phiếu của trung tâm mình; onlyUnverified (chờ xác minh) chỉ Quản lý được xem
  async listTickets(user, { onlyUnverified, limit, offset }) {
    if (onlyUnverified) this.requireManager(user);
    const { rows, total } = await this.ticketRepo.list({ centerId: user.centerId, onlyUnverified, limit, offset });
    return { rows: rows.map((t) => this.present(user, t)), total };
  }

  // Chỉ sửa khi phiếu còn MOI; đổi mức ưu tiên thì tính lại hạn cam kết (QT-04)
  async updateTicket(user, id, patch) {
    const t = await this.getOwnTicket(user, id);
    if (t.status !== 'MOI') {
      throw new AppError('TICKET_NOT_EDITABLE', `Phiếu đang ở trạng thái ${t.status}, chỉ sửa được khi còn MOI`);
    }
    const next = { ...patch };
    if (patch.categoryId) {
      const c = await this.categoryRepo.findById(patch.categoryId);
      if (!c || !c.isActive) throw new AppError('CATEGORY_NOT_FOUND', 'Không tìm thấy nhóm sự cố đang dùng');
    }
    if (patch.priority && patch.priority !== t.priority) next.dueDate = this.calculateDueDate(patch.priority, t.receivedAt);
    return this.present(user, await this.ticketRepo.update(id, next));
  }

  // QT-05 / luồng 5a: Quản lý duyệt phiếu chưa xác minh; duyệt rồi thì 409
  async approveWarranty(user, id, { isWarranty }) {
    this.requireManager(user);
    const t = await this.getOwnTicket(user, id);
    if (t.warrantyVerified) {
      throw new AppError('WARRANTY_ALREADY_VERIFIED', 'Phiếu này đã được xác minh bảo hành, không duyệt lại được');
    }
    return this.present(user, await this.ticketRepo.approveWarranty(id, isWarranty));
  }

  // QT-13: xóa mềm, chỉ Quản lý
  async softDeleteTicket(user, id) {
    this.requireManager(user);
    await this.getOwnTicket(user, id);
    await this.ticketRepo.softDelete(id);
    return { ticket_id: id, is_deleted: true };
  }

  // US7: lịch sử trạng thái, chỉ Quản lý của trung tâm có phiếu
  async getStatusLog(user, id, paging) {
    this.requireManager(user);
    await this.getOwnTicket(user, id);
    return this.ticketRepo.findStatusLog(id, paging);
  }

  async listCategories() { return this.categoryRepo.findAllActive(); }
}

module.exports = TicketService;
