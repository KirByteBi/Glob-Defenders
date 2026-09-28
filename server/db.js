const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Usuario por defecto de XAMPP
  password: '', // XAMPP por defecto NO tiene contraseña
  database: 'GlobDefendersDB', // Nombre limpio de la BD
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convertimos a promesas para usar async/await más fácilmente
const promisePool = pool.promise();

module.exports = promisePool;
