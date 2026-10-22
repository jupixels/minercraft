# Minercraft

A Minecraft-style voxel game that runs entirely in the browser. It is hosted on
GitHub Pages straight from `main`, with no build step and no server.

## Layout

- `index.html` — the whole game: HTML, CSS and JavaScript in one file
  (~6,000 lines). The code is split into numbered sections with banner
  comments (`1. CONFIG & SMALL HELPERS` … `43. MULTIPLAYER`); grep for the
  banner to find a system. Numbers are labels, not file order.
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
- **Block IDs are permanent.** `BLOCKS` must stay 256 entries with the same
  id → name mapping; saves store raw IDs. Add new blocks only in unused
  slots. The test hashes the registry.
- **World generation is frozen per generator version.** Generators 1 and 2
  must keep producing byte-identical chunks (the test checks 48 chunk
  hashes). Change terrain only by adding a new generator version that new
  worlds opt into.
- **Saves migrate forward.** World metadata carries a version `v` (currently
  14). When you change the save shape, bump it and add a step to
  `migrateMeta()` so old saves load. Saves live in `localStorage`
  (`bc.*` keys; per-world `bc.w<slot>.*`).
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
- `NET_V` is the protocol version. Bump it whenever messages change in an
  incompatible way, so mismatched players get a "refresh to update" message
  instead of a broken game.
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
