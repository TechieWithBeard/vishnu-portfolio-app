import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PortfolioApiService } from '../services/portfolio-api.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <!-- Global Top Loading Progress Bar -->
      @if (loading()) {
        <div class="top-loader-bar" aria-label="Loading portfolio data"></div>
      }

      <div class="header-inner">
        <a class="brand" routerLink="/" (click)="closeMobileMenu()" aria-label="Vishnu Thankappan Home">
          <span class="brand-mark">VT</span>
          <span class="brand-copy">
            <strong>{{ profile().name }}</strong>
            <small>{{ profile().alias }} • Senior UI & AI Architect</small>
          </span>
        </a>

        <!-- Desktop Navigation -->
        <nav class="nav-links desktop-nav" aria-label="Primary navigation">
          @for (link of links; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: link.path === '/' }"
            >
              {{ link.label }}
              @if (link.badge) {
                <span class="nav-framework-pill">{{ link.badge }}</span>
              }
            </a>
          }
        </nav>

        <div class="header-actions">

          <!-- Theme Toggle with LocalStorage Persistence -->
          <button
            class="theme-toggle"
            type="button"
            (click)="toggleTheme()"
            [attr.aria-label]="darkMode() ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
          >
            {{ darkMode() ? '☀️' : '🌙' }}
          </button>

          <!-- Mobile Hamburger Toggle -->
          <button
            class="mobile-menu-toggle"
            type="button"
            (click)="toggleMobileMenu()"
            [attr.aria-expanded]="mobileMenuOpen()"
            aria-label="Toggle navigation menu"
          >
            {{ mobileMenuOpen() ? '✕' : '☰' }}
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Navigation -->
      @if (mobileMenuOpen()) {
        <nav class="mobile-nav" aria-label="Mobile navigation">
          @for (link of links; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: link.path === '/' }"
              (click)="closeMobileMenu()"
            >
              {{ link.label }}
              @if (link.badge) {
                <span class="nav-framework-pill">{{ link.badge }}</span>
              }
            </a>
          }
        </nav>
      }
    </header>
  `,
})
export class HeaderComponent {
  private readonly apiService = inject(PortfolioApiService);
  protected readonly profile = this.apiService.profile;
  protected readonly loading = this.apiService.loading;

  protected readonly mobileMenuOpen = signal<boolean>(false);

  protected readonly links: Array<{ path: string; label: string; badge?: string }> = [
    { path: '/', label: 'Overview' },
    { path: '/experience', label: 'Experience' },
    // { path: '/projects', label: 'Projects' },
    { path: '/demos', label: 'Live Demos' },
    { path: '/admin-studio', label: 'Admin Studio', badge: 'React 19' },
    { path: '/writing', label: 'Articles' },
    { path: '/contact', label: 'Contact' },
  ];

  protected readonly darkMode = signal<boolean>(this.getInitialTheme());

  constructor() {
    this.applyTheme(this.darkMode());
  }

  private getInitialTheme(): boolean {
    if (typeof window === 'undefined') return true;
    try {
      const saved = localStorage.getItem('portfolio-theme');
      if (saved === 'light') return false;
      if (saved === 'dark') return true;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return true;
    }
  }

  private applyTheme(isDark: boolean): void {
    if (typeof document === 'undefined') return;
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.dataset['theme'] = theme;
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('portfolio-theme', theme);
    } catch {}
  }

  protected toggleTheme(): void {
    const next = !this.darkMode();
    this.darkMode.set(next);
    this.applyTheme(next);
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
