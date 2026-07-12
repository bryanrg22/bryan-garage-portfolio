# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An immersive 3D portfolio built as an interactive auto body garage scene. Visitors explore Bryan Ramirez-Gonzalez's portfolio (projects, hackathons, soccer, skills, experience, awards, education, home, cultura, about/Brea Auto Body, boombox) by clicking on garage objects. Each object triggers a smooth camera fly-in and opens a side panel with details.

**Live site:** [bryanram.com](https://bryanram.com)

Tech stack: **React 19 + TypeScript + Vite 7 + Three.js (via React Three Fiber) + Tailwind CSS v4 + GSAP + Zustand + Motion (Framer Motion)**

## Commands

```bash
npm run dev       # Start dev server (HMR)
npm run build     # Type-check (tsc -b) + production build (vite build) → dist/
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

No test runner is configured. Type checking (`tsc -b`) is the primary correctness tool.

## Architecture

Single-page 3D experience with no client-side router. Navigation is driven by `activeItem` state, not URLs.

### Data Flow

1. `src/data/portfolio.ts` defines all portfolio items with `id`, `position`, `cameraPosition`, `cameraTarget`, `color`, and content fields.
2. `GarageScene.tsx` renders each item as an `<InteractiveObject>` inside the R3F `<Canvas>`.
3. Clicking an object calls `useStore.setActiveItem(item)`.
4. `CameraController.tsx` reacts to `activeItem` changes via GSAP timelines to fly the camera.
5. `InfoPanel.tsx` reacts to `activeItem` to slide in the content panel.
6. Setting `activeItem` to `null` (via logo click, Back button, Escape key, or clicking empty space) resets the camera and closes the panel.

### Key Directories

- `src/components/Scene/` — 3D scene: `GarageScene.tsx` (canvas + GLB loading), `Garage.tsx` (procedural geometry + signs), `CameraController.tsx` (GSAP camera), `RenderController.tsx` (demand-driven rendering + Page Visibility API), `objects/` (per-model GLB loaders + `InteractiveObject.tsx` wrapper)
- `src/components/UI/` — 2D overlay: `TopBar`, `InfoPanel`, `BackButton`, `HintText`, `LoadingScreen`, `MobileTabBar`, `SpotifyPlayer`
- `src/lib/gpuTier.ts` — GPU detection + quality config definitions (low/mid/high tiers)
- `src/stores/useStore.ts` — Zustand store: `activeItem`, `hasInteracted`, `isLoaded`, `isMusicPlaying`, `isMobileNavOpen`, `isBottomSheetExpanded`, `qualityConfig`
- `src/data/portfolio.ts` — Portfolio content and camera presets
- `public/models/` — Optimized GLB files (Draco geometry + WebP embedded textures via `EXT_texture_webp`, ~15MB total)
- `public/draco/` — Self-hosted Draco decoder (copied from `three/examples/jsm/libs/draco/gltf`)
- `public/hdri/` — Self-hosted environment map (`empty_warehouse_01_1k.hdr`, drei's "warehouse" preset)
- `public/images/` — Organized subdirectories for portfolio content images (`experience/`, `projects/`, `soccer/`, `hackathons/`, `awards/`, `home/`, `breaAutoBody/`, `orgs/`, `skills/`) plus root-level logo/flag textures for garage signs
- `public/concrete_floor/` — PBR texture set for the garage floor (color, normal, roughness — WebP)
- `public/chipboard_wall/` — PBR texture set for the garage walls (color, normal, roughness — WebP)

## Key Patterns

### State Management (Zustand)

Single flat store in `src/stores/useStore.ts`. Always subscribe with selectors:

```ts
const activeItem = useStore((s) => s.activeItem)   // correct
const store = useStore()                             // avoid — causes over-rendering
```

### Styling (Tailwind CSS v4)

Configured via `@theme` in `src/index.css` — **no `tailwind.config.js`**. Key design tokens:

| Token | Value | Usage |
|---|---|---|
| `garage-dark` | `#1a1612` | Primary background |
| `garage-mid` | `#2a2420` | Panels, surfaces |
| `golden` | `#F4C963` | Primary accent, headlines |
| `golden-deep` | `#E8A838` | Hover states |
| `cream` | `#F5F0EB` | Body text |
| `stone` | `#8a7e72` | Secondary/muted text |
| `blue-accent` | `#5B9BD5` | Links, interactive highlights |

Fonts: `font-serif` = Playfair Display, `font-sans` = DM Sans (loaded from Google Fonts in `index.html`).

### 3D Scene (React Three Fiber)

- **Draco decoder:** Self-hosted at `public/draco/` and set globally via `useGLTF.setDecoderPath('/draco/')` (files copied from `three/examples/jsm/libs/draco/gltf` — avoids a DNS+TLS round-trip to gstatic.com on first model load)
- **GLB asset pipeline:** All GLBs are optimized with `gltf-transform`: embedded textures resized to ≤1024px and converted to WebP (`EXT_texture_webp`, natively supported by three's GLTFLoader), then Draco geometry compression. This cut `public/models/` from 36MB → 14MB — Draco alone only compresses geometry; the embedded PNG textures were the real payload. Pipeline for new models: `gltf-transform resize --width 1024 --height 1024 in.glb tmp.glb && gltf-transform webp tmp.glb tmp2.glb && gltf-transform draco tmp2.glb out.glb`
- **Environment map:** Self-hosted at `public/hdri/empty_warehouse_01_1k.hdr` (same file as drei's "warehouse" preset) and loaded via `<Environment files="/hdri/...">` — avoids a runtime fetch from raw.githack.com
- **GLB models** are lazy-loaded in three priority tiers to manage GPU load (defined in `loadTiers` in `GarageScene.tsx`)
- **Fallback geometry:** `InteractiveObject` renders custom Three.js mesh geometry when no GLB child is provided
- **Invisible hitbox:** GLB models include a hidden `boxGeometry` mesh for reliable pointer event capture
- **WebGL context loss** is handled in `GarageScene.tsx` by remounting the canvas via `sceneKey` state
- **Render exceptions:** `CarLift` and `NissanGTR` are rendered as standalone decorative groups (not interactive) in `SceneContent`, gated by `quality.showHeavyModels` and `allowedIds` from the load tier system. The GTR is a 1388-primitive / 22-material game rip — `NissanGTR.tsx` strips `KHR_materials_transmission` from its glass (transmission forces three.js into a hidden second render pass of the whole scene) and swaps in alpha-blended opacity. A runtime merge-by-material batching attempt rendered nothing and was reverted (see comments in the file); until the model is batched offline, `showHeavyModels` stays `false` on all mobile tiers.
- **Boombox Spotify embed:** Music playback uses a persistent architecture to survive panel close. `SpotifyPlayer.tsx` (rendered in `App.tsx`) owns the Spotify iframe and a "Now Playing" pill. The iframe is shown when the boombox panel is open OR `isMusicPlaying` is `true`. When the panel is open, the iframe overlays the content area via fixed positioning; when closed but music is playing, it's moved off-screen (`left: -9999px`) to keep audio alive. The iframe has a 1-second reveal delay (`REVEAL_DELAY`) so it only appears after the camera fly-in animation completes. `isMusicPlaying` is detected via `postMessage` listener — the Spotify embed sends `playback_update` events with `isPaused: false` when a track actually starts playing. Opening the boombox without playing a song won't trigger the "Now Playing" pill. On mobile, the iframe wrapper reads `isBottomSheetExpanded` from the store to match the bottom sheet height (70vh default, 85vh expanded). `InfoPanel.tsx` renders a spacer `<div>` instead of the iframe for the boombox branch. The "Now Playing" pill (bottom-left) appears when music plays in the background and lets users reopen the boombox or stop playback. Tags and links are suppressed for the boombox item.
- **Social logos** (LinkedIn, GitHub) in `Garage.tsx` open URLs directly via `window.open()` — they bypass `InteractiveObject` and the Zustand store
- **GPU-tier quality scaling** (`src/lib/gpuTier.ts`): desktop and mobile take different paths. **Desktop** starts at LOW and lets `detect-gpu`'s WebGL benchmark upgrade it (tier 0–1 → low, 2 → mid, 3 → high), time-boxed by a 2.5s `Promise.race` (detect-gpu can hang on misbehaving drivers) with LOW fallback on error/timeout; the Canvas is keyed on the tier so it remounts with the right `gl` flags after an upgrade. **Mobile** picks its final tier *synchronously* at module load from UA + devicePixelRatio (+ `deviceMemory` on Android) — iOS caps `hardwareConcurrency` for anti-fingerprinting and detect-gpu's benchmark competes for the same scarce GPU context, so the benchmark is skipped and the Canvas never remounts. All mobile tiers keep the full decorative set (empty-feeling scene otherwise) but disable shadows/antialias; what varies is DPR, environment, particles, lights. The `qualityConfig` in Zustand drives all rendering decisions: DPR, shadows, antialias, environment map, particles, decorative GLB loading, point light count, and ShopLight point lights.
- **Decorative GLB tiers:** 9 pure-decorative GLBs (RedBullCan, RetroOil, WD40, DirtyRag, TrashCan, Bucket, CarJack, AirCompressor, ExtensionCord) load only on `high`. 7 semi-decorative GLBs (FifaTrophy, GoldTrophy, MLBTrophy, PythonLogo, JavaLogo, ReactLogo, GarageTools) load on `mid`+`high`. 6 essential GLBs (NvidiaLogo, MexicanFlag, WorkbenchModel, LinkedInLogo, GitHubLogo, ResumePaper) always load.
- **Garage door intro:** `GarageDoor.tsx` renders a closed roll-up door across the front opening; when loading completes (vanilla zustand subscriptions on `useProgress` + the store — NOT React hooks, see comments in file) it rolls up via GSAP and unmounts. A module-level flag prevents replay on Canvas remounts.
- **Kickable soccer ball:** `objects/KickableSoccerBall.tsx` replaces `InteractiveObject` for the soccer item. Click/tap (< 10px movement) opens the story panel; drag-and-release flicks the ball with custom lightweight physics (gravity, wall/floor bounces, static box + cylinder colliders for immovable furniture, rolling friction) — no physics engine. Flick velocity is measured over a trailing 110ms sample window. Static colliders are tier-gated in a `useMemo` (car lift + GTR boxes only when `showHeavyModels`); collider boxes are **measured from the actual GLB geometry** (vertex-slicing script — see scratchpad notes), not eyeballed: the car lift is two tall posts against the right wall plus a low drive-on track between them, NOT a solid block (an earlier eyeballed mega-box walled off the tire/bucket corner and made those props unreachable). Movable objects are NOT in the static list — they're `KnockableProp`s which resolve their own ball collisions. The ball self-invalidates while moving (demand-frameloop friendly) and auto-rolls home after 4s at rest, floating in a small arc so the return path doesn't clip through objects. `lib/ballDrag.ts` is a shared flag so `CameraController` ignores touch gestures that started on the ball. Dev-only `window.__ball` hook (kick/pos/mode).
- **Knockable props:** `objects/KnockableProp.tsx` wraps movable objects — light cans/logos in `Garage.tsx` (WD-40, retro oil, bucket, trash can, both oil drums, both tire stacks, air compressor + car jack (roll/slide, `tippable={false}`), garage tools, Python/Java/React logos) and, in `GarageScene.tsx`, the boombox and skills toolbox (wrapped AROUND their `InteractiveObject`, which keeps them clickable; the item passed down gets `position: [0,0,0]` since the wrapper owns the transform). On impact the ball is pushed out and bounces (never interpenetrates) and the prop inherits velocity scaled by `massFactor` (cans 0.5–0.65 fly and tip; boombox 0.35 and toolbox 0.15 slide only, `tippable={false}`). Props also collide with EACH OTHER (`propBodies` registry in `lib/ballWorld.ts`): a moving prop separates overlaps and `wake()`s whatever it plows into, so a shoved toolbox pushes the floor logos along — chain reactions work. Shared state lives in `lib/ballWorld.ts`. Any displacement sets `isRoomDirty` → `ResetRoomButton` ("🧹 Tidy up the shop", bottom-right above the tab bar); clicking it GSAP-floats every displaced object (and the ball) back home with per-prop stagger, then hides itself. Dev hook: `window.__resetRoom`. (A former trash-can "goal + ¡GOOOOOL! celebration" feature was removed by request — the can is now just knockable.)
- **License plate:** `LicensePlate` in `Garage.tsx` draws a CA "BRG 2028" plate on a runtime canvas texture (zero download) — back wall above the Caltech logo.
- **Shop dog:** `objects/ShopDog.tsx` — an animated Quaternius CC0 Shiba Inu (`shiba_inu.glb`, 316KB, 12 baked clips). Wanders between hand-picked open-floor waypoints (walk → sniff → repeat 1-3 legs), then RESTS: while resting it schedules zero frames, preserving the demand-frameloop 0fps idle. Wakes on a random timer, on click (happy jump), or when the flying soccer ball comes within 1 unit (gallops to the waypoint farthest from the ball — free to check because frames already render while the ball moves). drei `useAnimations` drives the mixer; SkinnedMeshes get `frustumCulled = false` (moved-skeleton culling bug).
- **Shop parrot:** `objects/ShopParrot.tsx` — a PROCEDURAL yellow-headed Amazon (modeled on Bryan's real parrot: green body, yellow head, red carpal patches) built from ~10 sphere/cone/box primitives — zero download, always rendered on every tier. Perches on the back workbench fully static (schedules no frames — 0fps idle preserved). Takes off and flies two elliptical laps (y=3.3, clears the lift posts at 3.07) with sine-flapped wings when: (a) HAVOC — ball flying + `displacedCount() >= 3` props knocked over, (b) the ball passes within 1.1 units of the perch, or (c) it's clicked. Havoc checks run inside `useFrame` but cost nothing at idle — frames only render while the ball moves anyway. Self-invalidates only mid-flight; 8s cooldown between flights. `displacedCount()` lives in `lib/ballWorld.ts`. Dev hook: `window.__parrot` (fly/mode). Analytics: `parrot_flight` with `trigger`.
- **Project media showcase:** `ProjectEntry.media` (videos/images in `public/videos/` + `public/images/projects/`). Desktop: a frosted-glass showcase card (portal to body, centered in the space left of the 420px panel) shows the selected project's media with arrows + dots; visibility follows the live store (`activeItem?.id === 'projects'`) so it exits in lockstep with the sidebar; entrance is delayed 0.45s (delay on `animate` transition only — a delay on the shared `transition` prop would also delay the exit). Mobile: a horizontal snap-scroll `MediaStrip` inside each project card. The desktop panel now waits for the camera fly-in before sliding in (same derived-state pattern as the mobile sheet); `SpotifyPlayer`'s `REVEAL_DELAY` is 1700ms to sequence after it. Video pipeline: pull from the project's GitHub repo (`gh api -H "Accept: application/vnd.github.raw"` — repos are private), compress with `ffmpeg -crf 27 scale=-2:720 +faststart`.
- **Canvas performance flags:** DPR, shadows, and antialias are set from `qualityConfig` (not hardcoded). `powerPreference: 'default'` (earlier `'high-performance'` caused driver stalls on hybrid-GPU laptops), `failIfMajorPerformanceCaveat: true` (routes software-renderer fallback into the ErrorBoundary instead of a frozen 2fps scene), shadow maps at 512px, fog hides distant geometry. The Canvas is keyed on `${sceneKey}-${quality.tier}` (`GarageScene.tsx:146`) so it remounts when the detected tier upgrades from the LOW default to MID/HIGH — `gl` props are only read at context creation and can't be toggled later.
- **InstancedMesh** is used in `Garage.tsx` for `CorrugatedWall` ridges (single draw call for repeated geometry)
- **Texture preloading:** `useTexture.preload()` is called at module scope in `Garage.tsx` to eagerly load floor and wall textures
- **PBR textures:** `ConcreteFloor` uses a concrete PBR set for the floor; `CorrugatedWall` uses a chipboard/plywood PBR set (color, normal, roughness) with per-wall texture repeat via `useMemo` cloning
- **Loading screen:** `LoadingScreen` uses drei's `useProgress` to track real asset download progress. Dismisses when `progress >= 100` AND `isLoaded` (WebGL context created via `onCreated`)
- **Demand-driven rendering:** The Canvas uses `frameloop="demand"` — it only renders when `invalidate()` is called, instead of running at 60fps constantly. `RenderController.tsx` (rendered inside Canvas, returns `null`) handles two responsibilities: (1) Page Visibility API — calls `invalidate()` once when the tab becomes visible so the scene refreshes; when hidden, no invalidation = no rendering. (2) Mobile 30fps loop — runs a `requestAnimationFrame` loop throttled to 30fps (`1000/30` ms interval) that calls `invalidate()` to keep pulse animations running (sine waves look identical at 30fps, half the GPU work/heat); the loop checks `document.hidden` so it goes dormant when the tab is backgrounded. On desktop, `invalidate()` is called from: mouse/touch event handlers in `CameraController` (only when `mode.current === 'idle'` — no wasted renders while viewing panels or during GSAP animations), GSAP timeline `onUpdate` callbacks during camera animations (via `invalidateRef` to avoid stale closures and effect re-runs), and epsilon-based convergence checks in `useFrame` (parallax lerp in `CameraController`, scale lerp in `InteractiveObject`, `LinkedInLogo`, `GitHubLogo`, `ResumePaper`). Once all lerps settle within epsilon threshold (~0.001 for scale, ~0.0001 for parallax), no more `invalidate()` calls are made and the GPU goes fully idle at 0fps. All interactive components with `useFrame` hover animations (`InteractiveObject`, `LinkedInLogo`, `GitHubLogo`, `ResumePaper`) call `invalidate()` in their `onPointerOver`/`onPointerOut` handlers to kick off the lerp chain, and use module-level `THREE.Vector3` constants for scale targets to avoid per-frame GC allocation. `CameraController` uses `useThree` selectors (not full-store destructure) to prevent re-rendering on every frame, and caps `useFrame` delta at 100ms to prevent lerp overshoot after long idle gaps.
- **Time-based friction/lerps:** All per-frame friction and interpolation in `CameraController` uses `Math.pow` normalization against `delta * 60` so animations feel identical at any framerate (30fps mobile, 60fps desktop, 144hz monitors). Pattern: friction `Math.pow(0.92, dt60)`, lerp `1 - Math.pow(1 - factor, dt60)`. This is critical because the mobile render loop runs at 30fps — without time-based normalization, momentum would decay half as fast.

### Mobile

- **Tab bar:** `MobileTabBar.tsx` renders a horizontally scrollable tab bar in portrait mode. Tab order: Home, Work, Projects, Skills, Edu, Awards, Hacks, Cultura, Soccer, Brea, Origin, Music. Tapping a tab sets/clears `activeItem` via Zustand.
- **Bottom sheet:** `MobileBottomSheet` in `InfoPanel.tsx` uses `useBottomSheetDrag` hook with three snap states: `half` (70vh, default), `full` (85vh, dragged up), and `dismissed` (dragged down). Snap transitions are velocity-aware (fast swipes trigger snap). The current `snapState` is synced to the Zustand store as `isBottomSheetExpanded` so `SpotifyPlayer` can match the sheet height. Rubber-band resistance is applied when dragging past the full-screen boundary.
- **Portrait camera:** `CameraController` uses rotation-based swipe-to-look (Street View style) in portrait mode. Yaw range is ±12.5 degrees from center, pitch ±10 degrees. Touch sensitivity: horizontal 1.2x, vertical 0.6x. Includes momentum with 0.92 time-based friction decay (`Math.pow(0.92, delta * 60)`). Touches on UI overlays (`nav`, `button`, `InfoPanel`, `TopBar`) are ignored. Rotation resets when navigating back to home.
- **Landscape camera:** Position-based parallax (swipe shifts camera position, not rotation).
- **`mobileCameraPosition`:** Portfolio items can define an optional `mobileCameraPosition` in `portfolio.ts` for a different camera angle on mobile portrait (used by skills section to pull the camera back).

### Analytics (PostHog)

- **Integration:** `@posthog/react` `PostHogProvider` in `src/main.tsx` with `apiKey` and `options` props. API key and host are **hardcoded** directly in source (not env vars) — the key is public (visible in the JS bundle regardless), and env vars caused persistent caching/deployment issues with Vercel.
- **Config:** `defaults: '2026-01-30'` (PostHog recommended defaults), `api_host: 'https://us.i.posthog.com'` (US Cloud ingestion endpoint)
- **Wrapper:** `src/lib/analytics.ts` exports `trackEvent()` and `setUserProps()` — all other files use these helpers instead of importing `posthog-js` directly
- **Custom events:** `portfolio_item_viewed` (with `item_id`, `item_title`, `source`), `portfolio_item_closed` (with `item_id`, `item_title`), `music_started`, `music_stopped`
- **Source tracking:** `portfolio_item_viewed` includes `source: '3d_click' | 'mobile_tab'` to distinguish navigation method
- **User properties:** `gpu_tier` (`low`/`mid`/`high`) set as a PostHog person property after GPU detection
- **Auto-captured by PostHog:** Page views, clicks, device type, browser, OS, country, referrer
- **Key rotation gotcha:** If the API key is ever regenerated, users must **clear site data** (localStorage) in their browser — PostHog caches the token in localStorage and will keep sending the old one otherwise

### Animations

- **Camera transitions:** GSAP timelines with `power3.inOut` easing, 1.2s duration. `onUpdate` callback calls `invalidate()` to drive frame rendering during the tween.
- **UI components:** `motion/react` (`AnimatePresence` + `motion.*`) for entrance/exit
- **Hover scale:** `useFrame` lerp on `THREE.Vector3` scale with epsilon guard — self-schedules via `invalidate()` until settled, then stops
- **Desktop idle parallax:** Smooth mouse-follow parallax in `CameraController` when no item is focused. Epsilon convergence detection stops rendering once settled.

## TypeScript

Two tsconfigs in composite project mode:
- `tsconfig.app.json` — `src/`, ES2022, strict, `noUnusedLocals`, `noUnusedParameters`
- `tsconfig.node.json` — `vite.config.ts`, ES2023

Notable strict flags: `erasableSyntaxOnly` (no `enum` or `namespace` — use union types/objects instead), `verbatimModuleSyntax` (enforces `import type` for type-only imports). No path aliases — all imports use relative paths.

## ESLint

Flat config (`eslint.config.js`, ESLint v9). Plugins: `typescript-eslint`, `react-hooks`, `react-refresh`. Applies to `**/*.{ts,tsx}`, ignores `dist/`.

## GLB Loader Component Pattern

All interactive GLB loaders in `src/components/Scene/objects/` follow the same minimal structure:

```tsx
import { useGLTF } from '@react-three/drei'

export default function ModelName() {
  const { scene } = useGLTF('/models/filename.glb')
  return <primitive object={scene} scale={N} castShadow />
}
```

Scale and optional `rotation` vary per model. Decorative GLB loaders in `Garage.tsx` follow the same pattern but accept a `position` prop.

## Gotchas

- **`dist/` is gitignored** (build artifact only — not tracked in git).
- **~15MB of GLB assets** in `public/models/` (optimized July 2026: WebP embedded textures + Draco; was 36MB). Git history still carries the old binaries, so cloning is heavy.
- **Unused dependencies:** `lenis` and `@gsap/react` are in `package.json` but never imported anywhere in `src/`. They are dead weight.
- **Content images are WebP:** Gallery/award photos are capped at 1600px and served as `.webp` (converted with `cwebp -q 80`). New photos should follow the same convention.
- **`java_logo.glb` uses the legacy `KHR_materials_pbrSpecularGlossiness` extension** — three's GLTFLoader logs an "Unknown extension" warning for it and falls back to a default material.
- **Hidden-tab verification:** with `frameloop="demand"`, a hidden/backgrounded tab never fires rAF, so `onCreated` (→ `setIsLoaded`) and all animations stall until the tab becomes visible — this self-heals via the Page Visibility handler in `RenderController`. For automated/headless testing, load the site with `?forceRaf` — an inline script in `index.html` drives rAF via MessageChannel (not throttled when hidden). Inert without the query param.
- **Dev-only console hooks** (stripped from prod builds): `window.__store` (zustand store), `window.__ball` (soccer ball kick/pos/mode).
- **react-hooks v7 lint rules are compiler-based:** an `eslint-disable` for any react-hooks rule makes the compiler skip the whole component, masking other violations in that file. Mutate the camera via `useFrame((frame) => frame.camera...)`, not the `useThree` return; keep mutable vectors in lazily-initialized refs.
- **`ErrorBoundary`** wraps only the 3D canvas, not the UI overlays. Its fallback shows a reload button with a WebGL compatibility hint.
- **Mobile:** `InfoPanel` goes full-width on small screens (`w-full` → `md:w-[420px]`).
- **No garage door:** The `GarageDoor` component was removed from `Garage.tsx`. The garage is open-air.

## Adding a New Portfolio Item

1. Add entry to `portfolioItems` in `src/data/portfolio.ts` with required fields: `id`, `objectName`, `title`, `subtitle`, `description`, `position`, `color`, `cameraPosition`, `cameraTarget`. Optionally add `mobileCameraPosition` if the default camera is too close on mobile portrait.
2. If using a 3D model:
   a. **Optimize the GLB first** — raw GLB files are too large to use directly. Run the full pipeline: `gltf-transform resize --width 1024 --height 1024`, then `gltf-transform webp`, then `gltf-transform draco` (texture WebP conversion matters more than Draco — embedded PNG textures are usually most of the file size).
   b. Place the compressed `.glb` file in `public/models/`.
   c. Create a loader component in `src/components/Scene/objects/`.
   d. Register the loader in the `GLBChild` switch in `GarageScene.tsx`.
   e. Add the item's id to the appropriate load tier in `loadTiers`.
3. If the model is purely decorative (not interactive), add it to `Garage.tsx` and wrap it in the appropriate quality tier conditional (`quality.showPureDecorative` or `quality.showSemiDecorative`). Essential models that must always be visible should render unconditionally.
4. If not using a GLB, add a geometry case in `InteractiveObject.tsx` (`useObjectShape` + `ObjectGeometry`).
