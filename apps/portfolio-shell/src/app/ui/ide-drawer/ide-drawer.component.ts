import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioApiService } from '../../services/portfolio-api.service';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  passed: boolean;
}

interface Collectible {
  x: number;
  y: number;
  radius: number;
  label: string;
  points: number;
  collected: boolean;
}

@Component({
  selector: 'app-ide-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ide-drawer.component.html',
  styleUrls: ['./ide-drawer.component.scss'],
})
export class IdeDrawerComponent implements OnInit, OnDestroy {
  protected readonly apiService = inject(PortfolioApiService);

  @ViewChild('gameCanvas') canvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('terminalOutput') terminalOutputRef?: ElementRef<HTMLDivElement>;

  // Bridge signals from service
  readonly cloudStatus = this.apiService.cloudStatus;
  readonly elapsedSeconds = this.apiService.elapsedSeconds;
  readonly bootProgress = this.apiService.bootProgress;
  readonly bootLogs = this.apiService.bootLogs;
  readonly servicesStatus = this.apiService.servicesStatus;

  // Drawer UI state
  readonly activeTab = signal<'terminal' | 'arcade' | 'problems' | 'output'>('terminal');
  readonly isCollapsed = signal<boolean>(false);

  // Sound toggle (muted by default)
  readonly soundEnabled = signal<boolean>(false);
  private audioCtx: AudioContext | null = null;

  // Game signals
  readonly gameScore = signal<number>(0);
  readonly gameHighScore = signal<number>(0);
  readonly gameState = signal<'ready' | 'playing' | 'gameover'>('ready');
  readonly lastKillerObstacle = signal<string>('');

  private animationFrameId: number | null = null;
  private canvasWidth = 520;
  private canvasHeight = 160;
  private groundY = 130;

  private player = {
    x: 36,
    y: 95,
    width: 24,
    height: 24,
    vy: 0,
    gravity: 0.52,
    jumpStrength: -9.6,
    isGrounded: true,
    jumpsLeft: 2,
    rotation: 0,
  };

  private obstacles: Obstacle[] = [];
  private collectibles: Collectible[] = [];
  private particles: Particle[] = [];
  private gameSpeed = 3.2;
  private spawnTimer = 0;
  private collectibleTimer = 0;

  private readonly obstacleLabels = [
    'Memory Leak',
    '404 Not Found',
    'Merge Conflict',
    'CORS Error',
    'Null Pointer',
    'Latency Spike',
  ];

  private readonly collectibleItems = [
    { label: '⚡ Signal', points: 50, color: '#38bdf8' },
    { label: '💎 Nx Cache', points: 100, color: '#a855f7' },
    { label: '✨ Supabase', points: 75, color: '#34d399' },
  ];

  constructor() {
    // Load high score
    try {
      const saved = sessionStorage.getItem('packet_runner_high_score');
      if (saved) this.gameHighScore.set(parseInt(saved, 10) || 0);
    } catch {}

    // Auto-scroll terminal
    effect(() => {
      this.bootLogs();
      setTimeout(() => {
        if (this.terminalOutputRef?.nativeElement) {
          const el = this.terminalOutputRef.nativeElement;
          el.scrollTop = el.scrollHeight;
        }
      }, 50);
    });

    // Start/stop game loop based on tab and collapse state
    effect(() => {
      const tab = this.activeTab();
      const collapsed = this.isCollapsed();
      if (!collapsed && tab === 'arcade') {
        setTimeout(() => this.initCanvasGame(), 80);
      } else {
        this.stopGameLoop();
      }
    });
  }

  ngOnInit(): void {
    // If warming up on initial load, ensure drawer is open to terminal
    if (this.cloudStatus() === 'warming') {
      this.isCollapsed.set(false);
    }
  }

  ngOnDestroy(): void {
    this.stopGameLoop();
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch {}
    }
  }

  // --- Drawer Actions ---
  setTab(tab: 'terminal' | 'arcade' | 'problems' | 'output'): void {
    this.activeTab.set(tab);
    if (this.isCollapsed()) {
      this.isCollapsed.set(false);
    }
  }

  toggleCollapse(): void {
    this.isCollapsed.update((c) => !c);
  }

  openTab(tab: 'terminal' | 'arcade' | 'problems' | 'output'): void {
    this.isCollapsed.set(false);
    this.activeTab.set(tab);
  }

  toggleSound(): void {
    this.soundEnabled.update((s) => !s);
    if (this.soundEnabled() && !this.audioCtx) {
      this.initAudioContext();
    }
  }

  // --- 8-Bit Web Audio ---
  private initAudioContext(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    } catch {}
  }

  private playSound(type: 'jump' | 'score' | 'gameover'): void {
    if (!this.soundEnabled()) return;
    if (!this.audioCtx) this.initAudioContext();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    if (type === 'jump') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.1);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'score') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'gameover') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc.start(now);
      osc.stop(now + 0.26);
    }
  }

  // --- Keyboard & Click Handlers ---
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.isCollapsed() || this.activeTab() !== 'arcade') return;

    if (event.code === 'Space' || event.code === 'ArrowUp') {
      event.preventDefault();
      this.handlePlayerAction();
    }
  }

  handleCanvasClick(): void {
    this.handlePlayerAction();
  }

  private handlePlayerAction(): void {
    if (this.gameState() === 'ready') {
      this.startGame();
    } else if (this.gameState() === 'gameover') {
      this.resetGame();
      this.startGame();
    } else if (this.gameState() === 'playing') {
      this.jump();
    }
  }

  jump(): void {
    if (this.player.jumpsLeft > 0) {
      this.player.vy = this.player.jumpStrength;
      this.player.isGrounded = false;
      this.player.jumpsLeft--;
      this.playSound('jump');

      for (let i = 0; i < 5; i++) {
        this.particles.push({
          x: this.player.x + 6,
          y: this.player.y + this.player.height,
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * 2 + 1,
          life: 1,
          color: '#38bdf8',
        });
      }
    }
  }

  startGame(): void {
    this.gameState.set('playing');
  }

  resetGame(): void {
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
    this.player.y = this.groundY - this.player.height;
    this.player.vy = 0;
    this.player.isGrounded = true;
    this.player.jumpsLeft = 2;
    this.player.rotation = 0;
    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];
    this.gameSpeed = 3.2 * dpr;
    this.spawnTimer = 0;
    this.collectibleTimer = 0;
    this.gameScore.set(0);
    this.gameState.set('ready');
  }

  private stopGameLoop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private initCanvasGame(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = (rect.width || 520) * dpr;
    canvas.height = (rect.height || 160) * dpr;
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    this.groundY = this.canvasHeight - 26 * dpr;

    this.player.x = 32 * dpr;
    this.player.width = 22 * dpr;
    this.player.height = 22 * dpr;
    this.player.y = this.groundY - this.player.height;
    this.player.gravity = 0.52 * dpr;
    this.player.jumpStrength = -9.8 * dpr;

    this.resetGame();
    this.startGameLoop();
  }

  private startGameLoop(): void {
    this.stopGameLoop();
    const loop = () => {
      this.updateGame();
      this.renderGame();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private updateGame(): void {
    if (this.gameState() !== 'playing') return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.gameScore.update((s) => s + 1);
    if (this.gameScore() > this.gameHighScore()) {
      this.gameHighScore.set(this.gameScore());
      try {
        sessionStorage.setItem('packet_runner_high_score', this.gameScore().toString());
      } catch {}
    }
    this.gameSpeed += 0.0005 * dpr;

    this.player.vy += this.player.gravity;
    this.player.y += this.player.vy;

    if (this.player.y >= this.groundY - this.player.height) {
      this.player.y = this.groundY - this.player.height;
      this.player.vy = 0;
      this.player.isGrounded = true;
      this.player.jumpsLeft = 2;
      this.player.rotation = 0;
    } else {
      this.player.rotation += 0.08;
    }

    if (Math.random() < 0.4) {
      this.particles.push({
        x: this.player.x,
        y: this.player.y + this.player.height / 2,
        vx: -this.gameSpeed * 0.4,
        vy: (Math.random() - 0.5) * 1.5,
        life: 1,
        color: this.player.isGrounded ? '#38bdf8' : '#a855f7',
      });
    }

    // Spawn Obstacles
    this.spawnTimer++;
    if (this.spawnTimer > Math.max(50, 105 - Math.floor(this.gameScore() / 400))) {
      this.spawnTimer = 0;
      const obsHeight = (22 + Math.random() * 20) * dpr;
      const obsWidth = (18 + Math.random() * 14) * dpr;
      const label = this.obstacleLabels[Math.floor(Math.random() * this.obstacleLabels.length)];
      this.obstacles.push({
        x: this.canvasWidth + 20,
        y: this.groundY - obsHeight,
        width: obsWidth,
        height: obsHeight,
        label,
        passed: false,
      });
    }

    // Spawn Collectibles
    this.collectibleTimer++;
    if (this.collectibleTimer > 170) {
      this.collectibleTimer = 0;
      const item = this.collectibleItems[Math.floor(Math.random() * this.collectibleItems.length)];
      this.collectibles.push({
        x: this.canvasWidth + 20,
        y: this.groundY - (40 + Math.random() * 50) * dpr,
        radius: 10 * dpr,
        label: item.label,
        points: item.points,
        collected: false,
      });
    }

    // Move Obstacles & Collision Check
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= this.gameSpeed;

      const margin = 3 * dpr;
      if (
        this.player.x + margin < obs.x + obs.width - margin &&
        this.player.x + this.player.width - margin > obs.x + margin &&
        this.player.y + margin < obs.y + obs.height &&
        this.player.y + this.player.height > obs.y + margin
      ) {
        this.triggerGameOver(obs.label);
        return;
      }

      if (obs.x + obs.width < -40) {
        this.obstacles.splice(i, 1);
      }
    }

    // Move Collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.x -= this.gameSpeed;

      const dx = this.player.x + this.player.width / 2 - col.x;
      const dy = this.player.y + this.player.height / 2 - col.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < col.radius + this.player.width / 2) {
        this.gameScore.update((s) => s + col.points);
        this.playSound('score');

        for (let p = 0; p < 8; p++) {
          this.particles.push({
            x: col.x,
            y: col.y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 1,
            color: '#fbbf24',
          });
        }
        this.collectibles.splice(i, 1);
      } else if (col.x < -30) {
        this.collectibles.splice(i, 1);
      }
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.045;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private triggerGameOver(killer: string): void {
    this.gameState.set('gameover');
    this.lastKillerObstacle.set(killer);
    this.playSound('gameover');

    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: this.player.x + this.player.width / 2,
        y: this.player.y + this.player.height / 2,
        vx: (Math.random() - 0.5) * 7,
        vy: (Math.random() - 0.5) * 7,
        life: 1.1,
        color: i % 2 === 0 ? '#f87171' : '#38bdf8',
      });
    }
  }

  private renderGame(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = this.canvasWidth;
    const h = this.canvasHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Background
    ctx.fillStyle = '#070a12';
    ctx.fillRect(0, 0, w, h);

    // Ground Line
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    ctx.moveTo(0, this.groundY);
    ctx.lineTo(w, this.groundY);
    ctx.stroke();

    // Ground Grid Lines
    const offset = (this.gameScore() * this.gameSpeed * 0.5) % (36 * dpr);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
    for (let x = -offset; x < w; x += 36 * dpr) {
      ctx.beginPath();
      ctx.moveTo(x, this.groundY);
      ctx.lineTo(x - 16 * dpr, h);
      ctx.stroke();
    }

    // Particles
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Collectibles
    for (const col of this.collectibles) {
      ctx.save();
      ctx.translate(col.x, col.y);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 0, col.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${8 * dpr}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', 0, 0);

      ctx.fillStyle = '#f8fafc';
      ctx.font = `${8 * dpr}px monospace`;
      ctx.fillText(col.label, 0, -col.radius - 4 * dpr);
      ctx.restore();
    }

    // Obstacles
    for (const obs of this.obstacles) {
      ctx.save();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5 * dpr;

      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

      ctx.fillStyle = '#fca5a5';
      ctx.font = `${8 * dpr}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(obs.label, obs.x + obs.width / 2, obs.y - 4 * dpr);
      ctx.restore();
    }

    // Player (Cyber Cube)
    ctx.save();
    ctx.translate(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
    ctx.rotate(this.player.rotation);

    // Glow
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10 * dpr;

    const grad = ctx.createLinearGradient(
      -this.player.width / 2,
      -this.player.height / 2,
      this.player.width / 2,
      this.player.height / 2
    );
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(1, '#818cf8');

    ctx.fillStyle = grad;
    ctx.fillRect(
      -this.player.width / 2,
      -this.player.height / 2,
      this.player.width,
      this.player.height
    );

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1 * dpr;
    ctx.strokeRect(
      -this.player.width / 2,
      -this.player.height / 2,
      this.player.width,
      this.player.height
    );

    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${8 * dpr}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('{ }', 0, 0);

    ctx.restore();
  }
}
