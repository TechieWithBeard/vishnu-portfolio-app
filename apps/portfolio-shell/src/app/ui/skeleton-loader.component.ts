import { Component, input } from '@angular/core';

export type SkeletonType =
  | 'hero'
  | 'card'
  | 'card-grid'
  | 'timeline'
  | 'timeline-grid'
  | 'article'
  | 'article-grid'
  | 'pill-cloud'
  | 'text'
  | 'title'
  | 'avatar'
  | 'custom';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  template: `
    <div class="skeleton-container" [attr.aria-busy]="true" aria-label="Loading content">
      <!-- 1. HERO FORMAT -->
      @if (type() === 'hero') {
        <div class="hero-skeleton">
          <div class="skeleton skeleton-title large" style="margin-bottom: 1.25rem;"></div>
          <div class="skeleton skeleton-text medium" style="margin-bottom: 0.85rem;"></div>
          <div class="skeleton skeleton-text" style="margin-bottom: 0.6rem;"></div>
          <div class="skeleton skeleton-text short" style="margin-bottom: 2rem;"></div>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <div class="skeleton skeleton-btn" style="width: 9rem;"></div>
            <div class="skeleton skeleton-btn" style="width: 8rem;"></div>
            <div class="skeleton skeleton-btn" style="width: 7rem;"></div>
          </div>
        </div>
      }

      <!-- 2. SINGLE CARD FORMAT -->
      @if (type() === 'card') {
        <div class="skeleton-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="skeleton skeleton-tag"></div>
            <div class="skeleton skeleton-tag" style="width: 4rem;"></div>
          </div>
          <div class="skeleton skeleton-title" style="margin-top: 0.5rem;"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text short"></div>
          <div style="display: flex; gap: 0.5rem; margin-top: auto; padding-top: 1rem;">
            <div class="skeleton skeleton-tag" style="width: 3rem;"></div>
            <div class="skeleton skeleton-tag" style="width: 4rem;"></div>
            <div class="skeleton skeleton-tag" style="width: 3.5rem;"></div>
          </div>
          <div style="display: flex; gap: 0.5rem; border-top: 1px solid var(--color-border); padding-top: 1rem; margin-top: 0.5rem;">
            <div class="skeleton skeleton-btn" style="flex: 1;"></div>
            <div class="skeleton skeleton-btn" style="width: 5rem;"></div>
          </div>
        </div>
      }

      <!-- 3. CARD GRID FORMAT -->
      @if (type() === 'card-grid') {
        <div class="grid" [class.two]="columns() === 2" [class.three]="columns() === 3">
          @for (n of itemsArray(); track n) {
            <div class="skeleton-card">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="skeleton skeleton-tag"></div>
                <div class="skeleton skeleton-tag" style="width: 4rem;"></div>
              </div>
              <div class="skeleton skeleton-title" style="margin-top: 0.5rem; height: 1.4rem;"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text short"></div>
              <div style="display: flex; gap: 0.5rem; margin-top: auto; padding-top: 0.75rem;">
                <div class="skeleton skeleton-tag" style="width: 3.5rem;"></div>
                <div class="skeleton skeleton-tag" style="width: 4.5rem;"></div>
                <div class="skeleton skeleton-tag" style="width: 3.5rem;"></div>
              </div>
              <div style="display: flex; gap: 0.5rem; border-top: 1px solid var(--color-border); padding-top: 0.75rem; margin-top: 0.5rem;">
                <div class="skeleton skeleton-btn" style="flex: 1;"></div>
                <div class="skeleton skeleton-btn" style="width: 5rem;"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- 4. TIMELINE FORMAT -->
      @if (type() === 'timeline') {
        <div class="skeleton-card timeline-item">
          <div class="timeline-sidebar">
            <div class="skeleton skeleton-tag" style="margin-bottom: 0.5rem; width: 6rem;"></div>
            <div class="skeleton skeleton-title" style="height: 1.3rem;"></div>
            <div class="skeleton skeleton-text short" style="width: 8rem;"></div>
          </div>
          <div>
            <div class="skeleton skeleton-text" style="margin-bottom: 0.5rem;"></div>
            <div class="skeleton skeleton-text" style="margin-bottom: 0.5rem;"></div>
            <div class="skeleton skeleton-text short" style="margin-bottom: 1rem;"></div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <div class="skeleton skeleton-tag"></div>
              <div class="skeleton skeleton-tag"></div>
              <div class="skeleton skeleton-tag"></div>
            </div>
          </div>
        </div>
      }

      <!-- 5. TIMELINE GRID FORMAT -->
      @if (type() === 'timeline-grid') {
        <div class="timeline">
          @for (n of itemsArray(); track n) {
            <div class="skeleton-card timeline-item">
              <div class="timeline-sidebar">
                <div class="skeleton skeleton-tag" style="margin-bottom: 0.5rem; width: 6rem;"></div>
                <div class="skeleton skeleton-title" style="height: 1.3rem;"></div>
                <div class="skeleton skeleton-text short" style="width: 8rem;"></div>
              </div>
              <div>
                <div class="skeleton skeleton-text" style="margin-bottom: 0.5rem;"></div>
                <div class="skeleton skeleton-text" style="margin-bottom: 0.5rem;"></div>
                <div class="skeleton skeleton-text short" style="margin-bottom: 1rem;"></div>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                  <div class="skeleton skeleton-tag"></div>
                  <div class="skeleton skeleton-tag"></div>
                  <div class="skeleton skeleton-tag"></div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- 6. ARTICLE / WRITING FORMAT -->
      @if (type() === 'article' || type() === 'article-grid') {
        <div class="grid" [class.two]="columns() === 2" [class.three]="columns() === 3">
          @for (n of itemsArray(); track n) {
            <div class="skeleton-card">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="skeleton skeleton-tag" style="width: 5rem;"></div>
                <div class="skeleton skeleton-tag" style="width: 4rem;"></div>
              </div>
              <div class="skeleton skeleton-title" style="margin-top: 0.5rem; height: 1.4rem;"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text short"></div>
              <div style="display: flex; gap: 0.5rem; margin-top: auto; padding-top: 1rem;">
                <div class="skeleton skeleton-tag"></div>
                <div class="skeleton skeleton-tag"></div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border); padding-top: 1rem;">
                <div class="skeleton skeleton-tag" style="width: 4.5rem;"></div>
                <div class="skeleton skeleton-btn" style="width: 6.5rem;"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- 7. PILL CLOUD (SKILLS / TAGS) -->
      @if (type() === 'pill-cloud') {
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          @for (n of itemsArray(); track n) {
            <div class="skeleton skeleton-tag" [style.width]="(n % 2 === 0 ? '5.5rem' : '4.5rem')"></div>
          }
        </div>
      }

      <!-- 8. TEXT LINES -->
      @if (type() === 'text') {
        <div>
          @for (n of itemsArray(); track n; let last = $last) {
            <div class="skeleton skeleton-text" [class.short]="last"></div>
          }
        </div>
      }

      <!-- 9. TITLE ONLY -->
      @if (type() === 'title') {
        <div class="skeleton skeleton-title" [class.large]="largeTitle()" [style.width]="width() || '70%'"></div>
      }

      <!-- 10. AVATAR / PORTRAIT -->
      @if (type() === 'avatar') {
        <div class="skeleton skeleton-avatar" [style.height]="height() || 'auto'" [style.width]="width() || '100%'"></div>
      }

      <!-- 11. CUSTOM BLOCK -->
      @if (type() === 'custom') {
        <div
          class="skeleton"
          [style.height]="height() || '1.5rem'"
          [style.width]="width() || '100%'"
          [style.border-radius]="radius() || 'var(--radius-md)'"
        ></div>
      }
    </div>
  `,
})
export class SkeletonLoaderComponent {
  readonly type = input<SkeletonType>('card');
  readonly count = input<number>(1);
  readonly columns = input<2 | 3>(2);
  readonly lines = input<number>(3);
  readonly height = input<string | null>(null);
  readonly width = input<string | null>(null);
  readonly radius = input<string | null>(null);
  readonly largeTitle = input<boolean>(false);

  protected itemsArray(): number[] {
    const total = this.type() === 'text' ? this.lines() : this.count();
    return Array.from({ length: total }, (_, i) => i + 1);
  }
}
