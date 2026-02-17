export interface ExperienceSubRole {
  company?: string
  role: string
  date: string
  description?: string
  links?: { label: string; url: string }[]
  logo?: string
  label?: string
}

export interface ExperienceEntry {
  company: string
  role: string
  date?: string
  description?: string
  logo?: string
  label?: string
  subRoles?: ExperienceSubRole[]
}

export interface SkillCategory {
  category: string
  skills: string[]
}

export interface ProjectEntry {
  name: string
  description: string
  achievement: string
  techStack: string[]
  links?: { label: string; url: string }[]
  logo?: string
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
      'Basis — AI-powered cost segregation. Co-founder & lead dev. Multi-agent AI using YOLOv8, CLIP, and OpenAI Vision for automated building component classification. Won LavaLab Demo Night (Best Traction). Lambda Rim — full-stack NBA fantasy analytics. Poisson distributions, Monte Carlo sims, GARCH volatility forecasting. Turned $10 into $3,000 with a 78%+ win rate. Swerve — agentic AI procurement co-pilot, 1st place Dryft Challenge at Caltech. CleanSweep — smart waste management with OpenCV, won Best Use of Terraform at Harvard.',
    tags: ['Next.js', 'TypeScript', 'PyTorch', 'YOLOv8', 'CLIP', 'Firebase', 'Flask', 'Docker'],
    links: [
      { label: 'Basis', url: 'https://github.com/bryanrg22/Basis_Info' },
      { label: 'Lambda Rim', url: 'https://github.com/bryanrg22/lambda-rim' },
      { label: 'Swerve', url: 'https://devpost.com/software/swerve-gqmenk' },
      { label: 'CleanSweep', url: 'https://devpost.com/software/cleansweep-tjq36w' },
    ],
    projectEntries: [
      {
        name: 'Basis',
        description: 'AI-powered cost segregation platform with multi-agent AI using YOLOv8, CLIP, and OpenAI Vision for automated building component classification.',
        achievement: 'Won LavaLab Demo Night (Best Traction)',
        techStack: ['Next.js', 'React', 'TypeScript', 'Python', 'PyTorch', 'OpenAI Vision', 'CLIP', 'YOLOv8', 'Docker', 'RAG'],
        links: [{ label: 'GitHub', url: 'https://github.com/bryanrg22/Basis_Info' }],
        logo: '/images/projects/basis_logo.png',
      },
      {
        name: 'Lambda Rim',
        description: 'NBA fantasy sports analytics with Poisson distributions, Monte Carlo simulations, and GARCH volatility forecasting.',
        achievement: '78%+ win rate, $10 → $3,000 profit',
        techStack: ['React', 'Vite', 'Python', 'Flask', 'Monte Carlo', 'GARCH', 'Poisson', 'OpenCV', 'NumPy'],
        links: [
          { label: 'GitHub', url: 'https://github.com/bryanrg22/lambda-rim' },
        ],
        logo: '/images/projects/lambdarimLogo.png',
      },
      {
        name: 'Swerve',
        description: 'Agentic AI procurement co-pilot with LangChain-powered agents and interactive map visualization.',
        achievement: '1st Place Dryft Challenge @ Caltech',
        techStack: ['React', 'Python', 'Flask', 'LangChain', 'MapLibre GL', 'Firebase'],
        links: [
          { label: 'GitHub', url: 'https://github.com/bryanrg22/CalTech-Hacks' },
          { label: 'DevPost', url: 'https://devpost.com/software/swerve-gqmenk' },
        ],
        logo: '/images/projects/swerveLogo.png',
      },
      {
        name: 'CleanSweep',
        description: 'Smart waste management system with computer vision for waste classification and optimized collection routing.',
        achievement: 'Won Best Use of Terraform @ Harvard',
        techStack: ['OpenCV', 'Python', 'Terraform', 'React', 'Flask', 'Firebase'],
        links: [
          { label: 'GitHub', url: 'https://github.com/DPulavarthy/HackHarvard' },
          { label: 'DevPost', url: 'https://devpost.com/software/cleansweep-tjq36w' },
        ],
        logo: '/images/projects/cleansweeplogo.png',
      },
      {
        name: "Bryan's Portfolio",
        description: 'This very website. It is an immersive 3D portfolio built as an interactive auto body garage scene. Visitors explore projects, experience, and skills by clicking on garage objects with smooth camera fly-ins.',
        achievement: "You're looking at it right now",
        techStack: ['React', 'TypeScript', 'Three.js', 'React Three Fiber', 'Vite', 'Tailwind CSS', 'GSAP', 'Zustand', 'Framer Motion'],
        links: [{ label: 'GitHub', url: 'https://github.com/bryanrg22/garage-portfolio' }],
        logo: '/images/websiteLogo.png',
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
    subtitle: '11 Hackathons. 3 Wins. Coast to Coast.',
    description:
      'My first projects were mediocre. I flew across the country and learned from failure. Then I won at Harvard (CleanSweep — Best Use of Terraform). Then Caltech (Swerve — 1st place Dryft Challenge). AstroHacks Gold Medalist. LavaLab Demo Night Winner (Best Traction). SkillsUSA State Bronze — 3rd best engineering project in California. FIRST Robotics Regional Semifinalist. MIT, Stanford TreeHacks, Princeton, Yale, UPenn, Berkeley — I showed up to all of them.',
    tags: ['Harvard', 'Caltech', 'MIT', 'Stanford', 'Princeton', 'Yale', 'UPenn'],
    links: [
      { label: 'Swerve (Caltech Winner)', url: 'https://devpost.com/software/swerve-gqmenk' },
      { label: 'CleanSweep (Harvard Winner)', url: 'https://devpost.com/software/cleansweep-tjq36w' },
      { label: 'DevPost Profile', url: 'https://devpost.com/bryanrg22' },
    ],
    hackathonEntries: [
      { name: 'MITHacks', institution: 'MIT', startDate: '2025-09-14', endDate: '2025-09-15', location: 'Boston, Massachusetts', status: 'COMPLETED', logo: '/images/hackathons/mitLogo.png' },
      { name: '2025 HackTech', institution: 'California Institute of Technology', startDate: '2025-04-26', endDate: '2025-04-28', location: 'Pasadena, California', status: 'COMPLETED', highlight: 'Hackathon Winner', logo: '/images/hackathons/caltechLogo.png' },
      { name: 'TreeHacks', institution: 'Stanford University', startDate: '2025-02-15', endDate: '2025-02-17', location: 'Stanford, California', status: 'COMPLETED', logo: '/images/hackathons/stanfordLogo.png' },
      { name: 'MIT iQuHACK', institution: 'MIT', startDate: '2025-01-31', endDate: '2025-02-02', location: 'Boston, Massachusetts', status: 'COMPLETED', logo: '/images/hackathons/mitLogo.png' },
      { name: 'HackPrinceton', institution: 'Princeton', startDate: '2024-11-09', endDate: '2024-11-11', location: 'Princeton, New Jersey', status: 'COMPLETED', logo: '/images/hackathons/princetonLogo.png' },
      { name: '2024 HackHarvard', institution: 'Harvard', startDate: '2024-10-11', endDate: '2024-10-13', location: 'Cambridge, Massachusetts', status: 'COMPLETED', highlight: 'Hackathon Winner', logo: '/images/hackathons/harvardLogo.png' },
      { name: 'YHacks', institution: 'Yale', startDate: '2024-10-04', endDate: '2024-10-06', location: 'New Haven, Connecticut', status: 'COMPLETED', logo: '/images/hackathons/yaleLogo.png' },
      { name: 'HackGT', institution: 'Georgia Tech', startDate: '2024-09-27', endDate: '2024-09-29', location: 'Atlanta, Georgia', status: 'Flight Canceled Due to Hurricane Helene', logo: '/images/hackathons/georgiatechLogo.png' },
      { name: 'PennApps XXV', institution: 'UPenn', startDate: '2024-09-20', endDate: '2024-09-22', location: 'Philadelphia, Pennsylvania', status: 'COMPLETED', logo: '/images/hackathons/upennLogo.png' },
      { name: 'UC Berkeley AI Hackathon', institution: 'UC Berkeley', startDate: '2024-06-22', endDate: '2024-06-23', location: 'Berkeley, California', status: 'COMPLETED', logo: '/images/hackathons/berkeleyLogo.png' },
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
      "Soccer taught me everything that matters: how to lead, how to compete, how to read patterns in chaos, and to keep pushing no matter how hard it gets. These are the same instincts I now use to debug code at 2 AM.\n\nPlayed Academy Soccer.\nCaptain of my High School Soccer team for 3 years.\nMade High School history by taking them the farthest to CIF yet.\n\nFun Fact: I scored against Barcelona's Academy!",
    tags: ['Academy Soccer', 'Varsity Captain', 'CIF'],
    position: [0.5, 0.25, -0.7],
    color: '#F5F0EB',
    cameraPosition: [0.5, 0.5, 1.3],
    cameraTarget: [0.5, 0.25, -0.7],
    gallery: [
      '/images/soccer/baby_me.png',
      '/images/soccer/azusa_soccer.png',
      '/images/soccer/gladstone.png',
      '/images/soccer/in_the_air.png',
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
      { category: 'AI/ML & Data', skills: ['PyTorch', 'TensorFlow', 'OpenCV', 'YOLOv8', 'CLIP', 'LangChain', 'NumPy', 'Pandas', 'Matplotlib', 'RAG'] },
      { category: 'Web & Frontend', skills: ['React', 'Next.js', 'Tailwind CSS', 'Vite', 'HTML/CSS'] },
      { category: 'Backend & APIs', skills: ['FastAPI', 'Flask', 'REST APIs', 'Firebase', 'Firestore', 'OpenAI API', 'Gemini'] },
      { category: 'Cloud & DevOps', skills: ['Docker', 'Google Cloud Run', 'AWS', 'GitHub Actions', 'Firebase Auth', 'Linux'] },
      { category: 'Tools', skills: ['Git', 'CI/CD', 'Testing', 'Analytics'] },
    ],
    position: [2, 0, 0.5],
    color: '#4DB8B0',
    cameraPosition: [2, 1, 3],
    cameraTarget: [2, 0.3, 0.5],
  },
  {
    id: 'experience',
    objectName: 'nvidia-amazon',
    title: 'Experience',
    subtitle: "Where I've Worked",
    description:
      "NVIDIA — Incoming SWE Intern (Summer 2026), building agentic AI. Jane Street — FOCUS '25 (1 of 14) and UNBOXED '24 (1 of 37). D.E. Shaw — Connect Fellowship. USC ISI HUMANS Lab — Research Assistant across two labs. FIRST Robotics — Lead Developer, Regional Semifinalist. SkillsUSA — Team Leader, State Bronze Medalist.",
    tags: ['NVIDIA', 'Jane Street', 'D.E. Shaw', 'USC ISI', 'FIRST Robotics'],
    links: [
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/bryanrg22' },
    ],
    experienceEntries: [
      { company: 'NVIDIA', role: 'Incoming Software Engineering Intern', date: 'May 2026 – Aug 2026', description: 'Building Agentic AI systems — Incoming Summer 2026', logo: '/images/experience/Nvidia_logo.svg.png' },
      { company: 'Amazon x USC', role: 'Research Intern', date: 'Jul 2024 – Present', label: 'Research', logo: '/images/experience/amazonLogo.png', subRoles: [
        { role: 'LLM Safety', date: 'Jan 2026 – Present' },
        { company: 'USC Viterbi School of Engineering', role: 'Image–Text Misinformation Detection', date: 'Jul 2024 – Aug 2024', description: 'Improved out-of-context image–text detection to 68% accuracy', logo: '/images/experience/uscviterbiLogo.jpg', label: 'Research' },
      ] },
      { company: 'Jane Street', role: 'Undergraduate Fellow', date: '2024–2025', logo: '/images/experience/janestreetLogo.png', subRoles: [
        { role: "FOCUS '25", date: 'May 2025', description: 'Selected as 1 of 14' },
        { role: "UNBOXED '24", date: 'Jul 2024', description: 'Selected as 1 of 37' },
      ] },
      { company: 'USC Information Sciences Institute', role: 'Undergraduate Research Intern', date: 'Aug 2024 – Present', logo: '/images/experience/uscisiLogo.jpg', label: 'Research', subRoles: [
        { role: 'Image-Based User Coordination Detection', date: 'May 2025 – Present', description: 'Image-based coordination detection research pipeline' },
        { role: 'LLM-assisted AI for TikTok Eating-Disorder Dataset (EDTok)', date: 'Aug 2024 – May 2025', description: 'Published EDTok, multimodal eating disorder TikTok dataset — Accepted to ICWSM 2025', links: [{ label: 'Research Paper', url: 'https://arxiv.org/abs/2505.02250' }] },
      ] },
      { company: 'The D. E. Shaw Group', role: 'Undergraduate Fellow', date: 'Sep 2025', description: '3 Day program at D. E. Shaw\'s NYC office (Connect Fellowship)', logo: '/images/experience/deshaw.avif' },
      { company: 'Two Sigma', role: '2025 New Seekers Summit', date: 'Feb 2025', logo: '/images/orgs/twosigmaLogo.png' },
      { company: 'Susquehanna International Group', role: 'Discovery Day for First Year Students', date: 'Feb 2025', logo: '/images/experience/sig_logo.jpeg' },
      { company: 'LavaLab', role: 'Software Developer', date: 'Jul 2024 – Present', description: "USC's Premier Startup Incubator — LavaLab's Best Traction F25", logo: '/images/awards/logos/lavalabLogo.jpg' },
      { company: 'Quant SC', role: 'Software Developer', date: 'Jul 2024 – Present', description: "Software Developer for USC's Premier Quant Club", logo: '/images/orgs/quantscLogo.ico' },
      { company: 'TroyLabs', role: 'Software Developer', date: 'Jul 2024 – Present', description: "USC's Premier Startup Accelerator — Building the tech side of the next generation of startups", logo: '/images/experience/troy_labs.png' },
      { company: 'FIRST Robotics', role: 'Lead Developer', date: '2023–2024', description: 'Regional Semifinalist — Top 5 out of 32 Teams', logo: '/images/experience/firstLogo.jpeg' },
      { company: 'SkillsUSA', role: 'Team Leader', date: '2023–2024', description: 'State Bronze Medalist — 3rd Best Engineering Project in California', logo: '/images/experience/skillsusaLogo.png' },
    ],
    position: [-3.05, 1.38, -0.9],
    color: '#CC4444',
    cameraPosition: [-3.05, 1.6, 1.0],
    cameraTarget: [-3.05, 1.38, -0.9],
  },
  {
    id: 'awards',
    objectName: 'trophy-shelf',
    title: 'Awards',
    subtitle: 'Recognition & Honors',
    description:
      'Harvard Hack Lodge — Winner (CleanSweep, Best Use of Terraform). Caltech Hackathon — Winner (Swerve, 1st Place Dryft Challenge). AstroHacks — Gold Medalist. Jane Street FOCUS \'25 (1 of 14) & UNBOXED \'24 (1 of 37). D.E. Shaw Connect Fellowship. Two Sigma New Seekers Fellowship. USC Merit Scholar. LavaLab Demo Night Winner (Best Traction). SkillsUSA State Bronze — 3rd best engineering project in California.',
    tags: ['Jane Street', 'D.E. Shaw', 'Two Sigma', 'Harvard', 'Caltech', 'USC'],
    links: [
      { label: 'DevPost Profile', url: 'https://devpost.com/bryanrg22' },
    ],
    awardEntries: [
      { name: "LavaLab Demo Night F'25", description: '(Best Traction) Demo Night Winner', location: 'Los Angeles, CA', year: 2025, iconType: 'trophy', photo: '/images/awards/photos/lava_award.jpg', logo: '/images/awards/logos/lavalabLogo.jpg' },
      { name: "CalTech's HackTech Hackathon", description: '(Winner) Dryft Challenge Winner', location: 'Pasadena, CA', year: 2025, iconType: 'trophy', photo: '/images/awards/photos/hacktechteam.jpeg', logo: '/images/awards/logos/awards_caltechLogo.png' },
      { name: "Harvard's HackHarvard Hackathon", description: '(Winner) Best Use of Terraform', location: 'Cambridge, MA', year: 2024, iconType: 'trophy', photo: '/images/awards/photos/hackharvardteam.jpeg', logo: '/images/awards/logos/awards_harvardLogo.png' },
      { name: 'AstroHacks Hackathon', description: '(Winner) Gold Medalist, Best Execution', location: 'Irvine, CA', year: 2024, iconType: 'trophy', photo: '/images/awards/photos/astroMedals.jpg', logo: '/images/awards/logos/awards_astrohacksLogo.jpeg' },
      { name: 'SkillsUSA CA Engineering Technology/Design', description: 'REGIONAL Finalist && STATE Bronze — 3rd Best Engineering Project in the State of California', location: 'Ontario, CA', year: 2024, iconType: 'medal', photo: '/images/awards/photos/skillsMedals.jpeg', logo: '/images/awards/logos/awards_skillsusaLogo.png' },
      { name: 'FIRST Tech Challenge CENTERSTAGE Robotics', description: 'REGIONAL Semifinalist — Top 5 out of 32 Teams', location: 'Pasadena, CA', year: 2024, iconType: 'award', photo: '/images/awards/photos/firstMedals.jpeg', logo: '/images/awards/logos/awards_firstLogo.jpeg' },
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
          'Software Developer @ QuantSC',
          'Software Developer / Mentor @ LavaLab',
          'Software Developer @ TroyLabs',
          'Study Abroad: Berlin, Germany — Engineering in Society',
          'Relevant Coursework: Data Structures, Algorithms, Object-Oriented Programming, Embedded Systems, Discrete Mathematics, Linear Algebra',
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
      "Born and raised in Azusa, California. Lived here my whole life. I've always been an LA boy — the hustle, the culture, the energy. California shaped who I am, and no matter where I go, LA is always home.",
    gallery: [
      '/images/home/azusa_greetings_sign.jpg',
      '/images/home/azusa_ave.jpeg',
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
      "First-generation Latino. Son of Mexican parents. My parents came to California with nothing and built a life from scratch. Their work ethic, sacrifice, and culture shaped everything I am. Being Mexican-American isn't just part of my identity — it's the foundation of it.",
    tags: ['Mexican-American', 'First-Generation', 'Azusa', 'California'],
    gallery: ['/images/parents.png'],
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
      "I learned engineering before I ever wrote code — right here in my dad's shop. At 15, the COVID-19 pandemic hit and I worked alongside him to support our family.\n\nOut the door before 6 AM, back home after 7 PM — full days in the shop while doing school virtually. That's where I learned what real work looks like.",
    tags: ['First-Gen', 'Family Business', 'Problem Solver', "USC BS+MS '28"],
    links: [
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/bryanrg22' },
    ],
    gallery: [
      '/images/breaAutoBody/me_working.png',
      '/images/breaAutoBody/bodyshop_picture.png',
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
