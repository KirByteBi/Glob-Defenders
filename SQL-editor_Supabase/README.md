# Esquemas SQL de Supabase

Esta carpeta contiene los esquemas que se ejecutan en **Supabase → SQL Editor**:

- [`supabase-schemas-all.sql`](./supabase-schemas-all.sql): los tres esquemas unidos en un único script: progreso, moderación y códigos de skin de un solo uso. Es la opción más sencilla para una instalación nueva.
- [`supabase-progress-schema.sql`](./supabase-progress-schema.sql): guardado de progreso por cuenta.
- [`supabase-moderation-schema.sql`](./supabase-moderation-schema.sql): registro de infracciones del chat.
- [`supabase-one-time-skin-codes-schema.sql`](./supabase-one-time-skin-codes-schema.sql): registro de `FROGGY_VICTEST` (reservado a `Victorillo_24`) y `ASTRAL-CREDIBLE` (reservado a `credible`), además de los canjes globales de `NITRO-BOOMER` y `THE-USER-BOMB`.

En una instalación nueva, pega y ejecuta `supabase-schemas-all.sql` una sola
vez. No ejecutes además los tres archivos individuales: ya están incluidos en
el combinado. Si ya habías ejecutado un esquema individual, el combinado está
diseñado para poder ejecutarse después también.

Los archivos de Edge Functions y `config.toml` permanecen en `supabase/`, en
sus rutas esperadas por la CLI de Supabase. Este SQL por sí solo no despliega
esas funciones; consulta la guía interna [supabase/README.md](../supabase/README.md)
para activarlas.
