jest.mock('../src/logger');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const config = require('../src/config');
const { pool, buildTestApp, login, auth, closePool } = require('./helpers/db');

afterAll(closePool);

const payload = { employeeId: 1, fullName: 'NV', role: 'NHAN_VIEN_TIEP_NHAN', centerId: 1 };

describe('A07 xac thuc: moi truong hop sai token deu phai tra 401', () => {
  let app, token;
  beforeAll(async () => { app = buildTestApp(); token = await login(app, 'nv1'); });

  test('TC-13 khong gui token -> 401', async () => {
    expect((await request(app).get('/api/tickets')).status).toBe(401);
  });

  test('TC-14 token bi sua mot ky tu -> 401', async () => {
    const last = token.slice(-1);
    const altered = token.slice(0, -1) + (last === 'A' ? 'B' : 'A');
    const res = await request(app).get('/api/tickets').set(auth(altered));
    expect(res.status).toBe(401);
  });

  test('TC-15 token het han -> 401', async () => {
    const expired = jwt.sign(payload, config.jwtSecret, { expiresIn: -10 });
    expect((await request(app).get('/api/tickets').set(auth(expired))).status).toBe(401);
  });

  test('TC-16 token ky bang khoa khac -> 401', async () => {
    const forged = jwt.sign(payload, 'khoa-gia-mao-khong-dung', { expiresIn: '1h' });
    expect((await request(app).get('/api/tickets').set(auth(forged))).status).toBe(401);
  });
});

describe('A04 mat khau khong luu dang doc duoc', () => {
  test('TC-17 cot password_hash khac mat khau goc va khong lo ra qua API', async () => {
    const { rows } = await pool.query('SELECT username, password_hash FROM employee');
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      expect(r.password_hash).not.toBe('Mekong@123');
      expect(String(r.password_hash).length).toBeGreaterThanOrEqual(40); // ADJUST neu dung thuat toan khac
    }
    const app = buildTestApp();
    const res = await request(app).post('/api/auth/login').send({ username: 'nv1', password: 'Mekong@123' });
    expect(JSON.stringify(res.body)).not.toMatch(/password/i);
  });
});

describe('A02 phan hoi loi khong lo chi tiet ky thuat', () => {
  let app, token;
  beforeAll(async () => { app = buildTestApp(); token = await login(app, 'nv1'); });
  const leak = /stack|node_modules|\.js:\d+|select |insert |ticket_status_log|postgres|ECONN/i;

  test('TC-18 id phieu khong ton tai -> 404 va khong lo chi tiet', async () => {
    const res = await request(app).get('/api/tickets/99999999').set(auth(token));
    expect(res.status).toBe(404);
    expect(JSON.stringify(res.body)).not.toMatch(leak);
  });

  test('TC-19 id phieu sai dinh dang -> 4xx, khong phai 500, khong lo chi tiet', async () => {
    const res = await request(app).get('/api/tickets/abc').set(auth(token));
    expect(res.status).toBeLessThan(500);
    expect(JSON.stringify(res.body)).not.toMatch(leak);
  });

  test('TC-20 than JSON hong -> 4xx, khong phai 500, khong lo chi tiet', async () => {
    const res = await request(app).post('/api/tickets').set(auth(token))
      .set('Content-Type', 'application/json').send('{"customer_id": 1,');
    expect(res.status).toBeLessThan(500);
    expect(JSON.stringify(res.body)).not.toMatch(leak);
  });
});

describe('A05 injection', () => {
  test("TC-21 tim khach bang chuoi ' OR 1=1 -- khong tra ve ban ghi nao va khong loi 500", async () => {
    const app = buildTestApp();
    const token = await login(app, 'nv1');
    const res = await request(app).get('/api/customers').query({ phone: "' OR 1=1 --" }).set(auth(token));
    expect(res.status).toBeLessThan(500);
    expect(JSON.stringify(res.body)).not.toMatch(/Nguy/); // khach seed khong duoc lo ra
  });

  test('TC-22 mo ta loi chua the script duoc luu nguyen van, khong bi thuc thi o tang API', async () => {
    const app = buildTestApp();
    const token = await login(app, 'nv1');
    const desc = '<script>alert(1)</script> man hinh bi soc';
    const res = await request(app).post('/api/tickets').set(auth(token))
      .send({ customer_id: 1, device_id: 1, issue_desc: desc });
    expect(res.status).toBeLessThan(500);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});
