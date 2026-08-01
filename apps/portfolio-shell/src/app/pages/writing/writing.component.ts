import { Component } from '@angular/core';

import { writing } from '../../data/portfolio.data';

@Component({
  selector: 'app-writing',
  template: `
    <section class="page-hero">
      <p class="eyebrow">Writing</p>
      <h1>Articles, notes, and technical storytelling.</h1>
      <p>Curated content for Angular architecture, AI interfaces, and engineering career positioning.</p>
    </section>

    <section class="grid two">
      @for (item of items; track item.id) {
        <article class="card">
          <div class="card-topline">
            <span class="tag">{{ item.platform }}</span>
            <span class="tag">{{ item.publishedAt }}</span>
          </div>
          <h2>{{ item.title }}</h2>
          <p>{{ item.summary }}</p>
          <div class="tag-row">
            @for (tag of item.tags; track tag) {
              <span class="tag tag-ai">{{ tag }}</span>
            }
          </div>
          <a class="btn btn-secondary" [href]="item.url" target="_blank" rel="noreferrer">Read Article</a>
        </article>
      }
    </section>
  `,
})
export class WritingComponent {
  protected readonly items = writing;
}
