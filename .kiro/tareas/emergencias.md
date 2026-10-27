# Emergencias — Runbook

Procedimientos rápidos para incidencias que bloquean el trabajo (sobre todo de
Git en Windows/PowerShell). Antes de nada: **no entres en pánico y no borres
nada a lo loco**. En Git casi todo lo que "desaparece" sigue estando en el
repositorio; el truco es saber dónde mirar.

> Regla de oro: ante la duda, primero haz una copia de seguridad de la carpeta
> completa del proyecto (incluida `.git`) antes de ejecutar comandos de
> recuperación. Copiar es gratis; deshacer un `reset --hard` no.

---

## 1. `index.lock` — "Unable to create '.git/index.lock': File exists"

### Qué es

Git crea `.git/index.lock` mientras modifica el índice (al hacer `add`, `commit`,
`merge`, etc.). Si el proceso se interrumpe (cierre de la terminal, crash del
editor, dos operaciones de Git a la vez, antivirus que bloquea el archivo),
el `.lock` queda huérfano y Git se niega a seguir para no corromper el índice.

### Cómo solucionarlo

1. Asegúrate de que **no haya ninguna operación de Git en curso**. Cierra otras
   terminales, paneles de Git del editor o procesos que puedan estar usando el
   repo. Comprueba si hay procesos `git` vivos:

   ```powershell
   Get-Process git -ErrorAction SilentlyContinue
   ```

   Si aparece alguno y estás seguro de que está colgado, ciérralo:

   ```powershell
   Get-Process git -ErrorAction SilentlyContinue | Stop-Process
   ```

2. Confirma que el lock existe:

   ```powershell
   Test-Path ".git\index.lock"
   ```

3. Borra el archivo de lock (solo el lock, nada más):

   ```powershell
   Remove-Item ".git\index.lock"
   ```

4. Verifica que Git vuelve a responder:

   ```powershell
   git status
   ```

### Si vuelve a aparecer

- Suele ser el **antivirus** o la **indexación de Windows** bloqueando `.git`.
  Añade la carpeta del proyecto a las exclusiones del antivirus.
- O hay un proceso de Git/editor que relanza la operación. Ciérralo del todo
  antes de reintentar.

---

## 2. "Archivos desaparecidos" — el working tree se ve vacío o faltan archivos

Casi nunca es una pérdida real. Antes de recuperar, averigua **en qué estado**
está el repo.

### Paso 0 — Diagnóstico

```powershell
git status
git log --oneline -10
git stash list
```

- `git status` te dice la rama actual y qué hay en stage o sin seguir.
- `git log` confirma que tus commits siguen ahí.
- `git stash list` revela trabajo guardado en un stash (causa muy habitual de
  "se borró todo").

### Caso A — Los archivos están en un stash

```powershell
git stash list
git stash apply            # aplica el stash más reciente sin borrarlo
# o, si estás seguro:
git stash pop              # aplica y elimina el stash
```

> Usa `apply` antes que `pop` hasta confirmar que recuperaste lo correcto.

### Caso B — Cambié de rama/commit sin querer (detached HEAD o checkout)

```powershell
git branch -a              # lista las ramas
git switch main            # vuelve a tu rama de trabajo (ajusta el nombre)
```

Si quedaste en "detached HEAD" y habías hecho commits ahí:

```powershell
git reflog                 # muestra TODO lo que HEAD ha tocado, con sus hashes
git switch -c rescate <hash>   # crea una rama en el punto que quieres rescatar
```

### Caso C — Un `reset`/`checkout` quitó archivos ya commiteados

El `reflog` es tu red de seguridad: registra cada movimiento de HEAD aunque ya
no esté en el historial visible.

```powershell
git reflog
git checkout <hash> -- <ruta/al/archivo>   # recupera un archivo concreto
# o para volver el repo entero a un punto anterior (destructivo, con copia antes):
git reset --hard <hash>
```

### Caso D — Archivos nuevos (sin commit) que ya no aparecen

Si eran archivos **sin seguir** (untracked) y algo como `git clean` los borró,
Git **no** los tiene: no estaban en el repositorio. Mira entonces:

- La **Papelera de reciclaje** de Windows.
- El **historial de versiones local** del editor (en VS Code / Kiro:
  "Local History" / "Timeline" del archivo).
- Copias de seguridad del sistema (File History / puntos de restauración).

### Comando peligroso a evitar salvo intención clara

`git clean -fd` borra de forma permanente los archivos sin seguir. No lo
ejecutes para "limpiar" si no estás seguro de que no hay trabajo nuevo ahí.

---

## 3. Checklist general antes de tocar Git en una emergencia

1. Copia de seguridad de toda la carpeta del proyecto (con `.git`).
2. `git status`, `git log --oneline`, `git stash list`, `git reflog`.
3. Identifica el caso concreto arriba antes de ejecutar comandos.
4. Prefiere comandos no destructivos (`apply`, `switch`, `checkout -- archivo`)
   frente a destructivos (`reset --hard`, `clean -fd`).
5. Cuando lo resuelvas, anota aquí abajo qué pasó y qué lo arregló, por si
   vuelve a ocurrir.

---

## 4. Bitácora de incidencias

Registra cada emergencia real para tener memoria del proyecto.

| Fecha | Síntoma | Causa | Solución aplicada |
| ----- | ------- | ----- | ----------------- |
| (pendiente) | `index.lock` bloqueaba `git add`/`commit` | proceso de Git interrumpido / lock huérfano | Borrado de `.git/index.lock` y reintento |
