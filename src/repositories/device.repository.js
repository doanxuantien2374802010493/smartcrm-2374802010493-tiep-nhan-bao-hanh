const { camel } = require('./map');

class DeviceRepository {
  constructor(db) { this.db = db; }

  async findById(id) {
    const r = await this.db.query('SELECT * FROM device WHERE device_id = $1', [id]);
    return camel(r.rows[0]);
  }

  async findByCustomer(customerId) {
    const r = await this.db.query(
      'SELECT * FROM device WHERE customer_id = $1 AND is_deleted = false ORDER BY device_id', [customerId],
    );
    return r.rows.map(camel);
  }
}

module.exports = DeviceRepository;
