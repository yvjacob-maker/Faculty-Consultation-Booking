const assert = require('node:assert/strict');
const test = require('node:test');
const mysqlConfig = require('../src/mysql-config');

test('access-denied diagnostic identifies the connection settings without exposing the password', () => {
  const message = mysqlConfig.diagnostic({ code: 'ER_ACCESS_DENIED_ERROR' }, 'session store');

  assert.match(message, /MySQL session store connection failed: access denied/);
  assert.ok(message.includes(mysqlConfig.user));
  assert.ok(message.includes(`${mysqlConfig.host}:${mysqlConfig.port}`));
  assert.ok(message.includes(mysqlConfig.database));
  assert.match(message, /MYSQL_PASSWORD is (set|empty)/);
  assert.match(message, /runtime environment/);
  if (mysqlConfig.password) assert.ok(!message.includes(mysqlConfig.password));
});

test('database-not-found diagnostic names the configured database', () => {
  const message = mysqlConfig.diagnostic({ code: 'ER_BAD_DB_ERROR' }, 'application database');

  assert.match(message, /database .* was not found/);
  assert.ok(message.includes(mysqlConfig.database));
});

test('network diagnostics identify the host and port settings to check', () => {
  const message = mysqlConfig.diagnostic({ code: 'ECONNREFUSED' }, 'connection test');

  assert.ok(message.includes(mysqlConfig.safeSummary()));
  assert.match(message, /MYSQL_HOST and MYSQL_PORT/);
});
