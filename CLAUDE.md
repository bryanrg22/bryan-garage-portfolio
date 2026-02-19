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
- `public/models/` — Draco-compressed GLB files
- `public/images/` — Organized subdirectories for portfolio content images (`experience/`, `projects/`, `soccer/`, `hackathons/`, `awards/`, `home/`, `breaAutoBody/`, `orgs/`, `skills/`) plus root-level logo/flag textures for garage signs
- `public/concrete_floor/` — PBR texture set for the garage floor (color, normal, roughness)
- `public/chipboard_wall/` — PBR texture set for the garage walls (color, normal, roughness)

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

- **Draco decoder:** Set globally via `useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')`
- **GLB models** are lazy-loaded in three priority tiers to manage GPU load (defined in `loadTiers` in `GarageScene.tsx`)
- **Fallback geometry:** `InteractiveObject` renders custom Three.js mesh geometry when no GLB child is provided
- **Invisible hitbox:** GLB models include a hidden `boxGeometry` mesh for reliable pointer event capture
- **WebGL context loss** is handled in `GarageScene.tsx` by remounting the canvas via `sceneKey` state
- **Render exceptions:** `CarLift` and `NissanGTR` are rendered as standalone decorative groups (not interactive) in `SceneContent`, gated by `quality.showHeavyModels` and `allowedIds` from the load tier system
- **Boombox Spotify embed:** Music playback uses a persistent architecture to survive panel close. `SpotifyPlayer.tsx` (rendered in `App.tsx`) owns the Spotify iframe and a "Now Playing" pill. The iframe is shown when the boombox panel is open OR `isMusicPlaying` is `true`. When the panel is open, the iframe overlays the content area via fixed positioning; when closed but music is playing, it's moved off-screen (`left: -9999px`) to keep audio alive. The iframe has a 1-second reveal delay (`REVEAL_DELAY`) so it only appears after the camera fly-in animation completes. `isMusicPlaying` is detected via `postMessage` listener — the Spotify embed sends `playback_update` events with `isPaused: false` when a track actually starts playing. Opening the boombox without playing a song won't trigger the "Now Playing" pill. On mobile, the iframe wrapper reads `isBottomSheetExpanded` from the store to match the bottom sheet height (70vh default, 85vh expanded). `InfoPanel.tsx` renders a spacer `<div>` instead of the iframe for the boombox branch. The "Now Playing" pill (bottom-left) appears when music plays in the background and lets users reopen the boombox or stop playback. Tags and links are suppressed for the boombox item.
- **Social logos** (LinkedIn, GitHub) in `Garage.tsx` open URLs directly via `window.open()` — they bypass `InteractiveObject` and the Zustand store
- **GPU-tier quality scaling:** `detect-gpu` runs at module scope (`src/lib/gpuTier.ts`) and maps GPU tier 0–1 → low, 2 → mid, 3 → high. The `qualityConfig` in Zustand drives all rendering decisions: DPR, shadows, antialias, environment map, particles, decorative GLB loading, point light count, and ShopLight point lights. Defaults to `mid` before detection resolves and on detection failure.
- **Decorative GLB tiers:** 9 pure-decorative GLBs (RedBullCan, RetroOil, WD40, DirtyRag, TrashCan, Bucket, CarJack, AirCompressor, ExtensionCord) load only on `high`. 7 semi-decorative GLBs (FifaTrophy, GoldTrophy, MLBTrophy, PythonLogo, JavaLogo, ReactLogo, GarageTools) load on `mid`+`high`. 7 essential GLBs (NvidiaLogo, AmazonLogo, MexicanFlag, WorkbenchModel, LinkedInLogo, GitHubLogo, ResumePaper) always load.
- **Canvas performance flags:** DPR, shadows, and antialias are set from `qualityConfig` (not hardcoded). `powerPreference: 'high-performance'`, shadow maps at 512px, fog hides distant geometry
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

- **Integration:** `posthog-js` initialized in `src/lib/analytics.ts`, React provider in `src/main.tsx`
- **Wrapper:** `src/lib/analytics.ts` exports `trackEvent()` and `setUserProps()` — all other files use these helpers instead of importing `posthog-js` directly
- **Custom events:** `portfolio_item_viewed` (with `item_id`, `item_title`, `source`), `portfolio_item_closed` (with `item_id`, `item_title`), `music_started`, `music_stopped`
- **Source tracking:** `portfolio_item_viewed` includes `source: '3d_click' | 'mobile_tab'` to distinguish navigation method
- **User properties:** `gpu_tier` (`low`/`mid`/`high`) set as a PostHog person property after GPU detection
- **Environment:** Requires `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` in `.env` (see `.env.example`)
- **No-op in dev:** Analytics is silently disabled when no key is set — no crashes, no errors
- **Auto-captured by PostHog:** Page views, device type, browser, OS, country, referrer

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

- **`dist/` is committed to the repo** — it is NOT in `.gitignore`. Built output and duplicated GLB/image assets are tracked in git.
- **~40MB of GLB assets** in `public/models/` — cloning the repo is heavy.
- **Unused dependencies:** `lenis` and `@gsap/react` are in `package.json` but never imported anywhere in `src/`. They are dead weight.
- **Orphaned assets:** `public/models/` contains unused GLBs (`cardboard_boxes.glb`, `cpp_logo.glb`, `globe.glb`, `license_plate.glb`, `2020_kia_soul.glb`) not referenced by any component.
- **`ErrorBoundary`** wraps only the 3D canvas, not the UI overlays. Its fallback shows a reload button with a WebGL compatibility hint.
- **Mobile:** `InfoPanel` goes full-width on small screens (`w-full` → `md:w-[420px]`).
- **No garage door:** The `GarageDoor` component was removed from `Garage.tsx`. The garage is open-air.

## Adding a New Portfolio Item

1. Add entry to `portfolioItems` in `src/data/portfolio.ts` with required fields: `id`, `objectName`, `title`, `subtitle`, `description`, `position`, `color`, `cameraPosition`, `cameraTarget`. Optionally add `mobileCameraPosition` if the default camera is too close on mobile portrait.
2. If using a 3D model:
   a. **Compress the GLB with Draco first** — raw GLB files are too large to use directly. Use `gltf-transform` or the [glTF Draco compressor](https://gltf.report/) to apply Draco compression before adding to the project.
   b. Place the compressed `.glb` file in `public/models/`.
   c. Create a loader component in `src/components/Scene/objects/`.
   d. Register the loader in the `GLBChild` switch in `GarageScene.tsx`.
   e. Add the item's id to the appropriate load tier in `loadTiers`.
3. If the model is purely decorative (not interactive), add it to `Garage.tsx` and wrap it in the appropriate quality tier conditional (`quality.showPureDecorative` or `quality.showSemiDecorative`). Essential models that must always be visible should render unconditionally.
4. If not using a GLB, add a geometry case in `InteractiveObject.tsx` (`useObjectShape` + `ObjectGeometry`).
