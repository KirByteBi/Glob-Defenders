# 🌟 GLOB DEFENDERS - OFFICIAL GUIDE 🌐

Welcome to **Glob Defenders**!

A tower defense game where you use the Globs to defend your base against the Pyces or other enemies on the way.

Place your towers, evolve them, use their abilities and try to survive as many waves as possible.

But be careful... the Pyces don't always play fair and there's more than just Pyces wanting to end you.

---

## 🎮 How to play

* Place Globs in the available spaces.
* Defeat enemies to earn **Globets**.
* Use Globets to place and upgrade your towers.
* Click on a tower to see its evolutions and upgrades.
* Defend the base and don't let the Pyces reach it!

You can play on PC, mobile and tablet. The game is designed to work horizontally on mobile devices.

---

## 💾 Progress storage

Online accounts use only a username and password. The game maps the username to
an internal, non-deliverable Supabase Auth identity; players do not enter or
need a real email address. In the Supabase dashboard, disable email
confirmation for the Email provider. Badges, skins, currencies, unlocks and
settings are saved in the account's private `player_progress` row and loaded
after sign-in, so they follow the account to another PC. The table is protected
by row-level security; the browser can access only the signed-in user's progress.

Run [`supabase-progress-schema.sql`](./supabase-progress-schema.sql) once in the
SQL Editor in the Supabase project dashboard before using online accounts.
Supabase's Email provider must be enabled, with email confirmation disabled.

The game also keeps a local backup in IndexedDB and `localStorage`. Offline play
uses only that local backup and does not synchronize. If an online account has
no cloud save and a local save for the same player name exists, the game asks
before importing it; declining leaves the local save untouched.

## 🌌 Interstellar Menace

Start in Cube Adventure searching for a portal to find a code to insert in here...

### Free online co-op

Co-op seeds support up to four players through Supabase Realtime, without
running a public Node server or tunnel. Configure the project's publishable key
and HTTPS URL in `supabase-config.js`, then follow the setup notes in
[`server/README.md`](./server/README.md). The host must stay connected; matches
are temporary and cannot be recovered after the host leaves.

Interstellar co-op requires each guest to have entered the mission access code
and unlocked Interstellar. Guests who do not meet both requirements can still
join as spectators and see the player roster and live match, but cannot send
gameplay actions. Spectators do not earn badges, currencies, or saved progress;
the match's shared Globets display is restored to their own balance when
they leave the room.

### Offline play

Use **Play offline** to enter without contacting Supabase. Offline progress is
saved in this browser and is not synchronized with an online account or other
devices. Offline play does not verify an account, and seed creation/joining is
disabled until you sign in online. Your local profile still appears during an
offline match, but it is only a visual identity and does not enable multiplayer.

## 👤 User profiles

Each account can choose a profile portrait and frame. Classic and green frames
are free; additional colored frames are earned at Duck Pass levels 10, 20, 35
and 60, or bought with Duckpasses. Spooky and Pumpkin each cost 500
Duckpasses. Special frames with themed backgrounds unlock through their
specified achievements or purchase: Interstellar and map frames require their
respective victories, Placeholder costs 250 Duckpasses, and the
`ONLINE-AVATARS` code unlocks Coded. The pink/green Binary Love frame and Kirb
portrait are reserved for KirByteBi (debug mode can unlock all profile items).
Placeholder Glob has a separate hidden unlock. There are also rumors of a
reward for completing every
available profile-frame challenge.

Glob-family portraits unlock when the family is owned; the original portrait
is separate from its Rewamp portrait, which requires the corresponding Rewamp
skin. The max-evolution portrait is available after maxing that family once
and costs 300 PyCoins plus 150 Duckpasses for each available style. In
multiform enemy families, the base portrait unlocks after reaching the family's
total kill target across all its forms; each alternate portrait requires at
least one quarter of that target in kills for that specific form. Identical
artwork is represented by one portrait. The free Glob and Red Glob portraits
use their original, non-Rewamp artwork. There are also rumors of a hidden
reward for players who complete their collections.

Collecting every available profile image also unlocks the animated RGB effects
for the Green, Red, and Blue Secret Rewamp skins. Their original skin names
remain unchanged; RGreenB, RedGB, and RGBlue are honorific names mentioned in
their descriptions. Fun fact: Green, Red, and Blue are the original Glob
families and the first families to receive Rewamp skins.

During a match, the host's game can be saved from the pause menu and resumed
from **Load saved game** on the island screen; the button shows the saved map,
wave, and mode. If there is no saved round, the game responds with a randomly
chosen line from ???, Work-Bombot, or Glob. The pause menu also offers
**Save and log out** and **Save and exit**.
In online co-op, only the host saves; after resuming, players can rejoin with
the same seed. Browsers may block scripts from closing a tab they did not open,
so **Save and exit** will prompt you to close the tab manually if needed. The
browser may also show its standard leave-page confirmation when refreshing
during a round.

Two hidden effects await curious players in **Settings → Special**. One rewards
an unusual amount of attention to the characters around the login screen; the
other is reserved for those who can truly claim to have seen everything,
including what lies beyond ordinary maps and modes. Once both effects are
available, try enabling them together.

---

## 💰 Currencies

### 🎫 Globets / Globetines

The currency used during a match.

You earn them by defeating enemies and use them to place and upgrade Globs.

### 🪙 PyCoins

The main currency outside of matches.

You can use them to unlock new families, buy skins and improve your progress.

### 💳🦆 Duckpasses

Special cards used for Duckgrades and certain skins.

You can obtain them through the Duck Pass, codes and other rewards.

---

## 🌱 Glob Families

Each family has its own style of combat.

Some focus on damage, while others focus on support, money or special effects.

### 🟢 Green Glob

A balanced family.

It has several evolutions and is one of the families with the most progression.

Its later evolutions focus on stronger attacks and lasers.

### 🔴 Red Glob

A close-range family.

It focuses on fast attacks, melee combat and burning enemies.

### 🟡 Ducky Glob

A support family focused on earning money.

Ducky Glob generates additional resources during the match.

### 🔵 Soap Glob

A support family that slows enemies using bubbles.

It has short range, but can help other towers deal with enemies more easily. Its third evolution, ElectroClean Glob, attacks rapidly, stuns on every hit and can push enemies back.

### ⚫ Comet Glob

A family based around high damage and returning projectiles.

Its attacks and evolutions use different star-based mechanics, including projectiles that can return like boomerangs.

### ⚪ Old Glob

An old family connected to the history of the Globs.

It uses its own projectile mechanics and has several special evolutions.

---

## 🛠️ Support Families

### Urban Reborn, Interstellar Menace & Leafy Beach Party added Globs

Not every Glob needs to deal direct damage.

Some are designed to help the other towers or deal with enemies in different ways.

### 🟠 Worker Glob

Uses traps to stop, stun or damage enemies.

Its upgrades improve how the traps work.

**Made by Credible and supervised by Kirb.**

### ⚪ Balloon Glob

Increases the range of towers inside its area.

However, towers inside the area also have a higher cooldown.

### 🩷 Streamer Glob

The **diacounter Glob**.

It makes your towers cheaper, but also reduces their own damage and attack speed.

### 💥 Bomb Glob

Explodes when an enemy enters its range, then it disappears.

Its evolutions improve the explosion's damage and area, with different effects such as burning or poison.

**Made by JustAUser and supervised by Kirb.**

### 🌱 Sprout Glob

This Glob can decrease the speed of enemies inside its range.

The amount of slow can vary between evolutions, becoming stronger as you buy more evolutions.

### 🏴‍☠️ Crewmate Glob

The first summoner Glob.

It uses ships as shields for your base, while some of them can also attack with cannonballs.

Some can even use bombs similar to Bomb Glob!

---

## 🦆 Duckgrades

Duckgrades are special upgrades that improve a family even further.

They can add new effects, improve attacks or change how a tower works.

Some examples include:

* Increasing attack speed near certain towers.
* Adding special effects to attacks.
* Improving the abilities of support families.
* Giving new effects to explosive attacks.

Choose your upgrades carefully. Not every combination works the same way.

---

## ⭐ G-Tacks

G-Tacks are powerful abilities unlocked at higher levels.

They can temporarily improve towers, affect enemies or activate special effects.

They are useful when a wave becomes difficult or when several towers can benefit from the same ability.

---

***If a Glob family doesn't have a G-Tack or a Duckgrade, please contact KirByte. Sometimes, when adding a new Glob, it is more important to make the Glob itself work properly than to give it extra abilities.***

---

## 🗺️ Maps

Maps are grouped into islands and selected as zones.

### Globland Isle (Isla de los Globs)

Contains **Gelatin Lake**, **Urbanistic Road**, and **Sunlight Seaside**.

### Wildsand Leaf (Bosques Arenonieves)

Its first available zone is **Aridez Escalofriante**, known in English as **Spooktacular Ruins**. Two crossed routes connect the enemy pyramids on the left to allied oases on the right. The miniboss and boss slots are reserved for a future update.

**Frosty Christmas (SOON)** and **Darkness Forest (RELEASING NEXT YEAR)** are shown as locked zones.

### 🌊 Gelatin Lake

The valley where the Globs originated.

It contains the jelly lake and is one of the first places defended by the Globs.

It is also known as **GL**.

### 🏙️ Urbanistic Road

A more developed area with roads, a river and different paths.

The enemies use the roads to reach the base, so you must place your towers carefully.

It is also known as **UR**, mainly meaning that you are becoming something more.

This was later answered by **Interstellar Menace**, known as **IM**, because of **Astrorb**.

### ☀️ Sunlight Seaside

A beach and port area located south of Urbanistic Road.

The path looks mostly like an 8. Two paths connect at one point, but both continue afterwards before reaching the boat.

The enemies want to sink the boat.

Work-Bombot orders the Globs to defend it, since the port and boat will be needed to reach other places that are being attacked.

The map is also known as **SS**.

---

## ⚔️ Difficulties

Each difficulty changes the number of waves and the enemies that appear.

| Difficulty             | Waves |
| ---------------------- | ----: |
| Easy                   |    10 |
| Normal                 |    15 |
| Hard                   |    25 |
| Extreme                |    40 |
| Corrupt                |    40 |
| Unnormal / Anti-Normal |    35 |

Higher difficulties don't only increase enemy health.

They also introduce more enemies, different combinations and harder wave spikes.

**Unnormal** is especially unusual. It follows its own logic... when it feels like it.

---

## 👑 Bosses

Bosses appear during the final wave of their match.

They don't appear randomly in earlier waves.

A final wave can contain normal enemies alongside its boss, but only one boss can appear.

Some bosses you may encounter include:

* **NOeye**
* **Arky**
* **PhantKeeper**
* **Astrorb** — only in the **IM** collaboration quest.

Be prepared. Bosses are not just bigger enemies.

---

## 🎨 Skins

Skins allow you to change the appearance of your Globs.

Some are simple recolors, while others have their own visual theme.

Certain special skins can also provide bonuses or be connected to collaborations.

Collect them if you want... or don't. The Globs won't judge you.

---

## 🏅 Badges

Badges are achievements obtained by completing different challenges.

Some require surviving waves, using specific towers, collecting resources or discovering secrets.

There are also badges connected to special game mechanics and hidden modes.

Can you get them all?

---

## ⚙️ Settings

The game includes different settings to customize your experience.

Some options include:

* Music.
* Sound effects.
* Show Hitbox.
* Show descriptions.
* View total damage.
* Reset progress.

The **Show Hitbox** option can be useful if you want to understand the range and attack areas of your towers.

---

## 🤝 Collaborations

Glob Defenders can include collaborations with other creators and projects.

One example is the collaboration with **Star Jump**, which introduced the Starry skin for the **Gray family**.

The second collaboration was with **Cube Adventure** (by Eithancrea), which introduced the **Interstellar Menace** update as a full quest between **CA** and **GlD**.

Thanks to everyone who helps make the game possible!

---

## ❓ FAQ

### How do I unlock Work-Bombot?

Check the requirements in the game. Some towers and families require specific achievements or game progress.

If there are no clues, try completing **Corrupt** or **Unnormal**.

### What are PyCoins used for?

PyCoins are used for unlocking content, skins and other improvements outside of matches.

Check the shop, because some things require both **PyCoins** and **Duckpasses**.

### Can I play on mobile?

Yes! The game supports horizontal mobile gameplay.

Mobile responsiveness is still being worked on, so some things may not work perfectly yet.

### What happens if a Pyce or enemy reaches the base?

You lose base health.

If the base runs out of health, the match ends.

---

## 💙 Credits

**Development:** KirByte_Bi

**Glob Creators:** JustAUser and Credible

**Skin Creators:** KirByte_Bi, Nitrogen and Credible

**Collaborators:** Eithancrea

Thanks to everyone who plays, tests and supports Glob Defenders.

And remember:

# Never let the Globs fail you, or witness the bad corporations take over immortality.
