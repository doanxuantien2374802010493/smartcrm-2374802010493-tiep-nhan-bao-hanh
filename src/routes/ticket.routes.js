const express = require('express');
const { validateCreateTicket } = require('../validators/ticket.validator');

const HTTP_BY_CODE = {
  DU_LIEU_KHONG_HOP_LE: 400,
  THIET_BI_KHONG_TON_TAI: 404,
  PHIEU_DANG_MO: 409,
  UU_TIEN_KHONG_HOP_LE: 400
};

module.exports = function ticketRoutes(ticketService) {
  const router = express.Router();

  // 1. Bổ sung endpoint GET để lấy danh sách vé bảo hành (Phục vụ chụp ảnh Mức 7)
  router.get('/tickets', async (req, res, next) => {
    try {
      // Giả sử service của bạn có hàm getAllTickets hoặc dùng trực tiếp repository
      const tickets = ticketService.getAllTickets ? await ticketService.getAllTickets() : [];
      res.status(200).json({ success: true, data: tickets });
    } catch (e) {
      next(e);
    }
  });

  // 2. Endpoint POST tạo vé bảo hành hiện tại của bạn
  router.post('/tickets', async (req, res, next) => {
    try {
      const input = validateCreateTicket(req.body);
      const ticket = await ticketService.createTicket(input);
      res.status(201).json({ data: ticket });
    } catch (e) {
      if (e.code && HTTP_BY_CODE[e.code]) {
        return res.status(HTTP_BY_CODE[e.code]).json({
          error: e.code,
          message: e.message,
          chi_tiet: e.chiTiet
        });
      }
      next(e);
    }
  });

  return router;
};