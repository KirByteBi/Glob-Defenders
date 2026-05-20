// ===================== ESTADO DEL JUEGO =====================

let currentLanguage = 'es';
let backgroundMusic = null;
let musicEnabled = true;
let showHitbox = false;

// Generamos spots automáticamente evitando el río y el camino
const TOWER_SPOTS = [];
function generateSpots() {
  TOWER_SPOTS.length = 0;

  const forbiddenZones = [
    { x: 300, y: 0, w: 60, h: 600 },
    { x: 300, y: 200, w: 200, h: 60 },
    { x: 0, y: 170, w: 200, h: 60 },
    { x: 170, y: 170, w: 60, h: 200 },
    { x: 170, y: 330, w: 300, h: 60 },
    { x: 430, y: 150, w: 60, h: 240 },
    { x: 430, y: 150, w: 300, h: 60 },
    { x: 700, y: 150, w: 60, h: 200 },
    { x: 700, y: 330, w: 300, h: 60 }
  ];

  for (let x = 35; x < 950; x += 75) {
    for (let y = 35; y < 550; y += 75) {
      let collides = false;
      for (let zone of forbiddenZones) {
        if (x + 40 > zone.x && x - 40 < zone.x + zone.w &&
            y + 40 > zone.y && y - 40 < zone.y + zone.h) {
          collides = true;
          break;
        }
      }
      if (x < 20 || x > 960 || y < 20 || y > 560) collides = true;
      if (!collides) {
        TOWER_SPOTS.push({ x: x - 40, y: y - 40, w: 80, h: 80 });
      }
    }
  }
  console.log(`✅ Generados ${TOWER_SPOTS.length} spots para torres`);
}
generateSpots();

let gameState = {
  health: 100, wave: 0,
  towers: [], enemies: [], projectiles: [],
  selectedTowerType: null, waveActive: false,
  gameOver: false, adminMode: false, autoWave: false,
  towerSpots: [],
  mode: 'normal',
  modeConfirmed: false,
  corrupt: false,
  healthClicks: 0,
  consecutiveMimics: 0,
  corruptWins: 0,
  maxWaves: 15,
  unlockedInfinite: false,
  globetines: 500,
  pycoins: 0,
  duckPassXP: 0,
  duckPassLevel: 1,
  duckPassCurrency: 0,
  baseHealthLevel: 0,
  towerLimits: {
    'Glob': 3, 'Red_Glob': 5, 'Soap_Glob': 3, 'Ducky_Glob': 3,
    'Comet_Glob': 3, 'Pyce_Glob': 2, 'Old_Glob': 2, 'Work_Bombot': 1
  },
  usedCodes: {},
  towerCounts: {},
  towerBuffs: { damage: 1, range: 0, speed: 1 },
  metaRange: 0,
  metaDamage: 1,
  metaRangeLevel: 0,
  metaDamageLevel: 0,
  unlockedSkins: ['default'],
  equippedSkins: { 'Glob': 'default', 'Red_Glob': 'default', 'Global': 'default', 'Grey': 'default' },
  cheatedModeActive: false,
  cheatedBackup: null,
  adminMode: false,
  failedCodeAttempts: 0,
  logoClicks: 0,
  antiNormalActive: false,
  unlockedAntiNormal: false,
  claimedRewards: [],
  muted: false,
  totalDamage: 0,
  usedGTackRed: false,
  usedGTackGrey: false,
  baseTookDamage: false,
  settings: { showShopDesc: true, showTotalDamage: false },
  duckgrades: {},
  gtacks: { 'Glob': false, 'Red_Glob': false, 'Soap_Glob': false, 'Ducky_Glob': false, 'Comet_Glob': false, 'Old_Glob': false }
};

function saveUsers() {
  localStorage.setItem('glob_users', JSON.stringify(USERS));
}

function loadUsers() {
  const saved = localStorage.getItem('glob_users');
  if (saved) {
    USERS = { ...USERS, ...JSON.parse(saved) };
  }
}
loadUsers();

function init() {
  console.log("Iniciando Glob Defenders...");
  try {
    if (Math.random() < 0.15) {
      document.querySelectorAll('.login-logo, .game-logo').forEach(img => {
        img.src = 'img/GlobDefendersImage.png';
      });
    }
    updateLanguage();
    bindEvents();
    spawnDecorations('login-decorations');
    spawnDecorations('mode-decorations');
    updateMuteButton();
    checkLogin();
    createMap();
    drawTowerShop();
    drawBadges();
    updateUI();
    updateMetaUI();
    applyScale();
    gameLoop();
    console.log("Sistema iniciado correctamente.");
  } catch (e) {
    console.error("Error crítico en la inicialización:", e);
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) loginBtn.onclick = handleLogin;
  }
}

function saveProgress() {
  const user = localStorage.getItem('glob_username') || 'default';
  const progress = {
    badges: Object.fromEntries(Object.entries(BADGES).map(([k, v]) => [k, v.unlocked])),
    unlockedInfinite: gameState.unlockedInfinite,
    corruptWins: gameState.corruptWins,
    unlockedBombot: TOWER_TYPES['Work_Bombot'] ? TOWER_TYPES['Work_Bombot'].unlocked : false,
    unlockedOldGlob: TOWER_TYPES['Old_Glob'] ? TOWER_TYPES['Old_Glob'].unlocked : false,
    unlockedCometGlob: TOWER_TYPES['Comet_Glob'] ? TOWER_TYPES['Comet_Glob'].unlocked : false,
    globetines: gameState.globetines,
    pycoins: gameState.pycoins,
    duckPassXP: gameState.duckPassXP,
    duckPassLevel: gameState.duckPassLevel,
    duckPassCurrency: gameState.duckPassCurrency,
    towerLimits: gameState.towerLimits,
    baseHealthLevel: gameState.baseHealthLevel,
    usedCodes: gameState.usedCodes,
    unlockedSkins: gameState.unlockedSkins,
    equippedSkins: gameState.equippedSkins,
    unlockedAntiNormal: gameState.unlockedAntiNormal,
    claimedRewards: gameState.claimedRewards,
    muted: gameState.muted,
    totalDamage: gameState.totalDamage,
    settings: gameState.settings,
    gtacks: gameState.gtacks,
    musicEnabled: musicEnabled,
    showHitbox: showHitbox,
    cheatedModeActive: gameState.cheatedModeActive,
    cheatedBackup: gameState.cheatedBackup,
  };
  localStorage.setItem('glob_progress_' + user, JSON.stringify(progress));
}

function loadProgress(username) {
  try {
    const user = username || localStorage.getItem('glob_username');
    if (!user) return;

    let data = localStorage.getItem('glob_progress_' + user);

    if (!data) {
      data = localStorage.getItem('glob_progress');
      if (data) {
        console.log("Migrando progreso global al usuario:", user);
        localStorage.setItem('glob_progress_' + user, data);
      }
    }

    if (data) {
      let progress = JSON.parse(data);

      if (!progress.upgradesResetV3) {
        console.log("Applying upgrades reset migration for:", user);
        progress.baseHealthLevel = 0;
        progress.towerLimits = {
          'Glob': 3, 'Red_Glob': 5, 'Soap_Glob': 3, 'Ducky_Glob': 3,
          'Comet_Glob': 3, 'Pyce_Glob': 2, 'Old_Glob': 2, 'Work_Bombot': 1
        };
        progress.metaRangeLevel = 0;
        progress.metaRange = 0;
        progress.metaDamageLevel = 0;
        progress.metaDamage = 1;
        progress.duckgrades = {};
        progress.unlockedOldGlob = false;
        progress.unlockedCometGlob = false;
        progress.upgradesResetV3 = true;
        localStorage.setItem('glob_progress_' + user, JSON.stringify(progress));
      }

      if (progress.badges) {
        Object.keys(progress.badges).forEach(k => {
          if (BADGES[k]) BADGES[k].unlocked = progress.badges[k];
        });
      }
      gameState.unlockedInfinite = progress.unlockedInfinite || false;
      gameState.corruptWins = progress.corruptWins || 0;
      if (TOWER_TYPES['Work_Bombot']) TOWER_TYPES['Work_Bombot'].unlocked = progress.unlockedBombot || false;
      if (TOWER_TYPES['Old_Glob']) TOWER_TYPES['Old_Glob'].unlocked = progress.unlockedOldGlob || false;
      if (TOWER_TYPES['Pyce_Glob']) TOWER_TYPES['Pyce_Glob'].unlocked = progress.unlockedOldGlob || false;
      if (TOWER_TYPES['Comet_Glob']) TOWER_TYPES['Comet_Glob'].unlocked = progress.unlockedCometGlob || false;

      gameState.globetines = Number(progress.globetines != null ? progress.globetines : 500);
      gameState.pycoins = Number(progress.pycoins || 0);
      gameState.totalDamage = Number(progress.totalDamage || 0);
      gameState.settings = { ...gameState.settings, ...progress.settings };
      gameState.duckPassXP = progress.duckPassXP || 0;
      gameState.duckPassLevel = progress.duckPassLevel || 1;
      gameState.duckPassCurrency = progress.duckPassCurrency || 0;
      if (progress.towerLimits) {
        gameState.towerLimits = { ...gameState.towerLimits, ...progress.towerLimits };
      }
      gameState.baseHealthLevel = progress.baseHealthLevel || 0;
      gameState.usedCodes = progress.usedCodes || {};
      gameState.unlockedSkins = progress.unlockedSkins || ['default'];
      gameState.equippedSkins = Object.assign({ 'Glob': 'default', 'Red_Glob': 'default', 'Global': 'default', 'Grey': 'default' }, progress.equippedSkins || {});
      gameState.cheatedModeActive = progress.cheatedModeActive || false;
      gameState.cheatedBackup = progress.cheatedBackup || null;
      gameState.unlockedAntiNormal = progress.unlockedAntiNormal || false;
      gameState.claimedRewards = progress.claimedRewards || [];
      gameState.muted = progress.muted || false;

      gameState.duckgrades = progress.duckgrades || {};
      gameState.gtacks = progress.gtacks || {
        'Glob': false, 'Red_Glob': false, 'Soap_Glob': false, 'Ducky_Glob': false,
        'Comet_Glob': false, 'Old_Glob': false
      };
      musicEnabled = progress.musicEnabled !== undefined ? progress.musicEnabled : true;
      showHitbox = progress.showHitbox || false;

      if (gameState.unlockedAntiNormal) BADGES.antiNormal.unlocked = true;
      updateBuffs();
      document.getElementById('total-damage-stat').style.display = gameState.settings.showTotalDamage ? 'flex' : 'none';
      updateMuteButton();
      gameState.health = 100 + (gameState.baseHealthLevel * 20);
    }

    initMusic();

  } catch (e) {
    console.error("Error al cargar el progreso (loadProgress):", e);
  }
}

function spawnDecorations(containerId) {
  try {
    const container = document.getElementById(containerId);
    if (!container) return;
    const images = Object.values(IMAGE_PATHS);

    for (let i = 0; i < 15; i++) {
      const imgPath = images[Math.floor(Math.random() * images.length)];
      const img = document.createElement('div');
      img.className = 'floating-char';
      img.style.backgroundImage = `url('${imgPath}')`;

      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight;
      const tx = (Math.random() - 0.5) * 400;
      const ty = (Math.random() - 0.5) * 400;

      img.style.left = `${startX}px`;
      img.style.top = `${startY}px`;
      img.style.setProperty('--tx', `${tx}px`);
      img.style.setProperty('--ty', `${ty}px`);
      img.style.animationDelay = `${Math.random() * 10}s`;

      img.onclick = () => {
        const isGlob = imgPath.toLowerCase().includes('glob');
        playSound(isGlob ? 'sounds/Slurp.mp3' : 'sounds/Bipbip.mp3');
      };

      container.appendChild(img);
    }
  } catch (e) { console.warn("Error en decoraciones:", e); }
}

function toggleMute() {
  gameState.muted = !gameState.muted;
  updateMuteButton();
  saveProgress();
}

function updateMuteButton() {
  const btn = document.getElementById('mute-toggle');
  if (btn) btn.textContent = gameState.muted ? '🔇' : '🔊';
}

function playSound(file) {
  if (gameState.muted) return;
  const audio = new Audio(file);
  audio.play().catch(e => console.warn("Audio error:", e));
}

function checkLogin() {
  try {
    const savedName = localStorage.getItem('glob_username');
    if (savedName) {
      document.getElementById('username-input').value = savedName;
      loadProgress(savedName);
    }
  } catch (e) { console.warn("LocalStorage no disponible"); }
}

function handleLogin() {
  const nameInput = document.getElementById('username-input');
  const passInput = document.getElementById('password-input');
  const name = nameInput ? nameInput.value.trim() : "";
  const password = passInput ? passInput.value : "";

  if (name) loadProgress(name);

  if (!name || !password) {
    const msgEl = document.getElementById('login-msg');
    if (msgEl) msgEl.textContent = translate('loginError');
    return;
  }

  if (USERS[name]) {
    if (USERS[name] !== password) {
      const msgEl = document.getElementById('login-msg');
      if (msgEl) msgEl.textContent = translate('loginError');
      return;
    }
  } else {
    USERS[name] = password;
    saveUsers();
    showMessage(translate('new_user_registered'), 'success');
  }

  try {
    localStorage.setItem('glob_username', name);
    loadProgress(name);
    drawBadges();
    updateMetaUI();
    drawTowerShop();
  } catch (e) { }

  document.getElementById('login-screen').style.display = 'none';
  const modeScreen = document.getElementById('mode-selection');
  modeScreen.style.display = 'flex';

  const metaControls = document.getElementById('meta-controls');
  if (metaControls) metaControls.style.display = 'flex';

  if (name === "Admin" || name === "KirByteBi") {
    gameState.adminMode = true;
    document.getElementById('admin-indicator').style.display = 'block';
    if (name === "KirByteBi") {
      gameState.antiNormalActive = false;
      gameState.unlockedAntiNormal = true;
    }
  }

  if (!gameState.unlockedAntiNormal) {
    gameState.antiNormalActive = true;
    modeScreen.classList.add('glitch-state');
    const disableBtn = document.getElementById('disable-antinormal-btn');
    if (disableBtn) disableBtn.style.display = 'block';
    showMessage(translate('system_unstable'), 'error');
  }

  const infBtn = document.querySelector('.mode-btn[data-mode="infinito"]');
  if (infBtn) {
    if (!gameState.unlockedInfinite && name !== "Admin" && name !== "KirByteBi") {
      infBtn.disabled = true;
      infBtn.style.opacity = "0.5";
      infBtn.title = translate('win_diff_required', { diff: translate('badge_winDificil_name') });
    } else {
      infBtn.disabled = false;
      infBtn.style.opacity = "1";
    }
  }

  const modes = ['normal', 'dificil', 'extremo', 'corrupto'];
  const requirements = { 'normal': 'winFacil', 'dificil': 'winNormal', 'extremo': 'winDificil', 'corrupto': 'winExtremo' };

  modes.forEach(m => {
    const btn = document.querySelector(`.mode-btn[data-mode="${m}"]`);
    if (btn && !gameState.adminMode) {
      const req = requirements[m];
      if (!BADGES[req].unlocked) {
        btn.disabled = true;
        btn.style.opacity = "0.4";
        btn.title = translate('win_diff_required', { diff: translate('badge_' + req + '_name') });
      } else {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.title = "";
      }
    }
  });
}

function disableAntiNormal() {
  gameState.antiNormalActive = false;
  const modeScreen = document.getElementById('mode-selection');
  if (modeScreen) modeScreen.classList.remove('glitch-state');
  const disableBtn = document.getElementById('disable-antinormal-btn');
  if (disableBtn) disableBtn.style.display = 'none';
  const gameArea = document.getElementById('game-area');
  if (gameArea) gameArea.classList.remove('anti-normal');
  showMessage(translate('system_restored'), 'success');
}

function selectMode(mode) {
  if (gameState.antiNormalActive && mode !== 'facil' && mode !== 'normal') {
    showMessage("3RR0R: ACC3S0 D3N364D0", 'error');
    const btn = document.querySelector(`.mode-btn[data-mode="${mode}"]`);
    if (btn) btn.classList.add('glitch-shake');
    setTimeout(() => btn.classList.remove('glitch-shake'), 500);
    return;
  }

  gameState.mode = mode;
  gameState.modeConfirmed = true;
  const limits = { facil: 10, normal: 15, dificil: 25, extremo: 40, infinito: 999, corrupto: 45 };
  gameState.maxWaves = limits[mode] || 15;

  if (gameState.antiNormalActive && mode === 'normal') {
    gameState.mode = 'antiNormal';
    gameState.maxWaves = 20;
    document.getElementById('game-area').classList.add('anti-normal');
    showMessage(translate('anti_normal_active'), 'error');
  }

  document.getElementById('mode-selection').style.display = 'none';
  document.getElementById('mode-selection').classList.remove('glitch-state');

  retryGame();

  gameState.globetines = 500;
  updateUI();
  showMessage(translate('mode_selected', { mode: mode.toUpperCase() }), 'info');

  setTimeout(() => {
    if (gameState.mode === 'corrupto') {
      const storyText = currentLanguage === 'es'
        ? "Bienvenido a Gelatin Lake... o lo que queda de él. Has entrado a mi región, donde los Pyces no actúan por voluntad propia, sino que obedecen mi sagrado diseño estelar. ¡Prepárate para ser asimilado!"
        : "Welcome to Gelatin Lake... or what is left of it. You have entered my region, where the Pyces do not act of their own free will, but obey my sacred stellar design. Prepare to be assimilated!";
      showNarratorMsg('img/MoonStar_Pyce.png', 'MoonStar Pyce', storyText);
    } else if (gameState.mode === 'antiNormal') {
      const storyText = currentLanguage === 'es'
        ? "¡S1S73M4 D3F1N171V0 D373C74D0! NOeye y MoonStar Pyce han unido sus fuerzas para crear la versión definitiva de este entorno. Los Globs serán borrados del sistema. ¡La purga comienza ya!"
        : "DEFINITIVE SYSTEM DETECTED! NOeye and MoonStar Pyce have joined forces to create the ultimate version of this environment. The Globs will be deleted from the system. The purge begins now!";
      showNarratorMsg('img/NOeye_Pyce.png', 'NOeye & MoonStar', storyText);
    }
  }, 1000);
}

function triggerCorrupt() {
  gameState.healthClicks++;
  if (gameState.healthClicks >= 7 && !gameState.corrupt) {
    gameState.corrupt = true;
    gameState.maxWaves = 45;
    gameState.mode = 'corrupto';
    document.getElementById('game-area').classList.add('corrupt');
    showMessage(translate('corrupt_active'), 'error');
    drawBadges();

    setTimeout(() => {
      const storyText = currentLanguage === 'es'
        ? "Bienvenido a Gelatin Lake... o lo que queda de él. Has entrado a mi región, donde los Pyces no actúan por voluntad propia, sino que obedecen mi sagrado diseño estelar. ¡Prepárate para ser asimilado!"
        : "Welcome to Gelatin Lake... or what is left of it. You have entered my region, where the Pyces do not act of their own free will, but obey my sacred stellar design. Prepare to be assimilated!";
      showNarratorMsg('img/MoonStar_Pyce.png', 'MoonStar Pyce', storyText);
    }, 1000);
  }
}

function createMap() {
  const map = document.getElementById('map');
  map.innerHTML = '';

  RIVER_ZONES.forEach(r => {
    const el = document.createElement('div');
    el.className = 'river';
    el.style.left = `${r.x}px`; el.style.top = `${r.y}px`;
    el.style.width = `${r.w}px`; el.style.height = `${r.h}px`;
    map.appendChild(el);
  });

  PATH_SEGMENTS.forEach(p => {
    const el = document.createElement('div');
    el.className = 'path-segment';
    el.style.left = `${p.x}px`; el.style.top = `${p.y}px`;
    el.style.width = `${p.w}px`; el.style.height = `${p.h}px`;
    map.appendChild(el);
  });

  TOWER_SPOTS.forEach((s, i) => {
    const el = document.createElement('div');
    el.className = 'tower-spot';
    el.dataset.id = i;
    el.style.left = `${s.x}px`; el.style.top = `${s.y}px`;
    el.style.width = `${s.w}px`; el.style.height = `${s.h}px`;
    map.appendChild(el);
    gameState.towerSpots.push({ occupied: false, x: s.x + 40, y: s.y + 40 });
  });
}

function showTooltip(t, el) {
  const tooltip = document.getElementById('tooltip');
  if (!tooltip) return;

  const rect = el.getBoundingClientRect();
  const name = translate('tower_' + (t.family || t.type) + '_name');
  tooltip.innerHTML = `
    <b>${translate(t.name)}</b>
    <p>${translate(t.desc) || ""}</p>
    <div style="margin-top: 5px; font-size: 0.75rem; color: #aaa;">
      ⚔️ ${t.damage || 0} | 🔭 ${t.range || 0}
    </div>
  `;
  tooltip.style.display = 'block';
  tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
  tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
}

function hideTooltip() {
  const tooltip = document.getElementById('tooltip');
  if (tooltip) tooltip.style.display = 'none';
}

let resetCounter = 0;
function confirmReset() {
  resetCounter++;
  const btn = document.getElementById('reset-btn');
  if (resetCounter === 1) {
    btn.textContent = translate('reset_confirm_1') || "⚠️ ¿ESTÁS SEGURO? (1/3)";
  } else if (resetCounter === 2) {
    btn.textContent = translate('reset_confirm_2') || "⚠️ ¿REALMENTE SEGURO? (2/3)";
  } else if (resetCounter === 3) {
    btn.textContent = translate('reset_confirm_3') || "💥 ÚLTIMO AVISO: BORRAR TODO (3/3)";
  } else if (resetCounter >= 4) {
    const user = localStorage.getItem('glob_username') || 'default';
    localStorage.removeItem('glob_progress_' + user);
    localStorage.removeItem('glob_defenders_save');
    alert(translate('reset_done') || "Progreso completamente reseteado.");
    location.reload();
  }
}

function openOptions() {
  resetCounter = 0;
  const btn = document.getElementById('reset-btn');
  if (btn) btn.textContent = translate('reset_progress_btn');

  document.getElementById('options-modal').style.display = 'flex';
  document.getElementById('opt-show-desc').checked = gameState.settings.showShopDesc;
  document.getElementById('opt-show-damage').checked = gameState.settings.showTotalDamage;
  const hitboxCheck = document.getElementById('opt-show-hitbox');
  if (hitboxCheck) hitboxCheck.checked = showHitbox;

  const cheatedRow = document.getElementById('admin-cheated-row');
  if (cheatedRow) {
    cheatedRow.style.display = gameState.adminMode ? 'flex' : 'none';
  }
  const cheatedCheck = document.getElementById('opt-cheated');
  if (cheatedCheck) {
    cheatedCheck.checked = !!gameState.cheatedModeActive;
  }
}

function closeOptions() {
  document.getElementById('options-modal').style.display = 'none';
  saveProgress();
}

function activateCheatedMode() {
  gameState.cheatedBackup = {
    unlockedSkins: JSON.parse(JSON.stringify(gameState.unlockedSkins)),
    equippedSkins: JSON.parse(JSON.stringify(gameState.equippedSkins)),
    claimedRewards: JSON.parse(JSON.stringify(gameState.claimedRewards)),
    pycoins: gameState.pycoins,
    duckPassCurrency: gameState.duckPassCurrency,
    duckPassXP: gameState.duckPassXP,
    duckPassLevel: gameState.duckPassLevel,
    badges: Object.fromEntries(Object.entries(BADGES).map(([k, v]) => [k, v.unlocked]))
  };
  gameState.cheatedModeActive = true;

  Object.keys(BADGES).forEach(k => {
    BADGES[k].unlocked = true;
  });

  gameState.claimedRewards = Object.keys(BADGES);

  const allSkins = ['default'];
  Object.keys(SKINS_DATA).forEach(family => {
    SKINS_DATA[family].forEach(skin => {
      if (skin.id && !allSkins.includes(skin.id)) {
        allSkins.push(skin.id);
      }
    });
  });
  gameState.unlockedSkins = allSkins;

  drawBadges();
  updateMetaUI();
  drawTowerShop();
  saveProgress();
  showMessage(currentLanguage === 'es' ? "¡Modo Cheated Activado! 👑" : "Cheated Mode Activated! 👑", 'success');
}

function deactivateCheatedMode() {
  if (!gameState.cheatedBackup) return;

  const backup = gameState.cheatedBackup;
  gameState.unlockedSkins = backup.unlockedSkins || ['default'];
  gameState.equippedSkins = backup.equippedSkins || { 'Glob': 'default', 'Red_Glob': 'default', 'Global': 'default', 'Grey': 'default' };
  gameState.claimedRewards = backup.claimedRewards || [];
  gameState.pycoins = backup.pycoins || 0;
  gameState.duckPassCurrency = backup.duckPassCurrency || 0;
  gameState.duckPassXP = backup.duckPassXP || 0;
  gameState.duckPassLevel = backup.duckPassLevel || 1;

  Object.keys(BADGES).forEach(k => {
    if (BADGES[k]) {
      BADGES[k].unlocked = !!backup.badges[k];
    }
  });

  gameState.cheatedModeActive = false;
  gameState.cheatedBackup = null;

  gameState.towers.forEach(t => {
    t.el.style.backgroundImage = `url('${getTowerImage(t.type)}')`;
    applyTowerEffects(t.el, t.type);
  });

  drawBadges();
  updateMetaUI();
  drawTowerShop();
  saveProgress();
  showMessage(currentLanguage === 'es' ? "¡Modo Cheated Desactivado!" : "Cheated Mode Deactivated!", 'info');
}

function updateHitboxesVisibility() {
  const map = document.getElementById('map');
  if (map) {
    if (typeof showHitbox !== 'undefined' && showHitbox) map.classList.add('show-hitboxes');
    else map.classList.remove('show-hitboxes');
  }
}

function updateSettings() {
  gameState.settings.showShopDesc = document.getElementById('opt-show-desc').checked;
  gameState.settings.showTotalDamage = document.getElementById('opt-show-damage').checked;

  const hitboxCheck = document.getElementById('opt-show-hitbox');
  if (hitboxCheck) showHitbox = hitboxCheck.checked;
  updateHitboxesVisibility();

  document.getElementById('total-damage-stat').style.display = gameState.settings.showTotalDamage ? 'flex' : 'none';

  const cheatedCheck = document.getElementById('opt-cheated');
  if (cheatedCheck) {
    const isCheatedNow = cheatedCheck.checked;
    if (isCheatedNow && !gameState.cheatedModeActive) {
      activateCheatedMode();
    } else if (!isCheatedNow && gameState.cheatedModeActive) {
      deactivateCheatedMode();
    }
  }

  drawTowerShop();
  saveProgress();
}

function drawTowerShop() {
  if (!gameState.modeConfirmed) return;

  const existingShop = document.getElementById('floating-tower-shop');
  if (existingShop) existingShop.remove();

  const shopContainer = document.createElement('div');
  shopContainer.id = 'floating-tower-shop';
  shopContainer.className = 'floating-tower-shop';

  const shopTowers = [
    { type: 'Glob', unlocked: true },
    { type: 'Red_Glob', unlocked: true },
    { type: 'Soap_Glob', unlocked: gameState.duckPassLevel >= 3, req: 'lvl3' },
    { type: 'Ducky_Glob', unlocked: gameState.duckPassLevel >= 6, req: 'lvl6' },
    { type: 'Comet_Glob', unlocked: !!(TOWER_TYPES['Comet_Glob'] && TOWER_TYPES['Comet_Glob'].unlocked), req: 'shop' },
    { type: 'Old_Glob', unlocked: !!(TOWER_TYPES['Old_Glob'] && TOWER_TYPES['Old_Glob'].unlocked), req: 'shop' },
    { type: 'Work_Bombot', unlocked: !!(TOWER_TYPES['Work_Bombot'] && TOWER_TYPES['Work_Bombot'].unlocked), req: 'challenge' }
  ];

  shopTowers.forEach(item => {
    const type = item.type;
    const t = TOWER_TYPES[type];
    if (!t) return;

    const currentCount = gameState.towerCounts[type] || 0;
    const limit = gameState.towerLimits[type] || 3;
    const isFull = currentCount >= limit;
    const displayImg = getTowerImage(type);
    const name = translate(t.name);

    const btn = document.createElement('button');

    if (!item.unlocked) {
      btn.className = 'floating-tower-btn locked';
      let reqText = '';
      let unlockMsg = '';
      if (item.req === 'lvl3') { reqText = 'Lvl 3'; unlockMsg = currentLanguage === 'es' ? '🔒 Se desbloquea en Duck Pass Nivel 3' : '🔒 Unlocks at Duck Pass Level 3'; }
      else if (item.req === 'lvl6') { reqText = 'Lvl 6'; unlockMsg = currentLanguage === 'es' ? '🔒 Se desbloquea en Duck Pass Nivel 6' : '🔒 Unlocks at Duck Pass Level 6'; }
      else if (item.req === 'challenge') { reqText = (currentLanguage === 'es' ? 'DESAFÍO' : 'CHALLENGE'); unlockMsg = currentLanguage === 'es' ? '🔒 Desbloqueado al superar modo Anti-normal o Corrupto' : '🔒 Unlocked by beating Anti-normal or Corrupt mode'; }
      else if (item.req === 'shop') { reqText = (currentLanguage === 'es' ? 'TIENDA' : 'SHOP'); unlockMsg = currentLanguage === 'es' ? '🔒 Desbloquéalo en la Tienda Meta por PyCoins' : '🔒 Unlock it in the Meta Shop using PyCoins'; }

      btn.innerHTML = `
                <div class="lock-overlay">🔒</div>
                <img src="${displayImg}" alt="${name}" style="filter: grayscale(1) opacity(0.4);">
                <span style="font-size:0.55rem; color:#ff9f43; font-weight:900;">${reqText}</span>
            `;
      btn.onclick = (e) => {
        e.stopPropagation();
        showMessage(unlockMsg, 'warning');
      };
    } else {
      btn.className = 'floating-tower-btn';
      if (isFull) btn.classList.add('disabled');
      if (gameState.selectedTowerType === type) btn.classList.add('selected');

      btn.innerHTML = `
                <img src="${displayImg}" alt="${name}">
                <span style="font-size:0.65rem;">💰${t.cost}</span>
            `;

      btn.onclick = (e) => {
        e.stopPropagation();
        if (isFull) {
          showMessage(translate('limit_reached', { name: name, limit: limit }), 'error');
          return;
        }
        if (gameState.selectedTowerType === type) {
          gameState.selectedTowerType = null;
          btn.classList.remove('selected');
        } else {
          document.querySelectorAll('.floating-tower-btn').forEach(b => b.classList.remove('selected'));
          gameState.selectedTowerType = type;
          btn.classList.add('selected');
        }
      };
    }

    shopContainer.appendChild(btn);
  });

  document.body.appendChild(shopContainer);
}

function drawBadges() {
  const list = document.getElementById('badges-list');
  if (!list) return;
  list.innerHTML = '';
  Object.values(BADGES).forEach(b => {
    if (b.unlocked && !gameState.claimedRewards.includes(b.key)) {
      grantBadgeReward(b);
    }
    const el = document.createElement('div');
    el.className = `badge ${b.unlocked ? '' : 'locked'}`;
    const name = translate(`badge_${b.key}_name`);
    const desc = translate(`badge_${b.key}_desc`);

    let rewardText = "";
    if (b.reward.pycoins) rewardText = `💰+${b.reward.pycoins}`;
    if (b.reward.duckpass) rewardText = `🦆+${b.reward.duckpass}`;
    rewardText += ` ✨+${b.reward.xp}xp`;

    el.innerHTML = `
            <span class="badge-icon">${b.icon}</span>
            <div class="badge-info">
                <b>${name}</b><br>
                <small>${desc}</small><br>
                <b style="color:#ffd700; font-size:0.7rem">${rewardText}</b>
            </div>
        `;
    list.appendChild(el);
  });
}

function unlockBadge(key) {
  if (BADGES[key] && !BADGES[key].unlocked) {
    BADGES[key].unlocked = true;
    saveProgress();
    drawBadges();
    showBadgePopup(BADGES[key]);
  }
}

function showBadgePopup(badge) {
  const popup = document.getElementById('badge-popup');
  const icon = document.getElementById('badge-popup-icon');
  const title = document.getElementById('badge-popup-title');
  const desc = document.getElementById('badge-popup-desc');
  if (!popup) return;

  icon.textContent = badge.icon;
  title.textContent = translate(`badge_${badge.key}_name`);
  desc.textContent = translate(`badge_${badge.key}_desc`);

  popup.classList.add('show');
  setTimeout(() => popup.classList.remove('show'), 4000);
}

function grantBadgeReward(badge) {
  if (gameState.claimedRewards.includes(badge.key)) return;

  if (badge.reward.pycoins) gameState.pycoins += badge.reward.pycoins;
  if (badge.reward.duckpass) gameState.duckPassCurrency += badge.reward.duckpass;
  addXP(badge.reward.xp);

  gameState.claimedRewards.push(badge.key);
  updateMetaUI();
  saveProgress();
  showMessage(translate('badge_reward_received', { name: translate('badge_' + badge.key + '_name') }), 'success');
}

function toggleLanguage() {
  currentLanguage = currentLanguage === 'es' ? 'en' : 'es';
  updateLanguage();
  drawTowerShop();
  drawBadges();
  if (document.getElementById('story-logs-modal').style.display === 'flex') drawStoryLogs();
}

function toggleBadgesPanel() {
  const panel = document.getElementById('badges-panel');
  if (panel) {
    panel.classList.toggle('show');
  }
}

function bindEvents() {
  document.getElementById('login-btn').onclick = handleLogin;
  const nameInput = document.getElementById('username-input');
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      const name = nameInput.value.trim();
      if (name) loadProgress(name);
      updateMetaUI();
    });

    const musicToggle = document.getElementById('music-toggle-btn');
    if (musicToggle) musicToggle.onclick = toggleMusic;

    const effectsToggle = document.getElementById('effects-toggle-btn');
    if (effectsToggle) effectsToggle.onclick = toggleMute;

    document.addEventListener('click', function (e) {
      const panel = document.getElementById('badges-panel');
      const btn = document.getElementById('badges-toggle-btn');
      if (panel && panel.classList.contains('show')) {
        if (!panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
          panel.classList.remove('show');
        }
      }
    });
  }

  const logo = document.querySelector('.login-logo');
  if (logo) {
    logo.onclick = () => {
      gameState.logoClicks++;
      logo.style.transition = 'transform 0.5s ease, filter 0.2s ease';
      const spins = Math.floor(Math.random() * 3) + 1;
      logo.style.transform = `scale(1.2) rotate(${360 * spins}deg)`;
      logo.style.filter = `hue-rotate(${Math.random() * 360}deg) invert(${Math.random() > 0.5 ? 1 : 0})`;

      setTimeout(() => {
        logo.style.transition = 'transform 0.3s ease, filter 0.3s ease';
        logo.style.transform = `scale(1) rotate(0deg)`;
        logo.style.filter = 'none';
      }, 500);

      if (gameState.unlockedAntiNormal) {
        gameState.pycoins += 1;
        updateMetaUI();
        showEffect(window.innerWidth / 2, window.innerHeight / 2, "+1 PyCoin");
        saveProgress();
      }
    };
  }

  document.querySelectorAll('.mode-btn').forEach(btn => btn.onclick = () => selectMode(btn.dataset.mode));
  document.getElementById('health-stat').onclick = triggerCorrupt;
  document.getElementById('start-wave').onclick = () => startWave();
  document.getElementById('auto-wave').onclick = () => {
    gameState.autoWave = !gameState.autoWave;
    document.getElementById('auto-wave').classList.toggle('active', gameState.autoWave);
    if (gameState.autoWave && !gameState.waveActive) startWave();
  };

  document.getElementById('deselect-tower').onclick = () => {
    gameState.selectedTowerType = null;
    document.querySelectorAll('.tower-item').forEach(i => i.classList.remove('selected'));
  };

  document.getElementById('tower-shop').onclick = (e) => {
    const item = e.target.closest('.tower-item');
    if (item) {
      gameState.selectedTowerType = item.dataset.type;
      document.querySelectorAll('.tower-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
    }
  };

  document.getElementById('map').onclick = (e) => {
    const spotEl = e.target.closest('.tower-spot');
    if (spotEl && gameState.selectedTowerType) {
      const id = spotEl.dataset.id;
      if (!gameState.towerSpots[id].occupied) placeTower(id, gameState.selectedTowerType);
    }
  };

  document.getElementById('apply-code').onclick = () => {
    const input = document.getElementById('game-code');
    const code = input.value.trim().toUpperCase();
    if (!code) return;

    if (gameState.usedCodes[code]) {
      showMessage(translate('code_already_used'), 'warning');
      input.value = '';
      return;
    }

    let valid = false;
    const rewards = {
      'GL0B_CL1CKER': { py: 100, msg: '100 PyCoins', badge: 'secret' },
      'B1TL4NDS': { py: 50, xp: 150, msg: '50 PyCoins + 150 XP' },
      'GLOBFNF': { py: 76, xp: 150, msg: '76 PyCoins + 150 XP' },
      'PINKWAVE': { py: 30, dp: 30, msg: '30 PyCoins + 30 DuckPass' },
      'B4D_P1GG13S': { py: 50, dp: 5, msg: '50 PyCoins + 5 DuckPass' },
      'MUSICFAN': { py: 50, xp: 10, msg: '50 PyCoins + 10 XP' },
      'T3CHSP4WN': { py: 50, xp: 150, msg: '50 PyCoins + 150 XP' },
      'ICEDAGGGER': { py: 100, dp: 25, msg: '100 PyCoins + 25 DuckPass' },
      'VENOMSHARK': { py: 100, dp: 25, msg: '100 PyCoins + 25 DuckPass' },
      'GHOSTWALKER': { py: 100, dp: 25, msg: '100 PyCoins + 25 DuckPass' },
      'FIREBRAND': { py: 100, dp: 25, msg: '100 PyCoins + 25 DuckPass' },
      'WINDFORCE': { py: 100, dp: 25, msg: '100 PyCoins + 25 DuckPass' },
      'THANIYEL': { dp: 150, xp: 500, msg: '150 DuckPass + 500 XP' },
      'JANBO': { py: 123, msg: '123 PyCoins' },
      'ILERNA': { py: 130, msg: '130 PyCoins' },
      'MANOLO': { py: 100, msg: '100 PyCoins' },
      'BETA_OPENING': { dp: 100, msg: '100 DuckPass' },
      'REWORKED': { dp: 100, py: 100, xp: 200, msg: '100 DuckPass + 100 PyCoins + 200 XP' },
      'GLOBS_ATTACK': { dp: 100, xp: 100, msg: '100 DuckPass + 100 XP' },
      'GALAXIUM': { py: 200, dp: 200, msg: '200 PyCoins + 200 DuckPass' }
    };

    if (rewards[code]) {
      const r = rewards[code];
      if (r.py) gameState.pycoins += r.py;
      if (r.xp) addXP(r.xp);
      if (r.dp) gameState.duckPassCurrency += r.dp;
      if (r.badge) unlockBadge(r.badge);
      showMessage(translate('codeSuccess', { name: r.msg }), 'success');
      valid = true;
    }

    if (valid) {
      gameState.failedCodeAttempts = 0;
      gameState.usedCodes[code] = true;
      updateMetaUI();
      drawBadges();
      saveProgress();
    } else {
      gameState.failedCodeAttempts++;
      showMessage(gameState.failedCodeAttempts >= 3 ? translate('look_defender') + " " + "B4D_P1GG13S" : translate('codeInvalid'), 'error');
    }
    input.value = '';
  };

  document.getElementById('debug-toggle').onclick = () => {
    gameState.adminMode = !gameState.adminMode;
    document.getElementById('admin-indicator').style.display = gameState.adminMode ? 'block' : 'none';
    if (gameState.adminMode) gameState.globetines += 10000;
    updateUI();
  };

  const shopBtn = document.getElementById('open-shop');
  if (shopBtn) shopBtn.onclick = () => { saveGameSnapshot(); if (typeof openShop === 'function') openShop(); };

  const passBtn = document.getElementById('open-pass');
  if (passBtn) passBtn.onclick = () => { saveGameSnapshot(); if (typeof openPass === 'function') openPass(); };

  const storyBtn = document.getElementById('open-story-logs');
  if (storyBtn) storyBtn.onclick = () => { saveGameSnapshot(); openStoryLogs(); };

  const badgesBtn = document.getElementById('badges-toggle-btn');
  if (badgesBtn) badgesBtn.onclick = toggleBadgesPanel;

  document.querySelectorAll('.modal .modal-close, .modal .close-btn').forEach(btn => {
    btn.onclick = (e) => {
      const modal = btn.closest('.modal');
      if (!modal) return;
      modal.style.display = 'none';
      if (!gameState.modeConfirmed) {
        const ms = document.getElementById('mode-selection');
        if (ms) ms.style.display = 'flex';
      } else {
        restoreGameSnapshot();
      }
    };
  });

  window.addEventListener('resize', applyScale);
}

function saveGameSnapshot() {
  gameState._snapshot = {
    mode: gameState.mode,
    modeConfirmed: gameState.modeConfirmed,
    wave: gameState.wave,
    waveActive: gameState.waveActive,
    health: gameState.health,
    globetines: gameState.globetines,
    pycoins: gameState.pycoins,
    duckPassXP: gameState.duckPassXP,
    duckPassLevel: gameState.duckPassLevel,
    towers: JSON.parse(JSON.stringify(gameState.towers || [])),
    enemies: (gameState.enemies || []).map(e => ({ type: e.type, x: e.x, y: e.y, health: e.health, pathIndex: e.pathIndex, boss: e.boss })),
    projectiles: []
  };
  try { localStorage.setItem('gd_snapshot', JSON.stringify(gameState._snapshot)); } catch (e) { }
}

function restoreGameSnapshot() {
  const snap = gameState._snapshot || (function () { try { return JSON.parse(localStorage.getItem('gd_snapshot')); } catch (e) { return null; } })();
  if (!snap) return;
  gameState.mode = snap.mode;
  gameState.modeConfirmed = !!snap.modeConfirmed;
  gameState.wave = snap.wave;
  gameState.waveActive = !!snap.waveActive;
  gameState.health = snap.health;
  gameState.globetines = snap.globetines;
  gameState.pycoins = snap.pycoins;
  gameState.duckPassXP = snap.duckPassXP;
  gameState.duckPassLevel = snap.duckPassLevel;
  gameState.towers = snap.towers || [];
  gameState.enemies = (snap.enemies || []).map(e => {
    const t = ENEMY_TYPES[e.type] || {};
    return { ...t, type: e.type, x: e.x, y: e.y, health: e.health, maxHealth: e.health, pathIndex: e.pathIndex, boss: !!e.boss };
  });
  delete gameState._snapshot;
  try { localStorage.removeItem('gd_snapshot'); } catch (e) { }
}

function openShop() {
  closeModal('pass-modal');
  document.getElementById('shop-modal').style.display = 'flex';
  drawShop();
}

function openPass() {
  closeModal('shop-modal');
  document.getElementById('pass-modal').style.display = 'flex';
  drawPass();
  updateMetaUI();
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function smartClose(modalId) {
  closeModal(modalId);
  const modeScreen = document.getElementById('mode-selection');
  if (!gameState.modeConfirmed && document.getElementById('login-screen').style.display === 'none') {
    modeScreen.style.display = 'flex';
  }
}

function backToModes() {
  closeModal('shop-modal');
  closeModal('pass-modal');
  closeModal('story-logs-modal');
  document.getElementById('mode-selection').style.display = 'flex';
}

const GAME_DESIGN_W = 1000;
const GAME_DESIGN_H = 600;

function applyScale() {
  const area = document.getElementById('game-area');
  const wrapper = document.querySelector('.game-scale-wrapper');
  if (!area || !wrapper) return;
  const availW = Math.min(window.innerWidth - 40, GAME_DESIGN_W);
  const scale = Math.min(availW / GAME_DESIGN_W, 1.0);
  area.style.transform = `scale(${scale})`;
  wrapper.style.height = (GAME_DESIGN_H * scale) + 'px';
}

function updateBuffs() {
  gameState.towerBuffs = { damage: gameState.metaDamage || 1, range: gameState.metaRange || 0, speed: 1 };
  SKINS_DATA['Global'].forEach(m => {
    if (m.buff && gameState.duckPassLevel >= m.level) {
      if (m.buff.damage) gameState.towerBuffs.damage *= m.buff.damage;
      if (m.buff.range_flat) gameState.towerBuffs.range += m.buff.range_flat;
      if (m.buff.speed) gameState.towerBuffs.speed *= m.buff.speed;
    }
  });
  gameState.towers.forEach(t => {
    const base = TOWER_TYPES[t.type];
    t.damage = base.damage * gameState.towerBuffs.damage;
    t.range = base.range + gameState.towerBuffs.range;
    if (gameState.globalRangeBuffTimer && gameState.globalRangeBuffTimer > 0) {
      t.range += 50;
    }
    t.speed = base.speed * gameState.towerBuffs.speed;
  });
}

function getPycoinMultiplier() {
  if (gameState.duckPassLevel >= 100) return 3.0;
  if (gameState.duckPassLevel >= 80) return 2.5;
  if (gameState.duckPassLevel >= 60) return 1.5;
  return 1.0;
}

function getDuckpassMultiplier() {
  if (gameState.duckPassLevel >= 100) return 2.0;
  return 1.0;
}

function addXP(amount) {
  gameState.duckPassXP += amount;
  while (gameState.duckPassXP >= 100) {
    gameState.duckPassLevel++;
    gameState.duckPassXP -= 100;
    updateBuffs();
    if (gameState.duckPassLevel <= 100) {
      gameState.duckPassCurrency++;
      showMessage(translate('level_duckpass', { level: gameState.duckPassLevel }), 'success');
    } else if (gameState.duckPassLevel % 5 === 0) {
      gameState.duckPassCurrency += 2;
      showMessage(translate('prestige_duckpass'), 'success');
    }
    saveProgress();
  }
  updateMetaUI();
}

function updateMetaUI() {
  const pycoinsEl = document.getElementById('pycoins-value');
  const duckpassEl = document.getElementById('duckpass-currency');
  if (pycoinsEl) pycoinsEl.textContent = Math.floor(gameState.pycoins);
  if (duckpassEl) duckpassEl.textContent = gameState.duckPassCurrency;

  if (gameState.pycoins >= 1500 && gameState.duckPassCurrency >= 1500) {
    unlockBadge('deepSavings');
  }

  document.querySelectorAll('.shop-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === currentShopTab);
  });

  if (document.getElementById('pass-modal').style.display === 'flex') {
    document.getElementById('pass-level').textContent = gameState.duckPassLevel;
    document.getElementById('pass-xp').textContent = gameState.duckPassXP;
    document.getElementById('xp-fill').style.width = `${gameState.duckPassXP}%`;
  }
}

function isTowerOwned(t) {
  if (t === 'Glob' || t === 'Red_Glob' || t === 'Recolors' || t === 'Global') return true;
  if (t === 'Soap_Glob') return gameState.duckPassLevel >= 3;
  if (t === 'Ducky_Glob') return gameState.duckPassLevel >= 6;
  if (t === 'Work_Bombot') return !!(TOWER_TYPES['Work_Bombot'] && TOWER_TYPES['Work_Bombot'].unlocked);
  if (t === 'Old_Glob' || t === 'Pyce_Glob' || t === 'Grey') return !!(TOWER_TYPES['Old_Glob'] && TOWER_TYPES['Old_Glob'].unlocked);
  if (t === 'Comet_Glob') return !!(TOWER_TYPES['Comet_Glob'] && TOWER_TYPES['Comet_Glob'].unlocked);
  return false;
}

function drawShop() {
  const container = document.getElementById('shop-items');
  if (!container) return;
  container.innerHTML = `
    <div class="shop-header-tabs">
      <button class="shop-tab-btn ${currentShopTab === 'upgrades' ? 'active' : ''}" onclick="switchShopTab('upgrades')">${translate('shop_upgrades')}</button>
      <button class="shop-tab-btn ${currentShopTab === 'duckgrades' ? 'active' : ''}" onclick="switchShopTab('duckgrades')">${translate('duckgrade_title')}</button>
      <button class="shop-tab-btn ${currentShopTab === 'gtacks' ? 'active' : ''}" onclick="switchShopTab('gtacks')">G-Tacks</button>
      <button class="shop-tab-btn ${currentShopTab === 'skins' ? 'active' : ''}" onclick="switchShopTab('skins')">${translate('shop_skins')}</button>
    </div>
    <div class="shop-balance">
      <div class="balance-item"><img src="img/Tokens/PyCoin.png" width="20"> <span>${Math.floor(gameState.pycoins)} PyCoins</span></div>
      <div class="balance-item"><img src="img/Tokens/DuckPass.png" width="20"> <span>${gameState.duckPassCurrency} Duck Pass</span></div>
    </div>
  `;

  if (currentShopTab === 'upgrades') {
    const upgrades = [
      { id: 'hp', name: 'upgrade_hp_name', desc: 'upgrade_hp_desc', cost: 50, type: 'pycoin', level: gameState.baseHealthLevel, max: 10 },
      { id: 'unlock_Old_Glob', name: 'upgrade_unlock_old_name', desc: 'upgrade_unlock_old_desc', cost: 150, type: 'pycoin', hideIfUnlocked: true },
      { id: 'unlock_Comet_Glob', name: 'upgrade_unlock_comet_name', desc: 'upgrade_unlock_comet_desc', cost: 250, type: 'pycoin', hideIfUnlocked: true },
      { id: 'meta_range', name: 'upgrade_range_name', desc: 'upgrade_range_desc', cost: 10, type: 'duckpass', level: gameState.metaRangeLevel, max: 5 },
      { id: 'meta_damage', name: 'upgrade_damage_name', desc: 'upgrade_damage_desc', cost: 15, type: 'duckpass', level: gameState.metaDamageLevel, max: 5 }
    ];
    ['Glob', 'Red_Glob', 'Soap_Glob', 'Ducky_Glob', 'Comet_Glob', 'Old_Glob', 'Work_Bombot'].forEach(t => {
      const isUnlocked = isTowerOwned(t);

      if (isUnlocked && gameState.towerLimits[t] < 10) {
        upgrades.push({ id: 'limit_' + t, name: 'upgrade_limit_name', desc: 'upgrade_limit_desc', cost: 30, type: 'pycoin', params: { name: translate(TOWER_TYPES[t].name) } });
      }
    });

    upgrades.forEach(u => {
      if (u.id === 'unlock_Old_Glob' && TOWER_TYPES['Old_Glob'].unlocked) return;
      if (u.id === 'unlock_Comet_Glob' && TOWER_TYPES['Comet_Glob'].unlocked) return;
      const el = document.createElement('div');
      const isMax = u.max && u.level >= u.max;
      el.className = `meta-item ${isMax ? 'unlocked' : ''}`;
      const costIcon = u.type === 'pycoin' ? 'img/Tokens/PyCoin.png' : 'img/Tokens/DuckPass.png';

      const levelText = u.max ? ` [${u.level}/${u.max}]` : '';
      el.innerHTML = `<h3>${translate(u.name, u.params)}${levelText}</h3><p>${translate(u.desc, u.params)}</p>
        <div class="cost">${isMax ? translate('max_reached') : `<img src="${costIcon}" width="18"> ${u.cost}`}</div>
        <button class="meta-buy-btn" ${isMax || !canAfford(u) ? 'disabled' : ''} onclick="buyUpgrade('${u.id}', ${u.cost}, '${u.type}')">${isMax ? '✅' : translate('buy')}</button>`;
      container.appendChild(el);
    });
  } else if (currentShopTab === 'duckgrades') {
    const dgs = [
      { id: 'dg_Glob', name: 'duckgrade_glob_name', desc: 'duckgrade_glob_desc', cost: 15, family: 'Glob' },
      { id: 'dg_Red_Glob', name: 'duckgrade_red_name', desc: 'duckgrade_red_desc', cost: 20, family: 'Red_Glob' },
      { id: 'dg_Soap_Glob', name: 'duckgrade_soap_name', desc: 'duckgrade_soap_desc', cost: 18, family: 'Soap_Glob' },
      { id: 'dg_Comet_Glob', name: 'duckgrade_comet_name', desc: 'duckgrade_comet_desc', cost: 25, family: 'Comet_Glob' },
      { id: 'dg_Pyce_Glob', name: 'duckgrade_pyce_name', desc: 'duckgrade_pyce_desc', cost: 22, family: 'Special' },
      { id: 'dg_Old_Glob', name: 'duckgrade_old_name', desc: 'duckgrade_old_desc', cost: 20, family: 'Special' },
      { id: 'dg_Work_Bombot', name: 'duckgrade_bombot_name', desc: 'duckgrade_bombot_desc', cost: 30, family: 'Special' },
      { id: 'dg_Ducky_Glob', name: 'duckgrade_duck_name', desc: 'duckgrade_duck_desc', cost: 15, family: 'Ducky_Glob' }
    ];

    const filteredDgs = dgs.filter(u => {
      if (u.id === 'dg_Glob' || u.id === 'dg_Red_Glob') return true;
      if (u.id === 'dg_Soap_Glob') return isTowerOwned('Soap_Glob');
      if (u.id === 'dg_Comet_Glob') return isTowerOwned('Comet_Glob');
      if (u.id === 'dg_Pyce_Glob' || u.id === 'dg_Old_Glob') return isTowerOwned('Old_Glob');
      if (u.id === 'dg_Work_Bombot') return isTowerOwned('Work_Bombot');
      if (u.id === 'dg_Ducky_Glob') return isTowerOwned('Ducky_Glob');
      return false;
    });

    const dgsLocked = gameState.duckPassLevel < 35;
    filteredDgs.forEach(u => {
      const isUnlocked = gameState.duckgrades[u.id];
      const el = document.createElement('div');
      el.className = `meta-item ${isUnlocked ? 'unlocked' : ''} ${dgsLocked ? 'level-locked' : ''}`;

      let buttonHTML = '';
      if (dgsLocked) {
        buttonHTML = `<button class="meta-buy-btn" disabled style="background: #95a5a6; border: 1px dashed #7f8c8d; cursor: not-allowed; color: #fff;">🔒 Req. Lvl 35</button>`;
      } else {
        buttonHTML = `<button class="meta-buy-btn" ${isUnlocked || gameState.duckPassCurrency < u.cost ? 'disabled' : ''} 
          onclick="buyUpgrade('${u.id}', ${u.cost}, 'duckpass')">${isUnlocked ? translate('active') : translate('buy')}</button>`;
      }

      el.innerHTML = `<h3>${translate(u.name)}</h3><p>${translate(u.desc)}</p>
        <div class="cost">${isUnlocked ? '✅' : `<img src="img/Tokens/DuckPass.png" width="18"> ${u.cost}`}</div>
        ${buttonHTML}`;
      container.appendChild(el);
    });
  } else if (currentShopTab === 'gtacks') {
    const gtacksData = [
      { id: 'Glob', name: 'Green G-Tack: Frenesí', desc: 'Frenesí de Disparos: Al activarla en combate, la torre verde de nivel máximo lanza 10 disparos de ametralladora casi instantáneos. Cuesta 400 Globets activar. (¡MUY OP!)', pyCost: 750, dpCost: 250 },
      { id: 'Red_Glob', name: 'Red G-Tack: Sobrecarga', desc: 'Sobrecarga de Ataque: Al activarla en combate, la torre roja de nivel máximo gana +5% de daño y aplica un efecto Tóxico DoT muy rápido. Cuesta 400 Globets activar.', pyCost: 550, dpCost: 180 },
      { id: 'Soap_Glob', name: 'Blue G-Tack: Rayo Paralizante', desc: 'Impacto Relámpago: Al activarla en combate, el próximo ataque de la torre azul de nivel máximo stunea a los enemigos garantizadamente, ¡INCLUYENDO JEFES! Cuesta 400 Globets activar.', pyCost: 580, dpCost: 190 },
      { id: 'Ducky_Glob', name: 'Yellow G-Tack: Lluvia Financiera', desc: 'Lluvia de Divisas: Al activarla en combate, la torre amarilla de nivel máximo genera 15 PyCoins y 3 DuckPasses. Cuesta 500 Globets activar.', pyCost: 650, dpCost: 210 },
      { id: 'Comet_Glob', name: 'Black G-Tack: Contagio', desc: 'Hongo Venenoso: Al activarla en combate, la torre negra de nivel máximo aplica veneno DoT (calavera/seta) que se propaga entre enemigos al morir o tocarse. Cuesta 400 Globets activar. (¡MUY OP!)', pyCost: 780, dpCost: 260 },
      { id: 'Old_Glob', name: 'Grey G-Tack: Amplificación', desc: 'Ampliación de Radar: Al activarla en combate, aumenta el rango de ataque de TODAS las torres del mapa en +50 por 10s. Cuesta 400 Globets activar.', pyCost: 520, dpCost: 170 }
    ];

    const gtacksLocked = gameState.duckPassLevel < 50;
    const filtered = gtacksData.filter(g => isTowerOwned(g.id));

    filtered.forEach(u => {
      const isUnlocked = gameState.gtacks[u.id];
      const el = document.createElement('div');
      el.className = `meta-item ${isUnlocked ? 'unlocked' : ''} ${gtacksLocked ? 'level-locked' : ''}`;

      let buttonHTML = '';
      if (gtacksLocked) {
        buttonHTML = `<button class="meta-buy-btn" disabled style="background: #95a5a6; border: 1px dashed #7f8c8d; cursor: not-allowed; color: #fff;">🔒 Req. Lvl 50</button>`;
      } else {
        buttonHTML = `<button class="meta-buy-btn" ${isUnlocked || gameState.pycoins < u.pyCost || gameState.duckPassCurrency < u.dpCost ? 'disabled' : ''} 
          onclick="buyGTack('${u.id}', ${u.pyCost}, ${u.dpCost})">${isUnlocked ? 'Activo' : 'Comprar'}</button>`;
      }

      el.innerHTML = `<h3>${u.name}</h3><p>${u.desc}</p>
        <div class="cost">${isUnlocked ? '✅' : `<img src="img/Tokens/PyCoin.png" width="16"> ${u.pyCost} + <img src="img/Tokens/DuckPass.png" width="16"> ${u.dpCost}`}</div>
        ${buttonHTML}`;
      container.appendChild(el);
    });
  } else {
    Object.keys(SKINS_DATA).forEach(family => {
      if (family === 'Global') return;
      if (!isTowerOwned(family)) return;
      SKINS_DATA[family].forEach(skin => {
        const isUnlocked = gameState.unlockedSkins.includes(skin.id);
        const isEquipped = gameState.equippedSkins[family] === skin.id;
        const el = document.createElement('div');
        el.className = `skin-item ${isEquipped ? 'equipped' : ''} ${skin.isSpecial ? 'special-skin' : ''}`;

        let costDisplay = '';
        let btnText = '';
        let canBuy = false;

        if (isUnlocked) {
          btnText = isEquipped ? translate('actual') : translate('equip_btn');
        } else if (skin.type === 'free') {
          btnText = '🔒 Derrota al Mimic Pyce';
          costDisplay = `<div class="cost" style="color:#ffd700">🎁 Gratis (drop)</div>`;
        } else if (skin.duckpass_cost) {
          canBuy = gameState.pycoins >= skin.cost && gameState.duckPassCurrency >= skin.duckpass_cost;
          costDisplay = `<div class="cost"><img src="img/Tokens/PyCoin.png" width="16"> ${skin.cost} + <img src="img/Tokens/DuckPass.png" width="16"> ${skin.duckpass_cost}</div>`;
          btnText = translate('buy');
        } else {
          canBuy = gameState.pycoins >= skin.cost;
          costDisplay = `<div class="cost"><img src="img/Tokens/PyCoin.png" width="16"> ${skin.cost}</div>`;
          btnText = translate('buy');
        }

        const previewImg = skin.skins ? (skin.skins[family] || Object.values(skin.skins)[0]) : 'img/Glob_DEF.png';
        const specialBadge = skin.isSpecial ? `<div class="special-badge">⭐ ESPECIAL</div>` : '';

        const buyable = isUnlocked ? true : (skin.type === 'free' ? false : canBuy);
        const onclickAction = isUnlocked
          ? `equipSkin('${family}', '${skin.id}')`
          : (skin.type === 'free' ? '' : `buySkin('${family}', '${skin.id}', ${skin.cost})`);

        el.innerHTML = `
          ${specialBadge}
          <div class="skin-preview ${skin.class || ''}"><img src="${previewImg}" style="width:100%; height:100%; filter:${skin.filter || ''}"></div>
          <h3>${translate(skin.name)}</h3><p>${translate(skin.desc)}</p>
          ${!isUnlocked ? costDisplay : ''}
          <button class="skin-buy-btn ${isUnlocked ? 'equip' : ''}" ${(!buyable && !isUnlocked) ? 'disabled' : ''} ${onclickAction ? `onclick="${onclickAction}"` : ''}>${btnText}</button>`;
        container.appendChild(el);
      });
    });
  }
}

let currentShopTab = 'upgrades';
function switchShopTab(tab) { currentShopTab = tab; drawShop(); }

function buyGTack(family, pyCost, dpCost) {
  if (gameState.duckPassLevel < 50) {
    showMessage(currentLanguage === 'es' ? "¡Necesitas Nivel 50 en el Duck Pass para comprar G-Tacks!" : "Requires Duck Pass Level 50 to buy G-Tacks!", 'error');
    return;
  }
  if (gameState.pycoins >= pyCost && gameState.duckPassCurrency >= dpCost) {
    gameState.pycoins -= pyCost;
    gameState.duckPassCurrency -= dpCost;
    gameState.gtacks[family] = true;
    unlockBadge('gtackFirst');
    drawShop();
    saveProgress();
    updateMetaUI();
    showMessage("¡G-Tack Desbloqueada! 🌟", 'success');
  } else {
    showMessage(translate('notEnoughMoney') || "¡No tienes suficientes divisas!", 'error');
  }
}

function buySkin(family, skinId, cost) {
  const skin = SKINS_DATA[family].find(s => s.id === skinId);
  if (skin.duckpass_cost) {
    if (gameState.pycoins >= cost && gameState.duckPassCurrency >= skin.duckpass_cost) {
      gameState.pycoins -= cost;
      gameState.duckPassCurrency -= skin.duckpass_cost;
      gameState.unlockedSkins.push(skinId);
      drawShop();
      saveProgress();
      updateMetaUI();
      showMessage(translate('skin_unlocked'), 'success');
    } else {
      showMessage(translate('notEnoughMoney'), 'error');
    }
    return;
  }
  if (gameState.pycoins >= cost) {
    gameState.pycoins -= cost;
    gameState.unlockedSkins.push(skinId);
    drawShop();
    saveProgress();
    showMessage(translate('skin_unlocked'), 'success');
  } else {
    showMessage(translate('no_pycoins'), 'error');
  }
}

function equipSkin(family, skinId) {
  gameState.equippedSkins[family] = skinId;
  gameState.towers.forEach(t => { if (t.family === family || family === 'Global') { t.el.style.backgroundImage = `url('${getTowerImage(t.type)}')`; applyTowerEffects(t.el, t.type); } });
  if (currentShopTab === 'skins') drawShop();
  if (document.getElementById('pass-modal').style.display === 'flex') drawPass();
  saveProgress();
  showMessage(translate('appearance_updated'), 'success');
}

function canAfford(u) { return u.type === 'pycoin' ? gameState.pycoins >= u.cost : gameState.duckPassCurrency >= u.cost; }

function buyUpgrade(id, cost, type) {
  if (id.startsWith('dg_') && gameState.duckPassLevel < 35) {
    showMessage(currentLanguage === 'es' ? "¡Necesitas Nivel 35 en el Duck Pass para comprar Duckgrades!" : "Requires Duck Pass Level 35 to buy Duckgrades!", 'error');
    return;
  }
  if (type === 'pycoin' ? gameState.pycoins < cost : gameState.duckPassCurrency < cost) return;
  if (type === 'pycoin') gameState.pycoins -= cost; else gameState.duckPassCurrency -= cost;

  if (id === 'hp') { if (gameState.baseHealthLevel >= 10) return; gameState.baseHealthLevel++; gameState.health += 20; showMessage(translate('base_hp_improved'), 'success'); }
  else if (id.startsWith('limit_')) {
    const tKey = id.replace('limit_', '');
    gameState.towerLimits[tKey]++;
    showMessage(translate('tower_limit_increased', { name: translate(TOWER_TYPES[tKey].name) }), 'success');
  }
  else if (id === 'meta_range') { if (gameState.metaRangeLevel >= 5) return; gameState.metaRangeLevel++; gameState.metaRange = (gameState.metaRange || 0) + 20; updateBuffs(); showMessage(translate('appearance_updated'), 'success'); }
  else if (id === 'meta_damage') { if (gameState.metaDamageLevel >= 5) return; gameState.metaDamageLevel++; gameState.metaDamage = (gameState.metaDamage || 1) + 0.15; updateBuffs(); showMessage(translate('appearance_updated'), 'success'); }
  else if (id === 'unlock_Old_Glob') {
    if (TOWER_TYPES['Old_Glob']) TOWER_TYPES['Old_Glob'].unlocked = true;
    if (TOWER_TYPES['Pyce_Glob']) TOWER_TYPES['Pyce_Glob'].unlocked = true;
    showMessage("🩶 " + (currentLanguage === 'es' ? "TORRE ANCIANA DESBLOQUEADA!" : "ANCIENT GLOB TOWER UNLOCKED!"), 'success');
  }
  else if (id === 'unlock_Comet_Glob') {
    if (TOWER_TYPES['Comet_Glob']) TOWER_TYPES['Comet_Glob'].unlocked = true;
    showMessage("🖤 " + (currentLanguage === 'es' ? "TORRE COMETA DESBLOQUEADA!" : "COMET GLOB TOWER UNLOCKED!"), 'success');
  }
  else if (id.startsWith('dg_')) {
    gameState.duckgrades[id] = true;
    showMessage("🦆 DUCKGRADE UNLOCKED!", 'success');
    unlockBadge('duckgradeFirst');
  }

  updateMetaUI(); drawShop(); drawTowerShop(); saveProgress();
}

function drawPass() {
  const container = document.getElementById('pass-rewards');
  if (!container) return; container.innerHTML = '';
  [...SKINS_DATA['Global']].sort((a, b) => a.level - b.level).forEach(skin => {
    const unlocked = gameState.duckPassLevel >= skin.level;
    const equipped = gameState.equippedSkins['Global'] === skin.id;
    const el = document.createElement('div');
    el.className = `meta-item ${unlocked ? 'unlocked' : 'locked'}`;
    let btnHTML = "";
    if (unlocked) {
      btnHTML = equipped ? `<button disabled>${translate('equipped')}</button>` : `<button onclick="equipSkin('Global', '${skin.id}')">${translate('equip_btn')}</button>`;
    } else {
      btnHTML = `<button disabled>${translate('req_level', { level: skin.level })}</button>`;
    }

    el.innerHTML = `<div class="milestone-tag">${skin.buff ? translate('upgrade') : translate('milestone')}</div><h3>${translate(skin.name)}</h3><p>${translate(skin.desc)}</p>
      ${skin.buff && unlocked ? `<b>${translate('active')}</b>` : btnHTML}`;
    container.appendChild(el);
  });
}

function placeTower(spotId, type) {
  const tCfg = TOWER_TYPES[type];
  if ((gameState.towerCounts[type] || 0) >= (gameState.towerLimits[type] || 3)) return showMessage(translate('limit_reached', { name: translate('tower_' + type + '_name'), limit: gameState.towerLimits[type] || 3 }), 'error');
  if (gameState.globetines < tCfg.cost) return showMessage(translate('notEnoughMoney'), 'error');

  const spot = gameState.towerSpots[spotId];
  const el = document.createElement('div');
  el.className = 'tower'; el.style.left = `${spot.x}px`; el.style.top = `${spot.y}px`;
  el.style.backgroundImage = `url('${getTowerImage(type)}')`;
  applyTowerEffects(el, type);
  document.getElementById('map').appendChild(el);

  const tower = { ...tCfg, type, x: spot.x, y: spot.y, el, cooldown: 0, spotId, stunned: 0, moneyTimer: 0 };
  tower.damage *= gameState.towerBuffs.damage;
  tower.range += gameState.towerBuffs.range;
  tower.speed *= gameState.towerBuffs.speed;

  el.onclick = (e) => { e.stopPropagation(); selectTower(tower); };
  gameState.towers.push(tower);
  gameState.globetines -= tCfg.cost;
  gameState.towerCounts[type] = (gameState.towerCounts[type] || 0) + 1;
  spot.occupied = true;
  updateUI(); drawTowerShop();
}

function selectTower(t) {
  gameState.selectedTower = t;
  const panel = document.getElementById('evolve-panel');
  panel.style.display = 'flex';

  panel.style.left = `${t.x - 140}px`;
  if (t.y < 350) {
    panel.style.top = `${t.y + 60}px`;
  } else {
    panel.style.top = `${t.y - 200}px`;
  }

  document.getElementById('tower-name').textContent = getTowerName(t);
  document.getElementById('tower-desc').innerHTML = translate(t.desc);
  updateEvolveButtons(t);
  drawRangePreview(t.x, t.y, t.range);
}

function getGTackName(family) {
  switch (family) {
    case 'Glob': return 'Frenesí ⚡';
    case 'Red_Glob': return 'Sobrecarga 🔥';
    case 'Soap_Glob': return 'Impacto Relámpago ⚡';
    case 'Ducky_Glob': return 'Lluvia Financiera 💰';
    case 'Comet_Glob': return 'Contagio 💀';
    case 'Grey': return 'Ampliación 📡';
    default: return 'G-Táctica';
  }
}

function activateGTack(t) {
  const cost = t.family === 'Ducky_Glob' ? 500 : 400;
  if (gameState.globetines < cost) return;
  if (t.gTackCooldown && t.gTackCooldown > 0) return;

  gameState.globetines -= cost;
  t.gTackCooldown = 30;

  updateUI();
  updateEvolveButtons(t);

  if (t.family === 'Glob') {
    t.frenzyShots = 10;
    t.cooldown = 0;
    showEffect(t.x, t.y - 25, "FRENZIED! ⚡", "#2ecc71");
  } else if (t.family === 'Red_Glob') {
    t.toxicTimer = 6;
    showEffect(t.x, t.y - 25, "OVERCHARGED! 🔥", "#e74c3c");
    gameState.usedGTackRed = true;
  } else if (t.family === 'Soap_Glob') {
    t.stunStrikeActive = true;
    showEffect(t.x, t.y - 25, "STUN STRIKE! ⚡", "#3498db");
  } else if (t.family === 'Ducky_Glob') {
    const earnedPy = Math.round(15 * getPycoinMultiplier());
    const earnedDp = Math.round(3 * getDuckpassMultiplier());
    gameState.pycoins += earnedPy;
    gameState.duckPassCurrency += earnedDp;
    updateMetaUI();
    saveProgress();
    showEffect(t.x, t.y - 25, `+${earnedPy} 💎 +${earnedDp} 🦆`, "#f1c40f");
    showMessage(`¡Lluvia Financiera! Recibiste ${earnedPy} PyCoins y ${earnedDp} DuckPasses`, 'success');
  } else if (t.family === 'Comet_Glob') {
    t.contagioTimer = 8;
    showEffect(t.x, t.y - 25, "CONTAGIO! 💀", "#9b59b6");
  } else if (t.family === 'Grey') {
    gameState.globalRangeBuffTimer = 10;
    updateBuffs();
    showEffect(t.x, t.y - 25, "RADAR AMPLIFIED! 📡", "#95a5a6");
    gameState.usedGTackGrey = true;
  }

  if (gameState.usedGTackRed && gameState.usedGTackGrey) {
    unlockBadge('supremeAlliance');
  }
}

function updateEvolveButtons(t) {
  const container = document.getElementById('evolve-options');
  if (container) {
    container.innerHTML = '';
    const next = TOWER_TYPES[t.evolution];
    if (next) {
      const btn = document.createElement('button');
      btn.className = 'evolve-btn';
      if (gameState.globetines < next.cost) btn.disabled = true;
      const nextName = getTowerName({ ...next, type: t.evolution, family: t.family });
      btn.innerHTML = `${translate('evolve_to', { name: nextName })} <div class="cost-tag"><img src="img/Tokens/Globetin.png" width="14"> ${next.cost}</div>`;
      btn.onclick = () => evolveTower(t, t.evolution);
      container.appendChild(btn);
    } else {
      const familyKey = t.family === 'Grey' ? 'Old_Glob' : t.family;
      const hasGTackUnlocked = gameState.gtacks[familyKey];
      if (hasGTackUnlocked) {
        const btn = document.createElement('button');
        btn.className = 'evolve-btn gtack-btn';
        const cost = t.family === 'Ducky_Glob' ? 500 : 400;
        const onCd = t.gTackCooldown && t.gTackCooldown > 0;
        if (gameState.globetines < cost || onCd) btn.disabled = true;

        let label = `G-TACK: ${getGTackName(t.family)}`;
        if (onCd) {
          label += ` (${Math.ceil(t.gTackCooldown)}s)`;
        }
        btn.innerHTML = `${label} <div class="cost-tag"><img src="img/Tokens/Globetin.png" width="14"> ${cost}</div>`;
        btn.onclick = () => activateGTack(t);
        container.appendChild(btn);
      } else {
        const el = document.createElement('div');
        el.className = 'gtack-locked';
        el.textContent = "🔒 G-Tack bloqueado en la Tienda Meta";
        container.appendChild(el);
      }
    }
  }
  const sellBtn = document.getElementById('sell-tower-btn');
  if (sellBtn) {
    const cost = Math.floor(t.cost * 0.7);
    sellBtn.innerHTML = `${translate('sell_tower')} <div class="cost-tag"><img src="img/Tokens/Globetin.png" width="14"> ${cost}</div>`;
    sellBtn.onclick = () => sellTower(t);
  }
}

function evolveTower(tower, nextType) {
  const next = TOWER_TYPES[nextType];
  if (gameState.globetines < next.cost) return;
  gameState.globetines -= next.cost;
  if (tower.type !== nextType) { gameState.towerCounts[tower.type]--; gameState.towerCounts[nextType] = (gameState.towerCounts[nextType] || 0) + 1; }
  tower.type = nextType; Object.assign(tower, next);
  tower.damage *= gameState.towerBuffs.damage; tower.range += gameState.towerBuffs.range; tower.speed *= gameState.towerBuffs.speed;
  tower.el.style.backgroundImage = `url('${getTowerImage(nextType)}')`; applyTowerEffects(tower.el, nextType);
  if (!next.evolution) unlockBadge('evolution');
  selectTower(tower); updateUI(); drawTowerShop();
}

function sellTower(tower) {
  gameState.globetines += Math.floor(tower.cost * 0.7);
  tower.el.remove();
  gameState.towerCounts[tower.type]--;
  gameState.towerSpots[tower.spotId].occupied = false;
  gameState.towers.splice(gameState.towers.indexOf(tower), 1);
  deselectTower(); updateUI(); drawTowerShop();
}

function deselectTower() { gameState.selectedTower = null; document.getElementById('evolve-panel').style.display = 'none'; const p = document.getElementById('range-preview'); if (p) p.remove(); }

function startWave() {
  console.log("🔥 startWave() iniciada");
  console.log("waveActive:", gameState.waveActive);
  console.log("gameOver:", gameState.gameOver);
  console.log("mode:", gameState.mode);
  console.log("maxWaves:", gameState.maxWaves);
  
  if (gameState.waveActive || gameState.gameOver) return;

  let maxWaves = gameState.maxWaves || 20;
  if (gameState.mode === 'pesadilla') maxWaves = 50;

  if (gameState.mode !== 'infinito' && gameState.wave >= maxWaves) return typeof endGame === 'function' && endGame(true);

  gameState.waveActive = true;
  gameState.wave = (gameState.wave || 0) + 1;
  if (typeof updateUI === 'function') updateUI();
  if (typeof showMessage === 'function') showMessage((typeof translate === 'function') ? translate('waveStarted', { wave: gameState.wave }) : `¡Oleada ${gameState.wave}!`, 'info');

  const wave = gameState.wave;
  const mode = gameState.mode;

  let mult = 1.0;
  if (mode === 'facil') mult = 0.7;
  else if (mode === 'normal') mult = 1.0;
  else if (mode === 'dificil') mult = 1.3;
  else if (mode === 'extremo') mult = 1.6;
  else if (mode === 'corrupto' || mode === 'antiNormal') mult = 1.8;
  else if (mode === 'pesadilla') mult = 2.0;

  const spawnList = [];
  let isBossWave = false;
  const bossesToSpawn = [];

  console.log(`📋 Generando oleada ${wave} en modo ${mode} con mult ${mult}`);

  // 2. Construir la lista de enemigos según el modo y oleada
  if (mode === 'facil') {
    // Modo Fácil: Pocos enemigos, tutorial para asimilar conceptos. Termina en la oleada 10.
    // Solo Stupid_Pyce, Pyce2, Guest_Pyce y Symbol_Pyce. Sin jefes.
    let countStupid = 2 + Math.floor(wave * 0.6);
    let countPyce2 = wave >= 2 ? 1 + Math.floor((wave - 1) * 0.5) : 0;
    let countSymbol = wave >= 4 ? 1 + Math.floor((wave - 3) * 0.5) : 0;
    let countGuest = wave >= 6 ? 1 + Math.floor((wave - 5) * 0.5) : 0;

    for (let i = 0; i < countStupid; i++) spawnList.push('Stupid_Pyce');
    for (let i = 0; i < countPyce2; i++) spawnList.push('Pyce2');
    for (let i = 0; i < countSymbol; i++) spawnList.push('Symbol_Pyce');
    for (let i = 0; i < countGuest; i++) spawnList.push('Guest_Pyce');

  } else if (mode === 'normal') {
    // Modo Normal: Enseña conceptos de Fácil, añade Noob_Pyce, 4motions_Pyce, SO_Pyce (Serious Outline).
    // Jefe primerizo 1x1x1x1_Pyce en la oleada 10 (casi solo). Termina en la 15.
    if (wave === 10) {
      isBossWave = true;
      bossesToSpawn.push('1x1x1x1_Pyce');
      spawnList.push('Stupid_Pyce', 'Stupid_Pyce'); // 2 torpes de adorno
    } else {
      let pool = ['Stupid_Pyce'];
      if (wave >= 2) pool.push('Pyce2');
      if (wave >= 3) pool.push('Guest_Pyce', 'Symbol_Pyce');
      if (wave >= 5) pool.push('Noob_Pyce');
      if (wave >= 7) pool.push('4motions_Pyce', 'SO_Pyce');

      // Pocos enemigos al inicio, escala moderado
      let baseCount = 3 + Math.floor(wave * 1.1);
      for (let i = 0; i < baseCount; i++) {
        spawnList.push(pool[Math.floor(Math.random() * pool.length)]);
      }

      // Adición ocasional de Mimic o Gold
      if (wave >= 5 && Math.random() < 0.15) {
        spawnList.push(Math.random() < 0.5 ? 'Stupid_GoldPyce' : 'Flower_Pyce');
      }
    }

  } else if (mode === 'dificil') {
    // Modo Difícil: Salen todos los básicos desde el inicio (gradual pero rápido).
    // Jefe 1x1x1x1_Pyce en oleada 10 ACOMPAÑADO.
    // Jefe 1x1x1x1_Pyce en la oleada 20 ACOMPAÑADO.
    // Termina en 25 con final grandioso.
    if (wave === 10) {
      isBossWave = true;
      bossesToSpawn.push('1x1x1x1_Pyce');
      for (let i = 0; i < 3; i++) spawnList.push('Symbol_Pyce');
      for (let i = 0; i < 2; i++) spawnList.push('Noob_Pyce');
    } else if (wave === 20) {
      isBossWave = true;
      bossesToSpawn.push('1x1x1x1_Pyce');
      for (let i = 0; i < 4; i++) spawnList.push('SO_Pyce');
      for (let i = 0; i < 2; i++) spawnList.push('Noob_Pyce');
    } else if (wave === 25) {
      isBossWave = true;
      bossesToSpawn.push('1x1x1x1_Pyce');
      for (let i = 0; i < 6; i++) spawnList.push('SO_Pyce');
      for (let i = 0; i < 4; i++) spawnList.push('Symbol_Pyce');
    } else {
      let pool = ['Stupid_Pyce', 'Pyce2'];
      if (wave >= 2) pool.push('Guest_Pyce', 'Symbol_Pyce');
      if (wave >= 4) pool.push('Noob_Pyce', '4motions_Pyce');
      if (wave >= 6) pool.push('SO_Pyce');
      if (wave >= 11) pool.push('Flower_Pyce', 'Stupid_GoldPyce', 'Mimic_Pyce');

      let baseCount = 4 + Math.floor(wave * 1.4);
      for (let i = 0; i < baseCount; i++) {
        spawnList.push(pool[Math.floor(Math.random() * pool.length)]);
      }
    }

  } else if (mode === 'extremo') {
    // Modo Extremo: Como difícil, pero con más enemigos y escalado superior. Termina en 40.
    // Bosses en 10 (1x1x1x1), 20 (NOeye), 30 (1x1x1x1 + NOeye), 40 (Todos los jefes permitidos: 1x1x1x1 + NOeye).
    if (wave === 10) {
      isBossWave = true;
      bossesToSpawn.push('1x1x1x1_Pyce');
      for (let i = 0; i < 4; i++) spawnList.push('Noob_Pyce');
      for (let i = 0; i < 2; i++) spawnList.push('SO_Pyce');
    } else if (wave === 20) {
      isBossWave = true;
      bossesToSpawn.push('NOeye_Pyce');
      for (let i = 0; i < 5; i++) spawnList.push('SO_Pyce');
      for (let i = 0; i < 3; i++) spawnList.push('4motions_Pyce');
    } else if (wave === 30) {
      isBossWave = true;
      bossesToSpawn.push('1x1x1x1_Pyce', 'NOeye_Pyce');
      for (let i = 0; i < 6; i++) spawnList.push('4motions_Pyce');
      for (let i = 0; i < 3; i++) spawnList.push('Flower_Pyce');
    } else if (wave === 40) {
      isBossWave = true;
      bossesToSpawn.push('1x1x1x1_Pyce', 'NOeye_Pyce');
      for (let i = 0; i < 8; i++) spawnList.push('SO_Pyce');
      for (let i = 0; i < 4; i++) spawnList.push('Flower_Pyce');
    } else {
      let pool = ['Stupid_Pyce', 'Pyce2', 'Symbol_Pyce'];
      if (wave >= 2) pool.push('Guest_Pyce', 'Noob_Pyce');
      if (wave >= 4) pool.push('4motions_Pyce', 'SO_Pyce');
      if (wave >= 6) pool.push('Flower_Pyce', 'Stupid_GoldPyce', 'Mimic_Pyce');

      let baseCount = 5 + Math.floor(wave * 1.7);
      for (let i = 0; i < baseCount; i++) {
        spawnList.push(pool[Math.floor(Math.random() * pool.length)]);
      }
    }

  } else {
    // Modos Anti-Normal, Corrupto, Infinito y Pesadilla.
    // Empiezan muy cargados desde la oleada 1 (muchos enemigos tipo Pyce/Pyce2) y suben a velocidad creciente.
    if (wave % 10 === 0) {
      isBossWave = true;
      if (wave === 10) bossesToSpawn.push('1x1x1x1_Pyce');
      else if (wave === 20) bossesToSpawn.push('NOeye_Pyce');
      else if (wave === 30) {
        if (mode === 'corrupto' || mode === 'antiNormal') {
          bossesToSpawn.push('MoonStar_Pyce');
        } else {
          bossesToSpawn.push('NOeye_Pyce');
        }
      } else {
        if (mode === 'corrupto' || mode === 'antiNormal') {
          bossesToSpawn.push('NOeye_Pyce', 'MoonStar_Pyce');
        } else {
          bossesToSpawn.push('1x1x1x1_Pyce', 'NOeye_Pyce');
        }
      }

      let swarmCount = 10 + Math.floor(wave * 0.9);
      let pool = ['Symbol_Pyce', 'Noob_Pyce', 'SO_Pyce', '4motions_Pyce'];
      for (let i = 0; i < swarmCount; i++) {
        spawnList.push(pool[Math.floor(Math.random() * pool.length)]);
      }
    } else {
      // Empieza denso (ej. ~12-15 enemigos en oleada 1)
      let baseCount = 10 + Math.floor(wave * 2.2 * mult);
      let pool = ['Stupid_Pyce', 'Pyce2', 'Guest_Pyce', 'Symbol_Pyce'];
      if (wave >= 2) pool.push('Noob_Pyce', '4motions_Pyce', 'SO_Pyce');
      if (wave >= 4) pool.push('Flower_Pyce', 'Stupid_GoldPyce', 'Mimic_Pyce');

      for (let i = 0; i < baseCount; i++) {
        spawnList.push(pool[Math.floor(Math.random() * pool.length)]);
      }
    }
  }

  console.log(`📦 spawnList tiene ${spawnList.length} enemigos`);
  
  if (spawnList.length === 0) {
    console.error("❌ ERROR: spawnList está VACÍA. Revisa la lógica de oleadas.");
    gameState.waveActive = false;
    return;
  }

  // 3. Mezclar la lista de enemigos regulares para que no salgan todos juntos de golpe
  for (let i = spawnList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [spawnList[i], spawnList[j]] = [spawnList[j], spawnList[i]];
  }

  // 4. Anteponer los jefes a la lista de spawn para que entren primero en combate
  if (isBossWave && bossesToSpawn.length > 0) {
    spawnList.unshift(...bossesToSpawn);
  }

  // 5. Iniciar secuencia de generación con temporizador
  let spawned = 0;
  const interval = setInterval(() => {
    if (gameState.gameOver || !gameState.waveActive) {
      clearInterval(interval);
      return;
    }
    const type = spawnList[spawned];
    const isThisBoss = isBossWave && bossesToSpawn.includes(type) && (spawned < bossesToSpawn.length);
    console.log(`👾 Spawn enemigo ${spawned + 1}/${spawnList.length}: ${type}`);
    spawnEnemy(type, isThisBoss);
    spawned++;
    if (spawned >= spawnList.length) clearInterval(interval);
  }, Math.max(300, 800 - Math.min(500, wave * 25)));
}

function spawnEnemy(type, boss) {
  if (!type) {
    const wave = gameState.wave || 1;
    const pool = ['Stupid_Pyce'];
    if (wave >= 2) pool.push('Pyce2', 'Pyce2');
    if (wave >= 4) pool.push('Guest_Pyce', 'Symbol_Pyce');
    if (wave >= 6) pool.push('Noob_Pyce', 'Noob_Pyce');
    if (wave >= 9) pool.push('4motions_Pyce');
    if (wave >= 11) pool.push('Symbol_Pyce', 'Guest_Pyce', 'Noob_Pyce');
    if (Math.random() < 0.01) type = 'Mimic_Pyce';
    else type = pool[Math.floor(Math.random() * pool.length)] || 'Stupid_Pyce';
  }

  const t = ENEMY_TYPES[type];
  if (!t) return console.warn("Enemy type missing:", type);
  const el = document.createElement('div'); el.className = 'enemy' + (boss ? ' boss' : '');
  el.style.left = `${ENEMY_PATH[0].x}px`; el.style.top = `${ENEMY_PATH[0].y}px`;
  if (t.image) el.style.backgroundImage = `url('${t.image}')`;
  const hpFill = document.createElement('div'); hpFill.className = 'hp-bar-fill';
  const hpBg = document.createElement('div'); hpBg.className = 'hp-bar-bg';
  hpBg.appendChild(hpFill); el.appendChild(hpBg);
  const gameArea = document.getElementById('game-area') || document.getElementById('map') || document.body;
  gameArea.appendChild(el);

  const name = (typeof translate === 'function' && translate('enemy_' + type + '_name')) || type;

  let mult = 1.0;
  if (gameState.mode === 'facil') mult = 0.7;
  else if (gameState.mode === 'normal') mult = 1.0;
  else if (gameState.mode === 'dificil') mult = 1.3;
  else if (gameState.mode === 'extremo') mult = 1.6;
  else if (gameState.mode === 'corrupto') mult = 1.8;
  else if (gameState.mode === 'pesadilla') mult = 2.0;

  const healthScaled = Math.max(1, (t.health || 10) * (1 + (gameState.wave || 1) * 0.15) * mult);
  const enemyObj = { ...t, name, el, x: ENEMY_PATH[0].x, y: ENEMY_PATH[0].y, pathIndex: 0, health: healthScaled, maxHealth: healthScaled, hpFill, shield: (t.shield || 0) * (t.health || 10), type, boss };
  gameState.enemies.push(enemyObj);
}

let narratorTimeout = null;
function showNarratorMsg(imgSrc, speakerName, text) {
  const old = document.getElementById('narrator-bubble');
  if (old) old.remove();
  if (narratorTimeout) clearTimeout(narratorTimeout);

  const bubble = document.createElement('div');
  bubble.id = 'narrator-bubble';
  bubble.className = 'narrator-bubble';
  bubble.innerHTML = `
    <img src="${imgSrc}" class="narrator-portrait" onerror="this.style.display='none'">
    <div class="narrator-text-box">
      <div class="narrator-name">${speakerName}</div>
      <div class="narrator-text">${text}</div>
    </div>
    <button class="narrator-close" onclick="document.getElementById('narrator-bubble').remove()">✕</button>
  `;
  document.body.appendChild(bubble);

  narratorTimeout = setTimeout(() => { if (bubble.parentNode) bubble.remove(); }, 6000);
}

function gameLoop() {
  if (gameState.gameOver) return;
  const dt = 1 / 60;

  function isTowerProtected(tower) {
    if (!gameState.duckgrades.dg_Old_Glob) return false;
    return gameState.towers.some(grey => {
      if (grey.family === 'Grey' || grey.family === 'Old_Glob' || grey.type === 'Old_Glob' || grey.type === 'Pyce_Glob') {
        return Math.hypot(grey.x - tower.x, grey.y - tower.y) < 150;
      }
      return false;
    });
  }

  for (let i = gameState.enemies.length - 1; i >= 0; i--) {
    const e = gameState.enemies[i];
    const next = ENEMY_PATH[e.pathIndex + 1];

    let currentEnemySpeed = e.speed;
    if (e.stunned && e.stunned > 0) {
      e.stunned -= dt;
      currentEnemySpeed = 0;
    }

    if (next) {
      const dx = next.x - e.x, dy = next.y - e.y, dist = Math.hypot(dx, dy);
      if (dist < currentEnemySpeed) e.pathIndex++;
      else { e.x += (dx / dist) * currentEnemySpeed; e.y += (dy / dist) * currentEnemySpeed; }
      e.el.style.left = `${e.x}px`; e.el.style.top = `${e.y}px`;
    } else {
      if (e.instakill) { gameState.baseTookDamage = true; gameState.health = 0; endGame(); return; }
      if (e.doubleLap && !e.lapped) { e.pathIndex = 0; e.lapped = true; continue; }
      e.el.remove(); gameState.enemies.splice(i, 1);
      gameState.health -= e.boss ? 10 : 1;
      gameState.baseTookDamage = true;
      if (gameState.health <= 0) { gameState.health = 0; endGame(); }
      updateUI(); continue;
    }

    const totalCurrent = e.health + (e.shield || 0);
    const totalMax = e.maxHealth + (e.shield > 0 ? e.maxHealth * 0.5 : 0);
    const pct = Math.max(0, (totalCurrent / (e.maxHealth + (e.shield > 0 ? e.maxHealth * 0.5 : 0))) * 100);
    e.hpFill.style.width = pct + '%';
    e.hpFill.style.backgroundColor = (e.shield > 0) ? '#ffd700' : '#ff4444';

    if (e.enemySlowTimer && e.enemySlowTimer > 0) {
      e.enemySlowTimer -= dt;
      const factor = e.enemySlowFactor || 0.4;
      currentEnemySpeed = e.speed * (1 - factor);
      e.el.style.filter = 'brightness(0.8) contrast(1.2) saturate(1.5) hue-rotate(100deg)';
    } else {
      e.el.style.filter = '';
    }

    if (e.burnTimer && e.burnTimer > 0) {
      e.burnTimer -= dt;
      const dmg = (e.burnDamage || 5) * dt;
      e.health -= dmg;
      e.el.classList.add('burning');
      if (Math.random() < 0.1) showEffect(e.x, e.y, "🔥", "#ff5500");
    } else {
      e.el.classList.remove('burning');
    }

    if (e.burnTimer > 0 && e.enemySlowTimer > 0 && e.stunned > 0 && e.toxicTimer > 0 && e.poisonTimer > 0) {
      unlockBadge('epicEffects');
    }

    if (e.toxicTimer && e.toxicTimer > 0) {
      e.toxicTimer -= dt;
      const dmg = 25 * dt;
      e.health -= dmg;
      if (Math.random() < 0.1) showEffect(e.x, e.y, "🤢🔥", "#2ecc71");
    }
    if (e.poisonTimer && e.poisonTimer > 0) {
      e.poisonTimer -= dt;
      const dmg = 12 * dt;
      e.health -= dmg;
      if (Math.random() < 0.1) showEffect(e.x, e.y, "🍄💀", "#9b59b6");

      gameState.enemies.forEach(other => {
        if (other !== e && !other.poisonTimer && Math.hypot(other.x - e.x, other.y - e.y) < 40) {
          other.poisonTimer = 3;
          showEffect(other.x, other.y - 10, "CONTAGIO! 💀", "#9b59b6");
        }
      });
    }

    if (e.health <= 0) {
      die(e, i);
      continue;
    }

    if (e.healer) {
      e.healTimer = (e.healTimer || 0) + dt;
      if (e.healTimer >= (e.healCooldown || 2)) {
        e.healTimer = 0;
        let healed = false;
        gameState.enemies.forEach(ally => {
          if (ally !== e && Math.hypot(ally.x - e.x, ally.y - e.y) <= (e.healRange || 100)) {
            if (ally.health < ally.maxHealth) {
              ally.health = Math.min(ally.maxHealth, ally.health + (e.healAmount || 10));
              healed = true;
            }
          }
        });
        if (healed) showEffect(e.x, e.y, "✨ HEAL", "#2ecc71");
      }
    }

    if (e.type === '1x1x1x1_Pyce' || e.type === 'MoonStar_Pyce') {
      e.attackTimer1 = (e.attackTimer1 || 0) + dt;
      if (e.attackTimer1 > 5) {
        e.attackTimer1 = 0;
        let targetTower = null;
        let minDist = Infinity;
        gameState.towers.forEach(t => {
          const d = Math.hypot(t.x - e.x, t.y - e.y);
          if (d < minDist) { minDist = d; targetTower = t; }
        });
        if (targetTower) shoot(e, targetTower, { isEnemy: true, projectile: 'binary_code', speed: 2, slow: 3 });
      }
    }
    if (e.type === 'NOeye_Pyce' || e.type === 'MoonStar_Pyce') {
      e.attackTimer2 = (e.attackTimer2 || 0) + dt;
      if (e.attackTimer2 > 8) {
        e.attackTimer2 = 0;
        if (gameState.towers.length > 0) {
          const targetTower = gameState.towers[Math.floor(Math.random() * gameState.towers.length)];
          shoot(e, targetTower, { isEnemy: true, projectile: 'laser_purple', speed: 5, stun: 2 });
        }
      }
    }
    if (e.type === 'Guest_Pyce') {
      e.attackTimer1 = (e.attackTimer1 || 0) + dt;
      if (e.attackTimer1 > 3) {
        let targetTower = null;
        gameState.towers.forEach(t => { if (Math.hypot(t.x - e.x, t.y - e.y) < 80) targetTower = t; });
        if (targetTower) {
          e.attackTimer1 = 0;
          if (isTowerProtected(targetTower)) {
            showEffect(targetTower.x, targetTower.y - 20, "IMMUNE! 🛡️", "#00ffcc");
          } else {
            targetTower.stunTimer = (targetTower.stunTimer || 0) + 1.5;
            showEffect(targetTower.x, targetTower.y - 20, "STUNNED!", "#ff0000");
          }
        }
      }
    }
    if (e.type === 'Noob_Pyce') {
      e.attackTimer1 = (e.attackTimer1 || 0) + dt;
      if (e.attackTimer1 > 6) {
        let targetTower = null;
        gameState.towers.forEach(t => { if (Math.hypot(t.x - e.x, t.y - e.y) < 200) targetTower = t; });
        if (targetTower) shoot(e, targetTower, { isEnemy: true, projectile: 'stone_red', speed: 3, stun: 1.5 });
      }
    }

    if (e.health <= 0) die(e, i);
  }

  if (gameState.globalRangeBuffTimer && gameState.globalRangeBuffTimer > 0) {
    gameState.globalRangeBuffTimer -= dt;
    if (gameState.globalRangeBuffTimer <= 0) {
      gameState.globalRangeBuffTimer = 0;
      updateBuffs();
    }
  }

  gameState.towers.forEach(t => {
    if (t.gTackCooldown && t.gTackCooldown > 0) {
      t.gTackCooldown -= dt;
      if (t.gTackCooldown < 0) t.gTackCooldown = 0;
      if (gameState.selectedTower === t) updateEvolveButtons(t);
    }
    if (t.toxicTimer && t.toxicTimer > 0) {
      t.toxicTimer -= dt;
      if (t.toxicTimer < 0) t.toxicTimer = 0;
    }
    if (t.contagioTimer && t.contagioTimer > 0) {
      t.contagioTimer -= dt;
      if (t.contagioTimer < 0) t.contagioTimer = 0;
    }

    if (t.stunned > 0) { t.stunned -= dt; t.el.classList.add('stunned'); return; }
    t.el.classList.remove('stunned');
    if (t.family === 'Ducky_Glob' || t.type === 'Ducky_Glob' || t.type === 'Golden_Ducky_Glob') {
      let interval = t.type === 'Golden_Ducky_Glob' ? 5 : 8;
      if (gameState.duckgrades.dg_Ducky_Glob) {
        const enemiesInRange = gameState.enemies.filter(e => Math.hypot(e.x - t.x, e.y - t.y) <= (t.range || 100));
        if (enemiesInRange.length > 0) {
          interval *= 0.5;
          enemiesInRange.forEach(e => {
            e.health -= 0.5 * dt * (gameState.wave + 1);
          });
          if (Math.random() < 0.1) showEffect(t.x, t.y, "🦆💥", "#ffd700");
        }
      }

      t.moneyTimer += dt;
      if (t.moneyTimer >= interval) {
        t.moneyTimer = 0;
        const amount = 10 + Math.floor(gameState.wave * 1.5);
        gameState.globetines += amount;
        showEffect(t.x, t.y, `+${amount} 💰`);

        const rand = Math.random();
        if (rand < 0.05) {
          const mult = getPycoinMultiplier();
          const earned = Math.round(1 * mult);
          gameState.pycoins += earned;
          showEffect(t.x, t.y - 25, `+${earned} 💎`);
        } else if (rand < 0.005) {
          const mult = getDuckpassMultiplier();
          const earned = Math.round(1 * mult);
          gameState.duckPassCurrency += earned;
          showEffect(t.x, t.y - 25, `+${earned} 🦆`);
          showMessage(translate('level_duckpass', { level: 'SPECIAL' }), 'success');
        }
        updateUI(); updateMetaUI();
      }
    }

    let currentSpeed = t.speed;
    if (t.slowTimer > 0) {
      t.slowTimer -= dt;
      currentSpeed *= 0.5;
    }

    if (t.stunTimer > 0) {
      t.stunTimer -= dt;
      if (!t.el.classList.contains('stunned-spin')) t.el.classList.add('stunned-spin');
      if (t.stunTimer <= 0) t.el.classList.remove('stunned-spin');
      return;
    }

    if (gameState.duckgrades.dg_Glob && (t.family === 'Glob' || t.type === 'Glob')) {
      const nearDuck = gameState.towers.some(d => (d.family === 'Ducky_Glob' || d.type === 'Ducky_Glob') && Math.hypot(d.x - t.x, d.y - t.y) < 150);
      if (nearDuck) currentSpeed *= 1.5;
    }

    t.cooldown -= dt;
    if (t.cooldown <= 0 && t.family !== 'Ducky_Glob') {
      const targets = gameState.enemies.filter(e => Math.hypot(e.x - t.x, e.y - t.y) <= t.range);
      if (targets.length) {
        let dmg = t.damage;
        if (gameState.duckgrades.dg_Red_Glob && t.family === 'Red_Glob') {
          const redCount = gameState.towers.filter(rt => rt.family === 'Red_Glob').length;
          dmg *= (1 + (redCount * 0.1));
        }

        if (gameState.duckgrades.dg_Pyce_Glob && t.type === 'Pyce_Glob' && Math.random() < 0.2) {
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            shoot(t, { x: t.x + Math.cos(a) * 100, y: t.y + Math.sin(a) * 100, health: 999 }, { damage: dmg });
          }
        } else {
          const specialAttack = getSpecialAttack(t, targets[0], dmg);
          if (!specialAttack) shoot(t, targets[0], { damage: dmg });
        }
        t.cooldown = 1 / currentSpeed;
      }
    }
  });

  function applyProjectileHit(p, target) {
    if (p.isEnemy) {
      if (isTowerProtected(target)) {
        showEffect(target.x, target.y - 20, "IMMUNE! 🛡️", "#00ffcc");
        return;
      }
      if (p.meta && p.meta.stun) {
        target.stunTimer = (target.stunTimer || 0) + p.meta.stun;
        showEffect(target.x, target.y - 20, "STUNNED!", "#ff0000");
      }
      if (p.meta && p.meta.slow) {
        target.slowTimer = (target.slowTimer || 0) + p.meta.slow;
        showEffect(target.x, target.y - 20, "SLOWED!", "#ffaa00");
      }
      return;
    }

    let dmg = p.damage;
    if (p.meta) {
      if (p.meta.slow) {
        target.enemySlowTimer = 3.0;
        target.enemySlowFactor = p.meta.slow;
        showEffect(target.x, target.y - 15, "SLOWED! ❄️", "#00b4ff");
      }
      if (p.meta.burn) {
        target.burnTimer = 3.0;
        target.burnDamage = p.meta.burnDamage || 5;
        showEffect(target.x, target.y - 15, "BURN! 🔥", "#ff4444");
      }
      if (p.meta.toxic) {
        target.toxicTimer = (target.toxicTimer || 0) + 3.0;
        showEffect(target.x, target.y - 15, "TOXIC! 🤢", "#2ecc71");
      }
      if (p.meta.poison) {
        target.poisonTimer = (target.poisonTimer || 0) + 5.0;
        showEffect(target.x, target.y - 15, "POISON! 🍄", "#9b59b6");
      }
      if (p.meta.stunStrike) {
        target.stunned = (target.stunned || 0) + 3.0;
        showEffect(target.x, target.y - 15, "SHOCKED! ⚡", "#3498db");
      }
    }
    if (gameState.duckgrades.dg_Comet_Glob && p.family === 'Comet_Glob') {
      if (Math.random() < 0.15) { dmg *= 2; showEffect(target.x, target.y, "CRIT! 💥"); }
    }
    if (gameState.duckgrades.dg_Soap_Glob && p.family === 'Soap_Glob') {
      if (Math.random() < 0.2) target.stunned = 1.0;
    }
    if (p.projectile === 'glitch' || p.type === 'Pyce_Glob') {
      target.speed = Math.max(0.5, target.speed * 0.9);
      if (Math.random() < 0.2) target.stunned = 0.5;
      target.el.classList.add('glitch-shake');
      setTimeout(() => { if (target && target.el) target.el.classList.remove('glitch-shake'); }, 500);
    }
    if (p.meta && p.meta.corruption) {
      target.speed = Math.max(0.5, target.speed * 0.7);
      target.el.classList.add('glitch-shake');
      setTimeout(() => { if (target && target.el) target.el.classList.remove('glitch-shake'); }, 800);
    }

    if (target.shield > 0) {
      const abs = Math.min(target.shield, dmg);
      target.shield -= abs;
      dmg -= abs;
    }
    if (dmg > 0) target.health -= dmg;
    gameState.totalDamage += p.damage;

    if (gameState.duckgrades.dg_Work_Bombot && p.type === 'Work_Bombot' && !p.bounced) {
      p.bounced = true;
      p.x = target.x; p.y = target.y;
      const nextTarget = gameState.enemies.find(e => e !== target && Math.hypot(e.x - p.x, e.y - p.y) < 100);
      if (nextTarget) { p.target = nextTarget; }
    }
    if (gameState.duckgrades.dg_Old_Glob && p.type === 'Old_Glob' && !p.isSpin) {
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
        shoot({ ...p, projectile: 'stone_small', damage: p.damage * 0.3 }, { x: p.x + Math.cos(a) * 50, y: p.y + Math.sin(a) * 50, health: 999 }, { size: 8 });
      }
    }
  }

  for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
    const p = gameState.projectiles[i];

    if (p.projectile === 'laser_red') {
      const collidesWithDemonic = gameState.projectiles.some(other =>
        other !== p && other.projectile === 'laser_purple' && Math.hypot(other.x - p.x, other.y - p.y) < 25
      );
      if (collidesWithDemonic) {
        unlockBadge('letsGoGambling');
      }
    }

    if (p.boomerang) {
      const homeX = p.shooter.x;
      const homeY = p.shooter.y;
      if (!p.returnPhase) {
        const targetDist = Math.hypot(p.target.x - p.x, p.target.y - p.y);
        if (targetDist < 10 || (!p.target.health && targetDist < 50)) {
          p.returnPhase = true;
          p.hitEntities.clear();
        } else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }
      } else {
        const dx = homeX - p.x, dy = homeY - p.y, hDist = Math.hypot(dx, dy);
        if (hDist < 15) {
          p.el.remove(); gameState.projectiles.splice(i, 1); continue;
        }
        p.vx = (dx / hDist) * p.speed;
        p.vy = (dy / hDist) * p.speed;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
    } else if (p.piercing) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < -100 || p.x > 2000 || p.y < -100 || p.y > 1000) {
        p.el.remove(); gameState.projectiles.splice(i, 1); continue;
      }
    } else {
      const targetArray = p.isEnemy ? gameState.towers : gameState.enemies;
      if (!p.target || !targetArray.includes(p.target)) { p.el.remove(); gameState.projectiles.splice(i, 1); continue; }
      const dx = p.target.x - p.x, dy = p.target.y - p.y, dist = Math.hypot(dx, dy);
      if (dist < 10) {
        applyProjectileHit(p, p.target);
        p.el.remove(); gameState.projectiles.splice(i, 1); continue;
      } else {
        p.vx = (dx / dist) * p.speed;
        p.vy = (dy / dist) * p.speed;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
    }

    p.el.style.left = p.x + 'px';
    p.el.style.top = p.y + 'px';

    if (p.piercing || p.boomerang) {
      const targetArray = p.isEnemy ? gameState.towers : gameState.enemies;
      targetArray.forEach(e => {
        if (!p.hitEntities.has(e) && Math.hypot(e.x - p.x, e.y - p.y) < 20) {
          p.hitEntities.add(e);
          applyProjectileHit(p, e);
        }
      });
    }
  }

  if (gameState.waveActive && !gameState.enemies.length) {
    gameState.waveActive = false;
    gameState.globetines += 50 + gameState.wave * 10;
    const earnedPy = Math.round(10 * getPycoinMultiplier());
    gameState.pycoins += earnedPy;
    addXP(20);
    updateUI(); updateMetaUI(); saveProgress();
    if (gameState.autoWave) setTimeout(startWave, 2000);
  }
  requestAnimationFrame(gameLoop);
}

function shoot(shooter, target, opts = {}) {
  const typeCfg = TOWER_TYPES[shooter.type];
  if (typeCfg) {
    if (typeCfg.slow) opts.slow = typeCfg.slow;
    if (typeCfg.burn) opts.burn = typeCfg.burn;
    if (typeCfg.burnDamage) opts.burnDamage = typeCfg.burnDamage;
  }
  if (shooter.toxicTimer && shooter.toxicTimer > 0) {
    opts.toxic = true;
  }
  if (shooter.contagioTimer && shooter.contagioTimer > 0) {
    opts.poison = true;
  }
  if (shooter.stunStrikeActive) {
    opts.stunStrike = true;
    shooter.stunStrikeActive = false;
  }

  const el = document.createElement('div');
  el.className = `projectile`;

  let projClass = opts.projectile || shooter.projectile;
  if (gameState.equippedSkins[shooter.family] === 'corrupt_swords_set') {
    projClass = 'slash';
    shooter.piercing = true;
  }
  if (projClass) el.classList.add(projClass);

  const dx = target.x - shooter.x;
  const dy = target.y - shooter.y;
  const angle = Math.atan2(dy, dx);
  const dist = Math.hypot(dx, dy) || 1;
  const speed = (opts.speed || 40) * 10;
  const vx = (dx / dist) * speed;
  const vy = (dy / dist) * speed;

  el.style.position = 'absolute';
  el.style.left = shooter.x + 'px'; el.style.top = shooter.y + 'px';
  el.style.width = el.style.height = (opts.size || 10) + 'px';
  el.style.borderRadius = '50%';
  el.style.transform = `rotate(${angle}rad)`;

  if (opts.color === 'multicolor') {
    el.style.backgroundImage = `conic-gradient(#FFEA00,#00B4FF,#C58ED3,#8B0000)`;
  } else if (opts.color === 'gradient') {
    el.style.background = `linear-gradient(45deg, ${opts.from || '#FF7F00'}, ${opts.to || '#001F5B'})`;
  } else if (opts.color === 'blackwhite') {
    el.style.background = 'radial-gradient(circle at 30% 30%, #fff 0%, #000 60%)';
  } else {
    el.style.backgroundColor = opts.color || (shooter.projectileColor || '#FFFFFF');
  }

  if (projClass === 'binary_code') {
    el.textContent = Math.random() < 0.5 ? '0' : '1';
  }

  const mapEl = document.getElementById('map') || document.getElementById('game-area') || document.body;
  mapEl.appendChild(el);
  gameState.projectiles.push({
    x: shooter.x,
    y: shooter.y,
    startX: shooter.x,
    startY: shooter.y,
    target,
    vx,
    vy,
    speed,
    damage: opts.damage || shooter.damage || 1,
    el,
    meta: opts,
    family: shooter.family,
    type: shooter.type,
    projectile: projClass,
    piercing: shooter.piercing || opts.piercing || false,
    boomerang: shooter.boomerang || opts.boomerang || false,
    returnPhase: false,
    hitEntities: new Set(),
    shooter: shooter
  });
}

function die(e, idx) {
  if (e.poisonTimer && e.poisonTimer > 0) {
    gameState.enemies.forEach(other => {
      if (other !== e && !other.poisonTimer && Math.hypot(other.x - e.x, other.y - e.y) < 100) {
        other.poisonTimer = 3;
        showEffect(other.x, other.y - 10, "CONTAGIO! 💀", "#9b59b6");
      }
    });
  }
  gameState.globetines += e.reward;
  if (e.mimic) {
    const earnedPy = Math.round(5 * getPycoinMultiplier());
    gameState.pycoins += earnedPy;
    showMessage(translate('plus_pycoins', { amount: earnedPy }), 'success');
    if (e.isSpecialMimic && !gameState.unlockedSkins.includes('mimic_set')) {
      gameState.unlockedSkins.push('mimic_set');
      showMessage("🎁 ¡SKIN 'Mimic set' DESBLOQUEADA!", 'success');
      saveProgress();
    }
  }
  e.el.remove();
  if (e.boss) unlockBadge('bossKiller');
  gameState.enemies.splice(idx, 1);
  updateUI();
}

function updateUI() {
  document.getElementById('health').textContent = Math.max(0, gameState.health);
  document.getElementById('money').textContent = Math.floor(gameState.globetines);
  document.getElementById('wave-count').textContent = gameState.wave;
  if (gameState.settings.showTotalDamage) document.getElementById('total-damage').textContent = Math.floor(gameState.totalDamage);

  if (gameState.health >= 300) {
    unlockBadge('angelicFortress');
  }

  if (gameState.towers.length > 0) {
    let allMaxed = true;
    for (const [tKey, limit] of Object.entries(gameState.towerLimits)) {
      if (isTowerOwned(tKey)) {
        const count = gameState.towerCounts[tKey] || 0;
        if (count < limit) {
          allMaxed = false;
          break;
        }
      }
    }
    if (allMaxed) {
      unlockBadge('maxGlobs');
    }
  }

  updateMetaUI();
}

function translate(key, params = {}) {
  let text = TRANSLATIONS[currentLanguage][key] || key;
  for (const [p, v] of Object.entries(params)) text = text.replace(`{${p}}`, v);
  return text;
}

function updateLanguage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const attr = el.getAttribute('data-i18n-attr');
    if (attr) {
      el.setAttribute(attr, translate(key));
    } else {
      if (key === 'level_label' && el.firstChild && el.firstChild.nodeType === 3) {
        el.firstChild.textContent = translate(key) + " ";
      } else {
        el.textContent = translate(key);
      }
    }
  });

  document.querySelectorAll('.btn-text').forEach(el => {
    const parent = el.parentElement;
    if (parent.id === 'start-wave') el.textContent = translate('startWave');
    if (parent.id === 'auto-wave') el.textContent = translate('autoWave');
    if (parent.id === 'deselect-tower') el.textContent = translate('cancel');
    if (parent.classList.contains('back-btn')) el.textContent = translate('back_to_modes');
    if (parent.classList.contains('retry-btn')) el.textContent = translate('playAgain');
  });

  const shopTitle = document.getElementById('shop-title');
  if (shopTitle) shopTitle.innerHTML = `🛒 ${translate('shop_title').replace('🛒 ', '')}`;
  const shopBtn = document.getElementById('open-shop');
  if (shopBtn) shopBtn.innerHTML = `🛒 ${translate('shop_title').replace('🛒 ', '')}`;
  const passTitle = document.getElementById('pass-title');
  if (passTitle) passTitle.innerHTML = `🦆 ${translate('pass_title').replace('🦆 ', '')}`;
  const storyTitle = document.getElementById('story-logs-title');
  if (storyTitle) storyTitle.innerHTML = `📖 ${translate('story_logs_btn')}`;

  const storyBtn = document.getElementById('open-story-logs');
  if (storyBtn) storyBtn.innerHTML = `📖 ${translate('story_logs_btn')}`;

  const mechBtn = document.getElementById('tab-mechanics-btn');
  if (mechBtn) mechBtn.innerHTML = `⚙️ ${translate('story_tab_mechanics')}`;

  const loreBtn = document.getElementById('tab-lore-btn');
  if (loreBtn) loreBtn.innerHTML = `📖 ${translate('story_tab_lore')}`;

  const logsBtn = document.getElementById('tab-logs-btn');
  if (logsBtn) logsBtn.innerHTML = `📋 ${translate('story_tab_logs')}`;

  const evolveTitle = document.querySelector('#evolve-panel h3');
  if (evolveTitle) evolveTitle.textContent = translate('evolve_title');
  const sellBtn = document.getElementById('sell-tower-btn');
  if (sellBtn) sellBtn.textContent = translate('sell');
  const evolveClose = document.querySelector('#evolve-panel .close-btn');
  if (evolveClose) evolveClose.textContent = translate('close');

  const portTitle = document.querySelector('#portrait-overlay h2');
  if (portTitle) portTitle.textContent = translate('rotate_device');
  const portMsg = document.querySelector('#portrait-overlay p');
  if (portMsg) portMsg.textContent = translate('landscape_msg');

  const goHeader = document.querySelector('#game-over h2');
  if (goHeader) goHeader.textContent = translate('gameOver');
  const goBtn = document.querySelector('#game-over .retry-btn');
  if (goBtn) goBtn.textContent = translate('playAgain');
}

function showMessage(text, type) {
  const el = document.createElement('div'); el.className = `game-message ${type}`; el.textContent = text;
  document.getElementById('game-messages').appendChild(el); setTimeout(() => el.remove(), 3000);
}

function showEffect(x, y, text) {
  const el = document.createElement('div'); el.className = 'money-popup'; el.style.left = x + 'px'; el.style.top = y + 'px'; el.textContent = text;
  document.getElementById('map').appendChild(el); setTimeout(() => el.remove(), 1000);
}

function getTowerImage(type) {
  const cfg = TOWER_TYPES[type];
  const family = cfg.family || type;
  const equipped = gameState.equippedSkins[family];
  if (equipped && equipped !== 'default') {
    const skinSet = SKINS_DATA[family]?.find(s => s.id === equipped);
    if (skinSet?.skins?.[type]) return skinSet.skins[type];
  }
  return cfg.image;
}

function applyTowerEffects(el, type) {
  const cfg = TOWER_TYPES[type];
  el.className = 'tower';
  const globalSkin = gameState.equippedSkins['Global'];
  if (globalSkin !== 'default') {
    const data = SKINS_DATA['Global'].find(s => s.id === globalSkin);
    if (data?.class) el.classList.add(data.class);
  }
}

function drawRangePreview(x, y, range) {
  let p = document.getElementById('range-preview') || document.createElement('div');
  p.id = 'range-preview'; p.className = 'range-preview';
  p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.width = p.style.height = (range * 2) + 'px';
  document.getElementById('map').appendChild(p);
}

function retryGame() {
  gameState.health = 100 + (gameState.baseHealthLevel * 20);
  gameState.wave = 0;
  gameState.globetines = 500;
  gameState.towers.forEach(t => t.el.remove());
  gameState.towers = [];
  gameState.enemies.forEach(e => e.el.remove());
  gameState.enemies = [];
  gameState.projectiles.forEach(p => p.el.remove());
  gameState.projectiles = [];
  gameState.towerSpots.forEach(s => s.occupied = false);
  gameState.towerCounts = {};
  gameState.gameOver = false;
  gameState.waveActive = false;
  gameState.totalDamage = 0;
  gameState.usedGTackRed = false;
  gameState.usedGTackGrey = false;
  gameState.baseTookDamage = false;
  deselectTower();
  updateUI();
  drawTowerShop();
  document.getElementById('game-over').style.display = 'none';
}

function endGame(victory = false) {
  gameState.gameOver = true;
  const modal = document.getElementById('game-over');
  if (!modal) return;
  modal.style.display = 'flex';

  const title = modal.querySelector('h2');
  const msg = document.getElementById('game-over-msg');

  if (victory) {
    if (title) title.textContent = translate('victory_title');
    if (msg) msg.innerHTML = translate('victory_msg', { mode: gameState.mode.toUpperCase() });

    if (gameState.antiNormalActive) {
      unlockBadge('antiNormal');
      gameState.unlockedAntiNormal = true;
    } else {
      if (gameState.mode === 'facil') unlockBadge('winFacil');
      else if (gameState.mode === 'normal') unlockBadge('winNormal');
      else if (gameState.mode === 'dificil') unlockBadge('winDificil');
      else if (gameState.mode === 'extremo') unlockBadge('winExtremo');
      else if (gameState.mode === 'corrupto') {
        gameState.corruptWins++;
        unlockBadge('winCorrupto');
        if (gameState.corruptWins >= 1) unlockBadge('corrupt1');
        if (gameState.corruptWins >= 2) unlockBadge('corrupt2');
        if (gameState.corruptWins >= 3) unlockBadge('corrupt3');
        if (gameState.corruptWins >= 4) unlockBadge('corrupt4');
        if (gameState.corruptWins >= 5) unlockBadge('corrupt5');
      }
    }

    // CORREGIDO: Work-Bombot SOLO se desbloquea al ganar modo corrupto o anti-normal COMPLETAMENTE
    if ((gameState.mode === 'corrupto' || gameState.mode === 'antiNormal') && victory === true) {
      if (TOWER_TYPES['Work_Bombot'] && !TOWER_TYPES['Work_Bombot'].unlocked) {
        TOWER_TYPES['Work_Bombot'].unlocked = true;
        showMessage("🤖 ¡TORRE WORK-BOMBOT DESBLOQUEADA!", 'success');
        saveProgress();
      }
    }

    if (gameState.towers.length > 0) {
      const allGreenOrBlack = gameState.towers.every(t => t.family === 'Glob' || t.family === 'Comet_Glob');
      if (allGreenOrBlack) {
        unlockBadge('deepArtillery');
      }
    }

    if (gameState.towers.length > 0) {
      const allRedOrBlue = gameState.towers.every(t => t.family === 'Red_Glob' || t.family === 'Soap_Glob');
      if (allRedOrBlue) {
        unlockBadge('meleeBlueRed');
      }
    }

    if (!gameState.baseTookDamage) {
      unlockBadge('titaniumBuilding');
    }

    saveProgress();
  } else {
    if (title) title.textContent = translate('gameOver');
    if (msg) msg.innerHTML = translate('waveStarted', { wave: gameState.wave }).replace('Oleada', 'Llegaste a la oleada').replace('Wave', 'You reached wave');
  }

  updateLanguage();
}

function getTowerName(t) {
  const family = t.family || t.type;
  const equipped = gameState.equippedSkins[family];
  if (equipped) {
    const skinSet = SKINS_DATA[family]?.find(s => s.id === equipped);
    if (skinSet?.isSpecial && skinSet.names?.[t.type]) {
      const val = skinSet.names[t.type];
      if (val && typeof val === 'object') {
        return val[currentLanguage] || val['es'] || val['en'];
      }
      return val;
    }
  }
  return translate(t.name);
}

function getSpecialAttack(t, target, dmg) {
  const family = t.family || t.type;
  const equipped = gameState.equippedSkins[family];
  if (!equipped) return false;
  const skinSet = SKINS_DATA[family]?.find(s => s.id === equipped);
  if (!skinSet?.isSpecial) return false;

  if (skinSet.id === 'corrupt_swords_set') {
    if (t.type === 'Glob') {
      shoot(t, target, { damage: dmg }); t.cooldown *= 0.5; return true;
    }
    if (t.type === 'Poop_Glob') {
      gameState.enemies.forEach(e => {
        if (Math.hypot(e.x - t.x, e.y - t.y) < 80) e.health -= dmg;
      });
      showEffect(t.x, t.y, "⚔️", "#ff00ff");
      return true;
    }
    if (t.type === 'Golden_Glob') {
      for (let i = 0; i < 3; i++) setTimeout(() => { if (target.health > 0) shoot(t, target, { damage: dmg }); }, i * 100);
      return true;
    }
    if (t.type === 'Rainbow_Glob') {
      shoot({ ...t, projectile: 'void' }, target, { damage: dmg }); return true;
    }
  }

  if (skinSet.id === 'mimic_set') {
    if (t.type === 'Comet_Glob') {
      shoot({ ...t, projectile: 'gold' }, target, { damage: dmg }); return true;
    }
    if (t.type === 'Dark_Glob') {
      shoot(t, target, { damage: dmg }); target.speed *= 0.8; return true;
    }
    if (t.type === 'Demglob') {
      shoot(t, target, { damage: dmg });
      if (Math.random() < 0.1) { gameState.globetines += 1; showEffect(t.x, t.y, "+1 💰"); updateUI(); }
      return true;
    }
  }

  if (skinSet.id === 'starjump_set') {
    if (t.type === 'Old_Glob') {
      shoot(t, target, { projectile: 'star_yellow', damage: dmg }); return true;
    }
    if (t.type === 'Pyce_Glob') {
      shoot(t, target, { projectile: 'star_celeste', damage: dmg }); return true;
    }
  }

  return false;
}

let currentStoryTab = 'lore';

function openStoryLogs() {
  closeModal('shop-modal');
  closeModal('pass-modal');
  saveGameSnapshot();
  document.getElementById('story-logs-modal').style.display = 'flex';
  drawStoryLogs();
}

function switchStoryTab(tab) {
  currentStoryTab = tab;
  document.querySelectorAll('.story-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.id === `tab-${tab}-btn`);
  });
  drawStoryLogs();
}

function drawStoryLogs() {
  const container = document.getElementById('story-logs-body');
  if (!container) return;

  if (currentStoryTab === 'lore') {
    if (currentLanguage === 'es') {
      container.innerHTML = `
        <h3>🎮 Glob Defenders (GD)</h3>
        <p>Glob Defenders es un juego de defensa por oleadas ambientado en <strong>Gelatin Lake</strong>, un gran valle natural donde la vida ha evolucionado de formas inesperadas a partir de criaturas gelatinosas conocidas como <strong>Globs</strong>.</p>
        <p>En este mundo, los jugadores deben resistir el avance de los <strong>Pyces</strong>, organismos artificiales con forma de ordenadores vivientes que, aunque no son malvados por naturaleza, han sido utilizados o forzados por entidades superiores que alteran el equilibrio del sistema.</p>

        <h3>🌊 El mundo: Gelatin Lake</h3>
        <p>Gelatin Lake es un entorno natural donde los Globs surgieron como vida biológica basada en gelatina orgánica. Con el tiempo, esta especie se diversificó en múltiples familias evolutivas, cada una con habilidades, comportamientos y roles distintos dentro del ecosistema.</p>

        <h3>🍮 Los Globs</h3>
        <p>Los Globs son las unidades defensivas principales del juego. Funcionan como torres vivas que pueden evolucionar durante las partidas.</p>
        <ul>
          <li>🟢 <strong>Verdes</strong>: equilibrados, con múltiples etapas evolutivas y gran escalado de poder.</li>
          <li>🔴 <strong>Rojos</strong>: ofensivos, con progresión hacia formas cada vez más tecnológicas y destructivas.</li>
          <li>🟡 <strong>Amarillos (Ducky)</strong>: centrados en la generación de recursos.</li>
          <li>🔵 <strong>Azules (Jabón)</strong>: especializados en ralentizar y controlar enemigos.</li>
          <li>⚫ <strong>Negros</strong>: unidades de alto riesgo y altísimo poder, ligadas a energía cósmica e inestable.</li>
          <li>🤖 <strong>Variantes especiales</strong> como Pyce Glob y Old Glob, con comportamientos únicos.</li>
        </ul>

        <h3>🖥️ Los Pyces</h3>
        <p>Los Pyces son entidades artificiales vivas, con capacidad de adaptación y evolución.</p>
        <ul>
          <li><strong>Pyce base</strong>: forma original del sistema.</li>
          <li><strong>Pyce 2.0</strong>: versión autónoma con curiosidad y pensamiento propio, origen de la Portalogía.</li>
          <li><strong>Flower Pyce</strong>: entidad orgánica con capacidad curativa y comportamiento aleatorio.</li>
          <li><strong>NOeye</strong>: masa anómala corrompida, antes conocida como NO Kerbo, capaz de crear y destruir microentornos.</li>
          <li><strong>MoonStar Pyce</strong>: entidad corrompida por el Bitcore, capaz de crear dimensiones enteras y alterar realidades.</li>
        </ul>

        <h3>👁️ Entidades superiores</h3>
        <p>El mundo está influenciado por fuerzas más allá de Globs y Pyces:</p>
        <ul>
          <li><strong>Kirb / KirByte (el prototipo)</strong>: robot abeja cuadrado de titanio capaz de viajar entre dimensiones. Su existencia está ligada a eventos como la expulsión de humanos de Bitlands.</li>
          <li><strong>1x1x1x1 Pyce</strong>: entidad hacker capaz de alterar reglas internas del sistema.</li>
        </ul>

        <h3>⚖️ Estructura del universo</h3>
        <p>El equilibrio del mundo se sostiene entre tres fuerzas:</p>
        <ul>
          <li>🌊 <strong>Globs</strong>: vida biológica adaptativa del entorno</li>
          <li>🖥️ <strong>Pyces</strong>: vida artificial evolutiva</li>
          <li>👁️ <strong>Entidades superiores</strong>: fuerzas que alteran o rompen el sistema</li>
        </ul>
      `;
    } else {
      container.innerHTML = `
        <h3>🎮 Glob Defenders (GD)</h3>
        <p>Glob Defenders is a wave defense game set in <strong>Gelatin Lake</strong>, a vast natural valley where life has evolved in unexpected ways from jelly-like creatures known as <strong>Globs</strong>.</p>
        <p>In this world, players must resist the advance of the <strong>Pyces</strong>, artificial organisms shaped like living computers that, although not malicious by nature, have been used or forced by higher entities to disrupt the system's balance.</p>

        <h3>🌊 The World: Gelatin Lake</h3>
        <p>Gelatin Lake is a natural environment where Globs emerged as biological life based on organic jelly. Over time, this species diversified into multiple evolutionary families, each with unique abilities, behaviors, and ecological roles.</p>

        <h3>🍮 The Globs</h3>
        <p>Globs are the primary defensive units of the game. They function as living towers that can evolve during matches.</p>
        <ul>
          <li>🟢 <strong>Green</strong>: balanced, with multiple evolutionary stages and high scaling power.</li>
          <li>🔴 <strong>Red</strong>: offensive, progressing toward increasingly technological and destructive forms.</li>
          <li>🟡 <strong>Yellow (Ducky)</strong>: focused on resource generation.</li>
          <li>🔵 <strong>Blue (Soap)</strong>: specialized in slowing down and controlling enemies.</li>
          <li>⚫ <strong>Black</strong>: high-risk, high-power units tied to unstable cosmic energy.</li>
          <li>🤖 <strong>Special variants</strong> like Pyce Glob and Old Glob, with unique behaviors.</li>
        </ul>

        <h3>🖥️ The Pyces</h3>
        <p>Pyces are artificial living entities, capable of adaptation and evolution.</p>
        <ul>
          <li><strong>Base Pyce</strong>: original form of the system.</li>
          <li><strong>Pyce 2.0</strong>: autonomous version with curiosity and independent thought, spawning Portalogy.</li>
          <li><strong>Flower Pyce</strong>: organic entity with healing abilities and random behavior.</li>
          <li><strong>NOeye</strong>: corrupted anomalous mass, formerly known as NO Kerbo, capable of creating and destroying micro-environments.</li>
          <li><strong>MoonStar Pyce</strong>: entity corrupted by the Bitcore, capable of creating entire dimensions and altering realities.</li>
        </ul>

        <h3>👁️ Higher Entities</h3>
        <p>The world is influenced by forces beyond Globs and Pyces:</p>
        <ul>
          <li><strong>Kirb / KirByte (the prototype)</strong>: square titanium bee robot capable of traveling between dimensions. Its existence is linked to events like the expulsion of humans from Bitlands.</li>
          <li><strong>1x1x1x1 Pyce</strong>: hacker entity capable of altering the system's internal rules.</li>
        </ul>

        <h3>⚖️ Cosmic Structure</h3>
        <p>The balance of the world is sustained between three forces:</p>
        <ul>
          <li>🌊 <strong>Globs</strong>: adaptive biological life of the environment</li>
          <li>🖥️ <strong>Pyces</strong>: evolutionary artificial life</li>
          <li>👁️ <strong>Higher Entities</strong>: forces that alter or break the system</li>
        </ul>
      `;
    }
  } else if (currentStoryTab === 'mechanics') {
    if (currentLanguage === 'es') {
      container.innerHTML = `
        <h3>⚙️ Mecánicas de Juego</h3>
        <p>Aprende el funcionamiento del ecosistema de Gelatin Lake y domina la defensa.</p>

        <h4>💰 Economía del Juego</h4>
        <ul>
          <li><img src="img/Tokens/Globetin.png" width="16" style="vertical-align: middle;"> <strong>Globetines</strong>: Moneda interna de partida usada para comprar y mejorar Globs durante las oleadas. Se resetea en cada partida.</li>
          <li><img src="img/Tokens/PyCoin.png" width="16" style="vertical-align: middle;"> <strong>PyCoins</strong>: Residuos de energía/datos obtenidos al derrotar Pyces en combate. Se usan en la Tienda Meta permanente para adquirir mejoras de base, aumentar límites de torres y comprar skins.</li>
          <li><img src="img/Tokens/DuckPass.png" width="16" style="vertical-align: middle;"> <strong>Duckpasses</strong>: Tarjetas especiales patrocinadas por Ducky Glob que permiten comprar mejoras avanzadas (Duckgrades) y skins exclusivas.</li>
        </ul>

        <h4>🏪 Meta-progresión</h4>
        <ul>
          <li><strong>Mejoras de la base</strong>: Aumenta permanentemente la salud inicial de tu base hasta un máximo de +200 de salud.</li>
          <li><strong>Límites de Globs</strong>: Aumenta la cantidad máxima de torres de un tipo específico que puedes tener activas simultáneamente en el mapa.</li>
          <li><strong>Duckgrades</strong>: Habilidades pasivas definitivas de cada familia de Globs. Desbloquéalas con Duck Pass Currency en la Tienda Meta.</li>
          <li><strong>Personalización de Aspectos</strong>: Desbloquea y equipa skins para tus familias de Globs para cambiar sus gráficos de combate y ataques especiales.</li>
        </ul>
      `;
    } else {
      container.innerHTML = `
        <h3>⚙️ Game Mechanics</h3>
        <p>Learn how the Gelatin Lake ecosystem works and master the defense.</p>

        <h4>💰 Game Economy</h4>
        <ul>
          <li><img src="img/Tokens/Globetin.png" width="16" style="vertical-align: middle;"> <strong>Globets</strong>: In-game match currency used to purchase and upgrade Globs during waves. Resets every game.</li>
          <li><img src="img/Tokens/PyCoin.png" width="16" style="vertical-align: middle;"> <strong>PyCoins</strong>: Energy/data residuals obtained from defeating Pyces in combat. Used in the permanent Meta Shop for base upgrades, tower limits, and buying skins.</li>
          <li><img src="img/Tokens/DuckPass.png" width="16" style="vertical-align: middle;"> <strong>Duckpasses</strong>: Special cards sponsored by Ducky Glob to purchase advanced passive skills (Duckgrades) and exclusive skins.</li>
        </ul>

        <h4>🏪 Meta-progression</h4>
        <ul>
          <li><strong>Base Upgrades</strong>: Permanently increases your starting base health up to a maximum of +200 health.</li>
          <li><strong>Glob Limits</strong>: Increases the maximum number of towers of a specific type you can have active simultaneously on the map.</li>
          <li><strong>Duckgrades</strong>: Ultimate passive skills for each Glob family. Unlock them with Duck Pass Currency in the Meta Shop.</li>
          <li><strong>Aesthetics Customization</strong>: Unlock and equip skins for your Glob families to change their battle sprites and special attacks.</li>
        </ul>
      `;
    }
  } else if (currentStoryTab === 'logs') {
    if (currentLanguage === 'es') {
      container.innerHTML = `
        <h3>📋 Historial de Actualizaciones (GD v2.1.0)</h3>
        <p>¡Nuevos desafíos, mejoras de accesibilidad y 11 nuevos Emblemas (Logros) únicos!</p>
        
        <h4>Novedades del Parche:</h4>
        <ul>
          <li>⚙️ <strong>Ajustes Accesibles</strong>: Corregido el z-index del botón de ajustes y los modales para que se muestren correctamente por encima de las pantallas de login y selección.</li>
          <li>🤖 <strong>Desbloqueo de Work-Bombot</strong>: ¡Ahora se consigue al superar con éxito los desafiantes modos <strong>Anti-Normal</strong> o <strong>Corrupto</strong> en lugar de por nivel de Duck Pass!</li>
          <li>🏅 <strong>11 Nuevos Emblemas Añadidos</strong>: Ataques directos, Una actu dorada, La alianza suprema, Artillería profunda, Meleapela, Efectos épicos, LETS GO GAMBLING!!, Ahorros profundos, Ni dios soportaría esto, LA FORTALEZA ANGELICAL y Edificio de titanio. ¡Búscalos en la sección de logros!</li>
          <li>🎯 <strong>Corrección de Física de Combate</strong>: ¡Los efectos de <strong>Quemado (Burn)</strong> y <strong>Ralentizado (Slow)</strong> ahora se aplican e infligen daño/efecto correctamente a los enemigos!</li>
        </ul>

        <h3>📋 Historial de Actualizaciones (GD v2.0.0)</h3>
        <p>¡Bienvenido a la gran actualización de la progresión y jugabilidad de Glob Defenders!</p>
 
        <h4>Novedades de la Versión:</h4>
        <ul>
          <li>🔥 <strong>¡Llegan las G-Tácticas (G-Tacks)!</strong> Desbloquea habilidades activas devastadoras para tus torres de nivel máximo en la Meta-Tienda. Úsalas en combate a cambio de Globetines.</li>
          <li>⚖️ <strong>Actualización de Balance y Progresión</strong>:
            <ul>
              <li><strong>Requisitos de Nivel</strong>: Nivel 35 en el Duck Pass requerido para comprar Duckgrades y Nivel 50 para G-Tacks. Los candados se muestran visualmente en la tienda.</li>
              <li><strong>Multiplicadores de Recompensa</strong>: Desbloquea bonificaciones pasivas de recursos: Nivel 60 (x1.5 PyCoins), Nivel 80 (x2.5 PyCoins), Nivel 100 (x3.0 PyCoins y x2.0 DuckPasses).</li>
              <li><strong>Reset Multi-Cuenta</strong>: El botón de reset en ajustes ahora borra correctamente el progreso del usuario activo, además del progreso antiguo.</li>
            </ul>
          </li>
          <li>🩶 <strong>Inmunidad de la Familia Gris</strong>: La mejora Duckgrade de la familia Gris ahora otorga inmunidad contra aturdimientos y ralentizaciones a todas las torres cercanas.</li>
          <li>🛠️ <strong>¡Rediseño de la UI de las Torres!</strong> El menú de selección de torres es ahora un Dock inferior flotante y ultra accesible, optimizado para móvil y tablets en formato horizontal.</li>
          <li>🎁 <strong>Códigos de Regalo Activos</strong>:
            <ul>
              <li><code>BETA_OPENING</code> (100 Duckpasses)</li>
              <li><code>REWORKED</code> (100 Duckpasses + 100 Pycoins + 200 XP)</li>
              <li><code>GLOBS_ATTACK</code> (100 Duckpasses + 100 XP)</li>
              <li><code>GALAXIUM</code> (200 PyCoins + 200 DuckPasses)</li>
            </ul>
          </li>
          <li>🎭 <strong>Narrativa Contextual</strong>: Disfruta de introducciones de historia únicas al iniciar los modos de juego <strong>Corrupto</strong> y <strong>AntiNormal</strong>, narradas por los antagonistas del sistema.</li>
        </ul>
      `;
    } else {
      container.innerHTML = `
        <h3>📋 Update Logs (GD v2.1.0)</h3>
        <p>New challenges, accessibility fixes, and 11 unique Achievements/Badges to unlock!</p>
        
        <h4>What's New in this Patch:</h4>
        <ul>
          <li>⚙️ <strong>Accessible Settings</strong>: Fixed the settings button z-index and modal layout to properly render on top of the login and selection screens.</li>
          <li>🤖 <strong>Work-Bombot Unlock Challenge</strong>: Now unlocked by defeating the challenging <strong>Anti-Normal</strong> or <strong>Corrupt</strong> modes instead of the Duck Pass!</li>
          <li>🏅 <strong>11 New Badges Added</strong>: Direct Attacks, A Golden Upgrade, The Supreme Alliance, Deep Artillery, Meleapela, Epic Effects, LETS GO GAMBLING!!, Deep Savings, Not Even God Can Stand This, THE ANGELIC FORTRESS, and Titanium Building. Check them out in your achievements tab!</li>
          <li>🎯 <strong>Combat Physics Correction</strong>: <strong>Burn</strong> and <strong>Slow</strong> status effects now correctly apply and deal damage/effect to enemies!</li>
        </ul>

        <h3>📋 Update Logs (GD v2.0.0)</h3>
        <p>Welcome to the major progression and gameplay update of Glob Defenders!</p>
 
        <h4>What's New in this Version:</h4>
        <ul>
          <li>🔥 <strong>G-Tacks (G-Tactics) Are Here!</strong> Unlock devastating active abilities for your max-level towers in the Meta Shop. Trigger them in-game by spending Globets.</li>
          <li>⚖️ <strong>Balance & Progression Update</strong>:
            <ul>
              <li><strong>Level Requirements</strong>: Level 35 in Duck Pass is required to buy Duckgrades, and Level 50 to buy G-Tacks. Visual locks are displayed in the shop.</li>
              <li><strong>Prestige Reward Multipliers</strong>: Unlock passive resource yield bonuses: Level 60 (x1.5 PyCoins), Level 80 (x2.5 PyCoins), Level 100 (x3.0 PyCoins and x2.0 DuckPasses).</li>
              <li><strong>Multi-Account Progress Reset</strong>: Options reset button now wipes the active user's specific progress key in addition to legacy saves.</li>
            </ul>
          </li>
          <li>🩶 <strong>Grey Family Immunity</strong>: The Grey family Duckgrade now grants immunity against stuns and slows to all nearby towers.</li>
          <li>🛠️ <strong>Redesigned Tower UI!</strong> The tower selection panel is now a sleek, bottom-floating dock, optimized for landscape mobile and tablet gaming.</li>
          <li>🎁 <strong>Active Promo Codes</strong>:
            <ul>
              <li><code>BETA_OPENING</code> (100 Duckpasses)</li>
              <li><code>REWORKED</code> (100 Duckpasses + 100 Pycoins + 200 XP)</li>
              <li><code>GLOBS_ATTACK</code> (100 Duckpasses + 100 XP)</li>
              <li><code>GALAXIUM</code> (200 PyCoins + 200 DuckPasses)</li>
            </ul>
          </li>
          <li>🎭 <strong>Contextual Story Narration</strong>: Enjoy custom lore intros when launching **Corrupt** and **AntiNormal** game modes, told directly by the system's cyber-antagonists.</li>
        </ul>
      `;
    }
  }
}

function initMusic() {
  if (backgroundMusic) return;
  try {
    backgroundMusic = new Audio('sounds/DefendersTheme.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.4;

    if (musicEnabled) {
      const playPromise = backgroundMusic.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Autoplay blocked, waiting for user gesture:", error);
          const playOnGesture = () => {
            if (musicEnabled && backgroundMusic) {
              backgroundMusic.play().catch(e => console.log("Play failed on gesture:", e));
            }
            document.removeEventListener('click', playOnGesture);
          };
          document.addEventListener('click', playOnGesture);
        });
      }
    }
  } catch (e) {
    console.error("Error initializing background music:", e);
  }
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  const btn = document.getElementById('music-toggle-btn');
  if (btn) {
    btn.textContent = musicEnabled ? (currentLanguage === 'es' ? '🎵 Música ON' : '🎵 Music ON') : (currentLanguage === 'es' ? '🎵 Música OFF' : '🎵 Music OFF');
  }

  if (backgroundMusic) {
    if (musicEnabled) {
      backgroundMusic.play().catch(e => console.log("Play failed:", e));
    } else {
      backgroundMusic.pause();
    }
  } else if (musicEnabled) {
    initMusic();
  }
  saveProgress();
}

window.onload = init;