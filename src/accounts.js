const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const database = require('./database');
const run = database.runAsync;
const get = database.getAsync;
const all = database.allAsync;
const { sendCredentialsEmail } = require('./mailer');

const PROGRAMS = [
  'BS Computer Science',
  'BS Information Technology',
  'BS Information System',
  'Bachelor of Library and Information Science'
];

const MAX_IMPORT_ROWS = 500;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72;
// Temporary passwords are emailed once and must be replaced at first sign-in,
// so they use a slightly cheaper cost than user-chosen passwords. Large imports
// hash hundreds of passwords, and bcrypt cost 12 would make that impractical.
const TEMP_PASSWORD_COST = 10;
const TEMP_PASSWORD_LENGTH = 12;

// One policy for every user-chosen password (setup links and password changes).
function passwordPolicyError(value) {
  const next = String(value == null ? '' : value);
  if (next.length < PASSWORD_MIN || next.length > PASSWORD_MAX) {
    return `Password must be ${PASSWORD_MIN}-${PASSWORD_MAX} characters long.`;
  }
  const missing = [];
  if (!/[A-Z]/.test(next)) missing.push('an uppercase letter');
  if (!/[a-z]/.test(next)) missing.push('a lowercase letter');
  if (!/[0-9]/.test(next)) missing.push('a number');
  if (!/[^A-Za-z0-9\s]/.test(next)) missing.push('a symbol');
  if (!missing.length) return '';
  const list = missing.length === 1
    ? missing[0]
    : `${missing.slice(0, -1).join(', ')} and ${missing[missing.length - 1]}`;
  return `Password must include ${list}.`;
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function clean(value) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeHeader(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

// MySQL CURRENT_TIMESTAMP values are UTC without a zone marker. Browsers
// otherwise parse them as local time, so expose them as explicit UTC ISO text.
function dbTimestamp(value) {
  if (!value) return null;
  const text = String(value);
  return /(?:Z|[+-]\d{2}:?\d{2})$/i.test(text) ? text : text.replace(' ', 'T') + 'Z';
}

const HEADER_ALIASES = {
  id: ['id', 'idnumber', 'idno', 'studentid', 'facultyid', 'userid', 'studentnumber', 'facultyidnumber', 'accountid'],
  name: ['name', 'fullname', 'studentname', 'facultyname', 'displayname'],
  role: ['role', 'usertype', 'accounttype', 'type'],
  email: ['email', 'emailaddress', 'schoolmail', 'schoolemail', 'mail', 'emailadd'],
  unit: ['program', 'department', 'unit', 'dept', 'programdepartment', 'departmentprogram', 'position'],
  subj: ['subject', 'subjects', 'subjectcourse', 'course', 'subjecttaught', 'specialization']
};

function normalizeRole(value) {
  const role = clean(value).toLowerCase();
  if (role === 'student') return 'student';
  if (role === 'faculty') return 'faculty';
  if (role === 'admin' || role === 'administrator') return 'administrator';
  return '';
}

function clientRole(dbRole) {
  return dbRole === 'administrator' ? 'admin' : dbRole;
}

function requireSelectedRole(value) {
  const role = normalizeRole(value);
  if (!role) throw httpError(400, 'Select a valid import role: student, faculty, or administrator.');
  return role;
}

// The "Add one account" form no longer asks for an ID. Student IDs follow the
// current year plus a four-digit sequence (2026-0001); faculty IDs follow the
// existing F-#### pattern. The scan runs inside the insert transaction.
function nextUsername(role, takenUsernames) {
  const taken = new Set(Array.from(takenUsernames, (value) => String(value).toLowerCase()));
  if (role === 'faculty') {
    let max = 1000;
    for (const username of takenUsernames) {
      const match = /^F-(\d{1,6})$/i.exec(String(username));
      if (match) max = Math.max(max, Number(match[1]));
    }
    let sequence = max + 1;
    let candidate = `F-${String(sequence).padStart(4, '0')}`;
    while (taken.has(candidate.toLowerCase())) {
      sequence += 1;
      candidate = `F-${String(sequence).padStart(4, '0')}`;
    }
    return candidate;
  }
  const year = new Date().getFullYear();
  let max = 0;
  for (const username of takenUsernames) {
    const match = /^(\d{4})-(\d{1,6})$/.exec(String(username));
    if (match && Number(match[1]) === year) max = Math.max(max, Number(match[2]));
  }
  let sequence = max + 1;
  let candidate = `${year}-${String(sequence).padStart(4, '0')}`;
  while (taken.has(candidate.toLowerCase())) {
    sequence += 1;
    candidate = `${year}-${String(sequence).padStart(4, '0')}`;
  }
  return candidate;
}

function normalizeEmail(value) {
  return clean(value).toLowerCase();
}

function validEmail(value) {
  if (!value || value.length > 254) return false;
  const at = value.lastIndexOf('@');
  if (at < 1 || at === value.length - 1) return false;
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  if (local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  if (!/^[A-Za-z0-9.!#$%&'*+=?^_`{|}~-]+$/.test(local)) return false;
  const labels = domain.split('.');
  if (labels.length < 2) return false;
  const labelPattern = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
  if (!labels.every((label) => labelPattern.test(label))) return false;
  return /^[A-Za-z]{2,}$/.test(labels[labels.length - 1]);
}

function approvedEmailDomains() {
  return String(process.env.ALLOWED_EMAIL_DOMAINS || '')
    .split(',')
    .map((domain) => domain.trim().toLowerCase().replace(/^@/, ''))
    .filter(Boolean);
}

function emailDomainApproved(email) {
  const domains = approvedEmailDomains();
  if (!domains.length) return true;
  const domain = email.split('@')[1] || '';
  return domains.some((allowed) => domain === allowed || domain.endsWith('.' + allowed));
}

function canonicalProgram(value) {
  const normalized = clean(value).toLowerCase();
  return PROGRAMS.find((program) => program.toLowerCase() === normalized) || '';
}

function mapImportTable(table) {
  if (!Array.isArray(table) || table.length === 0) {
    throw httpError(400, 'The import file is empty.');
  }
  if (table.length - 1 > MAX_IMPORT_ROWS) {
    throw httpError(400, `Import at most ${MAX_IMPORT_ROWS} accounts at a time.`);
  }

  const header = Array.isArray(table[0]) ? table[0] : [];
  if (!header.length) throw httpError(400, 'The import file has no header row.');

  const normalizedHeaders = header.map(normalizeHeader);
  const indexes = {};
  Object.keys(HEADER_ALIASES).forEach((field) => {
    indexes[field] = normalizedHeaders.findIndex((headerName) => HEADER_ALIASES[field].includes(headerName));
  });

  const missing = ['id', 'name', 'email'].filter((field) => indexes[field] < 0);
  if (missing.length) {
    throw httpError(400, 'The import file must include id, name, and email columns. Download the example format.');
  }

  const rows = [];
  for (let index = 1; index < table.length; index += 1) {
    const source = Array.isArray(table[index]) ? table[index] : [];
    if (source.every((cell) => clean(cell) === '')) continue;
    const pick = (field) => indexes[field] >= 0 ? (source[indexes[field]] == null ? '' : source[indexes[field]]) : '';
    rows.push({
      rowNumber: index + 1,
      id: pick('id'),
      name: pick('name'),
      role: pick('role'),
      email: pick('email'),
      unit: pick('unit'),
      subj: pick('subj')
    });
  }

  if (!rows.length) throw httpError(400, 'The import file has no data rows.');
  return rows;
}

async function loadExistingAccounts() {
  const rows = await all('SELECT lower(trim(username)) AS username, lower(trim(email)) AS email FROM accounts');
  const usernames = new Set();
  const emails = new Set();
  rows.forEach((row) => {
    if (row.username) usernames.add(row.username);
    if (row.email) emails.add(row.email);
  });
  return { usernames, emails };
}

function validateImportRows(rawRows, selectedRole, existing) {
  const seenIds = new Set();
  const seenEmails = new Set();
  const domains = approvedEmailDomains();

  return rawRows.map((raw) => {
    const errors = [];
    const id = clean(raw.id);
    const name = clean(raw.name);
    const email = normalizeEmail(raw.email);
    const roleValue = clean(raw.role);
    let declaredRole = '';
    let unit = clean(raw.unit);
    const subj = clean(raw.subj);

    if (!id) {
      errors.push('ID number is required.');
    } else if (!/^[A-Za-z0-9][A-Za-z0-9-]{2,31}$/.test(id)) {
      errors.push('ID number must be 3-32 characters using letters, numbers, or hyphens.');
    } else {
      const idKey = id.toLowerCase();
      if (existing.usernames.has(idKey)) errors.push('This ID number already exists.');
      if (seenIds.has(idKey)) errors.push('Duplicate ID number in this file.');
      seenIds.add(idKey);
    }

    if (!name) {
      errors.push('Full name is required.');
    } else if (name.length < 2 || name.length > 120) {
      errors.push('Full name must be 2-120 characters.');
    }

    if (roleValue) {
      const rowRole = normalizeRole(roleValue);
      if (!rowRole) {
        errors.push('Role must be student, faculty, or administrator.');
      } else {
        declaredRole = clientRole(rowRole);
        if (rowRole !== selectedRole) {
          errors.push(`Role "${clientRole(rowRole)}" does not match the selected import role "${clientRole(selectedRole)}".`);
        }
      }
    }

    if (!email) {
      errors.push('Email address is required.');
    } else {
      const emailKey = email.toLowerCase();
      if (!validEmail(email)) errors.push('Enter a valid email address.');
      if (domains.length && !emailDomainApproved(email)) {
        errors.push('Use an approved school or organization email domain.');
      }
      if (existing.emails.has(emailKey)) errors.push('This email address is already used by another account.');
      if (seenEmails.has(emailKey)) errors.push('Duplicate email address in this file.');
      seenEmails.add(emailKey);
    }

    if (!unit) {
      errors.push('Program or position is required.');
    } else if (selectedRole === 'student') {
      const program = canonicalProgram(unit);
      if (!program) {
        errors.push(`Program must be one of: ${PROGRAMS.join(', ')}.`);
      } else {
        unit = program;
      }
    } else {
      if (unit.length > 100) errors.push('Program or position must be 100 characters or fewer.');
      const program = canonicalProgram(unit);
      if (program) unit = program;
    }

    if (selectedRole === 'faculty' && !subj) {
      errors.push('At least one subject is required for a faculty account.');
    }
    if (subj.length > 200) errors.push('Subjects must be 200 characters or fewer.');

    return {
      rowNumber: raw.rowNumber,
      id,
      name,
      email,
      role: clientRole(selectedRole),
      declaredRole,
      unit,
      subj,
      errors,
      err: errors[0] || '',
      valid: errors.length === 0
    };
  });
}

let transactionQueue = Promise.resolve();
async function withTransaction(work) {
  const execute = async () => {
    await run('BEGIN IMMEDIATE');
    try {
      const result = await work();
      await run('COMMIT');
      return result;
    } catch (error) {
      try {
        await run('ROLLBACK');
      } catch (_) {
        // Ignore rollback failures; the original error is more useful.
      }
      throw error;
    }
  };
  const next = transactionQueue.then(execute, execute);
  transactionQueue = next.then(() => undefined, () => undefined);
  return next;
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function tempCredentials() {
  const password = randomPassword(TEMP_PASSWORD_LENGTH);
  const hash = await bcrypt.hash(password, TEMP_PASSWORD_COST);
  return { password, hash };
}

async function insertAccount(dbRole, row, actor, credentials) {
  let accountId;
  try {
    const inserted = await run(
      `INSERT INTO accounts (full_name, username, password_hash, role, program, email, password_set, must_change_password)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1)`,
      [row.name, row.id, credentials.hash, dbRole, row.unit, row.email]
    );
    accountId = inserted.id;
  } catch (error) {
    if (String(error.code || '').startsWith('SQLITE_CONSTRAINT')) {
      throw httpError(409, 'This account or email was just created by another request. Reload and try again.');
    }
    throw error;
  }

  const delivery = await run(
    `INSERT INTO email_deliveries (account_id, kind, delivery_version, recipient, status, attempts, last_error)
     VALUES (?, 'credentials', 1, ?, 'pending', 0, '')`,
    [accountId, row.email]
  );

  await run(
    'INSERT INTO activity_logs (actor, action, details) VALUES (?, ?, ?)',
    [actor || 'system', 'Account created', `${row.id} (${clientRole(dbRole)}) - temporary password email queued`]
  );

  return {
    created: {
      accountId,
      id: row.id,
      name: row.name,
      email: row.email,
      role: clientRole(dbRole),
      unit: row.unit,
      subj: row.subj,
      deliveryId: delivery.id,
      password: credentials.password
    },
    job: { deliveryId: delivery.id, password: credentials.password, version: 1 }
  };
}

async function previewImport({ role, table }) {
  const selectedRole = requireSelectedRole(role);
  const rawRows = mapImportTable(table);
  const existing = await loadExistingAccounts();
  const rows = validateImportRows(rawRows, selectedRole, existing);
  const invalid = rows.filter((row) => !row.valid).length;
  return {
    role: clientRole(selectedRole),
    total: rows.length,
    valid: rows.length - invalid,
    invalid,
    rows
  };
}

async function importAccounts({ role, table, actor }) {
  const selectedRole = requireSelectedRole(role);
  const rawRows = mapImportTable(table);

  // Hash credentials before taking the write lock. bcrypt is CPU-bound, and
  // hashing inside the transaction would keep the database locked for a long time.
  const previewExisting = await loadExistingAccounts();
  const preRows = validateImportRows(rawRows, selectedRole, previewExisting);
  const credentialsByRow = new Map();
  for (const row of preRows) {
    if (row.valid) credentialsByRow.set(row.rowNumber, await tempCredentials());
  }

  const result = await withTransaction(async () => {
    const existing = await loadExistingAccounts();
    const rows = validateImportRows(rawRows, selectedRole, existing);
    const created = [];
    const jobs = [];

    for (const row of rows) {
      if (!row.valid) continue;
      const credentials = credentialsByRow.get(row.rowNumber) || await tempCredentials();
      const inserted = await insertAccount(selectedRole, row, actor, credentials);
      created.push(inserted.created);
      jobs.push(inserted.job);
    }

    return { rows, created, jobs };
  });

  result.jobs.forEach(enqueueDelivery);
  return {
    role: clientRole(selectedRole),
    total: result.rows.length,
    valid: result.created.length,
    invalid: result.rows.length - result.created.length,
    created: result.created,
    rows: result.rows
  };
}

async function createAccount({ full_name, username, email, role, program, subject, actor }) {
  const selectedRole = requireSelectedRole(role);
  if (selectedRole === 'administrator') {
    throw httpError(400, 'Only student and faculty accounts can be created from this form.');
  }

  const result = await withTransaction(async () => {
    const existing = await loadExistingAccounts();
    const rawRow = {
      rowNumber: 1,
      id: clean(username) || nextUsername(selectedRole, existing.usernames),
      name: full_name,
      email,
      role,
      unit: program,
      subj: subject
    };
    const row = validateImportRows([rawRow], selectedRole, existing)[0];
    if (!row.valid) {
      const conflict = row.errors.some((message) => /already exists|already used/i.test(message));
      throw httpError(conflict ? 409 : 400, row.err);
    }
    const credentials = await tempCredentials();
    return insertAccount(selectedRole, row, actor, credentials);
  });

  enqueueDelivery(result.job);
  return result.created;
}

async function getSetupTokenInfo(token) {
  const value = String(token || '').trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(value)) return { valid: false, reason: 'invalid' };

  const row = await get(
    `SELECT t.id, t.expires_at, t.used_at, t.revoked_at, a.username, a.full_name, a.password_set
     FROM account_setup_tokens t
     JOIN accounts a ON a.id = t.account_id
     WHERE t.token_hash = ?`,
    [sha256(value)]
  );

  if (!row) return { valid: false, reason: 'invalid' };
  if (row.used_at || row.password_set) return { valid: false, reason: 'used' };
  if (row.revoked_at) return { valid: false, reason: 'revoked' };
  if (new Date(row.expires_at).getTime() <= Date.now()) return { valid: false, reason: 'expired' };

  return {
    valid: true,
    username: row.username,
    fullName: row.full_name,
    expiresAt: row.expires_at
  };
}

async function setupPassword({ token, password }) {
  const value = String(token || '').trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(value)) throw httpError(400, 'This setup link is invalid or has expired.');

  const next = String(password == null ? '' : password);
  const policyError = passwordPolicyError(next);
  if (policyError) throw httpError(400, policyError);

  return withTransaction(async () => {
    const row = await get(
      `SELECT t.id, t.account_id, t.expires_at, t.used_at, t.revoked_at, a.username, a.password_set
       FROM account_setup_tokens t
       JOIN accounts a ON a.id = t.account_id
       WHERE t.token_hash = ?`,
      [sha256(value)]
    );

    if (!row || row.used_at || row.revoked_at || row.password_set || new Date(row.expires_at).getTime() <= Date.now()) {
      throw httpError(400, 'This setup link is invalid or has expired.');
    }

    const hash = await bcrypt.hash(next, 12);
    await run('UPDATE accounts SET password_hash = ?, password_set = 1, must_change_password = 0 WHERE id = ?', [hash, row.account_id]);
    await run('UPDATE account_setup_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ? AND used_at IS NULL', [row.id]);
    await run(
      `UPDATE account_setup_tokens SET revoked_at = CURRENT_TIMESTAMP
       WHERE account_id = ? AND id <> ? AND used_at IS NULL AND revoked_at IS NULL`,
      [row.account_id, row.id]
    );
    await run(
      'INSERT INTO activity_logs (actor, action, details) VALUES (?, ?, ?)',
      [row.username, 'Password setup', 'Account password set through the email setup link']
    );

    return { username: row.username };
  });
}

async function changePassword({ username, currentPassword, newPassword }) {
  const current = String(currentPassword == null ? '' : currentPassword);
  const next = String(newPassword == null ? '' : newPassword);
  const policyError = passwordPolicyError(next);
  if (policyError) throw httpError(400, policyError);
  if (next === current) throw httpError(400, 'New password must be different from the current password.');

  const account = await get(
    'SELECT id, username, password_hash, password_set, must_change_password FROM accounts WHERE username = ?',
    [username]
  );
  if (!account || !account.password_set) throw httpError(401, 'Your session is no longer valid. Sign in again.');

  const matches = await bcrypt.compare(current, account.password_hash);
  if (!matches) throw httpError(400, 'Current password is incorrect.');

  const hash = await bcrypt.hash(next, 12);
  const wasTemporary = Boolean(account.must_change_password);
  await withTransaction(async () => {
    await run('UPDATE accounts SET password_hash = ?, must_change_password = 0 WHERE id = ?', [hash, account.id]);
    await run(
      `UPDATE account_setup_tokens SET revoked_at = CURRENT_TIMESTAMP
       WHERE account_id = ? AND used_at IS NULL AND revoked_at IS NULL`,
      [account.id]
    );
    await run(
      'INSERT INTO activity_logs (actor, action, details) VALUES (?, ?, ?)',
      [
        account.username,
        'Password changed',
        wasTemporary ? 'Temporary password replaced on first sign-in' : 'Password updated from the account settings page'
      ]
    );
  });

  return { username: account.username, mustChangePassword: false };
}

function randomPassword(length) {
  const groups = [
    'ABCDEFGHJKLMNPQRSTUVWXYZ',
    'abcdefghijkmnopqrstuvwxyz',
    '23456789',
    '!@#$%?*'
  ];
  const all = groups.join('');
  const chars = groups.map((group) => group[crypto.randomInt(group.length)]);
  while (chars.length < length) chars.push(all[crypto.randomInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

async function resetPassword({ username, actor }) {
  const account = await get('SELECT id, full_name, username, email FROM accounts WHERE username = ?', [username]);
  if (!account) throw httpError(404, 'Account not found.');

  const password = randomPassword(12);
  const hash = await bcrypt.hash(password, 12);
  const result = await withTransaction(async () => {
    await run(
      'UPDATE accounts SET password_hash = ?, password_set = 1, must_change_password = 1 WHERE id = ?',
      [hash, account.id]
    );
    await run(
      `UPDATE account_setup_tokens SET revoked_at = CURRENT_TIMESTAMP
       WHERE account_id = ? AND used_at IS NULL AND revoked_at IS NULL`,
      [account.id]
    );

    const email = normalizeEmail(account.email || '');
    let job = null;
    if (validEmail(email) && emailDomainApproved(email)) {
      const delivery = await get(
        `SELECT id, delivery_version FROM email_deliveries
         WHERE account_id = ? AND kind = 'credentials'`,
        [account.id]
      );
      const version = delivery ? Number(delivery.delivery_version || 1) + 1 : 1;
      let deliveryId;
      if (delivery) {
        deliveryId = delivery.id;
        await run(
          `UPDATE email_deliveries
           SET token_id = NULL, delivery_version = ?, recipient = ?, status = 'pending',
               attempts = 0, last_error = '', sent_at = NULL, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [version, email, deliveryId]
        );
      } else {
        const inserted = await run(
          `INSERT INTO email_deliveries (account_id, kind, delivery_version, recipient, status, attempts, last_error)
           VALUES (?, 'credentials', ?, ?, 'pending', 0, '')`,
          [account.id, version, email]
        );
        deliveryId = inserted.id;
      }
      job = { deliveryId, password, version };
    } else {
      // Invalidate any earlier queued credential email when there is no usable address.
      await run(
        `UPDATE email_deliveries
         SET delivery_version = delivery_version + 1,
             status = CASE WHEN status = 'pending' THEN 'failed' ELSE status END,
             last_error = CASE WHEN status = 'pending' THEN 'No valid email address is on file.' ELSE last_error END,
             updated_at = CURRENT_TIMESTAMP
         WHERE account_id = ?`,
        [account.id]
      );
    }

    await run(
      'INSERT INTO activity_logs (actor, action, details) VALUES (?, ?, ?)',
      [actor || 'system', 'Password reset', `${account.full_name} (${account.username}) - temporary password issued; change required on first sign-in${job ? '; credentials email queued' : '; no email on file'}`]
    );
    return { job, email };
  });

  if (result.job) enqueueDelivery(result.job);
  return {
    username: account.username,
    password,
    email: result.email,
    emailQueued: Boolean(result.job),
    mustChangePassword: true
  };
}

async function updateAccountEmail({ username, email, actor }) {
  const key = clean(username);
  if (!key) throw httpError(400, 'Account ID is required.');

  const next = normalizeEmail(email);
  if (!next) throw httpError(400, 'Email address is required.');
  if (!validEmail(next)) throw httpError(400, 'Enter a valid email address.');
  if (!emailDomainApproved(next)) {
    throw httpError(400, 'Use an approved school or organization email domain.');
  }

  return withTransaction(async () => {
    const account = await get(
      'SELECT id, username, full_name, role, program, email, must_change_password FROM accounts WHERE username = ?',
      [key]
    );
    if (!account) throw httpError(404, 'Account not found.');

    const duplicate = await get(
      'SELECT username FROM accounts WHERE id <> ? AND lower(trim(email)) = ?',
      [account.id, next]
    );
    if (duplicate) throw httpError(409, 'This email address is already used by another account.');

    const previous = account.email || '';
    await run('UPDATE accounts SET email = ? WHERE id = ?', [next, account.id]);
    await run(
      `UPDATE email_deliveries
       SET recipient = ?, updated_at = CURRENT_TIMESTAMP
       WHERE account_id = ? AND status IN ('pending', 'failed')`,
      [next, account.id]
    );
    await run(
      'INSERT INTO activity_logs (actor, action, details) VALUES (?, ?, ?)',
      [actor || 'system', 'Account email updated', `${account.username} - ${previous || 'none'} -> ${next}`]
    );

    return {
      account: {
        id: account.username,
        name: account.full_name,
        email: next,
        role: clientRole(account.role),
        unit: account.program,
        mustChangePassword: Boolean(account.must_change_password)
      }
    };
  });
}

async function listEmailDeliveries() {
  const rows = await all(
    `SELECT d.id, d.account_id, d.kind, d.recipient, d.status, d.attempts, d.last_error,
            d.sent_at, d.created_at, d.updated_at,
            a.username, a.full_name, a.role, a.program, a.password_set, a.must_change_password
     FROM email_deliveries d
     JOIN accounts a ON a.id = d.account_id
     ORDER BY CASE d.status WHEN 'failed' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END,
              d.updated_at DESC, d.id DESC
     LIMIT 500`
  );
  return rows.map((row) => ({
    ...row,
    role: clientRole(row.role),
    sent_at: dbTimestamp(row.sent_at),
    created_at: dbTimestamp(row.created_at),
    updated_at: dbTimestamp(row.updated_at)
  }));
}

async function retryDelivery({ deliveryId, actor }) {
  const id = Number(deliveryId);
  if (!Number.isInteger(id) || id < 1) throw httpError(400, 'Invalid email delivery.');

  const result = await withTransaction(async () => {
    const delivery = await get(
      `SELECT d.*, a.username, a.email, a.full_name, a.password_set, a.must_change_password
       FROM email_deliveries d
       JOIN accounts a ON a.id = d.account_id
       WHERE d.id = ?`,
      [id]
    );
    if (!delivery) throw httpError(404, 'Email delivery not found.');

    // Legacy pending accounts (password_set = 0) can still receive credentials.
    const waiting = !delivery.password_set || Boolean(delivery.must_change_password);
    if (!waiting) {
      throw httpError(409, 'This account has already changed its temporary password. Use Reset password to issue a new one.');
    }

    const email = normalizeEmail(delivery.email || delivery.recipient);
    if (!validEmail(email)) throw httpError(400, 'This account has no valid email address on file.');

    const credentials = await tempCredentials();

    await run(
      'UPDATE accounts SET password_hash = ?, password_set = 1, must_change_password = 1 WHERE id = ?',
      [credentials.hash, delivery.account_id]
    );
    // Any legacy setup link for this account stops working.
    await run(
      `UPDATE account_setup_tokens SET revoked_at = CURRENT_TIMESTAMP
       WHERE account_id = ? AND used_at IS NULL AND revoked_at IS NULL`,
      [delivery.account_id]
    );

    const nextVersion = Number(delivery.delivery_version || 1) + 1;
    await run(
      `UPDATE email_deliveries
       SET token_id = NULL, delivery_version = ?, recipient = ?, status = 'pending', last_error = '',
           sent_at = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [nextVersion, email, id]
    );
    await run(
      'INSERT INTO activity_logs (actor, action, details) VALUES (?, ?, ?)',
      [actor || 'system', 'Account credentials reissued', `Delivery #${id} for ${delivery.username}`]
    );

    return {
      username: delivery.username,
      email,
      password: credentials.password,
      job: { deliveryId: id, password: credentials.password, version: nextVersion }
    };
  });

  enqueueDelivery(result.job);
  return result;
}

function sanitizeError(error) {
  let message = String((error && (error.code ? `${error.code}: ${error.message}` : error.message)) || 'Email delivery failed.');
  message = message.replace(/\/setup\?token=[A-Za-z0-9]+/g, '/setup?token=[redacted]');
  message = message.replace(/\s+/g, ' ').trim().slice(0, 500);
  return message || 'Email delivery failed.';
}

const sendQueue = [];
let activeSends = 0;
const maxActiveSends = Math.max(1, Math.min(10, Number(process.env.EMAIL_QUEUE_CONCURRENCY) || 3));

function enqueueDelivery(job) {
  if (!job) return;
  sendQueue.push(job);
  pumpSendQueue();
}

function pumpSendQueue() {
  while (activeSends < maxActiveSends && sendQueue.length) {
    const job = sendQueue.shift();
    activeSends += 1;
    processDelivery(job)
      .catch((error) => {
        console.error(`Setup email queue error for delivery ${job.deliveryId}: ${sanitizeError(error)}`);
      })
      .finally(() => {
        activeSends -= 1;
        pumpSendQueue();
      });
  }
}

async function processDelivery(job) {
  const delivery = await get(
    `SELECT d.id, d.delivery_version, d.recipient, d.status,
            a.username, a.full_name, a.password_set, a.must_change_password
     FROM email_deliveries d
     JOIN accounts a ON a.id = d.account_id
     WHERE d.id = ?`,
    [job.deliveryId]
  );
  if (!delivery || delivery.status === 'sent') return;
  // A newer retry replaced this job; never send an older temporary password.
  if (Number(delivery.delivery_version) !== Number(job.version)) return;
  // The account already signed in and replaced its temporary password.
  if (!delivery.password_set || !delivery.must_change_password) return;

  try {
    await sendCredentialsEmail({
      to: delivery.recipient,
      name: delivery.full_name,
      username: delivery.username,
      password: job.password
    });
    await run(
      `UPDATE email_deliveries
       SET status = 'sent', attempts = attempts + 1, last_error = '', sent_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND delivery_version = ?`,
      [job.deliveryId, job.version]
    );
  } catch (error) {
    const message = sanitizeError(error);
    await run(
      `UPDATE email_deliveries
       SET status = 'failed', attempts = attempts + 1, last_error = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND delivery_version = ?`,
      [message, job.deliveryId, job.version]
    );
    console.error(`Account email delivery ${job.deliveryId} failed: ${message}`);
  }
}

module.exports = {
  PROGRAMS,
  PASSWORD_MIN,
  PASSWORD_MAX,
  previewImport,
  importAccounts,
  createAccount,
  getSetupTokenInfo,
  setupPassword,
  changePassword,
  resetPassword,
  updateAccountEmail,
  listEmailDeliveries,
  retryDelivery,
  httpError
};
