// Lớp truy cập dữ liệu: CHỈ đọc/ghi CSDL, không chứa quy tắc nghiệp vụ, không biết HTTP.
const { camel } = require('./map');

class CustomerRepository {
  constructor(db) { this.db = db; }

  async findById(id) {
    const r = await this.db.query('SELECT * FROM customer WHERE customer_id = $1', [id]);
    return camel(r.rows[0]);
  }

  // Tìm theo SĐT đã chuẩn hóa (QT-01); dùng UNIQUE index nên nhanh (NFR1)
  async findByPhone(phone) {
    const r = await this.db.query('SELECT * FROM customer WHERE phone = $1', [phone]);
    return camel(r.rows[0]);
  }

  async createCustomer({ fullName, phone, email }) {
    const r = await this.db.query(
      'INSERT INTO customer (full_name, phone, email) VALUES ($1, $2, $3) RETURNING *',
      [fullName, phone, email],
    );
    return camel(r.rows[0]);
  }

  // Chỉ cập nhật trường được gửi; email === undefined nghĩa là giữ nguyên
  async updateCustomer(id, { fullName, phone, email }) {
    const r = await this.db.query(
      `UPDATE customer SET
         full_name = COALESCE($2, full_name),
         phone     = COALESCE($3, phone),
         email     = CASE WHEN $4::boolean THEN $5 ELSE email END
       WHERE customer_id = $1 RETURNING *`,
      [id, fullName ?? null, phone ?? null, email !== undefined, email ?? null],
    );
    return camel(r.rows[0]);
  }

  // QT-13: xóa mềm
  async softDelete(id) {
    const r = await this.db.query('UPDATE customer SET is_deleted = true WHERE customer_id = $1 RETURNING *', [id]);
    return camel(r.rows[0]);
  }
}

module.exports = CustomerRepository;
