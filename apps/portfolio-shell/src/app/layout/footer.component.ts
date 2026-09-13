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
        </nav>
      </div>
      <div style="width: min(1200px, calc(100% - 2.5rem)); margin: 1.5rem auto 0; padding-top: 1rem; border-top: 1px solid var(--color-border); font-size: var(--text-xs); color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <span>© {{ currentYear }} Vishnu Thankappan. All rights reserved.</span>
        <div class="footer-stack-badges" style="display: inline-flex; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <span style="color: var(--color-text-muted); font-size: 0.72rem; margin-right: 0.15rem;">Architecture:</span>
          <!-- Angular 22 -->
          <span class="footer-tech-chip" title="Angular 22 — Frontend Shell with Zoneless Signals">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" aria-hidden="true"><path d="M12 2.5L2.5 5.875L3.95 17.5L12 21.5L20.05 17.5L21.5 5.875L12 2.5Z" fill="#F43F5E"/><path d="M12 5L6.5 17H8.7L9.9 14.2H14.1L15.3 17H17.5L12 5ZM12 8.8L13.4 12.3H10.6L12 8.8Z" fill="#fff"/></svg>
            Angular 22
          </span>
          <!-- Nx -->
          <span class="footer-tech-chip" title="Nx Monorepo — Smart Computation Cache & Multi-app Workspace">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" aria-hidden="true"><path d="M4 4.5h3.8l6.4 9.8V4.5H18v15h-3.8L7.8 9.7v9.8H4v-15z" fill="#00C2D8"/></svg>
            Nx
          </span>
          <!-- NestJS -->
          <span class="footer-tech-chip" title="NestJS 11 — Enterprise TypeScript API & MCP SSE Server">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="#E11D48" aria-hidden="true"><path d="M12 0c-6.6 0-12 5.4-12 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm6.3 8.4c.2.9.1 1.8-.3 2.7l-1.4 2.9c-.6 1.3-1.8 2.2-3.2 2.6-1.4.3-2.9 0-4-1l-2-1.7c-.7-.6-1.2-1.5-1.3-2.4-.1-.9.1-1.9.7-2.6l1.7-2.1c.6-.7 1.4-1.2 2.3-1.4.9-.1 1.9.1 2.7.6l1.3.9c.3.2.7.3 1 .2.4-.1.7-.3.9-.6l.5-.8c.2-.3.7-.5 1.1-.4.4.1.7.5.8.9l.2 1.3z"/></svg>
            NestJS
          </span>
          <!-- Supabase -->
          <span class="footer-tech-chip" title="Supabase — PostgreSQL Database with Row-Level Security">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" aria-hidden="true"><path d="M13.4 1.2L2.7 14.1c-.4.5-.1 1.3.6 1.3h7.2l-1.3 7.4c-.1.8.8 1.3 1.4.7l10.7-12.9c.4-.5.1-1.3-.6-1.3h-7.2l1.3-7.4c.1-.8-.8-1.3-1.4-.7z" fill="#3ECF8E"/></svg>
            Supabase
          </span>
          <!-- WebMCP -->
          <span class="footer-tech-chip" title="WebMCP — Model Context Protocol & window.agentAPI">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" fill="#8B5CF6" fill-opacity="0.2" stroke="#8B5CF6" stroke-width="1.5"/><circle cx="8" cy="8" r="2" fill="#C4B5FD"/><circle cx="16" cy="8" r="2" fill="#C4B5FD"/><circle cx="12" cy="15.5" r="2.5" fill="#8B5CF6"/></svg>
            WebMCP
          </span>
          <!-- Render -->
          <span class="footer-tech-chip" title="Render — Automated Zero-Downtime Cloud Deployment">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" aria-hidden="true"><path d="M11.4 2.5H2v19h4.8V7.3h4.6V2.5z" fill="#46E3B7"/><path d="M17.8 2.5H13v14.2H8.2v4.8H22V2.5h-4.2z" fill="#10B981"/></svg>
            Render
          </span>
          <!-- Cloud HUD & Dev Arcade Link -->
          <button
            type="button"
            class="footer-tech-chip footer-arcade-btn"
            (click)="openArcade()"
            title="Open Cloud Cold-Start Monitor & Packet Runner Mini-Game"
            style="cursor: pointer; background: rgba(56, 189, 248, 0.1); border-color: rgba(56, 189, 248, 0.3); color: #38bdf8;"
          >
            🎮 Cloud HUD & Arcade
          </button>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-tech-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      color: var(--color-text-secondary);
      background: var(--color-bg-subtle);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 0.15rem 0.45rem;
      cursor: default;
      transition: all var(--transition-fast);
      user-select: none;
    }
    .footer-tech-chip:hover {
      border-color: var(--color-accent);
      color: var(--color-text-primary);
      transform: translateY(-1px);
    }
  `],
})
export class FooterComponent {
  private readonly apiService = inject(PortfolioApiService);
  protected readonly profile = this.apiService.profile;
  readonly currentYear = new Date().getFullYear();

  openArcade(): void {
    this.apiService.openHud('arcade');
  }
}
