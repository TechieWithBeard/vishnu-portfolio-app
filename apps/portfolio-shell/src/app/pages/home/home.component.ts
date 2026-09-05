import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioApiService } from '../../services/portfolio-api.service';
import { SkeletonLoaderComponent } from '../../ui/skeleton-loader.component';
import { CodeHeroTypingComponent } from '../../ui/code-hero-typing.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, SkeletonLoaderComponent, CodeHeroTypingComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private readonly apiService = inject(PortfolioApiService);

  protected readonly profile = this.apiService.profile;
  protected readonly projects = this.apiService.projects;
  protected readonly skills = this.apiService.skills;
  protected readonly experience = this.apiService.experience;

  // Loading signals for skeleton states
  protected readonly loadingProfile = this.apiService.loadingProfile;
  protected readonly loadingProjects = this.apiService.loadingProjects;
  protected readonly loadingSkills = this.apiService.loadingSkills;

  protected readonly featuredProjects = computed(() =>
    this.projects().filter((p) => p.featured).slice(0, 3)
  );

  protected readonly architectureSkills = computed(() => {
    const found = this.skills().find((s) => s.category === 'frontendArchitecture');
    return found ? found.items : ['Angular 22', 'Nx Monorepos', 'Design Systems', 'TypeScript', 'Signals'];
  });

  protected readonly aiSkills = computed(() => {
    const found = this.skills().find((s) => s.category === 'aiInterfaces');
    return found ? found.items : ['LangChain', 'LangGraph', 'Streaming UIs', 'RAG Applications'];
  });
}
