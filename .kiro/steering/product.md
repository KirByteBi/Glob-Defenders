# Producto — Glob Defenders

Glob Defenders es un juego de tower defense para navegador (PC, móvil y tablet,
orientación horizontal). El jugador coloca "Globs" (torres) para defender su
base contra oleadas de "Pyces" y otros enemigos.

## Conceptos clave

- **Globs**: torres con familias (Verde, Rojo, Ducky, Soap, Comet, Old y familias
  de soporte como Worker, Balloon, Streamer, Bomb, Sprout, Crewmate). Cada familia
  tiene evoluciones, Duckgrades (mejoras especiales) y G-Tacks (habilidades).
- **Pyces / enemigos**: enemigos que avanzan por el mapa hacia la base. Incluyen
  jefes (NOeye, Arky, PhantKeeper, Astrorb, GODs Shadow, Roborb, etc.).
- **Monedas**: Globets (durante la partida), PyCoins (progreso general),
  Duckpasses (Duckgrades y skins).
- **Mapas**: agrupados en islas. Globland Isle (Gelatin Lake / GL, Urbanistic
  Road / UR, Sunlight Seaside / SS) y Wildsand Leaf (Aridez Escalofriante).
- **Dificultades**: Easy (10), Normal (15), Hard (25), Extreme (40),
  Corrupt (40), Unnormal/Anti-Normal (35) oleadas.

## Progreso y cuentas

- Cuentas online con usuario + contraseña mapeadas a una identidad Supabase Auth
  interna (sin email real). Progreso guardado en `player_progress` con RLS.
- Backup local en IndexedDB y `localStorage`. El modo offline usa solo el backup
  local y no sincroniza.
- Co-op gratuito hasta 4 jugadores vía Supabase Realtime (el host debe seguir
  conectado; las partidas son temporales).

## Idiomas

El juego es bilingüe español/inglés. Todo contenido nuevo visible (nombres,
descripciones, diálogos) debe estar disponible en ambos idiomas.

## Créditos

Desarrollo: KirByte_Bi. Creación de Globs: JustAUser y Credible. Muchos recursos
provienen de Iniciation Defenses (I.D.), propiedad de POPLIO_30, con permiso de uso.
