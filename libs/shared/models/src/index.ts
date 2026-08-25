export interface Resume {
  name: string;
  alias?: string;
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
    note?: string;
    relocation?: string;
  };
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: Record<string, string[]>;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  location?: string;
  highlights: string[];
  tech: string[];
  orderIndex?: number;
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
  orderIndex?: number;
}

export interface Demo {
  id: string;
  title: string;
  description: string;
  type: 'native-federation' | 'module-federation' | 'iframe';
  remoteName?: string;
  exposedModule?: string;
  url?: string;
  documentation?: string;
  video?: string;
  status: 'live' | 'planned' | 'wip';
  tech: string[];
  tags: string[];
  sandbox?: string;
  orderIndex?: number;
}

export interface WritingItem {
  id: string;
  title: string;
  platform: 'medium' | 'dev.to' | 'linkedin' | 'youtube' | 'hashnode' | 'other' | string;
  url: string;
  publishedAt: string;
  summary: string;
  tags: string[];
  thumbnail?: string;
  readTime?: string;
  featured?: boolean;
  orderIndex?: number;
}
