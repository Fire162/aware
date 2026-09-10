export interface PassHudOptions {
  domain: string;
  totalSeconds: number;
  initialRemainingSeconds: number;
  onExpire: () => void;
  onRedirectToFocus: () => void;
}

export class AwarePassHud {
  private element: HTMLElement;
  private remaining: number;
  private total: number;
  private timerId: number | null = null;
  private timeSpan: HTMLElement;
  private progressFill: HTMLElement;

  constructor(options: PassHudOptions) {
    this.total = options.totalSeconds;
    this.remaining = options.initialRemainingSeconds;

    this.element = document.createElement('div');
    this.element.className = 'aware-pass-hud';

    this.element.innerHTML = `
      <div class="aware-hud-header">
        <span class="aware-hud-pulse"></span>
        <span class="aware-hud-title">AWARE • TEMPORARY PASS</span>
        <span class="aware-hud-timer">${this.remaining}s</span>
      </div>
      <div class="aware-hud-track">
        <div class="aware-hud-fill" style="width: 100%;"></div>
      </div>
      <button class="aware-hud-btn" title="Return to Focus Site">
        Return to Focus Site (Esc)
      </button>
    `;

    this.timeSpan = this.element.querySelector('.aware-hud-timer') as HTMLElement;
    this.progressFill = this.element.querySelector('.aware-hud-fill') as HTMLElement;

    const exitBtn = this.element.querySelector('.aware-hud-btn');
    exitBtn?.addEventListener('click', () => {
      options.onRedirectToFocus();
    });

    this.startCountdown(options.onExpire);
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  private startCountdown(onExpire: () => void): void {
    this.timerId = window.setInterval(() => {
      this.remaining -= 1;
      const pct = Math.max(0, Math.round((this.remaining / this.total) * 100));

      if (this.timeSpan) {
        this.timeSpan.textContent = `${this.remaining}s`;
      }
      if (this.progressFill) {
        this.progressFill.style.width = `${pct}%`;
      }

      if (this.remaining <= 0) {
        this.destroy();
        onExpire();
      }
    }, 1000);
  }

  public destroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.element.remove();
  }
}
