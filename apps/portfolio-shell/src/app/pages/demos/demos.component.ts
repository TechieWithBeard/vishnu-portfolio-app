import { Component, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { PortfolioApiService } from '../../services/portfolio-api.service';
import { SkeletonLoaderComponent } from '../../ui/skeleton-loader.component';
import { SafeResourceUrlPipe, SafeUrlPipe } from '../../core/pipes/safe-resource-url.pipe';

@Component({
  selector: 'app-demos',
  imports: [UpperCasePipe, SkeletonLoaderComponent, SafeResourceUrlPipe, SafeUrlPipe],
  template: `
    <div class="container">
      <section class="section" style="padding-bottom: var(--space-8);">
        <span class="eyebrow">Microfrontends & Embeds</span>
        <h1 style="margin-bottom: var(--space-3);">Live Demo Hub</h1>
        <p class="section-subtitle">
          Interactive applications demonstrating Angular Native Federation remotes, React Module Federation, and secure sandboxed AI prototypes.
        </p>
      </section>

      @if (loadingDemos()) {
        <app-skeleton-loader type="card-grid" [count]="4" [columns]="2"></app-skeleton-loader>
      } @else {
        <section class="grid two">
          @for (demo of demos(); track demo.id) {
            <article class="card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); flex-wrap: wrap; gap: 0.5rem;">
                <span class="tag tag-ai">{{ demo.type }}</span>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span
                    class="tag"
                    [style.background]="demo.status === 'live' ? 'var(--color-success-subtle)' : 'var(--color-bg-subtle)'"
                    [style.color]="demo.status === 'live' ? 'var(--color-success)' : 'var(--color-text-muted)'"
                  >
                    ● {{ demo.status | uppercase }}
                  </span>
                  @if (demo.url) {
                    <a
                      class="btn btn-secondary btn-sm"
                      [href]="demo.url | safeUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open demo in new tab"
                    >
                      <span>↗</span> New Tab
                    </a>
                  }
                </div>
              </div>

              <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: var(--space-2);">
                {{ demo.title }}
              </h2>
              <p style="font-size: 0.95rem; line-height: 1.6; margin-bottom: var(--space-4);">
                {{ demo.description }}
              </p>

              <div class="tag-row" style="margin-bottom: var(--space-6);">
                @for (tech of demo.tech; track tech) {
                  <span class="tag">{{ tech }}</span>
                }
              </div>

              @if (demo.type === 'iframe' && demo.url) {
                <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: auto;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: var(--text-xs); color: var(--color-text-muted);">
                      Interactive Sandboxed Preview
                    </span>
                    <a
                      class="btn btn-secondary btn-sm"
                      [href]="demo.url | safeUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Fullscreen ↗
                    </a>
                  </div>
                  <iframe
                    [src]="demo.url | safeResourceUrl"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    loading="lazy"
                    [title]="demo.title"
                  ></iframe>
                </div>
              } @else {
                <div class="demo-placeholder">
                  <strong style="color: var(--color-text-primary); font-size: 0.95rem;">
                    {{ demo.remoteName || demo.type }}
                  </strong>
                  <span style="font-size: 0.85rem; color: var(--color-text-muted);">
                    {{ demo.exposedModule ? 'Federated Module: ' + demo.exposedModule : 'Connect hosted endpoint to stream this interface.' }}
                  </span>
                  @if (demo.url) {
                    <a
                      class="btn btn-primary btn-sm"
                      style="margin-top: 0.5rem;"
                      [href]="demo.url | safeUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open App ↗
                    </a>
                  }
                </div>
              }
            </article>
          }
        </section>
      }
    </div>
  `,
})
export class DemosComponent {
  private readonly apiService = inject(PortfolioApiService);
  protected readonly demos = this.apiService.demos;
  protected readonly loadingDemos = this.apiService.loadingDemos;
}
