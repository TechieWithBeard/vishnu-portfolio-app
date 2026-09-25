import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
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

export interface BootLogItem {
  timestamp: string;
  message: string;
  type: 'info' | 'warn' | 'success';
}

export interface ServicesStatus {
  client: 'online';
  render: 'warming' | 'online' | 'error';
  supabase: 'standby' | 'online';
  langgraph: 'standby' | 'online';
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

  // Supabase Global High Score Signal (Persisted in DB & Cached)
  readonly globalHighScore = signal<number>(240);

  readonly defaultSkills: SkillCategory[] = [
    { id: 'cat-1', category: 'frontendArchitecture', categoryLabel: 'Frontend Architecture & Frameworks', items: fallbackResume.skills['frontendArchitecture'] || [], orderIndex: 1 },
    { id: 'cat-2', category: 'aiInterfaces', categoryLabel: 'AI & Intelligent Interfaces', items: fallbackResume.skills['aiInterfaces'] || [], orderIndex: 2 },
    { id: 'cat-3', category: 'testingQuality', categoryLabel: 'Testing, Quality & Accessibility', items: fallbackResume.skills['testingQuality'] || [], orderIndex: 3 },
    { id: 'cat-4', category: 'tooling', categoryLabel: 'Tooling, Cloud & Ecosystem', items: fallbackResume.skills['tooling'] || [], orderIndex: 4 },
  ];

  // State Signals (pre-hydrated with local-first verified data for 0ms FCP)
  readonly profile = signal<Resume>(fallbackResume);
  readonly experience = signal<ExperienceItem[]>(fallbackResume.experience);
  readonly projects = signal<Project[]>(fallbackProjects);
  readonly writing = signal<WritingItem[]>(fallbackWriting);
  readonly demos = signal<Demo[]>(fallbackDemos);
  readonly skills = signal<SkillCategory[]>(this.defaultSkills);

  // Section loaded flags (prevent duplicate fetches when navigating between tabs)
  readonly profileLoaded = signal<boolean>(false);
  readonly experienceLoaded = signal<boolean>(false);
  readonly projectsLoaded = signal<boolean>(false);
  readonly writingLoaded = signal<boolean>(false);
  readonly demosLoaded = signal<boolean>(false);
  readonly skillsLoaded = signal<boolean>(false);

  // Granular Loading State Signals (false initially for instant 0ms FCP rendering)
  readonly loadingProfile = signal<boolean>(false);
  readonly loadingExperience = signal<boolean>(false);
  readonly loadingProjects = signal<boolean>(false);
  readonly loadingWriting = signal<boolean>(false);
  readonly loadingDemos = signal<boolean>(false);
  readonly loadingSkills = signal<boolean>(false);

  // Global reactive loading indicator (true when any section is actively fetching)
  readonly loading = computed(
    () =>
      this.loadingProfile() ||
      this.loadingExperience() ||
      this.loadingProjects() ||
      this.loadingWriting() ||
      this.loadingDemos() ||
      this.loadingSkills()
  );

  readonly apiConnected = signal<boolean>(false);

  // Cloud Cold-Start & Warming State
  readonly cloudStatus = signal<'idle' | 'warming' | 'connected' | 'offline'>('idle');
  readonly elapsedSeconds = signal<number>(0);
  readonly bootProgress = signal<number>(0);
  readonly bootLogs = signal<BootLogItem[]>([]);
  readonly servicesStatus = signal<ServicesStatus>({
    client: 'online',
    render: 'warming',
    supabase: 'standby',
    langgraph: 'standby',
  });

  readonly isHudOpen = signal<boolean>(false);
  readonly activeHudTab = signal<'terminal' | 'arcade'>('terminal');

  private timerInterval: any = null;
  private warmupCheckTimeout: any = null;

  constructor() {
    try {
      const saved = localStorage.getItem('packet_runner_global_high');
      if (saved) {
        const num = parseInt(saved, 10);
        if (num > 0) this.globalHighScore.set(num);
      }
    } catch {}

    this.startCloudWarmupTracking();
    // Cold-boot optimization: only trigger initial wake-up probe and primary profile/skills on startup.
    // Heavy section data (experience, projects, writing, demos) will load on-demand when user visits those sections.
    this.fetchProfile();
    this.fetchSkills();
    this.fetchArcadeHighScore();
  }

  openHud(tab: 'terminal' | 'arcade' = 'terminal'): void {
    this.activeHudTab.set(tab);
    this.isHudOpen.set(true);
  }

  closeHud(): void {
    this.isHudOpen.set(false);
  }

  toggleHud(): void {
    this.isHudOpen.update((open) => !open);
  }

  setHudTab(tab: 'terminal' | 'arcade'): void {
    this.activeHudTab.set(tab);
  }

  private startCloudWarmupTracking(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.warmupCheckTimeout) clearTimeout(this.warmupCheckTimeout);

    this.elapsedSeconds.set(0);
    this.bootProgress.set(5);
    this.bootLogs.set([
      {
        timestamp: '00:01',
        message: '⚡ Probing Render cloud container status...',
        type: 'info',
      },
    ]);

    // Check after 2.5 seconds: if still not connected, Render is in cold sleep (30-50s spin-up)
    this.warmupCheckTimeout = setTimeout(() => {
      if (!this.apiConnected()) {
        this.cloudStatus.set('warming');
        this.appendBootLog('00:03', '💤 Render container idle in cold sleep. Initiating cloud spin-up...', 'warn');

        this.timerInterval = setInterval(() => {
          this.elapsedSeconds.update((s) => s + 1);
          const s = this.elapsedSeconds();

          // Smoothly interpolate progress up to 95% over ~50 seconds
          const progress = Math.min(95, Math.round(5 + (s / 50) * 90));
          this.bootProgress.set(progress);

          if (s === 12) {
            this.appendBootLog('00:12', '🐳 Allocating container resources & starting NestJS application server...', 'info');
            this.servicesStatus.update((curr) => ({ ...curr, render: 'warming' }));
          } else if (s === 24) {
            this.appendBootLog('00:24', '🗄️ Handshake with Supabase PostgreSQL connection pool...', 'info');
            this.servicesStatus.update((curr) => ({ ...curr, supabase: 'online' }));
          } else if (s === 36) {
            this.appendBootLog('00:36', '🧠 Initializing LangGraph AI Agent & WebMCP tools...', 'info');
            this.servicesStatus.update((curr) => ({ ...curr, langgraph: 'online' }));
          } else if (s === 48) {
            this.appendBootLog('00:48', '⏳ Finalizing HTTP readiness probe & SSL handshake...', 'info');
          }
        }, 1000);
      }
    }, 2500);
  }

  private appendBootLog(timestamp: string, message: string, type: 'info' | 'warn' | 'success'): void {
    this.bootLogs.update((logs) => [...logs, { timestamp, message, type }]);
  }

  private onCloudConnected(source: string): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.warmupCheckTimeout) {
      clearTimeout(this.warmupCheckTimeout);
      this.warmupCheckTimeout = null;
    }

    const elapsed = this.elapsedSeconds() || 1;
    const timeStr = elapsed < 10 ? `00:0${elapsed}` : `00:${elapsed}`;
    
    this.apiConnected.set(true);
    this.cloudStatus.set('connected');
    this.bootProgress.set(100);
    this.servicesStatus.set({
      client: 'online',
      render: 'online',
      supabase: 'online',
      langgraph: 'online',
    });

    this.appendBootLog(
      timeStr,
      `🚀 Container alive! HTTP 200 OK (${source}). Live cloud data synchronized.`,
      'success'
    );
    this.fetchArcadeHighScore();
  }

  refresh(): void {
    this.fetchAllData(true);
  }

  /**
   * Dispatches data fetch based on the navigated route.
   * If the section data is already loaded in memory, it resolves without duplicate network requests.
   */
  fetchForRoute(routePath: string, force = false): void {
    const cleanPath = routePath.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
    switch (cleanPath) {
      case '/':
        this.fetchProfile(force);
        this.fetchSkills(force);
        break;
      case '/experience':
        this.fetchExperience(force);
        this.fetchProfile(force); // Education data is housed within profile
        break;
      case '/projects':
        this.fetchProjects(force);
        break;
      case '/demos':
        this.fetchDemos(force);
        break;
      case '/writing':
        this.fetchWriting(force);
        break;
      case '/contact':
        this.fetchProfile(force);
        break;
      default:
        this.fetchProfile(force);
        break;
    }
  }

  /**
   * Fetches all portfolio data (used by full refresh or admin synchronization).
   */
  fetchAllData(force = true): void {
    this.fetchProfile(force);
    this.fetchSkills(force);
    this.fetchExperience(force);
    this.fetchProjects(force);
    this.fetchWriting(force);
    this.fetchDemos(force);
  }

  // ==============================================================================
  // Modular On-Demand Section Fetchers (with In-Memory Caching & Deduplication)
  // ==============================================================================

  fetchProfile(force = false): void {
    if (!force && (this.profileLoaded() || this.loadingProfile())) {
      return;
    }
    this.loadingProfile.set(true);

    this.http
      .get<any>(`${this.apiBase}/profile`)
      .pipe(
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
            this.profileLoaded.set(true);
            if (!this.apiConnected()) {
              this.onCloudConnected('Live API Synced');
            }
          } else {
            this.profile.set(fallbackResume);
          }
          this.loadingProfile.set(false);
        })
      )
      .subscribe();
  }

  fetchExperience(force = false): void {
    if (!force && (this.experienceLoaded() || this.loadingExperience())) {
      return;
    }
    this.loadingExperience.set(true);

    this.http
      .get<ExperienceItem[]>(`${this.apiBase}/experience`)
      .pipe(
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
            this.experienceLoaded.set(true);
            if (!this.apiConnected()) {
              this.onCloudConnected('Experience Synced');
            }
          } else {
            this.experience.set(fallbackResume.experience);
          }
          this.loadingExperience.set(false);
        })
      )
      .subscribe();
  }

  fetchProjects(force = false): void {
    if (!force && (this.projectsLoaded() || this.loadingProjects())) {
      return;
    }
    this.loadingProjects.set(true);

    this.http
      .get<Project[]>(`${this.apiBase}/projects`)
      .pipe(
        catchError(() => {
          this.projects.set(fallbackProjects);
          this.loadingProjects.set(false);
          return of(null);
        }),
        tap((data) => {
          if (data && data.length > 0) {
            this.projects.set(data);
            this.projectsLoaded.set(true);
            if (!this.apiConnected()) {
              this.onCloudConnected('Projects Synced');
            }
          } else {
            this.projects.set(fallbackProjects);
          }
          this.loadingProjects.set(false);
        })
      )
      .subscribe();
  }

  fetchWriting(force = false): void {
    if (!force && (this.writingLoaded() || this.loadingWriting())) {
      return;
    }
    this.loadingWriting.set(true);

    this.http
      .get<WritingItem[]>(`${this.apiBase}/writing`)
      .pipe(
        catchError(() => {
          this.writing.set(fallbackWriting);
          this.loadingWriting.set(false);
          return of(null);
        }),
        tap((data) => {
          if (Array.isArray(data)) {
            this.writing.set(data);
            this.writingLoaded.set(true);
            if (!this.apiConnected()) {
              this.onCloudConnected('Writing Synced');
            }
          }
          this.loadingWriting.set(false);
        })
      )
      .subscribe();
  }

  fetchDemos(force = false): void {
    if (!force && (this.demosLoaded() || this.loadingDemos())) {
      return;
    }
    this.loadingDemos.set(true);

    this.http
      .get<Demo[]>(`${this.apiBase}/demos`)
      .pipe(
        catchError(() => {
          this.demos.set(fallbackDemos);
          this.loadingDemos.set(false);
          return of(null);
        }),
        tap((data) => {
          if (data && data.length > 0) {
            this.demos.set(data);
            this.demosLoaded.set(true);
            if (!this.apiConnected()) {
              this.onCloudConnected('Demos Synced');
            }
          } else {
            this.demos.set(fallbackDemos);
          }
          this.loadingDemos.set(false);
        })
      )
      .subscribe();
  }

  fetchSkills(force = false): void {
    if (!force && (this.skillsLoaded() || this.loadingSkills())) {
      return;
    }
    this.loadingSkills.set(true);

    this.http
      .get<SkillCategory[]>(`${this.apiBase}/skills`)
      .pipe(
        catchError(() => {
          this.skills.set(this.defaultSkills);
          this.loadingSkills.set(false);
          return of(null);
        }),
        tap((data) => {
          if (data && data.length > 0) {
            this.skills.set(data);
            this.skillsLoaded.set(true);
            if (!this.apiConnected()) {
              this.onCloudConnected('Skills Synced');
            }
          } else {
            this.skills.set(this.defaultSkills);
          }
          this.loadingSkills.set(false);
        })
      )
      .subscribe();
  }

  // ==============================================================================
  // Supabase Cloud High Score Operations
  // ==============================================================================
  fetchArcadeHighScore(): void {
    this.http
      .get<{ highScore: number }>(`${this.apiBase}/arcade/high-score`)
      .pipe(
        catchError(() => of(null)),
        tap((res) => {
          if (res && typeof res.highScore === 'number' && res.highScore > 0) {
            this.globalHighScore.set(res.highScore);
            try {
              localStorage.setItem('packet_runner_global_high', res.highScore.toString());
            } catch {}
          }
        })
      )
      .subscribe();
  }

  submitArcadeScore(
    score: number,
    playerName: string = 'PacketRunner'
  ): Observable<{ highScore: number; isNewRecord: boolean }> {
    const cleanScore = Math.max(0, Math.floor(score));
    if (cleanScore > this.globalHighScore()) {
      this.globalHighScore.set(cleanScore);
      try {
        localStorage.setItem('packet_runner_global_high', cleanScore.toString());
      } catch {}
    }

    return this.http
      .post<{ success: boolean; highScore: number; isNewRecord: boolean }>(`${this.apiBase}/arcade/score`, {
        score: cleanScore,
        playerName,
      })
      .pipe(
        catchError(() =>
          of({ success: false, highScore: this.globalHighScore(), isNewRecord: false })
        ),
        tap((res) => {
          if (res && typeof res.highScore === 'number') {
            const updated = Math.max(this.globalHighScore(), res.highScore);
            this.globalHighScore.set(updated);
            try {
              localStorage.setItem('packet_runner_global_high', updated.toString());
            } catch {}
          }
        })
      );
  }
}
