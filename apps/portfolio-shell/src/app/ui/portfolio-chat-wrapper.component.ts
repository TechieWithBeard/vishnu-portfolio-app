import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-portfolio-chat-wrapper',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="chat-modal-backdrop" (click)="onBackdropClick($event)">
      <div class="chat-modal-container" #chatContainer>
        <!-- The React 19 Chat Microfrontend is mounted here -->
      </div>
    </div>
  `,
  styles: [
    `
      .chat-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(3, 7, 18, 0.7);
        backdrop-filter: blur(8px);
        z-index: 9999;
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        padding: 24px;
        animation: fadeIn 0.2s ease-out;
      }

      .chat-modal-container {
        width: 100%;
        max-width: 440px;
        animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @media (max-width: 640px) {
        .chat-modal-backdrop {
          padding: 0;
          align-items: flex-end;
        }
        .chat-modal-container {
          max-width: 100%;
          height: 90vh;
        }
      }
    `,
  ],
})
export class PortfolioChatWrapperComponent implements OnInit, OnDestroy {
  @ViewChild('chatContainer', { static: true }) chatContainer!: ElementRef<HTMLDivElement>;
  @Input() apiUrl = 'https://vishnu-portfolio-api.onrender.com';
  @Output() close = new EventEmitter<void>();

  private unmountFn?: () => void;

  async ngOnInit(): Promise<void> {
    try {
      // Dynamic import of the React microfrontend mount helper
      const { mountChat } = await import('../../../../portfolio-chat/src/mount');
      if (this.chatContainer?.nativeElement) {
        this.unmountFn = mountChat(this.chatContainer.nativeElement, {
          apiUrl: this.apiUrl,
          onClose: () => this.close.emit(),
        });
      }
    } catch (err) {
      console.error('Failed to mount federated React chat microfrontend:', err);
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  ngOnDestroy(): void {
    if (this.unmountFn) {
      this.unmountFn();
    }
  }
}
