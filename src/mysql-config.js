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

const config = urlConfig || {
  host: first(
    process.env.MYSQL_HOST,
    process.env.MYSQL_HOSTNAME,
    process.env.DATABASE_HOST,
    process.env.DB_HOST,
    process.env.MYSQL_ADDON_HOST,
    '127.0.0.1'
  ),
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
  ),
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
  )
};

module.exports = {
  ...config,
  safeSummary() {
    return `host=${config.host}, port=${config.port}, user=${config.user}, database=${config.database}`;
  }
};
