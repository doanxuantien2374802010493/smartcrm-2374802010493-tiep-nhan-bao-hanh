jest.mock('../src/logger');
const request = require('supertest');
const { pool, count, buildTestApp, login, auth, closePool } = require('./helpers/db');

afterAll(closePool);

describe('Hoi quy cac bug BT2', () => {
  test('TC-23 (BUG-003) tra cuu khach theo SDT tren CSDL that -> 200 va thay dung khach', async () => {
    const app = buildTestApp();
    const token = await login(app, 'nv1');
    const res = await request(app).get('/api/customers').query({ phone: '0901234567' }).set(auth(token));
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).toMatch(/Nguy/);
  });

  test.each(['customer', 'device', 'issue_category', 'employee'])(
    'TC-24 (BUG-004) bang %s co du lieu mau sau db:setup', async (table) => {
      expect(await count(table)).toBeGreaterThan(0);
    });

  test('TC-24 (BUG-004) co du ba tai khoan mau ql1, nv1, nv2', async () => {
    const { rows } = await pool.query("SELECT username FROM employee WHERE username IN ('ql1','nv1','nv2')");
    expect(rows.map((r) => r.username).sort()).toEqual(['nv1', 'nv2', 'ql1']);
  });
});
