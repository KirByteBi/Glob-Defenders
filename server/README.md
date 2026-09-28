# Backend database configuration

The server tries MySQL first. If it cannot connect, it uses the PostgreSQL
backup instead. Configure the databases with environment variables; credentials
are not stored in the repository.

MySQL uses `MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`, and
`MYSQLPORT`.

PostgreSQL accepts either `DATABASE_URL` (or `POSTGRES_URL`) or the individual
variables `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, and `PGPORT`.
`POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, and
`POSTGRES_PORT` are accepted as aliases. The PostgreSQL database must already
contain the same `Usuario` table and columns used by the server.

Connection attempts time out after five seconds by default. Override this with
`MYSQL_CONNECT_TIMEOUT` or `PGCONNECT_TIMEOUT` (milliseconds).
