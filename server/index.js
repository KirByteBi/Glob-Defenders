const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors()); // Permite que el juego HTML se conecte a este servidor local
app.use(express.json()); // Permite recibir datos en formato JSON

const server = http.createServer(app);
const multiplayerServer = http.createServer();
const io = new Server(multiplayerServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const seedSessions = new Map();
const MAX_SEED_PLAYERS = 4;

function normalizePlayerProfile(profile) {
    const equippedTowers = Array.isArray(profile?.equippedTowers)
        ? [...new Set(profile.equippedTowers
            .filter(type => typeof type === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(type))
            .slice(0, 5))]
        : ['Glob', 'Red_Glob'];
    const towerLimits = {};

    if (profile?.towerLimits && typeof profile.towerLimits === 'object' && !Array.isArray(profile.towerLimits)) {
        Object.entries(profile.towerLimits).slice(0, 100).forEach(([type, limit]) => {
            const numericLimit = Number(limit);
            if (/^[A-Za-z0-9_-]{1,40}$/.test(type) &&
                Number.isInteger(numericLimit) && numericLimit >= 1 && numericLimit <= 100) {
                towerLimits[type] = numericLimit;
            }
        });
    }

    return { equippedTowers, towerLimits };
}

function getSeedPlayerRoster(session) {
    return [...session.members].map(playerId => {
        const member = session.profiles.get(playerId);
        return {
            playerId,
            username: member?.username || 'Jugador',
            profile: member?.profile || normalizePlayerProfile(null)
        };
    });
}

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado:', socket.id);

    socket.on('join-seed', (request, acknowledge) => {
        const seed = typeof request === 'string' ? request : request?.seed;
        const username = typeof request === 'object' && typeof request.username === 'string'
            ? request.username.trim().slice(0, 32)
            : 'Jugador';

        if (typeof seed !== 'string' || !/^[A-Z][A-Z0-9]{6}$/.test(seed)) {
            if (typeof acknowledge === 'function') acknowledge({ success: false, error: 'Seed no válida' });
            return;
        }

        let session = seedSessions.get(seed);
        const isHost = !session || !session.hostId;
        if (!session) {
            session = { hostId: socket.id, hostName: username, snapshot: null, members: new Set(), profiles: new Map() };
            seedSessions.set(seed, session);
        } else if (isHost) {
            session.hostId = socket.id;
            session.hostName = username;
        }

        if (!session.members.has(socket.id) && session.members.size >= MAX_SEED_PLAYERS) {
            if (typeof acknowledge === 'function') {
                acknowledge({ success: false, error: 'La partida ya está llena (máximo 4 jugadores)' });
            }
            return;
        }

        socket.data.seed = seed;
        socket.data.username = username;
        socket.join(seed);
        session.members.add(socket.id);
        session.profiles.set(socket.id, {
            username,
            profile: normalizePlayerProfile(request?.profile)
        });
        console.log(`Usuario ${socket.id} se unió a la seed: ${seed}`);

        if (!isHost) {
            io.to(session.hostId).emit('player-joined', {
                id: socket.id,
                username,
                playerCount: session.members.size
            });
        }
        const players = getSeedPlayerRoster(session);
        io.to(seed).emit('player-roster', { players, playerCount: players.length });
        if (typeof acknowledge === 'function') {
            acknowledge({
                success: true,
                isHost,
                hostName: session.hostName,
                playerCount: players.length,
                players,
                snapshot: session.snapshot
                    ? {
                        ...session.snapshot,
                        multiplayerEnabled: session.members.size > 1,
                        playerCount: players.length,
                        players
                    }
                    : null
            });
        }
    });

    socket.on('update-player-profile', (request) => {
        if (!request || typeof request.seed !== 'string' || socket.data.seed !== request.seed) return;
        const session = seedSessions.get(request.seed);
        if (!session || !session.members.has(socket.id)) return;

        session.profiles.set(socket.id, {
            username: socket.data.username || 'Jugador',
            profile: normalizePlayerProfile(request.profile)
        });
        const players = getSeedPlayerRoster(session);
        io.to(request.seed).emit('player-roster', { players, playerCount: players.length });
    });

    socket.on('update-game-state', (request) => {
        if (!request || typeof request.seed !== 'string' || !request.state) return;
        const session = seedSessions.get(request.seed);
        if (!session || session.hostId !== socket.id) return;

        let serializedState;
        try {
            serializedState = JSON.stringify(request.state);
        } catch (error) {
            console.error('No se pudo serializar el estado de la partida:', error);
            return;
        }
        if (serializedState.length > 250000) {
            console.warn(`Estado demasiado grande para la seed ${request.seed}; se descartó.`);
            return;
        }

        session.snapshot = request.state;
        socket.to(request.seed).emit('game-state', request.state);
    });

    socket.on('game-action', (request) => {
        if (!request || typeof request.seed !== 'string' || !request.action ||
            socket.data.seed !== request.seed || typeof request.action.type !== 'string') return;
        if (!seedSessions.has(request.seed)) return;

        const allowedActions = new Set(['place-tower', 'evolve-tower', 'sell-tower', 'start-wave', 'pause', 'resume', 'retry']);
        if (!allowedActions.has(request.action.type)) return;
        if (request.action.type === 'place-tower' &&
            (!Number.isInteger(Number(request.action.spotId)) || typeof request.action.towerType !== 'string')) return;
        if ((request.action.type === 'evolve-tower' || request.action.type === 'sell-tower') &&
            !Number.isInteger(Number(request.action.spotId))) return;
        socket.to(request.seed).emit('game-action', { ...request.action, playerId: socket.id });
    });

    socket.on('spawn-enemy', (data) => {
        if (data && typeof data.seed === 'string' && socket.data.seed === data.seed) {
            socket.to(data.seed).emit('spawn-enemy', data);
        }
    });

    socket.on('show-dialog', (data) => {
        if (data && typeof data.seed === 'string' && socket.data.seed === data.seed) {
            socket.to(data.seed).emit('show-dialog', data);
        }
    });

    socket.on('disconnect', () => {
        const seed = socket.data.seed;
        const session = seed && seedSessions.get(seed);
        if (session) {
            session.members.delete(socket.id);
            session.profiles.delete(socket.id);
        }
        if (session?.hostId === socket.id) {
            session.hostId = null;
            io.to(seed).emit('host-disconnected');
            session.members.forEach(memberId => {
                const memberSocket = io.sockets.sockets.get(memberId);
                memberSocket?.leave(seed);
                if (memberSocket) memberSocket.data.seed = null;
            });
            seedSessions.delete(seed);
        } else if (session?.hostId) {
            io.to(session.hostId).emit('player-left', { playerCount: session.members.size });
        }
        if (session) {
            const players = getSeedPlayerRoster(session);
            io.to(seed).emit('player-roster', { players, playerCount: players.length });
        }
        console.log('Usuario desconectado:', socket.id);
    });
});

function respondIfDatabaseUnavailable(res, error) {
    if (error.code !== 'DATABASE_UNAVAILABLE') return false;

    res.status(503).json({
        code: 'DATABASE_UNAVAILABLE',
        error: 'La base de datos no está disponible'
    });
    return true;
}

// Ruta de prueba
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
        } else if (respondIfDatabaseUnavailable(res, error)) {
            return;
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
        if (respondIfDatabaseUnavailable(res, error)) return;
        console.error(error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});


// Arrancar el servidor
const PORT = 3000;
const MULTIPLAYER_PORT = Number(process.env.MULTIPLAYER_PORT) || 3001;
db.initialize()
    .then((dialect) => console.log(`Base de datos activa: ${dialect}`))
    .catch((error) => console.error('No se pudo conectar a ninguna base de datos:', error.message));

server.listen(PORT, () => {
    console.log(`Servidor de Glob Defenders corriendo en http://localhost:${PORT}`);
});
multiplayerServer.listen(MULTIPLAYER_PORT, '127.0.0.1', () => {
    console.log(`Servidor multijugador corriendo en http://localhost:${MULTIPLAYER_PORT}`);
});
