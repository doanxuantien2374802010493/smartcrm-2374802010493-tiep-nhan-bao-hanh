const { AppError } = require('../errors/AppError');
const { normalizePhone, isValidPhone, maskPhone } = require('./rules');
const { ROLE } = require('./roles');

class CustomerService {
  constructor(customerRepo, deviceRepo) {
    this.customerRepo = customerRepo;
    this.deviceRepo = deviceRepo;
  }

  // QT-15: mọi vai trò trừ Quản lý chỉ thấy SĐT đã che
  present(user, c) {
    return { ...c, phone: user.role === ROLE.MANAGER ? c.phone : maskPhone(c.phone) };
  }

  // QT-01 + QT-02: chuẩn hóa rồi kiểm tra đủ 10 chữ số
  cleanPhone(raw) {
    const phone = normalizePhone(raw);
    if (!isValidPhone(phone)) {
      throw new AppError('VALIDATION_FAILED', 'Dữ liệu không hợp lệ', { phone: 'Số điện thoại phải đủ 10 chữ số, bắt đầu bằng 0' });
    }
    return phone;
  }

  async getActive(id) {
    const c = await this.customerRepo.findById(id);
    if (!c || c.isDeleted) throw new AppError('CUSTOMER_NOT_FOUND', 'Không tìm thấy khách hàng');
    return c;
  }

  // US1 + FR8: tra cứu theo SĐT, trả khách + danh sách thiết bị; tên không khớp thì kèm cảnh báo
  async lookupByPhone(user, rawPhone, name) {
    const phone = this.cleanPhone(rawPhone);
    const c = await this.customerRepo.findByPhone(phone);
    if (!c || c.isDeleted) throw new AppError('CUSTOMER_NOT_FOUND', 'Chưa có khách hàng với số điện thoại này');
    const devices = await this.deviceRepo.findByCustomer(c.customerId);
    const nameMatches = !name || name.trim().toLowerCase() === c.fullName.trim().toLowerCase();
    return {
      customer: this.present(user, c),
      devices,
      warning: nameMatches ? null : `Số điện thoại này thuộc khách hàng "${c.fullName}", khác với tên vừa nhập`,
    };
  }

  async getCustomer(user, id) {
    return this.present(user, await this.getActive(id));
  }

  async createCustomer(user, input) {
    const phone = this.cleanPhone(input.phone);
    const existing = await this.customerRepo.findByPhone(phone);
    if (existing) {
      throw new AppError('PHONE_EXISTS', 'Số điện thoại này đã có khách hàng', { existing_customer: this.present(user, existing) });
    }
    return this.present(user, await this.customerRepo.createCustomer({ ...input, phone }));
  }

  async updateCustomer(user, id, patch) {
    await this.getActive(id);
    const next = { ...patch };
    if (patch.phone !== undefined) {
      next.phone = this.cleanPhone(patch.phone);
      const other = await this.customerRepo.findByPhone(next.phone);
      if (other && other.customerId !== id) {
        throw new AppError('PHONE_EXISTS', 'Số điện thoại này đã có khách hàng khác', { existing_customer: this.present(user, other) });
      }
    }
    return this.present(user, await this.customerRepo.updateCustomer(id, next));
  }

  // QT-13: xóa mềm, giữ nguyên lịch sử
  async softDeleteCustomer(user, id) {
    await this.getActive(id);
    return this.present(user, await this.customerRepo.softDelete(id));
  }
}

module.exports = CustomerService;
