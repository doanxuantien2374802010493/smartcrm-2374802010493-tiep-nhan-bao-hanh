// Repository GIẢ (trong bộ nhớ): test tự dựng dữ liệu, không cần CSDL, không phụ thuộc dữ liệu trên máy.
const TicketService = require('../src/services/ticket.service');

const MANAGER = { employeeId: 2, role: 'QUAN_LY', centerId: 1, fullName: 'QL' };
const STAFF = { employeeId: 1, role: 'NHAN_VIEN_TIEP_NHAN', centerId: 1, fullName: 'NV' };
// Thứ Hai 19/10/2026 09:00 giờ VN
const MONDAY_9AM = new Date('2026-10-19T02:00:00Z');

function makeRepos({ devices, customers, categories } = {}) {
  const data = {
    customers: customers || [{ customerId: 1, fullName: 'Nguyễn Văn An', phone: '0901234567', isDeleted: false }],
    devices: devices || [
      { deviceId: 1, customerId: 1, deviceName: 'iPhone 13', serialNo: 'SN1', purchaseDate: '2026-03-01', warrantyMonths: 12, isDeleted: false },
      { deviceId: 2, customerId: 1, deviceName: 'Galaxy', serialNo: 'SN2', purchaseDate: null, warrantyMonths: 12, isDeleted: false },
      { deviceId: 3, customerId: 2, deviceName: 'Máy khách khác', serialNo: 'SN3', purchaseDate: '2026-03-01', warrantyMonths: 12, isDeleted: false },
    ],
    categories: categories || [
      { categoryId: 1, categoryName: 'MAN_HINH', defaultPriority: 'CAO', isActive: true },
      { categoryId: 3, categoryName: 'SAC', defaultPriority: 'TRUNG_BINH', isActive: true },
      { categoryId: 6, categoryName: 'KHAC', defaultPriority: 'THAP', isActive: true },
    ],
    tickets: [],
    logs: [],
    nextId: 100,
  };
  const customerRepo = { findById: async (id) => data.customers.find((c) => c.customerId === id) };
  const deviceRepo = { findById: async (id) => data.devices.find((d) => d.deviceId === id) };
  const categoryRepo = {
    findById: async (id) => data.categories.find((c) => c.categoryId === id),
    findByName: async (n) => data.categories.find((c) => c.categoryName === n),
    findAllActive: async () => data.categories,
  };
  const ticketRepo = {
    nextId: async () => data.nextId++,
    createWithLog: async (t, changedBy) => {
      const saved = { ...t, status: 'MOI', isDeleted: false, customerName: 'Nguyễn Văn An', customerPhone: '0901234567' };
      data.tickets.push(saved);
      data.logs.push({ ticketId: t.ticketId, fromStatus: null, toStatus: 'MOI', changedBy });
      return saved;
    },
    findById: async (id) => data.tickets.find((t) => t.ticketId === id),
    list: async ({ centerId }) => ({ rows: data.tickets.filter((t) => t.centerId === centerId && !t.isDeleted), total: 0 }),
    update: async (id, patch) => Object.assign(data.tickets.find((t) => t.ticketId === id), patch),
    approveWarranty: async (id, w) => Object.assign(data.tickets.find((t) => t.ticketId === id), { warrantyVerified: true, isWarranty: w }),
    softDelete: async (id) => { data.tickets.find((t) => t.ticketId === id).isDeleted = true; },
    findStatusLog: async (id) => ({ rows: data.logs.filter((l) => l.ticketId === id), total: 1 }),
  };
  return { data, customerRepo, deviceRepo, categoryRepo, ticketRepo };
}

function makeService(opts, now = MONDAY_9AM) {
  const r = makeRepos(opts);
  const service = new TicketService(r.ticketRepo, r.customerRepo, r.deviceRepo, r.categoryRepo, () => now);
  return { ...r, service };
}

const input = (over = {}) => ({ customerId: 1, deviceId: 1, issueDesc: 'Màn hình bị sọc ngang, cảm ứng kém', providedPurchaseDate: null, ...over });

module.exports = { makeService, input, MANAGER, STAFF, MONDAY_9AM };
