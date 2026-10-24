# Backend database configuration

The server tries PostgreSQL first. If it cannot connect, it uses MySQL as a
fallback. Configure the databases with environment variables; credentials are
not stored in the repository.

MySQL uses `MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`, and
`MYSQLPORT`.

PostgreSQL accepts either `DATABASE_URL` (or `POSTGRES_URL`) or the individual
variables `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, and `PGPORT`.
`POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, and
`POSTGRES_PORT` are accepted as aliases. The PostgreSQL database must already
contain the same `Usuario` table and columns used by the server.

Connection attempts time out after five seconds by default. Override this with
`MYSQL_CONNECT_TIMEOUT` or `PGCONNECT_TIMEOUT` (milliseconds).

When neither database is reachable, the server remains available and returns
HTTP 503 with code `DATABASE_UNAVAILABLE` for database-backed API requests. The
game uses this response to enter its browser-local offline mode. No database
schema or data is changed by this fallback.

## Supabase Realtime multiplayer

Multiplayer connects directly from the game to Supabase Realtime; it does not
need the Node server or a Cloudflare tunnel. The game uses ephemeral public
Realtime channels named from the seed and Presence to keep the player list and
detect when the host leaves. Up to four players can join. Match state exists
only on the host and is broadcast to guests; it is not saved to PostgreSQL, so
leaving the room loses the match.

1. In the Supabase dashboard, open **Connect** and copy the project's HTTPS URL
   and **publishable key**.
2. Put the URL and key in the root `supabase-config.js` file. Never use or share
   a `secret` or `service_role` key in browser code.
3. Serve the game from its normal HTTPS website and allow the Supabase Realtime
   connection. No SQL tables or database credentials are needed for this
   multiplayer prototype.
4. One player creates a seed; friends can load that seed or open its invitation
   link. The host must remain connected for the match to continue.

This first version uses public channels: anyone who knows a seed can join and
observe its traffic, and browser clients cannot be treated as trusted game
servers. The four-player cap is client-side and can be bypassed, so treat this
as an experiment, not a secured public matchmaking service. Do not use it for
private data or a competitive mode. MySQL, PostgreSQL, and the local JSON
account fallback remain separate in `db.js`.

## Supabase account login and cloud progress

The game website uses Supabase Auth directly for online username/password sign-in;
players do not provide a real email address. The username is mapped internally
to a non-deliverable Supabase Auth email identity. In the Supabase dashboard,
enable the Email provider and disable **Confirm email** under
**Authentication > Providers > Email**. Otherwise Supabase attempts to send
confirmation emails to the non-deliverable username identities and may reject
signups with an email rate-limit error. Configure the project's allowed redirect
URLs and Site URL for the website, and run the root
`../SQL-editor_Supabase/supabase-progress-schema.sql` script in the SQL Editor. The script creates a `player_progress` table with row-level
security, so authenticated users can read and write only their own save.

If signups still hit an email rate limit with confirmation disabled, wait for
Supabase's limit to reset or configure custom SMTP in the Supabase dashboard.
The game cannot increase or bypass Supabase Auth's email limits.

Only the project's HTTPS URL and publishable key belong in the browser
configuration. Never put a Supabase secret or service-role key in the game.
MySQL/PostgreSQL account endpoints in this Node server are legacy/local and are
not the storage used by Supabase Auth or cloud progress.
