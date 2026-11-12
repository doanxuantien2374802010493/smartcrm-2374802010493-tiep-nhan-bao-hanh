const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const composeExists = ['docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml']
  .some((f) => fs.existsSync(path.join(root, f)));

describe('Tai lieu khop voi repo (C9)', () => {
  test('README khong huong dan lenh docker compose up khi repo khong co tep compose', () => {
    const claims = /docker[ -]compose\s+up/i.test(read('README.md'));
    expect(claims && !composeExists).toBe(false);
  });

  test('README khong tich [x] cho Docker khi repo khong co tep compose', () => {
    const claims = /^\s*[-*]\s*\[x\].*docker/im.test(read('README.md'));
    expect(claims && !composeExists).toBe(false);
  });
});
