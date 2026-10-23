// [DATOS DEL JUEGO: IMAGENES Y NARRADORES]
// Rutas de imagenes (IMAGE_PATHS) y dialogos de narradores (NARRATOR_DATA).
// Debe cargarse ANTES de config.js: TOWER_TYPES, ENEMY_TYPES y NARRATOR_DATA
// usan IMAGE_PATHS en el momento de definirse.

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
  'ElectroClean_Glob': 'img/ElectroClean Glob (EVO3).png',
  'Omnipresent_Glob': 'Spooks in the Desert (UPD4)/PLACEHOLDERS/Omnipresent Glob (PLACEHOLDER).png',
  'Kirb_Glob': 'Spooks in the Desert (UPD4)/KirByte (GOD)/Kirb (GOD).png',
  'Broksp': 'Spooks in the Desert (UPD4)/Enemigos/Broksp.png',
  'Blood_Taker': 'Spooks in the Desert (UPD4)/Enemigos/Blood-Taker.png',
  'Pumpitch': 'Spooks in the Desert (UPD4)/Enemigos/Pumpitch.png',
  'RIPslide': 'Spooks in the Desert (UPD4)/Enemigos/RIPslide.png',
  'Sneekmy': 'Spooks in the Desert (UPD4)/Enemigos/Sneekmy.png',
  'SkeleBone_Pyce': 'Spooks in the Desert (UPD4)/Pyces/SkeleBone Pyce (RW).png',
  'SkeleBone_Bone': 'Spooks in the Desert (UPD4)/Pyces/Proyectil Hueso.png',
  'Curse_Boneker': 'Spooks in the Desert (UPD4)/Jefes/Curse Boneker.png',
  'Ghost_Pyce': 'Spooks in the Desert (UPD4)/Pyces/Ghost Pyce.png',
  'ZomPyce': 'Spooks in the Desert (UPD4)/Pyces/ZomPyce.png',
  'Clockwork_Titan': 'Spooks in the Desert (UPD4)/TIME ATTACK/Clockwork Titan.png',
  'DIY_Bot': 'Spooks in the Desert (UPD4)/TIME ATTACK/DIY-Bot.png',
  'Hatspy': 'Spooks in the Desert (UPD4)/TIME ATTACK/Hatspy.png',
  'Local_Engines': 'Spooks in the Desert (UPD4)/TIME ATTACK/Local Engines.png',
  'Roborb': 'Spooks in the Desert (UPD4)/TIME ATTACK/Roborb the Time Stealer (JEFE).png',
  'Untimed_Atoms': 'Spooks in the Desert (UPD4)/TIME ATTACK/Untimed Atoms.png',
  'Across_Time_Trophy': 'Spooks in the Desert (UPD4)/Skins/Virtuallity Set (Gray)/Across the Time thropy.png',
  'GODs_Shadow': 'Spooks in the Desert (UPD4)/KirByte (GOD)/Kirb (GOD).png',
  'Ducky_Glob': 'img/Ducky_Glob.png',
  'Golden_Ducky_Glob': 'img/Golden_Ducky_Glob.png',
  'Rick_Duck_Glob': 'img/Rich Duck Glob (EVO3).png',
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
  'Youtuber_Glob': 'Urbanistic Road (BIG UPDATE)/Globs/Familia Rosa/Youtuber Glob (EVO3).png',

  // Frozen Calendar Christmas assets
  'Festive_Pyce': 'FROZEN CALENDAR CHRISTMAS (UPD6)/Enemigos/Pyces/Festive Pyce.png',
  'ToyBomb_Pyce': 'FROZEN CALENDAR CHRISTMAS (UPD6)/Enemigos/Pyces/ToyBomb Pyce.png',
  'SnowCapsule_Pyce': 'FROZEN CALENDAR CHRISTMAS (UPD6)/Enemigos/Pyces/SnowCapaule Pyce.png',
  'Elf_Pyce': 'FROZEN CALENDAR CHRISTMAS (UPD6)/Enemigos/Pyces/Elf Pyce.png',
  'Giftbox1': 'FROZEN CALENDAR CHRISTMAS (UPD6)/Enemigos/Otros enemigos/GiftBox1.png',
  'Giftbox2': 'FROZEN CALENDAR CHRISTMAS (UPD6)/Enemigos/Otros enemigos/GiftBox2.png',
  'Giftbox3': 'FROZEN CALENDAR CHRISTMAS (UPD6)/Enemigos/Otros enemigos/GiftBox3.png',
  'Giftbox4': 'FROZEN CALENDAR CHRISTMAS (UPD6)/Enemigos/Otros enemigos/GiftBox4.png',
  'Santa_Workshop_Trap1': 'FROZEN CALENDAR CHRISTMAS (UPD6)/Skins/Advent Calendar/Santa_s Workshop (NARANJA)/Vallas/Festive Fence (T1).png',
  'Santa_Workshop_Trap2': 'FROZEN CALENDAR CHRISTMAS (UPD6)/Skins/Advent Calendar/Santa_s Workshop (NARANJA)/Vallas/Portable Factory (T2).png',
  'Santa_Workshop_Trap3': 'FROZEN CALENDAR CHRISTMAS (UPD6)/Skins/Advent Calendar/Santa_s Workshop (NARANJA)/Vallas/North Maquette (T3).png',
  'Santa_Workshop_Trap4': 'FROZEN CALENDAR CHRISTMAS (UPD6)/Skins/Advent Calendar/Santa_s Workshop (NARANJA)/Vallas/Rudolf Glob (T4).png',
  'Santa_Workshop_Gift_Projectile': 'FROZEN CALENDAR CHRISTMAS (UPD6)/Skins/Advent Calendar/Santa_s Workshop (NARANJA)/Proyectil exclusivo/Gifts (Spinning Projectile).png',

  // Interstellar Menace Assets
  'Leni_the_big_Hammer': 'Interestelar Menace (COLLAB UPD)/Enemigos/Leni the big Hammer.png',
  'Monster': 'Interestelar Menace (COLLAB UPD)/Enemigos/Monster.png',
  'Cristalized_Monster': 'Interestelar Menace (COLLAB UPD)/Enemigos Cristalizados/Cristalized Monster.png',
  'Lenistal': 'Interestelar Menace (COLLAB UPD)/Enemigos Cristalizados/Lenistal.png',
  'NO_CrystEye_CB': 'Interestelar Menace (COLLAB UPD)/Enemigos Cristalizados/NO-CrystEye (CB).png',
  'AstrorbOrbe': 'Interestelar Menace (COLLAB UPD)/Jefe (Artrorb)/AstrorbOrbe.png',
  'AstrorbContenida': 'Interestelar Menace (COLLAB UPD)/Jefe (Artrorb)/AstrorbContenido.png',
  'AstrorbTF': 'Interestelar Menace (COLLAB UPD)/Jefe (Artrorb)/AstrorbTF.png',
  'Sharowd': 'Misiones (2026)/Jefes/Sharowd.png',
  'Crystalic_Orb': 'Misiones (2026)/Jefes/Crystalic Orb.png',
  'MiniCrystal': 'Misiones (2026)/Elementos/Minicristal.png',
  'Crystal': 'Misiones (2026)/Elementos/Cristal.png',
  'BigCrystal': 'Misiones (2026)/Elementos/Cristal Grande.png',
  'MegaCrystal': 'Misiones (2026)/Elementos/Megacristal.png',
  'GigaCrystal': 'Misiones (2026)/Elementos/Gigacristal.png',
  'Cuby_BombotA1': 'Interestelar Menace (COLLAB UPD)/Skins/Work-Bombot/Cuby (BombotA1).png',
  'Cuby_BombotA2': 'Interestelar Menace (COLLAB UPD)/Skins/Work-Bombot/Cuby (BombotA2).png',
  'Cube_Bomb_CB': 'Interestelar Menace (COLLAB UPD)/Skins/Work-Bombot/Cube Bomb (SK-CB).png',
  'Crystal_Bombot': 'Interestelar Menace (COLLAB UPD)/Enemigos Cristalizados/Crystal-Bombot.png',
  'Crystal_Pyce': 'Interestelar Menace (COLLAB UPD)/Enemigos Cristalizados/Crystal Pyce.png',
  'Dreamy_SPyce': 'Interestelar Menace (COLLAB UPD)/Enemigos Cristalizados/Dreamy SPyce.png',
  'Astral_BPyce': 'Interestelar Menace (COLLAB UPD)/Enemigos Cristalizados/Astral BPyce.png',
  
  // New Additions
  'SpyGlob': 'img/SpyGlob (EVO3).png',
  'Sprout_Glob': 'Interestelar Menace (COLLAB UPD)/Torres/Familia Marron/Sprout_Glob.png',
  'Garden_Glob': 'Interestelar Menace (COLLAB UPD)/Torres/Familia Marron/Garden_Glob.png',
  'Flower_Glob': 'Interestelar Menace (COLLAB UPD)/Torres/Familia Marron/Flower_Glob.png',
  'Spanish_Bombot': 'Interestelar Menace (COLLAB UPD)/Skins/Work-Bombot/Spanish-Bombot/Spanish-Bombot.png',

  // Sunlight Seaside / Leafy Beach Party Assets
  // New Pyces
  'Axolotl_Pyce': 'Leafy Beach Party/Pyces/Axolotl Pyce.png',
  'Shark_Pyce': 'Leafy Beach Party/Pyces/Shark Pyce.png',
  'Umbrella_Pyce': 'Leafy Beach Party/Pyces/Umbrella Pyce.png',
  // New Sunlight Seaside enemies
  'Piz': 'Leafy Beach Party/Enemigos nuevos/Piz.png',
  'Followishers': 'Leafy Beach Party/Enemigos nuevos/Followishers.png',
  'Creamplet': 'Leafy Beach Party/Enemigos nuevos/Creamplet.png',

  // Sunlight Seaside / Leafy Beach Party Assets
  'Ren': 'Leafy Beach Party/Enemigos nuevos/Ren.png',
  'Thunren': 'Leafy Beach Party/Enemigos nuevos/ThunRen.png',
  'Renibig': 'Leafy Beach Party/Enemigos nuevos/Renibig.png',
  'Treeper': 'Leafy Beach Party/Enemigos nuevos/Treeper.png',
  'Big_Treeper': 'Leafy Beach Party/Enemigos nuevos/Big Treeper.png',
  'Stacked_Treepers': 'Leafy Beach Party/Enemigos nuevos/Stacked Treeper.png',
  'Baby_Shrum': 'Leafy Beach Party/Enemigos nuevos/Baby Shrum.png',
  'Shrum': 'Leafy Beach Party/Enemigos nuevos/Shrum (regular).png',
  'Old_Fungus': 'Leafy Beach Party/Enemigos nuevos/Old Fungus.png',
  'Pysh': 'Leafy Beach Party/Pyces/Pysh.png',
  'Clown_Pysh': 'Leafy Beach Party/Pyces/Clown Pysh.png',
  'PhantKeeper': 'Leafy Beach Party/Jefes/PhantKeeper.png',
  'GlitchKeeper': 'Leafy Beach Party/Jefes/GlitchKeeper.png',
  'DarkSpirit': 'Leafy Beach Party/Jefes/Darkspirit.png',
  'Bushi_Brella': 'Leafy Beach Party/Enemigos nuevos/Mimic/Bushi-Brella.png',
  'Pirate_Glob': 'Leafy Beach Party/Globs/F. Marina/Crew Glob (EVO1).png',
  'PMate_Glob': 'Leafy Beach Party/Globs/F. Marina/PMate Glob (EVO2).png',
  'BreathKing_Glob': 'Leafy Beach Party/Globs/F. Marina/Breath-King Glob (EVO3).png',
  'Haunted_Pirate_Glob': 'Leafy Beach Party/Globs/F. Marina/Haunted Pirate Glob (EVO4).png',
  'Boat_S1': 'Leafy Beach Party/Globs/F. Marina/Sunmons/Handcraft Raft (S1).png',
  'Boat_S2': 'Leafy Beach Party/Globs/F. Marina/Sunmons/Nessy Boat (S2).png',
  'Boat_S3': 'Leafy Beach Party/Globs/F. Marina/Sunmons/Woodwn Ship (S3).png',
  'Boat_S4': 'Leafy Beach Party/Globs/F. Marina/Sunmons/Haunted Zip (S4).png',
  'Boat_S1_Broken': 'Leafy Beach Party/Globs/F. Marina/Sunmons/(OGs)/Broken Boat (S1).png',
  'Boat_S2_Destroyed': 'Leafy Beach Party/Globs/F. Marina/Sunmons/(OGs)/Destroyed Ship (S2).png'
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
      name: "Glob", msgs: [
        "Me pregunto por que atacamos a los Pyces. ¿No son amigos?",
        "¿No viven los Pyces 2.0 en Bitlands? ¡Si este es mi hogar!",
        "¡Ojala pudiera darles su merecido a esos corruptos...",
        "¡Oh no... Aquí vienen los disparadores!",
        "¡AYUDA! ¡Vienen demasiados!",
        "¿Alguien tiene un paraguas? Creo que va a llover... Pyces."
      ]
    }, en: {
      name: "Glob", msgs: [
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
  },
  mysterybug: {
    img: 'img/Sellos/MysteryBug.png', es: { name: 'MysteryBug', msgs: [] }, en: { name: 'MysteryBug', msgs: [] }
  },
  omnipresent: {
    img: IMAGE_PATHS.Omnipresent_Glob, es: { name: '???', msgs: [] }, en: { name: '???', msgs: [] }
  },
  festive_pyce: {
    img: IMAGE_PATHS.Festive_Pyce,
    es: { name: 'Festive Pyce', msgs: ['¡Este año voy a ayudar a repartir todos los regalos!'] },
    en: { name: 'Festive Pyce', msgs: ['This year, I will help deliver every gift!'] }
  },
  toybomb_pyce: {
    img: IMAGE_PATHS.ToyBomb_Pyce,
    es: { name: 'ToyBomb Pyce', msgs: ['¡Estoy perfectamente... calibrado! Creo.'] },
    en: { name: 'ToyBomb Pyce', msgs: ['I am perfectly... calibrated! I think.'] }
  },
  snowcapsule_pyce: {
    img: IMAGE_PATHS.SnowCapsule_Pyce,
    es: { name: 'SnowCapsule Pyce', msgs: ['No hace falta que tenga cara para dejaros helados.'] },
    en: { name: 'SnowCapsule Pyce', msgs: ['I do not need a face to freeze you in your tracks.'] }
  },
  elf_pyce: {
    img: IMAGE_PATHS.Elf_Pyce,
    es: { name: 'Elf Pyce', msgs: ['Santa Pyce puede contar conmigo. ¡Volvemos a la carga!'] },
    en: { name: 'Elf Pyce', msgs: ['Santa Pyce can count on me. We are back in action!'] }
  },
  giftbox_pyce: {
    img: IMAGE_PATHS.Giftbox1,
    es: { name: 'Giftbox', msgs: ['¡No intentes abrirme! Lo de dentro es puro metal.'] },
    en: { name: 'Giftbox', msgs: ['Do not try to open me! I am solid metal inside.'] }
  },
  jerry: {
    img: 'img/Sellos/MysteryBug.png', es: { name: 'Jerry', msgs: [] }, en: { name: 'Jerry', msgs: [] }
  },
  mysterybug_custom: {
    img: 'img/Sellos/MysteryBug.png', es: { name: 'MysteryBug', msgs: [] }, en: { name: 'MysteryBug', msgs: [] }
  },
  astral_exclamation: {
    img: 'img/Sellos/AstralExclamation.png', es: { name: 'AstralExclamation', msgs: [] }, en: { name: 'AstralExclamation', msgs: [] }
  },
  error_entity: {
    img: 'img/Sellos/AstralExclamation.png', es: { name: 'ERROR', msgs: [] }, en: { name: 'ERROR', msgs: [] }
  },
  login_guy: {
    img: 'img/Sellos/AstralExclamation.png', es: { name: 'LoginGuy', msgs: [] }, en: { name: 'LoginGuy', msgs: [] }
  },
  kirb_clone: {
    img: IMAGE_PATHS.GODs_Shadow,
    es: { name: 'GODs Shadow', msgs: [] },
    en: { name: 'GODs Shadow', msgs: [] }
  }
};
