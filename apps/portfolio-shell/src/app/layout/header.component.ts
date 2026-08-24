import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PortfolioApiService } from '../services/portfolio-api.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <div class="header-inner">
        <a class="brand" routerLink="/" aria-label="Vishnu Thankappan Home">
          <span class="brand-mark">VT</span>
          <span class="brand-copy">
            <strong>{{ profile().name }}</strong>
            <small>{{ profile().alias }} • Senior UI & AI Architect</small>
          </span>
        </a>

        <nav class="nav-links" aria-label="Primary navigation">
          @for (link of links; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: link.path === '/' }"
            >
              {{ link.label }}
            </a>
          }
        </nav>

        <div class="header-actions">
          <div class="availability-badge" title="Open to high-impact European & Global opportunities">
            <span class="pulse-dot"></span>
            <span>Available</span>
          </div>

          <button
            class="theme-toggle"
            type="button"
            (click)="toggleTheme()"
            [attr.aria-label]="darkMode() ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
          >
            {{ darkMode() ? '☀️' : '🌙' }}
          </button>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  private readonly apiService = inject(PortfolioApiService);
  protected readonly profile = this.apiService.profile;

  protected readonly links = [
    { path: '/', label: 'Overview' },
    { path: '/experience', label: 'Experience' },
    { path: '/projects', label: 'Architecture & Projects' },
    { path: '/demos', label: 'Live Demos' },
    { path: '/writing', label: 'Articles' },
    { path: '/contact', label: 'Contact' },
  ];

  protected readonly darkMode = signal(
    typeof document !== 'undefined'
      ? document.documentElement.dataset['theme'] === 'dark' ||
        (!document.documentElement.dataset['theme'] &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      : true
  );

  constructor() {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset['theme'] = this.darkMode() ? 'dark' : 'light';
    }
  }

  protected toggleTheme(): void {
    const next = !this.darkMode();
    this.darkMode.set(next);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset['theme'] = next ? 'dark' : 'light';
    }
  }
}
