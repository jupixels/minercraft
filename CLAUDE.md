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
  (~7,100 lines). The code is split into numbered sections with banner
  comments (`1. CONFIG & SMALL HELPERS` … `46. BOATS`); grep for the
  banner to find a system. Numbers are labels, not file order.
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
- Section 47 is uranium: ore (generator 9), yellowcake, and the Enrichment
  Table (container type `enrichment`, ticked by the host from
  `updateFurnaces`). It is groundwork for a bigger nuclear update.
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
- `sounds/` — optional `.ogg` sound pack plus `manifest.json`; the game falls
  back to synthesized Web Audio sounds.
- `tests/quality-regression.cjs` — the regression suite.

## Hard rules

- **Keep it one static file.** No bundler, no npm dependencies at runtime.
  The only external script is three.js r128 from cdnjs, and the test asserts
  that list exactly. Don't add another `<script src>` without updating the
  test on purpose.
- **Block IDs are permanent.** Saves store raw IDs, so an id → name pair
  never changes. The id space is split three ways:
  - `0–255`: the original blocks. Frozen; the test hashes them.
  - `256–511`: items only (`defItem`). Never put a block here.
  - `512–1023`: newer blocks, appended in order with `xb()` / `xFacing()` /
    `xShapes()` at the end of the section 2 block list. Append only — never
    reorder, rename or remove one. The test pins a hash of the existing
    range; after appending, extend that pinned range on purpose.
    `BLOCK_ID_LIMIT` (1024) is the ceiling for the mesher's lookup tables.
- **Chunks store 16-bit ids** (`Uint16Array`; the mesher's padded volume too).
  Generators 1–3 still emit `Uint8Array` (their hashes depend on it) and
  `onChunkData()` widens them; generators 4+ emit `Uint16Array`. Test whether
  an id is a block with `BLOCKS[id]` / `isBlockId(id)`, never `id < 256`.
  `BLOCKS` has holes at 256–511, so loops over it must skip empty entries.
- **World generation is frozen per generator version.** Every shipped
  generator must keep producing byte-identical chunks: the test pins chunk
  hashes for generators 1–8. Generator 9 (generator 8 plus uranium veins)
  is the default for new worlds; once it ships, pin it too. Change terrain
  only by adding a version: guard new code with `version>=10`, keep `R()` call order unchanged for older versions,
  give new features their own `mulberry32` stream or a position hash, and
  bump the default in the three `genVersion` spots and the guest-meta check.
  Features that span chunks (tunnels, villages) are planned from world
  coordinates per cell and cached, so every chunk agrees on them.
- **Saves migrate forward.** World metadata carries a version `v` (currently
  15). When you change the save shape, bump it and add a step to
  `migrateMeta()` so old saves load. Saves live in `localStorage`
  (`bc.*` keys; per-world `bc.w<slot>.*`).
- **The texture atlas is 16 × 64 tiles** (`ATLAS_ROWS`); about 600 are used.
  Every `makeTile` that isn't a `mob_` tile takes an atlas slot.
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
- `?autostart` — skip the menus straight into a test world.
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
- `NET_V` is the protocol version (currently 3). Bump it whenever messages
  or block ids change in an incompatible way, so mismatched players get a
  "refresh to update" message instead of a broken game.
- Friendly fire is the host's setting `world.mp.pvp` (pause-menu button or
  `/friendlyfire on|off`). It travels to guests in the welcome snapshot and
  the `time` broadcast. Guests send `pvp` hits to the host, which checks the
  setting, range and rate before passing them on as `hurt`.
- Wrapped functions are reassigned globals (`spawnItem = function…`), so
  always call them by name rather than keeping your own reference.

Known limits: the world is online only while the host's tab is open;
simulation only runs in chunks the host has loaded; the host leads portal
travel; only the host can feed, tame or ride animals; there's no TURN server,
so some strict networks can't connect.

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

