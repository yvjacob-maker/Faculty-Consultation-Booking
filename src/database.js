const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(dataDir, 'ccs-consultation.sqlite');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new sqlite3.Database(dbPath);
db.configure('busyTimeout', 5000);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}
function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function migrate() {
  await run('PRAGMA foreign_keys = ON');
  await run(`CREATE TABLE IF NOT EXISTS app_state (
    state_key TEXT PRIMARY KEY,
    state_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(`CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student','faculty','administrator')),
    program TEXT DEFAULT '',
    email TEXT,
    password_set INTEGER NOT NULL DEFAULT 1,
    must_change_password INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  const accountColumns = await all('PRAGMA table_info(accounts)');
  const accountColumnNames = accountColumns.map((column) => column.name);
  if (!accountColumnNames.includes('email')) {
    await run('ALTER TABLE accounts ADD COLUMN email TEXT');
  }
  if (!accountColumnNames.includes('password_set')) {
    await run('ALTER TABLE accounts ADD COLUMN password_set INTEGER NOT NULL DEFAULT 1');
  }
  if (!accountColumnNames.includes('must_change_password')) {
    await run('ALTER TABLE accounts ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0');
  }

  // SQLite supports expression indexes, so duplicate emails are blocked
  // case-insensitively while accounts without an email remain allowed.
  await run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_email_unique
    ON accounts(lower(email)) WHERE email IS NOT NULL AND trim(email) <> ''`);
  await run('CREATE INDEX IF NOT EXISTS idx_accounts_role ON accounts(role)');

  await run(`CREATE TABLE IF NOT EXISTS account_setup_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    used_at TEXT,
    revoked_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
  )`);
  await run('CREATE INDEX IF NOT EXISTS idx_setup_tokens_account ON account_setup_tokens(account_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_setup_tokens_expiry ON account_setup_tokens(expires_at)');

  await run(`CREATE TABLE IF NOT EXISTS email_deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    token_id INTEGER,
    kind TEXT NOT NULL DEFAULT 'credentials',
    delivery_version INTEGER NOT NULL DEFAULT 1,
    recipient TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sent','failed')),
    attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT DEFAULT '',
    sent_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(account_id, kind),
    FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY(token_id) REFERENCES account_setup_tokens(id) ON DELETE SET NULL
  )`);
  const deliveryColumns = await all('PRAGMA table_info(email_deliveries)');
  if (!deliveryColumns.some((column) => column.name === 'token_id')) {
    await run('ALTER TABLE email_deliveries ADD COLUMN token_id INTEGER');
  }
  if (!deliveryColumns.some((column) => column.name === 'delivery_version')) {
    await run('ALTER TABLE email_deliveries ADD COLUMN delivery_version INTEGER NOT NULL DEFAULT 1');
  }
  await run('CREATE INDEX IF NOT EXISTS idx_email_deliveries_status ON email_deliveries(status)');

  await run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    faculty_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    consultation_date TEXT NOT NULL,
    consultation_time TEXT NOT NULL,
    notes TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(`CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
}

const ready = migrate().catch((error) => {
  console.error('Could not initialize SQLite tables:', error.message);
  throw error;
});

module.exports = db;
module.exports.ready = ready;
module.exports.dbPath = dbPath;
// Keep the native sqlite3 callback methods (run/get/all/exec) intact for the
// existing server routes. Promise helpers use distinct names.
module.exports.runAsync = run;
module.exports.getAsync = get;
module.exports.allAsync = all;
module.exports.execAsync = exec;
