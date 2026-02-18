# Garage Portfolio

An immersive 3D portfolio experience built as an interactive auto body garage. Visitors explore Bryan Ramirez-Gonzalez's work, projects, and story by clicking on objects scattered around a detailed garage scene. Each object triggers a cinematic camera fly-in and reveals a content panel.

**Live site:** [bryanramirezgonzalez.com](https://bryanramirezgonzalez.com)

## Tech Stack

- **React 19** + **TypeScript** + **Vite 7**
- **Three.js** via React Three Fiber + Drei
- **Tailwind CSS v4** (theme tokens in CSS, no config file)
- **GSAP** for camera animations
- **Zustand** for state management
- **Motion** (Framer Motion) for UI transitions
- **detect-gpu** for adaptive quality scaling

## Features

- **Interactive 3D garage** — click on objects to explore portfolio sections (experience, projects, skills, education, awards, hackathons, cultura, soccer, and more)
- **Cinematic camera system** — smooth GSAP-powered fly-in animations with parallax idle movement
- **GPU-adaptive rendering** — automatically detects hardware capability and scales quality (low/mid/high) for shadows, model count, particle effects, and pixel ratio
- **Mobile-first touch controls** — swipe-to-look rotation in portrait mode with momentum and inertia
- **Spotify integration** — persistent boombox music player that survives panel navigation
- **Progressive model loading** — GLBs load in priority tiers to minimize initial load time
- **Real loading progress** — tracks actual asset downloads via drei's useProgress
- **Responsive design** — scrollable tab bar on mobile, side panel on desktop

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

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type-check + production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Project Structure

```
src/
  components/
    Scene/          # 3D scene (Canvas, Garage, Camera, interactive objects)
    UI/             # 2D overlays (InfoPanel, TopBar, TabBar, LoadingScreen)
  data/
    portfolio.ts    # All portfolio content, camera positions, and metadata
  stores/
    useStore.ts     # Zustand store (activeItem, qualityConfig, music state)
  lib/
    gpuTier.ts      # GPU detection and quality tier configuration
  hooks/            # Custom hooks (useIsMobile, useIsPortrait)
public/
  models/           # Draco-compressed GLB 3D models
  images/           # Portfolio content images organized by section
  concrete_floor/   # PBR floor textures
  chipboard_wall/   # PBR wall textures
```

## Quality Tiers

The site automatically adapts rendering quality based on GPU capability:

| Setting | Low | Mid | High |
|---------|-----|-----|------|
| Pixel Ratio | 1 | up to 1.5 | up to 1.25 |
| Shadows | Off | On | On |
| Environment Map | Off | On | On |
| Particles | Off | On | On |
| Decorative Models | Essential only | +Semi-decorative | All models |
| Point Lights | 1 | 3 | 3 |

## Deployment

The project is deployed on **Vercel**. Pushing to the main branch triggers an automatic build and deploy.
