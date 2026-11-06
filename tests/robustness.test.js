jest.mock('../src/logger');
const request = require('supertest');
const { buildTestApp, login, auth, closePool } = require('./helpers/db');

afterAll(closePool);

describe('Do ben cua API voi dau vao bat thuong (khong duoc tra 500)', () => {
  let app, token;
  beforeAll(async () => { app = buildTestApp(); token = await login(app, 'nv1'); });

  const createWith = (desc) =>
    request(app).post('/api/tickets').set(auth(token))
      .send({ customer_id: 1, device_id: 1, issue_desc: desc });

  test('id phieu vuot gioi han so nguyen -> 400 hoac 404, khong phai 500', async () => {
    const res = await request(app).get('/api/tickets/99999999999').set(auth(token));
    expect([400, 404]).toContain(res.status);
  });

  test.each(['limit=-1', 'limit=abc', 'offset=-5', 'limit=0'])(
    'GET /api/tickets?%s -> khong phai 500', async (q) => {
      const res = await request(app).get(`/api/tickets?${q}`).set(auth(token));
      expect(res.status).toBeLessThan(500);
    });

  test('doi uu tien sang gia tri khong hop le -> 400, khong phai 500', async () => {
    const created = await createWith('Phieu thu uu tien khong hop le');
    expect(created.status).toBe(201);
    const res = await request(app).patch(`/api/tickets/${created.body.ticket_id}`)
      .set(auth(token)).send({ priority: 'KHAN_CAP' });
    expect(res.status).toBe(400);
  });

  test('customer_id sai kieu hoac qua lon -> 4xx, khong phai 500', async () => {
    for (const bad of ['abc', 99999999999]) {
      const res = await request(app).post('/api/tickets').set(auth(token))
        .send({ customer_id: bad, device_id: 1, issue_desc: 'Mo ta loi du dai de hop le' });
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    }
  });

  // Gia tri bien cua issue_desc (10-2000 ky tu): 9, 10, 2000, 2001
  test('BIEN 9 ky tu -> 400', async () => { expect((await createWith('a'.repeat(9))).status).toBe(400); });
  test('BIEN 10 ky tu -> 201', async () => { expect((await createWith('a'.repeat(10))).status).toBe(201); });
  test('BIEN 2000 ky tu -> 201', async () => { expect((await createWith('a'.repeat(2000))).status).toBe(201); });
  test('BIEN 2001 ky tu -> 400', async () => { expect((await createWith('a'.repeat(2001))).status).toBe(400); });
});
