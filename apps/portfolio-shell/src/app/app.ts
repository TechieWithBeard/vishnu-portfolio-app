import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { FooterComponent } from './layout/footer.component';
import { HeaderComponent } from './layout/header.component';
import { PortfolioChatWrapperComponent } from './ui/portfolio-chat-wrapper.component';
import { CloudBootHudComponent } from './ui/cloud-boot-hud/cloud-boot-hud.component';
import { PortfolioApiService } from './services/portfolio-api.service';

@Component({
  imports: [
    FooterComponent,
    HeaderComponent,
    RouterModule,
    PortfolioChatWrapperComponent,
    CloudBootHudComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly apiService = inject(PortfolioApiService);
  readonly isChatOpen = signal(false);

  private navSub?: Subscription;
  private rafId: number | null = null;

  private readonly onScrollOrResize = () => {
    if (this.rafId !== null) return;
    this.rafId = window.requestAnimationFrame(() => {
      this.rafId = null;
      this.updateLift();
    });
  };

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.onScrollOrResize, { passive: true });
      window.addEventListener('resize', this.onScrollOrResize, { passive: true });

      this.navSub = this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe((event) => {
          this.apiService.fetchForRoute(event.urlAfterRedirects || event.url);
          setTimeout(() => this.updateLift(), 100);
        });

      this.updateLift();
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.onScrollOrResize);
      window.removeEventListener('resize', this.onScrollOrResize);
      if (this.rafId !== null) {
        window.cancelAnimationFrame(this.rafId);
      }
      document.documentElement.style.setProperty('--footer-lift', '0px');
    }
    this.navSub?.unsubscribe();
  }

  toggleChat(): void {
    this.isChatOpen.update((open) => !open);
  }

  closeChat(): void {
    this.isChatOpen.set(false);
  }

  private updateLift(): void {
    if (typeof document === 'undefined') return;
    const footer = document.querySelector('.site-footer');
    if (!footer) {
      document.documentElement.style.setProperty('--footer-lift', '0px');
      return;
    }
    const rect = footer.getBoundingClientRect();
    const maxLift = Math.max(0, window.innerHeight - 80);
    const overlap = Math.min(Math.max(0, window.innerHeight - rect.top), maxLift);
    document.documentElement.style.setProperty('--footer-lift', `${Math.round(overlap)}px`);
  }
}
