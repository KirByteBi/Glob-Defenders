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

## Free temporary co-op hosting (Windows)

The game API stays on port `3000`. Multiplayer Socket.IO runs separately on port
`3001`, so a public Quick Tunnel exposes only the multiplayer service. The browser
client is bundled with the game and does not execute code downloaded from the
multiplayer server.

1. Install Node.js and the server dependencies (`npm install` inside `server`).
2. Download Cloudflare's free
   [Windows 64-bit `cloudflared`](https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe)
   rename it to `cloudflared.exe`, and add its folder to `PATH`. Quick Tunnels
   do not require a paid plan, account, or domain.
3. From the repository root, run `.\server\start-public.ps1`.
4. Copy the `https://....trycloudflare.com` address printed by cloudflared.
5. Open the game from its public website, paste that address into **Servidor
   online**, and create a seed. Use the seed button's **Copiar invitación** option
   to share the auto-joining link.

Keep the host computer, server window, and tunnel window running for the whole
match. The tunnel address changes when restarted. A seed and its match snapshot
exist only in server memory: if the host leaves or the server stops, the session
is deleted and cannot be recovered. Restarting starts a new match. Up to four
players can join one seed.
