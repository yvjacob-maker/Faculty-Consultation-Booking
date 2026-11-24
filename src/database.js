const mysql = require('mysql2');

const host = process.env.MYSQL_HOST || '127.0.0.1';
const port = Number(process.env.MYSQL_PORT || 3306);
const user = process.env.MYSQL_USER || 'root';
const password = process.env.MYSQL_PASSWORD || '';
const database = process.env.MYSQL_DATABASE || 'faculty_consultation';

const bootstrap = mysql.createPool({
  host,
  port,
  user,
  password,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

const bootstrapPromise = new Promise((resolve, reject) => {
  bootstrap.query(
    'CREATE DATABASE IF NOT EXISTS ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
    [database],
    (error) => error ? reject(error) : resolve()
  );
});

const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  timezone: 'Z'
});

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, result) => {
      if (error) return reject(error);
      resolve({ id: result.insertId, changes: result.affectedRows });
    });
  });
}
function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, rows) => {
      if (error) return reject(error);
      resolve(Array.isArray(rows) ? rows[0] : undefined);
    });
  });
}
function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, rows) => {
      if (error) return reject(error);
      resolve(Array.isArray(rows) ? rows : []);
    });
  });
}
function execAsync(sql) {
  return new Promise((resolve, reject) => {
    pool.query(sql, (error) => error ? reject(error) : resolve());
  });
}

async function migrate() {
  await bootstrapPromise;
  await execAsync(`
    CREATE TABLE IF NOT EXISTS app_state (
      state_key VARCHAR(191) PRIMARY KEY,
      state_json LONGTEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  await execAsync(`
    CREATE TABLE IF NOT EXISTS accounts (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      username VARCHAR(191) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('student','faculty','administrator') NOT NULL,
      program VARCHAR(255) DEFAULT '',
      email VARCHAR(255),
      password_set TINYINT NOT NULL DEFAULT 1,
      must_change_password TINYINT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY idx_accounts_username (username),
      UNIQUE KEY idx_accounts_email (email),
      KEY idx_accounts_role (role)
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  await execAsync(`
    CREATE TABLE IF NOT EXISTS account_setup_tokens (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      account_id BIGINT UNSIGNED NOT NULL,
      token_hash VARCHAR(255) NOT NULL,
      expires_at VARCHAR(64) NOT NULL,
      used_at VARCHAR(64),
      revoked_at VARCHAR(64),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY idx_setup_tokens_hash (token_hash),
      KEY idx_setup_tokens_account (account_id),
      KEY idx_setup_tokens_expiry (expires_at),
      CONSTRAINT fk_setup_tokens_account FOREIGN KEY (account_id)
        REFERENCES accounts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  await execAsync(`
    CREATE TABLE IF NOT EXISTS email_deliveries (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      account_id BIGINT UNSIGNED NOT NULL,
      token_id BIGINT UNSIGNED,
      kind VARCHAR(64) NOT NULL DEFAULT 'credentials',
      delivery_version INT NOT NULL DEFAULT 1,
      recipient VARCHAR(255) NOT NULL,
      status ENUM('pending','sent','failed') NOT NULL DEFAULT 'pending',
      attempts INT NOT NULL DEFAULT 0,
      last_error TEXT,
      sent_at VARCHAR(64),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY idx_email_account_kind (account_id, kind),
      KEY idx_email_deliveries_status (status),
      CONSTRAINT fk_email_account FOREIGN KEY (account_id)
        REFERENCES accounts(id) ON DELETE CASCADE,
      CONSTRAINT fk_email_token FOREIGN KEY (token_id)
        REFERENCES account_setup_tokens(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  await execAsync(`
    CREATE TABLE IF NOT EXISTS bookings (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      student_id VARCHAR(191) NOT NULL,
      faculty_id VARCHAR(191) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      consultation_date VARCHAR(32) NOT NULL,
      consultation_time VARCHAR(32) NOT NULL,
      notes TEXT,
      status VARCHAR(64) NOT NULL DEFAULT 'Pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  await execAsync(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      actor VARCHAR(191) NOT NULL,
      action VARCHAR(191) NOT NULL,
      details TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
}

const ready = migrate().catch((error) => {
  console.error('Could not initialize MySQL tables:', error.message);
  throw error;
});

function run(sql, params, callback) {
  if (typeof params === 'function') { callback = params; params = []; }
  pool.query(sql, params || [], (error, result) => {
    if (error) return callback(error);
    callback(null, result);
  });
}
function get(sql, params, callback) {
  if (typeof params === 'function') { callback = params; params = []; }
  pool.query(sql, params || [], (error, rows) => {
    if (error) return callback(error);
    callback(null, Array.isArray(rows) ? rows[0] : undefined);
  });
}
function all(sql, params, callback) {
  if (typeof params === 'function') { callback = params; params = []; }
  pool.query(sql, params || [], (error, rows) => {
    if (error) return callback(error);
    callback(null, Array.isArray(rows) ? rows : []);
  });
}
function serialize(callback) { callback(); }

function prepare(sql) {
  let chain = Promise.resolve();
  return {
    run(...args) {
      const callback = typeof args[args.length - 1] === 'function' ? args.pop() : null;
      const params = Array.isArray(args[0]) ? args[0] : args;
      chain = chain.then(() => new Promise((resolve, reject) => {
        pool.query(sql, params, (error, result) => {
          if (callback) callback(error);
          if (error) reject(error); else resolve(result);
        });
      })).catch((error) => { throw error; });
    },
    finalize(callback) {
      chain.then(() => callback && callback()).catch((error) => callback && callback(error));
    }
  };
}

const db = { run, get, all, serialize, prepare };
db.ready = ready;
db.databaseName = database;
db.runAsync = runAsync;
db.getAsync = getAsync;
db.allAsync = allAsync;
db.execAsync = execAsync;
db.pool = pool;
db.bootstrapPool = bootstrap;
db.close = async () => {
  await pool.end();
  await bootstrap.end();
};

module.exports = db;
