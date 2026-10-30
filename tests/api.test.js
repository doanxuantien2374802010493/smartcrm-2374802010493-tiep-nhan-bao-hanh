// Kiểm tra lớp routes bằng service giả: mã HTTP đúng, lỗi rõ ràng, không lộ lỗi thô, log lỗi hệ thống đúng MỘT lần.
jest.mock('../src/logger');
const jwt = require('jsonwebtoken');
const logger = require('../src/logger');
const { createApp } = require('../src/app');
const { AppError } = require('../src/errors/AppError');

const SECRET = 'secret-chi-dung-cho-test-0123456789';
const token = jwt.sign({ employeeId: 1, fullName: 'NV', role: 'NHAN_VIEN_TIEP_NHAN', centerId: 1 }, SECRET);

let server;
let base;
function start(services) {
  const app = createApp({ services: { authService: {}, customerService: {}, ticketService: {}, ...services }, jwtSecret: SECRET });
  return new Promise((resolve) => {
    server = app.listen(0, () => { base = `http://localhost:${server.address().port}`; resolve(); });
  });
}
afterEach(() => { jest.clearAllMocks(); return new Promise((r) => (server ? server.close(r) : r())); });

const call = (path, { body, method, auth = true } = {}) => fetch(base + path, {
  method: method || (body ? 'POST' : 'GET'),
  headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${token}` } : {}) },
  body: body ? JSON.stringify(body) : undefined,
});

test('chưa đăng nhập -> 401 UNAUTHORIZED', async () => {
  await start({});
  const res = await call('/api/tickets', { auth: false });
  expect(res.status).toBe(401);
  expect((await res.json()).error.code).toBe('UNAUTHORIZED');
});

test('dữ liệu vào sai -> 400 VALIDATION_FAILED kèm fields, service không bị gọi', async () => {
  const createTicket = jest.fn();
  await start({ ticketService: { createTicket } });
  const res = await call('/api/tickets', { body: { customer_id: 1, device_id: 1 } });
  const j = await res.json();
  expect(res.status).toBe(400);
  expect(j.error.code).toBe('VALIDATION_FAILED');
  expect(j.error.fields).toHaveProperty('issue_desc');
  expect(createTicket).not.toHaveBeenCalled();
});

test('lỗi nghiệp vụ dịch sang đúng mã HTTP và ghi log mức INFO, không phải ERROR', async () => {
  await start({ ticketService: { approveWarranty: async () => { throw new AppError('WARRANTY_ALREADY_VERIFIED', 'đã xác minh'); } } });
  const res = await call('/api/tickets/5/approve-warranty', { method: 'PATCH', body: { is_warranty: true } });
  expect(res.status).toBe(409);
  expect(logger.info).toHaveBeenCalledTimes(1);
  expect(logger.error).not.toHaveBeenCalled();
});

test('lỗi hệ thống -> 500, thông báo chung + mã tra cứu, KHÔNG lộ chi tiết, log ERROR đúng một lần', async () => {
  await start({ ticketService: { getTicket: async () => { throw new Error('duplicate key value violates unique constraint "x"'); } } });
  const res = await call('/api/tickets/1');
  const text = await res.text();
  expect(res.status).toBe(500);
  expect(text).not.toContain('duplicate key');
  expect(JSON.parse(text).error.message).toMatch(/Mã tra cứu: [0-9a-f]{8}/);
  expect(logger.error).toHaveBeenCalledTimes(1);
});

test('mất kết nối CSDL -> 503 DB_UNAVAILABLE', async () => {
  await start({ ticketService: { getTicket: async () => { const e = new Error('connect ECONNREFUSED'); e.code = 'ECONNREFUSED'; throw e; } } });
  const res = await call('/api/tickets/1');
  expect(res.status).toBe(503);
  expect((await res.json()).error.code).toBe('DB_UNAVAILABLE');
});

test('response dùng snake_case và thời gian ISO +07:00 theo API contract', async () => {
  const dueDate = new Date('2026-10-20T02:00:00Z');
  await start({ ticketService: { getTicket: async () => ({ ticketId: 9, ticketCode: 'BH-000009/2026', dueDate }) } });
  const j = await (await call('/api/tickets/9')).json();
  expect(j).toEqual({ ticket_id: 9, ticket_code: 'BH-000009/2026', due_date: '2026-10-20T09:00:00+07:00' });
});

test('QT-13: không có endpoint DELETE (404)', async () => {
  await start({});
  expect((await call('/api/tickets/1', { method: 'DELETE' })).status).toBe(404);
});
