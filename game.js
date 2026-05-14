// ===================== ESTADO DEL JUEGO =====================

let currentLanguage = 'es';

// Generamos spots automáticamente evitando el río y el camino
const TOWER_SPOTS = [];
function generateSpots() {
  for (let x = 40; x < 950; x += 100) {
    for (let y = 40; y < 550; y += 100) {
      let inRiver = RIVER_ZONES.some(r => x > r.x - 40 && x < r.x + r.w + 40 && y > r.y - 40 && y < r.y + r.h + 40);
      let onPath = PATH_SEGMENTS.some(p => x > p.x - 40 && x < p.x + p.w + 40 && y > p.y - 40 && y < p.y + p.h + 40);
      if (!inRiver && !onPath) {
        TOWER_SPOTS.push({ x, y, w: 80, h: 80 });
      }
    }
  }
}
generateSpots();

let gameState = {
  health: 100, wave: 0,
  towers: [], enemies: [], projectiles: [],
  selectedTowerType: null, waveActive: false,
  gameOver: false, adminMode: false, autoWave: false,
  towerSpots: [],

  mode: 'normal',
  corrupt: false,
  healthClicks: 0,
  consecutiveMimics: 0,
  corruptWins: 0,
  maxWaves: 15,
  unlockedInfinite: false,

  // Nuevas divisas y progresión
  globetines: 500,
  pycoins: 0,
  duckPassXP: 0,
  duckPassLevel: 1,
  duckPassCurrency: 0,

  // Límites y mejoras
  baseHealthLevel: 0,
  towerLimits: {
    'Glob': 3,
    'Red_Glob': 5,
    'Soap_Glob': 3,
    'Ducky_Glob': 3,
    'Comet_Glob': 3,
    'Pyce_Glob': 2,
    'Old_Glob': 2,
    'Work_Bombot': 1
  },
  usedCodes: {},
  towerCounts: {},
  towerBuffs: {
    damage: 1,
    range: 1,
    speed: 1
  },
  unlockedSkins: ['default'],
  equippedSkins: {
    'Glob': 'default',
    'Red_Glob': 'default',
    'Global': 'default'
  },
  failedCodeAttempts: 0,
  logoClicks: 0,
  antiNormalActive: false,
  unlockedAntiNormal: false,
  claimedRewards: [],
  muted: false,
  totalDamage: 0,
  settings: {
    showShopDesc: true,
    showTotalDamage: false
  }
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
loadUsers(); // Cargar al inicio

// ===================== MOTOR DEL JUEGO =====================

function init() {
  console.log("Iniciando Glob Defenders...");
  try {
    updateLanguage(); // Aplicar idioma al inicio
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
    unlockedPyceGlob: TOWER_TYPES['Pyce_Glob'] ? TOWER_TYPES['Pyce_Glob'].unlocked : false,

    // Meta data
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
    settings: gameState.settings
  };
  localStorage.setItem('glob_progress_' + user, JSON.stringify(progress));
}

function loadProgress(username) {
  try {
    const user = username || localStorage.getItem('glob_username');
    if (!user) return;

    let data = localStorage.getItem('glob_progress_' + user);
    
    // Migración: Si no hay datos del usuario pero hay datos globales antiguos
    if (!data) {
      data = localStorage.getItem('glob_progress');
      if (data) {
        console.log("Migrando progreso global al usuario:", user);
        localStorage.setItem('glob_progress_' + user, data);
      }
    }

    if (data) {
      const progress = JSON.parse(data);
      if (progress.badges) {
        Object.keys(progress.badges).forEach(k => {
          if (BADGES[k]) BADGES[k].unlocked = progress.badges[k];
        });
      }
      gameState.unlockedInfinite = progress.unlockedInfinite || false;
      gameState.corruptWins = progress.corruptWins || 0;
      if (TOWER_TYPES['Work_Bombot']) TOWER_TYPES['Work_Bombot'].unlocked = progress.unlockedBombot || false;
      if (TOWER_TYPES['Pyce_Glob']) TOWER_TYPES['Pyce_Glob'].unlocked = progress.unlockedPyceGlob || false;

      // Meta data
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
      gameState.equippedSkins = progress.equippedSkins || { 'Glob': 'default', 'Red_Glob': 'default', 'Global': 'default' };
      gameState.unlockedAntiNormal = progress.unlockedAntiNormal || false;
      gameState.claimedRewards = progress.claimedRewards || [];
      gameState.muted = progress.muted || false;
      if (gameState.unlockedAntiNormal) BADGES.antiNormal.unlocked = true;
      updateBuffs();
      document.getElementById('total-damage-stat').style.display = gameState.settings.showTotalDamage ? 'flex' : 'none';
      updateMuteButton();
      // Ajustar salud según el nivel cargado
      gameState.health = 100 + (gameState.baseHealthLevel * 20);
    }
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
  showMessage(translate('mode_selected', { mode: mode.toUpperCase() }), 'info');
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
    <b>${name}</b>
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

function openOptions() {
  document.getElementById('options-modal').style.display = 'flex';
  document.getElementById('opt-show-desc').checked = gameState.settings.showShopDesc;
  document.getElementById('opt-show-damage').checked = gameState.settings.showTotalDamage;
}

function closeOptions() {
  document.getElementById('options-modal').style.display = 'none';
  saveProgress();
}

function updateSettings() {
  gameState.settings.showShopDesc = document.getElementById('opt-show-desc').checked;
  gameState.settings.showTotalDamage = document.getElementById('opt-show-damage').checked;
  document.getElementById('total-damage-stat').style.display = gameState.settings.showTotalDamage ? 'flex' : 'none';
  drawTowerShop();
  saveProgress();
}

function drawTowerShop() {
  const shop = document.getElementById('tower-shop');
  shop.innerHTML = '';
  const initial = ['Glob', 'Red_Glob', 'Soap_Glob', 'Ducky_Glob', 'Comet_Glob'];
  if (TOWER_TYPES['Pyce_Glob'].unlocked) initial.push('Pyce_Glob');
  if (TOWER_TYPES['Old_Glob'].unlocked) initial.push('Old_Glob');
  if (TOWER_TYPES['Work_Bombot'].unlocked) initial.push('Work_Bombot');

  initial.forEach(type => {
    const t = TOWER_TYPES[type];
    const el = document.createElement('div');
    el.className = 'tower-item';
    el.dataset.type = type;
    
    const currentCount = gameState.towerCounts[type] || 0;
    const limit = gameState.towerLimits[type] || 3;
    const isFull = currentCount >= limit;

    const displayImg = getTowerImage(type);
    const name = translate('tower_' + type + '_name');
    el.innerHTML = `
      <div class="tower-icon-shop" style="background-image: url('${displayImg}')"></div>
      <div class="tower-info-shop">
        <div class="tower-name">${name}</div>
        ${gameState.settings.showShopDesc ? `<div class="tower-desc-shop">${translate(t.desc) || ""}</div>` : ''}
        <div class="tower-stats-shop">
          <span class="tower-cost">💰 ${t.cost}</span>
          <span class="tower-limit ${isFull ? 'limit-full' : ''}">${currentCount}/${limit}</span>
        </div>
      </div>
    `;

    el.onmouseenter = () => showTooltip(t, el);
    el.onmouseleave = hideTooltip;

    if (isFull) el.classList.add('disabled-shop');
    shop.appendChild(el);
  });
}

function drawBadges() {
  const list = document.getElementById('badges-list');
  if (!list) return;
  list.innerHTML = '';
  Object.values(BADGES).filter(b => b.unlocked).forEach(b => {
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
  }

  const logo = document.querySelector('.login-logo');
  if (logo) {
    logo.onclick = () => {
      gameState.logoClicks++;
      logo.style.transform = `scale(1.15) rotate(${Math.random()*12 - 6}deg)`;
      setTimeout(() => logo.style.transform = `scale(1) rotate(0deg)`, 120);

      if (gameState.unlockedAntiNormal) {
        gameState.pycoins += 1;
        updateMetaUI();
        showEffect(window.innerWidth/2, window.innerHeight/2, "+1 PyCoin");
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
      'T3CHSP4WN': { py: 50, xp: 150, msg: '50 PyCoins + 150 XP' }
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

  document.getElementById('open-shop').onclick = () => openShop();
  document.getElementById('open-pass').onclick = () => openPass();
  window.addEventListener('resize', applyScale);
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
  if (document.getElementById('login-screen').style.display === 'none') {
    modeScreen.style.display = 'flex';
  }
}

function backToModes() {
  closeModal('shop-modal');
  closeModal('pass-modal');
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
  gameState.towerBuffs = { damage: 1, range: 0, speed: 1 };
  SKINS_DATA['Global'].forEach(m => {
    if (m.buff && gameState.duckPassLevel >= m.level) {
      if (m.buff.damage) gameState.towerBuffs.damage *= m.buff.damage;
      if (m.buff.range_flat) gameState.towerBuffs.range += m.buff.range_flat;
      if (m.buff.speed) gameState.towerBuffs.speed *= m.buff.speed;
    }
  });
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
  if (document.getElementById('pass-modal').style.display === 'flex') {
    document.getElementById('pass-level').textContent = gameState.duckPassLevel;
    document.getElementById('pass-xp').textContent = gameState.duckPassXP;
    document.getElementById('xp-fill').style.width = `${gameState.duckPassXP}%`;
  }
}

function drawShop() {
  const container = document.getElementById('shop-items');
  if (!container) return;
  container.innerHTML = `
    <div class="shop-balance">
      <div class="balance-item"><img src="img/Tokens/PyCoin.png" width="20"> <span>${Math.floor(gameState.pycoins)} PyCoins</span></div>
      <div class="balance-item"><img src="img/Tokens/DuckPass.png" width="20"> <span>${gameState.duckPassCurrency} Duck Pass</span></div>
    </div>
  `;

  if (currentShopTab === 'upgrades') {
    const upgrades = [
      { id: 'hp', name: 'upgrade_hp_name', desc: 'upgrade_hp_desc', cost: 50, type: 'pycoin' },
      { id: 'unlock_Pyce_Glob', name: 'upgrade_unlock_pyce_name', desc: 'upgrade_unlock_pyce_desc', cost: 100, type: 'pycoin', hideIfUnlocked: true }
    ];
    ['Glob', 'Red_Glob', 'Ducky_Glob'].forEach(t => {
      if (gameState.towerLimits[t] < 10) upgrades.push({ id: 'limit_'+t, name: 'upgrade_limit_name', desc: 'upgrade_limit_desc', cost: 30, type: 'pycoin', params: {name: t} });
    });

    upgrades.forEach(u => {
      if (u.hideIfUnlocked && TOWER_TYPES['Pyce_Glob'].unlocked) return;
      const el = document.createElement('div');
      el.className = 'meta-item';
      el.innerHTML = `<h3>${translate(u.name, u.params)}</h3><p>${translate(u.desc, u.params)}</p><div class="cost">💰 ${u.cost}</div>
        <button class="meta-buy-btn" ${canAfford(u) ? '' : 'disabled'} onclick="buyUpgrade('${u.id}', ${u.cost}, '${u.type}')">${translate('buy')}</button>`;
      container.appendChild(el);
    });
  } else {
    Object.keys(SKINS_DATA).forEach(family => {
      if (family === 'Global') return;
      SKINS_DATA[family].forEach(skin => {
        const isUnlocked = gameState.unlockedSkins.includes(skin.id);
        const isEquipped = gameState.equippedSkins[family] === skin.id;
        const el = document.createElement('div');
        el.className = `skin-item ${isEquipped ? 'equipped' : ''}`;
        let btnText = isUnlocked ? (isEquipped ? translate('actual') : translate('equip_btn')) : `${translate('buy')} (${skin.cost})`;
        el.innerHTML = `<div class="skin-preview ${skin.class || ''}"><img src="${skin.skins ? skin.skins[family] || Object.values(skin.skins)[0] : 'img/Glob_DEF.png'}" style="width:100%; height:100%; filter:${skin.filter || ''}"></div>
          <h3>${translate(skin.name)}</h3><p>${translate(skin.desc)}</p>
          <button class="skin-buy-btn ${isUnlocked ? 'equip' : ''}" ${!isUnlocked && gameState.pycoins < skin.cost ? 'disabled' : ''} onclick="${isUnlocked ? `equipSkin('${family}', '${skin.id}')` : `buySkin('${family}', '${skin.id}', ${skin.cost})`}">${btnText}</button>`;
        container.appendChild(el);
      });
    });
  }
}

let currentShopTab = 'upgrades';
function switchShopTab(tab) { currentShopTab = tab; drawShop(); }

function buySkin(family, skinId, cost) {
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
  if (type === 'pycoin' ? gameState.pycoins < cost : gameState.duckPassCurrency < cost) return;
  if (type === 'pycoin') gameState.pycoins -= cost; else gameState.duckPassCurrency -= cost;

  if (id === 'hp') { gameState.baseHealthLevel++; gameState.health += 20; showMessage(translate('base_hp_improved'), 'success'); }
  else if (id.startsWith('limit_')) { gameState.towerLimits[id.replace('limit_', '')]++; showMessage(translate('tower_limit_increased', {name: id.replace('limit_', '')}), 'success'); }
  else if (id === 'unlock_Pyce_Glob') { TOWER_TYPES['Pyce_Glob'].unlocked = true; showMessage(translate('pyceGlobUnlocked'), 'success'); }

  updateMetaUI(); drawShop(); drawTowerShop(); saveProgress();
}

function drawPass() {
  const container = document.getElementById('pass-rewards');
  if (!container) return; container.innerHTML = '';
  [...SKINS_DATA['Global']].sort((a,b)=>a.level-b.level).forEach(skin => {
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
  if ((gameState.towerCounts[type]||0) >= (gameState.towerLimits[type]||3)) return showMessage(translate('limit_reached', { name: translate('tower_' + type + '_name'), limit: gameState.towerLimits[type] || 3 }), 'error');
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
  gameState.towerCounts[type] = (gameState.towerCounts[type]||0) + 1;
  spot.occupied = true;
  updateUI(); drawTowerShop();
}

function selectTower(t) {
  gameState.selectedTower = t;
  const panel = document.getElementById('evolve-panel');
  panel.style.display = 'flex';
  document.getElementById('tower-name').textContent = translate('tower_' + t.type + '_name');
  document.getElementById('tower-desc').innerHTML = translate(t.desc) + (t.evolution ? `<br><br><b>${translate('evolution_label')}:</b> ${translate('tower_' + t.evolution + '_name')}` : '');
  updateEvolveButtons(t);
  drawRangePreview(t.x, t.y, t.range);
}

function updateEvolveButtons(t) {
  const container = document.getElementById('evolve-options'); container.innerHTML = '';
  if (t.evolution) {
    const next = TOWER_TYPES[t.evolution];
    const btn = document.createElement('button');
    btn.className = 'evolve-btn'; btn.disabled = gameState.globetines < next.cost;
    btn.innerHTML = translate('evolve_to', { name: translate('tower_' + t.evolution + '_name'), cost: next.cost });
    btn.onclick = () => evolveTower(t, t.evolution);
    container.appendChild(btn);
  }
  document.getElementById('sell-tower-btn').onclick = () => sellTower(t);
  document.getElementById('sell-tower-btn').innerHTML = translate('sell_tower', { cost: Math.floor(t.cost * 0.7) });
}

function evolveTower(tower, nextType) {
  const next = TOWER_TYPES[nextType];
  if (gameState.globetines < next.cost) return;
  gameState.globetines -= next.cost;
  if (tower.type !== nextType) { gameState.towerCounts[tower.type]--; gameState.towerCounts[nextType] = (gameState.towerCounts[nextType]||0)+1; }
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
  if (gameState.waveActive || gameState.gameOver) return;
  if (gameState.mode !== 'infinito' && gameState.wave >= gameState.maxWaves) return endGame(true);

  gameState.waveActive = true; gameState.wave++;
  updateUI(); showMessage(translate('waveStarted', { wave: gameState.wave }), 'info');

  let count = 5 + gameState.wave * 2;
  let spawned = 0;
  const interval = setInterval(() => {
    let type = null, boss = false;
    if (gameState.wave % 10 === 0 && spawned === 0) { type = '1x1x1x1_Pyce'; boss = true; }
    spawnEnemy(type, boss); spawned++;
    if (spawned >= count) clearInterval(interval);
  }, 1000);
}

function spawnEnemy(type, boss) {
  if (!type) {
    const keys = Object.keys(ENEMY_TYPES).filter(k => k !== 'Stupid_GoldPyce');
    type = keys[Math.floor(Math.random() * Math.min(keys.length, Math.floor(gameState.wave/3)+1))];
    if (Math.random() < 0.01) type = 'Stupid_GoldPyce';
  }
  const t = ENEMY_TYPES[type];
  const el = document.createElement('div'); el.className = 'enemy' + (boss ? ' boss' : '');
  el.style.backgroundImage = `url('${t.image}')`;
  const hpFill = document.createElement('div'); hpFill.className = 'hp-bar-fill';
  const hpBg = document.createElement('div'); hpBg.className = 'hp-bar-bg';
  hpBg.appendChild(hpFill); el.appendChild(hpBg);
  document.getElementById('game-area').appendChild(el);

  const name = translate('enemy_' + type + '_name');
  gameState.enemies.push({ ...t, name, el, x: ENEMY_PATH[0].x, y: ENEMY_PATH[0].y, pathIndex: 0, health: t.health * (1+gameState.wave*0.15), maxHealth: t.health * (1+gameState.wave*0.15), hpFill, shield: (t.shield||0)*t.health, type });
}

function gameLoop() {
  if (gameState.gameOver) return;
  const dt = 1/60;

  for (let i = gameState.enemies.length-1; i >= 0; i--) {
    const e = gameState.enemies[i];
    const next = ENEMY_PATH[e.pathIndex+1];
    
    if (next) {
      const dx = next.x - e.x, dy = next.y - e.y, dist = Math.hypot(dx, dy);
      if (dist < e.speed) e.pathIndex++;
      else { e.x += (dx/dist)*e.speed; e.y += (dy/dist)*e.speed; }
      e.el.style.left = `${e.x}px`; e.el.style.top = `${e.y}px`;
    } else {
      if (e.instakill) { gameState.health = 0; endGame(); return; }
      if (e.doubleLap && !e.lapped) { e.pathIndex = 0; e.lapped = true; continue; }
      e.el.remove(); gameState.enemies.splice(i, 1);
      gameState.health -= e.boss ? 10 : 1;
      if (gameState.health <= 0) { gameState.health = 0; endGame(); }
      updateUI(); continue;
    }

    // Visual de Vida/Escudo
    const totalCurrent = e.health + (e.shield || 0);
    const totalMax = e.maxHealth + (e.shield > 0 ? e.maxHealth * 0.5 : 0); // Estimación para barra
    const pct = Math.max(0, (totalCurrent / (e.maxHealth + (e.shield > 0 ? e.maxHealth * 0.5 : 0))) * 100);
    e.hpFill.style.width = pct + '%';
    e.hpFill.style.backgroundColor = (e.shield > 0) ? '#ffd700' : '#ff4444';

    if (e.health <= 0) die(e, i);
  }

  gameState.towers.forEach(t => {
    if (t.stunned > 0) { t.stunned -= dt; t.el.classList.add('stunned'); return; }
    t.el.classList.remove('stunned');
    t.cooldown -= dt;
    if (t.cooldown <= 0) {
      const targets = gameState.enemies.filter(e => Math.hypot(e.x-t.x, e.y-t.y) <= t.range);
      if (targets.length) { shoot(t, targets[0]); t.cooldown = 1/t.speed; }
    }
  });

  for (let i = gameState.projectiles.length-1; i >= 0; i--) {
    const p = gameState.projectiles[i];
    if (!p.target || !gameState.enemies.includes(p.target)) { p.el.remove(); gameState.projectiles.splice(i,1); continue; }
    const dx = p.target.x - p.x, dy = p.target.y - p.y, dist = Math.hypot(dx, dy);
    if (dist < 10) {
      let dmg = p.damage;
      if (p.target.shield > 0) {
        const abs = Math.min(p.target.shield, dmg);
        p.target.shield -= abs;
        dmg -= abs;
      }
      if (dmg > 0) p.target.health -= dmg;
      gameState.totalDamage += p.damage;
      p.el.remove(); gameState.projectiles.splice(i,1);
    } else { p.x += (dx/dist)*10; p.y += (dy/dist)*10; p.el.style.left = p.x+'px'; p.el.style.top = p.y+'px'; }
  }

  if (gameState.waveActive && !gameState.enemies.length) {
    gameState.waveActive = false;
    gameState.globetines += 50 + gameState.wave*10;
    gameState.pycoins += 10;
    addXP(20);
    updateUI(); updateMetaUI(); saveProgress();
    if (gameState.autoWave) setTimeout(startWave, 2000);
  }
  requestAnimationFrame(gameLoop);
}

function shoot(t, target) {
  const el = document.createElement('div'); el.className = `projectile ${t.projectile}`;
  el.style.left = t.x+'px'; el.style.top = t.y+'px';
  document.getElementById('map').appendChild(el);
  gameState.projectiles.push({ x: t.x, y: t.y, target, damage: t.damage, el });
}

function die(e, idx) {
  gameState.globetines += e.reward;
  if (e.mimic) { gameState.pycoins += 5; showMessage(translate('plus_pycoins', { amount: 5 }), 'success'); }
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
  updateMetaUI();
}

function translate(key, params = {}) {
  let text = TRANSLATIONS[currentLanguage][key] || key;
  for (const [p, v] of Object.entries(params)) text = text.replace(`{${p}}`, v);
  return text;
}

function updateLanguage() {
  // Traducir todos los elementos con data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const attr = el.getAttribute('data-i18n-attr');
    if (attr) {
      el.setAttribute(attr, translate(key));
    } else {
      // Caso especial para el Duck Pass Level que tiene un span dentro
      if (key === 'level_label' && el.firstChild && el.firstChild.nodeType === 3) {
        el.firstChild.textContent = translate(key) + " ";
      } else {
        el.textContent = translate(key);
      }
    }
  });

  // Casos especiales que no pueden usar data-i18n fácilmente (ej. botones con iconos y texto)
  document.querySelectorAll('.btn-text').forEach(el => {
    const parent = el.parentElement;
    if (parent.id === 'start-wave') el.textContent = translate('startWave');
    if (parent.id === 'auto-wave') el.textContent = translate('autoWave');
    if (parent.id === 'deselect-tower') el.textContent = translate('cancel');
    if (parent.classList.contains('back-btn')) el.textContent = translate('back_to_modes');
    if (parent.classList.contains('retry-btn')) el.textContent = translate('playAgain');
  });

  // Títulos de modales
  const shopTitle = document.getElementById('shop-title');
  if (shopTitle) shopTitle.innerHTML = `🛒 ${translate('shop_title').replace('🛒 ', '')}`;
  const passTitle = document.getElementById('pass-title');
  if (passTitle) passTitle.innerHTML = `🦆 ${translate('pass_title').replace('🦆 ', '')}`;
}

  // Evolución
  const evolveTitle = document.querySelector('#evolve-panel h3');
  if (evolveTitle) evolveTitle.textContent = translate('evolve_title');
  const sellBtn = document.getElementById('sell-tower-btn');
  if (sellBtn) sellBtn.textContent = translate('sell');
  const evolveClose = document.querySelector('#evolve-panel .close-btn');
  if (evolveClose) evolveClose.textContent = translate('close');

  // Portrait overlay
  const portTitle = document.querySelector('#portrait-overlay h2');
  if (portTitle) portTitle.textContent = translate('rotate_device');
  const portMsg = document.querySelector('#portrait-overlay p');
  if (portMsg) portMsg.textContent = translate('landscape_msg');

  // Game Over
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
  const el = document.createElement('div'); el.className = 'money-popup'; el.style.left = x+'px'; el.style.top = y+'px'; el.textContent = text;
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
  p.style.left = x+'px'; p.style.top = y+'px'; p.style.width = p.style.height = (range*2)+'px';
  document.getElementById('map').appendChild(p);
}

function endGame(victory = false) {
  gameState.gameOver = true;
  const modal = document.getElementById('game-over');
  if (!modal) return;
  modal.style.display = 'flex';
  
  const title = modal.querySelector('h2');
  const msg = modal.querySelector('p');
  const btn = modal.querySelector('button');

  if (victory) {
    if (title) title.textContent = translate('victory_title');
    if (msg) msg.innerHTML = translate('victory_msg', { mode: gameState.mode.toUpperCase() });
  } else {
    if (title) title.textContent = translate('gameOver');
    if (msg) msg.innerHTML = translate('waveStarted', { wave: gameState.wave }).replace('Oleada', 'Llegaste a la oleada').replace('Wave', 'You reached wave');
  }

  if (btn) {
    btn.textContent = translate('backToModes');
    btn.onclick = () => location.reload(); // Por ahora recargar es más seguro
  }
}

window.onload = init;