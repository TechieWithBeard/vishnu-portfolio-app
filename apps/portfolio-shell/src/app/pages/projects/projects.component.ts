import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { projects } from '../../data/portfolio.data';

@Component({
  selector: 'app-projects',
  imports: [RouterLink],
  template: `
    <section class="page-hero">
      <p class="eyebrow">Projects</p>
      <h1>Architecture case studies and AI interface demos.</h1>
      <p>Selected work focused on scalable Angular systems, modernization, design systems, and emerging AI product interfaces.</p>
    </section>

    <section class="grid two">
      @for (project of projectList; track project.id) {
        <article class="card project-card">
          <div class="card-topline">
            <span class="tag">{{ project.category }}</span>
            <span class="tag">{{ project.role }}</span>
          </div>
          <h2>{{ project.title }}</h2>
          <p>{{ project.description }}</p>
          <ul>
            @for (highlight of project.highlights; track highlight) {
              <li>{{ highlight }}</li>
            }
          </ul>
          <div class="tag-row">
            @for (tech of project.tech; track tech) {
              <span class="tag tag-ai">{{ tech }}</span>
            }
          </div>
          <div class="card-actions">
            @if (project.liveDemo) {
              <a class="btn btn-primary" [routerLink]="project.liveDemo">Open Demo</a>
            }
            @if (project.github && !project.github.includes('YOUR_')) {
              <a class="btn btn-secondary" [href]="project.github" target="_blank" rel="noreferrer">GitHub</a>
            }
          </div>
        </article>
      }
    </section>
  `,
})
export class ProjectsComponent {
  protected readonly projectList = projects;
}
