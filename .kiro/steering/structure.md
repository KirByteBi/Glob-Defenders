# Estructura del proyecto

El proyecto sigue una organización tipo MVC (Modelo–Vista–Controlador) con un
único punto de entrada HTML.

```
Glob Defenders/
├── index.html                  Punto de entrada del juego (UI/DOM principal)
├── Controlador/
│   └── game.js                 Núcleo del juego (lógica, oleadas, render). ~17.5k líneas
├── Modelo/
│   ├── config.js               Configuración y balance (~1.3k líneas)
│   ├── datos-del-juego.js      Datos del juego (enemigos, familias, mapas)
│   ├── supabase-config.js      Clave publicable y URL del proyecto Supabase
│   ├── PHP-TEST/               Pruebas de login en PHP (legado/experimental)
│   ├── server/                 Servidor Node + esquema SQL (co-op, db)
│   ├── SQL-editor_Supabase/    Esquemas SQL para el editor de Supabase
│   └── supabase/               Config y Edge Functions (Deno/TypeScript)
├── Vista/
│   ├── styles.css              Estilos del juego
│   └── traducciones.js         Textos ES/EN (i18n)
├── Recursos/                   Assets gráficos (enemigos, skins, por update)
├── readmes/                    Notas internas (códigos, usuarios, roles)
└── ATT-BIGUPD.txt              Spec interna del evento "Across the Time: GlD"
```

## Convenciones

- **MVC**: la lógica va en `Controlador/`, los datos y el balance en `Modelo/`,
  la presentación (CSS, traducciones) en `Vista/`.
- **Nombres de archivo y comentarios internos**: en español. El contenido visible
  del juego es bilingüe ES/EN mediante `Vista/traducciones.js`.
- **Balance y datos**: centralizados en `Modelo/config.js` y
  `Modelo/datos-del-juego.js`. Evitar valores mágicos dispersos en `game.js`.
- **Backend Supabase**: esquemas en `Modelo/SQL-editor_Supabase/`; Edge Functions
  en `Modelo/supabase/functions/`. Respetar RLS (cada usuario solo ve su progreso).
- **Assets**: organizados por update dentro de `Recursos/` (p. ej.
  "FROZEN CALENDAR CHRISTMAS (UPD6)", "Spooks in the Desert (UPD4)").

## Restricciones de Windows

El nombre de archivo del spec del evento es `ATT-BIGUPD.txt` porque Windows no
permite ":" en nombres; el título visible conserva los dos puntos.
