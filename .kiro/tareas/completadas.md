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
