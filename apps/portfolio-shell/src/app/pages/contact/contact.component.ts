import { Component } from '@angular/core';

import { resume } from '../../data/portfolio.data';

@Component({
  selector: 'app-contact',
  template: `
    <section class="page-hero contact-hero">
      <p class="eyebrow">{{ profile.availability.status }}</p>
      <h1>Open to Senior Frontend and AI Frontend roles.</h1>
      <p>{{ profile.availability.target }}</p>
      <div class="hero-actions">
        <a class="btn btn-primary" [href]="'mailto:' + profile.email">Email Vishnu</a>
        <a class="btn btn-secondary" [href]="profile.linkedin" target="_blank" rel="noreferrer">LinkedIn</a>
      </div>
    </section>

    <section class="grid two">
      <article class="card">
        <h2>Contact</h2>
        <p><strong>Alias:</strong> {{ profile.alias }}</p>
        <p><strong>Email:</strong> <a [href]="'mailto:' + profile.email">{{ profile.email }}</a></p>
        <p><strong>Phone:</strong> {{ profile.phone }}</p>
        <p><strong>Location:</strong> {{ profile.location }}</p>
      </article>
      <article class="card">
        <h2>Availability</h2>
        <p>{{ profile.availability.note }}</p>
        <p>{{ profile.availability.target }}</p>
      </article>
    </section>
  `,
})
export class ContactComponent {
  protected readonly profile = resume;
}
