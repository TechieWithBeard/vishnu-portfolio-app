import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
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
  selector: 'app-cloud-boot-hud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cloud-boot-hud.component.html',
  styleUrls: ['./cloud-boot-hud.component.scss'],
})
export class CloudBootHudComponent implements OnDestroy {
  protected readonly apiService = inject(PortfolioApiService);

  @ViewChild('gameCanvas') canvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('terminalBody') terminalBodyRef?: ElementRef<HTMLDivElement>;

  // Bridge signals from service
  readonly cloudStatus = this.apiService.cloudStatus;
  readonly elapsedSeconds = this.apiService.elapsedSeconds;
  readonly bootProgress = this.apiService.bootProgress;
  readonly bootLogs = this.apiService.bootLogs;
  readonly servicesStatus = this.apiService.servicesStatus;
  readonly isHudOpen = this.apiService.isHudOpen;
  readonly activeTab = this.apiService.activeHudTab;

  // Sound toggle (muted by default for recruiter etiquette)
  readonly soundEnabled = signal<boolean>(false);

  // Audio Context (lazy initialized)
  private audioCtx: AudioContext | null = null;

  // Game state
  readonly gameScore = signal<number>(0);
  readonly gameHighScore = signal<number>(0);
  readonly globalHighScore = this.apiService.globalHighScore;
  readonly isNewRecord = signal<boolean>(false);
  readonly gameState = signal<'ready' | 'playing' | 'gameover'>('ready');
  readonly lastKillerObstacle = signal<string>('');

  private animationFrameId: number | null = null;
  private canvasWidth = 560;
  private canvasHeight = 220;
  private groundY = 175;

  // Game entity variables
  private player = {
    x: 48,
    y: 135,
    width: 28,
    height: 28,
    vy: 0,
    gravity: 0.58,
    jumpStrength: -10.2,
    isGrounded: true,
    jumpsLeft: 2,
    rotation: 0,
  };

  private obstacles: Obstacle[] = [];
  private collectibles: Collectible[] = [];
  private particles: Particle[] = [];
  private gameSpeed = 3.6;
  private spawnTimer = 0;
  private collectibleTimer = 0;

  private readonly obstacleLabels = [
    'Memory Leak',
    '404 Not Found',
    'Merge Conflict',
    'CORS Error',
    'Null Pointer',
    'High Latency',
  ];

  private readonly collectibleItems = [
    { label: '⚡ Signal', points: 50, color: '#38bdf8' },
    { label: '💎 Nx Cache', points: 100, color: '#a855f7' },
    { label: '✨ Supabase', points: 75, color: '#34d399' },
  ];

  constructor() {
    // Load high score from session
    try {
      const saved = sessionStorage.getItem('packet_runner_high_score');
      if (saved) this.gameHighScore.set(parseInt(saved, 10) || 0);
    } catch {}

    // Auto-scroll terminal on new logs
    effect(() => {
      this.bootLogs();
      setTimeout(() => {
        if (this.terminalBodyRef?.nativeElement) {
          const el = this.terminalBodyRef.nativeElement;
          el.scrollTop = el.scrollHeight;
        }
      }, 50);
    });

    // Start/stop game loop when switching to arcade tab
    effect(() => {
      const isOpen = this.isHudOpen();
      const tab = this.activeTab();
      if (isOpen && tab === 'arcade') {
        setTimeout(() => this.initCanvasGame(), 100);
      } else {
        this.stopGameLoop();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopGameLoop();
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch {}
    }
  }

  // --- HUD Actions ---
  openHud(tab: 'terminal' | 'arcade' = 'terminal'): void {
    this.apiService.openHud(tab);
  }

  closeHud(): void {
    this.apiService.closeHud();
  }

  switchTab(tab: 'terminal' | 'arcade'): void {
    this.apiService.setHudTab(tab);
  }

  toggleSound(): void {
    this.soundEnabled.update((s) => !s);
    if (this.soundEnabled() && !this.audioCtx) {
      this.initAudioContext();
    }
  }

  // --- Audio Synthesis (8-bit Web Audio) ---
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
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'score') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'gameover') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.28);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  }

  private lastTouchTimestamp = 0;

  // --- Keyboard & Touch Handlers ---
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isHudOpen() || this.activeTab() !== 'arcade') return;

    if (event.code === 'Space' || event.code === 'ArrowUp') {
      event.preventDefault();
      this.handlePlayerAction();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isHudOpen() && this.activeTab() === 'arcade') {
      this.recalibrateCanvas();
    }
  }

  handlePointerDown(event: PointerEvent): void {
    if (event.cancelable) {
      event.preventDefault();
    }
    this.lastTouchTimestamp = Date.now();
    this.handlePlayerAction();
  }

  handleCanvasClick(): void {
    if (Date.now() - this.lastTouchTimestamp < 350) return;
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

  private jump(): void {
    if (this.player.jumpsLeft > 0) {
      this.player.vy = this.player.jumpStrength;
      this.player.isGrounded = false;
      this.player.jumpsLeft--;
      this.playSound('jump');

      // Add jump blast particles
      for (let i = 0; i < 6; i++) {
        this.particles.push({
          x: this.player.x + 8,
          y: this.player.y + this.player.height,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 2 + 1,
          life: 1,
          color: '#38bdf8',
        });
      }
    }
  }

  // --- Game Engine ---
  private recalibrateCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const newWidth = Math.round(rect.width * dpr);
    const newHeight = Math.round(rect.height * dpr);

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
      this.canvasWidth = newWidth;
      this.canvasHeight = newHeight;
      this.groundY = this.canvasHeight - 38 * dpr;

      this.player.width = 26 * dpr;
      this.player.height = 26 * dpr;
      this.player.x = 40 * dpr;
      this.player.gravity = 0.55 * dpr;
      this.player.jumpStrength = -10.5 * dpr;
      if (this.player.isGrounded) {
        this.player.y = this.groundY - this.player.height;
      }
    }
  }

  private initCanvasGame(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    // Adjust canvas resolution for DPI
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = (rect.height || 220) * dpr;
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    this.groundY = this.canvasHeight - 38 * dpr;

    this.player.x = 40 * dpr;
    this.player.width = 26 * dpr;
    this.player.height = 26 * dpr;
    this.player.y = this.groundY - this.player.height;
    this.player.gravity = 0.55 * dpr;
    this.player.jumpStrength = -10.5 * dpr;

    this.resetGame();
    this.startGameLoop();
  }

  private startGame(): void {
    this.isNewRecord.set(false);
    this.gameState.set('playing');
  }

  private resetGame(): void {
    this.isNewRecord.set(false);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.player.y = this.groundY - this.player.height;
    this.player.vy = 0;
    this.player.isGrounded = true;
    this.player.jumpsLeft = 2;
    this.player.rotation = 0;
    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];
    this.gameSpeed = 3.6 * dpr;
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

    // Increment score & speed
    this.gameScore.update((s) => s + 1);
    if (this.gameScore() > this.gameHighScore()) {
      this.gameHighScore.set(this.gameScore());
      try {
        sessionStorage.setItem('packet_runner_high_score', this.gameScore().toString());
      } catch {}
    }
    this.gameSpeed += 0.0006 * dpr;

    // Apply Player Physics
    this.player.vy += this.player.gravity;
    this.player.y += this.player.vy;

    // Ground Collision
    if (this.player.y >= this.groundY - this.player.height) {
      this.player.y = this.groundY - this.player.height;
      this.player.vy = 0;
      this.player.isGrounded = true;
      this.player.jumpsLeft = 2;
      this.player.rotation = 0;
    } else {
      this.player.rotation += 0.08;
    }

    // Trailing particles
    if (Math.random() < 0.45) {
      this.particles.push({
        x: this.player.x,
        y: this.player.y + this.player.height / 2 + (Math.random() - 0.5) * 10,
        vx: -this.gameSpeed * 0.4,
        vy: (Math.random() - 0.5) * 1.5,
        life: 1,
        color: this.player.isGrounded ? '#38bdf8' : '#a855f7',
      });
    }

    // Spawn Obstacles
    this.spawnTimer++;
    if (this.spawnTimer > Math.max(55, 110 - Math.floor(this.gameScore() / 400))) {
      this.spawnTimer = 0;
      const obsHeight = (28 + Math.random() * 22) * dpr;
      const obsWidth = (22 + Math.random() * 16) * dpr;
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
    if (this.collectibleTimer > 180) {
      this.collectibleTimer = 0;
      const item = this.collectibleItems[Math.floor(Math.random() * this.collectibleItems.length)];
      this.collectibles.push({
        x: this.canvasWidth + 30,
        y: this.groundY - (50 + Math.random() * 60) * dpr,
        radius: 12 * dpr,
        label: item.label,
        points: item.points,
        collected: false,
      });
    }

    // Move Obstacles & Collision Check
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= this.gameSpeed;

      // Hitbox with slight grace margin (4px)
      const margin = 4 * dpr;
      if (
        this.player.x + margin < obs.x + obs.width - margin &&
        this.player.x + this.player.width - margin > obs.x + margin &&
        this.player.y + margin < obs.y + obs.height &&
        this.player.y + this.player.height > obs.y + margin
      ) {
        this.triggerGameOver(obs.label);
        return;
      }

      // Remove offscreen
      if (obs.x + obs.width < -50) {
        this.obstacles.splice(i, 1);
      }
    }

    // Move Collectibles & Pickup Check
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.x -= this.gameSpeed;

      const dx = this.player.x + this.player.width / 2 - col.x;
      const dy = this.player.y + this.player.height / 2 - col.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < col.radius + this.player.width / 2) {
        // Collect!
        this.gameScore.update((s) => s + col.points);
        this.playSound('score');

        // Sparkle burst
        for (let p = 0; p < 10; p++) {
          this.particles.push({
            x: col.x,
            y: col.y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 1,
            color: '#fbbf24',
          });
        }
        this.collectibles.splice(i, 1);
      } else if (col.x < -40) {
        this.collectibles.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private triggerGameOver(killer: string): void {
    this.gameState.set('gameover');
    this.lastKillerObstacle.set(killer);
    this.playSound('gameover');

    const finalScore = this.gameScore();
    if (finalScore > 0) {
      this.apiService.submitArcadeScore(finalScore).subscribe((res) => {
        if (res?.isNewRecord) {
          this.isNewRecord.set(true);
        }
      });
    }

    // Death explosion
    for (let i = 0; i < 24; i++) {
      this.particles.push({
        x: this.player.x + this.player.width / 2,
        y: this.player.y + this.player.height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1.2,
        color: i % 2 === 0 ? '#f87171' : '#38bdf8',
      });
    }
  }

  // --- Canvas Rendering ---
  private renderGame(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = this.canvasWidth;
    const h = this.canvasHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // 1. Clear background (Cyber Dark)
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    // 2. Animated Ground Grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    ctx.moveTo(0, this.groundY);
    ctx.lineTo(w, this.groundY);
    ctx.stroke();

    // Moving ground grid markers
    const markerOffset = (this.gameScore() * this.gameSpeed * 0.5) % (40 * dpr);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    for (let x = -markerOffset; x < w; x += 40 * dpr) {
      ctx.beginPath();
      ctx.moveTo(x, this.groundY);
      ctx.lineTo(x - 20 * dpr, h);
      ctx.stroke();
    }

    // 3. Render Particles
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 4. Render Collectibles
    for (const col of this.collectibles) {
      ctx.save();
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8 * dpr;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(col.x, col.y, col.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner glow
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(col.x, col.y, col.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Label floating above
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#f8fafc';
      ctx.font = `bold ${9 * dpr}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(col.label, col.x, col.y - col.radius - 4 * dpr);
      ctx.restore();
    }

    // 5. Render Obstacles
    for (const obs of this.obstacles) {
      ctx.save();
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 6 * dpr;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 1.5 * dpr;

      // Rounded glitch obstacle
      const r = 4 * dpr;
      ctx.beginPath();
      ctx.roundRect(obs.x, obs.y, obs.width, obs.height, [r, r, 0, 0]);
      ctx.fill();
      ctx.stroke();

      // Obstacle tag text
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fecaca';
      ctx.font = `${8.5 * dpr}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(obs.label, obs.x + obs.width / 2, obs.y - 5 * dpr);
      ctx.restore();
    }

    // 6. Render Player (Cyber Data Packet / Cube)
    if (this.gameState() !== 'gameover') {
      ctx.save();
      ctx.translate(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
      ctx.rotate(this.player.rotation);

      // Glow effect
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12 * dpr;

      // Outer cube
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-this.player.width / 2, -this.player.height / 2, this.player.width, this.player.height);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2 * dpr;
      ctx.strokeRect(-this.player.width / 2, -this.player.height / 2, this.player.width, this.player.height);

      // Inner cyber eye/core
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4 * dpr, -4 * dpr, 8 * dpr, 8 * dpr);

      ctx.restore();
    }

    // 7. Overlay HUD on Canvas
    ctx.fillStyle = '#f8fafc';
    ctx.font = `bold ${12 * dpr}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${this.gameScore()}`, 16 * dpr, 24 * dpr);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`🏆 SUPABASE: ${this.globalHighScore()}`, w - 16 * dpr, 24 * dpr);

    // 8. Ready / Game Over Overlays
    if (this.gameState() === 'ready') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(0, 0, w, h);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#38bdf8';
      ctx.font = `bold ${18 * dpr}px sans-serif`;
      ctx.fillText('🚀 PACKET RUNNER', w / 2, h / 2 - 18 * dpr);

      ctx.fillStyle = '#f8fafc';
      ctx.font = `${11 * dpr}px sans-serif`;
      ctx.fillText(`Dodge bugs • 🏆 All-Time Record: ${this.globalHighScore()} (Supabase)`, w / 2, h / 2 + 6 * dpr);

      ctx.fillStyle = '#fbbf24';
      ctx.font = `bold ${11.5 * dpr}px monospace`;
      ctx.fillText('[ Press SPACE or Tap to Play ]', w / 2, h / 2 + 32 * dpr);
    } else if (this.gameState() === 'gameover') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.fillRect(0, 0, w, h);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ef4444';
      ctx.font = `bold ${18 * dpr}px sans-serif`;
      ctx.fillText(`💥 KILLED BY ${this.lastKillerObstacle() || 'BUG'}`, w / 2, h / 2 - 18 * dpr);

      ctx.fillStyle = '#f8fafc';
      ctx.font = `${12 * dpr}px monospace`;
      const recordNotice = this.isNewRecord() ? ' 🎉 (NEW RECORD!)' : '';
      ctx.fillText(`Score: ${this.gameScore()}  •  🏆 Supabase High: ${this.globalHighScore()}${recordNotice}`, w / 2, h / 2 + 6 * dpr);

      ctx.fillStyle = '#38bdf8';
      ctx.font = `bold ${11.5 * dpr}px monospace`;
      ctx.fillText('[ Press SPACE or Tap to Retry ]', w / 2, h / 2 + 32 * dpr);
    }
  }
}
