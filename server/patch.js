const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '../game.js');
let code = fs.readFileSync(gameJsPath, 'utf8');

// The file might be UTF-16, let's check
if (code.includes('\0')) {
    code = fs.readFileSync(gameJsPath, 'utf16le');
}

// Replace handleCreateAccount
const createAccRegex = /function handleCreateAccount\(\)\s*\{[\s\S]*?saveUsers\(\);\s*handleLogin\(\);\s*\}/;
const newCreateAcc = `async function handleCreateAccount() {
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
    if (msgEl) {
      msgEl.textContent = 'El servidor está desconectado.';
      msgEl.style.color = 'red';
    }
  }
}`;

code = code.replace(createAccRegex, newCreateAcc);

// Replace handleLogin (up to the try block where it saves local progress)
const loginRegex = /function handleLogin\(\)\s*\{[\s\S]*?if \(!name \|\| !password\) \{[\s\S]*?return;\s*\}[\s\S]*?if \(USERS\[name\]\) \{[\s\S]*?\} else \{[\s\S]*?saveUsers\(\);\s*showMessage[^\n]*\n\s*\}/;

const newLogin = `async function handleLogin() {
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
  } catch (err) {
    const msgEl = document.getElementById('login-msg');
    if (msgEl) {
      msgEl.textContent = 'Error de conexión con el servidor.';
      msgEl.style.color = 'red';
    }
    return;
  }
`;

code = code.replace(loginRegex, newLogin);

// Save back preserving encoding
fs.writeFileSync(gameJsPath, code, fs.readFileSync(gameJsPath).includes(0) ? 'utf16le' : 'utf8');
console.log('Done!');
