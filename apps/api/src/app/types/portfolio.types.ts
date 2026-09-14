export interface ProfileData {
  id: string;
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
  skills: Record<string, string[]>;
  updatedAt?: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  location?: string;
  highlights: string[];
  tech: string[];
  orderIndex: number;
}

export interface ProjectItem {
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
  orderIndex: number;
}

export interface WritingItem {
  id: string;
  title: string;
  platform: 'medium' | 'dev.to' | 'linkedin' | 'youtube' | 'hashnode' | 'other';
  url: string;
  publishedAt: string;
  summary: string;
  tags: string[];
  thumbnail?: string;
  readTime?: string;
  featured?: boolean;
  orderIndex: number;
}

export interface DemoItem {
  id: string;
  title: string;
  description: string;
  type: 'native-federation' | 'module-federation' | 'iframe' | 'standalone';
  remoteName?: string;
  exposedModule?: string;
  url?: string;
  documentation?: string;
  video?: string;
  status: 'live' | 'planned' | 'wip';
  tech: string[];
  tags: string[];
  sandbox?: string;
  orderIndex: number;
}

export interface SkillCategoryItem {
  id: string;
  category: string;
  categoryLabel: string;
  items: string[];
  orderIndex: number;
}

export interface AgentQueryLog {
  id?: string;
  sessionId: string;
  query: string;
  answerPreview?: string;
  selectedTool?: string;
  provider?: string;
  isFreeTier?: boolean;
  createdAt?: string;
}
