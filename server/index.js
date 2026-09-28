const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
app.use(cors()); // Permite que el juego HTML se conecte a este servidor local
app.use(express.json()); // Permite recibir datos en formato JSON

// Ruta de prueba
app.get('/api/test', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        res.json({ message: `¡Conexión a ${db.getDialect()} exitosa!`, result: rows[0].solution });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error conectando a la base de datos' });
    }
});

// Registrar un nuevo usuario
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Encriptar la contraseña (seguridad primero)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Guardar en la base de datos
        const [result] = await db.query(
            'INSERT INTO Usuario (Usuario, Contrasena) VALUES (?, ?)',
            [username, hashedPassword]
        );
        res.json({ success: true, message: 'Usuario creado con éxito', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
            res.status(400).json({ error: 'El nombre de usuario ya existe' });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Error al registrar usuario' });
        }
    }
});

// Iniciar sesión
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Buscar el usuario
        const [rows] = await db.query('SELECT * FROM Usuario WHERE Usuario = ?', [username]);
        if (rows.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }
        
        const user = rows[0];
        // Comprobar contraseña
        const validPassword = await bcrypt.compare(password, user.Contrasena);
        if (!validPassword) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }
        
        // Devolver datos del usuario (sin la contraseña)
        delete user.Contrasena;
        res.json({ success: true, message: 'Login exitoso', user: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});


// Arrancar el servidor
const PORT = 3000;
db.initialize()
    .then((dialect) => console.log(`Base de datos activa: ${dialect}`))
    .catch((error) => console.error('No se pudo conectar a ninguna base de datos:', error.message));

app.listen(PORT, () => {
    console.log(`Servidor de Glob Defenders corriendo en http://localhost:${PORT}`);
});
