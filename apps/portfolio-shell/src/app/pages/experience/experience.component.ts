import { Component, inject } from '@angular/core';
import { PortfolioApiService } from '../../services/portfolio-api.service';
import { SkeletonLoaderComponent } from '../../ui/skeleton-loader.component';

@Component({
  selector: 'app-experience',
  imports: [SkeletonLoaderComponent],
  template: `
    <div class="container">
      <section class="section" style="padding-bottom: var(--space-8);">
        <span class="eyebrow">Professional History</span>
        <h1 style="margin-bottom: var(--space-3);">Engineering Experience</h1>
        <p class="section-subtitle">
          Proven track record leading frontend architecture, Nx monorepos, and modernized web platforms across European and global enterprise teams.
        </p>
      </section>

      <!-- Experience Timeline -->
      <section class="timeline">
        @if (loadingExperience()) {
          <app-skeleton-loader type="timeline-grid" [count]="3"></app-skeleton-loader>
        } @else {
          @for (item of experience(); track item.id) {
            <article class="card timeline-item">
              <div class="timeline-sidebar">
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: var(--space-2);">
                  <span class="tag tag-accent">{{ item.period }}</span>
                  @if (item.location) {
                    <span class="tag" style="background: var(--color-success-subtle); color: var(--color-success); border-color: color-mix(in srgb, var(--color-success) 30%, transparent);">
                      🇪🇺 {{ item.location }}
                    </span>
                  }
                </div>
                <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem;">{{ item.role }}</h2>
                <p class="timeline-company">{{ item.company }}</p>
              </div>

              <div>
                <ul style="margin-bottom: var(--space-4); display: flex; flex-direction: column; gap: 0.5rem;">
                  @for (highlight of item.highlights; track highlight) {
                    <li style="line-height: 1.65;">{{ highlight }}</li>
                  }
                </ul>

                @if (item.tech && item.tech.length > 0) {
                  <div class="tag-row">
                    @for (t of item.tech; track t) {
                      <span class="tag">{{ t }}</span>
                    }
                  </div>
                }
              </div>
            </article>
          }
        }
      </section>

      <!-- Education Section -->
      <section class="section">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Academic Background</span>
            <h2 class="section-title">Education & Qualifications</h2>
          </div>
        </div>

        <div class="grid two">
          @for (item of profile().education; track item.degree) {
            <article class="card">
              <span class="tag tag-accent" style="align-self: flex-start; margin-bottom: var(--space-3);">
                {{ item.period }}
              </span>
              <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: var(--space-1);">
                {{ item.degree }}
              </h3>
              <p style="margin-bottom: 0; color: var(--color-text-secondary);">
                {{ item.institution }}
              </p>
            </article>
          }
        </div>
      </section>
    </div>
  `,
})
export class ExperienceComponent {
  private readonly apiService = inject(PortfolioApiService);
  protected readonly profile = this.apiService.profile;
  protected readonly experience = this.apiService.experience;
  protected readonly loadingExperience = this.apiService.loadingExperience;
}
