import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeResourceUrl',
  standalone: true,
})
export class SafeResourceUrlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(url: string | null | undefined): SafeResourceUrl | '' {
    if (!url) return '';

    const trimmed = url.trim();
    if (
      trimmed.startsWith('https://') ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('/') ||
      trimmed.startsWith('./')
    ) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(trimmed);
    }

    console.warn(`[SafeResourceUrlPipe] Blocked potentially unsafe resource URL: ${url}`);
    return '';
  }
}

@Pipe({
  name: 'safeUrl',
  standalone: true,
})
export class SafeUrlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(url: string | null | undefined): SafeUrl | '' {
    if (!url) return '';

    const trimmed = url.trim();
    if (
      trimmed.startsWith('https://') ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('mailto:') ||
      trimmed.startsWith('tel:') ||
      trimmed.startsWith('/') ||
      trimmed.startsWith('./')
    ) {
      return this.sanitizer.bypassSecurityTrustUrl(trimmed);
    }

    console.warn(`[SafeUrlPipe] Blocked potentially unsafe URL: ${url}`);
    return '';
  }
}
