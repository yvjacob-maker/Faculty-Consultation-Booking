const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

function openDatabase(file) {
  return new Promise((resolve, reject) => {
    const database = new sqlite3.Database(file, (error) => {
      if (error) return reject(error);
      resolve(database);
    });
  });
}

function run(database, sql, params = []) {
  return new Promise((resolve, reject) => {
    database.run(sql, params, function (error) {
      if (error) return reject(error);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(database, sql, params = []) {
  return new Promise((resolve, reject) => {
    database.get(sql, params, (error, row) => {
      if (error) return reject(error);
      resolve(row);
    });
  });
}

async function seedAccounts(file) {
  const database = await openDatabase(file);
  try {
    await run(database, `CREATE TABLE accounts (
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
    const hash = await bcrypt.hash('Starting-Pass123!', 4);
    for (const [name, username, role] of [
      ['Test Administrator', 'admin-test', 'administrator'],
      ['Student Alpha', 'student-a', 'student'],
      ['Student Beta', 'student-b', 'student'],
      ['Student Unauthorized', 'student-unauthorized', 'student'],
      ['Faculty Alpha', 'faculty-a', 'faculty']
    ]) {
      await run(database,
        'INSERT INTO accounts (full_name, username, password_hash, role) VALUES (?, ?, ?, ?)',
        [name, username, hash, role]);
    }
  } finally {
    await new Promise((resolve, reject) => database.close(error => error ? reject(error) : resolve()));
  }
}

async function availablePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}

async function startServer(databasePath) {
  const port = await availablePort();
  const child = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      DB_PATH: databasePath,
      PORT: String(port),
      SESSION_SECRET: 'integration-test-secret-with-at-least-32-characters'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk; });
  child.stderr.on('data', chunk => { output += chunk; });
  const url = `http://127.0.0.1:${port}`;

  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (child.exitCode !== null || child.signalCode !== null) throw new Error(`Server exited during startup:\n${output}`);
    try {
      const response = await fetch(`${url}/api/health`);
      if (response.ok) return { child, url };
    } catch (_) {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  child.kill();
  throw new Error(`Server did not become ready:\n${output}`);
}

async function stopServer(instance) {
  if (!instance || instance.child.exitCode !== null) return;
  const exited = once(instance.child, 'exit');
  instance.child.kill();
  await exited;
}

async function login(url, username) {
  const response = await fetch(`${url}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: 'Starting-Pass123!' })
  });
  assert.equal(response.status, 200);
  const cookie = response.headers.get('set-cookie');
  assert.ok(cookie, 'login should create a session cookie');
  return cookie.split(';')[0];
}

async function reset(url, cookie, username) {
  return fetch(`${url}/api/admin/accounts/${encodeURIComponent(username)}/reset-password`, {
    method: 'POST',
    headers: { Cookie: cookie }
  });
}

test('admin can repeatedly reset passwords while retaining authorization', async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'faculty-reset-test-'));
  const databasePath = path.join(directory, 'consultation.sqlite');
  let instance;
  t.after(async () => {
    await stopServer(instance);
    fs.rmSync(directory, { recursive: true, force: true });
  });

  await seedAccounts(databasePath);
  instance = await startServer(databasePath);
  const adminCookie = await login(instance.url, 'admin-test');

  const firstStudentReset = await reset(instance.url, adminCookie, 'student-a');
  assert.equal(firstStudentReset.status, 200);
  const firstStudentPassword = (await firstStudentReset.json()).password;

  const secondStudentReset = await reset(instance.url, adminCookie, 'student-b');
  assert.equal(secondStudentReset.status, 200);
  const secondStudentPassword = (await secondStudentReset.json()).password;

  const firstFacultyReset = await reset(instance.url, adminCookie, 'faculty-a');
  assert.equal(firstFacultyReset.status, 200);
  const firstFacultyPassword = (await firstFacultyReset.json()).password;

  const repeatedStudentReset = await reset(instance.url, adminCookie, 'student-a');
  assert.equal(repeatedStudentReset.status, 200);
  const repeatedStudentPassword = (await repeatedStudentReset.json()).password;
  assert.notEqual(repeatedStudentPassword, firstStudentPassword);

  const refreshed = await fetch(`${instance.url}/api/session`, {
    headers: { Cookie: adminCookie }
  });
  assert.equal(refreshed.status, 200);
  assert.equal((await refreshed.json()).user.username, 'admin-test');

  const afterRefresh = await reset(instance.url, adminCookie, 'student-b');
  assert.equal(afterRefresh.status, 200);
  const secondStudentPasswordAgain = (await afterRefresh.json()).password;

  const studentCookie = await login(instance.url, 'student-unauthorized');
  const forbidden = await reset(instance.url, studentCookie, 'student-b');
  assert.equal(forbidden.status, 403);
  const unauthenticated = await reset(instance.url, '', 'student-b');
  assert.equal(unauthenticated.status, 401);

  await stopServer(instance);
  instance = await startServer(databasePath);
  const persistedSession = await fetch(`${instance.url}/api/session`, {
    headers: { Cookie: adminCookie }
  });
  assert.equal(persistedSession.status, 200);
  assert.equal((await persistedSession.json()).user.username, 'admin-test');

  const facultyAgain = await reset(instance.url, adminCookie, 'faculty-a');
  assert.equal(facultyAgain.status, 200);
  const latestFacultyPassword = (await facultyAgain.json()).password;
  assert.notEqual(latestFacultyPassword, firstFacultyPassword);

  const database = await openDatabase(databasePath);
  try {
    for (const [username, password] of [
      ['student-a', repeatedStudentPassword],
      ['student-b', secondStudentPasswordAgain],
      ['faculty-a', latestFacultyPassword]
    ]) {
      const account = await get(database,
        'SELECT password_hash, must_change_password FROM accounts WHERE username = ?',
        [username]);
      assert.equal(account.must_change_password, 1);
      assert.equal(await bcrypt.compare(password, account.password_hash), true);
    }

    const history = await new Promise((resolve, reject) => {
      database.all("SELECT actor, details, created_at FROM activity_logs WHERE action = 'Password reset' ORDER BY id", [],
        (error, rows) => error ? reject(error) : resolve(rows));
    });
    assert.equal(history.length, 6);
    assert.ok(history.every(row => row.actor === 'admin-test' && row.created_at));
    for (const [name, username] of [
      ['Student Alpha', 'student-a'],
      ['Student Beta', 'student-b'],
      ['Faculty Alpha', 'faculty-a']
    ]) {
      assert.ok(history.some(row => row.details.includes(name) && row.details.includes(username)));
    }
    for (const password of [
      firstStudentPassword, secondStudentPassword, firstFacultyPassword,
      repeatedStudentPassword, secondStudentPasswordAgain, latestFacultyPassword
    ]) {
      assert.ok(history.every(row => !row.details.includes(password)));
    }
  } finally {
    await new Promise((resolve, reject) => database.close(error => error ? reject(error) : resolve()));
  }
});
