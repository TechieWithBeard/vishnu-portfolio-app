import { Component } from '@angular/core';

import { demos } from '../../data/portfolio.data';

@Component({
  selector: 'app-demos',
  template: `
    <section class="page-hero">
      <p class="eyebrow">Live Demo Hub</p>
      <h1>Microfrontend and embedded AI demos.</h1>
      <p>Configured for Angular Native Federation, React module federation, and secure iframe-based AI prototypes.</p>
    </section>

    <section class="grid two">
      @for (demo of demoList; track demo.id) {
        <article class="card demo-card">
          <div class="card-topline">
            <span class="tag tag-ai">{{ demo.type }}</span>
            <span class="status" [class.live]="demo.status === 'live'">{{ demo.status }}</span>
          </div>
          <h2>{{ demo.title }}</h2>
          <p>{{ demo.description }}</p>
          <div class="tag-row">
            @for (tech of demo.tech; track tech) {
              <span class="tag">{{ tech }}</span>
            }
          </div>

          @if (demo.type === 'iframe' && demo.url && !demo.url.includes('YOUR_')) {
            <iframe [src]="demo.url" [sandbox]="demo.sandbox" loading="lazy" [title]="demo.title"></iframe>
          } @else {
            <div class="demo-placeholder">
              <strong>{{ demo.remoteName || demo.type }}</strong>
              <span>{{ demo.exposedModule || 'Connect hosted URL to enable this demo.' }}</span>
            </div>
          }
        </article>
      }
    </section>
  `,
})
export class DemosComponent {
  protected readonly demoList = demos;
}
