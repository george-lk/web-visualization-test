import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-hello-canvas',
  imports: [],
  templateUrl: './hello-canvas.html',
  styleUrl: './hello-canvas.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelloCanvas implements AfterViewInit, OnDestroy {
  @ViewChild('canvas')
  private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx: CanvasRenderingContext2D | null = null;
  private frameHandle: number | null = null;
  private isPaused = false;
  private currentHue = 0;
  private fps = 0;
  private frameCount = 0;
  private fpsWindowStart = 0;
  private readonly hueRotationSpeed = 0.05;
  private readonly pauseHandle = { x: 0, y: 0, width: 110, height: 36 };
  private readonly onResize = () => {
    this.resizeCanvas();
    this.renderFrame(performance.now());
  };
  private readonly onClick = (event: MouseEvent) => {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (
      x >= this.pauseHandle.x &&
      x <= this.pauseHandle.x + this.pauseHandle.width &&
      y >= this.pauseHandle.y &&
      y <= this.pauseHandle.y + this.pauseHandle.height
    ) {
      this.togglePause();
    }
  };

  constructor(private readonly zone: NgZone) {}

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.resizeCanvas();
      this.fpsWindowStart = performance.now();
      canvas.addEventListener('click', this.onClick);
      window.addEventListener('resize', this.onResize, { passive: true });
      this.startLoop();
    });
  }

  ngOnDestroy(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (canvas) {
      canvas.removeEventListener('click', this.onClick);
      window.removeEventListener('resize', this.onResize);
    }
    this.stopLoop();
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(window.innerWidth, 1);
    const height = Math.max(window.innerHeight, 1);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    this.pauseHandle.x = Math.max(width - this.pauseHandle.width - 16, 16);
    this.pauseHandle.y = 16;
  }

  private startLoop(): void {
    if (this.frameHandle !== null) {
      return;
    }
    this.frameHandle = requestAnimationFrame(this.tick);
  }

  private stopLoop(): void {
    if (this.frameHandle === null) {
      return;
    }
    cancelAnimationFrame(this.frameHandle);
    this.frameHandle = null;
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.stopLoop();
      this.renderFrame(performance.now());
      return;
    }
    this.fpsWindowStart = performance.now();
    this.frameCount = 0;
    this.startLoop();
  }

  private readonly tick = (timestamp: number): void => {
    this.frameHandle = null;
    this.renderFrame(timestamp);

    if (!this.isPaused) {
      this.startLoop();
    }
  };

  private renderFrame(timestamp: number): void {
    if (!this.ctx) {
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.fillStyle = '#0b1220';
    this.ctx.fillRect(0, 0, width, height);

    this.currentHue = (timestamp * this.hueRotationSpeed) % 360;
    this.ctx.fillStyle = `hsl(${this.currentHue} 95% 65%)`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = '700 72px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    this.ctx.fillText('Hello World', width / 2, height / 2);

    this.frameCount += 1;
    const elapsed = timestamp - this.fpsWindowStart;
    if (elapsed >= 1000) {
      this.fps = (this.frameCount * 1000) / elapsed;
      this.frameCount = 0;
      this.fpsWindowStart = timestamp;
    }

    this.drawPauseHandle();
    this.drawFpsCounter();
  }

  private drawPauseHandle(): void {
    if (!this.ctx) {
      return;
    }

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    this.ctx.fillRect(
      this.pauseHandle.x,
      this.pauseHandle.y,
      this.pauseHandle.width,
      this.pauseHandle.height
    );

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(
      this.pauseHandle.x,
      this.pauseHandle.y,
      this.pauseHandle.width,
      this.pauseHandle.height
    );

    this.ctx.fillStyle = '#f8fafc';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = '600 14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    this.ctx.fillText(
      this.isPaused ? 'Resume' : 'Pause',
      this.pauseHandle.x + this.pauseHandle.width / 2,
      this.pauseHandle.y + this.pauseHandle.height / 2
    );
  }

  private drawFpsCounter(): void {
    if (!this.ctx) {
      return;
    }

    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    this.ctx.fillRect(16, 16, 90, 30);
    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = '600 14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    this.ctx.fillText(`FPS ${this.fps.toFixed(1)}`, 24, 31);
  }
}
