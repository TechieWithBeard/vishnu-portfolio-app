import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { projects, resume } from '../../data/portfolio.data';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="hero-content">
        <p class="eyebrow">{{ profile.availability.status }} - {{ profile.availability.note }}</p>
        <h1>{{ profile.name }}</h1>
        <p class="alias">{{ profile.alias }}</p>
        <p class="hero-title">{{ profile.tagline }}</p>
        <p class="hero-summary">{{ profile.summary }}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" routerLink="/projects">View Projects</a>
          <a class="btn btn-secondary" routerLink="/contact">Get in Touch</a>
        </div>
      </div>
      <aside class="hero-aside" aria-label="Profile details">
        <figure class="profile-portrait">
          <img src="/profile/vishnu.jpeg" alt="Vishnu Thankappan" width="480" height="560" />
        </figure>
        <div class="profile-meta">
          <span class="status-line"><span aria-hidden="true"></span>{{ profile.availability.status }}</span>
          <h2>{{ profile.title }}</h2>
          <p>{{ profile.location }}</p>
          <p>{{ profile.availability.target }}</p>
        </div>
      </aside>
    </section>

    <section class="section">
      <div class="section-heading">
        <h2>Featured Work</h2>
        <a routerLink="/projects">All projects</a>
      </div>
      <div class="grid three">
        @for (project of featuredProjects; track project.id) {
          <article class="card project-card">
            <span class="tag">{{ project.category }}</span>
            <h3>{{ project.title }}</h3>
            <p>{{ project.description }}</p>
            <div class="tag-row">
              @for (item of project.tech; track item) {
                <span class="tag tag-ai">{{ item }}</span>
              }
            </div>
          </article>
        }
      </div>
    </section>

    <section class="section split-section">
      <div>
        <p class="eyebrow">Core Strength</p>
        <h2>Enterprise frontend systems that stay maintainable under pressure.</h2>
      </div>
      <div class="skill-cloud">
        @for (skill of architectureSkills; track skill) {
          <span class="tag">{{ skill }}</span>
        }
      </div>
    </section>
  `,
})
export class HomeComponent {
  protected readonly profile = resume;
  protected readonly featuredProjects = projects.filter((project) => project.featured).slice(0, 3);
  protected readonly architectureSkills = resume.skills['frontendArchitecture'];
}
