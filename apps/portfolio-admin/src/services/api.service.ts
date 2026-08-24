import {
  ProfileData,
  ExperienceItem,
  ProjectItem,
  WritingItem,
  DemoItem,
  SkillCategoryItem,
  HealthResponse,
} from '../types/admin.types';

function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const custom = (window as any).__PORTFOLIO_API_URL__ || (import.meta as any).env?.VITE_API_URL;
    if (custom) return custom;
    const host = window.location.hostname;
    if (host.includes('onrender.com') && !host.includes('-api')) {
      const apiHost = host.replace('-admin', '').replace('.onrender.com', '-api.onrender.com');
      return `https://${apiHost}/api`;
    }
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3000/api';
    }
  }
  return '/api';
}

const API_BASE = getApiBase();

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

export const AdminApi = {
  // Health
  getHealth: () => fetchJson<HealthResponse>(`${API_BASE}/health`),

  // Seed
  seedAll: () =>
    fetchJson<{ success: boolean; message: string }>(`${API_BASE}/seed`, {
      method: 'POST',
    }),

  // Profile
  getProfile: () => fetchJson<ProfileData>(`${API_BASE}/profile`),
  updateProfile: (data: Partial<ProfileData>) =>
    fetchJson<ProfileData>(`${API_BASE}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Experience
  getExperience: () => fetchJson<ExperienceItem[]>(`${API_BASE}/experience`),
  createExperience: (item: Omit<ExperienceItem, 'id'> & { id?: string }) =>
    fetchJson<ExperienceItem>(`${API_BASE}/experience`, {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  updateExperience: (id: string, item: Partial<ExperienceItem>) =>
    fetchJson<ExperienceItem>(`${API_BASE}/experience/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    }),
  deleteExperience: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/experience/${id}`, {
      method: 'DELETE',
    }),

  // Projects
  getProjects: (featuredOnly = false, category?: string) => {
    const params = new URLSearchParams();
    if (featuredOnly) params.append('featured', 'true');
    if (category) params.append('category', category);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<ProjectItem[]>(`${API_BASE}/projects${qs}`);
  },
  createProject: (item: Omit<ProjectItem, 'id'> & { id?: string }) =>
    fetchJson<ProjectItem>(`${API_BASE}/projects`, {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  updateProject: (id: string, item: Partial<ProjectItem>) =>
    fetchJson<ProjectItem>(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    }),
  deleteProject: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
    }),

  // Writing
  getWriting: (platform?: string) => {
    const qs = platform ? `?platform=${encodeURIComponent(platform)}` : '';
    return fetchJson<WritingItem[]>(`${API_BASE}/writing${qs}`);
  },
  createWriting: (item: Omit<WritingItem, 'id'> & { id?: string }) =>
    fetchJson<WritingItem>(`${API_BASE}/writing`, {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  updateWriting: (id: string, item: Partial<WritingItem>) =>
    fetchJson<WritingItem>(`${API_BASE}/writing/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    }),
  deleteWriting: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/writing/${id}`, {
      method: 'DELETE',
    }),

  // Demos
  getDemos: () => fetchJson<DemoItem[]>(`${API_BASE}/demos`),
  createDemo: (item: Omit<DemoItem, 'id'> & { id?: string }) =>
    fetchJson<DemoItem>(`${API_BASE}/demos`, {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  updateDemo: (id: string, item: Partial<DemoItem>) =>
    fetchJson<DemoItem>(`${API_BASE}/demos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    }),
  deleteDemo: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/demos/${id}`, {
      method: 'DELETE',
    }),

  // Skills
  getSkills: () => fetchJson<SkillCategoryItem[]>(`${API_BASE}/skills`),
  updateSkills: (skills: SkillCategoryItem[]) =>
    fetchJson<SkillCategoryItem[]>(`${API_BASE}/skills`, {
      method: 'PUT',
      body: JSON.stringify(skills),
    }),
};
