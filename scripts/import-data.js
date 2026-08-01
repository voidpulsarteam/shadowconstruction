const fs = require('fs');
const path = require('path');
const vm = require('vm');
const sqlite3 = require('sqlite3');

const root = process.cwd();
const dbPath = path.join(root, 'data', 'app.db');

function sqlString(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

function exec(db, sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function run(db, sql) {
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function main() {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new sqlite3.Database(dbPath);

  try {
    await exec(db, `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        role TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        expires_at TEXT
      );
      CREATE TABLE IF NOT EXISTS site_settings (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        year TEXT,
        variant TEXT,
        liveries TEXT,
        colors TEXT
      );
      CREATE TABLE IF NOT EXISTS wiki_pages (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT
      );
      CREATE TABLE IF NOT EXISTS shifts (
        id TEXT PRIMARY KEY,
        employee TEXT,
        startTime TEXT,
        endTime TEXT,
        breaks TEXT,
        status TEXT,
        totalDuration INTEGER,
        moderationStats TEXT
      );
    `);

    const users = JSON.parse(fs.readFileSync(path.join(root, 'data', 'users.json'), 'utf8'));
    for (const user of users) {
      await run(db, `INSERT INTO users (username, passwordHash, role) VALUES (${sqlString(user.username)}, ${sqlString(user.passwordHash)}, ${sqlString(user.role)}) ON CONFLICT(username) DO UPDATE SET passwordHash = excluded.passwordHash, role = excluded.role;`);
    }

    const site = JSON.parse(fs.readFileSync(path.join(root, 'data', 'site.json'), 'utf8'));
    await run(db, `INSERT INTO site_settings (id, data) VALUES (${sqlString('main')}, ${sqlString(JSON.stringify(site))}) ON CONFLICT(id) DO UPDATE SET data = excluded.data;`);

    const shifts = JSON.parse(fs.readFileSync(path.join(root, 'data', 'shifts.json'), 'utf8'));
    for (const shift of shifts) {
      await run(db, `INSERT INTO shifts (id, employee, startTime, endTime, breaks, status, totalDuration, moderationStats) VALUES (${sqlString(shift.id)}, ${sqlString(shift.employee)}, ${sqlString(shift.startTime)}, ${sqlString(shift.endTime)}, ${sqlString(JSON.stringify(shift.breaks || []))}, ${sqlString(shift.status)}, ${sqlString(shift.totalDuration ?? 0)}, ${sqlString(JSON.stringify(shift.moderationStats || {}))}) ON CONFLICT(id) DO UPDATE SET employee = excluded.employee, startTime = excluded.startTime, endTime = excluded.endTime, breaks = excluded.breaks, status = excluded.status, totalDuration = excluded.totalDuration, moderationStats = excluded.moderationStats;`);
    }

    const tokens = JSON.parse(fs.readFileSync(path.join(root, 'data', 'tokens.json'), 'utf8'));
    for (const token of tokens) {
      await run(db, `INSERT INTO tokens (token, type, expires_at) VALUES (${sqlString(token.token)}, ${sqlString(token.type)}, ${sqlString(token.expires_at)}) ON CONFLICT(token) DO UPDATE SET type = excluded.type, expires_at = excluded.expires_at;`);
    }

    const wiki = JSON.parse(fs.readFileSync(path.join(root, 'data', 'wiki.json'), 'utf8'));
    for (const page of wiki.pages || []) {
      await run(db, `INSERT INTO wiki_pages (id, title, content) VALUES (${sqlString(page.id)}, ${sqlString(page.title)}, ${sqlString(page.content)}) ON CONFLICT(id) DO UPDATE SET title = excluded.title, content = excluded.content;`);
    }

    const vehiclesText = fs.readFileSync(path.join(root, 'data', 'vehicles.js'), 'utf8');
    const sandbox = { module: { exports: undefined }, exports: undefined };
    vm.runInNewContext(vehiclesText, sandbox, { filename: path.join(root, 'data', 'vehicles.js') });
    const vehicles = Array.isArray(sandbox.module.exports) ? sandbox.module.exports : Array.isArray(sandbox.exports) ? sandbox.exports : [];
    for (const vehicle of vehicles) {
      await run(db, `INSERT INTO vehicles (name, year, variant, liveries, colors) VALUES (${sqlString(vehicle.name)}, ${sqlString(vehicle.year ?? '')}, ${sqlString(vehicle.variant ?? '')}, ${sqlString(JSON.stringify(vehicle.liveries || []))}, ${sqlString(JSON.stringify(vehicle.colors || []))}) ON CONFLICT DO NOTHING;`);
    }

    const counts = await new Promise((resolve, reject) => {
      db.all('SELECT (SELECT COUNT(*) FROM users) AS usersCount, (SELECT COUNT(*) FROM vehicles) AS vehiclesCount, (SELECT COUNT(*) FROM wiki_pages) AS wikiPagesCount, (SELECT COUNT(*) FROM shifts) AS shiftsCount, (SELECT COUNT(*) FROM site_settings) AS siteSettingsCount', (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0]);
      });
    });

    console.log(JSON.stringify(counts, null, 2));
  } finally {
    await new Promise((resolve, reject) => {
      db.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
