# Esquemas SQL de Supabase

Esta carpeta contiene los esquemas que se ejecutan en **Supabase → SQL Editor**.

| Orden | Archivo | Contenido |
|---|---|---|
| 1 | [`supabase-shared-helpers.sql`](./supabase-shared-helpers.sql) | Función auxiliar `jsonb_text_array_union` (une listas de skins sin duplicados). |
| 2 | [`supabase-progress-schema.sql`](./supabase-progress-schema.sql) | Guardado de progreso por cuenta (`player_progress`). |
| 3 | [`supabase-moderation-schema.sql`](./supabase-moderation-schema.sql) | Registro de infracciones del chat. |
| 4 | [`supabase-one-time-skin-codes-schema.sql`](./supabase-one-time-skin-codes-schema.sql) | Códigos de un solo uso: `FROGGY_VICTEST` (reservado a `Victorillo_24`), `ASTRAL-CREDIBLE` (reservado a `credible`), `NITRO-BOOMER` y `THE-USER-BOMB`. Requiere el 1. |
| 5 | [`supabase-star-jump-link-schema.sql`](./supabase-star-jump-link-schema.sql) | Colaboración con Star Jump: tabla `star_jump_links` y función `link_star_jump_account`. |

[`supabase-schemas-all.sql`](./supabase-schemas-all.sql) es la unión de los cinco
en ese orden dentro de una transacción. Es la opción más sencilla: pégalo y
ejecútalo una vez. Puede volver a ejecutarse sobre una base ya instalada.
Si editas un archivo individual, copia el cambio también en el combinado.

## Instalación de la colaboración con Star Jump en una base existente

Ejecuta `supabase-shared-helpers.sql`, después `supabase-one-time-skin-codes-schema.sql`
(versión optimizada que usa el auxiliar) y por último
`supabase-star-jump-link-schema.sql`. O ejecuta directamente el combinado.

Los archivos de Edge Functions y `config.toml` permanecen en `supabase/`, en
sus rutas esperadas por la CLI de Supabase. Este SQL por sí solo no despliega
esas funciones; consulta la guía interna [supabase/README.md](../supabase/README.md)
para activarlas. La vinculación con Star Jump no necesita Edge Function: la
función SQL usa `auth.uid()` de la sesión del jugador.
