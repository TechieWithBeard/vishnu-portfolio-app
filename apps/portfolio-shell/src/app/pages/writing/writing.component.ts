import { Component, computed, inject, signal } from '@angular/core';
import { NgClass, TitleCasePipe } from '@angular/common';
import { PortfolioApiService } from '../../services/portfolio-api.service';
import { SkeletonLoaderComponent } from '../../ui/skeleton-loader.component';

@Component({
  selector: 'app-writing',
  imports: [NgClass, TitleCasePipe, SkeletonLoaderComponent],
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

      <!-- Articles Grid -->
      @if (loadingWriting()) {
        <app-skeleton-loader type="article-grid" [count]="4" [columns]="2"></app-skeleton-loader>
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
})
export class WritingComponent {
  private readonly apiService = inject(PortfolioApiService);
  protected readonly writing = this.apiService.writing;
  protected readonly loadingWriting = this.apiService.loadingWriting;

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
