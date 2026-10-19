const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');
const http = require('http');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

function respondIfDatabaseUnavailable(res, error) {
    if (error.code !== 'DATABASE_UNAVAILABLE') return false;

    res.status(503).json({
        code: 'DATABASE_UNAVAILABLE',
        error: 'La base de datos no está disponible'
    });
    return true;
}

app.get('/api/test', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        res.json({ message: `¡Conexión a ${db.getDialect()} exitosa!`, result: rows[0].solution });
    } catch (error) {
        if (respondIfDatabaseUnavailable(res, error)) return;
        console.error(error);
        res.status(500).json({ error: 'Error conectando a la base de datos' });
    }
});

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const [result] = await db.query(
            'INSERT INTO Usuario (Usuario, Contrasena) VALUES (?, ?)',
            [username, hashedPassword]
        );
        res.json({ success: true, message: 'Usuario creado con éxito', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
            res.status(400).json({ error: 'El nombre de usuario ya existe' });
        } else if (respondIfDatabaseUnavailable(res, error)) {
            return;
        } else {
            console.error(error);
            res.status(500).json({ error: 'Error al registrar usuario' });
        }
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM Usuario WHERE Usuario = ?', [username]);
        if (rows.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.Contrasena);
        if (!validPassword) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }

        delete user.Contrasena;
        res.json({ success: true, message: 'Login exitoso', user });
    } catch (error) {
        if (respondIfDatabaseUnavailable(res, error)) return;
        console.error(error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

const PORT = 3000;
db.initialize()
    .then((dialect) => console.log(`Base de datos activa: ${dialect}`))
    .catch((error) => console.error('No se pudo conectar a ninguna base de datos:', error.message));

server.listen(PORT, () => {
    console.log(`Servidor de Glob Defenders corriendo en http://localhost:${PORT}`);
});
