const nodemailer = require('nodemailer');

function envBool(value, fallback = false) {
  if (value === undefined || value === null || String(value).trim() === '') return fallback;
  return /^(1|true|yes|on)$/i.test(String(value).trim());
}

function mailSettings() {
  const host = String(process.env.SMTP_HOST || '').trim();
  const user = String(process.env.SMTP_USER || '').trim();
  const pass = String(process.env.SMTP_PASS || '');
  const port = Number(process.env.SMTP_PORT) || 587;
  const from = String(process.env.MAIL_FROM || user || '').trim();
  const baseUrl = String(process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/+$/, '');
  const ttlHours = Math.max(1, Math.min(720, Number(process.env.SETUP_TOKEN_TTL_HOURS) || 48));
  return { host, user, pass, port, from, baseUrl, ttlHours };
}

function isMailConfigured() {
  const settings = mailSettings();
  return Boolean(settings.host && settings.from);
}

let transport = null;
let transportKey = '';

function getTransport() {
  const settings = mailSettings();
  if (!isMailConfigured()) {
    const error = new Error('Email service is not configured. Set SMTP_HOST and MAIL_FROM in .env.');
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }
  const key = [
    settings.host,
    settings.port,
    settings.user,
    settings.pass,
    envBool(process.env.SMTP_SECURE, settings.port === 465),
    envBool(process.env.SMTP_REQUIRE_TLS, false),
    envBool(process.env.SMTP_TLS_REJECT_UNAUTHORIZED, true)
  ].join('|');
  if (transport && transportKey === key) return transport;

  transport = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: envBool(process.env.SMTP_SECURE, settings.port === 465),
    requireTLS: envBool(process.env.SMTP_REQUIRE_TLS, false),
    auth: settings.user ? { user: settings.user, pass: settings.pass } : undefined,
    tls: {
      rejectUnauthorized: envBool(process.env.SMTP_TLS_REJECT_UNAUTHORIZED, true)
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    // Never enable Nodemailer's debug/logger output here: message bodies
    // contain one-time setup tokens.
    logger: false,
    debug: false
  });
  transportKey = key;
  return transport;
}

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

function setupUrl(token) {
  const settings = mailSettings();
  return `${settings.baseUrl}/setup?token=${encodeURIComponent(token)}`;
}

function signInUrl() {
  return `${mailSettings().baseUrl}/`;
}

// Current account-creation flow: the account is active immediately, but the
// recipient must replace this temporary password at first sign-in.
async function sendCredentialsEmail({ to, name, username, password }) {
  const settings = mailSettings();
  if (!isMailConfigured()) {
    const error = new Error('Email service is not configured. Set SMTP_HOST and MAIL_FROM in .env.');
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }

  const site = signInUrl();
  const safeName = escapeHtml(name || 'there');
  const safeUsername = escapeHtml(username);
  const safePassword = escapeHtml(password);
  const safeSite = escapeHtml(site);

  const text = [
    `Hello ${name || 'there'},`,
    '',
    'An account has been created for you in the CCS Faculty Consultation Booking System.',
    '',
    `User ID: ${username}`,
    `Temporary password: ${password}`,
    '',
    `Sign in here: ${site}`,
    '',
    'For your security you must change this temporary password immediately after signing in.',
    'The temporary password stops working once you set a new one.',
    'If you did not expect this account, please contact the CCS Admin Office.',
    '',
    'College of Computer Studies',
    'Camarines Sur Polytechnic Colleges'
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#e4eaf4;font-family:Arial,Helvetica,sans-serif;color:#12213d">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #d7deec">
    <tr>
      <td style="padding:24px 28px;background:#12213d;color:#ffffff">
        <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#d4ad5a;font-weight:bold">College of Computer Studies</div>
        <h1 style="margin:8px 0 0;font-size:22px;line-height:1.25">Faculty Consultation Booking System</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:28px">
        <p style="margin:0 0 14px">Hello ${safeName},</p>
        <p style="margin:0 0 18px">An account has been created for you in the CCS Faculty Consultation Booking System.</p>
        <p style="margin:0 0 6px;color:#4a5873;font-size:13px;text-transform:uppercase;letter-spacing:.08em">Your User ID</p>
        <p style="margin:0 0 16px;font-family:Consolas,monospace;font-size:18px;font-weight:bold">${safeUsername}</p>
        <p style="margin:0 0 6px;color:#4a5873;font-size:13px;text-transform:uppercase;letter-spacing:.08em">Temporary password</p>
        <p style="margin:0 0 20px;font-family:Consolas,monospace;font-size:18px;font-weight:bold;background:#f4f7fc;border:1px solid #d7deec;border-radius:8px;padding:10px 14px">${safePassword}</p>
        <p style="margin:0 0 20px"><a href="${safeSite}" style="display:inline-block;padding:11px 20px;border-radius:8px;background:#1f4e9c;color:#ffffff;text-decoration:none;font-weight:bold">Sign in and change password</a></p>
        <p style="margin:0;padding:12px 14px;background:#fdf6e6;border-left:4px solid #d4ad5a;color:#5a4a1f;font-size:13px">
          You must change this temporary password immediately after signing in. It stops working once you set a new one.
        </p>
        <p style="margin:16px 0 0;color:#4a5873;font-size:13px">If you did not expect this account, please contact the CCS Admin Office.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;background:#f4f7fc;color:#4a5873;font-size:12px">
        College of Computer Studies · Camarines Sur Polytechnic Colleges, Nabua, Cam. Sur
      </td>
    </tr>
  </table>
</body>
</html>`;

  const info = await getTransport().sendMail({
    from: settings.from,
    to,
    subject: 'Your CCS Consultation account details',
    text,
    html
  });
  return { messageId: info.messageId || '' };
}

async function sendSetupEmail({ to, name, username, token, expiresAt }) {
  const settings = mailSettings();
  if (!isMailConfigured()) {
    const error = new Error('Email service is not configured. Set SMTP_HOST and MAIL_FROM in .env.');
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }

  const link = setupUrl(token);
  const expires = new Date(expiresAt);
  const expiresText = Number.isNaN(expires.getTime()) ? String(expiresAt) : expires.toUTCString();
  const safeName = escapeHtml(name || 'there');
  const safeUsername = escapeHtml(username);
  const safeLink = escapeHtml(link);
  const safeExpires = escapeHtml(expiresText);

  const text = [
    `Hello ${name || 'there'},`,
    '',
    'An account has been created for you in the CCS Faculty Consultation Booking System.',
    '',
    `User ID: ${username}`,
    '',
    'Create your password using this one-time link:',
    link,
    '',
    `This link expires on ${expiresText} and can only be used once.`,
    'If you did not expect this account, please contact the CCS Admin Office.',
    '',
    'College of Computer Studies',
    'Camarines Sur Polytechnic Colleges'
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#e4eaf4;font-family:Arial,Helvetica,sans-serif;color:#12213d">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #d7deec">
    <tr>
      <td style="padding:24px 28px;background:#12213d;color:#ffffff">
        <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#d4ad5a;font-weight:bold">College of Computer Studies</div>
        <h1 style="margin:8px 0 0;font-size:22px;line-height:1.25">Faculty Consultation Booking System</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:28px">
        <p style="margin:0 0 14px">Hello ${safeName},</p>
        <p style="margin:0 0 14px">An account has been created for you in the CCS Faculty Consultation Booking System.</p>
        <p style="margin:0 0 6px;color:#4a5873;font-size:13px;text-transform:uppercase;letter-spacing:.08em">Your User ID</p>
        <p style="margin:0 0 20px;font-family:Consolas,monospace;font-size:18px;font-weight:bold">${safeUsername}</p>
        <p style="margin:0 0 14px">Create your own password using the secure link below. This link can only be used once.</p>
        <p style="margin:0 0 22px"><a href="${safeLink}" style="display:inline-block;padding:11px 20px;border-radius:8px;background:#1f4e9c;color:#ffffff;text-decoration:none;font-weight:bold">Set my password</a></p>
        <p style="margin:0 0 8px;color:#4a5873;font-size:13px">This link expires on <b>${safeExpires}</b>.</p>
        <p style="margin:0;color:#4a5873;font-size:13px">If you did not expect this account, please contact the CCS Admin Office.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;background:#f4f7fc;color:#4a5873;font-size:12px">
        College of Computer Studies · Camarines Sur Polytechnic Colleges, Nabua, Cam. Sur
      </td>
    </tr>
  </table>
</body>
</html>`;

  const info = await getTransport().sendMail({
    from: settings.from,
    to,
    subject: 'Set up your CCS Consultation account',
    text,
    html
  });
  return { messageId: info.messageId || '' };
}

module.exports = {
  isMailConfigured,
  mailSettings,
  sendSetupEmail,
  sendCredentialsEmail,
  setupUrl,
  signInUrl
};
