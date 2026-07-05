// ===================== ESTADO DEL JUEGO =====================

let currentLanguage = 'es';
let backgroundMusic = null;
let musicEnabled = true;
let showHitbox = false;

// Generamos spots automáticamente evitando el río y el camino
const TOWER_SPOTS = [];
let ENEMY_PATHS = [];
function generateSpots() {
  TOWER_SPOTS.length = 0;

  const mapKey = gameState.map || 'gelatin_lake';
  const mapData = MAPS[mapKey];
  if (!mapData) return;
  
  ENEMY_PATHS = mapData.enemyPaths ? mapData.enemyPaths : [mapData.enemyPath];

  const forbiddenZones = [...mapData.riverZones, ...mapData.pathSegments];

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
  console.log(`✅ Generados ${TOWER_SPOTS.length} spots para torres en ${mapKey}`);
}

let gameState = {
  health: 100, wave: 0,
  towers: [], enemies: [], projectiles: [],
  selectedTowerType: null, waveActive: false, spawningActive: false,
  gameOver: false, adminMode: false, autoWave: false,
  towerSpots: [],
  mode: 'normal',
  map: 'gelatin_lake',
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
    'Glob': 5, 'Red_Glob': 6, 'Soap_Glob': 3, 'Ducky_Glob': 3,
    'Comet_Glob': 3, 'Old_Glob': 2, 'Work_Bombot': 1, 'White': 1, 'Pink': 1, 'IEx': 1, 'Worker_Glob': 2
  },
  usedCodes: {},
  towerCounts: {},
  towerBuffs: { damage: 1, range: 0, speed: 1 },
  metaRange: 0,
  metaDamage: 1,
  metaRangeLevel: 0,
  metaDamageLevel: 0,
  unlockedSkins: ['default'],
  equippedSkins: { 'Glob': 'default', 'Red_Glob': 'default', 'Soap_Glob': 'default', 'Ducky_Glob': 'default', 'Comet_Glob': 'default', 'Grey': 'default', 'Special': 'default', 'Global': 'default' },
  equippedTowers: ['Glob', 'Red_Glob'],
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
  settings: { showShopDesc: true, showTotalDamage: false, oldAchievements: false },
  duckgrades: {},
  gtacks: { 'Glob': false, 'Red_Glob': false, 'Soap_Glob': false, 'Ducky_Glob': false, 'Comet_Glob': false, 'Old_Glob': false },
  pycesKilled: {},
  globsPlaced: {},
  mimicSpawned: 0,
  maxedFamilies: [],
  uniquesBossSpawned: {}  // Tracks NOeye_Pyce, MoonStar_Pyce (only 1 per game)
};

function getFamilyCount(baseType) {
  const cfg = TOWER_TYPES[baseType];
  if (!cfg) return 0;
  const family = cfg.family || baseType;
  return gameState.towers.filter(t => (t.family || t.type) === family).length;
}

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
    if (!gameState.map) gameState.map = 'gelatin_lake';
    generateSpots();
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
    equippedTowers: gameState.equippedTowers,
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
    // Campos de meta-progresión que faltaban
    metaRangeLevel: gameState.metaRangeLevel,
    metaRange: gameState.metaRange,
    metaDamageLevel: gameState.metaDamageLevel,
    metaDamage: gameState.metaDamage,
    duckgrades: gameState.duckgrades,
    upgradesResetV4: true,
    pycesKilled: gameState.pycesKilled,
    globsPlaced: gameState.globsPlaced,
    mimicSpawned: gameState.mimicSpawned,
    maxedFamilies: gameState.maxedFamilies || []
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

      if (!progress.upgradesResetV5) {
        console.log("Applying limits reset migration V5 for:", user);
        progress.towerLimits = {
          'Glob': 5, 'Red_Glob': 6, 'Soap_Glob': 3, 'Ducky_Glob': 3,
          'Comet_Glob': 3, 'Old_Glob': 2, 'Work_Bombot': 1, 'White': 1, 'Pink': 1, 'IEx': 1
        };
        progress.upgradesResetV5 = true;
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

      gameState.equippedTowers = progress.equippedTowers || ['Glob', 'Red_Glob'];
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
      gameState.equippedSkins = Object.assign({ 'Glob': 'default', 'Red_Glob': 'default', 'Soap_Glob': 'default', 'Ducky_Glob': 'default', 'Comet_Glob': 'default', 'Grey': 'default', 'Special': 'default', 'Global': 'default' }, progress.equippedSkins || {});
      gameState.cheatedModeActive = progress.cheatedModeActive || false;
      gameState.cheatedBackup = progress.cheatedBackup || null;
      gameState.unlockedAntiNormal = progress.unlockedAntiNormal || false;
      gameState.claimedRewards = progress.claimedRewards || [];
      gameState.muted = progress.muted || false;

      gameState.metaRangeLevel = progress.metaRangeLevel || 0;
      gameState.metaRange = progress.metaRange || 0;
      gameState.metaDamageLevel = progress.metaDamageLevel || 0;
      gameState.metaDamage = progress.metaDamage || 1;
      gameState.duckgrades = progress.duckgrades || {};
      gameState.gtacks = progress.gtacks || {
        'Glob': false, 'Red_Glob': false, 'Soap_Glob': false, 'Ducky_Glob': false,
        'Comet_Glob': false, 'Old_Glob': false
      };
      gameState.pycesKilled = progress.pycesKilled || {};
      gameState.globsPlaced = progress.globsPlaced || {};
      gameState.mimicSpawned = progress.mimicSpawned || 0;
      gameState.maxedFamilies = progress.maxedFamilies || [];
      musicEnabled = progress.musicEnabled !== undefined ? progress.musicEnabled : true;
      showHitbox = progress.showHitbox || false;

      if (gameState.unlockedAntiNormal) BADGES.antiNormal.unlocked = true;
      updateBuffs();
      document.getElementById('total-damage-stat').style.display = gameState.settings.showTotalDamage ? 'flex' : 'none';
      updateMuteButton();
      updateAchievementsBtnUI();
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
  const mapScreen = document.getElementById('map-selection');
  if (mapScreen) mapScreen.style.display = 'flex';
  const modeScreen = document.getElementById('mode-selection');

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
}

function selectMap(mapId) {
  gameState.map = mapId;
  const mapScreen = document.getElementById('map-selection');
  if (mapScreen) mapScreen.style.display = 'none';

  // Refrescar mapa
  generateSpots();
  createMap();

  showModeSelection();
}

function showModeSelection() {
  document.getElementById('mode-selection').style.display = 'flex';
  const modes = ['normal', 'dificil', 'extremo', 'corrupto'];
  const requirements = { 'normal': 'winFacil', 'dificil': 'winNormal', 'extremo': 'winDificil', 'corrupto': 'winExtremo' };

  // Render hidden modes dynamically
  const grid = document.querySelector('#mode-selection .modes-grid');
  if (grid) {
    // Clean up old dynamic buttons first
    grid.querySelectorAll('.dynamic-mode').forEach(el => el.remove());

    if (BADGES.winCorrupto && BADGES.winCorrupto.unlocked) {
      const btn = document.createElement('button');
      btn.className = 'mode-btn dynamic-mode mode-btn-corrupt';
      btn.dataset.mode = 'corrupto';
      btn.innerHTML = '👾 Corrupto';
      btn.onclick = () => selectMode('corrupto');
      grid.appendChild(btn);
    }

    if (BADGES.antiNormal && BADGES.antiNormal.unlocked) {
      const btn = document.createElement('button');
      btn.className = 'mode-btn dynamic-mode mode-btn-antinormal';
      btn.dataset.mode = 'antiNormal';
      btn.innerHTML = currentLanguage === 'en' ? '🌑 Un-Normal' : '🌑 Anti-Normal';
      btn.onclick = () => selectMode('antiNormal');
      grid.appendChild(btn);
    }
  }

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
  // Anti-Normal glitch blocks ALL mode selection except normal
  if (gameState.antiNormalActive && mode !== 'normal') {
    showMessage(translate('system_corrupt_error'), 'error');
    const btn = document.querySelector(`.mode-btn[data-mode="${mode}"]`);
    if (btn) {
      btn.classList.remove('glitch-rejected');
      void btn.offsetWidth;
      btn.classList.add('glitch-rejected');
    }
    return;
  }

  gameState.mode = mode;
  gameState.modeConfirmed = true;
  const limits = { facil: 10, normal: 15, dificil: 25, extremo: 40, infinito: 999, corrupto: 40, antiNormal: 35 };
  gameState.maxWaves = limits[mode] || 15;

  if (gameState.antiNormalActive && mode === 'normal') {
    gameState.mode = 'antiNormal';
    gameState.maxWaves = 35;
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
    const isUrban = (gameState.map || 'gelatin_lake') === 'urbanistic_road';
    if (gameState.mode === 'corrupto') {
      if (isUrban) {
        const storyText = currentLanguage === 'es'
          ? "¡Bienvenido a mi casino... o lo que queda de él tras mis mejoras! Aquí los Pyces juegan con mis reglas, ¡y NADIE sale sin pagar! ¡Prepárate para apostarlo todo!"
          : "Welcome to my casino... or what's left of it after my upgrades! Here the Pyces play by MY rules, and NOBODY leaves without paying! Prepare to bet it all!";
        showNarratorMsg('arkyvoid', NARRATOR_DATA.arkyvoid.img, NARRATOR_DATA.arkyvoid[currentLanguage].name, storyText);
      } else {
        const storyText = currentLanguage === 'es'
          ? "Bienvenido a Gelatin Lake... o lo que queda de él. Has entrado a mi región, donde los Pyces no actúan por voluntad propia, sino que obedecen mi sagrado diseño estelar. ¡Prepárate para ser asimilado!"
          : "Welcome to Gelatin Lake... or what is left of it. You have entered my region, where the Pyces do not act of their own free will, but obey my sacred stellar design. Prepare to be assimilated!";
        showNarratorMsg('moonstar', 'img/MoonStar_Pyce.png', 'MoonStar Pyce', storyText);
      }
    } else if (gameState.mode === 'antiNormal') {
      if (isUrban) {
        const storyText = currentLanguage === 'es'
          ? "las estrellas lo anunciaron hace tiempo... ahora los Arkys hemos tomado el control de este lugar. no hay escapatoria. el firmamento ya lo ha decidido por vosotros."
          : "the stars announced it long ago... now we Arkys have taken control of this place. there is no escape. the sky has already decided for you.";
        showNarratorMsg('crystarky', NARRATOR_DATA.crystarky.img, NARRATOR_DATA.crystarky[currentLanguage].name, storyText);
      } else {
        const storyText = currentLanguage === 'es'
          ? "¡S1S73M4 D3F1N171V0 D373C74D0! NOeye y MoonStar Pyce han unido sus fuerzas para crear la versión definitiva de este entorno. Los Globs serán borrados del sistema. ¡La purga comienza ya!"
          : "DEFINITIVE SYSTEM DETECTED! NOeye and MoonStar Pyce have joined forces to create the ultimate version of this environment. The Globs will be deleted from the system. The purge begins now!";
        showNarratorMsg('noeye', 'img/NOeye_Pyce.png', 'NOeye & MoonStar', storyText);
      }
    } else if (isUrban) {
      // Modos normales en Urbanistic Road → Arky da la bienvenida
      const storyText = currentLanguage === 'es'
        ? "¡Ja! Otro defensor que se atreve a entrar al Gambling Gaming Casino. La casa siempre gana, ¿sabes? ¡Mucha suerte... la vas a necesitar!"
        : "Ha! Another defender dares to enter the Gambling Gaming Casino. The house always wins, you know? Good luck... you're going to need it!";
      showNarratorMsg('arky', NARRATOR_DATA.arky.img, NARRATOR_DATA.arky[currentLanguage].name, storyText);
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
      const isUrban = (gameState.map || 'gelatin_lake') === 'urbanistic_road';
      if (isUrban) {
        const storyText = currentLanguage === 'es'
          ? "*kzzt* ¡Este casino... *krkr*... es MÍO ahora! Los Pyces obedecen mis reglas... ¡y tú también lo harás! 🎩"
          : "*kzzt* This casino... *krkr*... is MINE now! The Pyces obey my rules... and so will you! 🎩";
        showNarratorMsg('arkyvoid', NARRATOR_DATA.arkyvoid.img, NARRATOR_DATA.arkyvoid[currentLanguage].name, storyText);
      } else {
        const storyText = currentLanguage === 'es'
          ? "Bienvenido a Gelatin Lake... o lo que queda de él. Has entrado a mi región, donde los Pyces no actúan por voluntad propia, sino que obedecen mi sagrado diseño estelar. ¡Prepárate para ser asimilado!"
          : "Welcome to Gelatin Lake... or what is left of it. You have entered my region, where the Pyces do not act of their own free will, but obey my sacred stellar design. Prepare to be assimilated!";
        showNarratorMsg('moonstar', 'img/MoonStar_Pyce.png', 'MoonStar Pyce', storyText);
      }
    }, 1000);
  }
}

function createMap() {
  const map = document.getElementById('map');
  map.innerHTML = '';
  gameState.towerSpots = [];

  const mapKey = gameState.map || 'gelatin_lake';
  const mapData = MAPS[mapKey];
  if (!mapData) return;

  mapData.riverZones.forEach(r => {
    const el = document.createElement('div');
    el.className = 'river';
    if (mapKey === 'urbanistic_road') el.classList.add('urban-river');
    el.style.left = `${r.x}px`; el.style.top = `${r.y}px`;
    el.style.width = `${r.w}px`; el.style.height = `${r.h}px`;
    map.appendChild(el);
  });

  mapData.pathSegments.forEach(p => {
    const el = document.createElement('div');
    el.className = 'path-segment';
    if (mapKey === 'urbanistic_road') el.classList.add('urban-path');
    el.style.left = `${p.x}px`; el.style.top = `${p.y}px`;
    el.style.width = `${p.w}px`; el.style.height = `${p.h}px`;
    map.appendChild(el);
  });

  TOWER_SPOTS.forEach((s, i) => {
    const el = document.createElement('div');
    el.className = 'tower-spot';
    if (mapKey === 'urbanistic_road') el.classList.add('urban-spot');
    el.dataset.id = i;
    el.style.left = `${s.x}px`; el.style.top = `${s.y}px`;
    el.style.width = `${s.w}px`; el.style.height = `${s.h}px`;
    map.appendChild(el);
    gameState.towerSpots.push({ occupied: false, x: s.x + 40, y: s.y + 40 });
  });

  // Cambiar la base visualmente si es Urbanistic Road
  const allyBase = document.getElementById('ally-base');
  const enemyBase = document.getElementById('forest-base');
  
  if (mapKey === 'urbanistic_road') {
    map.classList.add('urban-map');
  } else {
    map.classList.remove('urban-map');
  }

  if (allyBase) {
    if (mapKey === 'urbanistic_road') {
      allyBase.classList.add('casino-base');
      allyBase.title = "Base aliada: Gambling Gaming Casino";
      if (enemyBase) {
        enemyBase.classList.add('tunnel-base');
        enemyBase.textContent = '';
      }
    } else {
      allyBase.classList.remove('casino-base');
      allyBase.title = "Base aliada: Edificio Gris";
      if (enemyBase) {
        enemyBase.classList.remove('tunnel-base');
        enemyBase.textContent = '🌲';
      }
    }
  }
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
  const optShowRanges = document.getElementById('opt-show-ranges');
  if (optShowRanges) optShowRanges.checked = !!gameState.settings.showRanges;
  const optOldAch = document.getElementById('opt-old-achievements');
  if (optOldAch) optOldAch.checked = !!gameState.settings.oldAchievements;
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
    t.el.style.backgroundImage = `url('${encodeURI(getTowerImage(t.type))}')`;
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
  const optShowRanges = document.getElementById('opt-show-ranges');
  if (optShowRanges) gameState.settings.showRanges = optShowRanges.checked;
  const optOldAch = document.getElementById('opt-old-achievements');
  if (optOldAch) {
    gameState.settings.oldAchievements = optOldAch.checked;
    updateAchievementsBtnUI();
  }

  const hitboxCheck = document.getElementById('opt-show-hitbox');
  if (hitboxCheck) showHitbox = hitboxCheck.checked;
  updateHitboxesVisibility();
  updateAllTowerRanges();

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

  const shopContainer = document.getElementById('tower-shop');
  if (!shopContainer) return;
  shopContainer.innerHTML = '';

  const allShopTowers = {
    'Glob': { type: 'Glob', unlocked: true },
    'Red_Glob': { type: 'Red_Glob', unlocked: true },
    'Soap_Glob': { type: 'Soap_Glob', unlocked: gameState.duckPassLevel >= 3, req: 'lvl3' },
    'Ducky_Glob': { type: 'Ducky_Glob', unlocked: gameState.duckPassLevel >= 6, req: 'lvl6' },
    'Comet_Glob': { type: 'Comet_Glob', unlocked: !!(TOWER_TYPES['Comet_Glob'] && TOWER_TYPES['Comet_Glob'].unlocked), req: 'shop' },
    'Old_Glob': { type: 'Old_Glob', unlocked: !!(TOWER_TYPES['Old_Glob'] && TOWER_TYPES['Old_Glob'].unlocked), req: 'shop' },
    'Work_Bombot': { type: 'Work_Bombot', unlocked: !!(TOWER_TYPES['Work_Bombot'] && TOWER_TYPES['Work_Bombot'].unlocked), req: 'challenge' },
    'Worker_Glob': { type: 'Worker_Glob', unlocked: gameState.map === 'urbanistic_road' || gameState.duckPassLevel >= 15, req: 'urban' },
    'Balloon_Glob': { type: 'Balloon_Glob', unlocked: gameState.map === 'urbanistic_road' || gameState.duckPassLevel >= 20, req: 'urban' },
    'Streamer_Glob': { type: 'Streamer_Glob', unlocked: gameState.map === 'urbanistic_road' || gameState.duckPassLevel >= 25, req: 'urban' },
    'Bomb_Glob': { type: 'Bomb_Glob', unlocked: gameState.map === 'urbanistic_road' || gameState.duckPassLevel >= 30, req: 'urban' }
  };

  const shopTowers = (gameState.equippedTowers || ['Glob', 'Red_Glob']).map(t => allShopTowers[t]).filter(Boolean);

  shopTowers.forEach(item => {
    const type = item.type;
    const t = TOWER_TYPES[type];
    if (!t) return;

    const currentCount = getFamilyCount(type);
    const limit = gameState.towerLimits[type] || 3;
    const isFull = currentCount >= limit;
    const displayImg = getTowerImage(type);
    const name = translate(t.name);

    const btn = document.createElement('button');

    if (!item.unlocked) {
      btn.className = 'tower-item locked';
      let reqText = '';
      let unlockMsg = '';
      if (item.req === 'lvl3') { reqText = 'Lvl 3'; unlockMsg = currentLanguage === 'es' ? '🔒 Se desbloquea en Duck Pass Nivel 3' : '🔒 Unlocks at Duck Pass Level 3'; }
      else if (item.req === 'lvl6') { reqText = 'Lvl 6'; unlockMsg = currentLanguage === 'es' ? '🔒 Se desbloquea en Duck Pass Nivel 6' : '🔒 Unlocks at Duck Pass Level 6'; }
      else if (item.req === 'challenge') { reqText = (currentLanguage === 'es' ? 'DESAFÍO' : 'CHALLENGE'); unlockMsg = currentLanguage === 'es' ? '🔒 Desbloqueado al superar modo Anti-normal o Corrupto' : '🔒 Unlocked by beating Anti-normal or Corrupt mode'; }
      else if (item.req === 'shop') { reqText = (currentLanguage === 'es' ? 'TIENDA' : 'SHOP'); unlockMsg = currentLanguage === 'es' ? '🔒 Desbloquéalo en la Tienda Meta por PyCoins' : '🔒 Unlock it in the Meta Shop using PyCoins'; }
      else if (item.req === 'urban') { reqText = 'URBAN'; unlockMsg = currentLanguage === 'es' ? '🔒 Torres exclusivas del mapa Urbanistic Road' : '🔒 Towers exclusive to the Urbanistic Road map'; }

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
      btn.className = 'tower-item';
      btn.dataset.type = type;
      if (isFull) btn.classList.add('disabled');
      if (gameState.selectedTowerType === type) btn.classList.add('selected');

      btn.innerHTML = `
                <img src="${displayImg}" alt="${name}">
                <div style="display:flex; flex-direction:column; align-items:center;">
                  <span style="font-size:0.65rem;">💰${t.cost}</span>
                  <span style="font-size:0.55rem; color:#fff; background:rgba(0,0,0,0.5); padding:1px 4px; border-radius:4px; margin-top:2px;">${currentCount}/${limit}</span>
                </div>
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
          document.querySelectorAll('.tower-item').forEach(b => b.classList.remove('selected'));
          gameState.selectedTowerType = type;
          btn.classList.add('selected');
        }
      };
    }

    shopContainer.appendChild(btn);
  });


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

function updateAchievementsBtnUI() {
  const btn = document.getElementById('badges-toggle-btn');
  if (!btn) return;
  if (gameState.settings.oldAchievements) {
    btn.innerHTML = translate('btn_achievements');
    btn.classList.remove('encyclopedia-btn-yellow');
    btn.title = translate('btn_achievements').replace('🏆 ', '');
  } else {
    btn.innerHTML = translate('btn_encyclopedia');
    btn.classList.add('encyclopedia-btn-yellow');
    btn.title = translate('btn_encyclopedia').replace('📖 ', '');
  }
}

function openEncyclopedia() {
  const modal = document.getElementById('encyclopedia-modal');
  if (modal) {
    modal.style.display = 'flex';
    switchEncyclopediaTab('globs');
  }
}

function switchEncyclopediaTab(tab) {
  document.querySelectorAll('.encyclopedia-tab').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById('enc-tab-' + tab);
  if (activeBtn) activeBtn.classList.add('active');

  const body = document.getElementById('encyclopedia-body');
  if (!body) return;
  body.innerHTML = '';

  // Create split layout container
  const container = document.createElement('div');
  container.className = 'almanac-container';

  const grid = document.createElement('div');
  grid.className = 'almanac-grid';
  grid.id = 'almanac-grid';

  const details = document.createElement('div');
  details.className = 'meta-item almanac-details';
  details.id = 'almanac-details';

  container.appendChild(grid);
  container.appendChild(details);
  body.appendChild(container);

  let firstItem = null;

  if (tab === 'globs') {
    // Determine base towers: any tower that is NOT an evolution of another tower
    const allEvos = Object.values(TOWER_TYPES).map(t => t.evolution).filter(Boolean);
    const baseTowers = Object.keys(TOWER_TYPES).filter(type => !allEvos.includes(type));

    baseTowers.forEach(type => {
      const t = TOWER_TYPES[type];
      if (!firstItem) firstItem = type;
      const btn = document.createElement('div');
      btn.className = 'almanac-btn';
      btn.id = 'almanac-btn-' + type;
      btn.onclick = () => selectAlmanacItem(type, 'globs');
      btn.innerHTML = `<img src="${t.image}" title="${translate(t.name)}">`;
      grid.appendChild(btn);
    });
    selectAlmanacItem('Glob', 'globs');
  } else if (tab === 'enemies') {
    window.renderEnemiesSubTab = function(subTab) {
      grid.innerHTML = '';
      details.innerHTML = '';
      
      if (!subTab) {
        grid.style.display = 'flex';
        grid.style.gap = '20px';
        grid.style.justifyContent = 'center';
        grid.style.padding = '20px 0';
        details.style.display = 'none';
        
        grid.style.flexDirection = 'row';
        grid.style.flexWrap = 'wrap';
        grid.innerHTML = `
          <div class="enemy-category-card" onclick="renderEnemiesSubTab('pyces')" style="cursor:pointer; background-color:#9b59b6; border-radius:15px; border:2px solid #8e44ad; width:280px; height:90px; display:flex; flex-direction:row; align-items:center; justify-content:space-around; padding: 10px; box-shadow:0 4px 10px rgba(0,0,0,0.5); transition:transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 0 15px #ffd700';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 10px rgba(0,0,0,0.5)';">
            <img src="${IMAGE_PATHS.Pyce2 || 'img/Pyce2.png'}" alt="Pyces" style="width:60px; height:60px; image-rendering:pixelated; object-fit:contain;">
            <h3 style="color:white; font-size:22px; margin:0;">${translate('enc_tab_pyces')}</h3>
          </div>
          <div class="enemy-category-card" onclick="renderEnemiesSubTab('gambling')" style="cursor:pointer; background-color:#1a1a1f; border-radius:15px; border:2px solid #333; width:280px; height:90px; display:flex; flex-direction:row; align-items:center; justify-content:space-around; padding: 10px; box-shadow:0 4px 10px rgba(0,0,0,0.5); transition:transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 0 15px #3498db';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 10px rgba(0,0,0,0.5)';">
            <img src="${IMAGE_PATHS.BitY1 || 'img/BitY1.png'}" alt="Other Enemies" style="width:60px; height:60px; image-rendering:pixelated; object-fit:contain;">
            <h3 style="color:white; font-size:22px; margin:0;">${translate('enc_tab_other')}</h3>
          </div>
        `;
        return;
      }
      
      grid.style.display = '';
      grid.style.gap = '';
      grid.style.justifyContent = '';
      grid.style.padding = '';
      details.style.display = '';
      
      const backBtn = document.createElement('button');
      backBtn.className = 'meta-btn';
      backBtn.style.marginBottom = '15px';
      backBtn.style.gridColumn = '1 / -1';
      backBtn.innerText = '⬅ Volver';
      backBtn.onclick = () => renderEnemiesSubTab(null);
      grid.appendChild(backBtn);

      let firstItem = null;
      
      Object.keys(ENEMY_TYPES).forEach(type => {
        const e = ENEMY_TYPES[type];
        const isGambling = e.category === 'gambling';
        if (subTab === 'pyces' && isGambling) return;
        if (subTab === 'gambling' && !isGambling) return;
        if (subTab === 'gambling' && !['BitY1', 'ByteGB1', 'Fireflies', 'Arky', 'CrystArky', 'ArkyVoid', 'Spyware'].includes(type)) return;
        
        if (!firstItem) firstItem = type;
        const btn = document.createElement('div');
        btn.className = 'almanac-btn';
        let killed = gameState.pycesKilled[type] || 0;
        if (type.startsWith('Bit')) {
          killed = ['BitY1', 'BitB4', 'BitG2', 'BitP3'].reduce((sum, b) => sum + (gameState.pycesKilled[b] || 0), 0);
        } else if (type.startsWith('Byte')) {
          killed = ['ByteGB1', 'ByteYP2', 'BytePG3', 'ByteYB4'].reduce((sum, b) => sum + (gameState.pycesKilled[b] || 0), 0);
        }
        
        if (typeof getPyceKillTarget === 'function' && killed >= getPyceKillTarget(type)) {
          btn.style.boxShadow = '0 0 10px #ffd700';
          btn.style.borderColor = '#ffd700';
        }
        btn.id = 'almanac-btn-' + type;
        btn.onclick = () => selectAlmanacItem(type, 'enemies');
        btn.innerHTML = `<img src="${e.image}" title="${translate(e.name || type)}">`;
        grid.appendChild(btn);
      });
      if (firstItem) selectAlmanacItem(firstItem, 'enemies');
    };
    
    window.renderEnemiesSubTab(null);
  } else if (tab === 'emblemas') {
    Object.values(BADGES).forEach(b => {
      if (!firstItem) firstItem = b.key;
      const btn = document.createElement('div');
      btn.className = 'almanac-btn';
      btn.id = 'almanac-btn-' + b.key;
      btn.onclick = () => selectAlmanacItem(b.key, 'emblemas');
      if (!b.unlocked) btn.style.filter = 'grayscale(100%)';
      // Fallback for missing icon image: use a text span if it's emoji, or img if it's an image.
      // Badges use emojis right now in `icon`, so we render the emoji directly.
      btn.innerHTML = `<span style="font-size:24px;">${b.icon}</span>`;
      grid.appendChild(btn);
    });
    // Default selection for emblemas as requested: duckpass or first item
    selectAlmanacItem(firstItem, 'emblemas');
  }
}

function selectAlmanacItem(id, category) {
  // Update active button styling
  document.querySelectorAll('.almanac-btn').forEach(btn => btn.classList.remove('active'));
  const btn = document.getElementById('almanac-btn-' + id);
  if (btn) btn.classList.add('active');

  const details = document.getElementById('almanac-details');
  if (!details) return;

  if (category === 'globs') {
    const t = TOWER_TYPES[id];
    if (!t) return;

    // Find base tower to show full evolution tree
    let base = id;
    let parentFound = true;
    while (parentFound) {
      const parent = Object.keys(TOWER_TYPES).find(k => TOWER_TYPES[k].evolution === base);
      if (parent) base = parent;
      else parentFound = false;
    }

    let evosHTML = `<div class="evo-list" style="justify-content:center;">`;
    let curKey = base;
    let cur = TOWER_TYPES[base];
    let evoCount = 0;
    while (cur) {
      if (curKey !== base) evoCount++;
      const isSelected = curKey === id ? 'background: rgba(255,215,0,0.2); border: 1px solid #ffd700;' : 'cursor: pointer;';
      evosHTML += `
        <div class="evo-step" style="${isSelected}" onclick="selectAlmanacItem('${curKey}', 'globs')">
          <img src="${cur.image}" width="30" height="30">
          <div style="font-size: 0.7rem;">${translate(cur.name)}</div>
        </div>`;
      curKey = cur.evolution;
      cur = TOWER_TYPES[curKey];
    }
    evosHTML += `</div>`;

    let metaHTML = '';
    if (gameState.gtacks && gameState.gtacks[t.family]) {
      metaHTML += `<div style="color:#2ecc71; font-size:0.85rem; font-weight:bold; margin-top:10px;">${translate('almanac_gtack_active')}</div>`;
    }
    if (gameState.duckgrades && gameState.duckgrades['dg_' + t.family]) {
      metaHTML += `<div style="color:#ff9f43; font-size:0.85rem; font-weight:bold; margin-top:5px;">${translate('almanac_duckgrade_active')}</div>`;
    }

    details.innerHTML = `
      <img src="${t.image}" style="width:80px; height:80px; margin-bottom:10px;">
      <h3 style="font-size: 1.4rem;">${translate(t.name)}</h3>
      <p style="font-size:0.9rem;">${translate(t.desc)}</p>
      <div style="display:flex; justify-content:center; gap:15px; font-size:0.85rem; color:#ccc; margin-top:10px;">
        <span>${translate('almanac_damage')} ${t.damage}</span>
        <span>${translate('almanac_range')} ${t.range}</span>
        <span>${translate('almanac_speed')} ${t.speed}</span>
      </div>
      ${evoCount > 0 ? evosHTML : ''}
      ${metaHTML}
    `;
  } else if (category === 'enemies') {
    const e = ENEMY_TYPES[id];
    if (!e) return;

    const isBoss = e.boss;
    const isMimic = id === 'Mimic_Pyce' || id === 'Stupid_GoldPyce';
    let titleStyle = '';
    if (isMimic) titleStyle = 'color: #e84393; text-shadow: 0 0 8px rgba(232, 67, 147, 0.5);';
    else if (isBoss) titleStyle = 'color: #8e44ad; text-shadow: 0 0 8px rgba(142, 68, 173, 0.5);';

    let mechanicText = translate('mechanic_common');
    if (e.mechanic_key) mechanicText = translate(e.mechanic_key);
    else if (isMimic) mechanicText = translate('mechanic_mimic');
    else if (isBoss) mechanicText = translate('mechanic_boss');
    else if (e.health > 150) mechanicText = translate('mechanic_tank');
    else if (e.speed > 1.8) mechanicText = translate('mechanic_speed');
    else if (e.healer) mechanicText = translate('mechanic_support');
    else if (e.stunAbility) mechanicText = translate('mechanic_annoying');

    const target = typeof getPyceKillTarget === 'function' ? getPyceKillTarget(id) : 9999;
    let killed = gameState.pycesKilled[id] || 0;
    if (id.startsWith('Bit')) {
      killed = ['BitY1', 'BitB4', 'BitG2', 'BitP3'].reduce((sum, b) => sum + (gameState.pycesKilled[b] || 0), 0);
    } else if (id.startsWith('Byte')) {
      killed = ['ByteGB1', 'ByteYP2', 'BytePG3', 'ByteYB4'].reduce((sum, b) => sum + (gameState.pycesKilled[b] || 0), 0);
    }
    const isMaxed = killed >= target;
    const progressBg = isMaxed ? 'rgba(255, 215, 0, 0.3)' : 'rgba(0,0,0,0.3)';
    const barWidth = Math.min(100, (killed / target) * 100);

    let variantsHTML = '';
    if (id.startsWith('Bit') || id.startsWith('Byte') || id.startsWith('Spyware')) {
      let variants = [];
      if (id.startsWith('Bit')) variants = ['BitY1', 'BitB4', 'BitG2', 'BitP3'];
      else if (id.startsWith('Byte')) variants = ['ByteGB1', 'ByteYP2', 'BytePG3', 'ByteYB4'];
      else if (id.startsWith('Spyware')) variants = ['Spyware1', 'Spyware2', 'Spyware3'];

      variantsHTML = `<div class="evo-list" style="justify-content:center; margin-top: 15px;">`;
      variants.forEach(v => {
        const vi = ENEMY_TYPES[v] || { image: IMAGE_PATHS[v] };
        if (vi && vi.image) {
          variantsHTML += `
            <div class="evo-item" onclick="selectAlmanacItem('${v}', 'enemies')" style="cursor:pointer; ${v === id || (id === 'Spyware' && v === 'Spyware1') ? 'border: 2px solid #fff;' : 'opacity: 0.7;'} border-radius: 10px; margin: 0 5px;">
              <img src="${vi.image}" style="width:50px; height:50px; border-radius:10px;">
            </div>
          `;
        }
      });
      variantsHTML += `</div>`;
    }

    details.innerHTML = `
      <img src="${e.image}" style="width:100px; height:100px; margin-bottom:10px; ${isBoss ? 'transform:scale(1.2);' : ''}">
      <h3 style="font-size: 1.5rem; ${titleStyle}">${translate(e.name || id)}</h3>
      ${e.desc ? `<p style="font-size:0.9rem; margin-top:5px; margin-bottom:10px;">${translate(e.desc)}</p>` : ''}
      ${e.category === 'gambling' ? '' : `<p style="font-size:0.95rem; color:#ffd700; font-weight:bold; margin-top:5px;">⭐ ${mechanicText}</p>`}
      
      <div style="margin-top:15px; width:100%; max-width:300px; margin-left:auto; margin-right:auto; background:#222; border-radius:5px; padding:3px; position:relative;">
        <div style="width:${barWidth}%; height:15px; background:${isMaxed ? '#ffd700' : '#4caf50'}; border-radius:3px; transition: width 0.3s;"></div>
        <div style="position:absolute; width:100%; top:0; left:0; text-align:center; font-size:0.8rem; font-weight:bold; color:#fff; text-shadow:1px 1px 1px #000; line-height:15px;">
          ${killed} / ${target}
        </div>
      </div>

      <div style="display:flex; justify-content:center; gap:15px; font-size:0.9rem; color:#ddd; margin-top:15px; background: ${progressBg}; padding:10px; border-radius:10px;">
        <span>${translate('almanac_hp')} ${e.health}</span>
        <span>${translate('almanac_speed')} ${e.speed}</span>
        <span>${translate('almanac_reward')}${e.reward}</span>
      </div>
      
      ${variantsHTML}
    `;
  } else if (category === 'emblemas') {
    const badgeArr = Object.values(BADGES);
    const b = badgeArr.find(x => x.key === id);
    if (!b) return;

    const name = translate(`badge_${b.key}_name`);
    const desc = translate(`badge_${b.key}_desc`);
    let rewardText = "";
    if (b.reward.pycoins) rewardText += `💰+${b.reward.pycoins} `;
    if (b.reward.duckpass) rewardText += `🦆+${b.reward.duckpass} `;
    rewardText += `✨+${b.reward.xp}xp`;

    details.innerHTML = `
      <div style="font-size:80px; margin-bottom:10px; filter:${b.unlocked ? 'none' : 'grayscale(100%)'};">${b.icon}</div>
      <h3 style="font-size: 1.4rem;">${name}</h3>
      <p style="font-size:0.95rem;">${desc}</p>
      <div style="margin-top:15px; padding:10px; background:rgba(255,215,0,0.1); border:1px solid rgba(255,215,0,0.3); border-radius:10px;">
        <b style="color:#ffd700; font-size:0.9rem;">${translate('badge_reward_label')}${rewardText}</b>
      </div>
      ${b.unlocked ? `<div style="color:#2ecc71; margin-top:10px; font-weight:bold;">${translate('badge_unlocked')}</div>` : `<div style="color:#e74c3c; margin-top:10px; font-weight:bold;">${translate('badge_locked')}</div>`}
    `;
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
  }

  const loginLogo = document.getElementById('login-logo');
  if (loginLogo) {
    loginLogo.onclick = () => {
      gameState.logoClicks++;

      loginLogo.classList.remove('glitch-effect');
      void loginLogo.offsetWidth;
      loginLogo.classList.add('glitch-effect');

      if (gameState.logoClicks === 5) {
        showFloatingText(translate('easter_egg_warn_1'), window.innerWidth / 2, 100, '#ff9f43');
      } else if (gameState.logoClicks === 10) {
        showFloatingText(translate('easter_egg_warn_2'), window.innerWidth / 2, 100, '#e74c3c');
      } else if (gameState.logoClicks === 15) {
        gameState.antiNormalActive = true;
        document.querySelector('.login-box').classList.add('login-glitch-critical');
        showFloatingText(translate('easter_egg_corrupt'), window.innerWidth / 2, 100, '#000000');
        setTimeout(() => {
          document.querySelector('.login-box').classList.remove('login-glitch-critical');
        }, 1500);
      }
    };
  }

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

  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    const upgradeMenu = document.getElementById('tower-upgrade-menu');
    const isUpgradeOpen = upgradeMenu && upgradeMenu.style.display === 'flex';

    if (key === 'u') {
      if (isUpgradeOpen) {
        const evolveBtn = document.getElementById('evolve-btn');
        if (evolveBtn && !evolveBtn.disabled && evolveBtn.style.display !== 'none') {
          evolveBtn.click();
        }
      } else if (gameState.selectedTowerType) {
        const spot = gameState.towerSpots.find(s => !s.occupied && s.selected);
        if (spot) {
          placeTower(spot.id, gameState.selectedTowerType);
        }
      }
    } else if (key === 'c') {
      if (isUpgradeOpen) {
        closeUpgradeMenu();
      } else if (gameState.selectedTowerType) {
        cancelTowerSelection();
      }
    } else if (key === 'v') {
      if (isUpgradeOpen) {
        const sellBtn = document.getElementById('sell-btn');
        if (sellBtn && sellBtn.style.display !== 'none') {
          sellBtn.click();
        }
      }
    }
  });

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

  document.querySelectorAll('.mode-btn[data-mode]').forEach(btn => btn.onclick = () => selectMode(btn.dataset.mode));
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
      'GALAXIUM': { py: 200, dp: 200, msg: '200 PyCoins + 200 DuckPass' },
      'MAYJUNE_RELEASE': { py: 100, dp: 100, xp: 100, msg: '100 PyCoins + 100 DuckPass + 100 XP' },
      'DELAYED_RELEASE': { py: 200, dp: 150, msg: '200 PyCoins + 150 DuckPass' },
      'NITRODRAWS': { py: 50, dp: 25, msg: '50 PyCoins + 25 DuckPass' },
      'DREAMY_POYO': { py: 200, dp: 200, msg: '200 PyCoins + 200 DuckPass' },
      'SANTI_THEGOAT': { py: 150, msg: '150 PyCoins' },
      'FORGOTTEN': { py: 50, dp: 100, msg: '50 PyCoins + 100 DuckPass' },
      'HAL-IS-ALL': { py: 100, dp: 150, msg: '100 PyCoins + 150 DuckPass' },
      'COMUNITTY': { py: 50, dp: 100, msg: '50 PyCoins + 100 DuckPass' },
      'JUNE-JUME': { py: 75, dp: 120, msg: '75 PyCoins + 120 DuckPass' },
      'SWITCHEDGAMBLING': { py: 200, dp: 250, msg: '200 PyCoins + 250 DuckPass' }
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
      if (gameState.failedCodeAttempts >= 3) {
        const secretCodes = ['PINKWAVE', 'FORGOTTEN', 'HAL-IS-ALL', 'COMUNITTY', 'JUNE-JUME', 'SWITCHEDGAMBLING'];
        let randomCode = secretCodes[Math.floor(Math.random() * secretCodes.length)];
        if (gameState.lastCodeHint === randomCode) {
          randomCode = secretCodes[(secretCodes.indexOf(randomCode) + 1) % secretCodes.length];
        }
        gameState.lastCodeHint = randomCode;
        showMessage(translate('code_hint') + randomCode, 'error');
      } else {
        showMessage(translate('codeInvalid'), 'error');
      }
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
  if (shopBtn) shopBtn.onclick = () => { if (typeof openShop === 'function') openShop(); };

  const passBtn = document.getElementById('open-pass');
  if (passBtn) passBtn.onclick = () => { if (typeof openPass === 'function') openPass(); };

  const storyBtn = document.getElementById('open-story-logs');
  if (storyBtn) storyBtn.onclick = () => { openStoryLogs(); };

  const badgesBtn = document.getElementById('badges-toggle-btn');
  if (badgesBtn) badgesBtn.onclick = () => {
    if (gameState.settings.oldAchievements) {
      toggleBadgesPanel();
    } else {
      openEncyclopedia();
    }
  };

  const openEncBtn = document.getElementById('open-encyclopedia-btn');
  if (openEncBtn) openEncBtn.onclick = () => {
    toggleBadgesPanel(); // close floating panel
    openEncyclopedia();
  };

  document.querySelectorAll('.modal .modal-close, .modal .close-btn').forEach(btn => {
    btn.onclick = (e) => {
      const modal = btn.closest('.modal');
      if (!modal) return;
      modal.style.display = 'none';
      if (!gameState.modeConfirmed) {
        const ms = document.getElementById('mode-selection');
        if (ms) ms.style.display = 'flex';
      }
    };
  });

  const newMapText = document.getElementById('new-map-easter-egg');
  if (newMapText) {
    let clickCount = 0;
    newMapText.onclick = () => {
      clickCount++;
      newMapText.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
      newMapText.style.filter = `hue-rotate(${Math.random() * 360}deg)`;
      setTimeout(() => {
        newMapText.style.transform = 'none';
        newMapText.style.filter = 'none';
      }, 100);

      if (clickCount === 5) {
        gameState.duckPassCurrency += 250;
        showMessage("+250 DuckPass", "success");
        updateMetaUI();
        saveProgress();
      } else if (clickCount > 5 && (clickCount - 5) % 10 === 0) {
        gameState.pycoins += 20;
        showMessage("+20 PyCoins", "success");
        updateMetaUI();
        saveProgress();
      }
    };

    setInterval(() => {
      if (gameState.unlockedInfinite && document.getElementById('mode-selection').style.display !== 'none') {
        if (newMapText.style.display === 'none' && !newMapText.dataset.timerStarted) {
          newMapText.dataset.timerStarted = 'true';
          setTimeout(() => {
            if (document.getElementById('mode-selection').style.display !== 'none') {
              newMapText.style.display = 'block';
            }
          }, 5000); // Esperar 5s en la pantalla
        }
      } else {
        newMapText.style.display = 'none';
        delete newMapText.dataset.timerStarted;
        clickCount = 0; // Reiniciar contador si sale
      }
    }, 1000);
  }

  window.addEventListener('resize', applyScale);
}

function saveGameSnapshot() {
  gameState._snapshot = {
    mode: gameState.mode,
    modeConfirmed: gameState.modeConfirmed,
    wave: gameState.wave,
    waveActive: gameState.waveActive,
    spawningActive: gameState.spawningActive,
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
  gameState.spawningActive = !!snap.spawningActive;
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
  const mapScreen = document.getElementById('map-selection');
  if (!gameState.modeConfirmed && document.getElementById('login-screen').style.display === 'none') {
    if (!gameState.map) {
      mapScreen.style.display = 'flex';
    } else {
      modeScreen.style.display = 'flex';
    }
  }
}

function backToModes() {
  closeModal('shop-modal');
  closeModal('pass-modal');
  closeModal('story-logs-modal');
  if (!gameState.map) {
    document.getElementById('map-selection').style.display = 'flex';
  } else {
    document.getElementById('mode-selection').style.display = 'flex';
  }
}

const GAME_DESIGN_W = 1000;
const GAME_DESIGN_H = 600;

function applyScale() {
  const area = document.getElementById('game-area');
  const wrapper = document.querySelector('.game-scale-wrapper');
  if (!area || !wrapper) return;

  // Measure actual heights of surrounding elements
  const header = document.getElementById('game-header');
  const ui = document.getElementById('game-ui');
  const shop = document.getElementById('tower-shop');
  const footer = document.querySelector('.game-credit-footer');

  const headerH = header ? header.offsetHeight : 0;
  const uiH = ui ? ui.offsetHeight : 0;
  const shopH = shop ? shop.offsetHeight : 0;
  const footerH = footer ? footer.offsetHeight : 0;

  const usedH = headerH + uiH + shopH + footerH + 30; // 30px breathing room

  const availW = window.innerWidth - 20;
  const availH = Math.max(100, window.innerHeight - usedH);

  const scaleW = availW / GAME_DESIGN_W;
  const scaleH = availH / GAME_DESIGN_H;

  const scale = Math.max(0.15, Math.min(scaleW, scaleH, 1.0));

  area.style.transformOrigin = 'top center';
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
    if (gameState.duckPassLevel <= 200) {
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
  if (t === 'Work_Bombot' || t === 'Special') return !!(TOWER_TYPES['Work_Bombot'] && TOWER_TYPES['Work_Bombot'].unlocked);
  if (t === 'Old_Glob' || t === 'Pyce_Glob' || t === 'Grey') return !!(TOWER_TYPES['Old_Glob'] && TOWER_TYPES['Old_Glob'].unlocked);
  if (t === 'Comet_Glob') return !!(TOWER_TYPES['Comet_Glob'] && TOWER_TYPES['Comet_Glob'].unlocked);
  // Urbanistic Road families
  if (t === 'Worker_Glob') return gameState.map === 'urbanistic_road' || gameState.duckPassLevel >= 15;
  if (t === 'Balloon_Glob' || t === 'White') return gameState.map === 'urbanistic_road' || gameState.duckPassLevel >= 20;
  if (t === 'Streamer_Glob' || t === 'Pink') return gameState.map === 'urbanistic_road' || gameState.duckPassLevel >= 25;
  if (t === 'Bomb_Glob' || t === 'IEx') return gameState.map === 'urbanistic_road' || gameState.duckPassLevel >= 30;
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
      <button class="shop-tab-btn ${currentShopTab === 'equip' ? 'active' : ''}" onclick="switchShopTab('equip')">${translate('shop_equip')}</button>
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
      
      { id: 'meta_damage', name: 'upgrade_damage_name', desc: 'upgrade_damage_desc', cost: 15, type: 'duckpass', level: gameState.metaDamageLevel, max: 5 }
    ];
    const MAX_LIMITS = {
      'Glob': 8, 'Red_Glob': 11, 'Soap_Glob': 5, 'Ducky_Glob': 8,
      'Comet_Glob': 6, 'Old_Glob': 4, 'Work_Bombot': 2, 'Worker_Glob': 4
    };

    ['Glob', 'Red_Glob', 'Soap_Glob', 'Ducky_Glob', 'Comet_Glob', 'Old_Glob', 'Work_Bombot', 'Worker_Glob'].forEach(t => {
      const isUnlocked = isTowerOwned(t);
      const maxLim = MAX_LIMITS[t] || 10;

      if (isUnlocked && gameState.towerLimits[t] < maxLim) {
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
      { id: 'dg_Ducky_Glob', name: 'duckgrade_duck_name', desc: 'duckgrade_duck_desc', cost: 15, family: 'Ducky_Glob' },
      { id: 'dg_IEx', name: 'duckgrade_iex_name', desc: 'duckgrade_iex_desc', cost: 20, family: 'IEx' },
      { id: 'dg_Worker_Glob', name: 'duckgrade_worker_name', desc: 'duckgrade_worker_desc', cost: 25, family: 'Worker_Glob' }
    ];

    const filteredDgs = dgs.filter(u => {
      if (u.id === 'dg_Glob' || u.id === 'dg_Red_Glob') return true;
      if (u.id === 'dg_Soap_Glob') return isTowerOwned('Soap_Glob');
      if (u.id === 'dg_Comet_Glob') return isTowerOwned('Comet_Glob');
      if (u.id === 'dg_Pyce_Glob' || u.id === 'dg_Old_Glob') return isTowerOwned('Old_Glob');
      if (u.id === 'dg_Work_Bombot') return isTowerOwned('Work_Bombot');
      if (u.id === 'dg_Ducky_Glob') return isTowerOwned('Ducky_Glob');
      if (u.id === 'dg_IEx') return isTowerOwned('Bomb_Glob');
      if (u.id === 'dg_Worker_Glob') return isTowerOwned('Worker_Glob');
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
      { id: 'Glob', name: translate('gtack_green_name'), desc: translate('gtack_green_desc'), pyCost: 750, dpCost: 250 },
      { id: 'Red_Glob', name: translate('gtack_red_name'), desc: translate('gtack_red_desc'), pyCost: 550, dpCost: 180 },
      { id: 'Soap_Glob', name: translate('gtack_blue_name'), desc: translate('gtack_blue_desc'), pyCost: 580, dpCost: 190 },
      { id: 'Ducky_Glob', name: translate('gtack_yellow_name'), desc: translate('gtack_yellow_desc'), pyCost: 650, dpCost: 210 },
      { id: 'Comet_Glob', name: translate('gtack_black_name'), desc: translate('gtack_black_desc'), pyCost: 780, dpCost: 260 },
      { id: 'Old_Glob', name: translate('gtack_grey_name'), desc: translate('gtack_grey_desc'), pyCost: 520, dpCost: 170 },
      { id: 'Bomb_Glob', name: translate('gtack_iex_name'), desc: translate('gtack_iex_desc'), pyCost: 600, dpCost: 200 },
      { id: 'Worker_Glob', name: translate('gtack_worker_name'), desc: translate('gtack_worker_desc'), pyCost: 600, dpCost: 200 }
    ];

    const gtacksLocked = gameState.duckPassLevel < 50;
    const filtered = gtacksData.filter(g => isTowerOwned(g.id));

    filtered.forEach(u => {
      const isUnlocked = gameState.gtacks[u.id];
      const el = document.createElement('div');
      el.className = `meta-item ${isUnlocked ? 'unlocked' : ''} ${gtacksLocked ? 'level-locked' : ''}`;

      let buttonHTML = '';
      if (gtacksLocked) {
        buttonHTML = `<button class="meta-buy-btn" disabled style="background: #95a5a6; border: 1px dashed #7f8c8d; cursor: not-allowed; color: #fff;">${translate('gtack_req_lvl')}</button>`;
      } else {
        buttonHTML = `<button class="meta-buy-btn" ${isUnlocked || gameState.pycoins < u.pyCost || gameState.duckPassCurrency < u.dpCost ? 'disabled' : ''} 
          onclick="buyGTack('${u.id}', ${u.pyCost}, ${u.dpCost})">${isUnlocked ? translate('gtack_active') : translate('gtack_buy')}</button>`;
      }

      el.innerHTML = `<h3>${u.name}</h3><p>${u.desc}</p>
        <div class="cost">${isUnlocked ? '✅' : `<img src="img/Tokens/PyCoin.png" width="16"> ${u.pyCost} + <img src="img/Tokens/DuckPass.png" width="16"> ${u.dpCost}`}</div>
        ${buttonHTML}`;
      container.appendChild(el);
    });
  } else if (currentShopTab === 'equip') {
    drawEquipShop(container);
  } else if (currentShopTab === 'skins') {
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

    if (gameState.cheatedModeActive) {
      const oldBtn = document.getElementById('admin-playtest-btn');
      if (oldBtn) oldBtn.remove();

      const secretBtn = document.createElement('button');
      secretBtn.id = 'admin-playtest-btn';
      secretBtn.style.marginTop = '20px';
      secretBtn.style.alignSelf = 'flex-end';
      secretBtn.style.width = '20px';
      secretBtn.style.height = '20px';
      secretBtn.style.opacity = '0.4';
      secretBtn.style.backgroundColor = '#ff69b4';
      secretBtn.style.border = 'none';
      secretBtn.style.borderRadius = '50%';
      secretBtn.style.cursor = 'pointer';
      secretBtn.style.display = 'flex';
      secretBtn.style.alignItems = 'center';
      secretBtn.style.justifyContent = 'center';
      secretBtn.style.fontSize = '10px';
      secretBtn.textContent = '🐛';
      secretBtn.title = 'Admin: Unlock All Towers';
      secretBtn.onclick = () => {
        const ALL_TOWERS = ['Soap_Glob', 'Ducky_Glob', 'Comet_Glob', 'Old_Glob', 'Work_Bombot', 'Pyce_Glob', 'Balloon_Glob', 'Streamer_Glob', 'Bomb_Glob'];
        ALL_TOWERS.forEach(t => {
          if (TOWER_TYPES[t]) TOWER_TYPES[t].unlocked = true;
        });
        showMessage("👑 MODO ADMIN: Todas las torres desbloqueadas para Playtesting", "success");
        drawTowerShop();
      };

      const spacer = document.createElement('div');
      spacer.style.width = '100%';
      spacer.style.display = 'flex';
      spacer.style.justifyContent = 'flex-end';
      spacer.appendChild(secretBtn);

      container.appendChild(spacer);
    }
  }
}

window.toggleEquipTower = function(type) {
  if (!gameState.equippedTowers) gameState.equippedTowers = [];
  const idx = gameState.equippedTowers.indexOf(type);
  if (idx !== -1) {
    gameState.equippedTowers.splice(idx, 1);
    // Can't go into battle empty-handed!
    if (gameState.equippedTowers.length === 0) {
      gameState.equippedTowers = ['Glob'];
      const msg = currentLanguage === 'es'
        ? '¡No puedes ir al campo de batalla sin ninguna torre! 🟢 Glob equipado por defecto.'
        : "You can't go into battle with no towers! 🟢 Glob equipped by default.";
      showMessage(msg, 'warning');
    }
  } else {
    if (gameState.equippedTowers.length >= 5) {
      showMessage(currentLanguage === 'es' ? 'Solo puedes equipar hasta 5 torres.' : 'You can only equip up to 5 towers.', 'warning');
      return;
    }
    gameState.equippedTowers.push(type);
  }
  saveProgress();
  drawShop();
  drawTowerShop();
};

function drawEquipShop(container) {
  // ── Loadout Banner — mismo formato que la barra de currency ──
  let slotsHTML = '';
  for (let i = 0; i < 5; i++) {
    if (i < gameState.equippedTowers.length) {
      const t = gameState.equippedTowers[i];
      slotsHTML += `<div style="width:36px;height:36px;flex-shrink:0;background:url('${encodeURI(getTowerImage(t))}') center/cover;border:2px solid #2ecc71;border-radius:6px;box-shadow:0 0 5px rgba(46,204,113,0.4);" title="${translate(TOWER_TYPES[t] ? TOWER_TYPES[t].name : t)}"></div>`;
    } else {
      slotsHTML += `<div style="width:36px;height:36px;flex-shrink:0;background:rgba(255,255,255,0.04);border:2px dashed #4a5568;border-radius:6px;"></div>`;
    }
  }

  const equipHeader = document.createElement('div');
  equipHeader.className = 'shop-balance';
  equipHeader.style.cssText += 'grid-column: 1 / -1;';
  equipHeader.innerHTML = `
    <div class="balance-item">
      <span style="font-size:1.2rem;">🎒</span>
      <span>Loadout <strong style="color:#2ecc71;">${gameState.equippedTowers.length}/5</strong></span>
    </div>
    <div class="balance-item" style="gap:6px;">
      ${slotsHTML}
    </div>
  `;
  container.appendChild(equipHeader);

  const shopTowers = [
    { type: 'Glob', unlocked: true },
    { type: 'Red_Glob', unlocked: true },
    { type: 'Soap_Glob', unlocked: gameState.duckPassLevel >= 3, req: 'lvl3' },
    { type: 'Ducky_Glob', unlocked: gameState.duckPassLevel >= 6, req: 'lvl6' },
    { type: 'Comet_Glob', unlocked: !!(TOWER_TYPES['Comet_Glob'] && TOWER_TYPES['Comet_Glob'].unlocked), req: 'shop' },
    { type: 'Old_Glob', unlocked: !!(TOWER_TYPES['Old_Glob'] && TOWER_TYPES['Old_Glob'].unlocked), req: 'shop' },
    { type: 'Work_Bombot', unlocked: !!(TOWER_TYPES['Work_Bombot'] && TOWER_TYPES['Work_Bombot'].unlocked), req: 'challenge' },
    { type: 'Worker_Glob', unlocked: gameState.map === 'urbanistic_road' || gameState.duckPassLevel >= 15, req: 'urban' },
    { type: 'Balloon_Glob', unlocked: gameState.map === 'urbanistic_road' || gameState.duckPassLevel >= 20, req: 'urban' },
    { type: 'Streamer_Glob', unlocked: gameState.map === 'urbanistic_road' || gameState.duckPassLevel >= 25, req: 'urban' },
    { type: 'Bomb_Glob', unlocked: gameState.map === 'urbanistic_road' || gameState.duckPassLevel >= 30, req: 'urban' }
  ];

  shopTowers.forEach(item => {
    const type = item.type;
    const t = TOWER_TYPES[type];
    if (!t) return;
    
    const isEquipped = gameState.equippedTowers.includes(type);
    
    const el = document.createElement('div');
    el.className = 'meta-item ' + (item.unlocked ? 'unlocked' : 'locked');
    
    let btnHTML = '';
    
    if (item.unlocked) {
      if (isEquipped) {
        btnHTML = `<button class="meta-buy-btn" style="background:#e74c3c;" onclick="toggleEquipTower('${type}')">Desequipar</button>`;
      } else {
        btnHTML = `<button class="meta-buy-btn" style="background:#2ecc71;" onclick="toggleEquipTower('${type}')" ${gameState.equippedTowers.length >= 5 ? 'disabled' : ''}>Equipar</button>`;
      }
    } else {
      let reqText = '';
      if (item.req === 'lvl3') reqText = 'Req: Pass Lvl 3';
      else if (item.req === 'lvl6') reqText = 'Req: Pass Lvl 6';
      else if (item.req === 'challenge') reqText = 'Desafío/Challenge';
      else if (item.req === 'shop') reqText = 'Tienda/Shop';
      else if (item.req === 'urban') reqText = 'Urban / Pass';
      btnHTML = `<button class="meta-buy-btn" disabled style="background:#95a5a6;">🔒 ${reqText}</button>`;
    }
    
    el.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <div style="width:40px; height:40px; background:url('${encodeURI(getTowerImage(type))}') center/cover; border-radius:5px; filter:${item.unlocked ? 'none' : 'grayscale(1)'};"></div>
        <div style="flex-grow:1;">
          <h3 style="margin:0;">${translate(t.name)}</h3>
          <p style="margin:0; font-size:0.8em; line-height: 1.2;">${translate(t.desc) ? translate(t.desc).substring(0, 50) + '...' : ''}</p>
        </div>
      </div>
      <div style="margin-top:10px;">${btnHTML}</div>
    `;
    
    container.appendChild(el);
  });
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
  gameState.towers.forEach(t => { if (t.family === family || family === 'Global') { t.el.style.backgroundImage = `url('${encodeURI(getTowerImage(t.type))}')`; applyTowerEffects(t.el, t.type); } });
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
  [...SKINS_DATA['Global']].sort((a, b) => (a.level || 999) - (b.level || 999)).forEach(skin => {
    const unlocked = skin.id === 'pyce_morph' ? gameState.unlockedSkins.includes(skin.id) : gameState.duckPassLevel >= skin.level;
    const equipped = gameState.equippedSkins['Global'] === skin.id;
    const el = document.createElement('div');
    el.className = `meta-item ${unlocked ? 'unlocked' : 'locked'}`;
    let btnHTML = "";
    if (unlocked) {
      btnHTML = equipped ? `<button disabled>${translate('equipped')}</button>` : `<button onclick="equipSkin('Global', '${skin.id}')">${translate('equip_btn')}</button>`;
    } else {
      if (skin.id === 'pyce_morph') {
        btnHTML = `<button disabled>${currentLanguage === 'es' ? 'Completa la Enciclopedia para obtenerlos a todos' : 'Complete the Encyclopedia to get them all'}</button>`;
      } else {
        btnHTML = `<button disabled>${translate('req_level', { level: skin.level })}</button>`;
      }
    }

    el.innerHTML = `<div class="milestone-tag">${skin.buff ? translate('upgrade') : translate('milestone')}</div><h3>${translate(skin.name)}</h3><p>${translate(skin.desc)}</p>
      ${skin.buff && unlocked ? `<b>${translate('active')}</b>` : btnHTML}`;
    container.appendChild(el);
  });
}

function placeTower(spotId, type) {
  const tCfg = TOWER_TYPES[type];
  const family = tCfg.family || type;
  const currentCount = getFamilyCount(type);
  const limit = gameState.towerLimits[type] || 3;
  if (currentCount >= limit) return showMessage(translate('limit_reached', { name: translate('tower_' + type + '_name'), limit: limit }), 'error');

  const spot = gameState.towerSpots[spotId];
  let discount = 0;
  gameState.towers.forEach(auraTower => {
    if (auraTower.family === 'Pink') {
      if (Math.hypot(spot.x - auraTower.x, spot.y - auraTower.y) <= auraTower.range) {
        const d = auraTower.type === 'Youtuber_Glob' ? 0.3 : (auraTower.type === 'Gamer_Glob' ? 0.2 : 0.1);
        discount = Math.max(discount, d);
      }
    }
  });
  const cost = Math.floor(tCfg.cost * (1 - discount));
  if (gameState.globetines < cost) return showMessage(translate('notEnoughMoney'), 'error');

  const el = document.createElement('div');
  el.className = 'tower'; el.style.left = `${spot.x}px`; el.style.top = `${spot.y}px`;
  el.style.backgroundImage = `url('${encodeURI(getTowerImage(type))}')`;
  // Fallback: si la imagen falla, usar color de fondo visible
  el.onerror = function() { el.style.backgroundColor = '#9b59b6'; el.style.backgroundImage = 'none'; };
  applyTowerEffects(el, type);
  document.getElementById('map').appendChild(el);

  const tower = { ...tCfg, type, x: spot.x, y: spot.y, el, cooldown: 0, spotId, stunned: 0, moneyTimer: 0 };
  tower.damage *= gameState.towerBuffs.damage;
  tower.range += gameState.towerBuffs.range;
  tower.speed *= gameState.towerBuffs.speed;

  el.onclick = (e) => { e.stopPropagation(); selectTower(tower); };
  gameState.towers.push(tower);
  gameState.globetines -= cost;
  gameState.towerCounts[type] = (gameState.towerCounts[type] || 0) + 1;
  gameState.globsPlaced[type] = (gameState.globsPlaced[type] || 0) + 1;
  spot.occupied = true;
  if (!tCfg.evolution && !gameState.maxedFamilies.includes(family)) {
    gameState.maxedFamilies.push(family);
  }

  recalculateAuras();
  if (typeof checkEncyclopediaMaster === 'function') checkEncyclopediaMaster();
  updateUI(); drawTowerShop();
  updateAllTowerRanges();
}

function selectTower(t) {
  gameState.selectedTower = t;
  const panel = document.getElementById('evolve-panel');
  panel.style.display = 'flex';

  panel.classList.remove('buff-white', 'buff-pink', 'buff-both');
  if (t.hasWhiteBuff && t.hasPinkBuff) panel.classList.add('buff-both');
  else if (t.hasWhiteBuff) panel.classList.add('buff-white');
  else if (t.hasPinkBuff) panel.classList.add('buff-pink');

  document.getElementById('tower-name').textContent = getTowerName(t);
  // Truncate description: strip HTML tags and limit to 90 chars
  const rawDesc = translate(t.desc) || '';
  const plainDesc = rawDesc.replace(/<[^>]*>/g, '').trim();
  const shortDesc = plainDesc.length > 90 ? plainDesc.substring(0, 90) + '...' : plainDesc;
  document.getElementById('tower-desc').textContent = shortDesc;
  updateEvolveButtons(t);
  drawRangePreview(t.x, t.y, t.range);

  requestAnimationFrame(() => {
    let leftPos = t.x - 140;
    if (leftPos < 10) leftPos = 10;
    if (leftPos + 280 > 950) leftPos = 950 - 280;
    panel.style.left = `${leftPos}px`;

    if (t.y < 300) {
      panel.style.top = `${t.y + 50}px`;
    } else {
      panel.style.top = `${t.y - panel.offsetHeight - 50}px`;
    }
  });
}

function getGTackName(family) {
  switch (family) {
    case 'Glob': return 'Frenesí ⚡';
    case 'Red_Glob': return 'Sobrecarga 🔥';
    case 'Soap_Glob': return 'Impacto Relámpago ⚡';
    case 'Ducky_Glob': return 'Lluvia Financiera 💰';
    case 'Comet_Glob': return 'Contagio 💀';
    case 'Grey': return 'Ampliación 📡';
    case 'IEx': return 'Detonación 💥';
    case 'Worker_Glob': return 'Actividad Policial 🚨';
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
  } else if (t.family === 'IEx') {
    gameState.towers.forEach(iex => {
      if (iex.family === 'IEx') {
        iex.forceExplode = true;
      }
    });
    gameState.towers.forEach(otherTower => {
      if (otherTower.family !== 'IEx' && Math.hypot(otherTower.x - t.x, otherTower.y - t.y) <= t.range * 2) {
        otherTower.iexBuffTimer = 5; 
      }
    });
    showEffect(t.x, t.y - 25, "CHAIN DETONATION! 💥", "#ff4444");
  } else if (t.family === 'Worker_Glob') {
    gameState.towers.forEach(wt => {
      if (wt.family === 'Worker_Glob') {
        wt.trapSpeedBuffTimer = 10; 
      }
    });
    showEffect(t.x, t.y - 25, "POLICE ACTIVITY! 🚨", "#3498db");
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
      const cost = Math.floor(next.cost * (1 - (t.pinkDiscount || 0)));
      if (gameState.globetines < cost) btn.disabled = true;
      const nextName = getTowerName({ ...next, type: t.evolution, family: t.family });
      btn.innerHTML = `${translate('evolve_to', { name: nextName })} <div class="cost-tag"><img src="img/Tokens/Globetin.png" width="14"> ${cost}</div>`;
      btn.onclick = () => evolveTower(t, t.evolution, cost);
      container.appendChild(btn);
    } else {
      const familyKey = t.family === 'Grey' ? 'Old_Glob' : t.family;
      const hasGTackUnlocked = gameState.gtacks[familyKey];

      const evolveTitle = document.querySelector('#evolve-panel h3');
      if (evolveTitle) evolveTitle.textContent = hasGTackUnlocked ? 'G-Tack (Habilidad)' : translate('max_reached');

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
        el.style.textAlign = 'center';
        el.style.color = '#ffd700';
        el.style.fontWeight = 'bold';
        el.textContent = translate('max_reached');
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

  requestAnimationFrame(() => {
    const panel = document.getElementById('evolve-panel');
    if (panel && panel.style.display !== 'none' && gameState.selectedTower === t) {
      let leftPos = t.x - 140;
      if (leftPos < 10) leftPos = 10;
      if (leftPos + 280 > 950) leftPos = 950 - 280;
      panel.style.left = `${leftPos}px`;

      if (t.y < 300) {
        panel.style.top = `${t.y + 50}px`;
      } else {
        panel.style.top = `${t.y - panel.offsetHeight - 50}px`;
      }
    }
  });
}

function evolveTower(tower, nextType, costOverride = null) {
  const next = TOWER_TYPES[nextType];
  const cost = costOverride !== null ? costOverride : next.cost;
  if (gameState.globetines < cost) return;
  gameState.globetines -= cost;
  if (tower.type !== nextType) { gameState.towerCounts[tower.type]--; gameState.towerCounts[nextType] = (gameState.towerCounts[nextType] || 0) + 1; }
  tower.type = nextType;
  tower.evolution = next.evolution;
  Object.assign(tower, next);
  tower.damage *= gameState.towerBuffs.damage; tower.range += gameState.towerBuffs.range; tower.speed *= gameState.towerBuffs.speed;
  tower.el.style.backgroundImage = `url('${encodeURI(getTowerImage(nextType))}')`; applyTowerEffects(tower.el, nextType);
  if (!next.evolution) {
    unlockBadge('evolution');
    if (!gameState.maxedFamilies.includes(tower.family)) {
      gameState.maxedFamilies.push(tower.family);
    }
  }

  recalculateAuras();
  if (typeof checkEncyclopediaMaster === 'function') checkEncyclopediaMaster();
  updateAllTowerRanges();
  selectTower(tower); updateUI(); drawTowerShop();
}

function sellTower(tower) {
  gameState.globetines += Math.floor(tower.cost * 0.7);
  // Badge: mimicRevenge (Traición) - sell a max level tower
  const tCfg = TOWER_TYPES[tower.type];
  if (tCfg && !tCfg.evolution) {
    unlockBadge('mimicRevenge');
  }
  tower.el.remove();
  if (tower.rangeEl) tower.rangeEl.remove();
  gameState.towerCounts[tower.type]--;
  gameState.towerSpots[tower.spotId].occupied = false;
  gameState.towers.splice(gameState.towers.indexOf(tower), 1);
  recalculateAuras();
  deselectTower(); updateUI(); drawTowerShop();
}

function deselectTower() { gameState.selectedTower = null; document.getElementById('evolve-panel').style.display = 'none'; const p = document.getElementById('range-preview'); if (p) p.remove(); }

function recalculateAuras() {
  gameState.towers.forEach(t => {
    const tCfg = TOWER_TYPES[t.type];
    t.damage = tCfg.damage * gameState.towerBuffs.damage;
    t.range = tCfg.range + gameState.towerBuffs.range;
    t.speed = tCfg.speed * gameState.towerBuffs.speed;
    t.hasWhiteBuff = false;
    t.hasPinkBuff = false;
    t.pinkDiscount = 0;
    t.bestWhiteAura = { rangeInc: 0, speedDec: 1 };
    t.bestPinkAura = { dmgDec: 1, discount: 0 };
  });

  gameState.towers.forEach(auraTower => {
    if (auraTower.family === 'White') {
      const buffRange = auraTower.range;
      const rangeInc = auraTower.type === 'Alien_Glob' ? 60 : (auraTower.type === 'Heliglob' ? 40 : 20);
      const speedDec = auraTower.type === 'Alien_Glob' ? 0.7 : (auraTower.type === 'Heliglob' ? 0.8 : 0.9);

      gameState.towers.forEach(t => {
        if (t !== auraTower && Math.hypot(t.x - auraTower.x, t.y - auraTower.y) <= buffRange) {
          t.hasWhiteBuff = true;
          if (rangeInc > t.bestWhiteAura.rangeInc) {
            t.bestWhiteAura.rangeInc = rangeInc;
            t.bestWhiteAura.speedDec = speedDec;
          }
        }
      });
    } else if (auraTower.family === 'Pink') {
      const buffRange = auraTower.range;
      const discount = auraTower.type === 'Youtuber_Glob' ? 0.3 : (auraTower.type === 'Gamer_Glob' ? 0.2 : 0.1);
      const dmgDec = auraTower.type === 'Youtuber_Glob' ? 0.7 : (auraTower.type === 'Gamer_Glob' ? 0.8 : 0.9);

      gameState.towers.forEach(t => {
        if (t !== auraTower && Math.hypot(t.x - auraTower.x, t.y - auraTower.y) <= buffRange) {
          t.hasPinkBuff = true;
          t.pinkDiscount = Math.max(t.pinkDiscount, discount);
          if (dmgDec < t.bestPinkAura.dmgDec) {
            t.bestPinkAura.dmgDec = dmgDec;
          }
        }
      });
    }
  });

  gameState.towers.forEach(t => {
    if (t.hasWhiteBuff) {
      t.range += t.bestWhiteAura.rangeInc;
      t.speed *= t.bestWhiteAura.speedDec;
    }
    if (t.hasPinkBuff) {
      t.damage *= t.bestPinkAura.dmgDec;
    }
  });

  if (gameState.selectedTower) {
    selectTower(gameState.selectedTower);
  }
}

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
  gameState.spawningActive = true;
  gameState.wave = (gameState.wave || 0) + 1;
  gameState.roundKills = [];
  gameState.roundIExExplosions = 0;

  if (gameState.wave === 1) {
    if (gameState.mode === 'corrupto' || gameState.mode === 'antiNormal') {
      setTimeout(() => {
        const d = NARRATOR_DATA.bombot[currentLanguage].modes[gameState.mode];
        if (d) showNarratorMsg('bombot', NARRATOR_DATA.bombot.img, NARRATOR_DATA.bombot[currentLanguage].name, d);
      }, 7000);

      // Boss taunt at wave 1, but doesn't cut connection yet
      setTimeout(() => {
        if (gameState.mode === 'corrupto') {
          const data = NARRATOR_DATA.moonstar;
          const txt = currentLanguage === 'es' ? "Aún estás a tiempo de huir..." : "You still have time to flee...";
          showNarratorMsg('moonstar', data.img, data[currentLanguage].name, txt);
        } else if (gameState.mode === 'antiNormal') {
          const data = NARRATOR_DATA.noeye;
          const txt = currentLanguage === 'es' ? "N0 S0BR3V1V1R4S 4 L4 0SCUR1D4D..." : "Y0U W0N'7 SURV1V3 7H3 D4RKN3SS...";
          showNarratorMsg('noeye', data.img, data[currentLanguage].name, txt);
        }
      }, 14000);
    }
  } else if (gameState.wave === maxWaves - 10) {
    // Cut off connection 10 waves before the end
    if (gameState.mode === 'corrupto') {
      const data = NARRATOR_DATA.moonstar;
      showNarratorMsg('moonstar', data.img, data[currentLanguage].name, data[currentLanguage].intercept);
    } else if (gameState.mode === 'antiNormal') {
      const data = NARRATOR_DATA.noeye;
      showNarratorMsg('noeye', data.img, data[currentLanguage].name, data[currentLanguage].intercept);
    } else {
      checkWaveDialogues();
    }
  } else {
    checkWaveDialogues();
  }
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
      if (wave >= 11) pool.push('Flower_Pyce', 'Stupid_GoldPyce');

      let baseCount = 4 + Math.floor(wave * 1.4);
      for (let i = 0; i < baseCount; i++) {
        let selected = pool[Math.floor(Math.random() * pool.length)];
        if (selected === 'Stupid_GoldPyce' && Math.random() < 0.7) selected = 'Pyce2';
        spawnList.push(selected);
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
      if (wave >= 6) pool.push('Flower_Pyce', 'Stupid_GoldPyce');

      let baseCount = 5 + Math.floor(wave * 1.7);
      for (let i = 0; i < baseCount; i++) {
        let selected = pool[Math.floor(Math.random() * pool.length)];
        if (selected === 'Stupid_GoldPyce' && Math.random() < 0.7) selected = 'Pyce2';
        spawnList.push(selected);
      }
    }

  } else {
    // Modos Anti-Normal, Corrupto, Infinito y Pesadilla.
    // Empiezan muy cargados desde la oleada 1 (muchos enemigos tipo Pyce/Pyce2) y suben a velocidad creciente.
    if (wave % 10 === 0) {
      isBossWave = true;
      if (mode === 'antiNormal') {
        if (wave === 15) bossesToSpawn.push('NOeye_Pyce');
        else if (wave === 25) bossesToSpawn.push('NOeye_Pyce', '1x1x1x1_Pyce');
        else if (wave === 35) bossesToSpawn.push('MoonStar_Pyce');
        else if (wave % 10 === 0) bossesToSpawn.push('NOeye_Pyce');
      } else {
        if (wave === 10) bossesToSpawn.push('1x1x1x1_Pyce');
        else if (wave === 20) bossesToSpawn.push('NOeye_Pyce');
        else if (wave === 30) {
          if (mode === 'corrupto') bossesToSpawn.push('MoonStar_Pyce');
          else bossesToSpawn.push('NOeye_Pyce');
        } else {
          if (mode === 'corrupto') bossesToSpawn.push('NOeye_Pyce', 'MoonStar_Pyce');
          else bossesToSpawn.push('1x1x1x1_Pyce', 'NOeye_Pyce');
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
      if (wave >= 4) pool.push('Flower_Pyce', 'Stupid_GoldPyce');

      for (let i = 0; i < baseCount; i++) {
        let selected = pool[Math.floor(Math.random() * pool.length)];
        if (selected === 'Stupid_GoldPyce' && Math.random() < 0.8) selected = 'Pyce2';
        spawnList.push(selected);
      }
    }
  }

  // Modificadores de mapa para nuevos Pyces y enemigos especiales
  if (wave >= 2) {
    const mapKey = gameState.map || 'gelatin_lake';
    const isUrban = mapKey === 'urbanistic_road';
    const bombCount = Math.floor(wave * (isUrban ? 0.5 : 0.1));
    const knightCount = wave >= 4 ? Math.floor(wave * (isUrban ? 0.4 : 0.05)) : 0;
    const cannonCount = wave >= 6 ? Math.floor(wave * (isUrban ? 0.3 : 0.02)) : 0;
    for (let i = 0; i < bombCount; i++) spawnList.push('Bomb_Pyce');
    for (let i = 0; i < knightCount; i++) spawnList.push('Knight_Pyce');
    for (let i = 0; i < cannonCount; i++) spawnList.push('Cannon_Pycer');
    
    // Nuevos "Otros Enemigos" aparecen en Urbanistic Road
    if (isUrban) {
      const holoCount = wave >= 3 ? Math.floor(wave * 0.2) : 0;
      const strechyCount = wave >= 5 ? Math.floor(wave * 0.15) : 0;
      const rebelCount = wave >= 4 ? Math.floor(wave * 0.2) : 0;
      const firefliesCount = wave >= 2 ? Math.floor(wave * 0.25) : 0;
      for (let i = 0; i < holoCount; i++) spawnList.push('HoloPyce');
      for (let i = 0; i < strechyCount; i++) spawnList.push('Strechy_Pyce');
      for (let i = 0; i < rebelCount; i++) spawnList.push('Rebel_Pyce');
      for (let i = 0; i < firefliesCount; i++) spawnList.push('Fireflies');
      
      // Añadir Bits y Bytes a Urbanistic Road
      const bitCount = wave >= 1 ? Math.floor(wave * 0.5) + 1 : 0;
      const byteCount = wave >= 3 ? Math.floor(wave * 0.3) : 0;
      const bitPool = ['BitY1', 'BitG2', 'BitP3', 'BitB4'];
      const bytePool = ['ByteGB1', 'ByteYP2', 'BytePG3', 'ByteYB4'];
      
      for (let i = 0; i < bitCount; i++) {
        spawnList.push(bitPool[Math.floor(Math.random() * bitPool.length)]);
      }
      for (let i = 0; i < byteCount; i++) {
        spawnList.push(bytePool[Math.floor(Math.random() * bytePool.length)]);
      }
    }
  }

  console.log(`📦 spawnList tiene ${spawnList.length} enemigos`);

  if (spawnList.length === 0) {
    console.error("❌ ERROR: spawnList está VACÍA. Revisa la lógica de oleadas.");
    gameState.waveActive = false;
    gameState.spawningActive = false;
    return;
  }

  const isUrban = (gameState.map || 'gelatin_lake') === 'urbanistic_road';
  if (isUrban && wave === maxWaves) {
    isBossWave = true;
    if (mode === 'antiNormal') {
      bossesToSpawn.push('CrystArky');
    } else if (mode === 'corrupto') {
      bossesToSpawn.push('ArkyVoid');
    } else {
      bossesToSpawn.push('Arky');
    }
  }

  // En Urbanistic Road, los Pyce bosses no son jefes finales (solo minibosses)
  if (isUrban) {
    const pyceBosses = ['1x1x1x1_Pyce', 'NOeye_Pyce', 'MoonStar_Pyce'];
    const removed = bossesToSpawn.filter(b => pyceBosses.includes(b));
    removed.forEach(b => spawnList.push(b)); // los mandan al pool normal
    bossesToSpawn.splice(0, bossesToSpawn.length, ...bossesToSpawn.filter(b => !pyceBosses.includes(b)));
    if (bossesToSpawn.length === 0) isBossWave = false;
  }

  // NOeye y MoonStar solo pueden aparecer UNA VEZ por partida (son únicos)
  const UNIQUE_BOSSES = ['NOeye_Pyce', 'MoonStar_Pyce'];
  UNIQUE_BOSSES.forEach(b => {
    if (gameState.uniquesBossSpawned[b]) {
      // Quitar del spawnList
      let idx;
      while ((idx = spawnList.indexOf(b)) !== -1) spawnList.splice(idx, 1);
      // Quitar de bossesToSpawn
      const bi = bossesToSpawn.indexOf(b);
      if (bi !== -1) bossesToSpawn.splice(bi, 1);
    }
  });
  if (bossesToSpawn.length === 0 && isBossWave && !spawnList.some(t => ['Arky','CrystArky','ArkyVoid'].includes(t))) isBossWave = false;


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
      gameState.spawningActive = false;
      return;
    }
    const type = spawnList[spawned];
    const isThisBoss = isBossWave && bossesToSpawn.includes(type) && (spawned < bossesToSpawn.length);
    console.log(`👾 Spawn enemigo ${spawned + 1}/${spawnList.length}: ${type}`);
    spawnEnemy(type, isThisBoss);
    spawned++;
    if (spawned >= spawnList.length) {
      clearInterval(interval);
      gameState.spawningActive = false;
    }
  }, Math.max(300, 800 - Math.min(500, wave * 25)));
}

function spawnEnemy(type, boss) {
  if (gameState.mimicSpawned < 2 && !boss && Math.random() < 0.001) {
    type = 'Mimic_Pyce';
    gameState.mimicSpawned++;
  }

  if (!type) {
    const wave = gameState.wave || 1;
    const pool = ['Stupid_Pyce'];
    if (wave >= 2) pool.push('Pyce2', 'Pyce2');
    if (wave >= 4) pool.push('Guest_Pyce', 'Symbol_Pyce');
    if (wave >= 6) pool.push('Noob_Pyce', 'Noob_Pyce');
    if (wave >= 9) pool.push('4motions_Pyce');
    if (wave >= 11) pool.push('Symbol_Pyce', 'Guest_Pyce', 'Noob_Pyce');
    
    if (gameState.map === 'urbanistic_road') {
      const bitPool = ['BitY1', 'BitG2', 'BitP3', 'BitB4'];
      const bytePool = ['ByteGB1', 'ByteYP2', 'BytePG3', 'ByteYB4'];
      if (wave >= 1) pool.push(...bitPool);
      if (wave >= 3) pool.push(...bytePool);
      if (wave >= 5) pool.push('Bomb_Pyce');
      if (wave >= 6) pool.push('Spyware');
      if (wave >= 7) pool.push('Knight_Pyce');
      if (wave >= 9) pool.push('Cannon_Pycer');
    }
    type = pool[Math.floor(Math.random() * pool.length)] || 'Stupid_Pyce';
  }

  const t = ENEMY_TYPES[type];
  if (!t) return console.warn("Enemy type missing:", type);
  const chosenPath = ENEMY_PATHS[Math.floor(Math.random() * ENEMY_PATHS.length)];
  const el = document.createElement('div'); el.className = 'enemy' + (boss ? ' boss' : '');
  el.style.left = `${chosenPath[0].x}px`; el.style.top = `${chosenPath[0].y}px`;
  
  let imgStr = t.image;
  if (type === 'Spyware') {
    const spywareImages = [IMAGE_PATHS.Spyware1, IMAGE_PATHS.Spyware2, IMAGE_PATHS.Spyware3];
    imgStr = spywareImages[Math.floor(Math.random() * spywareImages.length)];
  }
  if (imgStr) el.style.backgroundImage = `url('${imgStr}')`;
  const hpFill = document.createElement('div'); hpFill.className = 'hp-bar-fill';
  const hpBg = document.createElement('div'); hpBg.className = 'hp-bar-bg';
  hpBg.appendChild(hpFill); el.appendChild(hpBg);
  const gameArea = document.getElementById('game-area') || document.getElementById('map') || document.body;
  gameArea.appendChild(el);

  const name = (typeof translate === 'function' && translate('enemy_' + type + '_name')) || type;

  checkEnemyDialogues(type);

  // NOeye y MoonStar son únicos: marcarlos para no repetir
  if (type === 'NOeye_Pyce' || type === 'MoonStar_Pyce') {
    gameState.uniquesBossSpawned[type] = true;
  }

  let mult = 1.0;
  if (gameState.mode === 'facil') mult = 0.7;
  else if (gameState.mode === 'normal') mult = 1.0;
  else if (gameState.mode === 'dificil') mult = 1.3;
  else if (gameState.mode === 'extremo') mult = 1.6;
  else if (gameState.mode === 'corrupto') mult = 1.8;
  else if (gameState.mode === 'pesadilla') mult = 2.0;

  const healthScaled = Math.max(1, (t.health || 10) * (1 + (gameState.wave || 1) * 0.15) * mult);
  let shieldVal = (t.shield || 0) * (t.health || 10);
  if (type === 'CrystArky' || type === 'MoonStar_Pyce') shieldVal = healthScaled * 1.0;
  const enemyObj = { ...t, name, el, x: chosenPath[0].x, y: chosenPath[0].y, pathIndex: 0, currentPath: chosenPath, health: healthScaled, maxHealth: healthScaled, hpFill, shield: shieldVal, type, boss };
  gameState.enemies.push(enemyObj);
}

let seenEnemyDialogues = {};

function checkEnemyDialogues(type) {
  if (seenEnemyDialogues[type] || document.getElementById('narrator-bubble')) return;

  const triggers = {
    'Guest_Pyce': { speaker: 'bombot', index: 1 },
    'Noob_Pyce': { speaker: 'glob', index: 3 },
    'Symbol_Pyce': { speaker: 'bombot', index: 4 },
    'SO_Pyce': { speaker: 'bombot', index: 5 }
  };

  if (triggers[type]) {
    seenEnemyDialogues[type] = true;
    const t = triggers[type];
    const data = NARRATOR_DATA[t.speaker];
    const text = data[currentLanguage].msgs[t.index];
    showNarratorMsg(t.speaker, data.img, data[currentLanguage].name, text);
  } else if (type === 'Mimic_Pyce' || type === 'Stupid_GoldPyce') {
    seenEnemyDialogues['Mimic_Pyce'] = true;
    const data = NARRATOR_DATA.bombot;
    showNarratorMsg('bombot', data.img, data[currentLanguage].name, data[currentLanguage].mimicWarning);
  } else if (type === '1x1x1x1_Pyce') {
    seenEnemyDialogues[type] = true;
    const data = NARRATOR_DATA.one_x;
    showNarratorMsg('one_x', data.img, data[currentLanguage].name, data[currentLanguage].msgs[0]);
  } else if (type === 'NOeye_Pyce') {
    seenEnemyDialogues[type] = true;
    if ((gameState.map || 'gelatin_lake') === 'urbanistic_road') {
      const data = NARRATOR_DATA.arky;
      const msg = data[currentLanguage].msgs[Math.floor(Math.random() * data[currentLanguage].msgs.length)];
      showNarratorMsg('arky', data.img, data[currentLanguage].name, msg);
    } else {
      const data = NARRATOR_DATA.noeye;
      showNarratorMsg('noeye', data.img, data[currentLanguage].name, data[currentLanguage].msgs[0]);
    }
  } else if (type === 'MoonStar_Pyce') {
    seenEnemyDialogues[type] = true;
    if ((gameState.map || 'gelatin_lake') === 'urbanistic_road') {
      const data = NARRATOR_DATA.crystarky;
      const msg = data[currentLanguage].msgs[Math.floor(Math.random() * data[currentLanguage].msgs.length)];
      showNarratorMsg('crystarky', data.img, data[currentLanguage].name, msg);
    } else {
      const data = NARRATOR_DATA.moonstar;
      showNarratorMsg('moonstar', data.img, data[currentLanguage].name, data[currentLanguage].msgs[0]);
    }
  } else if (type === 'Arky') {
    seenEnemyDialogues[type] = true;
    const data = NARRATOR_DATA.arky;
    const msg = data[currentLanguage].msgs[Math.floor(Math.random() * data[currentLanguage].msgs.length)];
    showNarratorMsg('arky', data.img, data[currentLanguage].name, msg);
  } else if (type === 'CrystArky') {
    seenEnemyDialogues[type] = true;
    const data = NARRATOR_DATA.crystarky;
    const msg = data[currentLanguage].msgs[Math.floor(Math.random() * data[currentLanguage].msgs.length)];
    showNarratorMsg('crystarky', data.img, data[currentLanguage].name, msg);
  } else if (type === 'ArkyVoid') {
    seenEnemyDialogues[type] = true;
    const data = NARRATOR_DATA.arkyvoid;
    const msg = data[currentLanguage].msgs[Math.floor(Math.random() * data[currentLanguage].msgs.length)];
    showNarratorMsg('arkyvoid', data.img, data[currentLanguage].name, msg);
  }
}

function checkWaveDialogues() {
  if (document.getElementById('narrator-bubble')) return;

  // Base chance of 15% + 1% per wave
  const waveChance = 0.15 + ((gameState.wave || 1) * 0.01);
  if (Math.random() < waveChance) {
    const mode = gameState.mode;
    let speakers = [];

    let maxWaves = gameState.maxWaves || 20;
    if (mode === 'pesadilla') maxWaves = 50;
    const isCutoff = gameState.wave >= maxWaves - 10;

    const isUrbanMap = (gameState.map || 'gelatin_lake') === 'urbanistic_road';

    if (isUrbanMap) {
      // En Urbanistic Road: los Arkys son los narradores principales
      speakers = isCutoff ? ['arky', 'crystarky', 'arkyvoid'] : ['bombot', 'glob', 'arky', 'crystarky'];
    } else if (mode === 'corrupto') {
      speakers = isCutoff ? ['moonstar'] : ['bombot_corrupto', 'moonstar'];
    } else if (mode === 'antiNormal') {
      speakers = isCutoff ? ['glob', 'noeye'] : ['bombot_antiNormal', 'glob', 'noeye'];
    } else {
      speakers = ['bombot', 'glob', 'stupid', 'pyce2'];
    }

    if (!isUrbanMap) {
      if (gameState.enemies.some(e => e.type === '1x1x1x1_Pyce')) speakers.push('one_x');
      if (gameState.enemies.some(e => e.type === 'NOeye_Pyce') && mode !== 'antiNormal') speakers.push('noeye');
      if (gameState.enemies.some(e => e.type === 'MoonStar_Pyce') && mode !== 'corrupto') speakers.push('moonstar');
    } else {
      if (gameState.enemies.some(e => e.type === 'Arky')) speakers.push('arky');
      if (gameState.enemies.some(e => e.type === 'CrystArky')) speakers.push('crystarky');
      if (gameState.enemies.some(e => e.type === 'ArkyVoid')) speakers.push('arkyvoid');
    }

    const sId = speakers[Math.floor(Math.random() * speakers.length)];

    if (sId === 'bombot_corrupto') {
      const data = NARRATOR_DATA.bombot;
      const msgsArray = data[currentLanguage].corruptMsgs;
      const text = msgsArray[Math.floor(Math.random() * msgsArray.length)];
      showNarratorMsg('bombot', data.img, data[currentLanguage].name, text);
    } else if (sId === 'bombot_antiNormal') {
      const data = NARRATOR_DATA.bombot;
      const msgsArray = data[currentLanguage].antiNormalMsgs;
      const text = msgsArray[Math.floor(Math.random() * msgsArray.length)];
      showNarratorMsg('bombot', data.img, data[currentLanguage].name, text);
    } else {
      const data = NARRATOR_DATA[sId];
      if (data) {
        const msgs = data[currentLanguage].msgs;
        const text = msgs[Math.floor(Math.random() * msgs.length)];
        showNarratorMsg(sId, data.img, data[currentLanguage].name, text);
      }
    }
  }
}

let narratorTimeout = null;
function showNarratorMsg(speakerId, imgSrc, speakerName, text) {
  const old = document.getElementById('narrator-bubble');
  if (old) old.remove();
  if (narratorTimeout) clearTimeout(narratorTimeout);

  const bubble = document.createElement('div');
  bubble.id = 'narrator-bubble';
  bubble.className = `narrator-bubble narrator-enter speaker-${speakerId}`;
  bubble.innerHTML = `
    <img src="${imgSrc}" class="narrator-portrait" onerror="this.style.display='none'">
    <div class="narrator-text-box">
      <div class="narrator-name">${speakerName}</div>
      <div class="narrator-text">${text}</div>
    </div>
    <button class="narrator-close" onclick="closeNarratorMsg()">✕</button>
  `;
  document.body.appendChild(bubble);

  setTimeout(() => {
    if (bubble.parentNode) {
      bubble.classList.remove('narrator-enter');
      bubble.classList.add('narrator-float');
    }
  }, 500); // 500ms after enter animation finishes

  narratorTimeout = setTimeout(() => { closeNarratorMsg(); }, 6000);
}

function closeNarratorMsg() {
  const bubble = document.getElementById('narrator-bubble');
  if (bubble) {
    bubble.classList.remove('narrator-float');
    bubble.classList.add('narrator-exit');
    setTimeout(() => {
      if (bubble.parentNode) bubble.remove();
    }, 500); // match exit animation duration
  }
}

function gameLoop() {
  if (gameState.gameOver) return;
  try {
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
      const next = e.currentPath[e.pathIndex + 1];

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

      if (e.type === 'Arky' || e.type === 'CrystArky' || e.type === 'ArkyVoid') {
        e.arkyTimer = (e.arkyTimer || 0) + dt;
        if (e.arkyTimer >= 15) {
          e.arkyTimer = 0;
          e.arkyImmunity = null;
        } else if (e.arkyTimer >= 10 && !e.arkyImmunity) {
          const immunities = ['fire', 'poison', 'slow'];
          e.arkyImmunity = immunities[Math.floor(Math.random() * immunities.length)];
          showFloatingText(currentLanguage === 'es' ? "¡INMUNIDAD!" : "IMMUNITY!", e.x, e.y - 30, "#ffd700");
        }
        
        if (e.arkyImmunity === 'fire') {
          e.hpFill.style.backgroundColor = '#ff8c00';
          e.burnTimer = 0;
        } else if (e.arkyImmunity === 'poison') {
          e.hpFill.style.backgroundColor = '#9b59b6';
          e.poisonTimer = 0;
          e.toxicTimer = 0;
        } else if (e.arkyImmunity === 'slow') {
          e.hpFill.style.backgroundColor = '#3498db';
          e.enemySlowTimer = 0;
          e.stunned = 0;
        }
      }

      if (e.type === 'ArkyVoid') {
        e.arkyVoidTimer = (e.arkyVoidTimer || 0) + dt;
        if (e.arkyVoidTimer >= 15) {
          e.arkyVoidTimer = 0;
          e.arkyVoidTriggered = false;
        } else if (e.arkyVoidTimer >= 5 && !e.arkyVoidTriggered) {
          e.arkyVoidTriggered = true;
          const activeTowers = gameState.towers.filter(t => !t.arkyVoidReduced);
          if (activeTowers.length > 0) {
            const targetTowers = activeTowers.sort(() => 0.5 - Math.random()).slice(0, 3);
            targetTowers.forEach(t => {
              t.arkyVoidReduced = true;
              t.originalRange = t.range;
              t.range = t.range * 0.9;
              if (t.el) t.el.style.filter = "drop-shadow(0 0 10px #ff69b4) hue-rotate(-50deg)";
              showFloatingText(currentLanguage === 'es' ? "-10% Rango" : "-10% Range", t.x, t.y - 20, "#ff69b4");
              
              setTimeout(() => {
                if (gameState.towers.includes(t)) {
                  t.arkyVoidReduced = false;
                  t.range = t.originalRange;
                  if (t.el) t.el.style.filter = "";
                  showFloatingText(currentLanguage === 'es' ? "Rango Restaurado" : "Range Restored", t.x, t.y - 20, "#ff69b4");
                }
              }, 10000);
            });
          }
        }
      }


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
        if (e.type === 'Fireflies') {
          e.health = Math.min(e.maxHealth, e.health + dmg);
          e.el.classList.add('burning');
          if (Math.random() < 0.1) showEffect(e.x, e.y, "HEAL! 💚", "#2ecc71");
        } else {
          e.health -= dmg;
          e.el.classList.add('burning');
          if (Math.random() < 0.1) showEffect(e.x, e.y, "🔥", "#ff5500");
        }
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
      
      if (gameState.traps && gameState.traps.length > 0) {
        for (let j = gameState.traps.length - 1; j >= 0; j--) {
          let trap = gameState.traps[j];
          // DJ_Trap is NOT contact-based — it has its own active loop below
          if (trap.parentType === 'DJ_Glob') continue;
          if (trap.active && Math.hypot(e.x - trap.x, e.y - trap.y) <= (trap.radius || 40)) {
            let dmg = trap.damage;
            e.health -= dmg;
            
            if (trap.parentType === 'Police_Glob') {
              e.enemySlowTimer = 2;
              e.enemySlowFactor = 0.5;
            } else if (trap.parentType === 'Planked_Glob') {
              gameState.enemies.forEach(otherE => {
                if (otherE !== e && Math.hypot(otherE.x - trap.x, otherE.y - trap.y) <= 80) {
                  otherE.health -= trap.damage * 0.5;
                }
              });
            }
            
            showEffect(trap.x, trap.y, "TRAP! 💥", "#f39c12");
            
            if (gameState.duckgrades && gameState.duckgrades.dg_Worker_Glob && !trap.triggeredOnce) {
              trap.triggeredOnce = true;
              trap.ignoreEnemyId = e.id || Math.random(); 
            } else {
              if (trap.el && trap.el.parentNode) trap.el.parentNode.removeChild(trap.el);
              gameState.traps.splice(j, 1);
            }
          }
        }
      }

      // Stun immunity countdown
      if (e.stunImmuneTimer && e.stunImmuneTimer > 0) e.stunImmuneTimer -= dt;

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

      if (t.iexBuffTimer && t.iexBuffTimer > 0) {
        t.iexBuffTimer -= dt;
        currentSpeed *= 2; 
      }

      if (t.family === 'IEx') {
        const targets = gameState.enemies.filter(e => Math.hypot(e.x - t.x, e.y - t.y) <= t.range);
        if (targets.length > 0 || t.forceExplode) {
          showEffect(t.x, t.y, "BOOM!", "#ff0000");
          gameState.roundIExExplosions = (gameState.roundIExExplosions || 0) + 1;
          if (gameState.roundIExExplosions >= 100) unlockBadge('explosiones_por_doquier');
          
          if (targets.length > 0) {
            targets.forEach(e => {
              e.health -= t.damage;
              if (gameState.duckgrades.dg_IEx) {
                if (t.type === 'Bomb_Glob' || t.type === 'TNT_Glob') {
                  e.burnTimer = 3;
                } else if (t.type === 'Nuclear_Glob') {
                  e.toxicTimer = 5;
                }
              }
            });
          }
          
          const idx = gameState.towers.indexOf(t);
          if (idx > -1) {
            gameState.towers.splice(idx, 1);
            if (t.spotId !== undefined && gameState.towerSpots[t.spotId]) {
              gameState.towerSpots[t.spotId].occupied = false;
            }
            if (t.el && t.el.parentNode) t.el.parentNode.removeChild(t.el);
            updateUI();
          }
        }
        return;
      }
      
      if (t.family === 'Worker_Glob') {
        t.cooldown -= dt;
        let workerSpeed = t.speed || 0.5;  // usa la velocidad propia de la torre
        if (t.trapSpeedBuffTimer && t.trapSpeedBuffTimer > 0) {
          t.trapSpeedBuffTimer -= dt;
          workerSpeed *= 2;
        }
        if (t.cooldown <= 0) {
          if (!gameState.traps) gameState.traps = [];
          
          let potentialSpots = [];
          // Combine all available paths on the map
          const allPaths = ENEMY_PATHS && ENEMY_PATHS.length > 0 ? ENEMY_PATHS : [];
          allPaths.forEach(path => {
            if (path && path.length > 0) {
              for (let i = 0; i < path.length; i++) {
                let pt = path[i];
                if (Math.hypot(pt.x - t.x, pt.y - t.y) <= t.range) {
                  // Colisión: ninguna trampa activa a menos de 50px (de cualquier evo)
                  const occupied = gameState.traps.some(tr =>
                    tr.active && Math.hypot(tr.x - pt.x, tr.y - pt.y) < 50
                  );
                  if (!occupied) potentialSpots.push({ x: pt.x, y: pt.y, index: i });
                }
              }
            }
          });
          
          const isDJ = t.type === 'DJ_Glob';
          const trapRadius = isDJ ? 80 : 40;
          const trapSize  = isDJ ? 50 : 40;
          const mapEl = document.getElementById('map');

          if (potentialSpots.length > 0) {
            // Coloca UNA valla por tick (el cooldown rápido llena el rango progresivamente)
            // DJ_Glob tiene cooldown x3: tarda más pero su trampa es más poderosa
            potentialSpots.sort((a, b) => b.index - a.index);
            const spot = potentialSpots[0];
            const trapType = t.trap;
            const trap = {
              x: spot.x, y: spot.y,
              damage: t.damage,
              trapType,
              parentType: t.type,
              active: true,
              radius: trapRadius,
              el: document.createElement('div')
            };
            trap.el.className = 'trap-entity';
            trap.el.style.cssText =
              `position:absolute;` +
              `left:${spot.x}px;top:${spot.y}px;` +
              `width:${trapSize}px;height:${trapSize}px;` +
              `transform:translate(-50%,-50%);` +
              `background:url('${encodeURI(IMAGE_PATHS[trapType])}') center/contain no-repeat;` +
              `z-index:5;`;
            mapEl.appendChild(trap.el);
            gameState.traps.push(trap);
          }
          // Cooldown: DJ Glob x3 más lento
          t.cooldown = (1 / workerSpeed) * (isDJ ? 3 : 1);
        }
        return;
      }

      if (t.cooldown <= 0 && t.family !== 'Ducky_Glob') {
        const isEvo1 = !Object.values(TOWER_TYPES).some(typeDef => typeDef.evolution === t.type);
        const isEvo2 = Object.values(TOWER_TYPES).some(typeDef => typeDef.evolution === t.type) && !Object.values(TOWER_TYPES).some(typeDef => typeDef.evolution === Object.values(TOWER_TYPES).find(td => td.evolution === t.type)?.type); 
        
        const isEvo1Or2 = t.type === 'Bomb_Glob' || t.type === 'TNT_Glob' || t.type === 'Worker_Glob' || t.type === 'Police_Glob' || isEvo1 || isEvo2;

        const targets = gameState.enemies.filter(e => {
          if (e.holo && isEvo1) return false;
          if (e.mechanic_key === 'mechanic_spyware' && isEvo1Or2) return false;
          return Math.hypot(e.x - t.x, e.y - t.y) <= t.range;
        });
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
        if (!p.target || !targetArray.includes(p.target)) {
          if (p.projectile === 'void_tracker') {
            const nextTarget = targetArray.find(e => Math.hypot(e.x - p.x, e.y - p.y) < 300);
            if (nextTarget) { p.target = nextTarget; }
            else { p.el.remove(); gameState.projectiles.splice(i, 1); continue; }
          } else {
            p.el.remove(); gameState.projectiles.splice(i, 1); continue;
          }
        }
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
    // ── DJ_Trap active update loop ──
    // DJ_Trap acts like a mini-tower: shoots stun waves periodically;
    // on destruction it fires a final paralyzing pulse.
    if (gameState.traps) {
      for (let j = gameState.traps.length - 1; j >= 0; j--) {
        const trap = gameState.traps[j];
        if (!trap.active || trap.parentType !== 'DJ_Glob') continue;

        // Init HP y cooldown de onda
        if (trap.health === undefined) trap.health = 120 + gameState.wave * 8;
        if (trap.waveCooldown === undefined) trap.waveCooldown = 0;

        // Enemigos en radio dañan la valla (la destruyen al atacarla)
        const inRange = gameState.enemies.filter(e =>
          Math.hypot(e.x - trap.x, e.y - trap.y) <= trap.radius
        );
        if (inRange.length > 0) {
          // Cada enemigo hace ~15 de daño por segundo a la valla
          trap.health -= inRange.length * 15 * dt;
        }

        // Onda periódica de ataque mientras la valla sigue en pie
        trap.waveCooldown -= dt;
        if (trap.waveCooldown <= 0) {
          if (inRange.length > 0) {
            inRange.forEach(e => {
              e.health -= trap.damage * 0.4;
              if (!e.stunImmuneTimer || e.stunImmuneTimer <= 0) {
                e.stunned = (e.stunned || 0) + 1.2;
                e.enemySlowTimer = 2;
                e.enemySlowFactor = 0.55;
                e.stunImmuneTimer = 10;
              }
            });
            showEffect(trap.x, trap.y, "♫", "#9b59b6");
          }
          trap.waveCooldown = 2.0;
        }

        // Destrucción: HP agotada → pulso final paralizador
        if (trap.health <= 0) {
          gameState.enemies.forEach(e => {
            if (Math.hypot(e.x - trap.x, e.y - trap.y) <= trap.radius * 1.5) {
              e.health -= trap.damage * 0.8;
              if (!e.stunImmuneTimer || e.stunImmuneTimer <= 0) {
                e.stunned = (e.stunned || 0) + 3.0;
                e.enemySlowFactor = 0.0;
                e.enemySlowTimer = 3;
                e.stunImmuneTimer = 10;
              }
            }
          });
          showEffect(trap.x, trap.y, "♫ BOOM!", "#8e44ad");
          if (trap.el && trap.el.parentNode) trap.el.parentNode.removeChild(trap.el);
          gameState.traps.splice(j, 1);
        }
      }
    }


    if (gameState.waveActive && !gameState.spawningActive && !gameState.enemies.length) {
      gameState.waveActive = false;
      gameState.globetines += 50 + gameState.wave * 10;
      const earnedPy = Math.round(10 * getPycoinMultiplier());
      gameState.pycoins += earnedPy;
      let xpAmount = 20;
      if (gameState.mode === 'dificil') xpAmount = 25;
      else if (gameState.mode === 'extremo') xpAmount = 30;
      else if (gameState.mode === 'corrupto' || gameState.mode === 'antiNormal') xpAmount = 40;
      else if (gameState.mode === 'pesadilla') xpAmount = 50;
      addXP(xpAmount);
      // Badge: mimic3 (Aura de Cristal) - finish wave with 1 health
      if (gameState.health === 1) unlockBadge('mimic3');
      // Badge: mimic4 (Economía de Guerra) - 10 ducky towers on map
      const duckyCount = gameState.towers.filter(t => t.family === 'Ducky_Glob').length;
      if (duckyCount >= 10) unlockBadge('mimic4');
      // Badge: survivor - reach wave 10
      if (gameState.wave >= 10) unlockBadge('survivor');
      // Badge: millionaire - have over 20000 money
      if (gameState.globetines >= 20000) unlockBadge('millionaire');
      // Badge: inf wave badges
      if (gameState.wave >= 100) unlockBadge('inf100');
      if (gameState.wave >= 500) unlockBadge('inf500');
      if (gameState.wave >= 999) unlockBadge('inf999');
      // Badge: titaniumBuilding - no base damage
      if (!gameState.baseTookDamage && gameState.wave >= gameState.maxWaves && gameState.mode !== 'infinito') unlockBadge('titaniumBuilding');
      // Badge: deepSavings - 1500 pycoins and duckpasses
      if (gameState.pycoins >= 1500 && gameState.duckPassCurrency >= 1500) unlockBadge('deepSavings');
      updateUI(); updateMetaUI(); saveProgress();
      if (gameState.autoWave) setTimeout(startWave, 2000);
    }

    // Anti-Normal random glitch mechanic
    if (gameState.mode === 'antiNormal' && gameState.waveActive && Math.random() < 0.005) {
      const gameArea = document.getElementById('game-area');
      if (gameArea && !gameArea.classList.contains('game-glitch-event')) {
        gameArea.classList.add('game-glitch-event');

        // Glitch gives Pyces a shield equal to half their max health (excluding Bosses)
        gameState.enemies.forEach(e => {
          if (!e.frozen && e.type !== 'NOeye_Pyce' && e.type !== 'MoonStar_Pyce') {
            const baseHealth = ENEMY_TYPES[e.type] ? ENEMY_TYPES[e.type].health : e.health;
            e.shield = (e.shield || 0) + (baseHealth / 2);
            if (e.el) {
              e.el.style.boxShadow = "0 0 15px #00ffff"; // Cyan shield visual
              e.el.style.border = "2px solid #00ffff";
              e.el.style.borderRadius = "50%";
            }
          }
        });

        showFloatingText(translate('glitch_shields'), window.innerWidth / 2, 200, "#00ffff");
        setTimeout(() => gameArea.classList.remove('game-glitch-event'), 300);
      }
    }
  } catch (err) {
    console.error("Error en gameLoop (el juego continúa):", err);
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
    if (shooter.type === 'Glob') opts.color = '#00FFFF';
    else if (shooter.type === 'Poop_Glob') opts.color = '#39FF14';
    else if (shooter.type === 'Golden_Glob') opts.color = 'multicolor';
    else if (shooter.type === 'Rainbow_Glob') opts.color = 'gradient';
  } else if (gameState.equippedSkins[shooter.family] === 'mimic_set') {
    projClass = 'laser';
    if (shooter.type === 'Comet_Glob') opts.color = '#007BFF'; // Azul
    else if (shooter.type === 'Dark_Glob') opts.color = '#8B4513'; // Marrón
    else if (shooter.type === 'Demglob') opts.color = '#000000'; // Negro
  } else if (gameState.equippedSkins[shooter.family] === 'starjump_set') {
    if (shooter.type === 'Old_Glob') { projClass = 'star_yellow'; opts.color = '#FFD700'; }
    else if (shooter.type === 'Pyce_Glob') { projClass = 'star_celeste'; opts.color = '#00FFFF'; opts.size = 14; }
  }
  if (projClass) el.classList.add(projClass);

  const dx = target.x - shooter.x;
  const dy = target.y - shooter.y;
  const angle = Math.atan2(dy, dx);
  const dist = Math.hypot(dx, dy) || 1;
  const speed = (opts.speed || shooter.speed || 3) * 300;
  const vx = (dx / dist) * speed;
  const vy = (dy / dist) * speed;

  el.style.position = 'absolute';
  el.style.left = shooter.x + 'px'; el.style.top = shooter.y + 'px';
  // Como las imágenes base de proyectiles miran hacia la izquierda, 
  // tenemos que sumarle Math.PI (180 grados) al ángulo para que apunten bien al moverse
  el.style.transform = `rotate(${angle + Math.PI}rad)`;

  // ========== SISTEMA DE PROYECTILES 3D TINTADOS ==========
  const isEnemy = !!opts.isEnemy;
  const isBomb = (shooter.type === 'Work_Bombot' || shooter.aoe);
  const isLaser = projClass && (projClass.includes('laser') || projClass === 'void');
  const isBoomerang = projClass && (projClass.includes('boomerang'));
  const isSpecialProj = projClass === 'binary_code' || projClass === 'stone_red' || projClass === 'star_yellow' || projClass === 'star_celeste' || projClass === 'slash' || projClass === 'none';

  // Determine projectile image and size
  let projImg = 'img/Proyectiles/Proyectil_Base.png';
  let projSize = 16;

  if (isBomb) {
    projImg = 'img/Proyectiles/Proyectil_Bomba.png';
    projSize = 24;
  } else if (isLaser) {
    projImg = 'img/Proyectiles/Proyectil_Laser.png';
    projSize = 20;
  } else if (isBoomerang) {
    projImg = 'img/Proyectiles/Proyectil_Base.png';
    projSize = 18;
  }

  el.style.width = projSize + 'px';
  el.style.height = projSize + 'px';

  // Color mapping per tower family/type for tinting
  const FAMILY_COLORS = {
    'Glob': '#4CAF50',        // Verde
    'Red_Glob': '#e74c3c',    // Rojo
    'Soap_Glob': '#3498db',   // Azul
    'Ducky_Glob': '#f1c40f',  // Amarillo
    'Comet_Glob': '#2c2c2c',  // Negro/oscuro
    'Grey': '#95a5a6',        // Gris
    'Special': '#ff8c00'      // Naranja (Bombot)
  };

  // Specific tower type overrides
  const TYPE_COLORS = {
    'Glob': '#4CAF50',
    'Dark_Glob': 'img/Dark_Glob.png',
    'Demglob': 'img/Demglob.png',
    'Void_Glob': 'img/Void Glob.png',
    'Pyce_Glob': '#00ff88',
    'Poop_Glob': '#8B4513',
    'Golden_Glob': '#ffd700',
    'Rainbow_Glob': null,      // special: rainbow gradient
    'Red_Glob': '#e74c3c',
    'Molten_Glob': '#ff4500',
    'Robotic_Glob': '#e74c3c',
    'Soap_Glob': '#3498db',
    'Cotton_Glob': '#87CEEB',
    'Comet_Glob': '#555555',
    'Dark_Glob': '#1a1a2e',
    'Demglob': '#c394fc',      // Lila obligatorio
    'Old_Glob': '#808080',
    'Pyce_Glob': '#00ff88',
    'Work_Bombot': null        // Bomba negra sin tintado
  };

  // ===== 3D TINTED PROJECTILE SYSTEM PARA TODOS =====
  const tintColor = opts.color || TYPE_COLORS[shooter.type] || FAMILY_COLORS[shooter.family] || (isEnemy ? '#ff4444' : '#FFFFFF');
  const imgUrl = `url('${projImg}')`;

  if (isBomb) {
    el.style.backgroundImage = imgUrl;
    el.style.backgroundSize = '100% 100%';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundPosition = 'center';
  } else if (!isEnemy && shooter.type === 'Rainbow_Glob' && !opts.color) {
    el.style.maskImage = imgUrl;
    el.style.webkitMaskImage = imgUrl;
    el.style.maskSize = '100% 100%';
    el.style.webkitMaskSize = '100% 100%';
    el.style.maskRepeat = 'no-repeat';
    el.style.webkitMaskRepeat = 'no-repeat';
    el.style.maskPosition = 'center';
    el.style.webkitMaskPosition = 'center';
    el.style.background = 'linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff0000)';
    el.style.backgroundSize = '200% 100%';
    el.style.animation = 'rainbowShift 1s linear infinite';
    el.style.backgroundImage = imgUrl + ', ' + el.style.background;
    el.style.backgroundBlendMode = 'multiply, normal';
  } else {
    if (opts.color === 'multicolor') {
      el.style.backgroundImage = imgUrl + `, conic-gradient(#FFEA00,#00B4FF,#C58ED3,#8B0000)`;
    } else if (opts.color === 'gradient') {
      el.style.backgroundImage = imgUrl + `, linear-gradient(45deg, ${opts.from || '#FF7F00'}, ${opts.to || '#001F5B'})`;
    } else if (opts.color === 'blackwhite') {
      el.style.backgroundImage = imgUrl + `, radial-gradient(circle at 30% 30%, #fff 0%, #000 60%)`;
    } else if (tintColor) {
      el.style.backgroundColor = tintColor;
      el.style.backgroundImage = imgUrl;
    } else {
      el.style.backgroundImage = imgUrl;
    }

    el.style.backgroundSize = '100% 100%';
    el.style.backgroundPosition = 'center';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundBlendMode = 'multiply';

    // Mask for cropping properly
    el.style.maskImage = imgUrl;
    el.style.webkitMaskImage = imgUrl;
    el.style.maskSize = '100% 100%';
    el.style.webkitMaskSize = '100% 100%';
    el.style.maskRepeat = 'no-repeat';
    el.style.webkitMaskRepeat = 'no-repeat';
    el.style.maskPosition = 'center';
    el.style.webkitMaskPosition = 'center';
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

function getPyceKillTarget(type) {
  if (type === 'Spyware') return 150;
  if (type.startsWith('Bit')) return 450;
  if (type.startsWith('Byte')) return 350;
  const targets = {
    'Stupid_Pyce': 250, 'Pyce2': 250, 'Symbol_Pyce': 250,
    'Guest_Pyce': 200, 'Noob_Pyce': 200,
    '4motions_Pyce': 225, 'Flower_Pyce': 225, 'SO_Pyce': 225,
    '1x1x1x1_Pyce': 6, 'NOeye_Pyce': 5, 'MoonStar_Pyce': 4,
    'Stupid_GoldPyce': 15, 'Mimic_Pyce': 3,
    'Bomb_Pyce': 255, 'Knight_Pyce': 175, 'Cannon_Pycer': 175,
    'Arky': 5, 'CrystArky': 3, 'ArkyVoid': 3, 'Fireflies': 250,
    'HoloPyce': 175, 'Strechy_Pyce': 175, 'Rebel_Pyce': 175
  };
  return targets[type] || 9999;
}

function checkPyceMorphUnlock() {
  if (!gameState.unlockedSkins.includes('pyce_morph')) {
    const types = ['Stupid_Pyce', 'Pyce2', 'Symbol_Pyce', 'Guest_Pyce', 'Noob_Pyce', '4motions_Pyce', 'Flower_Pyce', 'SO_Pyce', '1x1x1x1_Pyce', 'NOeye_Pyce', 'MoonStar_Pyce', 'Stupid_GoldPyce', 'Mimic_Pyce', 'Bomb_Pyce', 'Knight_Pyce', 'Cannon_Pycer', 'HoloPyce', 'Strechy_Pyce', 'Rebel_Pyce'];
    let allMaxed = true;
    for (const t of types) {
      if ((gameState.pycesKilled[t] || 0) < getPyceKillTarget(t)) {
        allMaxed = false; break;
      }
    }
    if (allMaxed) {
      gameState.unlockedSkins.push('pyce_morph');
      showMessage("🎁 ¡SKIN 'Pyce Randomizer' DESBLOQUEADA!", 'success');
      saveProgress();
    }
  }
  checkEncyclopediaMaster();
}

function checkEncyclopediaMaster() {
  if (BADGES.encyclopediaMaster && BADGES.encyclopediaMaster.unlocked) return;
  const types = ['Stupid_Pyce', 'Pyce2', 'Symbol_Pyce', 'Guest_Pyce', 'Noob_Pyce', '4motions_Pyce', 'Flower_Pyce', 'SO_Pyce', '1x1x1x1_Pyce', 'NOeye_Pyce', 'MoonStar_Pyce', 'Stupid_GoldPyce', 'Mimic_Pyce', 'Bomb_Pyce', 'Knight_Pyce', 'Cannon_Pycer', 'HoloPyce', 'Strechy_Pyce', 'Rebel_Pyce'];
  let allPycesMaxed = true;
  for (const t of types) {
    if ((gameState.pycesKilled[t] || 0) < getPyceKillTarget(t)) {
      allPycesMaxed = false; break;
    }
  }
  const reqFamilies = ['Glob', 'Red_Glob', 'Soap_Glob', 'Ducky_Glob', 'Comet_Glob', 'Grey', 'Special'];
  let allFamiliesMaxed = true;
  for (const f of reqFamilies) {
    if (!gameState.maxedFamilies.includes(f)) {
      allFamiliesMaxed = false; break;
    }
  }
  if (allPycesMaxed && allFamiliesMaxed) {
    unlockBadge('encyclopediaMaster');
  }
}

function die(e, idx) {
  if (e.type === 'Bomb_Pyce') {
    showEffect(e.x, e.y, "BOOM!", "#ff4d4d");
    if (gameState.towers) {
      gameState.towers.forEach(t => {
        if (Math.hypot(t.x - e.x, t.y - e.y) < 150) {
          t.stunTimer = (t.stunTimer || 0) + 3;
          showEffect(t.x, t.y - 20, "STUNNED!", "#ff0000");
        }
      });
    }
  }

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
    if (e.isSpecialMimic) {
      gameState.consecutiveMimics++;
      unlockBadge('mimic1');
      if (gameState.consecutiveMimics >= 2) unlockBadge('mimic2');
      if (gameState.mode === 'corrupto') unlockBadge('corruptMimic');
      if (!gameState.unlockedSkins.includes('mimic_set')) {
        gameState.unlockedSkins.push('mimic_set');
        showMessage("🎁 ¡SKIN 'Mimic set' DESBLOQUEADA!", 'success');
        saveProgress();
      }
    }
  }
  e.el.remove();
  if (e.boss) unlockBadge('bossKiller');
  gameState.enemies.splice(idx, 1);
  gameState.pycesKilled[e.type] = (gameState.pycesKilled[e.type] || 0) + 1;
  
  if (gameState.roundKills) {
    gameState.roundKills.push(e.type);
    if (['BitY1', 'BitB4', 'BitG2', 'BitP3', 'ByteGB1', 'ByteYP2', 'BytePG3', 'ByteYB4'].every(bit => gameState.roundKills.includes(bit))) {
      unlockBadge('una_por_cada');
    }
  }

  checkPyceMorphUnlock();
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
      unlockBadge('urba_complet1');
    }
  }

  updateMetaUI();
}

function translate(key, params = {}) {
  if (key.startsWith('tower_') && key.endsWith('_name') && gameState.equippedSkins && gameState.equippedSkins['Global'] === 'pyce_morph') {
    const type = key.substring(6, key.length - 5);
    const pyceKeys = Object.keys(ENEMY_TYPES).filter(k => ENEMY_TYPES[k] && ENEMY_TYPES[k].image);
    let hash = 0;
    for (let i = 0; i < type.length; i++) hash += type.charCodeAt(i);
    const pyceId = pyceKeys[hash % pyceKeys.length];
    const e = ENEMY_TYPES[pyceId];
    return (TRANSLATIONS[currentLanguage][e.name] || e.name || pyceId);
  }

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

  const encBtn = document.getElementById('open-encyclopedia-btn');
  if (encBtn) encBtn.innerHTML = translate('btn_encyclopedia');

  const encTitle = document.querySelector('#encyclopedia-modal h2');
  if (encTitle) encTitle.innerHTML = translate('btn_encyclopedia');

  const encTabGlobs = document.getElementById('enc-tab-globs');
  if (encTabGlobs) encTabGlobs.innerHTML = translate('enc_tab_globs');

  const encTabPyces = document.getElementById('enc-tab-pyces');
  if (encTabPyces) encTabPyces.innerHTML = translate('enc_tab_pyces');

  const encTabBadges = document.getElementById('enc-tab-badges');
  if (encTabBadges) encTabBadges.innerHTML = translate('enc_tab_badges');

  updateAchievementsBtnUI();

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
  const isVictory = document.querySelector('#game-over .modal-content.victory');
  if (goHeader && !isVictory) goHeader.textContent = translate('gameOver');
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

  if (gameState.equippedSkins && gameState.equippedSkins['Global'] === 'pyce_morph') {
    const pyceKeys = Object.keys(ENEMY_TYPES).filter(k => ENEMY_TYPES[k] && ENEMY_TYPES[k].image);
    let hash = 0;
    for (let i = 0; i < type.length; i++) hash += type.charCodeAt(i);
    return ENEMY_TYPES[pyceKeys[hash % pyceKeys.length]].image;
  }

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
  p.id = 'range-preview'; p.className = 'range-indicator';
  p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.width = p.style.height = (range * 2) + 'px';
  document.getElementById('map').appendChild(p);
}

function updateAllTowerRanges() {
  const map = document.getElementById('map');
  if (!map) return;

  gameState.towers.forEach(t => {
    if (!t.rangeEl) {
      t.rangeEl = document.createElement('div');
      t.rangeEl.className = 'range-indicator';
      map.appendChild(t.rangeEl);
    }
    const r = t.range || 100;
    t.rangeEl.style.width = (r * 2) + 'px';
    t.rangeEl.style.height = (r * 2) + 'px';
    t.rangeEl.style.left = t.x + 'px';
    t.rangeEl.style.top = t.y + 'px';

    if (gameState.settings.showRanges) {
      t.rangeEl.style.display = 'block';
    } else {
      t.rangeEl.style.display = 'none';
    }
  });
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
  gameState.spawningActive = false;
  gameState.totalDamage = 0;
  gameState.usedGTackRed = false;
  gameState.usedGTackGrey = false;
  gameState.baseTookDamage = false;
  gameState.mimicSpawned = 0;
  gameState.consecutiveMimics = 0;
  gameState.uniquesBossSpawned = {};
  deselectTower();
  updateUI();
  drawTowerShop();
  document.getElementById('game-over').style.display = 'none';
}

function endGame(victory = false) {
  gameState.gameOver = true;
  gameState.spawningActive = false;
  const modal = document.getElementById('game-over');
  if (!modal) return;
  modal.style.display = 'flex';

  const title = modal.querySelector('h2');
  const msg = document.getElementById('game-over-msg');
  const content = modal.querySelector('.modal-content');

  if (victory) {
    if (content) content.classList.add('victory');
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
    if (content) content.classList.remove('victory');
    if (title) title.textContent = translate('gameOver');
    if (msg) msg.innerHTML = translate('waveStarted', { wave: gameState.wave }).replace('Oleada', 'Llegaste a la oleada').replace('Wave', 'You reached wave');
    saveProgress();
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
    if (t.type === 'Void_Glob') {
      shoot(t, target, { damage: dmg * 1.5, projectile: 'gold' });
      if (Math.random() < 0.2) { gameState.globetines += 3; showEffect(t.x, t.y, "+3 💰"); updateUI(); }
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
        <h3>🎮 Glob Defenders (GlD)</h3>
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
        <br>
        <p style="color: #ffd700; font-style: italic;">⚠️ <strong>Nota de campo:</strong> Presta mucha atención a los diálogos durante tus defensas... a veces el entorno o sus habitantes ocultan sorpresas y pistas vitales.</p>
      `;
    } else {
      container.innerHTML = `
        <h3>🎮 Glob Defenders (GlD)</h3>
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
        <br>
        <p style="color: #ffd700; font-style: italic;">⚠️ <strong>Field Note:</strong> Pay close attention to the dialogues during your defenses... sometimes the environment or its inhabitants hide surprises and vital clues.</p>
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
          <li><strong>Duckgrades (Currency)</strong>: Habilidades pasivas definitivas de cada familia de Globs. Desbloquéalas con Duck Pass Currency en la Tienda Meta.</li>
          <li><strong>G-Tacks</strong>: Habilidades activas poderosas (Definitivas) para torres de nivel máximo en combate. Desbloquéalas con PyCoins y Duck Pass Currency en la Tienda Meta.</li>
          <li><strong>Personalización de Aspectos</strong>: Desbloquea y equipa skins para tus familias de Globs para cambiar sus gráficos de combate y ataques especiales.</li>
        </ul>

        <h4>⌨️ Atajos de Teclado</h4>
        <ul>
          <li><strong>Tecla U</strong>: Sirve para Colocar una torre nueva o Mejorar/Evolucionar una seleccionada.</li>
          <li><strong>Tecla V</strong>: Vende rápidamente la torre seleccionada.</li>
          <li><strong>Tecla C</strong>: Cancela la selección de cualquier torre o cierra menús.</li>
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
          <li><strong>Duckgrades (Currency)</strong>: Ultimate passive skills for each Glob family. Unlock them with Duck Pass Currency in the Meta Shop.</li>
          <li><strong>G-Tacks</strong>: Powerful active abilities (Ultimates) for max level towers in combat. Unlock them with PyCoins and Duck Pass Currency in the Meta Shop.</li>
          <li><strong>Aesthetics Customization</strong>: Unlock and equip skins for your Glob families to change their battle sprites and special attacks.</li>
        </ul>

        <h4>⌨️ Hotkeys / Controls</h4>
        <ul>
          <li><strong>Key U</strong>: Used to Place a new tower or Upgrade/Evolve a selected one.</li>
          <li><strong>Key V</strong>: Quickly sells the selected tower.</li>
          <li><strong>Key C</strong>: Cancels any tower selection or closes menus.</li>
        </ul>
      `;
    }
  } else if (currentStoryTab === 'logs') {
    if (currentLanguage === 'es') {
      container.innerHTML = `
        <h3>📋 Historial de Actualizaciones (GlD v4.0.1 - TACTICAL LOADOUT)</h3>
        <p>¡El sistema de equipación ha llegado para cambiar la estrategia por completo!</p>
        <h4>Novedades del Parche:</h4>
        <ul>
          <li>🎒 <strong>Sistema de Equipación</strong>: Se ha introducido una nueva pestaña "Equipación" en la tienda. Ahora, antes de entrar en combate, ¡deberás elegir tu mazo con un máximo de 5 torres!</li>
          <li>⚙️ <strong>Menú Táctico</strong>: La barra de torres dentro del juego ahora se adapta para mostrar únicamente tu selección táctica.</li>
        </ul>

        <h3>📋 Historial de Actualizaciones (GlD v4.0.0 - URBAN REBORN: THE BIG UPDATE)</h3>
        <p>¡Urbanistic Road, la nueva ciudad ha llegado!! Trayendo consigo varios Pyces, enemigos y Globs nuevos!!</p>
        <h4>Novedades del Parche:</h4>
        <ul>
          <li>🏙️ <strong>NUEVOS PYCES</strong>: HoloPyce y Rebel Pyce (DESDE FtPy2 redibujados), Bomb Pyce, Knight Pyce, Cannon Pycer y Strechy Pyce.</li>
          <li>👾 <strong>ENEMIGOS NUEVOS</strong>: Bits, Bytes, Spywares, Fireflies y la llegada de Arky a la ciudad, con sus variantes de corrupto y Anti-Normal.</li>
          <li>🗼 <strong>Nuevos Globs</strong>: Han llegado Worker Glob (familia naranja), Balloon Glob (familia blanca), Streamer Glob (familia rosa) y un esperadísimo Bomb Glob, la primera torre instantánea del juego, que explotará cuando detecte un Pyce, todos ellos son criados en la ciudad y por ello necesitarás jugar dicho mapa para desbloquearlos... O desde el pase, una de dos.</li>
          <li>📱 <strong>Mejoras</strong>: Cambios en los diálogos, bugs de la comunidad fixeados y una mayor responsividad en móvil, todo ello para garantizar su jugabilidad.</li>
          <li>💎 <strong>Próximamente</strong>: Y quizás pronto lleguen las primeras skins para estas torres urbanas, pero démosle tiempo... Hay cristales en el horizonte que esperan caer muy pronto.</li>
        </ul>

        <h3>📋 Historial de Actualizaciones (GlD v3.2.0 - ENCICLOPEDIA DORADA Y ATAJOS)</h3>
        <p>¡Más formas de jugar y recompensas por completar la enciclopedia!</p>
        <h4>Novedades del Parche:</h4>
        <ul>
          <li>⌨️ <strong>Atajos de Teclado</strong>: Ahora puedes usar <strong>U</strong> para mejorar/colocar, <strong>C</strong> para cancelar/cerrar y <strong>V</strong> para vender.</li>
          <li>📖 <strong>Progreso en la Enciclopedia</strong>: Cada Pyce tiene ahora una barra de eliminaciones. Al completarlas todas, desbloquearás la skin global exclusiva <strong>Pyce Randomizer</strong>.</li>
          <li>🌑 <strong>Void Glob</strong>: La evolución final de la línea Negra ha llegado. Sus oscuros proyectiles te perseguirán sin descanso.</li>
          <li>⚖️ <strong>Balanceo</strong>: Se ha reducido drásticamente la probabilidad de aparición del Stupid GoldPyce.</li>
          <li>🎁 <strong>Nuevas Skins y Secretos</strong>: Añadido el "Set de Ensueño" y el "Set Judicial" (Colaboración comunitaria). Y quizás, algún código haya despertado de sus sueños...</li>
          <li>📝 <strong>Lore y Créditos</strong>: Textos y descripciones de las skins ajustadas en la tienda para hacer honor a sus creadores y dar más contexto.</li>
          <li>💬 <strong>Rehabilitación de Diálogos</strong>: ¡Hemos añadido nuevos diálogos y dado un poco de lore oculto a los NPCs! Presta atención a lo que dicen durante las oleadas o cuando aparecen jefes.</li>
        </ul>

        <h3>📋 Historial de Actualizaciones (GlD v3.1.0 - ENCICLOPEDIA VIVIENTE Y PERSONALIDAD DIALOGADA)</h3>
        <p>¡Los enemigos cobran vida y los misterios del sistema se revelan!</p>
        
        <h4>Novedades del Parche:</h4>
        <ul>
          <li>📖 <strong>Enciclopedia Viviente</strong>: ¡Hemos añadido lore y descripciones únicas para todos los Pyces! Ahora podrás conocer la historia detrás de cada enemigo en la enciclopedia, junto con sus mecánicas resaltadas.</li>
          <li>🌐 <strong>Traducción Total</strong>: La enciclopedia, los modos secretos y las descripciones de las mecánicas están 100% internacionalizados y adaptados perfectamente al inglés y al español.</li>
          <li>👾 <strong>Un normal desnormalizado...</strong>: Quizas presionando algun logo- ¿Sabes que? No lo hagas, podrias estar ante un modo peligroso, mejor preparate antes de lanzarte al ataque.</li>
          <li>🔧 <strong>Correcciones Menores</strong>: Los nombres y estadísticas se han estandarizado según los archivos originales del juego.</li>
        </ul>

        <h3>📋 Historial de Actualizaciones (GlD v3.0.0 - LANZAMIENTO)</h3>
        <p>¡El esperado lanzamiento oficial con mejoras visuales y colaboraciones exclusivas!</p>

        <h4>Novedades del Parche:</h4>
        <ul>
          <li>✨ <strong>Mejores Visuales</strong>: Nuevas <span style="color: #ffd700;">imágenes para proyectiles</span>, torres mejor pulidas y una opción nueva en ajustes para <strong>ver el rango de las torres</strong>.</li>
          <li>🦈 <strong>Nuevas Skins</strong>: Demos la bienvenida a <strong>SharkBot (RoboTibu)</strong>, creada por <span style="color: #ff3333;">@Nitrogen</span> y rehecha por <span style="color: #ff69b4;">@KirByte_Bi</span>. También se ha creado una skin de "Among Us" un tanto singular... cada quien sus gustos, supongo.</li>
          <li>⭐ <strong>COLLAB EXCLUSIVA</strong>: <strong>Star Jump</strong> (de <span style="color: #ff69b4;">@KirByte_Bi</span>) ha colaborado con Glob Defenders. ¡Ahora podrás comprar la skin de <strong>Starry</strong>, el protagonista de dicho juego, para la Familia Gris!</li>
          <li>🎁 <strong>Muchos códigos nuevos</strong>: Encuéntralos por ahí ocultos o simplemente usa tu imaginación.</li>
        </ul>

        <h3>📋 Versiones Pre-Lanzamiento (v2.x.x y anteriores)</h3>
        <p>Se realizaron múltiples pruebas durante la fase beta, añadiendo sistemas como G-Tacks, modos de historia, y reajustes del progreso general para dar forma a lo que hoy es Glob Defenders.</p>
      `;
    } else {
      container.innerHTML = `
        <h3>📋 Update Logs (GlD v4.0.1 - TACTICAL LOADOUT)</h3>
        <p>The equipment system has arrived to completely change the strategy!</p>
        <h4>What's New in this Patch:</h4>
        <ul>
          <li>🎒 <strong>Equipment System</strong>: A new "Equip" tab has been introduced in the shop. Now, before going into battle, you must choose your loadout with a maximum of 5 towers!</li>
          <li>⚙️ <strong>Tactical Menu</strong>: The in-game tower bar now adapts to show only your tactical selection.</li>
        </ul>

        <h3>📋 Update Logs (GlD v4.0.0 - URBAN REBORN: THE BIG UPDATE)</h3>
        <p>Urbanistic Road, the new city has arrived!! Bringing with it several new Pyces, enemies, and Globs!!</p>
        <h4>What's New in this Patch:</h4>
        <ul>
          <li>🏙️ <strong>NEW PYCES</strong>: HoloPyce and Rebel Pyce (redrawn FROM FtPy2), Bomb Pyce, Knight Pyce, Cannon Pycer, and Strechy Pyce.</li>
          <li>👾 <strong>NEW ENEMIES</strong>: Bits, Bytes, Spywares, Fireflies, and the arrival of Arky to the city, along with his Corrupt and Anti-Normal variants.</li>
          <li>🗼 <strong>New Globs</strong>: Worker Glob (orange family), Balloon Glob (white family), Streamer Glob (pink family), and a highly anticipated Bomb Glob have arrived! Bomb Glob is the first instant tower in the game, which will explode when it detects a Pyce. All of them are raised in the city, so you'll need to play that map to unlock them... Or get them from the pass, one of the two.</li>
          <li>📱 <strong>Improvements</strong>: Dialogue changes, community bugs fixed, and greater mobile responsiveness, all to guarantee a better gameplay experience.</li>
          <li>💎 <strong>Coming Soon</strong>: And maybe the first skins for these urban towers will arrive soon, but let's give it time... There are crystals on the horizon waiting to fall very soon.</li>
        </ul>

        <h3>📋 Update Logs (GlD v3.2.0 - GOLDEN ENCYCLOPEDIA & HOTKEYS)</h3>
        <p>More ways to play and rewards for completing the encyclopedia!</p>
        <h4>What's New in this Patch:</h4>
        <ul>
          <li>⌨️ <strong>Keyboard Hotkeys</strong>: You can now use <strong>U</strong> to upgrade/place, <strong>C</strong> to cancel/close and <strong>V</strong> to sell.</li>
          <li>📖 <strong>Encyclopedia Progress</strong>: Each Pyce now has a kill tracker bar. Completing all of them unlocks the exclusive global skin <strong>Pyce Randomizer</strong>.</li>
          <li>🌑 <strong>Void Glob</strong>: The final evolution of the Black family is here. Its dark projectiles will track you relentlessly.</li>
          <li>⚖️ <strong>Balance</strong>: The spawn probability of the Stupid GoldPyce has been drastically reduced.</li>
          <li>🎁 <strong>New Skins & Secrets</strong>: Added "Dreams Set" and "Judicial Set" (Community Collab). And maybe, a code has awakened from its dreams...</li>
          <li>📝 <strong>Lore & Credits</strong>: Shop texts and skin descriptions have been adjusted to honor their creators and provide more context.</li>
          <li>💬 <strong>Dialogue Rehabilitation</strong>: We added new dialogues and even some hidden lore from NPCs! Pay close attention to what they say during waves or when bosses appear.</li>
        </ul>

        <h3>📋 Update Logs (GlD v3.1.0 - LIVING ENCYCLOPEDIA AND DIALOGUED PERSONALITY)</h3>
        <p>The enemies come to life and the system's mysteries are revealed!</p>
        
        <h4>What's New in this Patch:</h4>
        <ul>
          <li>📖 <strong>Living Encyclopedia</strong>: We've added lore and unique descriptions for all Pyces! Now you can learn the story behind each enemy in the encyclopedia, alongside their highlighted mechanics.</li>
          <li>🌐 <strong>Full Translation</strong>: The encyclopedia, secret modes, and mechanic descriptions are 100% internationalized and perfectly adapted to English and Spanish.</li>
          <li>👾 <strong>A desmesurated normal...</strong>: Maybe pressing some logo- You know what? Don't do it, you could be facing a dangerous mode, better prepare yourself before launching into the attack.</li>
          <li>🔧 <strong>Minor Fixes</strong>: Names and stats have been standardized according to the original game files.</li>
        </ul>

        <h3>📋 Update Logs (GlD v3.0.0 - LAUNCH)</h3>
        <p>The highly anticipated official launch featuring visual overhauls and exclusive collaborations!</p>

        <h4>What's New in this Patch:</h4>
        <ul>
          <li>✨ <strong>Better Visuals</strong>: New <span style="color: #ffd700;">projectile images</span>, highly polished towers, and a new settings option to <strong>view tower ranges</strong>.</li>
          <li>🦈 <strong>New Skins</strong>: Welcome <strong>SharkBot</strong>, created by <span style="color: #ff3333;">@Nitrogen</span> and remade by <span style="color: #ff69b4;">@KirByte_Bi</span>. We also added a somewhat peculiar "Among Us" skin... to each their own, I guess.</li>
          <li>⭐ <strong>EXCLUSIVE COLLAB</strong>: <strong>Star Jump</strong> (by <span style="color: #ff69b4;">@KirByte_Bi</span>) has collaborated with Glob Defenders. You can now buy the <strong>Starry</strong> skin, the protagonist of that game, for the Grey Family!</li>
          <li>🎁 <strong>Many new codes</strong>: Find them hidden around or simply use your imagination.</li>
        </ul>

        <h3>📋 Pre-Launch Versions (v2.x.x and older)</h3>
        <p>Multiple tests were performed during the beta phase, adding systems like G-Tacks, story modes, and overall progression rebalances to shape Glob Defenders into what it is today.</p>
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
