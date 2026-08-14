export interface Resume {
  name: string;
  alias: string;
  title: string;
  tagline: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  summary: string;
  availability: {
    status: string;
    target: string;
    note: string;
  };
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: Record<string, string[]>;
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  location?: string;
  highlights: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  period: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  role: string;
  tech: string[];
  highlights: string[];
  github: string | null;
  liveDemo: string | null;
  demoType?: 'native-federation' | 'module-federation' | 'iframe';
  featured: boolean;
  category: string;
}

export interface Demo {
  id: string;
  title: string;
  description: string;
  type: 'native-federation' | 'module-federation' | 'iframe';
  remoteName?: string;
  exposedModule?: string;
  url?: string;
  status: 'live' | 'planned' | 'wip';
  tech: string[];
  tags: string[];
  sandbox?: string;
}

export interface WritingItem {
  id: string;
  title: string;
  platform: 'medium' | 'linkedin' | 'youtube' | 'other';
  url: string;
  publishedAt: string;
  summary: string;
  tags: string[];
  thumbnail?: string;
}

export const resume: Resume = {
  name: 'Vishnu Thankappan',
  alias: '@techiewithbeard',
  title: 'Senior Frontend Engineer',
  tagline: 'Scalable UI Architecture - AI-Powered Interfaces',
  location: 'Bangalore, India',
  email: 'vishnuthankappan@techiewithbeard.com',
  phone: '+91-8373923785',
  linkedin: 'https://www.linkedin.com/in/vishnu-thankappan-7bbb0675/',
  github: 'https://github.com/YOUR_GITHUB_USERNAME',
  summary:
    'Senior Frontend Engineer with 7+ years of experience building and evolving large-scale, user-facing web platforms. Strong background in frontend architecture, Nx monorepos, reusable design systems, and performance-critical Angular applications. Currently expanding into AI-powered interfaces with LangChain and modern React/Next.js.',
  availability: {
    status: 'Open to opportunities',
    target: 'Senior Frontend / AI Frontend roles',
    note: 'Available for remote, hybrid, and relocation-friendly opportunities',
  },
  experience: [
    {
      role: 'Senior Frontend Engineer',
      company: 'Parnasoft Technologies - Client: AVEVA',
      period: 'March 2025 - Present',
      location: 'European client environment',
      highlights: [
        'Optimized and restructured a large Nx monorepo supporting 5+ Angular applications, reducing build and test times by 25-35%.',
        'Designed and migrated shared widget and UI libraries, reducing duplicated frontend code by 30-40%.',
        'Established frontend testing strategy using Karma, Cypress, and Playwright.',
        'Refined modular frontend architecture and abstraction boundaries to reduce onboarding time and maintenance overhead.',
      ],
    },
    {
      role: 'Frontend Specialist',
      company: 'ACI Logistix',
      period: 'March 2022 - March 2025',
      highlights: [
        'Led migration of multiple legacy AngularJS modules to Angular v14+.',
        'Introduced NgRx-based state management across modules.',
        'Published and maintained internal npm packages via Azure Artifacts.',
        'Developed cross-platform applications using Ionic.',
        'Automated internal workflows using Power Apps and Power Platform.',
      ],
    },
    {
      role: 'Expert Frontend Engineer',
      company: 'Maistering B.V',
      period: 'January 2019 - March 2022',
      location: 'European client environment',
      highlights: [
        'Developed and maintained frontend applications using Angular and NgRx.',
        'Worked on full-stack features involving Angular and .NET.',
        'Built a cross-platform mobile application using Xamarin.',
        'Followed Agile/Scrum practices and contributed to architectural discussions.',
      ],
    },
  ],
  education: [
    {
      degree: 'Master of Computer Applications',
      institution: 'Manipal Academy of Higher Education',
      period: '2016 - 2018',
    },
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'Malankara Catholic College',
      period: '2011 - 2014',
    },
  ],
  skills: {
    frontendArchitecture: ['Angular', 'Nx Monorepos', 'Design Systems', 'Modular UI Architecture', 'TypeScript', 'NgRx', 'Signals'],
    aiInterfaces: ['LangChain', 'LangGraph', 'RAG Applications', 'Streaming UIs', 'Vercel AI SDK', 'Agentic Interfaces'],
    testingQuality: ['Playwright', 'Cypress', 'Jasmine/Karma', 'Testing Strategy', 'Accessibility'],
    tooling: ['Git', 'CI/CD', 'Azure', 'Storybook', 'Webpack', 'REST APIs'],
    crossPlatform: ['Ionic', 'Xamarin'],
  },
};

export const projects: Project[] = [
  {
    id: 'nx-monorepo-optimization',
    title: 'Large-Scale Nx Monorepo Optimization',
    description:
      'Restructured a monorepo supporting 5+ Angular applications, significantly improving CI feedback loops and developer experience.',
    role: 'Senior Frontend Engineer',
    tech: ['Angular', 'Nx', 'TypeScript', 'CI/CD'],
    highlights: ['25-35% reduction in build and test times', 'Improved consistency across teams via shared libraries'],
    github: null,
    liveDemo: null,
    featured: true,
    category: 'Architecture',
  },
  {
    id: 'angularjs-to-angular-migration',
    title: 'Enterprise AngularJS to Angular Migration',
    description:
      'Led migration of multiple legacy modules to modern Angular, enabling long-term framework support and better performance.',
    role: 'Frontend Specialist',
    tech: ['Angular', 'NgRx', 'TypeScript', 'RxJS'],
    highlights: ['Improved runtime performance and maintainability', 'Standardized state management with NgRx'],
    github: null,
    liveDemo: null,
    featured: true,
    category: 'Modernization',
  },
  {
    id: 'ai-rag-chat',
    title: 'Production RAG Chat Interface',
    description:
      'Angular and LangChain powered document Q&A interface with streaming responses, source citations, and evaluation feedback loops.',
    role: 'Personal / Portfolio',
    tech: ['Angular 22', 'LangChain', 'LangGraph', 'Nx', 'Streaming UI'],
    highlights: ['Streaming responses with proper UX', 'Source citations and feedback collection', 'Designed as a microfrontend remote'],
    github: 'https://github.com/YOUR_USERNAME/ai-rag-chat',
    liveDemo: '/demos',
    demoType: 'native-federation',
    featured: true,
    category: 'AI Interfaces',
  },
  {
    id: 'multi-agent-dashboard',
    title: 'Multi-Agent Workflow Dashboard',
    description: 'Visual monitoring and control interface for LangGraph multi-agent systems.',
    role: 'Personal / Portfolio',
    tech: ['Angular', 'LangGraph', 'Signals', 'Real-time UI'],
    highlights: ['Real-time agent execution visualization', 'Human-in-the-loop patterns'],
    github: null,
    liveDemo: '/demos',
    demoType: 'native-federation',
    featured: true,
    category: 'AI Interfaces',
  },
];

export const demos: Demo[] = [
  {
    id: 'rag-chat',
    title: 'RAG Document Q&A Chat',
    description: 'Streaming AI chat interface with source citations, built as an Angular microfrontend.',
    type: 'native-federation',
    remoteName: 'demoAngularRag',
    exposedModule: './Component',
    status: 'planned',
    tech: ['Angular 22', 'LangChain', 'Streaming'],
    tags: ['AI', 'RAG', 'Angular'],
  },
  {
    id: 'agent-dashboard',
    title: 'Multi-Agent Dashboard',
    description: 'Real-time visualization of LangGraph agent workflows with human-in-the-loop controls.',
    type: 'native-federation',
    remoteName: 'demoAngularAgents',
    exposedModule: './Component',
    status: 'planned',
    tech: ['Angular', 'LangGraph', 'Signals'],
    tags: ['AI', 'Agents', 'Angular'],
  },
  {
    id: 'react-ai-chat',
    title: 'React + Vercel AI SDK Chat',
    description: 'Modern AI chat built with React and Vercel AI SDK to demonstrate cross-framework capability.',
    type: 'module-federation',
    remoteName: 'demoReactAi',
    status: 'planned',
    tech: ['React', 'Vercel AI SDK', 'TypeScript'],
    tags: ['AI', 'React'],
  },
  {
    id: 'streamlit-ai-demo',
    title: 'Streamlit AI Prototype',
    description: 'Hosted Streamlit application demonstrating rapid AI prototyping. Embedded securely via iframe.',
    type: 'iframe',
    url: 'https://YOUR_STREAMLIT_APP.streamlit.app',
    status: 'planned',
    tech: ['Streamlit', 'Python', 'LangChain'],
    tags: ['AI', 'Streamlit', 'Prototyping'],
    sandbox: 'allow-scripts allow-same-origin allow-forms allow-popups',
  },
];

export const writing: WritingItem[] = [
  {
    id: '1',
    title: 'Add your Medium / LinkedIn articles here',
    platform: 'medium',
    url: 'https://medium.com/@yourusername/your-article',
    publishedAt: '2026-07-01',
    summary: 'Short description of the article. This will be replaced by live Medium RSS feed later.',
    tags: ['Angular', 'Architecture'],
  },
];
