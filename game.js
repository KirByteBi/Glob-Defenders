// ===================== CONFIGURACIÓN Y TRADUCCIONES =====================
const TRANSLATIONS = {
  es: {
    health: "Salud", money: "Dinero", wave: "Oleada",
    startWave: "Iniciar Oleada", autoWave: "Auto-Oleada",
    autoWaveActive: "Auto-ON", cancel: "Cancelar",
    gameOver: "💀 GAME OVER 💀", playAgain: "Reintentar",
    achievements: "Logros", notEnoughMoney: "💸 Sin fondos",
    towerPlaced: "✅ {name} colocada",
    towerEvolved: "🎉 ¡Evolución a {name}!",
    towerSold: "💵 Vendida por {price}",
    waveStarted: "🌊 Oleada {wave}!",
    waveCompleted: "✅ Oleada {wave} superada!",
    enemyReachedEnd: "💔 ¡Daño a la base!",
    pyceGlobUnlocked: "🔓 ¡Pyce Glob desbloqueado!",
    adminMode: "👑 MODO ADMIN",
    codeInvalid: "❌ Código inválido",
    loginError: "❌ Usuario o contraseña incorrectos",
    codeSuccess: "✨ Código aceptado: {name} desbloqueado",
    badge_survivor_name: "Superviviente", badge_survivor_desc: "Llega a la oleada 10",
    badge_millionaire_name: "Aura Farmer", badge_millionaire_desc: "Ten más de 20.000 de dinero",
    badge_evolution_name: "Biotecnólogo", badge_evolution_desc: "Evoluciona una torre al máximo",
    badge_bossKiller_name: "Matarreyes", badge_bossKiller_desc: "Derrota al primer jefe",
    badge_secret_name: "Hacker", badge_secret_desc: "Usa un código secreto",
    badge_inf100_name: "Centenario", badge_inf100_desc: "Llega a la oleada 100",
    badge_inf500_name: "Veterano", badge_inf500_desc: "Llega a la oleada 500",
    badge_inf999_name: "Dios Glob", badge_inf999_desc: "Llega a la oleada 999",
    badge_corrupt1_name: "Corrupto I", badge_corrupt1_desc: "Gana 1 vez en modo corrupto",
    badge_corrupt2_name: "Corrupto II", badge_corrupt2_desc: "Gana 2 veces en modo corrupto",
    badge_corrupt3_name: "Corrupto III", badge_corrupt3_desc: "Gana 3 veces en modo corrupto",
    badge_corrupt4_name: "Corrupto IV", badge_corrupt4_desc: "Gana 4 veces en modo corrupto",
    badge_corrupt5_name: "Corrupto V", badge_corrupt5_desc: "Gana 5 veces en modo corrupto",
    badge_mimic1_name: "Cazatesoros I", badge_mimic1_desc: "Encuentra 1 Mimic",
    badge_mimic2_name: "Cazatesoros II", badge_mimic2_desc: "Encuentra 2 Mimics seguidos",
    badge_mimic3_name: "Cazatesoros III", badge_mimic3_desc: "Encuentra 3 Mimics seguidos",
    badge_mimic4_name: "Cazatesoros IV", badge_mimic4_desc: "Encuentra 4 Mimics seguidos",
    badge_corruptMimic_name: "Oro Maldito", badge_corruptMimic_desc: "Encuentra un Mimic corrupto",
    badge_mimicRevenge_name: "Venganza Dorada", badge_mimicRevenge_desc: "Derrota a un Mimic que ha resucitado",
    badge_antiNormal_name: "Maestro del Vacío", badge_antiNormal_desc: "Purifica el modo Anti-Normal",
    login_user: "Nombre de Usuario", login_pass: "Contraseña", login_btn: "Unirse a la batalla",
    select_mode: "Seleccionar Modo",
    backToModes: "Selección de Modo",
    shop_title: "🛒 Tienda Meta",
    pass_title: "🦆 Duck Pass",
    code_placeholder: "Código Secreto...",
    apply_btn: "Aplicar"
  },
  en: {
    health: "Health", money: "Money", wave: "Wave",
    startWave: "Start Wave", autoWave: "Auto-Wave",
    autoWaveActive: "Auto-ON", cancel: "Cancel",
    gameOver: "💀 GAME OVER 💀", playAgain: "Retry",
    achievements: "Achievements", notEnoughMoney: "💸 No money",
    towerPlaced: "✅ {name} placed",
    towerEvolved: "🎉 Evolved to {name}!",
    towerSold: "💵 Sold for {price}",
    waveStarted: "Wave {wave} started!",
    waveCompleted: "Wave {wave} completed!",
    enemyReachedEnd: "💔 Base took damage!",
    pyceGlobUnlocked: "🔓 Pyce Glob unlocked!",
    adminMode: "ADMIN MODE",
    codeSuccess: "✨ Code accepted: {name} unlocked",
    codeInvalid: "❌ Invalid code",
    loginError: "❌ Invalid username or password",
    badge_survivor_name: "Survivor", badge_survivor_desc: "Reach wave 10",
    badge_millionaire_name: "Aura Farmer", badge_millionaire_desc: "Have over 20,000 money",
    badge_evolution_name: "Biotechnologist", badge_evolution_desc: "Evolve a tower to the max",
    badge_bossKiller_name: "Kingslayer", badge_bossKiller_desc: "Defeat the first boss",
    badge_secret_name: "Hacker", badge_secret_desc: "Use a secret code",
    badge_inf100_name: "Centenarian", badge_inf100_desc: "Reach wave 100",
    badge_inf500_name: "Veteran", badge_inf500_desc: "Reach wave 500",
    badge_inf999_name: "Glob God", badge_inf999_desc: "Reach wave 999",
    badge_corrupt1_name: "Corrupt I", badge_corrupt1_desc: "Win 1 time in corrupt mode",
    badge_corrupt2_name: "Corrupt II", badge_corrupt2_desc: "Win 2 times in corrupt mode",
    badge_corrupt3_name: "Corrupt III", badge_corrupt3_desc: "Win 3 times in corrupt mode",
    badge_corrupt4_name: "Corrupt IV", badge_corrupt4_desc: "Win 4 times in corrupt mode",
    badge_corrupt5_name: "Corrupt V", badge_corrupt5_desc: "Win 5 times in corrupt mode",
    badge_mimic1_name: "Treasure Hunter I", badge_mimic1_desc: "Find 1 Mimic",
    badge_mimic2_name: "Treasure Hunter II", badge_mimic2_desc: "Find 2 Mimics in a row",
    badge_mimic3_name: "Treasure Hunter III", badge_mimic3_desc: "Find 3 Mimics in a row",
    badge_mimic4_name: "Treasure Hunter IV", badge_mimic4_desc: "Find 4 Mimics in a row",
    badge_corruptMimic_name: "Cursed Gold", badge_corruptMimic_desc: "Find a corrupt Mimic",
    badge_mimicRevenge_name: "Golden Revenge", badge_mimicRevenge_desc: "Defeat a resurrected Mimic",
    badge_antiNormal_name: "Void Master", badge_antiNormal_desc: "Purify the Anti-Normal mode",
    login_user: "Username", login_pass: "Password", login_btn: "Join the battle",
    select_mode: "Select Mode",
    backToModes: "Mode Selection",
    shop_title: "🛒 Meta Shop",
    pass_title: "🦆 Duck Pass",
    code_placeholder: "Secret Code...",
    apply_btn: "Apply"
  }
};

let USERS = {
  "KirByteBi": "FTPY2",
  "Admin": "ADgod",
  "AirRider": "PYCE",
  "Player": "1234"
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

let currentLanguage = 'es';

const IMAGE_PATHS = {
  'Glob': 'img/Glob_DEF.png',
  'Poop_Glob': 'img/Poop_Glob.png',
  'Golden_Glob': 'img/Golden_Glob.png',
  'Rainbow_Glob': 'img/Rainbow_Glob.png',
  'Red_Glob': 'img/Red_Glob.png',
  'Molten_Glob': 'img/Molten_Glob.png',
  'Robotic_Glob': 'img/Robotic_Glob.png',
  'Soap_Glob': 'img/Soap_Glob.png',
  'Cotton_Glob': 'img/Cotton_Glob.png',
  'Ducky_Glob': 'img/Ducky_Glob.png',
  'Golden_Ducky_Glob': 'img/Golden_Ducky_Glob.png',
  'Comet_Glob': 'img/Comet_Glob.png',
  'Dark_Glob': 'img/Dark_Glob.png',
  'Demglob': 'img/Demglob.png',
  'Pyce_Glob': 'img/Pyce_Glob.png',
  'Old_Glob': 'img/Old_Glob.png',
  'Stupid_Pyce': 'img/Stupid_Pyce.png',
  'Guest_Pyce': 'img/Guest_Pyce.png',
  'Noob_Pyce': 'img/Noob_Pyce.png',
  '4motions_Pyce': 'img/4motions_Pyce.png',
  '1x1x1x1_Pyce': 'img/1x1x1x1_Pyce.png',
  'Stupid_GoldPyce': 'img/Stupid_GoldPyce.png',
  'Pyce2': 'img/Pyce2.png',
  'Symbol_Pyce': 'img/Symbol_Pyce.png',
  'SO_Pyce': 'img/SO_Pyce.png',
  'NOeye_Pyce': 'img/NOeye_Pyce.png',
  'MoonStar_Pyce': 'img/MoonStar_Pyce.png',
  'Work_Bombot': 'img/Work-Bombot.png',
  'Globetin': 'img/Tokens/Globetin.png',
  'PyCoin': 'img/Tokens/PyCoin.png',
  'DuckyPass': 'img/Tokens/DuckPass.png'
};

const NARRATOR_DATA = {
  bombot: {
    img: IMAGE_PATHS.Work_Bombot, es: {
      name: "Work Bombot", msgs: [
        "Detección de enemigos optimizada. Procediendo al bombardeo.",
        "Los siguientes enemigos atacan con una espada. ¡Cuidado!",
        "A veces me pregunto por qué no me uní a los Pyces.",
        "NOeye es una personificación de Materia Negra, tened mucho cuidado.",
        "¿Un símbolo? Ah no, es un enemigo más.",
        "Dicen que los magos Pyces suelen acabar mal parados.",
        "¡Brrzzzttt! Mecachis, un resfriado."
      ]
    }, en: {
      name: "Work Bombot", msgs: [
        "Enemy detection optimized. Proceeding with bombardment.",
        "The following enemies attack with a sword. Watch out!",
        "Sometimes I wonder why I didn't join the Pyces.",
        "NOeye is a personification of Dark Matter, be very careful.",
        "A symbol? Oh no, it's just another enemy.",
        "They say Pyce magicians usually end up badly.",
        "¡Brrzzzttt! Damn it, a cold."
      ]
    }
  },
  glob: {
    img: IMAGE_PATHS.Glob, es: {
      name: "Glob (DEF)", msgs: [
        "Me pregunto por qué atacamos a los Pyces. ¿No son amigos?",
        "¿No viven los Pyces 2.0 en Bitlands? ¡Si este es mi hogar!",
        "Ojalá pudiera darles su merecido a esos corruptos...",
        "¡Oh no... Aquí vienen los disparadores!",
        "¡AYUDA! ¡Vienen demasiados! 😱",
        "¿Alguien tiene un paraguas? Creo que va a llover... Pyces."
      ]
    }, en: {
      name: "Glob (DEF)", msgs: [
        "I wonder why we attack the Pyces. Aren't they friends?",
        "Don't the Pyces 2.0 live in Bitlands? This is my home!",
        "I wish I could give those corrupt ones what they deserve...",
        "Oh no... Here come the shooters!",
        "HELP! Too many are coming! 😱",
        "Anyone got an umbrella? I think it's gonna rain... Pyces."
      ]
    }
  },
  stupid: {
    img: IMAGE_PATHS.Stupid_Pyce, es: {
      name: "Stupid Pyce", msgs: [
        "Eh, estamos entrando. No nos pegues muy fuerte.",
        "Caminar por este mapa cansa un poco.",
        "¿Habéis visto mi sombrero? Ah, no llevo."
      ]
    }, en: {
      name: "Stupid Pyce", msgs: [
        "Hey, we're coming in. Don't hit us too hard.",
        "Walking this map is a bit tiring.",
        "Have you seen my hat? Oh, I'm not wearing one."
      ]
    }
  },
  pyce2: {
    img: IMAGE_PATHS.Pyce2, es: {
      name: "Pyce2", msgs: [
        "Hola, solo estamos pasando por aquí.",
        "Tenéis un lugar muy bonito, me gusta la decoración.",
        "Buen disparo, casi me das.",
        "Espero que no os moleste nuestra visita.",
        "Parece que hoy hace un buen día para dar un paseo.",
        "Interesante defensa, se nota el esfuerzo."
      ]
    }, en: {
      name: "Pyce2", msgs: [
        "Hello, we're just passing through.",
        "You have a very nice place, I like the decoration.",
        "Good shot, you almost hit me.",
        "I hope our visit doesn't bother you.",
        "Looks like a good day for a walk.",
        "Interesting defense, the effort is noticeable."
      ]
    }
  },
  noeye: {
    img: IMAGE_PATHS.NOeye_Pyce, es: {
      name: "NOeye", msgs: [
        "3S70Y H4R70 D3 QU3 M3 73N64N C0N7R0L4D0.",
        "3L P0D3R 3S 1NU71L CU4ND0 713N3S UN4 M4S4 D3 4L14D0S C0N7R0L4D0S.",
        "M3 4B4ND0N4R0N... ¡Y 4H0R4 3LL0S P464R4N!",
        "M4LD170S K3RB0S... S13MPR3 4RRU1N4N M1S PL4N3S."
      ], defeat: [
        "C0M0 PU3D3N UN4S 63L471N4S D3RR074R 4 L4 M473R14 N3-",
        "¡1 7H0U6H7 Y0U W3R3 SM4R73R, 1'LL B3 B4CK S00N!",
        "7H3 6L0BS S3R4N 3SCL4V0S D3 L4 M473R14 N36R4 4L6UN D14."
      ]
    }, en: {
      name: "NOeye", msgs: [
        "1 4M 71R3D 0F B31N6 C0N7R0LL3D.",
        "P0W3R 1S US3L3SS W17H 4 M4SS 0F C0N7R0LL3D 4LL13S.",
        "7H3Y 4B4ND0N3D M3... N0W 7H3Y W1LL P4Y!",
        "CURS3D K3RB0S... 4LW4YS RU1N1N6 MY PL4NS."
      ], defeat: [
        "H0W C4N J3LL13S D3F347 D4RK M4773R-",
        "¡1 7H0U6H7 Y0U W3R3 SM4R73R, 1'LL B3 B4CK S00N!",
        "7H3 6L0BS W1LL B3 SL4V3S 0F D4RK M4773R 0N3 D4Y."
      ]
    }
  },
  moonstar: {
    img: IMAGE_PATHS.MoonStar_Pyce, es: {
      name: "MoonStar", msgs: [
        "Es un honor contemplar vuestra inevitable caída, pequeños Globs.",
        "Vuestro esfuerzo es loable, pero el destino ya ha sido escrito por las estrellas.",
        "Dos vueltas al escenario para saborear vuestro miedo. Qué delicia.",
        "Vuestra resistencia es fútil ante el ciclo eterno de los astros."
      ], defeat: [
        "Imposible... el brillo de las estrellas... se apaga...",
        "Esto es solo un eclipse temporal. Volveré pronto.",
        "Disfrutad vuestro triunfo... mientras dure la luz."
      ]
    }, en: {
      name: "MoonStar", msgs: [
        "It is an honor to behold your inevitable fall, little Globs.",
        "Your effort is laudable, but fate has already been written by the stars.",
        "Two laps around the stage to savor your fear. What a delight.",
        "Your resistance is futile before the eternal cycle of the stars."
      ], defeat: [
        "Impossible... the starlight... fades...",
        "This is only a temporary eclipse. I shall return.",
        "Enjoy your triumph... while the light lasts."
      ]
    }
  },
  mimic: {
    img: IMAGE_PATHS.Stupid_GoldPyce, es: {
      name: "Stupid GoldPyce", msgs: [
        "¡Soy rico! Bueno, lo era hasta que me disparaste.",
        "¿Brillo mucho? Es por el oro, ¿sabes?",
        "¡No me mates, solo quiero ser tu amigo (y darte dinero)!"
      ]
    }, en: {
      name: "Stupid GoldPyce", msgs: [
        "I'm rich! Well, I was until you shot me.",
        "Do I shine a lot? It's the gold, you know?",
        "Don't kill me, I just want to be your friend (and give you money)!"
      ]
    }
  }
};

const TOWER_TYPES = {
  'Glob': { name: 'Glob', damage: 10, range: 150, speed: 1.0, cost: 50, evolution: 'Poop_Glob', image: IMAGE_PATHS.Glob, projectile: 'green', desc: "Glob básico. Ataca con orbes verdes.", evolveDesc: "Evoluciona a Poop Glob.", family: 'Glob' },
  'Poop_Glob': { name: 'Poop Glob', damage: 25, range: 150, speed: 0.6, cost: 100, evolution: 'Golden_Glob', image: IMAGE_PATHS.Poop_Glob, projectile: 'brown', desc: "Más fuerte pero más lento. Lanza orbes pegajosos.", evolveDesc: "Evoluciona a Golden Glob.", family: 'Glob' },
  'Golden_Glob': { name: 'Golden Glob', damage: 45, range: 170, speed: 1.5, cost: 200, evolution: 'Rainbow_Glob', image: IMAGE_PATHS.Golden_Glob, projectile: 'gold', desc: "Muy rápido y potente. Dispara balas de oro.", evolveDesc: "Evoluciona a Rainbow Glob.", family: 'Glob' },
  'Rainbow_Glob': { name: 'Rainbow Glob', damage: 30, range: 180, speed: 1.2, cost: 400, image: IMAGE_PATHS.Rainbow_Glob, projectile: 'laser_rainbow', piercing: true, desc: "El Glob definitivo. Dispara láseres arcoíris penetrantes.", family: 'Glob' },

  'Red_Glob': { name: 'Red Glob', damage: 20, range: 60, speed: 1.5, cost: 70, evolution: 'Molten_Glob', image: IMAGE_PATHS.Red_Glob, melee: true, desc: "Atacante cuerpo a cuerpo muy rápido.", evolveDesc: "Evoluciona a Molten Glob.", family: 'Red_Glob' },
  'Molten_Glob': { name: 'Molten Glob', damage: 15, range: 70, speed: 1.0, cost: 150, evolution: 'Robotic_Glob', image: IMAGE_PATHS.Molten_Glob, burn: true, burnDamage: 5, desc: "Cuerpo a cuerpo que quema a los enemigos.", evolveDesc: "Evoluciona a Robotic Glob.", family: 'Red_Glob' },
  'Robotic_Glob': { name: 'Robotic Glob', damage: 40, range: 200, speed: 0.3, cost: 300, image: IMAGE_PATHS.Robotic_Glob, projectile: 'laser_red', piercing: true, burn: true, desc: "Francotirador de largo alcance con láseres penetrantes.", family: 'Red_Glob' },

  'Soap_Glob': { name: 'Soap Glob', damage: 0, range: 120, speed: 0.8, cost: 60, evolution: 'Cotton_Glob', image: IMAGE_PATHS.Soap_Glob, projectile: 'blue', slow: 0.4, desc: "Lanza burbujas que ralentizan a los enemigos.", evolveDesc: "Evoluciona a Cotton Glob.", family: 'Soap_Glob' },
  'Cotton_Glob': { name: 'Cotton Glob', damage: 5, range: 140, speed: 1.0, cost: 120, image: IMAGE_PATHS.Cotton_Glob, projectile: 'blue', slow: 0.6, desc: "Glob suave que ralentiza y hace poco daño.", family: 'Soap_Glob' },

  'Ducky_Glob': { name: 'Ducky Glob', damage: 0, range: 0, speed: 0, cost: 80, evolution: 'Golden_Ducky_Glob', image: IMAGE_PATHS.Ducky_Glob, moneyGen: 30, desc: "Genera dinero cada 5 segundos.", evolveDesc: "Evoluciona a Golden Ducky.", family: 'Ducky_Glob' },
  'Golden_Ducky_Glob': { name: 'Golden Ducky Glob', damage: 0, range: 0, speed: 0, cost: 200, image: IMAGE_PATHS.Golden_Ducky_Glob, moneyGen: 80, desc: "Genera grandes cantidades de dinero.", family: 'Ducky_Glob' },

  'Comet_Glob': { name: 'Comet Glob', damage: 40, range: 160, speed: 0.8, cost: 250, evolution: 'Dark_Glob', image: IMAGE_PATHS.Comet_Glob, projectile: 'star', boomerang: true, desc: "Lanza estrellas fugaces que vuelven como boomerangs.", evolveDesc: "Evoluciona a Dark Glob.", family: 'Comet_Glob' },
  'Dark_Glob': { name: 'Dark Glob', damage: 80, range: 180, speed: 1.0, cost: 400, evolution: 'Demglob', image: IMAGE_PATHS.Dark_Glob, projectile: 'star_dark', boomerang: true, desc: "Lanza estrellas oscuras muy potentes.", evolveDesc: "Evoluciona a Demglob.", family: 'Comet_Glob' },
  'Demglob': { name: 'Demglob', damage: 200, range: 220, speed: 2.0, cost: 800, image: IMAGE_PATHS.Demglob, projectile: 'laser_purple', piercing: true, desc: "Fuego purpúreo devastador que atraviesa todo.", family: 'Comet_Glob' },

  'Pyce_Glob': { name: 'Pyce Glob', damage: 15, range: 180, speed: 4.0, cost: 250, image: IMAGE_PATHS.Pyce_Glob, projectile: 'laser_blue', unlocked: false, desc: "Ataque rápido con láseres azules.", family: 'Pyce_Glob' },
  'Old_Glob': { name: 'Old Glob', damage: 20, range: 150, speed: 1.2, cost: 150, image: IMAGE_PATHS.Old_Glob, projectile: 'split', unlocked: false, desc: "Lanza proyectiles que se dividen al impactar.", family: 'Old_Glob' },
  'Work_Bombot': { name: 'Work-Bombot', damage: 100, range: 250, speed: 0.5, cost: 1500, image: IMAGE_PATHS.Work_Bombot, projectile: 'bomb', aoe: 100, unlocked: false, desc: "Artillería pesada con gran daño en área.", family: 'Work_Bombot' }
};

const ENEMY_TYPES = {
  'Stupid_Pyce': { name: 'Stupid Pyce', health: 50, speed: 1.5, reward: 15, image: IMAGE_PATHS.Stupid_Pyce },
  'Pyce2': { name: 'Pyce2', health: 70, speed: 1.4, reward: 20, image: IMAGE_PATHS.Pyce2 },
  'Guest_Pyce': { name: 'Guest Pyce', health: 100, speed: 1.2, reward: 25, image: IMAGE_PATHS.Guest_Pyce },
  'Symbol_Pyce': { name: 'Symbol Pyce', health: 80, speed: 2.5, reward: 30, image: IMAGE_PATHS.Symbol_Pyce },
  'Noob_Pyce': { name: 'Noob Pyce', health: 120, speed: 1.0, reward: 35, image: IMAGE_PATHS.Noob_Pyce, stunAbility: true, stunCooldown: 8 },
  '4motions_Pyce': { name: '4motions Pyce', health: 200, speed: 0.8, reward: 50, image: IMAGE_PATHS['4motions_Pyce'] },
  'SO_Pyce': { name: 'Serious Outline Pyce', health: 450, speed: 0.6, reward: 80, image: IMAGE_PATHS.SO_Pyce },

  '1x1x1x1_Pyce': { name: '1x1x1x1 Pyce', health: 500, speed: 0.5, reward: 500, image: IMAGE_PATHS['1x1x1x1_Pyce'], boss: true, bossStun: true, stunCooldown: 10 },
  'NOeye_Pyce': { name: 'NOeye Pyce', health: 800, speed: 0.4, reward: 800, image: IMAGE_PATHS.NOeye_Pyce, boss: true, paralyzeLaser: true, stunCooldown: 12 },
  'MoonStar_Pyce': { name: 'MoonStar Pyce', health: 2500, speed: 0.3, reward: 2000, image: IMAGE_PATHS.MoonStar_Pyce, boss: true, shield: 0.3, doubleLap: true },

  'Stupid_GoldPyce': { name: 'Stupid GoldPyce', health: 80, speed: 2.0, reward: 150, image: IMAGE_PATHS.Stupid_GoldPyce, mimic: true }
};

const BADGES = {
  survivor: { key: 'survivor', icon: '🛡️', unlocked: false, reward: { pycoins: 100, xp: 50 } },
  millionaire: { key: 'millionaire', icon: '💰', unlocked: false, reward: { pycoins: 500, xp: 100 } },
  evolution: { key: 'evolution', icon: '🧬', unlocked: false, reward: { pycoins: 200, xp: 80 } },
  bossKiller: { key: 'bossKiller', icon: '👑', unlocked: false, reward: { duckpass: 5, xp: 150 } },
  secret: { key: 'secret', icon: '🔑', unlocked: false, reward: { pycoins: 50, xp: 30 } },
  inf100: { key: 'inf100', icon: '💯', unlocked: false, reward: { duckpass: 10, xp: 200 } },
  inf500: { key: 'inf500', icon: '🎖️', unlocked: false, reward: { duckpass: 25, xp: 500 } },
  inf999: { key: 'inf999', icon: '🌌', unlocked: false, reward: { duckpass: 50, xp: 1000 } },
  corrupt1: { key: 'corrupt1', icon: '👾', unlocked: false, reward: { pycoins: 300, xp: 150 } },
  corrupt2: { key: 'corrupt2', icon: '👾', unlocked: false, reward: { pycoins: 400, xp: 200 } },
  corrupt3: { key: 'corrupt3', icon: '👾', unlocked: false, reward: { pycoins: 500, xp: 250 } },
  corrupt4: { key: 'corrupt4', icon: '👾', unlocked: false, reward: { pycoins: 600, xp: 300 } },
  corrupt5: { key: 'corrupt5', icon: '👾', unlocked: false, reward: { duckpass: 20, xp: 500 } },
  mimic1: { key: 'mimic1', icon: '🎁', unlocked: false, reward: { pycoins: 150, xp: 50 } },
  mimic2: { key: 'mimic2', icon: '🎁', unlocked: false, reward: { pycoins: 300, xp: 100 } },
  mimic3: { key: 'mimic3', icon: '🎁', unlocked: false, reward: { pycoins: 450, xp: 150 } },
  mimic4: { key: 'mimic4', icon: '🎁', unlocked: false, reward: { duckpass: 15, xp: 300 } },
  corruptMimic: { key: 'corruptMimic', icon: '💀', unlocked: false, reward: { pycoins: 1000, xp: 500 } },
  mimicRevenge: { key: 'mimicRevenge', icon: '🔥', unlocked: false, reward: { pycoins: 500, xp: 200 } },
  antiNormal: { key: 'antiNormal', icon: '🌑', unlocked: false, reward: { duckpass: 100, xp: 2000 } }
};

const RIVER_ZONES = [
  { x: 300, y: 0, w: 60, h: 600 }, // Río vertical
  { x: 300, y: 200, w: 200, h: 60 } // Brazo de río
];

const PATH_SEGMENTS = [
  { x: 0, y: 170, w: 200, h: 60 },
  { x: 170, y: 170, w: 60, h: 200 },
  { x: 170, y: 330, w: 300, h: 60 },
  { x: 430, y: 150, w: 60, h: 240 },
  { x: 430, y: 150, w: 300, h: 60 },
  { x: 700, y: 150, w: 60, h: 200 },
  { x: 700, y: 330, w: 300, h: 60 }
];

const ENEMY_PATH = [
  { x: -30, y: 200 }, { x: 200, y: 200 }, { x: 200, y: 360 },
  { x: 460, y: 360 }, { x: 460, y: 180 }, { x: 730, y: 180 },
  { x: 730, y: 360 }, { x: 1030, y: 360 }
];

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
const SKINS_DATA = {
  'Glob': [
    { id: 'military_set', name: 'Set Militar', desc: 'Equipamiento táctico para la línea verde.', cost: 350, type: 'pycoin', 
      skins: {
        'Glob': 'img/Skins/Verde Base/Untrained Glob (SK-EVO1).png',
        'Poop_Glob': 'img/Skins/Verde Base/Militar Glob (SK-EVO2).png',
        'Golden_Glob': 'img/Skins/Verde Base/Armed Glob (SK-EVO3).png',
        'Rainbow_Glob': 'img/Skins/Verde Base/Impostor Glob (SK-EVO4).png'
      }
    }
  ],
  'Red_Glob': [
    { id: 'music_set', name: 'Set Musical', desc: '¡Ritmo y fiesta para la línea roja!', cost: 300, type: 'pycoin',
      skins: {
        'Red_Glob': 'img/Skins/Rojo Melee/Music Glob (SK-EVO1).png',
        'Molten_Glob': 'img/Skins/Rojo Melee/Party Glob (SK-EVO2).png',
        'Robotic_Glob': 'img/Skins/Rojo Melee/Funky Glob (SK-EVO3).png'
      }
    }
  ],
  'Soap_Glob': [
    { id: 'abyssal_set', name: 'Set Abismal', desc: '¡Poder de las profundidades marinas!', cost: 400, type: 'pycoin',
      skins: {
        'Soap_Glob': 'img/Skins/Azul Ralentizador/Beachy Glob (SK-EVO1).png',
        'Cotton_Glob': 'img/Skins/Azul Ralentizador/Shark Glob (SK-EVO2).png'
      }
    }
  ],
  'Global': [
    { id: 'recolor_emerald', name: 'Edición Esmeralda', desc: 'Poder de la naturaleza.', type: 'duckpass_level', level: 5, filter: 'hue-rotate(60deg) saturate(2) brightness(1.1)' },
    { id: 'recolor_ruby', name: 'Edición Rubí', desc: 'Pasión ardiente en cada disparo.', type: 'duckpass_level', level: 15, filter: 'hue-rotate(-60deg) saturate(2) brightness(1.1)' },
    { id: 'recolor_cyan', name: 'Edición Cian', desc: 'Frío como el hielo de Bitlands.', type: 'duckpass_level', level: 25, filter: 'hue-rotate(140deg) saturate(1.5) brightness(1.2)' },
    { id: 'recolor_neon', name: 'Edición Neón', desc: 'Brillo cibernético futurista.', type: 'duckpass_level', level: 40, filter: 'brightness(1.5) saturate(3) hue-rotate(150deg)' },
    { id: 'recolor_shadow', name: 'Edición Sombra', desc: 'Sigilo y oscuridad total.', type: 'duckpass_level', level: 55, filter: 'grayscale(1) brightness(0.4)' },
    { id: 'recolor_void', name: 'Edición Vacío', desc: 'Poder oscuro del abismo.', type: 'duckpass_level', level: 70, filter: 'brightness(0.6) hue-rotate(250deg) saturate(2)' },
    { id: 'recolor_gold', name: 'Edición Oro', desc: 'Puro lujo para tus torres.', type: 'duckpass_level', level: 85, filter: 'brightness(1.2) sepia(1) saturate(10) hue-rotate(-10deg)' },
    { id: 'pack_negative', name: 'Pack Negativo', desc: 'Invierte la realidad de tus torres.', type: 'duckpass_level', level: 95, class: 'skin-negative' },
    { id: 'pack_rainbow', name: 'Pack Arcoíris', desc: '¡Fiesta de colores definitiva!', type: 'duckpass_level', level: 100, class: 'skin-rainbow' }
  ],
  'Recolors': [
    { id: 'recolor_galactic', name: 'Edición Galáctica', desc: 'Brillo cósmico de Bitlands.', cost: 250, type: 'pycoin', filter: 'hue-rotate(280deg) saturate(2.5) brightness(1.1) drop-shadow(0 0 5px #9c27b0)' },
    { id: 'recolor_fire', name: 'Edición Ígnea', desc: 'Calor volcánico en tus manos.', cost: 200, type: 'pycoin', filter: 'hue-rotate(-30deg) saturate(4) contrast(1.2) brightness(0.9)' },
    { id: 'recolor_diamond', name: 'Edición Diamante', desc: 'Resistencia y brillo cristalino.', cost: 300, type: 'pycoin', filter: 'brightness(1.8) saturate(0.2) contrast(1.5) opacity(0.9)' },
    { id: 'recolor_toxic', name: 'Edición Tóxica', desc: 'Peligro radiactivo inminente.', cost: 180, type: 'pycoin', filter: 'hue-rotate(80deg) saturate(5) brightness(1.2) contrast(1.1)' }
  ]
};

generateSpots();

let gameState = {
  health: 100, money: 350, wave: 0,
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
  muted: false
};

// ===================== MOTOR DEL JUEGO =====================

function init() {
  console.log("Iniciando Glob Defenders...");
  try {
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
    muted: gameState.muted
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
        // Opcional: localStorage.removeItem('glob_progress'); // Mantener por seguridad de momento
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
      gameState.globetines = progress.globetines != null ? progress.globetines : 500;
      gameState.pycoins = progress.pycoins || 0;
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
      updateMuteButton();
      if (gameState.unlockedAntiNormal) BADGES.antiNormal.unlocked = true;
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

      // Interactividad con sonidos
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
  if (btn) {
    btn.textContent = gameState.muted ? '🔇' : '🔊';
  }
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
      loadProgress(savedName); // Carga previa para saber si es "Maestro del Vacío"
    }
  } catch (e) { console.warn("LocalStorage no disponible"); }
}

function handleLogin() {
  console.log("Intentando login...");
  const nameInput = document.getElementById('username-input');
  const passInput = document.getElementById('password-input');

  const name = nameInput ? nameInput.value.trim() : "";
  const password = passInput ? passInput.value : "";

  // Intentar cargar progreso si el nombre cambia antes de dar a login
  if (name) loadProgress(name);

  if (!name || !password) {
    const msgEl = document.getElementById('login-msg');
    if (msgEl) msgEl.textContent = translate('loginError');
    return;
  }

  if (USERS[name]) {
    // Usuario existente, verificar contraseña
    if (USERS[name] !== password) {
      const msgEl = document.getElementById('login-msg');
      if (msgEl) msgEl.textContent = translate('loginError');
      return;
    }
  } else {
    // NUEVO: Registro automático de usuario
    USERS[name] = password;
    saveUsers(); 
    showMessage("¡Nuevo usuario registrado!", 'success');
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

  // Si es Admin, activar modo admin visual
  if (name === "Admin" || name === "KirByteBi") {
    gameState.adminMode = true;
    document.getElementById('admin-indicator').style.display = 'block';
  }

  // Activar estado Glitch / Anti-Normal (solo si no se ha pasado ya)
  if (!gameState.unlockedAntiNormal) {
    gameState.antiNormalActive = true;
    modeScreen.classList.add('glitch-state');
    showMessage("S1S73M4 1N574BL3...", 'error');
  }

  // Bloquear modo infinito si no está desbloqueado
  const infBtn = document.querySelector('.mode-btn[data-mode="infinito"]');
  if (infBtn) {
    if (!gameState.unlockedInfinite && name !== "Admin" && name !== "KirByteBi") {
      infBtn.disabled = true;
      infBtn.title = "Gana en modo Difícil o superior para desbloquear";
      infBtn.style.opacity = "0.5";
    } else {
      infBtn.disabled = false;
      infBtn.style.opacity = "1";
    }
  }
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
    showMessage("M0D0 4N71-N0RM4L 4C71V4D0", 'error');
  }

  document.getElementById('mode-selection').style.display = 'none';
  document.getElementById('mode-selection').classList.remove('glitch-state');
  showMessage(`Modo ${mode.toUpperCase()} seleccionado`, 'info');
}

function triggerCorrupt() {
  gameState.healthClicks++;
  if (gameState.healthClicks >= 7 && !gameState.corrupt) {
    gameState.corrupt = true;
    gameState.maxWaves = 45;
    gameState.mode = 'corrupto';
    document.getElementById('game-area').classList.add('corrupt');
    showMessage("¡SISTEMA CORRUPTO ACTIVADO!", 'error');
    drawBadges(); // Para mostrar logros corruptos
  }
}

function createMap() {
  const map = document.getElementById('map');
  map.innerHTML = '';

  // Ríos
  RIVER_ZONES.forEach(r => {
    const el = document.createElement('div');
    el.className = 'river';
    el.style.left = `${r.x}px`; el.style.top = `${r.y}px`;
    el.style.width = `${r.w}px`; el.style.height = `${r.h}px`;
    map.appendChild(el);
  });

  // Caminos
  PATH_SEGMENTS.forEach(p => {
    const el = document.createElement('div');
    el.className = 'path-segment';
    el.style.left = `${p.x}px`; el.style.top = `${p.y}px`;
    el.style.width = `${p.w}px`; el.style.height = `${p.h}px`;
    map.appendChild(el);
  });

  // Spots
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
    // Mostrar la imagen con la skin equipada si existe
    const displayImg = getTowerImage(type);
    el.innerHTML = `
      <div class="tower-icon-shop" style="background-image: url('${displayImg}')"></div>
      <div class="tower-name">${t.name}</div>
      <div class="tower-cost">💰 ${t.cost}</div>
    `;
    shop.appendChild(el);
  });
}

function drawBadges() {
  const list = document.getElementById('badges-list');
  if (!list) return;
  list.innerHTML = '';
  Object.values(BADGES).forEach(b => {
    // Si está desbloqueado pero no se ha cobrado el premio, cobrarlo ahora
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

function grantBadgeReward(badge) {
  if (gameState.claimedRewards.includes(badge.key)) return; // No cobrar dos veces
  
  if (badge.reward.pycoins) gameState.pycoins += badge.reward.pycoins;
  if (badge.reward.duckpass) gameState.duckPassCurrency += badge.reward.duckpass;
  addXP(badge.reward.xp);
  
  gameState.claimedRewards.push(badge.key); // Registrar como cobrado
  updateMetaUI();
  saveProgress();
  showMessage(`¡Logro: ${translate('badge_'+badge.key+'_name')}! Recompensa recibida.`, 'success');
}
function toggleLanguage() {
  currentLanguage = currentLanguage === 'es' ? 'en' : 'es';
  try {
    updateLanguage();
    drawTowerShop();
    drawBadges();
  } catch (e) {
    console.error("Error in toggleLanguage:", e);
  }
}

function bindEvents() {
  document.getElementById('login-btn').onclick = handleLogin;

  const nameInput = document.getElementById('username-input');
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      const name = nameInput.value.trim();
      if (name) loadProgress(name);
      updateMetaUI(); // Para reflejar monedas si el logo da dinero
    });
  }

  const logo = document.querySelector('.login-logo');
  if (logo) {
    logo.onclick = () => {
      gameState.logoClicks++;
      if (gameState.unlockedAntiNormal) {
        gameState.pycoins += 1;
        updateMetaUI();
        showEffect(window.innerWidth/2, window.innerHeight/2, "+1 PyCoin");
        logo.style.transform = `scale(1.1) rotate(${Math.random()*10 - 5}deg)`;
        setTimeout(() => logo.style.transform = `scale(1) rotate(0deg)`, 100);
        saveProgress(); // Guardar cada clic
      } else {
        if (gameState.logoClicks === 5) showMessage("¿Por qué pulsas el logo?", 'info');
        if (gameState.logoClicks === 10) showMessage("¡¡¡DEJA DE PULSAR EL DICHOSO LOGO!!!", 'error');
        if (gameState.logoClicks > 15) logo.style.transform = `scale(${1 + (gameState.logoClicks-15)*0.1}) rotate(${gameState.logoClicks}deg)`;
      }
    };
  }


  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.onclick = () => selectMode(btn.dataset.mode);
  });

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
      if (!gameState.towerSpots[id].occupied) {
        placeTower(id, gameState.selectedTowerType);
      }
    }
  };

  document.getElementById('apply-code').onclick = () => {
    const input = document.getElementById('game-code');
    const code = input.value.trim().toUpperCase();
    if (!code) return;

    if (gameState.usedCodes[code]) {
      showMessage("¡Código ya usado!", 'warning');
      input.value = '';
      return;
    }

    let valid = false;
    if (code === 'GL0B_CL1CKER') {
      gameState.pycoins += 100;
      BADGES.secret.unlocked = true;
      showMessage(translate('codeSuccess', { name: '100 PyCoins' }), 'success');
      valid = true;
    } else if (code === 'B1TL4NDS') {
      gameState.pycoins += 50;
      addXP(150);
      showMessage(translate('codeSuccess', { name: '50 PyCoins + 150 XP' }), 'success');
      valid = true;
    } else if (code === 'GLOBFNF') {
      gameState.pycoins += 76;
      addXP(150);
      showMessage(translate('codeSuccess', { name: '76 PyCoins + 150 XP' }), 'success');
      valid = true;
    } else if (code === 'PINKWAVE') {
      gameState.pycoins += 30;
      gameState.duckPassCurrency += 30;
      showMessage(translate('codeSuccess', { name: '30 PyCoins + 30 DuckPass' }), 'success');
      valid = true;
    } else if (code === 'B4D_P1GG13S') {
      gameState.pycoins += 50;
      gameState.duckPassCurrency += 5;
      showMessage(translate('codeSuccess', { name: '50 PyCoins + 5 DuckPass' }), 'success');
      valid = true;
    } else if (code === 'MUSICFAN') {
      gameState.pycoins += 50;
      addXP(10);
      showMessage(translate('codeSuccess', { name: '50 PyCoins + 10 XP' }), 'success');
      valid = true;
    } else if (code === 'T3CHSP4WN') {
      gameState.pycoins += 50;
      addXP(150);
      showMessage(translate('codeSuccess', { name: '50 PyCoins + 150 XP' }), 'success');
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
        showMessage("¿Estás perdido? Prueba con B4D_P1GG13S", 'info');
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

  document.getElementById('open-shop').onclick = () => openShop();
  document.getElementById('open-pass').onclick = () => openPass();

  // Touch support para móvil
  document.getElementById('map').addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const spotEl = document.elementFromPoint(touch.clientX, touch.clientY)?.closest?.('.tower-spot');
    if (spotEl && gameState.selectedTowerType) {
      const id = spotEl.dataset.id;
      if (!gameState.towerSpots[id].occupied) {
        placeTower(id, gameState.selectedTowerType);
      }
    }
  }, { passive: false });

  // Recalcular escala al cambiar tamaño de ventana
  window.addEventListener('resize', applyScale);
  window.addEventListener('orientationchange', applyScale);
}

function openShop() {
  closeModal('pass-modal'); // Cerrar el pase si está abierto
  document.getElementById('shop-modal').style.display = 'flex';
  drawShop();
}

function openPass() {
  closeModal('shop-modal'); // Cerrar la tienda si está abierta
  document.getElementById('pass-modal').style.display = 'flex';
  drawPass();
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

// Cierre inteligente: vuelve al juego si estás en partida, sino a selección de modo
function smartClose(modalId) {
  closeModal(modalId);
  const loginScreen = document.getElementById('login-screen');
  const modeScreen = document.getElementById('mode-selection');
  const inGame = loginScreen.style.display === 'none' && modeScreen.style.display === 'none';
  if (!inGame) {
    modeScreen.style.display = 'flex';
  }
}

function backToModes() {
  closeModal('shop-modal');
  closeModal('pass-modal');
  document.getElementById('mode-selection').style.display = 'flex';
}

// ===================== SISTEMA DE ESCALA RESPONSIVA =====================

const GAME_DESIGN_W = 1000;
const GAME_DESIGN_H = 600;

function getGameScale() {
  const bodyPad = parseInt(getComputedStyle(document.body).paddingLeft) * 2 || 40;
  const availW = Math.min(window.innerWidth - bodyPad, GAME_DESIGN_W);
  const scale = availW / GAME_DESIGN_W;
  return Math.min(scale, 1.0); // Nunca más del 100%
}

function applyScale() {
  const area = document.getElementById('game-area');
  const wrapper = document.querySelector('.game-scale-wrapper');
  if (!area || !wrapper) return;

  const scale = getGameScale();
  area.style.transform = `scale(${scale})`;
  area.style.transformOrigin = 'top left';

  // Ajustar la altura del wrapper para que el contenido de abajo no quede con espacio de más
  const scaledH = Math.round(GAME_DESIGN_H * scale);
  wrapper.style.setProperty('--scaled-game-h', scaledH + 'px');
  wrapper.style.height = scaledH + 'px';
}

function addXP(amount) {
  gameState.duckPassXP += amount;
  while (gameState.duckPassXP >= 100) {
    gameState.duckPassLevel++;
    gameState.duckPassXP -= 100;

    // Recompensa por nivel
    if (gameState.duckPassLevel <= 100) {
      gameState.duckPassCurrency++;
      showMessage(`¡Nivel ${gameState.duckPassLevel} del Duck Pass! +1 Ducky Pass`, 'success');
    } else {
      // Recompensas infinitas cada 5 niveles después del 100
      if (gameState.duckPassLevel % 5 === 0) {
        gameState.duckPassCurrency += 2;
        showMessage(`¡Prestigio Duck Pass! +2 Ducky Pass`, 'success');
      }
    }
    saveProgress();
  }
  updateMetaUI();
}

function unlockBadge(key) {
  if (BADGES[key] && !BADGES[key].unlocked) {
    BADGES[key].unlocked = true;
    drawBadges(); // Esto disparará grantBadgeReward automáticamente
    saveProgress();
    showMessage(`¡Logro Desbloqueado: ${translate('badge_' + key + '_name')}!`, 'success');
  }
}

function updateMetaUI() {
  const pycoinsEl = document.getElementById('pycoins-value');
  const duckpassEl = document.getElementById('duckpass-currency');
  
  if (pycoinsEl) pycoinsEl.textContent = Math.floor(gameState.pycoins);
  if (duckpassEl) duckpassEl.textContent = gameState.duckPassCurrency;

  const passModal = document.getElementById('pass-modal');
  if (passModal && passModal.style.display === 'flex') {
    const levelEl = document.getElementById('pass-level');
    const xpEl = document.getElementById('pass-xp');
    const fillEl = document.getElementById('xp-fill');
    
    if (levelEl) levelEl.textContent = gameState.duckPassLevel;
    if (xpEl) xpEl.textContent = gameState.duckPassXP;
    if (fillEl) fillEl.style.width = `${gameState.duckPassXP}%`;
  }
}

function drawShop() {
  const container = document.getElementById('shop-items');
  if (!container) return;
  container.innerHTML = '';

  // Mostrar Saldo Actual en la tienda (Uso Ducky_Glob.png como fallback si Duckpass no existe)
  const balanceHTML = `
    <div class="shop-balance">
      <div class="balance-item">
        <img src="img/Tokens/PyCoin.png" width="20"> <span>${Math.floor(gameState.pycoins)} PyCoins</span>
      </div>
      <div class="balance-item">
        <img src="img/Tokens/DuckPass.png" width="20"> <span>${gameState.duckPassCurrency} Duck Pass</span>
      </div>
    </div>
  `;
  container.innerHTML = balanceHTML;

  if (currentShopTab === 'upgrades') {
    const upgrades = [
      { id: 'hp', name: 'Salud de Base', desc: '+20 Salud Máxima', cost: 50, type: 'pycoin' }
    ];

    if (gameState.towerLimits['Glob'] < 7) {
      upgrades.push({ id: 'limit_Glob', name: 'Límite: Glob Verde', desc: 'Aumenta límite a ' + (gameState.towerLimits['Glob'] + 1), cost: 30, type: 'pycoin' });
    }
    if (gameState.towerLimits['Red_Glob'] < 10) {
      upgrades.push({ id: 'limit_Red_Glob', name: 'Límite: Glob Rojo', desc: 'Aumenta límite a ' + (gameState.towerLimits['Red_Glob'] + 1), cost: 40, type: 'pycoin' });
    }
    if (gameState.towerLimits['Ducky_Glob'] < 5) {
      upgrades.push({ id: 'limit_Ducky_Glob', name: 'Límite: Ducky Glob', desc: 'Aumenta límite a ' + (gameState.towerLimits['Ducky_Glob'] + 1), cost: 60, type: 'pycoin' });
    }

    upgrades.push({ id: 'unlock_Pyce_Glob', name: 'Desbloquear Pyce Glob', desc: 'Permite comprar Pyce Globs', cost: 100, type: 'pycoin', hideIfUnlocked: true });

    upgrades.forEach(u => {
      if (u.hideIfUnlocked && TOWER_TYPES['Pyce_Glob'].unlocked) return;

      const el = document.createElement('div');
      el.className = 'meta-item';
      el.innerHTML = `
        <h3>${u.name}</h3>
        <p>${u.desc}</p>
        <div class="cost"><img src="${u.type === 'pycoin' ? 'img/Tokens/PyCoin.png' : 'img/Tokens/Globetin.png'}" width="15"> ${u.cost}</div>
        <button class="meta-buy-btn" ${canAfford(u) ? '' : 'disabled'} onclick="buyUpgrade('${u.id}', ${u.cost}, '${u.type}')">Comprar</button>
      `;
      container.appendChild(el);
    });
  } else {
    // Pestaña de Skins
    Object.keys(SKINS_DATA).forEach(family => {
      // Ocultar la categoría 'Global' (Skins del Pase) de la tienda normal
      if (family === 'Global') return;

      SKINS_DATA[family].forEach(skin => {
        const isUnlocked = gameState.unlockedSkins.includes(skin.id) || 
                          (skin.type === 'duckpass_level' && gameState.duckPassLevel >= skin.level);
        const isEquipped = gameState.equippedSkins[family] === skin.id;

        const el = document.createElement('div');
        el.className = `skin-item ${isEquipped ? 'equipped' : ''}`;
        
        let btnText = "Equipar";
        let btnAction = `equipSkin('${family}', '${skin.id}')`;
        let btnDisabled = !isUnlocked;

        if (!isUnlocked) {
          btnText = `Comprar (${skin.cost} PyCoins)`;
          btnAction = `buySkin('${family}', '${skin.id}', ${skin.cost})`;
          btnDisabled = gameState.pycoins < skin.cost;
        } else if (isEquipped) {
          btnText = "Seleccionada";
          btnAction = "";
          btnDisabled = true; // No hace falta desequipar si es la única de su familia
        }

        let previewImg = 'img/Glob_DEF.png';
        if (skin.skins) previewImg = skin.skins[family] || Object.values(skin.skins)[0];
        else if (family === 'Recolors' || family === 'Global') previewImg = 'img/Glob_DEF.png';

        el.innerHTML = `
          ${isEquipped ? '<div class="equipped-tag">ACTUAL</div>' : ''}
          <div class="skin-preview ${skin.class || ''}">
            <img src="${previewImg}" style="width:100%; height:100%; object-fit:contain; ${skin.filter ? 'filter:' + skin.filter : ''}" alt="${skin.name}">
          </div>
          <h3>${skin.name}</h3>
          <p>${skin.desc}</p>
          <button class="skin-buy-btn ${isUnlocked ? 'equip' : ''}" ${btnDisabled ? 'disabled' : ''} onclick="${btnAction}">${btnText}</button>
        `;
        container.appendChild(el);
      });
    });
  }
}

let currentShopTab = 'upgrades';
function switchShopTab(tab) {
  currentShopTab = tab;
  // Actualizar clases de pestañas
  const tabs = document.querySelectorAll('.shop-tab');
  tabs.forEach(btn => {
    const isThisTab = (tab === 'upgrades' && btn.textContent.includes('Mejoras')) || 
                      (tab === 'skins' && btn.textContent.includes('Skins'));
    btn.classList.toggle('active', isThisTab);
  });
  drawShop();
}

function buySkin(family, skinId, cost) {
  if (gameState.pycoins >= cost) {
    gameState.pycoins -= cost;
    gameState.unlockedSkins.push(skinId);
    updateMetaUI();
    drawShop();
    saveProgress();
    showMessage("¡Skin desbloqueada!", 'success');
  } else {
    showMessage("No tienes suficientes PyCoins", 'error');
  }
}

function equipSkin(family, skinId) {
  gameState.equippedSkins[family] = skinId;
  gameState.towers.forEach(t => {
    if (t.family === family || family === 'Global') {
      t.el.style.backgroundImage = `url('${getTowerImage(t.type)}')`;
      applyTowerEffects(t.el, t.type);
    }
  });
  showMessage("Apariencia actualizada", 'success');
  if (currentShopTab === 'skins') drawShop();
  if (document.getElementById('pass-modal').style.display === 'flex') drawPass();
  saveProgress();
}

function canAfford(u) {
  if (u.type === 'pycoin') return gameState.pycoins >= u.cost;
  return gameState.duckPassCurrency >= u.cost;
}

function buyUpgrade(id, cost, type) {
  if (type === 'pycoin') {
    if (gameState.pycoins < cost) return;
    gameState.pycoins -= cost;
  } else {
    if (gameState.duckPassCurrency < cost) return;
    gameState.duckPassCurrency -= cost;
  }

  if (id === 'hp') {
    gameState.baseHealthLevel++;
    gameState.health += 20;
    showMessage("¡Salud de base mejorada!", 'success');
  } else if (id.startsWith('limit_')) {
    const tType = id.replace('limit_', '');
    gameState.towerLimits[tType]++;
    showMessage(`¡Límite de ${tType} aumentado!`, 'success');
  } else if (id === 'unlock_Pyce_Glob') {
    TOWER_TYPES['Pyce_Glob'].unlocked = true;
    showMessage("¡Pyce Glob desbloqueado!", 'success');
  }

  updateMetaUI();
  drawShop();
  drawTowerShop();
  saveProgress();
}

function drawPass() {
  const container = document.getElementById('pass-rewards');
  if (!container) return;
  container.innerHTML = '';

  // Hitos importantes (Skins del Pase) ordenados por nivel
  const milestones = [...SKINS_DATA['Global']].sort((a, b) => a.level - b.level);

  milestones.forEach(skin => {
    const isUnlocked = gameState.duckPassLevel >= skin.level;
    const isEquipped = gameState.equippedSkins['Global'] === skin.id;

    const el = document.createElement('div');
    el.className = `meta-item ${isUnlocked ? 'unlocked' : 'locked'}`;
    
    let btnHTML = '';
    if (isUnlocked) {
      if (isEquipped) btnHTML = `<button class="skin-buy-btn" disabled>Equipado</button>`;
      else btnHTML = `<button class="skin-buy-btn equip" onclick="equipSkin('Global', '${skin.id}')">Equipar</button>`;
    } else {
      btnHTML = `<button class="skin-buy-btn" disabled>Nivel ${skin.level} Requerido</button>`;
    }

    el.innerHTML = `
      <div class="milestone-tag">HITO</div>
      <h3>${skin.name}</h3>
      <p>${skin.desc}</p>
      <div class="skin-preview ${skin.class || ''}" style="width: 40px; height: 40px; ${skin.filter ? 'filter:' + skin.filter : ''}; background-image: url('img/Glob_DEF.png')"></div>
      ${btnHTML}
    `;
    container.appendChild(el);
  });

  // Mostrar solo el SIGUIENTE nivel genérico
  const nextLevel = gameState.duckPassLevel + 1;
  if (!milestones.some(m => m.level === nextLevel)) {
    const el = document.createElement('div');
    el.className = 'meta-item locked';
    el.innerHTML = `
      <h3>Siguiente: Nivel ${nextLevel}</h3>
      <p>Recompensa: +1 Ducky Pass</p>
      <div class="xp-bar-bg"><div style="width: 0%" class="xp-bar-fill"></div></div>
    `;
    container.appendChild(el);
  }
}

function placeTower(spotId, type) {
  const tCfg = TOWER_TYPES[type];

  // Verificar límites por tipo
  const currentCount = gameState.towerCounts[type] || 0;
  const limit = gameState.towerLimits[type] || 99;
  if (currentCount >= limit) {
    showMessage(`¡Límite alcanzado para ${tCfg.name}! (Máx: ${limit})`, 'error');
    return;
  }

  if (gameState.globetines < tCfg.cost) {
    showMessage(translate('notEnoughMoney'), 'error');
    return;
  }

  const spot = gameState.towerSpots[spotId];
  const el = document.createElement('div');
  el.className = 'tower';
  el.style.left = `${spot.x}px`; el.style.top = `${spot.y}px`;
  el.style.backgroundImage = `url('${getTowerImage(type)}')`;
  applyTowerEffects(el, type);
  document.getElementById('map').appendChild(el);

  const towerObj = {
    ...tCfg, type: type, x: spot.x, y: spot.y, el,
    cooldown: 0, spotId, level: 1,
    stunned: 0, moneyTimer: 0
  };

  el.onclick = (e) => {
    e.stopPropagation();
    selectTower(towerObj);
  };

  gameState.towers.push(towerObj);
  gameState.globetines -= tCfg.cost;
  gameState.towerCounts[type] = (gameState.towerCounts[type] || 0) + 1;
  spot.occupied = true;
  updateUI();
  showMessage(translate('towerPlaced', { name: tCfg.name }), 'success');
}

function updateEvolveButtons(t) {
  const container = document.getElementById('evolve-options');
  container.innerHTML = '';
  const towerData = TOWER_TYPES[t.type];

  if (towerData.evolution) {
    const next = TOWER_TYPES[towerData.evolution];
    const btn = document.createElement('button');
    btn.className = 'evolve-btn';
    btn.disabled = gameState.money < next.cost;
    btn.innerHTML = `${currentLanguage === 'es' ? 'Evolucionar' : 'Evolve'} a ${next.name} <br> (💰 ${next.cost})`;
    btn.onclick = () => evolveTower(t, towerData.evolution);
    container.appendChild(btn);
  }

  const sellBtn = document.getElementById('sell-tower-btn');
  sellBtn.onclick = () => sellTower(t);
  sellBtn.innerHTML = `${currentLanguage === 'es' ? 'Vender' : 'Sell'} (💰 ${Math.floor(towerData.cost * 0.7)})`;
}

function evolveTower(tower, nextType) {
  const nextCfg = TOWER_TYPES[nextType];

  // Verificar límites para la evolución (solo si cambia el tipo base significativamente)
  // En este juego las evoluciones suelen mantener el tipo base pero si cambiara se chequearía aquí.

  if (gameState.globetines >= nextCfg.cost) {
    gameState.globetines -= nextCfg.cost;

    // Si el tipo cambia, actualizar conteos
    if (tower.type !== nextType) {
      gameState.towerCounts[tower.type]--;
      gameState.towerCounts[nextType] = (gameState.towerCounts[nextType] || 0) + 1;
    }

    // Limpiar propiedades de la fase anterior para evitar "herencia" de evolución
    const baseProps = ['evolution', 'evolveDesc', 'burn', 'slow', 'piercing', 'aoe', 'moneyGen', 'melee'];
    baseProps.forEach(p => delete tower[p]);

    tower.type = nextType;
    Object.assign(tower, nextCfg);
    tower.el.style.backgroundImage = `url('${getTowerImage(nextType)}')`;
    applyTowerEffects(tower.el, nextType);
    tower.level++;
    if (!nextCfg.evolution) BADGES.evolution.unlocked = true;
    selectTower(tower);
    updateUI();
    drawBadges();
    showMessage(translate('towerEvolved', { name: nextCfg.name }), 'success');
  }
}

function sellTower(tower) {
  const idx = gameState.towers.indexOf(tower);
  if (idx !== -1) {
    gameState.globetines += Math.floor(tower.cost * 0.7);
    tower.el.remove();
    gameState.towerCounts[tower.type]--;
    gameState.towerSpots[tower.spotId].occupied = false;
    gameState.towers.splice(idx, 1);
    deselectTower();
    updateUI();
    showMessage(translate('towerSold', { price: Math.floor(tower.cost * 0.7) }), 'info');
  }
}

function startWave() {
  if (gameState.waveActive || gameState.gameOver) return;

  // Final de partida por oleada (excepto infinito)
  if (gameState.mode !== 'infinito' && gameState.wave >= gameState.maxWaves) {
    if (gameState.mode === 'antiNormal') {
      gameState.pycoins += 250;
      gameState.duckPassCurrency += 45;
      addXP(300);
      gameState.unlockedAntiNormal = true;
      BADGES.antiNormal.unlocked = true;
      showMessage("¡S1S73M4 PURI4F1C4D0! +250 PyCoins +45 DuckPass", 'success');
      gameState.antiNormalActive = false;
    }

    if (gameState.mode === 'dificil' || gameState.mode === 'extremo' || gameState.mode === 'corrupto') {
      gameState.unlockedInfinite = true;
    }

    if (gameState.corrupt) {
      gameState.corruptWins++;
      if (gameState.corruptWins >= 1) BADGES.corrupt1.unlocked = true;
      if (gameState.corruptWins >= 2) BADGES.corrupt2.unlocked = true;
      if (gameState.corruptWins >= 3) BADGES.corrupt3.unlocked = true;
      if (gameState.corruptWins >= 4) BADGES.corrupt4.unlocked = true;
      if (gameState.corruptWins >= 5) BADGES.corrupt5.unlocked = true;
    }
    saveProgress();
    drawBadges();
    showMessage("¡HAS GANADO LA GUERRA!", 'success');
    return;
  }

  gameState.waveActive = true;
  gameState.wave++;

  // Badge infinito
  if (gameState.mode === 'infinito') {
    if (gameState.wave >= 100) BADGES.inf100.unlocked = true;
    if (gameState.wave >= 500) BADGES.inf500.unlocked = true;
    if (gameState.wave >= 999) BADGES.inf999.unlocked = true;
    drawBadges();
  }

  updateUI();
  showMessage(translate('waveStarted', { wave: Math.min(999, gameState.wave) }), 'info');

  let count = 5 + gameState.wave * 2;
  let spawned = 0;
  gameState.bossSpawnedInWave = false;

  const interval = setInterval(() => {
    let type = null;
    let isBoss = false;

    // Jefes especiales por modo
    if (gameState.mode === 'extremo') {
      if (gameState.wave === 40 && !gameState.bossSpawnedInWave) {
        type = 'NOeye_Pyce'; isBoss = true; gameState.bossSpawnedInWave = true;
        const msg = currentLanguage === 'es' ? "3L F1N H4 LL3G4D0." : "7H3 3ND 1S H3R3.";
        showNarrator('noeye', msg);
      } else if (gameState.wave % 10 === 0 && !gameState.bossSpawnedInWave) {
        type = '1x1x1x1_Pyce'; isBoss = true; gameState.bossSpawnedInWave = true;
      }
    } else if (gameState.mode === 'corrupto') {
      if (gameState.wave === 45 && !gameState.bossSpawnedInWave) {
        type = 'MoonStar_Pyce'; isBoss = true; gameState.bossSpawnedInWave = true;
        const msgB = currentLanguage === 'es' ? "Dicen que los magos Pyces suelen acabar mal parados." : "They say Pyce magicians usually end up badly.";
        const msgM = currentLanguage === 'es' ? "Vuestro esfuerzo es loable, pero el destino ya ha sido escrito por las estrellas." : "Your effort is laudable, but fate has already been written by the stars.";
        showNarrator('bombot', msgB);
        setTimeout(() => showNarrator('moonstar', msgM), 4500);
      } else if (gameState.wave === 15 && !gameState.bossSpawnedInWave) {
        type = '1x1x1x1_Pyce'; isBoss = true; gameState.bossSpawnedInWave = true;
      } else if (gameState.wave === 30 && !gameState.bossSpawnedInWave) {
        type = 'NOeye_Pyce'; isBoss = true; gameState.bossSpawnedInWave = true;
        const msg = currentLanguage === 'es' ? "L4 C0RRUPC10N 3S 1N3V1T4BL3." : "C0RRUP710N 1S 1N3V174BL3.";
        showNarrator('noeye', msg);
      }
    } else if (gameState.mode === 'antiNormal') {
      if (gameState.wave === 20 && !gameState.bossSpawnedInWave) {
        type = 'NOeye_Pyce'; isBoss = true; gameState.bossSpawnedInWave = true;
        showNarrator('noeye', "3S73 3S 3L F1N D3 7U R34L1D4D.");
      } else if (gameState.wave === 10 && !gameState.bossSpawnedInWave) {
        type = '1x1x1x1_Pyce'; isBoss = true; gameState.bossSpawnedInWave = true;
      }
    } else {
      const bossInterval = (gameState.mode === 'infinito') ? 15 : 10;
      if (gameState.wave % bossInterval === 0 && !gameState.bossSpawnedInWave) {
        type = '1x1x1x1_Pyce'; isBoss = true; gameState.bossSpawnedInWave = true;
      }
    }

    if (spawned === 0) {
      if (gameState.wave === 5) showNarrator('bombot', "Los siguientes enemigos atacan con una espada. ¡Cuidado!");
      if (gameState.wave === 8) showNarrator('glob', "¡Oh no... Aquí vienen los disparadores!");
      if (gameState.wave === 12) showNarrator('bombot', "¿Un símbolo? Ah no, es un enemigo más.");

      if (gameState.wave % 5 === 0 && gameState.wave > 12) {
        const char = ['bombot', 'glob', 'pyce2'][Math.floor(Math.random() * 3)];
        showNarrator(char);
      } else if (Math.random() < 0.2) {
        showNarrator('stupid');
      }
    }

    spawnEnemy(type, isBoss);
    spawned++;
    if (spawned >= count) clearInterval(interval);
  }, 1000);
}

function spawnEnemy(type, isBoss = false) {
  if (!type) {
    const types = Object.keys(ENEMY_TYPES).filter(t => t !== 'Stupid_GoldPyce');
    if (gameState.wave > 15) type = types[Math.floor(Math.random() * types.length)];
    else if (gameState.wave > 8) type = types[Math.floor(Math.random() * 4)];
    else if (gameState.wave > 3) type = types[Math.floor(Math.random() * 2)];
    else type = 'Stupid_Pyce';

    // Mimic Raro (1% - Reducido drásticamente)
    if (Math.random() < 0.01) {
      type = 'Stupid_GoldPyce';
      showNarrator('mimic');
    }
  }

  const t = ENEMY_TYPES[type];

  // Racha de Mimics
  if (t.mimic) {
    BADGES.mimic1.unlocked = true;
    gameState.consecutiveMimics++;
    if (gameState.consecutiveMimics >= 2) BADGES.mimic2.unlocked = true;
    if (gameState.consecutiveMimics >= 3) BADGES.mimic3.unlocked = true;
    if (gameState.consecutiveMimics >= 4) BADGES.mimic4.unlocked = true;
    saveProgress();
    drawBadges();
  } else {
    gameState.consecutiveMimics = 0;
  }

  const el = document.createElement('div');
  el.className = 'enemy';
  if (t.boss) el.classList.add('boss');
  el.style.backgroundImage = `url('${t.image}')`;

  // Barra de vida
  const hpBg = document.createElement('div');
  hpBg.className = 'hp-bar-bg';
  const hpFill = document.createElement('div');
  hpFill.className = 'hp-bar-fill';
  hpBg.appendChild(hpFill);
  el.appendChild(hpBg);

  if (gameState.corrupt) {
    const isPink = Math.random() > 0.5;
    el.classList.add(isPink ? 'corrupt-pink' : 'corrupt-green');
    if (t.mimic) BADGES.corruptMimic.unlocked = true;
  }

  if (isBoss && gameState.corrupt && gameState.wave === 45) {
    el.classList.add('boss-rainbow', 'shielded');
  }

  document.getElementById('game-area').appendChild(el);

  const enemy = {
    ...t, el, x: ENEMY_PATH[0].x, y: ENEMY_PATH[0].y,
    pathIndex: 0,
    health: t.health * (1 + gameState.wave * 0.15),
    maxHealth: t.health * (1 + gameState.wave * 0.15),
    stunTimer: 0, burnTimer: 0, slowAmount: 1,
    boss: isBoss,
    shield: t.shield || ((isBoss && gameState.corrupt && gameState.wave === 45) ? 0.4 : 1),
    type: type,
    laps: 0,
    hpFill: hpFill
  };

  gameState.enemies.push(enemy);
}

function gameLoop() {
  if (gameState.gameOver) return;

  const deltaTime = 1 / 60;

  // Efecto visual Anti-Normal (Parpadeo Negativo)
  if (gameState.mode === 'antiNormal' && Math.random() < 0.02) {
    document.getElementById('game-area').classList.toggle('skin-negative');
    setTimeout(() => document.getElementById('game-area').classList.remove('skin-negative'), 50);
  }

  try {
    // Actualizar Enemigos (Bucle invertido para splice seguro)
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
      const e = gameState.enemies[i];

      // Movimiento
      const nextPt = ENEMY_PATH[e.pathIndex + 1];
      if (nextPt) {
        const dx = nextPt.x - e.x;
        const dy = nextPt.y - e.y;
        const dist = Math.hypot(dx, dy);
        const spd = e.speed * (e.slowAmount || 1);
        if (dist < spd) { e.pathIndex++; }
        else { e.x += (dx / dist) * spd; e.y += (dy / dist) * spd; }
        e.el.style.left = `${e.x}px`;
        e.el.style.top  = `${e.y}px`;
      } else {
        // Llegó al final
        e.el.remove();
        gameState.enemies.splice(i, 1);
        gameState.health -= e.boss ? 10 : 1;
        if (gameState.health <= 0) { gameState.health = 0; endGame(); }
        updateUI();
        showMessage(translate('enemyReachedEnd'), 'error');
        continue;
      }

      // Quemadura
      if (e.burnTimer > 0) {
        e.burnTimer -= deltaTime;
        e.health -= 5 * deltaTime;
        e.el.classList.add('burning');
      } else {
        e.el.classList.remove('burning');
      }

      // HP bar
      if (e.hpFill) {
        const pct = Math.max(0, e.health / e.maxHealth) * 100;
        e.hpFill.style.width = `${pct}%`;
      }

      e.slowAmount = 1; // Reset slow each frame

      if (e.health <= 0) die(e, i);
    } // fin for enemigos

    // Actualizar Torres
    gameState.towers.forEach(t => {
    if (t.stunned > 0) {
      t.stunned -= deltaTime;
      t.el.classList.add('stunned');
      return;
    }
    t.el.classList.remove('stunned');

    if (t.moneyGen) {
      if (gameState.waveActive) {
        t.moneyTimer += deltaTime;
        if (t.moneyTimer >= 5) { // Genera cada 5s
          gameState.globetines += t.moneyGen;
          t.moneyTimer = 0;
          showEffect(t.x, t.y, `💰+${t.moneyGen}`);
          updateUI();
        }
      }
      return;
    }

    t.cooldown -= deltaTime;
    if (t.cooldown <= 0) {
      const targets = gameState.enemies.filter(e => Math.hypot(e.x - t.x, e.y - t.y) <= t.range);
      if (targets.length > 0) {
        if (t.melee) {
          targets[0].health -= t.damage;
          t.el.style.transform = `translate(-50%, -50%) scale(1.3)`;
          setTimeout(() => t.el.style.transform = `translate(-50%, -50%) scale(1)`, 100);
          if (t.burn) targets[0].burnTimer = 3;
        } else {
          shoot(t, targets[0]);
        }
        t.cooldown = 1 / t.speed;
      }
    }
  });

  // Actualizar Proyectiles (Bucle invertido para splice seguro)
  for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
    const p = gameState.projectiles[i];
    if (p.piercing) {
      p.x += p.vx; p.y += p.vy;
      p.el.style.left = `${p.x}px`; p.el.style.top = `${p.y}px`;

      for (let j = gameState.enemies.length - 1; j >= 0; j--) {
        const e = gameState.enemies[j];
        if (Math.hypot(e.x - p.x, e.y - p.y) < 40 && !p.hitEnemies.has(e)) {
          const damage = p.damage * (e.shield || 1);
          e.health -= damage;
          showEffect(e.x, e.y - 20, `-${Math.floor(damage)}`);
          p.hitEnemies.add(e);
          if (p.burn) e.burnTimer = 3;
          if (e.health <= 0) die(e, j);
        }
      }

      if (p.x < 0 || p.x > 1000 || p.y < 0 || p.y > 600) {
        p.el.remove();
        gameState.projectiles.splice(i, 1);
      }
    } else {
      const dx = p.target.x - p.x;
      const dy = p.target.y - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 10 || !gameState.enemies.includes(p.target)) {
        if (gameState.enemies.includes(p.target)) {
          const damage = p.damage * (p.target.shield || 1);
          p.target.health -= damage;
          if (p.slow) p.target.slowAmount = p.slow;

          // AOE Damage (Bombas)
          if (p.aoe) {
            for (let j = gameState.enemies.length - 1; j >= 0; j--) {
              const e2 = gameState.enemies[j];
              if (e2 !== p.target && Math.hypot(e2.x - p.x, e2.y - p.y) < p.aoe) {
                const aoeDmg = damage * 0.5;
                e2.health -= aoeDmg;
                showEffect(e2.x, e2.y - 20, `-${Math.floor(aoeDmg)}`);
                if (e2.health <= 0) die(e2, j);
              }
            }
          }

          if (p.target.health <= 0) die(p.target, gameState.enemies.indexOf(p.target));

          if (p.type === 'split') {
            for (let s = 0; s < 3; s++) shootSmall(p.x, p.y, p.damage / 2);
          }
        }
        p.el.remove();
        gameState.projectiles.splice(i, 1);
      } else {
        p.x += (dx / dist) * 10;
        p.y += (dy / dist) * 10;
        p.el.style.left = `${p.x}px`; p.el.style.top = `${p.y}px`;
      }
    }
  }

  if (gameState.waveActive && gameState.enemies.length === 0) {
    gameState.waveActive = false;
    gameState.bossSpawned = false;

    // Globetines de bonus
    const bonus = 50 + gameState.wave * 10;
    gameState.globetines += bonus;

    // PyCoins por dificultad
    const difficultyRewards = { facil: 5, normal: 10, dificil: 20, extremo: 40, corrupto: 50, infinito: 5 + Math.floor(gameState.wave / 10) };
    const pyReward = difficultyRewards[gameState.mode] || 10;
    gameState.pycoins += pyReward;

    // XP de Duck Pass
    addXP(20);

    updateUI();
    updateMetaUI();

    if (gameState.wave >= 10) BADGES.survivor.unlocked = true;
    if (gameState.globetines >= 20000) BADGES.millionaire.unlocked = true;

    drawBadges();
    saveProgress();

    if (gameState.autoWave) setTimeout(startWave, 2000);
  }
  } catch (e) {
    console.error("Error en gameLoop:", e);
  }
  requestAnimationFrame(gameLoop);
}

function shoot(t, target) {
  const el = document.createElement('div');
  el.className = `projectile ${t.projectile}`;
  const angle = Math.atan2(target.y - t.y, target.x - t.x);

  if (t.projectile.startsWith('laser')) {
    el.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
    gameState.projectiles.push({
      x: t.x, y: t.y, vx: Math.cos(angle) * 15, vy: Math.sin(angle) * 15,
      damage: t.damage, el, piercing: true, hitEnemies: new Set(), burn: t.burn
    });
  } else {
    // Para orbes, bombas, etc.
    el.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
    gameState.projectiles.push({
      x: t.x, y: t.y, target, damage: t.damage, el, type: t.projectile,
      slow: t.slow, aoe: t.aoe
    });
  }
  document.getElementById('map').appendChild(el);
}

function shootSmall(x, y, dmg) {
  const target = gameState.enemies[Math.floor(Math.random() * gameState.enemies.length)];
  if (!target) return;
  const el = document.createElement('div');
  el.className = 'projectile green';
  el.style.width = '8px'; el.style.height = '8px';
  document.getElementById('map').appendChild(el);
  gameState.projectiles.push({ x, y, target, damage: dmg, el });
}

function die(e, idx) {
  if (idx === -1) return;

  // Probabilidad de revivir en modo Corrupto (30%)
  if (gameState.corrupt && !e.revived && Math.random() < 0.3) {
    e.revived = true;
    e.health = e.maxHealth * 0.5;
    e.el.classList.add('reviving');
    setTimeout(() => e.el.classList.remove('reviving'), 1000);
    showMessage("¡UN PYCE HA RESUCITADO!", 'warning');
    return;
  }

  if (e.revived && e.mimic) {
    BADGES.mimicRevenge.unlocked = true;
    saveProgress();
    drawBadges();
  }

  if (e.mimic) {
    gameState.pycoins += 5; // Golden Pyces dan PyCoins
    showMessage("+5 PyCoins", 'success');
  } else {
    gameState.globetines += e.reward;
  }

  e.el.remove();
  if (e.boss) {
    BADGES.bossKiller.unlocked = true;
    TOWER_TYPES['Old_Glob'].unlocked = true;

    // Mensajes de derrota de jefes
    if (e.type === 'NOeye_Pyce') {
      const defMsgs = NARRATOR_DATA.noeye[currentLanguage].defeat;
      showNarrator('noeye', defMsgs[Math.floor(Math.random() * defMsgs.length)]);
      if (gameState.mode === 'extremo') {
        TOWER_TYPES['Work_Bombot'].unlocked = true;
        showMessage("¡HAS DESBLOQUEADO EL WORK-BOMBOT!", 'success');
      }
    } else if (e.type === 'MoonStar_Pyce') {
      const defMsgs = NARRATOR_DATA.moonstar[currentLanguage].defeat;
      showNarrator('moonstar', defMsgs[Math.floor(Math.random() * defMsgs.length)]);
    }

    drawTowerShop();
    drawBadges();
  }
  gameState.enemies.splice(idx, 1);
  updateUI();
}

function updateUI() {
  document.getElementById('health').textContent = Math.max(0, gameState.health);
  document.getElementById('money').textContent = Math.floor(gameState.globetines);
  document.getElementById('wave-count').textContent = Math.min(999, gameState.wave);
  
  updateMetaUI(); // Asegurar que PyCoins y Duck Pass estén siempre actualizados

  // Bloquear botones durante la oleada
  const startBtn = document.getElementById('start-wave');
  const autoBtn = document.getElementById('auto-wave');

  if (gameState.waveActive) {
    startBtn.disabled = true;
    autoBtn.disabled = true;
    startBtn.style.opacity = "0.5";
    autoBtn.style.opacity = "0.5";
    startBtn.style.cursor = "not-allowed";
    autoBtn.style.cursor = "not-allowed";
  } else {
    startBtn.disabled = false;
    autoBtn.disabled = false;
    startBtn.style.opacity = "1";
    autoBtn.style.opacity = "1";
    startBtn.style.cursor = "pointer";
    autoBtn.style.cursor = "pointer";
  }
}

function translate(key, params = {}) {
  let text = TRANSLATIONS[currentLanguage][key] || key;
  for (const [p, v] of Object.entries(params)) text = text.replace(`{${p}}`, v);
  return text;
}

function updateLanguage() {
  try {
    const labels = document.querySelectorAll('.stat-label');
    if (labels.length >= 3) {
      labels[0].textContent = translate('health');
      labels[1].textContent = translate('money');
      labels[2].textContent = translate('wave');
    }

    const startWaveBtn = document.getElementById('start-wave');
    if (startWaveBtn) startWaveBtn.querySelector('.btn-text').textContent = translate('startWave');

    const autoWaveBtn = document.getElementById('auto-wave');
    if (autoWaveBtn) autoWaveBtn.querySelector('.btn-text').textContent = translate('autoWave');

    const deselectBtn = document.getElementById('deselect-tower');
    if (deselectBtn) deselectBtn.querySelector('.btn-text').textContent = translate('cancel');

    const badgeTitle = document.querySelector('#badges-panel h4');
    if (badgeTitle) badgeTitle.textContent = translate('achievements');

    // Traducción de botones Meta
    const shopBtn = document.querySelector('#open-shop .btn-text');
    if (shopBtn) shopBtn.textContent = currentLanguage === 'es' ? 'Tienda' : 'Shop';

    const passBtn = document.querySelector('#open-pass .btn-text');
    if (passBtn) passBtn.textContent = currentLanguage === 'es' ? 'Pass' : 'Pass';

    document.getElementById('shop-title').textContent = translate('shop_title');
    document.getElementById('pass-title').textContent = translate('pass_title');

    document.querySelectorAll('.back-btn .btn-text').forEach(el => {
      el.textContent = translate('backToModes');
    });

    const codeInput = document.getElementById('game-code');
    if (codeInput) codeInput.placeholder = translate('code_placeholder');

    const applyBtn = document.getElementById('apply-code');
    if (applyBtn) applyBtn.textContent = translate('apply_btn');

    // Traducción de Login y Modos
    const userInput = document.getElementById('username-input');
    if (userInput) userInput.placeholder = translate('login_user');

    const passInput = document.getElementById('password-input');
    if (passInput) passInput.placeholder = translate('login_pass');

    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) loginBtn.textContent = translate('login_btn');

    const modeTitle = document.querySelector('#mode-selection h2');
    if (modeTitle) modeTitle.textContent = translate('select_mode');

    // Actualizar el texto del botón
    const langBtn = document.getElementById('language-toggle');
    if (langBtn) langBtn.textContent = currentLanguage === 'es' ? '🌐 ES / EN' : '🌐 EN / ES';
  } catch (e) {
    console.error("Error en updateLanguage:", e);
  }
}

function showMessage(text, type) {
  const el = document.createElement('div');
  el.className = `game-message ${type}`;
  el.textContent = text;
  document.getElementById('game-messages').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function showEffect(x, y, text) {
  const el = document.createElement('div');
  el.className = 'money-popup';
  el.style.left = `${x}px`; el.style.top = `${y}px`;
  el.textContent = text;
  document.getElementById('map').appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function getTowerImage(type) {
  const cfg = TOWER_TYPES[type];
  if (!cfg) return '';
  
  const family = cfg.family || type;
  const equipped = gameState.equippedSkins[family];
  
  if (equipped && equipped !== 'default') {
    // Buscar en SKINS_DATA
    const familySkins = SKINS_DATA[family];
    if (familySkins) {
      const skinSet = familySkins.find(s => s.id === equipped);
      if (skinSet && skinSet.skins && skinSet.skins[type]) {
        return skinSet.skins[type];
      }
    }
  }
  return cfg.image;
}

function applyTowerEffects(el, type) {
  const cfg = TOWER_TYPES[type];
  if (!cfg) return;
  
  // Limpiar clases y filtros previos
  el.className = 'tower';
  el.style.filter = '';
  
  // 1. Skin Global (Negativo, Arcoiris)
  const globalSkin = gameState.equippedSkins['Global'];
  if (globalSkin !== 'default') {
    const globalData = SKINS_DATA['Global'].find(s => s.id === globalSkin);
    if (globalData && globalData.class) el.classList.add(globalData.class);
  }
  
  // 2. Recolores y Skins de Set
  const family = cfg.family || type;
  const equipped = gameState.equippedSkins[family];
  
  if (equipped && equipped.startsWith('recolor_')) {
    const recolor = SKINS_DATA['Recolors'].find(s => s.id === equipped);
    if (recolor && recolor.filter) el.style.filter = recolor.filter;
  }
}

function shootParalyzeLaser(e) {
  if (gameState.towers.length === 0) return;
  const t = gameState.towers[Math.floor(Math.random() * gameState.towers.length)];
  const laser = document.createElement('div');
  laser.className = 'projectile laser';
  laser.style.background = '#00ffff';
  laser.style.width = '1000px';
  laser.style.height = '4px';
  laser.style.left = `${e.x}px`;
  laser.style.top = `${e.y}px`;
  laser.style.transform = `rotate(${Math.random() * 360}deg)`;
  document.getElementById('game-area').appendChild(laser);

  t.stunned = 5;
  t.el.classList.add('stunned');
  showMessage("¡TORRE PARALIZADA POR NOEYE!", 'error');

  setTimeout(() => laser.remove(), 500);
}

function showNarrator(charId, specificMsgKey) {
  const char = NARRATOR_DATA[charId];
  if (!char) return;

  const localized = char[currentLanguage];
  let text = "";

  if (specificMsgKey) {
    text = specificMsgKey;
  } else {
    text = localized.msgs[Math.floor(Math.random() * localized.msgs.length)];
  }

  const el = document.createElement('div');
  el.className = 'narrator-msg';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.gap = '15px';

  const img = document.createElement('img');
  img.src = char.img;
  img.style.width = '40px';
  img.style.height = '40px';
  img.style.borderRadius = '5px';
  img.style.border = '2px solid #555';

  const content = document.createElement('div');
  const styles = {
    bombot: "color: #ffd700",
    glob: "color: #38ef7d",
    stupid: "color: #fff",
    pyce2: "color: #3498db",
    noeye: "color: #00ffff; text-transform: uppercase; font-family: monospace",
    moonstar: "color: #ff00ff; font-style: italic",
    mimic: "color: #f1c40f"
  };

  content.innerHTML = `<span style="${styles[charId]}">[${localized.name}]</span>: ${text}`;

  el.appendChild(img);
  el.appendChild(content);

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

function selectTower(t) {
  gameState.selectedTower = t;
  const panel = document.getElementById('evolve-panel');
  panel.style.display = 'flex';

  // Posicionamiento dinámico relativo al mapa
  const panelWidth = 240;
  const panelHeight = 220;
  const mapRect = document.getElementById('map').getBoundingClientRect();
  const containerRect = document.getElementById('game-container').getBoundingClientRect();

  // Convertir coordenadas del mapa a coordenadas del contenedor
  const absoluteX = mapRect.left - containerRect.left + t.x;
  const absoluteY = mapRect.top - containerRect.top + t.y;

  let top = absoluteY - panelHeight - 20;
  if (top < 10) top = absoluteY + 40;

  let left = absoluteX - panelWidth / 2;
  if (left < 10) left = 10;
  if (left + panelWidth > 990) left = 990 - panelWidth;

  panel.style.top = `${top}px`;
  panel.style.left = `${left}px`;

  document.getElementById('tower-name').textContent = t.name;

  // Descripción de la torre
  const towerData = TOWER_TYPES[t.type];
  let descText = towerData.desc || "";
  if (towerData.evolution) {
    const nextTower = TOWER_TYPES[towerData.evolution];
    descText += `<br><br><b style="color: #ffd700">Próxima Mejora:</b> ${nextTower.name}<br><i style="font-size: 0.8rem; color: #aaa;">${nextTower.desc}</i>`;
  }

  const descEl = document.getElementById('tower-desc');
  descEl.innerHTML = descText;

  updateEvolveButtons(t);
  drawRangePreview(t.x, t.y, t.range);
}

function deselectTower() {
  gameState.selectedTower = null;
  document.getElementById('evolve-panel').style.display = 'none';
  const preview = document.getElementById('range-preview');
  if (preview) preview.remove();
}

function drawRangePreview(x, y, range) {
  let preview = document.getElementById('range-preview');
  if (!preview) {
    preview = document.createElement('div');
    preview.id = 'range-preview';
    preview.className = 'range-preview';
    document.getElementById('map').appendChild(preview);
  }
  preview.style.left = `${x}px`;
  preview.style.top = `${y}px`;
  preview.style.width = `${range * 2}px`;
  preview.style.height = `${range * 2}px`;
}

function endGame() {
  gameState.gameOver = true;
  document.getElementById('game-over').style.display = 'flex';
  document.getElementById('final-wave').textContent = gameState.wave;
}

window.onload = init;

// =================================================================
// GLOB DEFENDERS v2.0 - SKINS & JUICE UPDATE (Final Stable Version)
// =================================================================