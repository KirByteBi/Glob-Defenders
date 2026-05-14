// ===================== CONFIGURACIÓN Y DATOS DEL JUEGO =====================

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
    badge_winFacil_name: "Iniciado", badge_winFacil_desc: "Vence en modo Fácil",
    badge_winNormal_name: "Defensor", badge_winNormal_desc: "Vence en modo Normal",
    badge_winDificil_name: "Guerrero", badge_winDificil_desc: "Vence en modo Difícil",
    badge_winExtremo_name: "Leyenda", badge_winExtremo_desc: "Vence en modo Extremo",
    badge_winCorrupto_name: "Purificador", badge_winCorrupto_desc: "Vence en modo Corrupto",
    
    // Nombres de Torres
    tower_Glob_name: "Glob Verde",
    tower_Poop_Glob_name: "Glob Pegajoso",
    tower_Golden_Glob_name: "Glob de Oro",
    tower_Rainbow_Glob_name: "Glob Arcoíris",
    tower_Red_Glob_name: "Glob Rojo",
    tower_Molten_Glob_name: "Glob de Lava",
    tower_Robotic_Glob_name: "Glob Robótico",
    tower_Soap_Glob_name: "Glob de Jabón",
    tower_Cotton_Glob_name: "Glob de Algodón",
    tower_Ducky_Glob_name: "Pato Glob",
    tower_Golden_Ducky_Glob_name: "Pato de Oro",
    tower_Comet_Glob_name: "Glob Cometa",
    tower_Dark_Glob_name: "Glob Oscuro",
    tower_Demglob_name: "Demglob",
    tower_Pyce_Glob_name: "Pyce Glob",
    tower_Old_Glob_name: "Glob Anciano",
    tower_Work_Bombot_name: "Bombot de Trabajo",
    tower_limit_increased: "Límite de {name} aumentado",

    // Nombres de Enemigos
    enemy_Stupid_Pyce_name: "Pyce Torpe",
    enemy_Pyce2_name: "Pyce Común",
    enemy_Guest_Pyce_name: "Pyce Invitado",
    enemy_Symbol_Pyce_name: "Pyce Veloz",
    enemy_Noob_Pyce_name: "Pyce Novato",
    enemy_4motions_Pyce_name: "4motions Pyce",
    enemy_SO_Pyce_name: "Pyce Serio",
    enemy_1x1x1x1_Pyce_name: "Corruptor 1x1",
    enemy_NOeye_Pyce_name: "Ojo Ciego Pyce",
    enemy_MoonStar_Pyce_name: "MoonStar Pyce",
    enemy_Stupid_GoldPyce_name: "Pyce de Oro Torpe",

    login_user: "Nombre de Usuario", login_pass: "Contraseña", login_btn: "Unirse a la batalla",
    select_mode: "Seleccionar Modo",
    backToModes: "Selección de Modo",
    shop_title: "🛒 Tienda Meta",
    pass_title: "🦆 Duck Pass",
    code_placeholder: "Código Secreto...",
    apply_btn: "Aplicar",
    new_user_registered: "¡Nuevo usuario registrado!",
    system_unstable: "S1S73M4 1N574BL3...",
    win_diff_required: "Gana en modo {diff} o superior para desbloquear",
    system_restored: "SISTEMA RESTAURADO",
    anti_normal_active: "M0D0 4N71-N0RM4L 4C71V4D0",
    corrupt_active: "¡SISTEMA CORRUPTO ACTIVADO!",
    skin_unlocked: "¡Skin desbloqueada!",
    no_pycoins: "No tienes suficientes PyCoins",
    appearance_updated: "Apariencia actualizada",
    base_hp_improved: "¡Salud de base mejorada!",
    badge_reward_received: "¡Logro: {name}! Recompensa recibida.",
    pyce_resurrected: "¡UN PYCE HA RESUCITADO!",
    plus_pycoins: "+{amount} PyCoins",
    bombot_unlocked: "¡HAS DESBLOQUEADO EL WORK-BOMBOT!",
    victory_title: "🏆 ¡VICTORIA MAGISTRAL! 🏆",
    victory_msg: "Has completado el modo <b>{mode}</b>.<br>¡Regresa para probar nuevos desafíos!",
    back_to_selection: "Selección de Modos",
    limit_reached: "Límite alcanzado para {name} (Máx: {limit})",
    next_upgrade: "Próxima Mejora: {name}",
    evolution_label: "Evolución",
    evolve_btn_text: "Evolucionar (💰 {cost})",
    prestige_duckpass: "¡Prestigio Duck Pass! +2 Ducky Pass",
    level_duckpass: "¡Nivel {level} del Duck Pass! +1 Ducky Pass",
    look_defender: "¿Qué miras, Defensor? 👀",
    logo_press: "¿Por qué pulsas el logo?",
    stop_logo: "¡¡¡DEJA DE PULSAR EL DICHOSO LOGO!!!",
    logo_secret: "Esto no va a desbloquear nada... ¿O sí? 🤔",
    code_already_used: "¡Código ya usado!",
    evolve_to: "Evolucionar a {name} (💰 {cost})",
    sell_tower: "Vender (💰 {cost})",
    next_level: "Siguiente: Nivel {level}",
    reward_desc: "Recompensa: +1 Ducky Pass",
    buy: "Comprar",
    actual: "Actual",
    equipped: "Equipado",
    req_level: "Nivel {level} Requerido",
    active: "¡ACTIVO!",
    milestone: "HITO",
    upgrade: "MEJORA",
    shop_upgrades: "Mejoras",
    shop_skins: "Skins",
    mode_selected: "Modo {mode} seleccionado",
    settings_title: "⚙️ Ajustes",
    show_shop_desc: "Mostrar descripción en tienda",
    show_total_damage: "Ver Daño Total de torres",
    save_close: "Guardar y Cerrar",
    close: "Cerrar",
    level_label: "Nivel",
    evolve_title: "Evolución de Torre",
    sell: "Vender",
    back_to_modes: "Volver a Modos",
    rotate_device: "Gira el dispositivo",
    landscape_msg: "Glob Defenders se juega en modo horizontal",
    pycoins_title: "PyCoins",
    duckpass_title: "Duck Pass",
    equip_btn: "Equipar",
    
    // Mejoras de Tienda
    upgrade_hp_name: "Salud de Base",
    upgrade_hp_desc: "+20 Salud Máxima",
    upgrade_unlock_pyce_name: "Desbloquear Pyce Glob",
    upgrade_unlock_pyce_desc: "Permite comprar Pyce Globs",
    upgrade_limit_name: "Límite: {name}",
    upgrade_limit_desc: "Aumenta límite de {name}",

    // Sets de Skins
    skin_military_name: "Set Militar",
    skin_military_desc: "Equipamiento táctico para la línea verde.",
    skin_music_name: "Set Musical",
    skin_music_desc: "¡Ritmo y fiesta para la línea roja!",
    skin_abyssal_name: "Set Abismal",
    skin_abyssal_desc: "¡Poder de las profundidades marinas!",
    skin_business_name: "Set Empresarial",
    skin_business_desc: "De un puesto de gelatina a una gran fábrica.",
    skin_universolar_name: "Set Universolar",
    skin_universolar_desc: "¡Poder estelar y elegancia espacial!",
    upgrade_range_name: "Alcance Maestro",
    upgrade_range_desc: "+20 Alcance para todas las torres",
    upgrade_damage_name: "Poder del Pato",
    upgrade_damage_desc: "+15% Daño para todas las torres",
    
    // Skins Globales (Recolores y Buffs)
    skin_emerald_name: "Edición Esmeralda",
    skin_emerald_desc: "Poder de la naturaleza.",
    skin_ruby_name: "Edición Rubí",
    skin_ruby_desc: "Pasión ardiente en cada disparo.",
    skin_cyan_name: "Edición Cian",
    skin_cyan_desc: "Frío como el hielo de Bitlands.",
    skin_neon_name: "Edición Neón",
    skin_neon_desc: "Brillo cibernético futurista.",
    skin_shadow_name: "Edición Sombra",
    skin_shadow_desc: "Sigilo y oscuridad total.",
    skin_void_name: "Edición Vacío",
    skin_void_desc: "Poder oscuro del abismo.",
    skin_gold_name: "Edición Oro",
    skin_gold_desc: "Puro lujo para tus torres.",
    skin_negative_name: "Pack Negativo",
    skin_negative_desc: "Invierte la realidad de tus torres.",
    skin_rainbow_name: "Pack Arcoíris",
    skin_rainbow_desc: "¡Fiesta de colores definitiva!",
    
    skin_galactic_name: "Edición Galáctica",
    skin_galactic_desc: "Brillo cósmico de Bitlands.",
    skin_fire_name: "Edición Ígnea",
    skin_fire_desc: "Calor volcánico en tus manos.",
    skin_diamond_name: "Edición Diamante",
    skin_diamond_desc: "Resistencia y brillo cristalino.",
    skin_toxic_name: "Edición Tóxica",
    skin_toxic_desc: "Peligro radiactivo inminente.",

    skin_buff_damage1_name: "Entrenamiento Básico",
    skin_buff_damage1_desc: "⚔️ +5% Daño Permanente.",
    skin_buff_range1_name: "Visión de Águila",
    skin_buff_range1_desc: "🔭 +10 Alcance Permanente.",
    skin_buff_speed1_name: "Cadencia Mejorada",
    skin_buff_speed1_desc: "⚡ +5% Velocidad de Ataque.",
    skin_buff_damage2_name: "Ingeniería de Bitlands",
    skin_buff_damage2_desc: "⚔️ +10% Daño Extra.",

    // Descripciones de Torres
    tower_Glob_desc: "Glob básico. Ataca con orbes verdes.",
    tower_Poop_Glob_desc: "Más fuerte pero más lento. Lanza orbes pegajosos.",
    tower_Golden_Glob_desc: "Muy rápido y potente. Dispara balas de oro.",
    tower_Rainbow_Glob_desc: "El Glob definitivo. Dispara láseres arcoíris penetrantes.",
    tower_Red_Glob_desc: "Atacante cuerpo a cuerpo muy rápido.",
    tower_Molten_Glob_desc: "Cuerpo a cuerpo que quema a los enemigos.",
    tower_Robotic_Glob_desc: "Francotirador de largo alcance con láseres penetrantes.",
    tower_Soap_Glob_desc: "Lanza burbujas que ralentizan a los enemigos.",
    tower_Cotton_Glob_desc: "Glob suave que ralentiza y hace poco daño.",
    tower_Ducky_Glob_desc: "Lanza huevos rápidos.",
    tower_Golden_Ducky_Glob_desc: "Pato potente que lanza huevos de oro.",
    tower_Comet_Glob_desc: "Dispara cometas lentos pero devastadores.",
    tower_Dark_Glob_desc: "Poder del vacío. Atraviesa enemigos.",
    tower_Demglob_desc: "El demonio de Bitlands. Destrucción total.",
    tower_Pyce_Glob_desc: "Un Glob con errores de sistema (Glitch).",
    tower_Old_Glob_desc: "Sabiduría antigua en forma de rocas.",
    tower_Work_Bombot_desc: "Robot bomba. Hace daño de área masivo."
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
    badge_winFacil_name: "Beginner", badge_winFacil_desc: "Win in Easy mode",
    badge_winNormal_name: "Defender", badge_winNormal_desc: "Win in Normal mode",
    badge_winDificil_name: "Warrior", badge_winDificil_desc: "Win in Hard mode",
    badge_winExtremo_name: "Legend", badge_winExtremo_desc: "Win in Extreme mode",
    badge_winCorrupto_name: "Purifier", badge_winCorrupto_desc: "Win in Corrupt mode",

    // Tower Names
    tower_Glob_name: "Green Glob",
    tower_Poop_Glob_name: "Poop Glob",
    tower_Golden_Glob_name: "Golden Glob",
    tower_Rainbow_Glob_name: "Rainbow Glob",
    tower_Red_Glob_name: "Red Glob",
    tower_Molten_Glob_name: "Lava Glob",
    tower_Robotic_Glob_name: "Robotic Glob",
    tower_Soap_Glob_name: "Soap Glob",
    tower_Cotton_Glob_name: "Cotton Glob",
    tower_Ducky_Glob_name: "Ducky Glob",
    tower_Golden_Ducky_Glob_name: "Golden Ducky",
    tower_Comet_Glob_name: "Comet Glob",
    tower_Dark_Glob_name: "Dark Glob",
    tower_Demglob_name: "Demglob",
    tower_Pyce_Glob_name: "Pyce Glob",
    tower_Old_Glob_name: "Elder Glob",
    tower_Work_Bombot_name: "Work Bombot",
    tower_limit_increased: "{name} limit increased",

    // Enemy Names
    enemy_Stupid_Pyce_name: "Stupid Pyce",
    enemy_Pyce2_name: "Common Pyce",
    enemy_Guest_Pyce_name: "Guest Pyce",
    enemy_Symbol_Pyce_name: "Fast Pyce",
    enemy_Noob_Pyce_name: "Noob Pyce",
    enemy_4motions_Pyce_name: "4motions Pyce",
    enemy_SO_Pyce_name: "Serious Pyce",
    enemy_1x1x1x1_Pyce_name: "Corruptor 1x1",
    enemy_NOeye_Pyce_name: "Blind Eye Pyce",
    enemy_MoonStar_Pyce_name: "MoonStar Pyce",
    enemy_Stupid_GoldPyce_name: "Stupid GoldPyce",

    login_user: "Username", login_pass: "Password", login_btn: "Join the battle",
    select_mode: "Select Mode",
    backToModes: "Mode Selection",
    shop_title: "🛒 Meta Shop",
    pass_title: "🦆 Duck Pass",
    code_placeholder: "Secret Code...",
    apply_btn: "Apply",
    new_user_registered: "New user registered!",
    system_unstable: "SY573M UN574BL3...",
    win_diff_required: "Win in {diff} mode or higher to unlock",
    system_restored: "SYSTEM RESTORED",
    anti_normal_active: "4N71-N0RM4L M0D3 4C71V473D",
    corrupt_active: "CORRUPT SYSTEM ACTIVATED!",
    skin_unlocked: "Skin unlocked!",
    no_pycoins: "Not enough PyCoins",
    appearance_updated: "Appearance updated",
    base_hp_improved: "Base health improved!",
    badge_reward_received: "Achievement: {name}! Reward received.",
    pyce_resurrected: "A PYCE HAS RESURRECTED!",
    plus_pycoins: "+{amount} PyCoins",
    bombot_unlocked: "YOU UNLOCKED WORK-BOMBOT!",
    victory_title: "🏆 MASTER VICTORY! 🏆",
    victory_msg: "You have completed <b>{mode}</b> mode.<br>Come back for new challenges!",
    back_to_selection: "Mode Selection",
    limit_reached: "Limit reached for {name} (Max: {limit})",
    next_upgrade: "Next Upgrade: {name}",
    evolution_label: "Evolution",
    evolve_btn_text: "Evolve (💰 {cost})",
    prestige_duckpass: "Duck Pass Prestige! +2 Ducky Pass",
    level_duckpass: "Duck Pass Level {level}! +1 Ducky Pass",
    look_defender: "What are you looking at, Defender? 👀",
    logo_press: "Why are you pressing the logo?",
    stop_logo: "STOP PRESSING THE DAMN LOGO!!!",
    logo_secret: "This won't unlock anything... Or will it? 🤔",
    code_already_used: "Code already used!",
    evolve_to: "Evolve to {name} (💰 {cost})",
    sell_tower: "Sell (💰 {cost})",
    next_level: "Next: Level {level}",
    reward_desc: "Reward: +1 Ducky Pass",
    buy: "Buy",
    actual: "Actual",
    equipped: "Equipped",
    req_level: "Level {level} Required",
    active: "ACTIVE!",
    milestone: "MILESTONE",
    upgrade: "UPGRADE",
    shop_upgrades: "Upgrades",
    shop_skins: "Skins",
    mode_selected: "{mode} mode selected",
    settings_title: "⚙️ Settings",
    show_shop_desc: "Show description in shop",
    show_total_damage: "View total tower damage",
    save_close: "Save & Close",
    close: "Close",
    level_label: "Level",
    evolve_title: "Tower Evolution",
    sell: "Sell",
    back_to_modes: "Back to Modes",
    rotate_device: "Rotate your device",
    landscape_msg: "Glob Defenders is played in landscape mode",
    pycoins_title: "PyCoins",
    duckpass_title: "Duck Pass",
    equip_btn: "Equip",

    // Shop Upgrades
    upgrade_hp_name: "Base Health",
    upgrade_hp_desc: "+20 Max Health",
    upgrade_unlock_pyce_name: "Unlock Pyce Glob",
    upgrade_unlock_pyce_desc: "Allows buying Pyce Globs",
    upgrade_limit_name: "Limit: {name}",
    upgrade_limit_desc: "Increase limit for {name}",

    // Skin Sets
    skin_military_name: "Military Set",
    skin_military_desc: "Tactical equipment for the green line.",
    skin_music_name: "Music Set",
    skin_music_desc: "Rhythm and party for the red line!",
    skin_abyssal_name: "Abyssal Set",
    skin_abyssal_desc: "Power from the deep sea!",
    skin_business_name: "Business Set",
    skin_business_desc: "From a jelly stand to a giant factory.",
    skin_universolar_name: "Universolar Set",
    skin_universolar_desc: "Stellar power and spatial elegance!",
    upgrade_range_name: "Master Range",
    upgrade_range_desc: "+20 Range for all towers",
    upgrade_damage_name: "Duck Power",
    upgrade_damage_desc: "+15% Damage for all towers",
    
    // Global Skins
    skin_emerald_name: "Emerald Edition",
    skin_emerald_desc: "Power of nature.",
    skin_ruby_name: "Ruby Edition",
    skin_ruby_desc: "Burning passion in every shot.",
    skin_cyan_name: "Cyan Edition",
    skin_cyan_desc: "Cold as Bitlands ice.",
    skin_neon_name: "Neon Edition",
    skin_neon_desc: "Futuristic cybernetic glow.",
    skin_shadow_name: "Shadow Edition",
    skin_shadow_desc: "Total stealth and darkness.",
    skin_void_name: "Void Edition",
    skin_void_desc: "Dark power from the abyss.",
    skin_gold_name: "Gold Edition",
    skin_gold_desc: "Pure luxury for your towers.",
    skin_negative_name: "Negative Pack",
    skin_negative_desc: "Invert your towers' reality.",
    skin_rainbow_name: "Rainbow Pack",
    skin_rainbow_desc: "The ultimate color party!",
    
    skin_galactic_name: "Galactic Edition",
    skin_galactic_desc: "Cosmic glow from Bitlands.",
    skin_fire_name: "Fire Edition",
    skin_fire_desc: "Volcanic heat in your hands.",
    skin_diamond_name: "Diamond Edition",
    skin_diamond_desc: "Resilience and crystalline shine.",
    skin_toxic_name: "Toxic Edition",
    skin_toxic_desc: "Imminent radioactive danger.",

    skin_buff_damage1_name: "Basic Training",
    skin_buff_damage1_desc: "⚔️ +5% Permanent Damage.",
    skin_buff_range1_name: "Eagle Vision",
    skin_buff_range1_desc: "🔭 +10 Permanent Range.",
    skin_buff_speed1_name: "Improved Fire-rate",
    skin_buff_speed1_desc: "⚡ +5% Attack Speed.",
    skin_buff_damage2_name: "Bitlands Engineering",
    skin_buff_damage2_desc: "⚔️ +10% Extra Damage.",

    // Tower Descriptions
    tower_Glob_desc: "Basic Glob. Attacks with green orbs.",
    tower_Poop_Glob_desc: "Stronger but slower. Throws sticky orbs.",
    tower_Golden_Glob_desc: "Very fast and powerful. Shoots gold bullets.",
    tower_Rainbow_Glob_desc: "The ultimate Glob. Shoots piercing rainbow lasers.",
    tower_Red_Glob_desc: "Very fast melee attacker.",
    tower_Molten_Glob_desc: "Melee that burns enemies.",
    tower_Robotic_Glob_desc: "Long-range sniper with piercing lasers.",
    tower_Soap_Glob_desc: "Throws bubbles that slow down enemies.",
    tower_Cotton_Glob_desc: "Soft Glob that slows and does little damage.",
    tower_Ducky_Glob_desc: "Throws fast eggs.",
    tower_Golden_Ducky_Glob_desc: "Powerful duck that throws gold eggs.",
    tower_Comet_Glob_desc: "Shoots slow but devastating comets.",
    tower_Dark_Glob_desc: "Void power. Pierces through enemies.",
    tower_Demglob_desc: "The demon of Bitlands. Total destruction.",
    tower_Pyce_Glob_desc: "A Glob with system errors (Glitch).",
    tower_Old_Glob_desc: "Ancient wisdom in the form of rocks.",
    tower_Work_Bombot_desc: "Bomb robot. Deals massive area damage."
  }
};

let USERS = {
  "KirByteBi": "FTPY2",
  "Admin": "ADgod",
  "AirRider": "PYCE",
  "Player": "1234"
};

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
      name: "Bombot de Trabajo", msgs: [
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
      name: "Pyce Torpe", msgs: [
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
      name: "Pyce de Oro Torpe", msgs: [
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
  'Glob': { name: 'tower_Glob_name', damage: 10, range: 150, speed: 1.0, cost: 50, evolution: 'Poop_Glob', image: IMAGE_PATHS.Glob, projectile: 'green', desc: "tower_Glob_desc", family: 'Glob' },
  'Poop_Glob': { name: 'tower_Poop_Glob_name', damage: 25, range: 150, speed: 0.6, cost: 100, evolution: 'Golden_Glob', image: IMAGE_PATHS.Poop_Glob, projectile: 'brown', desc: "tower_Poop_Glob_desc", family: 'Glob' },
  'Golden_Glob': { name: 'tower_Golden_Glob_name', damage: 45, range: 170, speed: 1.5, cost: 200, evolution: 'Rainbow_Glob', image: IMAGE_PATHS.Golden_Glob, projectile: 'gold', desc: "tower_Golden_Glob_desc", family: 'Glob' },
  'Rainbow_Glob': { name: 'tower_Rainbow_Glob_name', damage: 30, range: 180, speed: 1.2, cost: 400, image: IMAGE_PATHS.Rainbow_Glob, projectile: 'laser_rainbow', piercing: true, desc: "tower_Rainbow_Glob_desc", family: 'Glob' },

  'Red_Glob': { name: 'tower_Red_Glob_name', damage: 20, range: 60, speed: 1.5, cost: 70, evolution: 'Molten_Glob', image: IMAGE_PATHS.Red_Glob, melee: true, desc: "tower_Red_Glob_desc", family: 'Red_Glob' },
  'Molten_Glob': { name: 'tower_Molten_Glob_name', damage: 15, range: 70, speed: 1.0, cost: 150, evolution: 'Robotic_Glob', image: IMAGE_PATHS.Molten_Glob, burn: true, burnDamage: 5, desc: "tower_Molten_Glob_desc", family: 'Red_Glob' },
  'Robotic_Glob': { name: 'tower_Robotic_Glob_name', damage: 40, range: 200, speed: 0.3, cost: 300, image: IMAGE_PATHS.Robotic_Glob, projectile: 'laser_red', piercing: true, burn: true, desc: "tower_Robotic_Glob_desc", family: 'Red_Glob' },

  'Soap_Glob': { name: 'tower_Soap_Glob_name', damage: 0, range: 120, speed: 0.8, cost: 60, evolution: 'Cotton_Glob', image: IMAGE_PATHS.Soap_Glob, projectile: 'blue', slow: 0.4, desc: "tower_Soap_Glob_desc", family: 'Soap_Glob' },
  'Cotton_Glob': { name: 'tower_Cotton_Glob_name', damage: 5, range: 140, speed: 1.0, cost: 120, image: IMAGE_PATHS.Cotton_Glob, projectile: 'blue', slow: 0.6, desc: "tower_Cotton_Glob_desc", family: 'Soap_Glob' },

  'Ducky_Glob': { name: 'tower_Ducky_Glob_name', damage: 15, range: 140, speed: 1.2, cost: 80, evolution: 'Golden_Ducky_Glob', image: IMAGE_PATHS.Ducky_Glob, projectile: 'yellow', desc: "tower_Ducky_Glob_desc", family: 'Ducky_Glob' },
  'Golden_Ducky_Glob': { name: 'tower_Golden_Ducky_Glob_name', damage: 35, range: 160, speed: 1.0, cost: 180, image: IMAGE_PATHS.Golden_Ducky_Glob, projectile: 'gold', desc: "tower_Golden_Ducky_Glob_desc", family: 'Ducky_Glob' },

  'Comet_Glob': { name: 'tower_Comet_Glob_name', damage: 50, range: 250, speed: 0.2, cost: 250, evolution: 'Dark_Glob', image: IMAGE_PATHS.Comet_Glob, projectile: 'blue_comet', desc: "tower_Comet_Glob_desc", family: 'Comet_Glob' },
  'Dark_Glob': { name: 'tower_Dark_Glob_name', damage: 80, range: 280, speed: 1.0, cost: 400, evolution: 'Demglob', image: IMAGE_PATHS.Dark_Glob, projectile: 'void', piercing: true, desc: "tower_Dark_Glob_desc", family: 'Comet_Glob' },
  'Demglob': { name: 'tower_Demglob_name', damage: 200, range: 300, speed: 2.0, cost: 1000, image: IMAGE_PATHS.Demglob, projectile: 'hellfire', piercing: true, burn: true, desc: "tower_Demglob_desc", family: 'Comet_Glob' },

  'Pyce_Glob': { name: 'tower_Pyce_Glob_name', damage: 30, range: 180, speed: 0.8, cost: 150, image: IMAGE_PATHS.Pyce_Glob, projectile: 'glitch', unlocked: false, desc: "tower_Pyce_Glob_desc", family: 'Special' },
  'Old_Glob': { name: 'tower_Old_Glob_name', damage: 40, range: 200, speed: 0.5, cost: 200, image: IMAGE_PATHS.Old_Glob, projectile: 'stone', unlocked: false, desc: "tower_Old_Glob_desc", family: 'Special' },
  'Work_Bombot': { name: 'tower_Work_Bombot_name', damage: 100, range: 150, speed: 0.2, cost: 350, image: IMAGE_PATHS.Work_Bombot, aoe: 80, unlocked: false, desc: "tower_Work_Bombot_desc", family: 'Special' }
};

const ENEMY_TYPES = {
  'Stupid_Pyce': { name: 'Pyce Torpe', health: 50, speed: 1.5, reward: 15, image: IMAGE_PATHS.Stupid_Pyce },
  'Pyce2': { name: 'Pyce Común', health: 70, speed: 1.4, reward: 20, image: IMAGE_PATHS.Pyce2 },
  'Guest_Pyce': { name: 'Pyce Invitado', health: 100, speed: 1.2, reward: 25, image: IMAGE_PATHS.Guest_Pyce },
  'Symbol_Pyce': { name: 'Pyce Veloz', health: 80, speed: 2.5, reward: 30, image: IMAGE_PATHS.Symbol_Pyce },
  'Noob_Pyce': { name: 'Pyce Novato', health: 120, speed: 1.0, reward: 35, image: IMAGE_PATHS.Noob_Pyce, stunAbility: true, stunCooldown: 8 },
  '4motions_Pyce': { name: '4motions Pyce', health: 200, speed: 0.8, reward: 50, image: IMAGE_PATHS['4motions_Pyce'] },
  'SO_Pyce': { name: 'Pyce Serio', health: 450, speed: 0.6, reward: 80, image: IMAGE_PATHS.SO_Pyce },

  '1x1x1x1_Pyce': { name: 'Corruptor 1x1', health: 500, speed: 0.5, reward: 500, image: IMAGE_PATHS['1x1x1x1_Pyce'], boss: true, bossStun: true, stunCooldown: 10 },
  'NOeye_Pyce': { name: 'Ojo Ciego Pyce', health: 800, speed: 0.4, reward: 800, image: IMAGE_PATHS.NOeye_Pyce, boss: true, paralyzeLaser: true, stunCooldown: 12 },
  'MoonStar_Pyce': { name: 'MoonStar Pyce', health: 2500, speed: 0.3, reward: 2000, image: IMAGE_PATHS.MoonStar_Pyce, boss: true, instakill: true, doubleLap: true },

  'Stupid_GoldPyce': { name: 'Pyce de Oro Torpe', health: 80, speed: 2.0, reward: 150, image: IMAGE_PATHS.Stupid_GoldPyce, mimic: true }
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
  antiNormal: { key: 'antiNormal', icon: '🌑', unlocked: false, reward: { duckpass: 100, xp: 2000 } },
  winFacil: { key: 'winFacil', icon: '🌱', unlocked: false, reward: { pycoins: 50, xp: 50 } },
  winNormal: { key: 'winNormal', icon: '⚔️', unlocked: false, reward: { pycoins: 100, xp: 100 } },
  winDificil: { key: 'winDificil', icon: '🔥', unlocked: false, reward: { pycoins: 200, xp: 200 } },
  winExtremo: { key: 'winExtremo', icon: '💀', unlocked: false, reward: { pycoins: 500, xp: 500 } },
  winCorrupto: { key: 'winCorrupto', icon: '👾', unlocked: false, reward: { pycoins: 1000, xp: 1000 } }
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

const SKINS_DATA = {
  'Glob': [
    { id: 'military_set', name: 'skin_military_name', desc: 'skin_military_desc', cost: 350, type: 'pycoin', 
      skins: {
        'Glob': 'img/Skins/Verde Base/Untrained Glob (SK-EVO1).png',
        'Poop_Glob': 'img/Skins/Verde Base/Militar Glob (SK-EVO2).png',
        'Golden_Glob': 'img/Skins/Verde Base/Armed Glob (SK-EVO3).png',
        'Rainbow_Glob': 'img/Skins/Verde Base/Impostor Glob (SK-EVO4).png'
      }
    }
  ],
  'Red_Glob': [
    { id: 'music_set', name: 'skin_music_name', desc: 'skin_music_desc', cost: 300, type: 'pycoin',
      skins: {
        'Red_Glob': 'img/Skins/Rojo Melee/Music Glob (SK-EVO1).png',
        'Molten_Glob': 'img/Skins/Rojo Melee/Funky Glob (SK-EVO2).png',
        'Robotic_Glob': 'img/Skins/Rojo Melee/Party Glob (SK-EVO3).png'
      }
    }
  ],
  'Soap_Glob': [
    { id: 'abyssal_set', name: 'skin_abyssal_name', desc: 'skin_abyssal_desc', cost: 400, type: 'pycoin',
      skins: {
        'Soap_Glob': 'img/Skins/Azul Ralentizador/Beachy Glob (SK-EVO1).png',
        'Cotton_Glob': 'img/Skins/Azul Ralentizador/Shark Glob (SK-EVO2).png'
      }
    }
  ],
  'Ducky_Glob': [
    { id: 'business_duck_set', name: 'skin_business_name', desc: 'skin_business_desc', cost: 150, type: 'pycoin',
      skins: {
        'Ducky_Glob': 'img/Skins/Amarillo Farmer/Jelly Post (SK-EVO1).png',
        'Golden_Ducky_Glob': 'img/Skins/Amarillo Farmer/Factory Glob (SK-EVO2).png'
      }
    }
  ],
  'Comet_Glob': [
    { id: 'universolar_comet_set', name: 'skin_universolar_name', desc: 'skin_universolar_desc', cost: 450, type: 'pycoin',
      skins: {
        'Comet_Glob': 'img/Skins/Negro Supremo/Sunny Glob (SK-EVO1).png',
        'Dark_Glob': 'img/Skins/Negro Supremo/Sunlight Glob (SK-EVO2).png',
        'Demglob': 'img/Skins/Negro Supremo/Nova Glob (SK-EVO3).png'
      }
    }
  ],
  'Global': [
    { id: 'recolor_emerald', name: 'skin_emerald_name', desc: 'skin_emerald_desc', type: 'duckpass_level', level: 5, filter: 'hue-rotate(100deg) saturate(2.5) brightness(0.9)' },
    { id: 'buff_damage_1', name: 'skin_buff_damage1_name', desc: 'skin_buff_damage1_desc', type: 'duckpass_level', level: 10, buff: { damage: 1.05 } },
    { id: 'recolor_ruby', name: 'skin_ruby_name', desc: 'skin_ruby_desc', type: 'duckpass_level', level: 15, filter: 'hue-rotate(-20deg) saturate(3) brightness(1)' },
    { id: 'buff_range_1', name: 'skin_buff_range1_name', desc: 'skin_buff_range1_desc', type: 'duckpass_level', level: 20, buff: { range_flat: 10 } },
    { id: 'recolor_cyan', name: 'skin_cyan_name', desc: 'skin_cyan_desc', type: 'duckpass_level', level: 25, filter: 'hue-rotate(180deg) saturate(2) brightness(1.2)' },
    { id: 'buff_speed_1', name: 'skin_buff_speed1_name', desc: 'skin_buff_speed1_desc', type: 'duckpass_level', level: 30, buff: { speed: 1.05 } },
    { id: 'recolor_neon', name: 'skin_neon_name', desc: 'skin_neon_desc', type: 'duckpass_level', level: 40, filter: 'brightness(1.5) saturate(4) hue-rotate(280deg)' },
    { id: 'buff_damage_2', name: 'skin_buff_damage2_name', desc: 'skin_buff_damage2_desc', type: 'duckpass_level', level: 50, buff: { damage: 1.10 } },
    { id: 'recolor_shadow', name: 'skin_shadow_name', desc: 'skin_shadow_desc', type: 'duckpass_level', level: 55, filter: 'grayscale(1) brightness(0.4)' },
    { id: 'recolor_void', name: 'skin_void_name', desc: 'skin_void_desc', type: 'duckpass_level', level: 70, filter: 'brightness(0.6) hue-rotate(250deg) saturate(2)' },
    { id: 'recolor_gold', name: 'skin_gold_name', desc: 'skin_gold_desc', type: 'duckpass_level', level: 85, filter: 'brightness(1.2) sepia(1) saturate(10) hue-rotate(-10deg)' },
    { id: 'pack_negative', name: 'skin_negative_name', desc: 'skin_negative_desc', type: 'duckpass_level', level: 95, class: 'skin-negative' },
    { id: 'pack_rainbow', name: 'skin_rainbow_name', desc: 'skin_rainbow_desc', type: 'duckpass_level', level: 100, class: 'skin-rainbow' }
  ],
  'Recolors': [
    { id: 'recolor_galactic', name: 'skin_galactic_name', desc: 'skin_galactic_desc', cost: 250, type: 'pycoin', filter: 'hue-rotate(280deg) saturate(2.5) brightness(1.1) drop-shadow(0 0 5px #9c27b0)' },
    { id: 'recolor_fire', name: 'skin_fire_name', desc: 'skin_fire_desc', cost: 200, type: 'pycoin', filter: 'hue-rotate(-30deg) saturate(4) contrast(1.2) brightness(0.9)' },
    { id: 'recolor_diamond', name: 'skin_diamond_name', desc: 'skin_diamond_desc', cost: 300, type: 'pycoin', filter: 'brightness(1.8) saturate(0.2) contrast(1.5) opacity(0.9)' },
    { id: 'recolor_toxic', name: 'skin_toxic_name', desc: 'skin_toxic_desc', cost: 180, type: 'pycoin', filter: 'hue-rotate(80deg) saturate(5) brightness(1.2) contrast(1.1)' }
  ]
};
