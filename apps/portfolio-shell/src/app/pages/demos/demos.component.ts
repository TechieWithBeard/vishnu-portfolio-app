import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
export class DemosComponent implements OnInit {
  private readonly apiService = inject(PortfolioApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

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

  // Active studio modal preview & video player modal
  protected readonly activePreviewDemo = signal<Demo | null>(null);
  protected readonly activeVideoDemo = signal<Demo | null>(null);

  // Copied deep link toast state
  protected readonly copiedDemoId = signal<string | null>(null);

  // Independent chip expansion map
  protected readonly expandedTechMap = signal<Record<string, boolean>>({});

  ngOnInit(): void {
    // Listen for incoming deeplinks (e.g. /demos?demo=talentlens-ai or /demos?id=...)
    this.route.queryParams.subscribe((params) => {
      const targetId = params['demo'] || params['id'];
      if (targetId) {
        // Auto open matching preview once demos are loaded
        const match = this.demos().find(
          (d) => d.id.toLowerCase() === targetId.toLowerCase()
        );
        if (match) {
          this.openPreview(match, false);
        }
      }
    });
  }

  @HostListener('document:keydown.escape')
  protected handleEscapeKey(): void {
    this.closePreview();
    this.closeVideo();
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

  protected openPreview(demo: Demo, updateUrl = true): void {
    this.activePreviewDemo.set(demo);
    if (updateUrl) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { demo: demo.id },
        queryParamsHandling: 'merge',
      });
    }
  }

  protected closePreview(): void {
    this.activePreviewDemo.set(null);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { demo: null, id: null },
      queryParamsHandling: 'merge',
    });
  }

  protected openVideo(demo: Demo): void {
    this.activeVideoDemo.set(demo);
  }

  protected closeVideo(): void {
    this.activeVideoDemo.set(null);
  }

  protected copyDeepLink(demo: Demo, event?: Event): void {
    if (event) event.stopPropagation();
    if (typeof window !== 'undefined' && navigator?.clipboard) {
      const url = `${window.location.origin}/demos?demo=${encodeURIComponent(demo.id)}`;
      navigator.clipboard.writeText(url);
      this.copiedDemoId.set(demo.id);
      setTimeout(() => {
        this.copiedDemoId.set(null);
      }, 2500);
    }
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

  protected getYouTubeEmbedUrl(url?: string): string | null {
    if (!url) return null;
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
    );
    if (match && match[1]) {
      return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&rel=0`;
    }
    return url;
  }
}
