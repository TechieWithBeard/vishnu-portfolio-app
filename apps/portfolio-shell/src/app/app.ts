import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FooterComponent } from './layout/footer.component';
import { HeaderComponent } from './layout/header.component';
import { PortfolioChatWrapperComponent } from './ui/portfolio-chat-wrapper.component';

@Component({
  imports: [FooterComponent, HeaderComponent, RouterModule, PortfolioChatWrapperComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly isChatOpen = signal(false);

  toggleChat(): void {
    this.isChatOpen.update((open) => !open);
  }

  closeChat(): void {
    this.isChatOpen.set(false);
  }
}
