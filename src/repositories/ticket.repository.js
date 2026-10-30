const { camel } = require('./map');

// Phiếu + thiết bị + khách + nhóm sự cố (khách của phiếu suy ra qua device, giữ 3NF)
const SELECT_TICKET = `
  SELECT t.*, d.device_name, d.serial_no, d.customer_id,
         c.full_name AS customer_name, c.phone AS customer_phone,
         ic.category_name
    FROM ticket t
    JOIN device d   ON d.device_id = t.device_id
    JOIN customer c ON c.customer_id = d.customer_id
    LEFT JOIN issue_category ic ON ic.category_id = t.category_id`;

class TicketRepository {
  constructor(db) { this.db = db; }

  // Lấy trước ticket_id để service sinh mã phiếu BH-xxxxxx/năm (tránh đếm COUNT(*) dễ trùng khi chạy đồng thời)
  async nextId() {
    const r = await this.db.query("SELECT nextval(pg_get_serial_sequence('ticket','ticket_id')) AS id");
    return Number(r.rows[0].id);
  }

  // Lưu phiếu và dòng log đầu tiên trong CÙNG MỘT transaction (NFR4, QT-06)
  async createWithLog(t, changedBy) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO ticket (ticket_id, ticket_code, device_id, category_id, center_id, issue_desc, priority,
                             status, provided_purchase_date, is_warranty, warranty_verified, received_at, due_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'MOI',$8,$9,$10,$11,$12)`,
        [t.ticketId, t.ticketCode, t.deviceId, t.categoryId, t.centerId, t.issueDesc, t.priority,
          t.providedPurchaseDate, t.isWarranty, t.warrantyVerified,
          t.receivedAt.toISOString(), t.dueDate.toISOString()],
      );
      await client.query(
        `INSERT INTO ticket_status_log (ticket_id, from_status, to_status, changed_by, changed_at)
         VALUES ($1, NULL, 'MOI', $2, $3)`,
        [t.ticketId, changedBy, t.receivedAt.toISOString()],
      );
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    return this.findById(t.ticketId);
  }

  async findById(id) {
    const r = await this.db.query(`${SELECT_TICKET} WHERE t.ticket_id = $1`, [id]);
    return camel(r.rows[0]);
  }

  // Danh sách phiếu của MỘT trung tâm (QT-14), có phân trang; onlyUnverified = phiếu chờ xác minh bảo hành
  async list({ centerId, onlyUnverified, limit, offset }) {
    const where = `t.is_deleted = false AND t.center_id = $1 AND ($2::boolean = false OR t.warranty_verified = false)`;
    const rows = await this.db.query(
      `${SELECT_TICKET} WHERE ${where} ORDER BY t.due_date ASC, t.ticket_id DESC LIMIT $3 OFFSET $4`,
      [centerId, !!onlyUnverified, limit, offset],
    );
    const count = await this.db.query(`SELECT COUNT(*)::int AS n FROM ticket t WHERE ${where}`, [centerId, !!onlyUnverified]);
    return { rows: rows.rows.map(camel), total: count.rows[0].n };
  }

  async update(id, { issueDesc, categoryId, priority, dueDate }) {
    await this.db.query(
      `UPDATE ticket SET
         issue_desc  = COALESCE($2, issue_desc),
         category_id = CASE WHEN $3::boolean THEN $4 ELSE category_id END,
         priority    = COALESCE($5, priority),
         due_date    = COALESCE($6::timestamp, due_date)
       WHERE ticket_id = $1`,
      [id, issueDesc ?? null, categoryId !== undefined, categoryId ?? null, priority ?? null,
        dueDate ? dueDate.toISOString() : null],
    );
    return this.findById(id);
  }

  async approveWarranty(id, isWarranty) {
    await this.db.query('UPDATE ticket SET warranty_verified = true, is_warranty = $2 WHERE ticket_id = $1', [id, isWarranty]);
    return this.findById(id);
  }

  // QT-13: xóa mềm (trigger ở CSDL chặn DELETE vật lý)
  async softDelete(id) {
    await this.db.query('UPDATE ticket SET is_deleted = true WHERE ticket_id = $1', [id]);
  }

  async findStatusLog(ticketId, { limit, offset }) {
    const rows = await this.db.query(
      `SELECT l.*, e.full_name AS changed_by_name
         FROM ticket_status_log l JOIN employee e ON e.employee_id = l.changed_by
        WHERE l.ticket_id = $1 ORDER BY l.changed_at, l.log_id LIMIT $2 OFFSET $3`,
      [ticketId, limit, offset],
    );
    const count = await this.db.query('SELECT COUNT(*)::int AS n FROM ticket_status_log WHERE ticket_id = $1', [ticketId]);
    return { rows: rows.rows.map(camel), total: count.rows[0].n };
  }
}

module.exports = TicketRepository;
