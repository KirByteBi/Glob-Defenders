-- Railway ya selecciona la base de datos automáticamente, no hace falta USE
USE GlobDefendersDB;
-- ${{ MySQL.MYSQL_PRIVATE_URL }}


-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS Usuario (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    Usuario VARCHAR(45) NOT NULL UNIQUE,
    Contrasena VARCHAR(255) NOT NULL,
    Globetines INT DEFAULT 0,
    Pycoins INT DEFAULT 0,
    Duckpasses INT DEFAULT 0,
    Nivel INT DEFAULT 0,
    XP INT DEFAULT 0,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Emblemas (Los datos estáticos de qué emblemas existen)
CREATE TABLE IF NOT EXISTS Emblemas (
    idEmblema INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(45) NOT NULL,
    descripcion VARCHAR(255)
);

-- 3. Tabla Intermedia: Usuario_Emblemas (Qué usuario tiene qué emblema)
CREATE TABLE IF NOT EXISTS Usuario_Emblemas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    idEmblema INT NOT NULL,
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario),
    FOREIGN KEY (idEmblema) REFERENCES Emblemas(idEmblema)
);

-- 4. Tabla de Globs (Los datos estáticos de las torres)
CREATE TABLE IF NOT EXISTS Globs (
    idGlob INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(45) NOT NULL,
    tipo VARCHAR(45)
);

-- 5. Tabla Intermedia: Usuario_Globs (Qué torres ha comprado el usuario y sus mejoras)
CREATE TABLE IF NOT EXISTS Usuario_Globs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    idGlob INT NOT NULL,
    duckgrade_comprado BOOLEAN DEFAULT FALSE,
    g_tack_comprado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario),
    FOREIGN KEY (idGlob) REFERENCES Globs(idGlob)
);
