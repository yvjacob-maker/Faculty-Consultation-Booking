require('dotenv').config({ quiet: true });
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('./src/database');
const accounts = require('./src/accounts');
const { isMailConfigured } = require('./src/mailer');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = String(process.env.SESSION_SECRET || '').trim();
if (SESSION_SECRET.length < 32 || /change-this|replace-with/i.test(SESSION_SECRET)) {
  console.error('SESSION_SECRET is missing or too weak. Set a long random value in .env before starting.');
  process.exit(1);
}

function wrap(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true, limit: '6mb' }));
app.use(express.json({ limit: '6mb' }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
// Serve the installed jQuery package locally instead of depending on a CDN.
app.use('/vendor/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
// Photos and videos sent through the Messages page are saved here and served back
// by URL, so the JSON state stays small.
const UPLOAD_DIR = path.join(__dirname, 'data', 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR, {
  maxAge: '7d',
  setHeaders: (res, filePath) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Photos and videos can display inline; everything else downloads instead.
    if (!/\.(jpe?g|png|gif|webp|bmp|avif|heic|heif|mp4|webm|ogv|mov|avi|mpeg|3gp)$/i.test(filePath)) {
      res.setHeader('Content-Disposition', 'attachment');
    }
  }
}));

function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Please log in first.' });
  next();
}
function requirePasswordCurrent(req, res, next) {
  if (req.session.user && req.session.user.mustChangePassword) {
    return res.status(403).json({
      error: 'Change your temporary password before continuing.',
      code: 'PASSWORD_CHANGE_REQUIRED'
    });
  }
  next();
}
function requireRole(...roles) {
  return (req, res, next) => {
    const actualRole = req.session.user && req.session.user.role === 'admin' ? 'administrator' : req.session.user && req.session.user.role;
    if (!req.session.user || !(roles.includes(actualRole) || roles.includes(req.session.user.role))) return res.status(403).json({ error: 'You do not have permission to do this.' });
    if (req.session.user.mustChangePassword) {
      return res.status(403).json({
        error: 'Change your temporary password before continuing.',
        code: 'PASSWORD_CHANGE_REQUIRED'
      });
    }
    next();
  };
}


app.get('/', (req, res) => res.render('index', { title: 'CCS Faculty Consultation Booking' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', database: 'sqlite' }));

// The existing rich client keeps its current data model. This compatibility API
// stores that model in SQLite so records are shared across browsers/devices.
// Passwords live only in the accounts table; strip legacy client password fields
// before data is returned or persisted through this compatibility endpoint.
function withoutClientPassword(user) {
  if (!user || typeof user !== 'object') return user;
  const copy = { ...user };
  delete copy.pw;
  // First-login state belongs to the server session, not shared browser state.
  delete copy.mustChangePassword;
  return copy;
}
function sanitizeStateValue(key, value) {
  if (key === 'sis-users-v7' && Array.isArray(value)) return value.map(withoutClientPassword);
  return value;
}
app.get('/api/app-state', (req, res) => {
  db.all('SELECT state_key, state_json FROM app_state', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Could not load saved application data.' });
    const state = {};
    rows.forEach(row => {
      try { state[row.state_key] = sanitizeStateValue(row.state_key, JSON.parse(row.state_json)); } catch (_) {}
    });
    res.json({ state });
  });
});
app.put('/api/app-state', (req, res) => {
  const state = req.body && req.body.state;
  if (!state || typeof state !== 'object' || Array.isArray(state)) return res.status(400).json({ error: 'A state object is required.' });
  const entries = Object.entries(state)
    .filter(([key]) => /^sis-[a-z0-9-]+-v7$/.test(key))
    .map(([key, value]) => [key, sanitizeStateValue(key, value)]);
  const users = state['sis-users-v7'];
  const bookings = state['sis-consult-v7'];
  db.serialize(() => {
    const stmt = db.prepare('INSERT INTO app_state (state_key, state_json, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(state_key) DO UPDATE SET state_json=excluded.state_json, updated_at=CURRENT_TIMESTAMP');
    entries.forEach(([key, value]) => stmt.run(key, JSON.stringify(value)));
    stmt.finalize(err => {
      if (err) return res.status(500).json({ error: 'Could not save application data.' });
      // Keep searchable relational copies for the required database entities.
      db.serialize(() => {
        if (Array.isArray(bookings)) {
          db.run('DELETE FROM bookings');
          const bp = db.prepare(`INSERT INTO bookings (student_id, faculty_id, subject, consultation_date, consultation_time, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)`);
          bookings.forEach(b => bp.run(String(b.sid || ''), String(b.fid || ''), String(b.topic || ''), String(b.date || '2000-01-01'), String(b.time || '00:00'), String(b.note || ''), String(b.status || 'Pending')));
          bp.finalize();
        }
      });

      // The accounts table is authoritative after the first run. Only use the
      // client state to bootstrap a brand-new database; after that, account
      // creation and password changes go through the validated server routes.
      db.get('SELECT COUNT(*) AS count FROM accounts', [], (countError, row) => {
        if (countError) return res.status(500).json({ error: 'Could not check account data.' });
        if (!row || row.count > 0 || !Array.isArray(users)) {
          return res.json({ message: 'Application data saved to SQLite.', savedKeys: entries.length });
        }

        const bootstrapUsers = users.filter(u => u && u.id && u.name && u.pw && ['student', 'faculty', 'admin'].includes(u.role));
        if (!bootstrapUsers.length) {
          return res.json({ message: 'Application data saved to SQLite.', savedKeys: entries.length });
        }

        Promise.all(bootstrapUsers.map(u =>
          bcrypt.hash(String(u.pw), 10).then(hash => ({ u, hash }))
        )).then(hashedUsers => {
          const up = db.prepare(`INSERT INTO accounts (full_name, username, password_hash, role, program) VALUES (?, ?, ?, ?, ?) ON CONFLICT(username) DO NOTHING`);
          hashedUsers.forEach(({ u, hash }) => {
            up.run(String(u.name), String(u.id), hash, u.role === 'admin' ? 'administrator' : u.role, String(u.unit || ''));
          });
          up.finalize(finalizeError => {
            if (finalizeError) {
              console.error('Could not bootstrap account records:', finalizeError.message);
              return res.status(500).json({ error: 'Could not initialize account records.' });
            }
            res.json({ message: 'Application data saved to SQLite.', savedKeys: entries.length });
          });
        }).catch(error => {
          console.error('Could not bootstrap account records:', error.message);
          res.status(500).json({ error: 'Could not initialize account records.' });
        });
      });
    });
  });
});

// Login uses bcryptjs to compare the submitted password with its stored hash.
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  db.get('SELECT id, full_name, username, password_hash, password_set, must_change_password, role, program, email FROM accounts WHERE username = ?', [username.trim()], (err, user) => {
    if (err) return res.status(500).json({ error: 'Could not verify login.' });
    if (!user || !user.password_set) return res.status(401).json({ error: 'Invalid username or password.' });
    bcrypt.compare(password, user.password_hash, (compareErr, valid) => {
      if (compareErr || !valid) return res.status(401).json({ error: 'Invalid username or password.' });
      req.session.regenerate((sessionErr) => {
        if (sessionErr) return res.status(500).json({ error: 'Could not start a session.' });
        req.session.user = {
          id: user.id,
          full_name: user.full_name,
          username: user.username,
          role: user.role === 'administrator' ? 'admin' : user.role,
          program: user.program,
          email: user.email || '',
          mustChangePassword: Boolean(user.must_change_password)
        };
        db.run('INSERT INTO activity_logs (actor, action, details) VALUES (?, ?, ?)', [
          user.username,
          'Login',
          user.must_change_password ? 'User logged in with a temporary password; password change required' : 'User logged in'
        ]);
        res.json({ message: 'Login successful.', user: req.session.user });
      });
    });
  });
});
app.get('/api/session', (req, res) => res.json({ user: req.session.user || null }));
app.post('/api/logout', (req, res) => {
  const actor = req.session.user ? req.session.user.username : 'Unknown';
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Could not log out.' });
    res.clearCookie('connect.sid');
    db.run('INSERT INTO activity_logs (actor, action, details) VALUES (?, ?, ?)', [actor, 'Logout', 'User logged out']);
    res.json({ message: 'Logged out.' });
  });
});

// API endpoints provide persistent SQLite storage for the system.
app.get('/api/bookings', requireLogin, requirePasswordCurrent, (req, res) => {
  db.all('SELECT * FROM bookings ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Could not load bookings.' });
    res.json(rows);
  });
});
app.post('/api/bookings', requireLogin, requirePasswordCurrent, (req, res) => {
  const { student_id, faculty_id, subject, consultation_date, consultation_time, notes } = req.body;
  if (![student_id, faculty_id, subject, consultation_date, consultation_time].every(v => typeof v === 'string' && v.trim())) {
    return res.status(400).json({ error: 'Student, faculty, subject, date, and time are required.' });
  }
  db.run(`INSERT INTO bookings (student_id, faculty_id, subject, consultation_date, consultation_time, notes, status)
          VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
    [student_id.trim(), faculty_id.trim(), subject.trim(), consultation_date, consultation_time, String(notes || '').trim()],
    function (err) {
      if (err) return res.status(500).json({ error: 'Could not save booking.' });
      db.run('INSERT INTO activity_logs (actor, action, details) VALUES (?, ?, ?)',
        [student_id.trim(), 'Booking created', `Booking #${this.lastID}`]);
      res.status(201).json({ id: this.lastID, message: 'Booking saved.', status: 'Pending' });
    });
});
app.patch('/api/bookings/:id/status', requireRole('faculty', 'administrator'), (req, res) => {
  const { status, actor } = req.body;
  const allowed = ['Pending', 'Confirmed', 'Declined', 'Cancelled', 'Completed', 'Reschedule Requested'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid booking status.' });
  db.run('UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Could not update booking.' });
    if (!this.changes) return res.status(404).json({ error: 'Booking not found.' });
    db.run('INSERT INTO activity_logs (actor, action, details) VALUES (?, ?, ?)', [String(actor || 'System'), 'Booking status updated', `Booking #${req.params.id}: ${status}`]);
    res.json({ message: 'Booking status updated.' });
  });
});
app.get('/api/activity-logs', requireRole('administrator'), (req, res) => {
  db.all('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 500', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Could not load activity logs.' });
    res.json(rows);
  });
});
app.get('/api/accounts', requireRole('administrator'), (req, res) => {
  db.all('SELECT id, full_name, username, role, program, email, password_set, created_at FROM accounts ORDER BY full_name', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Could not load accounts.' });
    res.json(rows);
  });
});
app.post('/api/accounts', requireRole('administrator'), wrap(async (req, res) => {
  const created = await accounts.createAccount({
    full_name: req.body.full_name,
    username: req.body.username,
    email: req.body.email,
    role: req.body.role,
    program: req.body.program,
    subject: req.body.subject,
    actor: req.session.user.username
  });
  res.set('Cache-Control', 'no-store');
  res.status(201).json({
    id: created.accountId,
    message: `Account created. A temporary password is being emailed to ${created.email}.`,
    account: created,
    emailStatus: 'pending'
  });
}));

app.post('/api/admin/accounts/import/preview', requireRole('administrator'), wrap(async (req, res) => {
  const preview = await accounts.previewImport({ role: req.body.role, table: req.body.table });
  res.json(preview);
}));

app.post('/api/admin/accounts/import', requireRole('administrator'), wrap(async (req, res) => {
  const result = await accounts.importAccounts({
    role: req.body.role,
    table: req.body.table,
    actor: req.session.user.username
  });
  res.set('Cache-Control', 'no-store');
  res.status(201).json({
    ...result,
    message: result.created.length
      ? `${result.created.length} account${result.created.length === 1 ? '' : 's'} created. Temporary passwords are being emailed.`
      : 'No valid accounts were imported.'
  });
}));

app.get('/api/admin/email-deliveries', requireRole('administrator'), wrap(async (req, res) => {
  const deliveries = await accounts.listEmailDeliveries();
  res.json({ deliveries, mailConfigured: isMailConfigured() });
}));

app.post('/api/admin/email-deliveries/:id/retry', requireRole('administrator'), wrap(async (req, res) => {
  const result = await accounts.retryDelivery({
    deliveryId: req.params.id,
    actor: req.session.user.username
  });
  res.set('Cache-Control', 'no-store');
  res.json({
    message: `A new temporary password was created for ${result.username} and is being emailed to ${result.email}. The previous password no longer works.`,
    username: result.username,
    password: result.password,
    email: result.email,
    emailStatus: 'pending'
  });
}));

app.post('/api/admin/accounts/:username/reset-password', requireRole('administrator'), wrap(async (req, res) => {
  const result = await accounts.resetPassword({
    username: req.params.username,
    actor: req.session.user.username
  });
  res.set('Cache-Control', 'no-store');
  res.json({
    message: result.emailQueued
      ? `Password reset. A new temporary password is being emailed to ${result.email}.`
      : 'Password reset. No email is on file, so share the temporary password manually.',
    username: result.username,
    password: result.password,
    email: result.email,
    emailQueued: result.emailQueued,
    mustChangePassword: true
  });
}));

app.post('/api/admin/accounts/:username/email', requireRole('administrator'), wrap(async (req, res) => {
  const result = await accounts.updateAccountEmail({
    username: req.params.username,
    email: req.body.email,
    actor: req.session.user.username
  });
  res.set('Cache-Control', 'no-store');
  res.json({
    message: `Email saved for ${result.account.id}.`,
    account: result.account
  });
}));

app.post('/api/account/password', requireLogin, wrap(async (req, res) => {
  const result = await accounts.changePassword({
    username: req.session.user.username,
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword
  });
  req.session.user.mustChangePassword = false;
  res.json({ message: 'Password changed.', mustChangePassword: false, username: result.username });
}));

app.post('/api/setup-password', wrap(async (req, res) => {
  const result = await accounts.setupPassword({
    token: req.body.token,
    password: req.body.password
  });
  res.json({ message: 'Password created. You can now sign in.', username: result.username });
}));

app.get('/setup', wrap(async (req, res) => {
  const token = String(req.query.token || '');
  const info = await accounts.getSetupTokenInfo(token);
  const messages = {
    invalid: 'This setup link is invalid. Ask the CCS Admin Office for a new link.',
    used: 'This setup link has already been used. Sign in with your password or ask the admin for a new link.',
    revoked: 'This setup link was replaced by a newer link. Use the latest email from the CCS Admin Office.',
    expired: 'This setup link has expired. Ask the CCS Admin Office to send a new one.'
  };
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; base-uri 'none'; form-action 'self'");
  res.status(info.valid ? 200 : 400).render('setup', {
    title: 'Set up your CCS account',
    valid: info.valid,
    token: info.valid ? token : '',
    username: info.valid ? info.username : '',
    fullName: info.valid ? info.fullName : '',
    expiresAt: info.valid ? info.expiresAt : '',
    message: info.valid ? '' : messages[info.reason] || messages.invalid
  });
}));

// Chat attachments: accept raw image/video bytes and return a URL the Messages
// page can render. Kept separate from /api/app-state so large files are not
// stored inside the JSON state.
const CHAT_MEDIA_TYPES = {
  'image/jpeg': ['.jpg', 'image'],
  'image/png': ['.png', 'image'],
  'image/gif': ['.gif', 'image'],
  'image/webp': ['.webp', 'image'],
  'image/bmp': ['.bmp', 'image'],
  'image/avif': ['.avif', 'image'],
  'image/heic': ['.heic', 'image'],
  'image/heif': ['.heif', 'image'],
  'video/mp4': ['.mp4', 'video'],
  'video/webm': ['.webm', 'video'],
  'video/ogg': ['.ogv', 'video'],
  'video/quicktime': ['.mov', 'video'],
  'video/x-msvideo': ['.avi', 'video'],
  'video/mpeg': ['.mpeg', 'video'],
  'video/3gpp': ['.3gp', 'video']
};
// Other files (documents, archives, code, etc.) are matched by extension.
const CHAT_FILE_TYPES = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.rtf': 'application/rtf',
  '.odt': 'application/vnd.oasis.opendocument.text',
  '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
  '.odp': 'application/vnd.oasis.opendocument.presentation',
  '.md': 'text/markdown',
  '.epub': 'application/epub+zip',
  '.zip': 'application/zip',
  '.rar': 'application/vnd.rar',
  '.7z': 'application/x-7z-compressed',
  '.tar': 'application/x-tar',
  '.gz': 'application/gzip',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.sql': 'application/sql',
  '.py': 'text/x-python',
  '.java': 'text/x-java-source',
  '.c': 'text/x-c',
  '.h': 'text/x-c',
  '.cpp': 'text/x-c++',
  '.cs': 'text/x-csharp',
  '.php': 'application/x-httpd-php',
  '.js': 'text/javascript',
  '.ts': 'text/plain',
  '.jsx': 'text/plain',
  '.tsx': 'text/plain',
  '.css': 'text/css',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff'
};
const CHAT_UPLOAD_MAX = 30 * 1024 * 1024;
app.post('/api/chat-upload', requireLogin, requirePasswordCurrent, express.raw({ type: () => true, limit: '30mb' }), (req, res) => {
  const mime = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  const mediaInfo = Object.prototype.hasOwnProperty.call(CHAT_MEDIA_TYPES, mime) ? CHAT_MEDIA_TYPES[mime] : null;
  let original = '';
  const rawName = String(req.headers['x-file-name'] || '');
  try { original = decodeURIComponent(rawName); } catch (_) { original = rawName; }
  original = path.basename(original).replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 160) || 'attachment';
  const requestedExt = path.extname(original).toLowerCase();
  const fileMime = Object.prototype.hasOwnProperty.call(CHAT_FILE_TYPES, requestedExt) ? CHAT_FILE_TYPES[requestedExt] : '';
  const kind = mediaInfo ? mediaInfo[1] : (fileMime ? 'file' : '');
  const saveExt = mediaInfo ? mediaInfo[0] : requestedExt;
  const body = Buffer.isBuffer(req.body) ? req.body : null;
  if (!kind) return res.status(415).json({ error: 'That file type is not supported. Send a photo, video, or a document/archive file.' });
  if (!body || !body.length) return res.status(400).json({ error: 'The selected file is empty.' });
  if (body.length > CHAT_UPLOAD_MAX) return res.status(413).json({ error: 'The file is too large. Photos, videos, and files must be 30 MB or smaller.' });
  const storedName = Date.now() + '-' + crypto.randomBytes(8).toString('hex') + saveExt;
  fs.promises.mkdir(UPLOAD_DIR, { recursive: true })
    .then(() => fs.promises.writeFile(path.join(UPLOAD_DIR, storedName), body))
    .then(() => res.status(201).json({
      url: '/uploads/' + storedName,
      type: kind,
      mime: mediaInfo ? mime : fileMime,
      name: original,
      size: body.length
    }))
    .catch((error) => {
      console.error('Could not save chat attachment:', error);
      res.status(500).json({ error: 'Could not save the file. Please try again.' });
    });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err && err.type === 'entity.too.large') return res.status(413).json({ error: 'The file is too large. Photos and videos must be 30 MB or smaller.' });
  if (err && err.status) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});
db.ready.then(() => {
  app.listen(PORT, () => console.log(`CCS Consultation System running at http://localhost:${PORT}`));
}).catch((error) => {
  console.error('Server did not start because the database could not be initialized:', error.message);
  process.exitCode = 1;
});
