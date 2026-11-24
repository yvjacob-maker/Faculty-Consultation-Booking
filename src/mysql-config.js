function first(...values) {
  return values.find((value) => String(value || '').trim() !== '');
}

function parseDatabaseUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!/^mysql(s)?$/i.test(url.protocol.replace(':', ''))) return null;
    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: decodeURIComponent(url.pathname.replace(/^\/+/, '')).split('?')[0]
    };
  } catch (_) {
    return null;
  }
}

const urlConfig = parseDatabaseUrl(
  first(process.env.MYSQL_URL, process.env.DATABASE_URL, process.env.JAWSDB_URL)
);

const explicitConfig = {
  host: first(
    process.env.MYSQL_HOST,
    process.env.MYSQL_HOSTNAME,
    process.env.DATABASE_HOST,
    process.env.DB_HOST,
    process.env.MYSQL_ADDON_HOST,
    '127.0.0.1'
  ).trim(),
  port: Number(first(
    process.env.MYSQL_PORT,
    process.env.DATABASE_PORT,
    process.env.DB_PORT,
    process.env.MYSQL_ADDON_PORT,
    3306
  )),
  user: first(
    process.env.MYSQL_USER,
    process.env.MYSQL_USERNAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_USERNAME,
    process.env.DB_USER,
    process.env.DB_USERNAME,
    process.env.MYSQL_ADDON_USER,
    'root'
  ).trim(),
  password: first(
    process.env.MYSQL_PASSWORD,
    process.env.DATABASE_PASSWORD,
    process.env.DB_PASSWORD,
    process.env.MYSQL_ADDON_PASSWORD,
    ''
  ),
  database: first(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_DB,
    process.env.DATABASE_NAME,
    process.env.DATABASE_DATABASE,
    process.env.DB_NAME,
    process.env.DB_DATABASE,
    process.env.MYSQL_ADDON_DB,
    'faculty_consultation'
  ).trim()
};

const hasExplicitHostingerConfig = first(
  process.env.MYSQL_HOST,
  process.env.MYSQL_HOSTNAME,
  process.env.DATABASE_HOST,
  process.env.DB_HOST,
  process.env.MYSQL_USER,
  process.env.MYSQL_USERNAME,
  process.env.DATABASE_USER,
  process.env.DB_USER,
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_DB,
  process.env.DATABASE_NAME,
  process.env.DB_NAME
);

const config = hasExplicitHostingerConfig ? explicitConfig : (urlConfig || explicitConfig);

module.exports = {
  ...config,
  safeSummary() {
    return `host=${config.host}, port=${config.port}, user=${config.user}, database=${config.database}`;
  },
  diagnostic(error, component) {
    const label = component || 'database';
    const prefix = `MySQL ${label} connection failed`;

    if (error && error.code === 'ER_ACCESS_DENIED_ERROR') {
      return `${prefix}: access denied for user "${config.user}" at ${config.host}:${config.port} ` +
        `for database "${config.database}" (MYSQL_PASSWORD is ${config.password ? 'set' : 'empty'}). ` +
        'Verify MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE in the ' +
        'runtime environment, and confirm this database user is allowed to connect from the app host.';
    }

    if (error && error.code === 'ER_BAD_DB_ERROR') {
      return `${prefix}: database "${config.database}" was not found at ${config.host}:${config.port}. ` +
        'Verify MYSQL_DATABASE and that the configured user has access to it.';
    }

    if (error && ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT'].includes(error.code)) {
      return `${prefix} (${this.safeSummary()}): ${error.code}. Verify MYSQL_HOST and MYSQL_PORT, ` +
        'the MySQL service state, and any network allowlist or firewall rules.';
    }

    return `${prefix} (${this.safeSummary()}): ${error && error.message ? error.message : 'unknown error'}`;
  }
};
