# Stack técnico

## Frontend (juego)

- HTML + CSS + JavaScript vanilla (sin framework ni bundler).
- Se ejecuta abriendo `index.html` en el navegador.
- Render en canvas/DOM gestionado desde `Controlador/game.js`.
- i18n propio mediante `Vista/traducciones.js` (ES/EN).

## Backend

- **Supabase**: Auth (usuario/contraseña mapeado a identidad interna), base de
  datos Postgres con RLS, Realtime (co-op) y Edge Functions (Deno/TypeScript).
- Esquemas SQL en `Modelo/SQL-editor_Supabase/` — ejecutar
  `supabase-progress-schema.sql` una vez antes de usar cuentas online.
- Servidor Node opcional en `Modelo/server/` (ver su `README.md`).

## Cómo ejecutar

El juego es estático: abrir `index.html` en el navegador. Para funciones online,
configurar la clave publicable y la URL HTTPS en `Modelo/supabase-config.js`.

> Nota: no inicies servidores de desarrollo de larga duración automáticamente.
> Si hace falta un servidor local, indica el comando para que el usuario lo
> ejecute manualmente en su terminal.

## Convenciones de edición

- `game.js` es muy grande (~17.5k líneas): localiza con búsqueda antes de editar,
  no leas el archivo completo sin necesidad.
- Mantén el balance en `config.js` / `datos-del-juego.js`.
- Todo texto nuevo visible debe añadirse a `traducciones.js` en ES y EN.
