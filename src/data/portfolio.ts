export interface ExperienceSubRole {
  company?: string
  role: string
  date: string
  description?: string
  bullets?: string[]
  links?: { label: string; url: string }[]
  logo?: string
  label?: string
}

export type ExperienceCategory = 'Tech' | 'Quant' | 'Research' | 'Entrepreneurship' | 'Leadership'

export interface ExperienceEntry {
  company: string
  role: string
  date?: string
  description?: string
  logo?: string
  label?: string
  subRoles?: ExperienceSubRole[]
  category?: ExperienceCategory
}

export interface SkillCategory {
  category: string
  skills: string[]
}

export interface ProjectMedia {
  type: 'video' | 'image' | 'youtube'
  /** file path for video/image; the YouTube video ID for youtube */
  src: string
  poster?: string
  caption: string
}

export interface ProjectEntry {
  name: string
  description: string
  achievement: string
  /** short recruiter-scannable domain label, e.g. 'AI Agents', 'Quant' */
  category: string
  techStack: string[]
  links?: { label: string; url: string }[]
  logo?: string
  /** Demo videos/screenshots shown in the desktop showcase + mobile media strip */
  media?: ProjectMedia[]
}

export interface AwardEntry {
  name: string
  description: string
  location: string
  year: number
  iconType: 'trophy' | 'medal' | 'award'
  photo?: string
  logo?: string
}

export interface HackathonEntry {
  name: string
  institution: string
  startDate: string
  endDate: string
  location: string
  status: string
  highlight?: string
  logo?: string
}

export interface PortfolioItem {
  id: string
  objectName: string
  title: string
  subtitle: string
  description: string
  tags?: string[]
  links?: { label: string; url: string }[]
  position: [number, number, number]
  color: string
  cameraPosition: [number, number, number]
  cameraTarget: [number, number, number]
  mobileCameraPosition?: [number, number, number]
  experienceEntries?: ExperienceEntry[]
  skillCategories?: SkillCategory[]
  projectEntries?: ProjectEntry[]
  awardEntries?: AwardEntry[]
  hackathonEntries?: HackathonEntry[]
  educationEntries?: EducationEntry[]
  gallery?: string[]
}

export interface EducationEntry {
  school: string
  degree: string
  dates: string
  details: string[]
  logo?: string
}

export const portfolioItems: PortfolioItem[] = [
  {
    id: 'projects',
    objectName: 'car-on-lift',
    title: 'Projects',
    subtitle: "What I've Built",
    description:
      'Seven builds, each with the diagrams and demos to prove it: an AI agent that drives a real iPhone by voice, a tax platform with paying customers, a betting model with receipts, a procurement co-pilot, a fleet of smart trash bins, a video-to-soundtrack generator — and the 3D garage you\'re standing in.',
    tags: ['Claude', 'Next.js', 'TypeScript', 'PyTorch', 'YOLOv8', 'CLIP', 'Firebase', 'Flask', 'Docker'],
    links: [
      { label: 'Agentic iOS', url: 'https://github.com/bryanrg22/ios-agent_automation_info' },
      { label: 'Basis', url: 'https://github.com/bryanrg22/Basis_Info' },
      { label: 'Lambda Rim', url: 'https://github.com/bryanrg22/lambda-rim' },
      { label: 'Swerve', url: 'https://devpost.com/software/swerve-gqmenk' },
      { label: 'CleanSweep', url: 'https://devpost.com/software/cleansweep-tjq36w' },
      { label: 'Nosu', url: 'https://github.com/bryanrg22/Mit_Hacks' },
    ],
    projectEntries: [
      {
        name: 'Agentic Automation on iOS',
        description: 'Hold the iPhone\'s Action Button, say what you need, and Claude does it on the real phone — tapping, typing, and swiping through any app while narrating every step out loud. Built so blind and low-vision users can operate the apps everyone else takes for granted. Six rounds of optimization took the same task from an 83-second failure to a clean 24-second success — the full story is in the images.',
        achievement: '3rd Place — Claude Builder Hackathon @ UCLA',
        category: 'AI Agents',
        techStack: ['Claude Sonnet 4.6', 'Node.js', 'Swift', 'XCTest', 'Maestro', 'AVSpeechSynthesizer', 'Dynamic Island', 'iOS Shortcuts', 'Prompt Caching', 'CoALA Memory'],
        links: [{ label: 'GitHub', url: 'https://github.com/bryanrg22/ios-agent_automation_info' }],
        logo: '/images/hackathons/claudeLogo.webp',
        media: [
          { type: 'video', src: '/videos/agentic_ios_demo.mp4', poster: '/images/projects/agentic/demo_poster.webp', caption: '"Open my most recent recruiter message on LinkedIn" — Claude drives the iPhone end-to-end' },
          { type: 'video', src: '/videos/agentic_ios_drag.mp4', caption: 'First autonomous multi-step drag on a physical iPhone' },
          { type: 'image', src: '/images/projects/agentic/dynamic_island.webp', caption: 'Live on a real iPhone — the Swift companion app paints the agent\'s progress (step 4 of 25, 19.3s) into the Dynamic Island as Claude works' },
          { type: 'image', src: '/images/projects/agentic/human_in_loop.webp', caption: 'Human-in-the-loop — before sending anything, the agent stops and asks: "I found a conversation with Kenny… send it?"' },
          { type: 'image', src: '/images/projects/agentic/optimization.svg', caption: 'Six instrumented runs of the same iPhone task: root-cause fixes took it from an 83s failure to a clean 23.9s, 4-step run — the theoretical minimum' },
          { type: 'image', src: '/images/projects/agentic/architecture.webp', caption: 'System architecture — Node.js agent ↔ XCTest bridge ↔ Swift companion app' },
          { type: 'image', src: '/images/projects/agentic/technique_memory.svg', caption: "The agent's CoALA-style memory: three on-device stores feed an XML-tagged, prompt-cached system prompt, while a rolling summary keeps each step's context to a single screenshot" },
          { type: 'image', src: '/images/projects/agentic/team_stage.webp', caption: '3rd place — Claude Builder Hackathon @ UCLA' },
        ],
      },
      {
        name: 'Basis',
        description: 'AI that does cost segregation — the tax study that lets building owners deduct faster — in hours instead of weeks. Agents read the appraisal, look at photos of every room, classify what they see against IRS rules, and back every claim with a citation an engineer can check. No evidence, no claim. Two firms already pay for it.',
        achievement: "Won LavaLab Demo Night F'25 (Best Traction)",
        category: 'AI · SaaS',
        techStack: ['LangGraph', 'Python', 'GPT-5.2', 'Grounding DINO', 'SAM2', 'FAISS', 'BM25', 'MCP', 'React', 'TypeScript'],
        links: [{ label: 'GitHub', url: 'https://github.com/bryanrg22/Basis_Info' }],
        logo: '/images/projects/basis_logo.png',
        media: [
          { type: 'image', src: '/images/projects/basis/architecture.svg', caption: 'System architecture — LangGraph engine, DINO→SAM2 vision, and a citation-backed IRS evidence layer' },
          { type: 'image', src: '/images/projects/basis/technique_rag.svg', caption: 'RAG with receipts: a custom IRS tokenizer + BM25/FAISS score fusion feed whole-table evidence through a citation gate — no evidence, no claim' },
          { type: 'image', src: '/images/projects/basis/agent_loop.svg', caption: 'Self-correcting appraisal extraction: an extractor → verifier → corrector loop over four confidence-tiered methods, gated at ≥0.90 for critical fields' },
          { type: 'image', src: '/images/projects/basis/technique_stategraph.svg', caption: 'Pausable LangGraph workflow: three engineer checkpoints, a background vision job racing the first review, and Firestore checkpointing so any study resumes by thread_id' },
          { type: 'image', src: '/images/projects/basis/langsmith_trace.webp', caption: 'Agentic RAG trace — every retrieval and citation is observable in LangSmith' },
          { type: 'image', src: '/images/projects/basis/team_check.webp', caption: "Best Traction — LavaLab Demo Night F'25" },
        ],
      },
      {
        name: 'Sprout',
        description: 'An AI health coach that actually knows you — built native for iPhone for a real person (my friend, then me), running daily on real Fitbit data. One abstraction speaks to both Claude and GPT, every feature runs on the cheapest model that does the job honestly, and the cost engineering is measured, not vibes: a coach turn dropped from 1.7¢ to 0.45¢ with an 82% prompt-cache hit rate. 443 tests passing.',
        achievement: '443 tests · live daily on real Fitbit data',
        category: 'AI · iOS',
        techStack: ['Swift', 'SwiftUI', 'SwiftData', 'Claude', 'GPT-5.6', 'Fitbit API', 'WidgetKit', 'Keychain BYOK', 'Prompt Caching', 'Tool Use'],
        links: [{ label: 'GitHub', url: 'https://github.com/bryanrg22/sprout' }],
        logo: '/images/projects/sprout_logo.png',
        media: [
          { type: 'image', src: '/images/projects/sprout/architecture.svg', caption: 'System architecture — one AI abstraction, two providers, and a template-first cost ladder' },
          { type: 'image', src: '/images/projects/sprout/today-dashboard.webp', caption: 'Living on my phone — day 28 of the streak, real calorie budget, one proactive note per day' },
          { type: 'image', src: '/images/projects/sprout/vita-tool-call.webp', caption: 'Vita logging water through real tool calls — validated before anything is written' },
          { type: 'image', src: '/images/projects/sprout/agent_loop.svg', caption: "Vita's tool loop — validation before execution, confirm-or-undo, and the model always told what really happened" },
          { type: 'image', src: '/images/projects/sprout/technique_tiering.svg', caption: 'Right-sized models — the daily features run on the cheap tier; the expensive model is reserved for a few calls ever' },
          { type: 'image', src: '/images/projects/sprout/technique_cost.svg', caption: 'Cost engineering, measured — 82% prompt-cache hits took a coach turn from 1.7¢ to 0.45¢' },
          { type: 'image', src: '/images/projects/sprout/sleep-recovery.webp', caption: 'Real Fitbit data — sleep stages, resting HR, and HRV vs my own 14-day baseline' },
          { type: 'image', src: '/images/projects/sprout/progress-trend.webp', caption: "The AI reading the data honestly — training is up but the scale is moving the wrong way for a gain goal, so it says so" },
        ],
      },
      {
        name: 'Lambda Rim',
        description: 'Math against the sportsbooks. Every NBA player prop becomes a probability problem — modeled, simulated 100,000 times, and stress-tested for volatility — then compared against the betting lines from five books. It only plays when the numbers say the edge is real. The receipts are in the images.',
        achievement: '78% win rate, $10 → $3,000 profit',
        category: 'Quant · Data',
        techStack: ['React', 'Flask', 'Python', 'Monte Carlo', 'GARCH', 'Poisson', 'Firestore', 'NBA API', 'Cloud Scheduler'],
        links: [
          { label: 'GitHub', url: 'https://github.com/bryanrg22/lambda-rim' },
        ],
        logo: '/images/projects/lambdarimLogo.png',
        media: [
          { type: 'image', src: '/images/projects/lambdarim/prizepicks_proof.webp', caption: 'The receipts — $10 → $3,000 at a 78% win rate' },
          { type: 'image', src: '/images/projects/lambdarim/architecture.svg', caption: 'System architecture — OCaml Monte Carlo over FFI, GCP pipelines, and a home-IP cron the sportsbooks can\'t block' },
          { type: 'image', src: '/images/projects/lambdarim/technique_probability.svg', caption: 'The three-layer probability stack: closed-form Poisson baseline, a 100k-draw Monte Carlo engine in OCaml over a ctypes FFI, and GARCH(1,1) volatility that flags when constant-sigma breaks' },
          { type: 'image', src: '/images/projects/lambdarim/numbers.svg', caption: 'Lambda Rim by the numbers — every figure traced to a file committed in the repo' },
          { type: 'image', src: '/images/projects/lambdarim/ocr_pipeline.svg', caption: 'Automated OCR → prediction pipeline' },
        ],
      },
      {
        name: 'Swerve',
        description: "A procurement co-pilot for hardware companies. Hugo — the AI agent at its core — watches inventory, understands the entire bill of materials, answers questions in plain English, and pings Slack before a part shortage becomes a production stop. Built in a weekend at Caltech; Dryft liked it enough to invite us to their SF offices afterward.",
        achievement: '1st Place Dryft Challenge @ Caltech HackTech',
        category: 'AI Agents',
        techStack: ['LangChain', 'Python', 'Flask', 'OpenAI', 'Firestore', 'Slack API', 'MapLibre GL', 'React'],
        links: [
          { label: 'GitHub', url: 'https://github.com/bryanrg22/swerve' },
          { label: 'DevPost', url: 'https://devpost.com/software/swerve-gqmenk' },
        ],
        logo: '/images/projects/swerveLogo.png',
        media: [
          { type: 'image', src: '/images/projects/swerve/architecture.svg', caption: 'System architecture — Hugo the LangChain agent, NetworkX BOM graph, and Slack alerting' },
          { type: 'image', src: '/images/projects/swerve/agent_loop.svg', caption: "Hugo's AgentExecutor: a gpt-3.5-turbo router dispatching 6 Firestore-grounded tools, with nested gpt-4/gpt-4o calls and Slack alert output" },
          { type: 'image', src: '/images/projects/swerve/technique_bom.svg', caption: 'The NetworkX bill-of-materials DiGraph: edges colored by stock health, feeding parts_summary.csv into Hugo\'s reasoning tools' },
          { type: 'image', src: '/images/projects/swerve/hugo_live.webp', caption: 'Hugo running live — dashboard and agent code side by side during the Dryft collaboration' },
          { type: 'image', src: '/images/projects/swerve/team_win.webp', caption: '1st Place — Dryft Challenge @ Caltech HackTech' },
          { type: 'image', src: '/images/projects/swerve/neo_whiteboard.webp', caption: "Neo's SF office whiteboard — the post-hackathon visit Dryft invited us to" },
        ],
      },
      {
        name: 'CleanSweep',
        description: 'Trash bins that report how full they are. A camera and computer vision watch each bin, a Raspberry Pi shows the fill level on LED bars, and a route engine plans the shortest truck run that only visits bins that actually need emptying. Cities burn fuel collecting half-empty bins — this fixes that.',
        achievement: 'Won Best Use of Terraform @ Harvard',
        category: 'CV · Hardware',
        techStack: ['OpenCV', 'Python', 'Terraform', 'React', 'Flask', 'Firebase'],
        links: [
          { label: 'GitHub', url: 'https://github.com/DPulavarthy/HackHarvard' },
          { label: 'DevPost', url: 'https://devpost.com/software/cleansweep-tjq36w' },
        ],
        logo: '/images/projects/cleansweeplogo.png',
        media: [
          { type: 'youtube', src: 'iU_6u-RygyQ', caption: 'Full demo — the complete CleanSweep walkthrough' },
          { type: 'image', src: '/images/projects/cleansweep/architecture.svg', caption: 'System architecture — OpenCV fill detection on a Pi rig, Terraform-provisioned AWS, and a Databricks route engine' },
          { type: 'image', src: '/images/projects/cleansweep/technique_sensing.svg', caption: 'How CleanSweep senses a bin: OpenCV HSV mask + contour fill detection, 3 shots averaged into a 0–5 level, mirrored on Pi GPIO LED bars' },
          { type: 'image', src: '/images/projects/cleansweep/technique_routing.svg', caption: 'Route planning: 100 Distance Matrix calls build a 10×10 travel-time matrix, RandomForest flags priority bins, nearest-neighbor orders the 24-minute route' },
        ],
      },
      {
        name: 'Nosu',
        description: "Give it a silent video, get it back with a soundtrack that fits. Three vision models watch the footage while an audio model reads the mood — everything the machine \"sees\" becomes vectors, the vectors become one description of the scene, and an AI composer writes music to match it, moment by moment. It doesn't slap a song on your video; it scores it.",
        achievement: 'Built at HackMIT 2025',
        category: 'ML · Media',
        techStack: ['FastAPI', 'Python', 'YOLOv5', 'BLIP', 'VideoMAE', 'CLAP', 'OpenAI', 'Suno AI', 'React', 'Firebase'],
        links: [
          { label: 'GitHub', url: 'https://github.com/bryanrg22/Mit_Hacks' },
        ],
        logo: '/images/projects/NosuLogo.png',
        media: [
          { type: 'video', src: '/videos/nosu_demo.mp4', poster: '/images/projects/nosu/demo_poster.webp', caption: 'Output sample — unmute to hear the AI-generated soundtrack 🔊' },
          { type: 'image', src: '/images/projects/nosu/architecture.svg', caption: 'System architecture — YOLO + BLIP + VideoMAE fused into a GPT-composed Suno music prompt' },
          { type: 'image', src: '/images/projects/nosu/technique_fusion.svg', caption: "The fusion pipeline on one real 23-second beach clip: three model streams on a shared clock, confidence-weighted into a single GPT prompt, rendered by Suno, muxed back onto the video" },
          { type: 'image', src: '/images/projects/nosu/technique_embeddings.svg', caption: 'How Nosu hears mood: CLAP zero-shot — audio windows and mood labels meet as vectors in a shared 512-d embedding space, where cosine similarity becomes the mood timeline' },
        ],
      },
      {
        name: "Bryan's Portfolio",
        description: "The site you're standing in — the auto body shop where my dad works, and where I worked at 15, rebuilt in 3D in your browser. Under the hood: 3D models compressed from 36 MB down to 14 MB, a hand-rolled physics engine (kick the soccer ball), and a renderer that idles at zero frames per second — a 3D site your battery barely notices.",
        achievement: "You're looking at it right now",
        category: '3D Web',
        techStack: ['React', 'TypeScript', 'Three.js', 'React Three Fiber', 'Vite', 'Tailwind CSS', 'GSAP', 'Zustand', 'Framer Motion'],
        links: [{ label: 'GitHub', url: 'https://github.com/bryanrg22/bryan-garage-portfolio' }],
        logo: '/images/websiteLogo.png',
        media: [
          { type: 'image', src: '/images/projects/portfolio/garage_view.webp', caption: "The garage itself — 22MB of Draco+WebP-optimized GLBs, custom physics, and a demand-driven render loop that idles at 0fps" },
          { type: 'image', src: '/images/projects/portfolio/architecture.svg', caption: 'System architecture — demand-driven R3F rendering, GPU-tier scaling, and a custom physics engine in ~300 lines' },
          { type: 'image', src: '/images/projects/portfolio/technique_renderloop.svg', caption: 'Demand-driven rendering: five invalidate() callers drive a demand-frameloop Canvas that idles at 0fps on desktop and caps at 30fps on mobile' },
          { type: 'image', src: '/images/projects/portfolio/optimization.svg', caption: 'GLB asset pipeline: resize-to-1024 → WebP → Draco cut the models folder 36 MB → 14 MB — the embedded PNG textures, not geometry, were the payload' },
        ],
      },
    ],
    position: [-2.0, 1.08, -0.8],
    color: '#E8A838',
    cameraPosition: [-0.5, 1.5, 1.0],
    cameraTarget: [-2.0, 1.1, -0.8],
  },
  {
    id: 'hackathons',
    objectName: 'mlh-banner',
    title: 'Hackathons & Competitions',
    subtitle: '12 Hackathons. 4 Wins. Coast to Coast.',
    description:
      'My first projects were mediocre. I flew across the country and learned from failure. Then I won at Harvard (CleanSweep — Best Use of Terraform). Then Caltech (Swerve — 1st place Dryft Challenge). Then UCLA (Agentic Automation on iOS — 3rd place at the Claude Builder Hackathon). AstroHacks Gold Medalist. LavaLab Demo Night Winner (Best Traction). SkillsUSA State Bronze — 3rd best engineering project in California. FIRST Robotics Regional Semifinalist. MIT, Stanford TreeHacks, Princeton, Yale, UPenn, Berkeley — I showed up to all of them.',
    tags: ['UCLA', 'Harvard', 'Caltech', 'MIT', 'Stanford', 'Princeton', 'Yale', 'UPenn'],
    links: [
      { label: 'Agentic iOS (UCLA Winner)', url: 'https://github.com/bryanrg22/ios-agent_automation_info' },
      { label: 'Swerve (Caltech Winner)', url: 'https://devpost.com/software/swerve-gqmenk' },
      { label: 'CleanSweep (Harvard Winner)', url: 'https://devpost.com/software/cleansweep-tjq36w' },
      { label: 'DevPost Profile', url: 'https://devpost.com/bryanrg22' },
    ],
    hackathonEntries: [
      { name: 'Claude Builder Hackathon', institution: 'UCLA', startDate: '2026-04-18', endDate: '2026-04-19', location: 'Los Angeles, California', status: 'COMPLETED', highlight: 'Hackathon Winner', logo: '/images/hackathons/claudeLogo.webp' },
      { name: 'YHack Spring 2026', institution: 'Yale', startDate: '2026-03-28', endDate: '2026-03-29', location: 'New Haven, Connecticut', status: 'COMPLETED', logo: '/images/hackathons/yaleLogo.png' },
      { name: 'MITHacks', institution: 'MIT', startDate: '2025-09-14', endDate: '2025-09-15', location: 'Boston, Massachusetts', status: 'COMPLETED', logo: '/images/hackathons/mitLogo.png' },
      { name: '2025 HackTech', institution: 'California Institute of Technology', startDate: '2025-04-26', endDate: '2025-04-28', location: 'Pasadena, California', status: 'COMPLETED', highlight: 'Hackathon Winner', logo: '/images/hackathons/caltechLogo.png' },
      { name: 'TreeHacks', institution: 'Stanford University', startDate: '2025-02-15', endDate: '2025-02-17', location: 'Stanford, California', status: 'COMPLETED', logo: '/images/hackathons/stanfordLogo.png' },
      { name: 'MIT iQuHACK', institution: 'MIT', startDate: '2025-01-31', endDate: '2025-02-02', location: 'Boston, Massachusetts', status: 'COMPLETED', logo: '/images/hackathons/mitLogo.png' },
      { name: 'HackPrinceton', institution: 'Princeton', startDate: '2024-11-09', endDate: '2024-11-11', location: 'Princeton, New Jersey', status: 'COMPLETED', logo: '/images/hackathons/princetonLogo.png' },
      { name: '2024 HackHarvard', institution: 'Harvard', startDate: '2024-10-11', endDate: '2024-10-13', location: 'Cambridge, Massachusetts', status: 'COMPLETED', highlight: 'Hackathon Winner', logo: '/images/hackathons/harvardLogo.webp' },
      { name: 'YHacks', institution: 'Yale', startDate: '2024-10-04', endDate: '2024-10-06', location: 'New Haven, Connecticut', status: 'COMPLETED', logo: '/images/hackathons/yaleLogo.png' },
      { name: 'HackGT', institution: 'Georgia Tech', startDate: '2024-09-27', endDate: '2024-09-29', location: 'Atlanta, Georgia', status: 'Flight Canceled Due to Hurricane Helene', logo: '/images/hackathons/georgiatechLogo.png' },
      { name: 'PennApps XXV', institution: 'UPenn', startDate: '2024-09-20', endDate: '2024-09-22', location: 'Philadelphia, Pennsylvania', status: 'COMPLETED', logo: '/images/hackathons/upennLogo.png' },
      { name: 'UC Berkeley AI Hackathon', institution: 'UC Berkeley', startDate: '2024-06-22', endDate: '2024-06-23', location: 'Berkeley, California', status: 'COMPLETED', logo: '/images/hackathons/berkeleyLogo.webp' },
      { name: 'AstroHacks', institution: 'High School Hackathon', startDate: '2024-04-13', endDate: '2024-04-13', location: 'Irvine, California', status: 'COMPLETED', highlight: 'Hackathon Winner', logo: '/images/hackathons/astrohacksLogo.jpeg' },
    ],
    position: [4.5, 3.2, -0.7],
    color: '#F4C963',
    cameraPosition: [2.0, 3.0, 0.5],
    cameraTarget: [4.9, 3.2, -0.7],
  },
  {
    id: 'soccer',
    objectName: 'soccer-ball',
    title: 'The Beautiful Game',
    subtitle: 'Academy Soccer & Varsity Captain',
    description:
      "Academy soccer since I was a kid. Three years captain of my high school team — we made the deepest CIF playoff run in school history.\n\nAnd yes: I scored against Barcelona's academy.\n\nThat's why there's a ball in this garage — go ahead, kick it.",
    tags: ['Academy Soccer', 'Varsity Captain', 'CIF'],
    position: [0.5, 0.25, -0.7],
    color: '#F5F0EB',
    cameraPosition: [0.5, 0.5, 1.3],
    cameraTarget: [0.5, 0.25, -0.7],
    gallery: [
      '/images/soccer/baby_me.webp',
      '/images/soccer/azusa_soccer.webp',
      '/images/soccer/gladstone.webp',
      '/images/soccer/in_the_air.webp',
    ],
  },
  {
    id: 'skills',
    objectName: 'toolbox',
    title: 'Skills',
    subtitle: 'Languages, Frameworks & Tools',
    description:
      'Languages: Python, TypeScript, C++, Java, SQL, OCaml. AI/ML: PyTorch, TensorFlow, OpenCV, YOLOv8, CLIP, LangChain, RAG. Web: React, Next.js, Tailwind, Vite. Backend: FastAPI, Flask, REST APIs, Firebase, Firestore. Cloud: Docker, Google Cloud Run, AWS, GitHub Actions. Tools: Git, CI/CD, Linux.',
    tags: ['Python', 'TypeScript', 'C++', 'PyTorch', 'React', 'Docker'],
    links: [
      { label: 'GitHub Profile', url: 'https://github.com/bryanrg22' },
    ],
    skillCategories: [
      { category: 'Programming Languages', skills: ['Python', 'C++', 'Java', 'TypeScript', 'SQL', 'OCaml', 'JavaScript', 'C'] },
      { category: 'AI/ML & Data', skills: ['PyTorch', 'TensorFlow', 'OpenCV', 'YOLOv8', 'CLIP', 'LangChain', 'LangGraph', 'Grounding DINO', 'SAM2', 'FAISS', 'BM25', 'Monte Carlo', 'GARCH', 'Poisson', 'NumPy', 'Pandas', 'Matplotlib', 'RAG'] },
      { category: 'Web & Frontend', skills: ['React', 'Next.js', 'Tailwind CSS', 'Vite', 'MapLibre GL', 'HTML/CSS'] },
      { category: 'Backend & APIs', skills: ['FastAPI', 'Flask', 'REST APIs', 'Firebase', 'Firestore', 'OpenAI API', 'Gemini', 'MCP', 'Slack API'] },
      { category: 'Cloud & DevOps', skills: ['Docker', 'Google Cloud Run', 'AWS', 'GitHub Actions', 'Firebase Auth', 'Cloud Scheduler', 'Linux'] },
      { category: 'Tools', skills: ['Git', 'CI/CD', 'Testing', 'Analytics'] },
    ],
    position: [2, 0, 0.5],
    color: '#4DB8B0',
    cameraPosition: [2, 1, 3],
    cameraTarget: [2, 0.3, 0.5],
    mobileCameraPosition: [2, 1.3, 5.5],
  },
  {
    id: 'experience',
    objectName: 'nvidia-logo',
    title: 'Experience',
    subtitle: "Where I've Worked",
    description:
      "NVIDIA — Software Engineering Intern (Summer 2026), building agentic AI. SUMMIT — Software Developer at an AI search startup; built the AWS Lambda + SQS pipeline and multi-provider LLM layer. OpenAI — OpenAI Connect. Datadog — DataPUPS 2026 (Emerging Talent, NYC). Jane Street — FOCUS '25 (1 of 14) and UNBOXED '24 (1 of 37). Hudson River Trading — Algorithm Development (Quantitative Research) Track. D.E. Shaw — Connect Fellowship. USC ISI HUMANS Lab — Research Assistant across two labs. FIRST Robotics — Lead Developer, Regional Semifinalist. SkillsUSA — Team Leader, State Bronze Medalist.",
    tags: ['NVIDIA', 'SUMMIT', 'AWS', 'OpenAI', 'Datadog', 'Jane Street', 'HRT', 'D.E. Shaw', 'USC ISI'],
    links: [
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/bryanrg22' },
    ],
    experienceEntries: [
      { company: 'NVIDIA', role: 'Software Engineering Intern', date: 'May 2026 – Aug 2026', description: 'Building Agentic AI systems — Summer 2026', logo: '/images/experience/nvidia_logo.png', category: 'Tech' },
      { company: 'SUMMIT', role: 'Software Developer', date: 'Jan 2026 – May 2026', description: 'AI search optimization startup with paying customers. I focused on AI production infrastructure and the multi-provider LLM pipeline.', logo: '/images/experience/summit_logo.svg', label: 'Startup', category: 'Tech', subRoles: [
        { role: 'Production infrastructure — AWS Lambda + SQS', date: 'Mar 2026', bullets: [
          'Moved snapshot generation off the blocking Express path onto AWS Lambda behind SQS — worker concurrency capped at 3 for provider rate-limit safety.',
          'Dead-letter queue + CloudWatch alarms, a daily EventBridge cron, and SAM infrastructure-as-code with one-command deploy.',
        ] },
        { role: 'Multi-provider LLM pipeline', date: 'Feb 2026', bullets: [
          'Fixed rate limiting across four providers (Claude, GPT, Gemini, Perplexity) with a per-provider counting semaphore and backoff retry, then ran them in parallel instead of sequentially — cutting a full citation run from ~6m 48s to ~1m 44s (~4× faster).',
        ] },
      ] },
      { company: 'USC Information Sciences Institute', role: 'Undergraduate Research Intern', date: 'Aug 2024 – Present', logo: '/images/experience/uscisiLogo.jpg', label: 'Research', category: 'Research', subRoles: [
        { role: 'iOS-Agent: Open Research Platform for Physical Mobile GUI Agents', date: 'Jan 2026 – Present', bullets: [
          'First open research platform for autonomous AI agents on physical iOS. Built a novel continuous-trajectory drag primitive and the first autonomous multi-step drag on iPhone (tasks where Mobile-Agent, AppAgent, and Mobile-Agent-v2 score near-zero) via 22+ tool primitives.',
          'Compressed 15-step agent tasks from 88s → 24s (3.5× speedup) via rolling-summary context compression (3.40×, 30% fewer tokens), direct HTTP to Maestro\'s XCTest runner (10–100× action-latency), and prompt caching (~90% per-step cost reduction).',
        ] },
        { role: 'LLM-assisted AI for TikTok Eating-Disorder Dataset (EDTok)', date: 'Aug 2024 – May 2025', description: 'Published EDTok, multimodal eating disorder TikTok dataset — Accepted to ICWSM 2025', links: [{ label: 'Research Paper', url: 'https://arxiv.org/abs/2505.02250' }] },
      ] },
      { company: 'USC Viterbi School of Engineering', role: 'Research Intern', date: 'Jul 2024 – Aug 2024', description: 'Image–Text Misinformation Detection — improved out-of-context image–text detection to 68% accuracy', logo: '/images/experience/uscviterbiLogo.jpg', label: 'Research', category: 'Research' },
      { company: 'Hudson River Trading', role: 'Undergraduate Fellow', date: 'May 2026', logo: '/images/experience/hrt_logo.png', category: 'Quant', subRoles: [
        { role: 'Inside HRT', date: 'May 2026', description: 'Algorithm Development (Quantitative Research) Track' },
      ] },
      { company: 'Jane Street', role: 'Undergraduate Fellow', date: '2024–2025', logo: '/images/experience/janestreetLogo.png', category: 'Quant', subRoles: [
        { role: "FOCUS '25", date: 'May 2025', description: 'Selected as 1 of 14' },
        { role: "UNBOXED '24", date: 'Jul 2024', description: 'Selected as 1 of 37' },
      ] },
      { company: 'OpenAI', role: 'OpenAI Connect', date: 'Jul 2026', logo: '/images/experience/chatgptLogo.png', category: 'Tech' },
      { company: 'Datadog', role: 'DataPUPS 2026', date: 'Jun 2026', description: "Invite-only Emerging Talent summit at Datadog HQ, NYC — 1 of 30 selected from 900+ applicants", logo: '/images/experience/datadog_logo.png', category: 'Tech' },
      { company: 'The D. E. Shaw Group', role: 'Undergraduate Fellow', date: 'Sep 2025', description: "Connect Fellowship at D. E. Shaw's NYC office", logo: '/images/experience/deshaw.avif', category: 'Quant' },
      { company: 'Two Sigma', role: 'New Seekers Summit', date: 'Feb 2025', logo: '/images/orgs/twosigmaLogo.png', category: 'Quant' },
      { company: 'Susquehanna International Group', role: 'Discovery Day for First Year Students', date: 'Feb 2025', logo: '/images/experience/sig_logo.jpeg', category: 'Quant' },
      { company: 'Y Combinator', role: 'Startup School 2026', date: 'Jul 2026', description: "YC's in-person Startup School — San Francisco, CA", logo: '/images/experience/ycombinator_logo.svg', category: 'Entrepreneurship' },
      { company: 'LavaLab', role: 'Software Developer', date: 'Jul 2024 – Present', description: "USC's Premier Startup Incubator — LavaLab's Best Traction F25", logo: '/images/awards/logos/lavalabLogo.jpg', category: 'Entrepreneurship' },
      { company: 'TroyLabs', role: 'Tech Lead', date: 'Jul 2024 – Present', description: "USC's premier startup accelerator — reviewing portfolio startups' AI and engineering work, advising founders, and building the weekly AI curriculum", logo: '/images/experience/troy_labs.png', category: 'Entrepreneurship' },
      { company: 'Quant SC', role: 'Software Developer', date: 'Jul 2024 – Present', description: "Software Developer for USC's Premier Quant Club", logo: '/images/orgs/quantscLogo.ico', category: 'Leadership' },
      { company: 'FIRST Robotics', role: 'Lead Developer', date: '2023–2024', description: 'Regional Semifinalist — Top 5 out of 32 Teams', logo: '/images/experience/firstLogo.jpeg', category: 'Leadership' },
      { company: 'SkillsUSA', role: 'Team Leader', date: '2023–2024', description: 'State Bronze Medalist — 3rd Best Engineering Project in California', logo: '/images/experience/skillsusaLogo.png', category: 'Leadership' },
    ],
    position: [-3.05, 1.38, -0.9],
    color: '#CC4444',
    cameraPosition: [-3.05, 1.6, 1.0],
    cameraTarget: [-3.05, 1.38, -0.9],
    mobileCameraPosition: [-3.05, 1.8, 3.0],
  },
  {
    id: 'awards',
    objectName: 'trophy-shelf',
    title: 'Awards',
    subtitle: 'Recognition & Honors',
    description:
      'Claude Builder Hackathon — 3rd Place (Agentic Automation on iOS @ UCLA). Harvard Hack Lodge — Winner (CleanSweep, Best Use of Terraform). Caltech Hackathon — Winner (Swerve, 1st Place Dryft Challenge). AstroHacks — Gold Medalist. Jane Street FOCUS \'25 (1 of 14) & UNBOXED \'24 (1 of 37). D.E. Shaw Connect Fellowship. Two Sigma New Seekers Fellowship. USC Merit Scholar. LavaLab Demo Night Winner (Best Traction). SkillsUSA State Bronze — 3rd best engineering project in California.',
    tags: ['Claude', 'Jane Street', 'D.E. Shaw', 'Two Sigma', 'Harvard', 'Caltech', 'USC'],
    links: [
      { label: 'DevPost Profile', url: 'https://devpost.com/bryanrg22' },
    ],
    awardEntries: [
      { name: 'Claude Builder Hackathon', description: '(3rd Place) Agentic Automation on iOS — voice-controlled Claude agent driving a real iPhone', location: 'UCLA — Los Angeles, CA', year: 2026, iconType: 'medal', photo: '/images/awards/photos/claudeAward.jpeg', logo: '/images/hackathons/claudeLogo.webp' },
      { name: "CalTech's HackTech Hackathon", description: '(Winner) Dryft Challenge Winner', location: 'Pasadena, CA', year: 2025, iconType: 'trophy', photo: '/images/awards/photos/hacktechteam.webp', logo: '/images/awards/logos/awards_caltechLogo.png' },
      { name: "Harvard's HackHarvard Hackathon", description: '(Winner) Best Use of Terraform', location: 'Cambridge, MA', year: 2024, iconType: 'trophy', photo: '/images/awards/photos/hackharvardteam.webp', logo: '/images/awards/logos/awards_harvardLogo.webp' },
      { name: "LavaLab Demo Night F'25", description: '(Best Traction) Demo Night Winner', location: 'Los Angeles, CA', year: 2025, iconType: 'trophy', photo: '/images/awards/photos/lava_award.jpg', logo: '/images/awards/logos/lavalabLogo.jpg' },
      { name: 'AstroHacks Hackathon', description: '(Winner) Gold Medalist, Best Execution', location: 'Irvine, CA', year: 2024, iconType: 'trophy', photo: '/images/awards/photos/astroMedals.jpg', logo: '/images/awards/logos/awards_astrohacksLogo.jpeg' },
      { name: 'SkillsUSA CA Engineering Technology/Design', description: 'REGIONAL Finalist && STATE Bronze — 3rd Best Engineering Project in the State of California', location: 'Ontario, CA', year: 2024, iconType: 'medal', photo: '/images/awards/photos/skillsMedals.webp', logo: '/images/awards/logos/awards_skillsusaLogo.png' },
      { name: 'FIRST Tech Challenge CENTERSTAGE Robotics', description: 'REGIONAL Semifinalist — Top 5 out of 32 Teams', location: 'Pasadena, CA', year: 2024, iconType: 'award', photo: '/images/awards/photos/firstMedals.webp', logo: '/images/awards/logos/awards_firstLogo.jpeg' },
    ],
    position: [2.5, 1.8, -2.7],
    color: '#F4C963',
    cameraPosition: [2.5, 2.0, 0.5],
    cameraTarget: [2.5, 1.8, -2.7],
  },
  {
    id: 'education',
    objectName: 'usc-trojan',
    title: 'Education',
    subtitle: 'University of Southern California',
    description:
      "Bachelor's degree in Computer Science at USC Viterbi School of Engineering. Software Developer at QuantSC, LavaLab, and TroyLabs. Study abroad in Berlin, Germany: Engineering in Society.",
    tags: ['USC', 'Viterbi', 'Computer Science'],
    educationEntries: [
      {
        school: 'University of Southern California',
        degree: "Bachelor's degree, Computer Science",
        dates: 'Jun 2024 – May 2028',
        details: [
          'USC Viterbi School of Engineering — Computer Science',
          "Dev roles across USC's startup + quant scene — LavaLab, TroyLabs (Tech Lead), QuantSC",
          'Study Abroad: Berlin, Germany — Engineering in Society',
        ],
        logo: '/images/experience/uscviterbiLogo.jpg',
      },
      {
        school: 'Citrus College',
        degree: 'Dual Enrollment',
        dates: 'Jan 2021 – May 2024',
        details: [
          'Relevant Coursework: Object-Oriented Programming, Intro to Python, Mechanical Drawing, Introductory Statistics, Designing Web Sites',
        ],
        logo: '/images/citrus_college_logo.webp',
      },
    ],
    position: [-4.9, 3.2, -1],
    color: '#9B0000',
    cameraPosition: [-3.5, 3.2, 0.5],
    cameraTarget: [-4.9, 3.2, -1],
  },
  {
    id: 'home',
    objectName: 'azusa-california',
    title: 'What I Call Home',
    subtitle: 'Born & Raised in California',
    description:
      "Born and raised in Azusa, California — a small city right up against the San Gabriel Mountains, east of LA. Everything on this site traces back there: the shop, the soccer, the work ethic. Wherever I end up, that's home.",
    gallery: [
      '/images/home/azusa_greetings_sign.jpg',
      '/images/home/azusa_ave.webp',
      '/images/home/azusa_canyons.webp',
    ],
    position: [-4.9, 2.4, 0.8],
    color: '#E8A838',
    cameraPosition: [-1.5, 2.4, 0.8],
    cameraTarget: [-4.9, 2.4, 0.8],
  },
  {
    id: 'cultura',
    objectName: 'mexican-flag',
    title: 'Mi Cultura',
    subtitle: 'Mexican-American & Proud',
    description:
      "First-generation. Son of Mexican parents who came to California with nothing and built a life from scratch. Their work ethic raised me; their sacrifice paid for my shot. That's who I work this hard for.",
    tags: ['Mexican-American', 'First-Generation', 'Azusa', 'California'],
    gallery: ['/images/parents.webp'],
    position: [-3.5, 3.5, -2.85],
    color: '#006847',
    cameraPosition: [-3.5, 3.5, 0],
    cameraTarget: [-3.5, 3.5, -2.85],
  },
  {
    id: 'about',
    objectName: 'brea-auto-body',
    title: 'Where It All Started',
    subtitle: 'Brea Auto Body Inc. — Since 1979',
    description:
      "My dad works at Brea Auto Body, a collision shop running since 1979. When COVID hit, I was 15 and school went virtual — so I went to work with him. Out the door before 6 AM, home after 7 PM, classes from the break room in between.\n\nThe garage you're standing in is that shop.",
    tags: ['First-Gen', 'Family Business', 'Problem Solver', "USC BS+MS '28"],
    links: [
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/bryanrg22' },
    ],
    gallery: [
      '/images/breaAutoBody/me_working.webp',
      '/images/breaAutoBody/bodyshop_picture.webp',
    ],
    position: [0, 3.8, -2.92],
    color: '#8B7355',
    cameraPosition: [0, 3.5, 1.0],
    cameraTarget: [0, 3.8, -2.92],
  },
  {
    id: 'boombox',
    objectName: 'boombox',
    title: "What's Playing",
    subtitle: 'Only a tiny bit of what powers me.',
    description: '',
    position: [-3, 0.25, 3.2],
    color: '#9B59B6',
    cameraPosition: [-2, 0.8, 5],
    cameraTarget: [-3, 0.3, 3.2],
  },
]

export const DEFAULT_CAMERA_POSITION: [number, number, number] = [0, 3, 8]
export const DEFAULT_CAMERA_TARGET: [number, number, number] = [0, 1, 0]
