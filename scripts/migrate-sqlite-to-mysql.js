require('dotenv').config({ quiet: true });
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');
const database = require('../src/database');

const sqlitePath = process.env.SQLITE_PATH
  ? path.resolve(process.env.SQLITE_PATH)
  : path.join(__dirname, '..', 'data', 'ccs-consultation.sqlite');

function sqliteAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows));
  });
}

async function copyRows(connection, sqlite, table, columns) {
  const rows = await sqliteAll(sqlite, `SELECT * FROM ${table}`);
  if (!rows.length) return 0;

  const insertColumns = columns.filter((column) => rows.some((row) => Object.prototype.hasOwnProperty.call(row, column)));
  const placeholders = insertColumns.map(() => '?').join(', ');
  await connection.beginTransaction();
  try {
    await connection.query(`DELETE FROM ${table}`);
    for (const row of rows) {
      await connection.query(
        `INSERT INTO ${table} (${insertColumns.join(', ')}) VALUES (${placeholders})`,
        insertColumns.map((column) => row[column])
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  }
  return rows.length;
}

async function main() {
  await database.ready;
  const sqlite = new sqlite3.Database(sqlitePath, sqlite3.OPEN_READONLY);
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
    user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'faculty_consultation'
  });

  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    const counts = {
      app_state: await copyRows(connection, sqlite, 'app_state',
        ['state_key', 'state_json', 'updated_at']),
      accounts: await copyRows(connection, sqlite, 'accounts',
        ['id', 'full_name', 'username', 'password_hash', 'role', 'program', 'email', 'password_set', 'must_change_password', 'created_at']),
      account_setup_tokens: await copyRows(connection, sqlite, 'account_setup_tokens',
        ['id', 'account_id', 'token_hash', 'expires_at', 'used_at', 'revoked_at', 'created_at']),
      email_deliveries: await copyRows(connection, sqlite, 'email_deliveries',
        ['id', 'account_id', 'token_id', 'kind', 'delivery_version', 'recipient', 'status', 'attempts', 'last_error', 'sent_at', 'created_at', 'updated_at']),
      bookings: await copyRows(connection, sqlite, 'bookings',
        ['id', 'student_id', 'faculty_id', 'subject', 'consultation_date', 'consultation_time', 'notes', 'status', 'created_at', 'updated_at']),
      activity_logs: await copyRows(connection, sqlite, 'activity_logs',
        ['id', 'actor', 'action', 'details', 'created_at'])
    };
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('SQLite data migrated to MySQL:', counts);
  } finally {
    await connection.end();
    await new Promise((resolve, reject) => sqlite.close((error) => error ? reject(error) : resolve()));
    await database.close();
  }
}

main().catch((error) => {
  console.error('MySQL migration failed:', error.message);
  process.exitCode = 1;
});
