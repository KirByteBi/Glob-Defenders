const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '../game.js');
let code = fs.readFileSync(gameJsPath, 'utf8');
if (code.includes('\0')) code = fs.readFileSync(gameJsPath, 'utf16le');

// 1. Quitar el botn de saltar login.
const skipRegex = /const skipLoginButton = document\.getElementById\('skip-login-btn'\);\s*if \(skipLoginButton\) skipLoginButton\.onclick = handleSkipLogin;/;
code = code.replace(skipRegex, '');

// También buscar donde se pone visible para evitar que aparezca.
const scheduleSkipRegex = /function scheduleSkipLoginButton\(\)\s*\{[\s\S]*?\}\n/g;
code = code.replace(scheduleSkipRegex, 'function scheduleSkipLoginButton() { /* desactivado */ }\n');

// 2. Modificar catch err para que lo imprima en consola
const catchRegexCreate = /\} catch \(err\) \{[\s\S]*?msgEl\.textContent = 'El servidor est. desconectado\.';/g;
code = code.replace(catchRegexCreate, '} catch (err) { console.error("Fetch Error:", err); if (msgEl) { msgEl.textContent = "El servidor está desconectado.";');

fs.writeFileSync(gameJsPath, code, fs.readFileSync(gameJsPath).includes(0) ? 'utf16le' : 'utf8');

// Modificar index.html para quitar el botón visualmente
const htmlPath = path.join(__dirname, '../index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/<button id="skip-login-btn".*?<\/button>/, '');
fs.writeFileSync(htmlPath, html, 'utf8');

console.log('Done');
