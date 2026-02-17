# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An immersive 3D portfolio built as an interactive auto body garage scene. Visitors explore Bryan Ramirez-Gonzalez's portfolio (projects, hackathons, soccer, skills, experience, awards, education, home, cultura, about/Brea Auto Body, boombox) by clicking on garage objects. Each object triggers a smooth camera fly-in and opens a side panel with details.

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

- `src/components/Scene/` — 3D scene: `GarageScene.tsx` (canvas + GLB loading), `Garage.tsx` (procedural geometry + signs), `CameraController.tsx` (GSAP camera), `objects/` (per-model GLB loaders + `InteractiveObject.tsx` wrapper)
- `src/components/UI/` — 2D overlay: `TopBar`, `InfoPanel`, `BackButton`, `HintText`, `LoadingScreen`
- `src/lib/gpuTier.ts` — GPU detection + quality config definitions (low/mid/high tiers)
- `src/stores/useStore.ts` — Zustand store: `activeItem`, `hasInteracted`, `isLoaded`, `qualityConfig`
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
- **Boombox Spotify embed:** Music playback uses a persistent architecture to survive panel close. `SpotifyPlayer.tsx` (rendered in `App.tsx`) owns the Spotify iframe and a "Now Playing" pill. The iframe is mounted whenever Zustand's `isMusicPlaying` is `true`. When the boombox panel is open, the iframe overlays the panel content area via fixed positioning; when closed, it's moved off-screen (`left: -9999px`) to keep audio alive. `InfoPanel.tsx` renders a spacer `<div>` instead of the iframe for the boombox branch, and uses the standard panel width (`md:w-[420px]`). The "Now Playing" pill (bottom-left) appears when music plays in the background and lets users reopen the boombox or stop playback. Tags and links are suppressed for the boombox item.
- **Social logos** (LinkedIn, GitHub) in `Garage.tsx` open URLs directly via `window.open()` — they bypass `InteractiveObject` and the Zustand store
- **GPU-tier quality scaling:** `detect-gpu` runs at module scope (`src/lib/gpuTier.ts`) and maps GPU tier 0–1 → low, 2 → mid, 3 → high. The `qualityConfig` in Zustand drives all rendering decisions: DPR, shadows, antialias, environment map, particles, decorative GLB loading, point light count, and ShopLight point lights. Defaults to `mid` before detection resolves and on detection failure.
- **Decorative GLB tiers:** 9 pure-decorative GLBs (RedBullCan, RetroOil, WD40, DirtyRag, TrashCan, Bucket, CarJack, AirCompressor, ExtensionCord) load only on `high`. 7 semi-decorative GLBs (FifaTrophy, GoldTrophy, MLBTrophy, PythonLogo, JavaLogo, ReactLogo, GarageTools) load on `mid`+`high`. 7 essential GLBs (NvidiaLogo, AmazonLogo, MexicanFlag, WorkbenchModel, LinkedInLogo, GitHubLogo, ResumePaper) always load.
- **Canvas performance flags:** DPR, shadows, and antialias are set from `qualityConfig` (not hardcoded). `powerPreference: 'high-performance'`, shadow maps at 512px, fog hides distant geometry
- **InstancedMesh** is used in `Garage.tsx` for `CorrugatedWall` ridges (single draw call for repeated geometry)
- **Texture preloading:** `useTexture.preload()` is called at module scope in `Garage.tsx` to eagerly load floor and wall textures
- **PBR textures:** `ConcreteFloor` uses a concrete PBR set for the floor; `CorrugatedWall` uses a chipboard/plywood PBR set (color, normal, roughness) with per-wall texture repeat via `useMemo` cloning
- **Loading screen:** `LoadingScreen` uses drei's `useProgress` to track real asset download progress. Dismisses when `progress >= 100` AND `isLoaded` (WebGL context created via `onCreated`)

### Animations

- **Camera transitions:** GSAP timelines with `power3.inOut` easing, 1.2s duration
- **UI components:** `motion/react` (`AnimatePresence` + `motion.*`) for entrance/exit
- **Hover scale:** `useFrame` lerp on `THREE.Vector3` scale
- **Idle parallax:** Mouse tracking in `CameraController` when no item is focused

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
- **Mobile:** `InfoPanel` goes full-width on small screens (`w-full` → `md:w-[420px]`). No touch-specific parallax — idle camera parallax only responds to `mousemove`.

## Adding a New Portfolio Item

1. Add entry to `portfolioItems` in `src/data/portfolio.ts` with required fields: `id`, `objectName`, `title`, `subtitle`, `description`, `position`, `color`, `cameraPosition`, `cameraTarget`.
2. If using a 3D model:
   a. **Compress the GLB with Draco first** — raw GLB files are too large to use directly. Use `gltf-transform` or the [glTF Draco compressor](https://gltf.report/) to apply Draco compression before adding to the project.
   b. Place the compressed `.glb` file in `public/models/`.
   c. Create a loader component in `src/components/Scene/objects/`.
   d. Register the loader in the `GLBChild` switch in `GarageScene.tsx`.
   e. Add the item's id to the appropriate load tier in `loadTiers`.
3. If the model is purely decorative (not interactive), add it to `Garage.tsx` and wrap it in the appropriate quality tier conditional (`quality.showPureDecorative` or `quality.showSemiDecorative`). Essential models that must always be visible should render unconditionally.
4. If not using a GLB, add a geometry case in `InteractiveObject.tsx` (`useObjectShape` + `ObjectGeometry`).
