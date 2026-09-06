import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, delay, of, tap } from 'rxjs';
import {
  Resume,
  Project,
  Demo,
  WritingItem,
  resume as fallbackResume,
  projects as fallbackProjects,
  demos as fallbackDemos,
  writing as fallbackWriting,
  ExperienceItem,
} from '../data/portfolio.data';

import { APP_CONFIG } from '../core/config/app-config.token';

export interface SkillCategory {
  id: string;
  category: string;
  categoryLabel: string;
  items: string[];
  orderIndex: number;
}

@Injectable({
  providedIn: 'root',
})
export class PortfolioApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  
  private get apiBase(): string {
    return this.config.apiUrl;
  }

  // State Signals
  readonly profile = signal<Resume>(fallbackResume);
  readonly experience = signal<ExperienceItem[]>([]);
  readonly projects = signal<Project[]>([]);
  readonly writing = signal<WritingItem[]>([]);
  readonly demos = signal<Demo[]>([]);
  readonly skills = signal<SkillCategory[]>([]);

  // Granular Loading State Signals for Skeletons
  readonly loading = signal<boolean>(true);
  readonly loadingProfile = signal<boolean>(true);
  readonly loadingExperience = signal<boolean>(true);
  readonly loadingProjects = signal<boolean>(true);
  readonly loadingWriting = signal<boolean>(true);
  readonly loadingDemos = signal<boolean>(true);
  readonly loadingSkills = signal<boolean>(true);

  readonly apiConnected = signal<boolean>(false);

  constructor() {
    this.fetchAllData();
  }

  refresh(): void {
    this.fetchAllData();
  }

  fetchAllData(): void {
    this.loading.set(true);
    this.loadingProfile.set(true);
    this.loadingExperience.set(true);
    this.loadingProjects.set(true);
    this.loadingWriting.set(true);
    this.loadingDemos.set(true);
    this.loadingSkills.set(true);

    // Fetch Profile
    this.http
      .get<any>(`${this.apiBase}/profile`)
      .pipe(
        delay(400),
        catchError((err) => {
          console.warn('[PortfolioApiService] /api/profile offline, using fallback:', err?.message || err);
          this.profile.set(fallbackResume);
          this.loadingProfile.set(false);
          return of(null);
        }),
        tap((data) => {
          if (data) {
            const cleanLocation = (data.location || fallbackResume.location)
              .replace(/\s*\([^)]*(?:global|eu|opportunit|relo)[^)]*\)/gi, '')
              .trim();
            const cleanAvailability = data.availability ? {
              status: /open|seeking/i.test(data.availability.status || '') ? fallbackResume.availability.status : (data.availability.status || fallbackResume.availability.status),
              target: data.availability.target || fallbackResume.availability.target,
              note: /opportunit|avail/i.test(data.availability.note || '') ? fallbackResume.availability.note : (data.availability.note || fallbackResume.availability.note),
            } : fallbackResume.availability;

            this.profile.set({
              name: data.name || fallbackResume.name,
              alias: data.alias || fallbackResume.alias,
              title: data.title || fallbackResume.title,
              tagline: data.tagline || fallbackResume.tagline,
              location: cleanLocation,
              email: data.email || fallbackResume.email,
              phone: data.phone || fallbackResume.phone,
              linkedin: data.linkedin || fallbackResume.linkedin,
              github: data.github || fallbackResume.github,
              summary: data.summary || fallbackResume.summary,
              availability: cleanAvailability,
              experience: this.experience(),
              education: fallbackResume.education,
              skills: data.skills || fallbackResume.skills,
            });
            this.apiConnected.set(true);
          } else {
            this.profile.set(fallbackResume);
          }
          this.loadingProfile.set(false);
        })
      )
      .subscribe();

    // Fetch Experience
    this.http
      .get<ExperienceItem[]>(`${this.apiBase}/experience`)
      .pipe(
        delay(450),
        catchError(() => {
          this.experience.set(fallbackResume.experience);
          this.loadingExperience.set(false);
          return of(null);
        }),
        tap((data) => {
          if (data && data.length > 0) {
            const cleanExp = data.map((item) => ({
              ...item,
              location: item.location?.replace(/European (Enterprise|Client) Environment/gi, (m) =>
                m.includes('Client') ? 'Enterprise AI SaaS (Global)' : 'Industrial SaaS (Global)'
              ) || item.location,
            }));
            this.experience.set(cleanExp);
          } else {
            this.experience.set(fallbackResume.experience);
          }
          this.loadingExperience.set(false);
        })
      )
      .subscribe();

    // Fetch Projects
    this.http
      .get<Project[]>(`${this.apiBase}/projects`)
      .pipe(
        delay(500),
        catchError(() => {
          this.projects.set(fallbackProjects);
          this.loadingProjects.set(false);
          return of(null);
        }),
        tap((data) => {
          if (data && data.length > 0) {
            this.projects.set(data);
          } else {
            this.projects.set(fallbackProjects);
          }
          this.loadingProjects.set(false);
        })
      )
      .subscribe();

    // Fetch Writing
    this.http
      .get<WritingItem[]>(`${this.apiBase}/writing`)
      .pipe(
        delay(500),
        catchError(() => {
          this.writing.set(fallbackWriting);
          this.loadingWriting.set(false);
          return of(null);
        }),
        tap((data) => {
          if (data && data.length > 0) {
            this.writing.set(data);
          } else {
            this.writing.set(fallbackWriting);
          }
          this.loadingWriting.set(false);
        })
      )
      .subscribe();

    // Fetch Demos
    this.http
      .get<Demo[]>(`${this.apiBase}/demos`)
      .pipe(
        delay(550),
        catchError(() => {
          this.demos.set(fallbackDemos);
          this.loadingDemos.set(false);
          return of(null);
        }),
        tap((data) => {
          if (data && data.length > 0) {
            this.demos.set(data);
          } else {
            this.demos.set(fallbackDemos);
          }
          this.loadingDemos.set(false);
        })
      )
      .subscribe();

    // Fetch Skills
    this.http
      .get<SkillCategory[]>(`${this.apiBase}/skills`)
      .pipe(
        delay(550),
        catchError(() => {
          this.skills.set([
            { id: 'cat-1', category: 'frontendArchitecture', categoryLabel: 'Frontend Architecture & Frameworks', items: fallbackResume.skills['frontendArchitecture'] || [], orderIndex: 1 },
            { id: 'cat-2', category: 'aiInterfaces', categoryLabel: 'AI & Intelligent Interfaces', items: fallbackResume.skills['aiInterfaces'] || [], orderIndex: 2 },
            { id: 'cat-3', category: 'testingQuality', categoryLabel: 'Testing, Quality & Accessibility', items: fallbackResume.skills['testingQuality'] || [], orderIndex: 3 },
            { id: 'cat-4', category: 'tooling', categoryLabel: 'Tooling, Cloud & Ecosystem', items: fallbackResume.skills['tooling'] || [], orderIndex: 4 },
          ]);
          this.loadingSkills.set(false);
          this.loading.set(false);
          return of(null);
        }),
        tap((data) => {
          if (data && data.length > 0) {
            this.skills.set(data);
          } else {
            this.skills.set([
              { id: 'cat-1', category: 'frontendArchitecture', categoryLabel: 'Frontend Architecture & Frameworks', items: fallbackResume.skills['frontendArchitecture'] || [], orderIndex: 1 },
              { id: 'cat-2', category: 'aiInterfaces', categoryLabel: 'AI & Intelligent Interfaces', items: fallbackResume.skills['aiInterfaces'] || [], orderIndex: 2 },
              { id: 'cat-3', category: 'testingQuality', categoryLabel: 'Testing, Quality & Accessibility', items: fallbackResume.skills['testingQuality'] || [], orderIndex: 3 },
              { id: 'cat-4', category: 'tooling', categoryLabel: 'Tooling, Cloud & Ecosystem', items: fallbackResume.skills['tooling'] || [], orderIndex: 4 },
            ]);
          }
          this.loadingSkills.set(false);
          this.loading.set(false);
        })
      )
      .subscribe();
  }
}
