require('dotenv').config({ quiet: true });
const mysql = require('mysql2/promise');
const mysqlConfig = require('../src/mysql-config');

async function main() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: mysqlConfig.host,
      port: mysqlConfig.port,
      user: mysqlConfig.user,
      password: mysqlConfig.password,
      database: mysqlConfig.database,
      connectTimeout: 10000
    });
    const [rows] = await connection.query(
      'SELECT DATABASE() AS database_name, USER() AS connected_user, VERSION() AS database_version'
    );
    console.log('MySQL connection successful:', rows[0]);
  } catch (error) {
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(
        `MySQL access denied for user "${mysqlConfig.user}" at ${mysqlConfig.host}:${mysqlConfig.port}. ` +
        'Verify the Hostinger database password and database name in Environment Variables.'
      );
    } else {
      console.error(`MySQL connection failed (${mysqlConfig.safeSummary()}): ${error.message}`);
    }
    process.exitCode = 1;
  } finally {
    if (connection) await connection.end();
  }
}

main();
