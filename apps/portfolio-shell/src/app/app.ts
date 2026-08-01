import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FooterComponent } from './layout/footer.component';
import { HeaderComponent } from './layout/header.component';

@Component({
  imports: [FooterComponent, HeaderComponent, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
}
