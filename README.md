# Garage Portfolio

An immersive 3D portfolio experience built as an interactive auto body garage.

<img width="1512" height="860" alt="Garage Portfolio" src="https://github.com/user-attachments/assets/afe2bcd8-0df8-4964-ad8c-912fe8a04458" />

**Live site:** [bryanramirezgonzalez.com](https://bryanramirezgonzalez.com)

---

## Why a 3D Garage?

My family runs [Brea Auto Body](https://bryanramirezgonzalez.com), a collision repair shop in Southern California. I grew up around cars, tools, and the hum of a working garage. This portfolio recreates that environment in 3D — every object you click (the workbench, the toolbox, the boombox) maps to a real section of my story: experience, projects, skills, cultura, and more.

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

- Website: [bryanramirezgonzalez.com](https://bryanramirezgonzalez.com)
- LinkedIn: [@bryanrg22](https://linkedin.com/in/bryanrg22)
- GitHub: [@bryanrg22](https://github.com/bryanrg22)

[React]:       https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB
[TypeScript]:  https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white
[Vite]:        https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white
[Three.js]:    https://img.shields.io/badge/three.js-black?style=for-the-badge&logo=three.js&logoColor=white
[TailwindCSS]: https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[GSAP]:        https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white
