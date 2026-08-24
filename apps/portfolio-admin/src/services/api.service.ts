import {
  ProfileData,
  ExperienceItem,
  ProjectItem,
  WritingItem,
  DemoItem,
  SkillCategoryItem,
  HealthResponse,
} from '../types/admin.types';

const API_BASE = 'http://localhost:3000/api';

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
  createExperience: (data: Omit<ExperienceItem, 'id'> & { id?: string }) =>
    fetchJson<ExperienceItem>(`${API_BASE}/experience`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateExperience: (id: string, data: Partial<ExperienceItem>) =>
    fetchJson<ExperienceItem>(`${API_BASE}/experience/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteExperience: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/experience/${id}`, {
      method: 'DELETE',
    }),

  // Projects
  getProjects: () => fetchJson<ProjectItem[]>(`${API_BASE}/projects`),
  createProject: (data: Omit<ProjectItem, 'id'> & { id?: string }) =>
    fetchJson<ProjectItem>(`${API_BASE}/projects`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProject: (id: string, data: Partial<ProjectItem>) =>
    fetchJson<ProjectItem>(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProject: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
    }),

  // Writing
  getWriting: () => fetchJson<WritingItem[]>(`${API_BASE}/writing`),
  createWriting: (data: Omit<WritingItem, 'id'> & { id?: string }) =>
    fetchJson<WritingItem>(`${API_BASE}/writing`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateWriting: (id: string, data: Partial<WritingItem>) =>
    fetchJson<WritingItem>(`${API_BASE}/writing/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteWriting: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/writing/${id}`, {
      method: 'DELETE',
    }),

  // Demos
  getDemos: () => fetchJson<DemoItem[]>(`${API_BASE}/demos`),
  createDemo: (data: Omit<DemoItem, 'id'> & { id?: string }) =>
    fetchJson<DemoItem>(`${API_BASE}/demos`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateDemo: (id: string, data: Partial<DemoItem>) =>
    fetchJson<DemoItem>(`${API_BASE}/demos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteDemo: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/demos/${id}`, {
      method: 'DELETE',
    }),

  // Skills
  getSkills: () => fetchJson<SkillCategoryItem[]>(`${API_BASE}/skills`),
  updateSkills: (data: SkillCategoryItem[]) =>
    fetchJson<SkillCategoryItem[]>(`${API_BASE}/skills`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
