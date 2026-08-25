import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { PortfolioApiService } from '../../services/portfolio-api.service';
import { SkeletonLoaderComponent } from '../../ui/skeleton-loader.component';
import { SafeResourceUrlPipe, SafeUrlPipe } from '../../core/pipes/safe-resource-url.pipe';
import { Demo } from '../../data/portfolio.data';

@Component({
  selector: 'app-demos',
  imports: [UpperCasePipe, SkeletonLoaderComponent, SafeResourceUrlPipe, SafeUrlPipe],
  templateUrl: './demos.component.html',
  styleUrls: ['./demos.component.scss'],
})
export class DemosComponent {
  private readonly apiService = inject(PortfolioApiService);
  protected readonly demos = this.apiService.demos;
  protected readonly loadingDemos = this.apiService.loadingDemos;

  // Filter state
  protected readonly selectedFilter = signal<string>('All');
  protected readonly filterOptions = [
    'All',
    'AI & LLM Prototypes',
    'Native Federation',
    'Module Federation',
  ];

  // Active studio modal preview
  protected readonly activePreviewDemo = signal<Demo | null>(null);

  // Independent chip expansion map
  protected readonly expandedTechMap = signal<Record<string, boolean>>({});

  @HostListener('document:keydown.escape')
  protected handleEscapeKey(): void {
    this.closePreview();
  }

  protected readonly filteredDemos = computed(() => {
    const filter = this.selectedFilter();
    const all = this.demos();
    if (filter === 'All') return all;
    if (filter === 'AI & LLM Prototypes') {
      return all.filter(
        (d) =>
          d.type === 'iframe' ||
          d.tags?.some((t) => t.toLowerCase().includes('ai')) ||
          d.title.toLowerCase().includes('ai') ||
          d.title.toLowerCase().includes('rag')
      );
    }
    if (filter === 'Native Federation') {
      return all.filter((d) => d.type === 'native-federation');
    }
    if (filter === 'Module Federation') {
      return all.filter((d) => d.type === 'module-federation');
    }
    return all;
  });

  protected setFilter(filter: string): void {
    this.selectedFilter.set(filter);
  }

  protected openPreview(demo: Demo): void {
    this.activePreviewDemo.set(demo);
  }

  protected closePreview(): void {
    this.activePreviewDemo.set(null);
  }

  protected toggleTech(id: string): void {
    const current = this.expandedTechMap();
    this.expandedTechMap.set({
      ...current,
      [id]: !current[id],
    });
  }

  protected isTechExpanded(id: string): boolean {
    return !!this.expandedTechMap()[id];
  }

  protected getVisibleTech(demo: Demo): string[] {
    if (!demo.tech) return [];
    if (this.isTechExpanded(demo.id) || demo.tech.length <= 4) {
      return demo.tech;
    }
    return demo.tech.slice(0, 4);
  }

  protected getRemainingTechCount(demo: Demo): number {
    if (!demo.tech || demo.tech.length <= 4) return 0;
    return demo.tech.length - 4;
  }

  protected formatUrlHost(url?: string): string {
    if (!url) return '';
    try {
      if (url.startsWith('http')) {
        const u = new URL(url);
        return u.hostname;
      }
      return url;
    } catch {
      return url;
    }
  }
}
