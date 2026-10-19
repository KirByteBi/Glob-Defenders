<?php
declare(strict_types=1);

ini_set('session.use_strict_mode', '1');
session_set_cookie_params([
    'httponly' => true,
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'samesite' => 'Lax',
]);
session_start();

const DEMO_USERNAME = 'KirByteBi';
const DEMO_PASSWORD_HASH = '$2y$10$yiqHKiFcPj4hFxyJZSuCxOUeV6kxw3L1eSpwcT3.AyPZShPY5V1XW';

function csrfToken(): string
{
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function validCsrfToken(): bool
{
    $token = $_POST['csrf_token'] ?? '';

    return is_string($token)
        && isset($_SESSION['csrf_token'])
        && hash_equals($_SESSION['csrf_token'], $token);
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validCsrfToken()) {
        $error = 'La sesión del formulario caducó. Recarga la página e inténtalo de nuevo.';
    } elseif (($_POST['action'] ?? '') === 'logout') {
        $_SESSION = [];
        session_regenerate_id(true);
        header('Location: login.php');
        exit;
    } else {
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';

        if (
            is_string($username)
            && is_string($password)
            && hash_equals(DEMO_USERNAME, $username)
            && password_verify($password, DEMO_PASSWORD_HASH)
        ) {
            session_regenerate_id(true);
            $_SESSION['user'] = DEMO_USERNAME;
            unset($_SESSION['csrf_token']);
            header('Location: login.php');
            exit;
        }

        $error = 'Usuario o contraseña incorrectos.';
    }
}

$isLoggedIn = isset($_SESSION['user']) && $_SESSION['user'] === DEMO_USERNAME;
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#16213e">
    <title>Glob Defenders - VS. Pyces</title>
    <link rel="stylesheet" href="../styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="../img/GlobDefendersLogoRewamped.png">
</head>
<body>
    <div id="login-screen">
        <div id="login-decorations"></div>
        <main class="login-box">
            <img src="../img/GlobDefendersLogoRewamped.png" alt="Glob Defenders Logo" class="login-logo">
        <?php if ($isLoggedIn): ?>
            <div class="login-inputs">
                <p>¡Bienvenido, <?= htmlspecialchars(DEMO_USERNAME, ENT_QUOTES, 'UTF-8') ?>!</p>
                <p>Sesión iniciada</p>
            </div>
            <form method="post" action="login.php">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrfToken(), ENT_QUOTES, 'UTF-8') ?>">
                <input type="hidden" name="action" value="logout">
                <button id="login-btn" type="submit">Cerrar sesión</button>
            </form>
        <?php else: ?>
            <?php if ($error !== ''): ?>
                <div id="login-msg" role="alert"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
            <?php else: ?>
                <div id="login-msg"></div>
            <?php endif; ?>
            <form method="post" action="login.php" autocomplete="on">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrfToken(), ENT_QUOTES, 'UTF-8') ?>">
                <div class="login-inputs">
                    <input type="text" id="username-input" name="username" placeholder="Nombre de Usuario" autocomplete="username" required>
                    <input type="password" id="password-input" name="password" placeholder="Contraseña" autocomplete="current-password" required>
                </div>
                <button id="login-btn" type="submit">Unirse a la batalla</button>
            </form>
        <?php endif; ?>
            <div class="collab-footer">
                <span class="collab-label">✦ Crossover Event ✦</span>
                <a href="https://kirbytebi.github.io/Star-Jump/" target="_blank" rel="noopener noreferrer">
                    <img src="../img/Collabs%20(SJ)/IconoStarJump.png" alt="StarJump" class="collab-logo">
                </a>
            </div>
            <div class="dev-credit">
                <span class="pink-credit">✦ Creado por KirByte_Bi ✦</span>
            </div>
        </main>
    </div>
</body>
</html>
