// Lắp ráp ứng dụng Express từ các service đã tạo sẵn (không tự kết nối CSDL -> test được bằng service giả).
const express = require('express');
const cors = require('cors');
const requestId = require('./middleware/request-id');
const requireAuth = require('./middleware/auth');
const errorHandler = require('./middleware/error-handler');
const authRoutes = require('./routes/auth.routes');
const customerRoutes = require('./routes/customer.routes');
const ticketRoutes = require('./routes/ticket.routes');
const { toApi } = require('./routes/presenter');

function createApp({ services, jwtSecret }) {
  const app = express();
  app.use(requestId);
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', authRoutes(services.authService));

  const auth = requireAuth(jwtSecret);
  app.use('/api/customers', auth, customerRoutes(services.customerService));
  app.use('/api/tickets', auth, ticketRoutes(services.ticketService));
  app.get('/api/issue-categories', auth, async (req, res, next) => {
    try { res.json(toApi({ data: await services.ticketService.listCategories() })); } catch (e) { next(e); }
  });

  app.use('/api', (req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Đường dẫn API không tồn tại' } }));
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
