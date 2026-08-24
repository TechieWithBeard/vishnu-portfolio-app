import { Component, inject, signal } from '@angular/core';
import { PortfolioApiService } from '../../services/portfolio-api.service';

@Component({
  selector: 'app-contact',
  template: `
    <div class="container">
      <section class="section" style="padding-bottom: var(--space-8);">
        <span class="eyebrow">Let's Connect</span>
        <h1 style="margin-bottom: var(--space-3);">Open for Opportunities</h1>
        <p class="section-subtitle">
          Interested in discussing frontend architecture, large-scale monorepo design, or AI interface engineering? Reach out directly.
        </p>

        <div class="hero-actions" style="margin-top: var(--space-6);">
          <a class="btn btn-primary" [href]="'mailto:' + profile().email">
            <span>✉️</span> Email Vishnu
          </a>
          <a
            class="btn btn-secondary"
            [href]="profile().linkedin"
            target="_blank"
            rel="noreferrer"
          >
            <span>💼</span> Connect on LinkedIn
          </a>
          <a
            class="btn btn-secondary"
            [href]="profile().github"
            target="_blank"
            rel="noreferrer"
          >
            <span>🐙</span> GitHub Profile
          </a>
        </div>
      </section>

      <section class="grid two">
        <article class="card">
          <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: var(--space-4);">
            Direct Contact Information
          </h2>

          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-3);">
              <div>
                <small style="color: var(--color-text-muted); display: block; font-size: var(--text-xs);">EMAIL</small>
                <strong>{{ profile().email }}</strong>
              </div>
              <button
                class="btn btn-secondary btn-sm"
                (click)="copyToClipboard(profile().email, 'email')"
              >
                {{ copiedField() === 'email' ? '✓ Copied' : 'Copy' }}
              </button>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-3);">
              <div>
                <small style="color: var(--color-text-muted); display: block; font-size: var(--text-xs);">PHONE</small>
                <strong>{{ profile().phone }}</strong>
              </div>
              <button
                class="btn btn-secondary btn-sm"
                (click)="copyToClipboard(profile().phone, 'phone')"
              >
                {{ copiedField() === 'phone' ? '✓ Copied' : 'Copy' }}
              </button>
            </div>

            <div style="border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-3);">
              <small style="color: var(--color-text-muted); display: block; font-size: var(--text-xs);">LOCATION</small>
              <strong>{{ profile().location }}</strong>
            </div>

            <div>
              <small style="color: var(--color-text-muted); display: block; font-size: var(--text-xs);">ONLINE ALIAS</small>
              <strong style="color: var(--color-accent);">{{ profile().alias }}</strong>
            </div>
          </div>
        </article>

        <article class="card">
          <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: var(--space-4);">
            Availability & Engagement
          </h2>

          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div style="border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-3);">
              <small style="color: var(--color-text-muted); display: block; font-size: var(--text-xs);">CURRENT STATUS</small>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-success);"></span>
                <strong>{{ profile().availability.status }}</strong>
              </div>
            </div>

            <div style="border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-3);">
              <small style="color: var(--color-text-muted); display: block; font-size: var(--text-xs);">TARGET POSITIONS</small>
              <p style="margin-bottom: 0; color: var(--color-text-primary); font-weight: 500;">
                {{ profile().availability.target }}
              </p>
            </div>

            <div>
              <small style="color: var(--color-text-muted); display: block; font-size: var(--text-xs);">NOTES</small>
              <p style="margin-bottom: 0; color: var(--color-text-secondary); font-size: 0.95rem;">
                {{ profile().availability.note }}
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  `,
})
export class ContactComponent {
  private readonly apiService = inject(PortfolioApiService);
  protected readonly profile = this.apiService.profile;

  protected readonly copiedField = signal<string | null>(null);

  protected copyToClipboard(text: string, field: string): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      this.copiedField.set(field);
      setTimeout(() => {
        this.copiedField.set(null);
      }, 2500);
    }
  }
}
