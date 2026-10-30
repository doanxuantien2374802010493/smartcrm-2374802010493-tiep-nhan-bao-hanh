const { camel } = require('./map');

class EmployeeRepository {
  constructor(db) { this.db = db; }

  async findByUsername(username) {
    const r = await this.db.query('SELECT * FROM employee WHERE username = $1', [username]);
    return camel(r.rows[0]);
  }
}

module.exports = EmployeeRepository;
