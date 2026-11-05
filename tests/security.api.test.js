jest.mock('../src/logger');
const request = require('supertest');
const { pool, buildTestApp, login, auth, closePool } = require('./helpers/db');

afterAll(closePool);

describe('TC-11 A01: nv2 (trung tam 2) khong dung duoc phieu cua trung tam 1', () => {
  let app, tokenNv1, tokenNv2, ticketId, before;
  const snapshot = async () =>
    (await pool.query('SELECT priority, status, is_deleted FROM ticket WHERE ticket_id = $1', [ticketId])).rows[0];

  beforeAll(async () => {
    app = buildTestApp();
    tokenNv1 = await login(app, 'nv1');
    tokenNv2 = await login(app, 'nv2');
    const created = await request(app).post('/api/tickets').set(auth(tokenNv1)).send({
      customer_id: 1, device_id: 1, issue_desc: 'Phieu de kiem tra phan quyen A01',
    });
    expect(created.status).toBe(201);
    ticketId = created.body.ticket_id;
    before = await snapshot();
  });

  test('GET phieu trung tam khac -> 403 hoac 404, khong phai 200', async () => {
    const res = await request(app).get(`/api/tickets/${ticketId}`).set(auth(tokenNv2));
    expect([403, 404]).toContain(res.status);
  });

  test('PATCH phieu trung tam khac -> 403 hoac 404 va du lieu KHONG doi', async () => {
    const res = await request(app).patch(`/api/tickets/${ticketId}`).set(auth(tokenNv2)).send({ priority: 'THAP' });
    expect([403, 404]).toContain(res.status);
    expect(await snapshot()).toEqual(before);
  });

  test('soft-delete phieu trung tam khac -> bi tu choi, phieu van con', async () => {
    const res = await request(app).post(`/api/tickets/${ticketId}/soft-delete`).set(auth(tokenNv2));
    expect([403, 404]).toContain(res.status);
    expect((await snapshot()).is_deleted).toBe(false);
  });

  test('doi chung: nv1 van doc duoc phieu cua minh', async () => {
    const res = await request(app).get(`/api/tickets/${ticketId}`).set(auth(tokenNv1));
    expect(res.status).toBe(200);
  });
});
