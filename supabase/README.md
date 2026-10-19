# Guía interna de Supabase y cuentas

Este documento contiene instrucciones operativas del proyecto. La ruta
`supabase/README.md` está ignorada por Git: no se publica ni se incluye en los
commits. No guardes contraseñas, claves secretas ni otros datos privados aquí.

## Qué utiliza Supabase

Glob Defenders usa Supabase para tres funciones distintas:

1. **Supabase Auth:** registro e inicio de sesión con nombre de usuario y
   contraseña.
2. **Base de datos Postgres:** progreso en la nube y contador de infracciones
   del chat.
3. **Supabase Realtime:** salas temporales por seed, lista de jugadores,
   sincronización de la partida y chat.

El servidor Node de `server/` y sus bases MySQL/Postgres o JSON son un sistema
antiguo separado. No almacenan las cuentas Supabase ni el progreso en la nube
del juego publicado.

## Configuración del proyecto

### URL y clave pública del cliente

La URL HTTPS del proyecto y su clave **publishable** se configuran en
`supabase-config.js`. La clave pública está diseñada para estar en el cliente;
los permisos reales dependen de Auth, RLS y las funciones desplegadas.

No pongas nunca una clave `secret` o `service_role` en `supabase-config.js`,
`game.js`, el HTML, el CSS ni ningún otro archivo que llegue al navegador.
Tampoco la pegues en este README.

En Supabase, configura la URL del sitio y las URL permitidas de redirección para
el dominio HTTPS donde se publica el juego. Para desarrollo local, utiliza
solo las URL locales necesarias y elimínalas si dejan de hacer falta.

### Ajustes de Auth

En el panel de Supabase:

1. Activa el proveedor **Email**.
2. Desactiva **Confirm email** en **Authentication → Providers → Email**.
3. Configura **Site URL** y **Redirect URLs** para el sitio del juego.

Aunque el jugador introduce un nombre de usuario y una contraseña, el cliente
genera internamente una identidad de correo no entregable a partir del nombre.
El jugador no necesita proporcionar ni confirmar una dirección de correo real.
Por eso la confirmación de correo debe estar desactivada. Si se deja activa,
los registros pueden fallar o quedar pendientes intentando enviar correo a una
dirección que no recibe mensajes.

El nombre que se usa para iniciar sesión debe tener entre 3 y 24 caracteres y
solo puede contener letras ASCII, números, punto, guion o guion bajo. El juego
rechaza nombres que coinciden con su lista local de insultos antes de enviar
las credenciales a Supabase.

## Esquema del progreso en la nube

Ejecuta [`../SQL-editor_Supabase/supabase-progress-schema.sql`](../SQL-editor_Supabase/supabase-progress-schema.sql)
una vez en **SQL Editor**. Crea `public.player_progress`, relacionada con
`auth.users` mediante `user_id`, y activa RLS para que cada usuario autenticado
solo pueda leer, insertar o actualizar su propio progreso.

El guardado contiene el progreso del jugador, como monedas, insignias, skins,
desbloqueos y ajustes. Las escrituras en la nube se agrupan brevemente; el
navegador también mantiene una copia local en `localStorage` e IndexedDB.

Al entrar con una cuenta que no tiene guardado en la nube, el juego puede
ofrecer importar una copia local del mismo nombre. Aceptar la copia la sube a
esa cuenta; rechazarla no elimina el guardado local.

## Cooperativo, seeds y chat

El multijugador usa Supabase Realtime directamente desde el navegador; no
necesita el servidor Node. Un jugador crea una seed y los demás se unen con
ella o con un enlace de invitación. La partida es temporal: el anfitrión debe
permanecer conectado y la partida no se guarda como una sesión recuperable en
Postgres.

Las salas actuales usan canales públicos cuyo nombre deriva de la seed.
Quien conoce la seed puede intentar entrar y observar el tráfico de la sala.
El límite de cuatro jugadores se aplica en el cliente y no es un control de
seguridad. No uses estas salas para información privada ni como matchmaking
competitivo.

El chat tiene dos modos:

- **Seguro:** frases predefinidas, amistosas y localizadas.
- **Libre:** texto escrito por el jugador, limitado a 240 caracteres.

El cliente filtra los mensajes antes de enviarlos, y cada receptor vuelve a
filtrar los mensajes entrantes. Un mensaje detectado como ofensivo no se envía
a la sala y se sustituye localmente para el emisor por la imagen de Omnipresent
Glob. El filtro no puede garantizar que detecte todas las variantes.

## Códigos de skin de un solo uso global

`FROGGY_VICTEST` desbloquea `froggy_set` (Froggy Set) y está reservado a la
cuenta online `Victorillo_24`. El servidor verifica la identidad de la cuenta;
no basta con cambiar el nombre visible del jugador.

`NITRO-BOOMER` desbloquea `sharkbot_bombot` (RoboTibu),
`ASTRAL-CREDIBLE` desbloquea Worker Glob y `fracstal_set` (Fracstral Set), y
`THE-USER-BOMB` desbloquea Bomb Glob. Cada uno se puede reclamar una sola vez
en total por cualquier cuenta online autenticada. Si una cuenta ya tiene
todas las recompensas, el código no se consume.

Para activar y controlar las reclamaciones:

1. Ejecuta [`../SQL-editor_Supabase/supabase-one-time-skin-codes-schema.sql`](../SQL-editor_Supabase/supabase-one-time-skin-codes-schema.sql)
   en el SQL Editor. Si la tabla ya existe, vuelve a ejecutar el esquema para
   actualizar la función SQL con la restricción de cuenta de Froggy. La
   reclamación concede la skin en `player_progress` dentro de la misma
   transacción.
2. Configura en **Edge Functions → Secrets** los secretos
   `SUPABASE_URL`, `SUPABASE_ANON_KEY` (o `SUPABASE_PUBLISHABLE_KEY`) y
   `SUPABASE_SERVICE_ROLE_KEY`, si aún no están configurados para el proyecto.
3. Despliega la función desde la raíz del repositorio:

   ```powershell
   supabase functions deploy redeem-one-time-skin-code
   ```

4. Publica también la versión nueva del juego que invoca la función.
5. Para probar `FROGGY_VICTEST`, usa la cuenta `Victorillo_24`: cualquier otra
   cuenta debe recibir un aviso de que el código está reservado. Los otros
   tres códigos los recibe la primera cuenta online que los canjee; las demás
   deben recibir el aviso de que ya fueron reclamados.

La Edge Function valida la sesión y toma el ID de usuario del JWT; no acepta
que el navegador elija la cuenta beneficiaria. La función SQL solo admite los
cuatro códigos y las recompensas asociados en ella. Los registros no se borran al
eliminar la cuenta que reclamó el código, así que el código continúa agotado.
Hasta ejecutar el SQL, desplegar la función y publicar el cliente, esos códigos
no se pueden reclamar globalmente.

## Moderación y eliminación de cuentas

### Comportamiento del juego

- Cada tercer intento ofensivo activa el jumpscare. Los intentos del login se
  cuentan en memoria durante la sesión de esa página.
- Al llegar a 25 intentos ofensivos en el login, Omnipresent Glob (`???`) solo
  muestra un aviso para dejar de insistir. **El login no borra cuentas**:
  todavía no hay una identidad autenticada y el nombre escrito no demuestra
  quién controla una cuenta.
- En el chat, cada intento ofensivo de una persona autenticada se registra en
  Supabase. Al alcanzar 25 infracciones registradas, se elimina esa cuenta de
  Auth. El progreso en `player_progress` y el contador se eliminan mediante
  sus claves foráneas `ON DELETE CASCADE`. El juego cierra la sesión, limpia la
  copia de progreso local de ese navegador, desconecta al jugador de la sala y
  vuelve al login. Los demás jugadores reciben el aviso normal de salida.

El umbral del servidor es 25 infracciones del chat por cuenta. Los intentos de
login no se suman a ese contador persistente y no pueden provocar la
eliminación.

### Activar el registro y borrado automáticos

Esta función requiere una Edge Function desplegada y una clave `service_role`
guardada como secreto en Supabase. Sin esa configuración, el cliente aún
bloquea localmente los mensajes ofensivos, pero no puede guardar infracciones
ni efectuar eliminaciones automáticas.

1. Ejecuta [`../SQL-editor_Supabase/supabase-moderation-schema.sql`](../SQL-editor_Supabase/supabase-moderation-schema.sql)
   en el **SQL Editor** del proyecto. Crea la tabla privada
   `offensive_chat_attempts` y una función SQL que incrementa el contador de
   manera atómica.
2. Instala la CLI de Supabase siguiendo la documentación oficial e inicia
   sesión en ella.
3. Desde la raíz del repositorio, vincula el proyecto:

   ```powershell
   supabase link --project-ref <referencia-del-proyecto>
   ```

4. Comprueba que `supabase/config.toml` activa la verificación JWT para
   `record-offensive-chat-attempt`.
5. En el panel del proyecto, abre **Edge Functions → Secrets** y configura
   estos secretos:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY` o `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

   Si los configuras con la CLI, sigue la documentación oficial de
   `supabase secrets set` y evita incluir los valores en archivos versionados,
   comandos guardados, capturas o mensajes.

6. Despliega la función:

   ```powershell
   supabase functions deploy record-offensive-chat-attempt
   ```

7. Revisa los logs de la función desde el panel o la CLI y prueba el recorrido
   con una cuenta de pruebas que puedas eliminar. No hagas pruebas de umbral
   con una cuenta real importante: el borrado es permanente.

La función
[`functions/record-offensive-chat-attempt/index.ts`](functions/record-offensive-chat-attempt/index.ts)
valida el JWT y obtiene el identificador de la cuenta a partir de la sesión
autenticada. El cliente no puede especificar qué usuario contar o borrar. La
clave privilegiada solo se utiliza dentro de la función para incrementar el
contador y eliminar al usuario autenticado.

### Limitaciones de seguridad

El informe de una infracción se origina en el navegador: una versión
modificada del cliente puede evitar enviarlo. El servidor verifica qué cuenta
está autenticada, pero no puede comprobar que el jugador realmente intentara
escribir el mensaje que informa el cliente. Además, la moderación del texto
antes de que llegue a los demás se realiza en los clientes de la sala; no es
una moderación autoritativa del canal Realtime.

No trates la detección local ni este prototipo como un sistema infalible de
seguridad o moderación.

## Diagnóstico rápido

- **No se puede registrar o iniciar sesión:** comprueba que Email está
  habilitado, que la confirmación está desactivada y que el nombre cumple el
  formato permitido.
- **Error de correo o límite de registros:** las identidades del juego no
  reciben correo real. Revisa la opción de confirmación y los límites de Auth;
  espera a que se restablezcan o configura SMTP si el proyecto lo necesita.
- **No se carga el progreso:** verifica que ejecutaste el esquema de progreso,
  que RLS está activo y que el cliente tiene la URL y la clave publishable
  correctas.
- **El chat bloquea el mensaje, pero no se registra la infracción:** comprueba
  que ejecutaste el esquema de moderación y desplegaste la función. Revisa los
  logs de la función, los secretos y la sesión Auth.
- **No se conecta una seed:** revisa la conexión Realtime, que ambos jugadores
  usen exactamente la misma seed y que el anfitrión siga conectado.

La configuración del servidor Node antiguo, MySQL/Postgres y su alternativa
JSON local está documentada por separado en
[`../server/README.md`](../server/README.md); no es el almacenamiento de las
cuentas ni del progreso Supabase del juego.
