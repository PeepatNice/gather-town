# Change Log

## Session — 2026-02-18

### 1. Interactive Map Objects (Feature)
- Added full object system: catalog (`object_manifest.json`), placements (`map_objects.json`), procedural pixel-art renderer, proximity detection, and X-key interaction
- New files: `objects/types.ts`, `objectManifest.ts`, `ObjectRenderer.ts`, `ObjectManager.ts`, `ProximityDetector.ts`
- React UI: `InteractionPrompt.tsx`, `NoteModal.tsx`, `LinkModal.tsx`, `ImageModal.tsx`, `InteractionOverlay.tsx`
- Added 4 EventBus events: `OBJECT_PROXIMITY_ENTER/EXIT`, `OBJECT_INTERACT`, `OBJECT_INTERACTION_CLOSE`
- Wired into `MainScene.ts` and `GameView.tsx`
- Added door to building at tile (16,5) and path tile at (16,6)
- Default objects: welcome sign, desk, chair, monitor, bookshelf, TV, plant, lamp

### 2. Fix: Objects not rendering (Bug Fix)
- Switched `ObjectRenderer.ts` from Canvas `addCanvas` to Phaser `Graphics.generateTexture` (compatible with Phaser 3.90)
- Fixed race condition: ObjectManager now only initializes after scene restart (gated by `avatarDataURL`)
- Added error handling with `try/catch` in `ObjectManager.init()`

### 3. Camera zoom 2x (Enhancement)
- Added `this.cameras.main.setZoom(2)` in `MainScene.ts` for better pixel-art visibility

### 4. Fix: Player size to match assets (Bug Fix)
- Changed player scale from hardcoded `0.5` to `TILE_SIZE / img.width` (192px avatar → 32px sprite)

### 5. Player name input (Feature)
- Added name text input to `CharacterCreator.tsx` (max 16 chars, defaults to "Guest")
- Passed `playerName` through EventBus → `App.tsx` → `GameView.tsx` → `MainScene.ts`
- Replaced hardcoded "You" label with player's chosen name

### 6. Reduce name label size (Enhancement)
- Shrunk in-game name font from 12px to 7px, reduced padding and offset to fit 2x zoom

### 7. Fullscreen toggle (Feature)
- Added "Fullscreen" button to `GameView.tsx` toolbar
- Clicking toggles browser fullscreen on the game wrapper (game + interaction overlay)
- Uses native `requestFullscreen` / `exitFullscreen` API

### 8. Fix: Slow border resize on game start (Bug Fix)
- Eliminated scene restart pattern — `MainScene` now receives `avatarDataURL` and `playerName` via constructor instead of `scene.scene.restart()`
- Game boots once with all data ready, removing the visible shrink/resize flash
- Added `cameras.main.centerOn()` to snap camera to player position instantly before enabling smooth follow (prevents slow pan from origin)

### 9. Multiplayer — Other Players Can Connect to Same Room (Feature)
- **Server** (`apps/server/src/index.ts`): Fixed CORS to accept any `localhost:*` port; added `Map<string, PlayerData>` for player tracking; full protocol: `player:join` → `players:existing` + `player:joined`, `player:move` → `player:moved`, disconnect → `player:left`
- **Client dependency**: Installed `socket.io-client` in `apps/client`
- **NetworkService** (`apps/client/src/core/network/NetworkService.ts`): Singleton wrapping socket.io-client with typed events, throttled `sendMove()` (10/sec, skips if position unchanged), `connect()`/`disconnect()`/`joinGame()` lifecycle
- **RemotePlayerManager** (`apps/client/src/features/world/RemotePlayerManager.ts`): Manages remote player sprites + name labels, lerp interpolation (0.15/frame) for smooth movement, texture cleanup on removal
- **MainScene** wiring: Subscribes to all network events in `create()`, sends position in `update()`, cleans up on `shutdown`
- **GameView** wiring: Calls `networkService.connect()` on mount, `disconnect()` on unmount

### 10. Fix: Server dev script (Bug Fix)
- Switched `apps/server/package.json` dev script from `ts-node --esm` to `tsx` (fixes `ERR_UNKNOWN_FILE_EXTENSION` on Node 20)
- Installed `tsx` as devDependency

### 11. Git init + push to GitHub (Setup)
- Initialized git repo, added `.gitignore` (node_modules, dist, .env, .DS_Store, .obsidian)
- Created initial commit with full project
- Published to https://github.com/NaphatPound/gather-town

### 12. Dockerize for Deployment (Feature)
- **NetworkService** (`apps/client/src/core/network/NetworkService.ts`): Changed hardcoded `io("http://localhost:3001")` → `io(import.meta.env.VITE_SERVER_URL || "")` so Socket.io connects to same origin in production
- **Server** (`apps/server/src/index.ts`): Added production mode (`NODE_ENV=production`) — serves client static files via `express.static`, SPA catch-all route for client-side routing, CORS only enabled in dev
- **Dockerfile**: Multi-stage build (client-build → server-build → production) using `node:20-alpine`, single container serves everything on port 3001
- **docker-compose.yml**: Single service, maps port 3001
- **.dockerignore**: Excludes node_modules, dist, .git, .obsidian, markdown docs, Research, Resources

## Session — 2026-02-18 (Docker Fix)

### 1. Fix: Docker CLI not in PATH (Bug Fix)
- Docker Desktop was installed at `/Users/administrator/Desktop/program/Docker.app` but the symlink at `/usr/local/bin/docker` pointed to the old location (`/Users/administrator/Desktop/Docker.app`)
- Resolved by prepending the correct path to `$PATH` for Docker commands

### 2. Fix: Dockerfile npm ci auth failure with private Nexus registry (Bug Fix)
- `npm ci` inside Docker failed with `E401 Unable to authenticate, need: BASIC realm="Sonatype Nexus Repository Manager"`
- Root cause: The host machine uses a global `~/.npmrc` with a private Nexus registry + auth token, which Docker builds don't have access to
- Created project-level `.npmrc` with registry config
- Updated `Dockerfile`: added `COPY .npmrc /root/.npmrc` before `npm ci` and `RUN rm -f /root/.npmrc` after install in all 3 stages (client-build, server-build, production) so the token doesn't persist in the final image
- Added `.npmrc` to `.gitignore` to keep auth token out of the repository

### 3. Commit & push to GitHub (Setup)
- Committed Dockerfile and .gitignore changes as `9d056bb`
- Pushed to `main` on https://github.com/NaphatPound/gather-town

## Session — 2026-02-18 (Ball Feature)

### 1. Kickable Ball (Feature)
- New file: `BallEntity.ts` — pixel-art red ball (16x16) with physics: velocity, friction (0.97/frame), wall bounce (25% energy loss), kick detection (< 20px proximity → 220 px/s kick)
- Wired into `MainScene.ts`: spawns at tile (5,5), updated each frame with player position, destroyed on shutdown
- No button required — walking into the ball kicks it in the opposite direction

## Session — 2026-02-18 (Football Field)

### 1. Football Field with Goals & Scoreboard (Feature)
- **Map expansion**: `MAP_WIDTH` from 20 → 40; town (x=0-19) unchanged, football field (x=20-39) added to the right
- **Town opening**: Right wall at x=19 opened at y=6-8 to connect town and field
- **Field tiles**: Added `tile-fieldgrass` (darker green), `tile-goal-left` (net + blue tint), `tile-goal-right` (net + red tint) procedural textures
- **New tile types**: 4 = goal_left (x=20, y=5-9), 5 = goal_right (x=39, y=5-9) — walkable, trigger scoring
- **Goal posts**: Walls at (20,4), (20,10), (39,4), (39,10)
- **Field lines**: Center line, center circle, penalty areas, goal area boxes drawn via Phaser Graphics at depth 1
- **Ball relocated**: Spawn moved from (5,5) → (30,7) center of field
- **Goal detection** (`BallEntity.ts`): Ball entering tile type 4 → right team scores; type 5 → left team scores; ball resets to center (30,7); 1-second cooldown prevents double-counting
- **EventBus**: Added `GOAL_SCORED` event
- **ScoreBoard** (`components/ScoreBoard.tsx`): React overlay showing `LEFT 0 - 0 RIGHT` with pixel-art font; listens to `GOAL_SCORED` via EventBus; glow flash animation on scoring side
- **GameView**: Added `<ScoreBoard />` to game wrapper

### 2. Spacebar Charge Kick (Feature)
- **MainScene.ts**: Added spacebar input, facing direction tracking, charge state (0→1), charge bar UI (yellow→red gradient under player)
- **BallEntity.ts**: Added `chargedKick(dirX, dirY, charge, playerX, playerY)` method — kicks ball in player's facing direction with variable power
- Charge rate: **1.2/s when standing still** (fast), **0.35/s when moving** (slow) — rewards positioning
- Kick power scales from 250 px/s (tap) to 550 px/s (full charge)
- Charged kick range: 40px (double the walk-kick range of 20px)
- Walk-into-ball kick (220 px/s) still works as a light tap

### 3. Shift to Sprint (Feature)
- Hold Shift to run at 280 px/s (normal: 160 px/s)

### 4. Spawn Point Moved (Enhancement)
- Player spawn moved from (10,7) → (17,7) — right in front of the field entrance

## Session — 2026-02-18 (Sprite Sheet Animation)

### 1. Sprite Sheet Animation — Walk, Run, Kick (Feature)
- **New file: `drawAvatar.ts`** — Extracted `drawPixelBody`, `drawPixelOutfit`, `drawPixelHair`, `drawPixelAccessory`, `shadeColor` from `AvatarRenderer.tsx` into shared module; added `LimbOffsets` interface to `drawPixelBody` and `drawPixelOutfit` for arm/leg position offsets
- **Modified: `AvatarRenderer.tsx`** — Now imports draw functions from `../drawAvatar` instead of defining them locally; no behavior change in character creator preview
- **New file: `SpriteSheetGenerator.ts`** — Generates 384×32 canvas (12 frames × 32px) at runtime using avatar store state and draw functions with per-frame limb offsets; defines frame configs for idle(1), walk(4), run(4), kick(3)
- **Modified: `MainScene.ts`** — Replaced static avatar image loading with async `loadSpriteSheet()` that registers a Phaser spritesheet + 4 animations (`player-idle`, `player-walk`, `player-run`, `player-kick`); added `playerState` field for state machine; animation transitions in `update()` based on movement/shift/kick; kick is one-shot (returns to idle on `animationcomplete`); sprite flips horizontally via `setFlipX` based on movement direction
