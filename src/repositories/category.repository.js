const { camel } = require('./map');

class CategoryRepository {
  constructor(db) { this.db = db; }

  async findById(id) {
    const r = await this.db.query('SELECT * FROM issue_category WHERE category_id = $1', [id]);
    return camel(r.rows[0]);
  }

  async findByName(name) {
    const r = await this.db.query('SELECT * FROM issue_category WHERE category_name = $1 AND is_active = true', [name]);
    return camel(r.rows[0]);
  }

  async findAllActive() {
    const r = await this.db.query('SELECT * FROM issue_category WHERE is_active = true ORDER BY category_id');
    return r.rows.map(camel);
  }
}

module.exports = CategoryRepository;
