// [LOGICA DEL JUEGO]
// ===================== ESTADO DEL JUEGO =====================

let currentLanguage = 'es';
let godsShadowClueOverride = false;
let backgroundMusic = null;
let musicEnabled = true;
let showHitbox = false;
let offlineModeActive = false;
let lightModeToggleCount = 0;
let lightModeGlitchTriggered = false;
let offensiveUsernameJumpscareTimeout = null;
let moderationAccountDeletionHandled = false;

// --- MULTIPLAYER ---
let socket = null;
let supabaseClient = null;
let activeCloudUserId = null;
let cloudProgressReady = false;
let cloudProgressSaveTimer = null;
let cloudProgressSaveQueue = Promise.resolve();
let pendingCloudProgressSave = null;
let cloudProgressSaveError = null;
let multiplayerServerClosed = false;
let autoJoinAttempted = false;
let currentSeed = null;
let isSeedHost = false;
let multiplayerSyncInterval = null;
let multiplayerPlayerCount = 1;
let multiplayerTowerLimits = null;
let multiplayerEnabled = false;
let multiplayerPlayers = [];
let multiplayerSpectator = false;
let multiplayerSpectatorSavedGlobetines = null;
let multiplayerViewedProfile = null;
let applyingMultiplayerAction = false;
let multiplayerActionOwner = null;
let multiplayerChatMode = 'safe';
let multiplayerChatEntries = [];
let multiplayerChatLastSentAt = 0;
let profileClockInterval = null;
let sessionClockInterval = null;
let sessionStartedAt = null;
let roundCheckpointInterval = null;
let nextBreakReminderAt = 2 * 60 * 60 * 1000;
let lastBreakReminderIndex = -1;
const RARE_ENEMY_WAVE_SPAWN_CHANCE = 0.3;
const BUSHI_BRELLA_MAX_SPAWNS = 3;
const BUSHI_BRELLA_SKIN_DROP_CHANCE = 0.01;
const MULTIPLAYER_CHAT_MAX_LENGTH = 240;
const MULTIPLAYER_CHAT_MAX_ENTRIES = 40;
const OFFENSIVE_ACCOUNT_DELETION_THRESHOLD = 25;
const SAFE_MULTIPLAYER_CHAT_MESSAGES = {
  es: [
    '¡Buen trabajo, equipo!',
    '¡Vamos, podemos con esta oleada!',
    'Gracias por jugar conmigo.',
    '¡Defensa impecable!',
    '¿Alguien necesita ayuda?',
    '¡Buena estrategia!',
    '¡Ánimo, equipo!',
    '¡GG, ha sido una gran partida!'
  ],
  en: [
    'Great work, team!',
    'We can beat this wave!',
    'Thanks for playing with me.',
    'Flawless defense!',
    'Does anyone need help?',
    'Great strategy!',
    'You got this, team!',
    'GG, that was a great match!'
  ]
};
const REWAMPED_SKIN_IDS = ['rewamped_green_set', 'rewamped_red_set', 'rewamped_blue_set', 'rewamped_black_set', 'ducky_rewamp_set', 'rewamped_gray_set'];
// Lista historica de skins Rewamp con efecto RGB. Se mantiene por
// retrocompatibilidad, pero MEC-01 ya no la exige: cualquier skin nueva que
// defina rgbTypes y se marque con `rgbRewamp: true` en SKINS_DATA recibe el
// efecto RGB automaticamente, sin necesidad de anadirla aqui.
const RGB_REWAMP_SKIN_IDS = ['green_rgb_sr', 'red_rgb_sr', 'blue_rgb_sr', 'black_rgb_sr', 'ducky_rgb_sr', 'worker_rgb', 'iex_rgb', 'gray_rgb_sr'];

// Determina si una skin es un Rewamp RGB (recibe el arcoiris animado). Una skin
// cuenta como RGB Rewamp si declara rgbTypes y, o bien esta en la lista
// historica, o bien se marca explicitamente con rgbRewamp: true. Esto permite
// que todos los nuevos Globs Rewamp hereden el efecto sin editar listas.
function isRgbRewampSkin(skin) {
  if (!skin || !Array.isArray(skin.rgbTypes)) return false;
  return skin.rgbRewamp === true || RGB_REWAMP_SKIN_IDS.includes(skin.id);
}

// Las variables CSS con url() relativas se resuelven respecto a la hoja que
// las usa (Vista/styles.css), no respecto a index.html. Desde que el CSS vive
// en Vista/, 'Recursos/...' apuntaba a 'Vista/Recursos/...' (404) y las
// máscaras RGB / Rainbow Fuel / GODs Shadow quedaban vacías. Por eso cualquier
// imagen que se pase a una variable CSS debe ir como URL absoluta.
function getAbsoluteAssetUrl(path) {
  try {
    return new URL(path, document.baseURI).href.replace(/'/g, '%27').replace(/"/g, '%22');
  } catch (error) {
    return encodeURI(path);
  }
}

// --- RGB sin mask-image ------------------------------------------------------
// mask-image carga la imagen en modo CORS: abriendo index.html como archivo
// (file://) Chrome la bloquea y el arcoíris desaparece. En su lugar se dibuja
// el mismo degradado RGB pre-Kiro en un <canvas>, recortado con la silueta del
// PNG (destination-in). drawImage sí está permitido con file://, así que el
// efecto funciona igual en local y publicado. Si el canvas falla, queda el
// pseudo-elemento con máscara como respaldo.
//
// Dos looks distintos (como antes del rework 9868c72):
// - RGB normal ('rgb'): arcoíris claro/pastel que barre la silueta de
//   izquierda a derecha, con la imagen blanqueada en 'multiply' encima para
//   conservar contornos negros y ojos.
// - Rainbow Fuel ('fuel'): arcoíris vivo e intenso que cubre toda la silueta.
const RGB_OVERLAY_COLORS = ['#ff0040', '#ff8c00', '#ffee00', '#28e04b', '#00c2ff', '#6a5cff', '#d138ff', '#ff0040'];
const RGB_OVERLAY_HOST_SELECTOR = '.rgb-avatar-image, .rainbow-fuel-avatar, .skin-preview.rgb-rewamp-preview, .skin-preview.rgb-fx-preview';
// colorKeep: cuánto del color original de la imagen se conserva encima del
// arcoíris. Evita que los Globs claros (Ducky, pasteles) queden como un bloque
// de arcoíris plano parecido a Rainbow Fuel: se siguen distinguiendo sus zonas
// de color y sus sombras.
const RGB_OVERLAY_STYLES = {
  rgb: { stripFilter: 'saturate(0.6) brightness(1.4)', periodMs: 2600, ink: true, colorKeep: 0.35 },
  fuel: { stripFilter: 'saturate(1.6) brightness(1.12)', periodMs: 2500, ink: false, colorKeep: 0 },
  // Alternate: arcoíris completo mezclado por color sobre la imagen (conserva
  // sus luces y sombras); el tono gira con CSS (ver .rgb-overlay-alternate).
  alternate: { stripFilter: 'saturate(1.2)', periodMs: 0, ink: false, colorKeep: 0, colorBlend: true }
};
// El barrido RGB siempre se anima, como antes de Kiro (ver nota en styles.css
// sobre reduced-motion).
const RGB_OVERLAY_REDUCED_MOTION = false;
const rgbOverlayRegistry = new Set();
let rgbOverlayFrame = null;

function canvasSupportsFilter(ctx) {
  if (!ctx || typeof ctx.filter !== 'string') return false;
  ctx.filter = 'brightness(1.5)';
  const supported = ctx.filter === 'brightness(1.5)';
  ctx.filter = 'none';
  return supported;
}

// Franja de doble ancho con el degradado: se desplaza para el barrido y su
// primer y último color coinciden, así que el bucle no tiene cortes.
function buildRgbOverlayStrip(width, height, style) {
  const raw = document.createElement('canvas');
  raw.width = width * 2;
  raw.height = height;
  const rawCtx = raw.getContext('2d');
  const gradient = rawCtx.createLinearGradient(0, 0, width * 2, 0);
  RGB_OVERLAY_COLORS.forEach((color, index) =>
    gradient.addColorStop(index / (RGB_OVERLAY_COLORS.length - 1), color));
  rawCtx.fillStyle = gradient;
  rawCtx.fillRect(0, 0, width * 2, height);
  const strip = document.createElement('canvas');
  strip.width = width * 2;
  strip.height = height;
  const stripCtx = strip.getContext('2d');
  if (canvasSupportsFilter(stripCtx)) stripCtx.filter = style.stripFilter;
  stripCtx.drawImage(raw, 0, 0);
  return strip;
}

// Imagen blanqueada (grayscale + brightness + contrast): blanco donde hay
// color y negro en los contornos. En 'multiply' deja pasar el arcoíris y
// conserva las líneas negras. Sin ctx.filter se aproxima con modos de mezcla.
function buildRgbOverlayInk(image, width, height) {
  const ink = document.createElement('canvas');
  ink.width = width;
  ink.height = height;
  const ctx = ink.getContext('2d');
  // Blanqueado suave: aclara para que pase el arcoíris, pero conserva los
  // tonos medios (sombras, zonas de distinto color) en vez de volverlos blanco.
  if (canvasSupportsFilter(ctx)) {
    ctx.filter = 'grayscale(1) brightness(1.3) contrast(1.15)';
    ctx.drawImage(image, 0, 0, width, height);
    ctx.filter = 'none';
  } else {
    ctx.drawImage(image, 0, 0, width, height);
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'color-dodge';
    ctx.fillStyle = '#4d4d4d';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(image, 0, 0, width, height);
  return ink;
}

function drawRgbOverlayFrame(entry, now) {
  const { ctx, image, strip, ink, width, height, style } = entry;
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, width, height);
  if (style.colorBlend) {
    // Alternate: imagen original + arcoíris completo en modo 'color'.
    const layer = entry.colorLayer || (entry.colorLayer = (() => {
      const c = document.createElement('canvas');
      c.width = width;
      c.height = height;
      const cctx = c.getContext('2d');
      cctx.drawImage(strip, 0, 0, width, height);
      cctx.globalCompositeOperation = 'destination-in';
      cctx.drawImage(image, 0, 0, width, height);
      return c;
    })());
    ctx.drawImage(image, 0, 0, width, height);
    ctx.globalAlpha = 0.9;
    ctx.globalCompositeOperation = 'color';
    ctx.drawImage(layer, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    return;
  }
  const phase = RGB_OVERLAY_REDUCED_MOTION || !style.periodMs ? 0 : (now % style.periodMs) / style.periodMs;
  // Barrido de izquierda a derecha.
  const offset = phase * width * 2;
  ctx.drawImage(strip, offset, 0);
  ctx.drawImage(strip, offset - width * 2, 0);
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(image, 0, 0, width, height);
  if (ink) {
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(ink, 0, 0);
  }
  if (style.colorKeep) {
    // Devuelve parte del color original, solo dentro de la silueta.
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = style.colorKeep;
    ctx.drawImage(image, 0, 0, width, height);
    ctx.globalAlpha = 1;
  }
  ctx.globalCompositeOperation = 'source-over';
}

// Un único bucle (~30 fps) para todas las capas. Se saltan las ocultas y se
// descartan las que ya no están en el DOM. Usa un temporizador en lugar de
// requestAnimationFrame para que el barrido avance en todos los entornos; el
// navegador ya lo ralentiza solo cuando la pestaña está en segundo plano.
function tickRgbOverlays() {
  rgbOverlayFrame = null;
  const now = performance.now();
  rgbOverlayRegistry.forEach(entry => {
    if (!entry.canvas.isConnected) {
      if (entry.wasConnected) rgbOverlayRegistry.delete(entry);
      return;
    }
    entry.wasConnected = true;
    if (!entry.canvas.getClientRects().length) return;
    drawRgbOverlayFrame(entry, now);
  });
  if (rgbOverlayRegistry.size) rgbOverlayFrame = setTimeout(tickRgbOverlays, 33);
}

function createRgbOverlayCanvas(src, variant, onReady) {
  const style = RGB_OVERLAY_STYLES[variant] || RGB_OVERLAY_STYLES.rgb;
  const canvas = document.createElement('canvas');
  canvas.className = variant === 'fuel' ? 'rgb-overlay rgb-overlay-fuel'
    : variant === 'alternate' ? 'rgb-overlay rgb-overlay-alternate' : 'rgb-overlay';
  canvas.dataset.src = src;
  canvas.dataset.variant = variant;
  canvas.setAttribute('aria-hidden', 'true');
  const image = new Image();
  image.onload = () => {
    const maxSide = 200;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth || 1, image.naturalHeight || 1));
    const width = Math.max(1, Math.round((image.naturalWidth || 1) * scale));
    const height = Math.max(1, Math.round((image.naturalHeight || 1) * scale));
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const entry = {
      canvas, ctx, image, width, height, style,
      strip: buildRgbOverlayStrip(width, height, style),
      ink: style.ink ? buildRgbOverlayInk(image, width, height) : null,
      wasConnected: canvas.isConnected
    };
    drawRgbOverlayFrame(entry, performance.now());
    canvas.classList.add('ready');
    if (typeof onReady === 'function') onReady();
    // Alternate es estático en el canvas (lo anima CSS); no entra en el bucle.
    if (RGB_OVERLAY_REDUCED_MOTION || style.colorBlend) return;
    rgbOverlayRegistry.add(entry);
    if (!rgbOverlayFrame) rgbOverlayFrame = setTimeout(tickRgbOverlays, 33);
  };
  image.src = src;
  return canvas;
}

// Torres: añade, reutiliza o quita la capa RGB según el efecto activo.
// variant: 'rgb' | 'fuel' | 'alternate' | '' (sin efecto).
function syncRgbOverlay(host, variant, src) {
  if (!host) return;
  const existing = host.querySelector(':scope > .rgb-overlay');
  if (!variant || !src) {
    existing?.remove();
    host.classList.remove('rgb-canvas');
    return;
  }
  if (existing && existing.dataset.src === src && existing.dataset.variant === variant) {
    if (existing.classList.contains('ready')) host.classList.add('rgb-canvas');
    return;
  }
  existing?.remove();
  host.classList.remove('rgb-canvas');
  host.appendChild(createRgbOverlayCanvas(src, variant, () => host.classList.add('rgb-canvas')));
}

// Avatares y previews: se generan con innerHTML en muchos sitios, así que se
// hidratan automáticamente al entrar en el DOM.
function hydrateRgbOverlays(root) {
  if (!root || root.nodeType !== 1 && root !== document) return;
  const hosts = [];
  if (root.matches?.(RGB_OVERLAY_HOST_SELECTOR)) hosts.push(root);
  root.querySelectorAll?.(RGB_OVERLAY_HOST_SELECTOR).forEach(host => hosts.push(host));
  hosts.forEach(host => {
    if (host.querySelector(':scope > .rgb-overlay')) return;
    // Los efectos de filtro (Monochrome, Negativo, Nevado) son solo CSS.
    if (['monochrome', 'negative', 'snowy'].some(effect => host.classList.contains(effect))) return;
    const image = host.querySelector(':scope > img');
    if (!image?.src) return;
    const variant = host.dataset.rgbVariant ||
      (host.classList.contains('rainbow-fuel-avatar') ? 'fuel'
        : host.classList.contains('alternate') ? 'alternate' : 'rgb');
    image.after(createRgbOverlayCanvas(image.src, variant, () => host.classList.add('rgb-canvas')));
  });
}

if (typeof MutationObserver !== 'undefined' && document.body) {
  new MutationObserver(mutations => {
    mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
      // Las torres del mapa se gestionan en applyTowerEffects; se ignora el
      // mapa para no procesar cada enemigo o proyectil que aparece.
      if (node.nodeType !== 1 || node.classList.contains('rgb-overlay') || node.closest('#map')) return;
      hydrateRgbOverlays(node);
    }));
  }).observe(document.body, { childList: true, subtree: true });
  hydrateRgbOverlays(document);
}

// Variante por id: busca la skin por su id dentro de una familia y delega en
// isRgbRewampSkin. Devuelve false si no la encuentra.
function isRgbRewampSkinId(family, skinId) {
  const skin = SKINS_DATA[family]?.find(item => item.id === skinId);
  return isRgbRewampSkin(skin);
}

// --- Efectos de perfil y skins ----------------------------------------------
// Cada efecto es un "apartado" propio: en el perfil tiene su sección de
// imágenes y en la tienda sus skins (la imagen Rewamp de la familia con el
// filtro). Van aparte de las skins Rewamp y RGB, que siguen existiendo.
// - RGB: el de siempre (skins RGB Secretas / borde GLB Fever).
// - Rainbow Fuel: se desbloquea por familia (100 clics en el login).
// - Monochrome, Negative, Snowy y Alternate: recompensas del Pase de Invierno.
const PROFILE_FX_EFFECTS = Object.freeze([
  { id: 'rainbow-fuel', es: 'Rainbow Fuel', en: 'Rainbow Fuel', source: 'fuel' },
  { id: 'monochrome', es: 'Monochrome', en: 'Monochrome', source: 'winter' },
  { id: 'negative', es: 'Negativo', en: 'Negative', source: 'winter' },
  { id: 'snowy', es: 'Nevado', en: 'Snowy', source: 'winter' },
  { id: 'alternate', es: 'Alternate', en: 'Alternate', source: 'winter' }
]);
// Efectos que se ganan en el Pase de Invierno (se guardan en unlockedRecolors).
const RGB_RECOLOR_EFFECT_IDS = Object.freeze(['monochrome', 'negative', 'snowy', 'alternate']);
// Efectos que son solo un filtro CSS sobre la imagen (sin capa canvas).
const PROFILE_FILTER_EFFECT_IDS = Object.freeze(['monochrome', 'negative', 'snowy']);

function isRgbRecolorEffect(effectId) {
  return RGB_RECOLOR_EFFECT_IDS.includes(effectId);
}

function getUnlockedRgbRecolorEffects() {
  const unlocked = Array.isArray(gameState?.unlockedRecolors)
    ? gameState.unlockedRecolors
    : [];
  return [...new Set(unlocked.filter(isRgbRecolorEffect))];
}

function getFxEffectLabel(effectId) {
  if (effectId === 'rgb') return 'RGB';
  const effect = PROFILE_FX_EFFECTS.find(item => item.id === effectId);
  return effect ? (currentLanguage === 'en' ? effect.en : effect.es) : effectId;
}

function isFxEffectUnlockedForFamily(effectId, family) {
  if (gameState?.debugState === 'unlocked') return true;
  if (effectId === 'rainbow-fuel') {
    return Array.isArray(gameState?.rainbowFuelUnlocked) && gameState.rainbowFuelUnlocked.includes(family);
  }
  return getUnlockedRgbRecolorEffects().includes(effectId);
}

function getFamilyRgbSkin(family) {
  return SKINS_DATA[family]?.find(isRgbRewampSkin) || null;
}

function getFamilyRewampBaseSkin(family) {
  return SKINS_DATA[family]?.find(skin => REWAMPED_SKIN_IDS.includes(skin.id)) || null;
}

// Requisito base de las skins/imágenes con efecto: tener la Rewamp de la
// familia (o, en familias sin Rewamp como Worker e IEx, tener la familia).
function isFamilyRewampBaseUnlocked(family) {
  if (gameState?.debugState === 'unlocked') return true;
  const rewamp = getFamilyRewampBaseSkin(family);
  return rewamp
    ? Boolean(gameState.unlockedSkins?.includes(rewamp.id))
    : isTowerOwned(family);
}

function isFxSkinUnlocked(skin) {
  return Boolean(skin?.fxEffect &&
    isFxEffectUnlockedForFamily(skin.fxEffect, skin.fxFamily) &&
    isFamilyRewampBaseUnlocked(skin.fxFamily));
}

// Genera una skin por efecto y familia RGB (a partir de las imágenes de su
// skin RGB, que es la Rewamp o la base en Worker/IEx). Se insertan en
// SKINS_DATA para que la tienda, equipar y el render las traten como skins.
(function registerProfileFxSkins() {
  if (typeof SKINS_DATA === 'undefined') return;
  const addText = (key, es, en) => {
    if (typeof TRANSLATIONS === 'undefined') return;
    if (TRANSLATIONS.es) TRANSLATIONS.es[key] = es;
    if (TRANSLATIONS.en) TRANSLATIONS.en[key] = en;
  };
  Object.keys(SKINS_DATA).forEach(family => {
    const rgbSkin = getFamilyRgbSkin(family);
    if (!rgbSkin) return;
    const hasRewamp = Boolean(getFamilyRewampBaseSkin(family));
    const firstType = rgbSkin.rgbTypes[0];
    const towerKey = TOWER_TYPES[firstType]?.name;
    const towerEs = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS.es?.[towerKey]) || firstType;
    const towerEn = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS.en?.[towerKey]) || firstType;
    let insertAt = SKINS_DATA[family].indexOf(rgbSkin) + 1;
    PROFILE_FX_EFFECTS.forEach(effect => {
      const id = `${rgbSkin.id}__fx_${effect.id}`;
      if (SKINS_DATA[family].some(skin => skin.id === id)) return;
      const nameKey = `skin_fx_${family}_${effect.id}_name`;
      const descKey = `skin_fx_${family}_${effect.id}_desc`;
      addText(nameKey,
        `${towerEs}${hasRewamp ? ' Rewamp' : ''} · ${effect.es}`,
        `${towerEn}${hasRewamp ? ' Rewamp' : ''} · ${effect.en}`);
      const reqEs = effect.source === 'fuel'
        ? 'Requiere RAINBOW FUEL de esta familia'
        : `Requiere el efecto ${effect.es} del Pase de Invierno`;
      const reqEn = effect.source === 'fuel'
        ? 'Requires this family\'s RAINBOW FUEL'
        : `Requires the ${effect.en} effect from the Winter Pass`;
      addText(descKey,
        `La familia ${hasRewamp ? 'Rewamp' : 'base'} con el filtro ${effect.es}. ${reqEs}${hasRewamp ? ' y la skin Rewamp de la familia' : ''}.`,
        `The ${hasRewamp ? 'Rewamp' : 'base'} family with the ${effect.en} filter. ${reqEn}${hasRewamp ? ' and the family Rewamp skin' : ''}.`);
      SKINS_DATA[family].splice(insertAt++, 0, {
        id, name: nameKey, desc: descKey, cost: 0, type: 'free', isSpecial: true,
        unlockCondition: 'profile_effect',
        fxEffect: effect.id, fxFamily: family, fxBaseSkin: rgbSkin.id,
        fxTypes: [...rgbSkin.rgbTypes],
        skins: { ...rgbSkin.skins }
      });
    });
  });
})();

function getProfileAvatarRgbFamily(avatar) {
  if (avatar?.rgbFamily) return avatar.rgbFamily;
  const match = /^glob:([^:]+):rgb-rewamp$/.exec(avatar?.id || '');
  return match && TOWER_TYPES[match[1]] ? getTowerFamily(match[1]) : null;
}

// Efecto visual de un avatar: el de su apartado (avatar.effect), RGB en los
// avatares RGB, o RGB sobre cualquier imagen con el borde GLB Fever.
// GODs Shadow siempre queda como sombra.
function getProfileAvatarVisualEffect(avatar, applyRgbEffect = false) {
  if (avatar?.id === 'enemy:GODs_Shadow') return '';
  if (avatar?.effect) return avatar.effect;
  return avatar?.rgb || applyRgbEffect ? 'rgb' : '';
}

// Efectos que se pueden dar a una imagen Rewamp/RGB del perfil: Original (sin
// efecto), RGB si la skin RGB de la familia está desbloqueada, Rainbow Fuel de
// la familia y los efectos del Pase de Invierno ganados.
function getProfileAvatarEffectOptions(avatar) {
  const family = avatar?.rewampFamily;
  if (!family) return [];
  const type = /^glob:([^:]+):/.exec(avatar.id || '')?.[1];
  const options = ['original'];
  if (gameState.debugState === 'unlocked' ||
      isProfileRgbRewampUnlocked(getProfileRgbRewampSkin(family, type))) {
    options.push('rgb');
  }
  PROFILE_FX_EFFECTS.forEach(effect => {
    if (isFxEffectUnlockedForFamily(effect.id, family)) options.push(effect.id);
  });
  return options;
}

function getSelectedProfileAvatarEffect(avatar) {
  const options = getProfileAvatarEffectOptions(avatar);
  if (!options.length) return null;
  const chosen = gameState.profileAvatarEffect;
  if (chosen && options.includes(chosen)) return chosen;
  return options.includes(avatar.defaultEffect) ? avatar.defaultEffect : 'original';
}

// Copia del avatar con el efecto elegido aplicado (vista previa y multijugador).
function withProfileAvatarEffect(avatar, effectId) {
  if (!avatar?.rewampFamily || !effectId) return avatar;
  if (effectId === 'original') return { ...avatar, rgb: false, effect: undefined };
  if (effectId === 'rgb') return { ...avatar, rgb: true, effect: undefined };
  return { ...avatar, rgb: true, effect: effectId };
}

function getDisplayedProfileAvatar(avatar) {
  return withProfileAvatarEffect(avatar, getSelectedProfileAvatarEffect(avatar));
}
const PROFILE_ENEMY_VARIANT_GROUPS = [
  { canonical: 'BitY1', types: ['BitY1', 'BitB4', 'BitG2', 'BitP3'] },
  { canonical: 'ByteGB1', types: ['ByteGB1', 'ByteYP2', 'BytePG3', 'ByteYB4'] },
  { canonical: 'Spyware', types: ['Spyware', 'Spyware1', 'Spyware2', 'Spyware3'] },
  { canonical: 'Arky', types: ['Arky', 'CrystArky', 'ArkyVoid'] },
  { canonical: 'AstrorbOrbe', types: ['AstrorbOrbe', 'AstrorbContenida', 'AstrorbTF', 'Crystalic_Orb'] },
  { canonical: 'NOeye_Pyce', types: ['NOeye_Pyce', 'NO_CrystEye_CB'] },
  { canonical: 'Monster', types: ['Monster', 'Cristalized_Monster'] },
  { canonical: 'Leni_the_big_Hammer', types: ['Leni_the_big_Hammer', 'Lenistal'] }
];

const BREAK_REMINDER_INTERVAL = 2 * 60 * 60 * 1000;
const BREAK_REMINDERS = {
  es: [
    '¡Ey, comandante! Llevas un buen rato al mando. Estira las piernas y bebe un poco de agua; los Globs esperan.',
    'Registro de Bombot: actividad prolongada detectada. Recomiendo una pausa breve antes de la siguiente oleada.',
    '¿Sigues ahí, comandante? Si te fuiste AFK, todo bien; solo quería comprobar que no te hayas quedado pegado a la silla.',
    'No hace falta defender el mapa sin parar. Guarda la partida cuando puedas y descansa un rato.',
    'Alerta amistosa: llevas un buen rato aquí. Tus ojos también necesitan descansar.',
    '¿Hola? ... Ping. Si sigues ahí, ¡gracias por proteger a los Globs! Si no, espero que estés disfrutando tu pausa.',
    'Dos horas registradas. Bombot recomienda agua, parpadear y levantarse un momento. No es una orden... casi.',
    '¿Comandante? ¿Me recibe? ... Ah, ahí estás. Era una comprobación de rutina. Descansa cuando te venga bien.'
  ],
  en: [
    'Hey, Commander! You have been in command for a while. Stretch your legs and drink some water; the Globs can wait.',
    'Bombot report: extended activity detected. I recommend a short break before the next wave.',
    'Are you still there, Commander? If you went AFK, no worries; I just wanted to make sure you are not glued to your chair.',
    'You do not have to defend the map nonstop. Save when you can and take a little break.',
    'Friendly alert: you have been here for a while. Your eyes need a rest too.',
    'Hello? ... Ping. If you are still there, thanks for protecting the Globs! If not, I hope you are enjoying your break.',
    'Two hours logged. Bombot recommends water, blinking, and standing up for a moment. Not an order... almost.',
    'Commander? Do you read me? ... Oh, there you are. Just a routine check. Take a break whenever you need one.'
  ]
};

function getMultiplayerProfile() {
  const avatar = getProfileAvatarById(gameState.profileAvatar || 'glob:Glob');
  const border = getProfileBorderById(gameState.profileBorder || 'default');
  const profileProgress = gameState.debugState === 'unlocked' && gameState.debugSnapshot
    ? gameState.debugSnapshot
    : gameState;
  return {
    equippedTowers: Array.isArray(gameState.equippedTowers) ? [...gameState.equippedTowers] : ['Glob'],
    towerLimits: { ...gameState.towerLimits },
    avatar: gameState.profileAvatar || 'glob:Glob',
    avatarImage: avatar?.image || IMAGE_PATHS.Glob,
    avatarLayers: Array.isArray(avatar?.layers) ? avatar.layers : [],
    avatarLabel: avatar?.label || 'Glob',
    rgbAvatar: Boolean(getDisplayedProfileAvatar(avatar)?.rgb || border?.rgb),
    // Efecto ya resuelto para que los demás jugadores vean el mismo perfil:
    // el elegido para la imagen Rewamp, o RGB con el borde GLB Fever.
    profileRgbEffect: getProfileAvatarVisualEffect(getDisplayedProfileAvatar(avatar), Boolean(border?.rgb)),
    border: gameState.profileBorder || 'default',
    borderStyle: border?.style || null,
    borderLabel: border?.label || (currentLanguage === 'en' ? 'Classic' : 'Clásico'),
    borderColors: border?.colors || ['#8796a5', '#202833'],
    rainbowBorder: Boolean(border?.multicolor),
    rgbBorder: Boolean(border?.rgb),
    duckPassLevel: Math.max(1, Number(profileProgress.duckPassLevel) || 1),
    duckPassXP: Math.max(0, Number(profileProgress.duckPassXP) || 0),
    unlockedBadges: Object.values(BADGES)
      .filter(badge => badge.unlocked)
      .map(badge => badge.key),
    maxedFamilies: [...new Set(gameState.maxedFamilies || [])],
    maxedRewampFamilies: [...new Set(gameState.profileMaxRewampAvatars || [])],
    mapModeWins: Object.fromEntries(
      PROFILE_MAP_BORDERS.map(({ map }) => [
        map,
        PROFILE_MAP_MODES.filter(mode => (gameState.profileMapModeWins[map] || []).includes(mode))
      ])
    )
  };
}

function showAcrossTimeNarration(key) {
  showNarratorMsg(
    'GODs_Shadow',
    IMAGE_PATHS.GODs_Shadow,
    'GODs Shadow',
    translate(key),
    'enemy-voice'
  );
}

function publishMultiplayerProfile() {
  if (!socket?.connected || !currentSeed) return;
  const profile = getMultiplayerProfile();
  socket.emit('update-player-profile', {
    seed: currentSeed,
    profile
  });
}

function getSafeProfileImageUrl(imagePath) {
  if (typeof imagePath !== 'string' || !imagePath.trim() ||
      /^[a-z][a-z\d+.-]*:/i.test(imagePath) || imagePath.startsWith('/') || imagePath.startsWith('\\')) {
    return new URL(IMAGE_PATHS.Glob, document.baseURI).href;
  }
  try {
    const url = new URL(imagePath, document.baseURI);
    const base = new URL('.', document.baseURI);
    return url.origin === base.origin && url.protocol === base.protocol && url.pathname.startsWith(base.pathname)
      ? url.href
      : new URL(IMAGE_PATHS.Glob, document.baseURI).href;
  } catch (error) {
    console.error('No se pudo validar la imagen del perfil multijugador:', error);
    return new URL(IMAGE_PATHS.Glob, document.baseURI).href;
  }
}

function launchChristmasGiftProjectile(rect) {
  const projectile = document.createElement('img');
  const angle = Math.random() * Math.PI * 2;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const distance = Math.min(
    dx > 0 ? (window.innerWidth - centerX) / dx : -centerX / dx,
    dy > 0 ? (window.innerHeight - centerY) / dy : -centerY / dy
  ) + 60;
  projectile.className = 'christmas-gift-projectile';
  projectile.src = encodeURI(IMAGE_PATHS.Santa_Workshop_Gift_Projectile);
  projectile.alt = '';
  projectile.setAttribute('aria-hidden', 'true');
  projectile.style.left = `${centerX}px`;
  projectile.style.top = `${centerY}px`;
  projectile.style.setProperty('--gift-flight-x', `${dx * distance}px`);
  projectile.style.setProperty('--gift-flight-y', `${dy * distance}px`);
  document.body.appendChild(projectile);
  setTimeout(() => projectile.remove(), 1200);
}

function getSafeProfileColors(profile) {
  const fallback = ['#8796a5', '#202833'];
  const colors = profile?.borderColors;
  if (!Array.isArray(colors) || colors.length < 2) return fallback;
  const safe = colors.slice(0, 2).map(color => {
    if (typeof color !== 'string') return null;
    if (/^#[0-9a-f]{6}$/i.test(color)) return color;
    if (/^rgba\((?:\d{1,3}),\s*(?:\d{1,3}),\s*(?:\d{1,3}),\s*(?:0(?:\.\d+)?|1(?:\.0+)?)\)$/i.test(color)) return color;
    return null;
  });
  return safe.every(Boolean) ? safe : fallback;
}

function createProfileAvatarImage(avatar, size, alt = '', visualEffect = '') {
  const imageUrl = getSafeProfileImageUrl(avatar?.image);
  if (avatar?.id === 'enemy:GODs_Shadow') {
    // Silueta de Kirb (GOD): el fondo va en el envoltorio, fuera del filtro.
    const wrapper = document.createElement('span');
    wrapper.className = 'gods-shadow-avatar';
    wrapper.style.width = `${size}px`;
    wrapper.style.height = `${size}px`;
    const shadow = document.createElement('img');
    shadow.className = 'gods-shadow-portrait';
    shadow.src = imageUrl;
    shadow.alt = alt;
    wrapper.appendChild(shadow);
    return wrapper;
  }
  const validEffects = ['rgb', 'rainbow-fuel', ...RGB_RECOLOR_EFFECT_IDS];
  const effect = validEffects.includes(visualEffect)
    ? visualEffect
    : (avatar?.rgb ? 'rgb' : '');
  const rgbClass = effect === 'rainbow-fuel'
    ? ' rainbow-fuel-avatar'
    : effect
      ? ` rgb-avatar-image${effect === 'rgb' ? '' : ` ${effect}`}`
      : '';
  const maskProperty = effect === 'rainbow-fuel'
    ? '--rainbow-fuel-mask-image'
    : '--rgb-avatar-mask-image';
  if (Array.isArray(avatar?.layers) && avatar.layers.length > 0) {
    const layers = document.createElement('span');
    layers.className = `profile-avatar-layers${rgbClass}`;
    layers.style.width = `${size}px`;
    layers.style.height = `${size}px`;
    const baseImage = document.createElement('img');
    baseImage.src = imageUrl;
    baseImage.alt = alt;
    baseImage.width = size;
    baseImage.height = size;
    layers.appendChild(baseImage);
    avatar.layers.forEach(layerPath => {
      const layer = document.createElement('img');
      const layerUrl = getSafeProfileImageUrl(layerPath);
      layer.src = layerUrl;
      layer.alt = '';
      layer.width = size;
      layer.height = size;
      layers.appendChild(layer);
    });
    if (effect) layers.style.setProperty(maskProperty, `url("${imageUrl}")`);
    return layers;
  }
  const image = document.createElement('img');
  image.src = imageUrl;
  image.alt = alt;
  image.width = size;
  image.height = size;
  image.addEventListener('error', () => {
    const fallbackUrl = new URL(IMAGE_PATHS.Glob, document.baseURI).href;
    image.src = fallbackUrl;
    if (image.parentElement?.classList.contains('rgb-avatar-image')) {
      image.parentElement.style.setProperty('--rgb-avatar-mask-image', `url("${fallbackUrl}")`);
    } else if (image.parentElement?.classList.contains('rainbow-fuel-avatar')) {
      image.parentElement.style.setProperty('--rainbow-fuel-mask-image', `url("${fallbackUrl}")`);
    }
  }, { once: true });

  if (!effect) return image;

  const wrapper = document.createElement('span');
  wrapper.className = rgbClass.trim();
  wrapper.style.width = `${size}px`;
  wrapper.style.height = `${size}px`;
  wrapper.style.setProperty(maskProperty, `url("${imageUrl}")`);
  wrapper.appendChild(image);
  return wrapper;
}

function createMultiplayerProfileBadge(profile, size = 38) {
  const frame = document.createElement('span');
  const borderStyle = PROFILE_BORDER_STYLE_CLASSES.has(profile?.borderStyle)
    ? ` ${profile.borderStyle}`
    : '';
  frame.className = `multiplayer-profile-badge${profile?.rainbowBorder ? ' rainbow' : ''}${profile?.rgbBorder ? ' glb-fever' : ''}${borderStyle}${profile?.rgbAvatar ? ' rgb-avatar' : ''}`;
  frame.style.width = `${size}px`;
  frame.style.height = `${size}px`;
  const colors = getSafeProfileColors(profile);
  frame.style.setProperty('--profile-border-start', colors[0]);
  frame.style.setProperty('--profile-border-end', colors[1]);

  const image = createProfileAvatarImage({
    id: typeof profile?.avatar === 'string' ? profile.avatar : '',
    image: profile?.avatarImage,
    layers: Array.isArray(profile?.avatarLayers) ? profile.avatarLayers.slice(0, 4) : [],
    rgb: Boolean(profile?.rgbAvatar)
  }, size - 10, typeof profile?.avatarLabel === 'string' ? profile.avatarLabel : 'Glob', profile?.profileRgbEffect);
  frame.appendChild(image);
  if (profile?.borderStyle === 'time-attack-b') {
    frame.insertAdjacentHTML('beforeend', getProfileClockHandsMarkup());
    ensureProfileClockTimer();
  }
  return frame;
}

function getProfileClockHandsMarkup() {
  return `<span class="profile-clock-hands" aria-hidden="true">
    <i class="profile-clock-hand profile-clock-hour"></i>
    <i class="profile-clock-hand profile-clock-minute"></i>
    <i class="profile-clock-hand profile-clock-second"></i>
    <i class="profile-clock-center"></i>
  </span>`;
}

function updateProfileClockHands() {
  const now = new Date();
  const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;
  const localTime = now.toLocaleTimeString();
  document.querySelectorAll('.profile-clock-hands').forEach(clock => {
    clock.style.setProperty('--clock-hour-angle', `${hours * 30}deg`);
    clock.style.setProperty('--clock-minute-angle', `${minutes * 6}deg`);
    clock.style.setProperty('--clock-second-angle', `${seconds * 6}deg`);
    clock.parentElement?.setAttribute('title', localTime);
  });
}

function ensureProfileClockTimer() {
  updateProfileClockHands();
  if (profileClockInterval === null) {
    profileClockInterval = window.setInterval(updateProfileClockHands, 1000);
  }
}

function renderMultiplayerPlayerList(players) {
  const panel = document.getElementById('multiplayer-player-list');
  if (!panel) return;
  if (!gameState.modeConfirmed) {
    panel.hidden = true;
    panel.replaceChildren();
    document.body.classList.remove('match-active');
    document.body.style.removeProperty('--multiplayer-player-list-space');
    return;
  }
  const localOnly = isOfflineSession() || !currentSeed;
  const visiblePlayers = localOnly
    ? [{
        username: localStorage.getItem('glob_username') || (currentLanguage === 'en' ? 'Player' : 'Jugador'),
        profile: getMultiplayerProfile(),
        isHost: false
      }]
    : (Array.isArray(players) ? players : []);
  if (visiblePlayers.length === 0) {
    panel.hidden = true;
    panel.replaceChildren();
    document.body.classList.remove('match-active');
    document.body.style.removeProperty('--multiplayer-player-list-space');
    return;
  }
  panel.replaceChildren();
  const heading = document.createElement('h2');
  heading.textContent = localOnly
    ? (currentLanguage === 'en' ? 'Your profile' : 'Tu perfil')
    : (currentLanguage === 'en' ? `Seed players (${visiblePlayers.length}/4)` : `Jugadores (${visiblePlayers.length}/4)`);
  panel.setAttribute('aria-label', heading.textContent);
  panel.appendChild(heading);
  visiblePlayers.forEach(player => {
    const row = document.createElement('div');
    row.className = 'multiplayer-player-row';
    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.setAttribute('aria-label', currentLanguage === 'en'
      ? `View ${player.username || 'player'} profile`
      : `Ver perfil de ${player.username || 'jugador'}`);
    row.addEventListener('click', () => openMultiplayerPlayerProfile(player.playerId, player));
    row.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openMultiplayerPlayerProfile(player.playerId, player);
    });
    row.appendChild(createMultiplayerProfileBadge(player.profile));
    const details = document.createElement('span');
    details.className = 'multiplayer-player-details';
    const name = document.createElement('strong');
    name.textContent = player.username || (currentLanguage === 'en' ? 'Player' : 'Jugador');
    details.appendChild(name);
    const role = document.createElement('small');
    role.textContent = localOnly
      ? isOfflineSession()
        ? (currentLanguage === 'en' ? 'Offline · local' : 'Sin conexión · local')
        : (currentLanguage === 'en' ? 'In this match' : 'En esta partida')
      : multiplayerSpectator && player.playerId === socket?.id
        ? (currentLanguage === 'en' ? 'Spectating' : 'Observando')
      : player.isHost
      ? (currentLanguage === 'en' ? 'Host' : 'Anfitrión')
      : (player.profile?.borderLabel || (currentLanguage === 'en' ? 'Player' : 'Jugador'));
    details.appendChild(role);
    row.appendChild(details);
    panel.appendChild(row);
  });
  if (multiplayerSpectator) {
    const notice = document.createElement('p');
    notice.className = 'multiplayer-spectator-notice';
    notice.textContent = currentLanguage === 'en'
      ? 'Access requirements not met · view only'
      : 'Faltan requisitos de acceso · solo lectura';
    panel.appendChild(notice);
  }
  panel.hidden = false;
  document.body.classList.add('match-active');
  document.body.style.setProperty(
    '--multiplayer-player-list-space',
    `${Math.ceil(panel.getBoundingClientRect().height + 24)}px`
  );
}

function renderMultiplayerChat() {
  const wrapper = document.getElementById('multiplayer-chat');
  const log = document.getElementById('multiplayer-chat-log');
  const safeTab = document.getElementById('multiplayer-chat-safe-tab');
  const freeTab = document.getElementById('multiplayer-chat-free-tab');
  const safeForm = document.getElementById('multiplayer-chat-safe-form');
  const freeForm = document.getElementById('multiplayer-chat-free-form');
  const safeSelect = document.getElementById('multiplayer-chat-safe-message');
  if (!wrapper || !log || !safeTab || !freeTab || !safeForm || !freeForm || !safeSelect) return;
  const shouldScroll = log.scrollHeight - log.scrollTop - log.clientHeight < 40;

  const isEnglish = currentLanguage === 'en';
  const safeMessages = SAFE_MULTIPLAYER_CHAT_MESSAGES[isEnglish ? 'en' : 'es'];
  const selectedSafeMessage = safeSelect.value;
  safeSelect.replaceChildren();
  safeMessages.forEach(message => {
    const option = document.createElement('option');
    option.value = message;
    option.textContent = message;
    safeSelect.appendChild(option);
  });
  if (safeMessages.includes(selectedSafeMessage)) safeSelect.value = selectedSafeMessage;

  safeTab.textContent = isEnglish ? 'Safe' : 'Seguro';
  freeTab.textContent = isEnglish ? 'Free' : 'Libre';
  safeTab.setAttribute('aria-selected', String(multiplayerChatMode === 'safe'));
  freeTab.setAttribute('aria-selected', String(multiplayerChatMode === 'free'));
  safeForm.hidden = multiplayerChatMode !== 'safe';
  freeForm.hidden = multiplayerChatMode !== 'free';
  document.getElementById('multiplayer-chat-title').textContent = isEnglish ? 'Match chat' : 'Chat de la partida';
  document.getElementById('multiplayer-chat-safe-label').textContent = isEnglish ? 'Choose a friendly message' : 'Elige un mensaje amable';
  document.getElementById('multiplayer-chat-free-label').textContent = isEnglish
    ? `Write a message (max. ${MULTIPLAYER_CHAT_MAX_LENGTH} characters)`
    : `Escribe un mensaje (máx. ${MULTIPLAYER_CHAT_MAX_LENGTH} caracteres)`;
  document.getElementById('multiplayer-chat-safe-send').textContent = isEnglish ? 'Send' : 'Enviar';
  document.getElementById('multiplayer-chat-free-send').textContent = isEnglish ? 'Send' : 'Enviar';
  document.getElementById('multiplayer-chat-close').setAttribute('aria-label', isEnglish ? 'Close chat' : 'Cerrar chat');
  document.getElementById('multiplayer-chat-toggle').textContent = isEnglish ? '💬 Chat' : '💬 Chat';
  document.getElementById('multiplayer-chat-toggle').setAttribute('aria-expanded', String(!document.getElementById('multiplayer-chat-panel').hidden));
  document.getElementById('multiplayer-chat-notice').textContent = isEnglish
    ? 'Insulting messages are filtered and will not appear in chat.'
    : 'Los mensajes insultantes se filtran y no aparecerán en el chat.';

  log.replaceChildren();
  multiplayerChatEntries.forEach(entry => {
    const row = document.createElement('div');
    row.className = `multiplayer-chat-entry${entry.blockedImage ? ' blocked-image' : ''}${entry.own ? ' own' : ''}`;
    const name = document.createElement('strong');
    name.textContent = `${entry.username || (isEnglish ? 'Player' : 'Jugador')}:`;
    row.appendChild(name);
    if (entry.blockedImage) {
      const image = document.createElement('img');
      image.className = 'multiplayer-chat-blocked-image';
      image.src = encodeURI(IMAGE_PATHS.Omnipresent_Glob);
      image.alt = isEnglish ? 'Omnipresent Glob replaced the blocked message' : 'Omnipresent Glob sustituyó el mensaje bloqueado';
      image.title = 'Omnipresent Glob';
      row.appendChild(image);
    } else {
      const text = document.createElement('span');
      text.textContent = entry.text;
      row.appendChild(text);
    }
    log.appendChild(row);
  });
  if (shouldScroll) log.scrollTop = log.scrollHeight;
}

function updateMultiplayerChatVisibility() {
  const wrapper = document.getElementById('multiplayer-chat');
  const panel = document.getElementById('multiplayer-chat-panel');
  const toggle = document.getElementById('multiplayer-chat-toggle');
  if (!wrapper || !panel || !toggle) return;
  const visible = Boolean(currentSeed && socket?.connected && !isOfflineSession());
  wrapper.hidden = !visible;
  if (!visible) {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  }
  document.body.classList.toggle('multiplayer-chat-visible', visible);
  document.body.classList.toggle('multiplayer-chat-open', visible && !panel.hidden);
  renderMultiplayerChat();
}

function addMultiplayerChatEntry(entry) {
  multiplayerChatEntries.push(entry);
  if (multiplayerChatEntries.length > MULTIPLAYER_CHAT_MAX_ENTRIES) {
    multiplayerChatEntries = multiplayerChatEntries.slice(-MULTIPLAYER_CHAT_MAX_ENTRIES);
  }
  renderMultiplayerChat();
}

function receiveMultiplayerChatMessage(message) {
  if (!message || typeof message.text !== 'string') return;
  const text = message.text.trim();
  if (!text || text.length > MULTIPLAYER_CHAT_MAX_LENGTH || isOffensiveUsername(text)) return;
  addMultiplayerChatEntry({
    username: typeof message.username === 'string' ? message.username.slice(0, 32) : '',
    text
  });
}

async function sendMultiplayerChatMessage(text) {
  const message = String(text || '').trim();
  const connection = socket;
  const seed = currentSeed;
  if (!connection?.connected || !seed || !message) return 'rejected';
  if (message.length > MULTIPLAYER_CHAT_MAX_LENGTH) {
    document.getElementById('multiplayer-chat-notice').textContent = currentLanguage === 'en'
      ? `Messages must be ${MULTIPLAYER_CHAT_MAX_LENGTH} characters or fewer.`
      : `Los mensajes no pueden superar los ${MULTIPLAYER_CHAT_MAX_LENGTH} caracteres.`;
    return 'rejected';
  }
  if (isOffensiveUsername(message)) {
    blockOffensiveUsername(message, 'chat');
    addMultiplayerChatEntry({
      own: true,
      username: localStorage.getItem('glob_username') || (currentLanguage === 'en' ? 'Player' : 'Jugador'),
      blockedImage: true
    });
    try {
      const moderationResult = await recordOffensiveChatAttempt();
      if (moderationResult.deleted) await handleModeratedAccountDeletion();
    } catch (error) {
      console.error('No se pudo registrar la infracción del chat en el servidor:', error);
      document.getElementById('multiplayer-chat-notice').textContent = currentLanguage === 'en'
        ? 'Your message was blocked, but the account warning could not be recorded. Please reconnect and try again.'
        : 'Tu mensaje se bloqueó, pero no se pudo registrar el aviso de cuenta. Reconéctate e inténtalo de nuevo.';
    }
    return 'blocked';
  }
  const now = Date.now();
  if (now - multiplayerChatLastSentAt < 800) {
    document.getElementById('multiplayer-chat-notice').textContent = currentLanguage === 'en'
      ? 'Please wait a moment before sending another message.'
      : 'Espera un momento antes de enviar otro mensaje.';
    return 'rejected';
  }
  multiplayerChatLastSentAt = now;

  try {
    await connection.send('chat-message', { text: message });
    if (socket !== connection || currentSeed !== seed) return 'rejected';
    addMultiplayerChatEntry({
      username: localStorage.getItem('glob_username') || (currentLanguage === 'en' ? 'Player' : 'Jugador'),
      text: message,
      own: true
    });
    return 'sent';
  } catch (error) {
    multiplayerChatLastSentAt = 0;
    console.error('No se pudo enviar el mensaje del chat multijugador:', error);
    document.getElementById('multiplayer-chat-notice').textContent = currentLanguage === 'en'
      ? 'Message could not be sent. Check your room connection and try again.'
      : 'No se pudo enviar el mensaje. Comprueba la conexión a la sala e inténtalo otra vez.';
    return 'failed';
  }
}

function setupMultiplayerChat() {
  const wrapper = document.getElementById('multiplayer-chat');
  const panel = document.getElementById('multiplayer-chat-panel');
  const toggle = document.getElementById('multiplayer-chat-toggle');
  const safeTab = document.getElementById('multiplayer-chat-safe-tab');
  const freeTab = document.getElementById('multiplayer-chat-free-tab');
  const safeForm = document.getElementById('multiplayer-chat-safe-form');
  const freeForm = document.getElementById('multiplayer-chat-free-form');
  if (!wrapper || !panel || !toggle || !safeTab || !freeTab || !safeForm || !freeForm) return;

  toggle.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    toggle.setAttribute('aria-expanded', String(!panel.hidden));
    document.body.classList.toggle('multiplayer-chat-open', !panel.hidden);
    if (!panel.hidden && multiplayerChatMode === 'free') {
      document.getElementById('multiplayer-chat-free-message').focus();
    }
  });
  document.getElementById('multiplayer-chat-close').addEventListener('click', () => {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('multiplayer-chat-open');
  });
  safeTab.addEventListener('click', () => {
    multiplayerChatMode = 'safe';
    renderMultiplayerChat();
  });
  freeTab.addEventListener('click', () => {
    multiplayerChatMode = 'free';
    renderMultiplayerChat();
    document.getElementById('multiplayer-chat-free-message').focus();
  });
  safeForm.addEventListener('submit', event => {
    event.preventDefault();
    sendMultiplayerChatMessage(document.getElementById('multiplayer-chat-safe-message').value);
  });
  freeForm.addEventListener('submit', event => {
    event.preventDefault();
    const input = document.getElementById('multiplayer-chat-free-message');
    const text = input.value;
    if (!text.trim()) return;
    sendMultiplayerChatMessage(text).then(result => {
      if (result === 'sent' || result === 'blocked') input.value = '';
    });
  });
  renderMultiplayerChat();
}

function showPlayerJoinedNotice(player) {
  const existing = document.getElementById('multiplayer-join-notice');
  existing?.remove();
  const notice = document.createElement('div');
  notice.id = 'multiplayer-join-notice';
  notice.className = 'multiplayer-join-notice';
  notice.setAttribute('role', 'status');
  notice.appendChild(createMultiplayerProfileBadge(player.profile, 50));
  const text = document.createElement('span');
  text.textContent = currentLanguage === 'en'
    ? `${player.username || 'A player'} joined the seed.`
    : `${player.username || 'Un jugador'} se ha unido a tu seed.`;
  notice.appendChild(text);
  document.body.appendChild(notice);
  setTimeout(() => notice.remove(), 6000);
}

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  const settings = window.GLOB_DEFENDERS_SUPABASE;
  if (!settings || typeof settings.url !== 'string' || typeof settings.publishableKey !== 'string' ||
      !settings.url.trim() || !settings.publishableKey.trim()) {
    throw new Error(currentLanguage === 'en'
      ? 'Supabase is not configured. Set the project URL and publishable key in supabase-config.js.'
      : 'Supabase no está configurado. Añade la URL del proyecto y la clave publishable en supabase-config.js.');
  }

  const url = new URL(settings.url);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(currentLanguage === 'en'
      ? 'The Supabase project URL is invalid; use the HTTPS project URL.'
      : 'La URL del proyecto Supabase no es válida; usa la URL HTTPS del proyecto.');
  }

  const key = settings.publishableKey.trim();
  if (key.startsWith('sb_secret_') || isSupabaseServiceRoleKey(key)) {
    throw new Error(currentLanguage === 'en'
      ? 'A secret/service-role key cannot be used in the browser. Use the publishable key.'
      : 'No se puede usar una clave secret/service_role en el navegador. Usa la clave publishable.');
  }
  if (!window.supabase?.createClient) {
    throw new Error(currentLanguage === 'en'
      ? 'The Supabase client library could not be loaded.'
      : 'No se pudo cargar la librería cliente de Supabase.');
  }

  supabaseClient = window.supabase.createClient(url.origin, key, {
    realtime: { params: { eventsPerSecond: 10 } },
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  return supabaseClient;
}

function isSupabaseServiceRoleKey(key) {
  const parts = key.split('.');
  if (parts.length !== 3) return false;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
    return payload.role === 'service_role';
  } catch (error) {
    return false;
  }
}

function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

class SupabaseGameConnection {
  constructor(seed, username, profile) {
    this.id = crypto.randomUUID();
    this.connected = false;
    this.isHost = false;
    this.hostId = null;
    this.handlers = new Map();
    this.previousPlayers = new Map();
    this.presenceInitialized = false;
    this.intentionalDisconnect = false;
    this.rejected = false;
    this.presence = {
      playerId: this.id,
      username,
      profile,
      interstellarAccess: hasInterstellarEntryAccess(),
      joinedAt: Date.now(),
      isHost: false
    };
    this.channel = getSupabaseClient().channel(`glob-seed-${seed}`, {
      config: {
        broadcast: { self: false, ack: true },
        presence: { key: this.id }
      }
    });
    this.channel
      .on('broadcast', { event: 'game-event' }, message => this.handleBroadcast(message.payload))
      .on('presence', { event: 'sync' }, () => this.syncPresence());
  }

  on(eventName, handler) {
    if (!this.handlers.has(eventName)) this.handlers.set(eventName, new Set());
    this.handlers.get(eventName).add(handler);
    return this;
  }

  off(eventName, handler) {
    this.handlers.get(eventName)?.delete(handler);
    return this;
  }

  dispatch(eventName, data) {
    this.handlers.get(eventName)?.forEach(handler => handler(data));
  }

  async subscribe() {
    await new Promise((resolve, reject) => {
      let settled = false;
      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error(currentLanguage === 'en'
          ? 'Timed out connecting to Supabase Realtime.'
          : 'Se agotó el tiempo al conectar con Supabase Realtime.'));
      }, 10000);
      this.channel.subscribe(status => {
        if (status === 'SUBSCRIBED' && !settled) {
          settled = true;
          clearTimeout(timeout);
          this.connected = true;
          resolve();
        } else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status) && !settled) {
          settled = true;
          clearTimeout(timeout);
          reject(new Error(currentLanguage === 'en'
            ? `Supabase Realtime connection failed (${status}).`
            : `Falló la conexión con Supabase Realtime (${status}).`));
        } else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status) &&
            this.connected && !this.intentionalDisconnect) {
          this.connected = false;
          showMultiplayerServerClosed();
        }
      });
    });

    const trackResult = await this.channel.track(this.presence);
    if (trackResult !== 'ok') {
      throw new Error(currentLanguage === 'en'
        ? `Supabase could not publish player presence (${trackResult}).`
        : `Supabase no pudo publicar la presencia del jugador (${trackResult}).`);
    }
    await wait(500);
    this.syncPresence();
  }

  getPlayers() {
    const presenceState = this.channel.presenceState();
    return Object.values(presenceState)
      .flat()
      .filter(player => player && typeof player.playerId === 'string')
      .map(player => ({
        playerId: player.playerId,
        username: player.username || 'Jugador',
        profile: player.profile || { equippedTowers: ['Glob'], towerLimits: {} },
        interstellarAccess: Boolean(player.interstellarAccess),
        joinedAt: Number(player.joinedAt) || 0,
        isHost: Boolean(player.isHost)
      }));
  }

  syncPresence() {
    if (!this.connected) return;
    const players = this.getPlayers();
    if (!players.some(player => player.playerId === this.id)) return;
    const orderedPlayers = [...players].sort((a, b) =>
      a.joinedAt - b.joinedAt || a.playerId.localeCompare(b.playerId));
    const admittedPlayers = new Set(orderedPlayers.slice(0, 4).map(player => player.playerId));
    if (players.length > 4 && !admittedPlayers.has(this.id)) {
      this.rejected = true;
      this.dispatch('room-full', { playerCount: players.length });
      this.disconnect();
      return;
    }
    const declaredHosts = players.filter(player => player.isHost).sort((a, b) => a.playerId.localeCompare(b.playerId));
    const electedHost = declaredHosts[0] || [...players].sort((a, b) =>
      a.joinedAt - b.joinedAt || a.playerId.localeCompare(b.playerId))[0];
    if (!electedHost) return;

    const previousHostId = this.hostId;
    this.hostId = electedHost.playerId;
    this.isHost = this.hostId === this.id;
    if (this.presence.isHost !== this.isHost) {
      this.presence.isHost = this.isHost;
      this.channel.track(this.presence).catch(error => {
        console.error('No se pudo actualizar el estado del anfitrión en Supabase:', error);
      });
    }

    const nextPlayers = new Map(players.map(player => [player.playerId, player]));
    const roster = players.map(({ playerId, username, profile, isHost }) => ({ playerId, username, profile, isHost }));
    multiplayerPlayers = roster;
    multiplayerPlayerCount = Math.max(1, roster.length);
    multiplayerEnabled = multiplayerPlayerCount > 1;
    renderMultiplayerPlayerList(roster);
    if (window._refreshMultiplayerUI) window._refreshMultiplayerUI();
    this.dispatch('player-count', { playerCount: multiplayerPlayerCount });
    this.dispatch('player-roster', { players: roster, playerCount: multiplayerPlayerCount });

    if (this.presenceInitialized) {
      players.forEach(player => {
        if (!this.previousPlayers.has(player.playerId) && player.playerId !== this.id) {
          this.dispatch('player-joined', {
            id: player.playerId,
            username: player.username,
            profile: player.profile,
            playerCount: roster.length
          });
        }
      });
    }
    if (this.previousPlayers.size > 0) {
      this.previousPlayers.forEach((player, playerId) => {
        if (!nextPlayers.has(playerId)) {
          this.dispatch('player-left', {
            id: playerId,
            username: player.username,
            playerCount: roster.length
          });
        }
      });
    }
    this.previousPlayers = nextPlayers;
    this.presenceInitialized = true;

    if (previousHostId && previousHostId !== this.id && !nextPlayers.has(previousHostId)) {
      showMultiplayerServerClosed();
    }
  }

  handleBroadcast(message) {
    if (!message || typeof message.event !== 'string' || !message.data ||
        message.senderId === this.id || (message.targetId && message.targetId !== this.id)) return;

    if (message.event === 'join-request' && this.isHost) {
      const snapshot = window._getMultiplayerGameState ? window._getMultiplayerGameState() : null;
      const requester = this.getPlayers().find(player => player.playerId === message.senderId);
      const response = {
        hostName: this.presence.username,
        playerCount: multiplayerPlayers.length,
        players: multiplayerPlayers,
        snapshot,
        spectator: snapshot?.mode === 'interstellar' && !requester?.interstellarAccess
      };
      this.send('join-response', response, message.senderId).catch(error => {
        console.error('No se pudo transferir el estado a un jugador recién conectado:', error);
      });
      return;
    }
    if (message.event === 'game-action' && gameState.mode === 'interstellar') {
      const sender = this.getPlayers().find(player => player.playerId === message.senderId);
      if (!sender?.interstellarAccess) return;
    }
    if (message.event === 'chat-message') {
      if (typeof message.data.text !== 'string') return;
      const sender = this.getPlayers().find(player => player.playerId === message.senderId);
      this.dispatch('chat-message', {
        text: message.data.text,
        username: sender?.username || (currentLanguage === 'en' ? 'Player' : 'Jugador')
      });
      return;
    }
    this.dispatch(message.event, message.data);
  }

  async send(eventName, data, targetId = null) {
    if (!this.connected) throw new Error('La conexión con Supabase Realtime no está activa.');
    if (eventName === 'chat-message' &&
        (!data || typeof data.text !== 'string' ||
         data.text.trim().length > MULTIPLAYER_CHAT_MAX_LENGTH ||
         isOffensiveUsername(data.text))) {
      throw new Error(currentLanguage === 'en'
        ? 'The chat message was blocked by the content filter.'
        : 'El filtro de contenido ha bloqueado el mensaje del chat.');
    }
    const response = await this.channel.send({
      type: 'broadcast',
      event: 'game-event',
      payload: { event: eventName, data, senderId: this.id, targetId }
    });
    if (response !== 'ok') {
      throw new Error(`Supabase Realtime rechazó el evento ${eventName} (${response}).`);
    }
  }

  emit(eventName, data) {
    if (eventName === 'update-player-profile') {
      this.presence.profile = data.profile;
      this.presence.interstellarAccess = hasInterstellarEntryAccess();
      this.channel.track(this.presence).catch(error => {
        console.error('No se pudo publicar el perfil multijugador:', error);
        window._showMultiplayerNotice?.(currentLanguage === 'en'
          ? 'Could not update the player profile in the room.'
          : 'No se pudo actualizar el perfil del jugador en la sala.');
      });
      return;
    }

    if (eventName === 'update-game-state' && !this.isHost) return;
    if (eventName === 'game-action' && multiplayerSpectator) return;
    if (eventName === 'game-action') {
      data = { ...data, playerId: this.id };
    }
    const broadcastEvent = eventName === 'update-game-state' ? 'game-state' : eventName;
    this.send(broadcastEvent, data).catch(error => {
      console.error(`No se pudo enviar el evento multijugador ${eventName}:`, error);
      window._showMultiplayerNotice?.(currentLanguage === 'en'
        ? 'The multiplayer message could not be sent.'
        : 'No se pudo enviar el mensaje multijugador.');
    });
  }

  disconnect() {
    this.intentionalDisconnect = true;
    this.connected = false;
    updateMultiplayerChatVisibility();
    setMultiplayerSpectator(false);
    multiplayerPlayers = [];
    multiplayerPlayerCount = 1;
    multiplayerEnabled = false;
    renderMultiplayerPlayerList([]);
    this.channel.unsubscribe().catch(error => {
      console.error('No se pudo cerrar el canal Supabase Realtime:', error);
    });
    getSupabaseClient().removeChannel(this.channel).catch(error => {
      console.error('No se pudo retirar el canal Supabase Realtime:', error);
    });
  }
}

function showMultiplayerServerClosed() {
  if (multiplayerServerClosed) return;
  multiplayerServerClosed = true;
  setMultiplayerSpectator(false);
  multiplayerEnabled = false;
  if (multiplayerSyncInterval !== null) {
    clearInterval(multiplayerSyncInterval);
    multiplayerSyncInterval = null;
  }
  if (window._showMultiplayerServerClosed) window._showMultiplayerServerClosed();
  socket?.disconnect();
}

function getMultiplayerInviteUrl() {
  if (!currentSeed) return '';
  const inviteUrl = new URL(window.location.href);
  inviteUrl.search = '';
  inviteUrl.hash = '';
  inviteUrl.searchParams.set('seed', currentSeed);
  return inviteUrl.href;
}

function isOfflineSession() {
  return offlineModeActive || localStorage.getItem('glob_offline_mode') === 'true';
}

function canPlayAcrossTimeSolo() {
  return !multiplayerEnabled && multiplayerPlayerCount <= 1;
}

function hasInterstellarEntryAccess() {
  return gameState.debugState === 'unlocked' ||
    gameState.cheatedModeActive ||
    (gameState.unlockedInterstellar && Boolean(gameState.usedCodes?.['CR1-M3-CA+GLD']));
}

function setMultiplayerSpectator(spectator) {
  const changed = multiplayerSpectator !== spectator;
  if (changed && spectator) {
    multiplayerSpectatorSavedGlobetines = gameState.globetines;
  } else if (changed && !spectator && multiplayerSpectatorSavedGlobetines !== null) {
    gameState.globetines = multiplayerSpectatorSavedGlobetines;
    multiplayerSpectatorSavedGlobetines = null;
    updateUI();
  }
  multiplayerSpectator = spectator;
  document.body.classList.toggle('multiplayer-spectator', spectator);
  if (!changed) return;
  renderMultiplayerPlayerList(multiplayerPlayers);
  if (!spectator) return;
  window._showMultiplayerNotice?.(currentLanguage === 'en'
    ? 'This Interstellar mission requires the access code and the Interstellar unlock. You can watch the players, but joining the mission is not available yet. Keep progressing and come back when you meet both requirements.'
    : 'Esta misión de Interstellar requiere el código de acceso y haber desbloqueado el modo. Puedes observar a los jugadores, pero todavía no participar. Sigue avanzando y vuelve cuando cumplas ambos requisitos.');
}

function blockOfflineSeedAccess() {
  if (!isOfflineSession()) return false;
  alert(currentLanguage === 'en'
    ? 'Seeds require an online session. Sign in online to create or load a seed.'
    : 'Las seeds requieren una sesión online. Inicia sesión online para crear o cargar una seed.');
  return true;
}

async function joinMultiplayerSeed(seed, creating) {
  if (blockOfflineSeedAccess()) return;

  multiplayerChatEntries = [];
  multiplayerChatMode = 'safe';
  setMultiplayerSpectator(false);
  let connection;
  try {
    if (socket?.connected) socket.disconnect();
    connection = new SupabaseGameConnection(
      seed,
      localStorage.getItem('glob_username') || 'Jugador',
      getMultiplayerProfile()
    );
    connection.on('room-full', () => {
      window._showMultiplayerNotice?.(currentLanguage === 'en'
        ? 'This seed is full (maximum 4 players).'
        : 'Esta seed está llena (máximo 4 jugadores).');
    });
    socket = connection;
    currentSeed = seed;
    multiplayerServerClosed = false;
    await connection.subscribe();
  } catch (error) {
    connection?.disconnect();
    socket = null;
    currentSeed = null;
    console.error('No se pudo preparar la conexión con Supabase Realtime:', error);
    alert(error.message);
    return;
  }
  if (connection.rejected) {
    if (socket === connection) socket = null;
    currentSeed = null;
    multiplayerEnabled = false;
    alert(currentLanguage === 'en' ? 'This room is full (maximum 4 players).' : 'La sala está llena (máximo 4 jugadores).');
    return;
  }
  isSeedHost = connection.isHost;
  if (gameState.waveActive && isSeedHost && roundCheckpointInterval === null) {
    roundCheckpointInterval = setInterval(() => window._checkpointActiveRound?.(), 5000);
  } else if (!isSeedHost && roundCheckpointInterval !== null) {
    clearInterval(roundCheckpointInterval);
    roundCheckpointInterval = null;
  }

  connection.on('game-state', state => {
    if (isSeedHost) return;
    setMultiplayerSpectator(
      state?.mode === 'interstellar' && !hasInterstellarEntryAccess()
    );
    if (window._applyMultiplayerGameState) window._applyMultiplayerGameState(state);
  });
  connection.on('player-joined', data => {
    showPlayerJoinedNotice(data);
  });
  connection.on('player-left', data => {
    window._showMultiplayerNotice?.(currentLanguage === 'en'
      ? `${data.username || 'A player'} left the match.`
      : `${data.username || 'Un jugador'} ha salido de la partida.`);
  });
  connection.on('game-action', action => {
    if (!multiplayerSpectator && window._applyMultiplayerAction) window._applyMultiplayerAction(action);
  });
  connection.on('spawn-enemy', data => {
    if (!multiplayerSpectator && window._spawnEnemy) window._spawnEnemy(data.enemyType, data.boss, data.forcedPath, true);
  });
  connection.on('show-dialog', data => {
    if (window._showNarratorMsg) window._showNarratorMsg(data.id, data.img, data.name, data.text);
  });
  connection.on('chat-message', receiveMultiplayerChatMessage);
  updateSeedDisplay();
  updateMultiplayerChatVisibility();

  if (isSeedHost) {
    if (creating) alert((currentLanguage === 'en' ? 'Seed created: ' : 'Seed creada: ') + seed);
    else window._showMultiplayerNotice?.(currentLanguage === 'en'
      ? 'No active match was found for this seed; you are now its host.'
      : 'No había una partida activa con esta seed; ahora eres su anfitrión.');
  } else {
    let receivedResponse = false;
    const onResponse = response => {
      receivedResponse = true;
      connection.off('join-response', onResponse);
      if (response.snapshot && window._applyMultiplayerGameState) {
        setMultiplayerSpectator(
          response.snapshot.mode === 'interstellar' &&
          (!hasInterstellarEntryAccess() || Boolean(response.spectator))
        );
        window._applyMultiplayerGameState(response.snapshot);
        if (!multiplayerSpectator) {
          window._showMultiplayerNotice?.(currentLanguage === 'en'
            ? `Joined ${response.hostName || 'the host'}'s active match.`
            : `Te has unido a la partida activa de ${response.hostName || 'el anfitrión'}.`);
        }
      } else {
        window._showMultiplayerNotice?.(currentLanguage === 'en'
          ? 'Connected to the room. Waiting for the host to start the match.'
          : 'Conectado a la sala. Esperando a que el anfitrión inicie la partida.');
      }
    };
    connection.on('join-response', onResponse);
    try {
      await connection.send('join-request', {
        requesterId: connection.id,
        interstellarAccess: hasInterstellarEntryAccess()
      }, connection.hostId);
    } catch (error) {
      console.error('No se pudo solicitar el estado al anfitrión:', error);
      window._showMultiplayerNotice?.(currentLanguage === 'en'
        ? 'Could not request the current match from the host.'
        : 'No se pudo solicitar la partida actual al anfitrión.');
    }
    setTimeout(() => {
      if (receivedResponse) return;
      connection.off('join-response', onResponse);
      window._showMultiplayerNotice?.(currentLanguage === 'en'
        ? 'The host did not answer. Check that they are still connected and try joining again.'
        : 'El anfitrión no ha respondido. Comprueba que siga conectado e intenta unirte otra vez.');
    }, 6000);
  }

  if (isSeedHost && multiplayerSyncInterval === null) {
    multiplayerSyncInterval = setInterval(() => {
      if (!socket?.connected || !currentSeed || !window._getMultiplayerGameState) return;
      const state = window._getMultiplayerGameState();
      if (state) socket.emit('update-game-state', state);
    }, 750);
  }
}

function sendMultiplayerAction(action) {
  if (!multiplayerSpectator && socket?.connected && currentSeed && !applyingMultiplayerAction) {
    socket.emit('game-action', action);
  }
}

function generateSeed() {
  const chars = ['G', 'K', 'P', 'W', 'B', 'N', 'A'];
  const startChar = chars[Math.floor(Math.random() * chars.length)];
  let seedNum = '';
  
  if (Math.random() < 0.05) {
    const easterEggs = ['637', '6307', '7001'];
    seedNum = easterEggs[Math.floor(Math.random() * easterEggs.length)];
  }
  
  while(seedNum.length < 6) {
    const r = Math.floor(Math.random() * 36).toString(36).toUpperCase();
    if (r !== 'O' && r !== 'I') seedNum += r;
  }
  
  return startChar + seedNum;
}

function updateSeedDisplay() {
  const seedDisplay = document.getElementById('seed-display');
  const seedCode = document.getElementById('seed-code');
  if (!seedDisplay || !seedCode || !currentSeed) return;
  seedCode.textContent = `SEED: ${currentSeed}`;
  seedDisplay.style.display = 'flex';
}

function updateSeedUiLanguage() {
  const isEnglish = currentLanguage === 'en';
  const controls = document.getElementById('seed-controls');
  const description = controls?.querySelector('p');
  const createButton = controls?.querySelector('button[onclick="createSeed()"]');
  const loadButton = controls?.querySelector('button[onclick="loadSeed()"]');
  const seedInput = document.getElementById('seed-input');
  const copySeedButton = document.getElementById('copy-seed-btn');
  const playerList = document.getElementById('multiplayer-player-list');
  const modal = document.getElementById('seed-options-modal');
  const closeButton = modal?.querySelector('.seed-options-close');
  const copyText = document.getElementById('seed-copy-text');
  const instructions = document.getElementById('seed-copy-instructions');

  if (description) description.textContent = isEnglish
    ? 'Online multiplayer powered by Supabase Realtime.'
    : 'Multijugador online mediante Supabase Realtime.';
  if (createButton) createButton.textContent = isEnglish ? '✨ Create Seed' : '✨ Crear Seed';
  if (loadButton) loadButton.textContent = isEnglish ? 'Load' : 'Cargar';
  if (seedInput) seedInput.placeholder = isEnglish ? 'E.g. G123456' : 'Ej: G123456';
  if (copySeedButton) {
    copySeedButton.setAttribute('aria-label', isEnglish ? 'Seed options' : 'Opciones de seed');
    copySeedButton.title = isEnglish ? 'Seed options' : 'Opciones de seed';
  }
  if (playerList) playerList.setAttribute('aria-label', isEnglish ? 'Seed players' : 'Jugadores de la seed');

  const title = document.getElementById('seed-options-title');
  const modalDescription = document.getElementById('seed-options-description');
  const copyButton = document.getElementById('show-seed-copy-btn');
  const inviteButton = document.getElementById('show-invite-copy-btn');
  const downloadButton = document.getElementById('download-seed-btn');
  if (title) title.textContent = isEnglish ? 'Seed options' : 'Opciones de seed';
  if (modalDescription) modalDescription.textContent = isEnglish
    ? 'Choose how you want to save or share this seed.'
    : 'Elige cómo quieres guardar o compartir esta seed.';
  if (copyButton) copyButton.textContent = isEnglish ? '📋 Copy seed' : '📋 Copiar seed';
  if (inviteButton) inviteButton.textContent = isEnglish ? '🔗 Copy invite link' : '🔗 Copiar invitación';
  if (downloadButton) downloadButton.textContent = isEnglish ? '⬇️ Download seed' : '⬇️ Descargar seed';
  if (closeButton) closeButton.setAttribute('aria-label', isEnglish ? 'Close' : 'Cerrar');
  if (instructions && !instructions.hidden) {
    const isInvite = Boolean(currentSeed && copyText?.value !== currentSeed);
    instructions.textContent = isEnglish
      ? isInvite ? 'Select and copy this invitation link:' : 'Select the text to copy:'
      : isInvite ? 'Selecciona y copia este enlace de invitación:' : 'Selecciona el texto para copiarlo:';
  }
}

window.createSeed = function() {
  if (blockOfflineSeedAccess()) return;
  joinMultiplayerSeed(generateSeed(), true);
};

window.loadSeed = function() {
  if (blockOfflineSeedAccess()) return;
  const input = document.getElementById('seed-input').value.trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9]{6}$/.test(input)) {
    alert(currentLanguage === 'en' ? 'Enter a valid seed.' : 'Introduce una seed válida.');
    return;
  }
  joinMultiplayerSeed(input, false);
};

window.openSeedOptions = function() {
  if (!currentSeed) return;
  const modal = document.getElementById('seed-options-modal');
  const title = document.getElementById('seed-options-title');
  const description = document.getElementById('seed-options-description');
  const copyButton = document.getElementById('show-seed-copy-btn');
  const inviteButton = document.getElementById('show-invite-copy-btn');
  const downloadButton = document.getElementById('download-seed-btn');
  const instructions = document.getElementById('seed-copy-instructions');
  const copyText = document.getElementById('seed-copy-text');
  const closeButton = modal?.querySelector('.seed-options-close');
  const isSpanish = currentLanguage !== 'en';

  if (!modal || !title || !description || !copyButton || !inviteButton || !downloadButton || !instructions || !copyText || !closeButton) {
    console.error('No se pudo abrir el menú de opciones de seed: faltan elementos del diálogo.');
    return;
  }
  title.textContent = isSpanish ? 'Opciones de seed' : 'Seed options';
  description.textContent = isSpanish ? 'Elige cómo quieres guardar o compartir esta seed.' : 'Choose how you want to save or share this seed.';
  copyButton.textContent = isSpanish ? '📋 Copiar seed' : '📋 Copy seed';
  inviteButton.textContent = isSpanish ? '🔗 Copiar invitación' : '🔗 Copy invite link';
  downloadButton.textContent = isSpanish ? '⬇️ Descargar seed' : '⬇️ Download seed';
  instructions.textContent = isSpanish ? 'Selecciona el texto para copiarlo:' : 'Select the text to copy:';
  closeButton.setAttribute('aria-label', isSpanish ? 'Cerrar' : 'Close');
  copyText.hidden = true;
  instructions.hidden = true;
  copyText.value = currentSeed;
  modal.style.display = 'flex';
  closeButton.focus();
};

window.closeSeedOptions = function() {
  const modal = document.getElementById('seed-options-modal');
  if (modal) {
    modal.style.display = 'none';
    document.getElementById('copy-seed-btn')?.focus();
  }
};

window.showSeedCopyText = function() {
  const copyText = document.getElementById('seed-copy-text');
  const instructions = document.getElementById('seed-copy-instructions');
  if (!copyText || !instructions || !currentSeed) return;
  copyText.value = currentSeed;
  copyText.hidden = false;
  instructions.hidden = false;
  copyText.focus();
  copyText.select();
};

window.showInviteCopyText = function() {
  const copyText = document.getElementById('seed-copy-text');
  const instructions = document.getElementById('seed-copy-instructions');
  if (!copyText || !instructions || !currentSeed) return;
  let inviteUrl;
  try {
    inviteUrl = getMultiplayerInviteUrl();
  } catch (error) {
    console.error('No se pudo crear el enlace de invitación:', error);
    alert(error.message);
    return;
  }
  const localPageWarning = window.location.protocol === 'file:'
    ? (currentLanguage === 'en'
      ? 'Open the game from its online website before sharing; this local file link will not work on other computers.'
      : 'Abre el juego desde su página web antes de compartirlo; este enlace local no funcionará en otros ordenadores.')
    : '';
  instructions.textContent = localPageWarning || (currentLanguage === 'en'
    ? 'Select and copy this invitation link:'
    : 'Selecciona y copia este enlace de invitación:');
  copyText.value = inviteUrl;
  copyText.hidden = false;
  instructions.hidden = false;
  copyText.focus();
  copyText.select();
};

window.downloadSeed = function() {
  if (!currentSeed) return;
  let inviteUrl = '';
  try {
    inviteUrl = getMultiplayerInviteUrl();
  } catch (error) {
    console.error('No se pudo crear el enlace de invitación para la descarga:', error);
  }
  const contents = inviteUrl
    ? currentLanguage === 'en'
      ? `Glob Defenders - multiplayer invitation\nSeed: ${currentSeed}\nLink: ${inviteUrl}\n`
      : `Glob Defenders - invitación multijugador\nSeed: ${currentSeed}\nEnlace: ${inviteUrl}\n`
    : `${currentSeed}\n`;
  const file = new Blob([contents], { type: 'text/plain;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `Glob-Defenders-Seed-${currentSeed}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
};
// -------------------

function updateSessionClock() {
  const clock = document.getElementById('session-clock');
  const dateTime = document.getElementById('session-date-time');
  const playTime = document.getElementById('session-play-time');
  if (!clock || !dateTime || !playTime) return;
  const now = new Date();
  const locale = currentLanguage === 'en' ? 'en-GB' : 'es-ES';
  const dateParts = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(now);
  const part = (type) => (dateParts.find(datePart => datePart.type === type)?.value || '0').padStart(2, '0');
  dateTime.textContent = `${part('day')}/${part('month')} · ${part('hour')}:${part('minute')}`;
  dateTime.hidden = !!gameState.settings.hideDate;
  playTime.hidden = sessionStartedAt === null;
  const elapsedSeconds = sessionStartedAt === null ? 0 : Math.floor((Date.now() - sessionStartedAt) / 1000);
  const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(elapsedSeconds % 60).padStart(2, '0');
  playTime.textContent = `${currentLanguage === 'en' ? 'Play' : 'Sesión'} ${hours}:${minutes}:${seconds}`;
  clock.style.display = dateTime.hidden && playTime.hidden ? 'none' : 'flex';
  clock.dateTime = now.toISOString();
  clock.title = `${now.toLocaleString(locale, { dateStyle: 'full', timeStyle: 'medium' })} · ${playTime.textContent}`;
}

function checkBreakReminder() {
  if (sessionStartedAt === null) return;
  const elapsed = Date.now() - sessionStartedAt;
  if (elapsed < nextBreakReminderAt) return;

  nextBreakReminderAt = (Math.floor(elapsed / BREAK_REMINDER_INTERVAL) + 1) * BREAK_REMINDER_INTERVAL;
  const messages = BREAK_REMINDERS[currentLanguage] || BREAK_REMINDERS.es;
  let reminderIndex = Math.floor(Math.random() * messages.length);
  if (messages.length > 1 && reminderIndex === lastBreakReminderIndex) {
    reminderIndex = (reminderIndex + 1 + Math.floor(Math.random() * (messages.length - 1))) % messages.length;
  }
  lastBreakReminderIndex = reminderIndex;

  if (typeof window._showNarratorMsg !== 'function') {
    console.error('No se pudo mostrar el recordatorio de descanso: el narrador no está disponible.');
    return;
  }
  window._showNarratorMsg(
    'break-reminder',
    IMAGE_PATHS.Crystal_Bombot,
    'Work-Bombot',
    messages[reminderIndex]
  );
}

function startSessionClock() {
  sessionStartedAt = Date.now();
  nextBreakReminderAt = BREAK_REMINDER_INTERVAL;
  lastBreakReminderIndex = -1;
  updateSessionClock();
  if (sessionClockInterval === null) {
    sessionClockInterval = setInterval(() => {
      updateSessionClock();
      checkBreakReminder();
    }, 1000);
  }
}

function stopSessionClock() {
  sessionStartedAt = null;
  updateSessionClock();
}


// Generamos spots automáticamente evitando el río y el camino
const TOWER_SPOTS = [];
let ENEMY_PATHS = [];
function generateSpots() {
  TOWER_SPOTS.length = 0;

  const mapKey = gameState.map || 'gelatin_lake';
  const mapData = MAPS[mapKey];
  if (!mapData) return;

  ENEMY_PATHS = mapData.enemyPaths ? mapData.enemyPaths : [mapData.enemyPath];

  const islandZones = mapData.islandZones || [];
  const forbiddenZones = [...mapData.riverZones, ...mapData.pathSegments];
  const desertRouteSegments = mapKey === 'spooktacular_ruins'
    ? mapData.enemyPaths.flatMap(path => path.slice(1).map((end, index) => ({ start: path[index], end })))
    : [];

  if (mapKey === 'sunlight_seaside') {
    mapData.islandZones.forEach(island => {
      const x = island.x + island.w / 2;
      const y = island.y + island.h / 2;
      const outsideMap = x - 40 < 0 || x + 40 > 1000 || y - 40 < 0 || y + 40 > 600;
      const overlapsPath = mapData.pathSegments.some(path =>
        x + 40 > path.x && x - 40 < path.x + path.w &&
        y + 40 > path.y && y - 40 < path.y + path.h
      );
      if (!outsideMap && !overlapsPath) {
        TOWER_SPOTS.push({ x: x - 40, y: y - 40, w: 80, h: 80 });
      }
    });
    console.log(`✅ Generados ${TOWER_SPOTS.length} spots para torres en ${mapKey}`);
    return;
  }

  for (let x = 35; x < 950; x += 75) {
    for (let y = 35; y < 550; y += 75) {
      let collides = false;
      let onIsland = false;

      // Check if this spot is on a sand island
      for (let island of islandZones) {
        if (x + 30 > island.x && x - 30 < island.x + island.w &&
          y + 30 > island.y && y - 30 < island.y + island.h) {
          onIsland = true;
          break;
        }
      }

      if (!onIsland) {
        // Regular collision check against all forbidden zones
        for (let zone of forbiddenZones) {
          if (x + 40 > zone.x && x - 40 < zone.x + zone.w &&
            y + 40 > zone.y && y - 40 < zone.y + zone.h) {
            collides = true;
            break;
          }
        }
      } else {
        // On island: only block if overlapping a path
        for (let seg of mapData.pathSegments) {
          if (x + 30 > seg.x && x - 30 < seg.x + seg.w &&
            y + 30 > seg.y && y - 30 < seg.y + seg.h) {
            collides = true;
            break;
          }
        }
      }

      if (x < 20 || x > 960 || y < 20 || y > 560) collides = true;
      if (!collides && desertRouteSegments.some(({ start, end }) => {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const lengthSquared = dx * dx + dy * dy;
        const projection = Math.max(0, Math.min(1, ((x - start.x) * dx + (y - start.y) * dy) / lengthSquared));
        return Math.hypot(x - (start.x + projection * dx), y - (start.y + projection * dy)) < 58;
      })) collides = true;
      if (!collides) {
        TOWER_SPOTS.push({
          x: x - 40,
          y: y - 40,
          w: 80,
          h: 80,
          christmasColor: TOWER_SPOTS.length % 2 === 0 ? 'red' : 'green'
        });
      }
    }
  }
  console.log(`✅ Generados ${TOWER_SPOTS.length} spots para torres en ${mapKey}`);
}

let gameState = {
  health: 100, wave: 0,
  towers: [], enemies: [], projectiles: [], boats: [],
  selectedTowerType: null, waveActive: false, spawningActive: false,
  gameOver: false, paused: false, adminMode: false, autoWave: false,
  towerSpots: [],
  mode: 'normal',
  map: 'gelatin_lake',
  selectedIsland: null,
  tutorialIntroSeen: true,
  tutorialCompleted: false,
  tutorialRewardGranted: false,
  tutorialStage: null,
  tutorialFocusSpotId: null,
  globlandHardWins: { gelatin_lake: false, urbanistic_road: false, sunlight_seaside: false },
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
    'Comet_Glob': 3, 'Old_Glob': 2, 'Work_Bombot': 1, 'White': 1, 'Pink': 1, 'IEx': 1, 'Worker_Glob': 2, 'Pirate_Glob': 1
  },
  usedCodes: {},
  towerCounts: {},
  towerBuffs: { damage: 1, range: 0, speed: 1 },
  metaRange: 0,
  metaDamage: 1,
  metaRangeLevel: 0,
  metaDamageLevel: 0,
  unlockedSkins: ['default'],
  unlockedBombotAccessories: [],
  adventCalendar: { claimedDays: {}, victoryDays: {}, paidDays: {}, tamperedYears: [], lastSeenDate: null },
  equippedBombotAccessories: { head: null, front: [], suit: null, reskin: null },
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
  settings: { showShopDesc: true, showTotalDamage: false, oldAchievements: false, autoEnglish: false, hideDate: false, hypermutatedEffect: false, glitchEffect: false },
  hypermutatedUnlocked: false,
  glitchUnlocked: false,
  duckgrades: {},
  blockQuestActive: false,
  blockQuestStage: 0,
  blockQuestCompleted: false,
  blockQuestVictories: 0,
  blockQuestHadBlockTales: false,
  acrossTheTimeProgress: {
    started: false,
    spaceOneComplete: false,
    spaceTwoComplete: false,
    spaceThreeComplete: false,
    completed: false,
    timeAttackUnlocked: false
  },
  acrossTheTimeSpace: 0,
  acrossTimeCrystals: 0,
  acrossTimePuzzleSpots: [],
  acrossTimeBossReturns: 0,
  acrossTimeTowerAttackTimer: 0,
  acrossTimeTowerCaps: null,
  blockQuestStarted: false,
  paracristalActive: false,
  paracristalEnergy: 100,
  paracristalAstrorbSeen: false,
  paracristalFinal: false,
  interstellarParacristalQuest: false,
  gtacks: { 'Glob': false, 'Red_Glob': false, 'Soap_Glob': false, 'Ducky_Glob': false, 'Comet_Glob': false, 'Old_Glob': false, 'Pirate_Glob': false, 'White': false, 'Pink': false },
  pycesKilled: {},
  globsPlaced: {},
  rareEnemiesSpawned: {},
  networkEntityCounter: 0,
  maxedFamilies: [],
  profileMaxAvatars: [],
  profileMaxRewampAvatars: [],
  profileSpecialAvatars: [],
  profileAvatar: 'glob:Glob',
  profileBorder: 'default',
  profilePurchasedBorders: [],
  profileMapModeWins: {},
  savedRoundSnapshot: null,
  waveSpawnQueue: [],
  waveSpawnIndex: 0,
  waveSpawnIsBoss: false,
  waveBossTypes: [],
  waveSpawnIntervalMs: 0,
  collectionMasterDialogueShown: false,
  wallGardenSoapMessageShown: false,
  rainbowFuelClicks: {},     // {familia: nº de Globs de esa familia clicados en el login}
  rainbowFuelUnlocked: [],   // familias con Rainbow Fuel desbloqueado
  winterPassXP: 0,           // XP del pase de invierno (nivel sube cada 100)
  winterPassLevel: 1,
  winterPassClaimed: [],     // niveles de recompensa del pase de invierno ya reclamados
  unlockedRecolors: [],      // efectos del Pase de Invierno desbloqueados (monochrome, negative, snowy, alternate)
  profileAvatarEffect: '',   // efecto elegido para la imagen Rewamp/RGB del perfil ('' = el de la imagen)
  uniquesBossSpawned: {}  // Tracks NOeye_Pyce, MoonStar_Pyce (only 1 per game)
};

let tutorialEquippedSkinsBackup = null;
let tutorialProgressionBackup = null;
const TUTORIAL_BOSSES_BY_MAP = {
  gelatin_lake: ['4motions_Pyce'],
  urbanistic_road: ['Cannon_Pycer', 'Knight_Pyce'],
  sunlight_seaside: ['Old_Fungus'],
  spooktacular_ruins: ['Blood_Taker', 'SkeleBone_Pyce'],
};
const PERSONALIZABLE_BOMBOT_SKIN_ID = 'personalizable_bombot';
const ADVENT_CALENDAR_ACCESSORY_ROOT = 'Recursos/FROZEN CALENDAR CHRISTMAS (UPD6)/Skins/Advent Calendar/PersonalizbleBot/';
const ADVENT_CALENDAR_REWARDS = [
  { reward: { type: 'duckpass', amount: 250 } },
  { reward: { type: 'xp', amount: 500 } },
  { reward: { type: 'accessory', id: 'noob_bombot_reskin' } },
  { reward: { type: 'accessory', id: 'guest_bombot_reskin' } },
  { reward: { type: 'accessory', id: 'wb_retro_cap' } },
  { reward: { type: 'accessory', id: 'ducky_hat' } },
  { reward: { type: 'pycoins', amount: 350 } },
  { reward: { type: 'xp', amount: 750 } },
  { reward: { type: 'accessory', id: 'giftbot_reskin' } },
  { reward: { type: 'accessory', id: 'blockbot_reskin' } },
  { reward: { type: 'accessory', id: 'toy_and_key' } },
  { reward: { type: 'accessory', id: 'tvombot_reskin' } },
  { reward: { type: 'accessory', id: 'kirb_headsets' } },
  { reward: { type: 'skin', id: 'snowglob_set' } },
  { reward: { type: 'pycoins', amount: 450 } },
  { reward: { type: 'xp', amount: 1000 } },
  { reward: { type: 'accessory', id: 'silent_habitant_reskin' } },
  { reward: { type: 'accessory', id: 'monobear_bombot_reskin' } },
  { reward: { type: 'accessory', id: 'bunnity_bombot_reskin' } },
  { reward: { type: 'accessory', id: 'glamour_hat' } },
  { reward: { type: 'pycoins', amount: 550 } },
  { reward: { type: 'duckpass', amount: 350 } },
  { reward: { type: 'duckpass', amount: 500 } },
  { reward: { type: 'accessory', id: 'fungunous_hat' } },
  { reward: { type: 'duckpass', amount: 600 } }
];
const ADVENT_CALENDAR_CHRISTMAS_REWARD_IDS = new Set([
  'giftbot_reskin', 'blockbot_reskin', 'toy_and_key', 'tvombot_reskin', 'kirb_headsets', 'snowglob_set', 'santa_workshop_set'
]);
const CHRISTMAS_ENEMY_TYPES = new Set([
  'Festive_Pyce', 'ToyBomb_Pyce', 'SnowCapsule_Pyce', 'Elf_Pyce', 'Giftbox_Pyce'
]);
const CHRISTMAS_LOGIN_ENEMY_IMAGES = new Set(
  [...CHRISTMAS_ENEMY_TYPES].flatMap(type => {
    const enemy = ENEMY_TYPES[type];
    return enemy?.imageVariants || [enemy?.image];
  }).filter(Boolean)
);

// --- Clasificación de enemigos para los fondos de diálogo custom (Lote 2) ---
// Enemigos cuyo nombre contiene "Pyce" pero que NO son Pyces en el lore
// (p. ej. GiftBox, que lo parece pero no lo es).
const NON_PYCE_ENEMY_EXCEPTIONS = new Set(['Giftbox_Pyce']);

// Respaldo de traducciones para los jefes de Frosty Christmas. Inyecta las
// claves en TRANSLATIONS solo si faltan, para que funcionen aunque no estén
// en traducciones.js (sin pisar las existentes ni editar ese archivo).
function ensureChristmasBossTranslations() {
  if (typeof TRANSLATIONS === 'undefined' || !TRANSLATIONS) return;
  const fallback = {
    es: {
      enemy_NOsense_Pyce_name: 'NOsense Pyce',
      enemy_NOsense_Pyce_desc: 'Un Pyce hecho a partir de esencia navideña y materia negra procedente de NOeye. Es un ser realmente aterrador, ya que flota como si nada y quiere acabar con la navidad que lo creó. NOeye tuvo que enfrentarse a él una vez para apartarlo de Techspawn, donde fue creado... Pero su alma ha vuelto y se ha rehecho como un auténtico fantasma aterrador.<br><br><strong>Recompensa:</strong> 3 bajas para enmarcarlo.',
      enemy_NOIRrupt_Pyce_name: 'NOIRrupt Pyce',
      enemy_NOIRrupt_Pyce_desc: 'Esas pruebas locas del Pyce Científico Loco de Techspawn dieron sus frutos, pero no contaba con que acabaría destruyendo la navidad y raptando a Santa Pyce en el proceso. Aún peor es que se haya oscurecido del odio y rencor de NOeye, ahora pareciendo una copia fantasmal suya, lleno de lo que NOeye quiso ser y terminó aprendiendo. «El odio no es la respuesta, sino el paso para acabar con quien siempre fuiste.»<br><br><strong>Recompensa:</strong> 3 bajas para enmarcarlo.',
      enemy_Puz_Zle_name: 'Puz & Zle',
      enemy_Puz_Zle_desc: 'Dos hermanos venidos de I.D. que viven obsesionados con los acertijos. Puz, el mayor, es el lúdico y juguetón; Zle, el pequeño, es el matemático y calculador. Forman un dúo inseparable... pero no por mucho: al ser derrotados se separan en Puz y Zle, que siguen avanzando cada uno por su cuenta. Nada les hace más felices que dejarte un buen rompecabezas por resolver.',
      enemy_Puz_name: 'Puz',
      enemy_Puz_desc: 'El hermano mayor del dúo de I.D., el lúdico y juguetón. Tras separarse de Zle sigue adelante por su cuenta, convencido de que la diversión es el mejor acertijo de todos.',
      enemy_Zle_name: 'Zle',
      enemy_Zle_desc: 'El hermano menor del dúo de I.D., el matemático y calculador. Separado de Puz, avanza en solitario resolviendo en su cabeza cada número que se cruza en su camino.',
      enemy_Wingel_Pyce_name: 'Wingel Pyce',
      enemy_Wingel_Pyce_desc: 'Un Pyce con alas que ha alcanzado la forma de un ángel, aunque todavía sin halo. Los Pyces siempre soñaron con volar, y este por fin lo ha conseguido. Es veloz y, al surcar los cielos, algunas torres ni siquiera llegan a alcanzarlo. Su aleteo reparte suerte y felicidad a su alrededor durante un breve instante.<br><br><strong>Mecánica:</strong> cura a los enemigos cercanos. Inmune a parálisis, veneno y ácido, pero débil ante el fuego.'
    },
    en: {
      enemy_NOsense_Pyce_name: 'NOsense Pyce',
      enemy_NOsense_Pyce_desc: 'A Pyce made from Christmas essence and dark matter taken from NOeye. A truly terrifying being that floats effortlessly and wants to destroy the very Christmas that created it. NOeye once had to face it to drive it away from Techspawn, where it was created... But its soul has returned, reforged into a genuinely horrifying ghost.<br><br><strong>Reward:</strong> 3 kills to frame.',
      enemy_NOIRrupt_Pyce_name: 'NOIRrupt Pyce',
      enemy_NOIRrupt_Pyce_desc: 'Those wild experiments by Techspawn\'s Mad Scientist Pyce paid off, but it never expected to end up destroying Christmas and kidnapping Santa Pyce in the process. Worse still, it has darkened with NOeye\'s hatred and resentment, now resembling a ghostly copy of him, full of everything NOeye wished to be and ultimately learned. "Hatred is not the answer, only the step toward ending who you always were."<br><br><strong>Reward:</strong> 3 kills to frame.',
      enemy_Puz_Zle_name: 'Puz & Zle',
      enemy_Puz_Zle_desc: 'Two brothers from I.D. obsessed with riddles. Puz, the elder, is the playful, game-loving one; Zle, the younger, is the mathematical, calculating one. They form an inseparable duo... but not for long: when defeated they split into Puz and Zle, who each keep advancing on their own. Nothing makes them happier than leaving you a good puzzle to solve.',
      enemy_Puz_name: 'Puz',
      enemy_Puz_desc: 'The elder brother of the I.D. duo, the playful, game-loving one. After splitting from Zle he carries on by himself, certain that fun is the greatest puzzle of all.',
      enemy_Zle_name: 'Zle',
      enemy_Zle_desc: 'The younger brother of the I.D. duo, the mathematical, calculating one. Split from Puz, he advances alone, solving in his head every number that crosses his path.',
      enemy_Wingel_Pyce_name: 'Wingel Pyce',
      enemy_Wingel_Pyce_desc: 'A winged Pyce that has taken the form of an angel, though still without a halo. Pyces have always dreamed of flying, and this one finally can. It is fast, and as it soars some towers cannot even reach it. Its wingbeat spreads luck and happiness around it for a brief moment.<br><br><strong>Mechanic:</strong> heals nearby enemies. Immune to stun, poison and acid, but weak to fire.'
    }
  };
  // Skins RGB de Worker (naranja) e IEx, y textos del Pase de Invierno.
  const extra = {
    es: {
      skin_worker_rgb_name: 'RGB Naranja Secreto',
      skin_worker_rgb_desc: 'La familia naranja (Worker) con un efecto RGB animado sobre su diseño original. Se desbloquea al reunir todas las imágenes de perfil.<br><br><span style="color:#ff69b4">Creado por KirByte_Bi</span>',
      skin_iex_rgb_name: 'RGB Explosivo Secreto',
      skin_iex_rgb_desc: 'La familia Instantánea Explosiva (Bomb) con un efecto RGB animado sobre su diseño original. Se desbloquea al reunir todas las imágenes de perfil.<br><br><span style="color:#ff69b4">Creado por KirByte_Bi</span>',
      winter_pass_title: '❄️ Pase de Invierno',
      winter_pass_opens_soon: '🔒 ABRE PRÓXIMAMENTE'
    },
    en: {
      skin_worker_rgb_name: 'Orange RGB Secret',
      skin_worker_rgb_desc: 'The orange (Worker) family with an animated RGB effect over its original design. Unlock it by collecting every profile image.<br><br><span style="color:#ff69b4">Created by KirByte_Bi</span>',
      skin_iex_rgb_name: 'Explosive RGB Secret',
      skin_iex_rgb_desc: 'The Instant Explosive (Bomb) family with an animated RGB effect over its original design. Unlock it by collecting every profile image.<br><br><span style="color:#ff69b4">Created by KirByte_Bi</span>',
      winter_pass_title: '❄️ Winter Pass',
      winter_pass_opens_soon: '🔒 OPENS SOON'
    }
  };
  Object.keys(extra).forEach(lang => {
    Object.assign(fallback[lang], extra[lang]);
  });
  ['es', 'en'].forEach(lang => {
    if (!TRANSLATIONS[lang]) return;
    Object.entries(fallback[lang]).forEach(([key, value]) => {
      if (!(key in TRANSLATIONS[lang])) TRANSLATIONS[lang][key] = value;
    });
  });
}

// Mismo criterio que usa la enciclopedia para separar Pyces de "otros enemigos".
function isPyceEnemy(type) {
  if (!type) return false;
  if (NON_PYCE_ENEMY_EXCEPTIONS.has(type)) return false;
  return type.includes('Pyce') || type.includes('Pysh') || type === 'SO_Pyce';
}

// Enemigos "oscuros": normalmente no hablan, pero con custom dialog usan el
// fondo negro/lila/niebla. Lista explícita y ampliable.
const DARK_DIALOGUE_SPEAKERS = new Set([
  'noeye', 'darkspirit', 'GODs_Shadow', 'kirb_clone', 'error_entity'
]);

// Devuelve la clase de tema para el bubble del narrador según el hablante.
function getNarratorThemeClass(speakerId, imgSrc = '', variant = '') {
  // Jefes de Frosty Christmas (prioridad sobre el tema navideño genérico).
  if (speakerId === 'nosense') return 'narrator-noel';
  if (speakerId === 'noirrupt') return 'narrator-noir';
  // Navideños: candy para Pyces, nevado para "otros enemigos" (GiftBox).
  const christmasType = [...CHRISTMAS_ENEMY_TYPES].find(type =>
    type === speakerId ||
    (ENEMY_TYPES[type]?.image && imgSrc && imgSrc.includes(ENEMY_TYPES[type].image))
  );
  if (christmasType) {
    return isPyceEnemy(christmasType) ? 'narrator-christmas-pyce' : 'narrator-christmas-other';
  }
  // Oscuros: por lista explícita o por el variant de voz enemiga.
  if (DARK_DIALOGUE_SPEAKERS.has(speakerId) || variant === 'enemy-voice') {
    return 'narrator-dark';
  }
  return '';
}
const ADVENT_CALENDAR_SHOP_PRICES = {
  noob_bombot_reskin: 250,
  guest_bombot_reskin: 250,
  wb_retro_cap: 130,
  ducky_hat: 130,
  fungunous_hat: 130,
  glamour_hat: 130,
  kirb_headsets: 130,
  silent_habitant_reskin: 250,
  monobear_bombot_reskin: 250,
  bunnity_bombot_reskin: 250
};
const WINTER_PASS_ACCESSORY_ROOT = 'Recursos/FROZEN CALENDAR CHRISTMAS (UPD6)/Skins/P.Bombot AccesoriesReskins/';
const BOMBOT_ACCESSORIES = [
  // --- ASPECTOS BASE (RESKINS) ---
  { id: 'cuby_reskin', name: { es: 'Aspecto Cuby', en: 'Cuby Reskin' }, slot: 'reskin', image: 'Cuby (RESKIN).png', unlock: 'duckpass_cuby' },
  { id: 'pinkbot_reskin', name: { es: 'Aspecto Pinkbot', en: 'Pinkbot Reskin' }, slot: 'reskin', image: 'Kirbybot (RESKIN).png', cost: 150, unlock: 'pink_family', copyright: 'Concept inspired by Kirby (\u00a9 HAL Laboratory / Nintendo)' },
  { id: 'popguin_reskin', name: { es: 'Aspecto POPguin', en: 'POPguin Reskin' }, slot: 'reskin', image: 'POPguin (RESKIN).png', cost: 175, unlock: 'monster_framed' },
  { id: 'volcabot_reskin', name: { es: 'Aspecto Volcabot', en: 'Volcabot Reskin' }, slot: 'reskin', image: 'Volcabot (RESKIN).png', cost: 250, unlock: 'fireflies_framed' },

  // --- CABEZA (gorros y pelos) ---
  { id: 'worker_cap', name: { es: 'Gorra de Obrero', en: 'Worker Cap' }, slot: 'head', image: 'Worker Cap.png', cost: 50 },
  { id: 'umbrella_hat', name: { es: 'Sombrero Paraguas', en: 'Umbrella Hat' }, slot: 'head', image: 'Umbrella Hat.png', unlock: 'sunlight_hard' },
  { id: 'santa_hat', name: { es: 'Gorro de Santa', en: 'Santa Hat' }, slot: 'head', image: 'Santa Hat.png', cost: 80 },
  { id: 'witch_hat', name: { es: 'Sombrero de Bruja', en: 'Witch Hat' }, slot: 'head', image: 'Witch Hat.png', cost: 80 },
  { id: 'princess_hat', name: { es: 'Sombrero de Princesa', en: 'Princess Hat' }, slot: 'head', image: 'Princess Hat.png', cost: 50 },
  { id: 'bombot_hair', name: { es: 'Pelo de Bombot', en: 'Bombot Hair' }, slot: 'head', image: 'Bombot Hair.png', unlock: 'duckpass_bombot_hair' },
  { id: 'girly_hair', name: { es: 'Pelo Femenino', en: 'Girly Hair' }, slot: 'head', image: 'Girly Hair.png', unlock: 'duckpass_girly_hair' },
  { id: 'headsets', name: { es: 'Auriculares', en: 'Headsets' }, slot: 'head', image: 'Headsets.png', cost: 50 },
  { id: 'crystalized_hat', name: { es: 'Sombrero Cristalizado', en: 'Crystalized Hat' }, slot: 'head', image: 'Crystlaized Hat.png', unlock: 'interstellar' },
  { id: 'rewamped_glob', name: { es: 'Gorro Glob Remasterizado', en: 'Rewamped Glob Hat' }, slot: 'head', image: 'RewampedGlob.png', unlock: 'rewamped_skin' },
  { id: 'cutely_haired', name: { es: 'Pelo Adorable', en: 'Cutely Haired' }, slot: 'head', image: 'Cutely Haired.png', cost: 100, copyright: 'Inspired by Hatsune Miku (\u00a9 Crypton Future Media, Inc.)' },
  { id: 'lovely_haired', name: { es: 'Pelo Encantador', en: 'Lovely Haired' }, slot: 'head', image: 'Lovely Haired.png', cost: 100, copyright: 'Inspired by Kasane Teto (\u00a9 AHS Co., Ltd.)' },
  { id: 'wb_retro_cap', name: { es: 'Gorra Retro W-B', en: 'W-B Retro Cap' }, slot: 'head', image: 'W-B Retro Cap.png', assetRoot: ADVENT_CALENDAR_ACCESSORY_ROOT, duckpassCost: ADVENT_CALENDAR_SHOP_PRICES.wb_retro_cap },
  { id: 'ducky_hat', name: { es: 'Gorro Ducky', en: 'Ducky Hat' }, slot: 'head', image: 'Ducky Hat.png', assetRoot: ADVENT_CALENDAR_ACCESSORY_ROOT, duckpassCost: ADVENT_CALENDAR_SHOP_PRICES.ducky_hat },
  { id: 'fungunous_hat', name: { es: 'Gorro Fungunous', en: 'Fungunous Hat' }, slot: 'head', image: 'Fungunous Hat.png', assetRoot: ADVENT_CALENDAR_ACCESSORY_ROOT, duckpassCost: ADVENT_CALENDAR_SHOP_PRICES.fungunous_hat },
  { id: 'glamour_hat', name: { es: 'Gorro Glamour', en: 'Glamour Hat' }, slot: 'head', image: 'Glamour Hat.png', assetRoot: ADVENT_CALENDAR_ACCESSORY_ROOT, duckpassCost: ADVENT_CALENDAR_SHOP_PRICES.glamour_hat },
  { id: 'kirb_headsets', name: { es: 'Auriculares de Kirb', en: "Kirb's Headsets" }, slot: 'head', image: 'Kirb_s Headsets.png', assetRoot: ADVENT_CALENDAR_ACCESSORY_ROOT, duckpassCost: ADVENT_CALENDAR_SHOP_PRICES.kirb_headsets },
  { id: 'toy_and_key', name: { es: 'Juguete y llave', en: 'Toy & Key' }, slot: 'front', frontType: 'hand', image: 'Toy&Key.png', assetRoot: ADVENT_CALENDAR_ACCESSORY_ROOT },
  { id: 'blockbot_reskin', name: { es: 'Aspecto Blockbot', en: 'Blockbot Reskin' }, slot: 'reskin', image: 'Blockbot (RESKIN).png', assetRoot: ADVENT_CALENDAR_ACCESSORY_ROOT },
  { id: 'bunnity_bombot_reskin', name: { es: 'Aspecto Bunnity Bombot', en: 'Bunnity Bombot Reskin' }, slot: 'reskin', image: 'Bunnity Bombot (RESKIN).png', assetRoot: ADVENT_CALENDAR_ACCESSORY_ROOT, duckpassCost: ADVENT_CALENDAR_SHOP_PRICES.bunnity_bombot_reskin },
  { id: 'giftbot_reskin', name: { es: 'Aspecto Giftbot', en: 'Giftbot Reskin' }, slot: 'reskin', image: 'Giftbot (RESKIN).png', assetRoot: ADVENT_CALENDAR_ACCESSORY_ROOT },
  { id: 'guest_bombot_reskin', name: { es: 'Aspecto Guest Bombot', en: 'Guest Bombot Reskin' }, slot: 'reskin', image: 'Guest Bombot (RESKIN).png', assetRoot: ADVENT_CALENDAR_ACCESSORY_ROOT, duckpassCost: ADVENT_CALENDAR_SHOP_PRICES.guest_bombot_reskin },
  { id: 'monobear_bombot_reskin', name: { es: 'Aspecto Monobear Bombot', en: 'Monobear Bombot Reskin' }, slot: 'reskin', image: 'Monobear Bombot (RESKIN).png', assetRoot: ADVENT_CALENDAR_ACCESSORY_ROOT, duckpassCost: ADVENT_CALENDAR_SHOP_PRICES.monobear_bombot_reskin },
  { id: 'noob_bombot_reskin', name: { es: 'Aspecto Noob Bombot', en: 'Noob Bombot Reskin' }, slot: 'reskin', image: 'Noob Bombot (RESKIN).png', assetRoot: ADVENT_CALENDAR_ACCESSORY_ROOT, duckpassCost: ADVENT_CALENDAR_SHOP_PRICES.noob_bombot_reskin },
  { id: 'silent_habitant_reskin', name: { es: 'Aspecto Silent Habitant', en: 'Silent Habitant Reskin' }, slot: 'reskin', image: 'Silent Habitant (RESKIN).png', assetRoot: ADVENT_CALENDAR_ACCESSORY_ROOT, duckpassCost: ADVENT_CALENDAR_SHOP_PRICES.silent_habitant_reskin },
  { id: 'tvombot_reskin', name: { es: 'Aspecto TVombot', en: 'TVombot Reskin' }, slot: 'reskin', image: 'TVombot (RESKIN).png', assetRoot: ADVENT_CALENDAR_ACCESSORY_ROOT },

  // --- FRONTAL ---
  { id: 'glasses1', name: { es: 'Gafas 1', en: 'Glasses 1' }, slot: 'front', frontType: 'glasses', image: 'Glasses1.png', cost: 50 },
  { id: 'glasses2', name: { es: 'Gafas 2', en: 'Glasses 2' }, slot: 'front', frontType: 'glasses', image: 'Glasses2.png', cost: 50 },
  { id: 'sunglasses', name: { es: 'Gafas de Sol', en: 'Sunglasses' }, slot: 'front', frontType: 'glasses', image: 'Sunglasses.png', unlock: 'sunlight_seaside' },
  { id: 'pyce2_headset', name: { es: 'Gafas RV Pyce2', en: 'Pyce2 VR Headset' }, slot: 'front', frontType: 'glasses', image: 'Pyce2 Headset.png', unlock: 'duckpass_pyce2_headset' },
  { id: 'girly_eyelashes', name: { es: 'Pestañas', en: 'Girly Eyelashes' }, slot: 'front', frontType: 'eyelashes', image: 'Girly eyes.png', cost: 50 },
  { id: 'glob_mask', name: { es: 'Máscara Glob', en: 'Glob Mask' }, slot: 'front', frontType: 'mask', image: 'Glob Mask.png', unlock: 'gelatin_lake' },
  { id: 'noeye_mask', name: { es: 'Máscara NOeye', en: 'NOeye Mask' }, slot: 'front', frontType: 'mask', image: 'NOeye Mask.png', unlock: 'anti_normal' },
  { id: 'cyborg', name: { es: 'Cíborg', en: 'Cyborg' }, slot: 'front', frontType: 'cyborg', image: 'Cyborg.png', cost: 50 },
  { id: 'magic_wand', name: { es: 'Varita Mágica', en: 'Magic Wand' }, slot: 'front', frontType: 'hand', image: 'Magic Wand.png', cost: 50 },
  { id: 'microphone', name: { es: 'Micrófono', en: 'Microphone' }, slot: 'front', frontType: 'hand', image: 'Microphone.png', cost: 50 },
  { id: 'girly_eyelashes_dark', name: { es: 'Pestañas Negras', en: 'Dark Eyelashes' }, slot: 'front', frontType: 'eyelashes', image: 'Girly eyes (Cuby).png', cost: 50 },
  { id: 'the_watcher', name: { es: 'El Vigilante', en: 'The Watcher' }, slot: 'front', frontType: 'hand', image: 'TheWatcher.png', cost: 100, copyright: 'Inspired by Yo-kai Watch (\u00a9 LEVEL-5 Inc.)' },
  { id: 'wb_shield', name: { es: 'Escudo W-B', en: 'W-B Shield' }, slot: 'front', frontType: 'hand', image: 'W-B Shield.png', cost: 50 },
  { id: 'wb_sword', name: { es: 'Espada W-B', en: 'W-B Sword' }, slot: 'front', frontType: 'hand', image: 'W-B Sword.png', cost: 50 },

  // --- TRAJES ---
  { id: 'companied_suit', name: { es: 'Traje Formal', en: 'Companied Suit' }, slot: 'suit', image: 'Companied Suit.png', unlock: 'urbanistic_road' },
  { id: 'pumpkin', name: { es: 'Traje de Calabaza', en: 'Pumpkin' }, slot: 'suit', image: 'Pumpkin.png', unlock: 'spooktacular_ruins' },
  { id: 'portlalic_suit', name: { es: 'Traje Portálico', en: 'Portalic Suit' }, slot: 'suit', image: 'Portlalic Suit.png', unlock: 'urban_corrupt' },
  { id: 'darkness_emissary', name: { es: 'Emisario Oscuro', en: 'Darkness Emissary' }, slot: 'suit', image: 'Darkness Emisary.png', unlock: 'spooktacular_anti_normal' },
  { id: 'insanely_cristalized', name: { es: 'Increíblemente Cristalizado', en: 'Insanely Cristalized' }, slot: 'suit', image: 'Inanely Cristalized.png', unlock: 'interstellar' },

  // --- WINTER PASS: reskins y accesorios ---
  // Furnace y Clockwork no admiten gorros (se inclinan sobre el Bombot). Sí
  // admiten accesorios frontales. Furnace además admite su gorro de chef (Bakhef).
  { id: 'furnace_bombot_reskin', name: { es: 'Bombot Horno', en: 'Furnace Bombot' }, slot: 'reskin', image: 'Furnace Bombot.png', assetRoot: WINTER_PASS_ACCESSORY_ROOT, unlock: 'winter_pass', noHats: true, allowedHats: ['bakhef'] },
  { id: 'clockwork_bombot_reskin', name: { es: 'Bombot Reloj', en: 'Clockwork Bombot' }, slot: 'reskin', image: 'Clockwork Bombot.png', assetRoot: WINTER_PASS_ACCESSORY_ROOT, unlock: 'winter_pass', noHats: true },
  { id: 'red_breath_bombot_reskin', name: { es: 'Bombot Barba Roja', en: 'Red Beard Bombot' }, slot: 'reskin', image: 'Red Breath Bombot.png', assetRoot: WINTER_PASS_ACCESSORY_ROOT, unlock: 'winter_pass' },
  { id: 'bakhef', name: { es: 'Pastecinero', en: 'Bakhef' }, slot: 'head', image: 'Bakhef.png', assetRoot: WINTER_PASS_ACCESSORY_ROOT, unlock: 'winter_pass' },
  { id: 'golderous_spoon', name: { es: 'Cuchara Dorada', en: 'Golderous Spoon' }, slot: 'front', frontType: 'hand', image: 'Golderous Spoon.png', assetRoot: WINTER_PASS_ACCESSORY_ROOT, unlock: 'winter_pass' },
  { id: 'dingdong_ticktock', name: { es: 'Dingdong Tictac', en: 'Ding-a-Ling Ticktock' }, slot: 'front', frontType: 'hand', image: 'Ding-a-Ling Ticktock.png', assetRoot: WINTER_PASS_ACCESSORY_ROOT, unlock: 'winter_pass' }
];
const BOMBOT_ACCESSORY_ASSET_ROOT = 'Recursos/Spooks in the Desert (UPD4)/Skins/Personalizable Bombot (SKIN + ACCESORIES)/';

const BOMBOT_ACCESSORY_PREVIEWS = {
  girly_eyelashes: { scale: 3.5, x: 6.3, y: 13.9 },
  girly_eyelashes_dark: { scale: 3.5, x: 6.3, y: 13.9 },
  magic_wand: { scale: 1.9, x: 37.8, y: 17.4 },
  microphone: { scale: 1.8, x: 35.6, y: 20.8 },
  cyborg: { scale: 2.2, x: 14.8, y: 4.4 },
  glasses1: { scale: 2.2, x: 8.3, y: 9.7 },
  glasses2: { scale: 2.2, x: 8.3, y: 9.7 },
  sunglasses: { scale: 2.2, x: 6.3, y: 10.2 },
  pyce2_headset: { scale: 1.8, x: 3.5, y: 6.5 },
  rewamped_glob: { scale: 1.8, x: -13.9, y: 18.8 }
};

function getBombotAccessoryName(accessory) {
  if (!accessory) return '';
  if (typeof accessory.name === 'object') {
    return accessory.name[currentLanguage] || accessory.name.es || accessory.name.en || '';
  }
  return accessory.name || '';
}

function getEquippedBombotFronts() {
  const fronts = gameState.equippedBombotAccessories?.front;
  if (Array.isArray(fronts)) return fronts;
  return fronts ? [fronts] : [];
}

function normalizeEquippedBombotAccessories(accessories = {}) {
  const rawFrontItems = Array.isArray(accessories.front)
    ? accessories.front
    : accessories.front ? [accessories.front] : [];
  let equippedGlasses = null;
  let equippedAccessory = null;

  rawFrontItems.forEach(id => {
    const accessory = BOMBOT_ACCESSORIES.find(item => item.id === id);
    if (!accessory || accessory.slot !== 'front') return;
    if (accessory.frontType === 'glasses') {
      if (!equippedGlasses && accessories.suit !== 'pumpkin') {
        equippedGlasses = id;
      }
    } else {
      if (!equippedAccessory) {
        equippedAccessory = id;
      }
    }
  });

  const frontItems = [equippedGlasses, equippedAccessory].filter(Boolean);
  return {
    reskin: accessories.reskin || null,
    head: accessories.head || null,
    front: frontItems,
    suit: accessories.suit || null
  };
}

function getBombotAccessoryLayerIds(accessories = gameState.equippedBombotAccessories, includeReskin = true) {
  const normalized = normalizeEquippedBombotAccessories(accessories);
  const fronts = normalized.front;
  const glasses = fronts.filter(id =>
    BOMBOT_ACCESSORIES.find(accessory => accessory.id === id)?.frontType === 'glasses'
  );
  const otherFronts = fronts.filter(id => !glasses.includes(id));
  // Las capas van de delante hacia atrás. Una reskin no es una capa: es el
  // cuerpo que sustituye al Bombot base, por eso se puede excluir aquí.
  return [
    ...glasses,
    ...otherFronts,
    normalized.head,
    normalized.suit,
    includeReskin ? normalized.reskin : null
  ].filter(Boolean);
}

function getBombotBodyImage(baseImage, accessories = gameState.equippedBombotAccessories) {
  const reskinId = normalizeEquippedBombotAccessories(accessories).reskin;
  return (reskinId && getBombotAccessoryImage(reskinId)) || baseImage;
}

function getBombotRenderBackground(baseImage, accessories = gameState.equippedBombotAccessories) {
  const layers = getBombotAccessoryLayerIds(accessories, false)
    .map(getBombotAccessoryImage)
    .filter(Boolean)
    .map(image => `url("${encodeURI(image)}")`);
  const bodyImage = getBombotBodyImage(baseImage, accessories);
  if (bodyImage) layers.push(`url("${encodeURI(bodyImage)}")`);
  return layers.join(', ');
}

function ensurePersonalizableBombotUnlocked() {
  if (!TOWER_TYPES.Work_Bombot?.unlocked) return false;
  if (!gameState.unlockedSkins.includes(PERSONALIZABLE_BOMBOT_SKIN_ID)) {
    gameState.unlockedSkins.push(PERSONALIZABLE_BOMBOT_SKIN_ID);
    return true;
  }
  return false;
}

function unlockBombotAccessoriesForVictory() {
  if (gameState.mode === 'tutorial') return;
  const unlocks = [];
  const isMapMode = !['interstellar', 'acrossTheTime', 'timeAttack'].includes(gameState.mode);
  if (isMapMode && gameState.map === 'gelatin_lake') unlocks.push('glob_mask');
  if (isMapMode && gameState.map === 'urbanistic_road') unlocks.push('companied_suit');
  if (isMapMode && gameState.map === 'sunlight_seaside') {
    unlocks.push('sunglasses');
    if (!['facil', 'normal'].includes(gameState.mode)) unlocks.push('umbrella_hat');
  }
  if (isMapMode && gameState.map === 'spooktacular_ruins') unlocks.push('pumpkin');

  // Requisitos específicos de modo
  if (isMapMode && gameState.mode === 'antiNormal') unlocks.push('noeye_mask');
  if (isMapMode && gameState.map === 'urbanistic_road' && gameState.mode === 'corrupto') unlocks.push('portlalic_suit');
  if (isMapMode && gameState.map === 'spooktacular_ruins' && gameState.mode === 'antiNormal') unlocks.push('darkness_emissary');

  // Interstellar Menace
  if (gameState.mode === 'interstellar' && gameState.wave >= 40) {
    unlocks.push('crystalized_hat', 'insanely_cristalized');
  }

  // Rewamp skin presente
  const rewampSkinIds = ['rewamped_green_set', 'rewamped_red_set', 'rewamped_blue_set', 'rewamped_black_set', 'ducky_rewamp_set'];
  if ((gameState.unlockedSkins || []).some(s => rewampSkinIds.includes(s))) {
    unlocks.push('rewamped_glob');
  }

  // Duck Pass levels
  const dpLevel = Number(gameState.duckPassLevel) || 1;
  if (dpLevel >= 15) unlocks.push('bombot_hair');
  if (dpLevel >= 30) unlocks.push('girly_hair');
  if (dpLevel >= 35) unlocks.push('cuby_reskin');
  if (dpLevel >= 45) unlocks.push('pyce2_headset');

  let changed = ensurePersonalizableBombotUnlocked();
  unlocks.forEach(id => {
    if (!gameState.unlockedBombotAccessories.includes(id)) {
      gameState.unlockedBombotAccessories.push(id);
      const accessory = BOMBOT_ACCESSORIES.find(item => item.id === id);
      const accName = getBombotAccessoryName(accessory) || id;
      showMessage(
        currentLanguage === 'en'
          ? `🎁 Bombot accessory unlocked: ${accName}!`
          : `🎁 ¡Accesorio de Bombot desbloqueado: ${accName}!`,
        'success'
      );
      changed = true;
    }
  });
  if (changed && currentShopTab === 'skins') drawShop();
}

function getBombotAccessoryImage(id) {
  const accessory = BOMBOT_ACCESSORIES.find(item => item.id === id);
  return accessory ? `${accessory.assetRoot || BOMBOT_ACCESSORY_ASSET_ROOT}${accessory.image}` : null;
}

function getBombotCustomizationPreviewBackground() {
  const accessories = gameState.equippedBombotAccessories;
  const baseImage = SKINS_DATA.Special.find(skin =>
    skin.id === PERSONALIZABLE_BOMBOT_SKIN_ID
  )?.skins.Work_Bombot;
  return getBombotRenderBackground(baseImage, accessories);
}

function syncBombotAccessoryUnlocksFromProgress() {
  const hasWonMap = map => (gameState.profileMapModeWins?.[map] || []).length > 0;
  const hasWonMapMode = (map, mode) => (gameState.profileMapModeWins?.[map] || []).includes(mode);
  const hasWonAnyMapMode = mode => Object.values(gameState.profileMapModeWins || {}).some(modes => (modes || []).includes(mode));
  const unlocked = [];

  if (hasWonMap('gelatin_lake')) unlocked.push('glob_mask');
  if (hasWonMap('urbanistic_road')) unlocked.push('companied_suit');
  if (hasWonMap('sunlight_seaside')) unlocked.push('sunglasses');
  if ((gameState.profileMapModeWins?.sunlight_seaside || [])
    .some(mode => !['facil', 'normal'].includes(mode))) unlocked.push('umbrella_hat');
  if (hasWonMap('spooktacular_ruins')) unlocked.push('pumpkin');

  if (hasWonAnyMapMode('antiNormal')) unlocked.push('noeye_mask');
  if (hasWonMapMode('urbanistic_road', 'corrupto')) unlocked.push('portlalic_suit');
  if (hasWonMapMode('spooktacular_ruins', 'antiNormal')) unlocked.push('darkness_emissary');

  if (gameState.unlockedInterstellar || BADGES.unmenaced?.unlocked ||
      gameState.acrossTheTimeProgress?.completed) {
    unlocked.push('crystalized_hat', 'insanely_cristalized');
  }

  const rewampSkinIds = ['rewamped_green_set', 'rewamped_red_set', 'rewamped_blue_set', 'rewamped_black_set', 'ducky_rewamp_set'];
  if ((gameState.unlockedSkins || []).some(s => rewampSkinIds.includes(s))) {
    unlocked.push('rewamped_glob');
  }

  const dpLevel = Number(gameState.duckPassLevel) || 1;
  if (dpLevel >= 15) unlocked.push('bombot_hair');
  if (dpLevel >= 30) unlocked.push('girly_hair');
  if (dpLevel >= 35) unlocked.push('cuby_reskin');
  if (dpLevel >= 45) unlocked.push('pyce2_headset');

  gameState.unlockedBombotAccessories = [...new Set([
    ...(gameState.unlockedBombotAccessories || []),
    ...unlocked
  ])];
  ensurePersonalizableBombotUnlocked();
}

function getTutorialBossHealthCap() {
  const bosses = TUTORIAL_BOSSES_BY_MAP[gameState.map] || TUTORIAL_BOSSES_BY_MAP.gelatin_lake;
  const finalWaveHealthScale = 1 + (5 * 0.15);
  return bosses.reduce((total, type) => total + (ENEMY_TYPES[type]?.health || 0) * finalWaveHealthScale, 0);
}

const DEFAULT_ACCOUNT_GAME_STATE = JSON.parse(JSON.stringify(gameState));
const DEFAULT_ACCOUNT_BADGES = Object.fromEntries(Object.entries(BADGES).map(([key, badge]) => [key, badge.unlocked]));
const DEFAULT_ACCOUNT_TOWER_UNLOCKS = Object.fromEntries(
  Object.entries(TOWER_TYPES).map(([type, tower]) => [type, tower.unlocked])
);

function resetAccountProgress() {
  gameState = JSON.parse(JSON.stringify(DEFAULT_ACCOUNT_GAME_STATE));
  musicEnabled = true;
  showHitbox = false;
  Object.entries(DEFAULT_ACCOUNT_BADGES).forEach(([key, unlocked]) => {
    if (BADGES[key]) BADGES[key].unlocked = unlocked;
  });
  Object.entries(DEFAULT_ACCOUNT_TOWER_UNLOCKS).forEach(([type, unlocked]) => {
    if (TOWER_TYPES[type]) TOWER_TYPES[type].unlocked = unlocked;
  });
}

function getFamilyCount(baseType) {
  const cfg = TOWER_TYPES[baseType];
  if (!cfg) return 0;
  const family = cfg.family || baseType;
  return gameState.towers.filter(t => (t.family || t.type) === family).length;
}

// Clase de animacion idle (reposo) segun la familia/características del Glob.
// Las torres con base o decoración fija no saltan para no despegarse de ella.
function getTowerIdleClass(type) {
  const family = getTowerFamily(type);
  // Tipos con decoración/base fija: respiran sin saltar.
  const staticTypes = new Set(['DJ_Glob', 'Planked_Glob', 'Bomb_Glob', 'TNT_Glob', 'Nuclear_Glob']);
  if (staticTypes.has(type) || family === 'IEx') return 'idle-bob-static';
  switch (family) {
    case 'White':      return 'idle-float';        // voladores (globo/heli/alien)
    case 'Pink':       return 'idle-float';         // familia rosa (flotan)
    case 'Comet_Glob': return 'idle-glow-purple';   // familia negra/cometa
    case 'Ducky_Glob': return 'idle-shimmer';       // familia dorada
    case 'Brown':      return 'idle-sway';          // plantas
    case 'Soap_Glob':  return 'idle-pulse-blue';    // azul ralentizadora
    case 'Grey':       return 'idle-spin-soft';     // old/pyce/spy
    default:           return 'idle-jump';          // Glob, Red y el resto
  }
}

function getTowerFamily(type) {
  const tower = TOWER_TYPES[type];
  return tower?.family || type;
}

function getTowerEvolutionLevel(type) {
  const family = getTowerFamily(type);
  const familyTypes = Object.keys(TOWER_TYPES).filter(candidate => getTowerFamily(candidate) === family);
  const evolvedTypes = new Set(familyTypes.map(candidate => TOWER_TYPES[candidate].evolution).filter(Boolean));
  let currentType = familyTypes.find(candidate => !evolvedTypes.has(candidate));
  let level = 1;
  const visited = new Set();

  while (currentType && !visited.has(currentType)) {
    if (currentType === type) return level;
    visited.add(currentType);
    currentType = TOWER_TYPES[currentType].evolution;
    level++;
  }

  return 0;
}

function canTowerHitEnemy(tower, enemy) {
  return !enemy.ghostMinEvolution || getTowerEvolutionLevel(tower.type) >= enemy.ghostMinEvolution;
}

function applyEnemyStun(enemy, duration, stacking = 'add') {
  if (!enemy || enemy.stunImmune) return false;
  const stunDuration = Number(duration);
  if (!Number.isFinite(stunDuration) || stunDuration <= 0) return false;

  const currentStun = Number(enemy.stunned) || 0;
  enemy.stunned = stacking === 'replace'
    ? stunDuration
    : stacking === 'max'
      ? Math.max(currentStun, stunDuration)
      : currentStun + stunDuration;
  return true;
}

function updateHypermutatedTowers() {
  const enabled = (gameState.hypermutatedUnlocked || gameState.debugState === 'unlocked') &&
    gameState.settings.hypermutatedEffect;
  gameState.towers.forEach(tower => {
    tower.el.classList.toggle('hypermutated', enabled);
  });
}

function setTowerGlitchEffect(element, enabled) {
  element.classList.toggle('glitch', enabled);
  let overlay = element.querySelector('.tower-glitch-overlay');
  if (enabled && !overlay) {
    overlay = document.createElement('span');
    overlay.className = 'tower-glitch-overlay';
    element.appendChild(overlay);
  } else if (!enabled && overlay) {
    overlay.remove();
  }
}

function updateGlitchTowers() {
  const enabled = (gameState.glitchUnlocked || gameState.debugState === 'unlocked') &&
    gameState.settings.glitchEffect;
  gameState.towers.forEach(tower => setTowerGlitchEffect(tower.el, enabled));
}

function getProfileTowerLimit(profile, family) {
  const familyTypes = Object.keys(TOWER_TYPES).filter(type => getTowerFamily(type) === family);
  const limits = familyTypes
    .map(type => Number(profile?.profile?.towerLimits?.[type]))
    .filter(limit => Number.isFinite(limit) && limit > 0);
  const directLimit = Number(profile?.profile?.towerLimits?.[family]);
  if (Number.isFinite(directLimit) && directLimit > 0) limits.push(directLimit);
  return limits.length ? Math.max(...limits) : 0;
}

function profileHasTowerFamily(profile, family) {
  return Array.isArray(profile?.profile?.equippedTowers) &&
    profile.profile.equippedTowers.some(type => getTowerFamily(type) === family);
}

function getTowerPlacementLimits(type) {
  const family = getTowerFamily(type);
  let matchLimit = multiplayerPlayers.length
    ? Math.max(0, ...multiplayerPlayers.map(player => getProfileTowerLimit(player, family)))
    : 0;
  if (!matchLimit) {
    matchLimit = Number(multiplayerTowerLimits?.[type] || multiplayerTowerLimits?.[family] ||
      gameState.towerLimits[type] || gameState.towerLimits[family] || 3);
  }
  const configuredLimit = matchLimit;

  if (gameState.mode === 'acrossTheTime' && gameState.acrossTheTimeSpace >= 3 &&
      gameState.acrossTimeTowerCaps) {
    const eventCap = Number(gameState.acrossTimeTowerCaps[type] ?? gameState.acrossTimeTowerCaps[family]);
    if (Number.isFinite(eventCap) && eventCap >= 0) matchLimit = Math.min(matchLimit, eventCap);
  }

  if (gameState.mode === 'interstellar' && !multiplayerEnabled) {
    const defaultLimits = {
      'Glob': 5, 'Red_Glob': 6, 'Soap_Glob': 3, 'Ducky_Glob': 3,
      'Comet_Glob': 3, 'Old_Glob': 2, 'Work_Bombot': 1, 'White': 1, 'Pink': 1, 'IEx': 1, 'Worker_Glob': 2
    };
    matchLimit = Math.max(matchLimit, defaultLimits[type] || 3) + 2;
  }

  if (!multiplayerEnabled) {
    return { perPlayerLimit: matchLimit, sharedLimit: matchLimit };
  }

  const players = multiplayerPlayers.length
    ? multiplayerPlayers
    : [{
      playerId: socket?.id || localStorage.getItem('glob_username') || 'Jugador',
      profile: getMultiplayerProfile()
    }];
  const eligiblePlayers = players.filter(player => profileHasTowerFamily(player, family));
  const localPlayerId = multiplayerActionOwner || socket?.id || localStorage.getItem('glob_username') || 'Jugador';
  const availablePlayers = multiplayerPlayers.length ? eligiblePlayers : players;
  const playerIndex = availablePlayers.findIndex(player => player.playerId === localPlayerId);

  return {
    perPlayerLimit: playerIndex >= 0 ? configuredLimit : 0,
    sharedLimit: matchLimit
  };
}

function checkFutureVoyageBadge() {
  const requiredZones = ['gelatin_lake', 'urbanistic_road', 'sunlight_seaside'];
  const completedEveryGloblandZone = requiredZones.every(zoneId => gameState.globlandHardWins[zoneId]);
  if (completedEveryGloblandZone && gameState.duckPassLevel >= 25) {
    unlockBadge('future_voyage');
  }
}

function saveUsers() {
  localStorage.setItem('glob_users', JSON.stringify(USERS));
}

const PROGRESS_DB_NAME = 'glob-defenders-db';
const PROGRESS_DB_VERSION = 1;
const PROGRESS_STORE_NAME = 'progress';

function openProgressDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB no está disponible en este navegador.'));
      return;
    }

    const request = indexedDB.open(PROGRESS_DB_NAME, PROGRESS_DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(PROGRESS_STORE_NAME)) {
        request.result.createObjectStore(PROGRESS_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('No se pudo abrir IndexedDB.'));
  });
}

function saveProgressToDatabase(user, progress) {
  openProgressDatabase().then(db => {
    const transaction = db.transaction(PROGRESS_STORE_NAME, 'readwrite');
    transaction.objectStore(PROGRESS_STORE_NAME).put(progress, user);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      console.error('No se pudo guardar el progreso en IndexedDB:', transaction.error);
      db.close();
    };
  }).catch(error => {
    console.error('No se pudo guardar el progreso en IndexedDB:', error);
  });
}

function loadProgressFromDatabase(user) {
  return openProgressDatabase().then(db => new Promise((resolve, reject) => {
    const transaction = db.transaction(PROGRESS_STORE_NAME, 'readonly');
    const request = transaction.objectStore(PROGRESS_STORE_NAME).get(user);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error('No se pudo leer IndexedDB.'));
    transaction.oncomplete = () => db.close();
  }));
}

function deleteProgressFromDatabase(user) {
  return openProgressDatabase().then(db => new Promise((resolve, reject) => {
    const transaction = db.transaction(PROGRESS_STORE_NAME, 'readwrite');
    transaction.objectStore(PROGRESS_STORE_NAME).delete(user);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      const error = transaction.error || new Error('No se pudo borrar el progreso local.');
      db.close();
      reject(error);
    };
  }));
}

async function loadCloudProgress(userId) {
  const { data, error } = await getSupabaseClient()
    .from('player_progress')
    .select('progress')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data?.progress || null;
}

async function saveCloudProgress(userId, progress) {
  const { error } = await getSupabaseClient()
    .from('player_progress')
    .upsert({ user_id: userId, progress, updated_at: new Date().toISOString() });
  if (error) throw error;
}

function scheduleCloudProgressSave(progress) {
  if (!activeCloudUserId || !cloudProgressReady) return;
  if (cloudProgressSaveTimer !== null) clearTimeout(cloudProgressSaveTimer);
  pendingCloudProgressSave = {
    userId: activeCloudUserId,
    progress: JSON.parse(JSON.stringify(progress))
  };
  cloudProgressSaveTimer = setTimeout(() => {
    cloudProgressSaveTimer = null;
    const pending = pendingCloudProgressSave;
    pendingCloudProgressSave = null;
    if (!pending) return;
    cloudProgressSaveError = null;
    cloudProgressSaveQueue = cloudProgressSaveQueue.catch(() => {}).then(async () => {
      await saveCloudProgress(pending.userId, pending.progress);
      const status = document.getElementById('account-save-status');
      if (status) {
        status.textContent = '';
        status.style.display = 'none';
      }
    }).catch(error => {
      cloudProgressSaveError = error;
      console.error('No se pudo guardar el progreso de la cuenta en Supabase:', error);
      const status = document.getElementById('account-save-status');
      if (status) {
        status.textContent = currentLanguage === 'en'
          ? 'Cloud save failed. Check your connection; progress is still stored on this device.'
          : 'No se pudo guardar en la nube. Comprueba la conexión; el progreso sigue guardado en este dispositivo.';
        status.style.display = 'block';
      }
    });
  }, 700);
}

async function flushCloudProgressSave() {
  if (cloudProgressSaveTimer !== null) {
    clearTimeout(cloudProgressSaveTimer);
    cloudProgressSaveTimer = null;
  }
  if (pendingCloudProgressSave) {
    const pending = pendingCloudProgressSave;
    pendingCloudProgressSave = null;
    cloudProgressSaveError = null;
    cloudProgressSaveQueue = cloudProgressSaveQueue.catch(() => {}).then(async () => {
      await saveCloudProgress(pending.userId, pending.progress);
    }).catch(error => {
      cloudProgressSaveError = error;
      console.error('No se pudo completar el guardado en la nube antes de cambiar de cuenta:', error);
    });
  }
  await cloudProgressSaveQueue;
  if (cloudProgressSaveError) {
    throw new Error(currentLanguage === 'en'
      ? 'Your latest cloud save could not be completed. Please retry before switching accounts.'
      : 'No se pudo completar el último guardado en la nube. Inténtalo de nuevo antes de cambiar de cuenta.');
  }
}

function loadUsers() {
  const saved = localStorage.getItem('glob_users');
  if (saved) {
    USERS = { ...USERS, ...JSON.parse(saved) };
  }
}
loadUsers();

function installMissingImageFallback() {
  const fallbackPath = IMAGE_PATHS.Omnipresent_Glob;
  const fallbackUrl = new URL(fallbackPath, document.baseURI).href;
  const backgroundLoads = new Map();
  const inspectedBackgrounds = new WeakMap();

  document.querySelectorAll('img').forEach(image => {
    if (image.complete && image.naturalWidth === 0 && !image.dataset.omnipresentFallback) {
      image.dataset.omnipresentFallback = 'true';
      image.src = fallbackPath;
    }
  });

  document.addEventListener('error', event => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.omnipresentFallback) return;
    image.dataset.omnipresentFallback = 'true';
    image.src = fallbackPath;
    event.stopImmediatePropagation();
  }, true);

  const inspectBackground = element => {
    if (!(element instanceof HTMLElement)) return;
    const backgroundState = `${element.className}::${element.style.backgroundImage}`;
    if (inspectedBackgrounds.get(element) === backgroundState) return;
    inspectedBackgrounds.set(element, backgroundState);
    const background = element.style.backgroundImage || getComputedStyle(element).backgroundImage;
    const match = background.match(/url\((['"]?)(.*?)\1\)/i);
    if (!match) return;

    const imageUrl = new URL(match[2], document.baseURI).href;
    if (imageUrl === fallbackUrl) return;
    const useFallback = () => {
      const currentBackground = element.style.backgroundImage || getComputedStyle(element).backgroundImage;
      const currentMatch = currentBackground.match(/url\((['"]?)(.*?)\1\)/i);
      if (!currentMatch || new URL(currentMatch[2], document.baseURI).href !== imageUrl) return;
      element.style.backgroundImage = currentBackground.replace(
        /url\((['"]?)(.*?)\1\)/i,
        `url("${fallbackPath}")`
      );
    };
    let load = backgroundLoads.get(imageUrl);
    if (!load) {
      load = new Promise(resolve => {
        const probe = new Image();
        probe.onload = () => resolve(true);
        probe.onerror = () => resolve(false);
        probe.src = imageUrl;
      });
      backgroundLoads.set(imageUrl, load);
    }
    load.then(loaded => {
      if (!loaded && element.isConnected) useFallback();
    });
  };

  const inspectTree = node => {
    if (!(node instanceof Element)) return;
    inspectBackground(node);
    node.querySelectorAll('*').forEach(inspectBackground);
  };

  document.querySelectorAll('*').forEach(inspectBackground);
  new MutationObserver(records => records.forEach(record => {
    if (record.type === 'attributes') inspectBackground(record.target);
    else record.addedNodes.forEach(inspectTree);
  })).observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });
}
installMissingImageFallback();

function installInspectionNotice() {
  console.warn(
    '%cAviso legal: Las modificaciones o la piratería de Glob Defenders requieren el consentimiento de KirByte_Bi. El uso ilegal o no autorizado de sus productos puede ser sancionado.',
    'color:#ff4545;font-weight:bold;font-size:14px;'
  );
  console.warn(
    '%cLegal notice: Modifications or piracy of Glob Defenders require consent from KirByte_Bi. Illegal or unauthorized use of its products may be subject to sanctions.',
    'color:#55aaff;font-weight:bold;font-size:14px;'
  );

  let noticeTimer = null;
  const showNotice = () => {
    let notice = document.getElementById('inspection-notice');
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'inspection-notice';
      notice.setAttribute('role', 'status');
      notice.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:100000;max-width:min(720px,94vw);padding:12px 16px;border:1px solid #ff4545;border-radius:12px;background:rgba(10,12,20,.96);box-shadow:0 6px 24px #000a;text-align:center;font:700 13px/1.45 sans-serif;';
      notice.innerHTML = '<span style="display:block;color:#ff5555">Las modificaciones o la piratería de Glob Defenders requieren el consentimiento de KirByte_Bi. El uso ilegal o no autorizado de sus productos puede ser sancionado.</span><span style="display:block;color:#55aaff;margin-top:6px">Modifications or piracy of Glob Defenders require consent from KirByte_Bi. Illegal or unauthorized use of its products may be subject to sanctions.</span>';
      document.body.appendChild(notice);
    }
    notice.style.display = 'block';
    if (noticeTimer !== null) clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => {
      notice.style.display = 'none';
      noticeTimer = null;
    }, 9000);
  };

  document.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();
    const devToolsShortcut = event.key === 'F12' ||
      ((event.ctrlKey || event.metaKey) && event.shiftKey && ['i', 'j', 'c'].includes(key)) ||
      ((event.ctrlKey || event.metaKey) && key === 'u');
    if (devToolsShortcut) showNotice();
  }, true);
}
installInspectionNotice();

function init() {
  console.log("Iniciando Glob Defenders...");
  ensureChristmasBossTranslations();
  window.addEventListener('beforeunload', event => {
    if (!window._checkpointActiveRound?.()) return;
    event.preventDefault();
    event.returnValue = '';
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') window._checkpointActiveRound?.();
  });
  updateSessionClock();
  if (sessionClockInterval === null) {
    sessionClockInterval = setInterval(() => {
      updateSessionClock();
      checkBreakReminder();
    }, 1000);
  }
  try {
    const logoRoll = Math.random();
    if (logoRoll < 0.15) {
      document.querySelectorAll('.game-logo').forEach(img => {
        img.classList.add('is-square-logo');
        img.src = 'Recursos/img/GlobDefendersImage.png';
      });
    } else if (logoRoll < 0.30) {
      document.querySelectorAll('.game-logo').forEach(img => {
        img.classList.add('is-square-logo');
        img.src = 'Recursos/img/Urban Road_Reborn Logo.png';
      });
    }
    initializeLightMode();
    updateLanguage();
    bindEvents();
    scheduleSkipLoginButton();
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
    setTimeout(applyScale, 0);
    setTimeout(applyScale, 250);
    gameLoop();
    console.log("Sistema iniciado correctamente.");
  } catch (e) {
    console.error("Error crítico en la inicialización:", e);
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) loginBtn.onclick = handleLogin;
  }
}

function normalizeAdventCalendarState(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const normalizeDayMap = source => Object.fromEntries(
    Object.entries(source && typeof source === 'object' ? source : {})
      .filter(([year, days]) => /^\d{4}$/.test(year) && Array.isArray(days))
      .map(([year, days]) => [year, [...new Set(days.filter(day => Number.isInteger(day) && day >= 1 && day <= 25))]])
  );
  const paidDays = Object.fromEntries(
    Object.entries(source.paidDays && typeof source.paidDays === 'object' ? source.paidDays : {})
      .filter(([year, count]) => /^\d{4}$/.test(year) && Number.isInteger(count) && count >= 0)
  );
  return {
    claimedDays: normalizeDayMap(source.claimedDays),
    victoryDays: normalizeDayMap(source.victoryDays),
    paidDays,
    tamperedYears: [...new Set((Array.isArray(source.tamperedYears) ? source.tamperedYears : [])
      .filter(year => Number.isInteger(year) && year >= 2000 && year <= 9999))],
    lastSeenDate: typeof source.lastSeenDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(source.lastSeenDate)
      ? source.lastSeenDate
      : null
  };
}

function saveProgress() {
  if (multiplayerSpectator) return;
  const user = localStorage.getItem('glob_username') || 'default';
  const progress = {
    badges: Object.fromEntries(Object.entries(BADGES).map(([k, v]) => [k, v.unlocked])),
    unlockedInfinite: gameState.unlockedInfinite,
    unlockedInterstellar: gameState.unlockedInterstellar || false,
    corruptWins: gameState.corruptWins,
    unlockedBombot: TOWER_TYPES['Work_Bombot'] ? TOWER_TYPES['Work_Bombot'].unlocked : false,
    unlockedSoapGlob: TOWER_TYPES['Soap_Glob'] ? TOWER_TYPES['Soap_Glob'].unlocked : false,
    unlockedDuckyGlob: TOWER_TYPES['Ducky_Glob'] ? TOWER_TYPES['Ducky_Glob'].unlocked : false,
    unlockedOldGlob: TOWER_TYPES['Old_Glob'] ? TOWER_TYPES['Old_Glob'].unlocked : false,
    unlockedCometGlob: TOWER_TYPES['Comet_Glob'] ? TOWER_TYPES['Comet_Glob'].unlocked : false,
    unlockedSproutGlob: TOWER_TYPES['Sprout_Glob'] ? TOWER_TYPES['Sprout_Glob'].unlocked : false,
    unlockedBalloonGlob: TOWER_TYPES['Balloon_Glob'] ? TOWER_TYPES['Balloon_Glob'].unlocked : false,
    unlockedStreamerGlob: TOWER_TYPES['Streamer_Glob'] ? TOWER_TYPES['Streamer_Glob'].unlocked : false,
    unlockedWorkerGlob: TOWER_TYPES['Worker_Glob'] ? TOWER_TYPES['Worker_Glob'].unlocked : false,
    unlockedBombGlob: TOWER_TYPES['Bomb_Glob'] ? TOWER_TYPES['Bomb_Glob'].unlocked : false,
    unlockedPirateGlob: TOWER_TYPES['Pirate_Glob'] ? TOWER_TYPES['Pirate_Glob'].unlocked : false,
    globetines: gameState.globetines,
    pycoins: gameState.pycoins,
    duckPassXP: gameState.duckPassXP,
    duckPassLevel: gameState.duckPassLevel,
    duckPassCurrency: gameState.duckPassCurrency,
    towerLimits: tutorialProgressionBackup?.towerLimits || gameState.towerLimits,
    baseHealthLevel: tutorialProgressionBackup?.baseHealthLevel ?? gameState.baseHealthLevel,
    usedCodes: gameState.usedCodes,
    unlockedSkins: gameState.unlockedSkins,
    unlockedBombotAccessories: gameState.unlockedBombotAccessories,
    adventCalendar: gameState.adventCalendar,
    equippedBombotAccessories: gameState.equippedBombotAccessories,
    globlandHardWins: gameState.globlandHardWins,
    equippedSkins: tutorialEquippedSkinsBackup || gameState.equippedSkins,
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
    metaRangeLevel: tutorialProgressionBackup?.metaRangeLevel ?? gameState.metaRangeLevel,
    metaRange: tutorialProgressionBackup?.metaRange ?? gameState.metaRange,
    metaDamageLevel: tutorialProgressionBackup?.metaDamageLevel ?? gameState.metaDamageLevel,
    metaDamage: tutorialProgressionBackup?.metaDamage ?? gameState.metaDamage,
    duckgrades: gameState.duckgrades,
    blockQuestActive: gameState.blockQuestActive,
    blockQuestStage: gameState.blockQuestStage,
    blockQuestCompleted: gameState.blockQuestCompleted,
    blockQuestVictories: gameState.blockQuestVictories,
    blockQuestHadBlockTales: gameState.blockQuestHadBlockTales,
    acrossTheTimeProgress: gameState.acrossTheTimeProgress,
    paracristalEnergy: gameState.paracristalEnergy,
    paracristalFinal: gameState.paracristalFinal,
    upgradesResetV3: true,
    upgradesResetV4: true,
    upgradesResetV5: true,
    pycesKilled: gameState.pycesKilled,
    globsPlaced: gameState.globsPlaced,
    maxedFamilies: gameState.maxedFamilies || [],
    profileMaxAvatars: gameState.profileMaxAvatars || [],
    profileMaxRewampAvatars: gameState.profileMaxRewampAvatars || [],
    profileSpecialAvatars: gameState.profileSpecialAvatars || [],
    profileAvatar: gameState.profileAvatar || 'glob:Glob',
    profileBorder: gameState.profileBorder || 'default',
    profilePurchasedBorders: gameState.profilePurchasedBorders || [],
    profileMapModeWins: gameState.profileMapModeWins || {},
    tutorialIntroSeen: gameState.tutorialIntroSeen !== false,
    tutorialCompleted: Boolean(gameState.tutorialCompleted),
    tutorialRewardGranted: Boolean(gameState.tutorialRewardGranted),
    savedRoundSnapshot: gameState.savedRoundSnapshot || null,
    hypermutatedUnlocked: gameState.hypermutatedUnlocked,
    glitchUnlocked: gameState.glitchUnlocked,
    collectionMasterDialogueShown: gameState.collectionMasterDialogueShown,
    rainbowFuelClicks: gameState.rainbowFuelClicks,
    rainbowFuelUnlocked: gameState.rainbowFuelUnlocked,
    winterPassXP: gameState.winterPassXP,
    winterPassLevel: gameState.winterPassLevel,
    winterPassClaimed: gameState.winterPassClaimed,
    unlockedRecolors: gameState.unlockedRecolors,
    profileAvatarEffect: gameState.profileAvatarEffect || ''
  };
  localStorage.setItem('glob_progress_' + user, JSON.stringify(progress));
  saveProgressToDatabase(user, progress);
  scheduleCloudProgressSave(progress);
}

function loadProgress(username, allowLocalProgress = true) {
  try {
    const user = username || localStorage.getItem('glob_username');
    if (!user) return;

    let data = allowLocalProgress ? localStorage.getItem('glob_progress_' + user) : null;

    if (allowLocalProgress && !data) {
      data = localStorage.getItem('glob_progress');
      if (data) {
        console.log("Migrando progreso global al usuario:", user);
        localStorage.setItem('glob_progress_' + user, data);
      }
    }

    if (allowLocalProgress && !data) {
      loadProgressFromDatabase(user).then(progress => {
        if (progress) {
          localStorage.setItem('glob_progress_' + user, JSON.stringify(progress));
          loadProgress(user);
        }
      }).catch(error => {
        console.error('No se pudo cargar el progreso desde IndexedDB:', error);
      });
      return;
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
          'Comet_Glob': 3, 'Old_Glob': 2, 'Work_Bombot': 1, 'White': 1, 'Pink': 1, 'IEx': 1,
          'Worker_Glob': 2, 'Sprout_Glob': 3, 'Pirate_Glob': 1
        };
        progress.upgradesResetV5 = true;
        localStorage.setItem('glob_progress_' + user, JSON.stringify(progress));
      }

      if (progress.badges) {
        Object.keys(progress.badges).forEach(k => {
          if (BADGES[k]) BADGES[k].unlocked = progress.badges[k];
        });
      }
      gameState.tutorialIntroSeen = progress.tutorialIntroSeen !== false;
      gameState.tutorialCompleted = Boolean(progress.tutorialCompleted);
      gameState.tutorialRewardGranted = Boolean(progress.tutorialRewardGranted);
      gameState.unlockedInfinite = progress.unlockedInfinite || false;
      gameState.unlockedInterstellar = progress.unlockedInterstellar || false;
      gameState.corruptWins = progress.corruptWins || 0;
      if (TOWER_TYPES['Work_Bombot']) TOWER_TYPES['Work_Bombot'].unlocked = progress.unlockedBombot || false;
      if (TOWER_TYPES['Soap_Glob']) TOWER_TYPES['Soap_Glob'].unlocked = progress.unlockedSoapGlob || false;
      if (TOWER_TYPES['Ducky_Glob']) TOWER_TYPES['Ducky_Glob'].unlocked = progress.unlockedDuckyGlob || false;
      if (TOWER_TYPES['Old_Glob']) TOWER_TYPES['Old_Glob'].unlocked = progress.unlockedOldGlob || false;
      if (TOWER_TYPES['Pyce_Glob']) TOWER_TYPES['Pyce_Glob'].unlocked = progress.unlockedOldGlob || false;
      if (TOWER_TYPES['SpyGlob']) TOWER_TYPES['SpyGlob'].unlocked = progress.unlockedOldGlob || false;
      if (TOWER_TYPES['Comet_Glob']) TOWER_TYPES['Comet_Glob'].unlocked = progress.unlockedCometGlob || false;
      if (TOWER_TYPES['Sprout_Glob']) TOWER_TYPES['Sprout_Glob'].unlocked = progress.unlockedSproutGlob || false;
      if (TOWER_TYPES['Garden_Glob']) TOWER_TYPES['Garden_Glob'].unlocked = progress.unlockedSproutGlob || false;
      if (TOWER_TYPES['Flower_Glob']) TOWER_TYPES['Flower_Glob'].unlocked = progress.unlockedSproutGlob || false;
      if (TOWER_TYPES['Balloon_Glob']) TOWER_TYPES['Balloon_Glob'].unlocked = progress.unlockedBalloonGlob || false;
      if (TOWER_TYPES['Streamer_Glob']) TOWER_TYPES['Streamer_Glob'].unlocked = progress.unlockedStreamerGlob || false;
      if (TOWER_TYPES['Worker_Glob']) TOWER_TYPES['Worker_Glob'].unlocked = progress.unlockedWorkerGlob || false;
      if (TOWER_TYPES['Bomb_Glob']) TOWER_TYPES['Bomb_Glob'].unlocked = progress.unlockedBombGlob || false;
      if (TOWER_TYPES['Pirate_Glob']) TOWER_TYPES['Pirate_Glob'].unlocked = progress.unlockedPirateGlob || false;

      gameState.equippedTowers = progress.equippedTowers || ['Glob', 'Red_Glob'];
      gameState.globetines = Number(progress.globetines != null ? progress.globetines : 500);
      gameState.pycoins = Number(progress.pycoins || 0);
      gameState.totalDamage = Number(progress.totalDamage || 0);
      gameState.settings = { ...gameState.settings, ...progress.settings };
      gameState.hypermutatedUnlocked = Boolean(progress.hypermutatedUnlocked);
      gameState.glitchUnlocked = Boolean(progress.glitchUnlocked);
      gameState.duckPassXP = progress.duckPassXP || 0;
      gameState.duckPassLevel = progress.duckPassLevel || 1;
      gameState.duckPassCurrency = progress.duckPassCurrency || 0;
      gameState.blockQuestActive = !!progress.blockQuestActive;
      gameState.blockQuestStage = progress.blockQuestStage || 0;
      gameState.blockQuestCompleted = !!progress.blockQuestCompleted;
      gameState.blockQuestVictories = progress.blockQuestVictories || 0;
      gameState.blockQuestHadBlockTales = !!progress.blockQuestHadBlockTales;
      gameState.acrossTheTimeProgress = {
        ...gameState.acrossTheTimeProgress,
        ...(progress.acrossTheTimeProgress || {})
      };
      gameState.paracristalEnergy = progress.paracristalEnergy == null ? 100 : progress.paracristalEnergy;
      gameState.paracristalFinal = !!progress.paracristalFinal;
      if (progress.towerLimits) {
        gameState.towerLimits = { ...gameState.towerLimits, ...progress.towerLimits };
      }
      gameState.baseHealthLevel = progress.baseHealthLevel || 0;
      gameState.usedCodes = progress.usedCodes || {};
      gameState.unlockedSkins = progress.unlockedSkins || ['default'];
      gameState.unlockedBombotAccessories = [...new Set(progress.unlockedBombotAccessories || [])];
      gameState.adventCalendar = normalizeAdventCalendarState(progress.adventCalendar);
      gameState.equippedBombotAccessories = {
        head: null,
        front: [],
        suit: null,
        reskin: null,
        ...(progress.equippedBombotAccessories || {})
      };
      gameState.equippedBombotAccessories =
        normalizeEquippedBombotAccessories(gameState.equippedBombotAccessories);
      if (ensurePersonalizableBombotUnlocked()) {
        gameState.unlockedSkins = [...new Set(gameState.unlockedSkins)];
      }
      gameState.equippedSkins = Object.assign({ 'Glob': 'default', 'Red_Glob': 'default', 'Soap_Glob': 'default', 'Ducky_Glob': 'default', 'Comet_Glob': 'default', 'Grey': 'default', 'Special': 'default', 'Global': 'default' }, progress.equippedSkins || {});
      gameState.cheatedModeActive = progress.cheatedModeActive || false;
      gameState.cheatedBackup = progress.cheatedBackup || null;
      gameState.unlockedAntiNormal = progress.unlockedAntiNormal || false;
      gameState.claimedRewards = progress.claimedRewards || [];
      gameState.globlandHardWins = {
        ...gameState.globlandHardWins,
        ...(progress.globlandHardWins || {})
      };
      gameState.muted = progress.muted || false;

      gameState.metaRangeLevel = progress.metaRangeLevel || 0;
      gameState.metaRange = progress.metaRange || 0;
      gameState.metaDamageLevel = progress.metaDamageLevel || 0;
      gameState.metaDamage = progress.metaDamage || 1;
      gameState.duckgrades = progress.duckgrades || {};
      if (gameState.duckgrades.dg_Pyce_Glob || gameState.duckgrades.dg_Old_Glob) {
        gameState.duckgrades.dg_Grey = true;
      }
      gameState.gtacks = Object.assign({
        'Glob': false, 'Red_Glob': false, 'Soap_Glob': false, 'Ducky_Glob': false,
        'Comet_Glob': false, 'Old_Glob': false, 'Bomb_Glob': false, 'Worker_Glob': false, 'Brown': false, 'Pirate_Glob': false, 'White': false, 'Pink': false
      }, progress.gtacks || {});
      gameState.pycesKilled = progress.pycesKilled || {};
      gameState.globsPlaced = progress.globsPlaced || {};
      gameState.maxedFamilies = progress.maxedFamilies || [];
      gameState.profileMaxAvatars = progress.profileMaxAvatars || [];
      gameState.profileMaxRewampAvatars = progress.profileMaxRewampAvatars || [];
      gameState.profileSpecialAvatars = progress.profileSpecialAvatars || [];
      gameState.profileAvatar = progress.profileAvatar || 'glob:Glob';
      gameState.profileBorder = progress.profileBorder || 'default';
      gameState.profilePurchasedBorders = progress.profilePurchasedBorders || [];
      gameState.profileMapModeWins = progress.profileMapModeWins || {};
      syncBombotAccessoryUnlocksFromProgress();
      gameState.savedRoundSnapshot = progress.savedRoundSnapshot || null;
      gameState.collectionMasterDialogueShown = !!progress.collectionMasterDialogueShown;
      gameState.rainbowFuelClicks = (progress.rainbowFuelClicks && typeof progress.rainbowFuelClicks === 'object') ? progress.rainbowFuelClicks : {};
      gameState.rainbowFuelUnlocked = Array.isArray(progress.rainbowFuelUnlocked) ? progress.rainbowFuelUnlocked : [];
      gameState.winterPassXP = Number(progress.winterPassXP) || 0;
      gameState.winterPassLevel = Number(progress.winterPassLevel) || 1;
      gameState.winterPassClaimed = Array.isArray(progress.winterPassClaimed) ? progress.winterPassClaimed : [];
      // Recupera efectos reclamados por partidas antiguas incluso si el array de
      // desbloqueos no se llegó a guardar antes de cerrar el juego.
      const claimedWinterRecolors = WINTER_PASS_REWARDS
        .filter(entry => gameState.winterPassClaimed.includes(entry.level) && entry.reward?.type === 'recolor')
        .map(entry => entry.reward.id);
      gameState.unlockedRecolors = [...new Set([
        ...(Array.isArray(progress.unlockedRecolors) ? progress.unlockedRecolors : []),
        ...claimedWinterRecolors
      ].filter(isRgbRecolorEffect))];
      // Migración: antes había un selector global de efecto para el perfil y
      // otro para las torres. Ahora cada efecto es su propio apartado/skin, así
      // que la elección antigua se traduce a la imagen o skin equivalente.
      const legacyProfileEffect = typeof progress.profileRgbEffect === 'string' && progress.profileRgbEffect
        ? progress.profileRgbEffect
        : (progress.monochromeRecolorEquipped ? 'monochrome' : '');
      gameState.profileAvatarEffect = typeof progress.profileAvatarEffect === 'string'
        ? progress.profileAvatarEffect
        : '';
      const legacyRgbAvatar = /^glob:([^:]+):rgb-rewamp$/.exec(gameState.profileAvatar);
      if (legacyRgbAvatar && !gameState.profileAvatarEffect &&
          PROFILE_FX_EFFECTS.some(effect => effect.id === legacyProfileEffect)) {
        gameState.profileAvatarEffect = legacyProfileEffect;
      }
      // Imágenes de los antiguos apartados por efecto (glob:<tipo>:fx-<efecto>):
      // pasan a la imagen Rewamp (o RGB) con ese efecto elegido.
      const legacyFxAvatar = /^glob:([^:]+):fx-(.+)$/.exec(gameState.profileAvatar);
      if (legacyFxAvatar && TOWER_TYPES[legacyFxAvatar[1]]) {
        const fxFamily = getTowerFamily(legacyFxAvatar[1]);
        gameState.profileAvatar = getFamilyRewampBaseSkin(fxFamily)
          ? `glob:${legacyFxAvatar[1]}:rewamp`
          : `glob:${legacyFxAvatar[1]}:rgb-rewamp`;
        gameState.profileAvatarEffect = legacyFxAvatar[2];
      }
      const legacyTowerEffect = typeof progress.towerRgbEffect === 'string' ? progress.towerRgbEffect : '';
      if (isRgbRecolorEffect(legacyTowerEffect)) {
        Object.keys(gameState.equippedSkins).forEach(family => {
          const rgbSkin = getFamilyRgbSkin(family);
          if (rgbSkin && gameState.equippedSkins[family] === rgbSkin.id) {
            gameState.equippedSkins[family] = `${rgbSkin.id}__fx_${legacyTowerEffect}`;
          }
        });
      }
      musicEnabled = progress.musicEnabled !== undefined ? progress.musicEnabled : true;
      showHitbox = progress.showHitbox || false;

      if (gameState.unlockedAntiNormal) BADGES.antiNormal.unlocked = true;
      updateBuffs();
      document.getElementById('total-damage-stat').style.display = gameState.settings.showTotalDamage ? 'flex' : 'none';
      applyMetaButtonMode();
      if (gameState.settings.fullscreenMap) document.body.classList.add('fullscreen-map');
      if (gameState.settings.autoEnglish) { currentLanguage = 'en'; updateLanguage(); }
      updateSessionClock();
      checkFutureVoyageBadge();
      checkGlitchEffectUnlock();
      updateMuteButton();
      updateAchievementsBtnUI();
      gameState.health = 100 + (gameState.baseHealthLevel * 20);
    }

    initMusic();

  } catch (e) {
    console.error("Error al cargar el progreso (loadProgress):", e);
  }
}

const HYPERMUTATED_CLICK_KEY = 'glob_hypermutated_decoration_clicks';
const HYPERMUTATED_GLOBS_KEY = 'glob_hypermutated_clicked_globs';
const HYPERMUTATED_PENDING_KEY = 'glob_hypermutated_pending';
const HALLOWEEN_LOGIN_ENEMIES = new Set([
  'Broksp', 'Blood_Taker', 'Pumpitch', 'RIPslide', 'Sneekmy',
  'SkeleBone_Pyce', 'Ghost_Pyce', 'ZomPyce'
]);
const HALLOWEEN_ENEMY_TYPES = new Set([...HALLOWEEN_LOGIN_ENEMIES, 'Curse_Boneker']);
const HALLOWEEN_LOGIN_SKIN_IMAGES = new Set([
  'Recursos/Spooks in the Desert (UPD4)/Skins/SkeleBones Set (ROJO)/Calcium Glob (SK-EVO1).png',
  'Recursos/Spooks in the Desert (UPD4)/Skins/SkeleBones Set (ROJO)/Toxic Waste Glob (SK-EVO2).png',
  'Recursos/Spooks in the Desert (UPD4)/Skins/Wicked Set (NEGRO)/Witch Glob (SK-EVO1).png',
  'Recursos/Spooks in the Desert (UPD4)/Skins/Wicked Set (NEGRO)/CrowWitcher (SK-EVO2).png',
  'Recursos/Spooks in the Desert (UPD4)/Skins/Pumpkin Set (MARRON)/PumpGlob (SK-EVO1).png'
]);

function getGlobDecorationType(imagePath) {
  const type = Object.keys(IMAGE_PATHS).find(key => IMAGE_PATHS[key] === imagePath && TOWER_TYPES[key]);
  return type && getTowerFamily(type) !== 'Special' ? type : null;
}

// Reacción visual por familia al tocar un Glob en el login (tipo Angry Birds).
// Crea un pequeño efecto (emoji flotante) en la posición del Glob según su familia.
function spawnLoginFamilyReaction(imagePath, rect) {
  const type = getGlobDecorationType(imagePath);
  if (!type || !rect) return;
  const family = getTowerFamily(type);
  const burstByFamily = {
    'Glob': '💚', 'Red_Glob': '🔥', 'Soap_Glob': '🫧', 'Ducky_Glob': '💰',
    'Comet_Glob': '🟣', 'Grey': '📡', 'White': '🎈', 'Pink': '🌸',
    'IEx': '💥', 'Worker_Glob': '🚧', 'Brown': '🌱', 'Pirate_Glob': '⚓'
  };
  const emoji = burstByFamily[family];
  if (!emoji) return;
  const particle = document.createElement('div');
  particle.className = 'login-family-burst';
  particle.textContent = emoji;
  particle.style.left = `${rect.left + rect.width / 2}px`;
  particle.style.top = `${rect.top + rect.height / 2}px`;
  document.body.appendChild(particle);
  setTimeout(() => particle.remove(), 900);
}

function getLoginGlobDecorationTypes() {
  const families = new Map();
  const evolvedTypes = new Set(Object.values(TOWER_TYPES).map(tower => tower.evolution).filter(Boolean));
  Object.keys(TOWER_TYPES).forEach(type => {
    const family = getTowerFamily(type);
    if (family === 'Special') return;
    if (!families.has(family)) families.set(family, []);
    families.get(family).push(type);
  });

  const visibleTypes = new Set();
  families.forEach(types => {
    const family = getTowerFamily(types[0]);
    if (!isTowerOwned(family)) return;
    let type = types.find(candidate => !evolvedTypes.has(candidate));
    for (let level = 0; type; level++) {
      if (level === 0 || level === 2) visibleTypes.add(type);
      const nextType = TOWER_TYPES[type].evolution;
      type = types.includes(nextType) ? nextType : null;
    }
  });
  return visibleTypes;
}

function isHalloweenLoginEnemy(imagePath) {
  return HALLOWEEN_LOGIN_SKIN_IMAGES.has(imagePath) || Object.keys(IMAGE_PATHS).some(type =>
    HALLOWEEN_LOGIN_ENEMIES.has(type) && IMAGE_PATHS[type] === imagePath
  );
}

function getLoginDecorationWeight(imagePath, month) {
  if (CHRISTMAS_LOGIN_ENEMY_IMAGES.has(imagePath)) {
    return (typeof isWinterEventActive === 'function' && isWinterEventActive()) ? 5 : 1;
  }
  if (isHalloweenLoginEnemy(imagePath) && month === 9) return 5;
  return 1;
}

function triggerHalloweenJumpscare(type, enemyElement, imagePathOverride = null, force = false) {
  // 'force' permite el jumpscare de muerte aunque el enemigo ya se hubiera
  // pulsado antes (el click marca jumpscareTriggered y, si no, bloquearía).
  if (force && enemyElement) delete enemyElement.dataset.jumpscareTriggered;
  if (
    (imagePathOverride
      ? !isHalloweenLoginEnemy(imagePathOverride)
      : !HALLOWEEN_ENEMY_TYPES.has(type)) ||
    enemyElement?.dataset.jumpscareTriggered
  ) return;
  if (enemyElement) enemyElement.dataset.jumpscareTriggered = 'true';
  const imagePath = imagePathOverride || ENEMY_TYPES[type]?.image;
  if (!imagePath) return;

  const jumpscare = document.createElement('div');
  jumpscare.className = 'halloween-jumpscare-overlay';
  jumpscare.setAttribute('aria-hidden', 'true');
  const image = document.createElement('div');
  image.className = 'halloween-jumpscare-image';
  image.style.backgroundImage = `url('${imagePath}')`;
  jumpscare.appendChild(image);
  document.body.appendChild(jumpscare);
  setTimeout(() => jumpscare.remove(), 900);
}

function unlockHypermutatedEffect() {
  localStorage.removeItem(HYPERMUTATED_PENDING_KEY);
  if (gameState.hypermutatedUnlocked) return;
  gameState.hypermutatedUnlocked = true;
  gameState.settings.hypermutatedEffect = false;
  saveProgress();
  const section = document.getElementById('hypermutated-settings');
  if (section) section.style.display = '';
  const message = translate('hypermutated_unlocked');
  showMessage(message, 'success');
}

// --- Rainbow Fuel: 100 clics de Globs de una familia en el login desbloquean
// Rainbow Fuel se habilita automáticamente en cualquier familia que declare al
// menos una skin RGB/Rewamp. Así las familias nuevas solo necesitan los mismos
// datos declarativos de MEC-03 (`rgbRewamp: true` + `rgbTypes`).
const RAINBOW_FUEL_TARGET = 100;

function isRainbowFuelEligibleFamily(family) {
  return Boolean(SKINS_DATA[family]?.some(isRgbRewampSkin));
}

function recordRainbowFuelClick(imagePath) {
  const type = getGlobDecorationType(imagePath);
  if (!type) return;
  const family = getTowerFamily(type);
  if (!isRainbowFuelEligibleFamily(family)) return;
  if (!gameState.rainbowFuelClicks || typeof gameState.rainbowFuelClicks !== 'object') gameState.rainbowFuelClicks = {};
  if (!Array.isArray(gameState.rainbowFuelUnlocked)) gameState.rainbowFuelUnlocked = [];
  if (gameState.rainbowFuelUnlocked.includes(family)) return;

  gameState.rainbowFuelClicks[family] = (gameState.rainbowFuelClicks[family] || 0) + 1;
  // Los clics intermedios también se guardan: no se pierde progreso al cerrar
  // antes del clic número 100.
  saveProgress();
  if (gameState.rainbowFuelClicks[family] >= RAINBOW_FUEL_TARGET) {
    gameState.rainbowFuelUnlocked.push(family);
    const familyName = translate(TOWER_TYPES[type]?.name || family);
    showMessage(
      currentLanguage === 'es'
        ? `🌈 ¡RAINBOW FUEL desbloqueado para la familia ${familyName}!`
        : `🌈 RAINBOW FUEL unlocked for the ${familyName} family!`,
      'success'
    );
    saveProgress();
  }
}

function recordHypermutatedDecorationClick(imagePath, availableGlobPaths) {
  if (gameState.hypermutatedUnlocked || localStorage.getItem(HYPERMUTATED_PENDING_KEY) === 'true') return;

  const clickCount = Math.max(0, Number.parseInt(localStorage.getItem(HYPERMUTATED_CLICK_KEY) || '0', 10) || 0) + 1;
  localStorage.setItem(HYPERMUTATED_CLICK_KEY, String(clickCount));

  let clickedGlobs;
  try {
    const storedGlobs = JSON.parse(localStorage.getItem(HYPERMUTATED_GLOBS_KEY) || '[]');
    clickedGlobs = new Set(Array.isArray(storedGlobs) ? storedGlobs.filter(path => typeof path === 'string') : []);
  } catch (error) {
    console.error('No se pudo leer el progreso secreto de Hipermutado:', error);
    clickedGlobs = new Set();
  }
  if (availableGlobPaths.includes(imagePath)) clickedGlobs.add(imagePath);
  localStorage.setItem(HYPERMUTATED_GLOBS_KEY, JSON.stringify([...clickedGlobs]));

  const clickedEveryGlob = availableGlobPaths.length > 0 &&
    availableGlobPaths.every(path => clickedGlobs.has(path));
  if (clickCount >= 701 || clickedEveryGlob) {
    localStorage.setItem(HYPERMUTATED_PENDING_KEY, 'true');
    if (document.getElementById('login-screen')?.style.display === 'none') {
      unlockHypermutatedEffect();
    }
  }
}

function spawnDecorations(containerId) {
  try {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.replaceChildren();
    const allImages = [...new Set([...Object.values(IMAGE_PATHS), ...HALLOWEEN_LOGIN_SKIN_IMAGES])];

    // For login/mode screens, exclude collab assets and check unlocks
    const isLoginScreen = (containerId === 'login-decorations' || containerId === 'mode-decorations' || containerId === 'map-decorations');
    const loginMonth = new Date().getMonth();
    let images = allImages;
    if (isLoginScreen) {
      const loginGlobTypes = getLoginGlobDecorationTypes();
      images = allImages.filter(p => {
        if (p === IMAGE_PATHS.Omnipresent_Glob || p === IMAGE_PATHS.Kirb_Glob) return false;
        if (CHRISTMAS_LOGIN_ENEMY_IMAGES.has(p)) return loginMonth === 9 || (typeof isWinterEventActive === 'function' && isWinterEventActive());
        const key = Object.keys(IMAGE_PATHS).find(k => IMAGE_PATHS[k] === p);
        if (!key) return true;

        if (getGlobDecorationType(p)) return loginGlobTypes.has(key);
        if (HALLOWEEN_LOGIN_ENEMIES.has(key)) return true;
        if (p.includes('Interestelar Menace') || p.includes('Collabs') || p.includes('Skins/') || p.includes('Astrorb') || p.includes('Crystal')) return false;

        // Simple enemies always appear
        const simpleEnemies = ['Stupid_Pyce', 'Guest_Pyce', 'Noob_Pyce', 'Pyce2', 'Flower_Pyce', 'Symbol_Pyce', 'SO_Pyce'];
        if (simpleEnemies.includes(key)) return true;

        // Other enemies check if killed > 0
        if (key.includes('Pyce') || key.includes('Bit') || key.includes('Byte')) {
          return (gameState.pycesKilled && gameState.pycesKilled[key] > 0);
        }

        return false;
      });
    }

    const pool = images.length > 0 ? images : allImages;
    const availableGlobPaths = images.filter(imagePath => getGlobDecorationType(imagePath));
    const weightedPool = pool.flatMap(imagePath =>
      Array(isLoginScreen ? getLoginDecorationWeight(imagePath, loginMonth) : 1).fill(imagePath)
    );
    const shuffledPool = [...weightedPool];
    for (let i = shuffledPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
    }
    const uniqueShuffledPool = [...new Set(shuffledPool)];
    let clickedGlobPaths;
    try {
      const storedGlobs = JSON.parse(localStorage.getItem(HYPERMUTATED_GLOBS_KEY) || '[]');
      clickedGlobPaths = new Set(Array.isArray(storedGlobs) ? storedGlobs.filter(path => typeof path === 'string') : []);
    } catch (error) {
      console.error('No se pudo leer la lista de Globs secretos ya descubiertos:', error);
      clickedGlobPaths = new Set();
    }
    // Topes de decoración del login. Subidos para que aparezcan TODOS los
    // Globs y enemigos comunes disponibles, no solo un puñado.
    const MAX_LOGIN_GLOBS = 24;
    const MAX_LOGIN_TOTAL = 40;
    const globImagesToShow = uniqueShuffledPool.filter(path =>
      availableGlobPaths.includes(path) && !clickedGlobPaths.has(path)
    );
    const selectedGlobImages = globImagesToShow.slice(0, MAX_LOGIN_GLOBS);
    const selectedImages = [...selectedGlobImages];
    for (const imagePath of uniqueShuffledPool) {
      if (selectedImages.length >= MAX_LOGIN_TOTAL) break;
      if (
        !selectedImages.includes(imagePath) &&
        (!availableGlobPaths.includes(imagePath) || globImagesToShow.length <= MAX_LOGIN_GLOBS)
      ) {
        selectedImages.push(imagePath);
      }
    }
    let replacementIndex = 0;

    const getNextDecorationImage = excludedImagePath => {
      for (let checked = 0; checked < shuffledPool.length; checked++) {
        const imagePath = uniqueShuffledPool[replacementIndex];
        replacementIndex = (replacementIndex + 1) % uniqueShuffledPool.length;
        if (imagePath === excludedImagePath) continue;
        if (availableGlobPaths.includes(imagePath) && clickedGlobPaths.has(imagePath)) continue;
        const alreadyVisible = [...container.querySelectorAll('.floating-char')]
          .some(character => character.dataset.imagePath === imagePath);
        if (!alreadyVisible) return imagePath;
      }

      return uniqueShuffledPool.find(imagePath =>
        imagePath !== excludedImagePath &&
        (!availableGlobPaths.includes(imagePath) || !clickedGlobPaths.has(imagePath))
      ) || uniqueShuffledPool.find(imagePath =>
        !availableGlobPaths.includes(imagePath) || !clickedGlobPaths.has(imagePath)
      ) || null;
    };

    const refillDecorations = excludedImagePath => {
      if (!container.isConnected) return;
      const nextImage = getNextDecorationImage(excludedImagePath);
      if (nextImage) container.appendChild(createFloatingCharacter(nextImage));
    };

    const createFloatingCharacter = imgPath => {
      const img = document.createElement('div');
      img.className = 'floating-char';
      img.dataset.imagePath = imgPath;
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

      // Micro-reacción al pasar el ratón (sin sonido): el personaje "nota" el cursor.
      img.addEventListener('mouseenter', () => {
        if (img.dataset.launched) return;
        img.classList.remove('floating-char-nudge');
        void img.offsetWidth;
        img.classList.add('floating-char-nudge');
      });
      img.addEventListener('animationend', event => {
        if (event.animationName === 'floatingCharNudge') img.classList.remove('floating-char-nudge');
      });

      img.onclick = () => {
        if (img.dataset.launched) return;
        img.dataset.launched = 'true';
        recordHypermutatedDecorationClick(imgPath, availableGlobPaths);
        recordRainbowFuelClick(imgPath);
        if (availableGlobPaths.includes(imgPath)) clickedGlobPaths.add(imgPath);
        const isGlob = imgPath.toLowerCase().includes('glob');
        playSound(isGlob ? 'Recursos/sounds/Slurp.mp3' : 'Recursos/sounds/Bipbip.mp3');
        // Reacción visual por familia al tocar un Glob (además del lanzamiento).
        spawnLoginFamilyReaction(imgPath, img.getBoundingClientRect());
        if (isHalloweenLoginEnemy(imgPath)) {
          const enemyType = Object.keys(IMAGE_PATHS).find(type => IMAGE_PATHS[type] === imgPath);
          triggerHalloweenJumpscare(enemyType, null, imgPath);
          img.remove();
          setTimeout(() => refillDecorations(imgPath), 850);
          return;
        }
        if (CHRISTMAS_LOGIN_ENEMY_IMAGES.has(imgPath)) {
          launchChristmasGiftProjectile(img.getBoundingClientRect());
          img.remove();
          setTimeout(() => refillDecorations(imgPath), 850);
          return;
        }
        // Default (Globs y enemigos normales): salen disparados al hacer click.
        // Se reubica a <body> con z-index alto para que el disparo SE VEA por
        // encima del login (el contenedor de decoración está detrás, z-index:-1).
        const rect = img.getBoundingClientRect();
        const angle = Math.random() * Math.PI * 2;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceToHorizontalEdge = dx > 0
          ? (window.innerWidth - centerX) / dx
          : -centerX / dx;
        const distanceToVerticalEdge = dy > 0
          ? (window.innerHeight - centerY) / dy
          : -centerY / dy;
        const distance = Math.min(distanceToHorizontalEdge, distanceToVerticalEdge) + rect.width;
        img.style.animation = 'none';
        img.style.position = 'fixed';
        img.style.zIndex = '15000';
        img.style.margin = '0';
        img.style.left = `${rect.left}px`;
        img.style.top = `${rect.top}px`;
        img.style.width = `${rect.width}px`;
        img.style.height = `${rect.height}px`;
        img.style.transform = 'translate(0, 0)';
        img.style.opacity = '1';
        document.body.appendChild(img);
        void img.offsetWidth;
        img.style.transition = 'transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 700ms ease';
        img.style.transform = `translate(${dx * distance}px, ${dy * distance}px) rotate(${360 + Math.random() * 720}deg)`;
        img.style.opacity = '0';
        const removeAndRefill = () => {
          if (!img.isConnected) return;
          img.remove();
          refillDecorations(imgPath);
        };
        img.addEventListener('transitionend', removeAndRefill, { once: true });
        setTimeout(removeAndRefill, 800);
      };

      return img;
    };

    selectedImages.forEach(imgPath => container.appendChild(createFloatingCharacter(imgPath)));
  } catch (e) { console.warn("Error en decoraciones:", e); }
}

function updateLightModeButton() {
  const button = document.getElementById('light-mode-toggle');
  if (!button) return;
  const isLightMode = document.body.classList.contains('light-mode');
  const label = currentLanguage === 'en'
    ? (isLightMode ? 'Switch to dark mode' : 'Switch to light mode')
    : (isLightMode ? 'Activar modo oscuro' : 'Activar modo claro');
  button.textContent = isLightMode ? '🌙' : '💡';
  button.setAttribute('aria-label', label);
  button.title = label;
}

function setLightMode(enabled, persist = true) {
  document.body.classList.toggle('light-mode', enabled);
  updateLightModeButton();
  if (!persist) return;
  try {
    localStorage.setItem('glob_light_mode', String(enabled));
  } catch (error) {
    console.warn('No se pudo guardar el modo de color:', error);
  }
}

function initializeLightMode() {
  let enabled = false;
  try {
    enabled = localStorage.getItem('glob_light_mode') === 'true';
  } catch (error) {
    console.warn('No se pudo leer el modo de color guardado:', error);
  }
  setLightMode(enabled, false);
}

function toggleLightMode() {
  setLightMode(!document.body.classList.contains('light-mode'));
  const loginScreen = document.getElementById('login-screen');
  if (!loginScreen || loginScreen.style.display === 'none' || lightModeGlitchTriggered) return;
  lightModeToggleCount++;
  if (lightModeToggleCount < 20) return;

  lightModeGlitchTriggered = true;
  document.body.classList.add('light-mode-glitch');
  document.querySelectorAll('#login-screen .login-box').forEach(box => {
    box.classList.add('login-glitch-critical');
  });
}

function clearLoginVisualEffects() {
  document.querySelectorAll('.login-box').forEach(box => {
    box.classList.remove('login-glitch-critical');
  });
  document.querySelectorAll('.login-logo').forEach(logo => {
    logo.classList.remove('glitch-effect', 'logo-click-feedback');
    logo.style.removeProperty('transform');
    logo.style.removeProperty('filter');
    logo.style.removeProperty('transition');
  });
}

function toggleMute() {
  gameState.muted = !gameState.muted;
  updateMuteButton();
  saveProgress();
}

function restartAcrossTimeEvent() {
  const failedSpace = gameState.acrossTheTimeSpace || 1;
  const progress = gameState.acrossTheTimeProgress || {};
  progress.started = true;
  progress.completed = false;
  if (failedSpace <= 1) {
    progress.spaceOneComplete = false;
    progress.spaceTwoComplete = false;
    progress.spaceThreeComplete = false;
    progress.spaceThreeStarted = false;
    gameState.acrossTheTimeSpace = 1;
    gameState.map = 'gelatin_lake';
  } else if (failedSpace === 2) {
    progress.spaceTwoComplete = false;
    progress.spaceThreeComplete = false;
    progress.spaceThreeStarted = false;
    gameState.acrossTheTimeSpace = 2;
    gameState.map = 'urbanistic_road';
  } else if (failedSpace === 3) {
    progress.spaceThreeComplete = false;
    progress.spaceThreeStarted = true;
    gameState.acrossTheTimeSpace = 3;
    gameState.map = 'gelatin_lake';
  } else {
    gameState.acrossTheTimeSpace = 4;
    gameState.map = 'spooktacular_ruins';
  }
  gameState.acrossTheTimeProgress = progress;
  gameState.acrossTimeBossReturns = 0;
  gameState.acrossTimeCrystals = 0;
  if (gameState.acrossTheTimeSpace < 3) gameState.acrossTimeTowerCaps = null;
  gameState.mode = 'acrossTheTime';
  gameState.modeConfirmed = true;
  transitionAcrossTimeMap(gameState.acrossTheTimeSpace, gameState.map, failedSpace === 4 ? 45 : 0);
  showMessage(translate('across_time_restart'), 'warning');
  saveProgress();
}

function updateMuteButton() {
  // El botón real es #effects-toggle-btn (no 'mute-toggle', que no existía).
  // muted = true  → efectos APAGADOS (OFF). muted = false → ON.
  const btn = document.getElementById('effects-toggle-btn');
  if (btn) {
    const on = !gameState.muted;
    btn.textContent = on
      ? (currentLanguage === 'es' ? '🔊 Efectos ON' : '🔊 Effects ON')
      : (currentLanguage === 'es' ? '🔇 Efectos OFF' : '🔇 Effects OFF');
    btn.classList.toggle('active', on);
  }
}

function playSound(file) {
  if (gameState.muted) return;
  const audio = new Audio(file);
  audio.play().catch(e => console.warn("Audio error:", e));
}

function checkLogin() {
  try {
    const savedLoginName = localStorage.getItem('glob_login_username');
    const savedName = localStorage.getItem('glob_username');
    offlineModeActive = localStorage.getItem('glob_offline_mode') === 'true';
    if (savedLoginName) document.getElementById('username-input').value = savedLoginName;
    else if (savedName) document.getElementById('username-input').value = savedName;
    restoreRememberedCredentials();
  } catch (e) { console.warn("LocalStorage no disponible"); }
}

// "Recuérdame": guarda/recupera usuario y contraseña en este dispositivo.
// Nota: la contraseña queda en localStorage (texto plano), de ahí el aviso.
function persistRememberedCredentials(username, password) {
  try {
    const checkbox = document.getElementById('remember-me-checkbox');
    if (checkbox && checkbox.checked) {
      localStorage.setItem('glob_remember_me', 'true');
      localStorage.setItem('glob_remember_user', username);
      localStorage.setItem('glob_remember_pass', password);
    } else {
      localStorage.removeItem('glob_remember_me');
      localStorage.removeItem('glob_remember_user');
      localStorage.removeItem('glob_remember_pass');
    }
  } catch (e) { /* localStorage no disponible */ }
}

function restoreRememberedCredentials() {
  try {
    const remembered = localStorage.getItem('glob_remember_me') === 'true';
    const checkbox = document.getElementById('remember-me-checkbox');
    const warning = document.getElementById('remember-me-warning');
    if (checkbox) checkbox.checked = remembered;
    if (warning) warning.style.display = remembered ? 'block' : 'none';
    if (remembered) {
      const user = localStorage.getItem('glob_remember_user') || '';
      const pass = localStorage.getItem('glob_remember_pass') || '';
      const userInput = document.getElementById('username-input');
      const passInput = document.getElementById('password-input');
      if (userInput && user) userInput.value = user;
      if (passInput && pass) passInput.value = pass;
    }
  } catch (e) { /* localStorage no disponible */ }
}

function scheduleSkipLoginButton() { /* desactivado */ }

function getSupabaseAuthEmail(username) {
  const normalizedUsername = username.trim().toLowerCase();
  if (!/^[a-z0-9_.-]{3,24}$/.test(normalizedUsername)) {
    throw new Error(currentLanguage === 'en'
      ? 'Username must be 3-24 characters and use only letters, numbers, dots, dashes, or underscores.'
      : 'El usuario debe tener entre 3 y 24 caracteres y usar solo letras, números, puntos, guiones o guiones bajos.');
  }
  return `${normalizedUsername}@accounts.glob-defenders.invalid`;
}

async function startGameSession(username, offline, accountId = null, isNewAccount = false) {
  cloudProgressReady = false;
  let shouldOfferFirstTutorial = false;
  offensiveUsernameAttempts = 0;
  moderationAccountDeletionHandled = false;
  if (offensiveUsernameJumpscareTimeout !== null) {
    clearTimeout(offensiveUsernameJumpscareTimeout);
    offensiveUsernameJumpscareTimeout = null;
  }
  document.querySelector('.username-warning-jumpscare')?.remove();
  activeCloudUserId = offline ? null : accountId;
  resetAccountProgress();
  if (activeCloudUserId) {
    let cloudProgress;
    try {
      cloudProgress = await loadCloudProgress(activeCloudUserId);
      if (!cloudProgress && localStorage.getItem('glob_username') === username) {
        const localProgress = localStorage.getItem('glob_progress_' + username);
        if (localProgress && window.confirm(currentLanguage === 'en'
          ? 'A local save with this player name was found. Import it into this account?'
          : 'Se encontró un guardado local con este nombre. ¿Quieres importarlo a esta cuenta?')) {
          cloudProgress = JSON.parse(localProgress);
          await saveCloudProgress(activeCloudUserId, cloudProgress);
        }
      }
      shouldOfferFirstTutorial = isNewAccount && !cloudProgress;
    } catch (error) {
      activeCloudUserId = null;
      console.error('No se pudo cargar el progreso de la cuenta desde Supabase:', error);
      throw new Error(currentLanguage === 'en'
        ? 'Could not load your cloud save. Check your connection and make sure the player_progress table is set up in Supabase.'
        : 'No se pudo cargar el guardado en la nube. Comprueba la conexión y que la tabla player_progress esté creada en Supabase.');
    }
    if (cloudProgress) {
      localStorage.setItem('glob_progress_' + username, JSON.stringify(cloudProgress));
      loadProgress(username);
    }
    cloudProgressReady = true;
  } else {
    activeCloudUserId = null;
    loadProgress(username);
  }

  startSessionClock();
  localStorage.setItem('glob_username', username);
  if (!offline) localStorage.setItem('glob_login_username', document.getElementById('username-input').value.trim().toLowerCase());
  if (offline) {
    localStorage.setItem('glob_offline_mode', 'true');
  } else {
    localStorage.removeItem('glob_offline_mode');
  }
  if (gameState.tutorialCompleted && !gameState.tutorialRewardGranted) {
    awardTutorialCompletion();
  }
  if (localStorage.getItem(HYPERMUTATED_PENDING_KEY) === 'true') {
    unlockHypermutatedEffect();
  }
  if (!offline && localStorage.getItem('glob_placeholder_glob_pending') === 'true') {
    gameState.profileSpecialAvatars = gameState.profileSpecialAvatars || [];
    if (!gameState.profileSpecialAvatars.includes('placeholder-glob')) {
      gameState.profileSpecialAvatars.push('placeholder-glob');
      localStorage.removeItem('glob_placeholder_glob_pending');
      saveProgress();
      const loginMessage = document.getElementById('login-msg');
      if (loginMessage) {
        loginMessage.textContent = currentLanguage === 'en'
          ? 'Placeholder Glob has been unlocked for this account!'
          : '¡Placeholder Glob se ha desbloqueado para esta cuenta!';
        loginMessage.style.color = '#2ecc71';
      }
    } else {
      localStorage.removeItem('glob_placeholder_glob_pending');
    }
  }
  offlineModeActive = offline;
  updateRoleIndicator();

  const offlineIndicator = document.getElementById('offline-indicator');
  if (offlineIndicator) offlineIndicator.style.display = offline ? 'block' : 'none';

  drawBadges();
  updateMetaUI();
  drawTowerShop();
  clearLoginVisualEffects();
  document.getElementById('login-screen').style.display = 'none';

  const showGame = () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.style.display = 'none';
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) gameContainer.style.display = 'flex';
    document.getElementById('meta-controls').style.display = 'flex';
    const seedControls = document.getElementById('seed-controls');
    if (seedControls) seedControls.style.display = offline ? 'none' : 'flex';
    document.getElementById('mode-selection').style.display = 'none';
    gameState.selectedIsland = null;
    renderMapSelection();
    document.getElementById('map-selection').style.display = 'flex';
    const inviteParams = new URLSearchParams(window.location.search);
    const invitedSeed = inviteParams.get('seed');
    if (isNewAccount) {
      localStorage.removeItem(`glob_tutorial_pending_${username.toLowerCase()}`);
    }
    if (shouldOfferFirstTutorial) {
      gameState.tutorialIntroSeen = true;
      saveProgress();
      if (invitedSeed) autoJoinAttempted = true;
      window.setTimeout(() => launchTutorial('gelatin_lake'), 0);
    } else if (!gameState.tutorialIntroSeen) {
      gameState.tutorialIntroSeen = true;
      saveProgress();
    }
    if (!shouldOfferFirstTutorial && !autoJoinAttempted && !offline && invitedSeed && /^[A-Z][A-Z0-9]{6}$/.test(invitedSeed.toUpperCase())) {
      autoJoinAttempted = true;
      document.getElementById('seed-input').value = invitedSeed.toUpperCase();
      setTimeout(() => window.loadSeed(), 0);
    } else if (offline && invitedSeed && /^[A-Z][A-Z0-9]{6}$/.test(invitedSeed.toUpperCase())) {
      autoJoinAttempted = true;
      blockOfflineSeedAccess();
    }
  };

  const loadingScreen = document.getElementById('loading-screen');
  if (!loadingScreen) {
    showGame();
    return;
  }

  loadingScreen.style.display = 'flex';
  const loadingGlobGallery = document.getElementById('loading-glob-wrap');
  if (loadingGlobGallery) {
    const familyTowers = Object.keys(TOWER_TYPES).reduce((families, towerType) => {
      const family = TOWER_TYPES[towerType].family;
      if (family && family !== 'Special') {
        if (!families.has(family)) families.set(family, []);
        families.get(family).push(towerType);
      }
      return families;
    }, new Map());
    const evolvedTowers = new Set(Object.values(TOWER_TYPES).map(tower => tower.evolution).filter(Boolean));
    const loadingTowers = [];

    familyTowers.forEach(towerTypes => {
      const firstForms = towerTypes.filter(towerType => !evolvedTowers.has(towerType));
      firstForms.forEach(firstForm => {
        loadingTowers.push(firstForm);
        const secondForm = TOWER_TYPES[firstForm].evolution;
        if (secondForm && TOWER_TYPES[secondForm]?.evolution) loadingTowers.push(secondForm);
      });
    });

    const availableTowers = loadingTowers.filter(towerType => IMAGE_PATHS[towerType]);
    if (availableTowers.length < loadingTowers.length) {
      console.error('Faltan imágenes para algunos Globs de la pantalla de carga.');
    }
    if (availableTowers.length === 0) {
      console.error('No hay imágenes disponibles para la pantalla de carga.');
    } else {
      const randomTower = availableTowers[Math.floor(Math.random() * availableTowers.length)];
      const globImage = document.createElement('img');
      globImage.className = 'loading-glob-spinner';
      globImage.src = encodeURI(IMAGE_PATHS[randomTower]);
      globImage.alt = randomTower;
      globImage.loading = 'eager';
      loadingGlobGallery.replaceChildren(globImage);
    }
  }

  // Carga con barra de progreso real: se rellena de 0% a 100% durante
  // la duración de carga, sincronizada con la aparición del juego.
  // Duración aleatoria entre 3.637s y 7s (guiño al 637) para que cada
  // arranque se sienta un poco distinto.
  const LOADING_MIN_MS = 3637;
  const LOADING_MAX_MS = 7000;
  const LOADING_DURATION_MS = Math.round(LOADING_MIN_MS + Math.random() * (LOADING_MAX_MS - LOADING_MIN_MS));
  const barFill = document.getElementById('loading-bar-fill');
  const loadingTextEl = document.getElementById('loading-text');
  const loadingTipEl = document.getElementById('loading-tip');
  const loadingStart = performance.now();
  let loadingRaf = null;

  // Frases de carga con carácter según avanza el progreso (A: alma).
  const loadingPhrases = currentLanguage === 'en'
    ? [
        'Waking up the Globs...',
        'Summoning Pyces...',
        'Loading the islands...',
        'Polishing projectiles...',
        'Warming up Work-Bombot...',
        'Almost ready, Commander...'
      ]
    : [
        'Despertando a los Globs...',
        'Convocando a los Pyces...',
        'Cargando las islas...',
        'Puliendo proyectiles...',
        'Calentando a Work-Bombot...',
        'Casi listo, comandante...'
      ];

  // Tips rotativos de la pantalla de carga (lista propia y autocontenida).
  let rotatingTips = currentLanguage === 'en'
    ? [
        'Tip: Basic Globs hold the early defense. Place them well.',
        'Tip: The red family pushes direct damage on fast enemies.',
        'Tip: Blue Globs slow enemies and buy you time.',
        'Tip: Ducky Globs boost your economy over long runs.',
        'Tip: Bombot shines when you anticipate the enemy lane.',
        'Tip: Slow auras give you room to react before the clash.',
        'Tip: Press U to upgrade every affordable tower at once.',
        'Tip: Evolve a tower to its max to unlock its full power.',
        'Tip: Bosses hit hard; focus your damage before they break through.'
      ]
    : [
        'Tip: Los Globs básicos sostienen la defensa temprana. Colócalos bien.',
        'Tip: La familia roja empuja daño directo a enemigos rápidos.',
        'Tip: Los Globs azules ralentizan y te dan tiempo.',
        'Tip: Los Ducky potencian tu economía en partidas largas.',
        'Tip: Bombot brilla cuando anticipas por dónde entran los Pyces.',
        'Tip: Las auras de ralentización te dan margen para reaccionar.',
        'Tip: Pulsa U para mejorar todas las torres que puedas pagar.',
        'Tip: Evoluciona una torre al máximo para su poder completo.',
        'Tip: Los jefes pegan fuerte; concentra el daño antes de que pasen.'
      ];
  // Baraja para que no salgan siempre en el mismo orden.
  for (let i = rotatingTips.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rotatingTips[i], rotatingTips[j]] = [rotatingTips[j], rotatingTips[i]];
  }
  let tipIndex = 0;
  const showNextTip = () => {
    if (!loadingTipEl || rotatingTips.length === 0) return;
    loadingTipEl.classList.remove('loading-tip-swap');
    void loadingTipEl.offsetWidth; // reinicia la animación
    loadingTipEl.textContent = rotatingTips[tipIndex % rotatingTips.length];
    loadingTipEl.classList.add('loading-tip-swap');
    tipIndex++;
  };
  showNextTip();
  const tipInterval = setInterval(showNextTip, 2200);

  const stepLoading = (now) => {
    const elapsed = now - loadingStart;
    // Curva suave (ease-out) para que arranque rápido y afine al final
    const linear = Math.min(1, elapsed / LOADING_DURATION_MS);
    const eased = 1 - Math.pow(1 - linear, 2);
    const pct = Math.round(eased * 100);
    if (barFill) barFill.style.width = pct + '%';
    if (loadingTextEl) {
      const phrase = loadingPhrases[Math.min(loadingPhrases.length - 1, Math.floor(eased * loadingPhrases.length))];
      loadingTextEl.textContent = `${phrase} ${pct}%`;
    }
    if (linear < 1) {
      loadingRaf = requestAnimationFrame(stepLoading);
    } else {
      if (barFill) barFill.style.width = '100%';
      if (loadingTextEl) loadingTextEl.textContent = `${loadingPhrases[loadingPhrases.length - 1]} 100%`;
      clearInterval(tipInterval);
      showGame();
    }
  };
  loadingRaf = requestAnimationFrame(stepLoading);
}

function showLoginError(message) {
  const msgEl = document.getElementById('login-msg');
  if (!msgEl) return;
  msgEl.textContent = message;
  msgEl.style.color = 'red';
}

function getSessionUserRole() {
  const username = localStorage.getItem('glob_username') || '';
  return typeof getUserRole === 'function' ? getUserRole(username) : 'USER';
}

function updateRoleIndicator() {
  const indicator = document.getElementById('admin-indicator');
  const role = getSessionUserRole();
  document.body.classList.remove('role-owner', 'role-admin', 'role-debug');

  if (!indicator) return;
  if (role === 'USER') {
    indicator.style.display = 'none';
    indicator.dataset.role = '';
    return;
  }

  indicator.dataset.role = role.toLowerCase();
  indicator.textContent = role === 'OWNER' ? '👑 OWNER' : role;
  indicator.style.display = 'block';
  if (role === 'OWNER') document.body.classList.add('role-owner');
  else if (role === 'ADMIN') document.body.classList.add('role-admin');
  else document.body.classList.add('role-debug');
}

const OFFENSIVE_USERNAME_TERMS = [
  'dick', 'dig', 'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'bastard',
  'slut', 'whore', 'motherfucker', 'idiot', 'crap', 'damn', 'piss',
  'prick', 'wanker', 'twat', 'dumbass', 'jackass', 'douche', 'douchebag',
  'fuckface', 'fuckwit', 'shithead', 'dipshit', 'bullshit', 'horseshit',
  'arsehole', 'arse', 'tosser', 'bollocks', 'scumbag', 'fucker', 'jerkoff',
  'loser', 'moron', 'stupid', 'cretin', 'imbecile',
  'puta', 'puto', 'mierda', 'cabron', 'joder', 'gilipollas', 'pendejo',
  'maricon', 'imbecil', 'estupido', 'zorra', 'cono', 'jilipollas',
  'cagada', 'cagar', 'cagon', 'culero', 'mamon', 'mamona', 'pinche',
  'chingado', 'chingada', 'chingar', 'carajo', 'mierdero', 'mierdoso',
  'jodido', 'jodete', 'cabrona', 'cabronazo', 'pendeja', 'pendejazo',
  'putisima', 'putazo', 'putero', 'perra', 'marica', 'maricona',
  'capullo', 'retrasado', 'subnormal', 'baboso', 'babosa', 'estupida',
  String.fromCharCode(110, 105, 103, 103, 101, 114)
];

function normalizeUsernameForModeration(username) {
  return String(username || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[013457@$]/g, character => ({
      '0': 'o', '1': 'i', '3': 'e', '4': 'a',
      '5': 's', '7': 't', '@': 'a', '$': 's'
    })[character] || character);
}

function isOffensiveUsername(username) {
  const normalizedUsername = normalizeUsernameForModeration(username);
  const tokens = normalizedUsername.split(/[^a-z0-9]+/).filter(Boolean);
  const compactUsername = normalizedUsername.replace(/[^a-z0-9]/g, '');
  return tokens.some(token => OFFENSIVE_USERNAME_TERMS.some(term =>
    term === 'dig' ? token === term : token.includes(term)
  )) || OFFENSIVE_USERNAME_TERMS.some(term =>
    term !== 'dig' && compactUsername.includes(term)
  );
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function formatNoeyeText(text) {
  return text.replace(/[a-z]/gi, character => ({
    a: '4',
    e: '3',
    i: '1',
    o: '0',
    s: '5',
    t: '7'
  }[character.toLowerCase()] || character));
}

const DARKSPIRIT_COMBAT_LINES = {
  es: [
    'No deberias haber venido. La oscuridad ya cerro el camino detras de ti.',
    'Sigue defendiendo. Quiero que entiendas que nada de lo que hagas cambiara el final.',
    'Puedo oir como se apaga tu esperanza. Pronto no quedara nadie para pedir ayuda.',
    'Tus defensas caeran una a una. Y cuando llegue el silencio, seguire aqui.'
  ],
  en: [
    'You should not have come. The darkness has already closed the path behind you.',
    'Keep defending. I want you to understand that nothing you do will change the ending.',
    'I can hear your hope fading. Soon there will be no one left to call for help.',
    'Your defenses will fall one by one. And when silence comes, I will still be here.'
  ]
};

function showOffensiveUsernameWarning() {
  const warningLines = {
    bombot: {
      es: [
        'Bombot detecta un insulto en ese nombre. Elige uno respetuoso, por favor.',
        'Ese nombre no es apropiado. Cámbialo por uno respetuoso.',
        'Aviso: no uses insultos como nombre de usuario.'
      ],
      en: [
        'Bombot detected an insult in that name. Please choose a respectful one.',
        'That name is not appropriate. Please use a respectful one.',
        'Warning: do not use insults as a username.'
      ]
    },
    noeye: {
      es: [
        'No conviertas un nombre en un arma. Cámbialo.',
        'Ya te lo advertí. No uses ese nombre.',
        'La oscuridad no tolera esa falta de respeto. Cambia el nombre.'
      ],
      en: [
        'Do not turn a name into a weapon. Change it.',
        'I warned you. Do not use that name.',
        'Even the darkness has no place for that disrespect. Change the name.'
      ]
    },
    omnipresent: {
      es: [
        'Ese nombre puede hacer daño. Prueba con uno respetuoso.',
        'No hace falta insultar para elegir un nombre. Inténtalo de nuevo.',
        'Por favor, elige un nombre que no ataque a nadie.'
      ],
      en: [
        'That name can hurt people. Please choose a respectful one.',
        'You do not need an insult to choose a name. Try again.',
        'Please choose a name that does not target anyone.'
      ]
    },
    glob: {
      es: [
        'Ese nombre me hace sentir mal. ¿Puedes elegir otro?',
        'Por favor, seamos amables. Prueba con otro nombre.',
        'No me gusta ese insulto. Cambiemos el nombre.'
      ],
      en: [
        'That name makes me feel bad. Could you choose another?',
        'Please, let us be kind. Try a different name.',
        'I do not like that insult. Let us choose another name.'
      ]
    }
  };
  const speakerId = pickRandom(['bombot', 'noeye', 'omnipresent', 'glob']);
  const speaker = NARRATOR_DATA[speakerId];
  const language = currentLanguage === 'en' ? 'en' : 'es';
  const messages = warningLines[speakerId][language];
  const message = pickRandom(messages);
  window._showNarratorMsg?.(
    speakerId,
    speaker.img,
    speaker[language].name,
    speakerId === 'noeye' ? formatNoeyeText(message) : message
  );
}

function showOffensiveChatWarning() {
  const isEnglish = currentLanguage === 'en';
  const speakerId = pickRandom(['bombot', 'glob', 'omnipresent']);
  const speaker = NARRATOR_DATA[speakerId];
  const messages = isEnglish
    ? [
        'That message was blocked because it contains an insult. Please rephrase it respectfully.',
        'Insults are not allowed in chat. Try saying it another way.',
        'Message blocked. Let us keep the chat respectful.'
      ]
    : [
        'Ese mensaje se bloqueó porque contiene un insulto. Reformúlalo con respeto, por favor.',
        'No se permiten insultos en el chat. Prueba a decirlo de otra manera.',
        'Mensaje bloqueado. Mantengamos el chat respetuoso.'
      ];
  const language = isEnglish ? 'en' : 'es';
  const message = pickRandom(messages);
  window._showNarratorMsg?.(
    speakerId,
    speaker.img,
    speaker[language].name,
    message
  );
}

function showOffensiveUsernameFinalDialog(speakerId) {
  const finalLines = {
    noeye: {
      es: [
        'PARA YA DE INSULTAR. No vuelvas a usar insultos como nombre.',
        'NO VOY A REPETIRLO: PARA YA DE INSULTAR. Cambia ese nombre.'
      ],
      en: [
        'STOP INSULTING PEOPLE. Do not use insults as a username again.',
        'I WILL NOT REPEAT MYSELF: STOP INSULTING PEOPLE. Change that name.'
      ]
    },
    darkspirit: {
      es: [
        'La oscuridad ya sabe tu nombre. PARA YA DE INSULTAR. Si vuelves a hacerlo, no habra nadie mas para avisarte.',
        'Escucha bien: cambia ese nombre. La proxima vez que me veas, no sera para darte otro aviso.'
      ],
      en: [
        'The darkness knows your name now. STOP INSULTING PEOPLE. If you do it again, no one else will warn you.',
        'Listen carefully: change that name. The next time you see me, it will not be to give you another warning.'
      ]
    }
  };
  const speaker = speakerId === 'darkspirit'
    ? { name: 'DarkSpirit', image: IMAGE_PATHS.DarkSpirit }
    : { name: 'NOeye', image: IMAGE_PATHS.NOeye_Pyce };
  const language = currentLanguage === 'en' ? 'en' : 'es';
  const lines = (finalLines[speakerId] || finalLines.noeye)[language];
  const message = pickRandom(lines);
  window._showNarratorMsg?.(
    speakerId,
    speaker.image,
    speaker.name,
    speakerId === 'noeye' ? formatNoeyeText(message) : message
  );
}

function triggerOffensiveUsernameJumpscare() {
  const previousOverlay = document.querySelector('.username-warning-jumpscare');
  previousOverlay?.remove();
  if (offensiveUsernameJumpscareTimeout !== null) {
    clearTimeout(offensiveUsernameJumpscareTimeout);
    offensiveUsernameJumpscareTimeout = null;
  }

  const speakerId = pickRandom(['noeye', 'darkspirit']);
  const imagePath = speakerId === 'darkspirit' ? IMAGE_PATHS.DarkSpirit : IMAGE_PATHS.NOeye_Pyce;
  const overlay = document.createElement('div');
  overlay.className = 'username-warning-jumpscare';
  overlay.setAttribute('role', 'alert');
  overlay.setAttribute('aria-label', currentLanguage === 'en' ? 'Warning' : 'Aviso');
  const image = document.createElement('div');
  image.className = 'username-warning-jumpscare-image';
  image.style.backgroundImage = `url("${imagePath}")`;
  overlay.appendChild(image);
  document.body.appendChild(overlay);

  offensiveUsernameJumpscareTimeout = setTimeout(() => {
    overlay.remove();
    offensiveUsernameJumpscareTimeout = null;
    showOffensiveUsernameFinalDialog(speakerId);
  }, 1500);
}

function blockOffensiveUsername(username, source = 'login') {
  if (!isOffensiveUsername(username)) return false;
  if (source === 'chat') {
    showOffensiveChatWarning();
    return true;
  }
  offensiveUsernameAttempts++;
  if (source === 'login' && offensiveUsernameAttempts >= OFFENSIVE_ACCOUNT_DELETION_THRESHOLD) {
    if (offensiveUsernameJumpscareTimeout !== null) {
      clearTimeout(offensiveUsernameJumpscareTimeout);
      offensiveUsernameJumpscareTimeout = null;
    }
    document.querySelector('.username-warning-jumpscare')?.remove();
    const isEnglish = currentLanguage === 'en';
    const data = NARRATOR_DATA.omnipresent;
    window._showNarratorMsg?.(
      'omnipresent',
      data.img,
      '???',
      isEnglish
        ? '??? says: Stop trying. You will not get past the login screen with an insulting username.'
        : '???: Para ya de insistir. No vas a pasar del login con un nombre insultante.'
    );
    return true;
  }
  if (offensiveUsernameAttempts % 3 === 0) {
    triggerOffensiveUsernameJumpscare();
  } else {
    showOffensiveUsernameWarning();
  }
  return true;
}

async function recordOffensiveChatAttempt() {
  const { data, error } = await getSupabaseClient().functions.invoke('record-offensive-chat-attempt', {
    body: {}
  });
  if (error) throw error;
  if (!data || typeof data.attempts !== 'number' || typeof data.deleted !== 'boolean') {
    throw new Error('Supabase devolvió una respuesta inválida al registrar la infracción del chat.');
  }
  return data;
}

async function handleModeratedAccountDeletion() {
  if (moderationAccountDeletionHandled) return;
  moderationAccountDeletionHandled = true;
  if (offensiveUsernameJumpscareTimeout !== null) {
    clearTimeout(offensiveUsernameJumpscareTimeout);
    offensiveUsernameJumpscareTimeout = null;
  }
  document.querySelector('.username-warning-jumpscare')?.remove();

  const username = localStorage.getItem('glob_username');
  const english = currentLanguage === 'en';
  const data = NARRATOR_DATA.omnipresent;
  window._showNarratorMsg?.(
    'omnipresent',
    data.img,
    '???',
    english
      ? '??? says: Your account has been deleted. You are now leaving this match.'
      : '???: Tu cuenta ha sido borrada. Ahora saldrás de esta partida.'
  );

  if (cloudProgressSaveTimer !== null) {
    clearTimeout(cloudProgressSaveTimer);
    cloudProgressSaveTimer = null;
  }
  pendingCloudProgressSave = null;
  cloudProgressReady = false;
  activeCloudUserId = null;

  const progressSaveQueue = cloudProgressSaveQueue;
  try {
    await progressSaveQueue;
  } catch (error) {
    console.error('No se pudo completar un guardado pendiente antes de borrar la cuenta:', error);
  }

  if (username) {
    localStorage.removeItem(`glob_progress_${username}`);
    try {
      await deleteProgressFromDatabase(username);
    } catch (error) {
      console.error('No se pudo borrar la copia local del progreso de la cuenta eliminada:', error);
      window._showMultiplayerNotice?.(english
        ? 'The account was deleted, but its local save could not be removed from this browser.'
        : 'La cuenta se borró, pero no se pudo eliminar su guardado local de este navegador.');
    }
  }
  localStorage.removeItem('glob_username');
  localStorage.removeItem('glob_login_username');
  localStorage.removeItem('glob_offline_mode');

  try {
    const { error } = await getSupabaseClient().auth.signOut({ scope: 'local' });
    if (error) throw error;
  } catch (error) {
    console.error('No se pudo cerrar la sesión local después de borrar la cuenta:', error);
  }

  window._exitToLoginAfterModeration?.();
}

async function handleLogin() {
  const usernameInput = document.getElementById('username-input');
  const passInput = document.getElementById('password-input');
  const username = usernameInput ? usernameInput.value.trim() : '';
  const password = passInput ? passInput.value : "";

  if (!username || !password) {
    const msgEl = document.getElementById('login-msg');
    if (msgEl) msgEl.textContent = currentLanguage === 'en'
      ? 'Enter your username and password.'
      : 'Introduce tu nombre de usuario y contraseña.';
    return;
  }
  if (blockOffensiveUsername(username)) return;

  try {
    await flushCloudProgressSave();
    const { data, error } = await getSupabaseClient().auth.signInWithPassword({
      email: getSupabaseAuthEmail(username),
      password
    });
    if (error) throw error;
    if (!data.session || !data.user) {
      showLoginError(currentLanguage === 'en'
        ? 'Sign-in was not completed. Check your email for a confirmation link.'
        : 'El inicio de sesión no se completó. Revisa tu correo para confirmar la cuenta.');
      return;
    }

    persistRememberedCredentials(username, password);

    const pendingTutorialKey = `glob_tutorial_pending_${username.toLowerCase()}`;
    const isNewAccount = localStorage.getItem(pendingTutorialKey) === 'true';
    const playerName = data.user.user_metadata?.player_name || username.trim();
    await startGameSession(playerName, false, data.user.id, isNewAccount);
  } catch (error) {
    console.error('Error al iniciar sesión con Supabase:', error);
    showLoginError(error.message || translate('loginError'));
  }
}

async function handleCreateAccount() {
  const usernameInput = document.getElementById('username-input');
  const passInput = document.getElementById('password-input');
  const msgEl = document.getElementById('login-msg');
  const username = usernameInput ? usernameInput.value.trim() : '';
  const password = passInput ? passInput.value : '';
  const playerName = username;

  if (!username || !password || !playerName) {
    if (msgEl) msgEl.textContent = currentLanguage === 'es'
      ? 'Introduce nombre de usuario y contraseña para crear la cuenta.'
      : 'Enter a username and password to create the account.';
    return;
  }
  if (blockOffensiveUsername(username)) return;

  try {
    await flushCloudProgressSave();
    const { data, error } = await getSupabaseClient().auth.signUp({
      email: getSupabaseAuthEmail(username),
      password,
      options: { data: { player_name: playerName } }
    });
    if (error) throw error;
    if (data.user) {
      localStorage.setItem(`glob_tutorial_pending_${username.toLowerCase()}`, 'true');
    }
    if (!data.session || !data.user) {
      const confirmationMessage = currentLanguage === 'en'
        ? 'Account created, but this Supabase project requires email confirmation. Disable Confirm email in Authentication settings to use username-only accounts.'
        : 'La cuenta se creó, pero Supabase exige confirmar un correo. Desactiva Confirm email en los ajustes de Authentication para usar cuentas solo con usuario.';
      const confirmation = document.getElementById('login-msg');
      if (confirmation) {
        confirmation.textContent = confirmationMessage;
        confirmation.style.color = '#2ecc71';
      }
      return;
    }
    document.getElementById('username-input').value = username.toLowerCase();
    await startGameSession(playerName, false, data.user.id, true);
  } catch (error) {
    console.error('Error al crear la cuenta en Supabase:', error);
    if (/email rate limit exceeded/i.test(error.message || '')) {
      showLoginError(currentLanguage === 'en'
        ? 'Supabase is rate-limiting signup emails. Disable email confirmation in Authentication > Providers > Email. If it is already disabled, configure custom SMTP or wait for the limit to reset.'
        : 'Supabase está limitando los correos de registro. Desactiva la confirmación por correo en Authentication > Providers > Email. Si ya está desactivada, configura un SMTP propio o espera a que se reinicie el límite.');
      return;
    }
    showLoginError(error.message || (currentLanguage === 'en' ? 'Could not create the account.' : 'No se pudo crear la cuenta.'));
  }
}

async function handleSkipLogin() {
  const username = document.getElementById('username-input')?.value.trim() || 'Invitado';
  if (blockOffensiveUsername(username)) return;
  try {
    await startGameSession(username, true);
  } catch (error) {
    console.error('No se pudo iniciar la sesión sin conexión:', error);
    showLoginError(error.message);
  }
}

function isIslandUnlocked(islandId) {
  if (islandId === 'globland_isle') return true;
  if (islandId === 'windland_leaf') {
    return BADGES.future_voyage.unlocked && gameState.duckPassLevel >= 25;
  }
  return false;
}

function getMapDisplayName(mapId) {
  const zone = MAP_ISLANDS.flatMap(island => island.zones).find(item => item.mapId === mapId);
  return zone ? (currentLanguage === 'en' ? zone.nameEn : zone.nameEs) : mapId;
}

function getModeDisplayName(mode) {
  const modeNames = {
    facil: ['Fácil', 'Easy'],
    normal: ['Normal', 'Normal'],
    dificil: ['Difícil', 'Hard'],
    extremo: ['Extremo', 'Extreme'],
    infinito: ['Infinito', 'Infinite'],
    corrupto: ['Corrupto', 'Corrupted'],
    antiNormal: ['Anti-Normal', 'Anti-Normal'],
    interstellar: ['Interstellar', 'Interstellar']
  };
  const names = modeNames[mode];
  return names ? names[currentLanguage === 'en' ? 1 : 0] : mode;
}

function updateLoadSavedRoundButton() {
  const button = document.getElementById('load-saved-round-btn');
  if (!button) return;
  const snapshot = gameState.savedRoundSnapshot;
  if (!snapshot) {
    button.textContent = currentLanguage === 'en' ? 'Load saved game' : 'Cargar partida';
    return;
  }
  const mapName = getMapDisplayName(snapshot.map);
  const modeName = getModeDisplayName(snapshot.mode);
  button.textContent = currentLanguage === 'en'
    ? `Load saved game · ${mapName} · Wave ${snapshot.wave} · ${modeName}`
    : `Cargar partida · ${mapName} · Oleada ${snapshot.wave} · ${modeName}`;
}

function renderMapSelection() {
  const title = document.getElementById('map-selection-title');
  const islandGrid = document.getElementById('island-selection');
  const zoneGrid = document.getElementById('zone-selection');
  if (!title || !islandGrid || !zoneGrid) return;
  updateLoadSavedRoundButton();

  const selectedIsland = MAP_ISLANDS.find(island => island.id === gameState.selectedIsland);
  islandGrid.innerHTML = '';
  zoneGrid.innerHTML = '';
  islandGrid.hidden = !!selectedIsland;
  zoneGrid.hidden = !selectedIsland;

  if (!selectedIsland) {
    title.textContent = currentLanguage === 'en' ? 'Select Island' : 'Seleccionar Isla';
    MAP_ISLANDS.forEach(island => {
      const islandLocked = !isIslandUnlocked(island.id);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `island-card island-${island.id}${islandLocked ? ' is-locked' : ''}`;
      button.disabled = islandLocked;
      const islandName = currentLanguage === 'en' ? island.nameEn : island.nameEs;
      button.textContent = `${islandName}${islandLocked ? ' 🔒' : ''}`;
      if (islandLocked) {
        button.title = currentLanguage === 'en'
          ? 'Requires Boat ride to the future and Duck Pass level 25.'
          : 'Requiere La travesía hacia el futuro y nivel 25 del Duck Pass.';
      } else {
        button.addEventListener('click', () => {
          gameState.selectedIsland = island.id;
          renderMapSelection();
        });
      }
      islandGrid.appendChild(button);
    });
    return;
  }

  const selectedIslandName = selectedIsland.id === 'globland_isle'
    ? 'Globland'
    : (currentLanguage === 'en'
      ? selectedIsland.nameEn
      : selectedIsland.nameEs) || 'Globland';
  title.textContent = currentLanguage === 'en'
    ? `${selectedIslandName} Zones`
    : `Zonas de ${selectedIslandName}`;

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'map-selection-back';
  backButton.textContent = currentLanguage === 'en' ? '← Islands' : '← Islas';
  backButton.addEventListener('click', () => {
    gameState.selectedIsland = null;
    renderMapSelection();
  });
  zoneGrid.appendChild(backButton);

  selectedIsland.zones.forEach(zone => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `zone-card${zone.locked ? ' is-locked' : ''}`;
    button.style.setProperty('--zone-color-start', zone.colors[0]);
    button.style.setProperty('--zone-color-end', zone.colors[1]);
    button.disabled = !!zone.locked;
    button.textContent = currentLanguage === 'en' ? zone.nameEn : zone.nameEs;
    if (!zone.locked) button.addEventListener('click', () => selectMap(zone.mapId));
    zoneGrid.appendChild(button);
  });
}

window.loadSavedRound = async function() {
  const snapshot = gameState.savedRoundSnapshot;
  if (!snapshot) {
    const dialogueOptions = [
      {
        speaker: 'omnipresent',
        name: '???',
        messages: {
          es: [
            '¿En serio? No hay ninguna partida guardada. Mira mejor la próxima vez.',
            'Este espacio está vacío. Igual que tu memoria, por lo visto.',
            '¿Cargar qué? No hay nada. Me haces perder el tiempo.',
            'Vuelve cuando hayas guardado una partida. No pienso inventármela para ti.'
          ],
          en: [
            "Seriously? There's no saved game. Try looking properly next time.",
            'This space is empty. Just like your memory, apparently.',
            "Load what? There's nothing here. You're wasting my time.",
            "Come back after you've saved a game. I'm not going to make one up for you."
          ]
        }
      },
      {
        speaker: 'bombot',
        name: NARRATOR_DATA.bombot[currentLanguage].name,
        messages: {
          es: [
            'Escaneo completado: no se detectan partidas guardadas. ¡Inicia una ronda y guárdala!',
            'No hay datos de ronda que recuperar. Mis sistemas están listos cuando tú lo estés.',
            'Aviso: memoria de partidas vacía. No puedo cargar una ronda que aún no se ha guardado.'
          ],
          en: [
            'Scan complete: no saved games detected. Start a round and save it first!',
            'There is no round data to recover. My systems are ready when you are.',
            'Warning: match memory is empty. I cannot load a round that has not been saved.'
          ]
        }
      },
      {
        speaker: 'glob',
        name: NARRATOR_DATA.glob[currentLanguage].name,
        messages: {
          es: [
            '¿No hay partida guardada? ¡Pues juguemos una y la guardamos para luego!',
            'He mirado por todas partes y no encuentro ninguna ronda guardada.',
            '¡Aquí no hay nada que cargar! Avísame cuando tengamos una partida.'
          ],
          en: [
            'No saved game? Then let us play one and save it for later!',
            "I looked everywhere, but I can't find a saved round.",
            "There's nothing to load here! Let me know when we have a game saved."
          ]
        }
      }
    ];
    const dialogue = dialogueOptions[Math.floor(Math.random() * dialogueOptions.length)];
    const messages = dialogue.messages[currentLanguage] || dialogue.messages.es;
    const message = messages[Math.floor(Math.random() * messages.length)];
    const speaker = NARRATOR_DATA[dialogue.speaker];
    window._showNarratorMsg?.(dialogue.speaker, speaker.img, dialogue.name, message);
    return;
  }

  if (snapshot.mode === 'interstellar' && !hasInterstellarEntryAccess()) {
    window._showMultiplayerNotice?.(currentLanguage === 'en'
      ? 'This saved Interstellar round requires the access code and mission unlock.'
      : 'Esta ronda guardada de Interstellar requiere el código de acceso y desbloquear la misión.');
    return;
  }

  if (!window._restoreSavedRoundSnapshot?.(snapshot)) {
    window._showMultiplayerNotice?.(currentLanguage === 'en'
      ? 'This saved round could not be loaded. It may be incompatible or incomplete.'
      : 'No se pudo cargar la ronda guardada. Puede estar incompleta o ser incompatible.');
    return;
  }

  gameState.savedRoundSnapshot = null;
  saveProgress();
  if (snapshot.seed && !isOfflineSession()) {
    await joinMultiplayerSeed(snapshot.seed, true);
  }
};

function selectMap(mapId) {
  const zone = MAP_ISLANDS.flatMap(island => island.zones).find(item => item.mapId === mapId);
  const owningIsland = MAP_ISLANDS.find(island => island.zones.some(item => item.mapId === mapId));
  if (!zone || zone.locked || !MAPS[mapId] || !owningIsland || !isIslandUnlocked(owningIsland.id)) return;
  gameState.map = mapId;
  gameState.modeConfirmed = false;
  renderMultiplayerPlayerList([]);
  const mapScreen = document.getElementById('map-selection');
  if (mapScreen) mapScreen.style.display = 'none';

  // Refrescar mapa
  generateSpots();
  createMap();

  showModeSelection();
}

function showModeSelection() {
  gameState.modeConfirmed = false;
  renderMultiplayerPlayerList([]);
  document.getElementById('mode-selection').style.display = 'flex';
  const tutorialButton = document.querySelector('.mode-btn[data-mode="tutorial"]');
  if (tutorialButton) {
    tutorialButton.textContent = translate('tutorial_mode_name');
    tutorialButton.title = translate('tutorial_mode_desc');
  }
  if (gameState.antiNormalActive) {
    document.getElementById('mode-selection').classList.add('glitch-state');
    const disableButton = document.getElementById('disable-antinormal-btn');
    if (disableButton) disableButton.style.display = 'block';
  }
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
      btn.onclick = () => {
        showAntiNormalWarning(() => selectMode('antiNormal'));
      };
      grid.appendChild(btn);
    }

    if (gameState.unlockedInterstellar) {
      const btn = document.createElement('button');
      btn.className = 'mode-btn dynamic-mode';
      btn.dataset.mode = 'interstellar';
      btn.innerHTML = currentLanguage === 'en' ? '🌌 Interstellar' : '🌌 Interestelar';
      btn.style.background = 'linear-gradient(45deg, #4b0082, #ff00ff)';
      btn.onclick = () => selectMode('interstellar');
      grid.appendChild(btn);
    }

    if (hasAcrossTimeAccessBadges() && canPlayAcrossTimeSolo() && gameState.map === 'gelatin_lake') {
      const btn = document.createElement('button');
      btn.className = 'mode-btn dynamic-mode mode-btn-across-time';
      btn.dataset.mode = 'acrossTheTime';
      btn.textContent = translate('across_time_mode_name');
      btn.title = translate('across_time_mode_desc');
      btn.onclick = () => selectMode('acrossTheTime');
      grid.appendChild(btn);
    }

    if (gameState.acrossTheTimeProgress?.timeAttackUnlocked &&
        canPlayAcrossTimeSolo() &&
        ['gelatin_lake', 'urbanistic_road', 'spooktacular_ruins'].includes(gameState.map)) {
      const btn = document.createElement('button');
      btn.className = 'mode-btn dynamic-mode mode-btn-time-attack';
      btn.dataset.mode = 'timeAttack';
      btn.textContent = translate('time_attack_mode_name');
      btn.title = translate('time_attack_mode_desc');
      btn.onclick = () => selectMode('timeAttack');
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

function ensureTutorialGuide() {
  let guide = document.getElementById('tutorial-guide');
  if (guide) return guide;
  guide = document.createElement('aside');
  guide.id = 'tutorial-guide';
  guide.className = 'tutorial-guide';
  guide.setAttribute('role', 'status');
  guide.setAttribute('aria-live', 'polite');
  const image = document.createElement('img');
  image.src = encodeURI(IMAGE_PATHS.Work_Bombot);
  image.alt = 'Work-Bombot';
  const copy = document.createElement('div');
  copy.className = 'tutorial-guide-copy';
  const title = document.createElement('strong');
  const text = document.createElement('p');
  const continueButton = document.createElement('button');
  continueButton.type = 'button';
  continueButton.addEventListener('click', () => {
    if (gameState.mode === 'tutorial' && gameState.tutorialStage === 'families') {
      setTutorialStage('build');
    }
  });
  copy.append(title, text, continueButton);
  guide.append(image, copy);
  document.body.appendChild(guide);
  return guide;
}

function awardTutorialCompletion() {
  if (gameState.tutorialRewardGranted) return;
  gameState.tutorialCompleted = true;
  gameState.tutorialRewardGranted = true;
  gameState.claimedRewards = (gameState.claimedRewards || []).filter(key => key !== 'tutorial');
  if (!BADGES.tutorial.unlocked) {
    unlockBadge('tutorial');
  } else {
    drawBadges();
    saveProgress();
  }
}

function setTutorialStage(stage) {
  gameState.tutorialStage = stage;
  const guide = stage === null
    ? document.getElementById('tutorial-guide')
    : ensureTutorialGuide();
  if (!guide) return;
  if (gameState.mode !== 'tutorial' || stage === null || stage === 'complete') {
    guide.hidden = true;
    return;
  }
  guide.hidden = false;
  guide.querySelector('strong').textContent = translate('tutorial_guide_title');
  guide.querySelector('p').textContent = translate(`tutorial_guide_${stage}`);
  const continueButton = guide.querySelector('button');
  continueButton.textContent = translate('tutorial_continue');
  continueButton.hidden = stage !== 'families';
}

function setTutorialSkinsEnabled(enabled) {
  if (enabled) {
    if (!tutorialEquippedSkinsBackup) {
      tutorialEquippedSkinsBackup = { ...gameState.equippedSkins };
    }
    new Set([...Object.keys(gameState.equippedSkins), ...Object.keys(SKINS_DATA)]).forEach(family => {
      gameState.equippedSkins[family] = 'default';
    });
    return;
  }

  if (!tutorialEquippedSkinsBackup) return;
  gameState.equippedSkins = tutorialEquippedSkinsBackup;
  tutorialEquippedSkinsBackup = null;
  gameState.towers.forEach(tower => {
    tower.el.style.backgroundImage = `url('${encodeURI(getTowerImage(tower.type))}')`;
    applyTowerEffects(tower.el, tower.type);
  });
  saveProgress();
}

function setTutorialProgressionEnabled(enabled) {
  if (enabled) {
    if (!tutorialProgressionBackup) {
      tutorialProgressionBackup = {
        towerLimits: { ...gameState.towerLimits },
        baseHealthLevel: gameState.baseHealthLevel,
        metaRangeLevel: gameState.metaRangeLevel,
        metaRange: gameState.metaRange,
        metaDamageLevel: gameState.metaDamageLevel,
        metaDamage: gameState.metaDamage
      };
    }
    gameState.towerLimits = { ...DEFAULT_ACCOUNT_GAME_STATE.towerLimits };
    gameState.baseHealthLevel = DEFAULT_ACCOUNT_GAME_STATE.baseHealthLevel;
    gameState.metaRangeLevel = DEFAULT_ACCOUNT_GAME_STATE.metaRangeLevel;
    gameState.metaRange = DEFAULT_ACCOUNT_GAME_STATE.metaRange;
    gameState.metaDamageLevel = DEFAULT_ACCOUNT_GAME_STATE.metaDamageLevel;
    gameState.metaDamage = DEFAULT_ACCOUNT_GAME_STATE.metaDamage;
    return;
  }

  if (!tutorialProgressionBackup) return;
  gameState.towerLimits = tutorialProgressionBackup.towerLimits;
  gameState.baseHealthLevel = tutorialProgressionBackup.baseHealthLevel;
  gameState.metaRangeLevel = tutorialProgressionBackup.metaRangeLevel;
  gameState.metaRange = tutorialProgressionBackup.metaRange;
  gameState.metaDamageLevel = tutorialProgressionBackup.metaDamageLevel;
  gameState.metaDamage = tutorialProgressionBackup.metaDamage;
  tutorialProgressionBackup = null;
  saveProgress();
}

function initializeTutorialRun() {
  gameState.tutorialFocusSpotId = null;
  gameState.autoWave = false;
  gameState.globetines = 650;
  setTutorialStage('place_green');
}

function updateTutorialArmyProgress() {
  const greenCount = gameState.towers.filter(tower => tower.family === 'Glob').length;
  const redCount = gameState.towers.filter(tower => tower.family === 'Red_Glob').length;
  if (greenCount >= 3 && redCount >= 4) setTutorialStage('waves');
}

function launchTutorial(mapKey = 'gelatin_lake') {
  if (multiplayerEnabled || currentSeed) {
    showMessage(translate('tutorial_solo_required'), 'warning');
    return;
  }
  const targetMap = MAPS[mapKey] ? mapKey : 'gelatin_lake';
  gameState.map = targetMap;
  generateSpots();
  createMap();
  document.getElementById('map-selection').style.display = 'none';
  document.getElementById('mode-selection').style.display = 'none';
  selectMode('tutorial');
}

window.repeatTutorial = function() {
  if (multiplayerEnabled || currentSeed) {
    showMessage(translate('tutorial_solo_required'), 'warning');
    return;
  }
  closeModal('encyclopedia-modal');
  launchTutorial(MAPS[gameState.map] ? gameState.map : 'gelatin_lake');
};

let tutorialSkipTrigger = null;

function closeTutorialSkipDialog() {
  const modal = document.getElementById('tutorial-skip-modal');
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  modal.style.display = 'none';
  const trigger = tutorialSkipTrigger;
  tutorialSkipTrigger = null;
  if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
}

function openTutorialSkipDialog(trigger) {
  const modal = document.getElementById('tutorial-skip-modal');
  if (!modal) {
    console.error('No se pudo abrir la confirmación para saltar el tutorial: falta #tutorial-skip-modal.');
    return;
  }
  tutorialSkipTrigger = trigger instanceof HTMLElement ? trigger : document.activeElement;
  modal.hidden = false;
  modal.style.display = 'flex';
  document.getElementById('tutorial-skip-cancel')?.focus();
}

window.skipTutorial = function(event) {
  if (gameState.mode !== 'tutorial') return;
  openTutorialSkipDialog(event?.currentTarget);
};

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

let mysteryBugRecentMessages = [];

function handleLogoClick(logo) {
  gameState.logoClicks++;
  if (logo.classList.contains('login-logo') &&
      document.getElementById('login-screen')?.style.display !== 'none') {
    const clickCount = Number(localStorage.getItem('glob_placeholder_glob_login_clicks') || 0) + 1;
    if (clickCount >= 637) {
      localStorage.removeItem('glob_placeholder_glob_login_clicks');
      localStorage.setItem('glob_placeholder_glob_pending', 'true');
      const loginMessage = document.getElementById('login-msg');
      if (loginMessage) {
        loginMessage.textContent = currentLanguage === 'en'
          ? 'Secret unlocked! Sign in online to add Placeholder Glob to that account.'
          : '¡Secreto desbloqueado! Inicia sesión online para añadir Placeholder Glob a esa cuenta.';
        loginMessage.style.color = '#2ecc71';
      }
    } else {
      localStorage.setItem('glob_placeholder_glob_login_clicks', String(clickCount));
    }
  }
  logo.classList.remove('logo-click-feedback');
  void logo.offsetWidth;
  logo.classList.add('logo-click-feedback');
  setTimeout(() => logo.classList.remove('logo-click-feedback'), 650);
  logo.classList.remove('glitch-effect');
  void logo.offsetWidth;
  logo.classList.add('glitch-effect');
  logo.style.transition = 'transform 0.5s ease, filter 0.2s ease';
  const spins = Math.floor(Math.random() * 3) + 1;
  logo.style.transform = `scale(1.12) rotate(${360 * spins}deg)`;
  logo.style.filter = `hue-rotate(${Math.random() * 360}deg) invert(${Math.random() > 0.5 ? 1 : 0})`;

  setTimeout(() => {
    logo.style.transition = 'transform 0.3s ease, filter 0.3s ease';
    logo.style.transform = '';
    logo.style.filter = '';
  }, 500);

  const antiNormalRewardActive = gameState.unlockedAntiNormal;
  const specialPostVictoryMessage = antiNormalRewardActive && Math.random() < 0.2;
  const collectionMasterMessage = gameState.collectionMasterDialogueShown && Math.random() < 0.25;
  if (collectionMasterMessage) {
    showCollectionMasterDialogue();
  } else if (specialPostVictoryMessage) {
    showPostAntiNormalMysteryMessage();
  } else if (gameState.logoClicks % 5 === 0) {
    showMysteryBugWarning();
  }
  if (gameState.logoClicks === 15) {
    gameState.antiNormalActive = true;
    document.querySelectorAll('.login-box').forEach(box => box.classList.add('login-glitch-critical'));
    document.querySelectorAll('#mode-selection').forEach(screen => screen.classList.add('glitch-state'));
    const disableButton = document.getElementById('disable-antinormal-btn');
    if (disableButton) disableButton.style.display = 'block';
    showEffect(window.innerWidth / 2, 100, translate('easter_egg_corrupt'));
    showMessage(translate('system_unstable'), 'error');
    setTimeout(() => {
      document.querySelectorAll('.login-box').forEach(box => box.classList.remove('login-glitch-critical'));
    }, 1500);
  }

  function showMysteryBugWarning() {
    const messages = currentLanguage === 'en'
      ? [
        'DON’T TOUCH ME!!',
        'WORK-BOMBOT SUBMITS TO EVIL.',
        'THE GLOBS WILL BE USELESS IF YOU KEEP CLICKING.',
        'THE LOGO IS NOT THERE TO BE TOUCHED!!',
        'I’M SICK OF YOU...',
        'DID YOU KNOW YOU CAN STOP TOUCHING THE LOGO?',
        'THIS IS NOT AN ELEVATOR BUTTON!',
        'DO YOU WANT THE LOGO TO CHARGE YOU RENT?',
        'I COUNTED YOUR CLICKS... AND I DON’T LIKE THE RESULT.',
        'MY PIXELS ARE GOING ON STRIKE!',
        'KEEP THIS UP AND I’M CALLING A MODERATOR.',
        'ARE YOU OUT OF THINGS TO DO?',
        'THE LOGO SAYS NO. SO DO I.',
        'LEAVE THE LOGO ALONE, MOUSE CREATURE!',
        'I’M NOT A CLICKER. I’M A WARNING.',
        'ONE MORE CLICK AND I’M MAKING YOU READ THE MANUAL.',
        'ARE YOU TRYING TO UNLOCK SOMETHING OR JUST BORED?',
        'WORK-BOMBOT HAS FILED A FORMAL COMPLAINT.',
        'STOP! EVEN THE PYCES ARE LAUGHING.',
        'THIS LOGO HAS MORE PATIENCE THAN I DO... FOR NOW.'
      ]
      : [
        '¡NO ME TOQUES!',
        'WORK-BOMBOT SUBCUNDE A LA MALDAD.',
        'LOS GLOBS SERÁN INÚTILES SI SIGUES CLICKEANDO.',
        '¡EL LOGO NO ESTÁ PARA TOCARLO!',
        'ME TIENES HARTO...',
        '¿SABÍAS QUE PUEDES DEJAR DE TOCAR EL LOGO?',
        '¡ESTO NO ES UN BOTÓN DE ASCENSOR!',
        '¿QUIERES QUE EL LOGO TE COBRE ALQUILER?',
        'HE CONTADO TUS CLICS... Y NO ME GUSTA EL RESULTADO.',
        '¡MIS PÍXELES TIENEN HUELGA!',
        'COMO SIGAS ASÍ, LLAMO A UN MODERADOR.',
        '¿TE HAS QUEDADO SIN COSAS QUE HACER?',
        'EL LOGO DICE QUE NO. YO TAMBIÉN.',
        '¡DEJA AL LOGO EN PAZ, CRIATURA DEL RATÓN!',
        'NO SOY UN CLICKER. SOY UNA ADVERTENCIA.',
        'UN CLIC MÁS Y TE MANDO A LEER EL MANUAL.',
        '¿ESTÁS INTENTANDO DESBLOQUEAR ALGO O SOLO TE ABURRES?',
        'WORK-BOMBOT HA PRESENTADO UNA QUEJA FORMAL.',
        '¡PARA YA! HASTA LOS PYCES SE ESTÁN RIENDO.',
        'ESTE LOGO TIENE MÁS PACIENCIA QUE YO... DE MOMENTO.'
      ];
    const availableMessages = messages.filter(message => !mysteryBugRecentMessages.includes(message));
    const messagePool = availableMessages.length > 0 ? availableMessages : messages;
    const message = messagePool[Math.floor(Math.random() * messagePool.length)];
    mysteryBugRecentMessages.push(message);
    if (mysteryBugRecentMessages.length > 2) mysteryBugRecentMessages.shift();
    showNarratorMsg('omnipresent', NARRATOR_DATA.omnipresent.img, '???', message);
  }

  function showPostAntiNormalMysteryMessage() {
    const message = currentLanguage === 'en'
      ? 'IF YOU ALREADY BEAT THE MODE... WHY ARE YOU STILL TOUCHING ME?! Maybe I should find another job.'
      : 'SI YA TE PASASTE EL MODO... ¡¡PARA QUE ME TOCAS!! Quizás debería buscarme otro trabajo.';
    showNarratorMsg('omnipresent', NARRATOR_DATA.omnipresent.img, '???', message);
  }

  if (antiNormalRewardActive) {
    gameState.pycoins += 1;
    gameState.duckPassCurrency += 1;
    updateMetaUI();
    showEffect(window.innerWidth / 2, window.innerHeight / 2, "+1 PyCoin / +1 DuckPass");
  }
  saveProgress();
}

function showCollectionMasterDialogue() {
  showNarratorMsg(
    'omnipresent',
    NARRATOR_DATA.omnipresent.img,
    '???',
    currentLanguage === 'en'
      ? 'Phew, my work here is finished. Jerry, it is time to begin the digitalization and immortality collection plan.'
      : 'Bufff, se terminó mi trabajo aquí. Jerry, ya es hora de empezar con el plan de digitalización y recolección de la inmortalidad.',
    'collection-master'
  );
}

function hasAcrossTimeAccessBadges() {
  return Boolean(BADGES.unmenaced?.unlocked && BADGES.future_voyage?.unlocked);
}

function isAcrossTimeLoadoutValid() {
  const requiredFamilies = ['Glob', 'Worker_Glob', 'Soap_Glob', 'White', 'Red_Glob'];
  return Array.isArray(gameState.equippedTowers) &&
    gameState.equippedTowers.length === requiredFamilies.length &&
    gameState.equippedTowers.map(getTowerFamily).every((family, index) => family === requiredFamilies[index]);
}

function refreshAcrossTimeAppearance() {
  const map = document.getElementById('map');
  if (!map) return;
  let overlay = document.getElementById('across-time-overlay');
  if (gameState.mode !== 'acrossTheTime' || ![1, 3, 4].includes(gameState.acrossTheTimeSpace)) {
    overlay?.remove();
    return;
  }
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'across-time-overlay';
    overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:100;transition:background-color 1s ease;';
    map.appendChild(overlay);
  }
  const wave = gameState.wave || 0;
  let color = 'rgba(0, 55, 255, 0.22)';
  if (gameState.acrossTheTimeSpace === 3) {
    const alpha = wave <= 15 ? 1 : wave <= 30 ? 0.58 : 0.28;
    color = `rgba(0, 0, 0, ${alpha})`;
  } else if (gameState.acrossTheTimeSpace === 4) {
    color = 'rgba(0, 0, 0, 0.5)';
  }
  overlay.style.backgroundColor = color;
}

function clearAcrossTimePuzzleMarkers() {
  document.querySelectorAll('.across-time-puzzle-marker').forEach(marker => marker.remove());
  gameState.acrossTimePuzzleSpots = [];
}

function createAcrossTimePuzzleMarkers() {
  clearAcrossTimePuzzleMarkers();
  const map = document.getElementById('map');
  if (!map || TOWER_SPOTS.length < 17) {
    console.error('Across the Time puzzle cannot be shown: Urbanistic Road needs at least 17 tower spots.');
    showMessage(currentLanguage === 'en'
      ? 'The puzzle could not be prepared because this map has too few valid tower spots.'
      : 'No se pudo preparar el puzle porque el mapa no tiene suficientes posiciones válidas para torres.',
    'error');
    return false;
  }

  const symbols = [
    { letter: 'L', color: '#65dcff', points: [[0, 0], [0, 1], [0, 2], [1, 2]], origin: [90, 105] },
    { letter: 'X', color: '#ffdc62', points: [[0, 0], [1, 1], [2, 2], [0, 2], [2, 0]], origin: [300, 105] },
    { letter: 'T', color: '#ff7185', points: [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]], origin: [535, 105] },
    { letter: '_', color: '#c391ff', points: [[0, 0], [1, 0], [2, 0]], origin: [780, 365] }
  ];
  const usedSpots = new Set();
  symbols.forEach(symbol => {
    symbol.points.forEach(([column, row]) => {
      const targetX = symbol.origin[0] + column * 68;
      const targetY = symbol.origin[1] + row * 68;
      const spotId = TOWER_SPOTS
        .map((spot, index) => ({
          index,
          distance: Math.hypot(spot.x + 40 - targetX, spot.y + 40 - targetY)
        }))
        .filter(candidate => !usedSpots.has(candidate.index))
        .sort((a, b) => a.distance - b.distance)[0]?.index;
      if (spotId === undefined) return;
      usedSpots.add(spotId);
      gameState.acrossTimePuzzleSpots.push(spotId);
      const spot = TOWER_SPOTS[spotId];
      const marker = document.createElement('div');
      marker.className = 'across-time-puzzle-marker';
      marker.textContent = symbol.letter;
      marker.title = symbol.letter;
      marker.style.cssText = `position:absolute;left:${spot.x + 40}px;top:${spot.y + 40}px;transform:translate(-50%,-50%);width:28px;height:28px;border:2px solid ${symbol.color};border-radius:50%;background:rgba(8,12,24,.82);color:${symbol.color};font:bold 17px sans-serif;display:grid;place-items:center;z-index:90;pointer-events:none;text-shadow:0 0 6px ${symbol.color};box-shadow:0 0 8px ${symbol.color};`;
      map.appendChild(marker);
    });
  });
  refreshAcrossTimeAppearance();
  showMessage(translate('across_time_puzzle'), 'info');
  return gameState.acrossTimePuzzleSpots.length === 17;
}

function isAcrossTimePuzzleSolved() {
  return gameState.acrossTimePuzzleSpots.length === 17 &&
    gameState.acrossTimePuzzleSpots.every(spotId =>
      gameState.towers.some(tower => Number(tower.spotId) === spotId)
    );
}

function renderAcrossTimeCrystals(count, wave) {
  document.querySelectorAll('.across-time-crystal').forEach(crystal => crystal.remove());
  gameState.acrossTimeCrystals = count;
  for (let index = 0; index < count; index++) {
    let crystalHealth = 1 + Math.floor(wave / 5);
    const crystal = document.createElement('button');
    crystal.type = 'button';
    crystal.className = 'across-time-crystal';
    crystal.title = currentLanguage === 'en'
      ? `Temporal crystal (${crystalHealth} hits)`
      : `Cristal temporal (${crystalHealth} golpes)`;
    crystal.style.cssText = `position:absolute;left:${60 + Math.random() * 850}px;top:${55 + Math.random() * 460}px;width:32px;height:32px;border:0;background:transparent url('${encodeURI(IMAGE_PATHS.MiniCrystal)}') center/contain no-repeat;filter:drop-shadow(0 0 8px #69f0ff);z-index:95;cursor:pointer;`;
    crystal.onclick = event => {
      event.stopPropagation();
      crystalHealth--;
      if (crystalHealth > 0) {
        crystal.title = currentLanguage === 'en'
          ? `Temporal crystal (${crystalHealth} hits)`
          : `Cristal temporal (${crystalHealth} golpes)`;
        showEffect(parseFloat(crystal.style.left), parseFloat(crystal.style.top), '✦', '#69f0ff');
        return;
      }
      crystal.remove();
      gameState.acrossTimeCrystals = Math.max(0, gameState.acrossTimeCrystals - 1);
      showMessage(translate('across_time_crystals', { count: gameState.acrossTimeCrystals }), 'info');
      checkpointActiveRound();
    };
    document.getElementById('map').appendChild(crystal);
  }
}

function beginAcrossTimeEvent() {
  if (!canPlayAcrossTimeSolo()) {
    showMessage(translate('across_time_solo_required'), 'error');
    return;
  }
  if (!hasAcrossTimeAccessBadges()) {
    showMessage(translate('across_time_badges_required'), 'error');
    return;
  }
  if (gameState.map !== 'gelatin_lake') {
    showMessage(translate('across_time_map_required'), 'error');
    return;
  }
  if (!isAcrossTimeLoadoutValid()) {
    showMessage(translate('across_time_loadout_required'), 'error');
    return;
  }

  gameState.map = 'gelatin_lake';
  gameState.mode = 'acrossTheTime';
  gameState.modeConfirmed = true;
  gameState.maxWaves = 15;
  gameState.acrossTheTimeSpace = 1;
  gameState.acrossTimeBossReturns = 0;
  gameState.acrossTheTimeProgress = {
    ...gameState.acrossTheTimeProgress,
    started: true,
    spaceOneComplete: false,
    spaceTwoComplete: false,
    spaceThreeComplete: false,
    completed: false
  };
  document.getElementById('mode-selection').style.display = 'none';
  document.getElementById('map-selection').style.display = 'none';
  retryGame();
  gameState.acrossTheTimeSpace = 1;
  gameState.maxWaves = 15;
  document.getElementById('game-container').style.display = 'flex';
  document.getElementById('meta-controls').style.display = 'flex';
  refreshAcrossTimeAppearance();
  saveProgress();
  showAcrossTimeNarration('across_time_intro');
  showMessage(currentLanguage === 'en'
    ? 'Space I begins. Clear the temporal crystals in every wave.'
    : 'Comienza el espacio I. Limpia los cristales temporales de cada oleada.',
  'info');
}

function beginTimeAttackReplay() {
  if (!canPlayAcrossTimeSolo()) {
    showMessage(translate('across_time_solo_required'), 'error');
    return;
  }
  if (!gameState.acrossTheTimeProgress?.timeAttackUnlocked) {
    showMessage(translate('time_attack_progress_required'), 'error');
    return;
  }

  const start = {
    gelatin_lake: { space: 1, map: 'gelatin_lake' },
    urbanistic_road: { space: 2, map: 'urbanistic_road' },
    spooktacular_ruins: { space: 3, map: 'gelatin_lake' }
  }[gameState.map];
  if (!start) {
    showMessage(translate('time_attack_map_required'), 'error');
    return;
  }

  gameState.acrossTheTimeProgress.completed = false;
  if (start.space === 1) {
    gameState.acrossTheTimeProgress.spaceOneComplete = false;
    gameState.acrossTheTimeProgress.spaceTwoComplete = false;
    gameState.acrossTheTimeProgress.spaceThreeComplete = false;
  } else if (start.space === 2) {
    gameState.acrossTheTimeProgress.spaceTwoComplete = false;
    gameState.acrossTheTimeProgress.spaceThreeComplete = false;
  }
  gameState.acrossTheTimeProgress.started = true;
  gameState.acrossTheTimeSpace = start.space;
  gameState.mode = 'acrossTheTime';
  gameState.modeConfirmed = true;
  transitionAcrossTimeMap(start.space, start.map);
  document.getElementById('mode-selection').style.display = 'none';
  document.getElementById('map-selection').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
  document.getElementById('meta-controls').style.display = 'flex';
  showMessage(translate('across_time_transition'), 'success');
  saveProgress();
}

function transitionAcrossTimeMap(space, mapId, keepWave = 0) {
  const previousHealth = gameState.health;
  gameState.mode = 'acrossTheTime';
  gameState.acrossTheTimeSpace = space;
  gameState.map = mapId;
  gameState.maxWaves = space === 3 ? 45 : space === 4 ? 50 : 15;
  gameState.autoWave = false;
  const autoWaveButton = document.getElementById('auto-wave');
  if (autoWaveButton) autoWaveButton.classList.remove('active');
  generateSpots();
  createMap();
  retryGame();
  gameState.mode = 'acrossTheTime';
  gameState.modeConfirmed = true;
  gameState.acrossTheTimeSpace = space;
  gameState.maxWaves = space === 3 ? 45 : space === 4 ? 50 : 15;
  gameState.wave = keepWave;
  gameState.acrossTimeBossReturns = 0;
  gameState.acrossTimeCrystals = 0;
  gameState.acrossTimeTowerAttackTimer = 0;
  if (space === 2) gameState.globetines = 20000;
  if (space >= 3) {
    gameState.health = space === 3 && keepWave > 0 ? previousHealth : 300;
    gameState.acrossTimeTowerCaps = { ...gameState.towerLimits };
  }
  if (space === 4) showAcrossTimeNarration('across_time_final_warning');
  if (space === 2) createAcrossTimePuzzleMarkers();
  else clearAcrossTimePuzzleMarkers();
  refreshAcrossTimeAppearance();
  updateUI();
  showMessage(translate('across_time_transition'), 'warning');
  saveProgress();
}

function completeAcrossTimeEvent() {
  const progress = gameState.acrossTheTimeProgress || {};
  if (progress.completed) return;
  progress.completed = true;
  progress.timeAttackUnlocked = true;
  progress.spaceThreeComplete = true;
  gameState.acrossTheTimeProgress = progress;
  unlockBadge('across_time');
  if (!gameState.unlockedSkins.includes('virtuallity_set')) {
    gameState.unlockedSkins.push('virtuallity_set');
    showMessage(translate('across_time_reward'), 'success');
  }
  saveProgress();
  endGame(true);
  const title = document.querySelector('#game-over h2');
  const message = document.getElementById('game-over-msg');
  if (title) {
    title.removeAttribute('data-i18n');
    title.textContent = translate('across_time_victory_title');
  }
  if (message) message.innerHTML = translate('across_time_victory_msg');
  drawShop();
  updateMetaUI();
  saveProgress();
}

function handleAcrossTimeWaveCleared() {
  const progress = gameState.acrossTheTimeProgress || {};
  const wave = gameState.wave;
  const space = gameState.acrossTheTimeSpace;
  if (space === 1 && wave >= 15) {
    progress.spaceOneComplete = true;
    gameState.acrossTheTimeProgress = progress;
    transitionAcrossTimeMap(2, 'urbanistic_road');
  } else if (space === 2 && wave >= 15) {
    progress.spaceTwoComplete = true;
    gameState.acrossTheTimeProgress = progress;
    gameState.autoWave = false;
    showAcrossTimeNarration('across_time_after_space_two');
    showMessage(translate('across_time_space_two_complete'), 'success');
    saveProgress();
  } else if (space === 3 && wave === 15) {
    transitionAcrossTimeMap(3, 'urbanistic_road', wave);
  } else if (space === 3 && wave === 30) {
    transitionAcrossTimeMap(3, 'sunlight_seaside', wave);
  } else if (space === 3 && wave >= 45) {
    progress.spaceThreeComplete = true;
    gameState.acrossTheTimeProgress = progress;
    transitionAcrossTimeMap(4, 'spooktacular_ruins', wave);
  } else if (space === 4 && wave >= 50) {
    completeAcrossTimeEvent();
  } else {
    saveProgress();
  }
}

function startAcrossTimeWave() {
  if (gameState.waveActive || gameState.gameOver || gameState.paused) return;
  if (gameState.acrossTheTimeSpace === 2 && gameState.wave === 0 && !isAcrossTimePuzzleSolved()) {
    showMessage(translate('across_time_puzzle_failed'), 'error');
    return;
  }
  if (gameState.acrossTheTimeSpace === 2 && gameState.wave === 0) {
    showAcrossTimeNarration('across_time_puzzle_solved');
  }
  if (gameState.acrossTheTimeSpace === 3 && gameState.wave >= gameState.maxWaves) return;
  if (gameState.acrossTheTimeSpace === 4 && gameState.wave >= gameState.maxWaves) return;

  gameState.wave++;
  gameState.waveActive = true;
  gameState.spawningActive = true;
  gameState.roundKills = [];
  gameState.roundIExExplosions = 0;
  gameState.acrossTimeCrystals = 0;
  if (roundCheckpointInterval === null && (!currentSeed || isSeedHost)) {
    roundCheckpointInterval = setInterval(checkpointActiveRound, 5000);
  }
  refreshAcrossTimeAppearance();
  const space = gameState.acrossTheTimeSpace;
  const wave = gameState.wave;
  if (space === 3 && wave % 5 === 0 && wave % 15 !== 0) {
    showMessage(translate('across_time_threat'), 'warning');
  }
  const regularPools = {
    gelatin_lake: ['Stupid_Pyce', 'Pyce2', 'Guest_Pyce', 'Symbol_Pyce', 'Noob_Pyce', '4motions_Pyce', 'Flower_Pyce', 'SO_Pyce', 'Bomb_Pyce', 'Knight_Pyce', 'Cannon_Pycer', 'HoloPyce', 'Rebel_Pyce', 'BitY1', 'ByteGB1', 'Ren', 'Treeper', 'Broksp', 'Ghost_Pyce', 'Monster', 'Lenistal'],
    urbanistic_road: ['BitY1', 'BitG2', 'BitP3', 'BitB4', 'ByteGB1', 'ByteYP2', 'BytePG3', 'ByteYB4', 'HoloPyce', 'Rebel_Pyce', 'Strechy_Pyce', 'Bomb_Pyce', 'Knight_Pyce', 'Cannon_Pycer', 'Spyware1', 'Spyware2', 'Spyware3'],
    sunlight_seaside: ['Piz', 'Ren', 'Baby_Shrum', 'Pysh', 'Axolotl_Pyce', 'Treeper', 'Thunren', 'Shrum', 'Clown_Pysh', 'Shark_Pyce', 'Big_Treeper', 'Renibig', 'Stacked_Treepers', 'Followishers', 'Creamplet', 'Umbrella_Pyce'],
    spooktacular_ruins: ['Broksp', 'Blood_Taker', 'Pumpitch', 'RIPslide', 'Sneekmy', 'SkeleBone_Pyce', 'Ghost_Pyce', 'ZomPyce']
  };
  const commonPyces = ['Stupid_Pyce', 'Pyce2', 'Guest_Pyce', 'Symbol_Pyce', 'Noob_Pyce', '4motions_Pyce', 'Bomb_Pyce', 'Knight_Pyce'];
  const acrossIds = ['Leni_the_big_Hammer', 'Monster', 'Cristalized_Monster', 'Lenistal', 'Crystal_Bombot', 'Crystal_Pyce', 'Dreamy_SPyce', 'Astral_BPyce', 'NO_CrystEye_CB', 'AstrorbOrbe', 'AstrorbContenida', 'AstrorbTF', 'Crystalic_Orb', 'Sharowd', 'Arky', 'CrystArky', 'ArkyVoid', 'Fireflies', 'Treeper', 'Big_Treeper', 'Stacked_Treepers', 'Baby_Shrum', 'Shrum', 'Old_Fungus', 'Spyware1', 'Spyware2', 'Spyware3', 'BitY1', 'BitG2', 'BitP3', 'BitB4', 'ByteYP2', 'BytePG3', 'ByteYB4', 'ByteGB1'];
  let pool = [];
  let spawnCount = 5 + Math.floor(wave / 4);
  const bossTypes = [];

  if (space === 1) {
    pool = wave < 4
      ? ['Stupid_Pyce', 'Pyce2', 'Guest_Pyce']
      : Object.keys(ENEMY_TYPES).filter(type => !ENEMY_TYPES[type].boss && !ENEMY_TYPES[type].timeAttackOnly);
    if (wave >= 4 && Math.random() < 0.25) pool.push('Clockwork_Titan', 'DIY_Bot', 'Hatspy', 'Local_Engines', 'Untimed_Atoms');
    spawnCount = 4 + Math.floor(wave / 2);
    if (wave === 15) bossTypes.push('GODs_Shadow');
    else if (wave % 5 === 0) bossTypes.push('Arky');
  } else if (space === 2) {
    pool = regularPools.urbanistic_road;
    if (Math.random() < 0.25) pool = pool.concat(['Clockwork_Titan', 'DIY_Bot', 'Hatspy', 'Local_Engines', 'Untimed_Atoms']);
    spawnCount = 6 + Math.floor(wave / 3);
    if (wave === 10) bossTypes.push('Arky');
    if (wave === 15) bossTypes.push('MoonStar_Pyce', 'Roborb');
  } else if (space === 3) {
    const localWave = ((wave - 1) % 15) + 1;
    const segment = Math.floor((wave - 1) / 15);
    pool = segment === 0
      ? commonPyces
      : segment === 1
        ? regularPools.urbanistic_road
        : commonPyces.concat(acrossIds.filter(type => ENEMY_TYPES[type] && !ENEMY_TYPES[type].boss));
    spawnCount = 5 + Math.floor(localWave / 2);
    if (segment === 0 && localWave === 15) bossTypes.push('1x1x1x1_Pyce');
    if (segment === 1 && localWave === 15) bossTypes.push('ArkyVoid');
    if (segment === 2 && localWave === 15) bossTypes.push('DarkSpirit');
  } else {
    pool = regularPools.spooktacular_ruins.concat(commonPyces, acrossIds.filter(type => ENEMY_TYPES[type] && !ENEMY_TYPES[type].boss));
    pool.push('Clockwork_Titan', 'DIY_Bot', 'Hatspy', 'Local_Engines', 'Untimed_Atoms');
    spawnCount = 10 + Math.floor((wave - 45) * 2);
    if (wave === 48) {
      bossTypes.push(...Object.keys(ENEMY_TYPES).filter(type =>
        ENEMY_TYPES[type].boss && type !== 'GODs_Shadow' && type !== 'Roborb'
      ));
    }
    if (wave === 49) bossTypes.push('Roborb');
    if (wave === 50) bossTypes.push('GODs_Shadow');
    if (wave === 50) spawnCount = 0;
  }

  const spawnList = [];
  for (let index = 0; index < spawnCount; index++) {
    const validPool = pool.filter(type => ENEMY_TYPES[type] && (space === 4 || !ENEMY_TYPES[type].boss));
    if (validPool.length) spawnList.push(validPool[Math.floor(Math.random() * validPool.length)]);
  }
  spawnList.unshift(...bossTypes);
  gameState.waveSpawnQueue = spawnList;
  gameState.waveSpawnIndex = 0;
  gameState.waveSpawnIsBoss = bossTypes.length > 0;
  gameState.waveBossTypes = bossTypes;
  gameState.waveSpawnIntervalMs = Math.max(250, 850 - Math.min(500, wave * 15));
  if (space === 1) {
    const crystalCount = Math.min(5, 3 + Math.floor((wave - 1) / 4));
    showMessage(translate('across_time_crystals', { count: crystalCount }), 'info');
    renderAcrossTimeCrystals(crystalCount, wave);
  }
  startWaveSpawnInterval();
  updateUI();
}

function selectMode(mode) {
  if (mode === 'tutorial' && (multiplayerEnabled || currentSeed)) {
    showMessage(translate('tutorial_solo_required'), 'warning');
    return;
  }
  if (mode === 'timeAttack') {
    beginTimeAttackReplay();
    return;
  }
  if (mode === 'acrossTheTime') {
    beginAcrossTimeEvent();
    return;
  }

  if (mode === 'interstellar') {
    startInterstellarMission(gameState.map === 'sunlight_seaside');
    return;
  }

  // Anti-Normal glitch blocks ALL mode selection except normal
  if (gameState.antiNormalActive && mode !== 'normal') {
    showMessage(translate('system_corrupt_error'), 'error');
    const btn = docume