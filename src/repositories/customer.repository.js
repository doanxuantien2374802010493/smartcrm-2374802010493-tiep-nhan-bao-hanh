class CustomerRepository {
  constructor(db) {
    this.db = db;
  }

  // Tìm khách hàng qua số điện thoại đã chuẩn hóa (QT-01)
  async findByPhone(phone) {
    const { rows } = await this.db.query(
      `SELECT customer_id, full_name, phone, address, segment 
       FROM customer 
       WHERE phone = $1`,
      [phone]
    );
    return rows[0]; // Trả về undefined nếu không tìm thấy
  }

  // Tạo hồ sơ khách hàng mới
  async createCustomer(data) {
    const { rows } = await this.db.query(
      `INSERT INTO customer (full_name, phone, address, segment, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [data.fullName, data.phone, data.address || null, 'MOI']
    );
    return rows[0];
  }
}

module.exports = CustomerRepository;