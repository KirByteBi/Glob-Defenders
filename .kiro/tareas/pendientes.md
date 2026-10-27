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

## Planning — Pase de Invierno / Alternate

- [~] `WIN-ALT-01` (P2) **Alternate**: conservar como variante alternativa del
  Pase de Invierno el efecto RGB histórico de perfil/skins y su presentación
  asociada. La variante debe convivir con RGB, Rainbow Fuel, Monochrome,
  Negative y Snowy sin reemplazar sus desbloqueos actuales.
  **Estado (2026-10-27):** se localizó la implementación original en el commit
  `0a67392`, el padre del primer commit Kiro `3f822a8`, y se restauró su técnica
  exacta de composición —gradiente enmascarado en `::after`, mezcla `color` y
  animación `hue-rotate(360deg)` de 1,5 s— frente a los reworks posteriores.
  El vídeo de referencia confirma que `0a67392` es el aspecto RGB correcto.
  **Causa raíz encontrada (2026-10-27):** no era la caché ni el CSS. En el
  commit Kiro `3f822a8` `styles.css` pasó a `Vista/`, y las variables CSS con
  `url('Recursos/...')` relativas se resuelven respecto a la hoja que las usa:
  el navegador buscaba `Vista/Recursos/...` (404), la máscara quedaba vacía y
  el arcoíris no se pintaba. Afectaba al RGB de perfil, torres, previews de
  tienda, Rainbow Fuel y la silueta de GODs Shadow en partida.
  **Arreglo 1:** helper `getAbsoluteAssetUrl` en `game.js`; todas las máscaras
  se pasan como URL absoluta.
  **Causa 2 (abrir como archivo local):** `mask-image` se carga en modo CORS y
  Chrome lo bloquea con `file://`, así que en local el RGB seguía sin verse.
  **Arreglo 2:** el RGB pre-Kiro se dibuja ahora en un `<canvas>` recortado
  con la silueta del PNG (`createRgbOverlayCanvas`, `syncRgbOverlay`,
  `hydrateRgbOverlays`); la máscara CSS queda solo de respaldo.
  **Arreglo 3:** la silueta de GODs Shadow en partida ya no usa `mask-image`:
  pinta su propia imagen con `filter: brightness(0)` en el pseudo-elemento
  (la barra de vida no se ennegrece). Las previews RGB de la tienda usan el
  canvas, ajustado al padding de 8px de `.skin-preview`.
  **Verificado** en Chrome headless *sin* permisos de archivo (como lo abre el
  usuario): avatares RGB del perfil, previews RGB de la tienda, torre RGB,
  torre Rainbow Fuel y silueta de GODs Shadow, todo correcto.
  **Arreglo 4 (look y animación):** el RGB normal vuelve a ser el de antes del
  rework `9868c72`: arcoíris claro (`saturate(0.8) brightness(1.3)`) que barre
  la silueta de izquierda a derecha cada 2,6 s, con la imagen blanqueada en
  `multiply` para conservar contornos negros y ojos. Rainbow Fuel queda como
  arcoíris vivo sin contornos (2,5 s). Ambos se dibujan y animan en el canvas.
  **Causa 3 (animaciones congeladas):** el commit Kiro `3f822a8` añadió una
  regla global `prefers-reduced-motion` que paraba todas las animaciones (RGB,
  Glob giratorio de carga, GLB Fever...) en equipos con las animaciones de
  Windows desactivadas (este equipo: MinAnimate = 0). Eliminada; se conserva
  solo la regla pre-Kiro que frena Hipermutado y glitches.
  **Arreglo 5 (colores):** el blanqueado era demasiado fuerte y convertía los
  Globs claros (Ducky, pasteles) en un bloque de arcoíris parecido a Rainbow
  Fuel. Ahora es suave (`grayscale(1) brightness(1.3) contrast(1.15)`) y se
  devuelve un 35 % del color original dentro de la silueta. Arcoíris del RGB
  más claro y suave (`saturate(0.6) brightness(1.4)`).
  **Sistema de efectos (2026-10-27):** cada efecto es un apartado propio.
  - Efectos: RGB, Rainbow Fuel, Monochrome, Negativo, Nevado y Alternate.
  - Perfil: al seleccionar una imagen Rewamp o RGB aparece "Efecto de la
    imagen" con Original, RGB (si la skin RGB de la familia está
    desbloqueada), Rainbow Fuel (de la familia) y los efectos del Pase de
    Invierno ganados. Cada botón muestra la propia imagen con ese efecto. Se
    guarda en `profileAvatarEffect` y se resetea al cambiar de imagen. Se
    quitaron los apartados repetidos por efecto (las imágenes antiguas
    `glob:<tipo>:fx-<efecto>` se migran). GLB Fever sigue poniendo RGB a
    cualquier imagen; GODs Shadow queda siempre como sombra.
  - Por decidir: aplicar el mismo selector a las skins de torre en lugar de
    las 40 skins de efecto separadas de la tienda.
  - Skins: 40 skins de efecto generadas (8 familias × 5 efectos) en la
    categoría "✨ Efectos" de la tienda (`<skinRGB>__fx_<efecto>`). Requieren
    el efecto y la Rewamp de la familia (Worker/IEx: tener la familia). Se
    quitó el selector global de torres; Rainbow Fuel ya no se impone a la skin
    RGB, es su propia skin.
  - Alternate: RGB pre-Kiro (arcoíris completo mezclado por color, el tono
    gira). Recompensa del nivel 50 del Pase de Invierno.
  - Partidas antiguas: la elección del selector antiguo se migra a la imagen
    o skin de efecto equivalente.
  **GODs Shadow en el perfil:** salía como disco negro porque el filtro
  ennegrecía también el fondo de la imagen. Ahora el fondo va en un
  envoltorio (`.gods-shadow-avatar`), también en el perfil multijugador.
  **Verificado** en Chrome headless (file://): secciones del perfil, Ducky RGB,
  Dreamy SPyce y NOsense con GLB Fever, Alternate, Rainbow Fuel, Negativo y
  GODs Shadow; sin errores de consola. Sin comprobar con captura: categoría
  "Efectos" de la tienda y torres con skins de efecto.
  Pendiente: confirmación del usuario y decidir el aspecto final de Alternate.
