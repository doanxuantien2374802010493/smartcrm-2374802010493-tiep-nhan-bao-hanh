// Điểm khởi động: nối CSDL thật -> repositories -> services -> routes rồi lắng nghe cổng.
const jwt = require('jsonwebtoken');
const config = require('./config');
const logger = require('./logger');
const { createPool } = require('./db');
const { createApp } = require('./app');
const CustomerRepository = require('./repositories/customer.repository');
const DeviceRepository = require('./repositories/device.repository');
const CategoryRepository = require('./repositories/category.repository');
const EmployeeRepository = require('./repositories/employee.repository');
const TicketRepository = require('./repositories/ticket.repository');
const AuthService = require('./services/auth.service');
const CustomerService = require('./services/customer.service');
const TicketService = require('./services/ticket.service');

const pool = createPool(config.db);
const customerRepo = new CustomerRepository(pool);
const deviceRepo = new DeviceRepository(pool);
const categoryRepo = new CategoryRepository(pool);
const employeeRepo = new EmployeeRepository(pool);
const ticketRepo = new TicketRepository(pool);

const secret = config.jwtSecret;
const services = {
  authService: new AuthService(employeeRepo, (user) => jwt.sign(user, secret, { expiresIn: config.jwtExpiresIn })),
  customerService: new CustomerService(customerRepo, deviceRepo),
  ticketService: new TicketService(ticketRepo, customerRepo, deviceRepo, categoryRepo),
};

createApp({ services, jwtSecret: secret }).listen(config.port, () => {
  logger.info(`SmartCRM API đang chạy tại http://localhost:${config.port}`);
});
