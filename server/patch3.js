const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '../game.js');
let code = fs.readFileSync(gameJsPath, 'utf8');

// --- 1. Eliminar el bloque suelto entre línea ~550-572 ---
// Este bloque quedó colgando del parche anterior, sin estar dentro de ninguna función
const brokenBlock = /\nfunction scheduleSkipLoginButton\(\) \{ \/\* desactivado \*\/ \}\n\n  try \{[\s\S]*?\n\}\r?\n/;
code = code.replace(brokenBlock, '\nfunction scheduleSkipLoginButton() { /* desactivado */ }\n');

// --- 2. Añadir las nuevas funciones handleLogin y handleCreateAccount después de scheduleSkipLoginButton ---
const insertAfter = 'function scheduleSkipLoginButton() { /* desactivado */ }\n';
const newFunctions = `
async function handleLogin() {
  const nameInput = document.getElementById('username-input');
  const passInput = document.getElementById('password-input');
  const name = nameInput ? nameInput.value.trim() : "";
  const password = passInput ? passInput.value : "";

  if (!name || !password) {
    const msgEl = document.getElementById('login-msg');
    if (msgEl) msgEl.textContent = translate('loginError');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: name, password: password })
    });
    const data = await response.json();

    if (!response.ok) {
      const msgEl = document.getElementById('login-msg');
      if (msgEl) {
        msgEl.textContent = data.error || translate('loginError');
        msgEl.style.color = 'red';
      }
      return;
    }

    // Login exitoso: guardar en localStorage y cargar progreso
    try {
      localStorage.setItem('glob_username', name);
      loadProgress(name);
      drawBadges();
      updateMetaUI();
      drawTowerShop();
    } catch (e) { }

    document.getElementById('login-screen').style.display = 'none';
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'flex';
      const loadingGlob = document.getElementById('loading-glob');
      if (loadingGlob) {
        const ownedTowers = Object.keys(TOWER_TYPES).filter(k => TOWER_TYPES[k].unlocked);
        const randomTower = ownedTowers[Math.floor(Math.random() * ownedTowers.length)];
        if (IMAGE_PATHS[randomTower]) loadingGlob.src = IMAGE_PATHS[randomTower];
      }
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        document.getElementById('main-menu').style.display = 'flex';
      }, 2000);
    } else {
      document.getElementById('main-menu').style.display = 'flex';
    }

  } catch (err) {
    console.error("Error en handleLogin:", err);
    const msgEl = document.getElementById('login-msg');
    if (msgEl) {
      msgEl.textContent = 'El servidor está desconectado.';
      msgEl.style.color = 'red';
    }
  }
}

async function handleCreateAccount() {
  const nameInput = document.getElementById('username-input');
  const passInput = document.getElementById('password-input');
  const msgEl = document.getElementById('login-msg');
  const name = nameInput ? nameInput.value.trim() : '';
  const password = passInput ? passInput.value : '';

  if (!name || !password) {
    if (msgEl) msgEl.textContent = currentLanguage === 'es'
      ? 'Introduce un usuario y una contraseña para crear la cuenta.'
      : 'Enter a username and password to create the account.';
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: name, password: password })
    });
    const data = await response.json();

    if (response.ok) {
      if (msgEl) {
        msgEl.textContent = currentLanguage === 'es' ? '¡Cuenta creada con éxito! Iniciando sesión...' : 'Account created successfully! Logging in...';
        msgEl.style.color = '#00ff88';
      }
      handleLogin();
    } else {
      if (msgEl) {
        msgEl.textContent = data.error || 'Error al crear la cuenta.';
        msgEl.style.color = 'red';
      }
    }
  } catch (err) {
    console.error("Error en handleCreateAccount:", err);
    if (msgEl) {
      msgEl.textContent = 'El servidor está desconectado.';
      msgEl.style.color = 'red';
    }
  }
}

function handleSkipLogin() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('main-menu').style.display = 'flex';
}

`;

code = code.replace(insertAfter, insertAfter + newFunctions);

fs.writeFileSync(gameJsPath, code, 'utf8');
console.log('Patch 3 aplicado. Líneas totales:', code.split('\n').length);

// Verify functions are there
const checkLogin = code.includes('async function handleLogin()');
const checkCreate = code.includes('async function handleCreateAccount()');
console.log('handleLogin found:', checkLogin);
console.log('handleCreateAccount found:', checkCreate);
