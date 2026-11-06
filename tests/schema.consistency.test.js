const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const tablesIn = (sql) =>
  [...sql.matchAll(/CREATE TABLE(?: IF NOT EXISTS)?\s+(\w+)/gi)].map((m) => m[1].toLowerCase()).sort();
const migrationTables = tablesIn(fs.readFileSync(path.join(root, 'migrations', '001_create_tables.sql'), 'utf8'));

describe('Luoc do CSDL khop voi migrations (C9)', () => {
  test('migrations tao dung 6 bang theo TD-02', () => {
    expect(migrationTables).toEqual(['customer', 'device', 'employee', 'issue_category', 'ticket', 'ticket_status_log']);
  });

  test('db/schema.sql (neu con) co cung tap bang voi migrations', () => {
    const p = path.join(root, 'db', 'schema.sql');
    if (!fs.existsSync(p)) return;
    expect(tablesIn(fs.readFileSync(p, 'utf8'))).toEqual(migrationTables);
  });
});
