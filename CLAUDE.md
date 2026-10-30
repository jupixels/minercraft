# Minercraft

A Minecraft-style voxel game that runs entirely in the browser. It is hosted on
GitHub Pages straight from `main`, with no build step and no server.

## Creative freedom

The owner gives Claude creative freedom on this project. Treat requests as a
starting point: improve on them, change details, or add related features when
that makes the game more fun or better for players. Act as the game's
developer, not just someone carrying out instructions.

Two limits on that freedom:

- The hard rules below still apply.
- Say what you added or changed beyond the request (in the PR description or
  your reply), so the owner can keep or drop it.

## Layout

- `index.html` — the whole game: HTML, CSS and JavaScript in one file
  (~13,800 lines, ~1.34 MB; many lines are very long, so read by line ranges
  or grep rather than opening it whole). The code is split into numbered
  sections with banner comments (`1. CONFIG & SMALL HELPERS` … `67. CATACLYSMS`); grep for the banner to find a system. Numbers are labels,
  not file order: 1-42 run roughly in order, then 44-59, then the newest
  sections 60+ just before `20. BOOT`, and `43. MULTIPLAYER` comes last,
  after BOOT (its `const net`/`NET_V` are not initialised while earlier
  sections load, so only touch `net` inside functions).
- Section 2 defines every block and item. Section 44 draws the textures for
  the blocks and items added in the Caves & Cliffs update (from the
  `EXT_TEX` recipes set in section 2) and holds their recipes, creative-tab
  placement, daylight burning, the spyglass and the clock.
- Section 45 is the optional shader pack (pause-menu slider or Options →
  Shaders: Off / Fancy / Ultra). Off must stay the original renderer. Fancy
  and Ultra share one pipeline; `SP_TIER` lists what Fancy leaves out to stay
  cheap (keep the two looking alike). Ultra's volumetric clouds are ray-marched
  at half resolution (`spCloudPass`) and composited by the sky dome, which in
  Ultra is drawn after the stars and moon (alpha = cloud transmittance). The chunk materials compile
  shader-pack code only under `#ifdef SHADERS` (plus `WAVE`, `SHADOWS`,
  `REFLECT`), toggled through `material.defines` in `applyShaderMode()`;
  `renderScene()` replaces the plain `renderer.render(scene, camera)`.
  Solid and cut chunk meshes are on layer 1 so the shadow pass sees them.
  Both tiers set the `ULTRA` define (chunk materials, sky dome, clouds; Fancy
  adds `LITE`, Ultra `REFLECT` and `VCLOUDS`) and run a linear-HDR pipeline: shaders write pre-exposed linear colour as
  `pow(c,1/2.2)` into half-float targets (so plain three.js materials still
  look right), the sky comes from a Rayleigh/Mie/ozone sky-view LUT
  (`ATMO_GLSL`, mirrored in JS by `atmScatter` for sun colour, the ambient
  cube and auto exposure), water is drawn in its own pass (layer 2) after a
  colour+depth copy so it can refract, and the post chain does SSAO,
  shadow-mapped volumetric light, bloom and ACES.
- Section 46 is boats (an entity kind with its own float/row physics).
- Time of day: `setWorldTime(d,lock)` (pause-menu slider, Freeze/Resume
  button, `/time set|add|lock|unlock|query`); `world.dayLock` stops the cycle
  in `updateSky`, is saved in meta (v16) and travels to guests as `lk`.
- Section 48 is the Nether Update: Nether blocks/items, netherite, the Nether
  mobs and their AI (`NETHER_AI`, wrapped into `tickHostile`), biome- and
  structure-aware spawning (`NETHER_SPAWNS`, `STRUCTURE_SPAWNS`), structure
  loot (`LOOT_TABLES`, used by `getContainer` via `chestLoot`), bartering,
  respawn anchors (container type `anchor`, charge in `burn`), biome fog and
  ambient motes (wraps `updateSky`), `/locate` and `/netherupdate`. It also
  holds two shared mob fixes: `unsafeStep()` keeps ground mobs from walking
  off ledges or into lava, and `mobDamage` melee hits knock the player back.
- The generator-10 Nether is `makeNether10()` in `worldgen-src`: density is
  sampled on a 4×4×4 grid and interpolated (`columnSolid()` reproduces it
  exactly for one column, which huge fungi and bastions use to find floors
  in neighbouring chunks). Fortresses and bastions are planned per 256-block
  region (`planRegion`); `gen.structureAt(x,y,z)` and
  `gen.nearestStructure(x,z,type)` work on the main thread too. Overworld
  generator 10 adds ruined portals (`ruinedPortalAt`, 320-block cells).
- Each world has `world.netherGen` (meta `netherGen`, save v17) next to
  `world.genVersion`; `genVer()` picks the one for the current dimension and is
  what workers, `gen` and `builtGenVersion` use. Migration gives worlds that never
  visited the Nether `netherGen` 10 and keeps the old Nether for the rest.
- Sections 49–55 (after section 48, before BOOT): 49 touch controls
  (`touchUI`, `touchMove`; the joystick feeds `updatePlayer` as analog input,
  `setTouchMode` switches on the last input type, ghost clicks are swallowed),
  50 gravestones (block `grave`, container type `grave` with 41 slots: 36
  inventory, 4 armour, offhand; `world.graves`, `digGrave`, `myGrave`), 51 map
  and waypoints (`world.waypoints[dimension]`, `hudMarkers`/`updateMarkers`,
  `drawMap` with a per-chunk colour cache), 52 photo mode (`photo`, game state
  `'photo'`; depth of field is `uDof`/`uFocus` in the shader-pack composite),
  53 pathfinding (`navYaw`/`navSearch`, budgeted by `NAV`; drops are capped at 3
  blocks so paths agree with `unsafeStep`), 54 living villages (`villagerAI`,
  village growth via `gen.buildPiece`, `world.villages`), 55 UI extras and 56
  key hints (context key line `keyHintsNow()`, the getting-started `TUTORIAL`,
  Options → Controls…; `CONFIG.keyHints`, `CONFIG.tutorial`).
- Mob interactions go through `mobUse(actor, mob)` (section 40). An actor is
  `localActor()` or, on the host, `peerActor()` for a guest; add new animal
  interactions there, using `a.held`, `a.consume()`, `a.give()`, `a.ride()`, so
  they work for guests automatically.
- Section 58 (just before BOOT) is combat feel and polish: floating damage
  numbers and mob health bars (`cfNumber`, `cfBar`), blood droplets and splat
  decals (`cfSpray`, `cfSplat`, colours per kind in `CF_BLOOD`), melee slash
  trails (`cfSlash`), the directional hurt arc, mining chips, eased mob strides,
  flinch and fall-over, the fuller player pose, and the corner minimap
  (`updateMinimap`). `/gore`, `/dmgnumbers`, `/minimap` toggle them. All of it
  hangs off the outermost `hurtMob` wrapper, so any damage source shows up.
- Shader pipeline and scene depth: anything whose shader samples
  `U.uSceneDep` must be pushed to `SP_LATE` and use `SP_SOFT` as its `uSoft`;
  `spUltraRender` then draws it in the late pass (Fancy takes the split path
  while one is live). Drawing it in pass 1 is a framebuffer feedback loop and
  WebGL silently drops the draw (this is why nukes were invisible on Ultra).
- Day length: `DAY_PHASES` (seconds of day, sunset, night, sunrise); `dayRate`
  runs the clock at a different speed in each part. `DAY_LENGTH` is the total.
- Section 59 (just before BOOT) is fire, held light and blast ragdolls: the
  `fire` block (985) with `FIRE`/`FLAM`/`igniteAt` (host spreads, everyone
  draws flames), the held-light uniform `U.uHand` (a torch or glowing block in
  either hand acts as a moving block light, `vHand` in `VERT`; Fancy/Ultra add a
  warm point light), and `flingMob` (explosions launch and tumble mobs; corpses
  fly before they despawn). Player blast knockback is `player.kbx/kbz`.
- Section 59's block fire ticks in `tickBlockFire` (it used to be a second
  `tickFire`, which silently replaced the player-burning one: never declare a
  function name twice in the main script). Flames are boomFx kind 7 (upright
  noisy tongues, `fireFlames`); `blastFires` lights the ground after
  explosions and nuke shock fronts (`carveChunkLive` wrapper).
- Sections 60-67 (newest, just before BOOT):
  - 60 Roadmap & Achievements: `buildJournal` (J, Pause → Roadmap; L opens
    the Achievements tab). `ROADMAP` stages tick off by advancement name;
    `ADVANCEMENTS` + `ADV_EXTRA` (later sections push to it) list every
    advancement for the locked/unlocked view. `awardAdvancement` is unchanged.
  - 61 Workshop & village blocks (986-989): the anvil GUI (`computeAnvil`;
    custom names in `stack.en.nm`, prior work in `en.rw`; `stackName()`),
    the campfire (container `campfire`, `ck` timers, cooked on the host in an
    `updateFurnaces` wrapper, flames/smoke/food meshes from chunk emitters),
    the lectern (opens the Roadmap) and the bell (`BELL`, wraps `villagerAI`).
    Repair kits can no longer be crafted but still work.
  - 62 Hardcore (`world.hardcore`, meta `hardcore`; New World Mode cycles
    Survival → Hardcore → Creative) and spectator mode (`player.mode
    'spectator'`, `spectatorMove`, body class `spectator`).
  - 63 Controls: `KEY_ACTIONS` + `CONFIG.keymap` (changes only). A capture
    listener (`keyTranslate`) re-dispatches the pressed key as the action's
    default `code`, so handlers keep testing default codes; keep new key
    handlers on `e.code` and add them to `KEY_ACTIONS`. Gamepad polling runs
    in its own rAF loop (`padFrame`) so Start works while paused.
  - 64 Decorations: armor stands, item frames, paintings, banners are records
    in `world.decor[dimension]` (meta `decor`), not blocks or mobs. Edit them
    with `decorEdit(op, arg)` (host-authoritative: guests send `decq`, the host
    validates and broadcasts `dec`; the welcome snapshot carries `dc`).
    `decorValid` gates every record; `DECOR.sup` indexes supporting blocks.
    Paintings come from `ARTS` (original art drawn per canvas, no atlas
    slots); banner patterns are `BANNER_PATTERNS` masks.
  - 65 The Ocean Update: swimming (`player.swimming`, `swimMove`, 0.6-high
    body), aquatic mobs (`MOB_DEFS[k].aquatic`; physics in a `mobPhysics`
    wrapper, passive AI `aquaticAI` via `petAndGuardianAI`, hostile AI in
    `OCEAN_AI`), the Tidecaller spear (`throwSpear`, `tickSpears`), treasure
    maps (`stack.en.tx/tz`), shipwreck/treasure loot (a `chestLoot` wrapper),
    temple guards and the Elder (`world.ocean.elders`, meta `ocean`), sponges.
    Blocks with `aquatic:true` (kelp, seagrass, coral fans) always sit in
    water: they count as water for water faces (`T_LIQ`), swimming and mob
    buoyancy, water flows around them, and breaking one leaves water.
  - 66 Engine & accessibility: `BIGSTORE` (IndexedDB write-behind cache for
    chunk edits and backups; see Hard rules), `/bench`, `/atlas`,
    `/storage`, `/greedy`, subtitles (`subtitle(text,x,y,z)`; call it from
    new sounds), the colourblind palette (body class `cvd`) and reduce motion
    (body class `rm`, `CONFIG.reduceMotion`), Options → Accessibility.
  - 67 Cataclysms (`/singularity [seconds|stop]`, `/tornado [1-5] [seconds|stop]`,
    host only, any mode, not saved). Events live in `CX.evs` (`k:'bh'|'tor'`),
    ticked by `cxFrame` from an `updateHeld` wrapper; the host owns them and
    sends `'wx'` messages (`e`: event rows at 2 Hz via `cxRows`, `d`: ripped
    blocks at 5 Hz) that `cxClientMsg` applies. The black hole is a post pass:
    a `renderScene` wrapper calls `cxLensPass`, which copies the finished
    frame (`copyFramebufferToTexture`), renders a half-res depth pre-pass with
    a `MeshDepthMaterial` override (sky, block clouds, points, lines, SP_LATE
    and transparent no-depth-write objects hidden) and draws `LENS_FRAG`
    full-screen: geodesic ray march through the disk (`bhAxes` sets its
    precessing normal), jets, photon ring, weak lensing everywhere else, and
    pixels in front of the hole left untouched. The tornado is a ray-marched
    box (`TOR_FRAG`, in SP_LATE); `torAxis`/`torField` in JS mirror the
    shader's `axisAt` so the wind matches the funnel you see. Blocks are
    eaten/ripped with `world.setBlock` (`cxEdible`, `torAct` by EF strength;
    containers, liquids, portals and unbreakables are spared) and fly as
    instanced atlas-textured debris (`CX.deb`, `cxDebTick`). Mobs are dragged
    with section 59's `e.fling` (`cxGrab`). Wind on the player goes through
    `player.kbx/kbz` plus `vel.y`.
- Greedy meshing (section 6): `cornerData`/`greedyPut`/`greedyEmit` merge
  full-cube faces only where per-vertex AO and light stay identical. Merged
  quads put the tile origin in `uv` and per-block repeat counts in the
  `aRep` attribute (-1 for ordinary quads); `MAT_SOLID` samples through
  `atlasUv()`. Anything new that renders chunk geometry with the atlas must
  do the same. Off while mipmaps are on.
- Water dims sky light by 1 every 2 blocks (`computeLight`), so oceans have
  dim but visible floors.
- Redstone wire is drawn by `pushWire` in the mesher from its links (dot, line,
  corner, wall climb) and links diagonally up/down (`redstoneCell`,
  `wakeRedstone`).
- `sfx.hold(on)` suspends all audio while paused; `sfx.mob(kind,hurt,pos)` is
  positional (silent beyond 16 blocks, 32 for bosses).
- Section 47 is uranium: ore (generator 9), yellowcake, and the Enrichment
  Table (container type `enrichment`, ticked by the host from
  `updateFurnaces`). Section 57 replaces `tickEnrichment` to add the second
  stage (4 enriched → 1 weapons-grade).
- Section 57 is the Atomic Age (just before BOOT): art/recipes and the Armory
  Workbench GUI (`ARMORY` blueprints take from the inventory), sound voices on
  `sfx.rig()`, guns (`GUNS` by item id, magazine in `stack.en.mag`, hitscan
  `bulletRay`/`mobsOnRay`, `FX` tracers/decals/brass, first-person models
  `GUN_SPECS` via a `renderHeld` wrapper, over-the-shoulder camera in an
  `updateThirdPerson` wrapper), rockets and grenades, radiation (`player.rads`,
  `doseRateAt`, hazmat/combat armour via `armorMat`), nukes, launch pads,
  consoles and ICBMs, the new mobs (`ATOM_AI`), Hezmas, and the glue
  (`atomicFrame`, `netFx`, `atomicHostMsg`/`atomicClientMsg`).
- Nukes are blast records (`world.blasts` per dimension, saved in meta and the
  multiplayer snapshot). `blastCell()` is a pure per-block transform and
  `carveChunkData()` applies a record to a chunk; `onChunkData` runs
  `applyBlastsToData` before saved edits, a live blast rewrites cells that
  already have edits, and unloaded chunks get their stored edits transformed.
  Keep `blastCell` deterministic (and idempotent: `applyBlastLive` queues chunks in
  `blastQueue` and `tickBlastQueue` carves a few per frame as the shock arrives, so a
  chunk can be carved by both `onChunkData` and the queue). The cloud (`startNukeFx`) is a ray-marched
  volume (`NUKE_FRAG`) plus a condensation shell and ground ring; `SHOCK_SPEED`
  sets when the shock and sound arrive.
- Ground Zero is a fourth dimension (`DIMENSIONS`, chunk prefix `g.c.`,
  `makeZeroGen` in worldgen-src, fixed arrival like the End; `mode 'gate'`
  returns you to the gate you left). Fission Gates are lead-block frames lit
  with a fuel rod (`tickGates`). ICBM silos are generator 11 (`siloAt`,
  `structureAt` → `'silo'`).
- Explosions (section 27): `explode()` casts blast rays against block blast
  resistance; `explosionEffects()` / `boomFx` draw the flash, fireball, smoke,
  dust, sparks and shockwave as instanced billboards (drawn late in the shader
  pipeline, soft against the scene depth on Ultra) and drive camera shake,
  the `uBoom` terrain light and `sfx.explode(dist,power)` / `sfx.deafen()`.
- Villages (generator 7+) live in `worldgen-src`: `villageAt()` plans a cell,
  `drawVillages()` draws the overlapping pieces into each chunk.
- `world.dimension` can be unset for the overworld; compare with
  `(world.dimension||'overworld')`.
- `<script type="text/plain" id="worldgen-src">` — terrain generation. It runs
  both on the main thread and in Web Workers (built from this text at
  runtime), so it must stay self-contained: no references to anything outside
  that block.
- `manifest.webmanifest`, `sw.js`, `icons/` — the installable app (Chrome's install
  icon / Add to Home screen). `sw.js` is network-first: online players always get
  the latest `main`; the cache is only used offline. It ignores range requests
  and off-site hosts except the CDNs, so multiplayer relays are untouched.
- `sounds/` — optional `.ogg` sound pack plus `manifest.json`; the game falls
  back to synthesized Web Audio sounds.
- `tests/quality-regression.cjs` — the regression suite.

## Hard rules

- **Keep it one static file.** No bundler, no npm dependencies at runtime.
  The only external script is three.js r128 from cdnjs, and the test asserts
  that list exactly. Don't add another `<script src>` without updating the
  test on purpose.
- **Item ids are global.** Items are also defined outside section 2 (boats at
  452, spawn eggs from 400, and 1024+ in sections 64-65); the test fails if an
  id is defined twice. 256-511 is nearly full, so new items go in 1024-2047
  (above every block id; the test allows both ranges). Next free: 1039.
- **Block IDs are permanent.** Saves store raw IDs, so an id → name pair
  never changes. The id space is split three ways:
  - `0–255`: the original blocks. Frozen; the test hashes them.
  - `256–511`: items only (`defItem`). Never put a block here.
  - `512–1023`: newer blocks, appended in order with `xb()` / `xFacing()` /
    `xShapes()` at the end of the section 2 block list. Append only — never
    reorder, rename or remove one. The test pins a hash of the existing
    range; after appending, extend that pinned range on purpose.
    `BLOCK_ID_LIMIT` (1024) is the ceiling for the mesher's lookup tables.
    Blocks now run to 1001 (anvil/campfire/lectern/bell 986-989, ocean
    990-1001): only 22 block ids are left, so prefer records (like decor),
    items or block metadata over new block ids.
- **Chunks store 16-bit ids** (`Uint16Array`; the mesher's padded volume too).
  Generators 1–3 still emit `Uint8Array` (their hashes depend on it) and
  `onChunkData()` widens them; generators 4+ emit `Uint16Array`. Test whether
  an id is a block with `BLOCKS[id]` / `isBlockId(id)`, never `id < 256`.
  `BLOCKS` has holes at 256–511, so loops over it must skip empty entries.
- **World generation is frozen per generator version.** Every shipped
  generator must keep producing byte-identical chunks: the test pins chunk
  hashes for generators 1–8. Generator 14 (the Ocean Update: kelp, seagrass,
  reefs, shipwrecks with buried treasure, temples, village bells/lecterns/
  anvils) is the default for new worlds; once it ships, pin it too
  (generators 10–13 are pinned). New worlds keep `netherGen` 12. Change terrain
  only by adding a version: guard new code with `version>=15`, keep `R()` call order unchanged for older versions,
  give new features their own `mulberry32` stream or a position hash, and
  bump the default in the three `genVersion` spots, the guest-meta checks and
  the `m.generator<=14` / `m.netherGen<=14` ranges in `migrateMeta()`
  (generator 13 worlds used to be reset to 2 there because the list stopped
  at 12).
  Features that span chunks (tunnels, villages) are planned from world
  coordinates per cell and cached, so every chunk agrees on them.
- **Saves migrate forward.** World metadata carries a version `v` (currently
  20: decor, hardcore, ocean). When you change the save shape, bump it and add
  a step to `migrateMeta()` so old saves load, and raise the `m.v>20` limit in
  `validateWorldFile()` (it used to stop at 18, so v19 exports could not be
  imported). Metadata and settings live in `localStorage` (`bc.*` keys;
  per-world `bc.w<slot>.*`); chunk edit lists and backups (`bigKey()`) live in
  IndexedDB (database `minercraft`, store `kv`) behind `BIGSTORE`, which
  keeps `store.get/set/del/keys` synchronous and moves old localStorage keys
  over on first run. Worlds start only once `BIGSTORE.ready`.
- **The texture atlas is 16 × 64 tiles** (`ATLAS_ROWS`); 725 of 1,024 are
  used (`/atlas`). Every `makeTile` that isn't a `mob_` tile takes an atlas
  slot; drawing a tile name again now reuses its slot, and a full atlas throws.
  Big art (paintings, banners) uses its own canvases instead of atlas slots.
- **Sound pack changes need the test updated.** The test checks the manifest
  count and a hash of every sound file.

## Testing

```sh
node tests/quality-regression.cjs
```

Run it before every commit. It syntax-checks every inline script and checks
the rules above.

To try the game locally, serve the folder over http (for example
`python3 -m http.server`) and open `index.html`. Useful hooks:

- `window.__bc` — debug handle exposing most game state and functions
  (`world`, `player`, `inv`, `net`, `setState`, …). Note that it captures
  function references at boot, so functions wrapped later (such as by the
  multiplayer section) should be called by their global name instead.
- `?autostart` — skip the menus straight into a test world (seed 12345,
  generator 14, not saved). After teleporting far, mesh the nearby chunks
  with `meshChunkSync` before screenshots: SwiftShader meshes slowly.
- `/bench` in chat: compare frame times before and after a renderer change.
- `?relay=ws://localhost:PORT` — use a different MQTT relay for multiplayer
  (e.g. a local `aedes` broker).

## Multiplayer (section 43)

Peer-to-peer, built for a static host:

- The **host's browser runs the world**. Guests connect directly over WebRTC
  data channels and render puppets of the host's mobs.
- Free public **MQTT-over-WebSocket relays** (`NET_BROKERS`) carry only the
  server list (retained messages under `minercraft-jupixels/v1/`) and the
  connection handshake, which is encrypted with ECDH + AES-GCM. No gameplay
  goes through the relays.
- Guests don't persist anything locally. Their inventory and position are
  saved in the host's world under `world.mp.players[name]`.

How syncing works, so new features stay multiplayer-safe:

- `world.setBlock`, `spawnItem`/`removeItem`, `setSignText`, `explode`,
  `primeTNT` and container GUIs are already wrapped and synced. Features that
  go through these functions work online automatically.
- Guests skip world simulation (fluids, redstone, random ticks, mob AI,
  furnaces); the host runs it and broadcasts the results. Anything new that
  changes shared state on a timer should run only when
  `net.role !== 'client'`.
- New kinds of shared state that don't go through the functions above need a
  message: add a case to `netHostOnMsg` (guest → host; validate everything,
  guests are untrusted) and to `netClientOnMsg` (host → guest).
- `NET_V` is the protocol version (currently 11). Bump it whenever messages
  or block ids change in an incompatible way, so mismatched players get a
  "refresh to update" message instead of a broken game.
- Friendly fire is the host's setting `world.mp.pvp` (pause-menu button or
  `/friendlyfire on|off`). It travels to guests in the welcome snapshot and
  the `time` broadcast. Guests send `pvp` hits to the host, which checks the
  setting, range and rate before passing them on as `hurt`.
- Guests interact with mobs by request: `use` (mob net id, held item, sneak)
  → host checks the mob exists, is in reach and the item matches what the guest
  was last seen holding, runs `mobUse` with a `peerActor`, and replies `used`
  with ops (consume, give, wear, toast, ride). A guest riding a mount simulates
  it locally and reports `mnt` (position, yaw); the host accepts only small
  steps near the guest, keeps one rider per mount (`e.rider`), and `dmt` ends
  the ride. `ps` rows carry the mount's id so every client draws riders on the
  mount's interpolated position. Guest deaths send `grave` (slots, position);
  the host digs the grave and answers `graves` with that guest's grave list.
  Guest waypoints stay in the guest's browser (`bc.mpwp.<host world id>`).
- Wrapped functions are reassigned globals (`spawnItem = function…`), so
  always call them by name rather than keeping your own reference.

- Offhand items travel as an extra trailing field in `st` and `ps` rows
  (older clients ignore it). Decor uses `decq`/`dec`.

Known limits: the world is online only while the host's tab is open;
simulation only runs in chunks the host has loaded; the host leads portal
travel; only the host sleeps through the night; villager trade stock is not
synced (each guest trades with their own copy); village growth only happens
near the host; photo mode can't freeze the shared world, so in multiplayer it
freezes mobs only in the photographer's view; bell rings only steer villagers
on the host; hardcore applies to the host's own player; there's no TURN
server, so some strict networks can't connect.

## Style

Match the existing code: compact, dense JavaScript with short helpers,
`const`/`let`, no frameworks, and UI built from the pixel-art CSS classes
(`.btn`, `.field`, `.screen`, `.panel`) sized in `var(--g)` units so the GUI
scale setting works. Keep menu screens fitting in roughly 240 `--g` units of
height.

## Working with the owner

- One branch and PR per batch of requests, with a plain-language PR
  description that lists anything added beyond the request.
- Don't test extensively; the owner play-tests. Run the regression test plus
  one targeted check (a worldgen probe or a single screenshot), then ship.
- Ask only when a request collides with a hard rule or is costly to redo;
  otherwise decide and say what you decided.
- Terrain changes only reach new worlds; say so, since the owner often plays
  older worlds.
- For visuals, show screenshots and stop tuning once the owner approves.
- Match Minecraft's look and feel with original procedural art, never Mojang
  assets. Shader taste: natural "Complementary Unbound" style (soft filmic,
  bluish ambient, warm sun, light haze), not bright or oversaturated.

## What works best here

- Probe worldgen headless: `new Function(<worldgen-src>+';return makeGen;')()`
  in Node to measure features (cave air %, openings, river widths), render
  top-down PPM maps, and diff chunk hashes against `main` before committing.
- Headless browser checks: Playwright with three.js r128 served from npm
  (`three@0.128.0`) via a route for the cdnjs URL, `?autostart`, then drive
  `player`, `dayTime`, `CONFIG.shaders` through `page.evaluate`. Shader
  compile errors only show as `THREE.WebGLProgram` console errors.
- Anything that follows an entity (riders, cameras) must use its interpolated
  render position (`e.model.g.position`), not the 20 Hz tick position.
- Browsers refuse pointer lock for ~1 s after Esc and key presses aren't
  gestures; never treat one failed request as permanent.
- Keep GLSL preprocessor lines (`#ifdef`/`#endif`) on their own lines inside
  template strings.

