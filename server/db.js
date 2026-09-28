const mysql = require('mysql2');

const pool = mysql.createPool({
  host:     process.env.MYSQLHOST     || 'localhost',
  user:     process.env.MYSQLUSER     || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'GlobDefendersDB',
  port:     process.env.MYSQLPORT     || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convertimos a promesas para usar async/await más fácilmente
const promisePool = pool.promise();

module.exports = promisePool;
