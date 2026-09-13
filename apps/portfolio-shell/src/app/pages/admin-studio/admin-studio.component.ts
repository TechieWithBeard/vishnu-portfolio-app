import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";

@Component({
  selector: "app-admin-studio",
  templateUrl: "./admin-studio.component.html",
  styleUrls: ["./admin-studio.component.scss"],
})
export class AdminStudioComponent implements OnInit, OnDestroy {
  @ViewChild("adminContainer", { static: true })
  protected adminContainer!: ElementRef<HTMLDivElement>;

  protected readonly isMounted = signal<boolean>(false);
  protected readonly mountError = signal<string | null>(null);
  private unmountFn?: () => void;

  async ngOnInit(): Promise<void> {
    await this.mountApp();
  }

  protected async mountApp(): Promise<void> {
    try {
      this.isMounted.set(false);
      this.mountError.set(null);

      const { mountAdmin } = await import("../../../../../portfolio-admin/src/mount");
      if (this.adminContainer?.nativeElement) {
        if (this.unmountFn) {
          this.unmountFn();
        }
        this.unmountFn = mountAdmin(this.adminContainer.nativeElement, {
          demoMode: true,
        });
        this.isMounted.set(true);
      }
    } catch (err: any) {
      console.error("Failed to mount React 19 Admin Microfrontend:", err);
      this.mountError.set(err?.message || "Error mounting React microfrontend");
    }
  }

  protected reloadSandbox(): void {
    if (this.unmountFn) {
      this.unmountFn();
      this.unmountFn = undefined;
    }
    this.mountApp();
  }

  ngOnDestroy(): void {
    if (this.unmountFn) {
      this.unmountFn();
      this.unmountFn = undefined;
    }
  }
}
