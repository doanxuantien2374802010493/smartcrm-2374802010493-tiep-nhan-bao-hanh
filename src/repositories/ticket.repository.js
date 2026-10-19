class TicketRepository {
  constructor(db) { this.db = db; }

  async findOpenTicketByDevice(deviceId) {
    const { rows } = await this.db.query(
      `SELECT ticket_id, ticket_code, status FROM ticket 
       WHERE device_id = $1 AND status NOT IN ('HOAN_TAT', 'DA_DONG', 'DA_HUY') AND is_deleted = false`,
      [deviceId]
    );
    return rows[0];
  }

  async nextTicketCode(centerId) {
    const { rows } = await this.db.query(
      `SELECT COUNT(*)::int AS n FROM ticket WHERE center_id = $1`,
      [centerId]
    );
    const seq = String(rows[0].n + 1).padStart(5, '0');
    return `BH-${centerId}-${seq}/2026`;
  }

  async createTicket(data) {
    const { rows } = await this.db.query(
      `INSERT INTO ticket (ticket_code, device_id, category_id, center_id, issue_desc, priority, provided_purchase_date, is_warranty, warranty_verified, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.ticketCode, data.deviceId, data.categoryId, data.centerId,
        data.issueDesc, data.priority, data.providedPurchaseDate || null,
        data.isWarranty, data.warrantyVerified, data.dueDate
      ]
    );
    return rows[0];
  }
}

module.exports = TicketRepository;