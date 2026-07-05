// ===================== CONFIGURACIÓN Y DATOS DEL JUEGO =====================

const TRANSLATIONS = {
  es: {
    health: "Salud", money: "Globetines", wave: "Oleada",
    startWave: "Iniciar Oleada", autoWave: "Auto-Oleada",
    autoWaveActive: "Auto-ON", cancel: "Cancelar",
    gameOver: "💀 GAME OVER 💀", playAgain: "Reintentar",
    achievements: "Logros", notEnoughMoney: "💸 Sin Globetines",
    towerPlaced: "✓ {name} colocada",
    towerEvolved: "✨ ¡Evolución a {name}!",
    towerSold: "🛍� Vendida por {price}",
    waveStarted: "🌊 Oleada {wave}!",
    waveCompleted: "✓ Oleada {wave} superada!",
    enemyReachedEnd: "⚠� ¡Daño a la base!",
    pyceGlobUnlocked: "🌀 ¡Pyce Glob desbloqueado!",
    adminMode: "👑 MODO ADMIN",
    codeInvalid: "❌ Código inválido",
    loginError: "❌ Usuario o contraseña incorrectos",
    codeSuccess: "⭐ Código aceptado: {name} desbloqueado",
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
    badge_mimic2_name: "Cazatesoros II", badge_mimic2_desc: "Encuentra 2 Mimics en una partida",
    badge_mimic3_name: "Aura de Cristal", badge_mimic3_desc: "Termina una oleada con la base a 1 de vida",
    badge_mimic4_name: "Economía de Guerra", badge_mimic4_desc: "Ten 10 torres generadoras en el mapa",
    badge_corruptMimic_name: "Oro Corrupto", badge_corruptMimic_desc: "Encuentra un Mimic en modo Corrupto",
    badge_mimicRevenge_name: "Traición", badge_mimicRevenge_desc: "Vende una torre de nivel máximo",
    badge_antiNormal_name: "Maestro del Vacío", badge_antiNormal_desc: "Purifica el modo Anti-Normal",
    badge_winFacil_name: "Iniciado", badge_winFacil_desc: "Vence en modo Fácil",
    badge_winNormal_name: "Defensor", badge_winNormal_desc: "Vence en modo Normal",
    badge_winDificil_name: "Guerrero", badge_winDificil_desc: "Vence en modo Difícil",
    badge_winExtremo_name: "Leyenda", badge_winExtremo_desc: "Vence en modo Extremo",
    badge_winCorrupto_name: "Purificador", badge_winCorrupto_desc: "Vence en modo Corrupto",
    badge_una_por_cada_name: "Una por cada", badge_una_por_cada_desc: "Derrota cada variante de Bit y Byte en una misma ronda.",
    badge_explosiones_por_doquier_name: "Explosiones por doquier", badge_explosiones_por_doquier_desc: "Explota al menos 100 veces un IEx en una ronda.",
    badge_urba_complet1_name: "Complesionista Rango-Precio y Explosiones", badge_urba_complet1_desc: "Utiliza el maximo de torres permitidas (con las mejoras).",
    badge_gtackFirst_name: "Ataques directos", badge_gtackFirst_desc: "Compra tu primera G-tack",
    badge_duckgradeFirst_name: "Una actu dorada", badge_duckgradeFirst_desc: "Primera Duckgrade comprada",
    badge_supremeAlliance_name: "La alianza suprema", badge_supremeAlliance_desc: "Usa la G-tack de la familia roja y de la familia gris",
    badge_deepArtillery_name: "Artillería profunda", badge_deepArtillery_desc: "Usa únicamente familias verde y negro",
    badge_meleeBlueRed_name: "Meleapela", badge_meleeBlueRed_desc: "Usa únicamente familias rojas y azules",
    badge_epicEffects_name: "Efectos épicos", badge_epicEffects_desc: "Haz que un enemigo o jefe tenga todos los efectos posibles",
    badge_letsGoGambling_name: "LETS GO GAMBLING!!", badge_letsGoGambling_desc: "Haz que un láser de Robotic Glob colisione con uno de Demonic Glob",
    badge_deepSavings_name: "Ahorros profundos", badge_deepSavings_desc: "Ahorra 1500 Pycoins y Duckpasses",
    badge_maxGlobs_name: "Ni dios soportaría esto", badge_maxGlobs_desc: "Ten el máximo de Globs (con las expansiones de límite) en una partida",
    badge_angelicFortress_name: "LA FORTALEZA ANGELICAL", badge_angelicFortress_desc: "Ten el máximo de vida de la base",
    badge_titaniumBuilding_name: "Edificio de titanio", badge_titaniumBuilding_desc: "Pásate un mapa sin dañar la base",
    badge_encyclopediaMaster_name: "Maestro de la Enciclopedia", badge_encyclopediaMaster_desc: "Completa la enciclopedia Pyce y sube todas las familias de torres al máximo nivel al menos una vez",


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
    tower_Work_Bombot_name: "Work-Bombot",
    tower_Balloon_Glob_name: "Glob Globo",
    tower_Heliglob_name: "Heliglob",
    tower_Alien_Glob_name: "Glob Alien",
    tower_Streamer_Glob_name: "Glob Streamer",
    tower_Gamer_Glob_name: "Glob Gamer",
    tower_Youtuber_Glob_name: "Glob Youtuber",
    tower_limit_increased: "Límite de {name} aumentado",

    // Nombres de Enemigos
    enemy_Stupid_Pyce_name: "Stupid Pyce",
    enemy_Pyce2_name: "Pyce 2.0",
    enemy_Guest_Pyce_name: "Guest Pyce",
    enemy_Symbol_Pyce_name: "Symbol Pyce",
    enemy_Noob_Pyce_name: "Noob Pyce",
    enemy_4motions_Pyce_name: "4motions Pyce",
    enemy_Flower_Pyce_name: "Flower Pyce",
    enemy_SO_Pyce_name: "Serious Outlines Pyce",
    enemy_1x1x1x1_Pyce_name: "1x1x1x1 Pyce",
    enemy_NOeye_Pyce_name: "NOeye Pyce",
    enemy_MoonStar_Pyce_name: "MoonStar Pyce",
    enemy_Stupid_GoldPyce_name: "Stupid GoldPyce",
    enemy_Mimic_Pyce_name: "Mimic Pyce",
    enemy_Bomb_Pyce_name: "Bomb Pyce",
    enemy_Knight_Pyce_name: "Knight Pyce",
    enemy_Cannon_Pycer_name: "Cannon Pycer",
    enemy_Fireflies_name: "Fireflies",
    enemy_Arky_name: "Arky",
    enemy_CrystArky_name: "CrystArky",
    enemy_ArkyVoid_name: "ArkyVoid",
    enemy_HoloPyce_name: "HoloPyce",
    enemy_Strechy_Pyce_name: "Strechy Pyce",
    enemy_Rebel_Pyce_name: "Rebel Pyce",

    enemy_Stupid_Pyce_desc: "El primer enemigo del juego, es un Pyce desactualizado, pero que cumplio con su funcion de ser un heroe en sus tiempos.",
    enemy_Pyce2_desc: "Manejado por PixelStar Studios, fue actualizado para parecerse mas a un humano, aprendiendo de sus propios errores, siendo ahora lo mejor de Bitlands, aparte de la tableta Pixible, claro.",
    enemy_Guest_Pyce_desc: "Amigo de Noob Pyce, este clásico Pyce cuenta con una espada que no dudará en usar.",
    enemy_Symbol_Pyce_desc: "Era un simbolo en una piramide, pero cobro vida. ¿Sera el antes de los Pyce? O estos se crearon gracias al Prototipo...",
    enemy_Noob_Pyce_desc: "Amigo de Guest Pyce, este novato tiene una pistola y pese a tener una bomba y una bebida, no las usa... Quizas no sabe usarlas.",
    enemy_4motions_Pyce_desc: "Basado en cierto persoaje de tutorial, este cuenta con cuatro emociones diferentes, vaya dilema.",
    enemy_Flower_Pyce_desc: "Flor que le gustan los ventiladores, pero que dice cosas demasiado extrañas, puede ser que se deba a que es mitad planta y mitad robot.",
    enemy_SO_Pyce_desc: "Pese a ser una broma, se hizo popular entre el diseñador (<span style=\"color:grey; text-decoration:underline;\">JustAUser</span>) y <span style=\"color:pink; text-decoration:underline;\">Kirb</span>, tanto asi que se volvio canon.",
    enemy_1x1x1x1_Pyce_desc: "El jefe malvado que aterroriza a Guest y Noob Pyces, su espada y poder son glitcheadores, pero un buen disparo puede derribarlo.",
    enemy_NOeye_Pyce_desc: "Un ser de materia negra que fue abandonado y sin hogar, ahora busca venganza, controlando a Pyces como si fueran marionetas.",
    enemy_MoonStar_Pyce_desc: "Un Pyce corrompido por el mal uso del Bitcore, ahora atiende al mal y al poder estelar descontrolado.",
    enemy_Stupid_GoldPyce_desc: "Un Stupid Pyce de oro que suele ser rápido.",
    enemy_Mimic_Pyce_desc: "Un Pyce 2.0 que se escondió en un cofre, no es que tenga miedo, quiere ser especial.",
    enemy_Bomb_Pyce_desc: "Una bomba sin extremidades concebida como Pyce, pero su vida es corta y nunca dura lo suficiente.",
    enemy_Knight_Pyce_desc: "Un soldado fiel a su rey, desterrado de su hogar por NOeye. Ha aguantado 3 años de retiro para renovarse y volver... Aunque no estuvo ni en Techspawn ni en Bitlands.",
    enemy_Cannon_Pycer_desc: "Un Pyce rojo que utiliza un cañón de madera (o un tubo y dos ruedas, quién sabe)... Es fan de la dinamita, que en realidad es un barril de pólvora metido en cañones.",
    enemy_Fireflies_desc: "Al contrario de lo que su nombre sugiere, son unas mariposas hechas de fuego, no unas luciernagas... Y no es para tanto, si no fuera por su resistencia hacia las quemaduras, que de hecho lo deberian curar... ¿Acaso si quiera se le puede quemar?",
    enemy_Arky_desc: "Un jefe dentro de un casino que afirma servir como fuente de fortuna, pero siempre se lleva la parte mas grande de aquellos que juegan adentro, asi que puede ser que no sea tan bueno como parezca. ¡Pero es afortunado!",
    enemy_CrystArky_desc: "Arky se imbuyo de tanto energia oscura y magica por los cielos nocturnos, tanto que le han crecido cristales y sus fichas de casino se volvieron gemas... Podria venderlas e irse del casino, pero los usa como simbolo de fortuna y riqueza.",
    enemy_ArkyVoid_desc: "El lado perverso de Arky, junto un extraño y potente virus llamado 3RR0R lo transformaron y cambio su ruleta por un portal interdimensional, ademas de que ahora es un mago ¡Y robara toda la plata que pueda!",
    enemy_HoloPyce_desc: "Un holograma de la olvidada 'True Form', una poderosa transformación antigua de los Pyces proveniente de Techspawn. Con el tiempo se oxidó y quedó en el olvido, siendo reemplazada por la Portalogía moderna de Bitlands.",
    enemy_Strechy_Pyce_desc: "Un Pyce con forma de robloxiano que muy a pesar de dictar que NO SERIA un Pyce, pues lo acabo siendo, vistiendose como uno. ¿O acaso eso no son ropas? ¿Ah no, que es un Pyce y no un cosplay? Ayayay... En fin, es mas amable que cualquier Pyce supuestamente.",
    enemy_Rebel_Pyce_desc: "Nacido en Bitlands como clon del Pyce 2.0, este rebelde pintarrajea y grafitea por la ciudad cuando se le da la gana y se escabulle... Para ser una copia, es muy distinto al original y no para quieto!",
    enemy_Spyware_name: "Spyware",
    enemy_Spyware_desc: "Pese a ser familiares de los Bits, la función de estos espías es simple, entrar en el casino y robar tanta información como puedan... Pertenecen a una organización un tanto dudosa, que crea distintos seres digitales a la realidad.",
    enemy_Bit_name: "Bit",
    enemy_Byte_name: "Byte",
    enemy_BitY1_desc: "Los Bits son pequeños sistemas de programación convertidos en diminutos viruses, pero no hacen daño... ¿Verdad? (Variante Feliz)",
    enemy_BitB4_desc: "Los Bits son pequeños sistemas de programación convertidos en diminutos viruses, pero no hacen daño... ¿Verdad? (Variante Enfadada)",
    enemy_BitG2_desc: "Los Bits son pequeños sistemas de programación convertidos en diminutos viruses, pero no hacen daño... ¿Verdad? (Variante Tranquila)",
    enemy_BitP3_desc: "Los Bits son pequeños sistemas de programación convertidos en diminutos viruses, pero no hacen daño... ¿Verdad? (Variante Mareada)",
    enemy_Byte_desc: "Los Bytes son agrupaciones de 2 Bits, aun y eso se consideran Bytes por ser 4 formas de estas agrupaciones de 2 Bits, ya que 4x2 son 8... Y los Bytes se constituyen de 8 bits... ¿Cierto? Bueno. Yo no lo pondría en duda.",
    tower_Bomb_Glob_name: "Bomb Glob",
    tower_TNT_Glob_name: "TNT Glob",
    tower_Nuclear_Glob_name: "Nuclear Glob",
    tower_IEx_name: "Instantánea Explosiva",
    tower_IEx1_desc: "Un Glob con una bomba en su cabeza, mas le vale tener cuidado! Una explosion y adios. Una torre que explota cuando alguien toca su área, desapareciendo después de eso. A más nivel, más grande la explosión.<br><br><span style=\"color: grey\">Diseñado por JustAUser. Planeado por KirByte_Bi.</span>",
    tower_IEx2_desc: "Ahora con pequeñas dinamitas, pueden parecer poco, pero con una explosion basta para demostrar su poder en polvora. Explota al contacto, con mayor rango de explosión que su predecesora.<br><br><span style=\"color: grey\">Diseñado por JustAUser. Planeado por KirByte_Bi.</span>",
    tower_IEx3_desc: "Una nuke bien hecha radica cualquier ser de la existencia... Y este lo conoce bien, tanto asi que su vida parece nula frente a los demas Globs. Desata una explosión colosal al contacto.<br><br><span style=\"color: grey\">Diseñado por JustAUser. Planeado por KirByte_Bi.</span>",
    tower_Worker_Glob_name: "Worker Glob",
    tower_Police_Glob_name: "Police Glob",
    tower_Planked_Glob_name: "Planked Glob",
    tower_DJ_Glob_name: "DJ Glob",
    tower_Worker_Glob_desc: "Genera una valla normal en su radio, esta actúa como un escudo temporal con poca vida, al ser destruido, genera un poquísimo daño.<br><br><span style=\"color: #ff8c00\">Diseñado por Credible. Planeado por KirByte_Bi.</span>",
    tower_Police_Glob_desc: "Genera una valla gelatinosa que ralentiza durante un poco tiempo al enemigo que la destruya, también hace un poco más de daño y tiene más rango, por lo que puede poner más vallas.<br><br><span style=\"color: #ff8c00\">Diseñado por Credible. Planeado por KirByte_Bi.</span>",
    tower_Planked_Glob_desc: "Genera una valla atornillada que a parte de hacer bastante daño, hará un daño en área, es buena para parar hordas de enemigos fácilmente.<br><br><span style=\"color: #ff8c00\">Diseñado por Credible. Planeado por KirByte_Bi.</span>",
    tower_DJ_Glob_desc: "Genera una valla de radio que no solo es muy potente a nivel defensivo y de ataque, sino que esta también tiene un radio de ataque que ralentiza y puede frenar al Pyce que tenga delante por unos segundos.<br><br><span style=\"color: #ff8c00\">Diseñado por Credible. Planeado por KirByte_Bi.</span>",
    enc_tab_gambling: "Gambling Enemies",
    tower_Balloon_Glob_desc: "Su gran sueño es llegar al espacio. En sus primeros intentos urbanos, utiliza simples globos para surcar los cielos de Urbanistic Road.",
    tower_Heliglob_desc: "Para elevarse sobre los rascacielos, ha evolucionado para pilotar un helicóptero. Las estrellas están un poco más cerca.",
    tower_Alien_Glob_desc: "¡Sueño cumplido! Ha alcanzado el cosmos y vuelto con tecnología alienígena, listo para dominar el campo de batalla urbano con poderes de otro mundo.",
    tower_Streamer_Glob_desc: "Un Glob que sueña con volverse rico y de éxito. Empezó como un humilde streamer novato en su cuarto.",
    tower_Gamer_Glob_desc: "Con el tiempo se convirtió en un gamer competitivo reconocido en toda la ciudad, pero la fama aún no era suficiente.",
    tower_Youtuber_Glob_desc: "Finalmente alcanzó el éxito como un famoso Youtuber y tiene dinero para aventar... Aunque ya es hora de que deje el internet y busque un trabajo de verdad.",

    login_user: "Nombre de Usuario", login_pass: "Contraseña", login_btn: "Unirse a la batalla",
    select_map: "Seleccionar Mapa",
    select_mode: "Seleccionar Modo",
    backToModes: "Selección de Modo",

    btn_achievements: "🏆 Logros",
    btn_encyclopedia: "📖 Enciclopedia",
    enc_tab_globs: "Familias Glob",
    enc_tab_enemies: "Enemigos",
    enc_tab_pyces: "Pyces",
    enc_tab_other: "Otros Enemigos",
    enc_tab_gambling: "Gambling Enemies",
    enc_tab_badges: "Emblemas",

    shop_title: "🛒 Tienda de Kirb",
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
    evolve_btn_text: "Evolucionar a {name}",
    prestige_duckpass: "¡Prestigio Duck Pass! +2 Ducky Pass",
    level_duckpass: "¡Nivel {level} del Duck Pass! +1 Ducky Pass",
    look_defender: "¿Qué miras, Defensor? 👉",
    code_hint: "¡Vaya! Te veo un poco perdido. Prueba con este código: ",
    logo_press: "¿Por qué pulsas el logo?",
    stop_logo: "¡¡¡DEJA DE PULSAR EL DICHOSO LOGO!!!",
    logo_secret: "Esto no va a desbloquear nada... ¿O sí? 🤨",
    code_already_used: "¡Código ya usado!",
    evolve_to: "Evolucionar a {name}",
    sell_tower: "Vender",
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
    settings_title: "⚙ Ajustes",
    shop_equip: "Equipación",
    show_shop_desc: "Mostrar descripción en tienda",
    show_total_damage: "Ver Daño Total de torres",
    show_ranges: "Ver Rango de torres",
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
    reset_progress_btn: "🧨 Resetear Todo el Progreso 🧨",
    reset_confirm_1: "¡CUIDADO! Esto borrará todas tus skins, mejoras y logros. ¿Estás seguro?",
    reset_confirm_2: "¡Último aviso! No hay vuelta atrás. ¿SEGURO?",
    reset_confirm_3: "Vale... si pulsas una vez más, se acabó todo. ¿DE VERDAD?",
    reset_done: "Progreso reseteado. El juego se reiniciará.",
    story_logs_btn: "Historia y Logs",
    story_tab_lore: "Lore",
    story_tab_mechanics: "Mecánicas",
    story_tab_logs: "Update Logs",

    // Mejoras de Tienda
    upgrade_hp_name: "Salud de Base",
    upgrade_hp_desc: "+20 Salud Máxima",
    upgrade_unlock_old_name: "Desbloquear Old Glob (Gris)",
    upgrade_unlock_old_desc: "Permite comprar Old Globs en combate (150 PyCoins)",
    upgrade_unlock_comet_name: "Desbloquear Glob Cometa (Negra)",
    upgrade_unlock_comet_desc: "Permite comprar Globs Cometa en combate (250 PyCoins)",
    upgrade_limit_name: "Límite: {name}",
    upgrade_limit_desc: "Aumenta límite de {name}",

    // Sets de Skins
    skin_military_name: "Set Militar",
    skin_military_desc: "Una skin tipica de los defensores de torres, pero que no te confunda, que viene inspirada musicalmente.<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Creado por: KirByte_Bi</span>",
    skin_music_name: "Set Musical",
    skin_music_desc: "Inspirada musicalmente junto la Militar. ¡Este set contiene musica que daña de cerca! ¿Se lo pueden creer? ¡La musica daña!<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Creado por: KirByte_Bi</span>",
    skin_abyssal_name: "Set Abismal",
    skin_abyssal_desc: "Set acuatico, de una pecera a un tiburon, y esa pecera ya estaba preparada junto los millones de Globs que estaban planeados.<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Creado por: KirByte_Bi</span>",
    skin_business_name: "Set Empresarial",
    skin_business_desc: "De un puesto de gelatina a una gran fábrica.<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Creado por: KirByte_Bi</span>",
    skin_universolar_name: "Set Universolar",
    skin_universolar_desc: "Un tema galactico simple, no tiene mucha logica detras, asi que mejor no se la busques.<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Creado por: KirByte</span>",
    skin_robotibu_name: "RoboTibu",
    skin_robotibu_desc: "Un tiburon metalico que dispara minas (o bombas), creo que me resulta familiar...",
    skin_globsus_name: "GlobSus",
    skin_globsus_desc: "Muy sospechoso... ¿Quien sabe? Alomejor es un impostor.",
    skin_turret_name: "Set Torreta",
    skin_turret_desc: "¡Tecnología de defensa aérea e intergaláctica para la línea gris!<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Creado por: KirByte_Bi</span>",
    skin_corrupt_swords_name: "Espadas Corrompidas",
    skin_corrupt_swords_desc: "Los supuestos amos de las espadas legendarias vistos hasta la DEMO 5.<br><span style='font-size:0.8em; color:#aaa;'>El derecho de los personajes vistos aqui les pertecene al equipo de Block Tales, los Globs a Kirb.</span><br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Creado por: KirByte</span>",
    skin_starry_name: "Starry (Destellito)",
    skin_starry_desc: "¡Colaboración especial con StarJump! Dispara estrellas cósmicas.<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Creado por: KirByte</span>",
    skin_mimic_name: "Mimic set",
    skin_mimic_desc: "Skin especial obtenida al derrotar al Mimic Pyce.<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Creado por: KirByte</span>",
    upgrade_range_name: "Alcance Maestro",
    upgrade_range_desc: "+20 Alcance para todas las torres",
    upgrade_damage_name: "Poder del Pato",
    upgrade_damage_desc: "+15% Daño para todas las torres",
    duckgrade_title: "Duckgrades",
    duckgrade_glob_name: "Sincronía Pato",
    duckgrade_glob_desc: "Globs Verdes disparan +50% rápido cerca de Patos.",
    duckgrade_red_name: "Furia Roja",
    duckgrade_red_desc: "+10% daño por cada Glob Rojo en el mapa.",
    duckgrade_soap_name: "Burbuja Paralizante",
    duckgrade_soap_desc: "Probabilidad de paralizar enemigos al impactar.",
    duckgrade_comet_name: "Impacto Crítico",
    duckgrade_comet_desc: "15% prob. de hacer daño x2 (Crítico).",
    duckgrade_pyce_name: "Error de Sistema",
    duckgrade_pyce_desc: "A veces dispara en todas direcciones (Spin).",
    duckgrade_old_name: "Inmunidad Gris",
    duckgrade_old_desc: "Las torres en un radio cercano de una torre Gris son inmunes a aturdimientos y ralentizaciones.",
    duckgrade_bombot_name: "Bomba Saltarina",
    duckgrade_bombot_desc: "Las bombas rebotan y explotan dos veces.",
    duckgrade_duck_name: "Pato Defensivo",
    duckgrade_duck_desc: "Genera dinero más rápido cerca de enemigos y hace daño de área.",
    duckgrade_iex_name: "Detonación Tóxica/Ígnea",
    duckgrade_iex_desc: "Las explosiones aplican quemaduras o tóxico dependiendo de la evolución.",
    duckgrade_worker_name: "Re-trampa",
    duckgrade_worker_desc: "Las trampas pueden ser activadas una segunda vez por un enemigo distinto.",
    max_reached: "NIVEL MÁXIMO",

    // G-Tacks
    gtack_green_name: "Green G-Tack: Frenesí",
    gtack_green_desc: "Frenesí de Disparos: Al activarla en combate, la torre verde de nivel máximo lanza 10 disparos de ametralladora casi instantáneos. Cuesta 400 Globets activar. (¡MUY OP!)",
    gtack_red_name: "Red G-Tack: Sobrecarga",
    gtack_red_desc: "Sobrecarga de Ataque: Al activarla en combate, la torre roja de nivel máximo gana +5% de daño y aplica un efecto Tóxico DoT muy rápido. Cuesta 400 Globets activar.",
    gtack_blue_name: "Blue G-Tack: Rayo Paralizante",
    gtack_blue_desc: "Impacto Relámpago: Al activarla en combate, el próximo ataque de la torre azul de nivel máximo stunea a los enemigos garantizadamente, ¡INCLUYENDO JEFES! Cuesta 400 Globets activar.",
    gtack_yellow_name: "Yellow G-Tack: Lluvia Financiera",
    gtack_yellow_desc: "Lluvia de Divisas: Al activarla en combate, la torre amarilla de nivel máximo genera 15 PyCoins y 3 DuckPasses. Cuesta 500 Globets activar.",
    gtack_black_name: "Black G-Tack: Contagio",
    gtack_black_desc: "Hongo Venenoso: Al activarla en combate, la torre negra de nivel máximo aplica veneno DoT (calavera/seta) que se propaga entre enemigos al morir o tocarse. Cuesta 400 Globets activar. (¡MUY OP!)",
    gtack_grey_name: "Grey G-Tack: Amplificación",
    gtack_grey_desc: "Ampliación de Radar: Al activarla en combate, aumenta el rango de ataque de TODAS las torres del mapa en +50 por 10s. Cuesta 400 Globets activar.",
    gtack_iex_name: "IEx G-Tack: Detonación en Cadena",
    gtack_iex_desc: "Explota automáticamente todos los IEx y aumenta temporalmente la cadencia de disparo de las torres cercanas.",
    gtack_worker_name: "Worker G-Tack: Actividad Policial",
    gtack_worker_desc: "Activa todas las trampas brevemente y acelera su colocación.",
    gtack_buy: "Comprar",
    gtack_active: "Activo",
    gtack_req_lvl: "🔒 Req. Lvl 50",

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
    skin_buff_damage1_desc: "+5% Daño Permanente.",
    skin_buff_range1_name: "Visión de Águila",
    skin_buff_range1_desc: "+10 Alcance Permanente.",
    skin_buff_speed1_name: "Cadencia Mejorada",
    skin_buff_speed1_desc: "+5% Velocidad de Ataque.",
    skin_buff_damage2_name: "Ingeniería de Bitlands",
    skin_buff_damage2_desc: "+10% Daño Extra.",

    // Descripciones de Torres
    tower_Glob_desc: "Un humilde habitante de Bitlands. Lanza orbes de pura energía verde para defender su hogar. Confiable y leal.",
    tower_Poop_Glob_desc: "Su extraña dieta le ha otorgado una densidad abrumadora. Lanza proyectiles fangosos que golpean con fuerza bruta.",
    tower_Golden_Glob_desc: "Bañado en riquezas, este Glob ha perfeccionado su técnica. Sus proyectiles de oro puro son letales y extremadamente veloces.",
    tower_Rainbow_Glob_desc: "La leyenda de Bitlands. Ha trascendido los colores primarios para canalizar láseres prismáticos que destrozan todo a su paso.",
    tower_Red_Glob_desc: "Lleno de adrenalina y furia contenida. Prefiere el combate cuerpo a cuerpo para asestar golpes a una velocidad cegadora.",
    tower_Molten_Glob_desc: "La furia lo ha consumido hasta derretirlo. Su cuerpo irradia un calor intenso que carboniza a quienes se atrevan a acercarse.",
    tower_Robotic_Glob_desc: "Mejorado con tecnología de PixelStar. Este cíborg erradica a los intrusos desde la distancia con un poderoso láser perforador.",
    tower_Soap_Glob_desc: "Amante de la limpieza. Sopla burbujas resbaladizas que atrapan y desorientan a los enemigos, ralentizando su avance.",
    tower_Cotton_Glob_desc: "Suave, tierno y engañosamente resistente. Su campo estático de algodón frena casi por completo cualquier asalto enemigo.",
    tower_Ducky_Glob_desc: "El banquero de los Globs. No ataca, pero su habilidad para encontrar monedas brillantes asegura la economía de tus defensas.",
    tower_Golden_Ducky_Glob_desc: "Realeza financiera. Su plumaje dorado bendice tu tesoro, generando inmensas fortunas en un abrir y cerrar de ojos.",
    tower_Comet_Glob_desc: "Extraído de las estrellas. Lanza astros celestiales como boomerangs para diezmar a las hordas enemigas desde lejos.",
    tower_Dark_Glob_desc: "Corrompido por el vacío del universo. Desata diamantes oscuros que perforan la propia tela de la realidad y a sus enemigos.",
    tower_Demglob_desc: "La encarnación de la destrucción. Surgió de las sombras más profundas de Bitlands para aniquilar Pyces con caos puro.",
    tower_Pyce_Glob_desc: "Un Glob infectado por el mismo código que creó a los Pyces. Su inestabilidad genera ráfagas anómalas de alta velocidad.",
    tower_Old_Glob_desc: "El sabio ancestro. Conoce los secretos de la tierra y lanza rocas inquebrantables imbuídas de magia antigua.",
    tower_Work_Bombot_desc: "Un prototipo desechado que encontró su propósito. Desencadena explosiones devastadoras de área.",
    tower_Worker_Glob_desc: "Genera una valla normal en su radio que actúa como escudo temporal con baja salud, causando ligero daño al destruirse.<br><br>Se dedicaba al mantenimiento urbano, aunque alguna actualizacion hacia, ahora solo crea vallas que alguna vez fueron pensadas para otro amigo suyo.<br><br><span style=\"color: #ff4500\">Diseñado por Credible. Planeado por KirByte_Bi.</span>",
    tower_Police_Glob_desc: "Genera una valla gelatinosa que ralentiza a los enemigos por un corto tiempo al destruirse, causa más daño y tiene mayor rango para colocar más vallas.<br><br>Lejos de la contruccion, este se dedica a mantener el orden y la seguridad mientras es salpicado por otros Globs, pero lejos de estar furioso, este lo aprovecha para mejorar sus trampas.<br><br><span style=\"color: #ff4500\">Diseñado por Credible. Planeado por KirByte_Bi.</span>",
    tower_Planked_Glob_desc: "Genera una valla atornillada que causa gran daño, incluyendo daño de área al destruirse. Genial para detener hordas fácilmente.<br><br>Da miedo verlo, ya no es tan bueno como parece, y lo que si parece es tener amistad con Molten Glob... Pero dudo que sea por su relacion, algo me dice que el color influye.<br><br><span style=\"color: #ff4500\">Diseñado por Credible. Planeado por KirByte_Bi.</span>",
    tower_DJ_Glob_desc: "Genera una valla de radio muy poderosa ofensiva y defensivamente, y tiene un radio de ataque que ralentiza y puede detener al Pyce frente a ella por unos segundos.<br><br>Lejos de ser alguien dedicado a la musica, este usa altavoces como defensa, pero es amigo tanto de la familia rosa como de la blanca, animandolos y haciendo de la ciudad una discoteca urbana.<br><br><span style=\"color: #ff4500\">Diseñado por Credible. Planeado por KirByte_Bi.</span>",
    easter_egg_warn_1: "¿Qué miras, Defensor? Deja de presionarlo.",
    easter_egg_warn_2: "¡DEJA DE PRESIONAR EL MALDITO LOGO!",
    easter_egg_corrupt: "SISTEMA CORROMPIDO. MODO ANTI-NORMAL FORZADO.",
    system_corrupt_error: "S1S73M4 C0RRUP70",
    glitch_shields: "S1S73M_GL1TCH: ESCUDOS ACTIVADOS",
    almanac_gtack_active: "🌟 G-Tack Activa",
    almanac_duckgrade_active: "🦆 Duckgrade Activa",
    almanac_damage: "🗡️ Daño:",
    almanac_range: "🎯 Rango:",
    almanac_speed: "⚡ Vel:",
    almanac_hp: "❤️ HP:",
    almanac_reward: "💰 +",
    mechanic_common: "Enemigo Común",
    mechanic_spyware: "Spywares: Las primeras y segundas evos de las torres no lo pueden atacar, pero las trampas pueden dañarlo.",
    mechanic_mimic: "Cazatesoros: ¡Atrápalo rápido antes de que huya!",
    mechanic_boss: "Jefe Imparable: Altamente resistente al control de masas.",
    mechanic_tank: "Tanque: Absorbe grandes cantidades de daño.",
    mechanic_speed: "Velocista: Se mueve ágilmente esquivando ataques lentos.",
    mechanic_support: "Soporte: Cura a los enemigos cercanos constantemente.",
    mechanic_annoying: "Molesto: Puede aturdir torres, reduciendo tu DPS.",
    mechanic_guest: "Dicho Pyce puede usar la espada para aturdir tus torres si están cerca de él.",
    mechanic_gold: "¡¡Atrápalo para ganar recursos como Globetines o Pycoins!!",
    mechanic_mimic_special: "¡¡Derrotarlo hará que lo obtengas como skin para la familia negra!!",
    mechanic_bomb: "Explota al ser desconectado (destruido), aturdiendo a los Globs cercanos.",
    mechanic_cannon: "Molesto: Puede aturdir torres, reduciendo tu DPS.",
    mechanic_knight: "Dicho Pyce puede usar la espada para aturdir tus torres si están cerca de él.",
    mechanic_arky: "Inmunidad Cambiante: Cambia su inmunidad aleatoriamente entre quemaduras, veneno o ralentizaciones.",
    mechanic_crystarky: "Inmunidad Cambiante + Escudo Cristalino: Posee un escudo inicial que duplica su vida base.",
    mechanic_arkyvoid: "Inmunidad Cambiante + Brecha de Área: Reduce temporalmente en un 10% el rango de hasta 3 torres.",
    mechanic_moonstar: "Escudo Cósmico: Posee un escudo inicial que duplica su vida base. Ignora el daño en la primera vuelta.",
    mechanic_holo: "Intangible: Las primeras evoluciones de las torres no le pueden hacer daño, ¡usa trampas o torres mejoradas!",
    badge_unlocked: "¡DESBLOQUEADO!",
    badge_locked: "BLOQUEADO",
    badge_reward_label: "RECOMPENSA: "
  },
  en: {
    health: "Health", money: "Globets", wave: "Wave",
    startWave: "Start Wave", autoWave: "Auto-Wave",
    autoWaveActive: "Auto-ON", cancel: "Cancel",
    gameOver: "💀 GAME OVER 💀", playAgain: "Retry",
    achievements: "Achievements", notEnoughMoney: "💸 No Globets",
    towerPlaced: "✓ {name} placed",
    towerEvolved: "✨ Evolved to {name}!",
    towerSold: "🛍 Sold for {price}",
    waveStarted: "Wave {wave} started!",
    waveCompleted: "Wave {wave} completed!",
    enemyReachedEnd: "⚠ Base took damage!",
    pyceGlobUnlocked: "🌀 Pyce Glob unlocked!",
    adminMode: "ADMIN MODE",
    codeSuccess: "⭐ Code accepted: {name} unlocked",
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
    badge_mimic2_name: "Treasure Hunter II", badge_mimic2_desc: "Find 2 Mimics in one match",
    badge_mimic3_name: "Crystal Aura", badge_mimic3_desc: "Finish a wave with exactly 1 base health",
    badge_mimic4_name: "War Economy", badge_mimic4_desc: "Have 10 generating towers on the map",
    badge_corruptMimic_name: "Corrupt Gold", badge_corruptMimic_desc: "Find a Mimic in Corrupt mode",
    badge_mimicRevenge_name: "Betrayal", badge_mimicRevenge_desc: "Sell a max level tower",
    badge_antiNormal_name: "Void Master", badge_antiNormal_desc: "Purify the Un-Normal mode",
    badge_winFacil_name: "Beginner", badge_winFacil_desc: "Win in Easy mode",
    badge_winNormal_name: "Defender", badge_winNormal_desc: "Win in Normal mode",
    badge_winDificil_name: "Warrior", badge_winDificil_desc: "Win in Hard mode",
    badge_winExtremo_name: "Legend", badge_winExtremo_desc: "Win in Extreme mode",
    badge_winCorrupto_name: "Purifier", badge_winCorrupto_desc: "Win in Corrupt mode",
    badge_una_por_cada_name: "One of each", badge_una_por_cada_desc: "Defeat each Bit and Byte variant in one round.",
    badge_explosiones_por_doquier_name: "Explosions Everywhere", badge_explosiones_por_doquier_desc: "Explode at least 100 times an IEx in a round.",
    badge_urba_complet1_name: "Completionist Range-Price and Explosions", badge_urba_complet1_desc: "Use the maximum allowed towers (with upgrades).",
    badge_gtackFirst_name: "Direct Attacks", badge_gtackFirst_desc: "Buy your first G-tack",
    badge_duckgradeFirst_name: "A Golden Upgrade", badge_duckgradeFirst_desc: "First Duckgrade purchased",
    badge_supremeAlliance_name: "The Supreme Alliance", badge_supremeAlliance_desc: "Use the G-tack of both the Red family and the Grey family",
    badge_deepArtillery_name: "Deep Artillery", badge_deepArtillery_desc: "Use only Green and Black families",
    badge_meleeBlueRed_name: "Meleapela", badge_meleeBlueRed_desc: "Use only Red and Blue families",
    badge_epicEffects_name: "Epic Effects", badge_epicEffects_desc: "Make an enemy or boss have all possible status effects",
    badge_letsGoGambling_name: "LETS GO GAMBLING!!", badge_letsGoGambling_desc: "Make a laser from Robotic Glob collide with one from Demonic Glob",
    badge_deepSavings_name: "Deep Savings", badge_deepSavings_desc: "Save 1500 Pycoins and Duckpasses",
    badge_maxGlobs_name: "Not Even God Can Stand This", badge_maxGlobs_desc: "Have the maximum allowed number of Globs in a single match",
    badge_angelicFortress_name: "THE ANGELIC FORTRESS", badge_angelicFortress_desc: "Have the absolute maximum base health",
    badge_titaniumBuilding_name: "Titanium Building", badge_titaniumBuilding_desc: "Complete a map without taking base damage",
    badge_encyclopediaMaster_name: "Encyclopedia Master", badge_encyclopediaMaster_desc: "Complete the Pyce encyclopedia and upgrade all tower families to max level at least once",


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
    tower_Bomb_Glob_name: "Bomb Glob",
    tower_TNT_Glob_name: "TNT Glob",
    tower_Nuclear_Glob_name: "Nuclear Glob",
    tower_Ducky_Glob_name: "Ducky Glob",
    tower_Golden_Ducky_Glob_name: "Golden Ducky",
    tower_Comet_Glob_name: "Comet Glob",
    tower_Dark_Glob_name: "Dark Glob",
    tower_Demglob_name: "Demglob",
    tower_Pyce_Glob_name: "Pyce Glob",
    tower_Old_Glob_name: "Elder Glob",
    tower_Work_Bombot_name: "Work-Bombot",
    tower_Balloon_Glob_name: "Balloon Glob",
    tower_Heliglob_name: "Heliglob",
    tower_Alien_Glob_name: "Alien Glob",
    tower_Streamer_Glob_name: "Streamer Glob",
    tower_Gamer_Glob_name: "Gamer Glob",
    tower_Youtuber_Glob_name: "Youtuber Glob",
    tower_limit_increased: "{name} limit increased",

    // Enemy Names
    enemy_Stupid_Pyce_name: "Stupid Pyce",
    enemy_Pyce2_name: "Pyce 2.0",
    enemy_Guest_Pyce_name: "Guest Pyce",
    enemy_Symbol_Pyce_name: "Symbol Pyce",
    enemy_Noob_Pyce_name: "Noob Pyce",
    enemy_4motions_Pyce_name: "4motions Pyce",
    enemy_Flower_Pyce_name: "Flower Pyce",
    enemy_SO_Pyce_name: "Serious Outlines Pyce",
    enemy_1x1x1x1_Pyce_name: "1x1x1x1 Pyce",
    enemy_NOeye_Pyce_name: "NOeye (Pyce)",
    enemy_MoonStar_Pyce_name: "MoonStar Pyce",
    enemy_Stupid_GoldPyce_name: "Stupid GoldPyce",
    enemy_Mimic_Pyce_name: "Mimic Pyce",

    enemy_Stupid_Pyce_desc: "The first enemy of the game, an outdated Pyce, but it fulfilled its role as a hero in its time.",
    enemy_Pyce2_desc: "Managed by PixelStar Studios, it was updated to look more like a human, learning from its own mistakes, now being the best of Bitlands, apart from the Pixible tablet, of course.",
    enemy_Guest_Pyce_desc: "Friend of Noob Pyce, this classic Pyce has a sword it won't hesitate to use.",
    enemy_Symbol_Pyce_desc: "It was a symbol on a pyramid, but it came to life. Could it be the predecessor of the Pyces? Or were these created thanks to the Prototype...",
    enemy_Noob_Pyce_desc: "Friend of Guest Pyce, this rookie has a gun and despite having a bomb and a drink, doesn't use them... Maybe it doesn't know how.",
    enemy_4motions_Pyce_desc: "Based on a certain tutorial character, it has four different emotions, what a dilemma.",
    enemy_Flower_Pyce_desc: "A flower that likes fans, but says very strange things, maybe because it's half plant and half robot.",
    enemy_SO_Pyce_desc: "Despite being a joke, it became popular between the designer (<span style=\"color:grey; text-decoration:underline;\">JustAUser</span>) and <span style=\"color:pink; text-decoration:underline;\">Kirb</span>, so much so that it became canon.",
    enemy_1x1x1x1_Pyce_desc: "The evil boss that terrorizes Guest and Noob Pyces, its sword and power are glitchy, but a good shot can take it down.",
    enemy_NOeye_Pyce_desc: "A dark matter being that was abandoned and homeless, now seeks revenge, controlling Pyces like puppets.",
    enemy_MoonStar_Pyce_desc: "A Pyce corrupted by the misuse of the Bitcore, now serves evil and uncontrolled stellar power.",
    enemy_Stupid_GoldPyce_desc: "A golden Stupid Pyce that is usually fast.",
    enemy_Mimic_Pyce_desc: "A Pyce 2.0 that hid in a chest, not that it's scared, it just wants to be special.",
    enemy_Bomb_Pyce_name: "Bomb Pyce",
    enemy_Knight_Pyce_name: "Knight Pyce",
    enemy_Cannon_Pycer_name: "Cannon Pycer",
    enemy_Bomb_Pyce_desc: "A limbless bomb conceived as a Pyce, but its life is short and never lasts long enough.",
    enemy_Knight_Pyce_desc: "A soldier loyal to his king, banished from his home by NOeye. He has endured 3 years of retirement to renew himself and return... Even though he was neither in Techspawn nor in Bitlands.",
    enemy_Cannon_Pycer_desc: "A red Pyce that uses a wooden cannon (or a tube and two wheels, who knows)... It's a fan of dynamite, which is actually a gunpowder barrel stuffed into cannons.",
    enemy_Fireflies_name: "Fireflies",
    enemy_Fireflies_desc: "Contrary to what their name suggests, they are butterflies made of fire, not fireflies... And it's not a big deal, if it weren't for their resistance to burns, which actually should heal them... But can they even be burned?",
    enemy_Arky_name: "Arky",
    enemy_Arky_desc: "A boss inside the casino that claims to serve as a source of fortune, but always takes the lion's share of those who play inside, so maybe he's not as good as he seems. But he is a lucky one!",
    enemy_CrystArky_name: "CrystArky",
    enemy_CrystArky_desc: "Arky was imbued with both dark and magical energy from the night skies, so much so that crystals have grown on him and his casino chips turned into gems... He could sell them and leave the casino, but he uses them as a symbol of fortune and wealth.",
    enemy_ArkyVoid_name: "ArkyVoid",
    enemy_ArkyVoid_desc: "The evil side of Arky, along with a strange and potent virus called 3RR0R, transformed him and changed his roulette for an interdimensional portal, plus he is now a magician who will steal every bit of money he can!",
    enemy_HoloPyce_name: "HoloPyce",
    enemy_Strechy_Pyce_name: "Strechy Pyce",
    enemy_Rebel_Pyce_name: "Rebel Pyce",
    enemy_HoloPyce_desc: "A hologram of the forgotten 'True Form', an ancient powerful transformation of the Pyces from Techspawn. Over time, it rusted and was forgotten, entirely replaced by modern Bitlands Portalogy.",
    enemy_Strechy_Pyce_desc: "A Pyce in the shape of a Robloxian that, despite dictating that it WOULD NOT BE a Pyce, ended up being one, dressing like one. Or are those not clothes? Oh, it's a Pyce and not a cosplay? Oh my... Anyway, it's supposedly friendlier than any Pyce.",
    enemy_Rebel_Pyce_desc: "Born in Bitlands as a clone of Pyce 2.0, this rebel paints and graffitis around the city whenever it wants and sneaks away... For a copy, it's very different from the original and won't stay still!",
    enemy_Spyware_name: "Spyware",
    enemy_Spyware_desc: "Despite being related to Bits, the function of these spies is simple: enter the casino and steal as much information as they can... They belong to a somewhat dubious organization that creates different digital beings from reality.",
    enemy_Bit_name: "Bit",
    enemy_Byte_name: "Byte",
    enemy_BitY1_desc: "Bits are small programming systems converted into tiny viruses, but they do no damage... Right? (Happy Variant)",
    enemy_BitB4_desc: "Bits are small programming systems converted into tiny viruses, but they do no damage... Right? (Angry Variant)",
    enemy_BitG2_desc: "Bits are small programming systems converted into tiny viruses, but they do no damage... Right? (Calm Variant)",
    enemy_BitP3_desc: "Bits are small programming systems converted into tiny viruses, but they do no damage... Right? (Dizzy Variant)",
    enemy_Byte_desc: "Bytes are groupings of 2 Bits, even so they are considered Bytes because there are 4 forms of these groupings of 2 Bits, since 4x2 is 8... And Bytes are made up of 8 bits... Right? Well. I wouldn't doubt it.",
    tower_IEx_name: "Explosive Instant",
    tower_IEx1_desc: "A Glob with a bomb on its head, it better be careful! One explosion and goodbye. A tower that explodes when someone touches its area, disappearing after that. The higher the level, the bigger the explosion.<br><br><span style=\"color: grey\">Designed by JustAUser. Planned by KirByte_Bi.</span>",
    tower_IEx2_desc: "Now with small dynamites, they might seem like little, but one explosion is enough to demonstrate their gunpowder power. Explodes on contact, with a larger blast radius than its predecessor.<br><br><span style=\"color: grey\">Designed by JustAUser. Planned by KirByte_Bi.</span>",
    tower_IEx3_desc: "A well-made nuke wipes any being from existence... And this one knows it well, so much so that its life seems null compared to other Globs. Unleashes a colossal explosion on contact.<br><br><span style=\"color: grey\">Designed by JustAUser. Planned by KirByte_Bi.</span>",
    enc_tab_gambling: "Gambling Enemies",
    tower_Balloon_Glob_desc: "His big dream is to reach space. In his first urban attempts, he uses simple balloons to soar the skies of Urbanistic Road.",
    tower_Heliglob_desc: "To rise above the skyscrapers, he has evolved to pilot a helicopter. The stars are a little closer.",
    tower_Alien_Glob_desc: "Dream fulfilled! He has reached the cosmos and returned with alien technology, ready to dominate the urban battlefield with otherworldly powers.",
    tower_Streamer_Glob_desc: "A Glob dreaming of becoming rich and successful. He started as a humble rookie streamer in his room.",
    tower_Gamer_Glob_desc: "Over time, he became a competitive gamer renowned throughout the city, but the fame was still not enough.",
    tower_Youtuber_Glob_desc: "Finally, he achieved success as a famous Youtuber and has money to throw around... Although it's time he leaves the internet and gets a real job.",

    tower_Worker_Glob_name: "Worker Glob",
    tower_Police_Glob_name: "Police Glob",
    tower_Planked_Glob_name: "Planked Glob",
    tower_DJ_Glob_name: "DJ Glob",
    tower_Worker_Glob_desc: "Generates a normal fence in its radius that acts as a temporary shield with low health, dealing slight damage when destroyed.<br><br>He used to do urban maintenance, though he did some updating, now he only creates fences that were once meant for another friend of his.<br><br><span style=\"color: #ff4500\">Designed by Credible. Planned by KirByte_Bi.</span>",
    tower_Police_Glob_desc: "Generates a jelly fence that slows enemies down for a short time when destroyed, deals more damage, and has higher range to place more fences.<br><br>Far from construction, he dedicates himself to maintaining order and security while being splashed by other Globs, but far from being furious, he uses it to improve his traps.<br><br><span style=\"color: #ff4500\">Designed by Credible. Planned by KirByte_Bi.</span>",
    tower_Planked_Glob_desc: "Generates a screwed fence that deals heavy damage, including area damage when destroyed. Great for stopping hordes easily.<br><br>He's scary to look at, he's not as good as he seems anymore, and what he does seem to have is a friendship with Molten Glob... But I doubt it's because of their relationship, something tells me the color influences it.<br><br><span style=\"color: #ff4500\">Designed by Credible. Planned by KirByte_Bi.</span>",
    tower_DJ_Glob_desc: "Generates a radio fence that's very powerful offensively and defensively, and has an attack radius that slows and can stop the Pyce in front of it for a few seconds.<br><br>Far from being someone dedicated to music, he uses speakers as defense, but he is friends with both the pink and white families, cheering them up and making the city an urban disco.<br><br><span style=\"color: #ff4500\">Designed by Credible. Planned by KirByte_Bi.</span>",

    login_user: "Username", login_pass: "Password", login_btn: "Join the battle",
    select_map: "Select Map",
    select_mode: "Select Mode",
    backToModes: "Mode Selection",

    btn_achievements: "🏆 Achievements",
    btn_encyclopedia: "📖 Encyclopedia",
    enc_tab_globs: "Glob Families",
    enc_tab_enemies: "Enemies",
    enc_tab_pyces: "Pyces",
    enc_tab_other: "Other Enemies",
    enc_tab_gambling: "Gambling Enemies",
    enc_tab_badges: "Badges",
    mechanic_spyware: "Spywares: The first and second evolutions of the towers cannot attack it, but traps can damage it.",

    shop_title: "🛒 Kirb Shop",
    pass_title: "🦆 Duck Pass",
    code_placeholder: "Secret Code...",
    apply_btn: "Apply",
    new_user_registered: "New user registered!",
    system_unstable: "SY573M UN574BL3...",
    win_diff_required: "Win in {diff} mode or higher to unlock",
    system_restored: "SYSTEM RESTORED",
    anti_normal_active: "4N71-N0RM4L M0D3 4C71V473D (UN-NORMAL)",
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
    look_defender: "What are you looking at, Defender? 👉",
    code_hint: "Whoops! You seem a bit lost. Try this code: ",
    logo_press: "Why are you pressing the logo?",
    stop_logo: "STOP PRESSING THE DAMN LOGO!!!",
    logo_secret: "This won't unlock anything... Or will it? 🤨",
    code_already_used: "Code already used!",
    evolve_to: "Evolve to {name}",
    sell_tower: "Sell",
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
    settings_title: "⚙ï¸  Settings",
    shop_equip: "Equip",
    show_shop_desc: "Show description in shop",
    show_total_damage: "View total tower damage",
    show_ranges: "View tower range",
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
    story_logs_btn: "Story & Logs",
    story_tab_lore: "Lore",
    story_tab_mechanics: "Mechanics",
    story_tab_logs: "Update Logs",

    // Shop Upgrades
    upgrade_hp_name: "Base Health",
    upgrade_hp_desc: "+20 Max Health",
    upgrade_unlock_old_name: "Unlock Old Glob (Grey)",
    upgrade_unlock_old_desc: "Allows placing Old Globs in battle (150 PyCoins)",
    upgrade_unlock_comet_name: "Unlock Comet Glob (Black)",
    upgrade_unlock_comet_desc: "Allows placing Comet Globs in battle (250 PyCoins)",
    upgrade_limit_name: "Limit: {name}",
    upgrade_limit_desc: "Increase limit for {name}",

    // Skin Sets
    skin_military_name: "Military Set",
    skin_military_desc: "A typical tower defense skin, but don't be confused, it's musically inspired.<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Created by: KirByte_Bi</span>",
    skin_music_name: "Music Set",
    skin_music_desc: "Musically inspired alongside the Military set. This set contains music that damages up close! Can you believe it? Music hurts!<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Created by: KirByte_Bi</span>",
    skin_abyssal_name: "Abyssal Set",
    skin_abyssal_desc: "Aquatic set, from a fishbowl to a shark, and that fishbowl was already prepared along with the millions of Globs that were planned.<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Created by: KirByte_Bi</span>",
    skin_business_name: "Business Set",
    skin_business_desc: "From a jelly stand to a giant factory.<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Created by: KirByte_Bi</span>",
    skin_universolar_name: "Universolar Set",
    skin_universolar_desc: "A simple galactic theme, it doesn't have much logic behind it, so you'd better not look for it.<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Created by: KirByte</span>",
    skin_robotibu_name: "RoboTibu",
    skin_robotibu_desc: "A metallic shark that shoots mines (or bombs), I think it looks familiar...",
    skin_globsus_name: "GlobSus",
    skin_globsus_desc: "Very suspicious... Who knows? Maybe it's an impostor.",
    skin_turret_name: "Turret Set",
    skin_turret_desc: "Air defense and intergalactic technology for the grey line!<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Created by: KirByte_Bi</span>",
    skin_corrupt_swords_name: "Corrupted Swords",
    skin_corrupt_swords_desc: "The supposed masters of the legendary swords seen up to DEMO 5.<br><span style='font-size:0.8em; color:#aaa;'>The rights to the characters seen here belong to the Block Tales team, the Globs to Kirb.</span><br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Created by: KirByte</span>",
    skin_starry_name: "Starry",
    skin_starry_desc: "Special collaboration with StarJump! Shoots cosmic stars.<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Created by: KirByte</span>",
    skin_mimic_name: "Mimic Set",
    skin_mimic_desc: "Special skin obtained by defeating the Mimic Pyce.<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Created by: KirByte</span>",
    upgrade_range_name: "Master Range",
    upgrade_range_desc: "+20 Range for all towers",
    upgrade_damage_name: "Duck Power",
    upgrade_damage_desc: "+15% Damage for all towers",
    duckgrade_title: "Duckgrades",
    duckgrade_glob_name: "Duck Sync",
    duckgrade_glob_desc: "Green Globs fire +50% faster near Ducks.",
    duckgrade_red_name: "Red Fury",
    duckgrade_red_desc: "+10% damage for each Red Glob on map.",
    duckgrade_soap_name: "Paralyzing Bubble",
    duckgrade_soap_desc: "Chance to paralyze enemies on hit.",
    duckgrade_comet_name: "Critical Impact",
    duckgrade_comet_desc: "15% chance to deal x2 damage (Crit).",
    duckgrade_pyce_name: "System Error",
    duckgrade_pyce_desc: "Sometimes fires in all directions (Spin).",
    duckgrade_old_name: "Grey Immunity",
    duckgrade_old_desc: "Towers in a close radius of a Grey family tower are immune to stuns and slows.",
    duckgrade_bombot_name: "Bouncing Bomb",
    duckgrade_bombot_desc: "Bombs bounce and explode twice.",
    duckgrade_duck_name: "Defensive Duck",
    duckgrade_duck_desc: "Generates money faster near enemies and deals area damage.",
    duckgrade_iex_name: "Toxic/Fiery Detonation",
    duckgrade_iex_desc: "Explosions apply burn or toxic status depending on the evolution.",
    duckgrade_worker_name: "Re-trap",
    duckgrade_worker_desc: "Traps can be triggered a second time by a different enemy.",
    max_reached: "MAX LEVEL",

    // G-Tacks
    gtack_green_name: "Green G-Tack: Frenzy",
    gtack_green_desc: "Shot Frenzy: When activated in combat, the max-level green tower fires 10 machine-gun shots almost instantly. Costs 400 Globets to activate. (VERY OP!)",
    gtack_red_name: "Red G-Tack: Overcharge",
    gtack_red_desc: "Attack Overcharge: When activated in combat, the max-level red tower gains +5% damage and applies a very fast Toxic DoT effect. Costs 400 Globets to activate.",
    gtack_blue_name: "Blue G-Tack: Paralyzing Ray",
    gtack_blue_desc: "Lightning Impact: When activated in combat, the next attack from the max-level blue tower stuns enemies guaranteed, INCLUDING BOSSES! Costs 400 Globets to activate.",
    gtack_yellow_name: "Yellow G-Tack: Financial Rain",
    gtack_yellow_desc: "Currency Rain: When activated in combat, the max-level yellow tower generates 15 PyCoins and 3 DuckPasses. Costs 500 Globets to activate.",
    gtack_black_name: "Black G-Tack: Contagion",
    gtack_black_desc: "Poison Mushroom: When activated in combat, the max-level black tower applies poison DoT (skull/mushroom) that spreads between enemies on death or contact. Costs 400 Globets to activate. (VERY OP!)",
    gtack_grey_name: "Grey G-Tack: Amplification",
    gtack_grey_desc: "Radar Expansion: When activated in combat, increases the attack range of ALL towers on the map by +50 for 10s. Costs 400 Globets to activate.",
    gtack_iex_name: "IEx G-Tack: Chain Detonation",
    gtack_iex_desc: "Automatically explodes all IEx towers and temporarily increases the fire rate of nearby towers.",
    gtack_worker_name: "Worker G-Tack: Police Activity",
    gtack_worker_desc: "Activates all traps briefly and speeds up their placement.",
    gtack_buy: "Buy",
    gtack_active: "Active",
    gtack_req_lvl: "🔒 Req. Lvl 50",

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
    skin_buff_speed1_desc: "⏱ +5% Attack Speed.",
    skin_buff_damage2_name: "Bitlands Engineering",
    skin_buff_damage2_desc: "⚔️ +10% Extra Damage.",

    // Tower Descriptions
    tower_Poop_Glob_desc: "Born in the Gelatin Lake, its strange diet gives it overwhelming density. It throws fragments of its gelatin or mud projectiles with brute force.",
    tower_Golden_Glob_desc: "Resident of the Gelatin Lake bathed in riches. It shoots golden lasers of pure energy or gold bullets that are lethal and ultra-fast.",
    tower_Rainbow_Glob_desc: "Legend of the Gelatin Lake, it transcends primary colors to channel prismatic lasers that destroy everything.",
    tower_Red_Glob_desc: "Inhabitant of the Gelatin Lake full of adrenaline and fury. Prefers close combat, throwing gelatin fragments with blinding speed.",
    tower_Molten_Glob_desc: "Molded in the Gelatin Lake, its body radiates intense heat and it shoots streams of molten gelatin that carbonize enemies.",
    tower_Robotic_Glob_desc: "Cybernetic from the Gelatin Lake, updated with PixelStar technology, it shoots penetrating lasers from a distance.",
    tower_Soap_Glob_desc: "Lover of the purity of the Gelatin Lake, it blows slippery gelatin bubbles that slow down enemies.",
    tower_Cotton_Glob_desc: "Soft inhabitant of the Gelatin Lake, its static cotton field almost completely stops enemy attacks.",
    tower_Ducky_Glob_desc: "The banker of the Gelatin Lake. It doesn't attack, but finds shiny coins to sustain the economy.",
    tower_Golden_Ducky_Glob_desc: "Financial royalty of the Gelatin Lake. Its golden plumage blesses the treasury, generating fortunes.",
    tower_Comet_Glob_desc: "Extracted from the skies above the Gelatin Lake, this Glob is both gelatinous and galactic; it uses its own stars as a throwing weapon that goes back and forth to decimate hordes.",
    tower_Dark_Glob_desc: "A ruinous Glob, its symbols and power could break reality; good thing it's on your side.",
    tower_Demglob_desc: "Lost in the darkest depths, this demonic and empty Glob can break entire realities, as well as quickly disconnect Pyces... There's a reason it's the most expensive in the game, right?",
    tower_Pyce_Glob_desc: "A mix between the elasticity of a Glob and the behavior and colors of a Pyce. Its shots are so powerful they aren't even considered from this world. Possibly created via Portalogy, the study of the Pyces.",
    tower_Old_Glob_desc: "A grey degraded Glob, nothing would please it more than being considered a good Glob, which is why its shots divide, it is so static that not even its shots are accurate enough to hit the Pyce.",
    tower_Work_Bombot_desc: "A robot that worked as a demolisher; its bombs come from that work. Upon observing the Globs and after an accident and failure in its work, it decided to help these gelatinous creatures, becoming their guide and offering valuable advice. Some see it as similar to a Pyce, as it was conceived as such, but later separated, because they are not the same.",
    tower_Glob_desc: "A humble inhabitant of the Gelatin Lake. It throws green energy orbs to defend its home. Reliable and loyal.",

    easter_egg_warn_1: "What are you looking at, Defender? Stop pressing it.",
    easter_egg_warn_2: "STOP PRESSING THE DAMN LOGO!",
    easter_egg_corrupt: "SYSTEM CORRUPTED. ANTI-NORMAL MODE FORCED.",
    system_corrupt_error: "C0RRUP7 5Y573M",
    glitch_shields: "S1S73M_GL1TCH: SHIELDS ACTIVATED",
    almanac_gtack_active: "🌟 G-Tack Active",
    almanac_duckgrade_active: "🦆 Duckgrade Active",
    almanac_damage: "🗡️ Damage:",
    almanac_range: "🎯 Range:",
    almanac_speed: "⚡ Spd:",
    almanac_hp: "❤️ HP:",
    almanac_reward: "💰 +",
    mechanic_common: "Common Enemy",
    mechanic_mimic: "Treasure Hunter: Catch it quick before it flees!",
    mechanic_boss: "Unstoppable Boss: Highly resistant to crowd control.",
    mechanic_tank: "Tank: Absorbs huge amounts of damage.",
    mechanic_speed: "Speedster: Moves agilely dodging slow attacks.",
    mechanic_support: "Support: Constantly heals nearby enemies.",
    mechanic_annoying: "Annoying: Can stun towers, reducing your DPS temporarily.",
    mechanic_guest: "This Pyce can use the sword to stun your towers if they are close to it.",
    mechanic_gold: "Catch it to earn resources like Globets or Pycoins!!",
    mechanic_mimic_special: "Defeating it will reward you with it as a skin for the black family!!",
    mechanic_bomb: "Explodes upon being disconnected (destroyed), stunning nearby Globs.",
    mechanic_cannon: "Annoying: Can stun towers, reducing your DPS temporarily.",
    mechanic_knight: "This Pyce can use the sword to stun your towers if they are close to it.",
    mechanic_arky: "Shifting Immunity: Randomly changes its immunity between burns, poison, or slows.",
    mechanic_crystarky: "Shifting Immunity + Crystal Shield: Has an initial shield that doubles its base health.",
    mechanic_arkyvoid: "Shifting Immunity + Void Rift: Temporarily reduces the range of up to 3 towers by 10%.",
    mechanic_moonstar: "Cosmic Shield: Has an initial shield that doubles its base health. Ignores damage on the first lap.",
    mechanic_holo: "Intangible: Base towers cannot damage it, use traps or upgraded towers!",
    badge_unlocked: "UNLOCKED!",
    badge_locked: "LOCKED",
    badge_reward_label: "REWARD: "
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
  'Void_Glob': 'img/Void Glob.png',
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
  'DuckyPass': 'img/Tokens/DuckPass.png',
  'Flower_Pyce': 'img/Flower_Pyce.png',
  'Mimic_Pyce': 'img/Skins/Negro Supremo/Mimic Pyce (ENEMY-SKIN)/Mimic Pyce.png',
  
  // NEW URBANISTIC ROAD ASSETS
  'Bomb_Pyce': 'Urbanistic Road (BIG UPDATE)/Enemigos/Pyces/Bomb Pyce.png',
  'Cannon_Pycer': 'Urbanistic Road (BIG UPDATE)/Enemigos/Pyces/Cannon Pycer.png',
  'Knight_Pyce': 'Urbanistic Road (BIG UPDATE)/Enemigos/Pyces/Knight Pyce.png',
  'HoloPyce': 'Urbanistic Road (BIG UPDATE)/Enemigos/Pyces/HoloPyce.png',
  'Strechy_Pyce': 'Urbanistic Road (BIG UPDATE)/Enemigos/Pyces/Strechy Pyce.png',
  'Rebel_Pyce': 'Urbanistic Road (BIG UPDATE)/Enemigos/Pyces/Rebel Pyce.png',
  'Spyware1': 'Urbanistic Road (BIG UPDATE)/Enemigos/Gambling Enemies/Spyware1.png',
  'Spyware2': 'Urbanistic Road (BIG UPDATE)/Enemigos/Gambling Enemies/Spyware2.png',
  'Spyware3': 'Urbanistic Road (BIG UPDATE)/Enemigos/Gambling Enemies/Spyware3.png',
  'Worker_Glob': 'Urbanistic Road (BIG UPDATE)/Globs/Familia Naranja/Worker Glob (EVO1).png',
  'Police_Glob': 'Urbanistic Road (BIG UPDATE)/Globs/Familia Naranja/Police Glob (EVO2).png',
  'Planked_Glob': 'Urbanistic Road (BIG UPDATE)/Globs/Familia Naranja/Planked Glob (EVO3).png',
  'DJ_Glob': 'Urbanistic Road (BIG UPDATE)/Globs/Familia Naranja/DJ Glob (EVO4).png',
  'Worker_Trap': 'Urbanistic Road (BIG UPDATE)/Globs/Familia Naranja/Trampas/Wood Fence (TR1).png',
  'Police_Trap': 'Urbanistic Road (BIG UPDATE)/Globs/Familia Naranja/Trampas/Glimmy Fence (TR2).png',
  'Planked_Trap': 'Urbanistic Road (BIG UPDATE)/Globs/Familia Naranja/Trampas/Planked Fence (TR3).png',
  'DJ_Trap': 'Urbanistic Road (BIG UPDATE)/Globs/Familia Naranja/Trampas/Disco Fence (TR4).png',
  'Bomb_Glob': 'Urbanistic Road (BIG UPDATE)/Globs/Instantanea Explosiva/Bomb Glob (EVO1).png',
  'TNT_Glob': 'Urbanistic Road (BIG UPDATE)/Globs/Instantanea Explosiva/TNT Glob (EVO2).png',
  'Nuclear_Glob': 'Urbanistic Road (BIG UPDATE)/Globs/Instantanea Explosiva/Nuclear Glob (EVO3).png',
  'BitB4': 'Urbanistic Road (BIG UPDATE)/Enemigos/Gambling Enemies/BitB4.png',
  'BitG2': 'Urbanistic Road (BIG UPDATE)/Enemigos/Gambling Enemies/BitG2.png',
  'BitP3': 'Urbanistic Road (BIG UPDATE)/Enemigos/Gambling Enemies/BitP3.png',
  'BitY1': 'Urbanistic Road (BIG UPDATE)/Enemigos/Gambling Enemies/BitY1.png',
  'ByteGB1': 'Urbanistic Road (BIG UPDATE)/Enemigos/Gambling Enemies/ByteGB1.png',
  'BytePG3': 'Urbanistic Road (BIG UPDATE)/Enemigos/Gambling Enemies/BytePG3.png',
  'ByteYB4': 'Urbanistic Road (BIG UPDATE)/Enemigos/Gambling Enemies/ByteYB4.png',
  'ByteYP2': 'Urbanistic Road (BIG UPDATE)/Enemigos/Gambling Enemies/ByteYP2.png',
  'Fireflies': 'Urbanistic Road (BIG UPDATE)/Enemigos/Gambling Enemies/Fireflies.png',
  'Arky': 'Urbanistic Road (BIG UPDATE)/Enemigos/Jefes (Arky)/Arky (BOSS).png',
  'CrystArky': 'Urbanistic Road (BIG UPDATE)/Enemigos/Jefes (Arky)/CrystArky (At-Nr).png',
  'ArkyVoid': 'Urbanistic Road (BIG UPDATE)/Enemigos/Jefes (Arky)/ArkyVoid (Crpt).png',
  'Balloon_Glob': 'Urbanistic Road (BIG UPDATE)/Globs/Familia Blanca/Balloon Glob (EVO1).png',
  'Heliglob': 'Urbanistic Road (BIG UPDATE)/Globs/Familia Blanca/Heliglob (EVO2).png',
  'Alien_Glob': 'Urbanistic Road (BIG UPDATE)/Globs/Familia Blanca/Alien Glob (EVO3).png',
  'Streamer_Glob': 'Urbanistic Road (BIG UPDATE)/Globs/Familia Rosa/Streamer Glob (EVO1).png',
  'Gamer_Glob': 'Urbanistic Road (BIG UPDATE)/Globs/Familia Rosa/Gamer Glob (EVO2).png',
  'Youtuber_Glob': 'Urbanistic Road (BIG UPDATE)/Globs/Familia Rosa/Youtuber Glob (EVO3).png'
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
      ],
      modes: {
        'corrupto': "Transmisión desde Pixible... Las cosas se ven mal allí abajo. Os ayudaré con lo que pueda.",
        'antiNormal': "Bitlands está decayendo últimamente. Los Pyces originales tuvieron que huir a buscar ayuda, por eso estos impostores campan a sus anchas."
      },
      mimicWarning: "¡Atención! Un Mimic Pyce acaba de aparecer. ¡Derríbenlo antes de que escape!",
      corruptMsgs: [
        "Las señales es-tzzz muy débiles.",
        "¿Siguen ahí? La conexi- se pierde por momentos.",
        "Detecto una masiva concentración de Materia Oscura-",
        "Ese ente... no parece un Pyce... es-tzzz",
        "No dejen que se acerquen al n-úcleo-"
      ],
      antiNormalMsgs: [
        "Asegúrense de que los Globs estén a salvo con nosotros.",
        "Por favor, protejan a todos los Globs que puedan.",
        "Estamos en una versión inestable de Gelatin Lake... este mundo está creado puramente de maldad y oscuridad.",
        "No se preocupen por los Pyces, ellos no mueren aquí... solo se desconectan.",
        "La base de datos central de Pixible indica anomalías graves en la zona."
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
      ],
      modes: {
        'corrupto': "Transmission from Pixible... Things look bad down there. I'll help you with what I can.",
        'antiNormal': "Bitlands is decaying lately. The original Pyces had to flee to seek help, that's why these impostors are roaming free."
      },
      mimicWarning: "Attention! A Mimic Pyce just appeared. Take it down before it escapes!",
      corruptMsgs: [
        "Signals ar-tzzz very weak.",
        "Are you still there? Connec- is dropping constantly.",
        "I detect a massive concentration of Dark Matter-",
        "That entity... doesn't look like a Pyce... it's-tzzz",
        "Don't let them get close to the c-ore-"
      ],
      antiNormalMsgs: [
        "Make sure the Globs are safe with us.",
        "Please, protect all the Globs you can.",
        "We are in an unstable version of Gelatin Lake... this world is created purely of evil and darkness.",
        "Don't worry about the Pyces, they don't die here... they just disconnect.",
        "The central Pixible database indicates severe anomalies in the area."
      ]
    }
  },
  glob: {
    img: IMAGE_PATHS.Glob, es: {
      name: "Glob (DEF)", msgs: [
        "Me pregunto por que atacamos a los Pyces. ¿No son amigos?",
        "¿No viven los Pyces 2.0 en Bitlands? ¡Si este es mi hogar!",
        "¡Ojala pudiera darles su merecido a esos corruptos...",
        "¡Oh no... Aquí vienen los disparadores!",
        "¡AYUDA! ¡Vienen demasiados!",
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
        "¿Habeis visto mi sombrero? Ah, no llevo."
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
      name: "NOeye", intercept: "1N73RC3P74D0. 3S4 CH474RR4 N0 0S P0DR4 4YUD4R... 3S741S S0L0S 3N L4 0SCUR1D4D.", msgs: [
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
      name: "NOeye", intercept: "1N73RC3P73D. 7H47 SCR4P C4NN07 H3LP Y0U... Y0U 4R3 4L0N3 1N 7H3 D4RKN3SS.", msgs: [
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
      name: "MoonStar", intercept: "Pobre máquina obsoleta. Su conexión ha sido cortada, y sus planes... expuestos ante mis estrellas.", msgs: [
        "Es un honor contemplar vuestra inevitable caída, pequeños Globs.",
        "Vuestro esfuerzo es loable, pero el destino ya ha sido escrito por las estrellas.",
        "Dos vueltas al escenario para saborear vuestro miedo. ¡Qué delicia.",
        "Vuestra resistencia es fútil ante el ciclo eterno de los astros."
      ], defeat: [
        "Imposible... el brillo de las estrellas... se apaga...",
        "Esto es solo un eclipse temporal. Volveré pronto.",
        "Disfrutad vuestro triunfo... mientras dure la luz."
      ]
    }, en: {
      name: "MoonStar", intercept: "Poor obsolete machine. Its connection has been severed, and its plans... exposed to my stars.", msgs: [
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
  },
  one_x: {
    img: IMAGE_PATHS['1x1x1x1_Pyce'], es: {
      name: "1x1x1x1 Pyce", msgs: [
        "¿Creéis que podéis pararme? 01001001 01100100 01101001 01101111 01110100 01100001 01110011",
        "El código es mío. Todo es mío.",
        "01001101 01110101 01100101 01110010 01100101",
        "Vuestra defensa es un error de sintaxis en mi mundo."
      ]
    }, en: {
      name: "1x1x1x1 Pyce", msgs: [
        "Do you think you can stop me? 01001001 01101001 01101001 01101111 01110100 01110011",
        "The code is mine. Everything is mine.",
        "01000100 01101001 01101001",
        "Your defense is a syntax error in my world."
      ]
    }
  },
  arky: {
    img: IMAGE_PATHS.Arky, es: {
      name: "Arky", msgs: [
        "¡Ja! ¡Nadie ha podido con el gran Arky en su propio casino!",
        "Cada moneda que cae es MÍA. La fortuna siempre me sonríe... porque yo la controlo.",
        "¿Defender vuestra base? Interesante apuesta... pero la casa siempre gana.",
        "¡Vengan, vengan! ¡El gran Arky acepta todos los desafíos... y cobra todos los fracasos!",
        "La suerte no existe. Existe Arky, y punto.",
        "¿Cuántas torres tenéis? No importa. Mis Pyces han cruzado casinos más difíciles que esto.",
        "Cada Glob caído es una moneda en mi bolsillo. ¡Seguid intentándolo, por favor!",
        "Este casino tiene una sola regla: lo que entra... no siempre sale. ¡JA!",
        "¿Creéis que vuestras torrecitas me asustan? He visto fichas de póker más intimidantes.",
        "El gran Arky nunca pierde. Si parecéis ganar... es que aún no he apostado en serio.",
        "¡Mis Pyces son mis mejores clientes! Siempre vuelven... porque yo se lo ordeno.",
        "Cada oleada que supero es otra ronda de bebidas en mi mesa VIP. ¡Salud!"
      ]
    }, en: {
      name: "Arky", msgs: [
        "Ha! Nobody has ever bested the great Arky in his own casino!",
        "Every coin that falls is MINE. Fortune always smiles on me... because I control it.",
        "Defending your base? Interesting bet... but the house always wins.",
        "Come, come! The great Arky accepts all challenges... and collects all failures!",
        "Luck doesn't exist. Arky exists, period.",
        "How many towers do you have? Doesn't matter. My Pyces have crossed harder casinos than this.",
        "Every fallen Glob is a coin in my pocket. Please, keep trying!",
        "This casino has one rule: what comes in... doesn't always come out. HA!",
        "You think your little towers scare me? I've seen more intimidating poker chips.",
        "The great Arky never loses. If you seem to be winning... I just haven't bet seriously yet.",
        "My Pyces are my best customers! They always come back... because I order them to.",
        "Every wave I survive is another round of drinks at my VIP table. Cheers!"
      ]
    }
  },
  crystarky: {
    img: IMAGE_PATHS.CrystArky, es: {
      name: "CrystArky", msgs: [
        "las estrellas... hablan de vuestra caída desde hace mucho. solo escuchadlas.",
        "el cielo nocturno me ha dado todo esto... gemas, poder... y la certeza de que acabará consumiéndonos a todos.",
        "no es... que yo quiera haceros daño. es que los astros lo han decidido por mí.",
        "he mirado el firmamento esta noche y... creo que ya sé cómo termina esto para vosotros.",
        "las constelaciones no mienten. el fin se acerca lentamente, como la marea.",
        "cada gema que llevo es un fragmento de estrella muerta. y vosotros... seréis lo siguiente.",
        "a veces me pregunto si los Globs también brillan cuando desaparecen. supongo que pronto lo sabremos.",
        "el universo es muy grande... y en él, vuestras torres son polvo entre el polvo.",
        "no me malinterpretéis... admiráis el cielo, ¿verdad? yo también. por eso sé lo que viene.",
        "hay algo hermoso en la inevitabilidad. como un cometa. bello... y destructor.",
        "el casino brilla de noche como las estrellas. y las estrellas... tarde o temprano se apagan.",
        "siento que os queda poco tiempo. no lo digo con crueldad... lo dicen los astros por mí."
      ]
    }, en: {
      name: "CrystArky", msgs: [
        "the stars... have spoken of your downfall for a long time. just listen to them.",
        "the night sky gave me all of this... gems, power... and the certainty that it will end up consuming us all.",
        "it's not... that i want to hurt you. it's that the heavens have decided for me.",
        "i looked at the sky tonight and... i think i already know how this ends for you.",
        "constellations don't lie. the end approaches slowly, like the tide.",
        "every gem i carry is a fragment of a dead star. and you... will be next.",
        "i sometimes wonder if Globs also shine when they disappear. i suppose we'll find out soon.",
        "the universe is vast... and in it, your towers are dust among dust.",
        "don't misunderstand me... you admire the sky, don't you? so do i. that's why i know what's coming.",
        "there is something beautiful in inevitability. like a comet. beautiful... and destructive.",
        "the casino glows at night like the stars. and stars... sooner or later go dark.",
        "i sense you don't have much time left. i don't say it with cruelty... the stars say it for me."
      ]
    }
  },
  arkyvoid: {
    img: IMAGE_PATHS.ArkyVoid, es: {
      name: "ArkyVoid", msgs: [
        "✨ El portal obedece... *krkr*... ¡y vosotros también lo haréis! 🎩",
        "*fallo de señal* ...mi arte... *kzzt*... es incom-parable. ¡CONTEMPLADLO! ✨",
        "🎩 Abracadabra... *zzzt*... ¡vuestras torres son ilusiones que... *krkr*... pronto desaparecerán!",
        "El gran mago 3RR0R... *fallo*... ¡digo, ArkyVoid! ¡Os hará desaparecer con un chasquido! 💫",
        "*interferencia* ...el dinero... el poder... todo... *kzzt*... será mío. ¡JA-JA-*krkr*-JA! 🌀",
        "¡M1 C4S1N0... *zzzt*... N0 T13N3 F1N! ¡El portal lo expande... *krkr*... eternamente! 🌀",
        "*corrupción detectada* ...mis Pyces... *kzzt*... son mi mejor truco de magia. ¡PUFF! ✨",
        "🎩 Pensabais que era Arky... *fallo*... ¡PERO ERA YO, ARKYVOID, TODO EL TIEMPO! *krkr*",
        "El v3rd4d3ro m4go... *interferencia*... nunca rev3la sus s3cr3tos. Ni yo tampoco. *zzzt* 💫",
        "*señal perdida* ...la oscuridad del portal... *krkr*... os... os tragará... *kzzt*... a todos. 🌑",
        "¿Un truco? *fallo de sistema* ...esto no es un truco... *zzzt*... esto es una CONDENA. 🎩",
        "*krkr* ...veo vuestro futuro en el portal... *kzzt*... y no... no hay Globs en él. *interferencia* 💀"
      ]
    }, en: {
      name: "ArkyVoid", msgs: [
        "✨ The portal obeys... *krkr*... and so shall you! 🎩",
        "*signal failure* ...my art... *kzzt*... is incom-parable. BEHOLD IT! ✨",
        "🎩 Abracadabra... *zzzt*... your towers are illusions that... *krkr*... shall soon vanish!",
        "The great mage 3RR0R... *glitch*... I mean, ArkyVoid! Will make you disappear with a snap! 💫",
        "*interference* ...the money... the power... all of it... *kzzt*... will be mine. HA-HA-*krkr*-HA! 🌀",
        "M1 C4S1N0... *zzzt*... H4S N0 3ND! The portal expands it... *krkr*... eternally! 🌀",
        "*corruption detected* ...my Pyces... *kzzt*... are my best magic trick. POOF! ✨",
        "🎩 You thought it was Arky... *glitch*... BUT IT WAS ME, ARKYVOID, ALL ALONG! *krkr*",
        "The tr00 m4g1c1an... *interference*... never r3v34ls their s3cr3ts. Neither do I. *zzzt* 💫",
        "*signal lost* ...the darkness of the portal... *krkr*... will... will swallow you... *kzzt*... all. 🌑",
        "A trick? *system failure* ...this is not a trick... *zzzt*... this is a SENTENCE. 🎩",
        "*krkr* ...i see your future in the portal... *kzzt*... and there are... no Globs in it. *interference* 💀"
      ]
    }
  }
};

const TOWER_TYPES = {
  'Glob': { name: 'tower_Glob_name', damage: 10, range: 150, speed: 1.0, cost: 50, evolution: 'Poop_Glob', image: IMAGE_PATHS.Glob, projectile: 'green', desc: "tower_Glob_desc", family: 'Glob' },
  'Poop_Glob': { name: 'tower_Poop_Glob_name', damage: 25, range: 150, speed: 0.6, cost: 100, evolution: 'Golden_Glob', image: IMAGE_PATHS.Poop_Glob, projectile: 'brown', desc: "tower_Poop_Glob_desc", family: 'Glob' },
  'Golden_Glob': { name: 'tower_Golden_Glob_name', damage: 45, range: 170, speed: 1.4, cost: 200, evolution: 'Rainbow_Glob', image: IMAGE_PATHS.Golden_Glob, projectile: 'gold', desc: "tower_Golden_Glob_desc", family: 'Glob' },
  'Rainbow_Glob': { name: 'tower_Rainbow_Glob_name', damage: 30, range: 180, speed: 1.8, cost: 400, image: IMAGE_PATHS.Rainbow_Glob, projectile: 'laser_rainbow', piercing: true, desc: "tower_Rainbow_Glob_desc", family: 'Glob' },

  'Red_Glob': { name: 'tower_Red_Glob_name', damage: 20, range: 85, speed: 2.0, cost: 70, evolution: 'Molten_Glob', image: IMAGE_PATHS.Red_Glob, melee: true, desc: "tower_Red_Glob_desc", family: 'Red_Glob' },
  'Molten_Glob': { name: 'tower_Molten_Glob_name', damage: 15, range: 95, speed: 2.2, cost: 150, evolution: 'Robotic_Glob', image: IMAGE_PATHS.Molten_Glob, burn: true, burnDamage: 5, desc: "tower_Molten_Glob_desc", family: 'Red_Glob' },
  'Robotic_Glob': { name: 'tower_Robotic_Glob_name', damage: 40, range: 120, speed: 1.0, cost: 300, image: IMAGE_PATHS.Robotic_Glob, projectile: 'laser_red', piercing: true, burn: true, desc: "tower_Robotic_Glob_desc", family: 'Red_Glob' },

  'Soap_Glob': { name: 'tower_Soap_Glob_name', damage: 0, range: 120, speed: 0.3, cost: 60, evolution: 'Cotton_Glob', image: IMAGE_PATHS.Soap_Glob, projectile: 'blue', slow: 0.4, desc: "tower_Soap_Glob_desc", family: 'Soap_Glob' },
  'Cotton_Glob': { name: 'tower_Cotton_Glob_name', damage: 5, range: 140, speed: 2.6, cost: 120, image: IMAGE_PATHS.Cotton_Glob, projectile: 'blue', slow: 0.6, desc: "tower_Cotton_Glob_desc", family: 'Soap_Glob' },

  'Ducky_Glob': { name: 'tower_Ducky_Glob_name', damage: 0, range: 140, speed: 0, cost: 80, evolution: 'Golden_Ducky_Glob', image: IMAGE_PATHS.Ducky_Glob, projectile: 'none', desc: "tower_Ducky_Glob_desc", family: 'Ducky_Glob' },
  'Golden_Ducky_Glob': { name: 'tower_Golden_Ducky_Glob_name', damage: 0, range: 160, speed: 0, cost: 180, image: IMAGE_PATHS.Golden_Ducky_Glob, projectile: 'none', desc: "tower_Golden_Ducky_Glob_desc", family: 'Ducky_Glob' },

  'Comet_Glob': { name: 'tower_Comet_Glob_name', damage: 50, range: 250, speed: 0.25, cost: 250, evolution: 'Dark_Glob', image: IMAGE_PATHS.Comet_Glob, projectile: 'star_boomerang', piercing: true, boomerang: true, desc: "tower_Comet_Glob_desc", family: 'Comet_Glob' },
  'Dark_Glob': { name: 'tower_Dark_Glob_name', damage: 80, range: 280, speed: 0.5, cost: 400, evolution: 'Demglob', image: IMAGE_PATHS.Dark_Glob, projectile: 'diamond_boomerang', piercing: true, boomerang: true, desc: "tower_Dark_Glob_desc", family: 'Comet_Glob' },
  'Demglob': { name: 'tower_Demglob_name', damage: 200, range: 300, speed: 2.0, cost: 1000, evolution: 'Void_Glob', image: IMAGE_PATHS.Demglob, projectile: 'laser_purple', desc: "tower_Demglob_desc", family: 'Comet_Glob' },
  'Void_Glob': { name: 'tower_Void_Glob_name', damage: 500, range: 400, speed: 1.0, cost: 2500, image: IMAGE_PATHS.Void_Glob, projectile: 'void_tracker', tracking: true, desc: "tower_Void_Glob_desc", family: 'Comet_Glob' },

  'Pyce_Glob': { name: 'tower_Pyce_Glob_name', damage: 30, range: 180, speed: 4.5, cost: 150, image: IMAGE_PATHS.Pyce_Glob, projectile: 'glitch', unlocked: false, desc: "tower_Pyce_Glob_desc", family: 'Grey' },
  'Old_Glob': { name: 'tower_Old_Glob_name', damage: 40, range: 200, speed: 3.5, cost: 200, evolution: 'Pyce_Glob', image: IMAGE_PATHS.Old_Glob, projectile: 'stone', unlocked: false, desc: "tower_Old_Glob_desc", family: 'Grey' },
  'Work_Bombot': { name: 'tower_Work_Bombot_name', damage: 100, range: 150, speed: 0.6, cost: 350, image: IMAGE_PATHS.Work_Bombot, aoe: 80, unlocked: false, desc: "tower_Work_Bombot_desc", family: 'Special' },

  // Familia Blanca
  'Balloon_Glob': { name: 'tower_Balloon_Glob_name', damage: 0, range: 100, speed: 0, cost: 120, evolution: 'Heliglob', image: IMAGE_PATHS.Balloon_Glob, projectile: 'none', desc: "tower_Balloon_Glob_desc", family: 'White' },
  'Heliglob': { name: 'tower_Heliglob_name', damage: 0, range: 150, speed: 0, cost: 250, evolution: 'Alien_Glob', image: IMAGE_PATHS.Heliglob, projectile: 'none', desc: "tower_Heliglob_desc", family: 'White' },
  'Alien_Glob': { name: 'tower_Alien_Glob_name', damage: 0, range: 200, speed: 0, cost: 500, image: IMAGE_PATHS.Alien_Glob, projectile: 'none', desc: "tower_Alien_Glob_desc", family: 'White' },

  // Familia Rosa
  'Streamer_Glob': { name: 'tower_Streamer_Glob_name', damage: 0, range: 100, speed: 0, cost: 100, evolution: 'Gamer_Glob', image: IMAGE_PATHS.Streamer_Glob, projectile: 'none', desc: "tower_Streamer_Glob_desc", family: 'Pink' },
  'Gamer_Glob': { name: 'tower_Gamer_Glob_name', damage: 0, range: 150, speed: 0, cost: 200, evolution: 'Youtuber_Glob', image: IMAGE_PATHS.Gamer_Glob, projectile: 'none', desc: "tower_Gamer_Glob_desc", family: 'Pink' },
  'Youtuber_Glob': { name: 'tower_Youtuber_Glob_name', damage: 0, range: 200, speed: 0, cost: 400, image: IMAGE_PATHS.Youtuber_Glob, projectile: 'none', desc: "tower_Youtuber_Glob_desc", family: 'Pink' },

  // Instantanea Explosiva
  'Bomb_Glob': { name: 'tower_Bomb_Glob_name', damage: 50, range: 60, speed: 0, cost: 300, evolution: 'TNT_Glob', image: IMAGE_PATHS.Bomb_Glob, projectile: 'none', unlocked: false, desc: "tower_IEx1_desc", family: 'IEx' },
  'TNT_Glob': { name: 'tower_TNT_Glob_name', damage: 100, range: 80, speed: 0, cost: 600, evolution: 'Nuclear_Glob', image: IMAGE_PATHS.TNT_Glob, projectile: 'none', desc: "tower_IEx2_desc", family: 'IEx' },
  'Nuclear_Glob': { name: 'tower_Nuclear_Glob_name', damage: 300, range: 120, speed: 0, cost: 1200, image: IMAGE_PATHS.Nuclear_Glob, projectile: 'none', desc: "tower_IEx3_desc", family: 'IEx' },

  // Worker Glob Family (Trampas)
  'Worker_Glob': { name: 'tower_Worker_Glob_name', damage: 15, range: 110, speed: 0.5, cost: 150, evolution: 'Police_Glob', image: IMAGE_PATHS.Worker_Glob, trap: 'Worker_Trap', desc: "tower_Worker_Glob_desc", family: 'Worker_Glob', unlocked: true },
  'Police_Glob': { name: 'tower_Police_Glob_name', damage: 30, range: 130, speed: 0.6, cost: 300, evolution: 'Planked_Glob', image: IMAGE_PATHS.Police_Glob, trap: 'Police_Trap', desc: "tower_Police_Glob_desc", family: 'Worker_Glob' },
  'Planked_Glob': { name: 'tower_Planked_Glob_name', damage: 70, range: 140, speed: 0.7, cost: 550, evolution: 'DJ_Glob', image: IMAGE_PATHS.Planked_Glob, trap: 'Planked_Trap', desc: "tower_Planked_Glob_desc", family: 'Worker_Glob' },
  'DJ_Glob': { name: 'tower_DJ_Glob_name', damage: 120, range: 160, speed: 0.8, cost: 1200, image: IMAGE_PATHS.DJ_Glob, trap: 'DJ_Trap', desc: "tower_DJ_Glob_desc", family: 'Worker_Glob' }
};

const ENEMY_TYPES = {
  'Stupid_Pyce': { name: 'enemy_Stupid_Pyce_name', desc: 'enemy_Stupid_Pyce_desc', health: 50, speed: 1.5, reward: 15, image: IMAGE_PATHS.Stupid_Pyce },
  'Pyce2': { name: 'enemy_Pyce2_name', desc: 'enemy_Pyce2_desc', health: 70, speed: 1.4, reward: 20, image: IMAGE_PATHS.Pyce2 },
  'Guest_Pyce': { name: 'enemy_Guest_Pyce_name', desc: 'enemy_Guest_Pyce_desc', mechanic_key: 'mechanic_guest', health: 100, speed: 1.2, reward: 25, image: IMAGE_PATHS.Guest_Pyce },
  'Symbol_Pyce': { name: 'enemy_Symbol_Pyce_name', desc: 'enemy_Symbol_Pyce_desc', health: 80, speed: 2.5, reward: 30, image: IMAGE_PATHS.Symbol_Pyce },
  'Noob_Pyce': { name: 'enemy_Noob_Pyce_name', desc: 'enemy_Noob_Pyce_desc', health: 120, speed: 1.0, reward: 35, image: IMAGE_PATHS.Noob_Pyce, stunAbility: true, stunCooldown: 8 },
  '4motions_Pyce': { name: 'enemy_4motions_Pyce_name', desc: 'enemy_4motions_Pyce_desc', health: 200, speed: 0.8, reward: 50, image: IMAGE_PATHS['4motions_Pyce'] },
  'Flower_Pyce': { name: 'enemy_Flower_Pyce_name', desc: 'enemy_Flower_Pyce_desc', health: 150, speed: 1.2, reward: 50, image: IMAGE_PATHS.Flower_Pyce, healer: true, healRange: 120, healAmount: 10, healCooldown: 2 },
  'SO_Pyce': { name: 'enemy_SO_Pyce_name', desc: 'enemy_SO_Pyce_desc', health: 450, speed: 0.6, reward: 80, image: IMAGE_PATHS.SO_Pyce },

  '1x1x1x1_Pyce': { name: 'enemy_1x1x1x1_Pyce_name', desc: 'enemy_1x1x1x1_Pyce_desc', health: 500, speed: 0.5, reward: 500, image: IMAGE_PATHS['1x1x1x1_Pyce'], boss: true, bossStun: true, stunCooldown: 10 },
  'NOeye_Pyce': { name: 'enemy_NOeye_Pyce_name', desc: 'enemy_NOeye_Pyce_desc', health: 800, speed: 0.4, reward: 800, image: IMAGE_PATHS.NOeye_Pyce, boss: true, paralyzeLaser: true, stunCooldown: 12 },
  'MoonStar_Pyce': { name: 'enemy_MoonStar_Pyce_name', desc: 'enemy_MoonStar_Pyce_desc', mechanic_key: 'mechanic_moonstar', health: 2500, speed: 0.3, reward: 2000, image: IMAGE_PATHS.MoonStar_Pyce, boss: true, instakill: true, doubleLap: true },

  'Stupid_GoldPyce': { name: 'enemy_Stupid_GoldPyce_name', desc: 'enemy_Stupid_GoldPyce_desc', mechanic_key: 'mechanic_gold', health: 80, speed: 2.0, reward: 150, image: IMAGE_PATHS.Stupid_GoldPyce, mimic: true },
  'Mimic_Pyce': { name: 'enemy_Mimic_Pyce_name', desc: 'enemy_Mimic_Pyce_desc', mechanic_key: 'mechanic_mimic_special', health: 500, speed: 1.8, reward: 1000, image: IMAGE_PATHS.Mimic_Pyce, mimic: true, isSpecialMimic: true },
  
  // Nuevos Pyces
  'Bomb_Pyce': { name: 'enemy_Bomb_Pyce_name', desc: 'enemy_Bomb_Pyce_desc', health: 100, speed: 1.5, reward: 30, image: IMAGE_PATHS.Bomb_Pyce, mechanic_key: 'mechanic_bomb' },
  'Knight_Pyce': { name: 'enemy_Knight_Pyce_name', desc: 'enemy_Knight_Pyce_desc', mechanic_key: 'mechanic_knight', health: 250, speed: 1.0, reward: 60, image: IMAGE_PATHS.Knight_Pyce },
  'Cannon_Pycer': { name: 'enemy_Cannon_Pycer_name', desc: 'enemy_Cannon_Pycer_desc', mechanic_key: 'mechanic_cannon', health: 300, speed: 0.8, reward: 70, image: IMAGE_PATHS.Cannon_Pycer, stunAbility: true, stunCooldown: 6 },
  'HoloPyce': { name: 'enemy_HoloPyce_name', desc: 'enemy_HoloPyce_desc', health: 180, speed: 1.2, reward: 40, image: IMAGE_PATHS.HoloPyce, holo: true, mechanic_key: 'mechanic_holo' },
  'Strechy_Pyce': { name: 'enemy_Strechy_Pyce_name', desc: 'enemy_Strechy_Pyce_desc', health: 220, speed: 1.1, reward: 50, image: IMAGE_PATHS.Strechy_Pyce },
  'Rebel_Pyce': { name: 'enemy_Rebel_Pyce_name', desc: 'enemy_Rebel_Pyce_desc', health: 150, speed: 2.8, reward: 45, image: IMAGE_PATHS.Rebel_Pyce },
  
  // Gambling Enemies
  'BitY1': { name: 'enemy_Bit_name', desc: 'enemy_BitY1_desc', health: 3, speed: 1.5, reward: 5, image: IMAGE_PATHS.BitY1, category: 'gambling' },
  'BitB4': { name: 'enemy_Bit_name', desc: 'enemy_BitB4_desc', health: 3, speed: 1.5, reward: 5, image: IMAGE_PATHS.BitB4, category: 'gambling' },
  'BitG2': { name: 'enemy_Bit_name', desc: 'enemy_BitG2_desc', health: 3, speed: 1.5, reward: 5, image: IMAGE_PATHS.BitG2, category: 'gambling' },
  'BitP3': { name: 'enemy_Bit_name', desc: 'enemy_BitP3_desc', health: 3, speed: 1.5, reward: 5, image: IMAGE_PATHS.BitP3, category: 'gambling' },
  'ByteGB1': { name: 'enemy_Byte_name', desc: 'enemy_Byte_desc', health: 24, speed: 1.0, reward: 15, image: IMAGE_PATHS.ByteGB1, category: 'gambling' },
  'ByteYP2': { name: 'enemy_Byte_name', desc: 'enemy_Byte_desc', health: 24, speed: 1.0, reward: 15, image: IMAGE_PATHS.ByteYP2, category: 'gambling' },
  'BytePG3': { name: 'enemy_Byte_name', desc: 'enemy_Byte_desc', health: 24, speed: 1.0, reward: 15, image: IMAGE_PATHS.BytePG3, category: 'gambling' },
  'ByteYB4': { name: 'enemy_Byte_name', desc: 'enemy_Byte_desc', health: 24, speed: 1.0, reward: 15, image: IMAGE_PATHS.ByteYB4, category: 'gambling' },
  'Fireflies': { name: 'enemy_Fireflies_name', desc: 'enemy_Fireflies_desc', health: 30, speed: 1.8, reward: 20, image: IMAGE_PATHS.Fireflies, category: 'gambling' },
  'Spyware': { name: 'enemy_Spyware_name', desc: 'enemy_Spyware_desc', mechanic_key: 'mechanic_spyware', health: 130, speed: 1.6, reward: 35, image: IMAGE_PATHS.Spyware1, category: 'gambling' },
  'Spyware1': { name: 'enemy_Spyware_name', desc: 'enemy_Spyware_desc', mechanic_key: 'mechanic_spyware', health: 130, speed: 1.6, reward: 35, image: IMAGE_PATHS.Spyware1, category: 'gambling' },
  'Spyware2': { name: 'enemy_Spyware_name', desc: 'enemy_Spyware_desc', mechanic_key: 'mechanic_spyware', health: 130, speed: 1.6, reward: 35, image: IMAGE_PATHS.Spyware2, category: 'gambling' },
  'Spyware3': { name: 'enemy_Spyware_name', desc: 'enemy_Spyware_desc', mechanic_key: 'mechanic_spyware', health: 130, speed: 1.6, reward: 35, image: IMAGE_PATHS.Spyware3, category: 'gambling' },
  'Arky': { name: 'enemy_Arky_name', desc: 'enemy_Arky_desc', mechanic_key: 'mechanic_arky', health: 1000, speed: 0.4, reward: 1000, image: IMAGE_PATHS.Arky, boss: true, arkyType: 'normal', category: 'gambling' },
  'CrystArky': { name: 'enemy_CrystArky_name', desc: 'enemy_CrystArky_desc', mechanic_key: 'mechanic_crystarky', health: 1500, speed: 0.35, reward: 1500, image: IMAGE_PATHS.CrystArky, boss: true, arkyType: 'crystal', category: 'gambling' },
  'ArkyVoid': { name: 'enemy_ArkyVoid_name', desc: 'enemy_ArkyVoid_desc', mechanic_key: 'mechanic_arkyvoid', health: 1500, speed: 0.35, reward: 1500, image: IMAGE_PATHS.ArkyVoid, boss: true, arkyType: 'void', category: 'gambling' }
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
  winNormal: { key: 'winNormal', icon: '🌲', unlocked: false, reward: { pycoins: 100, xp: 100 } },
  una_por_cada: { key: 'una_por_cada', icon: '🎰', unlocked: false, reward: { pycoins: 200, duckpass: 150 } },
  explosiones_por_doquier: { key: 'explosiones_por_doquier', icon: '💥', unlocked: false, reward: { pycoins: 350, duckpass: 250 } },
  urba_complet1: { key: 'urba_complet1', icon: '🌆', unlocked: false, reward: { pycoins: 500, duckpass: 300 } },
  winDificil: { key: 'winDificil', icon: '⚔️', unlocked: false, reward: { pycoins: 200, xp: 150 } },
  winExtremo: { key: 'winExtremo', icon: '💀', unlocked: false, reward: { pycoins: 500, xp: 500 } },
  winCorrupto: { key: 'winCorrupto', icon: '👾', unlocked: false, reward: { pycoins: 1000, xp: 1000 } },
  gtackFirst: { key: 'gtackFirst', icon: '🎯', unlocked: false, reward: { pycoins: 100, xp: 50 } },
  duckgradeFirst: { key: 'duckgradeFirst', icon: '🦆', unlocked: false, reward: { pycoins: 150, xp: 80 } },
  supremeAlliance: { key: 'supremeAlliance', icon: '🤝', unlocked: false, reward: { pycoins: 300, xp: 150 } },
  deepArtillery: { key: 'deepArtillery', icon: '💣', unlocked: false, reward: { pycoins: 400, xp: 200 } },
  meleeBlueRed: { key: 'meleeBlueRed', icon: '⚔️', unlocked: false, reward: { pycoins: 400, xp: 200 } },
  epicEffects: { key: 'epicEffects', icon: '🌈', unlocked: false, reward: { pycoins: 500, xp: 300 } },
  letsGoGambling: { key: 'letsGoGambling', icon: '🎰', unlocked: false, reward: { pycoins: 777, xp: 777 } },
  deepSavings: { key: 'deepSavings', icon: '💎', unlocked: false, reward: { pycoins: 500, xp: 250 } },
  maxGlobs: { key: 'maxGlobs', icon: '🌌', unlocked: false, reward: { pycoins: 600, xp: 300 } },
  angelicFortress: { key: 'angelicFortress', icon: '😇', unlocked: false, reward: { pycoins: 500, xp: 250 } },
  titaniumBuilding: { key: 'titaniumBuilding', icon: '🛡️', unlocked: false, reward: { pycoins: 500, xp: 300 } },
  encyclopediaMaster: { key: 'encyclopediaMaster', icon: '📖', unlocked: false, reward: { pycoins: 500, duckpass: 500, xp: 2000 } }
};

const MAPS = {
  gelatin_lake: {
    name: "Gelatin Lake",
    riverZones: [
      { x: 300, y: 0, w: 60, h: 600 },
      { x: 300, y: 200, w: 200, h: 60 }
    ],
    pathSegments: [
      { x: 0, y: 170, w: 200, h: 60 },
      { x: 170, y: 170, w: 60, h: 200 },
      { x: 170, y: 330, w: 300, h: 60 },
      { x: 430, y: 150, w: 60, h: 240 },
      { x: 430, y: 150, w: 300, h: 60 },
      { x: 700, y: 150, w: 60, h: 200 },
      { x: 700, y: 330, w: 300, h: 60 }
    ],
    enemyPath: [
      { x: -30, y: 200 }, { x: 200, y: 200 }, { x: 200, y: 360 },
      { x: 460, y: 360 }, { x: 460, y: 180 }, { x: 730, y: 180 },
      { x: 730, y: 360 }, { x: 1030, y: 360 }
    ]
  },
  urbanistic_road: {
    name: "Urbanistic Road",
    riverZones: [
      { x: 500, y: 0, w: 80, h: 600 }
    ],
    pathSegments: [
      { x: 0, y: 170, w: 360, h: 60 },
      { x: 300, y: 30, w: 60, h: 200 },
      { x: 300, y: 30, w: 360, h: 60 },
      { x: 600, y: 30, w: 60, h: 360 },
      { x: 600, y: 330, w: 400, h: 60 },
      
      { x: 300, y: 170, w: 60, h: 320 },
      { x: 300, y: 430, w: 360, h: 60 },
      { x: 600, y: 330, w: 60, h: 160 }
    ],
    enemyPaths: [
      [
        { x: -30, y: 200 }, { x: 330, y: 200 }, { x: 330, y: 60 },
        { x: 630, y: 60 }, { x: 630, y: 360 }, { x: 1030, y: 360 }
      ],
      [
        { x: -30, y: 200 }, { x: 330, y: 200 }, { x: 330, y: 460 },
        { x: 630, y: 460 }, { x: 630, y: 360 }, { x: 1030, y: 360 }
      ]
    ]
  }
};

const SKINS_DATA = {
  'Glob': [
    {
      id: 'military_set', name: 'skin_military_name', desc: 'skin_military_desc', cost: 350, type: 'pycoin',
      skins: {
        'Glob': 'img/Skins/Verde Base/Untrained Glob (SK-EVO1).png',
        'Poop_Glob': 'img/Skins/Verde Base/Militar Glob (SK-EVO2).png',
        'Golden_Glob': 'img/Skins/Verde Base/Armed Glob (SK-EVO3).png',
        'Rainbow_Glob': 'img/Skins/Verde Base/Impostor Glob (SK-EVO4).png'
      }
    },
    {
      id: 'corrupt_swords_set', name: 'skin_corrupt_swords_name', desc: 'skin_corrupt_swords_desc', cost: 637, type: 'pycoin', duckpass_cost: 207, isSpecial: true,
      skins: {
        'Glob': 'img/Skins/Verde Base/Block Tales (SP)/Blackrock Glob (SK-EVO1).png',
        'Poop_Glob': 'img/Skins/Verde Base/Block Tales (SP)/Brad Glob (SK-EVO2).png',
        'Golden_Glob': 'img/Skins/Verde Base/Block Tales (SP)/Emotional Glob (SK-EVO3).png',
        'Rainbow_Glob': 'img/Skins/Verde Base/Block Tales (SP)/Ancigon Glob (SK-EVO4).png'
      },
      names: {
        'Glob': 'Blackrock Glob',
        'Poop_Glob': 'Brad Glob',
        'Golden_Glob': 'Emotional Glob',
        'Rainbow_Glob': 'Ancigon Glob'
      }
    }
  ],
  'Red_Glob': [
    {
      id: 'music_set', name: 'skin_music_name', desc: 'skin_music_desc', cost: 300, type: 'pycoin',
      skins: {
        'Red_Glob': 'img/Skins/Rojo Melee/Music Glob (SK-EVO1).png',
        'Molten_Glob': 'img/Skins/Rojo Melee/Funky Glob (SK-EVO2).png',
        'Robotic_Glob': 'img/Skins/Rojo Melee/Party Glob (SK-EVO3).png'
      }
    },
    {
      id: 'judicial_set', name: 'skin_judicial_name', desc: 'skin_judicial_desc', category: 'Colaboracion', subtitle: 'Glob Smash', isSpecial: true, isCommunity: true, cost: 550, duckpass_cost: 300, type: 'pycoin',
      skins: {
        'Red_Glob': 'img/Skins/Rojo Melee/Comunidad/Glob Smash/Juez Glob (SK-EVO1).png',
        'Molten_Glob': 'img/Skins/Rojo Melee/Comunidad/Glob Smash/GatGlob (SK-EVO2).png',
        'Robotic_Glob': 'img/Skins/Rojo Melee/Comunidad/Glob Smash/Tigrob (SK-EVO3).png'
      },
      names: {
        'Red_Glob': 'Juez Glob',
        'Molten_Glob': 'GatGlob',
        'Robotic_Glob': 'Tigrob'
      }
    }
  ],
  'Soap_Glob': [
    {
      id: 'abyssal_set', name: 'skin_abyssal_name', desc: 'skin_abyssal_desc', cost: 400, type: 'pycoin',
      skins: {
        'Soap_Glob': 'img/Skins/Azul Ralentizador/Beachy Glob (SK-EVO1).png',
        'Cotton_Glob': 'img/Skins/Azul Ralentizador/Shark Glob (SK-EVO2).png'
      }
    }
  ],
  'Ducky_Glob': [
    {
      id: 'business_duck_set', name: 'skin_business_name', desc: 'skin_business_desc', cost: 150, type: 'pycoin',
      skins: {
        'Ducky_Glob': 'img/Skins/Amarillo Farmer/Jelly Post (SK-EVO1).png',
        'Golden_Ducky_Glob': 'img/Skins/Amarillo Farmer/Factory Glob (SK-EVO2).png'
      }
    }
  ],
  'Grey': [
    {
      id: 'turret_set', name: 'skin_turret_name', desc: 'skin_turret_desc', cost: 250, type: 'pycoin',
      skins: {
        'Old_Glob': 'img/Skins/Gris Disperso/Turret Glob (SK-EVO1).png',
        'Pyce_Glob': 'img/Skins/Gris Disperso/Spaceship Glob (SK-EVO2).png'
      }
    },
    {
      id: 'starjump_set', name: 'skin_starry_name', desc: 'skin_starry_desc', cost: 777, duckpass_cost: 666, type: 'pycoin', isSpecial: true,
      skins: {
        'Old_Glob': 'img/Collabs (SJ)/Skin/Starry (SK-EVO1).png',
        'Pyce_Glob': 'img/Collabs (SJ)/Skin/Astral_Starry (SK_EVO2).png'
      },
      names: {
        'Old_Glob': { es: 'Destellito', en: 'Starry' },
        'Pyce_Glob': { es: 'Destellito Angelical', en: 'Heroic Starry' }
      }
    }
  ],
  'Comet_Glob': [
    {
      id: 'universolar_comet_set', name: 'skin_universolar_name', desc: 'skin_universolar_desc', cost: 450, type: 'pycoin',
      skins: {
        'Comet_Glob': 'img/Skins/Negro Supremo/Sunny Glob (SK-EVO1).png',
        'Dark_Glob': 'img/Skins/Negro Supremo/Sunlight Glob (SK-EVO2).png',
        'Demglob': 'img/Skins/Negro Supremo/Nova Glob (SK-EVO3).png',
        'Void_Glob': 'img/Skins/Negro Supremo/Supernova Glob (SK-EVO4).png'
      }
    },
    {
      id: 'mimic_set', name: 'skin_mimic_name', desc: 'skin_mimic_desc', cost: 0, type: 'free', isSpecial: true,
      skins: {
        'Comet_Glob': 'img/Skins/Negro Supremo/Mimic Pyce (ENEMY-SKIN)/Mimic Pyce.png',
        'Dark_Glob': 'img/Skins/Negro Supremo/Mimic Pyce (ENEMY-SKIN)/Didic Pyce (SK-EVO2).png',
        'Demglob': 'img/Skins/Negro Supremo/Mimic Pyce (ENEMY-SKIN)/NOmic Pyce (SK-EVO3).png',
        'Void_Glob': 'img/Skins/Negro Supremo/Mimic Pyce (ENEMY-SKIN)/Golden MimicPyce (SK-EVO4).png'
      },
      names: {
        'Comet_Glob': 'Mimic Pyce',
        'Dark_Glob': 'Dirty Mimic',
        'Demglob': 'NOeye Mimic',
        'Void_Glob': 'Golden MimicPyce'
      }
    },
    {
      id: 'dreams_set', name: 'skin_dreams_name', desc: 'skin_dreams_desc', isSpecial: true, cost: 777, duckpass_cost: 555, type: 'pycoin',
      skins: {
        'Comet_Glob': 'img/Skins/Negro Supremo/Dreams (SP)/Gummy Glob (SK-EVO1).png',
        'Dark_Glob': 'img/Skins/Negro Supremo/Dreams (SP)/Loyal Glob (SK-EVO2).png',
        'Demglob': 'img/Skins/Negro Supremo/Dreams (SP)/MetaGlob (SK-EVO3).png',
        'Void_Glob': 'img/Skins/Negro Supremo/Dreams (SP)/Hammer Glob (SK-EVO4).png'
      },
      names: {
        'Comet_Glob': 'Gummy Glob',
        'Dark_Glob': 'Loyal Glob',
        'Demglob': 'MetaGlob',
        'Void_Glob': 'Hammer Glob'
      }
    }
  ],
  'Special': [
    {
      id: 'sharkbot_bombot', name: 'skin_sharkbot_name', desc: 'skin_sharkbot_desc', cost: 50, type: 'pycoin',
      skins: {
        'Work_Bombot': 'img/Skins/Work-Bombot/SharkBot (SK-EVO).png'
      }
    },
    {
      id: 'globsus_bombot', name: 'skin_globsus_name', desc: 'skin_globsus_desc', cost: 50, type: 'pycoin',
      skins: {
        'Work_Bombot': 'img/Skins/Work-Bombot/GlobSus (SK-EVO).png'
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
    { id: 'pack_rainbow', name: 'skin_rainbow_name', desc: 'skin_rainbow_desc', type: 'duckpass_level', level: 100, class: 'skin-rainbow' },
    { id: 'pyce_morph', name: 'skin_pyce_morph_name', desc: 'skin_pyce_morph_desc', cost: 0, type: 'free', isSpecial: true, pyce_morph: true }
  ],
  'Recolors': [
    { id: 'recolor_galactic', name: 'skin_galactic_name', desc: 'skin_galactic_desc', cost: 250, type: 'pycoin', filter: 'hue-rotate(280deg) saturate(2.5) brightness(1.1) drop-shadow(0 0 5px #9c27b0)' },
    { id: 'recolor_fire', name: 'skin_fire_name', desc: 'skin_fire_desc', cost: 200, type: 'pycoin', filter: 'hue-rotate(-30deg) saturate(4) contrast(1.2) brightness(0.9)' },
    { id: 'recolor_diamond', name: 'skin_diamond_name', desc: 'skin_diamond_desc', cost: 300, type: 'pycoin', filter: 'brightness(1.8) saturate(0.2) contrast(1.5) opacity(0.9)' },
    { id: 'recolor_toxic', name: 'skin_toxic_name', desc: 'skin_toxic_desc', cost: 180, type: 'pycoin', filter: 'hue-rotate(80deg) saturate(5) brightness(1.2) contrast(1.1)' }
  ]
};

/* --- INSERTAR: Traducciones limpias y metadatos de skins (espadas corrompidas + mimic_pyce) --- */
if (typeof window !== 'undefined') {
  window.TRANSLATIONS = window.TRANSLATIONS || TRANSLATIONS;
}
TRANSLATIONS['es'] = Object.assign({}, TRANSLATIONS['es'] || {}, {
  "health": "Salud",
  "money": "Globetines",
  "wave": "Oleada",
  "startWave": "Iniciar Oleada",
  "autoWave": "Auto-Oleada",
  "autoWaveActive": "Auto-ON",
  "cancel": "Cancelar",
  "waveStarted": "¡Oleada {wave}!",
  "waveCompleted": "¡Oleada {wave} superada!",
  "skin_corrupted_swords_name": "Espadas Corrompidas",
  "skin_corrupted_swords_desc": "Los supuestos amos de las espadas legendarias vistos hasta la DEMO 5.<br><span style='font-size:0.8em; color:#aaa;'>El derecho de los personajes vistos aqui les pertecene al equipo de Block Tales, los Globs a Kirb.</span><br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Creado por: KirByte</span>",
  "skin_military_name": "Set Militar",
  "skin_military_desc": "Aspecto militar.<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Creado por: KirByte_Bi</span>",
  "skin_music_name": "Set Musical",
  "skin_music_desc": "Aspecto con notas musicales.<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Creado por: KirByte_Bi</span>",
  "skin_abyssal_name": "Set Abismal",
  "skin_abyssal_desc": "Aspecto abisal.<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Creado por: KirByte_Bi</span>",
  "skin_turret_name": "Set Torreta",
  "skin_turret_desc": "¡Tecnología de defensa aérea e intergaláctica para la línea gris!<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Creado por: KirByte_Bi</span>",
  "skin_sharkbot_name": "RoboTibu",
  "skin_sharkbot_desc": "Un tiburón robótico de acero con propulsión. <br><span style='color: #ff3333; font-weight: bold; text-shadow: 0 0 5px rgba(255,51,51,0.5);'>Crédito: Nitrogen</span>",
  "skin_globsus_name": "GlobSus",
  "skin_globsus_desc": "Un Bombot bastante sospechoso. Creado por KirByte_Bi. <br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Creado por: KirByte_Bi</span>",
  "tower_Void_Glob_name": "Void Glob",
  "tower_Void_Glob_desc": "El abismo en sí. Los proyectiles de este Glob oscuro se curvan en el aire persiguiendo al enemigo. Ha perdido todo efecto, pero la muerte es segura.",
  "skin_pyce_morph_name": "Pyce Randomizer",
  "skin_pyce_morph_desc": "¡Sorpresa! Cada nivel de tu torre adopta la apariencia de un Pyce al azar.",
  "skin_dreams_name": "Set de Ensueño",
  "skin_dreams_desc": "¿Son estos tus heroes? Yo diria que si, son un buen equipo de ensueño.<br><span style='font-size:0.8em; color:#aaa;'>Los personajes pertenecen a HAL Laboratory y a Nintendo, yo solo tengo el derecho de Globs y Pyces.</span><br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Creado por: KirByte</span>",
  "skin_judicial_name": "Set Judicial",
  "skin_judicial_desc": "¡Que haya orden! Los Pyces no se mantendran andando mientras los Jueces y sus gatos anden sueltos!<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Creado por: KirByte</span>"
});

TRANSLATIONS['en'] = Object.assign({}, TRANSLATIONS['en'] || {}, {
  "skin_sharkbot_name": "SharkBot",
  "skin_sharkbot_desc": "A steel robotic shark with propulsion. <br><span style='color: #ff3333; font-weight: bold; text-shadow: 0 0 5px rgba(255,51,51,0.5);'>Credit: Nitrogen</span>",
  "skin_globsus_name": "GlobSus",
  "skin_globsus_desc": "A very suspicious Bombot. Created by KirByte_Bi. <br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Created by: KirByte_Bi</span>",
  "tower_Void_Glob_name": "Void Glob",
  "tower_Void_Glob_desc": "The abyss itself. The projectiles of this dark Glob curve in the air chasing the enemy. It has lost all effects, but death is certain.",
  "skin_pyce_morph_name": "Pyce Randomizer",
  "skin_pyce_morph_desc": "Surprise! Each level of your tower takes the appearance of a random Pyce.",
  "skin_dreams_name": "Dreams Set",
  "skin_dreams_desc": "Are these your heroes? I'd say yes, they are a good dream team.<br><span style='font-size:0.8em; color:#aaa;'>The characters belong to HAL Laboratory and Nintendo, I only have the rights to Globs and Pyces.</span><br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Created by: KirByte</span>",
  "skin_judicial_name": "Judicial Set",
  "skin_judicial_desc": "Let there be order! The Pyces won't keep walking while the Judges and their cats are on the loose!<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Created by: KirByte</span>"
});

window.SKIN_META = window.SKIN_META || {};
Object.assign(window.SKIN_META, {
  "espadas_corrompidas": {
    descKey: "skin_corrupted_swords_desc",
    attacks: {
      1: { type: 'projectile', color: '#00FFFF' }, // EVO1: Azul cian
      2: { type: 'projectile', color: '#39FF14' }, // EVO2: Verde neón
      3: { type: 'projectile', color: 'multicolor', palette: ['#FFEA00', '#00B4FF', '#C58ED3', '#8B0000'] }, // EVO3: multicolor
      4: { type: 'gradient', from: '#FF7F00', to: '#001F5B' } // EVO4: naranja <-> azul oscuro
    }
  },
  "mimic_pyce": {
    attacks: {
      1: { type: 'projectile', color: '#007BFF' }, // EVO1: Disparos azules
      2: { type: 'projectile', color: '#8B4513' }, // EVO2: Disparos marrones
      3: { type: 'blackwhite', palette: ['#000000', '#FFFFFF'] } // EVO3: agujero negro (negro/blanco)
    }
  }
});
/* --- END INSERTAR --- */


