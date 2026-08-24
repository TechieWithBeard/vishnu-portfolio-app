import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioApiService } from '../../services/portfolio-api.service';
import { SkeletonLoaderComponent } from '../../ui/skeleton-loader.component';

@Component({
  selector: 'app-projects',
  imports: [RouterLink, SkeletonLoaderComponent],
  template: `
    <div class="container">
      <section class="section" style="padding-bottom: var(--space-8);">
        <span class="eyebrow">Case Studies & Systems</span>
        <h1 style="margin-bottom: var(--space-3);">Engineering Projects</h1>
        <p class="section-subtitle">
          Selected architectural case studies, LangChain AI interfaces, enterprise migrations, and microfrontends.
        </p>
      </section>

      <!-- Category Filter Tabs -->
      <div class="filter-bar">
        @for (category of categories; track category) {
          <button
            class="filter-btn"
            [class.active]="selectedCategory() === category"
            (click)="selectCategory(category)"
          >
            {{ category }}
          </button>
        }
      </div>

      <!-- Projects Grid -->
      @if (loadingProjects()) {
        <app-skeleton-loader type="card-grid" [count]="4" [columns]="2"></app-skeleton-loader>
      } @else {
        <section class="grid two">
          @for (project of filteredProjects(); track project.id) {
            <article class="card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); flex-wrap: wrap; gap: 0.5rem;">
                <span class="tag tag-accent">{{ project.category }}</span>
                <span class="tag tag-ai">{{ project.role }}</span>
              </div>

              <h2 style="font-size: 1.35rem; font-weight: 700; margin-bottom: var(--space-2);">
                {{ project.title }}
              </h2>
              <p style="font-size: 0.95rem; line-height: 1.6; margin-bottom: var(--space-4);">
                {{ project.description }}
              </p>

              @if (project.highlights && project.highlights.length > 0) {
                <ul style="margin-bottom: var(--space-4); display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem;">
                  @for (h of project.highlights; track h) {
                    <li>{{ h }}</li>
                  }
                </ul>
              }

              <div class="tag-row" style="margin-bottom: var(--space-6);">
                @for (tech of project.tech; track tech) {
                  <span class="tag">{{ tech }}</span>
                }
              </div>

              <div style="display: flex; gap: var(--space-3); margin-top: auto; border-top: 1px solid var(--color-border); padding-top: var(--space-4);">
                @if (project.liveDemo) {
                  <a class="btn btn-primary" [routerLink]="project.liveDemo">
                    Open Demo ↗
                  </a>
                }
                @if (project.github && !project.github.includes('YOUR_')) {
                  <a
                    class="btn btn-secondary"
                    [href]="project.github"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub Repository
                  </a>
                }
              </div>
            </article>
          }
        </section>
      }
    </div>
  `,
})
export class ProjectsComponent {
  private readonly apiService = inject(PortfolioApiService);
  protected readonly projects = this.apiService.projects;
  protected readonly loadingProjects = this.apiService.loadingProjects;

  protected readonly categories = [
    'All',
    'Architecture',
    'AI Interfaces',
    'Modernization',
  ];

  protected readonly selectedCategory = signal<string>('All');

  protected readonly filteredProjects = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'All') return this.projects();
    return this.projects().filter((p) => p.category.toLowerCase() === cat.toLowerCase());
  });

  protected selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }
}
