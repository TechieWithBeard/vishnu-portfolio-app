import {
  ProfileData,
  ExperienceItem,
  ProjectItem,
  WritingItem,
  DemoItem,
  SkillCategoryItem,
  HealthResponse,
} from '../types/admin.types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

// ---------------------------------------------------------------------------
// Demo / Recruiter Sandbox Mode Detection & State Management
// ---------------------------------------------------------------------------
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === 'true' || params.get('sandbox') === 'true') {
      sessionStorage.setItem('portfolio_admin_demo_mode', 'true');
      return true;
    }
    // If embedded in an iframe inside the portfolio shell, default to demo mode
    if (window.self !== window.top) {
      sessionStorage.setItem('portfolio_admin_demo_mode', 'true');
      return true;
    }
    return sessionStorage.getItem('portfolio_admin_demo_mode') === 'true';
  } catch {
    return false;
  }
}

const STORAGE_KEY = 'portfolio_admin_sandbox_state_v1';

interface DemoStore {
  profile: ProfileData | null;
  experience: ExperienceItem[] | null;
  projects: ProjectItem[] | null;
  writing: WritingItem[] | null;
  demos: DemoItem[] | null;
  skills: SkillCategoryItem[] | null;
}

let inMemoryStore: DemoStore = {
  profile: null,
  experience: null,
  projects: null,
  writing: null,
  demos: null,
  skills: null,
};

function loadStoredState(): DemoStore {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('[Sandbox] Error reading session storage:', err);
  }
  return inMemoryStore;
}

function saveStoredState(store: DemoStore): void {
  inMemoryStore = store;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.warn('[Sandbox] Error saving session storage:', err);
  }
}

export function resetDemoData(): void {
  inMemoryStore = {
    profile: null,
    experience: null,
    projects: null,
    writing: null,
    demos: null,
    skills: null,
  };
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText || res.statusText}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Admin API Service with Sandbox Mutation Interceptors
// ---------------------------------------------------------------------------
export const AdminApi = {
  isDemoMode,
  resetDemoData,

  // Health
  getHealth: async (): Promise<HealthResponse> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      return {
        status: 'healthy (sandbox)',
        storageMode: 'local-store',
        supabaseConfigured: true,
        counts: {
          experience: state.experience ? state.experience.length : 3,
          projects: state.projects ? state.projects.length : 4,
          writing: state.writing ? state.writing.length : 3,
          demos: state.demos ? state.demos.length : 3,
          skillCategories: state.skills ? state.skills.length : 5,
        },
        timestamp: new Date().toISOString(),
      };
    }
    return fetchJson<HealthResponse>(`${API_BASE}/health`);
  },

  // Seed / Reset All
  seedAll: async () => {
    if (isDemoMode()) {
      resetDemoData();
      return {
        success: true,
        message: '🧪 Sandbox state reset to default live data (Live DB untouched)!',
      };
    }
    return fetchJson<{ success: boolean; message: string }>(`${API_BASE}/seed`, {
      method: 'POST',
    });
  },

  // Profile
  getProfile: async (): Promise<ProfileData> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      if (state.profile) return state.profile;
      try {
        const live = await fetchJson<ProfileData>(`${API_BASE}/profile`);
        state.profile = live;
        saveStoredState(state);
        return live;
      } catch {
        const fallback: ProfileData = {
          id: 'vishnu-thankappan',
          name: 'Vishnu Thankappan',
          alias: 'TechieWithBeard',
          title: 'Senior Frontend Engineer & AI Architect',
          tagline: 'Senior Frontend Architect & AI Systems Specialist',
          location: 'Bangalore, India',
          email: 'vishnunadaar111@gmail.com',
          phone: '+91 98765 43210',
          github: 'https://github.com/TechieWithBeard',
          linkedin: 'https://www.linkedin.com/in/vishnuthankappan/',
          summary: 'Passionate frontend engineer architecting enterprise Angular and React applications, microfrontends, and production LangGraph AI interfaces.',
          availability: {
            status: 'available',
            target: 'Senior / Staff Frontend Architect',
            note: 'Open for high-impact enterprise frontend and AI engineering roles.',
          },
          skills: {},
        };
        state.profile = fallback;
        saveStoredState(state);
        return fallback;
      }
    }
    return fetchJson<ProfileData>(`${API_BASE}/profile`);
  },

  updateProfile: async (data: Partial<ProfileData>): Promise<ProfileData> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      const current = state.profile || (await AdminApi.getProfile());
      const updated = { ...current, ...data };
      state.profile = updated;
      saveStoredState(state);
      return updated;
    }
    return fetchJson<ProfileData>(`${API_BASE}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Experience
  getExperience: async (): Promise<ExperienceItem[]> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      if (state.experience) return state.experience;
      try {
        const live = await fetchJson<ExperienceItem[]>(`${API_BASE}/experience`);
        state.experience = live;
        saveStoredState(state);
        return live;
      } catch {
        return [];
      }
    }
    return fetchJson<ExperienceItem[]>(`${API_BASE}/experience`);
  },

  createExperience: async (
    item: Omit<ExperienceItem, 'id'> & { id?: string }
  ): Promise<ExperienceItem> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      const current = state.experience || (await AdminApi.getExperience());
      const created: ExperienceItem = {
        ...item,
        id: item.id || `exp-${Date.now()}`,
      } as ExperienceItem;
      state.experience = [created, ...current];
      saveStoredState(state);
      return created;
    }
    return fetchJson<ExperienceItem>(`${API_BASE}/experience`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  updateExperience: async (
    id: string,
    item: Partial<ExperienceItem>
  ): Promise<ExperienceItem> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      const current = state.experience || (await AdminApi.getExperience());
      let updatedItem: ExperienceItem | null = null;
      state.experience = current.map((e) => {
        if (e.id === id) {
          updatedItem = { ...e, ...item };
          return updatedItem;
        }
        return e;
      });
      saveStoredState(state);
      return updatedItem || (item as ExperienceItem);
    }
    return fetchJson<ExperienceItem>(`${API_BASE}/experience/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  deleteExperience: async (id: string): Promise<{ success: boolean }> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      const current = state.experience || (await AdminApi.getExperience());
      state.experience = current.filter((e) => e.id !== id);
      saveStoredState(state);
      return { success: true };
    }
    return fetchJson<{ success: boolean }>(`${API_BASE}/experience/${id}`, {
      method: 'DELETE',
    });
  },

  // Projects
  getProjects: async (
    featuredOnly = false,
    category?: string
  ): Promise<ProjectItem[]> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      let list = state.projects;
      if (!list) {
        try {
          list = await fetchJson<ProjectItem[]>(`${API_BASE}/projects`);
        } catch {
          list = [];
        }
        state.projects = list;
        saveStoredState(state);
      }
      let filtered = [...list];
      if (featuredOnly) filtered = filtered.filter((p) => p.featured);
      if (category)
        filtered = filtered.filter(
          (p) => p.category.toLowerCase() === category.toLowerCase()
        );
      return filtered;
    }

    const params = new URLSearchParams();
    if (featuredOnly) params.append('featured', 'true');
    if (category) params.append('category', category);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<ProjectItem[]>(`${API_BASE}/projects${qs}`);
  },

  createProject: async (
    item: Omit<ProjectItem, 'id'> & { id?: string }
  ): Promise<ProjectItem> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      const current = state.projects || (await AdminApi.getProjects());
      const created: ProjectItem = {
        ...item,
        id: item.id || `proj-${Date.now()}`,
      } as ProjectItem;
      state.projects = [created, ...current];
      saveStoredState(state);
      return created;
    }
    return fetchJson<ProjectItem>(`${API_BASE}/projects`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  updateProject: async (
    id: string,
    item: Partial<ProjectItem>
  ): Promise<ProjectItem> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      const current = state.projects || (await AdminApi.getProjects());
      let updatedItem: ProjectItem | null = null;
      state.projects = current.map((p) => {
        if (p.id === id) {
          updatedItem = { ...p, ...item };
          return updatedItem;
        }
        return p;
      });
      saveStoredState(state);
      return updatedItem || (item as ProjectItem);
    }
    return fetchJson<ProjectItem>(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  deleteProject: async (id: string): Promise<{ success: boolean }> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      const current = state.projects || (await AdminApi.getProjects());
      state.projects = current.filter((p) => p.id !== id);
      saveStoredState(state);
      return { success: true };
    }
    return fetchJson<{ success: boolean }>(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
    });
  },

  // Writing
  getWriting: async (platform?: string): Promise<WritingItem[]> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      let list = state.writing;
      if (!list) {
        try {
          list = await fetchJson<WritingItem[]>(`${API_BASE}/writing`);
        } catch {
          list = [];
        }
        state.writing = list;
        saveStoredState(state);
      }
      let filtered = [...list];
      if (platform)
        filtered = filtered.filter(
          (w) => w.platform.toLowerCase() === platform.toLowerCase()
        );
      return filtered;
    }

    const qs = platform ? `?platform=${encodeURIComponent(platform)}` : '';
    return fetchJson<WritingItem[]>(`${API_BASE}/writing${qs}`);
  },

  createWriting: async (
    item: Omit<WritingItem, 'id'> & { id?: string }
  ): Promise<WritingItem> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      const current = state.writing || (await AdminApi.getWriting());
      const created: WritingItem = {
        ...item,
        id: item.id || `art-${Date.now()}`,
      } as WritingItem;
      state.writing = [created, ...current];
      saveStoredState(state);
      return created;
    }
    return fetchJson<WritingItem>(`${API_BASE}/writing`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  updateWriting: async (
    id: string,
    item: Partial<WritingItem>
  ): Promise<WritingItem> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      const current = state.writing || (await AdminApi.getWriting());
      let updatedItem: WritingItem | null = null;
      state.writing = current.map((w) => {
        if (w.id === id) {
          updatedItem = { ...w, ...item };
          return updatedItem;
        }
        return w;
      });
      saveStoredState(state);
      return updatedItem || (item as WritingItem);
    }
    return fetchJson<WritingItem>(`${API_BASE}/writing/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  deleteWriting: async (id: string): Promise<{ success: boolean }> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      const current = state.writing || (await AdminApi.getWriting());
      state.writing = current.filter((w) => w.id !== id);
      saveStoredState(state);
      return { success: true };
    }
    return fetchJson<{ success: boolean }>(`${API_BASE}/writing/${id}`, {
      method: 'DELETE',
    });
  },

  // Demos
  getDemos: async (): Promise<DemoItem[]> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      if (state.demos) return state.demos;
      try {
        const live = await fetchJson<DemoItem[]>(`${API_BASE}/demos`);
        state.demos = live;
        saveStoredState(state);
        return live;
      } catch {
        return [];
      }
    }
    return fetchJson<DemoItem[]>(`${API_BASE}/demos`);
  },

  createDemo: async (
    item: Omit<DemoItem, 'id'> & { id?: string }
  ): Promise<DemoItem> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      const current = state.demos || (await AdminApi.getDemos());
      const created: DemoItem = {
        ...item,
        id: item.id || `demo-${Date.now()}`,
      } as DemoItem;
      state.demos = [created, ...current];
      saveStoredState(state);
      return created;
    }
    return fetchJson<DemoItem>(`${API_BASE}/demos`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  updateDemo: async (
    id: string,
    item: Partial<DemoItem>
  ): Promise<DemoItem> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      const current = state.demos || (await AdminApi.getDemos());
      let updatedItem: DemoItem | null = null;
      state.demos = current.map((d) => {
        if (d.id === id) {
          updatedItem = { ...d, ...item };
          return updatedItem;
        }
        return d;
      });
      saveStoredState(state);
      return updatedItem || (item as DemoItem);
    }
    return fetchJson<DemoItem>(`${API_BASE}/demos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  deleteDemo: async (id: string): Promise<{ success: boolean }> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      const current = state.demos || (await AdminApi.getDemos());
      state.demos = current.filter((d) => d.id !== id);
      saveStoredState(state);
      return { success: true };
    }
    return fetchJson<{ success: boolean }>(`${API_BASE}/demos/${id}`, {
      method: 'DELETE',
    });
  },

  // Skills
  getSkills: async (): Promise<SkillCategoryItem[]> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      if (state.skills) return state.skills;
      try {
        const live = await fetchJson<SkillCategoryItem[]>(`${API_BASE}/skills`);
        state.skills = live;
        saveStoredState(state);
        return live;
      } catch {
        return [];
      }
    }
    return fetchJson<SkillCategoryItem[]>(`${API_BASE}/skills`);
  },

  updateSkills: async (
    skills: SkillCategoryItem[]
  ): Promise<SkillCategoryItem[]> => {
    if (isDemoMode()) {
      const state = loadStoredState();
      state.skills = skills;
      saveStoredState(state);
      return skills;
    }
    return fetchJson<SkillCategoryItem[]>(`${API_BASE}/skills`, {
      method: 'PUT',
      body: JSON.stringify(skills),
    });
  },
};
