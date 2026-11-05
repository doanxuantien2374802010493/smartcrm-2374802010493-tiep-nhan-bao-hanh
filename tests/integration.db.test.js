jest.mock('../src/logger');
const { execSync } = require('child_process');
const path = require('path');
const request = require('supertest');
const { pool, count, buildTestApp, login, auth, closePool } = require('./helpers/db');

const ROOT = path.join(__dirname, '..');
afterAll(closePool);

test('TC-08 tao phieu: ticket +1 va ticket_status_log +1 trong cung transaction (QT-06)', async () => {
  const app = buildTestApp();
  const token = await login(app, 'nv1');

  const ticketBefore = await count('ticket');
  const logBefore = await count('ticket_status_log');

  const res = await request(app).post('/api/tickets').set(auth(token)).send({
    customer_id: 1,
    device_id: 1,
    issue_desc: 'Thiet bi khong len nguon, man hinh soc xanh',
  });

  expect(res.status).toBe(201);
  expect(res.body.ticket_code).toMatch(/^BH-\d{6}\/\d{4}$/);
  expect(await count('ticket')).toBe(ticketBefore + 1);
  expect(await count('ticket_status_log')).toBe(logBefore + 1);

  const { rows } = await pool.query(
    'SELECT from_status, to_status FROM ticket_status_log WHERE ticket_id = $1',
    [res.body.ticket_id]
  );
  expect(rows).toHaveLength(1);
  expect(rows[0].from_status).toBeNull();
  expect(rows[0].to_status).toBe('MOI');
});

test('TC-10 db:setup chay lan hai khong nhan doi du lieu', async () => {
  const tables = ['customer', 'device', 'issue_category', 'employee', 'ticket', 'ticket_status_log'];
  const run = () => execSync('npm run db:setup', { cwd: ROOT, env: process.env, stdio: 'pipe' });

  run();
  const before = {};
  for (const t of tables) before[t] = await count(t);
  run();
  const after = {};
  for (const t of tables) after[t] = await count(t);

  expect(after).toEqual(before);
}, 60000);
