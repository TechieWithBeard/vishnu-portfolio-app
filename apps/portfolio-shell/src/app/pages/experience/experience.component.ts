import { Component } from '@angular/core';

import { resume } from '../../data/portfolio.data';

@Component({
  selector: 'app-experience',
  template: `
    <section class="page-hero">
      <p class="eyebrow">Experience</p>
      <h1>Frontend architecture across European enterprise teams.</h1>
      <p>{{ summary }}</p>
    </section>

    <section class="timeline">
      @for (item of experience; track item.company) {
        <article class="card timeline-item">
          <div>
            <span class="tag">{{ item.period }}</span>
            <h2>{{ item.role }}</h2>
            <p class="company">{{ item.company }}</p>
            @if (item.location) {
              <p>{{ item.location }}</p>
            }
          </div>
          <ul>
            @for (highlight of item.highlights; track highlight) {
              <li>{{ highlight }}</li>
            }
          </ul>
        </article>
      }
    </section>

    <section class="section">
      <h2>Education</h2>
      <div class="grid two">
        @for (item of education; track item.degree) {
          <article class="card">
            <h3>{{ item.degree }}</h3>
            <p>{{ item.institution }}</p>
            <span class="tag">{{ item.period }}</span>
          </article>
        }
      </div>
    </section>
  `,
})
export class ExperienceComponent {
  protected readonly summary = resume.summary;
  protected readonly experience = resume.experience;
  protected readonly education = resume.education;
}
