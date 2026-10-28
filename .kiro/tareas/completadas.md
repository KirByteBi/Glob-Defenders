# Completadas

Registro de tareas terminadas y validadas. Leyenda: `[x]` completada.

## Ya integrado en el evento (según ATT-BIGUPD.txt, sección 7)

Estas piezas figuran como integradas en la spec; quedan pendientes de la
validación de juego recogida en `pendientes.md`.

- [x] Acceso para un jugador (online u offline) con validación de
  emblemas, loadout, mapa y dificultad.
- [x] Cuatro espacios narrativos conectados (I–IV).
- [x] Código temporal con confirmación antes de viajar al pasado.
- [x] Oleadas de evento, cristales por oleada, puzle y transición entre mapas.
- [x] Límite de vida de base (300) y límite de torres durante los espacios III–IV.
- [x] Guardado de progreso y checkpoint de ronda; restauración solo sin otros
  jugadores en la seed.
- [x] GODs Shadow ataca torres cada 20 s y regresa a su base dos veces antes de
  destruirla al tercer contacto.

## Cambios de código (2026-10-27)

- [x] `MEC-01` Efecto RGB generalizado a todos los Globs Rewamp. Se añadieron los
  helpers `isRgbRewampSkin` / `isRgbRewampSkinId` en `Controlador/game.js` y se
  sustituyó la dependencia de la lista fija `RGB_REWAMP_SKIN_IDS` en el render de
  torre (`.rgb-rewamp`), en el avatar de perfil (`getProfileRgbRewampSkin`) y en
  el filtro de catálogo (`skinMatchesEvent`). Ahora cualquier skin con
  `rgbTypes` + `rgbRewamp: true` recibe el efecto automáticamente. La lista
  histórica se conserva por retrocompatibilidad. (Ver `MEC-03` en pendientes para
  la convención al añadir futuras skins.)
- [x] `MEC-02` El daño a la base pasa a ser la vida restante del enemigo
  (`health + shield`) en `damageBaseFromEnemy` (`Controlador/game.js`), en vez de
  un valor fijo por tier. Ejemplo: Pyce con 50 de vida → la base pierde 50.
- [x] `MEC-02b` (cristalizados) Se reutiliza el antiguo "golpe reforzado" sin el
  x5 abusivo: los cristalizados (`isCrystallized`) aplican ×1.5 sobre su vida
  restante. Para que un solo enemigo filtrado no borre la base de golpe, el daño
  por impacto se limita al 50 % de la vida máxima de la base (75 % para
  cristalizados). Nota: el x5 plano que se recordaba no existía ya en el código;
  esto recupera el espíritu de forma balanceada. `node --check` pasa sin errores.

- [x] `VIS-01` Amor Binario / Binary Love usa borde verde y fondo rosa pastel.
  GODs Shadow se refuerza visualmente como la silueta negra de Kirb (GOD),
  reutilizando su mismo asset. El Pase de Invierno usa una paleta azul helada
  en modal, nodos, botones y barra de XP (sin dorado/rosa heredado).
  Validación estática: `node --check` y `git diff --check` correctos.

## Cambios de código (2026-10-27, tanda 2)

- [x] `FX-02` Selector de efecto para la skin Rewamp de cada familia (tienda →
  Skins → "✨ Efecto de la skin Rewamp"; Worker/IEx usan su aspecto base).
  Opciones: Original, RGB Secreto, Rainbow Fuel, Negativo, Monochrome, Nevado y
  Alternativo, cada una solo con la skin original y el efecto desbloqueados.
  Las 40 skins de efecto existentes no cambian. Se guarda en `towerSkinEffects`.
  El perfil ya tenía su selector ("Efecto de la imagen").
- [x] `FX-03` Alternate se llama "Alternativo" en ES y destaca más allá del
  recoloreado: brillo holográfico que cruza la silueta, destellos y halo
  prismático. En el Pase de Invierno es el nivel 12 (antes el 50, que ahora
  da 300 DuckPasses), con vista previa real y nodo "Efecto especial" con
  borde prismático.
- [x] `MEC-05` Las vallas de la familia naranja (Worker) se eliminan al
  reintentar (`retryGame`) y al cambiar de mapa (`createMap`).
- [x] `MEC-06` Ataques personalizados del Personalizable Bombot
  (`BOMBOT_CUSTOM_ATTACKS` en config.js): Bomba clásica, Bomba Cúbica (200
  PyCoins), Meteoro de Cristal (superar IM) y Bomb Glob (usar la familia Bomb
  Glob más de 200 veces; explota con daño en área). Contador `iexFamilyUses`.
- [x] `MEC-07` Ctrl + G activa todas las G-Tacks listas a la vez (las de
  familia/mapa entero solo una vez).
- [x] `MEC-08` Cristalizados solo en Interstellar Menace. Excepción: Dreamy
  SPyce y Astral BPyce en Frosty Christmas (`isCrystallizedEnemyAllowed`).
- [x] `DBG-01` Botón debug "Desbloquear todas las recompensas navideñas":
  Calendario de Adviento + Pase de Invierno completos.
- [x] `GEN-03` Vídeo movido a `Recursos/Videos/GlobDefendersLIST1.mov`.
- [x] Emblemas: nombres de Sunlight Seaside (día → noche) y 12 nuevos de
  Aridez Escalofriante y Frosty Christmas. Iconos-imagen de logros arreglados.
  Verificado en Chrome headless (file://), sin errores de consola.

## Efectos (2026-10-28)

- [x] `FX-04` Alternativo pasa a ser una coloración alterna fija (no RGB):
  `hue-rotate(105deg)` en torre, perfil y tienda (Comet Glob rojo, líneas de
  Dark Glob azules, bomba de Nuclear Glob marrón). Nivel 12 del Pase de Invierno.
- [x] `FX-05` El Alternativo anterior (arcoíris por color que gira + brillo
  holográfico + destellos + halo) se conserva como efecto nuevo **Shiny Rise**
  (`shiny-rise`). Se guarda en `unlockedRecolors`; de momento solo se
  consigue con el debug "Desbloquear todo".
- [x] `FX-06` Monochrome con efecto de tele antigua (líneas, banda que baja,
  grano y parpadeo) y Nevado con copos que caen hacia la skin. En canvas, así
  que también funcionan abriendo el juego como archivo local.
- [x] `FX-07` Orden de familias en el selector de efectos y en "✨ Efectos":
  Verde, Rojo, Ducky, Soap, Comet, Old, Worker, Bomb (`FX_FAMILY_ORDER`).
- [x] `FX-08` Miniaturas de accesorios de Bombot con zoom automático sobre la
  zona visible del PNG (`BOMBOT_ACCESSORY_VISIBLE_AREA` en config.js), en el
  personalizador, el Pase de Invierno y el Calendario de Adviento.
  Verificado en Chrome headless (file://), sin errores de consola.
