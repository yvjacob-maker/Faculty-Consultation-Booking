const { AsyncLocalStorage } = require('node:async_hooks');
const mysql = require('mysql2');
const mysqlConfig = require('./mysql-config');
const host = mysqlConfig.host;
const port = mysqlConfig.port;
const user = mysqlConfig.user;
const password = mysqlConfig.password;
const database = mysqlConfig.database;

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
const promisePool = pool.promise();
const transactionConnection = new AsyncLocalStorage();

function activeConnection() {
  return transactionConnection.getStore() || promisePool;
}

async function runAsync(sql, params = []) {
  const [result] = await activeConnection().query(sql, params);
  return { id: result.insertId, changes: result.affectedRows };
}

async function getAsync(sql, params = []) {
  const [rows] = await activeConnection().query(sql, params);
  return Array.isArray(rows) ? rows[0] : undefined;
}

async function allAsync(sql, params = []) {
  const [rows] = await activeConnection().query(sql, params);
  return Array.isArray(rows) ? rows : [];
}

async function execAsync(sql) {
  await activeConnection().query(sql);
}

async function withTransaction(work) {
  const connection = await promisePool.getConnection();
  let transactionStarted = false;

  try {
    await connection.beginTransaction();
    transactionStarted = true;
    const result = await transactionConnection.run(connection, work);
    await connection.commit();
    transactionStarted = false;
    return result;
  } catch (error) {
    if (transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        throw new AggregateError(
          [error, rollbackError],
          'Database transaction failed and rollback also failed.'
        );
      }
    }
    throw error;
  } finally {
    connection.release();
  }
}

async function migrate() {
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
  console.error(mysqlConfig.diagnostic(error, 'application database'));
  throw error;
});

function run(sql, params, callback) {
  if (typeof params === 'function') { callback = params; params = []; }
  if (typeof callback !== 'function') callback = null;
  pool.query(sql, params || [], (error, result) => {
    if (error) {
      if (callback) callback.call(null, error);
      return;
    }
    if (!callback) return;
    callback.call({
      lastID: result.insertId,
      changes: result.affectedRows
    }, null, result);
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
db.withTransaction = withTransaction;
db.pool = pool;
db.close = async () => {
  await pool.end();
};

module.exports = db;
