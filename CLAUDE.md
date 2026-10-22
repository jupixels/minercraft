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
  (~6,600 lines). The code is split into numbered sections with banner
  comments (`1. CONFIG & SMALL HELPERS` … `44. CAVES & CLIFFS`); grep for the
  banner to find a system. Numbers are labels, not file order.
- Section 2 defines every block and item. Section 44 draws the textures for
  the blocks and items added in the Caves & Cliffs update (from the
  `EXT_TEX` recipes set in section 2) and holds their recipes, creative-tab
  placement, daylight burning, the spyglass and the clock.
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
  `onChunkData()` widens them; generator 4 emits `Uint16Array`. Test whether
  an id is a block with `BLOCKS[id]` / `isBlockId(id)`, never `id < 256`.
  `BLOCKS` has holes at 256–511, so loops over it must skip empty entries.
- **World generation is frozen per generator version.** Generators 1 and 2
  must keep producing byte-identical chunks (the test checks 48 chunk
  hashes). Generator 3 is live in players' worlds too, so treat it as frozen
  as well (check it against `main` when you touch worldgen). Generator 4
  (Caves & Cliffs) is the default for new worlds. Change terrain only by
  adding a new generator version (guard new code with `version>=5` and keep
  `R()` call order unchanged for older versions).
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
- `NET_V` is the protocol version (currently 2). Bump it whenever messages
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
