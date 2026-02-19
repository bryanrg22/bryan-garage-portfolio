# Garage Portfolio

An immersive 3D portfolio experience built as an interactive auto body garage.

<img width="1512" height="860" alt="Garage Portfolio" src="public/README_image/garage_photo.png" />

**Live site:** [bryanram.com](https://bryanram.com)

---

## Why a 3D Garage?

My dad works at Brea Auto Body, a collision repair shop in Southern California. I started working there at 15 during the pandemic to help bring more money home for my family. I grew up around cars, tools, and the hum of a working garage — so this portfolio recreates that environment in 3D. Every object you click (the workbench, the toolbox, the boombox) maps to a real section of my story: experience, projects, skills, cultura, and more.

---

## Tech Stack

![React] ![TypeScript] ![Vite] ![Three.js] ![TailwindCSS] ![GSAP]

- **React 19** + **TypeScript** + **Vite 7**
- **Three.js** via React Three Fiber + Drei
- **Tailwind CSS v4** (theme tokens in CSS, no config file)
- **GSAP** for camera animations
- **Zustand** for state management
- **Motion** (Framer Motion) for UI transitions
- **detect-gpu** for adaptive quality scaling

---

## Features

- **Interactive 3D garage** — click on objects to explore portfolio sections (experience, projects, skills, education, awards, hackathons, cultura, soccer, and more)
- **Cinematic camera system** — smooth GSAP-powered fly-in animations with parallax idle movement
- **GPU-adaptive rendering** — automatically detects hardware capability and scales quality (low/mid/high) for shadows, model count, particle effects, and pixel ratio
- **Mobile-first touch controls** — swipe-to-look rotation in portrait mode with momentum and inertia
- **Spotify integration** — persistent boombox music player that survives panel navigation
- **Progressive model loading** — GLBs load in priority tiers to minimize initial load time
- **Real loading progress** — tracks actual asset downloads via drei's useProgress
- **Responsive design** — scrollable tab bar on mobile, side panel on desktop

---

## GPU-Adaptive Rendering

The garage scene ships ~40 MB of Draco-compressed GLB models, PBR textures, shadow maps, and particle effects. To make it run smoothly on everything from integrated-GPU laptops to dedicated graphics cards, the site uses `detect-gpu` at startup to classify hardware into three quality tiers and automatically scales rendering accordingly:

| Setting | Low | Mid | High |
|---------|-----|-----|------|
| Pixel Ratio | 1 | up to 1.5 | up to 1.25 |
| Shadows | Off | On | On |
| Environment Map | Off | On | On |
| Particles | Off | On | On |
| Decorative Models | Essential only | +Semi-decorative | All models |
| Point Lights | 1 | 3 | 3 |

---

## Performance Engineering

Shipping a 3D scene with ~40 MB of assets to a browser demands careful optimization at every layer — assets, rendering, React, network, and delivery. Here's how the garage stays smooth and battery-friendly.

### Asset Optimization

- **Draco compression** on all GLB models (80–90% mesh size reduction)
- Draco decoder served from **Google CDN** — likely already cached from other Three.js sites
- **1K PBR textures** for good fidelity at low VRAM footprint (~4 MB each uncompressed in GPU memory)
- **WebP format** for applicable textures
- **Texture tiling** — a single 1K texture repeated 8x8 across the floor instead of a massive bespoke texture

### Progressive Model Loading

- **3-tier sequential loading** with GPU breathing room between tiers
  - Tier 0 (500 ms): small models first
  - Tier 1 (+1500 ms): medium models
  - Tier 2 (+1500 ms, HIGH GPU only): heaviest model (~15 MB)
- **Suspense fallbacks** render `null` while GLBs stream — no broken meshes
- Procedural geometry (walls, floor, signs) renders immediately — it's code-generated, not downloaded

### Rendering Pipeline

- **DPR capping** prevents 2x/3x retina rendering — a 4x difference in fragment shader work
- **Shadow maps at 512x512** keep shadow texture VRAM low
- **Fog (6–22 units)** hides distant geometry, reducing effective rendering area
- `powerPreference: 'high-performance'` requests the discrete GPU on multi-GPU laptops
- Antialias and shadows **disabled entirely** on low-tier GPUs

### Draw Call Reduction

- **InstancedMesh** for corrugated wall ridges — ~280 individual boxes consolidated into 5 draw calls
- Invisible hitbox meshes use `meshBasicMaterial` (no lighting shader) instead of `meshStandardMaterial`
- Low polygon counts on non-focal background props (8–16 segments vs default 32)

### React Performance

- **Zustand selectors** prevent over-rendering — each component subscribes only to the state it needs
- All per-frame animation logic uses **refs** (not state) to avoid React re-renders
- Direct Three.js object mutation in `useFrame` **bypasses the React reconciler** entirely
- `useCallback`/`useMemo` on handlers and computed values for stable prop references
- Module-scope `useTexture.preload()` warms the texture cache before React mounts

### Mobile Optimization

- Native Three.js mesh dots instead of DOM-projected HTML labels (cheaper rendering)
- **Passive touch listeners** (`{ passive: true }`) — browser scrolls immediately without waiting for JS
- `touch-action: manipulation` eliminates the 300 ms tap delay
- Per-item `mobileCameraPosition` overrides for proper framing on small viewports
- Bottom sheet appears after 1250 ms delay to not obstruct camera fly-in animation

### Demand-Driven Rendering

The canvas uses `frameloop="demand"` — it only renders when something visually changes, instead of burning GPU at 60 fps while idle.

- **Page Visibility API** pauses all rendering when the browser tab is hidden
- **Desktop idle: 0 fps** when the mouse isn't moving and no interaction is happening
- **Mobile: 30 fps cap** for pulse animations (visually identical to 60 fps for slow sine waves, half the GPU work) — fully paused when the tab is backgrounded
- GSAP camera animations drive frame rendering via `onUpdate` callbacks
- **Epsilon-based convergence detection** stops rendering once hover/parallax lerps settle within threshold
- All friction and lerp factors are **time-based** (`Math.pow` normalization) so animations feel identical at any framerate

### Network Resilience

- Loading screen **dual-gate**: won't dismiss until all assets are downloaded AND WebGL context is created
- **WebGL context loss recovery** — `contextlost` allows restoration, `contextrestored` remounts the canvas
- `ErrorBoundary` wraps the 3D canvas (not UI) — UI stays functional if WebGL crashes
- Broken image fallbacks in panels — `onError` hides images instead of showing broken icons
- Inline CSS background color prevents white flash before JS loads

### Build & Delivery

- Font `preconnect` hints for Google Fonts (DNS/TLS handshake starts early)
- `font-display: swap` — text visible immediately, custom fonts swap in later
- Vite tree-shaking removes unused code
- Tailwind CSS v4 emits only used utility classes

---

## Sections

| Section | Garage Object | Content |
|---------|--------------|---------|
| Experience | Workbench | Professional work history |
| Projects | Macbook | Software projects with tech stacks |
| Skills | Toolbox | Technical skill categories |
| Education | Diploma Wall | Academic background |
| Awards | Trophy Shelf | Competitions and recognitions |
| Hackathons | Lab Flask | Hackathon participations |
| Cultura | Mexican Flag | Cultural heritage and identity |
| Soccer | Soccer Ball | Soccer career and highlights |
| Brea Auto Body | Info Sign | About the garage / creator |
| Origin | House | California and Azusa roots |
| Music | Boombox | Spotify playlist player |

---

## About Me

**Bryan Ramirez-Gonzalez** — First-gen Latino, Undergrad Honors CS @ USC '28, 3x Hackathon Winner

- Website: [bryanram.com](https://bryanram.com)
- LinkedIn: [@bryanrg22](https://linkedin.com/in/bryanrg22)
- GitHub: [@bryanrg22](https://github.com/bryanrg22)

[React]:       https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB
[TypeScript]:  https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white
[Vite]:        https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white
[Three.js]:    https://img.shields.io/badge/three.js-black?style=for-the-badge&logo=three.js&logoColor=white
[TailwindCSS]: https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[GSAP]:        https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white
