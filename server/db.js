const mysql = require('mysql2');
const { Pool } = require('pg');

const mysqlPool = mysql.createPool({
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'GlobDefendersDB',
  port: Number(process.env.MYSQLPORT || 3306),
  connectTimeout: Number(process.env.MYSQL_CONNECT_TIMEOUT || 5000),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const postgresPool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  host: process.env.PGHOST || process.env.POSTGRES_HOST,
  user: process.env.PGUSER || process.env.POSTGRES_USER,
  password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD,
  database: process.env.PGDATABASE || process.env.POSTGRES_DB,
  port: Number(process.env.PGPORT || process.env.POSTGRES_PORT || 5432),
  connectionTimeoutMillis: Number(process.env.PGCONNECT_TIMEOUT || 5000)
});

const postgresColumnNames = {
  idusuario: 'idUsuario',
  usuario: 'Usuario',
  contrasena: 'Contrasena',
  globetines: 'Globetines',
  pycoins: 'Pycoins',
  duckpasses: 'Duckpasses',
  nivel: 'Nivel',
  xp: 'XP'
};

let activeDatabase;
let initialization;

async function connectToMySQL() {
  const connection = await mysqlPool.promise().getConnection();
  connection.release();
  activeDatabase = {
    name: 'MySQL',
    query: (sql, params) => mysqlPool.promise().query(sql, params)
  };
}

async function connectToPostgreSQL() {
  const connection = await postgresPool.connect();
  try {
    await connection.query('SELECT 1');
  } finally {
    connection.release();
  }

  activeDatabase = {
    name: 'PostgreSQL',
    async query(sql, params = []) {
      let parameterIndex = 0;
      let postgresSql = sql.replace(/\?/g, () => {
        parameterIndex += 1;
        return `$${parameterIndex}`;
      });

      if (/^\s*INSERT\s+INTO\s+Usuario\b/i.test(sql) && !/\bRETURNING\b/i.test(sql)) {
        postgresSql += ' RETURNING idUsuario';
      }

      const result = await postgresPool.query(postgresSql, params);
      const rows = result.rows.map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([key, value]) => [
            postgresColumnNames[key.toLowerCase()] || key,
            value
          ])
        )
      );

      if (/^\s*INSERT\s+INTO\s+Usuario\b/i.test(sql)) {
        const insertedId = rows[0]?.idUsuario;
        return [{ insertId: insertedId, affectedRows: result.rowCount }, result.fields];
      }

      return [rows, result.fields];
    }
  };
}

function initialize() {
  if (activeDatabase) return Promise.resolve(activeDatabase.name);
  if (initialization) return initialization;

  initialization = (async () => {
    let postgresError;
    try {
      await connectToPostgreSQL();
      return activeDatabase.name;
    } catch (error) {
      postgresError = error;
      console.error(
        `PostgreSQL connection failed (${error.code || error.message}); trying MySQL fallback.`
      );
    }

    try {
      await connectToMySQL();
      return activeDatabase.name;
    } catch (mysqlError) {
      const error = new Error(
        `Unable to connect to PostgreSQL or MySQL. PostgreSQL: ${postgresError.code || postgresError.message}; ` +
        `MySQL: ${mysqlError.code || mysqlError.message}`
      );
      error.code = 'DATABASE_UNAVAILABLE';
      throw error;
    }
  })().catch((error) => {
    initialization = null;
    throw error;
  });

  return initialization;
}

async function query(sql, params = []) {
  await initialize();
  return activeDatabase.query(sql, params);
}

function getDialect() {
  return activeDatabase?.name || null;
}

module.exports = { initialize, query, getDialect };
