export interface Resume {
  name: string;
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
    relocation: string;
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
