# Organización de tareas

Esta carpeta organiza el trabajo del proyecto Glob Defenders.

## Estructura

- `pendientes.md` — Backlog: tareas por hacer, agrupadas por área.
- `en-progreso.md` — Tareas que se están trabajando ahora mismo.
- `completadas.md` — Registro de lo ya terminado.
- `emergencias.md` — Runbook para incidencias que bloquean el trabajo
  (p. ej. `index.lock` de Git y "archivos desaparecidos"). Incluye una bitácora
  de incidencias al final.

## Cómo usarla

1. Toda tarea nueva entra en `pendientes.md` con un id corto (p. ej. `ATT-01`).
2. Al empezar a trabajarla, muévela a `en-progreso.md`.
3. Al terminar y validar, muévela a `completadas.md` con la fecha.

## Convención de estados

- `[ ]` por hacer
- `[~]` en progreso
- `[x]` completada
- `[!]` bloqueada (anota el motivo)

## Prioridades

- `P0` crítico / bloqueante
- `P1` importante
- `P2` deseable
