import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
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
  private readonly apiBase = '/api';

  // Signals
  readonly profile = signal<Resume>(fallbackResume);
  readonly experience = signal<ExperienceItem[]>(fallbackResume.experience);
  readonly projects = signal<Project[]>(fallbackProjects);
  readonly writing = signal<WritingItem[]>(fallbackWriting);
  readonly demos = signal<Demo[]>(fallbackDemos);
  readonly skills = signal<SkillCategory[]>([
    {
      id: 'cat-1',
      category: 'frontendArchitecture',
      categoryLabel: 'Frontend Architecture & Frameworks',
      items: fallbackResume.skills['frontendArchitecture'] || [],
      orderIndex: 1,
    },
    {
      id: 'cat-2',
      category: 'aiInterfaces',
      categoryLabel: 'AI & Intelligent Interfaces',
      items: fallbackResume.skills['aiInterfaces'] || [],
      orderIndex: 2,
    },
    {
      id: 'cat-3',
      category: 'testingQuality',
      categoryLabel: 'Testing, Quality & Accessibility',
      items: fallbackResume.skills['testingQuality'] || [],
      orderIndex: 3,
    },
    {
      id: 'cat-4',
      category: 'tooling',
      categoryLabel: 'Tooling, Cloud & Ecosystem',
      items: fallbackResume.skills['tooling'] || [],
      orderIndex: 4,
    },
  ]);

  readonly loading = signal<boolean>(false);
  readonly apiConnected = signal<boolean>(false);

  constructor() {
    this.fetchAllData();
  }

  fetchAllData(): void {
    this.loading.set(true);

    // Fetch Profile
    this.http
      .get<any>(`${this.apiBase}/profile`)
      .pipe(
        catchError(() => of(null)),
        tap((data) => {
          if (data) {
            this.profile.set({
              name: data.name || fallbackResume.name,
              alias: data.alias || fallbackResume.alias,
              title: data.title || fallbackResume.title,
              tagline: data.tagline || fallbackResume.tagline,
              location: data.location || fallbackResume.location,
              email: data.email || fallbackResume.email,
              phone: data.phone || fallbackResume.phone,
              linkedin: data.linkedin || fallbackResume.linkedin,
              github: data.github || fallbackResume.github,
              summary: data.summary || fallbackResume.summary,
              availability: data.availability || fallbackResume.availability,
              experience: this.experience(),
              education: fallbackResume.education,
              skills: data.skills || fallbackResume.skills,
            });
            this.apiConnected.set(true);
          }
        })
      )
      .subscribe();

    // Fetch Experience
    this.http
      .get<ExperienceItem[]>(`${this.apiBase}/experience`)
      .pipe(
        catchError(() => of(null)),
        tap((data) => {
          if (data && data.length > 0) {
            this.experience.set(data);
          }
        })
      )
      .subscribe();

    // Fetch Projects
    this.http
      .get<Project[]>(`${this.apiBase}/projects`)
      .pipe(
        catchError(() => of(null)),
        tap((data) => {
          if (data && data.length > 0) {
            this.projects.set(data);
          }
        })
      )
      .subscribe();

    // Fetch Writing
    this.http
      .get<WritingItem[]>(`${this.apiBase}/writing`)
      .pipe(
        catchError(() => of(null)),
        tap((data) => {
          if (data && data.length > 0) {
            this.writing.set(data);
          }
        })
      )
      .subscribe();

    // Fetch Demos
    this.http
      .get<Demo[]>(`${this.apiBase}/demos`)
      .pipe(
        catchError(() => of(null)),
        tap((data) => {
          if (data && data.length > 0) {
            this.demos.set(data);
          }
        })
      )
      .subscribe();

    // Fetch Skills
    this.http
      .get<SkillCategory[]>(`${this.apiBase}/skills`)
      .pipe(
        catchError(() => of(null)),
        tap((data) => {
          if (data && data.length > 0) {
            this.skills.set(data);
          }
          this.loading.set(false);
        })
      )
      .subscribe({
        complete: () => this.loading.set(false),
        error: () => this.loading.set(false),
      });
  }
}
