import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';

interface CodeToken {
  type: 'bracket' | 'tag' | 'attr-name' | 'punct' | 'attr-val' | 'text' | 'comment';
  text: string;
}

@Component({
  selector: 'app-code-hero-typing',
  standalone: true,
  template: `
    <div class="code-window" role="region" aria-label="Interactive Code Bio">
      <!-- Window Top Bar -->
      <div class="window-bar">
        <div class="window-controls">
          <span class="traffic-dot red"></span>
          <span class="traffic-dot yellow"></span>
          <span class="traffic-dot green"></span>
        </div>

        <div class="window-tab">
          <span class="tab-icon">📄</span>
          <span class="tab-name">architect.component.html</span>
          <span class="tab-lang">HTML5 • Signals</span>
        </div>

        <div class="window-actions">
          @if (!isFinished()) {
            <button
              type="button"
              class="code-btn"
              (click)="skipAnimation()"
              title="Skip typing animation"
            >
              ⚡ Skip
            </button>
          } @else {
            <button
              type="button"
              class="code-btn"
              (click)="replayAnimation()"
              title="Replay typing animation"
            >
              ↻ Retype
            </button>
          }

          <button
            type="button"
            class="code-btn"
            (click)="copyCode()"
            title="Copy HTML to clipboard"
          >
            {{ copied() ? '✓ Copied!' : '📋 Copy' }}
          </button>
        </div>
      </div>

      <!-- Code Editor Body with Gutter & Syntax Tokens -->
      <div class="editor-body">
        <!-- Line Numbers Gutter -->
        <div class="gutter" aria-hidden="true">
          @for (num of lineNumbers(); track num) {
            <span class="line-num" [class.active-line]="num === currentLineNumber()">
              {{ num < 10 ? '0' + num : num }}
            </span>
          }
        </div>

        <!-- Code Content -->
        <div class="code-content" aria-live="polite">
          <pre class="code-pre"><code>@for (token of visibleTokens(); track $index) {<span [class]="'tok-' + token.type">{{ token.text }}</span>}@if (!isFinished()) {<span class="cursor-caret">█</span>}</code></pre>
        </div>
      </div>

      <!-- Window Status Bar -->
      <div class="window-status-bar">
        <div class="status-left">
          <span class="status-indicator" [class.ready]="isFinished()">●</span>
          <span>{{ isFinished() ? 'DOM Tree Rendered' : 'Streaming AST Tokens...' }}</span>
        </div>
        <div class="status-right">
          <span>UTF-8</span>
          <span>Angular 22</span>
          <span>Ln {{ currentLineNumber() }}, Col {{ currentColNumber() }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .code-window {
        display: flex;
        flex-direction: column;
        background: #0b0f19;
        border: 1px solid rgba(59, 130, 246, 0.25);
        border-radius: var(--radius-xl);
        overflow: hidden;
        box-shadow: 0 12px 36px -4px rgba(0, 0, 0, 0.5), 0 0 24px rgba(59, 130, 246, 0.08);
        margin-bottom: var(--space-6);
        transition: border-color var(--transition-normal);
        font-family: var(--font-mono);
      }

      .code-window:hover {
        border-color: rgba(59, 130, 246, 0.45);
      }

      /* macOS Window Header */
      .window-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.6rem 1rem;
        background: #0f172a;
        border-bottom: 1px solid #1e293b;
        gap: 0.75rem;
        user-select: none;
      }

      .window-controls {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .traffic-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
      }
      .traffic-dot.red { background: #ef4444; }
      .traffic-dot.yellow { background: #eab308; }
      .traffic-dot.green { background: #22c55e; }

      .window-tab {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        background: #0b0f19;
        border: 1px solid #1e293b;
        border-bottom: none;
        padding: 0.25rem 0.75rem;
        border-radius: var(--radius-sm) var(--radius-sm) 0 0;
        font-size: 0.75rem;
        color: #e2e8f0;
      }

      .tab-icon { font-size: 0.85rem; }
      .tab-name { font-weight: 600; }
      .tab-lang {
        color: #64748b;
        font-size: 0.68rem;
        margin-left: 0.35rem;
        padding-left: 0.35rem;
        border-left: 1px solid #334155;
      }

      .window-actions {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .code-btn {
        background: rgba(30, 41, 59, 0.8);
        border: 1px solid #334155;
        color: #94a3b8;
        font-size: 0.72rem;
        font-family: var(--font-mono);
        padding: 0.2rem 0.55rem;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .code-btn:hover {
        background: #1e293b;
        color: #ffffff;
        border-color: var(--color-accent);
      }

      /* Editor Body with Gutter & Code */
      .editor-body {
        display: flex;
        padding: 1rem 0;
        background: #080c15;
        overflow-x: auto;
        min-height: 290px;
      }

      .gutter {
        display: flex;
        flex-direction: column;
        padding: 0 0.85rem 0 1rem;
        border-right: 1px solid rgba(51, 65, 85, 0.4);
        user-select: none;
        text-align: right;
      }

      .line-num {
        font-size: 0.8rem;
        line-height: 1.55;
        color: #475569;
        transition: color 0.15s ease;
      }

      .line-num.active-line {
        color: #38bdf8;
        font-weight: 700;
      }

      .code-content {
        flex: 1;
        padding: 0 1.25rem 0 1rem;
        min-width: 0;
      }

      .code-pre {
        margin: 0;
        padding: 0;
        font-family: 'JetBrains Mono', 'Fira Code', var(--font-mono);
        font-size: 0.82rem;
        line-height: 1.55;
        white-space: pre-wrap;
        word-break: break-word;
      }

      /* Syntax Tokens Highlight Palette */
      .tok-bracket {
        color: #38bdf8; /* Cyan */
        font-weight: 600;
      }
      .tok-tag {
        color: #f472b6; /* Pink/Magenta */
        font-weight: 600;
      }
      .tok-attr-name {
        color: #fbbf24; /* Amber/Yellow */
      }
      .tok-punct {
        color: #94a3b8;
      }
      .tok-attr-val {
        color: #34d399; /* Emerald */
      }
      .tok-text {
        color: #f1f5f9; /* Off-white */
      }
      .tok-comment {
        color: #64748b; /* Slate */
        font-style: italic;
      }

      /* Animated Glowing Cursor Caret */
      .cursor-caret {
        display: inline-block;
        color: #3b82f6;
        animation: cursorBlink 0.75s infinite ease-in-out;
        margin-left: 1px;
        vertical-align: baseline;
        text-shadow: 0 0 8px rgba(59, 130, 246, 0.8);
      }

      @keyframes cursorBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }

      /* Window Status Bar */
      .window-status-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.35rem 1rem;
        background: #0f172a;
        border-top: 1px solid #1e293b;
        font-size: 0.68rem;
        color: #64748b;
        user-select: none;
      }

      .status-left, .status-right {
        display: flex;
        align-items: center;
        gap: 0.65rem;
      }

      .status-indicator {
        color: #f59e0b;
        font-size: 0.6rem;
      }
      .status-indicator.ready {
        color: #22c55e;
      }

      @media (max-width: 640px) {
        .window-bar {
          padding: 0.5rem 0.75rem;
        }
        .window-tab {
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tab-lang {
          display: none;
        }
        .editor-body {
          min-height: 260px;
        }
        .code-pre {
          font-size: 0.75rem;
        }
        .window-status-bar {
          font-size: 0.62rem;
        }
      }
    `,
  ],
})
export class CodeHeroTypingComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  // Structured token specification for the bio
  private readonly rawTokens: CodeToken[] = [
    { type: 'comment', text: '<!-- Senior Frontend & AI System Architecture -->' },
    { type: 'text', text: '\n' },
    { type: 'bracket', text: '<' },
    { type: 'tag', text: 'developer' },
    { type: 'attr-name', text: ' id' },
    { type: 'punct', text: '=' },
    { type: 'attr-val', text: '"techiewithbeard"' },
    { type: 'attr-name', text: ' status' },
    { type: 'punct', text: '=' },
    { type: 'attr-val', text: '"available"' },
    { type: 'bracket', text: '>' },
    { type: 'text', text: '\n  ' },
    { type: 'bracket', text: '<' },
    { type: 'tag', text: 'name' },
    { type: 'bracket', text: '>' },
    { type: 'text', text: 'Vishnu Thankappan' },
    { type: 'bracket', text: '</' },
    { type: 'tag', text: 'name' },
    { type: 'bracket', text: '>' },
    { type: 'text', text: '\n  ' },
    { type: 'bracket', text: '<' },
    { type: 'tag', text: 'role' },
    { type: 'bracket', text: '>' },
    { type: 'text', text: 'Senior Frontend Engineer & UI/AI Architect' },
    { type: 'bracket', text: '</' },
    { type: 'tag', text: 'role' },
    { type: 'bracket', text: '>' },
    { type: 'text', text: '\n  ' },
    { type: 'bracket', text: '<' },
    { type: 'tag', text: 'specialization' },
    { type: 'bracket', text: '>' },
    { type: 'text', text: '\n    Nx Monorepos • Angular 22 • LangGraph AI • Microfrontends\n  ' },
    { type: 'bracket', text: '</' },
    { type: 'tag', text: 'specialization' },
    { type: 'bracket', text: '>' },
    { type: 'text', text: '\n  ' },
    { type: 'bracket', text: '<' },
    { type: 'tag', text: 'proven-pedigree' },
    { type: 'bracket', text: '>' },
    { type: 'text', text: '\n    AVEVA (Industrial SaaS) • Maistering B.V (European AI Platform)\n  ' },
    { type: 'bracket', text: '</' },
    { type: 'tag', text: 'proven-pedigree' },
    { type: 'bracket', text: '>' },
    { type: 'text', text: '\n  ' },
    { type: 'bracket', text: '<' },
    { type: 'tag', text: 'mission' },
    { type: 'bracket', text: '>' },
    { type: 'text', text: '\n    Engineering deterministic, resilient frontend architectures\n    and real-time streaming AI interfaces that scale under enterprise load.\n  ' },
    { type: 'bracket', text: '</' },
    { type: 'tag', text: 'mission' },
    { type: 'bracket', text: '>' },
    { type: 'text', text: '\n  ' },
    { type: 'bracket', text: '<' },
    { type: 'tag', text: 'availability' },
    { type: 'attr-name', text: ' openTo' },
    { type: 'punct', text: '=' },
    { type: 'attr-val', text: '"Staff Frontend / Lead AI Engineer"' },
    { type: 'attr-name', text: ' location' },
    { type: 'punct', text: '=' },
    { type: 'attr-val', text: '"Europe / Remote"' },
    { type: 'bracket', text: ' />' },
    { type: 'text', text: '\n' },
    { type: 'bracket', text: '</' },
    { type: 'tag', text: 'developer' },
    { type: 'bracket', text: '>' },
  ];

  // Raw full text for character counting and copy-paste
  private readonly fullText: string;
  private readonly totalLength: number;

  // Reactive state signals
  protected readonly typedCharsCount = signal(0);
  protected readonly isFinished = signal(false);
  protected readonly copied = signal(false);

  private timerId: any = null;

  constructor() {
    this.fullText = this.rawTokens.map((t) => t.text).join('');
    this.totalLength = this.fullText.length;
  }

  ngOnInit(): void {
    this.startTyping();

    this.destroyRef.onDestroy(() => {
      this.clearTimer();
    });
  }

  private startTyping(): void {
    this.clearTimer();
    this.typedCharsCount.set(0);
    this.isFinished.set(false);

    let count = 0;
    const step = () => {
      // Small chunking: type 1 or 2 characters per tick for realistic cadence
      const increment = Math.random() > 0.85 ? 2 : 1;
      count = Math.min(this.totalLength, count + increment);
      this.typedCharsCount.set(count);

      if (count < this.totalLength) {
        // Variable speed: quick typing (14ms-22ms), small pause at newlines
        const nextChar = this.fullText[count];
        const delay = nextChar === '\n' ? 65 : Math.floor(Math.random() * 10) + 14;
        this.timerId = setTimeout(step, delay);
      } else {
        this.isFinished.set(true);
      }
    };

    this.timerId = setTimeout(step, 180);
  }

  private clearTimer(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  // Token slice computation for real-time highlighted rendering
  protected readonly visibleTokens = computed(() => {
    const maxChars = this.typedCharsCount();
    if (maxChars >= this.totalLength) {
      return this.rawTokens;
    }

    const result: CodeToken[] = [];
    let accumulated = 0;

    for (const tok of this.rawTokens) {
      const tokLen = tok.text.length;
      if (accumulated + tokLen <= maxChars) {
        result.push(tok);
        accumulated += tokLen;
      } else if (accumulated < maxChars) {
        const remaining = maxChars - accumulated;
        result.push({
          type: tok.type,
          text: tok.text.slice(0, remaining),
        });
        accumulated += remaining;
        break;
      } else {
        break;
      }
    }

    return result;
  });

  // Dynamic line numbers list based on newlines in visible text
  protected readonly lineNumbers = computed(() => {
    const text = this.fullText.slice(0, this.typedCharsCount());
    const count = (text.match(/\n/g) || []).length + 1;
    // Total lines is around 17
    const totalLines = (this.fullText.match(/\n/g) || []).length + 1;
    return Array.from({ length: totalLines }, (_, i) => i + 1);
  });

  protected readonly currentLineNumber = computed(() => {
    const text = this.fullText.slice(0, this.typedCharsCount());
    return (text.match(/\n/g) || []).length + 1;
  });

  protected readonly currentColNumber = computed(() => {
    const text = this.fullText.slice(0, this.typedCharsCount());
    const lastNewline = text.lastIndexOf('\n');
    return lastNewline === -1 ? text.length + 1 : text.length - lastNewline;
  });

  protected skipAnimation(): void {
    this.clearTimer();
    this.typedCharsCount.set(this.totalLength);
    this.isFinished.set(true);
  }

  protected replayAnimation(): void {
    this.startTyping();
  }

  protected copyCode(): void {
    if (typeof window !== 'undefined' && navigator?.clipboard) {
      navigator.clipboard.writeText(this.fullText);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2200);
    }
  }
}
