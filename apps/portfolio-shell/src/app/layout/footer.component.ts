import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioApiService } from '../services/portfolio-api.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <div class="footer-inner">
        <div>
          <strong>{{ profile().name }}</strong>
          <p style="font-size: var(--text-xs); color: var(--text-muted); margin-bottom: 0;">
            Senior Frontend Engineer • Enterprise Nx Monorepos & AI-Powered Interfaces
          </p>
        </div>

        <nav class="footer-links" aria-label="Footer navigation">
          <a routerLink="/experience">Experience</a>
          <a routerLink="/projects">Projects</a>
          <a routerLink="/demos">Demos</a>
          <a routerLink="/writing">Writing</a>
          <a [href]="profile().linkedin" target="_blank" rel="noreferrer">LinkedIn</a>
          <a [href]="profile().github" target="_blank" rel="noreferrer">GitHub</a>
          <a href="http://localhost:5173" target="_blank" rel="noreferrer" title="Open Studio Admin UI" style="color: var(--color-accent); font-weight: 600;">
            ⚙️ Admin Studio
          </a>
        </nav>
      </div>
      <div style="width: min(1200px, calc(100% - 2.5rem)); margin: 1.5rem auto 0; padding-top: 1rem; border-top: 1px solid var(--color-border); font-size: var(--text-xs); color: var(--text-muted); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
        <span>© {{ currentYear }} Vishnu Thankappan. All rights reserved.</span>
        <span>Built with Nx • Angular 22 • NestJS • Supabase • React 19 Admin</span>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  private readonly apiService = inject(PortfolioApiService);
  protected readonly profile = this.apiService.profile;
  readonly currentYear = new Date().getFullYear();
}
