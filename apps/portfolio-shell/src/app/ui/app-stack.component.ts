import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface StackItem {
  id: string;
  name: string;
  category: string;
  badge: string;
  color: string;
  bgSubtle: string;
  borderGlow: string;
  summary: string;
  repoPath: string;
  highlights: string[];
  actionLabel?: string;
  actionLink?: string;
  isExternal?: boolean;
}

@Component({
  selector: 'app-app-stack',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="app-stack-section" aria-label="Application Architecture and Technology Stack">
      <div class="stack-header">
        <div class="stack-badge-title">
          <span class="pulse-indicator" aria-hidden="true"></span>
          <span class="eyebrow" style="margin-bottom: 0;">Platform Engineering & Stack</span>
        </div>
        <p class="stack-subtitle">
          Built as an enterprise full-stack platform. Click any technology to inspect its role in this repository.
        </p>
      </div>

      <!-- Tech Stack Badges Strip -->
      <div class="stack-grid" role="tablist" aria-label="Technology Stack Pills">
        @for (item of stackItems; track item.id) {
          <button
            type="button"
            class="stack-pill"
            [class.active]="activeTech()?.id === item.id"
            [style.--pill-color]="item.color"
            [style.--pill-bg]="item.bgSubtle"
            [style.--pill-glow]="item.borderGlow"
            (click)="toggleTech(item)"
            role="tab"
            [attr.aria-selected]="activeTech()?.id === item.id"
            [attr.aria-controls]="'panel-' + item.id"
          >
            <!-- Custom Branded Vector SVG Icons -->
            <div class="pill-icon" aria-hidden="true">
              @switch (item.id) {
                @case ('angular') {
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <path d="M12 2.5L2.5 5.875L3.95 17.5L12 21.5L20.05 17.5L21.5 5.875L12 2.5Z" fill="url(#ng-stack-grad)"/>
                    <path d="M12 5L6.5 17H8.7L9.9 14.2H14.1L15.3 17H17.5L12 5ZM12 8.8L13.4 12.3H10.6L12 8.8Z" fill="#ffffff"/>
                    <defs>
                      <linearGradient id="ng-stack-grad" x1="2.5" y1="2.5" x2="21.5" y2="21.5" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#E40046"/>
                        <stop offset="1" stop-color="#F637E3"/>
                      </linearGradient>
                    </defs>
                  </svg>
                }
                @case ('nx') {
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <path d="M4 4.5h3.8l6.4 9.8V4.5H18v15h-3.8L7.8 9.7v9.8H4v-15z" fill="#00C2D8"/>
                    <path d="M14.5 4.5L20 12l-5.5 7.5h2.8L22 12l-4.7-7.5h-2.8z" fill="#0284C7" opacity="0.85"/>
                  </svg>
                }
                @case ('nestjs') {
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#E11D48">
                    <path d="M12.001 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.27 8.35c.16.89.06 1.83-.34 2.65l-1.39 2.88c-.62 1.28-1.78 2.22-3.17 2.56-1.39.34-2.85-.02-3.99-.99l-2.02-1.71c-.72-.61-1.19-1.47-1.31-2.41-.12-.94.13-1.88.71-2.62l1.66-2.12c.57-.73 1.4-1.21 2.33-1.35.93-.14 1.88.08 2.65.62l1.32.93c.3.21.68.29 1.04.22.36-.07.67-.27.87-.56l.53-.77a1.002 1.002 0 0 1 1.11-.42c.41.13.7.47.78.89l.25 1.28z"/>
                  </svg>
                }
                @case ('supabase') {
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <path d="M13.4 1.2L2.7 14.1c-.4.5-.1 1.3.6 1.3h7.2l-1.3 7.4c-.1.8.8 1.3 1.4.7l10.7-12.9c.4-.5.1-1.3-.6-1.3h-7.2l1.3-7.4c.1-.8-.8-1.3-1.4-.7z" fill="url(#supa-stack-grad)"/>
                    <defs>
                      <linearGradient id="supa-stack-grad" x1="2" y1="1" x2="22" y2="23" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#3ECF8E"/>
                        <stop offset="1" stop-color="#24B47E"/>
                      </linearGradient>
                    </defs>
                  </svg>
                }
                @case ('webmcp') {
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="5" fill="#8B5CF6" fill-opacity="0.2" stroke="#8B5CF6" stroke-width="1.5"/>
                    <circle cx="8" cy="8" r="2.2" fill="#C4B5FD"/>
                    <circle cx="16" cy="8" r="2.2" fill="#C4B5FD"/>
                    <circle cx="12" cy="15.5" r="2.8" fill="#8B5CF6"/>
                    <path d="M9.5 9.5L11 13.5M14.5 9.5L13 13.5" stroke="#DDD6FE" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                }
                @case ('render') {
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <path d="M11.4 2.5H2v19h4.8V7.3h4.6V2.5z" fill="#46E3B7"/>
                    <path d="M17.8 2.5H13v14.2H8.2v4.8H22V2.5h-4.2z" fill="#10B981"/>
                  </svg>
                }
                @case ('react') {
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <circle cx="12" cy="12" r="2.5" fill="#61DAFB"/>
                    <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#61DAFB" stroke-width="1.2" transform="rotate(30 12 12)"/>
                    <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#61DAFB" stroke-width="1.2" transform="rotate(90 12 12)"/>
                    <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#61DAFB" stroke-width="1.2" transform="rotate(150 12 12)"/>
                  </svg>
                }
              }
            </div>

            <div class="pill-text">
              <span class="pill-name">{{ item.name }}</span>
              <span class="pill-badge">{{ item.badge }}</span>
            </div>

            <span class="pill-arrow" aria-hidden="true">
              {{ activeTech()?.id === item.id ? '▲' : '▼' }}
            </span>
          </button>
        }
      </div>

      <!-- Architectural Deep Dive Drawer (Intuitive & Minimal) -->
      @if (activeTech(); as tech) {
        <div
          class="stack-drawer"
          [id]="'panel-' + tech.id"
          role="tabpanel"
          [style.--drawer-color]="tech.color"
        >
          <div class="drawer-header">
            <div class="drawer-title-group">
              <span class="drawer-category">{{ tech.category }}</span>
              <h4 class="drawer-name">{{ tech.name }}</h4>
              <span class="drawer-path"><code>{{ tech.repoPath }}</code></span>
            </div>
            <button
              type="button"
              class="drawer-close-btn"
              (click)="activeTech.set(null)"
              aria-label="Close architecture details"
            >
              ✕
            </button>
          </div>

          <p class="drawer-summary">{{ tech.summary }}</p>

          <ul class="drawer-highlights">
            @for (h of tech.highlights; track h) {
              <li>
                <span class="check-icon" aria-hidden="true">✓</span>
                <span>{{ h }}</span>
              </li>
            }
          </ul>

          @if (tech.actionLabel && tech.actionLink) {
            <div class="drawer-actions">
              @if (tech.isExternal) {
                <a
                  class="btn btn-secondary btn-sm"
                  [href]="tech.actionLink"
                  target="_blank"
                  rel="noreferrer"
                >
                  {{ tech.actionLabel }} ↗
                </a>
              } @else {
                <a class="btn btn-secondary btn-sm" [routerLink]="tech.actionLink">
                  {{ tech.actionLabel }} →
                </a>
              }
              @if (tech.id === 'webmcp') {
                <span class="drawer-hint">
                  💡 Tip: Open Chrome DevTools and run <code>await agentAPI.ask("How many years experience?")</code>
                </span>
              }
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    :host {
      display: block;
      margin: var(--space-8) 0;
    }

    .app-stack-section {
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      box-shadow: var(--shadow-sm);
      transition: border-color var(--transition-normal);
    }

    .stack-header {
      margin-bottom: var(--space-4);
    }

    .stack-badge-title {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .pulse-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-success);
      box-shadow: 0 0 8px var(--color-success);
      animation: pulse 2s infinite ease-in-out;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    .stack-subtitle {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      margin-bottom: 0;
    }

    .stack-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
      gap: 0.625rem;
    }

    .stack-pill {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.5rem 0.75rem;
      background: var(--color-bg-subtle);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      cursor: pointer;
      text-align: left;
      font-family: inherit;
      color: var(--color-text-primary);
      transition: all var(--transition-normal);
      user-select: none;
    }

    .stack-pill:hover {
      background: var(--pill-bg, var(--color-bg-elevated));
      border-color: var(--pill-color, var(--color-accent));
      transform: translateY(-2px);
      box-shadow: var(--pill-glow, 0 4px 12px rgba(0, 0, 0, 0.08));
    }

    .stack-pill.active {
      background: var(--pill-bg, var(--color-bg-elevated));
      border-color: var(--pill-color, var(--color-accent));
      box-shadow: var(--pill-glow, 0 0 16px rgba(37, 99, 235, 0.25));
    }

    .pill-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: var(--radius-md);
      background: var(--color-bg);
      flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .pill-text {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .pill-name {
      font-size: var(--text-xs);
      font-weight: 700;
      color: var(--color-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pill-badge {
      font-size: 0.68rem;
      color: var(--color-text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pill-arrow {
      font-size: 0.6rem;
      color: var(--color-text-muted);
      opacity: 0.6;
      transition: transform var(--transition-fast);
    }

    .stack-pill:hover .pill-arrow,
    .stack-pill.active .pill-arrow {
      opacity: 1;
      color: var(--pill-color, var(--color-accent));
    }

    /* Architectural Drawer */
    .stack-drawer {
      margin-top: var(--space-4);
      padding: var(--space-4) var(--space-6);
      background: linear-gradient(135deg, color-mix(in srgb, var(--drawer-color) 6%, var(--color-bg-elevated)), var(--color-bg-elevated));
      border: 1px solid color-mix(in srgb, var(--drawer-color) 35%, var(--color-border));
      border-radius: var(--radius-lg);
      animation: drawerSlide 180ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes drawerSlide {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-2);
    }

    .drawer-title-group {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .drawer-category {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--drawer-color, var(--color-accent));
    }

    .drawer-name {
      font-size: var(--text-base);
      font-weight: 700;
      margin-bottom: 0;
    }

    .drawer-path code {
      font-size: 0.72rem;
      padding: 0.15rem 0.4rem;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text-muted);
      font-family: var(--font-mono);
    }

    .drawer-close-btn {
      background: transparent;
      border: none;
      font-size: 0.85rem;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: 0.25rem;
      line-height: 1;
      border-radius: var(--radius-sm);
    }

    .drawer-close-btn:hover {
      color: var(--color-text-primary);
      background: var(--color-bg-subtle);
    }

    .drawer-summary {
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
      line-height: 1.5;
      margin-bottom: var(--space-3);
    }

    .drawer-highlights {
      list-style: none;
      padding: 0;
      margin: 0 0 var(--space-3) 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 0.5rem;
    }

    .drawer-highlights li {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: var(--text-xs);
      color: var(--color-text-primary);
      line-height: 1.4;
    }

    .check-icon {
      color: var(--drawer-color, var(--color-success));
      font-weight: 800;
      flex-shrink: 0;
    }

    .drawer-actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-4);
      padding-top: var(--space-2);
      border-top: 1px solid var(--color-border);
    }

    .drawer-hint {
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }

    .drawer-hint code {
      font-size: 0.72rem;
      padding: 0.1rem 0.35rem;
      background: var(--color-bg-subtle);
      border-radius: var(--radius-sm);
      color: var(--color-accent);
      font-family: var(--font-mono);
    }

    @media (max-width: 640px) {
      .stack-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .drawer-highlights {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class AppStackComponent {
  protected readonly activeTech = signal<StackItem | null>(null);

  protected readonly stackItems: StackItem[] = [
    {
      id: 'angular',
      name: 'Angular 22',
      category: 'Frontend Shell',
      badge: 'Zoneless Signals',
      color: '#F43F5E',
      bgSubtle: 'rgba(244, 63, 94, 0.08)',
      borderGlow: '0 4px 16px rgba(244, 63, 94, 0.25)',
      summary:
        'Drives the reactive client shell with zoneless change detection, fine-grained signals, standalone architecture, and @defer views.',
      repoPath: 'apps/portfolio-shell',
      highlights: [
        'Native signal-based reactivity with zero zone.js overhead',
        'Custom zero-dependency typewriter character stream engine',
        'Microfrontend federation ready via Native Federation',
      ],
      actionLabel: 'View Shell Architecture',
      actionLink: '/projects',
    },
    {
      id: 'nx',
      name: 'Nx Monorepo',
      category: 'Workspace & CI/CD',
      badge: 'Smart Build Cache',
      color: '#0284C7',
      bgSubtle: 'rgba(2, 132, 199, 0.08)',
      borderGlow: '0 4px 16px rgba(2, 132, 199, 0.25)',
      summary:
        'Enterprise monorepo orchestrating Angular shell, NestJS API, and React admin studio with smart computation caching.',
      repoPath: 'nx.json & workspace root',
      highlights: [
        '30%+ CI/CD build acceleration via affected graph hashing',
        'Unified TypeScript tooling and strict shared contracts',
        'Multi-framework orchestration (Angular 22 + React 19 + NestJS 11)',
      ],
      actionLabel: 'Explore Experience Timeline',
      actionLink: '/experience',
    },
    {
      id: 'nestjs',
      name: 'NestJS 11',
      category: 'Backend & Protocol',
      badge: 'REST & MCP SSE',
      color: '#E11D48',
      bgSubtle: 'rgba(225, 29, 72, 0.08)',
      borderGlow: '0 4px 16px rgba(225, 29, 72, 0.25)',
      summary:
        'Modular enterprise Node.js framework exposing REST endpoints and Server-Sent Events (SSE) for Model Context Protocol.',
      repoPath: 'apps/api',
      highlights: [
        'Dependency-injected services with strict TypeScript validation',
        'SSE & JSON-RPC 2.0 streaming transport for AI agents',
        'Production CORS, rate-limiting & graceful fallback engine',
      ],
      actionLabel: 'Inspect LLMs Manifest',
      actionLink: '/llms.txt',
      isExternal: true,
    },
    {
      id: 'supabase',
      name: 'Supabase',
      category: 'Database & Auth',
      badge: 'PostgreSQL & RLS',
      color: '#10B981',
      bgSubtle: 'rgba(16, 185, 129, 0.08)',
      borderGlow: '0 4px 16px rgba(16, 185, 129, 0.25)',
      summary:
        'Cloud PostgreSQL database with Row-Level Security powering live profile data, case studies, and interactive demos.',
      repoPath: 'apps/api & Supabase Cloud',
      highlights: [
        'Enterprise PostgreSQL schema with strict RLS policies',
        'Instant real-time subscriptions & auto-generated schemas',
        'Offline resilience: instant client fallback if DB is unreachable',
      ],
      actionLabel: 'Launch Admin Studio',
      actionLink: 'http://localhost:5173',
      isExternal: true,
    },
    {
      id: 'webmcp',
      name: 'WebMCP',
      category: 'Agentic AI Gateway',
      badge: 'Claude & ChatGPT',
      color: '#8B5CF6',
      bgSubtle: 'rgba(139, 92, 246, 0.08)',
      borderGlow: '0 4px 16px rgba(139, 92, 246, 0.25)',
      summary:
        'Anthropic Model Context Protocol (MCP) interface allowing AI agents (Claude, ChatGPT, Cursor, browser) to query Vishnu programmatically.',
      repoPath: 'apps/portfolio-shell/core/webmcp',
      highlights: [
        'In-browser window.agentAPI callable console gateway',
        'Standards-compliant /llms.txt and /llms-full.txt manifests',
        'Dual-channel: NestJS SSE server + client offline knowledge engine',
      ],
      actionLabel: 'Inspect llms.txt Spec',
      actionLink: '/llms.txt',
      isExternal: true,
    },
    {
      id: 'render',
      name: 'Render',
      category: 'Cloud Infrastructure',
      badge: 'Zero-Downtime Deploy',
      color: '#14B8A6',
      bgSubtle: 'rgba(20, 184, 166, 0.08)',
      borderGlow: '0 4px 16px rgba(20, 184, 166, 0.25)',
      summary:
        'Cloud deployment hosting the NestJS web service and serving the compiled Angular SPA with automated Git-Ops pipelines.',
      repoPath: 'render.yaml',
      highlights: [
        'Automated Git-Ops CD on every push to main',
        'Global Edge CDN with HTTP/2 and TLS termination',
        'Isolated runtime environments & zero-downtime health checks',
      ],
      actionLabel: 'View Live Host',
      actionLink: 'https://www.techiewithbeard.com',
      isExternal: true,
    },
    {
      id: 'react',
      name: 'React 19 & Vite',
      category: 'Admin Studio',
      badge: 'Sub-ms HMR',
      color: '#06B6D4',
      bgSubtle: 'rgba(6, 182, 212, 0.08)',
      borderGlow: '0 4px 16px rgba(6, 182, 212, 0.25)',
      summary:
        'High-speed administration studio with Vite and React 19 for real-time portfolio management and demo configuration.',
      repoPath: 'apps/portfolio-admin',
      highlights: [
        'Modern React 19 hooks and instant Vite development server',
        'Direct Supabase authentication and table operations',
        'Interactive modal UI for editing projects, demos and skills',
      ],
      actionLabel: 'Open Admin Studio',
      actionLink: 'http://localhost:5173',
      isExternal: true,
    },
  ];

  protected toggleTech(item: StackItem): void {
    if (this.activeTech()?.id === item.id) {
      this.activeTech.set(null);
    } else {
      this.activeTech.set(item);
    }
  }
}
