// [TRADUCCION DEL JUEGO]
// ===================== CONFIGURACIÓN Y DATOS DEL JUEGO =====================


let USERS = {
  "KirByteBi": "FTPY2",
  "Glob_BUILD": "BUILD_DEV",
  "Admin": "ADgod",
  "AirRider": "PYCE",
  "Player": "1234"
};

const ROLES = {
  'KirByteBi': 'OWNER',
  'Devbuild': 'DEVBUILD',
  'Glob_BUILD': 'DEVBUILD',
  'admin': 'ADMIN',
  'Admin': 'ADMIN'
};
function getUserRole(user) {
  return ROLES[user] || 'USER';
}


const TOWER_TYPES = {
  'Glob': { name: 'tower_Glob_name', damage: 10, range: 150, speed: 1.0, cost: 50, evolution: 'Poop_Glob', image: IMAGE_PATHS.Glob, projectile: 'green', desc: "tower_Glob_desc", family: 'Glob' },
  'Poop_Glob': { name: 'tower_Poop_Glob_name', damage: 25, range: 150, speed: 0.6, cost: 100, evolution: 'Golden_Glob', image: IMAGE_PATHS.Poop_Glob, projectile: 'brown', desc: "tower_Poop_Glob_desc", family: 'Glob' },
  'Golden_Glob': { name: 'tower_Golden_Glob_name', damage: 45, range: 170, speed: 1.4, cost: 200, evolution: 'Rainbow_Glob', image: IMAGE_PATHS.Golden_Glob, projectile: 'gold', desc: "tower_Golden_Glob_desc", family: 'Glob' },
  'Rainbow_Glob': { name: 'tower_Rainbow_Glob_name', damage: 30, range: 180, speed: 1.8, cost: 400, image: IMAGE_PATHS.Rainbow_Glob, projectile: 'laser_rainbow', piercing: true, desc: "tower_Rainbow_Glob_desc", family: 'Glob' },

  'Red_Glob': { name: 'tower_Red_Glob_name', damage: 35, range: 130, speed: 2.0, cost: 70, evolution: 'Molten_Glob', image: IMAGE_PATHS.Red_Glob, melee: true, desc: "tower_Red_Glob_desc", family: 'Red_Glob' },
  'Molten_Glob': { name: 'tower_Molten_Glob_name', damage: 25, range: 120, speed: 2.2, cost: 150, evolution: 'Robotic_Glob', image: IMAGE_PATHS.Molten_Glob, burn: true, burnDamage: 5, desc: "tower_Molten_Glob_desc", family: 'Red_Glob' },
  'Robotic_Glob': { name: 'tower_Robotic_Glob_name', damage: 65, range: 150, speed: 1.0, cost: 300, image: IMAGE_PATHS.Robotic_Glob, projectile: 'laser_red', piercing: true, burn: true, desc: "tower_Robotic_Glob_desc", family: 'Red_Glob' },

  'Soap_Glob': { name: 'tower_Soap_Glob_name', damage: 0, range: 120, speed: 0.3, cost: 60, evolution: 'Cotton_Glob', image: IMAGE_PATHS.Soap_Glob, projectile: 'blue', slow: 0.4, desc: "tower_Soap_Glob_desc", family: 'Soap_Glob', unlocked: false },
  'Cotton_Glob': { name: 'tower_Cotton_Glob_name', damage: 5, range: 140, speed: 2.6, cost: 120, evolution: 'ElectroClean_Glob', image: IMAGE_PATHS.Cotton_Glob, projectile: 'blue', slow: 0.6, desc: "tower_Cotton_Glob_desc", family: 'Soap_Glob' },
  'ElectroClean_Glob': { name: 'tower_ElectroClean_Glob_name', damage: 12, range: 160, speed: 4.2, cost: 300, image: IMAGE_PATHS.ElectroClean_Glob, projectile: 'blue', stun: 1, knockback: 0.25, desc: "tower_ElectroClean_Glob_desc", family: 'Soap_Glob' },

  'Ducky_Glob': { name: 'tower_Ducky_Glob_name', damage: 0, range: 140, speed: 0, cost: 80, evolution: 'Golden_Ducky_Glob', image: IMAGE_PATHS.Ducky_Glob, projectile: 'none', desc: "tower_Ducky_Glob_desc", family: 'Ducky_Glob', unlocked: false },
  'Golden_Ducky_Glob': { name: 'tower_Golden_Ducky_Glob_name', damage: 0, range: 160, speed: 0, cost: 180, evolution: 'Rick_Duck_Glob', image: IMAGE_PATHS.Golden_Ducky_Glob, projectile: 'none', desc: "tower_Golden_Ducky_Glob_desc", family: 'Ducky_Glob' },
  'Rick_Duck_Glob': { name: 'tower_Rick_Duck_Glob_name', damage: 0, range: 180, speed: 0, cost: 400, image: IMAGE_PATHS.Rick_Duck_Glob, projectile: 'none', desc: "tower_Rick_Duck_Glob_desc", family: 'Ducky_Glob' },

  'Comet_Glob': { name: 'tower_Comet_Glob_name', damage: 50, range: 250, speed: 0.25, cost: 250, evolution: 'Dark_Glob', image: IMAGE_PATHS.Comet_Glob, projectile: 'star_boomerang', piercing: true, boomerang: true, desc: "tower_Comet_Glob_desc", family: 'Comet_Glob' },
  'Dark_Glob': { name: 'tower_Dark_Glob_name', damage: 80, range: 280, speed: 0.5, cost: 400, evolution: 'Demglob', image: IMAGE_PATHS.Dark_Glob, projectile: 'diamond_boomerang', piercing: true, boomerang: true, desc: "tower_Dark_Glob_desc", family: 'Comet_Glob' },
  'Demglob': { name: 'tower_Demglob_name', damage: 200, range: 300, speed: 2.0, cost: 1000, evolution: 'Void_Glob', image: IMAGE_PATHS.Demglob, projectile: 'laser_purple', desc: "tower_Demglob_desc", family: 'Comet_Glob' },
  'Void_Glob': { name: 'tower_Void_Glob_name', damage: 500, range: 400, speed: 1.0, cost: 2500, image: IMAGE_PATHS.Void_Glob, projectile: 'void_tracker', tracking: true, desc: "tower_Void_Glob_desc", family: 'Comet_Glob' },

  'Pyce_Glob': { name: 'tower_Pyce_Glob_name', damage: 30, range: 180, speed: 4.5, cost: 150, evolution: 'SpyGlob', image: IMAGE_PATHS.Pyce_Glob, projectile: 'glitch', unlocked: false, desc: "tower_Pyce_Glob_desc", family: 'Grey' },
  'SpyGlob': { name: 'tower_SpyGlob_name', damage: 45, range: 220, speed: 6.0, cost: 350, image: IMAGE_PATHS.SpyGlob, projectile: 'spyglob_multi', unlocked: false, desc: "tower_SpyGlob_desc", family: 'Grey' },
  'Old_Glob': { name: 'tower_Old_Glob_name', damage: 40, range: 200, speed: 3.5, cost: 200, evolution: 'Pyce_Glob', image: IMAGE_PATHS.Old_Glob, projectile: 'stone', unlocked: false, desc: "tower_Old_Glob_desc", family: 'Grey' },
  'Work_Bombot': { name: 'tower_Work_Bombot_name', damage: 100, range: 150, speed: 0.6, cost: 350, image: IMAGE_PATHS.Work_Bombot, aoe: 80, unlocked: false, desc: "tower_Work_Bombot_desc", family: 'Special' },

  // Familia Blanca
  'Balloon_Glob': { name: 'tower_Balloon_Glob_name', damage: 0, range: 100, speed: 0, cost: 120, evolution: 'Heliglob', image: IMAGE_PATHS.Balloon_Glob, projectile: 'none', desc: "tower_Balloon_Glob_desc", family: 'White', unlocked: false },
  'Heliglob': { name: 'tower_Heliglob_name', damage: 0, range: 150, speed: 0, cost: 250, evolution: 'Alien_Glob', image: IMAGE_PATHS.Heliglob, projectile: 'none', desc: "tower_Heliglob_desc", family: 'White' },
  'Alien_Glob': { name: 'tower_Alien_Glob_name', damage: 0, range: 200, speed: 0, cost: 500, image: IMAGE_PATHS.Alien_Glob, projectile: 'none', desc: "tower_Alien_Glob_desc", family: 'White' },

  // Familia Rosa
  'Streamer_Glob': { name: 'tower_Streamer_Glob_name', damage: 0, range: 100, speed: 0, cost: 100, evolution: 'Gamer_Glob', image: IMAGE_PATHS.Streamer_Glob, projectile: 'none', desc: "tower_Streamer_Glob_desc", family: 'Pink', unlocked: false },
  'Gamer_Glob': { name: 'tower_Gamer_Glob_name', damage: 0, range: 150, speed: 0, cost: 200, evolution: 'Youtuber_Glob', image: IMAGE_PATHS.Gamer_Glob, projectile: 'none', desc: "tower_Gamer_Glob_desc", family: 'Pink' },
  'Youtuber_Glob': { name: 'tower_Youtuber_Glob_name', damage: 0, range: 200, speed: 0, cost: 400, image: IMAGE_PATHS.Youtuber_Glob, projectile: 'none', desc: "tower_Youtuber_Glob_desc", family: 'Pink' },

  // Instantanea Explosiva
  'Bomb_Glob': { name: 'tower_Bomb_Glob_name', damage: 100, range: 100, speed: 0, cost: 300, evolution: 'TNT_Glob', image: IMAGE_PATHS.Bomb_Glob, projectile: 'none', unlocked: false, desc: "tower_IEx1_desc", family: 'IEx' },
  'TNT_Glob': { name: 'tower_TNT_Glob_name', damage: 250, range: 140, speed: 0, cost: 600, evolution: 'Nuclear_Glob', image: IMAGE_PATHS.TNT_Glob, projectile: 'none', desc: "tower_IEx2_desc", family: 'IEx' },
  'Nuclear_Glob': { name: 'tower_Nuclear_Glob_name', damage: 800, range: 220, speed: 0, cost: 1200, image: IMAGE_PATHS.Nuclear_Glob, projectile: 'none', desc: "tower_IEx3_desc", family: 'IEx' },

  // Worker Glob Family (Trampas)
  'Worker_Glob': { name: 'tower_Worker_Glob_name', damage: 15, range: 110, speed: 0.25, cost: 150, evolution: 'Police_Glob', image: IMAGE_PATHS.Worker_Glob, trap: 'Worker_Trap', desc: "tower_Worker_Glob_desc", family: 'Worker_Glob', unlocked: false },
  'Police_Glob': { name: 'tower_Police_Glob_name', damage: 30, range: 130, speed: 0.35, cost: 300, evolution: 'Planked_Glob', image: IMAGE_PATHS.Police_Glob, trap: 'Police_Trap', desc: "tower_Police_Glob_desc", family: 'Worker_Glob' },
  'Planked_Glob': { name: 'tower_Planked_Glob_name', damage: 70, range: 140, speed: 0.7, cost: 550, evolution: 'DJ_Glob', image: IMAGE_PATHS.Planked_Glob, trap: 'Planked_Trap', desc: "tower_Planked_Glob_desc", family: 'Worker_Glob' },
  'DJ_Glob': { name: 'tower_DJ_Glob_name', damage: 120, range: 160, speed: 0.8, cost: 1200, image: IMAGE_PATHS.DJ_Glob, trap: 'DJ_Trap', desc: "tower_DJ_Glob_desc", family: 'Worker_Glob' },

  // Familia Marron (Aura Ralentizadora)
  'Sprout_Glob': { name: 'tower_Sprout_Glob_name', damage: 0, range: 120, speed: 0, cost: 80, evolution: 'Garden_Glob', image: IMAGE_PATHS.Sprout_Glob, projectile: 'none', slowAura: 0.1, desc: "tower_Sprout_Glob_desc", family: 'Brown', unlocked: false },
  'Garden_Glob': { name: 'tower_Garden_Glob_name', damage: 0, range: 150, speed: 0, cost: 160, evolution: 'Flower_Glob', image: IMAGE_PATHS.Garden_Glob, projectile: 'none', slowAura: 0.2, desc: "tower_Garden_Glob_desc", family: 'Brown' },
  'Flower_Glob': { name: 'tower_Flower_Glob_name', damage: 0, range: 180, speed: 0, cost: 320, image: IMAGE_PATHS.Flower_Glob, projectile: 'none', slowAura: 0.3, desc: "tower_Flower_Glob_desc", family: 'Brown' },

  // Familia Marina (Invocadores)
  'Pirate_Glob': { name: 'tower_Pirate_Glob_name', damage: 50, range: 400, speed: 3.0, cost: 350, evolution: 'PMate_Glob', image: IMAGE_PATHS.Pirate_Glob, isSummoner: true, summonType: 'Boat_S1', desc: "tower_Pirate_Glob_desc", family: 'Pirate_Glob', unlocked: false },
  'PMate_Glob': { name: 'tower_PMate_Glob_name', damage: 100, range: 450, speed: 2.5, cost: 600, evolution: 'BreathKing_Glob', image: IMAGE_PATHS.PMate_Glob, isSummoner: true, summonType: 'Boat_S2', desc: "tower_Pirate_Glob_desc", family: 'Pirate_Glob' },
  'BreathKing_Glob': { name: 'tower_BreathKing_Glob_name', damage: 200, range: 500, speed: 2.0, cost: 1200, evolution: 'Haunted_Pirate_Glob', image: IMAGE_PATHS.BreathKing_Glob, isSummoner: true, summonType: 'Boat_S3', desc: "tower_Pirate_Glob_desc", family: 'Pirate_Glob' },
  'Haunted_Pirate_Glob': { name: 'tower_Haunted_Pirate_Glob_name', damage: 400, range: 600, speed: 1.5, cost: 2500, image: IMAGE_PATHS.Haunted_Pirate_Glob, isSummoner: true, summonType: 'Boat_S4', desc: "tower_Pirate_Glob_desc", family: 'Pirate_Glob' }
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
  'NOeye_Pyce': { name: 'enemy_NOeye_Pyce_name', desc: 'enemy_NOeye_Pyce_desc', health: 800, speed: 0.4, reward: 800, image: IMAGE_PATHS.NOeye_Pyce, boss: true, paralyzeLaser: true, stunCooldown: 12, shieldRatio: 0.2 },
  'MoonStar_Pyce': { name: 'enemy_MoonStar_Pyce_name', desc: 'enemy_MoonStar_Pyce_desc', mechanic_key: 'mechanic_moonstar', health: 2500, speed: 0.3, reward: 2000, image: IMAGE_PATHS.MoonStar_Pyce, boss: true, instakill: true, doubleLap: true, shieldRatio: 0.4 },

  'Stupid_GoldPyce': { name: 'enemy_Stupid_GoldPyce_name', desc: 'enemy_Stupid_GoldPyce_desc', mechanic_key: 'mechanic_gold', health: 80, speed: 2.0, reward: 150, image: IMAGE_PATHS.Stupid_GoldPyce, mimic: true },
  'Mimic_Pyce': { name: 'enemy_Mimic_Pyce_name', desc: 'enemy_Mimic_Pyce_desc', mechanic_key: 'mechanic_mimic_special', health: 500, speed: 1.8, reward: 1000, image: IMAGE_PATHS.Mimic_Pyce, mimic: true, isSpecialMimic: true },
  
  // Nuevos Pyces
  'Bomb_Pyce': { name: 'enemy_Bomb_Pyce_name', desc: 'enemy_Bomb_Pyce_desc', health: 100, speed: 1.5, reward: 30, image: IMAGE_PATHS.Bomb_Pyce, mechanic_key: 'mechanic_bomb' },
  'Knight_Pyce': { name: 'enemy_Knight_Pyce_name', desc: 'enemy_Knight_Pyce_desc', mechanic_key: 'mechanic_knight', health: 250, speed: 1.0, reward: 60, image: IMAGE_PATHS.Knight_Pyce },
  'Cannon_Pycer': { name: 'enemy_Cannon_Pycer_name', desc: 'enemy_Cannon_Pycer_desc', mechanic_key: 'mechanic_cannon', health: 300, speed: 0.8, reward: 70, image: IMAGE_PATHS.Cannon_Pycer, stunAbility: true, stunCooldown: 6 },
  'HoloPyce': { name: 'enemy_HoloPyce_name', desc: 'enemy_HoloPyce_desc', health: 180, speed: 1.2, reward: 40, image: IMAGE_PATHS.HoloPyce, holo: true, stealth: true, mechanic_key: 'mechanic_holo' },
  'Strechy_Pyce': { name: 'enemy_Strechy_Pyce_name', desc: 'enemy_Strechy_Pyce_desc', health: 220, speed: 1.1, reward: 50, image: IMAGE_PATHS.Strechy_Pyce },
  'Rebel_Pyce': { name: 'enemy_Rebel_Pyce_name', desc: 'enemy_Rebel_Pyce_desc', health: 150, speed: 2.8, reward: 45, image: IMAGE_PATHS.Rebel_Pyce },
  'Festive_Pyce': { name: 'enemy_Festive_Pyce_name', desc: 'enemy_Festive_Pyce_desc', health: 90, speed: 1.4, reward: 25, image: IMAGE_PATHS.Festive_Pyce, mapSource: 'frosty_christmas' },
  'ToyBomb_Pyce': { name: 'enemy_ToyBomb_Pyce_name', desc: 'enemy_ToyBomb_Pyce_desc', health: 120, speed: 2.3, reward: 35, image: IMAGE_PATHS.ToyBomb_Pyce, mechanic_key: 'mechanic_bomb', mapSource: 'frosty_christmas', explosive: true },
  'SnowCapsule_Pyce': { name: 'enemy_SnowCapsule_Pyce_name', desc: 'enemy_SnowCapsule_Pyce_desc', health: 260, speed: 0.85, reward: 55, image: IMAGE_PATHS.SnowCapsule_Pyce, mapSource: 'frosty_christmas', coldAura: true, coldAuraRange: 125, coldAuraSlow: 0.65 },
  'Elf_Pyce': { name: 'enemy_Elf_Pyce_name', desc: 'enemy_Elf_Pyce_desc', health: 210, speed: 0.95, reward: 50, image: IMAGE_PATHS.Elf_Pyce, mapSource: 'frosty_christmas' },
  'Giftbox_Pyce': { name: 'enemy_Giftbox_Pyce_name', desc: 'enemy_Giftbox_Pyce_desc', health: 750, speed: 0.55, reward: 80, image: IMAGE_PATHS.Giftbox1, imageVariants: [IMAGE_PATHS.Giftbox1, IMAGE_PATHS.Giftbox2, IMAGE_PATHS.Giftbox3, IMAGE_PATHS.Giftbox4], mapSource: 'frosty_christmas' },
  // Jefes fantasma de Frosty Christmas. NOsense (Corrupto) y NOIRrupt (Anti-Normal).
  'NOsense_Pyce': { name: 'enemy_NOsense_Pyce_name', desc: 'enemy_NOsense_Pyce_desc', health: 4500, speed: 0.4, reward: 3000, image: IMAGE_PATHS.NOsense_Pyce, boss: true, mapSource: 'frosty_christmas', enemyClass: 'boss', ghost: true, paralyzeLaser: true, stunCooldown: 12, shieldRatio: 0.2 },
  'NOIRrupt_Pyce': { name: 'enemy_NOIRrupt_Pyce_name', desc: 'enemy_NOIRrupt_Pyce_desc', health: 6500, speed: 1.8, reward: 4000, image: IMAGE_PATHS.NOIRrupt_Pyce, boss: true, mapSource: 'frosty_christmas', enemyClass: 'boss', ghost: true, tripleLap: true, paralyzeLaser: true, stunCooldown: 12, shieldRatio: 0.4 },
  // Puz & Zle (de I.D., NO son Pyces): al ser derrotados se separan en Puz y Zle.
  'Puz_Zle': { name: 'enemy_Puz_Zle_name', desc: 'enemy_Puz_Zle_desc', health: 320, speed: 1.1, reward: 60, image: IMAGE_PATHS.Puz_Zle, mapSource: 'frosty_christmas', splitInto: ['Puz', 'Zle'] },
  'Puz': { name: 'enemy_Puz_name', desc: 'enemy_Puz_desc', health: 120, speed: 1.4, reward: 30, image: IMAGE_PATHS.Puz, mapSource: 'frosty_christmas' },
  'Zle': { name: 'enemy_Zle_name', desc: 'enemy_Zle_desc', health: 120, speed: 1.4, reward: 30, image: IMAGE_PATHS.Zle, mapSource: 'frosty_christmas' },
  // Wingel Pyce: Pyce con alas; su aleteo da "suerte y felicidad" (cura) a enemigos cercanos poco tiempo.
  'Wingel_Pyce': { name: 'enemy_Wingel_Pyce_name', desc: 'enemy_Wingel_Pyce_desc', health: 170, speed: 1.3, reward: 45, image: IMAGE_PATHS.Wingel_Pyce, mapSource: 'frosty_christmas', healer: true, healRange: 120, healAmount: 8, healCooldown: 3 },
  
  // Gambling Enemies
  'BitY1': { name: 'enemy_BitY1_name', desc: 'enemy_BitY1_desc', health: 3, speed: 1.5, reward: 5, image: IMAGE_PATHS.BitY1, category: 'gambling' },
  'BitB4': { name: 'enemy_BitB4_name', desc: 'enemy_BitB4_desc', health: 3, speed: 1.5, reward: 5, image: IMAGE_PATHS.BitB4, category: 'gambling' },
  'BitG2': { name: 'enemy_BitG2_name', desc: 'enemy_BitG2_desc', health: 3, speed: 1.5, reward: 5, image: IMAGE_PATHS.BitG2, category: 'gambling' },
  'BitP3': { name: 'enemy_BitP3_name', desc: 'enemy_BitP3_desc', health: 3, speed: 1.5, reward: 5, image: IMAGE_PATHS.BitP3, category: 'gambling' },
  'ByteGB1': { name: 'enemy_ByteGB1_name', desc: 'enemy_Byte_desc', health: 24, speed: 1.0, reward: 15, image: IMAGE_PATHS.ByteGB1, category: 'gambling' },
  'ByteYP2': { name: 'enemy_ByteYP2_name', desc: 'enemy_Byte_desc', health: 24, speed: 1.0, reward: 15, image: IMAGE_PATHS.ByteYP2, category: 'gambling' },
  'BytePG3': { name: 'enemy_BytePG3_name', desc: 'enemy_Byte_desc', health: 24, speed: 1.0, reward: 15, image: IMAGE_PATHS.BytePG3, category: 'gambling' },
  'ByteYB4': { name: 'enemy_ByteYB4_name', desc: 'enemy_Byte_desc', health: 24, speed: 1.0, reward: 15, image: IMAGE_PATHS.ByteYB4, category: 'gambling' },
  'Fireflies': { name: 'enemy_Fireflies_name', desc: 'enemy_Fireflies_desc', health: 30, speed: 1.8, reward: 20, image: IMAGE_PATHS.Fireflies, category: 'gambling', fireImmune: true },
  'Spyware': { name: 'enemy_Spyware_name', desc: 'enemy_Spyware_desc', mechanic_key: 'mechanic_spyware', health: 130, speed: 1.6, reward: 35, image: IMAGE_PATHS.Spyware1, category: 'gambling', stealth: true },
  'Spyware1': { name: 'enemy_Spyware1_name', desc: 'enemy_Spyware_desc', mechanic_key: 'mechanic_spyware', health: 130, speed: 1.6, reward: 35, image: IMAGE_PATHS.Spyware1, category: 'gambling', stealth: true },
  'Spyware2': { name: 'enemy_Spyware2_name', desc: 'enemy_Spyware_desc', mechanic_key: 'mechanic_spyware', health: 130, speed: 1.6, reward: 35, image: IMAGE_PATHS.Spyware2, category: 'gambling', stealth: true },
  'Spyware3': { name: 'enemy_Spyware3_name', desc: 'enemy_Spyware_desc', mechanic_key: 'mechanic_spyware', health: 130, speed: 1.6, reward: 35, image: IMAGE_PATHS.Spyware3, category: 'gambling', stealth: true },
  'Arky': { name: 'enemy_Arky_name', desc: 'enemy_Arky_desc', mechanic_key: 'mechanic_arky', health: 1000, speed: 0.4, reward: 1000, image: IMAGE_PATHS.Arky, boss: true, arkyType: 'normal', category: 'gambling', shieldRatio: 0.4 },
  'CrystArky': { name: 'enemy_CrystArky_name', desc: 'enemy_CrystArky_desc', mechanic_key: 'mechanic_crystarky', health: 1500, speed: 0.35, reward: 1500, image: IMAGE_PATHS.CrystArky, boss: true, arkyType: 'crystal', category: 'gambling', shieldRatio: 0.2 },
  'ArkyVoid': { name: 'enemy_ArkyVoid_name', desc: 'enemy_ArkyVoid_desc', mechanic_key: 'mechanic_arkyvoid', health: 1500, speed: 0.35, reward: 1500, image: IMAGE_PATHS.ArkyVoid, boss: true, arkyType: 'void', category: 'gambling', shieldRatio: 0.4 },
  
  // Interstellar Menace Enemies
  'Leni_the_big_Hammer': { name: 'enemy_Leni_the_big_Hammer_name', desc: 'enemy_Leni_the_big_Hammer_desc', health: 120, speed: 1.0, reward: 25, image: IMAGE_PATHS.Leni_the_big_Hammer, category: 'other' },
  'Monster': { name: 'enemy_Monster_name', desc: 'enemy_Monster_desc', health: 250, speed: 0.8, reward: 40, image: IMAGE_PATHS.Monster, category: 'other' },
  'Cristalized_Monster': { name: 'enemy_Cristalized_Monster_name', desc: 'enemy_Cristalized_Monster_desc', health: 500, speed: 0.8, reward: 80, image: IMAGE_PATHS.Cristalized_Monster, isCrystallized: true, category: 'other' },
  'Lenistal': { name: 'enemy_Lenistal_name', desc: 'enemy_Lenistal_desc', health: 240, speed: 1.0, reward: 50, image: IMAGE_PATHS.Lenistal, isCrystallized: true, category: 'other' },
  'Crystal_Bombot': { name: 'enemy_Crystal_Bombot_name', desc: 'enemy_Crystal_Bombot_desc', health: 1000, speed: 0.6, reward: 500, image: IMAGE_PATHS.Crystal_Bombot, isCrystallized: true, boss: true, category: 'other' },
  'Crystal_Pyce': { name: 'enemy_Crystal_Pyce_name', desc: 'enemy_Crystal_Pyce_desc', health: 105, speed: 1.4, reward: 30, image: IMAGE_PATHS.Crystal_Pyce, isCrystallized: true },
  'Dreamy_SPyce': { name: 'enemy_Dreamy_SPyce_name', desc: 'enemy_Dreamy_SPyce_desc', health: 180, speed: 3.2, reward: 40, image: IMAGE_PATHS.Dreamy_SPyce, isCrystallized: true },
  'Astral_BPyce': { name: 'enemy_Astral_BPyce_name', desc: 'enemy_Astral_BPyce_desc', mechanic_key: 'mechanic_bomb', health: 230, speed: 1.5, reward: 45, image: IMAGE_PATHS.Astral_BPyce, isCrystallized: true },
  'NO_CrystEye_CB': { name: 'enemy_NOCrystEye_CB_name', desc: 'enemy_NOCrystEye_CB_desc', health: 1200, speed: 0.4, reward: 800, image: IMAGE_PATHS.NO_CrystEye_CB, isCrystallized: true, boss: true, paralyzeLaser: true, stunCooldown: 12, category: 'other', crystEyeVariantOf: 'NOeye_Pyce', shieldRatio: 0.2 },
  'AstrorbOrbe': { name: 'enemy_AstrorbOrbe_name', desc: 'enemy_AstrorbOrbe_desc', health: 800, speed: 1.2, reward: 0, image: IMAGE_PATHS.AstrorbOrbe, boss: true, category: 'other', astrorbGroup: true },
  'AstrorbContenida': { name: 'enemy_AstrorbContenida_name', desc: 'enemy_AstrorbContenida_desc', health: 600, speed: 2.0, reward: 1000, image: IMAGE_PATHS.AstrorbContenida, boss: true, category: 'other', astrorbGroup: true, astrorbForm: 2, shieldRatio: 0.2 },
  'AstrorbTF': { name: 'enemy_AstrorbTF_name', desc: 'enemy_AstrorbTF_desc', health: 3000, speed: 0.3, reward: 3000, image: IMAGE_PATHS.AstrorbTF, boss: true, instakill: true, doubleLap: true, category: 'other', astrorbGroup: true, astrorbForm: 3, shieldRatio: 0.4 },
  'Crystalic_Orb': { name: 'enemy_Crystalic_Orb_name', desc: 'enemy_Crystalic_Orb_desc', health: 5000, speed: 0.28, reward: 5000, image: IMAGE_PATHS.Crystalic_Orb, boss: true, instakill: true, category: 'other', isCrystallized: true, astrorbGroup: true, astrorbForm: 4, shieldRatio: 0.4 },
  'Sharowd': { name: 'enemy_Sharowd_name', desc: 'enemy_Sharowd_desc', health: 1200, speed: 0.45, reward: 1200, image: IMAGE_PATHS.Sharowd, boss: true, category: 'other', blockQuestBoss: true },

  // Sunlight Seaside Enemies
  'Ren': { name: 'enemy_Ren_name', desc: 'enemy_Ren_desc', health: 60, speed: 1.5, reward: 15, image: IMAGE_PATHS.Ren, mapSource: 'sunlight_seaside', enemyClass: 'shooter' },
  'Thunren': { name: 'enemy_Thunren_name', desc: 'enemy_Thunren_desc', health: 120, speed: 1.8, reward: 30, image: IMAGE_PATHS.Thunren, mapSource: 'sunlight_seaside', enemyClass: 'shooter' },
  'Renibig': { name: 'enemy_Renibig_name', desc: 'enemy_Renibig_desc', health: 300, speed: 1.0, reward: 80, image: IMAGE_PATHS.Renibig, mapSource: 'sunlight_seaside', enemyClass: 'tank' },
  'Treeper': { name: 'enemy_Treeper_name', desc: 'enemy_Treeper_desc', health: 150, speed: 1.0, reward: 20, image: IMAGE_PATHS.Treeper, mapSource: 'sunlight_seaside', enemyClass: 'melee' },
  'Big_Treeper': { name: 'enemy_Big_Treeper_name', desc: 'enemy_Big_Treeper_desc', health: 450, speed: 0.7, reward: 60, image: IMAGE_PATHS.Big_Treeper, mapSource: 'sunlight_seaside', enemyClass: 'tank' },
  'Stacked_Treepers': { name: 'enemy_Stacked_Treepers_name', desc: 'enemy_Stacked_Treepers_desc', health: 800, speed: 0.5, reward: 120, image: IMAGE_PATHS.Stacked_Treepers, mapSource: 'sunlight_seaside', enemyClass: 'tank' },
  'Baby_Shrum': { name: 'enemy_Baby_Shrum_name', desc: 'enemy_Baby_Shrum_desc', health: 40, speed: 2.0, reward: 10, image: IMAGE_PATHS.Baby_Shrum, mapSource: 'sunlight_seaside', enemyClass: 'melee' },
  'Shrum': { name: 'enemy_Shrum_name', desc: 'enemy_Shrum_desc', health: 100, speed: 1.2, reward: 25, image: IMAGE_PATHS.Shrum, mapSource: 'sunlight_seaside', enemyClass: 'melee' },
  'Old_Fungus': { name: 'enemy_Old_Fungus_name', desc: 'enemy_Old_Fungus_desc', health: 600, speed: 0.6, reward: 150, image: IMAGE_PATHS.Old_Fungus, boss: true, mapSource: 'sunlight_seaside', enemyClass: 'boss' },
  'Pysh': { name: 'enemy_Pysh_name', desc: 'enemy_Pysh_desc', health: 80, speed: 1.6, reward: 20, image: IMAGE_PATHS.Pysh, mapSource: 'sunlight_seaside', enemyClass: 'melee' },
  'Clown_Pysh': { name: 'enemy_Clown_Pysh_name', desc: 'enemy_Clown_Pysh_desc', health: 200, speed: 1.4, reward: 50, image: IMAGE_PATHS.Clown_Pysh, mapSource: 'sunlight_seaside', enemyClass: 'tank' },
  
  // Nuevos Pyces de Sunlight Seaside
  'Axolotl_Pyce': { name: 'enemy_Axolotl_Pyce_name', desc: 'enemy_Axolotl_Pyce_desc', health: 60, speed: 2.5, reward: 20, image: IMAGE_PATHS.Axolotl_Pyce, mapSource: 'sunlight_seaside', enemyClass: 'melee' },
  'Shark_Pyce': { name: 'enemy_Shark_Pyce_name', desc: 'enemy_Shark_Pyce_desc', health: 200, speed: 1.8, reward: 50, image: IMAGE_PATHS.Shark_Pyce, mapSource: 'sunlight_seaside', enemyClass: 'melee' },
  'Umbrella_Pyce': { name: 'enemy_Umbrella_Pyce_name', desc: 'enemy_Umbrella_Pyce_desc', health: 120, speed: 1.5, reward: 30, image: IMAGE_PATHS.Umbrella_Pyce, mapSource: 'sunlight_seaside', enemyClass: 'melee' },

  // Nuevos enemigos de Sunlight Seaside
  'Piz': { name: 'enemy_Piz_name', desc: 'enemy_Piz_desc', health: 180, speed: 2.0, reward: 40, image: IMAGE_PATHS.Piz, mapSource: 'sunlight_seaside', enemyClass: 'melee' },
  'Followishers': { name: 'enemy_Followishers_name', desc: 'enemy_Followishers_desc', health: 350, speed: 1.3, reward: 80, image: IMAGE_PATHS.Followishers, mapSource: 'sunlight_seaside', enemyClass: 'tank' },
  'Creamplet': { name: 'enemy_Creamplet_name', desc: 'enemy_Creamplet_desc', health: 90, speed: 1.4, reward: 25, image: IMAGE_PATHS.Creamplet, mapSource: 'sunlight_seaside', enemyClass: 'melee' },

  // Leafy Beach Party Bosses & Enemies
  'PhantKeeper': { name: 'enemy_PhantKeeper_name', desc: 'enemy_PhantKeeper_desc', health: 3000, speed: 0.3, reward: 2000, image: IMAGE_PATHS.PhantKeeper, boss: true, mechanic_key: 'mechanic_boss', honeySlow: true, mapSource: 'sunlight_seaside' },
  'GlitchKeeper': { name: 'enemy_GlitchKeeper_name', desc: 'enemy_GlitchKeeper_desc', health: 4500, speed: 0.35, reward: 2500, image: IMAGE_PATHS.GlitchKeeper, boss: true, mechanic_key: 'mechanic_boss', blueHoneySlow: true, mapSource: 'sunlight_seaside', shieldRatio: 0.2 },
  'DarkSpirit': { name: 'enemy_DarkSpirit_name', desc: 'enemy_DarkSpirit_desc', health: 6000, speed: 0.4, reward: 3000, image: IMAGE_PATHS.DarkSpirit, boss: true, mechanic_key: 'mechanic_boss', darkAura: true, mapSource: 'sunlight_seaside', shieldRatio: 0.4 },
  'Bushi_Brella': { name: 'enemy_Bushi_Brella_name', desc: 'enemy_Bushi_Brella_desc', health: 400, speed: 1.8, reward: 500, image: IMAGE_PATHS.Bushi_Brella, mimic: true, mapSource: 'sunlight_seaside' },

  'Broksp': { name: 'enemy_Broksp_name', desc: 'enemy_Broksp_desc', health: 90, speed: 1.2, reward: 20, image: IMAGE_PATHS.Broksp, mapSource: 'spooktacular_ruins', enemyClass: 'melee' },
  'Blood_Taker': { name: 'enemy_Blood_Taker_name', desc: 'enemy_Blood_Taker_desc', health: 220, speed: 1.0, reward: 45, image: IMAGE_PATHS.Blood_Taker, mapSource: 'spooktacular_ruins', enemyClass: 'melee' },
  'Pumpitch': { name: 'enemy_Pumpitch_name', desc: 'enemy_Pumpitch_desc', health: 150, speed: 1.0, reward: 35, image: IMAGE_PATHS.Pumpitch, mapSource: 'spooktacular_ruins', enemyClass: 'melee' },
  'RIPslide': { name: 'enemy_RIPslide_name', desc: 'enemy_RIPslide_desc', health: 70, speed: 3.0, reward: 25, image: IMAGE_PATHS.RIPslide, mapSource: 'spooktacular_ruins', enemyClass: 'melee' },
  'Sneekmy': { name: 'enemy_Sneekmy_name', desc: 'enemy_Sneekmy_desc', health: 120, speed: 2.5, reward: 35, image: IMAGE_PATHS.Sneekmy, mapSource: 'spooktacular_ruins', enemyClass: 'melee', ghost: true, ghostMinEvolution: 3 },
  'SkeleBone_Pyce': { name: 'enemy_SkeleBone_Pyce_name', desc: 'enemy_SkeleBone_Pyce_desc', health: 110, speed: 1.4, reward: 30, image: IMAGE_PATHS.SkeleBone_Pyce, projectile: 'bone', shooter: true, mapSource: 'spooktacular_ruins', enemyClass: 'shooter' },
  'Curse_Boneker': { name: 'enemy_Curse_Boneker_name', desc: 'enemy_Curse_Boneker_desc', health: 7000, speed: 0.3, reward: 5000, image: IMAGE_PATHS.Curse_Boneker, boss: true, mapSource: 'spooktacular_ruins', enemyClass: 'boss' },
  'Ghost_Pyce': { name: 'enemy_Ghost_Pyce_name', desc: 'enemy_Ghost_Pyce_desc', health: 260, speed: 2.6, reward: 60, image: IMAGE_PATHS.Ghost_Pyce, mapSource: 'spooktacular_ruins', enemyClass: 'melee', ghost: true, ghostMinEvolution: 3 },
  'ZomPyce': { name: 'enemy_ZomPyce_name', desc: 'enemy_ZomPyce_desc', health: 55, speed: 1.1, reward: 18, image: IMAGE_PATHS.ZomPyce, mapSource: 'spooktacular_ruins', enemyClass: 'melee' },

  // Across the Time enemies. These only enter waves explicitly queued by the event.
  'Clockwork_Titan': { name: 'enemy_Clockwork_Titan_name', desc: 'enemy_Clockwork_Titan_desc', mechanic_key: 'mechanic_clockwork_titan', health: 900, speed: 0.45, reward: 180, image: IMAGE_PATHS.Clockwork_Titan, category: 'other', enemyClass: 'tank', timeAttackOnly: true, stunImmune: true },
  'DIY_Bot': { name: 'enemy_DIY_Bot_name', desc: 'enemy_DIY_Bot_desc', mechanic_key: 'mechanic_diy_bot', health: 180, speed: 1.1, reward: 40, image: IMAGE_PATHS.DIY_Bot, category: 'other', enemyClass: 'medium', timeAttackOnly: true, poisonImmune: true, fireWeakMultiplier: 1.5 },
  'Hatspy': { name: 'enemy_Hatspy_name', desc: 'enemy_Hatspy_desc', mechanic_key: 'mechanic_hatspy', health: 180, speed: 2.4, reward: 45, image: IMAGE_PATHS.Hatspy, category: 'other', enemyClass: 'medium', timeAttackOnly: true, ghost: true, ghostMinEvolution: 3 },
  'Local_Engines': { name: 'enemy_Local_Engines_name', desc: 'enemy_Local_Engines_desc', health: 100, speed: 1.2, reward: 25, image: IMAGE_PATHS.Local_Engines, category: 'other', enemyClass: 'basic', timeAttackOnly: true },
  'Roborb': { name: 'enemy_Roborb_name', desc: 'enemy_Roborb_desc', health: 2000, speed: 0.3, reward: 2500, image: IMAGE_PATHS.Roborb, category: 'other', enemyClass: 'boss', boss: true, timeAttackOnly: true },
  'Untimed_Atoms': { name: 'enemy_Untimed_Atoms_name', desc: 'enemy_Untimed_Atoms_desc', health: 45, speed: 1.6, reward: 15, image: IMAGE_PATHS.Untimed_Atoms, category: 'other', enemyClass: 'basic', timeAttackOnly: true },
  'GODs_Shadow': { name: 'enemy_GODs_Shadow_name', desc: 'enemy_GODs_Shadow_desc', health: 12000, speed: 0.25, reward: 0, image: IMAGE_PATHS.GODs_Shadow, category: 'other', enemyClass: 'boss', boss: true, timeAttackOnly: true, acrossTimeBoss: true, instakill: false, acrossTimeFinal: true }
};

// Tier de balance: controla cuándo aparece un enemigo y cuánto daño causa al llegar a la base.
const ENEMY_BALANCE = {
  gelatin_lake: {
    basic: ['Stupid_Pyce', 'Pyce2'],
    medium: ['Guest_Pyce', 'Symbol_Pyce', 'Noob_Pyce'],
    tank: ['4motions_Pyce', 'Flower_Pyce', 'SO_Pyce']
  },
  urbanistic_road: {
    basic: ['BitY1', 'BitG2', 'BitP3', 'BitB4', 'HoloPyce', 'Rebel_Pyce'],
    medium: ['ByteGB1', 'ByteYP2', 'BytePG3', 'ByteYB4', 'Bomb_Pyce', 'Fireflies', 'Strechy_Pyce'],
    tank: ['Spyware', 'Spyware1', 'Spyware2', 'Spyware3', 'Knight_Pyce', 'Cannon_Pycer']
  },
  sunlight_seaside: {
    basic: ['Piz', 'Baby_Shrum', 'Ren', 'Pysh'],
    medium: ['Axolotl_Pyce', 'Treeper', 'Thunren', 'Shrum', 'Umbrella_Pyce', 'Creamplet'],
    tank: ['Clown_Pysh', 'Shark_Pyce', 'Big_Treeper', 'Renibig', 'Stacked_Treepers', 'Followishers']
  },
  spooktacular_ruins: {
    basic: ['Broksp', 'RIPslide', 'ZomPyce'],
    medium: ['Pumpitch', 'Blood_Taker', 'Sneekmy', 'Ghost_Pyce', 'SkeleBone_Pyce'],
    tank: ['Pumpitch', 'Blood_Taker', 'Ghost_Pyce', 'SkeleBone_Pyce']
  },
  frosty_christmas: {
    basic: ['Festive_Pyce'],
    medium: ['ToyBomb_Pyce', 'SnowCapsule_Pyce', 'Elf_Pyce'],
    tank: ['Giftbox_Pyce']
  }
};

const ENEMY_TIER_DAMAGE = { basic: 1, medium: 2, tank: 3 };

const BADGES = {
  tutorial: { key: 'tutorial', icon: '<img src="Recursos/img/Work-Bombot.png" alt="Work-Bombot">', unlocked: false, reward: { pycoins: 50, duckpass: 1, xp: 25 }, category: 'misiones', colorGroup: 'mission' },
  survivor: { key: 'survivor', icon: '🛡️', unlocked: false, reward: { pycoins: 100, xp: 50 }, category: 'modos' },
  millionaire: { key: 'millionaire', icon: '💰', unlocked: false, reward: { pycoins: 500, xp: 100 }, category: 'economia' },
  evolution: { key: 'evolution', icon: '🧬', unlocked: false, reward: { pycoins: 200, xp: 80 }, category: 'interacciones' },
  bossKiller: { key: 'bossKiller', icon: '👑', unlocked: false, reward: { duckpass: 5, xp: 150 }, category: 'misiones' },
  secret: { key: 'secret', icon: '🔑', unlocked: false, reward: { pycoins: 50, xp: 30 }, category: 'misiones' },
  inf100: { key: 'inf100', icon: '💯', unlocked: false, reward: { duckpass: 10, xp: 200 }, category: 'modos' },
  inf500: { key: 'inf500', icon: '🎖️', unlocked: false, reward: { duckpass: 25, xp: 500 }, category: 'modos' },
  inf999: { key: 'inf999', icon: '🌌', unlocked: false, reward: { duckpass: 50, xp: 1000 }, category: 'modos' },
  corrupt1: { key: 'corrupt1', icon: '👾', unlocked: false, reward: { pycoins: 300, xp: 150 }, category: 'modos' },
  corrupt2: { key: 'corrupt2', icon: '👾', unlocked: false, reward: { pycoins: 400, xp: 200 }, category: 'modos' },
  corrupt3: { key: 'corrupt3', icon: '👾', unlocked: false, reward: { pycoins: 500, xp: 250 }, category: 'modos' },
  corrupt4: { key: 'corrupt4', icon: '👾', unlocked: false, reward: { pycoins: 600, xp: 300 }, category: 'modos' },
  corrupt5: { key: 'corrupt5', icon: '👾', unlocked: false, reward: { duckpass: 20, xp: 500 }, category: 'modos' },
  mimic1: { key: 'mimic1', icon: '🎁', unlocked: false, reward: { pycoins: 150, xp: 50 }, category: 'misiones' },
  mimic2: { key: 'mimic2', icon: '🎁', unlocked: false, reward: { pycoins: 300, xp: 100 }, category: 'misiones' },
  mimic3: { key: 'mimic3', icon: '🎁', unlocked: false, reward: { pycoins: 450, xp: 150 }, category: 'misiones' },
  mimic4: { key: 'mimic4', icon: '🎁', unlocked: false, reward: { duckpass: 15, xp: 300 }, category: 'misiones' },
  corruptMimic: { key: 'corruptMimic', icon: '💀', unlocked: false, reward: { pycoins: 1000, xp: 500 }, category: 'misiones' },
  mimicRevenge: { key: 'mimicRevenge', icon: '🔥', unlocked: false, reward: { pycoins: 500, xp: 200 }, category: 'misiones' },
  antiNormal: { key: 'antiNormal', icon: '🌑', unlocked: false, reward: { duckpass: 100, xp: 2000 }, category: 'modos' },
  winFacil: { key: 'winFacil', icon: '🌱', unlocked: false, reward: { pycoins: 50, xp: 50 }, category: 'modos' },
  winNormal: { key: 'winNormal', icon: '🌲', unlocked: false, reward: { pycoins: 100, xp: 100 }, category: 'modos' },
  una_por_cada: { key: 'una_por_cada', icon: '🎰', unlocked: false, reward: { pycoins: 200, duckpass: 150 }, category: 'interacciones' },
  explosiones_por_doquier: { key: 'explosiones_por_doquier', icon: '💥', unlocked: false, reward: { pycoins: 350, duckpass: 250 }, category: 'interacciones' },
  urba_complet1: { key: 'urba_complet1', icon: '🌆', unlocked: false, reward: { pycoins: 500, duckpass: 300 }, category: 'misiones' },
  winDificil: { key: 'winDificil', icon: '⚔️', unlocked: false, reward: { pycoins: 200, xp: 150 }, category: 'modos' },
  winExtremo: { key: 'winExtremo', icon: '💀', unlocked: false, reward: { pycoins: 500, xp: 500 }, category: 'modos' },
  winCorrupto: { key: 'winCorrupto', icon: '👾', unlocked: false, reward: { pycoins: 1000, xp: 1000 }, category: 'modos' },
  gtackFirst: { key: 'gtackFirst', icon: '🎯', unlocked: false, reward: { pycoins: 100, xp: 50 }, category: 'economia' },
  duckgradeFirst: { key: 'duckgradeFirst', icon: '🦆', unlocked: false, reward: { pycoins: 150, xp: 80 }, category: 'economia' },
  supremeAlliance: { key: 'supremeAlliance', icon: '🤝', unlocked: false, reward: { pycoins: 300, xp: 150 }, category: 'interacciones' },
  deepArtillery: { key: 'deepArtillery', icon: '💣', unlocked: false, reward: { pycoins: 400, xp: 200 }, category: 'interacciones' },
  meleeBlueRed: { key: 'meleeBlueRed', icon: '⚔️', unlocked: false, reward: { pycoins: 400, xp: 200 }, category: 'interacciones' },
  epicEffects: { key: 'epicEffects', icon: '🌈', unlocked: false, reward: { pycoins: 500, xp: 300 }, category: 'interacciones' },
  letsGoGambling: { key: 'letsGoGambling', icon: '🎰', unlocked: false, reward: { pycoins: 777, xp: 777 }, category: 'economia' },
  deepSavings: { key: 'deepSavings', icon: '💎', unlocked: false, reward: { pycoins: 500, xp: 250 }, category: 'economia' },
  maxGlobs: { key: 'maxGlobs', icon: '🌌', unlocked: false, reward: { pycoins: 600, xp: 300 }, category: 'interacciones' },
  angelicFortress: { key: 'angelicFortress', icon: '😇', unlocked: false, reward: { pycoins: 500, xp: 250 }, category: 'modos' },
  titaniumBuilding: { key: 'titaniumBuilding', icon: '🛡️', unlocked: false, reward: { pycoins: 500, xp: 300 }, category: 'modos' },
  encyclopediaMaster: { key: 'encyclopediaMaster', icon: '📖', unlocked: false, reward: { pycoins: 500, duckpass: 500, xp: 2000 }, category: 'misiones' },
  unmenaced: { key: 'unmenaced', icon: '🌠', unlocked: false, reward: { pycoins: 300, duckpass: 100 }, category: 'misiones', colorGroup: 'collab' },
  block_city: { key: 'block_city', icon: '🧱', unlocked: false, reward: { xp: 0 }, category: 'misiones', colorGroup: 'mission' },
  old_blox_city: { key: 'old_blox_city', icon: '🏙️', unlocked: false, reward: { xp: 0 }, category: 'misiones', colorGroup: 'mission' },
  paracristal_dimension: { key: 'paracristal_dimension', icon: '💎', unlocked: false, reward: { xp: 0 }, category: 'misiones', colorGroup: 'mission' },
  future_voyage: { key: 'future_voyage', icon: '<span class="windland-key-icon">🔑</span>', unlocked: false, reward: { xp: 0 }, category: 'misiones', colorGroup: 'key' },
  skinllector: { key: 'skinllector', icon: '👗', unlocked: false, reward: { pycoins: 400, duckpass: 200 }, category: 'misiones' },
  crystalizing_break: { key: 'crystalizing_break', icon: '💎', unlocked: false, reward: { pycoins: 200, xp: 500 }, category: 'interacciones', colorGroup: 'collab' },
  extended_marc: { key: 'extended_marc', icon: '🖼️', unlocked: false, reward: { pycoins: 350, duckpass: 150 }, category: 'misiones', colorGroup: 'collab' },

  fracstral_victory: { key: 'fracstral_victory', icon: '<img src="Recursos/Interestelar Menace (COLLAB UPD)/Skins/Fracstral Set/Cryscarrier Glob (SK-EVO1).png" width="35" height="35" style="border-radius:6px; object-fit:contain;">', unlocked: false, reward: { pycoins: 500, xp: 500 }, category: 'misiones', colorGroup: 'collab' },
  chain_reaction: { key: 'chain_reaction', icon: '💥', unlocked: false, reward: { pycoins: 400, duckpass: 200 }, category: 'interacciones' },
  fenced_kaboom: { key: 'fenced_kaboom', icon: '🚧', unlocked: false, reward: { pycoins: 350, duckpass: 150 }, category: 'interacciones' },
  wall_garden: { key: 'wall_garden', icon: '🧱', unlocked: false, reward: { pycoins: 300, xp: 400 }, category: 'interacciones' },
  urban_king: { key: 'urban_king', icon: '👑', unlocked: false, reward: { pycoins: 600, duckpass: 400 }, category: 'misiones' },
  urban_crystals: { key: 'urban_crystals', icon: '💎', unlocked: false, reward: { pycoins: 700, duckpass: 500 }, category: 'misiones', colorGroup: 'collab' },
  dangerous_set: { key: 'dangerous_set', icon: '⚠️', unlocked: false, reward: { pycoins: 800, xp: 1000 }, category: 'interacciones' },
  globiscal_debt: { key: 'globiscal_debt', icon: '💸', unlocked: false, reward: { pycoins: 1000, xp: 1000 }, category: 'economia' },
  across_time: { key: 'across_time', icon: `<img class="across-time-badge-mark" src="${IMAGE_PATHS.Across_Time_Trophy}" alt="Across the Time">`, unlocked: false, reward: { xp: 0 }, category: 'misiones', colorGroup: 'mission' },

  // Sunlight Seaside difficulty badges
  sunlight_facil: { key: 'sunlight_facil', icon: '🌱', unlocked: false, reward: { pycoins: 150, xp: 100 }, category: 'modos' },
  sunlight_normal: { key: 'sunlight_normal', icon: '🌊', unlocked: false, reward: { pycoins: 300, xp: 200 }, category: 'modos' },
  sunlight_dificil: { key: 'sunlight_dificil', icon: '🔥', unlocked: false, reward: { pycoins: 500, xp: 400 }, category: 'modos' },
  sunlight_extremo: { key: 'sunlight_extremo', icon: '💀', unlocked: false, reward: { pycoins: 800, xp: 700 }, category: 'modos' },
  sunlight_anti_normal: { key: 'sunlight_anti_normal', icon: '🌑', unlocked: false, reward: { duckpass: 50, xp: 1500 }, category: 'modos' }
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
    ],
    decorationTypes: ['tree', 'tree', 'bush', 'tree', 'bush', 'tree', 'bush', 'tree']
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
    ],
    decorationTypes: ['lamp', 'lamp', 'bush', 'lamp', 'bush', 'lamp', 'bush']
  },
  frosty_christmas: {
    name: 'Frosty Christmas',
    riverZones: [],
    pathSegments: [
      { x: 0, y: 145, w: 365, h: 62 },
      { x: 300, y: 45, w: 62, h: 162 },
      { x: 300, y: 45, w: 365, h: 62 },
      { x: 603, y: 45, w: 62, h: 360 },
      { x: 603, y: 343, w: 397, h: 62 },
      { x: 0, y: 425, w: 365, h: 62 },
      { x: 300, y: 343, w: 62, h: 144 },
      { x: 300, y: 343, w: 365, h: 62 }
    ],
    enemyPaths: [
      [
        { x: -30, y: 176 }, { x: 330, y: 176 }, { x: 330, y: 76 },
        { x: 635, y: 76 }, { x: 635, y: 374 }, { x: 1030, y: 374 }
      ],
      [
        { x: -30, y: 456 }, { x: 330, y: 456 }, { x: 330, y: 374 },
        { x: 635, y: 374 }, { x: 1030, y: 374 }
      ]
    ],
    decorationTypes: ['snowtree', 'snowman', 'snowtree', 'snowtree', 'snowman', 'snowtree', 'snowtree']
  },
  sunlight_seaside: {
    name: "Sunlight Seaside",
    // Everything is ocean - only paths and islands are solid ground
    riverZones: [
      { x: 0, y: 0, w: 1000, h: 600 }
    ],
    // Sandy islands where towers can be placed (excluded from collision with paths)
    islandZones: [
      // Each round island is sized to hold exactly one tower spot.
      { x: 40, y: 10, w: 120, h: 120 },
      { x: 320, y: 10, w: 120, h: 120 },
      { x: 840, y: 10, w: 120, h: 120 },
      { x: 40, y: 300, w: 120, h: 120 },
      { x: 40, y: 175, w: 120, h: 120 },
      { x: 320, y: 175, w: 120, h: 120 },
      { x: 320, y: 300, w: 120, h: 120 },
      { x: 590, y: 180, w: 120, h: 120 },
      { x: 590, y: 300, w: 120, h: 120 },
      { x: 840, y: 150, w: 120, h: 120 },
      { x: 40, y: 470, w: 120, h: 120 },
      { x: 320, y: 470, w: 120, h: 120 },
      { x: 590, y: 470, w: 120, h: 120 },
      { x: 840, y: 470, w: 120, h: 120 }
    ],
    pathSegments: [
      // Horizontal top road
      { x: 0,   y: 120, w: 560, h: 55 },
      // Vertical left connector
      { x: 200, y: 120, w: 55, h: 320 },
      // Horizontal bottom road
      { x: 0,   y: 420, w: 560, h: 55 },
      // Vertical mid connector
      { x: 505, y: 120, w: 55, h: 320 },
      // Horizontal top-right
      { x: 505, y: 120, w: 320, h: 55 },
      // Vertical right connector
      { x: 775, y: 120, w: 55, h: 185 },
      // Horizontal center merge
      { x: 775, y: 270, w: 225, h: 55 },
      // Vertical right lower
      { x: 775, y: 305, w: 55, h: 175 },
      // Horizontal bottom-right
      { x: 505, y: 420, w: 330, h: 55 }
    ],
    enemyPaths: [
      // Path 1: top left → mid cross → top right → center merge → right
      [
        { x: -30, y: 148 }, { x: 232, y: 148 }, { x: 232, y: 448 },
        { x: 532, y: 448 }, { x: 532, y: 148 }, { x: 803, y: 148 },
        { x: 803, y: 298 }, { x: 1030, y: 298 }
      ],
      // Path 2: bottom left → mid cross → bottom right → center merge → right
      [
        { x: -30, y: 448 }, { x: 232, y: 448 }, { x: 232, y: 148 },
        { x: 532, y: 148 }, { x: 532, y: 448 }, { x: 803, y: 448 },
        { x: 803, y: 298 }, { x: 1030, y: 298 }
      ]
    ],
    decorations: [
      { x: 260, y: 90, type: 'palm' },
      { x: 745, y: 100, type: 'palm' },
      { x: 745, y: 230, type: 'umbrella' },
      { x: 260, y: 540, type: 'palm' },
      { x: 745, y: 540, type: 'umbrella' }
    ]
  },
  spooktacular_ruins: {
    name: "Aridez Escalofriante",
    nameEn: "Spooktacular Ruins",
    riverZones: [],
    islandZones: [],
    pathSegments: [],
    roadIntersections: [
      { x: 230, y: 95 }, { x: 420, y: 400 }, { x: 610, y: 95 },
      { x: 230, y: 365 }, { x: 420, y: 160 }, { x: 610, y: 365 },
      { x: 330, y: 255 }, { x: 520, y: 255 },
      { x: 820, y: 95 }, { x: 820, y: 365 }
    ],
    enemyPaths: [
      [
        { x: 50, y: 95 }, { x: 230, y: 95 }, { x: 420, y: 400 },
        { x: 610, y: 95 }, { x: 820, y: 95 }, { x: 947, y: 50 }
      ],
      [
        { x: 50, y: 365 }, { x: 230, y: 365 }, { x: 420, y: 160 },
        { x: 610, y: 365 }, { x: 820, y: 365 }, { x: 947, y: 465 }
      ]
    ],
    bossPlaceholders: { miniboss: null, boss: null },
    decorationTypes: ['cactus', 'deadtree', 'cactus', 'deadtree', 'cactus', 'deadtree', 'cactus', 'rock']
  }
};

const MAP_ISLANDS = [
  {
    id: 'globland_isle',
    nameEs: 'Isla de los Globs',
    nameEn: 'Globland Isle',
    zones: [
      { mapId: 'gelatin_lake', nameEs: 'Gelatin Lake', nameEn: 'Gelatin Lake', colors: ['#41b96c', '#28784b'] },
      { mapId: 'urbanistic_road', nameEs: 'Urbanistic Road', nameEn: 'Urbanistic Road', colors: ['#92999c', '#424a51'] },
      { mapId: 'sunlight_seaside', nameEs: 'Sunlight Seaside', nameEn: 'Sunlight Seaside', colors: ['#f0c75e', '#1e98b4'] }
    ]
  },
  {
    id: 'windland_leaf',
    nameEs: 'Bosques Arenonieves',
    nameEn: 'Wildsand Leaf',
    zones: [
      { mapId: 'spooktacular_ruins', nameEs: 'Aridez Escalofriante', nameEn: 'Spooktacular Ruins', colors: ['#d68738', '#684328'] },
      { mapId: 'frosty_christmas', nameEs: 'Frosty Christmas', nameEn: 'Frosty Christmas', colors: ['#9deaff', '#f3fcff'] },
      { nameEs: 'Darkness Forest (RELEASING NEXT YEAR)', nameEn: 'Darkness Forest (RELEASING NEXT YEAR)', colors: ['#47774a', '#59402b'], locked: true }
    ]
  }
];

const SKINS_DATA = {
  'Worker_Glob': [
    {
      id: 'santa_workshop_set', name: 'skin_santa_workshop_name', desc: 'skin_santa_workshop_desc', cost: 0, type: 'free', isSpecial: true, unlockCondition: 'advent_calendar_complete',
      skins: {
        'Worker_Glob': 'Recursos/FROZEN CALENDAR CHRISTMAS (UPD6)/Skins/Advent Calendar/Santa_s Workshop (NARANJA)/Elf-Glob_SKEVO1.png',
        'Police_Glob': 'Recursos/FROZEN CALENDAR CHRISTMAS (UPD6)/Skins/Advent Calendar/Santa_s Workshop (NARANJA)/GiftedElf-Glob_SKEVO2.png',
        'Planked_Glob': 'Recursos/FROZEN CALENDAR CHRISTMAS (UPD6)/Skins/Advent Calendar/Santa_s Workshop (NARANJA)/Sleeping-Santa-Glob_SKEVO3.png',
        'DJ_Glob': 'Recursos/FROZEN CALENDAR CHRISTMAS (UPD6)/Skins/Advent Calendar/Santa_s Workshop (NARANJA)/Sleigh-Santa-Glob_SKEVO4.png'
      },
      traps: {
        'Worker_Trap': IMAGE_PATHS.Santa_Workshop_Trap1,
        'Police_Trap': IMAGE_PATHS.Santa_Workshop_Trap2,
        'Planked_Trap': IMAGE_PATHS.Santa_Workshop_Trap3,
        'DJ_Trap': IMAGE_PATHS.Santa_Workshop_Trap4
      },
      projectiles: {
        'DJ_Glob': IMAGE_PATHS.Santa_Workshop_Gift_Projectile
      }
    }
  ],
  'Glob': [
    {
      id: 'snowglob_set', name: 'skin_snowglob_name', desc: 'skin_snowglob_desc', cost: 0, type: 'free', isSpecial: true, unlockCondition: 'advent_calendar',
      skins: {
        'Glob': 'Recursos/FROZEN CALENDAR CHRISTMAS (UPD6)/Skins/Advent Calendar/SnowGlob Set (VERDE)/SnowGlob-Body_SKEVO1.png',
        'Poop_Glob': 'Recursos/FROZEN CALENDAR CHRISTMAS (UPD6)/Skins/Advent Calendar/SnowGlob Set (VERDE)/Loaded-SnowGlob_SKEVO2.png',
        'Golden_Glob': 'Recursos/FROZEN CALENDAR CHRISTMAS (UPD6)/Skins/Advent Calendar/SnowGlob Set (VERDE)/Snowfall-Glob_SKEVO3.png',
        'Rainbow_Glob': 'Recursos/FROZEN CALENDAR CHRISTMAS (UPD6)/Skins/Advent Calendar/SnowGlob Set (VERDE)/LIGHTEDSnowGlob_SKEVO4.png'
      },
      names: {
        'Glob': 'SnowGlob',
        'Poop_Glob': 'Loaded SnowGlob',
        'Golden_Glob': 'Snowfall Glob',
        'Rainbow_Glob': 'Lighted SnowGlob'
      }
    },
    {
      id: 'rewamped_green_set', name: 'skin_rewamped_green_name', desc: 'skin_rewamped_green_desc', cost: 0, type: 'free', isSpecial: true, unlockCondition: 'win_facil_urban',
      skins: {
        'Glob': 'Recursos/Interestelar Menace (COLLAB UPD)/Skins/Rewamps/Green/Rewmped_Green_SK-EVO1.png',
        'Poop_Glob': 'Recursos/Interestelar Menace (COLLAB UPD)/Skins/Rewamps/Green/Rewmped_Green_SK-EVO2.png',
        'Golden_Glob': 'Recursos/Interestelar Menace (COLLAB UPD)/Skins/Rewamps/Green/Rewmped_Green_SK-EVO3.png',
        'Rainbow_Glob': 'Recursos/Interestelar Menace (COLLAB UPD)/Skins/Rewamps/Green/Rewmped_Green_SK-EVO4.png'
      }
    },
    {
      id: 'green_rgb_sr', name: 'skin_green_rgb_sr_name', desc: 'skin_green_rgb_sr_desc', cost: 0, type: 'free', isSpecial: true, unlockCondition: 'all_profile_images',
      skins: {
        'Glob': 'Recursos/Interestelar Menace (COLLAB UPD)/Skins/Rewamps/Green/Rewmped_Green_SK-EVO1.png',
        'Poop_Glob': 'Recursos/Interestelar Menace (COLLAB UPD)/Skins/Rewamps/Green/Rewmped_Green_SK-EVO2.png',
        'Golden_Glob': 'Recursos/Interestelar Menace (COLLAB UPD)/Skins/Rewamps/Green/Rewmped_Green_SK-EVO3.png',
        'Rainbow_Glob': 'Recursos/Interestelar Menace (COLLAB UPD)/Skins/Rewamps/Green/Rewmped_Green_SK-EVO4.png'
      },
      rgbTypes: ['Glob', 'Poop_Glob', 'Golden_Glob', 'Rainbow_Glob'],
      names: {
        'Glob': 'RGreenB1',
        'Rainbow_Glob': 'RGreenB4'
      }
    },
    {
      id: 'military_set', name: 'skin_military_name', desc: 'skin_military_desc', cost: 350, type: 'pycoin',
      skins: {
        'Glob': 'Recursos/img/Skins/Verde Base/Untrained Glob (SK-EVO1).png',
        'Poop_Glob': 'Recursos/img/Skins/Verde Base/Militar Glob (SK-EVO2).png',
        'Golden_Glob': 'Recursos/img/Skins/Verde Base/Armed Glob (SK-EVO3).png',
        'Rainbow_Glob': 'Recursos/img/Skins/Verde Base/Impostor Glob (SK-EVO4).png'
      }
    },
    {
      id: 'corrupt_swords_set', name: 'skin_corrupt_swords_name', desc: 'skin_corrupt_swords_desc', cost: 637, type: 'pycoin', duckpass_cost: 207, isSpecial: true,
      skins: {
        'Glob': 'Recursos/img/Skins/Verde Base/Block Tales (SP)/Blackrock Glob (SK-EVO1).png',
        'Poop_Glob': 'Recursos/img/Skins/Verde Base/Block Tales (SP)/Brad Glob (SK-EVO2).png',
        'Golden_Glob': 'Recursos/img/Skins/Verde Base/Block Tales (SP)/Emotional Glob (SK-EVO3).png',
        'Rainbow_Glob': 'Recursos/img/Skins/Verde Base/Block Tales (SP)/Ancigon Glob (SK-EVO4).png'
      },
      names: {
        'Glob': 'Blackrock Glob',
        'Poop_Glob': 'Brad Glob',
        'Golden_Glob': 'Emotional Glob',
        'Rainbow_Glob': 'Ancigon Glob'
      }
    },
  ],
  'Red_Glob': [
    {
      id: 'skelebones_set', name: 'skin_skelebones_name', desc: 'skin_skelebones_desc', cost: 0, type: 'free', isSpecial: true, unlockCondition: 'win_spooktacular_anti_normal',
      skins: {
        'Red_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/SkeleBones Set (ROJO)/Calcium Glob (SK-EVO1).png',
        'Molten_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/SkeleBones Set (ROJO)/Toxic Waste Glob (SK-EVO2).png',
        'Robotic_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/SkeleBones Set (ROJO)/SkeleBone Glob (SK-EVO3).png'
      },
      names: {
        'Red_Glob': 'Calcium Glob',
        'Molten_Glob': 'Toxic Waste Glob',
        'Robotic_Glob': 'SkeleBone Glob'
      }
    },
    {
      id: 'rewamped_red_set', name: 'skin_rewamped_red_name', desc: 'skin_rewamped_red_desc', cost: 0, type: 'free', isSpecial: true, unlockCondition: 'win_facil_urban',
      skins: {
        'Red_Glob': 'Recursos/Interestelar Menace (COLLAB UPD)/Skins/Rewamps/Red/Rewmped_Red_SK-EVO1.png',
        'Molten_Glob': 'Recursos/Interestelar Menace (COLLAB UPD)/Skins/Rewamps/Red/Rewmped_Red_SK-EVO2.png',
        'Robotic_Glob': 'Recursos/Interestelar Menace (COLLAB UPD)/Skins/Rewamps/Red/Rewmped_Red_SK-EVO3.png'
      }
    },
    {
      id: 'red_rgb_sr', name: 'skin_red_rgb_sr_name', desc: 'skin_red_rgb_sr_desc', cost: 0, type: 'free', isSpecial: true, unlockCondition: 'all_profile_images',
      skins: {
        'Red_Glob': 'Recursos/Interestelar Menace (COLLAB UPD)/Skins/Rewamps/Red/Rewmped_Red_SK-EVO1.png',
        'Molten_Glob': 'Recursos/Interestelar Menace (COLLAB UPD)/Skins/Rewamps/Red/Rewmped_Red_SK-EVO2.png',
        'Robotic_Glob': 'Recursos/Interestelar Menace (COLLAB UPD)/Skins/Rewamps/Red/Rewmped_Red_SK-EVO3.png'
      },
      rgbTypes: ['Red_Glob', 'Molten_Glob', 'Robotic_Glob'],
      names: {
        'Red_Glob': 'RedGB1',
        'Robotic_Glob': 'RedGB3'
      }
    },
    {
      id: 'music_set', name: 'skin_music_name', desc: 'skin_music_desc', cost: 300, type: 'pycoin',
      skins: {
        'Red_Glob': 'Recursos/img/Skins/Rojo Melee/Music Glob (SK-EVO1).png',
        'Molten_Glob': 'Recursos/img/Skins/Rojo Melee/Funky Glob (SK-EVO2).png',
        'Robotic_Glob': 'Recursos/img/Skins/Rojo Melee/Party Glob (SK-EVO3).png'
      }
    },
    {
      id: 'judicial_set', name: 'skin_judicial_name', desc: 'skin_judicial_desc', category: 'Colaboracion', subtitle: 'Glob Smash', isSpecial: true, isCommunity: true, cost: 400, duckpass_cost: 150, type: 'pycoin', unlockCondition: 'win_extremo',
      skins: {
        'Red_Glob': 'Recursos/img/Skins/Rojo Melee/Comunidad/Glob Smash/Juez Glob (SK-EVO1).png',
        'Molten_Glob': 'Recursos/img/Skins/Rojo Melee/Comunidad/Glob Smash/GatGlob (SK-EVO2).png',
        'Robotic_Glob': 'Recursos/img/Skins/Rojo Melee/Comunidad/Glob Smash/Tigrob (SK-EVO3).png'
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
        'Soap_Glob': 'Recursos/img/Skins/Azul Ralentizador/Beachy Glob (SK-EVO1).png',
        'Cotton_Glob': 'Recursos/img/Skins/Azul Ralentizador/Shark Glob (SK-EVO2).png',
        'ElectroClean_Glob': 'Recursos/img/Skins/Azul Ralentizador/LightSea Glob (SK-EVO3).png'
      }
    },
    {
      id: 'rewamped_blue_set', name: 'skin_rewamped_blue_name', desc: 'skin_rewamped_blue_desc', cost: 0, type: 'free', isSpecial: true, unlockCondition: 'win_facil_urban',
      skins: {
        'Soap_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/BlueRewamp_SKIN/SoapRewamp (SK-EVO1).png',
        'Cotton_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/BlueRewamp_SKIN/CottonRewamp (SK-EVO2).png',
        'ElectroClean_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/BlueRewamp_SKIN/ElectroCleanRewamp (SK-EVO3).png'
      }
    },
    {
      id: 'blue_rgb_sr', name: 'skin_blue_rgb_sr_name', desc: 'skin_blue_rgb_sr_desc', cost: 0, type: 'free', isSpecial: true, unlockCondition: 'all_profile_images',
      skins: {
        'Soap_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/BlueRewamp_SKIN/SoapRewamp (SK-EVO1).png',
        'Cotton_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/BlueRewamp_SKIN/CottonRewamp (SK-EVO2).png',
        'ElectroClean_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/BlueRewamp_SKIN/ElectroCleanRewamp (SK-EVO3).png'
      },
      rgbTypes: ['Soap_Glob', 'Cotton_Glob', 'ElectroClean_Glob'],
      names: {
        'Soap_Glob': 'RGBlue1',
        'ElectroClean_Glob': 'RGBlue3'
      }
    }
  ],
  'Ducky_Glob': [
    {
      id: 'business_duck_set', name: 'skin_business_name', desc: 'skin_business_desc', cost: 150, type: 'pycoin',
      skins: {
        'Ducky_Glob': 'Recursos/img/Skins/Amarillo Farmer/Jelly Post (SK-EVO1).png',
        'Golden_Ducky_Glob': 'Recursos/img/Skins/Amarillo Farmer/Factory Glob (SK-EVO2).png',
        'Rick_Duck_Glob': 'Recursos/img/Skins/Amarillo Farmer/Highlight Glob (SK-EVO3).png'
      }
    },
    {
      id: 'ducky_rewamp_set', name: 'skin_ducky_rewamp_name', desc: 'skin_ducky_rewamp_desc', cost: 0, type: 'free', isSpecial: true, unlockCondition: 'win_gelatin_lake_base',
      skins: {
        'Ducky_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/DuckyRewamp-SKIN/Ducky-Rewamp1.png',
        'Golden_Ducky_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/DuckyRewamp-SKIN/Ducky-Rewamp2.png',
        'Rick_Duck_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/DuckyRewamp-SKIN/Ducky-Rewamp3.png'
      }
    },
    {
      id: 'ducky_rgb_sr', name: 'skin_ducky_rgb_name', desc: 'skin_ducky_rgb_desc', cost: 0, type: 'free', isSpecial: true, unlockCondition: 'all_profile_images',
      skins: {
        'Ducky_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/DuckyRewamp-SKIN/Ducky-Rewamp1.png',
        'Golden_Ducky_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/DuckyRewamp-SKIN/Ducky-Rewamp2.png',
        'Rick_Duck_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/DuckyRewamp-SKIN/Ducky-Rewamp3.png'
      },
      rgbTypes: ['Ducky_Glob', 'Golden_Ducky_Glob', 'Rick_Duck_Glob'],
      names: {
        'Ducky_Glob': 'Ducky RGB 1',
        'Rick_Duck_Glob': 'Ducky RGB 3'
      }
    }
  ],
  'Grey': [
    {
      id: 'turret_set', name: 'skin_turret_name', desc: 'skin_turret_desc', cost: 250, type: 'pycoin',
      skins: {
        'Old_Glob': 'Recursos/img/Skins/Gris Disperso/Turret Glob (SK-EVO1).png',
        'Pyce_Glob': 'Recursos/img/Skins/Gris Disperso/Spaceship Glob (SK-EVO2).png',
        'SpyGlob': 'Recursos/img/Skins/Gris Disperso/Laserbeam Glob (SK-EVO3).png'
      }
    },
    {
      id: 'starjump_set', name: 'skin_starry_name', desc: 'skin_starry_desc', cost: 777, duckpass_cost: 666, type: 'pycoin', isSpecial: true,
      skins: {
        'Old_Glob': 'Recursos/img/Collabs (SJ)/Skin/Starry (SK-EVO1).png',
        'Pyce_Glob': 'Recursos/img/Collabs (SJ)/Skin/Astral_Starry (SK_EVO2).png',
        'SpyGlob': 'Recursos/img/Collabs (SJ)/Skin/Posessed_Starry (SK_EVO3).png'
      },
      names: {
        'Old_Glob': { es: 'Destellito', en: 'Starry' },
        'Pyce_Glob': { es: 'Destellito Angelical', en: 'Heroic Starry' },
        'SpyGlob': { es: 'Destellito Poseído', en: 'Possessed Starry' }
      }
    },
    {
      id: 'astrorb_set', name: 'skin_astrorb_name', desc: 'skin_astrorb_desc', cost: 400, duckpass_cost: 350, type: 'pycoin', isSpecial: true, unlockCondition: 'astrorb_frame',
      skins: {
        'Old_Glob': 'Recursos/Interestelar Menace (COLLAB UPD)/Jefe (Artrorb)/AstrorbOrbe.png',
        'Pyce_Glob': 'Recursos/Interestelar Menace (COLLAB UPD)/Jefe (Artrorb)/AstrorbContenido.png',
        'SpyGlob': 'Recursos/Interestelar Menace (COLLAB UPD)/Jefe (Artrorb)/AstrorbTF.png'
      },
      names: {
        'Old_Glob': { es: 'Astrorb (Orbe)', en: 'Astrorb (Orb)' },
        'Pyce_Glob': { es: 'Astrorb (Contenida)', en: 'Astrorb (Contained)' },
        'SpyGlob': { es: 'Astrorb (True Form)', en: 'Astrorb (True Form)' }
      }
    },
    {
      id: 'virtuallity_set', name: 'skin_virtuallity_name', desc: 'skin_virtuallity_desc', cost: 0, type: 'free', isSpecial: true,
      skins: {
        'Old_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/Virtuallity Set (Gray)/Discord Glob (SK-EVO1).png',
        'Pyce_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/Virtuallity Set (Gray)/Roblox Glob (SK-EVO2).png',
        'SpyGlob': 'Recursos/Spooks in the Desert (UPD4)/Skins/Virtuallity Set (Gray)/Big-Champion Globs (SK-EVO3).png'
      },
      names: {
        'Old_Glob': 'Discord Glob',
        'Pyce_Glob': 'Roblox Glob',
        'SpyGlob': 'Big-Champion Glob'
      }
    }
  ],
  'Comet_Glob': [
    {
      id: 'wicked_set', name: 'skin_wicked_name', desc: 'skin_wicked_desc', cost: 0, type: 'free', isSpecial: true, unlockCondition: 'win_spooktacular_corrupto',
      skins: {
        'Comet_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/Wicked Set (NEGRO)/Witch Glob (SK-EVO1).png',
        'Dark_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/Wicked Set (NEGRO)/CrowWitcher (SK-EVO2).png',
        'Demglob': 'Recursos/Spooks in the Desert (UPD4)/Skins/Wicked Set (NEGRO)/Glitchy Wizard (SK-EVO3).png',
        'Void_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/Wicked Set (NEGRO)/Losed-In Wizard (SK-EVO4).png'
      },
      names: {
        'Comet_Glob': 'Witch Glob',
        'Dark_Glob': 'CrowWitcher',
        'Demglob': 'Glitchy Wizard',
        'Void_Glob': 'Losed-In Wizard'
      }
    },
    {
      id: 'universolar_comet_set', name: 'skin_universolar_name', desc: 'skin_universolar_desc', cost: 450, type: 'pycoin',
      skins: {
        'Comet_Glob': 'Recursos/img/Skins/Negro Supremo/Sunny Glob (SK-EVO1).png',
        'Dark_Glob': 'Recursos/img/Skins/Negro Supremo/Sunlight Glob (SK-EVO2).png',
        'Demglob': 'Recursos/img/Skins/Negro Supremo/Nova Glob (SK-EVO3).png',
        'Void_Glob': 'Recursos/img/Skins/Negro Supremo/Supernova Glob (SK-EVO4).png'
      }
    },
    {
      id: 'mimic_set', name: 'skin_mimic_name', desc: 'skin_mimic_desc', cost: 0, type: 'free', isSpecial: true,
      skins: {
        'Comet_Glob': 'Recursos/img/Skins/Negro Supremo/Mimic Pyce (ENEMY-SKIN)/Mimic Pyce.png',
        'Dark_Glob': 'Recursos/img/Skins/Negro Supremo/Mimic Pyce (ENEMY-SKIN)/Didic Pyce (SK-EVO2).png',
        'Demglob': 'Recursos/img/Skins/Negro Supremo/Mimic Pyce (ENEMY-SKIN)/NOmic Pyce (SK-EVO3).png',
        'Void_Glob': 'Recursos/img/Skins/Negro Supremo/Mimic Pyce (ENEMY-SKIN)/Golden MimicPyce (SK-EVO4).png'
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
        'Comet_Glob': 'Recursos/img/Skins/Negro Supremo/Dreams (SP)/Gummy Glob (SK-EVO1).png',
        'Dark_Glob': 'Recursos/img/Skins/Negro Supremo/Dreams (SP)/Loyal Glob (SK-EVO2).png',
        'Demglob': 'Recursos/img/Skins/Negro Supremo/Dreams (SP)/MetaGlob (SK-EVO3).png',
        'Void_Glob': 'Recursos/img/Skins/Negro Supremo/Dreams (SP)/Hammer Glob (SK-EVO4).png'
      },
      names: {
        'Comet_Glob': 'Gummy Glob',
        'Dark_Glob': 'Loyal Glob',
        'Demglob': 'MetaGlob',
        'Void_Glob': 'Hammer Glob'
      }
    },
    {
      id: 'rewamped_black_set', name: 'skin_rewamped_black_name', desc: 'skin_rewamped_black_desc', cost: 0, type: 'free', isSpecial: true, unlockCondition: 'win_spooktacular_hard_or_extreme',
      skins: {
        'Comet_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/BlackRewamp _SKIN/BlackRewamp1.png',
        'Dark_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/BlackRewamp _SKIN/BlackRewamp2.png',
        'Demglob': 'Recursos/Spooks in the Desert (UPD4)/Skins/BlackRewamp _SKIN/BlackRewamp3.png',
        'Void_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/BlackRewamp _SKIN/BlackRewamp4.png'
      },
      names: {
        'Comet_Glob': 'Black Rewamp 1',
        'Dark_Glob': 'Black Rewamp 2',
        'Demglob': 'Black Rewamp 3',
        'Void_Glob': 'Black Rewamp 4'
      }
    },
    {
      id: 'black_rgb_sr', name: 'skin_black_rgb_sr_name', desc: 'skin_black_rgb_sr_desc', cost: 0, type: 'free', isSpecial: true, unlockCondition: 'all_profile_images',
      skins: {
        'Comet_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/BlackRewamp _SKIN/BlackRewamp1.png',
        'Dark_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/BlackRewamp _SKIN/BlackRewamp2.png',
        'Demglob': 'Recursos/Spooks in the Desert (UPD4)/Skins/BlackRewamp _SKIN/BlackRewamp3.png',
        'Void_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/BlackRewamp _SKIN/BlackRewamp4.png'
      },
      rgbTypes: ['Comet_Glob', 'Dark_Glob', 'Demglob', 'Void_Glob'],
      names: {
        'Comet_Glob': 'Black RGB 1',
        'Void_Glob': 'Black RGB 4'
      }
    }
  ],
  'IEx': [
    {
      id: 'fracstal_set', name: 'skin_fracstal_name', desc: 'skin_fracstal_desc', cost: 0, type: 'free', isSpecial: true, unlockCondition: 'win_interstellar_no_damage',
      skins: {
        'Bomb_Glob': 'Recursos/Interestelar Menace (COLLAB UPD)/Skins/Fracstral Set/Cryscarrier Glob (SK-EVO1).png',
        'TNT_Glob': 'Recursos/Interestelar Menace (COLLAB UPD)/Skins/Fracstral Set/Diamore Glob (SK-EVO2).png',
        'Nuclear_Glob': 'Recursos/Interestelar Menace (COLLAB UPD)/Skins/Fracstral Set/Fracstral Glob (SK-EVO3).png'
      },
      names: {
        'Bomb_Glob': 'Cryscarrier Glob',
        'TNT_Glob': 'Diamore Glob',
        'Nuclear_Glob': 'Fracstral Glob'
      }
    }
  ],
  'Special': [
    {
      id: 'personalizable_bombot', name: 'skin_personalizable_bombot_name', desc: 'skin_personalizable_bombot_desc', cost: 0, type: 'free', isSpecial: true,
      skins: {
        'Work_Bombot': 'Recursos/Spooks in the Desert (UPD4)/Skins/Personalizable Bombot (SKIN + ACCESORIES)/Personalizable Bombot.png'
      }
    },
    {
      id: 'sharkbot_bombot', name: 'skin_sharkbot_name', desc: 'skin_sharkbot_desc', cost: 50, type: 'pycoin',
      skins: {
        'Work_Bombot': 'Recursos/img/Skins/Work-Bombot/SharkBot (SK-EVO).png'
      }
    },
    {
      id: 'globsus_bombot', name: 'skin_globsus_name', desc: 'skin_globsus_desc', cost: 50, type: 'pycoin',
      skins: {
        'Work_Bombot': 'Recursos/img/Skins/Work-Bombot/GlobSus (SK-EVO).png'
      }
    },
    {
      id: 'cuby_bombot', name: 'skin_cuby_name', desc: 'skin_cuby_desc', cost: 0, type: 'free', isSpecial: true, isCommunity: true,
      skins: {
        'Work_Bombot': 'Recursos/Interestelar Menace (COLLAB UPD)/Skins/Work-Bombot/Cuby (BombotA1).png'
      },
      names: {
        'Work_Bombot': 'Cuby'
      }
    },
    {
      id: 'spanish_bombot', name: 'skin_spanish_bombot_name', desc: 'skin_spanish_bombot_desc', cost: 260, duckpass_cost: 450, type: 'pycoin', isSpecial: true, unlockCondition: 'win_normal',
      skins: {
        'Work_Bombot': 'Recursos/Interestelar Menace (COLLAB UPD)/Skins/Work-Bombot/Spanish-Bombot/Spanish-Bombot.png'
      },
      names: {
        'Work_Bombot': 'Spanish-Bombot'
      }
    },
    {
      id: 'crystal_bombot', name: 'skin_crystal_bombot_name', desc: 'skin_crystal_bombot_desc', cost: 0, type: 'free', isSpecial: true, unlockCondition: 'all_boss_frames',
      skins: {
        'Work_Bombot': 'Recursos/Interestelar Menace (COLLAB UPD)/Enemigos Cristalizados/Crystal-Bombot.png'
      }
    }
  ],

  'White': [
    {
      id: 'heights_set', name: 'skin_heights_name', desc: 'skin_heights_desc', cost: 0, type: 'free', isSpecial: true, unlockCondition: 'block_quest',
      skins: {
        'Balloon_Glob': 'Recursos/Misiones (2026)/Skins/Blanca/House & Bombot (SK-EVO1).png',
        'Heliglob': 'Recursos/Misiones (2026)/Skins/Blanca/Castle & Bombot (SK-EVO2).png',
        'Alien_Glob': 'Recursos/Misiones (2026)/Skins/Blanca/Earth & KirByte (SK-EVO3).png'
      }
    }
  ],
  'Pink': [
    {
      id: 'old_tycoon_set', name: 'skin_old_tycoon_name', desc: 'skin_old_tycoon_desc', cost: 637, duckpass_cost: 207, type: 'pycoin', isSpecial: true, unlockCondition: 'block_quest_shop',
      skins: {
        'Streamer_Glob': 'Recursos/Misiones (2026)/Skins/Rosa/Noob Tycoon (SK-EVO1).png',
        'Gamer_Glob': 'Recursos/Misiones (2026)/Skins/Rosa/Guest Retrohouse (SK-S2).png',
        'Youtuber_Glob': 'Recursos/Misiones (2026)/Skins/Rosa/Heights Sword Battle (SK-EVO3).png'
      }
    }
  ],
  'Brown': [
    {
      id: 'jonk_set', name: 'skin_jonk_name', desc: 'skin_jonk_desc', cost: 0, type: 'free', isSpecial: true, unlockCondition: 'block_quest',
      skins: {
        'Sprout_Glob': 'Recursos/Misiones (2026)/Skins/Marron/Jonk the piranha (SK-EVO1).png',
        'Garden_Glob': 'Recursos/Misiones (2026)/Skins/Marron/Jonk the piranha (SK-EVO2).png',
        'Flower_Glob': 'Recursos/Misiones (2026)/Skins/Marron/Jonk the big piranha (SK-EVO3).png'
      }
    },
    {
      id: 'pumpking_set', name: 'skin_pumpking_name', desc: 'skin_pumpking_desc', cost: 0, type: 'free', isSpecial: true, unlockCondition: 'win_spooktacular_base',
      skins: {
        'Sprout_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/Pumpkin Set (MARRON)/PumpGlob (SK-EVO1).png',
        'Garden_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/Pumpkin Set (MARRON)/Overgrown PumpGlob (SK-EVO2).png',
        'Flower_Glob': 'Recursos/Spooks in the Desert (UPD4)/Skins/Pumpkin Set (MARRON)/Mutant PumpGlob (SK-EVO3).png'
      },
      names: {
        'Sprout_Glob': 'PumpGlob',
        'Garden_Glob': 'Overgrown PumpGlob',
        'Flower_Glob': 'Mutant PumpGlob'
      }
    }
  ],

  'Pirate_Glob': [
    {
      id: 'froggy_set', name: 'skin_froggy_name', desc: 'skin_froggy_desc', cost: 1500, type: 'pycoin', isSpecial: true, unlockCondition: 'win_sunlight_summer_anti_normal',
      skins: {
        'Pirate_Glob': 'Recursos/Leafy Beach Party/Skins/Frog Skin (Pirate)/Tadpole Glob (SK-EVO1).png',
        'PMate_Glob': 'Recursos/Leafy Beach Party/Skins/Frog Skin (Pirate)/Froggy Glob (SK-EVO2).png',
        'BreathKing_Glob': 'Recursos/Leafy Beach Party/Skins/Frog Skin (Pirate)/Frogold Glob (SK-EVO3).png',
        'Haunted_Pirate_Glob': 'Recursos/Leafy Beach Party/Skins/Frog Skin (Pirate)/King Frog Glob (SK-EVO4).png',
        'Boat_S1': 'Recursos/Leafy Beach Party/Skins/Frog Skin (Pirate)/Summons/Lillypad (SK-S1).png',
        'Boat_S2': 'Recursos/Leafy Beach Party/Skins/Frog Skin (Pirate)/Summons/Raft Lillypad (SK-S2).png',
        'Boat_S3': 'Recursos/Leafy Beach Party/Skins/Frog Skin (Pirate)/Summons/Flowered Lillypad (SK-S3).png',
        'Boat_S4': 'Recursos/Leafy Beach Party/Skins/Frog Skin (Pirate)/Summons/Lotus Lillypads (SK-S4).png'
      },
      names: {
        'Pirate_Glob': 'Tadpole Glob',
        'PMate_Glob': 'Froggy Glob',
        'BreathKing_Glob': 'Frogold Glob',
        'Haunted_Pirate_Glob': 'King Frog Glob'
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
  "skin_snowglob_name": "Set SnowGlob Verde",
  "skin_snowglob_desc": "La familia Glob vestida para la Navidad, como recompensa del Calendario de Adviento.",
  "skin_santa_workshop_name": "Santa's Workshop",
  "skin_santa_workshop_desc": "Un set navideño para Worker Glob y su familia, con trampas y un proyectil de regalos propios. Se desbloquea al reclamar las 25 recompensas del Calendario de Adviento.",
  "enemy_Festive_Pyce_name": "Festive Pyce",
  "enemy_Festive_Pyce_desc": "Un Pyce de colores alegres que sueña con ser un gran colaborador de regalos.",
  "enemy_ToyBomb_Pyce_name": "ToyBomb Pyce",
  "enemy_ToyBomb_Pyce_desc": "Un prototipo explosivo de Toy Pyce: rápido, inestable y fabricado para otros Pyces.",
  "enemy_SnowCapsule_Pyce_name": "SnowCapsule Pyce",
  "enemy_SnowCapsule_Pyce_desc": "Su presencia congela los alrededores y ralentiza las torres cercanas.",
  "enemy_Elf_Pyce_name": "Elf Pyce",
  "enemy_Elf_Pyce_desc": "Un fiel miembro del Santa Pyce de Techspawn que ha regresado para ayudar a recuperar el ambiente festivo.",
  "enemy_Giftbox_Pyce_name": "Giftbox",
  "enemy_Giftbox_Pyce_desc": "Una caja de regalo de gran resistencia: bajo el envoltorio guarda una estructura de puro metal.",
  "debug_resources_globetines": "Globetines / Globets",
  "debug_resources_pycoins": "PyCoins",
  "debug_resources_duckpass": "DuckPass",
  "debug_resources_xp": "XP",
  "debug_resources_level": "Nivel",
  "debug_add_resources": "+ Recursos",
  "debug_max_resources": "Max recursos",
  "debug_unlock_all": "Desbloquear todo",
  "debug_grant_advent": "Dar recompensas de Adviento",
  "debug_spawn_enemy_title": "Spawnear enemigo",
  "debug_enemy_search": "Busca: PY, BIT, ASTRORB...",
  "debug_spawn_selected": "Spawnear seleccionado",
  "debug_custom_dialogue": "Diálogo personalizado",
  "debug_speaker_search": "Busca personaje o imagen...",
  "debug_mysterybug_name": "Nombre de MysteryBug",
  "debug_mysterybug_icon": "Icono",
  "debug_mysterybug_blacked": "MysteryBug (OCULTO)",
  "debug_mysterybug_original": "MysteryBug (ORIGINAL)",
  "debug_astral_blacked": "Astral Exclamation (OCULTO)",
  "debug_astral_original": "Astral Exclamation (ORIGINAL)",
  "debug_zone_blacked": "ZONE SUBJECT (OCULTO)",
  "debug_zone_original": "ZONE SUBJECT (ORIGINAL)",
  "debug_dialogue_text": "Escribe lo que quieres que diga...",
  "debug_show_dialogue": "Mostrar diálogo",
  "debug_authorized_only": "Solo visible para usuarios de desarrollo autorizados.",
  "debug_panel_open": "Abrir panel debug",
  "debug_empty_dialogue": "Escribe un texto para el diálogo.",
  "debug_enemy_spawned": "DEBUG: {name} spawneado.",
  "debug_unlocked_notice": "🛠️ DEBUG: Torres, skins y enciclopedia desbloqueadas. Pulsa de nuevo para restaurar.",
  "debug_restored_notice": "🔄 DEBUG: Estado restaurado al original.",
  "debug_resources_added_notice": "👑 OWNER DEBUG: recursos añadidos.",
  "debug_resources_maxed_notice": "👑 OWNER DEBUG: recursos al máximo.",
  "debug_everything_unlocked_notice": "👑 OWNER DEBUG: todo desbloqueado.",
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
  "skin_pyce_morph_name": "All-Stars Randomizer",
  "skin_pyce_morph_desc": "¡Sorpresa! Cada nivel de tu torre adopta la apariencia de un enemigo al azar... ¡incluidos los más temibles!",
  "skin_dreams_name": "Set de Ensueño",
  "skin_dreams_desc": "¿Son estos tus heroes? Yo diria que si, son un buen equipo de ensueño.<br><span style='font-size:0.8em; color:#aaa;'>Los personajes pertenecen a HAL Laboratory y a Nintendo, yo solo tengo el derecho de Globs y Pyces.</span><br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Creado por: KirByte</span>",
  "skin_judicial_name": "Set Judicial",
  "skin_judicial_desc": "¡Que haya orden! Los Pyces no se mantendran andando mientras los Jueces y sus gatos anden sueltos!<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Creado por: KirByte</span>",
  "skin_rewamped_green_name": "Set Verde Remasterizado",
  "skin_rewamped_green_desc": "Una versión mejorada visualmente de la familia verde original.",
  "skin_rewamped_red_name": "Set Rojo Remasterizado",
  "skin_rewamped_red_desc": "Una versión mejorada visualmente de la familia roja original.",
  "skin_spanish_bombot_name": "Spanish Bombot",
  "skin_spanish_bombot_desc": "Las dos estrellas le pertenecen a España, y Bombot lo sabía! Se preparó tarde, pero pudo hacérselo.",
  "skin_astrorb_name": "Astrorb (Jefe)",
  "skin_astrorb_desc": "Las misteriosas formas del poderoso Astrorb.",
  "skin_crystal_bombot_name": "Crystal-Bombot",
  "skin_crystal_bombot_desc": "La variante de cristal del Bombot.",
  "skin_fracstal_name": "Set Fracstral",
  "skin_fracstal_desc": "Unos Globs que se cristalizaron, pero esto no los detiene de poder estallar mas fuerte gracias a su amplificacion de poder.<br><span style='color: #ff8c00; font-weight: bold; text-shadow: 0 0 5px rgba(255,140,0,0.5);'>Creado por: Credible</span>",
  "skin_old_tycoon_name": "Old Tycoon Set",
  "skin_old_tycoon_desc": "20 Años de Roblox y celebrándolo a lo grande con un esfuerzo de vuestro robot abeja favorito. ¡Que cumplas muchos más, ROBLOX!",
  "skin_heights_name": "Set de Altura",
  "skin_heights_desc": "Quién iba a decir que Bombot intentaría volar con un triste globo... ¿¡PERO QUIÉN ES EL ÚLTIMO!?",
  "skin_jonk_name": "Jonk the big piranha",
  "skin_jonk_desc": "Una gran carnívora sustituye nuestro Glob jardinero. No se preocupen, esta piraña es nuestra amiga tal y como lo fue en sus tiempos.",
  "skin_pumpking_name": "Set Pumpkin",
  "skin_pumpking_desc": "Una calabaza monstruosa toma el lugar de la familia Marrón. Desbloquéala al ganar en Fácil, Normal, Difícil o Extremo en Aridez Escalofriante.",
  "skin_skelebones_name": "SkeleBones Set",
  "skin_skelebones_desc": "Desbloquea las tres apariencias al vencer Aridez Escalofriante en Anti-Normal.",
  "skin_wicked_name": "Wicked Set",
  "skin_wicked_desc": "Desbloquea este set al vencer Aridez Escalofriante en modo Corrupto.",
  "skin_rewamped_black_name": "Rewamp Negro",
  "skin_rewamped_black_desc": "Desbloquea este set al vencer Aridez Escalofriante en modo Difícil o Extremo.",
  "skin_black_rgb_sr_name": "Rewamp Negro RGB",
  "skin_black_rgb_sr_desc": "El Rewamp negro con un efecto RGB animado. Se desbloquea al reunir todas las imágenes de perfil.",
  "skin_froggy_name": "Froggy Set",
  "skin_froggy_desc": "Unas ranas que pescan y crecen... ¡Pero sus nenufares si dañan!<br><span style='font-size:0.8em; color: teal;'>Skin ideada y dibujada por \"Victorillo\", el dibujo actual esta creado por KirByte_Bi.</span>",
  "skin_rewamped_blue_name": "Set Azul Remasterizado",
  "skin_rewamped_blue_desc": "Una versión mejorada visualmente de la familia azul original.",
  "skin_green_rgb_sr_name": "RGB Verde Secreto",
  "skin_green_rgb_sr_desc": "La primera y última evolución del Rewamp verde con un efecto RGB animado. Se desbloquea al reunir todas las imágenes de perfil. Nombre honorífico: RGreenB.",
  "skin_red_rgb_sr_name": "RGB Rojo Secreto",
  "skin_red_rgb_sr_desc": "La primera y última evolución del Rewamp rojo con un efecto RGB animado. Se desbloquea al reunir todas las imágenes de perfil. Nombre honorífico: RedGB.",
  "skin_blue_rgb_sr_name": "RGB Azul Secreto",
  "skin_blue_rgb_sr_desc": "La primera y última evolución del Rewamp azul con un efecto RGB animado. Se desbloquea al reunir todas las imágenes de perfil. Nombre honorífico: RGBlue.",
  "encyclopedia_rgb_lore_green": "Durante la beta de Glob para I.D., el verde y el rojo eran los Globs principales y más originales. El rojo fue el segundo creado y el recolor oficial del verde. La beta también tuvo los recolores azul y lila oscuro.",
  "encyclopedia_rgb_lore_red": "El rojo fue el segundo Glob creado y el recolor oficial del verde. Ambos eran los Globs principales y más originales. En la beta para I.D. también existieron los recolores azul y lila oscuro.",
  "encyclopedia_rgb_lore_blue": "El Glob azul fue uno de los cuatro colores del Glob original en su beta para I.D., junto al verde, rojo y lila oscuro.",
  "encyclopedia_rgb_lore_ducky": "Ducky Glob empezó como un recolor. Le añadieron un sombrero de copa y una cara naranja porque parecía un pato; de ahí su nombre. También hace referencia al Epic Duck de Roblox.",
  "encyclopedia_rgb_lore_black": "El lila oscuro fue uno de los cuatro recolores del Glob original durante la beta para I.D., junto al verde, rojo y azul."
});

TRANSLATIONS['en'] = Object.assign({}, TRANSLATIONS['en'] || {}, {
  "skin_snowglob_name": "Green SnowGlob Set",
  "skin_snowglob_desc": "The Glob family dressed for Christmas, earned through the Advent Calendar.",
  "skin_santa_workshop_name": "Santa's Workshop",
  "skin_santa_workshop_desc": "A Christmas set for Worker Glob and its family, with custom traps and a gift projectile. Unlock it by claiming all 25 Advent Calendar rewards.",
  "enemy_Festive_Pyce_name": "Festive Pyce",
  "enemy_Festive_Pyce_desc": "A cheerfully colored Pyce who dreams of becoming a great gift-making helper.",
  "enemy_ToyBomb_Pyce_name": "ToyBomb Pyce",
  "enemy_ToyBomb_Pyce_desc": "An explosive Toy Pyce prototype: fast, unstable, and made to help other Pyces.",
  "enemy_SnowCapsule_Pyce_name": "SnowCapsule Pyce",
  "enemy_SnowCapsule_Pyce_desc": "Its presence freezes the surroundings and slows nearby towers.",
  "enemy_Elf_Pyce_name": "Elf Pyce",
  "enemy_Elf_Pyce_desc": "A faithful member of Techspawn's Santa Pyce who has returned to help restore the festive atmosphere.",
  "enemy_Giftbox_Pyce_name": "Giftbox",
  "enemy_Giftbox_Pyce_desc": "A remarkably sturdy gift box; beneath the wrapping is a solid metal frame.",
  "debug_resources_globetines": "Globetines / Globets",
  "debug_resources_pycoins": "PyCoins",
  "debug_resources_duckpass": "DuckPass",
  "debug_resources_xp": "XP",
  "debug_resources_level": "Level",
  "debug_add_resources": "+ Resources",
  "debug_max_resources": "Max resources",
  "debug_unlock_all": "Unlock everything",
  "debug_grant_advent": "Grant Advent rewards",
  "debug_spawn_enemy_title": "Spawn enemy",
  "debug_enemy_search": "Search: PY, BIT, ASTRORB...",
  "debug_spawn_selected": "Spawn selected",
  "debug_custom_dialogue": "Custom dialogue",
  "debug_speaker_search": "Search character or image...",
  "debug_mysterybug_name": "MysteryBug name",
  "debug_mysterybug_icon": "Icon",
  "debug_mysterybug_blacked": "MysteryBug (BLACKED OUT)",
  "debug_mysterybug_original": "MysteryBug (ORIGINAL)",
  "debug_astral_blacked": "Astral Exclamation (BLACKED OUT)",
  "debug_astral_original": "Astral Exclamation (ORIGINAL)",
  "debug_zone_blacked": "ZONE SUBJECT (BLACKED OUT)",
  "debug_zone_original": "ZONE SUBJECT (ORIGINAL)",
  "debug_dialogue_text": "Write what you want them to say...",
  "debug_show_dialogue": "Show dialogue",
  "debug_authorized_only": "Only visible to authorized development users.",
  "debug_panel_open": "Open debug panel",
  "debug_empty_dialogue": "Enter dialogue text.",
  "debug_enemy_spawned": "DEBUG: {name} spawned.",
  "debug_unlocked_notice": "🛠️ DEBUG: Towers, skins, and encyclopedia unlocked. Click again to restore.",
  "debug_restored_notice": "🔄 DEBUG: State restored to its original values.",
  "debug_resources_added_notice": "👑 OWNER DEBUG: resources added.",
  "debug_resources_maxed_notice": "👑 OWNER DEBUG: resources maxed out.",
  "debug_everything_unlocked_notice": "👑 OWNER DEBUG: everything unlocked.",
  "skin_sharkbot_name": "SharkBot",
  "skin_sharkbot_desc": "A steel robotic shark with propulsion. <br><span style='color: #ff3333; font-weight: bold; text-shadow: 0 0 5px rgba(255,51,51,0.5);'>Credit: Nitrogen</span>",
  "skin_globsus_name": "GlobSus",
  "skin_globsus_desc": "A very suspicious Bombot. Created by KirByte_Bi. <br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Created by: KirByte_Bi</span>",
  "tower_Void_Glob_name": "Void Glob",
  "tower_Void_Glob_desc": "The abyss itself. The projectiles of this dark Glob curve in the air chasing the enemy. It has lost all effects, but death is certain.",
  "skin_pyce_morph_name": "All-Stars Randomizer",
  "skin_pyce_morph_desc": "Surprise! Each level of your tower takes the appearance of a random enemy... including the most fearsome ones!",
  "skin_dreams_name": "Dreams Set",
  "skin_dreams_desc": "Are these your heroes? I'd say yes, they are a good dream team.<br><span style='font-size:0.8em; color:#aaa;'>The characters belong to HAL Laboratory and Nintendo, I only have the rights to Globs and Pyces.</span><br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Created by: KirByte</span>",
  "skin_judicial_name": "Judicial Set",
  "skin_judicial_desc": "Let there be order! The Pyces won't keep walking while the Judges and their cats are on the loose!<br><span style='color: #ff69b4; font-weight: bold; text-shadow: 0 0 5px rgba(255,105,180,0.5);'>Created by: KirByte</span>",
  "skin_rewamped_green_name": "Remastered Green Set",
  "skin_rewamped_green_desc": "A visually improved version of the original green family.",
  "skin_rewamped_red_name": "Remastered Red Set",
  "skin_rewamped_red_desc": "A visually improved version of the original red family.",
  "skin_spanish_bombot_name": "Spanish Bombot",
  "skin_spanish_bombot_desc": "The two stars belong to Spain, and Bombot knew it! He prepared late, but he managed to pull it off.",
  "skin_astrorb_name": "Astrorb (Boss)",
  "skin_astrorb_desc": "The mysterious forms of the powerful Astrorb.",
  "skin_crystal_bombot_name": "Crystal-Bombot",
  "skin_crystal_bombot_desc": "The crystal variant of the Bombot.",
  "skin_fracstal_name": "Fracstal Set",
  "skin_fracstal_desc": "Some Globs that crystallized, but this does not stop them from being able to explode stronger thanks to their power amplification.<br><span style='color: #ff8c00; font-weight: bold; text-shadow: 0 0 5px rgba(255,140,0,0.5);'>Created by: Credible</span>",
  "skin_old_tycoon_name": "Old Tycoon Set",
  "skin_old_tycoon_desc": "20 years of Roblox, celebrated in style with an effort from your favorite bee robot. Happy many more, ROBLOX!",
  "skin_heights_name": "Height Set",
  "skin_heights_desc": "Who would have thought Bombot would try to fly with a sad balloon... WHO IS LAST!?",
  "skin_jonk_name": "Jonk the big piranha",
  "skin_jonk_desc": "A great carnivore replaces our Garden Glob. Don't worry, this piranha is our friend, just as it was in its time.",
  "skin_pumpking_name": "Pumpkin Set",
  "skin_pumpking_desc": "A monstrous pumpkin takes over the Brown family. Unlock it by winning Easy, Normal, Hard, or Extreme on Spooktacular Ruins.",
  "skin_skelebones_name": "SkeleBones Set",
  "skin_skelebones_desc": "Unlock all three appearances by beating Spooktacular Ruins in Anti-Normal.",
  "skin_wicked_name": "Wicked Set",
  "skin_wicked_desc": "Unlock this set by beating Spooktacular Ruins in Corrupt mode.",
  "skin_rewamped_black_name": "Black Rewamp",
  "skin_rewamped_black_desc": "Unlock this set by beating Spooktacular Ruins in Hard or Extreme mode.",
  "skin_black_rgb_sr_name": "Black RGB Rewamp",
  "skin_black_rgb_sr_desc": "The Black Rewamp with an animated RGB effect. Unlock it by collecting every profile image.",
  "skin_froggy_name": "Froggy Set",
  "skin_froggy_desc": "Frogs that fish and grow... But their lily pads do deal damage!<br><span style='font-size:0.8em; color: teal;'>Skin designed and drawn by \"Victorillo\", current artwork by KirByte_Bi.</span>",
  "skin_rewamped_blue_name": "Remastered Blue Set",
  "skin_rewamped_blue_desc": "A visually improved version of the original blue family.",
  "skin_green_rgb_sr_name": "Green RGB Secret Rewamp",
  "skin_green_rgb_sr_desc": "The first and final levels of the green Rewamp with an animated RGB effect. Unlock by collecting every profile image. Honorific name: RGreenB.",
  "skin_red_rgb_sr_name": "Red RGB Secret Rewamp",
  "skin_red_rgb_sr_desc": "The first and final levels of the red Rewamp with an animated RGB effect. Unlock by collecting every profile image. Honorific name: RedGB.",
  "skin_blue_rgb_sr_name": "Blue RGB Secret Rewamp",
  "skin_blue_rgb_sr_desc": "The first and final levels of the blue Rewamp with an animated RGB effect. Unlock by collecting every profile image. Honorific name: RGBlue.",
  "encyclopedia_rgb_lore_green": "During Glob's beta for I.D., Green and Red were the main and most original Globs. Red was created second as Green's official recolor. The beta also had the blue and dark purple recolors.",
  "encyclopedia_rgb_lore_red": "Red was the second Glob created and Green's official recolor. Both were the main and most original Globs. The I.D. beta also had the blue and dark purple recolors.",
  "encyclopedia_rgb_lore_blue": "The blue Glob was one of the original Glob's four colors in its I.D. beta, alongside green, red, and dark purple.",
  "encyclopedia_rgb_lore_ducky": "Ducky Glob began as a recolor. A top hat and orange face were added because it looked like a duck, which inspired its name. It also references Roblox's Epic Duck.",
  "encyclopedia_rgb_lore_black": "Dark purple was one of the original Glob's four color variants during its I.D. beta, alongside green, red, and blue."
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
  },
  "astrorb_set": {
    attacks: {
      1: { type: 'projectile', image: 'Recursos/img/Proyectiles/Crystal Metor.png' },
      2: { type: 'projectile', image: 'Recursos/img/Proyectiles/Crystal Metor.png' },
      3: { type: 'projectile', image: 'Recursos/img/Proyectiles/Crystal Metor.png' }
    }
  },
  "crystal_bombot": {
    attacks: {
      1: { type: 'projectile', image: 'Recursos/img/Proyectiles/Crystal Metor.png' }
    }
  },
  "wicked_set": {
    attacks: {
      1: { type: 'projectile', image: 'Recursos/Spooks in the Desert (UPD4)/Skins/Wicked Set (NEGRO)/Proyectiles-Exclusivos/Magic Shoot (1-2).png' },
      2: { type: 'projectile', image: 'Recursos/Spooks in the Desert (UPD4)/Skins/Wicked Set (NEGRO)/Proyectiles-Exclusivos/Magic Shoot (1-2).png' },
      3: { type: 'projectile', image: 'Recursos/Spooks in the Desert (UPD4)/Skins/Wicked Set (NEGRO)/Proyectiles-Exclusivos/Sparkle Shoot (3-4).png' },
      4: { type: 'projectile', image: 'Recursos/Spooks in the Desert (UPD4)/Skins/Wicked Set (NEGRO)/Proyectiles-Exclusivos/Sparkle Shoot (3-4).png' }
    }
  }
});
/* --- END INSERTAR --- */
