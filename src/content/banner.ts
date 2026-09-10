export interface BannerOptions {
  domain: string;
  mantra: string;
  initialElapsedSeconds: number;
  onCloseTab: () => void;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export class AwareBanner {
  private element: HTMLElement;
  private timerSpan: HTMLElement;
  private elapsedSeconds: number;
  private isMinimized: boolean = false;

  constructor(options: BannerOptions) {
    this.elapsedSeconds = options.initialElapsedSeconds;

    this.element = document.createElement('div');
    this.element.className = 'aware-banner-container';

    this.element.innerHTML = `
      <div class="aware-pulse-badge">
        <div class="aware-dot"></div>
        <span>AWARE</span>
      </div>
      <div class="aware-banner-content">
        <div class="aware-banner-header">
          <span>${this.escapeHtml(options.domain)}</span>
          <span>•</span>
          <span class="aware-timer">${formatTime(this.elapsedSeconds)}</span>
        </div>
        <div class="aware-mantra-text" title="${this.escapeHtml(options.mantra)}">
          ${this.escapeHtml(options.mantra)}
        </div>
      </div>
      <div class="aware-banner-actions">
        <button class="aware-btn aware-btn-primary aware-btn-close" title="Close this distracting tab (Esc)">
          Close Tab
        </button>
        <button class="aware-btn aware-btn-secondary aware-btn-min" title="Minimize reminder">
          ✕
        </button>
      </div>
    `;

    this.timerSpan = this.element.querySelector('.aware-timer') as HTMLElement;

    const closeBtn = this.element.querySelector('.aware-btn-close');
    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      options.onCloseTab();
    });

    const minBtn = this.element.querySelector('.aware-btn-min');
    minBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMinimize();
    });

    this.element.addEventListener('click', () => {
      if (this.isMinimized) {
        this.toggleMinimize();
      }
    });
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public updateTime(seconds: number): void {
    this.elapsedSeconds = seconds;
    if (this.timerSpan) {
      this.timerSpan.textContent = formatTime(seconds);
    }
  }

  public toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
    if (this.isMinimized) {
      this.element.classList.add('minimized');
      this.element.title = `Aware: ${formatTime(this.elapsedSeconds)} on this site. Click to expand.`;
    } else {
      this.element.classList.remove('minimized');
      this.element.title = '';
    }
  }

  public destroy(): void {
    this.element.remove();
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
