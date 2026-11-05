const request = require('supertest');
const jwt = require('jsonwebtoken');
const config = require('../../src/config');
const { createPool } = require('../../src/db');
const { createApp } = require('../../src/app');
const CustomerRepository = require('../../src/repositories/customer.repository');
const DeviceRepository = require('../../src/repositories/device.repository');
const CategoryRepository = require('../../src/repositories/category.repository');
const EmployeeRepository = require('../../src/repositories/employee.repository');
const TicketRepository = require('../../src/repositories/ticket.repository');
const AuthService = require('../../src/services/auth.service');
const CustomerService = require('../../src/services/customer.service');
const TicketService = require('../../src/services/ticket.service');

const pool = createPool(config.db);

// Chot an toan: chi chay tren CSDL co chu "test" trong ten
const dbName = String(pool.options.database || '');
if (!/test/i.test(dbName)) {
  throw new Error(`Tu choi chay: CSDL "${dbName}" khong phai CSDL test. Dat $env:DB_NAME="smartcrm_test".`);
}

function buildTestApp() {
  const secret = config.jwtSecret;
  const services = {
    authService: new AuthService(
      new EmployeeRepository(pool),
      (user) => jwt.sign(user, secret, { expiresIn: config.jwtExpiresIn })
    ),
    customerService: new CustomerService(new CustomerRepository(pool), new DeviceRepository(pool)),
    ticketService: new TicketService(
      new TicketRepository(pool),
      new CustomerRepository(pool),
      new DeviceRepository(pool),
      new CategoryRepository(pool)
    ),
  };
  return createApp({ services, jwtSecret: secret });
}

async function count(table) {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM ${table}`);
  return rows[0].n;
}

async function login(app, username, password = 'Mekong@123') {
  const res = await request(app).post('/api/auth/login').send({ username, password }); // ADJUST: ten truong
  const token = res.body.token || (res.body.data && res.body.data.token) || res.body.access_token;
  if (res.status !== 200 || !token) {
    throw new Error(`Dang nhap ${username} that bai: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return token;
}

const auth = (token) => ({ Authorization: `Bearer ${token}` });
const closePool = () => pool.end();

module.exports = { pool, count, buildTestApp, login, auth, closePool };
