import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { resume } from '../data/portfolio.data';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <a class="brand" routerLink="/" aria-label="Vishnu Thankappan home">
        <span class="brand-mark">VT</span>
        <span class="brand-copy">
          <strong>Vishnu Thankappan</strong>
          <small>{{ alias }} - Frontend Architecture + AI Interfaces</small>
        </span>
      </a>

      <nav class="nav-links" aria-label="Primary navigation">
        @for (link of links; track link.path) {
          <a [routerLink]="link.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: link.path === '/' }">
            {{ link.label }}
          </a>
        }
      </nav>

      <button class="theme-toggle" type="button" (click)="toggleTheme()" [attr.aria-pressed]="darkMode()">
        {{ darkMode() ? 'Light' : 'Dark' }}
      </button>
    </header>
  `,
})
export class HeaderComponent {
  protected readonly alias = resume.alias;

  protected readonly links = [
    { path: '/', label: 'Home' },
    { path: '/experience', label: 'Experience' },
    { path: '/projects', label: 'Projects' },
    { path: '/demos', label: 'Demos' },
    { path: '/writing', label: 'Writing' },
    { path: '/contact', label: 'Contact' },
  ];

  protected readonly darkMode = signal(document.documentElement.dataset['theme'] === 'dark');

  protected toggleTheme(): void {
    const next = !this.darkMode();
    this.darkMode.set(next);
    document.documentElement.dataset['theme'] = next ? 'dark' : 'light';
  }
}
