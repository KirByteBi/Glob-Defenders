// ===================== ESTADO DEL JUEGO =====================

let currentLanguage = 'es';
let backgroundMusic = null;
let musicEnabled = true;
let showHitbox = false;
let offlineModeActive = false;

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
let sessionClockInterval = null;
let sessionStartedAt = null;
let roundCheckpointInterval = null;
let nextBreakReminderAt = 2 * 60 * 60 * 1000;
let lastBreakReminderIndex = -1;
const RARE_ENEMY_WAVE_SPAWN_CHANCE = 0.3;
const BUSHI_BRELLA_MAX_SPAWNS = 3;
const BUSHI_BRELLA_SKIN_DROP_CHANCE = 0.01;
const REWAMPED_SKIN_IDS = ['rewamped_green_set', 'rewamped_red_set', 'rewamped_blue_set'];
const RGB_REWAMP_SKIN_IDS = ['green_rgb_sr', 'red_rgb_sr', 'blue_rgb_sr'];
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
  return {
    equippedTowers: Array.isArray(gameState.equippedTowers) ? [...gameState.equippedTowers] : ['Glob'],
    towerLimits: { ...gameState.towerLimits },
    avatar: gameState.profileAvatar || 'glob:Glob',
    avatarImage: avatar?.image || IMAGE_PATHS.Glob,
    avatarLabel: avatar?.label || 'Glob',
    rgbAvatar: Boolean(avatar?.rgb || border?.rainbow),
    border: gameState.profileBorder || 'default',
    borderLabel: border?.label || (currentLanguage === 'en' ? 'Classic' : 'Clásico'),
    borderColors: border?.colors || ['#8796a5', '#202833'],
    rainbowBorder: Boolean(border?.rainbow),
    duckPassLevel: Math.max(1, Number(gameState.duckPassLevel) || 1),
    duckPassXP: Math.max(0, Number(gameState.duckPassXP) || 0),
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

function createProfileAvatarImage(avatar, size, alt = '') {
  const imageUrl = getSafeProfileImageUrl(avatar?.image);
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
    }
  }, { once: true });

  if (!avatar?.rgb) return image;

  const wrapper = document.createElement('span');
  wrapper.className = 'rgb-avatar-image';
  wrapper.style.width = `${size}px`;
  wrapper.style.height = `${size}px`;
  wrapper.style.setProperty('--rgb-avatar-mask-image', `url("${imageUrl}")`);
  wrapper.appendChild(image);
  return wrapper;
}

function createMultiplayerProfileBadge(profile, size = 38) {
  const frame = document.createElement('span');
  frame.className = `multiplayer-profile-badge${profile?.rainbowBorder ? ' rainbow' : ''}${profile?.rgbAvatar ? ' rgb-avatar' : ''}`;
  frame.style.width = `${size}px`;
  frame.style.height = `${size}px`;
  const colors = getSafeProfileColors(profile);
  frame.style.setProperty('--profile-border-start', colors[0]);
  frame.style.setProperty('--profile-border-end', colors[1]);

  const image = createProfileAvatarImage({
    image: profile?.avatarImage,
    rgb: Boolean(profile?.rgbAvatar)
  }, size - 10, typeof profile?.avatarLabel === 'string' ? profile.avatarLabel : 'Glob');
  frame.appendChild(image);
  return frame;
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
        if (!nextPlayers.has(playerId)) this.dispatch('player-left', { playerCount: roster.length });
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
    this.dispatch(message.event, message.data);
  }

  async send(eventName, data, targetId = null) {
    if (!this.connected) throw new Error('La conexión con Supabase Realtime no está activa.');
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
  connection.on('game-action', action => {
    if (!multiplayerSpectator && window._applyMultiplayerAction) window._applyMultiplayerAction(action);
  });
  connection.on('spawn-enemy', data => {
    if (!multiplayerSpectator && window._spawnEnemy) window._spawnEnemy(data.enemyType, data.boss, data.forcedPath);
  });
  connection.on('show-dialog', data => {
    if (window._showNarratorMsg) window._showNarratorMsg(data.id, data.img, data.name, data.text);
  });
  updateSeedDisplay();

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
      if (state) socket.emit('update-game-state', { seed: currentSeed, state });
    }, 750);
  }
}

function sendMultiplayerAction(action) {
  if (!multiplayerSpectator && socket?.connected && currentSeed && !applyingMultiplayerAction) {
    socket.emit('game-action', { seed: currentSeed, action });
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
    ? `Glob Defenders - invitación multijugador\nSeed: ${currentSeed}\nEnlace: ${inviteUrl}\n`
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
        TOWER_SPOTS.push({ x: x - 40, y: y - 40, w: 80, h: 80 });
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
  uniquesBossSpawned: {}  // Tracks NOeye_Pyce, MoonStar_Pyce (only 1 per game)
};

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

function getTowerFamily(type) {
  const tower = TOWER_TYPES[type];
  return tower?.family || type;
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

  if (configuredLimit === 1) {
    return {
      perPlayerLimit: playerIndex >= 0 ? 1 : 0,
      sharedLimit: availablePlayers.length
    };
  }

  const playerCount = Math.max(1, availablePlayers.length);
  const baseQuota = Math.floor(matchLimit / playerCount);
  const remainingSlots = matchLimit % playerCount;
  const familySeed = `${currentSeed || ''}:${family}`;
  const rotationStart = Array.from(familySeed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % playerCount;
  const extraSlotIndex = (rotationStart + playerIndex + playerCount) % playerCount;
  const receivesExtraSlot = playerIndex >= 0 && extraSlotIndex < remainingSlots;
  const perPlayerLimit = playerIndex >= 0 ? baseQuota + (receivesExtraSlot ? 1 : 0) : 0;

  return {
    perPlayerLimit,
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
        img.src = 'img/GlobDefendersImage.png';
      });
    } else if (logoRoll < 0.30) {
      document.querySelectorAll('.game-logo').forEach(img => {
        img.src = 'img/Urban Road_Reborn Logo.png';
      });
    }
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
    towerLimits: gameState.towerLimits,
    baseHealthLevel: gameState.baseHealthLevel,
    usedCodes: gameState.usedCodes,
    unlockedSkins: gameState.unlockedSkins,
    globlandHardWins: gameState.globlandHardWins,
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
    blockQuestActive: gameState.blockQuestActive,
    blockQuestStage: gameState.blockQuestStage,
    blockQuestCompleted: gameState.blockQuestCompleted,
    blockQuestVictories: gameState.blockQuestVictories,
    blockQuestHadBlockTales: gameState.blockQuestHadBlockTales,
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
    savedRoundSnapshot: gameState.savedRoundSnapshot || null,
    hypermutatedUnlocked: gameState.hypermutatedUnlocked,
    glitchUnlocked: gameState.glitchUnlocked,
    collectionMasterDialogueShown: gameState.collectionMasterDialogueShown
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
      gameState.paracristalEnergy = progress.paracristalEnergy == null ? 100 : progress.paracristalEnergy;
      gameState.paracristalFinal = !!progress.paracristalFinal;
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
      gameState.savedRoundSnapshot = progress.savedRoundSnapshot || null;
      gameState.collectionMasterDialogueShown = !!progress.collectionMasterDialogueShown;
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
const HALLOWEEN_LOGIN_ENEMIES = new Set(['Broksp', 'Pumpitch', 'RIPslide', 'SkeleBone_Pyce']);

function getGlobDecorationType(imagePath) {
  const type = Object.keys(IMAGE_PATHS).find(key => IMAGE_PATHS[key] === imagePath && TOWER_TYPES[key]);
  return type && getTowerFamily(type) !== 'Special' ? type : null;
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
    for (let level = 0; type && level < 2; level++) {
      visibleTypes.add(type);
      const nextType = TOWER_TYPES[type].evolution;
      type = types.includes(nextType) ? nextType : null;
    }
  });
  return visibleTypes;
}

function isHalloweenLoginEnemy(imagePath) {
  return Object.keys(IMAGE_PATHS).some(type =>
    HALLOWEEN_LOGIN_ENEMIES.has(type) && IMAGE_PATHS[type] === imagePath
  );
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
    const allImages = [...new Set(Object.values(IMAGE_PATHS))];

    // For login/mode screens, exclude collab assets and check unlocks
    const isLoginScreen = (containerId === 'login-decorations' || containerId === 'mode-decorations' || containerId === 'map-decorations');
    let images = allImages;
    if (isLoginScreen) {
      const loginGlobTypes = getLoginGlobDecorationTypes();
      images = allImages.filter(p => {
        if (p === IMAGE_PATHS.Omnipresent_Glob || p === IMAGE_PATHS.Kirb_Glob) return false;
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
    const shuffledPool = [...pool];
    for (let i = shuffledPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
    }
    let clickedGlobPaths;
    try {
      const storedGlobs = JSON.parse(localStorage.getItem(HYPERMUTATED_GLOBS_KEY) || '[]');
      clickedGlobPaths = new Set(Array.isArray(storedGlobs) ? storedGlobs.filter(path => typeof path === 'string') : []);
    } catch (error) {
      console.error('No se pudo leer la lista de Globs secretos ya descubiertos:', error);
      clickedGlobPaths = new Set();
    }
    const globImagesToShow = shuffledPool.filter(path =>
      availableGlobPaths.includes(path) && !clickedGlobPaths.has(path)
    );
    const selectedGlobImages = globImagesToShow.slice(0, 8);
    const selectedImages = [...selectedGlobImages];
    const halloweenImages = shuffledPool.filter(isHalloweenLoginEnemy);
    selectedImages.push(...halloweenImages);
    for (const imagePath of shuffledPool) {
      if (selectedImages.length >= 15) break;
      if (
        !selectedImages.includes(imagePath) &&
        (!availableGlobPaths.includes(imagePath) || globImagesToShow.length <= 8)
      ) {
        selectedImages.push(imagePath);
      }
    }
    const remainingGlobImages = globImagesToShow.filter(path => !selectedGlobImages.includes(path));

    const createFloatingCharacter = imgPath => {
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
        if (img.dataset.launched) return;
        img.dataset.launched = 'true';
        recordHypermutatedDecorationClick(imgPath, availableGlobPaths);
        const isGlob = imgPath.toLowerCase().includes('glob');
        playSound(isGlob ? 'sounds/Slurp.mp3' : 'sounds/Bipbip.mp3');
        if (isHalloweenLoginEnemy(imgPath)) {
          const jumpscare = document.createElement('div');
          jumpscare.className = 'halloween-jumpscare-overlay';
          jumpscare.setAttribute('aria-hidden', 'true');
          const image = document.createElement('div');
          image.className = 'halloween-jumpscare-image';
          image.style.backgroundImage = `url('${imgPath}')`;
          jumpscare.appendChild(image);
          document.body.appendChild(jumpscare);
          img.remove();
          setTimeout(() => {
            jumpscare.remove();
            const nextGlobImage = remainingGlobImages.shift();
            if (nextGlobImage && container.isConnected) {
              container.appendChild(createFloatingCharacter(nextGlobImage));
            }
          }, 850);
          return;
        }
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
        img.style.left = `${rect.left}px`;
        img.style.top = `${rect.top}px`;
        img.style.transform = 'translate(0, 0)';
        img.style.opacity = '0.8';
        void img.offsetWidth;
        img.style.transition = 'transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1)';
        img.style.transform = `translate(${dx * distance}px, ${dy * distance}px) rotate(${360 + Math.random() * 720}deg)`;
        const removeAndRefill = () => {
          if (!img.isConnected) return;
          img.remove();
          const nextGlobImage = remainingGlobImages.shift();
          if (nextGlobImage) container.appendChild(createFloatingCharacter(nextGlobImage));
        };
        img.addEventListener('transitionend', removeAndRefill, { once: true });
        setTimeout(removeAndRefill, 800);
      };

      return img;
    };

    selectedImages.forEach(imgPath => container.appendChild(createFloatingCharacter(imgPath)));
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
    const savedLoginName = localStorage.getItem('glob_login_username');
    const savedName = localStorage.getItem('glob_username');
    offlineModeActive = localStorage.getItem('glob_offline_mode') === 'true';
    if (savedLoginName) document.getElementById('username-input').value = savedLoginName;
    else if (savedName) document.getElementById('username-input').value = savedName;
  } catch (e) { console.warn("LocalStorage no disponible"); }
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

async function startGameSession(username, offline, accountId = null) {
  cloudProgressReady = false;
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
    } catch (error) {
      activeCloudUserId = null;
      console.error('No se pudo cargar el progreso de la cuenta desde Supabase:', error);
      throw new Error(currentLanguage === 'en'
        ? 'Could not load your cloud save. Check your connection and make sure the player_progress table is set up in Supabase.'
        : 'No se pudo cargar el guardado en la nube. Comprueba la conexión y que la tabla player_progress esté creada en Supabase.');
    }
    if (cloudProgress) {
      localStorage.setItem('glob_progress_' + username, JSON.stringify(cloudProgress));
      loadProgress(username, false);
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
    if (!autoJoinAttempted && !offline && invitedSeed && /^[A-Z][A-Z0-9]{6}$/.test(invitedSeed.toUpperCase())) {
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
  setTimeout(showGame, 2000);
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

    const playerName = data.user.user_metadata?.player_name || username.trim();
    await startGameSession(playerName, false, data.user.id);
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

  try {
    await flushCloudProgressSave();
    const { data, error } = await getSupabaseClient().auth.signUp({
      email: getSupabaseAuthEmail(username),
      password,
      options: { data: { player_name: playerName } }
    });
    if (error) throw error;
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
    await startGameSession(playerName, false, data.user.id);
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

function selectMode(mode) {
  if (mode === 'interstellar') {
    startInterstellarMission(gameState.map === 'sunlight_seaside');
    return;
  }

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
  const limits = { facil: 10, normal: 15, dificil: 25, extremo: 40, infinito: 999, corrupto: 40, antiNormal: 35, interstellar: 40 };
  gameState.maxWaves = limits[mode] || 15;

  if (gameState.blockQuestActive && gameState.map === 'urbanistic_road' && ['dificil', 'extremo', 'corrupto', 'antiNormal'].includes(mode)) {
    gameState.blockQuestPending = true;
  }

  if (gameState.antiNormalActive && mode === 'normal') {
    // Require confirmation before triggering Anti-Normal via the glitch path
    const msg = currentLanguage === 'en'
      ? '⚠️ WARNING: The system is unstable.\nSelecting NORMAL may trigger Anti-Normal mode — a hidden, extremely difficult mode with no health recovery.\n\nDo you wish to continue?'
      : '⚠️ ADVERTENCIA: El sistema está inestable.\nSeleccionar NORMAL podría activar el modo Anti-Normal — un modo oculto, extremadamente difícil y sin recuperación de vida.\n\n¿Deseas continuar?';
    if (!window.confirm(msg)) return;
    gameState.mode = 'antiNormal';
    gameState.maxWaves = 35;
    document.getElementById('game-area').classList.add('anti-normal');
    showMessage(translate('anti_normal_active'), 'error');
  }

  document.getElementById('mode-selection').style.display = 'none';
  document.getElementById('mode-selection').classList.remove('glitch-state');

  retryGame();
  renderMultiplayerPlayerList(multiplayerPlayers);
  applyScale();

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

function startInterstellarMission(enableParacristalQuest) {
  closeModal('shop-modal');
  closeModal('pass-modal');
  document.getElementById('mode-selection').style.display = 'none';
  document.getElementById('map-selection').style.display = 'none';

  gameState.interstellarParacristalQuest = enableParacristalQuest;
  gameState.paracristalActive = false;
  gameState.paracristalEnergy = 100;
  gameState.paracristalAstrorbSeen = false;
  gameState.paracristalFinal = false;
  gameState.map = 'gelatin_lake';
  generateSpots();
  createMap();

  gameState.mode = 'interstellar';
  gameState.modeConfirmed = true;
  gameState.maxWaves = 40;
  retryGame();
  renderMultiplayerPlayerList(multiplayerPlayers);
  applyScale();
  gameState.health = 200;
  gameState.globetines = 500;
  updateUI();
}

function startBlockQuest() {
  if (gameState.blockQuestStarted || !gameState.blockQuestActive) return;
  gameState.blockQuestStarted = true;
  gameState.blockQuestStage = 0;
  const map = document.getElementById('map');
  if (!map) return;
  const colors = [
    { id: 'blue', color: '#278cff', label: 'AZUL' },
    { id: 'green', color: '#2ecc71', label: 'VERDE' },
    { id: 'lightgray', color: '#d8dee9', label: 'GRIS CLARO' },
    { id: 'orange', color: '#ff8c00', label: 'NARANJA' },
    { id: 'cyan', color: '#5ee7ff', label: 'AZUL CELESTE' }
  ];
  const spots = [];
  while (spots.length < colors.length) {
    const spot = { x: 80 + Math.random() * 820, y: 70 + Math.random() * 460 };
    if (spots.every(other => Math.hypot(other.x - spot.x, other.y - spot.y) > 130)) spots.push(spot);
  }
  colors.forEach((item, index) => {
    const marker = document.createElement('button');
    marker.className = 'block-quest-marker';
    marker.dataset.questIndex = index;
    marker.style.left = `${spots[index].x}px`;
    marker.style.top = `${spots[index].y}px`;
    marker.style.setProperty('--quest-color', item.color);
    marker.title = item.label;
    marker.textContent = '◆';
    marker.onclick = () => {
      if (Number(marker.dataset.questIndex) !== gameState.blockQuestStage) {
        gameState.blockQuestStage = 0;
        document.querySelectorAll('.block-quest-marker').forEach(el => el.classList.remove('found'));
        showMessage(currentLanguage === 'es' ? 'Secuencia reiniciada.' : 'Sequence reset.', 'warning');
        return;
      }
      marker.classList.add('found');
      gameState.blockQuestStage++;
      if (gameState.blockQuestStage >= colors.length) {
        document.querySelectorAll('.block-quest-marker').forEach(el => el.remove());
        gameState.blockQuestStarted = false;
        gameState.blockQuestBossPending = true;
        showMessage(currentLanguage === 'es' ? '⚔️ ¡Sharowd ha aparecido!' : '⚔️ Sharowd has appeared!', 'warning');
        spawnEnemy('Sharowd', true);
      }
      saveProgress();
    };
    map.appendChild(marker);
  });
  showMessage(currentLanguage === 'es' ? '🧱 Encuentra los colores en orden.' : '🧱 Find the colors in order.', 'info');
}

function finishBlockQuest() {
  gameState.blockQuestVictories = (gameState.blockQuestVictories || 0) + 1;
  gameState.blockQuestCompleted = true;
  gameState.blockQuestActive = false;
  if (gameState.mode === 'dificil') {
    unlockBadge('block_city');
  }
  if (gameState.blockQuestHadBlockTales || gameState.blockQuestVictories >= 2) {
    unlockBadge('old_blox_city');
  }
  gameState.unlockedSkins.push('corrupt_swords_set');
  gameState.unlockedSkins.push('heights_set');
  gameState.unlockedSkins.push('jonk_set');
  if (gameState.blockQuestVictories >= 2 || gameState.blockQuestHadBlockTales) gameState.unlockedSkins.push('old_tycoon_set');
  gameState.unlockedSkins = [...new Set(gameState.unlockedSkins)];
  showMessage(currentLanguage === 'es' ? '🎁 ¡Recompensas de Block City Quest desbloqueadas!' : '🎁 Block City Quest rewards unlocked!', 'success');
  saveProgress();
}

function spawnParacristal() {
  if (!gameState.paracristalActive || gameState.paracristalEnergy < 60 || gameState.paracristalFinal) return;
  const map = document.getElementById('map');
  if (!map || map.querySelectorAll('.paracristal').length >= 5) return;
  const astrorbPresent = gameState.enemies.some(e => e.type === 'AstrorbOrbe' || e.type === 'AstrorbContenida' || e.type === 'AstrorbTF');
  const roll = Math.random();
  const clicks = astrorbPresent && roll < 0.35 ? (roll < 0.12 ? 5 : 4) : Math.ceil(Math.random() * 3);
  const sizes = [null, 'MiniCrystal', 'Crystal', 'BigCrystal', 'MegaCrystal', 'GigaCrystal'];
  const crystal = document.createElement('button');
  crystal.className = 'paracristal';
  crystal.dataset.clicks = clicks;
  crystal.style.left = `${60 + Math.random() * 860}px`;
  crystal.style.top = `${50 + Math.random() * 500}px`;
  crystal.style.backgroundImage = `url('${encodeURI(IMAGE_PATHS[sizes[clicks]])}')`;
  crystal.title = `${clicks} ${currentLanguage === 'es' ? 'clics' : 'clicks'}`;
  crystal.onclick = event => {
    event.stopPropagation();
    const remaining = Number(crystal.dataset.clicks) - 1;
    crystal.dataset.clicks = remaining;
    crystal.classList.add('crystal-hit');
    setTimeout(() => crystal.classList.remove('crystal-hit'), 120);
    if (remaining <= 0) {
      crystal.remove();
      gameState.paracristalEnergy = Math.min(100, gameState.paracristalEnergy + clicks);
    }
  };
  map.appendChild(crystal);
}

function startParacristalDimension() {
  if (!gameState.interstellarParacristalQuest || gameState.mode !== 'interstellar') return false;
  gameState.paracristalActive = true;
  gameState.paracristalEnergy = 100;
  let energy = document.getElementById('paracristal-energy');
  if (!energy) {
    energy = document.createElement('div');
    energy.id = 'paracristal-energy';
    document.getElementById('game-container').appendChild(energy);
  }
  energy.textContent = currentLanguage === 'es' ? '💎 Energía cristalina: 100%' : '💎 Crystal energy: 100%';
  energy.style.display = 'block';
  showMessage(currentLanguage === 'es' ? '💎 La Dimensión Paralecristal se ha abierto.' : '💎 The Paralecrystal Dimension has opened.', 'info');
  return true;
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

  // Apply water background directly for Sunlight Seaside (overrides green stripes)
  if (mapKey === 'sunlight_seaside') {
    map.style.background = '#00acc1';
    map.style.backgroundImage = 'linear-gradient(160deg, #29b6cf 0%, #26c6da 40%, #00acc1 100%)';
    const gameArea = document.getElementById('game-area');
    if (gameArea) {
      gameArea.style.background = '#00acc1';
      gameArea.style.backgroundImage = 'linear-gradient(160deg, #29b6cf 0%, #26c6da 40%, #00acc1 100%)';
    }
    // Islands FIRST so paths render on top of them
    if (mapData.islandZones) {
      mapData.islandZones.forEach(island => {
        const el = document.createElement('div');
        el.className = 'sand-island';
        el.style.left = `${island.x}px`; el.style.top = `${island.y}px`;
        el.style.width = `${island.w}px`; el.style.height = `${island.h}px`;
        map.appendChild(el);
      });
    }
  } else {
    // Clear any inline styles from a previous SS map
    map.style.background = '';
    map.style.backgroundImage = '';
    const gameArea = document.getElementById('game-area');
    if (gameArea) { gameArea.style.background = ''; gameArea.style.backgroundImage = ''; }
  }

  mapData.pathSegments.forEach(p => {
    const el = document.createElement('div');
    el.className = 'path-segment';
    if (mapKey === 'urbanistic_road') el.classList.add('urban-path');
    if (mapKey === 'sunlight_seaside') el.classList.add('seaside-path');
    if (mapKey === 'spooktacular_ruins') {
      el.classList.add('spook-path');
      if (p.intersection) el.classList.add('spook-crossing');
    }
    el.style.left = `${p.x}px`; el.style.top = `${p.y}px`;
    el.style.width = `${p.w}px`; el.style.height = `${p.h}px`;
    if (p.clipPath) el.style.clipPath = p.clipPath;
    map.appendChild(el);
  });

  if (mapKey === 'spooktacular_ruins') {
    mapData.enemyPaths.forEach(path => {
      path.slice(1).forEach((end, index) => {
        const start = path[index];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const segment = document.createElement('div');
        segment.className = 'spook-road-segment';
        segment.style.left = `${(start.x + end.x) / 2}px`;
        segment.style.top = `${(start.y + end.y) / 2}px`;
        segment.style.width = `${Math.hypot(dx, dy)}px`;
        segment.style.transform = `translate(-50%, -50%) rotate(${Math.atan2(dy, dx)}rad)`;
        map.appendChild(segment);
      });
    });
    (mapData.roadIntersections || []).forEach(point => {
      const crossing = document.createElement('div');
      crossing.className = 'spook-road-diamond';
      crossing.style.left = `${point.x}px`;
      crossing.style.top = `${point.y}px`;
      map.appendChild(crossing);
    });
  }

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

  // Cambiar la base visualmente
  const allyBase = document.getElementById('ally-base');
  const enemyBase = document.getElementById('forest-base');
  const enemyBase2 = document.getElementById('forest-base-2');
  const oldSecondAllyBase = document.getElementById('ally-base-2');
  if (oldSecondAllyBase) oldSecondAllyBase.remove();

  map.classList.remove('urban-map', 'sunlight-map', 'spook-map');
  if (allyBase) {
    allyBase.classList.remove('casino-base', 'boat-base', 'spook-oasis-base');
    allyBase.style.left = '';
    allyBase.style.right = '';
    allyBase.style.top = '';
  }
  if (enemyBase) {
    enemyBase.classList.remove('tunnel-base', 'raft-base', 'spook-pyramid-base');
    enemyBase.style.left = '';
    enemyBase.style.top = '';
    enemyBase.style.display = '';
  }
  if (enemyBase2) {
    enemyBase2.classList.remove('tunnel-base', 'raft-base', 'spook-pyramid-base');
    enemyBase2.style.display = 'none';
    enemyBase2.style.left = '';
    enemyBase2.style.top = '';
  }

  const gameArea = document.getElementById('game-area');
  if (gameArea) gameArea.classList.remove('sunlight-map', 'spook-map');

  if (mapKey === 'urbanistic_road') {
    map.classList.add('urban-map');
    if (allyBase) {
      allyBase.classList.add('casino-base');
      allyBase.title = "Base aliada: Gambling Gaming Casino";
    }
    if (enemyBase) {
      enemyBase.classList.add('tunnel-base');
      enemyBase.textContent = '';
    }
  } else if (mapKey === 'sunlight_seaside') {
    map.classList.add('sunlight-map');
    if (gameArea) gameArea.classList.add('sunlight-map');
    if (allyBase) {
      allyBase.classList.add('boat-base');
      allyBase.title = "Base aliada: Barca";
    }
    if (enemyBase) {
      enemyBase.classList.add('raft-base');
      enemyBase.textContent = '⛵';
      enemyBase.title = "Base enemiga: Balsa";
    }
    if (enemyBase2) {
      enemyBase2.classList.add('raft-base');
      enemyBase2.textContent = '⛵';
      enemyBase2.title = "Base enemiga: Balsa 2";
      enemyBase2.style.display = 'flex';
      
      // Position base 1 and base 2 dynamically
      enemyBase.style.top = '120px';
      enemyBase.style.left = '20px';
      enemyBase2.style.top = '420px';
      enemyBase2.style.left = '20px';
    }
  } else if (mapKey === 'spooktacular_ruins') {
    map.classList.add('spook-map');
    if (gameArea) gameArea.classList.add('spook-map');
    if (allyBase) {
      allyBase.classList.add('spook-oasis-base');
      allyBase.title = 'Base aliada: Oasis nororiental';
      allyBase.style.left = '894px';
      allyBase.style.right = 'auto';
      allyBase.style.top = '5px';
    }
    if (gameArea) {
      const secondAllyBase = document.createElement('div');
      secondAllyBase.id = 'ally-base-2';
      secondAllyBase.className = 'spook-oasis-base';
      secondAllyBase.title = 'Base aliada: Oasis suroriental';
      secondAllyBase.style.left = '894px';
      secondAllyBase.style.top = '420px';
      gameArea.appendChild(secondAllyBase);
    }
    if (enemyBase) {
      enemyBase.classList.add('spook-pyramid-base');
      enemyBase.textContent = '';
      enemyBase.title = 'Base enemiga: Pirámide noroccidental';
      enemyBase.style.left = '0px';
      enemyBase.style.top = '50px';
    }
    if (enemyBase2) {
      enemyBase2.classList.add('spook-pyramid-base');
      enemyBase2.textContent = '';
      enemyBase2.title = 'Base enemiga: Pirámide suroccidental';
      enemyBase2.style.left = '0px';
      enemyBase2.style.top = '320px';
      enemyBase2.style.display = 'flex';
    }
  } else {
    // Default Gelatin Lake
    if (allyBase) {
      allyBase.title = "Base aliada: Edificio Gris";
    }
    if (enemyBase) {
      enemyBase.textContent = '🌲';
      enemyBase.title = "Base enemiga: Bosque";
      enemyBase.style.top = '';
      enemyBase.style.left = '';
    }
    if (enemyBase2) {
      enemyBase2.style.top = '';
      enemyBase2.style.left = '';
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
    localStorage.removeItem(HYPERMUTATED_CLICK_KEY);
    localStorage.removeItem(HYPERMUTATED_GLOBS_KEY);
    localStorage.removeItem(HYPERMUTATED_PENDING_KEY);
    alert(translate('reset_done') || "Progreso completamente reseteado.");
    location.reload();
  }
}

function openOptions() {
  checkGlitchEffectUnlock();
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
  const optMetaEmojis = document.getElementById('opt-meta-emojis');
  if (optMetaEmojis) optMetaEmojis.checked = !!gameState.settings.metaEmojis;
  const optFullscreen = document.getElementById('opt-fullscreen-map');
  if (optFullscreen) optFullscreen.checked = !!gameState.settings.fullscreenMap;
  const optAutoEn = document.getElementById('opt-auto-english');
  if (optAutoEn) optAutoEn.checked = !!gameState.settings.autoEnglish;
  const optHideDate = document.getElementById('opt-hide-date');
  if (optHideDate) optHideDate.checked = !!gameState.settings.hideDate;
  const hitboxCheck = document.getElementById('opt-show-hitbox');
  if (hitboxCheck) hitboxCheck.checked = showHitbox;
  const hypermutatedSection = document.getElementById('hypermutated-settings');
  const hypermutatedCheck = document.getElementById('opt-hypermutated');
  const canUseSpecialEffects = gameState.debugState === 'unlocked';
  const canUseHypermutated = gameState.hypermutatedUnlocked || canUseSpecialEffects;
  const canUseGlitch = gameState.glitchUnlocked || canUseSpecialEffects;
  if (hypermutatedSection) hypermutatedSection.style.display = canUseHypermutated || canUseGlitch ? '' : 'none';
  const hypermutatedRow = document.getElementById('hypermutated-effect-row');
  if (hypermutatedRow) hypermutatedRow.style.display = canUseHypermutated ? '' : 'none';
  if (hypermutatedCheck) hypermutatedCheck.checked = canUseHypermutated && !!gameState.settings.hypermutatedEffect;
  const glitchRow = document.getElementById('glitch-effect-row');
  if (glitchRow) glitchRow.style.display = canUseGlitch ? '' : 'none';
  const glitchCheck = document.getElementById('opt-glitch');
  if (glitchCheck) glitchCheck.checked = canUseGlitch && !!gameState.settings.glitchEffect;

  const cheatedRow = document.getElementById('admin-cheated-row');
  const adminSection = document.getElementById('admin-section');
  if (cheatedRow) {
    cheatedRow.style.display = gameState.adminMode ? 'flex' : 'none';
  }
  if (adminSection) {
    adminSection.style.display = gameState.adminMode ? 'block' : 'none';
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

function showAntiNormalWarning(onConfirm) {
  // Remove old if exists
  const old = document.getElementById('antinormal-warning-overlay');
  if (old) old.remove();

  const isEs = currentLanguage === 'es';

  const overlay = document.createElement('div');
  overlay.id = 'antinormal-warning-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 99999;
    display: flex; align-items: center; justify-content: center;
    background: radial-gradient(ellipse at center, rgba(20,0,40,0.97) 0%, rgba(0,0,0,0.99) 100%);
    backdrop-filter: blur(8px);
    animation: antinormal-fadein 0.3s ease;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background: linear-gradient(145deg, #0d0d1a 0%, #1a0a2e 50%, #0d1a1a 100%);
    border: 2px solid rgba(150,0,255,0.5);
    border-radius: 20px;
    padding: 36px 40px 30px;
    max-width: 480px;
    width: 90%;
    text-align: center;
    box-shadow: 0 0 60px rgba(100,0,200,0.4), 0 0 120px rgba(0,200,200,0.1), inset 0 0 40px rgba(50,0,100,0.3);
    position: relative;
    overflow: hidden;
    animation: antinormal-slidein 0.35s cubic-bezier(0.175,0.885,0.32,1.275);
  `;

  // Glitch lines decoration
  const glitch1 = document.createElement('div');
  glitch1.style.cssText = `
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, #9b00ff, #00ffee, transparent);
    animation: antinormal-scan 2s linear infinite;
  `;
  box.appendChild(glitch1);

  const icon = document.createElement('div');
  icon.style.cssText = `font-size: 3.5rem; margin-bottom: 10px; filter: drop-shadow(0 0 15px rgba(150,0,255,0.8)); animation: antinormal-pulse 1.5s ease-in-out infinite;`;
  icon.textContent = '🌑';
  box.appendChild(icon);

  const title = document.createElement('div');
  title.style.cssText = `font-size: 1.05rem; font-weight: 900; letter-spacing: 3px; color: #c060ff; text-transform: uppercase; text-shadow: 0 0 20px rgba(150,0,255,0.9); margin-bottom: 6px;`;
  title.textContent = isEs ? '⚠ MODO ANTI-NORMAL ⚠' : '⚠ ANTI-NORMAL MODE ⚠';
  box.appendChild(title);

  const divider = document.createElement('div');
  divider.style.cssText = `width: 60%; height: 1px; background: linear-gradient(90deg, transparent, rgba(150,0,255,0.6), transparent); margin: 10px auto 18px;`;
  box.appendChild(divider);

  const desc = document.createElement('p');
  desc.style.cssText = `font-size: 0.92rem; color: #d0c0e8; line-height: 1.6; margin-bottom: 8px;`;
  desc.textContent = isEs
    ? 'El modo Anti-Normal es un modo complicado. Si quieres tirar hacia atrás, aún puedes hacerlo.'
    : 'Anti-Normal mode is a complicated mode. If you want to back out, you still can.';
  box.appendChild(desc);

  const question = document.createElement('p');
  question.style.cssText = `font-size: 1.05rem; font-weight: 800; color: #ffffff; text-shadow: 0 0 12px rgba(255,80,80,0.8); margin: 14px 0 24px;`;
  question.textContent = isEs ? '¿Estás SEGURO de iniciar Anti-Normal?' : 'Are you SURE you want to start Anti-Normal?';
  box.appendChild(question);

  const btnRow = document.createElement('div');
  btnRow.style.cssText = `display: flex; gap: 14px; justify-content: center;`;

  const btnConfirm = document.createElement('button');
  btnConfirm.style.cssText = `
    padding: 12px 30px; border: none; border-radius: 10px; cursor: pointer; font-size: 1rem; font-weight: 800; letter-spacing: 1px;
    background: linear-gradient(135deg, #7b00ff, #c000c0);
    color: #fff; box-shadow: 0 0 20px rgba(120,0,255,0.6); transition: all 0.2s; text-transform: uppercase;
  `;
  btnConfirm.textContent = isEs ? 'Aceptar' : 'Accept';
  btnConfirm.onmouseenter = () => { btnConfirm.style.transform = 'scale(1.07)'; btnConfirm.style.boxShadow = '0 0 30px rgba(150,0,255,0.9)'; };
  btnConfirm.onmouseleave = () => { btnConfirm.style.transform = ''; btnConfirm.style.boxShadow = '0 0 20px rgba(120,0,255,0.6)'; };
  btnConfirm.onclick = () => { overlay.remove(); onConfirm(); };

  const btnCancel = document.createElement('button');
  btnCancel.style.cssText = `
    padding: 12px 30px; border: 1px solid rgba(150,150,200,0.4); border-radius: 10px; cursor: pointer; font-size: 1rem; font-weight: 700;
    background: rgba(255,255,255,0.07); color: #aaa; transition: all 0.2s;
  `;
  btnCancel.textContent = isEs ? 'Cancelar' : 'Cancel';
  btnCancel.onmouseenter = () => { btnCancel.style.background = 'rgba(255,255,255,0.14)'; btnCancel.style.color = '#fff'; };
  btnCancel.onmouseleave = () => { btnCancel.style.background = 'rgba(255,255,255,0.07)'; btnCancel.style.color = '#aaa'; };
  btnCancel.onclick = () => overlay.remove();

  btnRow.appendChild(btnConfirm);
  btnRow.appendChild(btnCancel);
  box.appendChild(btnRow);
  overlay.appendChild(box);

  // Inject keyframes if not present
  if (!document.getElementById('antinormal-styles')) {
    const style = document.createElement('style');
    style.id = 'antinormal-styles';
    style.textContent = `
      @keyframes antinormal-fadein { from { opacity:0 } to { opacity:1 } }
      @keyframes antinormal-slidein { from { transform:scale(0.7) translateY(30px); opacity:0 } to { transform:scale(1) translateY(0); opacity:1 } }
      @keyframes antinormal-scan { 0%{opacity:0;transform:translateX(-100%)} 50%{opacity:1} 100%{opacity:0;transform:translateX(100%)} }
      @keyframes antinormal-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
    `;
    document.head.appendChild(style);
  }

  // Close on overlay click
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
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
    unlockedInfinite: gameState.unlockedInfinite,
    unlockedInterstellar: gameState.unlockedInterstellar,
    towerTypes: Object.fromEntries(Object.keys(TOWER_TYPES).map(type => [type, TOWER_TYPES[type].unlocked])),
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
  Object.keys(TOWER_TYPES).forEach(type => { TOWER_TYPES[type].unlocked = true; });
  gameState.unlockedInfinite = true;
  gameState.unlockedInterstellar = true;
  gameState.pycoins = 999999;
  gameState.duckPassCurrency = 999999;
  gameState.duckPassXP = 999999;
  gameState.duckPassLevel = 100;

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
  gameState.unlockedInfinite = !!backup.unlockedInfinite;
  gameState.unlockedInterstellar = !!backup.unlockedInterstellar;
  Object.keys(TOWER_TYPES).forEach(type => {
    if (backup.towerTypes[type] !== undefined) TOWER_TYPES[type].unlocked = backup.towerTypes[type];
  });

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
function applyMetaButtonMode() {
  const iconOnly = !!gameState.settings.metaEmojis;
  document.body.classList.toggle('meta-emojis-only', iconOnly);
  document.querySelectorAll('.meta-btn-text').forEach(text => {
    text.hidden = iconOnly;
  });
}

function isOwnerDebugUser() {
  const role = getSessionUserRole();
  return role === 'OWNER' || role === 'DEVBUILD';
}

function ownerUnlockEverything() {
  Object.keys(TOWER_TYPES).forEach(type => { TOWER_TYPES[type].unlocked = true; });
  Object.values(SKINS_DATA).forEach(skins => skins.forEach(skin => {
    if (skin.id && !gameState.unlockedSkins.includes(skin.id)) gameState.unlockedSkins.push(skin.id);
  }));
  Object.keys(BADGES).forEach(key => {
    BADGES[key].unlocked = true;
    if (!gameState.claimedRewards.includes(key)) gameState.claimedRewards.push(key);
  });
  gameState.unlockedInfinite = true;
  gameState.unlockedInterstellar = true;
  gameState.duckPassLevel = Math.max(gameState.duckPassLevel, 100);
  Object.keys(ENEMY_TYPES).forEach(type => {
    const target = typeof getPyceKillTarget === 'function' ? getPyceKillTarget(type) : 9999;
    gameState.pycesKilled[type] = Math.max(gameState.pycesKilled[type] || 0, target);
  });
  drawBadges();
  drawTowerShop();
  updateMetaUI();
}

function showOwnerDebugPanel() {
  const role = getSessionUserRole();
  if (role !== 'OWNER' && role !== 'DEVBUILD') return;
  const panel = document.getElementById('owner-debug-panel');
  if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function normalizeDebugSearch(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/gi, ' ')
    .trim()
    .toUpperCase();
}

function getDebugPathTerms(path) {
  return String(path || '')
    .split(/[\\/()._-]+/)
    .map(normalizeDebugSearch)
    .filter(Boolean);
}

function debugSearchScore(query, values) {
  if (String(query || '').trim() === '???' && values.some(value => String(value || '').trim() === '???')) return 1001;
  const needle = normalizeDebugSearch(query);
  if (!needle) return 1;
  const haystack = values.map(normalizeDebugSearch).join(' ');
  if (haystack === needle) return 1000;
  if (haystack.startsWith(needle)) return 800;
  if (haystack.includes(needle)) return 600;
  let score = 0;
  let cursor = 0;
  for (const character of needle) {
    const index = haystack.indexOf(character, cursor);
    if (index === -1) return 0;
    score += index === cursor ? 8 : 2;
    cursor = index + 1;
  }
  return score;
}

const DEBUG_ENEMY_GROUP_ALIASES = {
  pyces: ['Stupid_Pyce', 'Pyce2', 'Guest_Pyce', 'Symbol_Pyce', 'Noob_Pyce', '4motions_Pyce', 'Flower_Pyce', 'SO_Pyce', '1x1x1x1_Pyce', 'NOeye_Pyce', 'MoonStar_Pyce', 'Stupid_GoldPyce', 'Mimic_Pyce', 'Bomb_Pyce', 'Knight_Pyce', 'Cannon_Pycer', 'HoloPyce', 'Strechy_Pyce', 'Rebel_Pyce', 'Crystal_Pyce', 'Dreamy_SPyce', 'Astral_BPyce', 'Axolotl_Pyce', 'Shark_Pyce', 'Umbrella_Pyce'],
  enemigos: ['Stupid_Pyce', 'Pyce2', 'Guest_Pyce', 'Symbol_Pyce', 'Noob_Pyce', '4motions_Pyce', 'Flower_Pyce', 'SO_Pyce', 'Bomb_Pyce', 'Knight_Pyce', 'Cannon_Pycer', 'HoloPyce', 'Strechy_Pyce', 'Rebel_Pyce', 'Axolotl_Pyce', 'Shark_Pyce', 'Umbrella_Pyce'],
  bits: ['BitY1', 'BitB4', 'BitG2', 'BitP3'],
  bytes: ['ByteGB1', 'ByteYP2', 'BytePG3', 'ByteYB4'],
  spyware: ['Spyware', 'Spyware1', 'Spyware2', 'Spyware3'],
  arky: ['Arky', 'CrystArky', 'ArkyVoid'],
  astrorb: ['AstrorbOrbe', 'AstrorbContenida', 'AstrorbTF', 'Crystalic_Orb'],
  crystals: ['Crystal_Pyce', 'Dreamy_SPyce', 'Astral_BPyce', 'Cristalized_Monster', 'Lenistal', 'Crystal_Bombot', 'NO_CrystEye_CB', 'Crystalic_Orb'],
  cristalizados: ['Crystal_Pyce', 'Dreamy_SPyce', 'Astral_BPyce', 'Cristalized_Monster', 'Lenistal', 'Crystal_Bombot', 'NO_CrystEye_CB', 'Crystalic_Orb'],
  treepers: ['Treeper', 'Big_Treeper', 'Stacked_Treepers'],
  trees: ['Treeper', 'Big_Treeper', 'Stacked_Treepers'],
  arboles: ['Treeper', 'Big_Treeper', 'Stacked_Treepers'],
  shrums: ['Baby_Shrum', 'Shrum', 'Old_Fungus'],
  mushrooms: ['Baby_Shrum', 'Shrum', 'Old_Fungus'],
  hongos: ['Baby_Shrum', 'Shrum', 'Old_Fungus'],
  rens: ['Ren', 'Thunren', 'Renibig'],
  pysh: ['Pysh', 'Clown_Pysh'],
  water: ['Axolotl_Pyce', 'Shark_Pyce', 'Umbrella_Pyce'],
  aquatic: ['Axolotl_Pyce', 'Shark_Pyce', 'Umbrella_Pyce'],
  acuaticos: ['Axolotl_Pyce', 'Shark_Pyce', 'Umbrella_Pyce'],
  bosses: ['1x1x1x1_Pyce', 'NOeye_Pyce', 'MoonStar_Pyce', 'Arky', 'CrystArky', 'ArkyVoid', 'AstrorbOrbe', 'AstrorbContenida', 'AstrorbTF', 'Crystalic_Orb', 'Sharowd', 'PhantKeeper', 'GlitchKeeper', 'DarkSpirit', 'Old_Fungus', 'Crystal_Bombot'],
  jefes: ['1x1x1x1_Pyce', 'NOeye_Pyce', 'MoonStar_Pyce', 'Arky', 'CrystArky', 'ArkyVoid', 'AstrorbOrbe', 'AstrorbContenida', 'AstrorbTF', 'Crystalic_Orb', 'Sharowd', 'PhantKeeper', 'GlitchKeeper', 'DarkSpirit', 'Old_Fungus', 'Crystal_Bombot'],
  gambling: ['BitY1', 'BitB4', 'BitG2', 'BitP3', 'ByteGB1', 'ByteYP2', 'BytePG3', 'ByteYB4', 'Fireflies', 'Spyware', 'Spyware1', 'Spyware2', 'Spyware3', 'Arky', 'CrystArky', 'ArkyVoid'],
  urban: ['BitY1', 'BitB4', 'BitG2', 'BitP3', 'ByteGB1', 'ByteYP2', 'BytePG3', 'ByteYB4', 'Fireflies', 'Spyware', 'Spyware1', 'Spyware2', 'Spyware3', 'Arky', 'CrystArky', 'ArkyVoid', 'Bomb_Pyce', 'Knight_Pyce', 'Cannon_Pycer', 'HoloPyce', 'Strechy_Pyce', 'Rebel_Pyce'],
  leafy: ['Ren', 'Thunren', 'Renibig', 'Treeper', 'Big_Treeper', 'Stacked_Treepers', 'Baby_Shrum', 'Shrum', 'Old_Fungus', 'Pysh', 'Clown_Pysh', 'Axolotl_Pyce', 'Shark_Pyce', 'Umbrella_Pyce', 'Piz', 'Followishers', 'Creamplet', 'PhantKeeper', 'GlitchKeeper', 'DarkSpirit', 'Bushi_Brella'],
  playa: ['Ren', 'Thunren', 'Renibig', 'Treeper', 'Big_Treeper', 'Stacked_Treepers', 'Baby_Shrum', 'Shrum', 'Old_Fungus', 'Pysh', 'Clown_Pysh', 'Axolotl_Pyce', 'Shark_Pyce', 'Umbrella_Pyce', 'Piz', 'Followishers', 'Creamplet', 'PhantKeeper', 'GlitchKeeper', 'DarkSpirit', 'Bushi_Brella'],
  interstellar: ['Leni_the_big_Hammer', 'Monster', 'Cristalized_Monster', 'Lenistal', 'Crystal_Bombot', 'Crystal_Pyce', 'Dreamy_SPyce', 'Astral_BPyce', 'NO_CrystEye_CB', 'AstrorbOrbe', 'AstrorbContenida', 'AstrorbTF', 'Crystalic_Orb'],
  mimics: ['Stupid_GoldPyce', 'Mimic_Pyce', 'Bushi_Brella']
};

const DEBUG_SPEAKER_ALIASES = {
  omnipresent: ['???', 'omnipresent', 'omnipresent glob'],
  mysterybug: ['mysterybug', 'mystery bug'],
  jerry: ['jerry'],
  mysterybug_custom: ['mysterybug', 'mystery bug'],
  astral_exclamation: ['astralexclamation', 'astral exclamation'],
  error_entity: ['error', '3rr0r'],
  login_guy: ['loginguy', 'login guy'],
  bombot: ['bombot', 'robot', 'maquina', 'máquina', 'work', 'trabajo'],
  glob: ['glob', 'defensor', 'defender', 'verde'],
  stupid: ['stupid', 'torpe', 'pyce'],
  pyce2: ['pyce2', 'pyce', 'visitante'],
  noeye: ['noeye', 'ojo', 'materia', 'oscura', 'dark matter'],
  moonstar: ['moonstar', 'luna', 'estrellas', 'jefe', 'boss'],
  mimic: ['mimic', 'copia', 'imitador'],
  arky: ['arky', 'urban', 'bit', 'boss', 'jefe'],
  crystarky: ['crystarky', 'cristal', 'arky', 'anti normal'],
  arkyvoid: ['arkyvoid', 'vacio', 'void', 'arky', 'boss'],
  one_x: ['1x1x1x1', 'one x', 'uno', 'corrupto', 'jefe', 'boss'],
  astrorb: ['astrorb', 'orb', 'orbe', 'interstellar', 'interestelar']
};

function getSpeakerDebugAliases(id, data, languageData) {
  return [
    id,
    languageData.name,
    data.img,
    ...getDebugPathTerms(data.img),
    ...(DEBUG_SPEAKER_ALIASES[id] || [])
  ];
}

function getEnemyDebugAliases(id, enemy) {
  const aliases = [
    id,
    enemy.name,
    enemy.desc,
    enemy.image,
    ...getDebugPathTerms(enemy.image)
  ];
  Object.entries(DEBUG_ENEMY_GROUP_ALIASES).forEach(([alias, ids]) => {
    if (ids.includes(id)) aliases.push(alias);
  });
  return aliases;
}

function renderDebugSearchResults(container, results, onSelect, selectedId) {
  if (!container) return;
  container.innerHTML = '';
  results.slice(0, 30).forEach(result => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.resultId = result.id;
    button.className = `debug-search-result${result.id === selectedId ? ' selected' : ''}`;
    if (result.image) {
      const image = document.createElement('img');
      image.src = result.image;
      image.alt = '';
      button.appendChild(image);
    }
    const label = document.createElement('span');
    label.textContent = result.label;
    button.appendChild(label);
    button.addEventListener('click', () => onSelect(result));
    container.appendChild(button);
  });
}

function setupOwnerDebugTools() {
  const enemySearch = document.getElementById('debug-enemy-search');
  const enemyResults = document.getElementById('debug-enemy-results');
  const spawnEnemyButton = document.getElementById('debug-spawn-enemy');
  const speakerSearch = document.getElementById('debug-speaker-search');
  const speakerResults = document.getElementById('debug-speaker-results');
  const dialogueText = document.getElementById('debug-dialogue-text');
  const showDialogueButton = document.getElementById('debug-show-dialogue');
  const mysteryBugOptions = document.getElementById('debug-mysterybug-options');
  const mysteryBugName = document.getElementById('debug-mysterybug-name');
  const mysteryBugImage = document.getElementById('debug-mysterybug-image');
  let selectedEnemy = null;
  let selectedSpeaker = null;
  const savedMysteryBugName = localStorage.getItem('glob_mysterybug_name');
  const savedMysteryBugImage = localStorage.getItem('glob_mysterybug_image');
  if (mysteryBugName && savedMysteryBugName) mysteryBugName.value = savedMysteryBugName;
  const mysteryBugImageOptions = [
    'img/Sellos/MysteryBug.png|blacked-out',
    'img/Sellos/MysteryBug.png',
    'img/Sellos/AstralExclamation.png|blacked-out',
    'img/Sellos/AstralExclamation.png',
    'Misiones (2026)/Elementos/ZONESUBJECT.gif|blacked-out',
    'Misiones (2026)/Elementos/ZONESUBJECT.gif'
  ];
  if (mysteryBugImage && mysteryBugImageOptions.includes(savedMysteryBugImage)) {
    mysteryBugImage.value = savedMysteryBugImage;
  }
  const updateMysteryBugOptions = () => {
    const hasMysteryBugSelected = Boolean(
      selectedSpeaker &&
      selectedSpeaker.id === 'mysterybug' &&
      !selectedSpeaker.isFallback
    );
    mysteryBugOptions.hidden = !hasMysteryBugSelected;
  };
  const mysteryBugSearchAliases = [
    'mysterybug',
    'mysterybug_custom',
    'jerry',
    'astral_exclamation',
    'astralexclamation',
    'error_entity',
    'error',
    'login_guy',
    'loginguy'
  ];

  setupOwnerDebugPanelDrag();

  const searchEnemies = () => {
    const query = enemySearch.value;
    const results = Object.entries(ENEMY_TYPES)
      .map(([id, enemy]) => ({
        id,
        image: enemy.image,
        label: translate(enemy.name || `enemy_${id}_name`) || id,
        score: debugSearchScore(query, getEnemyDebugAliases(id, enemy))
      }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
    renderDebugSearchResults(enemyResults, results, result => {
      selectedEnemy = result;
      spawnEnemyButton.disabled = false;
      renderDebugSearchResults(enemyResults, results, value => {
        selectedEnemy = value;
        spawnEnemyButton.disabled = false;
        searchEnemies();
      }, selectedEnemy.id);
    }, selectedEnemy && selectedEnemy.id);
  };

  const searchSpeakers = () => {
    const query = speakerSearch.value;
    const narratorData = typeof NARRATOR_DATA === 'object' ? NARRATOR_DATA : {};
    const registeredSpeakers = Object.entries(narratorData)
      .filter(([id]) => id === 'mysterybug' || !mysteryBugSearchAliases.includes(id))
      .map(([id, data]) => {
        const languageData = data[currentLanguage] || data.es || data.en || {};
        const mysteryBugLabel = mysteryBugName?.value.trim() || 'MysteryBug';
        return {
          id,
          image: data.img,
          label: id === 'mysterybug' ? mysteryBugLabel : (languageData.name || id),
          isFallback: false,
          score: debugSearchScore(
            query,
            id === 'mysterybug'
              ? [...getSpeakerDebugAliases(id, data, languageData), mysteryBugLabel, ...mysteryBugSearchAliases]
              : getSpeakerDebugAliases(id, data, languageData)
          )
        };
      });
    const registeredSpeakerImages = new Set(
      Object.values(narratorData)
        .map(data => data.img)
        .filter(Boolean)
    );
    const fallbackSpeakers = [
      ...Object.entries(typeof ENEMY_TYPES === 'object' ? ENEMY_TYPES : {}).map(([id, enemy]) => ({
        id,
        image: enemy.image,
        label: translate(enemy.name) || id,
        aliases: getEnemyDebugAliases(id, enemy)
      })),
      ...Object.entries(typeof TOWER_TYPES === 'object' ? TOWER_TYPES : {}).map(([id, tower]) => ({
        id,
        image: tower.image,
        label: translate(tower.name) || id,
        aliases: getEnemyDebugAliases(id, tower)
      }))
    ]
      .filter(speaker => !narratorData[speaker.id] && !registeredSpeakerImages.has(speaker.image))
      .map(speaker => ({
        id: speaker.id,
        image: speaker.image,
        label: speaker.label,
        isFallback: true,
        score: debugSearchScore(query, speaker.aliases)
      }));
    const results = [...registeredSpeakers, ...fallbackSpeakers]
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));

    if (!results.some(result => result.id === (selectedSpeaker && selectedSpeaker.id))) {
      selectedSpeaker = null;
      showDialogueButton.disabled = true;
    }
    updateMysteryBugOptions();

    renderDebugSearchResults(speakerResults, results, result => {
      selectedSpeaker = result;
      showDialogueButton.disabled = false;
      updateMysteryBugOptions();
      speakerResults.querySelectorAll('.debug-search-result').forEach(button => {
        const isSelected = button.dataset.resultId === result.id;
        button.classList.toggle('selected', isSelected);
        button.style.display = isSelected ? 'inline-flex' : 'none';
      });
    }, selectedSpeaker && selectedSpeaker.id);
  };

  enemySearch?.addEventListener('input', searchEnemies);
  speakerSearch?.addEventListener('input', searchSpeakers);
  mysteryBugName?.addEventListener('input', () => {
    updateMysteryBugOptions();
  });
  mysteryBugImage?.addEventListener('change', () => {
    updateMysteryBugOptions();
  });
  updateMysteryBugOptions();
  searchSpeakers();
  spawnEnemyButton?.addEventListener('click', () => {
    if (!isOwnerDebugUser() || !selectedEnemy) return;
    spawnEnemy(selectedEnemy.id);
    if (socket && currentSeed) {
      socket.emit('spawn-enemy', { seed: currentSeed, enemyType: selectedEnemy.id, boss: false, forcedPath: null });
    }
    showMessage(`DEBUG: ${selectedEnemy.label} spawneado.`, 'info');
  });
  showDialogueButton?.addEventListener('click', () => {
    if (!isOwnerDebugUser() || !selectedSpeaker) return;
    const text = dialogueText.value.trim();
    if (!text) {
      showMessage('Escribe un texto para el diálogo.', 'warning');
      dialogueText.focus();
      return;
    }

    let emitId, emitImg, emitName;

    if (selectedSpeaker.isFallback) {
      showNarratorMsg(selectedSpeaker.id, selectedSpeaker.image, selectedSpeaker.label, text, 'speaker-fallback');
      emitId = selectedSpeaker.id; emitImg = selectedSpeaker.image; emitName = selectedSpeaker.label;
    } else {
      const data = NARRATOR_DATA[selectedSpeaker.id];
      const languageData = data[currentLanguage] || data.es || data.en || {};
      if (selectedSpeaker.id === 'mysterybug') {
        const name = mysteryBugName?.value.trim() || 'MysteryBug';
        const image = mysteryBugImage?.value || data.img;
        localStorage.setItem('glob_mysterybug_name', name);
        localStorage.setItem('glob_mysterybug_image', image);
        showNarratorMsg(selectedSpeaker.id, image, name, text);
        emitId = selectedSpeaker.id; emitImg = image; emitName = name;
      } else {
        showNarratorMsg(selectedSpeaker.id, data.img, languageData.name || selectedSpeaker.label, text);
        emitId = selectedSpeaker.id; emitImg = data.img; emitName = languageData.name || selectedSpeaker.label;
      }
    }

    if (socket && currentSeed) {
      socket.emit('show-dialog', { seed: currentSeed, id: emitId, img: emitImg, name: emitName, text: text });
    }
  });
}

function setupOwnerDebugPanelDrag() {
  const panel = document.getElementById('owner-debug-panel');
  const header = panel?.querySelector('.owner-debug-header');
  if (!panel || !header) return;

  const savedPosition = localStorage.getItem('glob_owner_debug_position');
  if (savedPosition) {
    const [left, top] = savedPosition.split(',').map(Number);
    if (Number.isFinite(left) && Number.isFinite(top)) {
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    }
  }

  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let isDragging = false;

  const movePanel = event => {
    if (!isDragging) return;
    const maxLeft = Math.max(0, window.innerWidth - panel.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - panel.offsetHeight);
    const left = Math.min(maxLeft, Math.max(0, event.clientX - dragOffsetX));
    const top = Math.min(maxTop, Math.max(0, event.clientY - dragOffsetY));
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  };

  header.addEventListener('pointerdown', event => {
    if (event.target.closest('button')) return;
    const rect = panel.getBoundingClientRect();
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;
    isDragging = true;
    header.setPointerCapture(event.pointerId);
    panel.classList.add('is-dragging');
  });

  header.addEventListener('pointermove', movePanel);
  header.addEventListener('pointerup', event => {
    if (!isDragging) return;
    isDragging = false;
    header.releasePointerCapture(event.pointerId);
    panel.classList.remove('is-dragging');
    localStorage.setItem('glob_owner_debug_position', `${panel.offsetLeft},${panel.offsetTop}`);
  });
  header.addEventListener('pointercancel', () => {
    isDragging = false;
    panel.classList.remove('is-dragging');
  });
  window.addEventListener('resize', () => {
    if (!panel.style.left || !panel.style.top) return;
    const maxLeft = Math.max(0, window.innerWidth - panel.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - panel.offsetHeight);
    const left = Math.min(maxLeft, Math.max(0, panel.offsetLeft));
    const top = Math.min(maxTop, Math.max(0, panel.offsetTop));
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  });
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
  const optMetaEmojis = document.getElementById('opt-meta-emojis');
  if (optMetaEmojis) gameState.settings.metaEmojis = optMetaEmojis.checked;
  const optFullscreen = document.getElementById('opt-fullscreen-map');
  if (optFullscreen) gameState.settings.fullscreenMap = optFullscreen.checked;
  const optAutoEn = document.getElementById('opt-auto-english');
  if (optAutoEn) gameState.settings.autoEnglish = optAutoEn.checked;
  const optHideDate = document.getElementById('opt-hide-date');
  if (optHideDate) gameState.settings.hideDate = optHideDate.checked;
  const hypermutatedCheck = document.getElementById('opt-hypermutated');
  gameState.settings.hypermutatedEffect = (gameState.hypermutatedUnlocked || gameState.debugState === 'unlocked') &&
    Boolean(hypermutatedCheck?.checked);
  updateHypermutatedTowers();
  const glitchCheck = document.getElementById('opt-glitch');
  gameState.settings.glitchEffect = (gameState.glitchUnlocked || gameState.debugState === 'unlocked') &&
    Boolean(glitchCheck?.checked);
  updateGlitchTowers();

  updateSessionClock();
  applyMetaButtonMode();

  if (gameState.settings.fullscreenMap) {
    document.body.classList.add('fullscreen-map');
  } else {
    document.body.classList.remove('fullscreen-map');
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
    'Glob':         { type: 'Glob', unlocked: true },
    'Red_Glob':     { type: 'Red_Glob', unlocked: true },
    'Soap_Glob':    { type: 'Soap_Glob', unlocked: true },
    'Ducky_Glob':   { type: 'Ducky_Glob', unlocked: true },
    'Comet_Glob':   { type: 'Comet_Glob', unlocked: !!(TOWER_TYPES['Comet_Glob'] && TOWER_TYPES['Comet_Glob'].unlocked), req: 'shop' },
    'Old_Glob':     { type: 'Old_Glob', unlocked: !!(TOWER_TYPES['Old_Glob'] && TOWER_TYPES['Old_Glob'].unlocked), req: 'shop' },
    'Sprout_Glob':  { type: 'Sprout_Glob', unlocked: !!(TOWER_TYPES['Sprout_Glob'] && TOWER_TYPES['Sprout_Glob'].unlocked), req: 'shop' },
    'Work_Bombot':  { type: 'Work_Bombot', unlocked: !!(TOWER_TYPES['Work_Bombot'] && TOWER_TYPES['Work_Bombot'].unlocked), req: 'challenge' },
    'Worker_Glob':  { type: 'Worker_Glob', unlocked: true },
    'Balloon_Glob': { type: 'Balloon_Glob', unlocked: true },
    'Streamer_Glob':{ type: 'Streamer_Glob', unlocked: true },
    'Bomb_Glob':    { type: 'Bomb_Glob', unlocked: true },
    'Pirate_Glob':  { type: 'Pirate_Glob', unlocked: !!(TOWER_TYPES['Pirate_Glob'] && TOWER_TYPES['Pirate_Glob'].unlocked), req: 'shop' }
  };

  const shopTowers = (gameState.equippedTowers || ['Glob', 'Red_Glob']).map(t => allShopTowers[t]).filter(Boolean);

  shopTowers.forEach(item => {
    const type = item.type;
    const t = TOWER_TYPES[type];
    if (!t) return;

    const capacity = getTowerPlacementLimits(type);
    const family = t.family || type;
    const ownerId = multiplayerActionOwner || socket?.id || localStorage.getItem('glob_username') || 'Jugador';
    const currentCount = multiplayerEnabled
      ? gameState.towers.filter(tower =>
        (tower.family || tower.type) === family && tower.ownerId === ownerId
      ).length
      : getFamilyCount(type);
    const limit = capacity.perPlayerLimit;
    const isFull = currentCount >= limit ||
      (multiplayerEnabled && getFamilyCount(type) >= capacity.sharedLimit);
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

function getBadgeColorGroup(badge) {
  return badge.colorGroup || (badge.category === 'misiones' ? 'mission' : 'base');
}

function drawBadges() {
  const list = document.getElementById('badges-list');
  if (!list) return;
  list.innerHTML = '';
  
  const categoriesMap = {
    'misiones': '📜 Misiones',
    'modos': '🎮 Modos',
    'interacciones': '💡 Interacciones',
    'economia': '💸 Economía',
    'otros': '🌐 Otros'
  };
  
  const grouped = {};
  Object.values(BADGES).forEach(b => {
    const cat = b.category || 'otros';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(b);
  });
  
  Object.keys(categoriesMap).forEach(cat => {
    if (!grouped[cat] || grouped[cat].length === 0) return;
    
    const header = document.createElement('h3');
    header.style.color = '#ffd700';
    header.style.borderBottom = '1px solid #ffd700';
    header.style.paddingBottom = '5px';
    header.style.marginTop = '15px';
    header.style.textAlign = 'left';
    header.textContent = categoriesMap[cat];
    list.appendChild(header);
    
    grouped[cat].forEach(b => {
      if (b.unlocked && !gameState.claimedRewards.includes(b.key)) {
        grantBadgeReward(b);
      }
      const el = document.createElement('div');
      el.className = `badge badge-tone-${getBadgeColorGroup(b)} ${b.unlocked ? '' : 'locked'}`;
      const name = translate(`badge_${b.key}_name`);
      const desc = translate(`badge_${b.key}_desc`);
  
      let rewardText = "";
      if (b.reward.pycoins) rewardText = `<img src="img/Tokens/PyCoin.png" class="token-inline-icon" alt="PyCoins">+${b.reward.pycoins}`;
      if (b.reward.duckpass) rewardText = `<img src="img/Tokens/DuckPass.png" class="token-inline-icon" alt="DuckPass">+${b.reward.duckpass}`;
      if (b.reward.xp) rewardText += ` ✨+${b.reward.xp}xp`;
  
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
  });
}

function unlockBadge(key) {
  if (multiplayerSpectator) return;
  if (BADGES[key] && !BADGES[key].unlocked) {
    BADGES[key].unlocked = true;
    saveProgress();
    drawBadges();
    showBadgePopup(BADGES[key]);
    publishMultiplayerProfile();
  }
}

function checkTowerCombinationBadges() {
  const towers = gameState.towers || [];
  const hasFamily = family => towers.some(tower => tower.family === family);
  const hasNearbyFamilies = (first, second, distance) => towers.some(firstTower =>
    firstTower.family === first &&
    towers.some(secondTower =>
      secondTower.family === second &&
      Math.hypot(firstTower.x - secondTower.x, firstTower.y - secondTower.y) <= distance
    )
  );

  if (hasNearbyFamilies('IEx', 'Worker_Glob', 180)) {
    unlockBadge('fenced_kaboom');
  }

  if (hasFamily('Brown') && hasFamily('Worker_Glob')) {
    const hadSoapFamily = hasFamily('Soap_Glob');
    const shouldShowSoapMessage = !gameState.wallGardenSoapMessageShown;
    unlockBadge('wall_garden');
    if (hadSoapFamily && shouldShowSoapMessage) {
      gameState.wallGardenSoapMessageShown = true;
      showMessage(
        currentLanguage === 'es'
          ? 'Yo que pensaba que no usarias jabon para ralentizar aun mas... Me equivoque contigo.'
          : 'I thought you would not use soap to slow them down even more... I was wrong about you.',
        'info'
      );
    }
  }

  const urbanFamilies = ['White', 'Pink', 'Worker_Glob', 'IEx'];
  if (urbanFamilies.every(family => gameState.maxedFamilies.includes(family))) {
    unlockBadge('urban_king');
  }

  const dangerousFamilies = ['IEx', 'Comet_Glob', 'Pirate_Glob'];
  const hasDangerousSet = dangerousFamilies.every(family => {
    const familyTowers = towers.filter(tower => tower.family === family);
    const maximum = gameState.towerLimits[family] || 0;
    return maximum > 0 &&
      familyTowers.length >= maximum &&
      familyTowers.every(tower => !TOWER_TYPES[tower.type]?.evolution);
  });
  if (hasDangerousSet) {
    unlockBadge('dangerous_set');
  }
}

function showBadgePopup(badge) {
  const popup = document.getElementById('badge-popup');
  const icon = document.getElementById('badge-popup-icon');
  const title = document.getElementById('badge-popup-title');
  const desc = document.getElementById('badge-popup-desc');
  if (!popup) return;

  popup.classList.remove('badge-tone-collab', 'badge-tone-mission', 'badge-tone-key');
  popup.classList.add(`badge-tone-${getBadgeColorGroup(badge)}`);
  icon.innerHTML = badge.icon;
  title.textContent = translate(`badge_${badge.key}_name`);
  desc.textContent = translate(`badge_${badge.key}_desc`);

  popup.classList.add('show');
  setTimeout(() => popup.classList.remove('show'), 4000);
}

function showEncyclopediaPopup(enemy) {
  const popup = document.getElementById('encyclopedia-popup');
  const image = document.getElementById('encyclopedia-popup-image');
  const title = document.getElementById('encyclopedia-popup-title');
  const desc = document.getElementById('encyclopedia-popup-desc');
  if (!popup || !image || !title || !desc || !enemy) return;

  image.innerHTML = enemy.image
    ? `<img src="${encodeURI(enemy.image)}" alt="">`
    : '📖';
  title.textContent = translate(enemy.name || enemy.key || 'Enemigo');
  desc.textContent = currentLanguage === 'es'
    ? 'Has completado el registro de este enemigo en la Enciclopedia.'
    : 'You have completed this enemy entry in the Encyclopedia.';

  popup.classList.remove('show');
  void popup.offsetWidth;
  popup.classList.add('show');
  setTimeout(() => popup.classList.remove('show'), 4500);
}

function grantBadgeReward(badge) {
  if (multiplayerSpectator) return;
  if (gameState.claimedRewards.includes(badge.key)) return;

  const hasReward = Object.values(badge.reward || {}).some(value => Number(value) > 0);
  if (badge.reward.pycoins) gameState.pycoins += badge.reward.pycoins;
  if (badge.reward.duckpass) gameState.duckPassCurrency += badge.reward.duckpass;
  if (badge.reward.xp) addXP(badge.reward.xp);

  gameState.claimedRewards.push(badge.key);
  updateMetaUI();
  saveProgress();
  if (hasReward) showMessage(translate('badge_reward_received', { name: translate('badge_' + badge.key + '_name') }), 'success');
}

function toggleLanguage() {
  currentLanguage = currentLanguage === 'es' ? 'en' : 'es';
  updateLanguage();
  renderMapSelection();
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
  btn.innerHTML = translate('btn_encyclopedia');
  btn.classList.add('encyclopedia-btn-yellow');
  btn.title = translate('btn_encyclopedia').replace('📖 ', '');
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
    grid.style.display = '';
    grid.style.gap = '';
    grid.style.justifyContent = '';
    grid.style.padding = '';
    details.style.display = '';
    
    const filterContainer = document.createElement('div');
    filterContainer.style.gridColumn = '1 / -1';
    filterContainer.style.display = 'flex';
    filterContainer.style.gap = '10px';
    filterContainer.style.marginBottom = '15px';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = translate('search_enemy') || 'Buscar enemigo...';
    searchInput.style.flex = '1';
    searchInput.style.padding = '8px';
    searchInput.style.borderRadius = '5px';
    searchInput.style.border = '1px solid #555';
    searchInput.style.backgroundColor = '#1a1a1f';
    searchInput.style.color = '#fff';
    
    const mapSelect = document.createElement('select');
    mapSelect.innerHTML = `
      <option value="all">${currentLanguage === 'en' ? 'All Maps' : 'Todos los mapas'}</option>
      <option value="urbanistic_road">Urbanistic Road (UR)</option>
      <option value="gelatin_lake">Gelatin Lake (GL)</option>
      <option value="interstellar_menace">Interstellar Menace (IM)</option>
      <option value="sunlight_seaside">Sunlight Seaside (SS)</option>
      <option value="spooktacular_ruins">${currentLanguage === 'en' ? 'Spooktacular Ruins' : 'Aridez Escalofriante'}</option>
    `;
    mapSelect.style.padding = '8px';
    mapSelect.style.borderRadius = '5px';
    mapSelect.style.border = '1px solid #555';
    mapSelect.style.backgroundColor = '#1a1a1f';
    mapSelect.style.color = '#fff';
    
    const typeSelect = document.createElement('select');
    typeSelect.innerHTML = `
      <option value="all">${currentLanguage === 'en' ? 'All Classes' : 'Todos'}</option>
      <option value="tank">Tank</option>
      <option value="melee">Melee</option>
      <option value="shooter">Shooter</option>
      <option value="boss">Bosses</option>
    `;
    typeSelect.style.padding = '8px';
    typeSelect.style.borderRadius = '5px';
    typeSelect.style.border = '1px solid #555';
    typeSelect.style.backgroundColor = '#1a1a1f';
    typeSelect.style.color = '#fff';

    const groupContainer = document.createElement('div');
    groupContainer.style.display = 'flex';
    groupContainer.style.gap = '8px';
    groupContainer.style.flexWrap = 'wrap';
    groupContainer.style.marginTop = '10px';
    
    let activeGroup = 'all';
    
    const groups = [
      { id: 'all',      label: currentLanguage === 'en' ? 'All' : 'Todos' },
      { id: 'pyces',    label: currentLanguage === 'en' ? 'Pyces' : 'Pyces' },
      { id: 'otros',    label: currentLanguage === 'en' ? 'Others' : 'Otros Enemigos' },
      { id: 'bits',     label: 'Bits & Spywares' },
      { id: 'arkys',    label: 'Arkys' },
      { id: 'crystalized', label: currentLanguage === 'en' ? 'Crystallized' : 'Cristalizados' },
      { id: 'og',       label: 'OG' },
      { id: 'id',       label: 'Proyecto I.D.' },
      { id: 'ren',      label: 'Familia Ren' },
      { id: 'treepers', label: 'Treepers' },
      { id: 'shrums',   label: 'Shrums' },
      { id: 'pysh',     label: 'Familia Pysh' },
      { id: 'new_ss',   label: currentLanguage === 'en' ? 'New SS Enemies' : 'Nuevos de SS' }
    ];
    
    const renderGroupButtons = () => {
      groupContainer.innerHTML = '';
      if (activeGroup === 'all') {
        groups.forEach(g => {
          if (g.id === 'all') return; // 'all' is the default state
          const btn = document.createElement('button');
          btn.className = 'meta-btn';
          btn.innerText = g.label;
          btn.style.padding = '5px 10px';
          btn.style.fontSize = '0.8rem';
          
          btn.dataset.group = g.id;
          btn.onclick = () => {
            activeGroup = g.id;
            renderGroupButtons();
            renderFilteredEnemies();
          };
          groupContainer.appendChild(btn);
        });
      } else {
        const backBtn = document.createElement('button');
        backBtn.className = 'meta-btn';
        backBtn.innerText = currentLanguage === 'en' ? '⬅ Back' : '⬅ Volver atrás';
        backBtn.style.padding = '5px 10px';
        backBtn.style.fontSize = '0.8rem';
        backBtn.style.border = '2px solid #e74c3c';
        backBtn.onclick = () => {
          activeGroup = 'all';
          renderGroupButtons();
          renderFilteredEnemies();
        };
        groupContainer.appendChild(backBtn);
        
        const currentGroup = groups.find(g => g.id === activeGroup);
        if (currentGroup) {
          const currentLbl = document.createElement('span');
          currentLbl.innerText = `[${currentGroup.label}]`;
          currentLbl.style.padding = '5px 10px';
          currentLbl.style.fontSize = '0.9rem';
          currentLbl.style.color = '#ffd700';
          currentLbl.style.fontWeight = 'bold';
          groupContainer.appendChild(currentLbl);
        }
      }
    };
    renderGroupButtons();

    filterContainer.appendChild(searchInput);
    filterContainer.appendChild(mapSelect);
    filterContainer.appendChild(typeSelect);
    
    const headerWrapper = document.createElement('div');
    headerWrapper.style.gridColumn = '1 / -1';
    headerWrapper.appendChild(filterContainer);
    headerWrapper.appendChild(groupContainer);
    grid.appendChild(headerWrapper);

    const enemyGrid = document.createElement('div');
    enemyGrid.style.display = 'flex';
    enemyGrid.style.flexWrap = 'wrap';
    enemyGrid.style.gap = '10px';
    enemyGrid.style.gridColumn = '1 / -1';
    grid.appendChild(enemyGrid);

    window.triggerFilterGroup = (groupId) => {
      activeGroup = groupId;
      renderGroupButtons();
      renderFilteredEnemies();
    };

    const renderFilteredEnemies = () => {
      enemyGrid.innerHTML = '';
      const term = searchInput.value.toLowerCase();
      const mapVal = mapSelect.value;
      const typeVal = typeSelect.value;
      const groupVal = activeGroup;

      if (!term && mapVal === 'all' && typeVal === 'all' && groupVal === 'all') {
        enemyGrid.innerHTML = `
          <div class="enemy-category-card" onclick="triggerFilterGroup('pyces')" style="width:100%; max-width:200px; padding:20px; background:#e74c3c; border:3px solid #c0392b; border-radius:15px; text-align:center; cursor:pointer; transition:transform 0.2s; margin:auto;">
            <img src="${IMAGE_PATHS.Stupid_Pyce || 'img/Sellos/CuboPyceIcon.png'}" style="width:80px; filter:drop-shadow(0 5px 10px rgba(0,0,0,0.5));" onerror="this.src='img/Sellos/CuboPyceIcon.png'">
            <h3 style="margin-top:10px; font-size:1.5rem; text-shadow:0 2px 4px rgba(0,0,0,0.5);">Pyces</h3>
          </div>
          <div class="enemy-category-card" onclick="triggerFilterGroup('otros')" style="width:100%; max-width:200px; padding:20px; background:#8e44ad; border:3px solid #732d91; border-radius:15px; text-align:center; cursor:pointer; transition:transform 0.2s; margin:auto;">
            <img src="${IMAGE_PATHS.Monster || 'img/Sellos/Monster.png'}" style="width:80px; filter:drop-shadow(0 5px 10px rgba(0,0,0,0.5));" onerror="this.src='img/Sellos/Monster.png'">
            <h3 style="margin-top:10px; font-size:1.5rem; text-shadow:0 2px 4px rgba(0,0,0,0.5);">Otros Enemigos</h3>
          </div>
        `;
        details.innerHTML = `<div style="padding:6px 10px; text-align:center; color:#444; font-size:0.7rem; font-style:italic;">${currentLanguage === 'en' ? 'Description will appear here' : 'La descripción irá aquí'}</div>`;
        return;
      }
      
      // === PYCES: anything with 'Pyce' or 'Pysh' in its key name ===
      const PYCES_ENEMIES = Object.keys(ENEMY_TYPES).filter(k =>
        k.includes('Pyce') || k.includes('Pysh') || k === 'SO_Pyce'
      );
      // === OTROS: everything NOT a Pyce/Pysh ===
      const OTROS_ENEMIES = Object.keys(ENEMY_TYPES).filter(k => !PYCES_ENEMIES.includes(k));

      let firstItem = null;
      const HIDDEN_VARIANTS = ['NO_CrystEye_CB', 'AstrorbContenida', 'AstrorbTF', 'Spyware2', 'Spyware3', 'BitG2', 'BitP3', 'BitB4', 'ByteYP2', 'BytePG3', 'ByteYB4'];

      const OG_ENEMIES = ['Stupid_Pyce', 'Pyce2', 'Guest_Pyce', 'Symbol_Pyce', 'Noob_Pyce', '4motions_Pyce', 'Flower_Pyce', '1x1x1x1_Pyce', 'NOeye_Pyce', 'MoonStar_Pyce', 'Stupid_GoldPyce', 'Mimic_Pyce', 'HoloPyce', 'Strechy_Pyce', 'Rebel_Pyce'];
      const ID_ENEMIES = ['Leni_the_big_Hammer', 'Monster', 'Cristalized_Monster', 'Lenistal', 'Crystal_Bombot', 'AstrorbOrbe', 'AstrorbContenida', 'AstrorbTF', 'Crystalic_Orb', 'Sharowd', 'NO_CrystEye_CB', 'Arky', 'CrystArky', 'ArkyVoid', 'Fireflies', 'Treeper', 'Big_Treeper', 'Stacked_Treepers', 'Baby_Shrum', 'Shrum', 'Old_Fungus', 'Spyware1', 'Spyware2', 'Spyware3', 'BitY1', 'BitG2', 'BitP3', 'BitB4', 'ByteYP2', 'BytePG3', 'ByteYB4', 'ByteGB1'];
      const REN_ENEMIES = ['Ren', 'Thunren', 'Renibig'];
      const TREEPER_ENEMIES = ['Treeper', 'Big_Treeper', 'Stacked_Treepers'];
      const SHRUM_ENEMIES = ['Baby_Shrum', 'Shrum', 'Old_Fungus'];
      const PYSH_ENEMIES = ['Pysh', 'Clown_Pysh'];
      const NEW_SS_ENEMIES = ['Axolotl_Pyce', 'Shark_Pyce', 'Umbrella_Pyce', 'Piz', 'Followishers', 'Creamplet'];

      Object.keys(ENEMY_TYPES).forEach(type => {
        const e = ENEMY_TYPES[type];
        if (HIDDEN_VARIANTS.includes(type)) return;
        
        let mapSource = e.mapSource || 'gelatin_lake';
        if (!e.mapSource) {
           if (e.category === 'gambling' || ['Bomb_Pyce', 'Knight_Pyce', 'Cannon_Pycer', 'HoloPyce', 'Strechy_Pyce', 'Rebel_Pyce'].includes(type)) {
             mapSource = 'urbanistic_road';
           } else if (e.category === 'other' && !['Monster', 'Cristalized_Monster', 'Lenistal'].includes(type)) {
             mapSource = 'interstellar_menace';
           } else if (['Leni_the_big_Hammer', 'Monster', 'Cristalized_Monster', 'Lenistal', 'Crystal_Bombot', 'AstrorbOrbe'].includes(type)) {
             mapSource = 'interstellar_menace';
           }
        }
        
        let enemyClass = e.enemyClass || 'melee';
        if (!e.enemyClass) {
          if (e.boss) enemyClass = 'boss';
          else if (e.health > 200) enemyClass = 'tank';
          else if (e.projectile || e.shooter) enemyClass = 'shooter';
        }

        const name = translate(e.name || type).toLowerCase();
        
        if (term && !name.includes(term)) return;
        if (mapVal !== 'all' && mapSource !== mapVal) return;
        if (typeVal !== 'all' && enemyClass !== typeVal) return;
        
        if (groupVal !== 'all') {
          if (groupVal === 'pyces' && !PYCES_ENEMIES.includes(type)) return;
          if (groupVal === 'otros' && !OTROS_ENEMIES.includes(type)) return;
          if (groupVal === 'bits' && !(type.startsWith('Bit') || type.startsWith('Byte') || type.startsWith('Spyware') || type === 'Fireflies')) return;
          if (groupVal === 'arkys' && !(['Arky', 'CrystArky', 'ArkyVoid'].includes(type))) return;
          if (groupVal === 'crystalized' && !(e.isCrystallized || type.startsWith('Astrorb') || type === 'Cristalized_Monster' || type === 'Crystal_Bombot' || type === 'Crystal_Pyce' || type === 'Dreamy_SPyce' || type === 'Astral_BPyce')) return;
          if (groupVal === 'og' && !OG_ENEMIES.includes(type)) return;
          if (groupVal === 'id' && !ID_ENEMIES.includes(type)) return;
          if (groupVal === 'ren' && !REN_ENEMIES.includes(type)) return;
          if (groupVal === 'treepers' && !TREEPER_ENEMIES.includes(type)) return;
          if (groupVal === 'shrums' && !SHRUM_ENEMIES.includes(type)) return;
          if (groupVal === 'pysh' && !PYSH_ENEMIES.includes(type)) return;
          if (groupVal === 'new_ss' && !NEW_SS_ENEMIES.includes(type)) return;
        }

        if (!firstItem) firstItem = type;
        const btn = document.createElement('div');
        btn.className = 'almanac-btn';
        let killed = gameState.pycesKilled[type] || 0;
        if (type === 'BitY1' || type.startsWith('Bit')) {
          killed = ['BitY1', 'BitB4', 'BitG2', 'BitP3'].reduce((sum, b) => sum + (gameState.pycesKilled[b] || 0), 0);
        } else if (type === 'ByteGB1' || type.startsWith('Byte')) {
          killed = ['ByteGB1', 'ByteYP2', 'BytePG3', 'ByteYB4'].reduce((sum, b) => sum + (gameState.pycesKilled[b] || 0), 0);
        }

        let imageToShow = e.image;
        if (killed === 0) {
          imageToShow = e.isCrystallized ? 'img/Sellos/AstralExclamation.png' : 'img/Sellos/MysteryBug.png';
        }

        if (typeof getPyceKillTarget === 'function' && killed >= getPyceKillTarget(type)) {
          btn.style.boxShadow = '0 0 10px #ffd700';
          btn.style.borderColor = '#ffd700';
        }
        btn.id = 'almanac-btn-' + type;
        btn.onclick = () => selectAlmanacItem(type, 'enemies');
        
        const isImportant = e.boss || e.isCrystallized || type === 'Mimic_Pyce' || type === 'Leni_the_big_Hammer' || type === 'Monster' || type === 'AstrorbOrbe';
        btn.innerHTML = `<img src="${imageToShow}" title="${killed === 0 && isImportant ? '???' : translate(e.name || type)}">`;
        enemyGrid.appendChild(btn);
      });
      
      if (firstItem) selectAlmanacItem(firstItem, 'enemies');
      else details.innerHTML = '<div style="padding:20px; text-align:center; color:#888;">No se encontraron enemigos.</div>';
    };

    searchInput.addEventListener('input', renderFilteredEnemies);
    mapSelect.addEventListener('change', renderFilteredEnemies);
    typeSelect.addEventListener('change', renderFilteredEnemies);
    
    renderFilteredEnemies();
  } else if (tab === 'emblemas') {
    Object.values(BADGES).forEach(b => {
      if (!firstItem) firstItem = b.key;
      const btn = document.createElement('div');
      btn.className = `almanac-btn badge-tone-${getBadgeColorGroup(b)}`;
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

    const isUndiscovered = killed === 0;
    let displayImage = e.image;
    let displayName = translate(e.name || id);
    let displayDesc = e.desc ? translate(e.desc) : "";
    let displayHealth = e.health;
    let displaySpeed = e.speed;
    let displayReward = e.reward;

    if (isUndiscovered) {
      displayImage = e.isCrystallized ? 'img/Sellos/AstralExclamation.png' : 'img/Sellos/MysteryBug.png';
      
      const isImportant = e.boss || e.isCrystallized || id === 'Mimic_Pyce' || id === 'Leni_the_big_Hammer' || id === 'Monster' || id === 'AstrorbOrbe';
      
      if (isImportant) {
         displayName = "???";
         displayDesc = displayDesc.replace(/./g, "#");
      }
      
      displayHealth = "???";
      displaySpeed = "???";
      displayReward = "???";
    }

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
          let vKilled = gameState.pycesKilled[v] || 0;
          let vImage = vi.image;
          if (vKilled === 0) {
             vImage = vi.isCrystallized ? 'img/Sellos/AstralExclamation.png' : 'img/Sellos/MysteryBug.png';
          }
          variantsHTML += `
            <div class="evo-item" onclick="selectAlmanacItem('${v}', 'enemies')" style="cursor:pointer; ${v === id || (id === 'Spyware' && v === 'Spyware1') ? 'border: 2px solid #fff;' : 'opacity: 0.7;'} border-radius: 10px; margin: 0 5px;">
              <img src="${vImage}" style="width:50px; height:50px; border-radius:10px;" title="${vKilled === 0 ? '???' : translate(vi.name || v)}">
            </div>
          `;
        }
      });
      variantsHTML += `</div>`;
    } else if (id === 'NOeye_Pyce') {
      const cryst = ENEMY_TYPES['NO_CrystEye_CB'];
      if (cryst) {
        let vKilled = gameState.pycesKilled['NO_CrystEye_CB'] || 0;
        let vImage = vKilled === 0 ? 'img/Sellos/AstralExclamation.png' : cryst.image;
        let vName = vKilled === 0 ? "???" : translate(cryst.name || 'NO_CrystEye_CB');
        variantsHTML = `
          <div style="margin-top:18px; border-top: 1px solid rgba(255,255,255,0.15); padding-top:12px;">
            <p style="font-size:0.75rem; color:#aaa; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;">Variante Cristalizada</p>
            <div class="evo-list" style="justify-content:center;">
              <div class="evo-item" onclick="selectAlmanacItem('NO_CrystEye_CB', 'enemies')" style="cursor:pointer; border-radius:10px; margin:0 5px; border:2px solid #cc44ff;">
                <img src="${vImage}" style="width:55px; height:55px; border-radius:10px;" title="${vName}">
                ${vKilled === 0 ? '' : `<div style="font-size:0.7rem; color:#cc44ff; margin-top:4px;">${vName}</div>`}
              </div>
            </div>
          </div>`;
      }
    } else if (id === 'AstrorbOrbe' || id === 'AstrorbContenida' || id === 'AstrorbTF') {
      const forms = ['AstrorbOrbe', 'AstrorbContenida', 'AstrorbTF'];
      variantsHTML = `
        <div style="margin-top:18px; border-top: 1px solid rgba(255,255,255,0.15); padding-top:12px;">
          <p style="font-size:0.75rem; color:#aaa; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;">Formas de Astrorb</p>
          <div class="evo-list" style="justify-content:center;">`;
      forms.forEach(f => {
        const fi = ENEMY_TYPES[f];
        if (fi) {
          let vKilled = gameState.pycesKilled[f] || 0;
          let vImage = vKilled === 0 ? 'img/Sellos/MysteryBug.png' : fi.image;
          let vName = vKilled === 0 ? "???" : translate(fi.name || f);
          variantsHTML += `
            <div class="evo-item" onclick="selectAlmanacItem('${f}', 'enemies')" style="cursor:pointer; border-radius:10px; margin:0 5px; ${f === id ? 'border:2px solid #ff00ff; box-shadow: 0 0 10px #ff00ff;' : 'opacity:0.7; border:1px solid rgba(255,0,255,0.3);'}">
              <img src="${vImage}" style="width:${f === 'AstrorbOrbe' ? '60' : '48'}px; height:${f === 'AstrorbOrbe' ? '60' : '48'}px; border-radius:10px;" title="${vName}">
              ${vKilled === 0 ? '' : `<div style="font-size:0.65rem; color:#ff88ff; margin-top:3px;">${vName}</div>`}
            </div>`;
        }
      });
      variantsHTML += `</div></div>`;
    } else if (id === 'Pyce2' || id === 'Symbol_Pyce' || id === 'Bomb_Pyce') {
      // Crystal variants shown as sub-versions
      const crystalMap = {
        'Pyce2':        'Crystal_Pyce',   // Crystal Pyce is a crystallized Pyce2
        'Symbol_Pyce':  'Dreamy_SPyce',   // Dreamy SPyce is a crystallized Symbol Pyce
        'Bomb_Pyce':    'Astral_BPyce'    // Astral BPyce is a crystallized Bomb Pyce
      };
      const crystType = crystalMap[id];
      const cryst = ENEMY_TYPES[crystType];
      if (cryst) {
        let vKilled = gameState.pycesKilled[crystType] || 0;
        let vImage = vKilled === 0 ? 'img/Sellos/AstralExclamation.png' : cryst.image;
        let vName = vKilled === 0 ? "???" : translate(cryst.name || crystType);
        variantsHTML = `
          <div style="margin-top:18px; border-top: 1px solid rgba(255,255,255,0.15); padding-top:12px;">
            <p style="font-size:0.75rem; color:#aaa; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;">Variante Cristalizada</p>
            <div class="evo-list" style="justify-content:center;">
              <div class="evo-item" onclick="selectAlmanacItem('${crystType}', 'enemies')" style="cursor:pointer; border-radius:10px; margin:0 5px; border:2px solid #44ddff; box-shadow:0 0 8px rgba(68,221,255,0.5);">
                <img src="${vImage}" style="width:55px; height:55px; border-radius:10px;" title="${vName}">
                ${vKilled === 0 ? '' : `<div style="font-size:0.7rem; color:#44ddff; margin-top:4px;">${vName}</div>`}
              </div>
            </div>
          </div>`;
      }
    } else if (id === 'Monster') {
      const cryst = ENEMY_TYPES['Cristalized_Monster'];
      if (cryst) {
        let vKilled = gameState.pycesKilled['Cristalized_Monster'] || 0;
        let vImage = vKilled === 0 ? 'img/Sellos/AstralExclamation.png' : cryst.image;
        let vName = vKilled === 0 ? "???" : translate(cryst.name || 'Cristalized_Monster');
        variantsHTML = `
          <div style="margin-top:18px; border-top: 1px solid rgba(255,255,255,0.15); padding-top:12px;">
            <p style="font-size:0.75rem; color:#aaa; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;">Variante Cristalizada</p>
            <div class="evo-list" style="justify-content:center;">
              <div class="evo-item" onclick="selectAlmanacItem('Cristalized_Monster', 'enemies')" style="cursor:pointer; border-radius:10px; margin:0 5px; border:2px solid #44bbff;">
                <img src="${vImage}" style="width:55px; height:55px; border-radius:10px;" title="${vName}">
                ${vKilled === 0 ? '' : `<div style="font-size:0.7rem; color:#44bbff; margin-top:4px;">${vName}</div>`}
              </div>
            </div>
          </div>`;
      }
    }

    details.innerHTML = `
      <img src="${displayImage}" style="width:100px; height:100px; margin-bottom:10px; ${isBoss && !isUndiscovered ? 'transform:scale(1.2);' : ''}">
      <h3 style="font-size: 1.5rem; ${titleStyle}">${displayName}</h3>
      ${displayDesc ? `<p style="font-size:0.9rem; margin-top:5px; margin-bottom:10px; overflow-wrap: anywhere;">${displayDesc}</p>` : ''}
      ${e.category === 'gambling' || isUndiscovered ? '' : `<p style="font-size:0.95rem; color:#ffd700; font-weight:bold; margin-top:5px;">⭐ ${mechanicText}</p>`}
      
      <div style="margin-top:15px; width:100%; max-width:300px; margin-left:auto; margin-right:auto; background:#222; border-radius:5px; padding:3px; position:relative;">
        <div style="width:${barWidth}%; height:15px; background:${isMaxed ? '#ffd700' : '#4caf50'}; border-radius:3px; transition: width 0.3s;"></div>
        <div style="position:absolute; width:100%; top:0; left:0; text-align:center; font-size:0.8rem; font-weight:bold; color:#fff; text-shadow:1px 1px 1px #000; line-height:15px;">
          ${killed} / ${target}
        </div>
      </div>

      <div style="display:flex; justify-content:center; gap:15px; font-size:0.9rem; color:#ddd; margin-top:15px; background: ${progressBg}; padding:10px; border-radius:10px;">
        <span>${translate('almanac_hp')} ${displayHealth}</span>
        <span>${translate('almanac_speed')} ${displaySpeed}</span>
        <span>${translate('almanac_reward')}${displayReward}</span>
      </div>
      
      ${variantsHTML}
      ${(id === 'Monster' || id === 'Cristalized_Monster') ? `
        <div style="margin-top:15px; font-size:0.75rem; color:#e67e22; opacity:0.85; font-style:italic; letter-spacing:0.5px;">
          ${currentLanguage === 'en' ? '✏️ Idea by POP, Draw by KirByte_Bi' : '✏️ Idea de POP, Dibujo de KirByte_Bi'}
        </div>` : ''}
    `;
  } else if (category === 'emblemas') {
    const badgeArr = Object.values(BADGES);
    const b = badgeArr.find(x => x.key === id);
    if (!b) return;

    const name = translate(`badge_${b.key}_name`);
    const desc = translate(`badge_${b.key}_desc`);
    let rewardText = "";
    if (b.reward.pycoins) rewardText += `<img src="img/Tokens/PyCoin.png" class="token-inline-icon" alt="PyCoins">+${b.reward.pycoins} `;
    if (b.reward.duckpass) rewardText += `<img src="img/Tokens/DuckPass.png" class="token-inline-icon" alt="DuckPass">+${b.reward.duckpass} `;
    if (b.reward.xp) rewardText += `✨+${b.reward.xp}xp`;

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
  document.getElementById('pause-game')?.addEventListener('click', pauseGame);
  document.querySelector('#game-over .retry-btn:not(#resume-game)')?.addEventListener('click', () => {
    sendMultiplayerAction({ type: 'retry' });
  });
  document.getElementById('login-btn').onclick = handleLogin;
  document.getElementById('offline-play-btn').onclick = handleSkipLogin;
  const createAccountButton = document.getElementById('create-account-btn');
  if (createAccountButton) createAccountButton.onclick = handleCreateAccount;
  
  const loadingFamilyTips = {
    es: {
      Glob: ['Los Glob básicos sostienen la defensa temprana; colócalos bien para controlar la primera oleada.', 'Los Glob no son los más fuertes, pero son el núcleo de tu ritmo de juego y de tu economía.'],
      Red_Glob: ['La familia roja suele ser la mejor para empujar daño directo a enemigos rápidos.', 'Combina Red_Glob con apoyo para eliminar objetivos prioritarios antes de que te abran paso.'],
      Soap_Glob: ['Es muy útil para frenar ataques y ganar tiempo en oleadas difíciles.', 'Si el enemigo acelera demasiado, la familia azul te da control real del campo.'],
      Ducky_Glob: ['Aporta economía y consistencia; no lo dejes en segundo plano.', 'Los Ducky son excelentes para generar más recursos y sostener partidas largas.'],
      Comet_Glob: ['La familia negra hace daño brutal cuando ya has controlado el tablero.', 'Es ideal para presionar en el centro del mapa en oleadas medianas.'],
      Old_Glob: ['Funciona muy bien si quieres estabilidad y apoyo defensivo.', 'A veces conviene conservarlo en puntos estratégicos para no perder presión.'],
      Work_Bombot: ['Bombot gana mucho cuando sabes anticipar los flancos por donde entran los Pyces.', 'No lo uses como relleno: su explosión es más útil si enchufas una ruta clara.'],
      White: ['La familia blanca suele complementar mejor a la hora de controlar distancias y cobertura.', 'Suele ser muy buena para sostener el mapa mientras esperas a que tu daño llegue.'],
      Pink: ['La familia rosa funciona mejor cuando sabes aprovechar la presión y el control de zonas.', 'Si la combinas con un daño fuerte, puedes limpiar más rápido a los enemigos más molestos.'],
      IEx: ['Es excelente para reforzar el daño y la presión en rutas largas, pero no es una torre de sacrificio.', 'Si quieres explosivos de radio puro, Bomb Glob es mucho más directo: explota al entrar alguien en su alcance.'],
      Worker_Glob: ['Es perfecto para sostener la defensa en mapas más abiertos.', 'Aporta estabilidad y te ayuda a mantener el control si la ola empieza a complicarse.'],
      Bomb_Glob: ['Explota cuando alguien entra en su radio; es ideal para limpiar un paso sospechoso.', 'No tiene bonificaciones: su valor está en el sacrificio y en borrar amenazas a tiempo.'],
      Sprout_Glob: ['Sprout_Glob funciona muy bien si quieres más control y ralentización sin perder presión.', 'Los efectos de ralentización te dan más margen para responder antes del choque.'],
      Pirate_Glob: ['Aporta mucho en mapas con más recorrido y presión lateral.', 'Cuando tienes rutas largas, su utilidad y apoyo de control se vuelven muy fuertes.']
    },
    en: {
      Glob: ['Basic Globs hold the early defense; place them well to control the first wave.', 'Globs are not the strongest, but they are the core of your pacing and economy.'],
      Red_Glob: ['The red family is usually best for direct pressure against fast enemies.', 'Pair Red_Glob with support to remove priority targets before they break through.'],
      Soap_Glob: ['It is very useful for slowing attacks and buying time in tougher waves.', 'If enemies accelerate too much, the blue family gives real map control.'],
      Ducky_Glob: ['It favors economy and consistency; do not leave it behind.', 'Ducky is excellent for generating more resources and sustaining long runs.'],
      Comet_Glob: ['The black family deals brutal damage once you already control the board.', 'Comet_Glob is ideal for pressure in the center of the map during mid waves.'],
      Old_Glob: ['Old_Glob works well if you want stability and defensive support.', 'Sometimes it is better to keep it in a strategic spot than to rotate too much.'],
      Work_Bombot: ['Bombot shines when you anticipate where enemies will enter.', 'Do not use it as filler: its blast is more useful if you have a clear route.'],
      White: ['The white family usually complements better when controlling distances and cover.', 'It is very good for holding the map while your damage is still coming together.'],
      Pink: ['The pink family works best when you take advantage of pressure and zone control.', 'If you combine it with strong damage, you can clear the most annoying enemies faster.'],
      IEx: ['IEx is excellent for reinforcing damage and pressure on long routes, but it is not a sacrifice tower.', 'If you want pure blast radius, Bomb Glob is much more direct: it explodes when something enters its range.'],
      Worker_Glob: ['Worker_Glob is perfect for sustaining defense on more open maps.', 'It gives stability and helps maintain control if the wave starts to get messy.'],
      Bomb_Glob: ['Bomb_Glob explodes when someone enters its radius; it is ideal for clearing a risky lane.', 'It has no bonuses or support buffs: its value lies in the sacrifice and in removing threats in time.'],
      Sprout_Glob: ['Sprout_Glob works very well if you want more control and slowing without losing pressure.', 'The slow effects give you more room to react before the clash.'],
      Pirate_Glob: ['It adds a lot on maps with longer paths and lateral pressure.', 'When you have long routes, its utility and control support become very strong.']
    }
  };

  function getLoadingTips(language) {
    const langTips = loadingFamilyTips[language] || loadingFamilyTips.es;
    const orderedTips = Object.entries(langTips).flatMap(([family, tips]) => {
      const label = family === 'Glob' ? 'Glob' : family.replace(/_/g, ' ');
      return tips.map(tip => `${label}: ${tip}`);
    });
    return orderedTips;
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
    const target = e.target instanceof HTMLElement ? e.target : null;
    const isEditingText = target && (
      target.matches('input, textarea, select') ||
      target.isContentEditable ||
      target.closest('input, textarea, select, [contenteditable="true"]')
    );
    if (isEditingText) return;
    if (multiplayerSpectator) return;

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

  document.querySelectorAll('.login-logo, .game-logo').forEach(logo => {
    logo.onclick = () => handleLogoClick(logo);
  });

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

    // DEV_BUILD / GLOB_BUILD: special code only for dev users
    if (code === 'DEV_BUILD' || code === 'GLOB_BUILD') {
      const role = getSessionUserRole();
      if (role !== 'OWNER' && role !== 'DEVBUILD') {
        showMessage('⛔ Código de desarrollo no disponible... ¿Qué pretendías?', 'error');
        input.value = '';
        return;
      }
      if (role === 'OWNER') {
        gameState.pycoins += 9999;
        gameState.duckPassCurrency += 9999;
        gameState.duckPassLevel += 100;
        Object.keys(BADGES).forEach(k => unlockBadge(k));
        Object.keys(TOWER_TYPES).forEach(t => TOWER_TYPES[t].unlocked = true);
        Object.keys(SKIN_META).forEach(s => {
            if(!gameState.unlockedSkins.includes(s)) gameState.unlockedSkins.push(s);
        });
        showMessage('👑 OWNER: +9999 PyCoins/DuckPass, todas las torres, skins y emblemas!', 'success');
      } else if (role === 'DEVBUILD') {
        gameState.pycoins += 500;
        gameState.duckPassCurrency += 500;
        showMessage('🛠️ DEVBUILD: +500 PyCoins y DuckPass', 'success');
      }
      updateMetaUI();
      drawBadges();
      input.value = '';
      return;
    }

    if (gameState.usedCodes[code] && code !== 'CR1-M3-CA+GLD' && code !== 'BLOCK_QUEST') {
      showMessage(translate('code_already_used'), 'warning');
      input.value = '';
      return;
    }

    if (code === 'BLOCK_QUEST') {
      const validMap = gameState.map === 'urbanistic_road';
      const validMode = ['dificil', 'extremo', 'corrupto', 'antiNormal'].includes(gameState.mode);
      if (!validMap || !validMode) {
        showMessage(currentLanguage === 'es' ? 'BLOCK_QUEST requiere Urbanistic Road en Difícil o superior.' : 'BLOCK_QUEST requires Urbanistic Road on Hard or higher.', 'error');
        input.value = '';
        return;
      }
      gameState.blockQuestActive = true;
      gameState.blockQuestPending = true;
      gameState.blockQuestHadBlockTales = gameState.unlockedSkins.includes('corrupt_swords_set');
      gameState.usedCodes[code] = true;
      showMessage(currentLanguage === 'es' ? '🧱 Misión aceptada. La secuencia aparecerá a mitad de la partida.' : '🧱 Quest accepted. The sequence will appear halfway through the game.', 'success');
      saveProgress();
      input.value = '';
      return;
    }

    if (code === 'CR1-M3-CA+GLD') {
      gameState.usedCodes[code] = true;
      saveProgress();
      publishMultiplayerProfile();
      startInterstellarMission(false);
      input.value = '';
      return;
    }

    if (code === 'ONLINE-AVATARS') {
      if (!gameState.profilePurchasedBorders.includes('coded')) {
        gameState.profilePurchasedBorders.push('coded');
      }
      gameState.usedCodes[code] = true;
      updateMetaUI();
      saveProgress();
      if (document.getElementById('profile-modal')?.style.display === 'flex') drawUserProfile();
      publishMultiplayerProfile();
      showMessage(
        currentLanguage === 'en' ? 'Coded profile frame unlocked!' : '¡Borde de perfil Coded desbloqueado!',
        'success'
      );
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
      'FIRSTJTESTER': { py: 123, msg: '123 PyCoins' },
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
      'SERVERS-OVER': { py: 75, dp: 120, msg: '75 PyCoins + 120 DuckPass' },
      'SWITCHEDGAMBLING': { py: 200, dp: 250, msg: '200 PyCoins + 250 DuckPass' },
      'SPANISH-SUPERSTAR': { dp: 350, msg: '350 DuckPass' },
      'GLOBS-ARE-AWESOME': { py: 150, dp: 200, msg: '150 PyCoins + 200 DuckPass' },
      'SUMMERS-OVER': { py: 250, dp: 300, msg: '250 PyCoins + 300 DuckPass' }
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
        const secretCodes = ['PINKWAVE', 'FORGOTTEN', 'HAL-IS-ALL', 'COMUNITTY', 'SERVERS-OVER', 'SWITCHEDGAMBLING', 'SUMMERS-OVER'];
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
    const role = getSessionUserRole();
    if (role !== 'OWNER' && role !== 'DEVBUILD') return; // Only DEV users can use the debug button

    if (!gameState.debugState) {
      // First click: save snapshot & unlock everything
      gameState.debugState = 'unlocked';
      gameState.debugSnapshot = {
        pycoins: gameState.pycoins,
        duckPassCurrency: gameState.duckPassCurrency,
        duckPassXP: gameState.duckPassXP,
        duckPassLevel: gameState.duckPassLevel,
        unlockedSkins: [...(gameState.unlockedSkins || [])],
        unlockedInfinite: gameState.unlockedInfinite,
        unlockedInterstellar: gameState.unlockedInterstellar,
        claimedRewards: [...(gameState.claimedRewards || [])],
        maxedFamilies: [...(gameState.maxedFamilies || [])],
        profileMaxAvatars: [...(gameState.profileMaxAvatars || [])],
        profileMaxRewampAvatars: [...(gameState.profileMaxRewampAvatars || [])],
        profilePurchasedBorders: [...(gameState.profilePurchasedBorders || [])],
        profileMapModeWins: JSON.parse(JSON.stringify(gameState.profileMapModeWins || {})),
        profileAvatar: gameState.profileAvatar,
        profileBorder: gameState.profileBorder,
        hypermutatedEffect: !!gameState.settings.hypermutatedEffect,
        glitchEffect: !!gameState.settings.glitchEffect,
        badges: Object.fromEntries(Object.entries(BADGES).map(([k, v]) => [k, v.unlocked])),
        pycesKilled: JSON.parse(JSON.stringify(gameState.pycesKilled || {})),
        towerTypes: JSON.parse(JSON.stringify(
          Object.fromEntries(Object.keys(TOWER_TYPES).map(k => [k, { unlocked: TOWER_TYPES[k].unlocked }]))
        ))
      };
      // Unlock all towers
      Object.keys(TOWER_TYPES).forEach(k => { TOWER_TYPES[k].unlocked = true; });
      gameState.pycoins = Math.max(gameState.pycoins, 999999);
      gameState.duckPassCurrency = Math.max(gameState.duckPassCurrency, 999999);
      gameState.duckPassXP = Math.max(gameState.duckPassXP, 999999);
      gameState.duckPassLevel = Math.max(gameState.duckPassLevel, 100);
      gameState.unlockedInfinite = true;
      gameState.unlockedInterstellar = true;
      Object.keys(BADGES).forEach(k => {
        BADGES[k].unlocked = true;
        if (!gameState.claimedRewards.includes(k)) gameState.claimedRewards.push(k);
      });
      // Unlock all skins
      const allSkinIds = [];
      Object.values(SKINS_DATA).forEach(arr => arr.forEach(s => allSkinIds.push(s.id)));
      allSkinIds.forEach(id => { if (!gameState.unlockedSkins.includes(id)) gameState.unlockedSkins.push(id); });
      gameState.maxedFamilies = getProfileGlobFamilies().map(({ family }) => family);
      gameState.profileMaxAvatars = [...gameState.maxedFamilies];
      gameState.profileMaxRewampAvatars = [...gameState.maxedFamilies];
      gameState.profilePurchasedBorders = [
        'placeholder',
        'coded',
        ...PROFILE_SHOP_BORDERS.map(border => border.id)
      ];
      gameState.profileMapModeWins = Object.fromEntries(
        PROFILE_MAP_BORDERS.map(border => [border.map, [...PROFILE_MAP_MODES]])
      );
      // Reveal entire encyclopedia: max out all kill counters
      Object.keys(ENEMY_TYPES).forEach(type => {
        const target = typeof getPyceKillTarget === 'function' ? getPyceKillTarget(type) : 9999;
        gameState.pycesKilled[type] = Math.max(gameState.pycesKilled[type] || 0, target);
      });
      showMessage('🛠️ DEBUG: Torres, skins y enciclopedia desbloqueadas. Pulsa de nuevo para restaurar.', 'success');
      const indicator = document.getElementById('admin-indicator');
      indicator.textContent = role === 'OWNER' ? '👑 OWNER MODE' : '🛠 DEVBUILD MODE';
      indicator.style.display = 'block';
    } else {
      // Second click: restore snapshot
      const snap = gameState.debugSnapshot;
      if (snap) {
        Object.keys(TOWER_TYPES).forEach(k => {
          if (snap.towerTypes[k] !== undefined) TOWER_TYPES[k].unlocked = snap.towerTypes[k].unlocked;
        });
        gameState.unlockedSkins = snap.unlockedSkins;
        gameState.pycoins = snap.pycoins;
        gameState.duckPassCurrency = snap.duckPassCurrency;
        gameState.duckPassXP = snap.duckPassXP;
        gameState.duckPassLevel = snap.duckPassLevel;
        gameState.unlockedInfinite = snap.unlockedInfinite;
        gameState.unlockedInterstellar = snap.unlockedInterstellar;
        gameState.claimedRewards = snap.claimedRewards;
        gameState.maxedFamilies = snap.maxedFamilies || [];
        gameState.profileMaxAvatars = snap.profileMaxAvatars || [];
        gameState.profileMaxRewampAvatars = snap.profileMaxRewampAvatars || [];
        gameState.profilePurchasedBorders = snap.profilePurchasedBorders || [];
        gameState.profileMapModeWins = snap.profileMapModeWins || {};
        gameState.profileAvatar = snap.profileAvatar || 'glob:Glob';
        gameState.profileBorder = snap.profileBorder || 'default';
        gameState.settings.hypermutatedEffect = !!snap.hypermutatedEffect;
        gameState.settings.glitchEffect = !!snap.glitchEffect;
        Object.keys(BADGES).forEach(k => { BADGES[k].unlocked = !!snap.badges[k]; });
        // Restore encyclopedia kill counters
        if (snap.pycesKilled) gameState.pycesKilled = JSON.parse(JSON.stringify(snap.pycesKilled));
      }
      gameState.debugState = null;
      gameState.debugSnapshot = null;
      saveProgress();
      updateRoleIndicator();
      showMessage('🔄 DEBUG: Estado restaurado al original.', 'warning');
    }
    updateHypermutatedTowers();
    updateGlitchTowers();
    drawShop();
    drawTowerShop();
    if (document.getElementById('profile-modal')?.style.display === 'flex') drawUserProfile();
    updateUI();
    publishMultiplayerProfile();
    if (role === 'OWNER' || role === 'DEVBUILD') {
      showOwnerDebugPanel();
      document.getElementById('debug-panel-toggle')?.classList.add('visible');
    }
  };

  document.getElementById('close-debug-panel')?.addEventListener('click', () => {
    document.getElementById('owner-debug-panel').style.display = 'none';
  });
  document.getElementById('debug-panel-toggle')?.addEventListener('click', () => {
    const role = getSessionUserRole();
    if (role !== 'OWNER' && role !== 'DEVBUILD') return;
    const panel = document.getElementById('owner-debug-panel');
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('debug-add-resources')?.addEventListener('click', () => {
    if (!isOwnerDebugUser()) return;
    const value = id => Math.max(0, Number(document.getElementById(id)?.value) || 0);
    gameState.globetines += value('debug-globetines');
    gameState.pycoins += value('debug-pycoins');
    gameState.duckPassCurrency += value('debug-duckpass');
    gameState.duckPassXP += value('debug-xp');
    gameState.duckPassLevel = Math.max(gameState.duckPassLevel, value('debug-level') || 1);
    updateUI();
    updateMetaUI();
    saveProgress();
    showMessage('👑 OWNER DEBUG: recursos añadidos.', 'success');
  });
  document.getElementById('debug-max-resources')?.addEventListener('click', () => {
    if (!isOwnerDebugUser()) return;
    gameState.globetines = 999999;
    gameState.pycoins = 999999;
    gameState.duckPassCurrency = 999999;
    gameState.duckPassXP = 999999;
    gameState.duckPassLevel = 100;
    updateUI();
    updateMetaUI();
    saveProgress();
    showMessage('👑 OWNER DEBUG: recursos al máximo.', 'success');
  });
  document.getElementById('debug-unlock-all')?.addEventListener('click', () => {
    if (!isOwnerDebugUser()) return;
    ownerUnlockEverything();
    saveProgress();
    showMessage('👑 OWNER DEBUG: todo desbloqueado.', 'success');
  });
  setupOwnerDebugTools();

  const shopBtn = document.getElementById('open-shop');
  if (shopBtn) shopBtn.onclick = () => { if (typeof openShop === 'function') openShop(); };

  const passBtn = document.getElementById('open-pass');
  if (passBtn) passBtn.onclick = () => { if (typeof openPass === 'function') openPass(); };

  const storyBtn = document.getElementById('open-story-logs');
  if (storyBtn) storyBtn.onclick = () => { openStoryLogs(); };

  const badgesBtn = document.getElementById('badges-toggle-btn');
  if (badgesBtn) badgesBtn.onclick = openEncyclopedia;

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
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', applyScale);
  }
  if (screen.orientation) {
    screen.orientation.addEventListener('change', applyScale);
  }
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
    const mapBalance = ENEMY_BALANCE[gameState.map || 'gelatin_lake'];
    const tier = e.boss ? 'boss' : Object.keys(mapBalance || {}).find(key => mapBalance[key].includes(e.type)) || ((t.health || 0) >= 400 ? 'tank' : (t.health || 0) >= 150 ? 'medium' : 'basic');
    const baseDamage = e.boss ? 10 : (ENEMY_TIER_DAMAGE[tier] || 2);
    return { ...t, type: e.type, tier, baseDamage, x: e.x, y: e.y, health: e.health, maxHealth: e.health, pathIndex: e.pathIndex, boss: !!e.boss };
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

function updateResponsiveGameLayout() {
  const wrapper = document.querySelector('.game-scale-wrapper');
  const gameArea = document.getElementById('game-area');
  if (!wrapper || !gameArea) return;

  const viewport = window.visualViewport;
  const viewportWidth = viewport ? viewport.width : document.documentElement.clientWidth;
  const viewportHeight = viewport ? viewport.height : document.documentElement.clientHeight;
  const mobileAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const shortestSide = Math.min(viewportWidth, viewportHeight);
  const mobileLayout = mobileAgent && shortestSide <= 500;
  const tabletLayout = mobileAgent && shortestSide > 500 && shortestSide <= 1100;
  const compactLayout = (mobileLayout || tabletLayout) && viewportWidth > viewportHeight;
  if (!compactLayout) return;

  const sideWidth = mobileLayout ? 76 : 100;
  const topOffset = 42;
  const gameTopOffset = 92;
  const availableWidth = Math.max(320, viewportWidth - (sideWidth * 2) - 8);
  const availableHeight = Math.max(220, viewportHeight - gameTopOffset - 4);
  const scale = Math.min(availableWidth / 1000, availableHeight / 600, 1);

  wrapper.style.left = `${sideWidth + 4}px`;
  wrapper.style.top = `${gameTopOffset}px`;
  wrapper.style.width = `${availableWidth}px`;
  wrapper.style.height = `${availableHeight}px`;
  gameArea.style.width = '1000px';
  gameArea.style.height = '600px';
  gameArea.style.transform = `scale(${scale})`;

  const towerShop = document.getElementById('tower-shop');
  const languageToggle = document.getElementById('language-toggle');
  const optionsToggle = document.getElementById('options-toggle');
  const metaControls = document.getElementById('meta-controls');
  towerShop?.style.setProperty('position', 'fixed', 'important');
  towerShop?.style.setProperty('left', '3px', 'important');
  towerShop?.style.setProperty('right', 'auto', 'important');
  towerShop?.style.setProperty('top', `${topOffset}px`, 'important');
  languageToggle?.style.setProperty('left', 'auto', 'important');
  languageToggle?.style.setProperty('right', '4px', 'important');
  languageToggle?.style.setProperty('top', '4px', 'important');
  optionsToggle?.style.setProperty('left', 'auto', 'important');
  optionsToggle?.style.setProperty('right', '4px', 'important');
  optionsToggle?.style.setProperty('top', '50px', 'important');
  metaControls?.style.setProperty('left', 'auto', 'important');
  metaControls?.style.setProperty('right', '4px', 'important');
  metaControls?.style.setProperty('top', '92px', 'important');

  const playerList = document.getElementById('multiplayer-player-list');
  playerList?.style.setProperty('left', `${sideWidth + 4}px`);
  playerList?.style.setProperty('right', `${sideWidth + 4}px`);
}

const GAME_DESIGN_W = 1000;
const GAME_DESIGN_H = 600;

function applyScale() {
  const container = document.getElementById('game-container');
  if (!container) return;

  const viewport = window.visualViewport;
  const viewportWidth = viewport ? viewport.width : document.documentElement.clientWidth;
  const viewportHeight = viewport ? viewport.height : document.documentElement.clientHeight;
  const mobileAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const shortestSide = Math.min(viewportWidth, viewportHeight);
  const mobileLayout = mobileAgent && shortestSide <= 500;
  const tabletLayout = mobileAgent && shortestSide > 500 && shortestSide <= 1100;
  const compactLayout = (mobileLayout || tabletLayout) && viewportWidth > viewportHeight;
  document.body.classList.toggle('touch-landscape', compactLayout);
  document.body.classList.toggle('mobile-landscape', mobileLayout && compactLayout);
  document.body.classList.toggle('tablet-landscape', tabletLayout && compactLayout);

  if (compactLayout) {
    container.style.transform = 'none';
    container.style.marginTop = '0';
    container.style.width = '';
    updateResponsiveGameLayout();
    return;
  }

  ['tower-shop', 'language-toggle', 'options-toggle', 'meta-controls', 'multiplayer-player-list'].forEach(id => {
    const element = document.getElementById(id);
    if (!element) return;
    ['position', 'left', 'right', 'top'].forEach(property => element.style.removeProperty(property));
  });

  const area = document.getElementById('game-area');
  const wrapper = document.querySelector('.game-scale-wrapper');
  if (area) {
    area.style.transform = 'none';
  }
  if (wrapper) {
    ['left', 'top', 'width'].forEach(property => wrapper.style.removeProperty(property));
    wrapper.style.height = GAME_DESIGN_H + 'px';
  }

  container.style.transform = 'none';
  container.style.marginTop = '0';
  container.style.width = '1000px'; // Force PC layout width

  // Force reflow
  void container.offsetHeight;

  const cWidth = 1000;
  const cHeight = container.scrollHeight;
  const availW = viewportWidth;
  const playerList = document.getElementById('multiplayer-player-list');
  const profileSpace = gameState.modeConfirmed && playerList && !playerList.hidden
    ? Math.ceil(playerList.getBoundingClientRect().height + 24)
    : 0;
  const availH = Math.max(160, viewportHeight - profileSpace);

  const scaleW = availW / cWidth;
  const scaleH = availH / cHeight;
  
  const scale = Math.min(scaleW, scaleH, 1.0);
  
  container.style.transformOrigin = 'top center';
  container.style.transform = `scale(${scale})`;
  
  const scaledHeight = cHeight * scale;
  if (availH > scaledHeight) {
    const margin = (availH - scaledHeight) / 2;
    container.style.marginTop = `${margin}px`;
  }
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
  if (multiplayerSpectator) return;
  const previousLevel = gameState.duckPassLevel;
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
  checkFutureVoyageBadge();
  if (gameState.duckPassLevel !== previousLevel) publishMultiplayerProfile();
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
    const leftEl = document.getElementById('pass-xp-left');
    if (leftEl) leftEl.textContent = 100 - gameState.duckPassXP;
  }
}

function isTowerOwned(t) {
  if (t === 'Glob' || t === 'Red_Glob' || t === 'Recolors' || t === 'Global') return true;
  if (t === 'Soap_Glob' || t === 'Ducky_Glob' || t === 'Balloon_Glob' || t === 'Streamer_Glob' || t === 'Worker_Glob' || t === 'Bomb_Glob') return !!TOWER_TYPES[t]?.unlocked;
  if (t === 'Work_Bombot' || t === 'Special') return !!(TOWER_TYPES['Work_Bombot'] && TOWER_TYPES['Work_Bombot'].unlocked);
  if (t === 'Old_Glob' || t === 'Pyce_Glob' || t === 'SpyGlob' || t === 'Grey') return !!(TOWER_TYPES['Old_Glob'] && TOWER_TYPES['Old_Glob'].unlocked);
  if (t === 'Sprout_Glob' || t === 'Brown') return !!(TOWER_TYPES['Sprout_Glob'] && TOWER_TYPES['Sprout_Glob'].unlocked);
  if (t === 'Comet_Glob') return !!(TOWER_TYPES['Comet_Glob'] && TOWER_TYPES['Comet_Glob'].unlocked);
  // F. Marina family
  if (t === 'Pirate_Glob' || t === 'PMate_Glob' || t === 'BreathKing_Glob' || t === 'Haunted_Pirate_Glob') return !!(TOWER_TYPES['Pirate_Glob'] && TOWER_TYPES['Pirate_Glob'].unlocked);
  // Urbanistic Road families
  if (t === 'White') return !!TOWER_TYPES['Balloon_Glob']?.unlocked;
  if (t === 'Pink') return !!TOWER_TYPES['Streamer_Glob']?.unlocked;
  if (t === 'IEx') return !!TOWER_TYPES['Bomb_Glob']?.unlocked;
  return false;
}

const PROFILE_MAP_MODES = ['facil', 'normal', 'dificil', 'extremo', 'corrupto', 'antiNormal'];
const PROFILE_MAP_BORDERS = [
  { id: 'map:gelatin_lake', map: 'gelatin_lake', label: 'Gelatin Lake', colors: ['#b7d98b', '#75543b'] },
  { id: 'map:urbanistic_road', map: 'urbanistic_road', label: 'Urbanistic Road', colors: ['#aeb5ba', '#17191d'] },
  { id: 'map:sunlight_seaside', map: 'sunlight_seaside', label: 'Sunlight Seaside', colors: ['#eed28b', '#b8e2ac'] },
  { id: 'map:spooktacular_ruins', map: 'spooktacular_ruins', label: 'Spooktacular Ruins', colors: ['#ed7d32', '#452817'] }
];
const PROFILE_FREE_BORDERS = [
  { id: 'color:green', label: 'Verde', labelEn: 'Green', colors: ['#72e36b', '#202833'] }
];
const PROFILE_PASS_BORDERS = [
  { id: 'color:blue', label: 'Azul', labelEn: 'Blue', colors: ['#62b8ff', '#202833'], level: 10 },
  { id: 'color:pink', label: 'Rosa', labelEn: 'Pink', colors: ['#ff83d2', '#202833'], level: 20 },
  { id: 'color:yellow', label: 'Amarillo', labelEn: 'Yellow', colors: ['#ffe45c', '#202833'], level: 35 },
  { id: 'color:orange', label: 'Naranja', labelEn: 'Orange', colors: ['#ffa34f', '#202833'], level: 60 }
];
const PROFILE_SHOP_BORDERS = [
  { id: 'color:red', label: 'Rojo', labelEn: 'Red', colors: ['#ff5555', '#202833'], cost: 250 },
  { id: 'color:purple', label: 'Morado', labelEn: 'Purple', colors: ['#c18aff', '#202833'], cost: 350 },
  { id: 'color:cyan', label: 'Cian', labelEn: 'Cyan', colors: ['#67e6e1', '#202833'], cost: 350 },
  { id: 'spooky', label: 'Fantasmal', labelEn: 'Spooky', colors: ['#175b30', 'rgba(56, 190, 92, 0.35)'], cost: 500 },
  { id: 'pumpkin', label: 'Calabaza', labelEn: 'Pumpkin', colors: ['#65c86e', '#d77b28'], cost: 500 }
];

function getProfileGlobFamilies() {
  const evolvedTypes = new Set(Object.values(TOWER_TYPES).map(tower => tower.evolution).filter(Boolean));
  const families = new Map();
  Object.keys(TOWER_TYPES).forEach(type => {
    const family = getTowerFamily(type);
    if (family === 'Special') return;
    if (!families.has(family)) families.set(family, []);
    families.get(family).push(type);
  });

  return [...families.entries()].map(([family, types]) => {
    const firstType = types.find(type => !evolvedTypes.has(type));
    if (!firstType) return null;
    let finalType = firstType;
    while (TOWER_TYPES[finalType]?.evolution && types.includes(TOWER_TYPES[finalType].evolution)) {
      finalType = TOWER_TYPES[finalType].evolution;
    }
    return { family, firstType, finalType };
  }).filter(Boolean);
}

function getProfileTowerImage(type) {
  const tower = TOWER_TYPES[type];
  return tower?.image || IMAGE_PATHS[type] || IMAGE_PATHS.Omnipresent_Glob;
}

function getProfileRewampSkin(family, type) {
  return SKINS_DATA[family]?.find(item =>
    REWAMPED_SKIN_IDS.includes(item.id) && item.skins?.[type]
  ) || null;
}

function isProfileRewampUnlocked(family, type) {
  const skin = getProfileRewampSkin(family, type);
  return Boolean(skin && gameState.unlockedSkins.includes(skin.id));
}

function isProfileEnemyFramed(type) {
  const imageGroup = getUniqueProfileEnemies().find(enemy => enemy.types.includes(type));
  if (!imageGroup) return false;
  if (!imageGroup.variantGroup) return Boolean(window._isEnemyFramed?.(type));

  const { canonical, types } = imageGroup.variantGroup;
  const totalTarget = window._getPyceKillTarget?.(canonical);
  if (!Number.isFinite(totalTarget)) return false;

  if (imageGroup.types.includes(canonical)) {
    const totalKills = types.reduce((sum, enemyType) =>
      sum + (gameState.pycesKilled[enemyType] || 0), 0
    );
    return totalKills >= totalTarget;
  }

  const variantTarget = Math.ceil(totalTarget / 4);
  return imageGroup.types.some(enemyType =>
    (gameState.pycesKilled[enemyType] || 0) >= variantTarget
  );
}

function getUniqueProfileEnemies() {
  const enemiesByImage = new Map();
  Object.entries(ENEMY_TYPES).forEach(([type, enemy]) => {
    const image = enemy.image || IMAGE_PATHS[type];
    if (!image) return;
    if (!enemiesByImage.has(image)) {
      enemiesByImage.set(image, { type, image, types: [] });
    }
    enemiesByImage.get(image).types.push(type);
  });
  return [...enemiesByImage.values()].map(enemy => ({
    ...enemy,
    variantGroup: PROFILE_ENEMY_VARIANT_GROUPS.find(group =>
      group.types.some(type => enemy.types.includes(type))
    ) || null
  }));
}

function getProfileRgbRewampSkin(family, type) {
  return SKINS_DATA[family]?.find(item =>
    RGB_REWAMP_SKIN_IDS.includes(item.id) && item.rgbTypes?.includes(type) && item.skins?.[type]
  ) || null;
}

function isProfileRgbRewampUnlocked(skin) {
  return Boolean(skin && (
    gameState.unlockedSkins.includes(skin.id) ||
    isProfileImageUnlockConditionMet(skin)
  ));
}

function isProfileImageUnlockConditionMet(skin) {
  return skin.unlockCondition === 'all_profile_images' && hasUnlockedAllProfileImages();
}

function hasUnlockedAllProfileImages() {
  if (gameState.debugState === 'unlocked') return true;
  const families = getProfileGlobFamilies();
  const globImagesComplete = families.every(({ family, finalType }) => {
    const rewamp = getProfileRewampSkin(family, finalType);
    return isTowerOwned(family) &&
      gameState.maxedFamilies.includes(family) &&
      gameState.profileMaxAvatars.includes(family) &&
      (!rewamp || (
        gameState.unlockedSkins.includes(rewamp.id) &&
        gameState.profileMaxRewampAvatars.includes(family)
      ));
  });
  const enemyImagesComplete = getUniqueProfileEnemies().every(enemy =>
    enemy.types.some(isProfileEnemyFramed)
  );
  return globImagesComplete && enemyImagesComplete;
}

function hasUnlockedAllProfileBorders() {
  if (gameState.debugState === 'unlocked') return true;
  const requiredBorderIds = [
    'default',
    ...PROFILE_FREE_BORDERS.map(border => border.id),
    ...PROFILE_PASS_BORDERS.map(border => border.id),
    ...PROFILE_SHOP_BORDERS.map(border => border.id),
    'interstellar',
    'placeholder',
    'coded',
    ...PROFILE_MAP_BORDERS.map(border => border.id)
  ];
  return requiredBorderIds.every(borderId => {
    if (borderId === 'default') return true;
    if (borderId === 'interstellar') {
      return Boolean(BADGES.unmenaced?.unlocked || BADGES.paracristal_dimension?.unlocked);
    }
    if (borderId.startsWith('map:')) {
      const map = PROFILE_MAP_BORDERS.find(border => border.id === borderId)?.map;
      const wonModes = gameState.profileMapModeWins[map] || [];
      return PROFILE_MAP_MODES.every(mode => wonModes.includes(mode));
    }
    if (PROFILE_PASS_BORDERS.some(border => border.id === borderId)) {
      const passBorder = PROFILE_PASS_BORDERS.find(border => border.id === borderId);
      return gameState.duckPassLevel >= passBorder.level;
    }
    return gameState.profilePurchasedBorders.includes(borderId);
  });
}

function checkGlitchEffectUnlock() {
  if (gameState.glitchUnlocked || gameState.debugState === 'unlocked') return false;

  const interstellarBadges = ['unmenaced', 'urban_crystals', 'paracristal_dimension', 'fracstral_victory'];
  const completedSpecialMaps = PROFILE_MAP_BORDERS.every(({ map }) =>
    ['corrupto', 'antiNormal'].every(mode =>
      (gameState.profileMapModeWins[map] || []).includes(mode)
    )
  );
  const completedInterstellar = interstellarBadges.every(key => BADGES[key]?.unlocked);
  if (
    !hasUnlockedAllProfileImages() ||
    !hasUnlockedAllProfileBorders() ||
    !completedSpecialMaps ||
    !completedInterstellar
  ) return false;

  gameState.glitchUnlocked = true;
  saveProgress();
  const section = document.getElementById('hypermutated-settings');
  if (section) section.style.display = '';
  showMessage(translate('glitch_unlocked'), 'success');
  return true;
}

function getAvailableProfileBorders() {
  const borders = [{ id: 'default', label: currentLanguage === 'en' ? 'Classic' : 'Clásico', colors: ['#8796a5', '#202833'] }];
  borders.push(...PROFILE_FREE_BORDERS.map(border => ({
    id: border.id,
    label: currentLanguage === 'en' ? border.labelEn : border.label,
    colors: border.colors
  })));
  PROFILE_PASS_BORDERS.forEach(border => {
    if (gameState.duckPassLevel >= border.level) {
      borders.push({
        id: border.id,
        label: currentLanguage === 'en' ? border.labelEn : border.label,
        colors: border.colors
      });
    }
  });
  PROFILE_SHOP_BORDERS.forEach(border => {
    if (gameState.profilePurchasedBorders.includes(border.id)) {
      borders.push({
        id: border.id,
        label: currentLanguage === 'en' ? border.labelEn : border.label,
        colors: border.colors
      });
    }
  });
  if (BADGES.unmenaced?.unlocked || BADGES.paracristal_dimension?.unlocked) {
    borders.push({ id: 'interstellar', label: 'Interstellar', colors: ['#ff68d1', '#174caa'] });
  }
  if (gameState.debugState === 'unlocked' ||
      (localStorage.getItem('glob_username') || '').toLowerCase() === 'kirbytebi') {
    borders.push({
      id: 'kirb',
      label: currentLanguage === 'en' ? 'Binary Love' : 'Amor Binario',
      colors: ['#a8ef9c', '#ffb8dc']
    });
  }
  if (gameState.profilePurchasedBorders.includes('placeholder')) {
    borders.push({ id: 'placeholder', label: 'Placeholder', colors: ['#777777', '#050505'] });
  }
  if (gameState.profilePurchasedBorders.includes('coded')) {
    borders.push({ id: 'coded', label: 'Coded', colors: ['#050505', '#258a45'] });
  }
  PROFILE_MAP_BORDERS.forEach(border => {
    const wonModes = gameState.profileMapModeWins[border.map] || [];
    if (PROFILE_MAP_MODES.every(mode => wonModes.includes(mode))) {
      borders.push({ ...border, label: border.label });
    }
  });
  if (hasUnlockedAllProfileImages() && hasUnlockedAllProfileBorders()) {
    borders.push({
      id: 'rainbow',
      label: currentLanguage === 'en' ? 'Rainbow Fever' : 'Fiebre Arcoiris',
      colors: ['#ff5050', '#202833'],
      rainbow: true
    });
  }
  return borders;
}

function getProfileAvatarChoices() {
  const avatars = [{
    id: 'glob:Glob',
    label: currentLanguage === 'en' ? 'Glob' : 'Glob',
    image: getProfileTowerImage('Glob')
  }];
  if (isTowerOwned('Red_Glob')) {
    avatars.push({
      id: 'glob:Red_Glob',
      label: translate(TOWER_TYPES.Red_Glob.name),
      image: getProfileTowerImage('Red_Glob')
    });
  }
  getProfileGlobFamilies().forEach(({ family, firstType, finalType }) => {
    if (!isTowerOwned(family)) return;
    const firstAvatarId = `glob:${firstType}`;
    if (!avatars.some(avatar => avatar.id === firstAvatarId)) {
      avatars.push({
        id: firstAvatarId,
        label: translate(TOWER_TYPES[firstType].name),
        image: getProfileTowerImage(firstType)
      });
    }
    if (isProfileRewampUnlocked(family, firstType)) {
      const rewampSkin = getProfileRewampSkin(family, firstType);
      avatars.push({
        id: `glob:${firstType}:rewamp`,
        label: `${translate(TOWER_TYPES[firstType].name)} Rewamp`,
        image: rewampSkin.skins[firstType]
      });
    }
    const firstRgbSkin = getProfileRgbRewampSkin(family, firstType);
    if (isProfileRgbRewampUnlocked(firstRgbSkin)) {
      avatars.push({
        id: `glob:${firstType}:rgb-rewamp`,
        label: firstRgbSkin.names?.[firstType] || `${translate(TOWER_TYPES[firstType].name)} RGB`,
        image: firstRgbSkin.skins[firstType],
        rgb: true
      });
    }
    if (gameState.profileMaxAvatars.includes(family)) {
      avatars.push({
        id: `glob:${finalType}`,
        label: translate(TOWER_TYPES[finalType].name),
        image: getProfileTowerImage(finalType)
      });
    }
    if (gameState.profileMaxRewampAvatars.includes(family) &&
        isProfileRewampUnlocked(family, finalType)) {
      const rewampSkin = getProfileRewampSkin(family, finalType);
      avatars.push({
        id: `glob:${finalType}:rewamp`,
        label: `${translate(TOWER_TYPES[finalType].name)} Rewamp`,
        image: rewampSkin.skins[finalType]
      });
    }
    const finalRgbSkin = getProfileRgbRewampSkin(family, finalType);
    if (gameState.profileMaxAvatars.includes(family) &&
        isProfileRgbRewampUnlocked(finalRgbSkin)) {
      avatars.push({
        id: `glob:${finalType}:rgb-rewamp`,
        label: finalRgbSkin.names?.[finalType] || `${translate(TOWER_TYPES[finalType].name)} RGB`,
        image: finalRgbSkin.skins[finalType],
        rgb: true
      });
    }
  });
  getUniqueProfileEnemies().forEach(({ type, image, types }) => {
    if (!types.some(isProfileEnemyFramed)) return;
    avatars.push({
      id: `enemy:${type}`,
      label: translate(ENEMY_TYPES[type].name),
      image
    });
  });
  if (gameState.debugState === 'unlocked' ||
      (localStorage.getItem('glob_username') || '').toLowerCase() === 'kirbytebi') {
    avatars.push({
      id: 'special:kirbytebi',
      label: currentLanguage === 'en' ? 'Kirb' : 'Kirb',
      image: IMAGE_PATHS.Kirb_Glob
    });
  }
  if (gameState.debugState === 'unlocked' ||
      gameState.profileSpecialAvatars.includes('placeholder-glob')) {
    avatars.push({
      id: 'special:placeholder-glob',
      label: 'Placeholder Glob',
      image: IMAGE_PATHS.Omnipresent_Glob
    });
  }
  return avatars;
}

function getProfileAvatarById(avatarId) {
  const avatars = getProfileAvatarChoices();
  const legacyRainbowRewamp = avatars.find(avatar => avatar.id === 'glob:Rainbow_Glob:rgb-rewamp');
  return avatars.find(avatar => avatar.id === avatarId) ||
    (avatarId === 'special:rainbow-rewamp' ? legacyRainbowRewamp : null) ||
    avatars[0];
}

function getProfileBorderById(borderId) {
  return getAvailableProfileBorders().find(border => border.id === borderId) ||
    getAvailableProfileBorders()[0];
}

function renderProfileShop(container) {
  const heading = document.createElement('div');
  heading.className = 'profile-shop-heading';
  heading.textContent = currentLanguage === 'en'
    ? 'Profile collection'
    : 'Colección de perfil';
  container.appendChild(heading);

  getProfileGlobFamilies().forEach(({ family, finalType }) => {
    if (!isTowerOwned(family) || !gameState.maxedFamilies.includes(family)) return;
    const variants = [{ rewamp: false, image: getProfileTowerImage(finalType) }];
    if (isProfileRewampUnlocked(family, finalType)) {
      variants.push({ rewamp: true, image: getProfileRewampSkin(family, finalType).skins[finalType] });
    }
    variants.forEach(({ rewamp, image }) => {
      const owned = (rewamp ? gameState.profileMaxRewampAvatars : gameState.profileMaxAvatars).includes(family);
      const card = document.createElement('div');
      card.className = `meta-item ${owned ? 'unlocked' : ''}`;
      card.innerHTML = `
        <img class="profile-shop-image" src="${encodeURI(image)}" alt="">
        <h3>${currentLanguage === 'en' ? 'Max evolution' : 'Evolución máxima'}${rewamp ? ' Rewamp' : ''}: ${translate(TOWER_TYPES[finalType].name)}</h3>
        <p>${rewamp
          ? (currentLanguage === 'en' ? 'Requires the Rewamp skin and maxing this family at least once.' : 'Requiere la skin Rewamp y haber maxeado esta familia al menos una vez.')
          : (currentLanguage === 'en' ? 'Unlocked after maxing this family at least once.' : 'Disponible tras maxear esta familia al menos una vez.')}</p>
        <div class="cost">${owned ? '✅' : '<img src="img/Tokens/PyCoin.png" width="18"> 300 + <img src="img/Tokens/DuckPass.png" width="18"> 150'}</div>
        <button class="meta-buy-btn" ${owned || gameState.pycoins < 300 || gameState.duckPassCurrency < 150 ? 'disabled' : ''}
          onclick="buyProfileMaxAvatar('${family}', ${rewamp})">${owned ? (currentLanguage === 'en' ? 'Owned' : 'Comprado') : translate('buy')}</button>`;
      container.appendChild(card);
    });
  });

  const placeholderOwned = gameState.profilePurchasedBorders.includes('placeholder');
  const placeholderCard = document.createElement('div');
  placeholderCard.className = `meta-item ${placeholderOwned ? 'unlocked' : ''}`;
  placeholderCard.innerHTML = `
    <div class="profile-placeholder-sample" aria-hidden="true"></div>
    <h3>Placeholder</h3>
    <p>${currentLanguage === 'en' ? 'Black background with a grey frame.' : 'Fondo negro con borde gris.'}</p>
    <div class="cost">${placeholderOwned ? '✅' : '<img src="img/Tokens/DuckPass.png" width="18"> 250'}</div>
    <button class="meta-buy-btn" ${placeholderOwned || gameState.duckPassCurrency < 250 ? 'disabled' : ''}
      onclick="buyProfileBorder('placeholder')">${placeholderOwned ? (currentLanguage === 'en' ? 'Owned' : 'Comprado') : translate('buy')}</button>`;
  container.appendChild(placeholderCard);

  PROFILE_SHOP_BORDERS.forEach(border => {
    const owned = gameState.profilePurchasedBorders.includes(border.id);
    const card = document.createElement('div');
    card.className = `meta-item ${owned ? 'unlocked' : ''}`;
    card.innerHTML = `
      <div class="profile-placeholder-sample" style="--profile-border-start:${border.colors[0]};--profile-border-end:${border.colors[1]};" aria-hidden="true"></div>
      <h3>${currentLanguage === 'en' ? border.labelEn : border.label}</h3>
      <p>${border.id === 'spooky'
        ? (currentLanguage === 'en' ? 'Translucent green background with a dark green frame.' : 'Fondo verde translúcido con borde verde oscuro.')
        : border.id === 'pumpkin'
          ? (currentLanguage === 'en' ? 'Orange background with a green frame.' : 'Fondo naranja con borde verde.')
          : (currentLanguage === 'en' ? 'A colored profile frame.' : 'Un borde de perfil de color.')}</p>
      <div class="cost">${owned ? '✅' : `<img src="img/Tokens/DuckPass.png" width="18"> ${border.cost}`}</div>
      <button class="meta-buy-btn" ${owned || gameState.duckPassCurrency < border.cost ? 'disabled' : ''}
        onclick="buyProfileBorder('${border.id}')">${owned ? (currentLanguage === 'en' ? 'Owned' : 'Comprado') : translate('buy')}</button>`;
    container.appendChild(card);
  });
}

window.buyProfileMaxAvatar = function(family, rewamp = false) {
  const familyInfo = getProfileGlobFamilies().find(item => item.family === family);
  if (!familyInfo || !isTowerOwned(family) || !gameState.maxedFamilies.includes(family) ||
      (rewamp
        ? (!isProfileRewampUnlocked(family, familyInfo.finalType) || gameState.profileMaxRewampAvatars.includes(family))
        : gameState.profileMaxAvatars.includes(family))) return;
  if (gameState.pycoins < 300 || gameState.duckPassCurrency < 150) {
    showMessage(translate('notEnoughMoney'), 'error');
    return;
  }
  gameState.pycoins -= 300;
  gameState.duckPassCurrency -= 150;
  (rewamp ? gameState.profileMaxRewampAvatars : gameState.profileMaxAvatars).push(family);
  drawShop();
  updateMetaUI();
  saveProgress();
  showMessage(
    rewamp
      ? (currentLanguage === 'en' ? 'Rewamp max-evolution profile picture unlocked!' : '¡Imagen Rewamp de evolución máxima desbloqueada!')
      : (currentLanguage === 'en' ? 'Max-evolution profile picture unlocked!' : '¡Imagen de perfil de evolución máxima desbloqueada!'),
    'success'
  );
  publishMultiplayerProfile();
};

window.buyProfileBorder = function(borderId) {
  const shopBorder = PROFILE_SHOP_BORDERS.find(border => border.id === borderId);
  if ((borderId !== 'placeholder' && !shopBorder) || gameState.profilePurchasedBorders.includes(borderId)) return;
  const cost = shopBorder?.cost || 250;
  if (gameState.duckPassCurrency < cost) {
    showMessage(translate('notEnoughMoney'), 'error');
    return;
  }
  gameState.duckPassCurrency -= cost;
  gameState.profilePurchasedBorders.push(borderId);
  drawShop();
  updateMetaUI();
  saveProgress();
  if (document.getElementById('profile-modal')?.style.display === 'flex') drawUserProfile();
  const borderName = shopBorder
    ? (currentLanguage === 'en' ? shopBorder.labelEn : shopBorder.label)
    : 'Placeholder';
  showMessage(
    currentLanguage === 'en' ? `${borderName} profile frame unlocked!` : `¡Borde ${borderName} desbloqueado!`,
    'success'
  );
};

window.openUserProfile = function() {
  multiplayerViewedProfile = null;
  drawUserProfile();
  document.getElementById('profile-modal').style.display = 'flex';
};

window.closeUserProfile = function() {
  multiplayerViewedProfile = null;
  closeModal('profile-modal');
};

function openMultiplayerPlayerProfile(playerId, fallbackPlayer) {
  const player = multiplayerPlayers.find(item => item.playerId === playerId) || fallbackPlayer;
  if (!player) return;
  multiplayerViewedProfile = {
    playerId,
    username: typeof player.username === 'string' ? player.username : (currentLanguage === 'en' ? 'Player' : 'Jugador'),
    profile: player.profile && typeof player.profile === 'object' ? player.profile : {}
  };
  drawViewedMultiplayerProfile();
  document.getElementById('profile-modal').style.display = 'flex';
}

function appendPublicProfileStat(container, label, value) {
  const stat = document.createElement('div');
  stat.className = 'public-profile-stat';
  const valueElement = document.createElement('strong');
  valueElement.textContent = String(value);
  const labelElement = document.createElement('span');
  labelElement.textContent = label;
  stat.append(valueElement, labelElement);
  container.appendChild(stat);
}

function drawViewedMultiplayerProfile() {
  const viewed = multiplayerViewedProfile;
  const container = document.getElementById('profile-content');
  if (!viewed || !container) return;
  const profile = viewed.profile;
  const title = document.getElementById('profile-title');
  if (title) title.textContent = currentLanguage === 'en'
    ? `${viewed.username}'s profile`
    : `Perfil de ${viewed.username}`;
  const shopButton = document.querySelector('.profile-shop-button');
  if (shopButton) shopButton.hidden = true;
  container.replaceChildren();

  const preview = document.createElement('div');
  preview.className = 'profile-preview public-profile-preview';
  preview.appendChild(createMultiplayerProfileBadge(profile, 88));
  const name = document.createElement('h3');
  name.textContent = viewed.username;
  preview.appendChild(name);
  const cosmetics = document.createElement('p');
  cosmetics.textContent = `${currentLanguage === 'en' ? 'Avatar' : 'Imagen'}: ${profile.avatarLabel || 'Glob'} · ${currentLanguage === 'en' ? 'Frame' : 'Borde'}: ${profile.borderLabel || (currentLanguage === 'en' ? 'Classic' : 'Clásico')}`;
  preview.appendChild(cosmetics);
  container.appendChild(preview);

  const badges = Array.isArray(profile.unlockedBadges)
    ? [...new Set(profile.unlockedBadges.filter(key => typeof key === 'string' && BADGES[key]))]
    : [];
  const totalBadges = Object.keys(BADGES).length;
  const level = Math.max(1, Number(profile.duckPassLevel) || 1);
  const xp = Math.max(0, Math.min(99, Number(profile.duckPassXP) || 0));
  const families = Array.isArray(profile.maxedFamilies) ? new Set(profile.maxedFamilies) : new Set();
  const rewampFamilies = Array.isArray(profile.maxedRewampFamilies) ? new Set(profile.maxedRewampFamilies) : new Set();
  const stats = document.createElement('div');
  stats.className = 'public-profile-stats';
  appendPublicProfileStat(stats, currentLanguage === 'en' ? 'Duck Pass level' : 'Nivel del Duck Pass', level);
  appendPublicProfileStat(stats, currentLanguage === 'en' ? 'Pass progress' : 'Progreso del Pass', `${xp}/100 XP`);
  appendPublicProfileStat(stats, currentLanguage === 'en' ? 'Achievements' : 'Logros', `${badges.length}/${totalBadges}`);
  appendPublicProfileStat(stats, currentLanguage === 'en' ? 'Maxed families' : 'Familias al máximo', `${families.size}/${getProfileGlobFamilies().length}`);
  appendPublicProfileStat(stats, currentLanguage === 'en' ? 'Rewamp families' : 'Familias Rewamp', rewampFamilies.size);
  container.appendChild(stats);

  const mapHeading = document.createElement('h3');
  mapHeading.textContent = currentLanguage === 'en' ? 'Map records' : 'Récords por mapa';
  container.appendChild(mapHeading);
  const mapRecords = document.createElement('div');
  mapRecords.className = 'public-profile-maps';
  PROFILE_MAP_BORDERS.forEach(({ map }) => {
    const record = document.createElement('p');
    const wins = profile.mapModeWins?.[map];
    const modes = Array.isArray(wins) ? wins.filter(mode => PROFILE_MAP_MODES.includes(mode)) : [];
    const modeLabels = modes.map(mode => {
      const labels = currentLanguage === 'en'
        ? { facil: 'Easy', normal: 'Normal', dificil: 'Hard', extremo: 'Extreme', corrupto: 'Corrupt', antiNormal: 'Anti-Normal' }
        : { facil: 'Fácil', normal: 'Normal', dificil: 'Difícil', extremo: 'Extremo', corrupto: 'Corrupto', antiNormal: 'Anti-Normal' };
      return labels[mode];
    });
    record.textContent = `${MAPS[map]?.name || map}: ${modeLabels.length ? modeLabels.join(', ') : (currentLanguage === 'en' ? 'No victories yet' : 'Sin victorias todavía')}`;
    mapRecords.appendChild(record);
  });
  container.appendChild(mapRecords);

  const achievementHeading = document.createElement('h3');
  achievementHeading.textContent = currentLanguage === 'en' ? 'Achievements' : 'Logros';
  container.appendChild(achievementHeading);
  const categoryFilter = document.createElement('select');
  categoryFilter.className = 'public-profile-achievement-filter';
  categoryFilter.setAttribute('aria-label', currentLanguage === 'en' ? 'Filter achievements by category' : 'Filtrar logros por categoría');
  const categories = [...new Set(badges.map(key => BADGES[key].category))].sort();
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = currentLanguage === 'en' ? 'All categories' : 'Todas las categorías';
  categoryFilter.appendChild(allOption);
  const categoryLabels = currentLanguage === 'en'
    ? { modos: 'Modes', misiones: 'Missions', interacciones: 'Interactions', economia: 'Economy' }
    : { modos: 'Modos', misiones: 'Misiones', interacciones: 'Interacciones', economia: 'Economía' };
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = categoryLabels[category] || category;
    categoryFilter.appendChild(option);
  });
  const achievementList = document.createElement('ul');
  achievementList.className = 'public-profile-achievements';
  const drawAchievements = () => {
    achievementList.replaceChildren();
    const filtered = badges.filter(key => categoryFilter.value === 'all' || BADGES[key].category === categoryFilter.value);
    if (!filtered.length) {
      const empty = document.createElement('li');
      empty.textContent = currentLanguage === 'en' ? 'No achievements in this category.' : 'No hay logros en esta categoría.';
      achievementList.appendChild(empty);
      return;
    }
    filtered.forEach(key => {
      const badge = BADGES[key];
      const item = document.createElement('li');
      const icon = document.createElement('span');
      icon.textContent = typeof badge.icon === 'string' && !badge.icon.includes('<') ? badge.icon : '🏆';
      const text = document.createElement('span');
      const name = document.createElement('strong');
      name.textContent = translate(`badge_${badge.key}_name`);
      const description = document.createElement('small');
      description.textContent = translate(`badge_${badge.key}_desc`);
      text.append(name, description);
      item.append(icon, text);
      achievementList.appendChild(item);
    });
  };
  categoryFilter.addEventListener('change', drawAchievements);
  drawAchievements();
  container.append(categoryFilter, achievementList);
}

window.equipProfileAvatar = function(avatarId) {
  if (!getProfileAvatarChoices().some(avatar => avatar.id === avatarId)) return;
  gameState.profileAvatar = avatarId;
  saveProgress();
  drawUserProfile();
  publishMultiplayerProfile();
};

window.equipProfileBorder = function(borderId) {
  if (!getAvailableProfileBorders().some(border => border.id === borderId)) return;
  gameState.profileBorder = borderId;
  saveProgress();
  drawUserProfile();
  publishMultiplayerProfile();
};

function drawUserProfile() {
  if (multiplayerViewedProfile) {
    drawViewedMultiplayerProfile();
    return;
  }
  const container = document.getElementById('profile-content');
  if (!container) return;
  const title = document.getElementById('profile-title');
  if (title) title.textContent = currentLanguage === 'en' ? 'User profile' : 'Perfil de usuario';
  const profileButton = document.getElementById('open-profile');
  if (profileButton) {
    profileButton.innerHTML = `👤 <span class="meta-btn-text">${currentLanguage === 'en' ? 'Profile' : 'Perfil'}</span>`;
  }
  const shopButtonLabel = document.querySelector('.profile-shop-button span');
  if (shopButtonLabel) shopButtonLabel.textContent = currentLanguage === 'en' ? 'Profile customization shop' : 'Tienda de personalización';
  const shopButton = document.querySelector('.profile-shop-button');
  if (shopButton) shopButton.hidden = false;
  const avatar = getProfileAvatarById(gameState.profileAvatar);
  const border = getProfileBorderById(gameState.profileBorder);
  if (!avatar || !border) return;
  const username = localStorage.getItem('glob_username') || (currentLanguage === 'en' ? 'Player' : 'Jugador');
  container.innerHTML = `
    <div class="profile-preview">
      <div class="profile-avatar-frame ${border.rainbow ? 'rainbow' : ''}" style="--profile-border-start:${border.colors[0]};--profile-border-end:${border.colors[1]};">
        ${getProfileAvatarImageMarkup(avatar, border.rainbow)}
      </div>
      <h3>${username}</h3>
      <p>${currentLanguage === 'en' ? 'Avatar' : 'Imagen'}: ${avatar.label} · ${currentLanguage === 'en' ? 'Frame' : 'Borde'}: ${border.label}</p>
    </div>
    <h3>${currentLanguage === 'en' ? 'Choose an avatar' : 'Elige una imagen'}</h3>
    <div class="profile-choice-grid">
      ${getProfileAvatarChoices().map(choice => `
        <button class="profile-choice ${choice.id === avatar.id ? 'selected' : ''}" type="button"
          onclick="equipProfileAvatar('${choice.id}')">
          ${getProfileAvatarImageMarkup(choice)}<span>${choice.label}</span>
        </button>`).join('')}
    </div>
    <h3>${currentLanguage === 'en' ? 'Choose a frame' : 'Elige un borde'}</h3>
    <div class="profile-border-grid">
      ${getAvailableProfileBorders().map(choice => `
        <button class="profile-border-choice ${choice.id === border.id ? 'selected' : ''}" type="button"
          style="--profile-border-start:${choice.colors[0]};--profile-border-end:${choice.colors[1]};"
          onclick="equipProfileBorder('${choice.id}')">
          <span class="profile-border-swatch ${choice.rainbow ? 'rainbow' : ''}"></span><span>${choice.label}</span>
        </button>`).join('')}
    </div>`;
}

function getProfileAvatarImageMarkup(avatar, applyRgbEffect = false) {
  const imageUrl = encodeURI(avatar.image);
  const rgb = avatar.rgb || applyRgbEffect;
  const image = `<img src="${imageUrl}" alt="${rgb ? '' : avatar.label}">`;
  return rgb
    ? `<span class="rgb-avatar-image" style="--rgb-avatar-mask-image:url('${imageUrl}')">${image}</span>`
    : image;
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
      <button class="shop-tab-btn ${currentShopTab === 'profile' ? 'active' : ''}" onclick="switchShopTab('profile')">${currentLanguage === 'en' ? 'Profile' : 'Perfil'}</button>
    </div>
    <div class="shop-balance">
      <div class="balance-item"><img src="img/Tokens/PyCoin.png" width="20"> <span>${Math.floor(gameState.pycoins)} PyCoins</span></div>
      <div class="balance-item"><img src="img/Tokens/DuckPass.png" width="20"> <span>${gameState.duckPassCurrency} Duck Pass</span></div>
    </div>
  `;

  if (currentShopTab === 'upgrades') {
    const upgrades = [
      { id: 'hp', name: 'upgrade_hp_name', desc: 'upgrade_hp_desc', cost: 50, type: 'pycoin', level: gameState.baseHealthLevel, max: 10 },
      { id: 'unlock_Soap_Glob', name: 'tower_Soap_Glob_name', desc: 'tower_Soap_Glob_desc', cost: 150, type: 'pycoin', hideIfUnlocked: true },
      { id: 'unlock_Ducky_Glob', name: 'tower_Ducky_Glob_name', desc: 'tower_Ducky_Glob_desc', cost: 150, type: 'pycoin', hideIfUnlocked: true },
      { id: 'unlock_Old_Glob', name: 'upgrade_unlock_old_name', desc: 'upgrade_unlock_old_desc', cost: 150, type: 'pycoin', hideIfUnlocked: true },
      { id: 'unlock_Comet_Glob', name: 'upgrade_unlock_comet_name', desc: 'upgrade_unlock_comet_desc', cost: 250, type: 'pycoin', hideIfUnlocked: true },
      { id: 'unlock_Sprout_Glob', name: 'upgrade_unlock_sprout_name', desc: 'upgrade_unlock_sprout_desc', cost: 150, type: 'pycoin', hideIfUnlocked: true },
      { id: 'unlock_Balloon_Glob', name: 'tower_Balloon_Glob_name', desc: 'tower_Balloon_Glob_desc', cost: 250, type: 'pycoin', hideIfUnlocked: true },
      { id: 'unlock_Streamer_Glob', name: 'tower_Streamer_Glob_name', desc: 'tower_Streamer_Glob_desc', cost: 250, type: 'pycoin', hideIfUnlocked: true },
      { id: 'unlock_Worker_Glob', name: 'tower_Worker_Glob_name', desc: 'tower_Worker_Glob_desc', cost: 250, type: 'pycoin', hideIfUnlocked: true },
      { id: 'unlock_Bomb_Glob', name: 'tower_Bomb_Glob_name', desc: 'tower_IEx1_desc', cost: 300, type: 'pycoin', hideIfUnlocked: true },
      { id: 'unlock_Pirate_Glob', name: 'tower_Pirate_Glob_name', desc: 'tower_Pirate_Glob_desc', cost: 350, type: 'pycoin', hideIfUnlocked: true },

      { id: 'meta_damage', name: 'upgrade_damage_name', desc: 'upgrade_damage_desc', cost: 15, type: 'duckpass', level: gameState.metaDamageLevel, max: 5 }
    ];
    const MAX_LIMITS = {
      'Glob': 8, 'Red_Glob': 11, 'Soap_Glob': 5, 'Ducky_Glob': 8,
      'Comet_Glob': 6, 'Old_Glob': 4, 'Work_Bombot': 2, 'Worker_Glob': 4,
      'Sprout_Glob': 6, 'Pirate_Glob': 3
    };

    ['Glob', 'Red_Glob', 'Soap_Glob', 'Ducky_Glob', 'Comet_Glob', 'Old_Glob', 'Work_Bombot', 'Worker_Glob', 'Sprout_Glob', 'Pirate_Glob'].forEach(t => {
      const isUnlocked = isTowerOwned(t);
      const maxLim = MAX_LIMITS[t] || 10;

      if (isUnlocked && gameState.towerLimits[t] < maxLim) {
        upgrades.push({ id: 'limit_' + t, name: 'upgrade_limit_name', desc: 'upgrade_limit_desc', cost: 30, type: 'pycoin', params: { name: translate(TOWER_TYPES[t].name) } });
      }
    });

    upgrades.forEach(u => {
      if (u.id === 'unlock_Old_Glob' && TOWER_TYPES['Old_Glob'].unlocked) return;
      if (u.id === 'unlock_Comet_Glob' && TOWER_TYPES['Comet_Glob'].unlocked) return;
      if (u.id === 'unlock_Sprout_Glob' && TOWER_TYPES['Sprout_Glob'].unlocked) return;
      if (u.id === 'unlock_Soap_Glob' && TOWER_TYPES['Soap_Glob'].unlocked) return;
      if (u.id === 'unlock_Ducky_Glob' && TOWER_TYPES['Ducky_Glob'].unlocked) return;
      if (u.id === 'unlock_Balloon_Glob' && TOWER_TYPES['Balloon_Glob'].unlocked) return;
      if (u.id === 'unlock_Streamer_Glob' && TOWER_TYPES['Streamer_Glob'].unlocked) return;
      if (u.id === 'unlock_Worker_Glob' && TOWER_TYPES['Worker_Glob'].unlocked) return;
      if (u.id === 'unlock_Bomb_Glob' && TOWER_TYPES['Bomb_Glob'].unlocked) return;
      if (u.id === 'unlock_Pirate_Glob' && TOWER_TYPES['Pirate_Glob'].unlocked) return;
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
      { id: 'dg_Glob', name: 'duckgrade_glob_name', desc: 'duckgrade_glob_desc', cost: 215, family: 'Glob' },
      { id: 'dg_Red_Glob', name: 'duckgrade_red_name', desc: 'duckgrade_red_desc', cost: 230, family: 'Red_Glob' },
      { id: 'dg_Soap_Glob', name: 'duckgrade_soap_name', desc: 'duckgrade_soap_desc', cost: 150, family: 'Soap_Glob' },
      { id: 'dg_Comet_Glob', name: 'duckgrade_comet_name', desc: 'duckgrade_comet_desc', cost: 200, family: 'Comet_Glob' },
      { id: 'dg_Grey', name: 'duckgrade_grey_name', desc: 'duckgrade_grey_desc', cost: 227, family: 'Special' },
      { id: 'dg_Work_Bombot', name: 'duckgrade_bombot_name', desc: 'duckgrade_bombot_desc', cost: 30, family: 'Special' },
      { id: 'dg_Ducky_Glob', name: 'duckgrade_duck_name', desc: 'duckgrade_duck_desc', cost: 150, family: 'Ducky_Glob' },
      { id: 'dg_IEx', name: 'duckgrade_iex_name', desc: 'duckgrade_iex_desc', cost: 195, family: 'IEx' },
      { id: 'dg_Worker_Glob', name: 'duckgrade_worker_name', desc: 'duckgrade_worker_desc', cost: 150, family: 'Worker_Glob' },
      { id: 'dg_Brown', name: 'duckgrade_brown_name', desc: 'duckgrade_brown_desc', cost: 200, family: 'Brown' },
      { id: 'dg_Pirate_Glob', name: 'duckgrade_pirate_name', desc: 'duckgrade_pirate_desc', cost: 220, family: 'Pirate_Glob' },
      { id: 'dg_White', name: 'duckgrade_white_name', desc: 'duckgrade_white_desc', cost: 180, family: 'White' },
      { id: 'dg_Pink', name: 'duckgrade_pink_name', desc: 'duckgrade_pink_desc', cost: 220, family: 'Pink' }
    ];

    const filteredDgs = dgs.filter(u => {
      if (u.id === 'dg_Glob' || u.id === 'dg_Red_Glob') return true;
      if (u.id === 'dg_Soap_Glob') return isTowerOwned('Soap_Glob');
      if (u.id === 'dg_Comet_Glob') return isTowerOwned('Comet_Glob');
      if (u.id === 'dg_Grey') return isTowerOwned('Old_Glob');
      if (u.id === 'dg_Work_Bombot') return isTowerOwned('Work_Bombot');
      if (u.id === 'dg_Ducky_Glob') return isTowerOwned('Ducky_Glob');
      if (u.id === 'dg_IEx') return isTowerOwned('Bomb_Glob');
      if (u.id === 'dg_Worker_Glob') return isTowerOwned('Worker_Glob');
      if (u.id === 'dg_Brown') return isTowerOwned('Sprout_Glob');
      if (u.id === 'dg_Pirate_Glob') return isTowerOwned('Pirate_Glob');
      if (u.id === 'dg_White') return isTowerOwned('White');
      if (u.id === 'dg_Pink') return isTowerOwned('Pink');
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
      { id: 'Worker_Glob', name: translate('gtack_worker_name'), desc: translate('gtack_worker_desc'), pyCost: 600, dpCost: 200 },
      { id: 'Brown', name: translate('gtack_brown_name'), desc: translate('gtack_brown_desc'), pyCost: 650, dpCost: 210 },
      { id: 'Pirate_Glob', name: translate('gtack_pirate_name'), desc: translate('gtack_pirate_desc'), pyCost: 700, dpCost: 230 },
      { id: 'White', name: translate('gtack_white_name'), desc: translate('gtack_white_desc'), pyCost: 600, dpCost: 200 },
      { id: 'Pink', name: translate('gtack_pink_name'), desc: translate('gtack_pink_desc'), pyCost: 700, dpCost: 230 }
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
    if (!window.activeSkinFilter) window.activeSkinFilter = 'all';

    const missionSkinIds = ['corrupt_swords_set', 'fracstal_set', 'old_tycoon_set', 'cuby_bombot'];
    const otherNewSkinIds = ['astrorb_set', 'crystal_bombot', 'cuby_bombot', 'pyce_morph', 'dreams_set', 'froggy_set'];
    const storeUnlockableIds = [...missionSkinIds, ...otherNewSkinIds];

    const filterDiv = document.createElement('div');
    filterDiv.className = 'shop-filters';
    filterDiv.style.cssText = 'grid-column: 1 / -1; display:flex; justify-content:center; gap:8px; margin-bottom:15px; flex-wrap:wrap; width: 100%;';
    
    const filters = [
      { id: 'all', label: 'Todos' },
      { id: 'new', label: 'Nuevas' },
      { id: 'buyable', label: 'Comprables' },
      { id: 'special', label: 'Especiales' },
      { id: 'equipped', label: 'Equipados' },
      { id: 'unlockable', label: 'Desbloqueables' }
    ];

    filters.forEach(f => {
      const btn = document.createElement('button');
      btn.className = 'meta-btn';
      btn.innerText = f.label;
      btn.style.padding = '5px 10px';
      btn.style.fontSize = '0.8rem';
      if (f.id === window.activeSkinFilter) btn.style.border = '2px solid #ffd700';
      else btn.style.border = 'none';
      
      btn.onclick = () => {
        window.activeSkinFilter = f.id;
        drawShop();
      };
      filterDiv.appendChild(btn);
    });
    container.appendChild(filterDiv);

    function shouldShowSkin(skin, family, isUnlockableCat) {
      if (window.activeSkinFilter === 'all') return true;
      if (window.activeSkinFilter === 'new') return storeUnlockableIds.includes(skin.id);
      const isEquipped = gameState.equippedSkins[family] === skin.id;

      if (window.activeSkinFilter === 'buyable') return !isUnlockableCat && skin.cost > 0 && skin.type !== 'free';
      if (window.activeSkinFilter === 'special') return skin.isSpecial;
      if (window.activeSkinFilter === 'equipped') return isEquipped;
      if (window.activeSkinFilter === 'unlockable') return isUnlockableCat;
      return true;
    }

    // ── Sección Normal ──
    Object.keys(SKINS_DATA).forEach(family => {
      if (family === 'Global') return;
      if (!isTowerOwned(family)) return;
      SKINS_DATA[family].forEach(skin => {
        const isSpecialUnlockable = ['mimic_set', ...storeUnlockableIds].includes(skin.id);
        if (skin.unlockCondition || isSpecialUnlockable) return; // Las que tienen condición van abajo

        if (!shouldShowSkin(skin, family, false)) return;

        const isUnlocked = gameState.unlockedSkins.includes(skin.id);
        const isEquipped = gameState.equippedSkins[family] === skin.id;
        const el = document.createElement('div');
        el.className = `skin-item ${isEquipped ? 'equipped' : ''} ${skin.isSpecial ? 'special-skin' : ''}`;

        let costDisplay = '';
        let btnText = '';
        let canBuy = false;

        if (isUnlocked) {
          canBuy = true;
          btnText = isEquipped ? (currentLanguage === 'es' ? 'Desequipar' : 'Unequip') : translate('equip_btn');
        } else if (skin.type === 'free') {
          btnText = '🔒 Especial';
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
        const skinAction = isUnlocked
          ? `equipSkin('${family}', '${skin.id}')`
          : (skin.type === 'free' ? '' : `buySkin('${family}', '${skin.id}', ${skin.cost})`);

        el.innerHTML = `
          ${specialBadge}
          <div class="skin-preview ${skin.class || ''}"><img src="${previewImg}" style="width:100%; height:100%; filter:${skin.filter || ''}"></div>
          <h3>${translate(skin.name)}</h3><p>${translate(skin.desc)}</p>
          ${!isUnlocked ? costDisplay : ''}
          <button class="skin-buy-btn ${isUnlocked ? 'equip' : ''}" ${(!buyable && !isUnlocked) ? 'disabled' : ''} ${skinAction ? `onclick="${skinAction}"` : ''}>${btnText}</button>`;
        container.appendChild(el);
      });
    });

    // ── Sección DESBLOQUEABLES ──
    const unlockableSkins = {
      mapa: [],
      misiones: [],
      otros: []
    };

    Object.keys(SKINS_DATA).forEach(family => {
      SKINS_DATA[family].forEach(skin => {
        if (family === 'Global' && skin.id !== 'pyce_morph') return;

        const isSpecialDrop = ['mimic_set', ...storeUnlockableIds].includes(skin.id);
        if (!skin.unlockCondition && !isSpecialDrop) return;
        
        const isUnlocked = gameState.unlockedSkins.includes(skin.id) ||
          isProfileImageUnlockConditionMet(skin);
        const isAlwaysVisible = [
          'rewamped_green_set', 'rewamped_red_set', 'rewamped_blue_set',
          ...RGB_REWAMP_SKIN_IDS, 'judicial_set', ...storeUnlockableIds
        ].includes(skin.id);

        // Solo mostrar si está desbloqueada, o si es de las siempre visibles
        if (!isUnlocked && !isAlwaysVisible) return;

        if (!shouldShowSkin(skin, family, true)) return;

        // Categorizar
        let category = 'otros';
        if (['rewamped_green_set', 'rewamped_red_set', 'rewamped_blue_set', 'judicial_set', 'spanish_bombot', 'froggy_set'].includes(skin.id)) category = 'mapa';
        else if (missionSkinIds.includes(skin.id)) category = 'misiones';
        else if (['mimic_set', ...otherNewSkinIds].includes(skin.id)) category = 'otros';
        else if (skin.unlockCondition && skin.unlockCondition.includes('urban')) category = 'mapa';

        unlockableSkins[category].push({ family, skin, isUnlocked });
      });
    });

    const hasUnlockables = unlockableSkins.mapa.length > 0 || unlockableSkins.misiones.length > 0 || unlockableSkins.otros.length > 0;

    if (hasUnlockables) {
      const separator = document.createElement('div');
      separator.style.cssText = 'grid-column:1/-1; text-align:center; padding:14px 0 6px; font-size:1.1rem; font-weight:bold; letter-spacing:2px; color:#ffd700; text-shadow:0 0 8px rgba(255,215,0,0.5); border-top:1px solid rgba(255,215,0,0.25); margin-top:8px;';
      separator.textContent = currentLanguage === 'es' ? '✦ DESBLOQUEABLES' : '✦ UNLOCKABLES';
      container.appendChild(separator);

      const subtext = document.createElement('div');
      subtext.style.cssText = 'grid-column:1/-1; text-align:center; font-size:0.78rem; color:#aaa; margin-bottom:10px;';
      subtext.textContent = currentLanguage === 'es'
        ? 'Estas skins se desbloquean jugando — ¡sin coste adicional!'
        : 'These skins are unlocked by playing — no extra cost!';
      container.appendChild(subtext);

      function getUnlockConditionText(skinId, condition) {
        if (skinId === 'mimic_set') return currentLanguage === 'es' ? '🎁 Derrota a un Mimic Pyce Especial' : '🎁 Defeat a Special Mimic Pyce';
        if (skinId === 'pyce_morph') return currentLanguage === 'es' ? '🎁 Recompensa Secreta' : '🎁 Secret Reward';
        if (condition === 'all_profile_images') return currentLanguage === 'es'
          ? '🖼️ Reúne todas las imágenes de perfil disponibles'
          : '🖼️ Collect every available profile image';
        if (skinId === 'cuby_bombot') return currentLanguage === 'es' ? '👑 Derrota a Astrorb True Form' : '👑 Defeat Astrorb True Form';
        if (skinId === 'froggy_set') return currentLanguage === 'es' ? '🏖️ Puedes obtenerla gratis superando Sunlight Summer en Anti-Normal' : '🏖️ You can get it for free by beating Sunlight Summer in Anti-Normal';
        if (condition === 'mission_block_tales') return currentLanguage === 'es' ? '🗡️ Completa la misión de Block Tales' : '🗡️ Complete the Block Tales mission';
        if (condition === 'block_quest_shop') return currentLanguage === 'es' ? '🧱 Completa la misión Block Quest' : '🧱 Complete the Block Quest mission';
        
        if (condition === 'win_facil_urban') return currentLanguage === 'es' ? '🗺️ Gana en modo Fácil en Urbanistic Road' : '🗺️ Win in Easy mode on Urbanistic Road';
        if (condition === 'win_normal') return currentLanguage === 'es' ? '⚔️ Gana en modo Normal o superior' : '⚔️ Win in Normal mode or higher';
        if (condition === 'win_extremo') return currentLanguage === 'es' ? '💀 Gana en modo Extremo o superior' : '💀 Win in Extreme mode or higher';
        if (condition === 'astrorb_frame') return currentLanguage === 'es' ? '📖 Enmarca todos los Astrorb en la Enciclopedia' : '📖 Frame all Astrorb variants in the Encyclopedia';
        if (condition === 'all_boss_frames') return currentLanguage === 'es' ? '💎 Enmarca todos los enemigos cristalizados' : '💎 Frame all crystallized enemies';
        
        return currentLanguage === 'es' ? '🔒 Condición especial' : '🔒 Special condition';
      }

      function renderCategory(list, title, colorHex) {
        if (list.length === 0) return;
        
        const catHeader = document.createElement('div');
        catHeader.style.cssText = `grid-column:1/-1; text-align:left; font-size:1rem; font-weight:bold; color:${colorHex}; margin-top:14px; margin-bottom:4px; padding-left:10px; border-left:4px solid ${colorHex}; background: linear-gradient(90deg, ${colorHex}22 0%, transparent 100%); padding-top:4px; padding-bottom:4px;`;
        catHeader.textContent = title;
        container.appendChild(catHeader);

        list.forEach(({ family, skin, isUnlocked }) => {
          const isCollabSkin = ['cuby_bombot', 'astrorb_set', 'crystal_bombot'].includes(skin.id);
          const skinColor = isCollabSkin ? '#3498db' : colorHex;
          const isEquipped = gameState.equippedSkins[family] === skin.id;
          const el = document.createElement('div');
          el.className = `skin-item special-skin unlockable-skin ${isEquipped ? 'equipped' : ''}`;
          el.style.opacity = isUnlocked ? '1' : '0.85';
          el.style.border = isUnlocked ? `1px solid ${skinColor}` : `1px solid ${skinColor}55`;

          // Determine the best preview image for special skins
          let previewImg;
          if (skin.skins) {
            if (skin.id === 'astrorb_set') {
              // Always show the True Form (AstrorbTF) as the cover
              previewImg = skin.skins['SpyGlob'] || Object.values(skin.skins)[0];
            } else {
              previewImg = skin.skins[family] || Object.values(skin.skins)[0];
            }
          } else if (skin.pyce_morph) {
            // All-Stars Randomizer: show Pyce2 as preview
            previewImg = IMAGE_PATHS['Pyce2'] || 'img/All-Stars Randomizer (ENEMY SKIN).png';
          } else {
            previewImg = 'img/Glob_DEF.png';
          }
          const conditionText = getUnlockConditionText(skin.id, skin.unlockCondition);
          const rgbPreviewClass = skin.rgbTypes ? 'rgb-rewamp-preview' : '';
          const rgbPreviewStyle = skin.rgbTypes
            ? `--rgb-rewamp-mask-image:url('${encodeURI(previewImg)}')`
            : '';

          let costDisplay = '';
          let btnText = '';
          let canBuy = false;
          let onclickAction = '';

          if (!isUnlocked && !skin.unlockCondition && skin.cost > 0) {
            const canBuy = skin.duckpass_cost
              ? gameState.pycoins >= skin.cost && gameState.duckPassCurrency >= skin.duckpass_cost
              : gameState.pycoins >= skin.cost;
            const price = skin.duckpass_cost
              ? `<img src="img/Tokens/PyCoin.png" width="16"> ${skin.cost} + <img src="img/Tokens/DuckPass.png" width="16"> ${skin.duckpass_cost}`
              : `<img src="img/Tokens/PyCoin.png" width="16"> ${skin.cost}`;
            el.innerHTML = `
              <div class="special-badge" style="background:${skinColor}; color:#000;">🌟 ${currentLanguage === 'es' ? 'NUEVA' : 'NEW'}</div>
              <div class="skin-preview"><img src="${previewImg}" style="width:100%; height:100%;"></div>
              <h3>${translate(skin.name)}</h3>
              <p>${translate(skin.desc)}</p>
              <div class="cost">${price}</div>
              <button class="skin-buy-btn" ${canBuy ? `onclick="buySkin('${family}', '${skin.id}', ${skin.cost})"` : 'disabled'}>${translate('buy')}</button>`;
          } else if (!isUnlocked) {
            costDisplay = `<div class="cost" style="color:${colorHex}; font-size:0.78rem; margin-bottom:4px;">${currentLanguage === 'es' ? '🎁 Gratis al desbloquear' : '🎁 Free on unlock'}</div>`;
            btnText = `🔒 ${currentLanguage === 'es' ? 'Bloqueada' : 'Locked'}`;
            
            el.innerHTML = `
              <div class="special-badge" style="background:${skinColor}; color:#000;">🔓 ${currentLanguage === 'es' ? 'DESBLOQUEABLE' : 'UNLOCKABLE'}</div>
              <div class="skin-preview ${rgbPreviewClass}" style="filter:grayscale(0.4) brightness(0.8);${rgbPreviewStyle}"><img src="${previewImg}" style="width:100%; height:100%;"></div>
              <h3>${translate(skin.name)}</h3>
              ${skin.pyce_morph ? `<div style="font-size:0.7rem; color:#e67e22; font-weight:bold; margin:-6px 0 6px; text-transform:uppercase; letter-spacing:1px;">⚡ ${currentLanguage === 'en' ? 'General' : 'General'}</div>` : ''}
              <p>${translate(skin.desc)}</p>
              ${costDisplay}
              <div style="font-size:0.75rem; color:#ccc; margin-bottom:8px; padding:4px 6px; background:rgba(0,0,0,0.2); border-radius:6px; border:1px dashed ${colorHex}55;">${conditionText}</div>
              <button class="skin-buy-btn" disabled style="background:${colorHex}22; border:1px solid ${colorHex}55; color:${colorHex}; cursor:not-allowed;">${btnText}</button>`;
          } else {
            // Once purchased or unlocked, a skin is owned regardless of its original price.
            btnText = isEquipped ? (currentLanguage === 'es' ? 'Desequipar' : 'Unequip') : translate('equip_btn');
            onclickAction = isEquipped ? `equipSkin('${family}', 'default')` : `equipSkin('${family}', '${skin.id}')`;
            canBuy = true;

            el.innerHTML = `
              <div class="special-badge" style="background:${skinColor}; color:#000;">🌟 ${currentLanguage === 'es' ? 'DESBLOQUEADA' : 'UNLOCKED'}</div>
              <div class="skin-preview ${skin.class || ''} ${rgbPreviewClass}" style="${rgbPreviewStyle}"><img src="${previewImg}" style="width:100%; height:100%; filter:${skin.filter || ''}"></div>
              <h3>${translate(skin.name)}</h3>
              ${skin.pyce_morph ? `<div style="font-size:0.7rem; color:#e67e22; font-weight:bold; margin:-6px 0 6px; text-transform:uppercase; letter-spacing:1px;">⚡ ${currentLanguage === 'en' ? 'General' : 'General'}</div>` : ''}
              <p>${translate(skin.desc)}</p>
              ${costDisplay}
              <button class="skin-buy-btn equip" onclick="${onclickAction}">${btnText}</button>`;
          }
          container.appendChild(el);
        });
      }

      renderCategory(unlockableSkins.mapa, currentLanguage === 'es' ? '🗺️ Mapa' : '🗺️ Map', '#f39c12'); // Naranja
      renderCategory(unlockableSkins.misiones, currentLanguage === 'es' ? '🎯 Misiones / Collab' : '🎯 Missions / Collab', '#2ecc71'); // Verde
      renderCategory(unlockableSkins.otros, currentLanguage === 'es' ? '🏆 Otros' : '🏆 Others', '#ff69b4'); // Rosa
    }

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
        // Toggle: first click = unlock all (save snapshot), second click = rollback
        if (!window._adminSnapshot) {
          // Save snapshot before unlocking
          window._adminSnapshot = {
            unlockedSkins: [...(gameState.unlockedSkins || [])],
            towerUnlocks: {}
          };
          const LOCKABLE = ['Soap_Glob','Ducky_Glob','Comet_Glob','Old_Glob','Work_Bombot','Pyce_Glob','Balloon_Glob','Streamer_Glob','Bomb_Glob','Sprout_Glob'];
          LOCKABLE.forEach(t => {
            window._adminSnapshot.towerUnlocks[t] = !!(TOWER_TYPES[t] && TOWER_TYPES[t].unlocked);
          });
          // Unlock all towers
          LOCKABLE.forEach(t => { if (TOWER_TYPES[t]) TOWER_TYPES[t].unlocked = true; });
          // Unlock all skins
          Object.keys(SKINS_DATA).forEach(family => {
            SKINS_DATA[family].forEach(skin => {
              if (!gameState.unlockedSkins.includes(skin.id)) gameState.unlockedSkins.push(skin.id);
            });
          });
          secretBtn.style.backgroundColor = '#ff4444';
          secretBtn.title = 'Admin: Rollback to previous state';
          showMessage("👑 MODO ADMIN: Torres + Skins desbloqueadas. Pulsa de nuevo para revertir.", "success");
        } else {
          // Rollback
          const snap = window._adminSnapshot;
          gameState.unlockedSkins = snap.unlockedSkins;
          Object.entries(snap.towerUnlocks).forEach(([t, was]) => {
            if (TOWER_TYPES[t]) TOWER_TYPES[t].unlocked = was;
          });
          window._adminSnapshot = null;
          secretBtn.style.backgroundColor = '#ff69b4';
          secretBtn.title = 'Admin: Unlock All Towers';
          showMessage("↩️ MODO ADMIN: Estado revertido al original.", "warning");
        }
        drawTowerShop();
        drawShop();
      };

      const spacer = document.createElement('div');
      spacer.style.width = '100%';
      spacer.style.display = 'flex';
      spacer.style.justifyContent = 'flex-end';
      spacer.appendChild(secretBtn);

      container.appendChild(spacer);
    }
  } else if (currentShopTab === 'profile') {
    renderProfileShop(container);
  }
}

window.toggleEquipTower = function (type) {
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
  publishMultiplayerProfile();
};

function drawEquipShop(container) {
  // ── Loadout Banner — mismo formato que la barra de currency ── FIXING
  let slotsHTML = '';
  for (let i = 0; i < 5; i++) {
    if (i < gameState.equippedTowers.length) {
      const t = gameState.equippedTowers[i];
      slotsHTML += `<div style="width:36px;height:36px;flex-shrink:0;background:url('${encodeURI(getTowerImage(t))}') center/cover;border:2px solid #2ecc71;border-radius:6px;box-shadow:0 0 5px rgba(46,204,113,0.4); cursor:pointer;" title="Desequipar ${translate(TOWER_TYPES[t] ? TOWER_TYPES[t].name : t)}" onclick="toggleEquipTower('${t}')"></div>`;
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
    { type: 'Soap_Glob', unlocked: isTowerOwned('Soap_Glob') },
    { type: 'Ducky_Glob', unlocked: isTowerOwned('Ducky_Glob') },
    { type: 'Comet_Glob', unlocked: !!(TOWER_TYPES['Comet_Glob'] && TOWER_TYPES['Comet_Glob'].unlocked), req: 'shop' },
    { type: 'Sprout_Glob', unlocked: !!(TOWER_TYPES['Sprout_Glob'] && TOWER_TYPES['Sprout_Glob'].unlocked), req: 'shop' },
    { type: 'Old_Glob', unlocked: !!(TOWER_TYPES['Old_Glob'] && TOWER_TYPES['Old_Glob'].unlocked), req: 'shop' },
    { type: 'Work_Bombot', unlocked: !!(TOWER_TYPES['Work_Bombot'] && TOWER_TYPES['Work_Bombot'].unlocked), req: 'challenge' },
    { type: 'Pirate_Glob', unlocked: !!(TOWER_TYPES['Pirate_Glob'] && TOWER_TYPES['Pirate_Glob'].unlocked), req: 'shop' },
    { type: 'Worker_Glob', unlocked: isTowerOwned('Worker_Glob') },
    { type: 'Balloon_Glob', unlocked: isTowerOwned('Balloon_Glob') },
    { type: 'Streamer_Glob', unlocked: isTowerOwned('Streamer_Glob') },
    { type: 'Bomb_Glob', unlocked: isTowerOwned('Bomb_Glob') }
  ];

  // ── Filtros de Equipación ──
  const NEW_TOWERS = ['Bomb_Glob', 'Worker_Glob', 'Balloon_Glob', 'Streamer_Glob', 'Sprout_Glob', 'Old_Glob'];
  window.activeEquipFilter = window.activeEquipFilter || 'all';

  const filterBar = document.createElement('div');
  filterBar.style.cssText = 'display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap; grid-column:1/-1;';
  const equipFilters = [
    { key: 'all',      label: currentLanguage === 'en' ? 'All' : 'Todos' },
    { key: 'equipped', label: currentLanguage === 'en' ? 'Equipped' : 'Equipados' },
    { key: 'new',      label: currentLanguage === 'en' ? 'New 🆕' : 'Nuevos 🆕' }
  ];
  equipFilters.forEach(f => {
    const btn = document.createElement('button');
    btn.textContent = f.label;
    const isActive = window.activeEquipFilter === f.key;
    btn.style.cssText = `padding:6px 14px; border-radius:20px; border:none; cursor:pointer; font-size:0.8rem; font-weight:bold; transition:all 0.2s;
      background:${isActive ? '#3498db' : 'rgba(255,255,255,0.1)'}; color:${isActive ? '#fff' : '#aaa'};
      box-shadow:${isActive ? '0 0 8px rgba(52,152,219,0.5)' : 'none'};`;
    btn.onclick = () => { window.activeEquipFilter = f.key; drawShop(); };
    filterBar.appendChild(btn);
  });
  container.appendChild(filterBar);

  shopTowers.forEach(item => {
    const type = item.type;
    const t = TOWER_TYPES[type];
    if (!t) return;

    // Apply filter
    const isEquipped = gameState.equippedTowers.includes(type);
    const isNew = NEW_TOWERS.includes(type);
    if (window.activeEquipFilter === 'equipped' && !isEquipped) return;
    if (window.activeEquipFilter === 'new' && !isNew) return;

    const el = document.createElement('div');
    el.className = 'meta-item ' + (item.unlocked ? 'unlocked' : 'locked');
    if (isEquipped) {
      el.style.border = '2px solid #2ecc71';
      el.style.background = '#0a1f3a';
      el.style.boxShadow = '0 0 8px rgba(46, 204, 113, 0.4)';
    }

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
    showMessage(currentLanguage === 'es' ? "¡G-Tack Desbloqueada! 🌟" : "G-Tack Unlocked! 🌟", 'success');
  } else {
    showMessage(translate('notEnoughMoney') || "¡No tienes suficientes divisas!", 'error');
  }
}

function buySkin(family, skinId, cost) {
  const skin = SKINS_DATA[family].find(s => s.id === skinId);
  if (!skin) {
    console.error(`No se encontró la skin ${skinId} para la familia ${family}.`);
    return;
  }
  if (gameState.unlockedSkins.includes(skinId)) {
    equipSkin(family, skinId);
    return;
  }
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
  const skin = SKINS_DATA[family]?.find(item => item.id === skinId);
  if (skin?.unlockCondition === 'all_profile_images' &&
      !gameState.unlockedSkins.includes(skin.id) &&
      !isProfileImageUnlockConditionMet(skin)) {
    showMessage(currentLanguage === 'en'
      ? 'Collect every available profile image to unlock this skin.'
      : 'Reúne todas las imágenes de perfil disponibles para desbloquear esta skin.', 'warning');
    return;
  }
  gameState.equippedSkins[family] = skinId;
  if (skin?.unlockCondition === 'all_profile_images' &&
      !gameState.unlockedSkins.includes(skin.id)) {
    gameState.unlockedSkins.push(skin.id);
  }
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
  else if (id === 'unlock_Soap_Glob') {
    if (TOWER_TYPES['Soap_Glob']) TOWER_TYPES['Soap_Glob'].unlocked = true;
    showMessage(currentLanguage === 'es' ? 'GLOB DE JABON DESBLOQUEADO!' : 'SOAP GLOB UNLOCKED!', 'success');
  }
  else if (id === 'unlock_Ducky_Glob') {
    if (TOWER_TYPES['Ducky_Glob']) TOWER_TYPES['Ducky_Glob'].unlocked = true;
    showMessage(currentLanguage === 'es' ? 'DUCKY GLOB DESBLOQUEADO!' : 'DUCKY GLOB UNLOCKED!', 'success');
  }
  else if (id === 'unlock_Comet_Glob') {
    if (TOWER_TYPES['Comet_Glob']) TOWER_TYPES['Comet_Glob'].unlocked = true;
    showMessage("🖤 " + (currentLanguage === 'es' ? "TORRE COMETA DESBLOQUEADA!" : "COMET GLOB TOWER UNLOCKED!"), 'success');
  }
  else if (id === 'unlock_Sprout_Glob') {
    if (TOWER_TYPES['Sprout_Glob']) TOWER_TYPES['Sprout_Glob'].unlocked = true;
    showMessage("🎊 " + (currentLanguage === 'es' ? "SPROUT GLOB DESBLOQUEADO!" : "SPROUT GLOB UNLOCKED!"), 'success');
  }
  else if (id === 'unlock_Balloon_Glob') {
    if (TOWER_TYPES['Balloon_Glob']) TOWER_TYPES['Balloon_Glob'].unlocked = true;
    showMessage(currentLanguage === 'es' ? 'BALLOON GLOB DESBLOQUEADO!' : 'BALLOON GLOB UNLOCKED!', 'success');
  }
  else if (id === 'unlock_Streamer_Glob') {
    if (TOWER_TYPES['Streamer_Glob']) TOWER_TYPES['Streamer_Glob'].unlocked = true;
    showMessage(currentLanguage === 'es' ? 'STREAMER GLOB DESBLOQUEADO!' : 'STREAMER GLOB UNLOCKED!', 'success');
  }
  else if (id === 'unlock_Worker_Glob') {
    if (TOWER_TYPES['Worker_Glob']) TOWER_TYPES['Worker_Glob'].unlocked = true;
    showMessage(currentLanguage === 'es' ? 'WORKER GLOB DESBLOQUEADO!' : 'WORKER GLOB UNLOCKED!', 'success');
  }
  else if (id === 'unlock_Bomb_Glob') {
    if (TOWER_TYPES['Bomb_Glob']) TOWER_TYPES['Bomb_Glob'].unlocked = true;
    showMessage(currentLanguage === 'es' ? 'BOMB GLOB DESBLOQUEADO!' : 'BOMB GLOB UNLOCKED!', 'success');
  }
  else if (id === 'unlock_Pirate_Glob') {
    if (TOWER_TYPES['Pirate_Glob']) TOWER_TYPES['Pirate_Glob'].unlocked = true;
    showMessage("🏴‍☠️ " + (currentLanguage === 'es' ? "PIRATE GLOB DESBLOQUEADO!" : "PIRATE GLOB UNLOCKED!"), 'success');
  }
  else if (id.startsWith('dg_')) {
    gameState.duckgrades[id] = true;
    showMessage("🦆 DUCKGRADE UNLOCKED!", 'success');
    unlockBadge('duckgradeFirst');
  }

  checkTowerCombinationBadges();

  updateMetaUI(); drawShop(); drawTowerShop(); saveProgress();
  publishMultiplayerProfile();
}

function drawPass() {
  const container = document.getElementById('pass-rewards');
  if (!container) return; container.innerHTML = '';
  
  const isUrbanPass = gameState.duckPassLevel > 100;
  container.className = `pass-timeline-container ${isUrbanPass ? 'urbanpass-theme' : 'duckpass-theme'}`;
  
  const title = document.getElementById('pass-title');
  if (title) {
     title.innerHTML = isUrbanPass ? `🏙️ Urban Pass` : `🦆 Duck Pass`;
  }

  [...SKINS_DATA['Global']].sort((a, b) => (a.level || 999) - (b.level || 999)).forEach((skin, index, arr) => {
    // Check if this is the first Urban Pass item (level > 100)
    const isNodeUrban = skin.level > 100;
    const prevSkin = index > 0 ? arr[index - 1] : null;
    if (isNodeUrban && (!prevSkin || prevSkin.level <= 100)) {
      const sep = document.createElement('div');
      sep.className = 'pass-separator';
      sep.innerHTML = `<h2 style="color: ${isUrbanPass ? '#3498db' : '#777'}; text-align: center; margin: 20px 0;">🏙️ URBAN PASS 🏙️</h2>`;
      if (!isUrbanPass) {
        sep.innerHTML += `<p style="color: #ff4444; text-align: center; margin-bottom: 20px;">${currentLanguage === 'es' ? 'Solo se desbloquea completando el DuckPass (Nivel 100)' : 'Only unlocks by completing the DuckPass (Level 100)'}</p>`;
      }
      container.appendChild(sep);
    }

    const unlocked = skin.id === 'pyce_morph' ? (BADGES.encyclopediaMaster && BADGES.encyclopediaMaster.unlocked) : gameState.duckPassLevel >= skin.level;
    const equipped = gameState.equippedSkins['Global'] === skin.id;
    const el = document.createElement('div');
    
    let nodeClasses = `pass-node ${unlocked ? 'unlocked' : 'locked'}`;
    if (isNodeUrban && !isUrbanPass) {
      nodeClasses += ' urban-locked-grey';
    }
    el.className = nodeClasses;
    
    let btnHTML = "";
    if (unlocked) {
      if (equipped) {
        btnHTML = `<button class="meta-buy-btn" style="background:#e74c3c;" onclick="equipSkin('Global', 'default')">${currentLanguage === 'es' ? 'Desequipar' : 'Unequip'}</button>`;
      } else {
        btnHTML = `<button class="meta-buy-btn equip" onclick="equipSkin('Global', '${skin.id}')">${translate('equip_btn')}</button>`;
      }
    } else {
      if (skin.id === 'pyce_morph') {
        btnHTML = `<button class="meta-buy-btn" disabled>${currentLanguage === 'es' ? 'Completa la Enciclopedia' : 'Complete the Encyclopedia'}</button>`;
      } else {
        btnHTML = `<button class="meta-buy-btn" disabled>${translate('req_level', { level: skin.level })}</button>`;
      }
    }

    el.innerHTML = `
      <div class="pass-level-badge">${skin.level ? 'LVL ' + skin.level : 'MAX'}</div>
      <div class="pass-node-content">
        <h3 style="font-size:1rem; margin-top:10px;">${translate(skin.name)}</h3>
        <p style="font-size:0.8rem; color:#ccc; margin-bottom:10px;">${translate(skin.desc)}</p>
      </div>
      ${skin.buff && unlocked ? `<b style="color:#2ecc71;">${translate('active')}</b>` : btnHTML}`;
    container.appendChild(el);
  });

  const profilePassHeading = document.createElement('div');
  profilePassHeading.className = 'pass-separator';
  profilePassHeading.innerHTML = `<h2 style="color:#79d6a0;text-align:center;margin:20px 0;">${currentLanguage === 'es' ? '👤 BORDES DE PERFIL' : '👤 PROFILE FRAMES'}</h2>`;
  container.appendChild(profilePassHeading);
  PROFILE_PASS_BORDERS.forEach(border => {
    const unlocked = gameState.duckPassLevel >= border.level;
    const el = document.createElement('div');
    el.className = `pass-node ${unlocked ? 'unlocked' : 'locked'}`;
    el.innerHTML = `
      <div class="pass-level-badge">LVL ${border.level}</div>
      <div class="pass-node-content">
        <span class="profile-border-swatch" style="--profile-border-start:${border.colors[0]};--profile-border-end:${border.colors[1]};"></span>
        <h3 style="font-size:1rem;margin-top:10px;">${currentLanguage === 'en' ? border.labelEn : border.label}</h3>
        <p style="font-size:0.8rem;color:#ccc;margin-bottom:10px;">${currentLanguage === 'en' ? 'Profile frame unlocked at this Duck Pass level.' : 'Borde de perfil desbloqueado al alcanzar este nivel del Duck Pass.'}</p>
      </div>
      <b style="color:${unlocked ? '#2ecc71' : '#aaa'};">${unlocked ? (currentLanguage === 'en' ? 'UNLOCKED' : 'DESBLOQUEADO') : translate('req_level', { level: border.level })}</b>`;
    container.appendChild(el);
  });
}

function placeTower(spotId, type) {
  const tCfg = TOWER_TYPES[type];
  const family = tCfg.family || type;
  const currentCount = getFamilyCount(type);
  const capacity = getTowerPlacementLimits(type);
  const ownerId = multiplayerActionOwner || socket?.id || localStorage.getItem('glob_username') || 'Jugador';
  if (multiplayerEnabled) {
    const ownedCount = gameState.towers.filter(tower =>
      (tower.family || tower.type) === family && tower.ownerId === ownerId
    ).length;
    if (ownedCount >= capacity.perPlayerLimit || currentCount >= capacity.sharedLimit) {
      return showMessage(
        translate('limit_reached', {
          name: translate('tower_' + type + '_name'),
          limit: Math.min(capacity.perPlayerLimit, Math.max(0, capacity.sharedLimit - currentCount))
        }),
        'error'
      );
    }
  } else if (currentCount >= capacity.perPlayerLimit) {
    return showMessage(
      translate('limit_reached', {
        name: translate('tower_' + type + '_name'),
        limit: capacity.perPlayerLimit
      }),
      'error'
    );
  }

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
  const towerFamily = tCfg.family || type;
  const idleClass = 'idle-jump';
  el.className = `tower ${idleClass}`; el.style.left = `${spot.x}px`; el.style.top = `${spot.y}px`;
  el.style.setProperty('--idle-delay', `${-(Math.random() * 1.5).toFixed(2)}s`);
  el.style.backgroundImage = `url('${encodeURI(getTowerImage(type))}')`;
  // Fallback: si la imagen falla, usar color de fondo visible
  el.onerror = function () { el.style.backgroundColor = '#9b59b6'; el.style.backgroundImage = 'none'; };
  applyTowerEffects(el, type);
  document.getElementById('map').appendChild(el);

  const tower = { ...tCfg, type, x: spot.x, y: spot.y, el, cooldown: 0, spotId, ownerId, stunned: 0, moneyTimer: 0 };
  tower.damage *= gameState.towerBuffs.damage;
  tower.range += gameState.towerBuffs.range;
  tower.speed *= gameState.towerBuffs.speed;

  el.onclick = (e) => { e.stopPropagation(); selectTower(tower); };
  gameState.towers.push(tower);
  if (tower.isSummoner) {
    spawnBoat(tower);
    tower.summonCooldown = { Boat_S1: 3.5, Boat_S2: 3, Boat_S3: 2.5, Boat_S4: 2 }[tower.summonType] || 3;
  }
  checkTowerCombinationBadges();
  gameState.globetines -= cost;
  gameState.moneySpentThisGame = (gameState.moneySpentThisGame || 0) + cost;
  gameState.towerCounts[type] = (gameState.towerCounts[type] || 0) + 1;
  gameState.globsPlaced[type] = (gameState.globsPlaced[type] || 0) + 1;
  spot.occupied = true;
  if (!tCfg.evolution && !gameState.maxedFamilies.includes(family)) {
    gameState.maxedFamilies.push(family);
    publishMultiplayerProfile();
  }

  recalculateAuras();
  if (typeof checkEncyclopediaMaster === 'function') checkEncyclopediaMaster();
  updateUI(); drawTowerShop();
  updateAllTowerRanges();
  sendMultiplayerAction({ type: 'place-tower', spotId, towerType: type });
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
    case 'Pirate_Glob': return 'Bombardeo Glob 💣';
    case 'White': return 'Apoyo Blanco 🛡️';
    case 'Pink': return 'Compensación Rosa 🌸';
    default: return 'G-Táctica';
  }
}

function activateGTack(t) {
  const cost = t.family === 'Ducky_Glob' ? 500 : 400;
  if (gameState.globetines < cost) return;
  if (t.gTackCooldown && t.gTackCooldown > 0) return;

  gameState.globetines -= cost;
  gameState.moneySpentThisGame = (gameState.moneySpentThisGame || 0) + cost;
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
    const iexTowers = gameState.towers.filter(tower => tower.family === 'IEx');
    if (iexTowers.length > 1 || gameState.towers.some(tower => tower.family === 'Red_Glob')) {
      unlockBadge('chain_reaction');
    }
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
  } else if (t.family === 'Pirate_Glob') {
    t.marineGtackTimer = 10;
    showEffect(t.x, t.y - 25, "GLOB BOMBARDMENT! 💣", "#2ecc71");
  } else if (t.family === 'White') {
    gameState.towers.forEach(otherTower => {
      if ((otherTower.family === 'Worker_Glob' || otherTower.family === 'Soap_Glob') &&
          Math.hypot(otherTower.x - t.x, otherTower.y - t.y) <= t.range) {
        otherTower.whiteSupportTimer = 10;
      }
    });
    showEffect(t.x, t.y - 25, "SUPPORT DEPLOYED! 🛡️", "#ecf0f1");
  } else if (t.family === 'Pink') {
    gameState.towers.forEach(otherTower => {
      if (otherTower !== t && Math.hypot(otherTower.x - t.x, otherTower.y - t.y) <= t.range) {
        otherTower.pinkGtackTimer = 10;
      }
    });
    showEffect(t.x, t.y - 25, "COOLDOWN SHIFT! 🌸", "#ff69b4");
  } else if (t.family === 'Brown') {
    gameState.towers.forEach(otherTower => {
        if (Math.hypot(otherTower.x - t.x, otherTower.y - t.y) <= (t.range || 100) * 1.5) {
          otherTower.brownBuffTimer = 8;
        }
      });
      showEffect(t.x, t.y - 25, "BLOOMING! 🌸", "#ff69b4");
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
    gameState.moneySpentThisGame = (gameState.moneySpentThisGame || 0) + cost;
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
        publishMultiplayerProfile();
      }
    }

    checkTowerCombinationBadges();
    recalculateAuras();
    if (typeof checkEncyclopediaMaster === 'function') checkEncyclopediaMaster();
    updateAllTowerRanges();
    selectTower(tower); updateUI(); drawTowerShop();
    sendMultiplayerAction({ type: 'evolve-tower', spotId: tower.spotId, towerType: nextType, cost });
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
    if (gameState.moneySpentThisGame > 40000 && gameState.towers.length === 0) {
      unlockBadge('globiscal_debt');
    }
    checkTowerCombinationBadges();
    recalculateAuras();
    deselectTower(); updateUI(); drawTowerShop();
    sendMultiplayerAction({ type: 'sell-tower', spotId: tower.spotId });
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
        const buffRange = auraTower.range * (gameState.duckgrades.dg_White ? 1.25 : 1);
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
            const compensatedDmgDec = gameState.duckgrades.dg_Pink ? Math.min(1, dmgDec + 0.1) : dmgDec;
            if (compensatedDmgDec < t.bestPinkAura.dmgDec) {
              t.bestPinkAura.dmgDec = compensatedDmgDec;
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

  function getInfiniteWavePlan(mapKey, wave) {
    const mapPools = {
      gelatin_lake: {
        enemies: ['Stupid_Pyce', 'Pyce2', 'Guest_Pyce', 'Symbol_Pyce', 'Noob_Pyce', '4motions_Pyce', 'Flower_Pyce', 'SO_Pyce', 'Stupid_GoldPyce'],
        bosses: ['1x1x1x1_Pyce', 'NOeye_Pyce', 'MoonStar_Pyce']
      },
      urbanistic_road: {
        enemies: ['BitY1', 'BitG2', 'BitP3', 'BitB4', 'HoloPyce', 'Rebel_Pyce', 'Strechy_Pyce', 'Bomb_Pyce', 'Fireflies', 'ByteGB1', 'ByteYP2', 'BytePG3', 'ByteYB4', 'Cannon_Pycer', 'Knight_Pyce', 'Spyware1', 'Spyware2', 'Spyware3', 'Stupid_GoldPyce'],
        bosses: ['Arky', 'ArkyVoid', 'CrystArky', 'NOeye_Pyce', 'MoonStar_Pyce']
      },
      sunlight_seaside: {
        enemies: ['Piz', 'Baby_Shrum', 'Ren', 'Pysh', 'Axolotl_Pyce', 'Treeper', 'Thunren', 'Shrum', 'Clown_Pysh', 'Shark_Pyce', 'Big_Treeper', 'Renibig', 'Stacked_Treepers', 'Followishers', 'Creamplet', 'Umbrella_Pyce', 'Stupid_GoldPyce'],
        bosses: ['PhantKeeper', 'GlitchKeeper', 'DarkSpirit', 'Old_Fungus', 'NOeye_Pyce', 'MoonStar_Pyce']
      },
      spooktacular_ruins: {
        enemies: ['Broksp', 'Pumpitch', 'RIPslide', 'SkeleBone_Pyce'],
        bosses: []
      }
    };
    const plan = mapPools[mapKey] || mapPools.gelatin_lake;
    const availableEnemies = plan.enemies.filter(type => ENEMY_TYPES[type] && !ENEMY_TYPES[type].boss);
    const availableBosses = plan.bosses.filter(type => ENEMY_TYPES[type] && ENEMY_TYPES[type].boss);
    const maxProgressionWave = 40;
    const isBossWave = wave > maxProgressionWave && (wave - maxProgressionWave) % 30 === 0;
    const bossCycle = Math.floor((wave - maxProgressionWave) / 30);
    const bossCount = isBossWave ? Math.min(4, Math.max(1, bossCycle)) : 0;
    const enemiesPerWave = 6 + Math.floor(wave * 0.08);
    const spawnList = [];

    for (let i = 0; i < enemiesPerWave; i++) {
      const progress = Math.min(1, wave / maxProgressionWave);
      const poolStart = Math.floor(progress * Math.max(0, availableEnemies.length - 5));
      const pool = availableEnemies.slice(0, Math.min(availableEnemies.length, poolStart + 5));
      spawnList.push(pool[Math.floor(Math.random() * pool.length)] || availableEnemies[0]);
    }

    const bossesToSpawn = [];
    if (isBossWave && availableBosses.length > 0) {
      const shuffledBosses = [...availableBosses].sort(() => Math.random() - 0.5);
      for (let i = 0; i < bossCount; i++) {
        bossesToSpawn.push(shuffledBosses[i % shuffledBosses.length]);
      }
      spawnList.unshift(...bossesToSpawn);
    }
    return { spawnList, bossesToSpawn, isBossWave };
  }

  function showInfiniteCompletionDucky() {
    if (document.getElementById('infinite-completion-ducky')) return;
    const map = document.getElementById('map');
    if (!map) return;
    const ducky = document.createElement('div');
    ducky.id = 'infinite-completion-ducky';
    ducky.title = currentLanguage === 'es' ? '¡Has alcanzado la oleada 999!' : 'You reached wave 999!';
    ducky.style.cssText = "position:absolute;left:50%;top:50%;width:110px;height:110px;transform:translate(-50%,-50%);background:url('" + encodeURI(IMAGE_PATHS.Ducky_Glob) + "') center/contain no-repeat;z-index:40;filter:drop-shadow(0 0 12px #ffd700);animation:idle-jump 1.8s ease-in-out infinite;pointer-events:none;";
    map.appendChild(ducky);
    showMessage(currentLanguage === 'es' ? '🦆 ¡Ducky Glob ha aparecido! Has superado el Infinito.' : '🦆 Ducky Glob has appeared! You conquered Endless.', 'success');
  }

  let waveSpawnInterval = null;

  function stopWaveSpawnInterval() {
    if (waveSpawnInterval !== null) {
      clearInterval(waveSpawnInterval);
      waveSpawnInterval = null;
    }
  }

  function startWaveSpawnInterval() {
    stopWaveSpawnInterval();
    if (!gameState.waveSpawnQueue?.length ||
        gameState.waveSpawnIndex >= gameState.waveSpawnQueue.length) {
      gameState.spawningActive = false;
      return;
    }
    const spawnInterval = Math.max(100, Number(gameState.waveSpawnIntervalMs) || 500);
    waveSpawnInterval = setInterval(() => {
      if (gameState.paused) return;
      if (gameState.gameOver || !gameState.waveActive) {
        stopWaveSpawnInterval();
        gameState.spawningActive = false;
        return;
      }
      const spawned = gameState.waveSpawnIndex;
      const type = gameState.waveSpawnQueue[spawned];
      if (!type) {
        stopWaveSpawnInterval();
        gameState.spawningActive = false;
        return;
      }
      const isThisBoss = gameState.waveSpawnIsBoss &&
        gameState.waveBossTypes.includes(type) &&
        spawned < gameState.waveBossTypes.length;
      spawnEnemy(type, isThisBoss);
      gameState.waveSpawnIndex++;
      if (gameState.waveSpawnIndex >= gameState.waveSpawnQueue.length) {
        stopWaveSpawnInterval();
        gameState.spawningActive = false;
      }
    }, spawnInterval);
  }

  function startWave() {
    console.log("🔥 startWave() iniciada");
    console.log("waveActive:", gameState.waveActive);
    console.log("gameOver:", gameState.gameOver);
    console.log("mode:", gameState.mode);
    console.log("maxWaves:", gameState.maxWaves);

    if (gameState.waveActive || gameState.gameOver || gameState.paused) return;

    let maxWaves = gameState.maxWaves || 20;
    if (gameState.mode === 'pesadilla') maxWaves = 50;
    if (gameState.mode === 'infinito' && (gameState.infiniteCompleted || gameState.wave >= 999)) {
      gameState.infiniteCompleted = true;
      gameState.autoWave = false;
      showInfiniteCompletionDucky();
      updateUI();
      return;
    }

    if (gameState.mode !== 'infinito' && gameState.wave >= maxWaves) return typeof endGame === 'function' && endGame(true);

    gameState.waveActive = true;
    gameState.spawningActive = true;
    gameState.wave = (gameState.wave || 0) + 1;
    sendMultiplayerAction({ type: 'start-wave' });
    gameState.roundKills = [];
    gameState.roundIExExplosions = 0;
    if (roundCheckpointInterval === null && (!currentSeed || isSeedHost)) {
      roundCheckpointInterval = setInterval(checkpointActiveRound, 5000);
    }

    if (gameState.blockQuestPending && gameState.wave >= Math.ceil(maxWaves / 2)) {
      gameState.blockQuestPending = false;
      setTimeout(startBlockQuest, 500);
    }
    if (gameState.mode === 'interstellar' && gameState.interstellarParacristalQuest && gameState.wave === 1) {
      startParacristalDimension();
    }

    if (gameState.mode === 'interstellar' && gameState.wave === 26) {
      showMessage("¡Transición detectada! Reubicando al equipo...", 'warning');
      gameState.map = 'urbanistic_road';

      let refund = 0;
      gameState.towers.forEach(t => {
        const tCost = (TOWER_TYPES[t.type] && TOWER_TYPES[t.type].cost) ? TOWER_TYPES[t.type].cost : 0;
        refund += Math.floor(tCost * 0.60);
        t.el.remove();
        if (t.rangeEl) t.rangeEl.remove();
      });
      gameState.towers = [];
      gameState.towerCounts = {};
      gameState.globsPlaced = {};
      gameState.towerSpots.forEach(s => s.occupied = false);
      gameState.globetines += refund;
      showMessage("+" + refund + " Globetines recuperados.", 'success');

      generateSpots();
      createMap();
    }

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
    const mapKey = gameState.map || 'gelatin_lake';

    console.log(`📋 Generando oleada ${wave} en modo ${mode} con mult ${mult}`);

    // 2. Construir la lista de enemigos según el modo y oleada
    if (mode === 'interstellar') {
      let pool = [];
      let count = 0;

      const triggerDialog = (id, name, icon, text, type = 'unique') => {
        if (type === 'unique' && gameState.interstellarStory[id]) return;
        if (type === 'unique') gameState.interstellarStory[id] = true;
        showNarratorMsg(name.toLowerCase(), icon, name, currentLanguage === 'es' ? text.es : text.en);
      };

      if (wave >= 1 && wave <= 11) {
        pool = ['BitY1', 'Pyce2'];
        count = 3 + Math.floor(Math.random() * 2); // 3-4
        if (wave === 1) triggerDialog('intro', 'Work-Bombot', 'img/Towers/Evolutions/Work_Bombot.png', {
          es: "Algo está alterando Gelatin Lake... Defiende la zona mientras averiguamos qué ocurre.",
          en: "Something is altering Gelatin Lake... Defend the area while we find out what's happening."
        });
      } else if (wave >= 12 && wave <= 19) {
        pool = ['BitY1', 'ByteGB1', 'Leni_the_big_Hammer', 'Monster'];
        count = 5 + Math.floor(Math.random() * 2); // 5-6
        if (wave === 12) triggerDialog('nuevos', 'Work-Bombot', 'img/Towers/Evolutions/Work_Bombot.png', {
          es: "Han aparecido nuevos enemigos... No pertenecen a este lugar. Mantente alerta.",
          en: "New enemies have appeared... They don't belong here. Stay alert."
        });
      } else if (wave >= 20 && wave <= 22) {
        pool = ['Lenistal', 'Cristalized_Monster', 'ByteGB1'];
        count = 5 + Math.floor(Math.random() * 2); // 5-6
        if (wave === 20) triggerDialog('cristales_int', 'Work-Bombot', 'img/Towers/Evolutions/Work_Bombot.png', {
          es: "Esa energía cristalina... Cada vez es más intensa...",
          en: "That crystal energy... It's getting more intense..."
        });
      } else if (wave === 23) {
        isBossWave = true;
        bossesToSpawn.push('Crystal_Bombot');
        for (let i = 0; i < 4; i++) spawnList.push(Math.random() > 0.5 ? 'Lenistal' : 'Cristalized_Monster');
        triggerDialog('wb_corrupted', 'Work-Bombot', 'img/Towers/Evolutions/Work_Bombot.png', {
          es: "¿Qué...? N-no... puedo... controlarlo...",
          en: "What...? I-I can't... control it..."
        });
      } else if (wave === 24) {
        pool = ['Lenistal', 'Cristalized_Monster', 'ByteGB1'];
        count = 5 + Math.floor(Math.random() * 2); // 5-6
      } else if (wave === 25) {
        isBossWave = true;
        bossesToSpawn.push('AstrorbOrbe');
        triggerDialog('astrorb_intro', 'Astrorb', 'Interestelar Menace (COLLAB UPD)/Skins/Grey/Astrorb/AstrorbOrbe.png', {
          es: "La cristalización... apenas ha comenzado.",
          en: "The crystallization... has barely begun."
        });
      } else if (wave === 26) {
        // ── OLEADA 26: NOeye aparece ───────────────────────────────────
        pool = ['Spyware', 'Leni_the_big_Hammer', 'Monster', 'Bomb_Pyce', 'Knight_Pyce', 'Cannon_Pycer'];
        count = 5 + Math.floor(Math.random() * 2);
        triggerDialog('noeye_w26', 'NOeye', 'img/NOeye_Pyce.png', {
          es: "Escúchame.", en: "Listen to me."
        });
      } else if (wave === 27) {
        // ── OLEADA 27: NOeye da órdenes ───────────────────────────────
        pool = ['Spyware', 'Leni_the_big_Hammer', 'Monster', 'Bomb_Pyce', 'Knight_Pyce', 'Cannon_Pycer'];
        count = 5 + Math.floor(Math.random() * 2);
        triggerDialog('noeye_w27', 'NOeye', 'img/NOeye_Pyce.png', {
          es: "Defiende ese frente.", en: "Defend that front."
        });
      } else if (wave === 28) {
        // ── OLEADA 28: Silencio ────────────────────────────────────────
        pool = ['Spyware', 'Leni_the_big_Hammer', 'Monster', 'Bomb_Pyce', 'Knight_Pyce', 'Cannon_Pycer'];
        count = 5 + Math.floor(Math.random() * 2);
      } else if (wave === 29) {
        // ── OLEADA 29: NOeye avisa de recursos ───────────────────────
        pool = ['Spyware', 'Leni_the_big_Hammer', 'Monster', 'Bomb_Pyce', 'Knight_Pyce', 'Cannon_Pycer'];
        count = 5 + Math.floor(Math.random() * 2);
        triggerDialog('noeye_w29', 'NOeye', 'img/NOeye_Pyce.png', {
          es: "No desperdicies recursos.", en: "Don't waste resources."
        });
      } else if (wave === 30) {
        // ── OLEADA 30: Jefe CrystArky / NOeye reacciona ──────────────
        isBossWave = true;
        bossesToSpawn.push('CrystArky');
        triggerDialog('noeye_w30', 'NOeye', 'img/NOeye_Pyce.png', {
          es: "Ese... ya no es él.", en: "That... is no longer him."
        });
      } else if (wave >= 31 && wave <= 34) {
        // ── OLEADAS 31-34: Tensión / Oleada 32 tiene diálogo ─────────
        pool = ['Spyware', 'Lenistal', 'Cristalized_Monster', 'Bomb_Pyce', 'Knight_Pyce', 'Cannon_Pycer'];
        count = 5 + Math.floor(Math.random() * 2);
        if (wave === 32) triggerDialog('noeye_w32', 'NOeye', 'img/NOeye_Pyce.png', {
          es: "Ese no es el verdadero peligro.", en: "That is not the real danger."
        });
      } else if (wave === 35) {
        // ── OLEADA 35: Jefe NO_CrystEye_CB / NOeye corrompido ────────
        isBossWave = true;
        bossesToSpawn.push('NO_CrystEye_CB');
        for (let i = 0; i < 3; i++) spawnList.push(Math.random() > 0.5 ? 'Lenistal' : 'Cristalized_Monster');
        triggerDialog('noeye_w35', 'NOeye', 'img/NOeye_Pyce.png', {
          es: "...No.", en: "...No."
        });
      } else if (wave === 36) {
        // ── OLEADA 36: Astrorb toma la palabra ───────────────────────
        pool = ['Lenistal', 'Cristalized_Monster', 'Spyware', 'ByteGB1', 'Fireflies'];
        count = 6 + Math.floor(Math.random() * 2);
        triggerDialog('astrorb_w36', 'Astrorb', 'Interestelar Menace (COLLAB UPD)/Skins/Grey/Astrorb/AstrorbOrbe.png', {
          es: "Todo acabará cristalizado.", en: "Everything will end up crystallized."
        });
      } else if (wave === 37) {
        // ── OLEADA 37: Astrorb amenaza ───────────────────────────────
        pool = ['Lenistal', 'Cristalized_Monster', 'Spyware', 'ByteGB1', 'Fireflies'];
        count = 6 + Math.floor(Math.random() * 2);
        triggerDialog('astrorb_w37', 'Astrorb', 'Interestelar Menace (COLLAB UPD)/Skins/Grey/Astrorb/AstrorbOrbe.png', {
          es: "La resistencia es inútil.", en: "Resistance is futile."
        });
      } else if (wave === 38) {
        // ── OLEADA 38: Silencio ────────────────────────────────────────
        pool = ['Lenistal', 'Cristalized_Monster', 'Spyware', 'ByteGB1', 'Fireflies'];
        count = 6 + Math.floor(Math.random() * 2);
      } else if (wave === 39) {
        // ── OLEADA 39: Astrorb reclama el cielo ──────────────────────
        pool = ['Lenistal', 'Cristalized_Monster', 'Spyware', 'ByteGB1', 'Fireflies'];
        count = 6 + Math.floor(Math.random() * 2);
        triggerDialog('astrorb_w39', 'Astrorb', 'Interestelar Menace (COLLAB UPD)/Skins/Grey/Astrorb/AstrorbOrbe.png', {
          es: "El cielo me pertenece.", en: "The sky belongs to me."
        });
      } else if (wave === 40) {
        // ── OLEADA 40: Combate final — Astrorb True Form ─────────────
        isBossWave = true;
        bossesToSpawn.push('AstrorbOrbe');
        triggerDialog('astrorb_w40', 'Astrorb', 'Interestelar Menace (COLLAB UPD)/Skins/Grey/Astrorb/AstrorbOrbe.png', {
          es: "Ya no queda nadie capaz de detenerme.", en: "There is no one left capable of stopping me."
        });
      }

      if (pool.length > 0) {
        const interstellarCount = wave <= 5
          ? 2
          : wave <= 11
            ? 3
            : wave <= 19
              ? 4
              : wave <= 22
                ? 5
                : wave <= 25
                  ? 6
                  : 6 + Math.floor((wave - 25) / 5);
        count = interstellarCount + Math.floor(Math.random() * 2);
        if (wave % 5 === 0 && !isBossWave) {
          let highestHPEnemy = pool[0];
          let maxHP = 0;
          pool.forEach(e => {
            if (ENEMY_TYPES[e] && ENEMY_TYPES[e].health > maxHP && !ENEMY_TYPES[e].boss) {
              maxHP = ENEMY_TYPES[e].health;
              highestHPEnemy = e;
            }
          });
          for (let i = 0; i < count; i++) spawnList.push(highestHPEnemy);
        } else {
          for (let i = 0; i < count; i++) spawnList.push(pool[Math.floor(Math.random() * pool.length)]);
        }
      }
    } else if (mode === 'infinito') {
      const infinitePlan = getInfiniteWavePlan(mapKey, wave);
      spawnList.push(...infinitePlan.spawnList);
      bossesToSpawn.push(...infinitePlan.bossesToSpawn);
      isBossWave = infinitePlan.isBossWave;
    } else {
      // UNIFIED WAVE BRACKET SYSTEM FOR ALL MAPS
      const MAP_POOLS = {
        gelatin_lake: {
          regular: ['Stupid_Pyce', 'Pyce2'],
          medium: ['Guest_Pyce', 'Symbol_Pyce', 'Noob_Pyce'],
          hard: ['4motions_Pyce', 'Flower_Pyce', 'SO_Pyce'],
          special: ['Flower_Pyce', 'SO_Pyce']
        },
        urbanistic_road: {
          regular: ['HoloPyce', 'Rebel_Pyce', 'BitY1', 'BitG2', 'BitP3', 'BitB4'],
          medium: ['Strechy_Pyce', 'Bomb_Pyce', 'Fireflies', 'ByteGB1', 'ByteYP2', 'BytePG3', 'ByteYB4'],
          hard: ['Cannon_Pycer', 'Knight_Pyce', 'Spyware1', 'Spyware2', 'Spyware3'],
          special: ['Spyware1', 'Spyware2', 'Spyware3', 'Bomb_Pyce', 'Cannon_Pycer']
        },
        sunlight_seaside: {
          regular: ['Piz', 'Baby_Shrum', 'Ren', 'Pysh'],
          medium: ['Axolotl_Pyce', 'Treeper', 'Thunren', 'Shrum', 'Clown_Pysh', 'Umbrella_Pyce'],
          hard: ['Shark_Pyce', 'Big_Treeper', 'Renibig', 'Stacked_Treepers', 'Followishers', 'Creamplet'],
          special: ['Thunren', 'Renibig', 'Shrum', 'Old_Fungus', 'Umbrella_Pyce', 'Followishers']
        },
        spooktacular_ruins: {
          regular: ['Broksp', 'RIPslide'],
          medium: ['Pumpitch', 'SkeleBone_Pyce'],
          hard: ['Pumpitch', 'SkeleBone_Pyce'],
          special: ['SkeleBone_Pyce']
        }
      };

      const mapPool = MAP_POOLS[mapKey] || MAP_POOLS.gelatin_lake;
      const mapTankPool = (ENEMY_BALANCE[mapKey] && ENEMY_BALANCE[mapKey].tank) || mapPool.hard;

      if (mapKey === 'sunlight_seaside' && mode === 'facil') {
         let count = 2 + Math.floor(wave / 10) + Math.floor(Math.random() * 2);
         let wPool = [];
         if (wave === 1) wPool = ['Piz', 'Baby_Shrum'];
         else if (wave === 2) wPool = ['Axolotl_Pyce', 'Ren'];
         else if (wave === 3) wPool = ['Baby_Shrum', 'Treeper', 'Piz'];
         else if (wave === 4) wPool = ['Ren', 'Pysh', 'Shrum'];
         else if (wave === 5) wPool = ['Thunren', 'Treeper', 'Axolotl_Pyce'];
         else if (wave === 6) wPool = ['Shrum', 'Pysh', 'Shark_Pyce'];
         else if (wave === 7) wPool = ['Big_Treeper', 'Ren', 'Baby_Shrum'];
         else if (wave === 8) wPool = ['Renibig', 'Shrum', 'Clown_Pysh'];
         else if (wave === 9) wPool = ['Big_Treeper', 'Shark_Pyce', 'Old_Fungus'];
         else if (wave === 10) { wPool = ['Piz', 'Baby_Shrum', 'Pysh', 'Thunren']; count = 6; }
         
         for(let i=0; i<count; i++) spawnList.push(wPool[Math.floor(Math.random() * wPool.length)]);
      } else {
        let count = 5;
        let comp = { regular: 1.0, medium: 0, hard: 0, special: 0 };
        
        if (mode === 'facil') {
            count = 2 + Math.floor(wave / 10) + Math.floor(Math.random() * 2);
            if (wave <= 5) comp = { regular: 1.0, medium: 0, hard: 0, special: 0 };
            else comp = { regular: 0.8, medium: 0.2, hard: 0, special: 0 };
        } 
        else if (mode === 'normal') {
            count = 3 + Math.floor(wave / 10) + Math.floor(Math.random() * 2);
            if (wave <= 5) comp = { regular: 1, medium: 0, hard: 0, special: 0 };
            else if (wave <= 10) comp = { regular: 0.8, medium: 0.2, hard: 0, special: 0 };
            else comp = { regular: 0.5, medium: 0.4, hard: 0.1, special: 0 };
        }
        else if (mode === 'dificil') {
            count = 4 + Math.floor(wave / 10) + Math.floor(Math.random() * 2);
            if (wave <= 5) comp = { regular: 0.85, medium: 0.15, hard: 0, special: 0 };
            else if (wave <= 10) comp = { regular: 0.5, medium: 0.4, hard: 0.1, special: 0 };
            else comp = { regular: 0.25, medium: 0.5, hard: 0.25, special: 0 };
        }
        else if (mode === 'extremo') {
            count = 5 + Math.floor(wave / 10) + Math.floor(Math.random() * 2);
            if (wave <= 8) comp = { regular: 0.6, medium: 0.3, hard: 0.1, special: 0 };
            else if (wave <= 15) comp = { regular: 0.4, medium: 0.4, hard: 0.2, special: 0.1 };
            else comp = { regular: 0.2, medium: 0.5, hard: 0.3, special: 0.1 };
        }
        else if (mode === 'corrupto') {
            count = 6 + Math.floor(wave / 10) + Math.floor(Math.random() * 2);
            if (wave <= 7) comp = { regular: 0.5, medium: 0.4, hard: 0.1, special: 0 };
            else if (wave <= 14) comp = { regular: 0.3, medium: 0.4, hard: 0.3, special: 0.1 };
            else comp = { regular: 0.15, medium: 0.4, hard: 0.45, special: 0.2 };
        }
        else if (mode === 'antiNormal') {
            count = 7 + Math.floor(wave / 10) + Math.floor(Math.random() * 2);
            if (wave <= 5) comp = { regular: 0.6, medium: 0.3, hard: 0.1, special: 0 };
            else if (wave <= 10) comp = { regular: 0.4, medium: 0.4, hard: 0.2, special: 0.1 };
            else comp = { regular: 0.15, medium: 0.45, hard: 0.4, special: 0.2 };
        }
        else { // infinito
            count = 8 + Math.floor(wave / 10) + Math.floor(Math.random() * 2);
           comp = { regular: 0.2, medium: 0.3, hard: 0.5, special: 0.2 };
        }

        if (mapKey === 'urbanistic_road') {
          count += 1 + Math.floor(wave / 10);
        } else if (mapKey === 'sunlight_seaside') {
          count += 2 + Math.floor(wave / 10);
        }

        const rCount = Math.floor(count * comp.regular);
        const mCount = Math.floor(count * comp.medium);
        const hCount = Math.floor(count * comp.hard);
        const sCount = Math.floor(count * comp.special);

        const pushRandom = (catPool, n) => {
          if (!catPool || catPool.length === 0) return;
          for (let i = 0; i < n; i++) spawnList.push(catPool[Math.floor(Math.random() * catPool.length)]);
        };

        pushRandom(mapPool.regular, rCount);
        pushRandom(mapPool.medium, mCount);
        pushRandom(mapPool.hard, hCount);
        pushRandom(mapPool.special, sCount);
        while (spawnList.length < count) {
          pushRandom(mapPool.regular, 1);
        }

        const spikeWaves = mode === 'normal' ? [8, 13] : mode === 'dificil' ? [6, 12, 18] : mode === 'extremo' ? [5, 10, 15, 20] : mode === 'infinito' ? [5, 10, 15] : [];
        if (spikeWaves.includes(wave) && mapTankPool.length > 0) {
          const spikeCount = mode === 'normal' ? 2 : 3;
          pushRandom(mapTankPool, spikeCount);
        }
        
        if (mode !== 'facil' && wave >= 5 && Math.random() < 0.15) {
           spawnList.push('Stupid_GoldPyce');
        }
      }

      // 3. Jefes Finales Universales
      if (wave === maxWaves && mode !== 'infinito') {
         isBossWave = true;
         if (mapKey === 'gelatin_lake') {
            if (mode === 'facil') isBossWave = false; 
            else if (mode === 'corrupto') bossesToSpawn.push('NOeye_Pyce');
            else if (mode === 'antiNormal') bossesToSpawn.push('MoonStar_Pyce');
            else bossesToSpawn.push('1x1x1x1_Pyce');
         } else if (mapKey === 'urbanistic_road') {
            if (mode === 'facil') isBossWave = false;
            else if (mode === 'corrupto') bossesToSpawn.push('ArkyVoid');
            else if (mode === 'antiNormal') bossesToSpawn.push('CrystArky');
            else bossesToSpawn.push('Arky');
         } else if (mapKey === 'sunlight_seaside') {
            if (mode === 'corrupto') bossesToSpawn.push('GlitchKeeper');
            else if (mode === 'antiNormal') bossesToSpawn.push('DarkSpirit');
            else bossesToSpawn.push('PhantKeeper'); 
         }
      }
      
      // Jefes intermedios (cada 10 oleadas)
      if (wave % 10 === 0 && wave < maxWaves && mapKey === 'gelatin_lake' && mode !== 'facil') {
         isBossWave = true;
         bossesToSpawn.push('1x1x1x1_Pyce');
      }

      // Pyces Cristalizados (Apariciones tardías globales)
      if (wave >= 20) {
        const crystalCount = Math.floor(wave * 0.15);
        for (let i = 0; i < crystalCount; i++) spawnList.push('Crystal_Pyce');
      }
      if (wave >= 30) {
        const dreamyCount = Math.floor(wave * 0.1);
        for (let i = 0; i < dreamyCount; i++) spawnList.push('Dreamy_SPyce');
      }
      if (wave >= 35) {
        const astralCount = Math.floor(wave * 0.1);
        for (let i = 0; i < astralCount; i++) spawnList.push('Astral_BPyce');
      }

      // Limpiar Jefes únicos
      const UNIQUE_BOSSES = ['NOeye_Pyce', 'MoonStar_Pyce'];
      if (mode !== 'infinito') {
        UNIQUE_BOSSES.forEach(b => {
          if (gameState.uniquesBossSpawned && gameState.uniquesBossSpawned[b]) {
            let idx;
            while ((idx = spawnList.indexOf(b)) !== -1) spawnList.splice(idx, 1);
            const bi = bossesToSpawn.indexOf(b);
            if (bi !== -1) bossesToSpawn.splice(bi, 1);
          }
        });
      }
      
      if (bossesToSpawn.length === 0 && isBossWave) isBossWave = false;
    }

    const replaceRandomWaveEnemy = (rareType) => {
      const replaceableIndices = spawnList
        .map((type, index) => ({ type, index }))
        .filter(({ type }) =>
          ENEMY_TYPES[type] &&
          !ENEMY_TYPES[type].boss &&
          type !== 'Mimic_Pyce' &&
          type !== 'Bushi_Brella'
        )
        .map(({ index }) => index);
      if (replaceableIndices.length === 0) return false;
      const replaceIndex = replaceableIndices[Math.floor(Math.random() * replaceableIndices.length)];
      spawnList[replaceIndex] = rareType;
      return true;
    };

    if (
      wave >= 10 &&
      mode !== 'interstellar' &&
      !(gameState.rareEnemiesSpawned?.Mimic_Pyce > 0) &&
      Math.random() < RARE_ENEMY_WAVE_SPAWN_CHANCE
    ) {
      replaceRandomWaveEnemy('Mimic_Pyce');
    }

    if (
      wave >= 10 &&
      mode !== 'interstellar' &&
      mapKey === 'sunlight_seaside' &&
      (gameState.rareEnemiesSpawned?.Bushi_Brella || 0) < BUSHI_BRELLA_MAX_SPAWNS &&
      Math.random() < RARE_ENEMY_WAVE_SPAWN_CHANCE
    ) {
      replaceRandomWaveEnemy('Bushi_Brella');
    }

    for (let i = spawnList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [spawnList[i], spawnList[j]] = [spawnList[j], spawnList[i]];
    }

    // 4. Anteponer los jefes a la lista de spawn para que entren primero en combate
    if (isBossWave && bossesToSpawn.length > 0) {
      spawnList.unshift(...bossesToSpawn);
    }

    // 5. Iniciar secuencia de generación con temporizador
    const mobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    gameState.waveSpawnQueue = [...spawnList];
    gameState.waveSpawnIndex = 0;
    gameState.waveSpawnIsBoss = isBossWave;
    gameState.waveBossTypes = [...bossesToSpawn];
    gameState.waveSpawnIntervalMs = mobileDevice
      ? Math.max(240, 650 - Math.min(420, wave * 22))
      : Math.max(300, 800 - Math.min(500, wave * 25));
    startWaveSpawnInterval();
  }

  function updateEnemyStatusUI(e) {
    if (!e.el || !e.hpFill || !e.statusIcons) return;

    const icons = [];
    if (e.stealth) icons.push('🫥');
    if (e.fireImmune) icons.push('🔥🚫');
    if (e.shield > 0) icons.push('🛡️');
    if (e.enemySlowTimer > 0) icons.push('❄️');
    if (e.burnTimer > 0) icons.push('🔥');
    if (e.toxicTimer > 0) icons.push('🤢');
    if (e.poisonTimer > 0) icons.push('🍄');
    if (e.stunned > 0) icons.push('⚡');

    e.statusIcons.textContent = icons.join(' ');
    e.hpValue.textContent = `${Math.max(0, Math.ceil(e.health))}/${Math.ceil(e.maxHealth)}`;
    e.hpFill.style.backgroundColor = e.shield > 0
      ? '#ffd700'
      : e.fireImmune
        ? '#8b0000'
        : e.stealth
          ? '#355c3a'
          : '#ff4444';
  }

  function spawnEnemy(type, boss = false, forcedPath = null, synchronized = false) {
    const rareEnemyTypes = ['Mimic_Pyce', 'Bushi_Brella'];
    const rareEnemiesSpawned = gameState.rareEnemiesSpawned || (gameState.rareEnemiesSpawned = {});
    const mapKey = gameState.map || 'gelatin_lake';
    let rareEnemyToRecord = null;

    const chooseRareFallback = () => {
      const basicEnemies = ENEMY_BALANCE[mapKey]?.basic
        ?.filter(enemyType => ENEMY_TYPES[enemyType] && !rareEnemyTypes.includes(enemyType));
      return basicEnemies?.[Math.floor(Math.random() * basicEnemies.length)] || 'Stupid_Pyce';
    };

    if (!synchronized && (type === 'Mimic_Pyce' || type === 'Bushi_Brella')) {
      const isAvailableOnMap = gameState.mode !== 'interstellar' &&
        (type !== 'Bushi_Brella' || mapKey === 'sunlight_seaside');
      const spawnLimitReached = type === 'Mimic_Pyce'
        ? (rareEnemiesSpawned[type] || 0) >= 1
        : (rareEnemiesSpawned[type] || 0) >= BUSHI_BRELLA_MAX_SPAWNS;
      if (!isAvailableOnMap || spawnLimitReached) {
        type = chooseRareFallback();
      } else {
        rareEnemyToRecord = type;
      }
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

    const currentWave = gameState.wave || 1;
    const selectedType = ENEMY_TYPES[type];
    if (!boss && currentWave < 10 && selectedType?.stealth) {
      const mapBalance = ENEMY_BALANCE[gameState.map || 'gelatin_lake'];
      const earlyPool = (mapBalance?.basic || ['Stupid_Pyce'])
        .filter(enemyType => ENEMY_TYPES[enemyType] && !ENEMY_TYPES[enemyType].stealth);
      const fallbackType = earlyPool[Math.floor(Math.random() * earlyPool.length)] || 'Stupid_Pyce';
      console.warn(`Enemigo invisible bloqueado antes de la oleada 10: ${type}. Se reemplaza por ${fallbackType}.`);
      type = fallbackType;
    }

    const t = ENEMY_TYPES[type];
    if (!t) return console.warn("Enemy type missing:", type);
    const mapBalance = ENEMY_BALANCE[gameState.map || 'gelatin_lake'];
    const tier = boss ? 'boss' : Object.keys(mapBalance || {}).find(key => mapBalance[key].includes(type)) || ((t.health || 0) >= 400 ? 'tank' : (t.health || 0) >= 150 ? 'medium' : 'basic');
    const chosenPath = forcedPath || ENEMY_PATHS[Math.floor(Math.random() * ENEMY_PATHS.length)];
    const enemyMotionClass = boss ? ' enemy-boss' : tier === 'tank' ? ' enemy-tank' : tier === 'medium' ? ' enemy-medium' : ' enemy-basic';
    const el = document.createElement('div'); el.className = 'enemy' + enemyMotionClass + (t.isCrystallized ? ' enemy-crystal' : '');
    el.style.left = `${chosenPath[0].x}px`; el.style.top = `${chosenPath[0].y}px`;
    el.style.setProperty('--enemy-delay', `${-(Math.random() * 1.8).toFixed(2)}s`);

    let imgStr = t.image;
    if (type === 'Spyware') {
      const spywareImages = [IMAGE_PATHS.Spyware1, IMAGE_PATHS.Spyware2, IMAGE_PATHS.Spyware3];
      imgStr = spywareImages[Math.floor(Math.random() * spywareImages.length)];
    }
    if (imgStr) el.style.backgroundImage = `url('${imgStr}')`;
    const hpFill = document.createElement('div'); hpFill.className = 'hp-bar-fill';
    const hpBg = document.createElement('div'); hpBg.className = 'hp-bar-bg';
    const hpValue = document.createElement('div'); hpValue.className = 'enemy-hp-value';
    const statusIcons = document.createElement('div'); statusIcons.className = 'enemy-status-icons';
    hpBg.appendChild(hpFill); el.appendChild(hpValue); el.appendChild(hpBg); el.appendChild(statusIcons);
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
    else if (gameState.mode === 'infinito') mult = 1.3 + (gameState.wave || 1) * 0.014;

    const healthScaled = Math.max(1, (t.health || 10) * (1 + (gameState.wave || 1) * 0.15) * mult);
    const shieldVal = t.shieldRatio ? healthScaled * t.shieldRatio : (t.shield || 0) * (t.health || 10);
    const baseDamage = boss ? 10 : (ENEMY_TIER_DAMAGE[tier] || 2);
    const enemyObj = {
      ...t, name, tier, baseDamage, el, x: chosenPath[0].x, y: chosenPath[0].y,
      pathIndex: 0, currentPath: chosenPath, health: healthScaled, maxHealth: healthScaled,
      hpFill, hpValue, statusIcons, shield: shieldVal, shieldMax: shieldVal, type, boss,
      networkId: `${socket?.id || 'offline'}-${++gameState.networkEntityCounter}`
    };
    el.title = `${name} | HP: ${Math.ceil(healthScaled)}`;
    gameState.enemies.push(enemyObj);
    if (rareEnemyToRecord) {
      rareEnemiesSpawned[rareEnemyToRecord] = (rareEnemiesSpawned[rareEnemyToRecord] || 0) + 1;
    }
  }

  function serializeMultiplayerEntity(entity) {
    return JSON.parse(JSON.stringify(entity, (key, value) => {
      if (['el', 'rangeEl', 'hpFill', 'hpValue', 'statusIcons'].includes(key) || typeof value === 'function') {
        return undefined;
      }
      return value;
    }));
  }

  let synchronizedMatchKey = null;

  function getMultiplayerGameState(allowLocalMatch = false) {
    if ((!currentSeed && !allowLocalMatch) || !gameState.modeConfirmed) return null;
    return {
      seed: currentSeed,
      map: gameState.map,
      mode: gameState.mode,
      maxWaves: gameState.maxWaves,
      health: gameState.health,
      wave: gameState.wave,
      waveActive: gameState.waveActive,
      spawningActive: gameState.spawningActive,
      paused: gameState.paused,
      gameOver: gameState.gameOver,
      globetines: gameState.globetines,
      multiplayerEnabled: multiplayerPlayerCount > 1,
      towerLimits: { ...gameState.towerLimits },
      players: multiplayerPlayers,
      towers: gameState.towers.map(serializeMultiplayerEntity),
      enemies: gameState.enemies.map(serializeMultiplayerEntity),
      waveSpawnQueue: [...(gameState.waveSpawnQueue || [])],
      waveSpawnIndex: gameState.waveSpawnIndex || 0,
      waveSpawnIsBoss: Boolean(gameState.waveSpawnIsBoss),
      waveBossTypes: [...(gameState.waveBossTypes || [])],
      waveSpawnIntervalMs: gameState.waveSpawnIntervalMs || 0,
      matchStats: {
        totalDamage: gameState.totalDamage,
        moneySpentThisGame: gameState.moneySpentThisGame,
        baseTookDamage: gameState.baseTookDamage,
        rareEnemiesSpawned: gameState.rareEnemiesSpawned || {},
        uniquesBossSpawned: gameState.uniquesBossSpawned || {},
        roundKills: gameState.roundKills || [],
        roundIExExplosions: gameState.roundIExExplosions || 0,
        blockQuestStarted: gameState.blockQuestStarted,
        blockQuestPending: gameState.blockQuestPending,
        interstellarStory: gameState.interstellarStory || {},
        interstellarParacristalQuest: gameState.interstellarParacristalQuest,
        paracristalActive: gameState.paracristalActive,
        paracristalEnergy: gameState.paracristalEnergy,
        paracristalAstrorbSeen: gameState.paracristalAstrorbSeen,
        paracristalFinal: gameState.paracristalFinal,
        infiniteCompleted: gameState.infiniteCompleted
      }
    };
  }

  function initializeMultiplayerMatch(snapshot) {
    if (!MAPS[snapshot.map] || typeof snapshot.mode !== 'string') return false;
    const matchKey = `${snapshot.seed || currentSeed}:${snapshot.map}:${snapshot.mode}`;
    if (synchronizedMatchKey === matchKey) return true;

    gameState.map = snapshot.map;
    gameState.mode = snapshot.mode;
    gameState.modeConfirmed = true;
    gameState.maxWaves = Number(snapshot.maxWaves) || 15;
    const island = MAP_ISLANDS.find(item => item.zones.some(zone => zone.mapId === snapshot.map));
    gameState.selectedIsland = island?.id || null;

    generateSpots();
    createMap();
    retryGame();

    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('map-selection').style.display = 'none';
    document.getElementById('mode-selection').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    document.getElementById('meta-controls').style.display = 'flex';
    renderMultiplayerPlayerList(multiplayerPlayers);
    applyScale();
    synchronizedMatchKey = matchKey;
    return true;
  }

  function applyMultiplayerGameState(snapshot) {
    if (!snapshot || typeof snapshot !== 'object' ||
        !Array.isArray(snapshot.towers) || !Array.isArray(snapshot.enemies) ||
        !initializeMultiplayerMatch(snapshot)) return;

    const oldCapacityState = `${multiplayerEnabled}:${JSON.stringify(multiplayerTowerLimits)}`;
    const oldTowerLayout = gameState.towers.map(tower =>
      `${tower.spotId}:${tower.type}:${tower.ownerId || ''}`
    ).join('|');
    multiplayerEnabled = Boolean(snapshot.multiplayerEnabled);
    multiplayerTowerLimits = snapshot.towerLimits && typeof snapshot.towerLimits === 'object'
      ? snapshot.towerLimits
      : multiplayerTowerLimits;
    if (Array.isArray(snapshot.players)) {
      multiplayerPlayers = snapshot.players;
      multiplayerPlayerCount = Math.min(4, Math.max(1, Number(snapshot.playerCount) || snapshot.players.length || 1));
    }
    gameState.health = Number(snapshot.health) || 0;
    gameState.wave = Number(snapshot.wave) || 0;
    gameState.waveActive = Boolean(snapshot.waveActive);
    gameState.spawningActive = Boolean(snapshot.spawningActive);
    gameState.paused = Boolean(snapshot.paused);
    gameState.gameOver = Boolean(snapshot.gameOver);
    gameState.globetines = Number(snapshot.globetines) || 0;
    gameState.maxWaves = Number(snapshot.maxWaves) || gameState.maxWaves;
    gameState.modeConfirmed = true;
    gameState.waveSpawnQueue = Array.isArray(snapshot.waveSpawnQueue) ? [...snapshot.waveSpawnQueue] : [];
    gameState.waveSpawnIndex = Math.max(0, Number(snapshot.waveSpawnIndex) || 0);
    gameState.waveSpawnIsBoss = Boolean(snapshot.waveSpawnIsBoss);
    gameState.waveBossTypes = Array.isArray(snapshot.waveBossTypes) ? [...snapshot.waveBossTypes] : [];
    gameState.waveSpawnIntervalMs = Math.max(0, Number(snapshot.waveSpawnIntervalMs) || 0);
    if (snapshot.matchStats && typeof snapshot.matchStats === 'object') {
      Object.assign(gameState, snapshot.matchStats);
    }

    const towerStates = new Map(snapshot.towers.map(tower => [Number(tower.spotId), tower]));
    gameState.towers = gameState.towers.filter(tower => {
      if (towerStates.has(Number(tower.spotId))) return true;
      tower.el.remove();
      if (tower.rangeEl) tower.rangeEl.remove();
      return false;
    });
    gameState.towerSpots.forEach(spot => { spot.occupied = false; });

    snapshot.towers.forEach(towerState => {
      const towerType = TOWER_TYPES[towerState.type];
      const spotId = Number(towerState.spotId);
      if (!towerType || !Number.isInteger(spotId) || !gameState.towerSpots[spotId]) return;

      let tower = gameState.towers.find(item => Number(item.spotId) === spotId);
      if (!tower) {
        const el = document.createElement('div');
        el.className = 'tower idle-jump';
        el.style.setProperty('--idle-delay', '0s');
        el.onerror = function () {
          el.style.backgroundColor = '#9b59b6';
          el.style.backgroundImage = 'none';
        };
        document.getElementById('map').appendChild(el);
        tower = { ...towerType, el };
        tower.el.onclick = event => {
          event.stopPropagation();
          selectTower(tower);
        };
        gameState.towers.push(tower);
      }

      const previousType = tower.type;
      Object.assign(tower, towerState);
      tower.el.style.left = `${tower.x}px`;
      tower.el.style.top = `${tower.y}px`;
      if (previousType !== tower.type || !tower.el.style.backgroundImage) {
        tower.el.style.backgroundImage = `url('${encodeURI(getTowerImage(tower.type))}')`;
        applyTowerEffects(tower.el, tower.type);
      }
      gameState.towerSpots[spotId].occupied = true;
    });

    const enemyStates = new Map(snapshot.enemies.map(enemy => [enemy.networkId, enemy]));
    gameState.enemies = gameState.enemies.filter(enemy => {
      if (enemyStates.has(enemy.networkId)) return true;
      enemy.el.remove();
      return false;
    });
    snapshot.enemies.forEach(enemyState => {
      if (typeof enemyState.networkId !== 'string' || !ENEMY_TYPES[enemyState.type]) return;
      let enemy = gameState.enemies.find(item => item.networkId === enemyState.networkId);
      if (!enemy) {
        spawnEnemy(enemyState.type, Boolean(enemyState.boss), enemyState.currentPath, true);
        enemy = gameState.enemies[gameState.enemies.length - 1];
        if (!enemy || enemy.type !== enemyState.type) return;
      }
      Object.assign(enemy, enemyState);
      enemy.el.style.left = `${enemy.x}px`;
      enemy.el.style.top = `${enemy.y}px`;
      enemy.el.title = `${enemy.name} | HP: ${Math.ceil(enemy.health)}`;
      updateEnemyStatusUI(enemy);
    });

    updateAllTowerRanges();
    updateUI();
    const newTowerLayout = gameState.towers.map(tower =>
      `${tower.spotId}:${tower.type}:${tower.ownerId || ''}`
    ).join('|');
    if (oldCapacityState !== `${multiplayerEnabled}:${JSON.stringify(multiplayerTowerLimits)}` ||
        oldTowerLayout !== newTowerLayout) {
      drawTowerShop();
    }
    if (gameState.paused || gameState.gameOver) {
      const modal = document.getElementById('game-over');
      if (modal) modal.style.display = 'flex';
    } else if (!gameState.gameOver) {
      const modal = document.getElementById('game-over');
      if (modal) modal.style.display = 'none';
    }
    return true;
  }

  function applyMultiplayerAction(action) {
    if (multiplayerSpectator || !action || typeof action.type !== 'string') return;
    applyingMultiplayerAction = true;
    multiplayerActionOwner = action.playerId || null;
    try {
      if (action.type === 'place-tower') {
        placeTower(action.spotId, action.towerType);
      } else if (action.type === 'evolve-tower') {
        const tower = gameState.towers.find(item => item.spotId === action.spotId);
        if (tower) evolveTower(tower, action.towerType, action.cost);
      } else if (action.type === 'sell-tower') {
        const tower = gameState.towers.find(item => item.spotId === action.spotId);
        if (tower) sellTower(tower);
      } else if (action.type === 'start-wave') {
        startWave();
      } else if (action.type === 'pause') {
        pauseGame();
      } else if (action.type === 'resume') {
        resumeGame();
      } else if (action.type === 'retry') {
        retryGame();
      }
    } finally {
      applyingMultiplayerAction = false;
      multiplayerActionOwner = null;
      if (['place-tower', 'evolve-tower', 'sell-tower'].includes(action.type)) {
        drawTowerShop();
      }
    }
  }

  function checkpointActiveRound() {
    if (!gameState.modeConfirmed || gameState.gameOver || multiplayerSpectator ||
        (currentSeed && !isSeedHost)) return false;
    const snapshot = getMultiplayerGameState(true);
    if (!snapshot) return false;
    snapshot.paused = false;
    snapshot.gameOver = false;
    snapshot.savedAt = Date.now();
    gameState.savedRoundSnapshot = snapshot;
    saveProgress();
    return true;
  }

  function restoreSavedRoundSnapshot(snapshot) {
    if (!snapshot || !MAPS[snapshot.map] ||
        typeof snapshot.mode !== 'string' ||
        !Array.isArray(snapshot.towers) ||
        !Array.isArray(snapshot.enemies) ||
        !Array.isArray(snapshot.waveSpawnQueue) ||
        !Number.isFinite(Number(snapshot.wave)) ||
        (snapshot.mode === 'interstellar' && !hasInterstellarEntryAccess())) return false;

    const restoredSnapshot = {
      ...snapshot,
      seed: null,
      multiplayerEnabled: false,
      players: [],
      paused: false,
      gameOver: false
    };
    if (!applyMultiplayerGameState(restoredSnapshot)) return false;

    gameState.paused = false;
    gameState.gameOver = false;
    gameState.savedRoundSnapshot = null;
    if (gameState.waveActive && gameState.spawningActive) {
      startWaveSpawnInterval();
    } else {
      gameState.spawningActive = false;
    }
    if (gameState.waveActive && roundCheckpointInterval === null) {
      roundCheckpointInterval = setInterval(checkpointActiveRound, 5000);
    }
    lastGameFrameTime = performance.now();
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('map-selection').style.display = 'none';
    document.getElementById('mode-selection').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    document.getElementById('meta-controls').style.display = 'flex';
    renderMultiplayerPlayerList([]);
    applyScale();
    return true;
  }

  window._getMultiplayerGameState = getMultiplayerGameState;
  window._applyMultiplayerGameState = applyMultiplayerGameState;
  window._applyMultiplayerAction = applyMultiplayerAction;
  window._checkpointActiveRound = checkpointActiveRound;
  window._restoreSavedRoundSnapshot = restoreSavedRoundSnapshot;
  window._showMultiplayerNotice = text => showMessage(text, 'info');
  window._showMultiplayerServerClosed = () => {
    gameState.gameOver = true;
    gameState.paused = false;
    gameState.spawningActive = false;
    const modal = document.getElementById('game-over');
    const title = modal?.querySelector('h2');
    const message = document.getElementById('game-over-msg');
    const actions = modal?.querySelector('.game-over-actions');
    if (!modal || !title || !message || !actions) {
      console.error('No se pudo mostrar el cierre del servidor: faltan elementos del diálogo.');
      return;
    }
    title.textContent = currentLanguage === 'en' ? 'SERVER CLOSED' : 'SERVIDOR CERRADO';
    message.textContent = currentLanguage === 'en'
      ? 'The host left or the server stopped. This match is lost and cannot be recovered. Restarting starts a new match.'
      : 'El anfitrión se ha ido o el servidor se ha detenido. Esta partida se ha perdido y no se puede recuperar. Reiniciar empezará una partida nueva.';
    modal.querySelector('.modal-content')?.classList.remove('paused', 'victory');
    actions.querySelectorAll('button').forEach(button => {
      button.style.display = button.classList.contains('exit-btn') || button.id === 'multiplayer-restart-btn'
        ? 'inline-flex'
        : 'none';
    });
    const exitButton = actions.querySelector('.exit-btn');
    if (exitButton) exitButton.textContent = currentLanguage === 'en' ? '🚪 Exit' : '🚪 Salir';
    const restartButton = document.getElementById('multiplayer-restart-btn');
    if (restartButton) restartButton.textContent = currentLanguage === 'en' ? '🔄 Restart from scratch' : '🔄 Reiniciar desde cero';
    modal.style.display = 'flex';
  };
  window._refreshMultiplayerUI = drawTowerShop;

  function spawnBoat(tower) {
    const typeDef = TOWER_TYPES[tower.type];
    if (!typeDef || !typeDef.summonType) return;
    const summonType = typeDef.summonType;
    let imagePath = IMAGE_PATHS[summonType];
    const equippedSkin = gameState.equippedSkins[tower.family];
    const skinSet = equippedSkin && SKINS_DATA[tower.family]
      ? SKINS_DATA[tower.family].find(skin => skin.id === equippedSkin)
      : null;
    const hasCustomSummonSkin = Boolean(
      skinSet?.isSpecial &&
      skinSet.skins &&
      Object.prototype.hasOwnProperty.call(skinSet.skins, summonType)
    );
    const hasCustomSummons = Boolean(
      skinSet?.isSpecial &&
      skinSet.skins &&
      Object.keys(skinSet.skins).some(key => key.startsWith('Boat_'))
    );
    if (hasCustomSummonSkin) {
      imagePath = skinSet.skins[summonType];
    } else if (hasCustomSummons) {
      imagePath = IMAGE_PATHS[summonType];
      console.warn(`La skin ${equippedSkin} no tiene summon para ${summonType}; se usa el summon base como fallback.`);
    }
    
    if (!hasCustomSummonSkin && summonType === 'Boat_S1' && Math.random() < 0.3) {
      imagePath = IMAGE_PATHS['Boat_S1_Broken'];
    } else if (!hasCustomSummonSkin && summonType === 'Boat_S2' && Math.random() < 0.3) {
      imagePath = IMAGE_PATHS['Boat_S2_Destroyed'];
    }

    const chosenPath = ENEMY_PATHS[Math.floor(Math.random() * ENEMY_PATHS.length)];
    const startPoint = chosenPath[chosenPath.length - 1]; // Start at allied base

    const el = document.createElement('div');
    el.className = 'boat projectile';
    el.style.position = 'absolute';
    el.style.width = '60px';
    el.style.height = '60px';
    el.style.left = startPoint.x + 'px';
    el.style.top = startPoint.y + 'px';
    el.style.transform = 'translate(-50%, -50%)';
    el.style.backgroundImage = `url('${encodeURI(imagePath)}')`;
    el.style.backgroundSize = 'contain';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundPosition = 'center';
    el.style.zIndex = '6';

    const mapElement = document.getElementById('map') || document.getElementById('game-area');
    if (!mapElement) {
      console.error('No se pudo crear el summon de Marina: no existe el contenedor del mapa.');
      return;
    }
    mapElement.appendChild(el);

    const boat = {
      el: el,
      x: startPoint.x,
      y: startPoint.y,
      pathIndex: chosenPath.length - 1,
      currentPath: chosenPath,
      speed: { Boat_S1: 35, Boat_S2: 45, Boat_S3: 60, Boat_S4: 75 }[summonType] || 35,
      summonType: summonType,
      damage: tower.damage * ({ Boat_S1: 1, Boat_S2: 1.4, Boat_S3: 2, Boat_S4: 3 }[summonType] || 1),
      health: summonType === 'Boat_S4'
        ? 450 + Math.floor(Math.random() * 51)
        : ({ Boat_S1: 50, Boat_S2: 120, Boat_S3: 250 }[summonType] || 50),
      maxHealth: summonType === 'Boat_S4'
        ? 0
        : ({ Boat_S1: 50, Boat_S2: 120, Boat_S3: 250 }[summonType] || 50),
      shooter: tower,
      isBoat: true,
      hitEntities: new Set(),
      cooldownTimer: 2.0,
      normalShotsCount: 2
    };
    boat.maxHealth = boat.health;

    gameState.boats = gameState.boats || [];
    gameState.boats.push(boat);
  }

  let seenEnemyDialogues = {};

  function isBossDialogueAllowed(type) {
    if (type === 'Arky') return !['corrupto', 'antiNormal'].includes(gameState.mode);
    if (type === 'ArkyVoid') return gameState.mode === 'corrupto';
    if (type === 'CrystArky') return gameState.mode === 'antiNormal';
    return true;
  }

  function checkEnemyDialogues(type) {
    if (seenEnemyDialogues[type] || document.getElementById('narrator-bubble')) return;
    if (!isBossDialogueAllowed(type)) return;

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
        // En Urbanistic Road, los Arkys solo hablan cuando el jefe correspondiente está presente.
        speakers = isCutoff ? [] : ['bombot', 'glob'];
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
        if (gameState.enemies.some(e => e.type === 'Arky' && isBossDialogueAllowed('Arky'))) speakers.push('arky');
        if (gameState.enemies.some(e => e.type === 'CrystArky' && isBossDialogueAllowed('CrystArky'))) speakers.push('crystarky');
        if (gameState.enemies.some(e => e.type === 'ArkyVoid' && isBossDialogueAllowed('ArkyVoid'))) speakers.push('arkyvoid');
      }

      if (speakers.length === 0) return;
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
  function showNarratorMsg(speakerId, imgSrc, speakerName, text, variant = '') {
    const old = document.getElementById('narrator-bubble');
    if (old) old.remove();
    if (narratorTimeout) clearTimeout(narratorTimeout);

    const isBlackedOut = imgSrc.endsWith('|blacked-out');
    const renderedImgSrc = isBlackedOut ? imgSrc.replace(/\|blacked-out$/, '') : imgSrc;
    const bubble = document.createElement('div');
    bubble.id = 'narrator-bubble';
    bubble.className = `narrator-bubble narrator-enter speaker-${speakerId}${isBlackedOut ? ' image-blacked-out' : ''}${variant ? ` ${variant}` : ''}`;
    bubble.innerHTML = `
    <img src="${renderedImgSrc}" class="narrator-portrait" onerror="this.style.display='none'">
    <div class="narrator-text-box">
      <div class="narrator-name">${speakerName}</div>
      <div class="narrator-text" aria-live="polite"></div>
    </div>
    <button class="narrator-close" onclick="closeNarratorMsg()">✕</button>
  `;
    document.body.appendChild(bubble);
    const textElement = bubble.querySelector('.narrator-text');
    let characterIndex = 0;
    const typeCharacter = () => {
      if (!textElement || !bubble.isConnected) return;
      textElement.textContent = text.slice(0, characterIndex);
      characterIndex += 1;
      if (characterIndex <= text.length) {
        setTimeout(typeCharacter, textElement.textContent.endsWith(' ') ? 18 : 28);
      }
    };
    typeCharacter();

    setTimeout(() => {
      if (bubble.parentNode) {
        bubble.classList.remove('narrator-enter');
        bubble.classList.add('narrator-float');
      }
    }, 500); // 500ms after enter animation finishes

    narratorTimeout = setTimeout(() => { closeNarratorMsg(); }, 6000);
  }
  window._showNarratorMsg = showNarratorMsg;

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

  let lastGameFrameTime = 0;
  let frameCount = 0;
  const MAX_PROJECTILES = 120; // Límite de proyectiles activos en pantalla

  function damageBaseFromEnemy(enemy) {
    const damage = Math.max(1, Number(enemy.baseDamage) || 2);
    gameState.health = Math.max(0, gameState.health - damage);
    gameState.baseTookDamage = true;
    showEffect(enemy.x, enemy.y, `-${damage}`);
    updateUI();
    if (gameState.health <= 0) endGame();
  }

  function gameLoop(timestamp = performance.now()) {
    if (multiplayerSpectator || gameState.gameOver || gameState.paused) {
      requestAnimationFrame(gameLoop);
      return;
    }
    try {
      const elapsed = lastGameFrameTime ? (timestamp - lastGameFrameTime) / 1000 : 1 / 60;
      const dt = Math.min(0.05, Math.max(1 / 120, elapsed));
      const movementScale = dt * 60;
      lastGameFrameTime = timestamp;
      frameCount++;
      gameState.simultaneousExplosions = 0;

      // === ANTI-LAG: Eliminar proyectiles en exceso (los más viejos, no jefes ni piercing) ===
      if (gameState.projectiles.length > MAX_PROJECTILES) {
        let toRemove = gameState.projectiles.length - MAX_PROJECTILES;
        for (let i = 0; i < gameState.projectiles.length && toRemove > 0; i++) {
          const p = gameState.projectiles[i];
          if (!p.piercing && !p.boomerang && !p.isEnemy) {
            p.el.remove();
            gameState.projectiles.splice(i, 1);
            i--; toRemove--;
          }
        }
      }

      if (gameState.paracristalActive && gameState.waveActive && Math.random() < 0.012) {
        spawnParacristal();
      }
      if (gameState.paracristalActive && gameState.health < 120) {
        gameState.paracristalActive = false;
        gameState.paracristalEnergy = Math.max(0, gameState.paracristalEnergy - 20);
        document.querySelectorAll('.paracristal').forEach(crystal => crystal.remove());
      }
      const crystalEnergy = document.getElementById('paracristal-energy');
      if (crystalEnergy && gameState.paracristalActive) {
        crystalEnergy.textContent = `${currentLanguage === 'es' ? '💎 Energía cristalina' : '💎 Crystal energy'}: ${Math.ceil(gameState.paracristalEnergy)}%`;
      }

      function isTowerProtected(tower) {
        if (!gameState.duckgrades.dg_Grey) return false;
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
        const currentVitality = (e.health || 0) + (e.shield || 0);
        if (e._visualVitality !== undefined && currentVitality < e._visualVitality && e.el) {
          e.el.classList.remove('hit-flash');
          void e.el.offsetWidth;
          e.el.classList.add('hit-flash');
          setTimeout(() => e.el && e.el.classList.remove('hit-flash'), 260);
        }
        e._visualVitality = currentVitality;

        let currentEnemySpeed = e.speed;
        if (e.stunned && e.stunned > 0) {
          e.stunned -= dt;
          currentEnemySpeed = 0;
        }

        if (next) {
          const dx = next.x - e.x, dy = next.y - e.y, dist = Math.hypot(dx, dy);
          const movementStep = currentEnemySpeed * movementScale;
          if (dist < movementStep) e.pathIndex++;
          else { e.x += (dx / dist) * movementStep; e.y += (dy / dist) * movementStep; }
          if (frameCount % 2 === 0) {
            e.el.style.left = `${e.x}px`; e.el.style.top = `${e.y}px`;
          }
        } else {
          if (e.instakill) { gameState.baseTookDamage = true; gameState.health = 0; endGame(); return; }
          if (e.doubleLap && !e.lapped) { e.pathIndex = 0; e.lapped = true; continue; }
          e.el.remove(); gameState.enemies.splice(i, 1);
          damageBaseFromEnemy(e);
          continue;
        }

        const totalCurrent = e.health + (e.shield || 0);
        const totalMax = e.maxHealth + (e.shieldMax || 0);
        const pct = Math.max(0, (totalCurrent / totalMax) * 100);
        e.hpFill.style.width = pct + '%';
        e.el.title = `${e.name} | HP: ${Math.max(0, Math.ceil(e.health))}/${Math.ceil(e.maxHealth)}`;

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
                t.arkyVoidTimer = 10;
                t.range = t.range * 0.9;
                if (t.el) t.el.style.filter = "drop-shadow(0 0 10px #ff69b4) hue-rotate(-50deg)";
                showEffect(t.x, t.y - 20, currentLanguage === 'es' ? "-10% Rango" : "-10% Range");
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

        let brownAuraMax = 0;
        gameState.towers.forEach(t => {
          const typeCfg = TOWER_TYPES[t.type];
          if (typeCfg && typeCfg.slowAura) {
            const dist = Math.hypot(t.x - e.x, t.y - e.y);
            if (dist <= typeCfg.range) {
              brownAuraMax = Math.max(brownAuraMax, typeCfg.slowAura);
            }
          }
        });
        if (brownAuraMax > 0 && currentEnemySpeed > 0) {
          currentEnemySpeed *= (1 - brownAuraMax);
          e.el.style.filter = (e.el.style.filter || '') + ' sepia(0.8) hue-rotate(30deg) brightness(0.8)';
        }

        if (e.burnTimer && e.burnTimer > 0) {
          e.burnTimer -= dt;
          const dmg = (e.burnDamage || 5) * dt;
          if (e.type === 'Fireflies') {
            e.health = Math.min(e.maxHealth, e.health + dmg);
            e.el.classList.add('burning');
          } else {
            e.health -= dmg;
            e.el.classList.add('burning');
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
        }

        if (gameState.traps && gameState.traps.length > 0) {
          for (let j = gameState.traps.length - 1; j >= 0; j--) {
            let trap = gameState.traps[j];
            // DJ_Trap is NOT contact-based — it has its own active loop below
            if (trap.parentType === 'DJ_Glob') continue;
            if (trap.active && Math.hypot(e.x - trap.x, e.y - trap.y) <= (trap.radius || 40)) {
              let dmg = trap.damage;
              e.health -= dmg;
              // Deberia ser como las demas vallas, pero que vaya atacando mientras tengs un enemigo cerca, como una torreta (COD-637)
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
              if (trap.whiteSupport) {
                e.stunned = (e.stunned || 0) + 1.5;
              }

              showEffect(trap.x, trap.y, "TRAP! 💥", "#f39c12");

              if (gameState.duckgrades && gameState.duckgrades.dg_Worker_Glob && !trap.triggeredOnce) {
                trap.triggeredOnce = true;
                trap.ignoreEnemyId = e.id || Math.random();
              } else {
                // wall_garden: check if enemy slowed by Brown family when trap destroyed
                let brownSlowing = false;
                gameState.towers.forEach(bt => {
                  if (TOWER_TYPES[bt.type] && TOWER_TYPES[bt.type].slowAura) {
                    if (Math.hypot(bt.x - e.x, bt.y - e.y) <= TOWER_TYPES[bt.type].range) brownSlowing = true;
                  }
                });
                if (brownSlowing) unlockBadge('wall_garden');
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

          gameState.enemies.forEach(other => {
            if (other !== e && !other.poisonTimer && Math.hypot(other.x - e.x, other.y - e.y) < 40) {
              other.poisonTimer = 3;
            }
          });
        }

        updateEnemyStatusUI(e);

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
        if (e.type === 'Crystal_Bombot') {
          e.attackTimer1 = (e.attackTimer1 || 0) + dt;
          if (e.attackTimer1 > 5) {
            e.attackTimer1 = 0;
            if (gameState.towers.length > 0) {
              const targetTower = gameState.towers[Math.floor(Math.random() * gameState.towers.length)];
              shoot(e, targetTower, { isEnemy: true, image: 'img/Proyectiles/Crystal Metor.png', speed: 3, stun: 3 });
            }
          }
        }
        if (e.type === 'AstrorbTF') {
          e.attackTimer1 = (e.attackTimer1 || 0) + dt;
          if (e.attackTimer1 > 4) {
            e.attackTimer1 = 0;
            if (gameState.towers.length > 0) {
              const targetTower = gameState.towers[Math.floor(Math.random() * gameState.towers.length)];
              shoot(e, targetTower, { isEnemy: true, image: 'img/Proyectiles/Crystal Metor.png', speed: 4, stun: 4 });
            }
            if (Math.random() < 0.3 && gameState.mode === 'interstellar') {
              const msgs = [
                { es: "Nada escapará a las estrellas.", en: "Nothing will escape the stars." },
                { es: "Todo será eterno.", en: "Everything will be eternal." }
              ];
              const r = msgs[Math.floor(Math.random() * msgs.length)];
              showNarratorMsg('astrorb', 'Interestelar Menace (COLLAB UPD)/Skins/Grey/Astrorb/AstrorbOrbe.png', 'Astrorb', currentLanguage === 'es' ? r.es : r.en);
            }
          }
        }
        if (['NO_CrystEye_CB', 'AstrorbOrbe', 'AstrorbContenida', 'Crystalic_Orb'].includes(e.type)) {
          e.crystalMeteorTimer = (e.crystalMeteorTimer || 0) + dt;
          const attackInterval = e.type === 'NO_CrystEye_CB' ? 8 : 5;
          if (e.crystalMeteorTimer > attackInterval) {
            e.crystalMeteorTimer = 0;
            if (gameState.towers.length > 0) {
              const targetTower = gameState.towers[Math.floor(Math.random() * gameState.towers.length)];
              const isFinalAstrorb = e.type === 'Crystalic_Orb';
              shoot(e, targetTower, {
                isEnemy: true,
                image: 'img/Proyectiles/Crystal Metor.png',
                speed: isFinalAstrorb ? 4 : e.type === 'NO_CrystEye_CB' ? 3.5 : 3,
                stun: isFinalAstrorb ? 4 : e.type === 'NO_CrystEye_CB' ? 2.5 : 3
              });
            }
          }
        }
        if (e.honeySlow || e.blueHoneySlow) {
          e.attackTimer1 = (e.attackTimer1 || 0) + dt;
          if (e.attackTimer1 > 4) {
            e.attackTimer1 = 0;
            if (gameState.towers.length > 0) {
              const targetTowers = gameState.towers.sort(() => 0.5 - Math.random()).slice(0, 3);
              targetTowers.forEach(targetTower => {
                const slowVal = e.blueHoneySlow ? 5 : 3;
                shoot(e, targetTower, { isEnemy: true, projectile: 'stone_small', speed: 2, slow: slowVal });
              });
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
        if (e.type === 'SkeleBone_Pyce') {
          e.boneThrowTimer = (e.boneThrowTimer || 0) + dt;
          if (e.boneThrowTimer >= 4.5 && gameState.towers.length > 0) {
            e.boneThrowTimer = 0;
            const targetTower = gameState.towers.reduce((nearest, tower) =>
              !nearest || Math.hypot(tower.x - e.x, tower.y - e.y) < Math.hypot(nearest.x - e.x, nearest.y - e.y)
                ? tower
                : nearest,
              null
            );
            if (targetTower) {
              shoot(e, targetTower, { isEnemy: true, image: IMAGE_PATHS.SkeleBone_Bone, speed: 7, stun: 0.75 });
            }
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
        if (t.arkyVoidReduced) {
          t.arkyVoidTimer = Math.max(0, (t.arkyVoidTimer || 0) - dt);
          if (t.arkyVoidTimer === 0) {
            t.arkyVoidReduced = false;
            t.range = t.originalRange;
            delete t.originalRange;
            if (t.el) t.el.style.filter = '';
            showEffect(t.x, t.y - 20, currentLanguage === 'es' ? "Rango Restaurado" : "Range Restored");
          }
        }
        if (t.gTackCooldown && t.gTackCooldown > 0) {
          t.gTackCooldown -= dt;
          if (t.gTackCooldown < 0) t.gTackCooldown = 0;
          if (gameState.selectedTower === t) updateEvolveButtons(t);
        }
        if (t.marineGtackTimer && t.marineGtackTimer > 0) {
          t.marineGtackTimer -= dt;
          if (t.marineGtackTimer < 0) t.marineGtackTimer = 0;
        }
        if (t.whiteSupportTimer && t.whiteSupportTimer > 0) {
          t.whiteSupportTimer -= dt;
          if (t.whiteSupportTimer < 0) t.whiteSupportTimer = 0;
        }
        if (t.pinkGtackTimer && t.pinkGtackTimer > 0) {
          t.pinkGtackTimer -= dt;
          if (t.pinkGtackTimer < 0) t.pinkGtackTimer = 0;
        }
        if (t.summonCooldown && t.summonCooldown > 0) {
          const summonCooldownRate = t.marineGtackTimer > 0 ? 0.8 : 1;
          t.summonCooldown -= dt * summonCooldownRate;
          if (t.summonCooldown < 0) t.summonCooldown = 0;
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
        if (gameState.enemies.some(e => e.darkAura)) {
          currentSpeed *= 0.6; // DarkSpirit ralentiza
        }

        if (t.brownBuffTimer && t.brownBuffTimer > 0) {
          t.brownBuffTimer -= dt;
          currentSpeed *= 1.5;
        }
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
        if (t.attackAnim && t.attackAnim > 0) {
          t.attackAnim -= dt;
          if (t.attackAnim <= 0 && t.family === 'Special' && t.type === 'Work_Bombot' && gameState.equippedSkins['Special'] === 'cuby_bombot') {
            t.el.style.backgroundImage = `url('${encodeURI(IMAGE_PATHS['Cuby_BombotA1'])}')`;
          }
        }

        if (t.iexBuffTimer && t.iexBuffTimer > 0) {
          t.iexBuffTimer -= dt;
          currentSpeed *= 2;
        }

        if (t.family === 'IEx') {
          const targets = gameState.enemies.filter(e => Math.hypot(e.x - t.x, e.y - t.y) <= t.range);
          if (targets.length > 0 || t.forceExplode) {
            showEffect(t.x, t.y, "BOOM!", "#ff0000");
            
            gameState.simultaneousExplosions++;
            if (gameState.simultaneousExplosions >= 3) {
              unlockBadge('chain_reaction');
            }
            
            let expImg = 'img/Proyectiles/Explosion Effect.png';
            if (gameState.equippedSkins['IEx'] === 'fracstal_set') {
              if (t.type === 'Bomb_Glob') expImg = 'Interestelar Menace (COLLAB UPD)/Skins/Fracstral Set/Explosiones/Crystal Explosion (1).png';
              else if (t.type === 'TNT_Glob') expImg = 'Interestelar Menace (COLLAB UPD)/Skins/Fracstral Set/Explosiones/Crystor Kaboom (2).png';
              else if (t.type === 'Nuclear_Glob') expImg = 'Interestelar Menace (COLLAB UPD)/Skins/Fracstral Set/Explosiones/Nuclear Crystal (3).png';
            }
            
            const expEl = document.createElement('div');
            expEl.style.position = 'absolute';
            expEl.style.left = t.x + 'px';
            expEl.style.top = t.y + 'px';
            let size = Math.max(120, t.range * 1.5);
            if (gameState.equippedSkins['IEx'] === 'fracstal_set' && t.type === 'Nuclear_Glob') {
              size *= 2.5;
            }
            expEl.style.width = size + 'px';
            expEl.style.height = size + 'px';
            expEl.style.transform = 'translate(-50%, -50%) scale(0.2)';
            expEl.style.backgroundImage = `url('${encodeURI(expImg)}')`;
            expEl.style.backgroundSize = 'contain';
            if (gameState.equippedSkins['IEx'] === 'froggy_set') {
              expEl.style.filter = 'hue-rotate(120deg) saturate(1.5)';
            }
            expEl.style.backgroundRepeat = 'no-repeat';
            expEl.style.backgroundPosition = 'center';
            expEl.style.zIndex = '35';
            expEl.style.pointerEvents = 'none';
            expEl.style.transition = 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease-out 0.15s';
            document.getElementById('map').appendChild(expEl);
            
            setTimeout(() => { expEl.style.transform = 'translate(-50%, -50%) scale(1)'; }, 10);
            setTimeout(() => { expEl.style.opacity = '0'; }, 150);
            setTimeout(() => { expEl.remove(); }, 500);

            gameState.roundIExExplosions = (gameState.roundIExExplosions || 0) + 1;
            if (gameState.roundIExExplosions >= 100) unlockBadge('explosiones_por_doquier');

            if (targets.length > 0) {
              targets.forEach(e => {
                const wasAlive = e.health > 0;
                e.health -= t.damage;
                if (wasAlive && e.health <= 0 && !e.nonIExDamage) {
                  const baseHealth = ENEMY_TYPES[e.type] ? ENEMY_TYPES[e.type].health : 0;
                  const isTank = ['Armored_Pyce', 'Iron_Pyce', 'Titan_Pyce', 'Titan_Pyce2', 'King_Pyce', 'Cristalized_Monster', 'Lenistal'].includes(e.type) || 
                                 (baseHealth >= 1500 && !(ENEMY_TYPES[e.type] && ENEMY_TYPES[e.type].boss));
                  if (isTank) {
                    const inTrap = gameState.traps && gameState.traps.some(trap => trap.active && Math.hypot(e.x - trap.x, e.y - trap.y) <= (trap.radius || 40));
                    if (inTrap) {
                      unlockBadge('fenced_kaboom');
                    }
                  }
                }
                if (gameState.duckgrades.dg_IEx) {
                  if ((t.type === 'Bomb_Glob' || t.type === 'TNT_Glob') && !e.fireImmune) {
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
            const trapSize = isDJ ? 50 : 40;
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
                whiteSupport: !!(t.whiteSupportTimer && t.whiteSupportTimer > 0),
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
            t.cooldown = (1 / workerSpeed) * (isDJ ? 3 : 1) * (t.pinkGtackTimer > 0 ? 1.25 : 1);
          }
          return;
        }

        if (t.cooldown <= 0 && t.family !== 'Ducky_Glob') {
          const isEvo1 = !Object.values(TOWER_TYPES).some(typeDef => typeDef.evolution === t.type);
          const isEvo2 = Object.values(TOWER_TYPES).some(typeDef => typeDef.evolution === t.type) && !Object.values(TOWER_TYPES).some(typeDef => typeDef.evolution === Object.values(TOWER_TYPES).find(td => td.evolution === t.type)?.type);

          const isEvo1Or2 = t.type === 'Bomb_Glob' || t.type === 'TNT_Glob' || t.type === 'Worker_Glob' || t.type === 'Police_Glob' || t.type === 'SpyGlob' || isEvo1 || isEvo2;

          const targets = gameState.enemies.filter(e => {
            if (e.holo && isEvo1) return false;
            if (e.mechanic_key === 'mechanic_spyware' && isEvo1Or2) return false;
            return Math.hypot(e.x - t.x, e.y - t.y) <= t.range;
          });
          if (targets.length || (t.isSummoner && gameState.enemies.length > 0)) {
            // Trigger attack animation on the tower element
            const performsAttack = !t.isSummoner || !t.summonCooldown || t.summonCooldown <= 0;
            if (t.el && performsAttack) {
              const wasJump = t.el.classList.contains('idle-jump');
              const wasWobble = t.el.classList.contains('idle-wobble');
              t.el.classList.remove('idle-jump', 'idle-wobble');
              t.el.classList.add('attacking');
              setTimeout(() => {
                if (t.el) {
                  t.el.classList.remove('attacking');
                  if (wasJump) t.el.classList.add('idle-jump');
                  else if (wasWobble) t.el.classList.add('idle-wobble');
                }
              }, 260);
            }
            let dmg = t.damage;
            if (gameState.duckgrades.dg_Red_Glob && t.family === 'Red_Glob') {
              const redCount = gameState.towers.filter(rt => rt.family === 'Red_Glob').length;
              dmg *= (1 + (redCount * 0.1));
            }

            const marineGtackActive = t.family === 'Pirate_Glob' && t.marineGtackTimer > 0;
            if (marineGtackActive) {
              const useIexGlob = Math.random() < 0.2;
              const specialType = useIexGlob ? 'TNT_Glob' : 'Bomb_Glob';
              const bombShooter = { ...t, aoe: true, projectile: 'tumble_bomb' };
              const attackTarget = targets[0] || gameState.enemies[0];
              if (attackTarget) {
                shoot(bombShooter, attackTarget, {
                  damage: dmg * (useIexGlob ? 2 : 1.25),
                  projectile: 'tumble_bomb',
                  image: 'img/Proyectiles/Proyectil_Bomba.png',
                  boatBomb: true,
                  bombType: specialType
                });
              }
            }
            if (t.isSummoner) {
              if (!t.summonCooldown || t.summonCooldown <= 0) {
                spawnBoat(t);
                const baseSummonCooldown = { Boat_S1: 3.5, Boat_S2: 3, Boat_S3: 2.5, Boat_S4: 2 }[t.summonType] || 3;
                t.summonCooldown = baseSummonCooldown;
              }
            } else if (t.type === 'SpyGlob') {
              let baseAngle = Math.atan2(targets[0].y - t.y, targets[0].x - t.x);
              const angles = [-0.3, 0, 0.3];
              angles.forEach(a => {
                const tx = targets[0].x + Math.cos(baseAngle + a) * 60;
                const ty = targets[0].y + Math.sin(baseAngle + a) * 60;
                const fakeTarget = gameState.enemies.length > 0 ? targets[Math.floor(Math.random() * Math.min(targets.length, 3))] : targets[0];
                shoot(t, fakeTarget, { damage: dmg * 0.8 });
              });
            } else if (gameState.duckgrades.dg_Grey && t.type === 'Pyce_Glob' && Math.random() < 0.2) {
              for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
                const radialTarget = { x: t.x + Math.cos(a) * 100, y: t.y + Math.sin(a) * 100, health: 999 };
                const specialAttack = getSpecialAttack(t, radialTarget, dmg);
                if (!specialAttack) shoot(t, radialTarget, { damage: dmg });
              }
            } else {
              const specialAttack = getSpecialAttack(t, targets[0], dmg);
              if (!specialAttack) shoot(t, targets[0], { damage: dmg });
            }
            t.cooldown = (1 / currentSpeed) * (t.pinkGtackTimer > 0 ? 1.25 : 1);
          }
        }
      });

      function applyProjectileHit(p, target) {
        if (p.isEnemy) {
          if (isTowerProtected(target)) {
            showEffect(target.x, target.y - 20, "IMMUNE! 🛡️", "#00ffcc");
            return;
          }
          if (target.type === 'Haunted_Pirate_Glob') {
            showEffect(target.x, target.y - 20, "IMMUNE! 👻", "#666666");
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
          }
          if (p.meta.burn) {
            if (!target.fireImmune) {
              target.burnTimer = 3.0;
              target.burnDamage = p.meta.burnDamage || 5;
            }
          }
          if (p.meta.toxic) {
            target.toxicTimer = (target.toxicTimer || 0) + 3.0;
          }
          if (p.meta.poison) {
            target.poisonTimer = (target.poisonTimer || 0) + 5.0;
          }
          if (p.meta.stunStrike) {
            target.stunned = (target.stunned || 0) + 3.0;
          }
          if (p.meta.stun) {
            target.stunned = Math.max(target.stunned || 0, p.meta.stun);
          }
          if (p.meta.knockback && Math.random() < p.meta.knockback) {
            target.pathIndex = Math.max(0, target.pathIndex - 1);
            const retreatPoint = target.currentPath[target.pathIndex];
            if (retreatPoint) {
              target.x = retreatPoint.x;
              target.y = retreatPoint.y;
            }
          }
        }
        if (gameState.duckgrades.dg_Comet_Glob && p.family === 'Comet_Glob') {
          if (Math.random() < 0.15) { dmg *= 2; showEffect(target.x, target.y, "CRIT! 💥"); }
        }
        if (gameState.duckgrades.dg_Soap_Glob && p.family === 'Soap_Glob') {
          if (Math.random() < 0.2) target.stunned = 1.0;
        }
        if (gameState.duckgrades.dg_White && p.family === 'White' && Math.random() < 0.15) {
          target.pathIndex = Math.max(0, target.pathIndex - 1);
          const retreatPoint = target.currentPath[target.pathIndex];
          if (retreatPoint) {
            target.x = retreatPoint.x;
            target.y = retreatPoint.y;
          }
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
        if (dmg > 0) {
          target.health -= dmg;
          if (p.family !== 'IEx') target.nonIExDamage = true;
        }
        if (p.meta?.boatBomb) {
          showBoatBombExplosion(target.x, target.y, p.meta.bombType);
        }
        gameState.totalDamage += p.damage;

        if (p.bounceOnHit && p.bounces < p.bounceLimit) {
          p.bounces++;
          p.hitEntities.add(target);
          const nextTarget = gameState.enemies
            .filter(e => !p.hitEntities.has(e))
            .sort((a, b) => Math.hypot(a.x - target.x, a.y - target.y) - Math.hypot(b.x - target.x, b.y - target.y))[0];
          p.target = nextTarget || null;
        } else if (gameState.duckgrades.dg_Work_Bombot && p.type === 'Work_Bombot' && !p.bounced) {
          p.bounced = true;
          p.x = target.x; p.y = target.y;
          const nextTarget = gameState.enemies.find(e => e !== target && Math.hypot(e.x - p.x, e.y - p.y) < 100);
          if (nextTarget) { p.target = nextTarget; }
        }
        if (gameState.duckgrades.dg_Grey && p.type === 'Old_Glob' && !p.isSpin) {
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
            shoot({ ...p, projectile: 'stone_small', damage: p.damage * 0.3 }, { x: p.x + Math.cos(a) * 50, y: p.y + Math.sin(a) * 50, health: 999 }, { size: 8 });
          }
        }
      }

      if (gameState.boats) {
        for (let i = gameState.boats.length - 1; i >= 0; i--) {
          const b = gameState.boats[i];
          if (b.pathIndex <= 0) {
            b.el.remove();
            gameState.boats.splice(i, 1);
            continue;
          }
          const targetPoint = b.currentPath[b.pathIndex - 1];
          const dx = targetPoint.x - b.x;
          const dy = targetPoint.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 5) {
            b.pathIndex--;
          } else {
            b.x += (dx / dist) * b.speed * dt;
            b.y += (dy / dist) * b.speed * dt;
            b.el.style.left = b.x + 'px';
            b.el.style.top = b.y + 'px';
            const angle = Math.atan2(dy, dx);
            b.el.style.transform = `translate(-50%, -50%) rotate(${angle + Math.PI}rad)`;
          }

          let destroyedOnImpact = false;
          gameState.enemies.forEach(e => {
            if (destroyedOnImpact) return;
            if (!b.hitEntities.has(e) && Math.hypot(e.x - b.x, e.y - b.y) < 40) {
              b.hitEntities.add(e);
              let dmg = b.damage;
              if (e.shield > 0) {
                const abs = Math.min(e.shield, dmg);
                e.shield -= abs;
                dmg -= abs;
              }
              if (dmg > 0) e.health -= dmg;
              if (b.summonType === 'Boat_S4') {
                b.health -= Math.max(1, e.baseDamage || ENEMY_TIER_DAMAGE[e.tier] || 2);
              } else {
                destroyedOnImpact = true;
              }
              showEffect(e.x, e.y, "CRASH! 💥", "#ff0000");
            }
          });

          if (destroyedOnImpact || b.health <= 0) {
            b.el.remove();
            gameState.boats.splice(i, 1);
            continue;
          }

          if (b.summonType === 'Boat_S3' || b.summonType === 'Boat_S4') {
            b.cooldownTimer -= dt;
            if (b.cooldownTimer <= 0) {
              const targets = gameState.enemies.filter(e => Math.hypot(e.x - b.x, e.y - b.y) <= 150);
              if (targets.length) {
                b.cooldownTimer = 2.0;
                let isSpecial = false;
                let projImg = null;
                let specialDmg = 50;
                let specialType = 'Bomb_Glob';
                
                if (b.normalShotsCount >= 2) {
                  const r = Math.random();
                  if (r < (b.summonType === 'Boat_S4' ? 0.01 : 0)) {
                    specialType = 'Nuclear_Glob';
                    isSpecial = true;
                  } else if (r < (b.summonType === 'Boat_S4' ? 0.06 : 0.05)) {
                    specialType = 'TNT_Glob';
                    isSpecial = true;
                  } else if (r < (b.summonType === 'Boat_S4' ? 0.21 : 0.20)) {
                    specialType = 'Bomb_Glob';
                    isSpecial = true;
                  }
                  if (isSpecial) {
                    projImg = IMAGE_PATHS[specialType];
                    specialDmg = TOWER_TYPES[specialType].damage;
                  }
                }

                if (isSpecial) {
                  b.normalShotsCount = 0;
                  const bombProjectileImage = 'img/Proyectiles/Proyectil_Bomba.png';
                  let pOpts = { image: bombProjectileImage, boatBomb: true, bombType: specialType };
                  if (gameState.equippedSkins['Pirate_Glob'] === 'froggy_set') {
                    pOpts.filter = 'hue-rotate(120deg) saturate(1.5)';
                  }
                  shoot({
                    x: b.x, y: b.y, damage: specialDmg, speed: 2, projectile: 'tumble_bomb',
                    family: b.shooter.family, type: b.shooter.type, aoe: true
                  }, targets[0], { ...pOpts, bounceOnHit: gameState.duckgrades.dg_Pirate_Glob && (b.summonType === 'Boat_S3' || b.summonType === 'Boat_S4') });
                } else {
                  b.normalShotsCount++;
                  shoot({ x: b.x, y: b.y, damage: b.damage * 0.5, speed: 4, projectile: 'stone' }, targets[0]);
                }
              }
            }
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
            if (p.bounceOnHit && p.target && p.bounces < p.bounceLimit) continue;
            p.el.remove(); gameState.projectiles.splice(i, 1); continue;
          } else {
            p.vx = (dx / dist) * p.speed;
            p.vy = (dy / dist) * p.speed;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
          }
        }

        // Throttle DOM: solo actualizar posición visual cada 2 frames (la física es siempre precisa)
        if (frameCount % 2 === 0) {
          p.el.style.left = p.x + 'px';
          p.el.style.top = p.y + 'px';
        }

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
                // wall_garden: check if enemy was being slowed by a Brown family tower
                let brownSlowing = false;
                gameState.towers.forEach(bt => {
                  if (TOWER_TYPES[bt.type] && TOWER_TYPES[bt.type].slowAura) {
                    if (Math.hypot(bt.x - e.x, bt.y - e.y) <= TOWER_TYPES[bt.type].range) {
                      brownSlowing = true;
                    }
                  }
                });
                if (brownSlowing) unlockBadge('wall_garden');
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
        gameState.savedRoundSnapshot = null;
        gameState.waveSpawnQueue = [];
        gameState.waveSpawnIndex = 0;
        gameState.waveSpawnIsBoss = false;
        gameState.waveBossTypes = [];
        if (roundCheckpointInterval !== null) {
          clearInterval(roundCheckpointInterval);
          roundCheckpointInterval = null;
        }
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
        if (gameState.mode === 'infinito' && gameState.wave >= 999) {
          gameState.wave = 999;
          gameState.infiniteCompleted = true;
          gameState.autoWave = false;
          showInfiniteCompletionDucky();
        }
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
      if (typeCfg.stun) opts.stun = typeCfg.stun;
      if (typeCfg.knockback) opts.knockback = typeCfg.knockback;
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
    if (shooter.whiteSupportTimer && shooter.whiteSupportTimer > 0 && shooter.family === 'Soap_Glob') {
      opts.stunStrike = true;
    }

    const el = document.createElement('div');
    el.className = `projectile`;

    let projClass = opts.projectile || shooter.projectile;
    if (opts.image) {
      el.style.backgroundImage = `url('${encodeURI(opts.image)}')`;
      el.style.backgroundSize = 'contain';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundPosition = 'center';
      el.style.width = '30px';
      el.style.height = '30px';
    }
    if (opts.filter) {
      el.style.filter = opts.filter;
    }
    if (!opts.image && gameState.equippedSkins[shooter.family] === 'corrupt_swords_set') {
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

    if (opts.image) {
      el.style.backgroundImage = `url('${encodeURI(opts.image)}')`;
      el.style.backgroundSize = 'contain';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundPosition = 'center';
      el.style.backgroundColor = 'transparent';
      el.style.maskImage = 'none';
      el.style.webkitMaskImage = 'none';
    } else if (isBomb) {
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
      bounceOnHit: !!opts.bounceOnHit,
      bounces: 0,
      bounceLimit: opts.bounceOnHit ? 1 : 0,
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
    if (type.startsWith('Bit')) return 560;
    if (type.startsWith('Byte')) return 500;
    const targets = {
      'Crystal_Pyce': 450, 'Dreamy_SPyce': 350, 'Astral_BPyce': 250,
      'Stupid_Pyce': 560, 'Pyce2': 560, 'Symbol_Pyce': 500,
      'Guest_Pyce': 450, 'Noob_Pyce': 400,
      '4motions_Pyce': 225, 'Flower_Pyce': 225, 'SO_Pyce': 225,
      '1x1x1x1_Pyce': 6, 'NOeye_Pyce': 5, 'MoonStar_Pyce': 4,
      'Stupid_GoldPyce': 15, 'Mimic_Pyce': 3,
      'Bomb_Pyce': 450, 'Knight_Pyce': 250, 'Cannon_Pycer': 250,
      'Arky': 5, 'CrystArky': 3, 'ArkyVoid': 3, 'Fireflies': 250,
      'HoloPyce': 350, 'Strechy_Pyce': 250, 'Rebel_Pyce': 350,
      'Leni_the_big_Hammer': 400, 'Monster': 250, 'Cristalized_Monster': 300,
      'Lenistal': 300, 'Crystal_Bombot': 3, 'NO_CrystEye_CB': 3,
      'AstrorbOrbe': 3, 'AstrorbContenida': 3, 'AstrorbTF': 3,
      'Sharowd': 3, 'Crystalic_Orb': 3,
      // Nuevos enemigos de Sunlight Seaside (Leafy Beach Party)
      'Axolotl_Pyce': 250, 'Shark_Pyce': 250, 'Umbrella_Pyce': 250,
      // Spooks in the Desert (UPD4)
      'Broksp': 450, 'Pumpitch': 350, 'RIPslide': 350, 'SkeleBone_Pyce': 220,
      'Piz': 500, 'Followishers': 250, 'Creamplet': 150
    };
    return targets[type] || 9999;
  }
  window._getPyceKillTarget = getPyceKillTarget;
  window._isEnemyFramed = function(type) {
    if (!ENEMY_TYPES[type]) return false;
    if (type.startsWith('Bit')) {
      return ['BitY1', 'BitB4', 'BitG2', 'BitP3']
        .reduce((sum, bit) => sum + (gameState.pycesKilled[bit] || 0), 0) >= getPyceKillTarget(type);
    }
    if (type.startsWith('Byte')) {
      return ['ByteGB1', 'ByteYP2', 'BytePG3', 'ByteYB4']
        .reduce((sum, byte) => sum + (gameState.pycesKilled[byte] || 0), 0) >= getPyceKillTarget(type);
    }
    return (gameState.pycesKilled[type] || 0) >= getPyceKillTarget(type);
  };

  function checkPyceMorphUnlock() {
    if (!gameState.unlockedSkins.includes('pyce_morph')) {
      const types = ['Stupid_Pyce', 'Pyce2', 'Symbol_Pyce', 'Guest_Pyce', 'Noob_Pyce', '4motions_Pyce', 'Flower_Pyce', 'SO_Pyce', '1x1x1x1_Pyce', 'NOeye_Pyce', 'MoonStar_Pyce', 'Stupid_GoldPyce', 'Mimic_Pyce', 'Bomb_Pyce', 'Knight_Pyce', 'Cannon_Pycer', 'HoloPyce', 'Strechy_Pyce', 'Rebel_Pyce', 'Axolotl_Pyce', 'Shark_Pyce', 'Umbrella_Pyce', 'SkeleBone_Pyce'];
      let allMaxed = true;
      for (const t of types) {
        if ((gameState.pycesKilled[t] || 0) < getPyceKillTarget(t)) {
          allMaxed = false; break;
        }
      }
      if (allMaxed) {
        gameState.unlockedSkins.push('pyce_morph');
        showMessage(translate('skin_unlocked_pyce_randomizer'), 'success');
        saveProgress();
      }
    }
    checkEncyclopediaMaster();
    checkSpecialSkinUnlocks();
  }

  function checkSpecialSkinUnlocks() {
    if (!gameState.unlockedSkins.includes('crystal_bombot')) {
      const bosses = Object.keys(ENEMY_TYPES).filter(k => ENEMY_TYPES[k].boss);
      let allBossesMaxed = true;
      for (const b of bosses) {
        if ((gameState.pycesKilled[b] || 0) < getPyceKillTarget(b)) {
          allBossesMaxed = false; break;
        }
      }
      if (allBossesMaxed && bosses.length > 0) {
        gameState.unlockedSkins.push('crystal_bombot');
        showMessage(translate('skin_unlocked_crystal_bombot'), 'success');
        saveProgress();
      }
    }

    if (!gameState.unlockedSkins.includes('astrorb_set')) {
      const updateEnemies = [
        'Leni_the_big_Hammer', 'Monster', 'Cristalized_Monster', 'Lenistal',
        'NO_CrystEye_CB', 'AstrorbOrbe', 'AstrorbContenida', 'AstrorbTF',
        'Crystal_Bombot'
      ];
      let allUpdateMaxed = true;
      for (const e of updateEnemies) {
        if ((gameState.pycesKilled[e] || 0) < getPyceKillTarget(e)) {
          allUpdateMaxed = false; break;
        }
      }
      if (allUpdateMaxed) {
        gameState.unlockedSkins.push('astrorb_set');
        showMessage(translate('skin_unlocked_astrorb'), 'success');
        saveProgress();
      }
    }
  }

  function checkEncyclopediaMaster() {
    if (BADGES.encyclopediaMaster && BADGES.encyclopediaMaster.unlocked) {
      checkCollectionMasterDialogue();
      return;
    }
    const types = ['Stupid_Pyce', 'Pyce2', 'Symbol_Pyce', 'Guest_Pyce', 'Noob_Pyce', '4motions_Pyce', 'Flower_Pyce', 'SO_Pyce', '1x1x1x1_Pyce', 'NOeye_Pyce', 'MoonStar_Pyce', 'Stupid_GoldPyce', 'Mimic_Pyce', 'Bomb_Pyce', 'Knight_Pyce', 'Cannon_Pycer', 'HoloPyce', 'Strechy_Pyce', 'Rebel_Pyce', 'Crystal_Pyce', 'Dreamy_SPyce', 'Astral_BPyce', 'Axolotl_Pyce', 'Shark_Pyce', 'Umbrella_Pyce', 'SkeleBone_Pyce'];
    let allPycesMaxed = true;
    for (const t of types) {
      if ((gameState.pycesKilled[t] || 0) < getPyceKillTarget(t)) {
        allPycesMaxed = false; break;
      }
    }
    
    // Check new badges: all crystals maxed, all 'other' maxed
    let allCrystalsMaxed = true;
    let allOthersMaxed = true;
    let hasCrystals = false;
    let hasOthers = false;
    for (const key of Object.keys(ENEMY_TYPES)) {
      const t = ENEMY_TYPES[key];
      const kills = gameState.pycesKilled[key] || 0;
      const target = getPyceKillTarget(key);
      if (t.isCrystallized) {
        hasCrystals = true;
        if (kills < target) allCrystalsMaxed = false;
      }
      if (t.category === 'other') {
        hasOthers = true;
        if (kills < target) allOthersMaxed = false;
      }
    }
    if (hasCrystals && allCrystalsMaxed) unlockBadge('crystalizing_break');
    if (hasOthers && allOthersMaxed) unlockBadge('extended_marc');

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
    checkCollectionMasterDialogue();
  }

  function checkCollectionMasterDialogue() {
    const framedGroups = new Set();
    const allEnemiesFramed = Object.keys(ENEMY_TYPES).every(type => {
      if (type.startsWith('Bit')) {
        if (framedGroups.has('bits')) return true;
        framedGroups.add('bits');
        return ['BitY1', 'BitB4', 'BitG2', 'BitP3']
          .reduce((sum, bit) => sum + (gameState.pycesKilled[bit] || 0), 0) >= getPyceKillTarget(type);
      }
      if (type.startsWith('Byte')) {
        if (framedGroups.has('bytes')) return true;
        framedGroups.add('bytes');
        return ['ByteGB1', 'ByteYP2', 'BytePG3', 'ByteYB4']
          .reduce((sum, byte) => sum + (gameState.pycesKilled[byte] || 0), 0) >= getPyceKillTarget(type);
      }
      return (gameState.pycesKilled[type] || 0) >= getPyceKillTarget(type);
    });
    const allBadgesUnlocked = Object.values(BADGES).every(badge => badge.unlocked);

    if (!gameState.collectionMasterDialogueShown && allEnemiesFramed && allBadgesUnlocked) {
      gameState.collectionMasterDialogueShown = true;
      showCollectionMasterDialogue();
      saveProgress();
    }
  }


  function die(e, idx) {
    if (e.type === 'Sharowd') {
      finishBlockQuest();
    }

    if (e.type === 'AstrorbTF' && gameState.mode === 'interstellar' && gameState.paracristalActive && !gameState.paracristalFinal) {
      gameState.paracristalFinal = true;
      gameState.paracristalAstrorbSeen = true;
      gameState.paracristalActive = false;
      document.querySelectorAll('.paracristal').forEach(crystal => crystal.remove());
      setTimeout(() => {
        showMessage(currentLanguage === 'es' ? '💎 ¡Crystalic Orb ha tomado forma!' : '💎 Crystalic Orb has taken shape!', 'warning');
        spawnEnemy('Crystalic_Orb', true);
      }, 700);
    }

    if (e.type === 'Crystalic_Orb') {
      gameState.paracristalFinal = false;
      gameState.paracristalActive = false;
      unlockBadge('paracristal_dimension');
      gameState.unlockedSkins.push('fracstal_set');
      gameState.unlockedSkins = [...new Set(gameState.unlockedSkins)];
      showMessage(currentLanguage === 'es' ? '🌌 ¡Dimensión Paralecristal completada! Set Fracstral desbloqueado.' : '🌌 Paralecrystal Dimension complete! Fracstral Set unlocked.', 'success');
      saveProgress();
      setTimeout(() => endGame(true), 100);
    }

    if (e.type === 'AstrorbOrbe') {
      showEffect(e.x, e.y, translate('effect_broken_crystal'), "#ff00ff");
      spawnEnemy('AstrorbContenida', true, e.currentPath);
      const contenida = gameState.enemies[gameState.enemies.length - 1];
      if (contenida) {
        contenida.x = e.x;
        contenida.y = e.y;
        contenida.pathIndex = e.pathIndex;
      }
    }

    if (e.type === 'AstrorbContenida') {
      if (gameState.wave === 40) {
        // Oleada 40: Transformación a True Form
        showEffect(e.x, e.y, "TRUE FORM AWAKENED!", "#ff00ff");
        showNarratorMsg('astrorb', 'Interestelar Menace (COLLAB UPD)/Skins/Grey/Astrorb/AstrorbOrbe.png', 'Astrorb', currentLanguage === 'es' ? "Contemplad... la perfección celestial." : "Behold... celestial perfection.");
        spawnEnemy('AstrorbTF', true, e.currentPath);
        const tf = gameState.enemies[gameState.enemies.length - 1];
        if (tf) {
          tf.x = e.x;
          tf.y = e.y;
          tf.pathIndex = e.pathIndex;
        }
      } else if (gameState.mode === 'interstellar' && gameState.wave === 25) {
        // Oleada 25: Astrorb es derrotado por primera vez
        showNarratorMsg('astrorb', 'Interestelar Menace (COLLAB UPD)/Skins/Grey/Astrorb/AstrorbOrbe.png', 'Astrorb', currentLanguage === 'es' ? "...Interesante... Aún no es mi momento." : "...Interesting... It is not my time yet.");
      }
    }

    if (e.type === 'AstrorbTF') {
      if (!gameState.unlockedSkins.includes('cuby_bombot')) {
        gameState.unlockedSkins.push('cuby_bombot');
        showMessage(translate('skin_unlocked_cuby'), 'success');
      }
    }

    if (e.type === 'Bomb_Pyce') {
      showEffect(e.x, e.y, translate('effect_boom'), "#ff4d4d");
      if (gameState.towers) {
        gameState.towers.forEach(t => {
          if (Math.hypot(t.x - e.x, t.y - e.y) < 150) {
            t.stunTimer = (t.stunTimer || 0) + 3;
            showEffect(t.x, t.y - 20, translate('effect_stunned'), "#ff0000");
          }
        });
      }
    }

    if (e.type === 'Astral_BPyce') {
      showEffect(e.x, e.y, translate('effect_boom'), "#ff00ff");
      if (gameState.towers && gameState.towers.length > 0) {
        const targetTower = gameState.towers[Math.floor(Math.random() * gameState.towers.length)];
        if (typeof shoot === 'function') {
           shoot(e, targetTower, { isEnemy: true, image: 'img/Proyectiles/Crystal Metor.png', speed: 3, stun: 3 });
        }
      }
    }

    if (e.poisonTimer && e.poisonTimer > 0) {
      gameState.enemies.forEach(other => {
        if (other !== e && !other.poisonTimer && Math.hypot(other.x - e.x, other.y - e.y) < 100) {
          other.poisonTimer = 3;
          showEffect(other.x, other.y - 10, translate('effect_contagion'), "#9b59b6");
        }
      });
    }
    gameState.globetines += e.reward;
    if (e.mimic) {
      const earnedPy = Math.round(5 * getPycoinMultiplier());
      gameState.pycoins += earnedPy;
      showMessage(translate('plus_pycoins', { amount: earnedPy }), 'success');
      if (e.type === 'Mimic_Pyce') {
        gameState.consecutiveMimics++;
        unlockBadge('mimic1');
        if (gameState.consecutiveMimics >= 2) unlockBadge('mimic2');
        if (gameState.mode === 'corrupto') unlockBadge('corruptMimic');
        if (!gameState.unlockedSkins.includes('mimic_set')) {
          gameState.unlockedSkins.push('mimic_set');
          showMessage(translate('skin_unlocked_mimic'), 'success');
          saveProgress();
        }
      }
    }
    if (e.type === 'Bushi_Brella') {
      const eligibleSkins = Object.values(SKINS_DATA)
        .flat()
        .filter(skin => {
          if (gameState.unlockedSkins.includes(skin.id)) return false;
          if (REWAMPED_SKIN_IDS.includes(skin.id)) return true;
          return skin.type === 'pycoin' &&
            skin.cost > 0 &&
            !skin.duckpass_cost &&
            !skin.unlockCondition &&
            !skin.isSpecial &&
            !skin.isCommunity &&
            !skin.category;
        });

      if (eligibleSkins.length > 0 && Math.random() < BUSHI_BRELLA_SKIN_DROP_CHANCE) {
        const skin = eligibleSkins[Math.floor(Math.random() * eligibleSkins.length)];
        gameState.unlockedSkins.push(skin.id);
        showMessage(
          currentLanguage === 'es'
            ? `🎁 ¡Bushi-Brella te ha dejado una skin: ${translate(skin.name)}!`
            : `🎁 Bushi-Brella dropped a skin for you: ${translate(skin.name)}!`,
          'success'
        );
        saveProgress();
        if (currentShopTab === 'skins') drawShop();
      }
    }
    e.el.remove();
    if (e.boss) unlockBadge('bossKiller');
    gameState.enemies.splice(idx, 1);
    const previousKills = gameState.pycesKilled[e.type] || 0;
    gameState.pycesKilled[e.type] = previousKills + 1;
    const frameTarget = getPyceKillTarget(e.type);
    if (previousKills < frameTarget && gameState.pycesKilled[e.type] >= frameTarget) {
      showEncyclopediaPopup({ ...e, key: e.type });
    }

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

    if (gameState.towers.length > 0 && gameState.equippedTowers && gameState.equippedTowers.length > 0) {
      let allMaxed = true;
      for (const tKey of gameState.equippedTowers) {
        if (TOWER_TYPES[tKey]) {
          const limit = gameState.towerLimits[tKey] || 3;
          const count = gameState.towerCounts[tKey] || 0;
          if (count < limit) {
            allMaxed = false;
            break;
          }
        }
      }
      // Require equipping at least 5 towers (or all available slots up to 5)
      const expectedSlots = Math.min(5, Object.keys(TOWER_TYPES).length);
      if (allMaxed && gameState.equippedTowers.length >= expectedSlots) {
        unlockBadge('maxGlobs');
      }
    }

    if (gameState.mode === 'interstellar') {
      const mapEl = document.getElementById('map');
      if (mapEl) {
        let overlay = document.getElementById('interstellar-overlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'interstellar-overlay';
          overlay.style.position = 'absolute';
          overlay.style.top = '0';
          overlay.style.left = '0';
          overlay.style.width = '100%';
          overlay.style.height = '100%';
          overlay.style.pointerEvents = 'none';
          overlay.style.transition = 'background-color 2s ease';
          overlay.style.zIndex = '0';
          mapEl.insertBefore(overlay, mapEl.firstChild);
        }
        const maxW = gameState.maxWaves || 45;
        if (gameState.wave >= maxW - 5) {
          const progress = (gameState.wave - (maxW - 5)) / 5;
          overlay.style.backgroundColor = `rgba(255, 0, 255, ${0.2 + 0.3 * progress})`;
        } else {
          const progress = gameState.wave / Math.max(1, (maxW - 5));
          overlay.style.backgroundColor = `rgba(0, 0, 255, ${0.4 * progress})`;
        }
      }
    }

    updateMetaUI();
  }

  function getRandomizerEnemyKeys() {
    return Object.keys(ENEMY_TYPES).filter(key => {
      const enemy = ENEMY_TYPES[key];
      return enemy && enemy.image && !enemy.isCrystallized && !enemy.astrorbGroup;
    });
  }

  function translate(key, params = {}) {
    if (key.startsWith('tower_') && key.endsWith('_name') && gameState.equippedSkins && gameState.equippedSkins['Global'] === 'pyce_morph') {
      const type = key.substring(6, key.length - 5);
      const pyceKeys = getRandomizerEnemyKeys();
      if (pyceKeys.length === 0) return key;
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
      if (parent.id === 'resume-game') el.textContent = currentLanguage === 'en' ? 'Resume' : 'Reanudar';
      else if (parent.classList.contains('retry-btn')) el.textContent = translate('playAgain');
    });
    const profileButton = document.getElementById('open-profile');
    if (profileButton) {
      profileButton.innerHTML = `👤 <span class="meta-btn-text">${currentLanguage === 'en' ? 'Profile' : 'Perfil'}</span>`;
    }
    if (document.getElementById('profile-modal')?.style.display === 'flex') drawUserProfile();
    const resumeButton = document.getElementById('resume-game');
    if (resumeButton) resumeButton.innerHTML = `▶️ ${currentLanguage === 'en' ? 'Resume' : 'Reanudar'}`;
    const pauseSaveLabels = currentLanguage === 'en'
      ? ['💾 Save game', '💾 Save and log out', '🚪 Save and exit']
      : ['💾 Guardar partida', '💾 Guardar y cerrar sesión', '🚪 Guardar y salir'];
    ['save-paused-game', 'save-and-login', 'save-and-close'].forEach((id, index) => {
      const button = document.getElementById(id);
      if (button) button.textContent = pauseSaveLabels[index];
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

    const loadingTipBtn = document.getElementById('loading-tip-btn');
    if (loadingTipBtn) loadingTipBtn.textContent = currentLanguage === 'es' ? 'Ver todos los tips' : 'View all tips';
    updateLoadSavedRoundButton();

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

  function showBoatBombExplosion(x, y, bombType) {
    let image = 'img/Proyectiles/Explosion Effect.png';
    let size = 110;
    if (gameState.equippedSkins['IEx'] === 'fracstal_set') {
      if (bombType === 'Bomb_Glob') {
        image = 'Interestelar Menace (COLLAB UPD)/Skins/Fracstral Set/Explosiones/Crystal Explosion (1).png';
        size = 110;
      } else if (bombType === 'TNT_Glob') {
        image = 'Interestelar Menace (COLLAB UPD)/Skins/Fracstral Set/Explosiones/Crystor Kaboom (2).png';
        size = 140;
      } else if (bombType === 'Nuclear_Glob') {
        image = 'Interestelar Menace (COLLAB UPD)/Skins/Fracstral Set/Explosiones/Nuclear Crystal (3).png';
        size = 190;
      }
    } else if (bombType === 'TNT_Glob') {
      size = 140;
    } else if (bombType === 'Nuclear_Glob') {
      size = 190;
    }

    const map = document.getElementById('map');
    if (!map) return;
    const explosion = document.createElement('div');
    explosion.style.cssText = [
      'position:absolute',
      `left:${x}px`,
      `top:${y}px`,
      `width:${size}px`,
      `height:${size}px`,
      'transform:translate(-50%,-50%) scale(0.2)',
      `background:url('${encodeURI(image)}') center/contain no-repeat`,
      'z-index:35',
      'pointer-events:none',
      'transition:transform 0.15s cubic-bezier(0.175,0.885,0.32,1.275),opacity 0.3s ease-out 0.15s'
    ].join(';');
    map.appendChild(explosion);
    setTimeout(() => { explosion.style.transform = 'translate(-50%,-50%) scale(1)'; }, 10);
    setTimeout(() => { explosion.style.opacity = '0'; }, 150);
    setTimeout(() => { explosion.remove(); }, 500);
  }

  function getTowerImage(type) {
    const cfg = TOWER_TYPES[type];
    const family = cfg.family || type;

    if (gameState.equippedSkins && gameState.equippedSkins['Global'] === 'pyce_morph') {
      const pyceKeys = getRandomizerEnemyKeys();
      if (pyceKeys.length === 0) return cfg.image;
      const towerKeys = Object.keys(TOWER_TYPES);
      const idx = towerKeys.indexOf(type);
      return ENEMY_TYPES[pyceKeys[idx % pyceKeys.length]].image;
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
    const family = cfg.family || type;
    const equippedSkin = gameState.equippedSkins[family];
    const skinSet = SKINS_DATA[family]?.find(skin => skin.id === equippedSkin);
    if (globalSkin !== 'pyce_morph' &&
        skinSet?.rgbTypes?.includes(type) &&
        RGB_REWAMP_SKIN_IDS.includes(equippedSkin)) {
      el.classList.add('rgb-rewamp');
      el.style.setProperty('--rgb-rewamp-mask-image', `url("${encodeURI(getTowerImage(type))}")`);
    } else {
      el.style.removeProperty('--rgb-rewamp-mask-image');
    }
    const enemyBasedSkins = ['pyce_morph', 'mimic_set', 'astrorb_set', 'crystal_bombot'];
    if (enemyBasedSkins.includes(globalSkin) || enemyBasedSkins.includes(equippedSkin)) {
      el.classList.add('enemy-skin-flipped');
    } else {
      el.classList.remove('enemy-skin-flipped');
    }
    if ((gameState.hypermutatedUnlocked || gameState.debugState === 'unlocked') &&
        gameState.settings.hypermutatedEffect) {
      el.classList.add('hypermutated');
    }
    const glitchEnabled = (gameState.glitchUnlocked || gameState.debugState === 'unlocked') &&
      gameState.settings.glitchEffect;
    setTowerGlitchEffect(el, glitchEnabled);
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

  function retryGame(preserveSavedRound = false) {
    const savedRoundSnapshot = preserveSavedRound ? gameState.savedRoundSnapshot : null;
    stopWaveSpawnInterval();
    if (roundCheckpointInterval !== null) {
      clearInterval(roundCheckpointInterval);
      roundCheckpointInterval = null;
    }
    gameState.savedRoundSnapshot = savedRoundSnapshot;
    gameState.waveSpawnQueue = [];
    gameState.waveSpawnIndex = 0;
    gameState.waveSpawnIsBoss = false;
    gameState.waveBossTypes = [];
    gameState.waveSpawnIntervalMs = 0;
    gameState.paused = false;
    if (gameState.mode === 'interstellar') {
      gameState.health = 200;
    } else {
      gameState.health = 100 + (gameState.baseHealthLevel * 20);
    }
    gameState.interstellarStory = {};
    gameState.wave = 0;
    gameState.globetines = 500;
    gameState.towers.forEach(t => t.el.remove());
    gameState.towers = [];
    gameState.enemies.forEach(e => e.el.remove());
    gameState.enemies = [];
    gameState.projectiles.forEach(p => p.el.remove());
    gameState.projectiles = [];
    (gameState.boats || []).forEach(b => b.el.remove());
    gameState.boats = [];
    gameState.towerSpots.forEach(s => s.occupied = false);
    gameState.towerCounts = {};
    gameState.gameOver = false;
    gameState.waveActive = false;
    gameState.spawningActive = false;
    gameState.totalDamage = 0;
    gameState.moneySpentThisGame = 0;
    gameState.usedGTackRed = false;
    gameState.usedGTackGrey = false;
    gameState.baseTookDamage = false;
    gameState.rareEnemiesSpawned = {};
    gameState.consecutiveMimics = 0;
    gameState.uniquesBossSpawned = {};
    gameState.blockQuestStarted = false;
    gameState.blockQuestPending = false;
    gameState.wallGardenSoapMessageShown = false;
    document.querySelectorAll('.block-quest-marker, .paracristal').forEach(el => el.remove());
    const crystalEnergy = document.getElementById('paracristal-energy');
    if (crystalEnergy && gameState.mode !== 'interstellar') crystalEnergy.style.display = 'none';
    if (gameState.mode !== 'interstellar') gameState.paracristalActive = false;
    deselectTower();
    updateUI();
    drawTowerShop();
    const content = document.querySelector('#game-over .modal-content');
    if (content) content.classList.remove('victory', 'paused');
    const resumeButton = document.getElementById('resume-game');
    if (resumeButton) resumeButton.style.display = 'none';
    const serverRestartButton = document.getElementById('multiplayer-restart-btn');
    if (serverRestartButton) serverRestartButton.style.display = 'none';
    document.querySelector('#game-over .mode-select-btn')?.style.removeProperty('display');
    document.querySelector('#game-over .map-select-btn')?.style.removeProperty('display');
    document.querySelector('#game-over .retry-btn:not(#resume-game)')?.style.removeProperty('display');
    setPauseSaveActionsVisible(false);
    document.getElementById('game-over').style.display = 'none';
  }

  function setPauseSaveActionsVisible(visible) {
    const canSave = visible && !multiplayerSpectator && (!currentSeed || isSeedHost);
    document.querySelectorAll('#game-over .pause-save-action').forEach(button => {
      button.style.display = canSave ? 'inline-flex' : 'none';
    });
    const retryButton = document.querySelector('#game-over .retry-btn:not(#resume-game):not(.pause-save-action)');
    const exitButton = document.querySelector('#game-over .exit-btn');
    if (retryButton) retryButton.style.display = visible ? 'none' : '';
    if (exitButton) exitButton.style.display = visible ? 'none' : '';
    if (visible) {
      document.querySelector('#game-over .mode-select-btn')?.style.setProperty('display', 'none');
      document.querySelector('#game-over .map-select-btn')?.style.setProperty('display', 'none');
    } else {
      document.querySelector('#game-over .mode-select-btn')?.style.removeProperty('display');
      document.querySelector('#game-over .map-select-btn')?.style.removeProperty('display');
    }
  }

  function pauseGame() {
    if (gameState.gameOver || gameState.paused) return;
    gameState.paused = true;
    sendMultiplayerAction({ type: 'pause' });
    const modal = document.getElementById('game-over');
    const content = modal?.querySelector('.modal-content');
    const title = modal?.querySelector('h2');
    const message = document.getElementById('game-over-msg');
    if (content) content.classList.add('paused');
    if (title) title.textContent = currentLanguage === 'es' ? '⏸️ JUEGO EN PAUSA' : '⏸️ GAME PAUSED';
    if (message) message.textContent = currentLanguage === 'es'
      ? `Partida detenida en la oleada ${gameState.wave}.`
      : `Game paused on wave ${gameState.wave}.`;
    const resumeButton = document.getElementById('resume-game');
    resumeButton.innerHTML = `▶️ ${currentLanguage === 'en' ? 'Resume' : 'Reanudar'}`;
    resumeButton.style.display = 'inline-flex';
    modal.querySelector('.mode-select-btn').style.display = 'none';
    modal.querySelector('.map-select-btn').style.display = 'none';
    setPauseSaveActionsVisible(true);
    modal.style.display = 'flex';
  }

  function resumeGame() {
    if (!gameState.paused) return;
    gameState.paused = false;
    sendMultiplayerAction({ type: 'resume' });
    lastGameFrameTime = performance.now();
    document.getElementById('game-over').style.display = 'none';
    const content = document.querySelector('#game-over .modal-content');
    if (content) content.classList.remove('paused');
    setPauseSaveActionsVisible(false);
  }

  async function savePausedRound() {
    if (!gameState.paused) return false;
    if (!checkpointActiveRound()) {
      const message = currentLanguage === 'en'
        ? 'This round cannot be saved from this session.'
        : 'No se puede guardar esta partida desde esta sesión.';
      document.getElementById('game-over-msg').textContent = message;
      return false;
    }

    try {
      await flushCloudProgressSave();
      const message = currentLanguage === 'en'
        ? (activeCloudUserId ? 'Round saved on this device and in the cloud.' : 'Round saved on this device.')
        : (activeCloudUserId ? 'Partida guardada en este dispositivo y en la nube.' : 'Partida guardada en este dispositivo.');
      document.getElementById('game-over-msg').textContent = message;
      return true;
    } catch (error) {
      console.error('No se pudo completar el guardado de la partida:', error);
      document.getElementById('game-over-msg').textContent = currentLanguage === 'en'
        ? `Saved on this device, but cloud saving failed: ${error.message}`
        : `Guardada en este dispositivo, pero falló el guardado en la nube: ${error.message}`;
      return false;
    }
  }

  async function savePausedRoundAndLogout() {
    if (await savePausedRound()) exitToLogin(true);
  }

  async function savePausedRoundAndClose() {
    if (!await savePausedRound()) return;
    window.close();
    window.setTimeout(() => {
      if (window.closed) return;
      document.getElementById('game-over-msg').textContent = currentLanguage === 'en'
        ? 'The game was saved, but this browser blocked closing the window. You can close this tab manually.'
        : 'La partida se ha guardado, pero el navegador bloqueó el cierre. Puedes cerrar esta pestaña manualmente.';
    }, 100);
  }

  function chooseModeAfterGame() {
    retryGame();
    document.getElementById('map-selection').style.display = 'none';
    showModeSelection();
  }

  function chooseMapAfterGame() {
    retryGame();
    gameState.modeConfirmed = false;
    setMultiplayerSpectator(false);
    renderMultiplayerPlayerList([]);
    document.getElementById('mode-selection').style.display = 'none';
    gameState.selectedIsland = null;
    renderMapSelection();
    document.getElementById('map-selection').style.display = 'flex';
  }

  function exitToLogin(preserveSavedRound = false) {
    stopSessionClock();
    gameState.paused = false;
    retryGame(preserveSavedRound);
    currentSeed = null;
    isSeedHost = false;
    multiplayerEnabled = false;
    if (multiplayerSyncInterval !== null) {
      clearInterval(multiplayerSyncInterval);
      multiplayerSyncInterval = null;
    }
    socket?.disconnect();
    socket = null;
    multiplayerServerClosed = false;
    document.getElementById('seed-display').style.display = 'none';
    gameState.mode = null;
    gameState.map = null;
    gameState.modeConfirmed = false;
    renderMultiplayerPlayerList([]);
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('map-selection').style.display = 'none';
    document.getElementById('mode-selection').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('meta-controls').style.display = 'none';
    spawnDecorations('login-decorations');
    document.body.classList.remove('role-owner', 'role-admin', 'role-debug');
    document.getElementById('admin-indicator').style.display = 'none';
  }

  function endGame(victory = false) {
    if (multiplayerSpectator) return;
    setPauseSaveActionsVisible(false);
    gameState.gameOver = true;
    gameState.paused = false;
    gameState.spawningActive = false;
    gameState.savedRoundSnapshot = null;
    stopWaveSpawnInterval();
    if (roundCheckpointInterval !== null) {
      clearInterval(roundCheckpointInterval);
      roundCheckpointInterval = null;
    }
    const modal = document.getElementById('game-over');
    if (!modal) return;
    modal.style.display = 'flex';

    const title = modal.querySelector('h2');
    const msg = document.getElementById('game-over-msg');
    const content = modal.querySelector('.modal-content');
    content?.classList.remove('paused');
    const resumeButton = document.getElementById('resume-game');
    if (resumeButton) resumeButton.style.display = 'none';

    if (victory) {
      if (PROFILE_MAP_MODES.includes(gameState.mode) && gameState.profileMapModeWins[gameState.map]) {
        if (!gameState.profileMapModeWins[gameState.map].includes(gameState.mode)) {
          gameState.profileMapModeWins[gameState.map].push(gameState.mode);
        }
      } else if (PROFILE_MAP_MODES.includes(gameState.mode) && gameState.map) {
        gameState.profileMapModeWins[gameState.map] = [gameState.mode];
      }
      if (content) content.classList.add('victory');
      if (title) {
        if (gameState.mode === 'interstellar') {
          title.setAttribute('data-i18n', 'interstellar_victory_title');
          title.textContent = translate('interstellar_victory_title');
        } else {
          title.setAttribute('data-i18n', 'victory_title');
          title.textContent = translate('victory_title');
        }
      }
      if (msg) {
        if (gameState.mode === 'interstellar') {
          msg.innerHTML = translate('interstellar_victory_msg');
        } else {
          msg.innerHTML = translate('victory_msg', { mode: gameState.mode.toUpperCase() });
        }
      }

      if (gameState.antiNormalActive) {
        unlockBadge('antiNormal');
        gameState.unlockedAntiNormal = true;
        // Sunlight Seaside Anti-Normal badge & froggy_set
        if ((gameState.map || '') === 'sunlight_seaside') {
          unlockBadge('sunlight_anti_normal');
          if (!gameState.unlockedSkins.includes('froggy_set')) {
            gameState.unlockedSkins.push('froggy_set');
            const msg = currentLanguage === 'es'
              ? '🐸 ¡Froggy Set desbloqueado gratis! Superaste Sunlight Seaside en Anti-Normal.'
              : '🐸 Froggy Set unlocked for free! You beat Sunlight Seaside in Anti-Normal.';
            showMessage(msg, 'success');
          }
        }
      } else {
        if (gameState.mode === 'dificil' && Object.prototype.hasOwnProperty.call(gameState.globlandHardWins, gameState.map)) {
          gameState.globlandHardWins[gameState.map] = true;
          checkFutureVoyageBadge();
        }

        // Sunlight Seaside specific badges
        const isSunlightMap = (gameState.map || '') === 'sunlight_seaside';
        if (isSunlightMap) {
          if (gameState.mode === 'facil') unlockBadge('sunlight_facil');
          else if (gameState.mode === 'normal') unlockBadge('sunlight_normal');
          else if (gameState.mode === 'dificil') unlockBadge('sunlight_dificil');
          else if (gameState.mode === 'extremo') unlockBadge('sunlight_extremo');
        }

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

        const hasBlockTalesSkin = gameState.blockQuestHadBlockTales ||
          gameState.unlockedSkins.includes('corrupt_swords_set');
        if (gameState.mode === 'dificil' && hasBlockTalesSkin) {
          unlockBadge('block_city');
        }
        if (gameState.blockQuestCompleted && hasBlockTalesSkin) {
          unlockBadge('old_blox_city');
        }

        // --- Skin unlock by victory condition ---
        const isUrbanMap = (gameState.map || '') === 'urbanistic_road';

        // Rewamped Green Set: free on winning Easy on Urbanistic Road
        if (gameState.mode === 'facil' && isUrbanMap) {
          if (!gameState.unlockedSkins.includes('rewamped_green_set')) {
            gameState.unlockedSkins.push('rewamped_green_set');
            const msg = currentLanguage === 'es'
              ? '🎁 Set Verde Remasterizado desbloqueado y aplicado gratis! (Urbanistic Road - Fácil)'
              : '🎁 Remastered Green Set unlocked for free! (Urbanistic Road - Easy)';
            showMessage(msg, 'success');
          }
        }

        // Rewamped Red Set: free on winning Easy on Urbanistic Road
        if (gameState.mode === 'facil' && isUrbanMap) {
          if (!gameState.unlockedSkins.includes('rewamped_red_set')) {
            gameState.unlockedSkins.push('rewamped_red_set');
            const msg = currentLanguage === 'es'
              ? '🎁 Set Rojo Remasterizado desbloqueado y aplicado gratis! (Urbanistic Road - Fácil)'
              : '🎁 Remastered Red Set unlocked for free! (Urbanistic Road - Easy)';
            showMessage(msg, 'success');
          }
        }

        if (gameState.mode === 'facil' && isUrbanMap) {
          if (!gameState.unlockedSkins.includes('rewamped_blue_set')) {
            gameState.unlockedSkins.push('rewamped_blue_set');
            const msg = currentLanguage === 'es'
              ? '🎁 Set Azul Remasterizado desbloqueado y aplicado gratis! (Urbanistic Road - Fácil)'
              : '🎁 Remastered Blue Set unlocked for free! (Urbanistic Road - Easy)';
            showMessage(msg, 'success');
          }
        }

        // Spanish-Bombot: unlocked (but not free) on winning Normal or above
        const modesNormalOrAbove = ['normal', 'dificil', 'extremo', 'corrupto', 'antiNormal'];
        if (modesNormalOrAbove.includes(gameState.mode)) {
          if (!gameState.unlockedSkins.includes('spanish_bombot')) {
            gameState.unlockedSkins.push('spanish_bombot');
            const msg = currentLanguage === 'es'
              ? '🔓 Skin Spanish-Bombot desbloqueada! Ahora puedes comprarla en la tienda.'
              : '🔓 Spanish-Bombot skin unlocked! You can now purchase it in the shop.';
            showMessage(msg, 'success');
          }
        }

        // Judicial Set: unlocked (but not free) on winning Extremo or above
        const modesExtremoOrAbove = ['extremo', 'corrupto', 'antiNormal'];
        if (modesExtremoOrAbove.includes(gameState.mode)) {
          if (!gameState.unlockedSkins.includes('judicial_set')) {
            gameState.unlockedSkins.push('judicial_set');
            const msg = currentLanguage === 'es'
              ? '🔓 Set Judicial desbloqueado! Ahora puedes comprarlo (400 PyCoins / 150 DuckPass).'
              : '🔓 Judicial Set unlocked! You can now purchase it (400 PyCoins / 150 DuckPass).';
            showMessage(msg, 'success');
          }
        }
        // -----------------------------------------
      }

      if ((gameState.mode === 'corrupto' || gameState.mode === 'antiNormal') && victory === true) {
        if (TOWER_TYPES['Work_Bombot'] && !TOWER_TYPES['Work_Bombot'].unlocked) {
          TOWER_TYPES['Work_Bombot'].unlocked = true;
          showMessage("🤖 ¡TORRE WORK-BOMBOT DESBLOQUEADA!", 'success');
          saveProgress();
        }
      }

      if (gameState.mode === 'antiNormal' && victory === true) {
        gameState.pycoins += 500;
        gameState.duckPassCurrency += 450;
        // XP equivalent to a high difficulty mode
        addXP(500);
        const rewardMsg = currentLanguage === 'es'
          ? '🌑 +500 PyCoins / +450 DuckPass + XP por superar Anti-Normal!'
          : '🌑 +500 PyCoins / +450 DuckPass + XP for beating Anti-Normal!';
        showMessage(rewardMsg, 'success');
        // Sunlight Seaside: also give 50 DuckPasses extra for the badge
        if ((gameState.map || '') === 'sunlight_seaside') {
          gameState.duckPassCurrency += 50;
          const sunMsg = currentLanguage === 'es' ? '🌑 +50 DuckPass bonus por Sunlight Seaside Anti-Normal!' : '🌑 +50 DuckPass bonus for Sunlight Seaside Anti-Normal!';
          showMessage(sunMsg, 'success');
        }
        updateMetaUI();
        saveProgress();
      }

      if (gameState.mode === 'interstellar' && victory === true && gameState.wave >= 40) {
        unlockBadge('unmenaced');
        unlockBadge('urban_crystals');
        if (!gameState.unlockedInterstellar) {
          gameState.unlockedInterstellar = true;
          gameState.pycoins += 400;
          gameState.duckPassCurrency += 500;
          showMessage("⭐ +400 PyCoins / +500 DuckPass", 'success');
          publishMultiplayerProfile();
        } else {
          gameState.pycoins += 250;
          gameState.duckPassCurrency += 350;
          showMessage("⭐ +250 PyCoins / +350 DuckPass", 'success');
        }
        updateMetaUI();
        saveProgress();
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

      checkTowerCombinationBadges();

      if (!gameState.baseTookDamage) {
        unlockBadge('titaniumBuilding');
      }

      if (gameState.unlockedSkins && gameState.unlockedSkins.length >= 7) {
        unlockBadge('skinllector');
      }

      checkGlitchEffectUnlock();
      saveProgress();
    } else {
      if (content) content.classList.remove('victory');
      if (title) {
        title.setAttribute('data-i18n', 'gameOver');
        title.textContent = translate('gameOver');
      }
      const finalWave = Math.max(1, Number(gameState.wave) || 1);
      const finalWaveEl = document.getElementById('final-wave');
      if (finalWaveEl) finalWaveEl.textContent = finalWave;
      if (msg) msg.textContent = translate('gameOverWave', { wave: finalWave });
      saveProgress();
    }

    updateLanguage();
    publishMultiplayerProfile();
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

    if (skinSet.id === 'astrorb_set' || skinSet.id === 'crystal_bombot') {
      shoot(t, target, { damage: dmg, image: 'img/Proyectiles/Crystal Metor.png' });
      return true;
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
        <h3>📖 La historia de Glob Defenders</h3>
        <p><strong>Glob Defenders</strong> transcurre en un mundo habitado por criaturas y seres muy diferentes entre sí. En una de sus regiones, <strong>Gelatin Lake</strong>, viven los <strong>Globs</strong>, criaturas de gelatina creadas y criadas por el propio lago para defenderse de las amenazas que aparecen en sus alrededores.</p>
        <p>Los Globs no son un ejército tradicional. Cada uno pertenece a una <strong>familia</strong> con características, habilidades y formas de evolucionar diferentes. Con el tiempo, han aprendido a trabajar juntos y a utilizar sus distintas capacidades para proteger sus territorios.</p>
        <p>Una de las principales amenazas son los <strong>Pyces</strong>. Aunque algunos Pyces son enemigos, la situación es bastante más complicada que una simple guerra entre dos especies. Existen diferentes grupos, individuos y entidades con sus propios objetivos, y no todos los Pyces actúan de la misma manera.</p>
        <p>Para ayudar a los Globs está <strong>Work-Bombot</strong>, un robot que actúa como guía y aliado durante sus aventuras. Gracias a él, los Globs conocen otros lugares y terminan involucrándose en conflictos que van mucho más allá de Gelatin Lake.</p>
        <p>La aventura comienza principalmente en <strong>Gelatin Lake</strong>, pero poco a poco se extiende hacia otras regiones.</p>
        <p>Una de ellas es <strong>Urbanistic Road</strong>, una zona mucho más desarrollada, con carreteras, ríos y zonas urbanas. Allí los Globs deben adaptarse a un entorno diferente mientras aparecen nuevas amenazas, nuevos personajes y nuevas formas de combatir.</p>
        <p>Más adelante, los Globs también llegan a <strong>Sunlight Seaside</strong>, una zona costera y portuaria que conecta con otros lugares del mundo. Defender sus instalaciones se vuelve importante para poder continuar explorando y ayudar a otras zonas que también están siendo atacadas.</p>
        <p>A medida que los Globs avanzan, los conflictos empiezan a involucrar fenómenos cada vez más extraños: corrupción, tecnología, dimensiones, energía desconocida y fuerzas que parecen estar muy por encima de los enemigos normales.</p>
        <p>Esto alcanza uno de sus puntos más importantes con <strong>Interstellar Menace</strong>, donde los acontecimientos dejan de limitarse a los problemas habituales de los Globs y empiezan a relacionarse con fenómenos de escala mucho mayor.</p>
        <p>Aun así, <strong>Glob Defenders no trata únicamente sobre salvar el mundo</strong>. También trata sobre descubrir nuevos lugares, conocer a sus habitantes, enfrentarse a personajes extraños, encontrar secretos y entender poco a poco cómo está conectado todo lo que rodea a los Globs.</p>
        <p>Y cuanto más avanzan...</p>
        <p><strong>más evidente se vuelve que el mundo en el que viven es mucho más grande de lo que parecía al principio.</strong></p>

        <div style="margin-top: 18px; display: flex; flex-wrap: wrap; gap: 10px;">
          <button type="button" style="background:#2e8b57; color:white; border:none; border-radius:10px; padding:8px 12px; cursor:pointer;" onclick="openEncyclopedia(); setTimeout(() => switchEncyclopediaTab('globs'), 30);">Ver familias</button>
          <button type="button" style="background:#3a6ea5; color:white; border:none; border-radius:10px; padding:8px 12px; cursor:pointer;" onclick="openEncyclopedia(); setTimeout(() => switchEncyclopediaTab('enemies'), 30);">Ver enemigos</button>
        </div>
      `;
      } else {
        container.innerHTML = `
        <h3>🌎 The story of Glob Defenders</h3>
        <p><strong>Glob Defenders</strong> takes place in a world filled with very different creatures and beings. In one of its regions, <strong>Gelatin Lake</strong>, live the <strong>Globs</strong>, gelatin creatures created and raised by the lake itself to defend themselves against the threats that appear around them.</p>
        <p>The Globs are not a traditional army. Each one belongs to a <strong>family</strong> with different traits, abilities, and ways of evolving. Over time, they have learned to work together and use their different capabilities to protect their territories.</p>
        <p>One of the main threats is the <strong>Pyces</strong>. Although some Pyces are enemies, the situation is far more complicated than a simple war between two species. There are different groups, individuals, and entities with their own goals, and not all Pyces behave the same way.</p>
        <p>To help the Globs stands <strong>Work-Bombot</strong>, a robot who acts as a guide and ally on their adventures. Thanks to him, the Globs discover other places and end up getting involved in conflicts that go far beyond Gelatin Lake.</p>
        <p>The adventure begins mainly in <strong>Gelatin Lake</strong>, but little by little it expands to other regions.</p>
        <p>One of them is <strong>Urbanistic Road</strong>, a much more developed area with roads, rivers, and urban zones. There, the Globs must adapt to a different environment while new threats, new characters, and new ways of fighting appear.</p>
        <p>Later, the Globs also reach <strong>Sunlight Seaside</strong>, a coastal and port area connected to other places in the world. Defending its installations becomes important in order to continue exploring and helping other zones that are also under attack.</p>
        <p>As the Globs advance, the conflicts begin to involve stranger phenomena: corruption, technology, dimensions, unknown energy, and forces that seem far above ordinary enemies.</p>
        <p>This reaches one of its most important points with <strong>Interstellar Menace</strong>, where events stop being limited to ordinary Glob problems and begin to connect to much larger-scale phenomena.</p>
        <p>Even so, <strong>Glob Defenders is not only about saving the world</strong>. It is also about discovering new places, meeting their inhabitants, facing strange characters, finding secrets, and gradually understanding how everything around the Globs is connected.</p>
        <p>And the more they advance...</p>
        <p><strong>the clearer it becomes that the world they live in is much bigger than it seemed at first.</strong></p>

        <div style="margin-top: 18px; display: flex; flex-wrap: wrap; gap: 10px;">
          <button type="button" style="background:#2e8b57; color:white; border:none; border-radius:10px; padding:8px 12px; cursor:pointer;" onclick="openEncyclopedia(); setTimeout(() => switchEncyclopediaTab('globs'), 30);">View families</button>
          <button type="button" style="background:#3a6ea5; color:white; border:none; border-radius:10px; padding:8px 12px; cursor:pointer;" onclick="openEncyclopedia(); setTimeout(() => switchEncyclopediaTab('enemies'), 30);">View enemies</button>
        </div>
      `;
      }
    } else if (currentStoryTab === 'mechanics') {
      if (currentLanguage === 'es') {
        container.innerHTML = `
        <h3>⚙️ Mecánicas de Juego</h3>
        <p>Glob Defenders combina defensa por oleadas, economía de partida y progreso permanente. Aquí tienes un resumen útil para entender cómo funciona todo el juego.</p>

        <h4>💰 Economía y recursos</h4>
        <ul>
          <li><img src="img/Tokens/Globetin.png" width="16" style="vertical-align: middle;"> <strong>Globetines</strong>: moneda de partida para comprar y mejorar torres durante la defensa.</li>
          <li><img src="img/Tokens/PyCoin.png" width="16" style="vertical-align: middle;"> <strong>PyCoins</strong>: moneda permanente usada en la tienda meta para mejoras de base, límites y skins.</li>
          <li><img src="img/Tokens/DuckPass.png" width="16" style="vertical-align: middle;"> <strong>Duckpasses</strong>: moneda especial para Duckgrades, mejoras pasivas y objetos exclusivos.</li>
        </ul>

        <h4>🛡️ Cómo se juega</h4>
        <ul>
          <li><strong>Coloca torres</strong> en puntos estratégicos del mapa para defender la base de los Pyces.</li>
          <li><strong>Mejora o evoluciona</strong> tus Globs para subir su daño, rango y utilidad.</li>
          <li><strong>Protege la base</strong> y evita que los enemigos lleguen al punto de entrada.</li>
          <li><strong>Sobrevive oleada tras oleada</strong> y adapta tu estrategia según el tipo de enemigo.</li>
        </ul>

        <h4>🏪 Progreso permanente</h4>
        <ul>
          <li><strong>Mejoras de base</strong>: aumentan la salud inicial y tu resistencia general.</li>
          <li><strong>Límites de torres</strong>: limitan cuántas torres de cada tipo puedes tener activas.</li>
          <li><strong>Duckgrades</strong>: habilidades pasivas definitivas de cada familia.</li>
          <li><strong>G-Tacks</strong>: habilidades activas poderosas para torres de nivel máximo.</li>
          <li><strong>Skins</strong>: cambios visuales y especiales para familias, mapas y personajes.</li>
        </ul>

        <h4>⌨️ Controles rápidos</h4>
        <ul>
          <li><strong>U</strong>: colocar o mejorar una torre seleccionada.</li>
          <li><strong>V</strong>: vender la torre seleccionada.</li>
          <li><strong>C</strong>: cancelar selección o cerrar menús.</li>
        </ul>

        <h4>📚 Si quieres profundizar</h4>
        <p>Si quieres saber más sobre cada familia o enemigo, sigue con la enciclopedia correspondiente:</p>
        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">
          <button type="button" style="background:#2e8b57; color:white; border:none; border-radius:10px; padding:8px 12px; cursor:pointer;" onclick="openEncyclopedia(); setTimeout(() => switchEncyclopediaTab('globs'), 30);">Familias</button>
          <button type="button" style="background:#3a6ea5; color:white; border:none; border-radius:10px; padding:8px 12px; cursor:pointer;" onclick="openEncyclopedia(); setTimeout(() => switchEncyclopediaTab('enemies'), 30);">Enemigos</button>
        </div>
        <div style="margin-top: 18px;">
          <button type="button" style="background:rgba(255,255,255,0.08); color:#edf6ff; border:1px solid rgba(255,255,255,0.2); border-radius:10px; padding:8px 12px; cursor:pointer;" onclick="openLoadingTipsModal()">📘 Ver todos los tips</button>
        </div>
      `;
      } else {
        container.innerHTML = `
        <h3>⚙️ Game Mechanics</h3>
        <p>Glob Defenders combines wave defense, match economy, and permanent progression. Here is a useful summary of how the game works.</p>

        <h4>💰 Economy and resources</h4>
        <ul>
          <li><img src="img/Tokens/Globetin.png" width="16" style="vertical-align: middle;"> <strong>Globets</strong>: in-match currency used to buy and upgrade towers during the defense.</li>
          <li><img src="img/Tokens/PyCoin.png" width="16" style="vertical-align: middle;"> <strong>PyCoins</strong>: permanent currency used in the meta shop for base upgrades, limits, and skins.</li>
          <li><img src="img/Tokens/DuckPass.png" width="16" style="vertical-align: middle;"> <strong>Duckpasses</strong>: special currency for Duckgrades, passive upgrades, and exclusive items.</li>
        </ul>

        <h4>🛡️ How to play</h4>
        <ul>
          <li><strong>Place towers</strong> on strategic map points to defend the base from Pyces.</li>
          <li><strong>Upgrade or evolve</strong> your Globs to increase damage, range, and utility.</li>
          <li><strong>Protect the base</strong> and prevent enemies from reaching the entrance.</li>
          <li><strong>Survive wave after wave</strong> and adapt your strategy to the enemy type.</li>
        </ul>

        <h4>🏪 Permanent progression</h4>
        <ul>
          <li><strong>Base upgrades</strong>: increase starting health and overall durability.</li>
          <li><strong>Tower limits</strong>: control how many towers of each type can be active at once.</li>
          <li><strong>Duckgrades</strong>: ultimate passive abilities for each family.</li>
          <li><strong>G-Tacks</strong>: powerful active skills for max-level towers.</li>
          <li><strong>Skins</strong>: visual and special changes for families, maps, and characters.</li>
        </ul>

        <h4>⌨️ Quick controls</h4>
        <ul>
          <li><strong>U</strong>: place or upgrade a selected tower.</li>
          <li><strong>V</strong>: sell the selected tower.</li>
          <li><strong>C</strong>: cancel selection or close menus.</li>
        </ul>

        <h4>📚 If you want to go deeper</h4>
        <p>If you want to know more about each family or enemy, jump into the corresponding encyclopedia section:</p>
        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">
          <button type="button" style="background:#2e8b57; color:white; border:none; border-radius:10px; padding:8px 12px; cursor:pointer;" onclick="openEncyclopedia(); setTimeout(() => switchEncyclopediaTab('globs'), 30);">Families</button>
          <button type="button" style="background:#3a6ea5; color:white; border:none; border-radius:10px; padding:8px 12px; cursor:pointer;" onclick="openEncyclopedia(); setTimeout(() => switchEncyclopediaTab('enemies'), 30);">Enemies</button>
        </div>
        <div style="margin-top: 18px;">
          <button type="button" style="background:rgba(255,255,255,0.08); color:#edf6ff; border:1px solid rgba(255,255,255,0.2); border-radius:10px; padding:8px 12px; cursor:pointer;" onclick="openLoadingTipsModal()">📘 View all tips</button>
        </div>
      `;
      }
    } else if (currentStoryTab === 'logs') {
      if (currentLanguage === 'es') {
        container.innerHTML = `
        <h3 style="color:#ff9f43;">📋 Historial de Actualizaciones (GlD v5.0.0 - ARIDEZ ESCALOFRIANTE — PT1: GETTING STARTED)</h3>
        <p style="color:#ff9f43;">¡Empieza una nueva aventura! Esta primera parte prepara el juego con nuevas formas de jugar, guardar tu progreso y descubrir secretos.</p>
        <h4>Novedades de la PT1:</h4>
        <ul>
          <li>💾 <strong style="color:#ff9f43;">Guardar y reanudar partidas</strong>: Guarda una ronda desde el menú de pausa y cárgala desde las islas. La partida guardada muestra el mapa, el modo y la oleada; también puedes guardar y cerrar sesión o guardar y salir.</li>
          <li>🌐 <strong>Semillas más fáciles de compartir</strong>: Copia la seed o la invitación desde sus opciones, o descarga la seed como archivo de texto.</li>
          <li>👤 <strong>Perfiles en partidas online</strong>: Consulta el progreso, los logros, las familias maximizadas y las victorias de otros jugadores de la partida.</li>
          <li>🎃 <strong>Un login más vivo</strong>: Los Globs y enemigos aparecen sin duplicados; los enemigos de Halloween pueden sorprenderte al hacer clic en ellos.</li>
          <li>✨ <strong>Efectos secretos</strong>: Descubre Hipermutado y Glitch en Ajustes → Especial. Puedes equiparlos juntos, y también afectan a Work-Bombot.</li>
          <li>🕒 <strong>Reloj y recordatorios</strong>: Consulta la hora y el tiempo de juego; cada cierto tiempo aparecerá un mensaje que te recordará descansar o comprobar si sigues ahí.</li>
          <li>🖼️ <strong>Mejoras visuales y correcciones</strong>: El login usa el logo Rewamp, y Omnipresent Glob sirve de respaldo cuando no se puede cargar una imagen.</li>
        </ul>

        <h3 style="color:#75df9a;">📋 Historial de Actualizaciones (GlD v4.3.0 - ONLINE &amp; AVATARES)</h3>
        <p style="color:#75df9a;">¡Tus partidas, tu identidad y tu estilo Glob se conectan como nunca!</p>
        <h4>Novedades del Parche:</h4>
        <ul>
          <li>🌐 <strong style="color:#75df9a;">Multijugador online con Supabase</strong>: Crea una seed e invita a otras personas desde sus propios ordenadores. La partida se sincroniza en tiempo real mientras el anfitrión siga conectado.</li>
          <li>🔐 <strong>Cuentas y progreso en la nube</strong>: Inicia sesión con usuario y contraseña; el progreso de cuenta, compras, emblemas y personalización se guarda asociado a tu cuenta. El modo offline mantiene su progreso local y no permite crear ni cargar seeds.</li>
          <li>👤 <strong>Perfiles personalizables</strong>: Equipa retratos de Globs y enemigos enmarcados, y elige entre bordes de colores, bordes de mapas y estilos especiales. En las seeds verás los nombres, fotos y bordes del resto de jugadores, incluso en el aviso de entrada.</li>
          <li>🖼️ <strong>Retratos originales y Rewamp</strong>: Glob y Glob Rojo incluyen gratis su arte original. Los retratos Rewamp requieren desbloquear la skin correspondiente; los retratos de evolución máxima se compran después de maxear la familia.</li>
          <li>🎨 <strong>Nuevos bordes para coleccionar</strong>: Consigue bordes al avanzar por el Duck Pass, cómpralos con Duckpasses o desbloquea los especiales completando sus requisitos. Fantasmal y Calabaza cuestan 500 Duckpasses cada uno.</li>
          <li>🌈 <strong>Rumores de coleccionista</strong>: Se dice que completar ciertas colecciones podría traer una recompensa especial, aunque nadie ha confirmado qué hay detrás.</li>
          <li>🔑 <strong>Código nuevo</strong>: Canjea <code>ONLINE-AVATARS</code> para obtener el borde Coded.</li>
        </ul>

        <h3 style="color:#ff69b4;">📋 Historial de Actualizaciones (GlD v4.0.2 - Responvidad y Revision. (1))</h3>
        <p style="color:#ff69b4;">Pequeños misterios, respuestas más expresivas y una revisión general de la experiencia.</p>
        <h4>Novedades del Parche:</h4>
        <ul>
          <li>💬 <strong style="color:#ff69b4;">??? tiene mucho que decir</strong>: El misterioso personaje del logo ahora responde con una frase aleatoria cada vez que se alcanza un múltiplo de cinco clics.</li>
          <li>🎭 <strong>Más diálogos secretos</strong>: Se han añadido nuevas respuestas chistosas, amenazas pixeladas, referencias a la corporación mafiosa MadStars y quejas formales de WORK-BOMBOT.</li>
          <li>🌸 <strong>Diálogo más visible</strong>: Las apariciones de ??? usan texto blanco y bordes rosas para que sus mensajes puedan leerse incluso sobre el fondo oscuro.</li>
          <li>📱 <strong>Revisión de responsividad</strong>: Ajustes visuales para que los elementos importantes tengan más espacio en dispositivos móviles.</li>
        </ul>
        <p style="text-align:center; font-style:italic; color:#ff69b4; font-size:0.9rem; margin-top:20px;">Psst... prueba el código "BLOCK_QUEST" en Urbanistic Road, en Difícil o superior.</p>

        <h3 style="color:#7ec850;">📋 Historial de Actualizaciones (GlD v4.0.1 - LEAFY BEACH PARTY HOTFIX)</h3>
        <p style="color:#7ec850;">Correcciones, mejoras de animación y actualizaciones visuales sin nuevas salas.</p>
        <h4>Novedades del Parche:</h4>
        <ul>
          <li>🐸 <strong style="color:#7ec850;">NUEVA SKIN — Froggy Set</strong>: Derrota el modo Anti-Normal en Sunlight Seaside para hacerte con esta skin de la familia Pirata. Ilustrada originalmente por <em>Victorillo</em> y redibujada por <em>KirByte_Bi</em>.</li>
          <li>🎲 <strong>All-Stars Randomizer</strong>: La skin de la Enciclopedia ahora se llama All-Stars Randomizer y abarca <em>todos</em> los enemigos del juego, no solo los Pyces. Además, los sprites se voltean automáticamente para mirar en la dirección correcta.</li>
          <li>🔓 <strong>Desequipar skins</strong>: Ya puedes desequipar cualquier skin desde la tienda o desde el DuckPass pulsando el nuevo botón <em>Desequipar</em>.</li>
          <li>🌆 <strong>Urban Pass visible desde el DuckPass</strong>: Al llegar al final del DuckPass podrás ver el Urban Pass bloqueado y gris, con su aviso de desbloqueo.</li>
          <li>✨ <strong>Animaciones de Globs</strong>: Los Globs ahora se animan en reposo (salto o balanceo según la familia) y parpadean al atacar.</li>
          <li>⏳ <strong>Pantalla de carga en el login</strong>: Ahora hay una breve pantalla de carga animada con el logo del juego y un Glob girando antes de entrar al mapa.</li>
          <li>🛠️ <strong>Corrección de rutas de imagen</strong>: Arreglados los 404 de AstrorbTF.png y Tadpole Glob (SK-EVO1).png al corregir las carpetas de los sets Astrorb y Froggy.</li>
          <li>⚙️ <strong>Roles de usuario</strong>: Sistema de roles (OWNER / DEVBUILD / ADMIN) aplicado correctamente a las cuentas de desarrollo.</li>
          <li>🎮 <strong>Recompensas Anti-Normal</strong>: Todos los modos Anti-Normal ahora dan 500 PyCoins, 450 DuckPasses y XP. En Sunlight Seaside, además, +50 DuckPasses extra.</li>
        </ul>

        <h3 style="color:#e3c08d;">📋 Historial de Actualizaciones (GlD v4.0.0 - LEAFY BEACH PARTY - BIG UPD4)</h3>
        <p style="color:#e3c08d;">¡El verano llega con la gran playa soleada y una temática pirata inigualable!</p>
        <h4>Novedades del Parche:</h4>
        <ul>
          <li>🏖️ <strong style="color:#e3c08d;">NUEVO MAPA</strong>: Sunlight Seaside. Disfruta de la brisa marina mientras defiendes el archipiélago de una oleada totalmente nueva.</li>
          <li>👾 <strong style="color:#e3c08d;">NUEVOS ENEMIGOS (SEASIDE)</strong>:
            <ul style="margin-top:6px;">
              <li>🏖️ <strong>Playa Veraniega</strong>: Piz, Pysh, Ren y sus variantes gigantes, además de los Axolotl Pyce, Shark Pyce, Umbrella Pyce y otros seres estivales.</li>
              <li>🌲🍄 <strong>Bosques y Setas</strong>: Shrum, Baby Shrum, Big Treeper, Treeper, Old Fungus y sus variantes gigantes.</li>
            </ul>
          </li>
          <li>☠️ <strong style="color:#98fb98;">FAMILIA PIRATA (F. Marina)</strong>: ¡Pirate Glob atraca en la tienda! Invoca tu barco y navega por los caminos del mapa arrollando enemigos.</li>
          <li>✨ <strong style="color:#e3c08d;">SISTEMA DE OLEADAS REHECHO</strong>: Hemos reemplazado el antiguo sistema de generación de enemigos y lo hemos mejorado para que la dificultad y la aparición de enemigos coincida con la dificultad del modo.</li>
          <li>🏅 <strong style="color:#98fb98;">NUEVO CONTENIDO</strong>: Más secretos por descubrir, progreso extendido de skins y mucho más.</li>
          <li>🛠️ <strong style="color:#98fb98;">BALANCE Y FIXES</strong>: Se han arreglado varios errores y buffeado dos Globs.</li>
        </ul>
        <p style="text-align:center; font-style:italic; color:#888; font-size:0.9rem; margin-top:20px;">Psst... intenta canjear el código "SUMMERS-OVER"</p>

        <h3 style="color:#4fc3f7;">📋 Historial de Actualizaciones (GlD v3.0.0 - INTERSTELLAR MENACE)</h3>
        <p style="color:#4fc3f7;">¡La amenaza cristalina ha llegado, y con ella una misión completamente nueva!</p>
        <h4>Novedades del Parche:</h4>
        <ul>
          <li>🌌 <strong style="color:#4fc3f7;">NUEVA QUEST - PARTE 2</strong>: La segunda parte de la Quest está aquí. La amenaza cristalina se cierne sobre el universo Glob. ¡Prepárate para lo peor!</li>
          <li>👾 <strong style="color:#4fc3f7;">NUEVOS ENEMIGOS</strong>: Llegan los Cristalizados: Crystal Pyce, Dreamy SPyce, Astral BPyce, Lenistal, Cristalized Monster, NO-CrystEye y el imponente Astrorb en todas sus formas.</li>
          <li>🌱 <strong style="color:#4fc3f7;">FAMILIA MARRÓN (Sprout Glob)</strong>: Una nueva familia ha llegado al Meta-Shop. El Sprout Glob y sus evoluciones se unen a la batalla.</li>
          <li>🎨 <strong style="color:#4fc3f7;">NUEVAS SKINS</strong>: Sets de recompensa por completar Urbanistic Road en distintas dificultades. Además, nuevas skins exclusivas del modo Interstellar.</li>
          <li>🏅 <strong style="color:#4fc3f7;">NUEVOS EMBLEMAS</strong>: Desmenazado, Skinecionable, Descristalizando Amenazas y Enmarcación Extensa. ¡A por todos!</li>
          <li>⚖️ <strong>Sistema de Oleadas Mejorado</strong>: Las oleadas ahora usan un sistema de presupuesto de HP para un desafío más balanceado y emocionante.</li>
          <li>🎒 <strong>Ajustes de Progresión</strong>: Las familias de torres ya no tienen requisitos de desbloqueo especiales. Las skins ahora se desbloquean con victorias.</li>
        </ul>
        <p style="color:#ff69b4; font-size:0.82rem; margin-top:10px; font-style:italic;">🌐 Quizás para iniciar la misión necesites visitar cierto juego en agosto... <span id="interstellar-game-link"><a href="https://eithancrea.itch.io/cube-adventure" target="_blank" style="color:#4fc3f7;">Cube Adventure</a></span></p>

        <h3>📋 Historial de Actualizaciones (GlD v2.0.1 - TACTICAL LOADOUT)</h3>
        <p>¡El sistema de equipación ha llegado para cambiar la estrategia por completo!</p>
        <h4>Novedades del Parche:</h4>
        <ul>
          <li>🎒 <strong>Sistema de Equipación</strong>: Se ha introducido una nueva pestaña "Equipación" en la tienda. Ahora, antes de entrar en combate, ¡deberás elegir tu mazo con un máximo de 5 torres!</li>
          <li>⚙️ <strong>Menú Táctico</strong>: La barra de torres dentro del juego ahora se adapta para mostrar únicamente tu selección táctica.</li>
        </ul>

        <h3>📋 Historial de Actualizaciones (GlD v2.0.0 - URBAN REBORN: THE BIG UPDATE)</h3>
        <div style="text-align:center; margin: 10px 0;">
          <img src="img/Urban Road_Reborn Logo.png" alt="Urban Road Reborn Logo" style="max-width:100%; max-height:220px; border-radius:12px; box-shadow:0 4px 16px rgba(0,0,0,0.5);">
        </div>
        <p>¡Urbanistic Road, la nueva ciudad ha llegado!! Trayendo consigo varios Pyces, enemigos y Globs nuevos!!</p>
        <h4>Novedades del Parche:</h4>
        <ul>
          <li>🏙️ <strong>NUEVOS PYCES</strong>: HoloPyce y Rebel Pyce (DESDE FtPy2 redibujados), Bomb Pyce, Knight Pyce, Cannon Pycer y Strechy Pyce.</li>
          <li>👾 <strong>ENEMIGOS NUEVOS</strong>: Bits, Bytes, Spywares, Fireflies y la llegada de Arky a la ciudad, con sus variantes de corrupto y Anti-Normal.</li>
          <li>🗼 <strong>Nuevos Globs</strong>: Han llegado Worker Glob (familia naranja), Balloon Glob (familia blanca), Streamer Glob (familia rosa) y un esperadísimo Bomb Glob, la primera torre instantánea del juego, que explotará cuando detecte un Pyce, todos ellos son criados en la ciudad y por ello necesitarás jugar dicho mapa para desbloquearlos... O desde el pase, una de dos.</li>
          <li>📱 <strong>Mejoras</strong>: Cambios en los diálogos, bugs de la comunidad fixeados y una mayor responsividad en móvil, todo ello para garantizar su jugabilidad.</li>
          <li>💎 <strong>Próximamente</strong>: Y quizás pronto lleguen las primeras skins para estas torres urbanas, pero démosle tiempo... Hay cristales en el horizonte que esperan caer muy pronto.</li>
        </ul>

        <h3>📋 Historial de Actualizaciones (GlD v1.2.0 - ENCICLOPEDIA DORADA Y ATAJOS)</h3>
        <p>¡Más formas de jugar y recompensas por completar la enciclopedia!</p>
        <h4>Novedades del Parche:</h4>
        <ul>
          <li>⌨️ <strong>Atajos de Teclado</strong>: Ahora puedes usar <strong>U</strong> para mejorar/colocar, <strong>C</strong> para cancelar/cerrar y <strong>V</strong> para vender.</li>
          <li>📖 <strong>Progreso en la Enciclopedia</strong>: Cada Pyce tiene ahora una barra de eliminaciones. Al completarlas todas, desbloquearás la skin global exclusiva <strong>All-Stars Randomizer</strong>.</li>
          <li>🌑 <strong>Void Glob</strong>: La evolución final de la línea Negra ha llegado. Sus oscuros proyectiles te perseguirán sin descanso.</li>
          <li>⚖️ <strong>Balanceo</strong>: Se ha reducido drásticamente la probabilidad de aparición del Stupid GoldPyce.</li>
          <li>🎁 <strong>Nuevas Skins y Secretos</strong>: Añadido el "Set de Ensueño" y el "Set Judicial" (Colaboración comunitaria). Y quizás, algún código haya despertado de sus sueños...</li>
          <li>📝 <strong>Lore y Créditos</strong>: Textos y descripciones de las skins ajustadas en la tienda para hacer honor a sus creadores y dar más contexto.</li>
          <li>💬 <strong>Rehabilitación de Diálogos</strong>: ¡Hemos añadido nuevos diálogos y dado un poco de lore oculto a los NPCs! Presta atención a lo que dicen durante las oleadas o cuando aparecen jefes.</li>
        </ul>

        <h3>📋 Historial de Actualizaciones (GlD v1.1.0 - ENCICLOPEDIA VIVIENTE Y PERSONALIDAD DIALOGADA)</h3>
        <p>¡Los enemigos cobran vida y los misterios del sistema se revelan!</p>
        
        <h4>Novedades del Parche:</h4>
        <ul>
          <li>📖 <strong>Enciclopedia Viviente</strong>: ¡Hemos añadido lore y descripciones únicas para todos los Pyces! Ahora podrás conocer la historia detrás de cada enemigo en la enciclopedia, junto con sus mecánicas resaltadas.</li>
          <li>🌐 <strong>Traducción Total</strong>: La enciclopedia, los modos secretos y las descripciones de las mecánicas están 100% internacionalizados y adaptados perfectamente al inglés y al español.</li>
          <li>👾 <strong>Un normal desnormalizado...</strong>: Quizas presionando algun logo- ¿Sabes que? No lo hagas, podrias estar ante un modo peligroso, mejor preparate antes de lanzarte al ataque.</li>
          <li>🔧 <strong>Correcciones Menores</strong>: Los nombres y estadísticas se han estandarizado según los archivos originales del juego.</li>
        </ul>

        <h3>📋 Historial de Actualizaciones (GlD v1.0.0 - LANZAMIENTO)</h3>
        <p>¡El esperado lanzamiento oficial con mejoras visuales y colaboraciones exclusivas!</p>

        <h4>Novedades del Parche:</h4>
        <ul>
          <li>✨ <strong>Mejores Visuales</strong>: Nuevas <span style="color: #ffd700;">imágenes para proyectiles</span>, torres mejor pulidas y una opción nueva en ajustes para <strong>ver el rango de las torres</strong>.</li>
          <li>🦈 <strong>Nuevas Skins</strong>: Demos la bienvenida a <strong>SharkBot (RoboTibu)</strong>, creada por <span style="color: #ff3333;">@Nitrogen</span> y rehecha por <span style="color: #ff69b4;">@KirByte_Bi</span>. También se ha creado una skin de "Among Us" un tanto singular... cada quien sus gustos, supongo.</li>
          <li>⭐ <strong>COLLAB EXCLUSIVA</strong>: <strong>Star Jump</strong> (de <span style="color: #ff69b4;">@KirByte_Bi</span>) ha colaborado con Glob Defenders. ¡Ahora podrás comprar la skin de <strong>Starry</strong>, el protagonista de dicho juego, para la Familia Gris!</li>
          <li>🎁 <strong>Muchos códigos nuevos</strong>: Encuéntralos por ahí ocultos o simplemente usa tu imaginación.</li>
        </ul>

        <h3>📋 Versiones Pre-Lanzamiento (v0.x.x y anteriores)</h3>
        <p>Se realizaron múltiples pruebas durante la fase beta, añadiendo sistemas como G-Tacks, modos de historia, y reajustes del progreso general para dar forma a lo que hoy es Glob Defenders.</p>
        <p style="text-align:center; font-style:italic; color:#888; font-size:0.9rem; margin-top:20px;">Psst... intenta canjear el código "GLOBS-ARE-AWESOME"</p>
      `;
      } else {
        container.innerHTML = `
        <h3 style="color:#ff9f43;">📋 Update Logs (GlD v5.0.0 - SPOOKTACULAR RUINS — PT1: GETTING STARTED)</h3>
        <p style="color:#ff9f43;">A new adventure begins! This first part prepares the game with new ways to play, save your progress, and uncover secrets.</p>
        <h4>What's New in PT1:</h4>
        <ul>
          <li>💾 <strong style="color:#ff9f43;">Save and resume games</strong>: Save a round from the pause menu and load it from the island screen. Saved games show the map, mode, and wave; you can also save and log out or save and exit.</li>
          <li>🌐 <strong>Easier seed sharing</strong>: Copy the seed or invitation from its options, or download the seed as a text file.</li>
          <li>👤 <strong>Profiles in online matches</strong>: View other players' progress, badges, maxed families, and victories in the match.</li>
          <li>🎃 <strong>A livelier login screen</strong>: Globs and enemies appear without duplicates; Halloween enemies can surprise you when clicked.</li>
          <li>✨ <strong>Secret effects</strong>: Discover Hipermutado and Glitch in Settings → Special. Equip them together, and they also affect Work-Bombot.</li>
          <li>🕒 <strong>Clock and reminders</strong>: Keep an eye on the time and your play session; a message will periodically remind you to rest or check if you're still there.</li>
          <li>🖼️ <strong>Visual improvements and fixes</strong>: The login screen uses the Rewamp logo, and Omnipresent Glob is used as a fallback when an image cannot load.</li>
        </ul>

        <h3 style="color:#75df9a;">📋 Update Logs (GlD v4.3.0 - ONLINE &amp; AVATARS)</h3>
        <p style="color:#75df9a;">Your matches, identity and Glob style are more connected than ever!</p>
        <h4>What's New in this Patch:</h4>
        <ul>
          <li>🌐 <strong style="color:#75df9a;">Supabase online multiplayer</strong>: Create a seed and invite other players from their own computers. Matches synchronize in real time while the host remains connected.</li>
          <li>🔐 <strong>Accounts and cloud progress</strong>: Sign in with a username and password; account progress, purchases, badges and profile customization are saved to your account. Offline progress stays local, and offline play cannot create or join seeds.</li>
          <li>👤 <strong>Custom profiles</strong>: Equip Glob portraits and framed-enemy portraits, then choose from colored, map-themed and special frames. Seeds show every player's name, portrait and frame, including the join notification.</li>
          <li>🖼️ <strong>Original and Rewamp portraits</strong>: Glob and Red Glob include their original artwork for free. Rewamp portraits require the corresponding skin; max-evolution portraits can be purchased after maxing the family.</li>
          <li>🎨 <strong>More frames to collect</strong>: Earn frames through Duck Pass levels, buy them with Duckpasses, or unlock special styles by completing their requirements. Spooky and Pumpkin each cost 500 Duckpasses.</li>
          <li>🌈 <strong>Collector rumors</strong>: Some say completing certain collections may bring a special reward, though no one has confirmed what lies behind them.</li>
          <li>🔑 <strong>New code</strong>: Redeem <code>ONLINE-AVATARS</code> to get the Coded frame.</li>
        </ul>

        <h3 style="color:#ff69b4;">📋 Update Logs (GlD v4.0.2 - Responvidad y Revision. (1))</h3>
        <p style="color:#ff69b4;">Small mysteries, more expressive replies, and a general pass over the experience.</p>
        <h4>What's New in this Patch:</h4>
        <ul>
          <li>💬 <strong style="color:#ff69b4;">??? has a lot to say</strong>: The mysterious logo character now replies with a random line whenever a multiple of five clicks is reached.</li>
          <li>🎭 <strong>More secret dialogue</strong>: New funny replies, pixelated threats, references to the mafia-like MadStars corporation, and formal complaints from WORK-BOMBOT have been added.</li>
          <li>🌸 <strong>More readable dialogue</strong>: ??? now uses white text and pink borders so the messages remain visible against the dark background.</li>
          <li>📱 <strong>Responsiveness review</strong>: Visual adjustments give important elements more room on mobile devices.</li>
        </ul>
        <p style="text-align:center; font-style:italic; color:#ff69b4; font-size:0.9rem; margin-top:20px;">Psst... try the code "BLOCK_QUEST" on Urbanistic Road, Hard difficulty or higher.</p>

        <h3 style="color:#7ec850;">📋 Update Logs (GlD v4.0.1 - LEAFY BEACH PARTY HOTFIX)</h3>
        <p style="color:#7ec850;">Fixes, animation improvements and visual updates — no new stages.</p>
        <h4>What's New in this Patch:</h4>
        <ul>
          <li>🐸 <strong style="color:#7ec850;">NEW SKIN — Froggy Set</strong>: Beat Anti-Normal mode on Sunlight Seaside to unlock this Pirate family skin. Originally designed and drawn by <em>Victorillo</em>, redrawn by <em>KirByte_Bi</em>.</li>
          <li>🎲 <strong>All-Stars Randomizer</strong>: The Encyclopedia skin has been renamed All-Stars Randomizer and now covers <em>every</em> enemy in the game, not just Pyces. Enemy sprites are also auto-flipped to face the correct direction.</li>
          <li>🔓 <strong>Unequip skins</strong>: You can now unequip any skin directly from the Shop or the DuckPass using the new <em>Unequip</em> button.</li>
          <li>🌆 <strong>Urban Pass preview in DuckPass</strong>: Scrolling past level 100 in the DuckPass now reveals the locked Urban Pass in greyscale with an unlock warning.</li>
          <li>✨ <strong>Glob animations</strong>: Globs now animate while idle (jump or wobble depending on family) and flash when attacking.</li>
          <li>⏳ <strong>Login loading screen</strong>: A short animated loading screen with the game logo and a spinning Glob now appears before entering the map.</li>
          <li>🛠️ <strong>Image path fixes</strong>: Fixed 404 errors for AstrorbTF.png and Tadpole Glob (SK-EVO1).png by correcting the Astrorb and Froggy Set folder paths.</li>
          <li>⚙️ <strong>User roles</strong>: Role system (OWNER / DEVBUILD / ADMIN) correctly applied to development accounts.</li>
          <li>🎮 <strong>Anti-Normal rewards</strong>: All Anti-Normal modes now award 500 PyCoins, 450 DuckPasses and XP. On Sunlight Seaside an additional +50 DuckPasses are granted.</li>
        </ul>

        <h3 style="color:#e3c08d;">📋 Update Logs (GlD v4.0.0 - LEAFY BEACH PARTY - BIG UPD4)</h3>
        <p style="color:#e3c08d;">Summer arrives with the great sunny beach and an unparalleled pirate theme!</p>
        <h4>What's New in this Patch:</h4>
        <ul>
          <li>🏖️ <strong style="color:#e3c08d;">NEW MAP</strong>: Sunlight Seaside. Enjoy the sea breeze while defending the archipelago from a completely new wave of enemies.</li>
          <li>👾 <strong style="color:#e3c08d;">NEW ENEMIES (SEASIDE)</strong>:
            <ul style="margin-top:6px;">
              <li>🏖️ <strong>Summer Beach</strong>: Piz, Pysh, Ren and their giant variants, plus the Axolotl Pyce, Shark Pyce, Umbrella Pyce, and other summer beings.</li>
              <li>🌲🍄 <strong>Forests & Mushrooms</strong>: Shrum, Baby Shrum, , Big Treeper, Treeper, Old Fungus and their giant variants.</li>
            </ul>
          </li>
          <li>☠️ <strong style="color:#98fb98;">PIRATE FAMILY (F. Marina)</strong>: Pirate Glob docks in the shop! Summon your ship and sail through the map's paths, crushing enemies.</li>
          <li>✨ <strong style="color:#e3c08d;">WAVE SYSTEM REWORK</strong>: We have replaced the old enemy generation system and improved it so that the difficulty and enemy appearances match the selected game mode's difficulty.</li>
          <li>🏅 <strong style="color:#98fb98;">NEW CONTENT</strong>: More secrets to discover, extended skin progression, and much more.</li>
          <li>🛠️ <strong style="color:#98fb98;">BALANCE AND FIXES</strong>: Fixed several bugs and buffed two Globs.</li>
        </ul>
        <p style="text-align:center; font-style:italic; color:#888; font-size:0.9rem; margin-top:20px;">Psst... try redeeming the code "SUMMERS-OVER"</p>

        <h3 style="color:#4fc3f7;">📋 Update Logs (GlD v3.0.0 - INTERSTELLAR MENACE)</h3>
        <p style="color:#4fc3f7;">The crystal threat has arrived, and with it a brand new quest!</p>
        <h4>What's New in this Patch:</h4>
        <ul>
          <li>🌌 <strong style="color:#4fc3f7;">NEW QUEST - PART 2</strong>: The second part of the Quest is here. The crystalline menace looms over the Glob universe. Prepare for the worst!</li>
          <li>👾 <strong style="color:#4fc3f7;">NEW ENEMIES</strong>: The Crystallized arrive: Crystal Pyce, Dreamy SPyce, Astral BPyce, Lenistal, Cristalized Monster, NO-CrystEye, and the imposing Astrorb in all its forms.</li>
          <li>🌱 <strong style="color:#4fc3f7;">BROWN FAMILY (Sprout Glob)</strong>: A new family has arrived in the Meta-Shop. Sprout Glob and its evolutions join the battle.</li>
          <li>🎨 <strong style="color:#4fc3f7;">NEW SKINS</strong>: Reward sets for completing Urbanistic Road at different difficulties. Plus new exclusive Interstellar mode skins.</li>
          <li>🏅 <strong style="color:#4fc3f7;">NEW BADGES</strong>: Unmenaced, Skinllector, Crystalizing Break, and Extended Marc. Go get them all!</li>
          <li>⚖️ <strong>Improved Wave System</strong>: Waves now use an HP-budget system for a more balanced and exciting challenge.</li>
          <li>🎒 <strong>Progression Tweaks</strong>: Tower families no longer have special unlock requirements. Skins are now unlocked with victories.</li>
        </ul>
        <p style="color:#ff69b4; font-size:0.82rem; margin-top:10px; font-style:italic;">🌐 Maybe to start the mission you'll need to visit a certain game in August... <span id="interstellar-game-link-en"><a href="https://eithancrea.itch.io/cube-adventure" target="_blank" style="color:#4fc3f7;">Cube Adventure</a></span></p>

        <h3>📋 Update Logs (GlD v2.0.1 - TACTICAL LOADOUT)</h3>
        <p>The equipment system has arrived to completely change the strategy!</p>
        <h4>What's New in this Patch:</h4>
        <ul>
          <li>🎒 <strong>Equipment System</strong>: A new "Equip" tab has been introduced in the shop. Now, before going into battle, you must choose your loadout with a maximum of 5 towers!</li>
          <li>⚙️ <strong>Tactical Menu</strong>: The in-game tower bar now adapts to show only your tactical selection.</li>
        </ul>

        <h3>📋 Update Logs (GlD v2.0.0 - URBAN REBORN: THE BIG UPDATE)</h3>
        <div style="text-align:center; margin: 10px 0;">
          <img src="img/Urban Road_Reborn Logo.png" alt="Urban Road Reborn Logo" style="max-width:100%; max-height:220px; border-radius:12px; box-shadow:0 4px 16px rgba(0,0,0,0.5);">
        </div>
        <p>Urbanistic Road, the new city has arrived!! Bringing with it several new Pyces, enemies, and Globs!!</p>
        <h4>What's New in this Patch:</h4>
        <ul>
          <li>🏙️ <strong>NEW PYCES</strong>: HoloPyce and Rebel Pyce (redrawn FROM FtPy2), Bomb Pyce, Knight Pyce, Cannon Pycer, and Strechy Pyce.</li>
          <li>👾 <strong>NEW ENEMIES</strong>: Bits, Bytes, Spywares, Fireflies, and the arrival of Arky to the city, along with his Corrupt and Anti-Normal variants.</li>
          <li>🗼 <strong>New Globs</strong>: Worker Glob (orange family), Balloon Glob (white family), Streamer Glob (pink family), and a highly anticipated Bomb Glob have arrived! Bomb Glob is the first instant tower in the game, which will explode when it detects a Pyce. All of them are raised in the city, so you'll need to play that map to unlock them... Or get them from the pass, one of the two.</li>
          <li>📱 <strong>Improvements</strong>: Dialogue changes, community bugs fixed, and greater mobile responsiveness, all to guarantee a better gameplay experience.</li>
          <li>💎 <strong>Coming Soon</strong>: And maybe the first skins for these urban towers will arrive soon, but let's give it time... There are crystals on the horizon waiting to fall very soon.</li>
        </ul>

        <h3>📋 Update Logs (GlD v1.2.0 - GOLDEN ENCYCLOPEDIA & HOTKEYS)</h3>
        <p>More ways to play and rewards for completing the encyclopedia!</p>
        <h4>What's New in this Patch:</h4>
        <ul>
          <li>⌨️ <strong>Keyboard Hotkeys</strong>: You can now use <strong>U</strong> to upgrade/place, <strong>C</strong> to cancel/close and <strong>V</strong> to sell.</li>
          <li>📖 <strong>Encyclopedia Progress</strong>: Each Pyce now has a kill tracker bar. Completing all of them unlocks the exclusive global skin <strong>All-Stars Randomizer</strong>.</li>
          <li>🌑 <strong>Void Glob</strong>: The final evolution of the Black family is here. Its dark projectiles will track you relentlessly.</li>
          <li>⚖️ <strong>Balance</strong>: The spawn probability of the Stupid GoldPyce has been drastically reduced.</li>
          <li>🎁 <strong>New Skins & Secrets</strong>: Added "Dreams Set" and "Judicial Set" (Community Collab). And maybe, a code has awakened from its dreams...</li>
          <li>📝 <strong>Lore & Credits</strong>: Shop texts and skin descriptions have been adjusted to honor their creators and provide more context.</li>
          <li>💬 <strong>Dialogue Rehabilitation</strong>: We added new dialogues and even some hidden lore from NPCs! Pay close attention to what they say during waves or when bosses appear.</li>
        </ul>

        <h3>📋 Update Logs (GlD v1.1.0 - LIVING ENCYCLOPEDIA AND DIALOGUED PERSONALITY)</h3>
        <p>The enemies come to life and the system's mysteries are revealed!</p>
        
        <h4>What's New in this Patch:</h4>
        <ul>
          <li>📖 <strong>Living Encyclopedia</strong>: We've added lore and unique descriptions for all Pyces! Now you can learn the story behind each enemy in the encyclopedia, alongside their highlighted mechanics.</li>
          <li>🌐 <strong>Full Translation</strong>: The encyclopedia, secret modes, and mechanic descriptions are 100% internationalized and perfectly adapted to English and Spanish.</li>
          <li>👾 <strong>A desmesurated normal...</strong>: Maybe pressing some logo- You know what? Don't do it, you could be facing a dangerous mode, better prepare yourself before launching into the attack.</li>
          <li>🔧 <strong>Minor Fixes</strong>: Names and stats have been standardized according to the original game files.</li>
        </ul>

        <h3>📋 Update Logs (GlD v1.0.0 - LAUNCH)</h3>
        <p>The highly anticipated official launch featuring visual overhauls and exclusive collaborations!</p>

        <h4>What's New in this Patch:</h4>
        <ul>
          <li>✨ <strong>Better Visuals</strong>: New <span style="color: #ffd700;">projectile images</span>, highly polished towers, and a new settings option to <strong>view tower ranges</strong>.</li>
          <li>🦈 <strong>New Skins</strong>: Welcome <strong>SharkBot</strong>, created by <span style="color: #ff3333;">@Nitrogen</span> and remade by <span style="color: #ff69b4;">@KirByte_Bi</span>. We also added a somewhat peculiar "Among Us" skin... to each their own, I guess.</li>
          <li>⭐ <strong>EXCLUSIVE COLLAB</strong>: <strong>Star Jump</strong> (by <span style="color: #ff69b4;">@KirByte_Bi</span>) has collaborated with Glob Defenders. You can now buy the <strong>Starry</strong> skin, the protagonist of that game, for the Grey Family!</li>
          <li>🎁 <strong>Many new codes</strong>: Find them hidden around or simply use your imagination.</li>
        </ul>

        <h3>📋 Pre-Launch Versions (v0.x.x and older)</h3>
        <p>Multiple tests were performed during the beta phase, adding systems like G-Tacks, story modes, and overall progression rebalances to shape Glob Defenders into what it is today.</p>
        <p style="text-align:center; font-style:italic; color:#888; font-size:0.9rem; margin-top:20px;">Psst... try redeeming the code "GLOBS-ARE-AWESOME"</p>
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
