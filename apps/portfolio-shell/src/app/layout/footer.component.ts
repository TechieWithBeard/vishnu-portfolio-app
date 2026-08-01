import { Component } from '@angular/core';

import { resume } from '../data/portfolio.data';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="site-footer">
      <div>
        <strong>{{ name }}</strong>
        <span>{{ target }}</span>
      </div>
      <a [href]="'mailto:' + email">{{ email }}</a>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly name = resume.name;
  protected readonly target = resume.availability.target;
  protected readonly email = resume.email;
}
