import { Component, computed, ElementRef, inject, signal, ViewChild } from "@angular/core";
import { SafeResourceUrlPipe, SafeUrlPipe } from "../../core/pipes/safe-resource-url.pipe";
import { PortfolioApiService } from "../../services/portfolio-api.service";

@Component({
  selector: "app-admin-studio",
  imports: [SafeResourceUrlPipe, SafeUrlPipe],
  templateUrl: "./admin-studio.component.html",
  styleUrls: ["./admin-studio.component.scss"],
})
export class AdminStudioComponent {
  private readonly apiService = inject(PortfolioApiService);
  protected readonly profile = this.apiService.profile;

  @ViewChild("adminIframe")
  protected adminIframeRef?: ElementRef<HTMLIFrameElement>;

  protected readonly iframeLoaded = signal<boolean>(false);
  protected readonly iframeReloadKey = signal<number>(1);

  // Computes embed URL for the React Admin app with safe demo flag
  protected readonly adminUrl = computed(() => {
    return "/admin/index.html?demo=true";
  });

  protected onIframeLoad(): void {
    this.iframeLoaded.set(true);
  }

  protected reloadSandbox(): void {
    this.iframeLoaded.set(false);
    this.iframeReloadKey.update((k) => k + 1);
  }
}
