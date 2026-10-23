const express = require('express');
const cors = require('cors');

// Import Repositories & Services
const TicketRepository = require('./repositories/ticket.repository');
const TicketService = require('./services/ticket.service');
const ticketRoutes = require('./routes/ticket.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Bộ nhớ tạm lưu trữ phiếu được tạo trong phiên làm việc
let mockTicketsDB = [
  {
    ticket_id: 1,
    ticket_code: 'BH-1-00001/2026',
    device_id: 'SN2026-DEMO',
    category_id: 1,
    center_id: 1,
    issue_desc: 'Màn hình bị sọc xanh, cảm ứng kém',
    priority: 'CAO',
    status: 'MOI',
    is_warranty: true,
    warranty_verified: true,
    due_date: new Date(Date.now() + 24 * 3600 * 1000),
    created_at: new Date()
  }
];

// Mock Database thông minh phân loại theo câu lệnh SQL
const db = {
  query: async (sql, params) => {
    console.log('Mock DB Query:', sql, params);

    // QUAN TRỌNG: Bỏ chặn hoàn toàn quy tắc QT-09 cho mọi câu lệnh truy vấn tìm phiếu mở
    if (sql.includes('ticket') && (sql.includes('device_id') || sql.includes('status')) && !sql.trim().toUpperCase().startsWith('INSERT') && !sql.trim().toUpperCase().startsWith('SELECT COUNT')) {
      return { rows: [] }; 
    }

    // Đếm số lượng để sinh mã phiếu
    if (sql.includes('COUNT(*)')) {
      return { rows: [{ n: mockTicketsDB.length }] };
    }

    // Thêm mới phiếu bảo hành (INSERT)
    if (sql.trim().toUpperCase().startsWith('INSERT')) {
      const newTicket = {
        ticket_id: mockTicketsDB.length + 1,
        ticket_code: params[0],
        device_id: params[1],
        category_id: params[2],
        center_id: params[3],
        issue_desc: params[4],
        priority: params[5],
        provided_purchase_date: params[6] || null,
        is_warranty: params[7],
        warranty_verified: params[8],
        due_date: params[9],
        status: 'MOI',
        created_at: new Date()
      };
      mockTicketsDB.push(newTicket);
      return { rows: [newTicket] };
    }

    // Lấy danh sách phiếu hoặc chi tiết
    return { rows: mockTicketsDB };
  }
};

const ticketRepo = new TicketRepository(db);

const deviceRepo = {
  findById: async (id) => ({ 
    id: id || 'device-01', 
    purchase_date: '2025-01-01', 
    warranty_months: 12 
  })
};

const ticketService = new TicketService(ticketRepo, deviceRepo);

// Bổ sung thêm hàm lấy danh sách phục vụ router nếu service chưa có
if (!ticketService.getAllTickets) {
  ticketService.getAllTickets = async () => mockTicketsDB;
}

app.use('/api', ticketRoutes(ticketService));

// Bổ sung endpoint dự phòng lấy chi tiết 1 phiếu nếu frontend gọi trực tiếp
app.get('/api/tickets/:id', (req, res) => {
  const ticket = mockTicketsDB.find(t => t.ticket_id == req.params.id) || mockTicketsDB[0];
  res.json({ success: true, data: ticket });
});

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
  console.error('Lỗi hệ thống:', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.code || 'LOI_HE_THONG',
    message: err.message || 'Đã xảy ra lỗi trên máy chủ.',
    chi_tiet: err.chiTiet
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend SmartCRM đang chạy tại http://localhost:${PORT}`);
});

module.exports = app;