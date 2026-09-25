import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgClass, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PortfolioApiService } from '../../services/portfolio-api.service';
import { SkeletonLoaderComponent } from '../../ui/skeleton-loader.component';

@Component({
  selector: 'app-writing',
  imports: [NgClass, TitleCasePipe, SkeletonLoaderComponent, RouterLink],
  template: `
    <div class="container">
      <section class="section" style="padding-bottom: var(--space-8);">
        <span class="eyebrow">Technical Publications</span>
        <h1 style="margin-bottom: var(--space-3);">Articles & Thought Leadership</h1>
        <p class="section-subtitle">
          In-depth technical writing, architecture deep-dives, and tutorials published across Medium, Dev.to, and LinkedIn.
        </p>
      </section>

      <!-- Platform Filter Tabs -->
      <div class="filter-bar">
        @for (platform of platforms; track platform) {
          <button
            class="filter-btn"
            [class.active]="selectedPlatform() === platform"
            (click)="selectPlatform(platform)"
          >
            {{ platform }}
          </button>
        }
      </div>

      <!-- Articles Grid & Witty Empty State -->
      @if (loadingWriting() && writing().length === 0) {
        <app-skeleton-loader type="article-grid" [count]="4" [columns]="2"></app-skeleton-loader>
      } @else if (filteredArticles().length === 0) {
        <div class="empty-state-container">
          <div class="empty-badge">
            <span class="brewing-indicator"></span>
            <code>git commit -m "WIP: drafts brewing at 60fps"</code>
          </div>

          <div class="empty-avatar-wrap">
            <span class="coffee-icon">☕</span>
          </div>

          <h2 class="empty-title">
            @if (selectedPlatform() !== 'All') {
              No {{ selectedPlatform() }} Articles Found
            } @else {
              Drafts Brewing in the Architecture Lab...
            }
          </h2>

          <p class="empty-text">
            @if (selectedPlatform() !== 'All') {
              No published articles found under <strong>{{ selectedPlatform() }}</strong> yet.
              The keys are clacking, caffeine levels are optimal, and new deep-dives are currently compiling!
            } @else {
              Vishnu is currently caffeinating and converting enterprise architectural battles into deep-dive technical essays.
              Fresh thought leadership on Angular 22, WebMCP, and multi-agent AI systems are coming up soon!
            }
          </p>

          <div class="empty-actions">
            @if (selectedPlatform() !== 'All') {
              <button class="btn btn-secondary btn-sm" (click)="selectPlatform('All')">
                <span>🔄</span> Reset to All Platforms
              </button>
            }
            <a
              class="btn btn-primary btn-sm"
              href="https://www.linkedin.com/in/vishnuthankappan/"
              target="_blank"
              rel="noreferrer"
            >
              <span>💼</span> Connect on LinkedIn
            </a>
            <a class="btn btn-secondary btn-sm" routerLink="/demos">
              <span>⚡</span> Explore Live AI Demos
            </a>
          </div>
        </div>
      } @else {
        <section class="grid two">
          @for (item of filteredArticles(); track item.id) {
            <article class="card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); flex-wrap: gap; gap: 0.5rem;">
                <span class="tag" [ngClass]="getPlatformClass(item.platform)">
                  {{ item.platform.toUpperCase() }}
                </span>
                <span style="font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono);">
                  {{ item.publishedAt }}
                </span>
              </div>

              <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: var(--space-2);">
                {{ item.title }}
              </h2>
              <p style="font-size: 0.95rem; line-height: 1.6; margin-bottom: var(--space-4); flex: 1;">
                {{ item.summary }}
              </p>

              <div class="tag-row" style="margin-bottom: var(--space-6);">
                @for (tag of item.tags; track tag) {
                  <span class="tag">{{ tag }}</span>
                }
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border); padding-top: var(--space-4);">
                <span style="font-size: var(--text-xs); color: var(--text-muted);">
                  📖 {{ item.readTime || '5 min read' }}
                </span>
                <a
                  class="btn btn-secondary btn-sm"
                  [href]="item.url"
                  target="_blank"
                  rel="noreferrer"
                >
                  Read on {{ item.platform | titlecase }} ↗
                </a>
              </div>
            </article>
          }
        </section>
      }
    </div>
  `,
  styles: [
    `
      .empty-state-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        background: var(--color-bg-elevated);
        border: 1px dashed var(--color-border-strong);
        border-radius: var(--radius-2xl);
        padding: var(--space-12) var(--space-6);
        margin: var(--space-4) auto var(--space-12);
        max-width: 680px;
        box-shadow: var(--shadow-sm);
      }

      .empty-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(59, 130, 246, 0.08);
        border: 1px solid rgba(59, 130, 246, 0.25);
        padding: 0.3rem 0.85rem;
        border-radius: var(--radius-full);
        font-size: var(--text-xs);
        color: var(--color-accent);
        margin-bottom: var(--space-4);
      }

      .brewing-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--color-accent);
        box-shadow: 0 0 10px var(--color-accent);
        animation: pulseBrew 1.8s infinite ease-in-out;
      }

      .empty-avatar-wrap {
        width: 76px;
        height: 76px;
        border-radius: var(--radius-full);
        background: var(--color-bg-subtle);
        border: 1px solid var(--color-border);
        display: grid;
        place-items: center;
        margin-bottom: var(--space-4);
        box-shadow: var(--shadow-md);
      }

      .coffee-icon {
        font-size: 2.2rem;
        animation: floatBrew 3s ease-in-out infinite;
      }

      .empty-title {
        font-size: clamp(1.35rem, 3vw, 1.75rem);
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--color-text-primary);
        margin: 0 0 var(--space-2);
      }

      .empty-text {
        font-size: var(--text-base);
        color: var(--color-text-secondary);
        line-height: 1.65;
        max-width: 520px;
        margin: 0 0 var(--space-6);
      }

      .empty-actions {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-3);
        flex-wrap: wrap;
      }

      @keyframes pulseBrew {
        0%,
        100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.4;
          transform: scale(0.85);
        }
      }

      @keyframes floatBrew {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-5px);
        }
      }
    `,
  ],
})
export class WritingComponent implements OnInit {
  private readonly apiService = inject(PortfolioApiService);
  protected readonly writing = this.apiService.writing;
  protected readonly loadingWriting = this.apiService.loadingWriting;

  ngOnInit(): void {
    this.apiService.fetchWriting();
  }

  protected readonly platforms = ['All', 'Medium', 'Dev.to', 'LinkedIn'];
  protected readonly selectedPlatform = signal<string>('All');

  protected readonly filteredArticles = computed(() => {
    const p = this.selectedPlatform();
    if (p === 'All') return this.writing();
    return this.writing().filter((w) => w.platform.toLowerCase() === p.toLowerCase());
  });

  protected selectPlatform(platform: string): void {
    this.selectedPlatform.set(platform);
  }

  protected getPlatformClass(platform: string): string {
    switch (platform.toLowerCase()) {
      case 'medium':
        return 'tag-platform-medium';
      case 'dev.to':
        return 'tag-platform-devto';
      case 'linkedin':
        return 'tag-platform-linkedin';
      case 'youtube':
        return 'tag-platform-youtube';
      default:
        return 'tag-accent';
    }
  }
}

