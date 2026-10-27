# Backlog — Pendientes

Tareas por hacer. Leyenda: `[ ]` por hacer · `[!]` bloqueada · P0/P1/P2 prioridad.

## Evento "Across the Time: GlD" (fuente: ATT-BIGUPD.txt)

- [ ] `ATT-01` (P0) Balance y escalado de enemigos del evento: ajustar
  distribución y escalado por oleada tras una prueba de juego completa.
- [ ] `ATT-02` (P1) Afinar la posición de los marcadores `L + X + T + _` del
  puzle de Urbanistic Road y comparar con la imagen de referencia.
- [ ] `ATT-03` (P1) Validar visualmente la inversión de rutas de Urbanistic Road
  (enemigos salen del casino, se defiende el túnel; bases y túnel coherentes).
- [ ] `ATT-04` (P0) Partida de principio a fin: probar orden de loadout
  (Verde, Naranja, Azul, Blanco, Rojo), dificultad Extremo, mapas y emblemas.
- [ ] `ATT-05` (P1) Probar bloqueo del evento cuando hay otros jugadores en la seed.
- [ ] `ATT-06` (P1) Probar el código temporal `14/05/26-TIMETRAVEL`: falla sin
  espacio II completado; pide confirmación cuando está habilitado.
  _Auditado por código (2026-10-27): existe `code === '14/05/26-TIMETRAVEL'` con
  guardia `canPlayAcrossTimeSolo()` en `game.js`. Falta prueba en juego._
- [ ] `ATT-07` (P1) Probar derrota/reinicio por espacio y checkpoints
  (I reinicia I; IV reinicia desde oleada 46; conserva espacios previos).
- [ ] `ATT-08` (P1) Validar TIME ATTACK: GL inicia I, UR inicia II, AE inicia
  III–IV; SS forma parte del viaje del espacio III.
- [ ] `ATT-09` (P1) Validar recompensas: Virtuallity Set, bordes de perfil
  (azul #2600FF/cian #00FFFF y reloj antiguo), emblema verde alterno (#00FF00/#0000FF).
  _Auditado por código (2026-10-27): `virtuallity_set` se concede al completar;
  `PROFILE_TIME_ATTACK_BORDERS` define time-attack-a (#2600FF/#00FFFF) y
  time-attack-b (reloj). Falta prueba en juego y verificar el emblema verde alterno._
- [ ] `ATT-10` (P2) Confirmar textos ES/EN de todos los enemigos de TIME ATTACK y
  diálogos de GODs Shadow en `Vista/traducciones.js`.
- [ ] `ATT-11` (P1) Verificar jefe final: vida ≥ doble de jefe de Corrupto, ataque
  cada 20 s, tres retornos a base y destrucción al tercer contacto.
  _Auditado por código (2026-10-27): los tres retornos (`acrossTimeBossReturns >= 3`
  destruye la base) y el ataque a torres cada 20 s están implementados en `game.js`.
  Falta prueba en juego y confirmar la fórmula de vida ≥ 2× jefe de Corrupto._

## Proyecto general

- [ ] `GEN-01` (P2) Documentar el flujo de arranque de `index.html` →
  `game.js` (orden de carga de scripts y módulos).
- [ ] `GEN-02` (P2) Revisar y confirmar que `Modelo/supabase-config.js` no
  contenga secretos commiteados (solo clave publicable y URL).

## Mecánicas / skins

- [ ] `MEC-03` (P2) Al crear nuevas familias/skins Rewamp con efecto RGB, marcar
  su entrada en `SKINS_DATA` (`Modelo/datos-del-juego.js` / `Modelo/config.js`)
  con `rgbRewamp: true` y definir `rgbTypes`. Con eso el efecto RGB se aplica
  solo (torre y avatar de perfil) sin editar listas en `game.js`.
  Convención establecida por `MEC-01`. Las 8 skins RGB actuales (Verde, Rojo,
  Azul, Negro, Ducky, Gray, Worker e IEx/Bomb) ya están marcadas (2026-10-27).
- [ ] `MEC-04` (P2) Hacer lo mismo que `MEC-03` pero para los efectos del Pase de
  Invierno: Rainbow Fuel, Monochrome, Negative y Snowy. Al crear nuevas
  familias/skins que deban usar estos efectos, dejar que se apliquen mediante
  marcadores/condiciones en los datos (`SKINS_DATA`) en lugar de listas fijas en
  `game.js`. Generalizar la detección actual: Rainbow Fuel depende hoy de
  `gameState.rainbowFuelUnlocked` por familia (clase CSS `rainbow-fuel` /
  `.rainbow-fuel-avatar`); Monochrome, Negative y Snowy son variantes de perfil
  mutuamente excluyentes con el RGB (clases CSS `monochrome` / `negative` /
  `snowy`, gestionadas por `getActiveProfileEffectVariant` y
  `setProfileRgbEffect`, con desbloqueo vía `gameState.unlockedRecolors`).
  Objetivo: que un nuevo Glob/skin herede el efecto sin editar listas, igual que
  con `rgbRewamp: true`.
