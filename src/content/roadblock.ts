import { formatTime } from './banner';

export interface RoadblockOptions {
  domain: string;
  mantra: string;
  elapsedSeconds: number;
  frictionType: 'breathing' | 'pledge';
  onCloseTab: () => void;
  onGrantPass: (minutes: number) => void;
}

export class AwareRoadblock {
  private element: HTMLElement;
  private options: RoadblockOptions;
  private intervalId: number | null = null;

  constructor(options: RoadblockOptions) {
    this.options = options;
    this.element = document.createElement('div');
    this.element.className = 'aware-roadblock-overlay';

    this.render();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  private render(): void {
    const { domain, mantra, elapsedSeconds, frictionType } = this.options;
    const minutes = Math.max(1, Math.round(elapsedSeconds / 60));

    this.element.innerHTML = `
      <div class="aware-roadblock-modal">
        <div class="aware-icon-wrapper">
          ⏳
        </div>
        <div>
          <h2 class="aware-roadblock-title">Time to Refocus</h2>
          <p class="aware-roadblock-subtitle">
            You've spent over <strong>${minutes} minute${minutes > 1 ? 's' : ''}</strong> on <strong>${this.escapeHtml(domain)}</strong>.
          </p>
        </div>

        <div class="aware-mantra-card">
          "${this.escapeHtml(mantra)}"
        </div>

        <div class="aware-roadblock-actions">
          <button class="aware-btn aware-btn-large-close aware-btn-exit" title="Close this tab (Esc)">
            Close Tab & Return to Work (Esc)
          </button>
        </div>

        <div class="aware-friction-section">
          ${
            frictionType === 'breathing'
              ? `
              <div class="aware-breath-circle">Breathe</div>
              <p class="aware-friction-desc aware-breath-status">Take a 10-second mindful pause before deciding...</p>
              <button class="aware-btn aware-btn-secondary aware-btn-pass" disabled style="opacity: 0.5; cursor: not-allowed;">
                Unlock 5-min Pass (10s)
              </button>
            `
              : `
              <p class="aware-friction-desc">Type this phrase to unlock access:</p>
              <code style="font-size: 11px; background: rgba(255,255,255,0.08); padding: 4px 8px; border-radius: 4px; color: #93C5FD;">I am choosing to stay intentionally</code>
              <input type="text" class="aware-pledge-input" placeholder="Type the pledge here..." />
              <button class="aware-btn aware-btn-secondary aware-btn-pass" disabled style="opacity: 0.5; cursor: not-allowed;">
                Unlock 5-min Pass
              </button>
            `
          }
        </div>
      </div>
    `;

    // Hook Close Button
    const exitBtn = this.element.querySelector('.aware-btn-exit');
    exitBtn?.addEventListener('click', () => {
      this.options.onCloseTab();
    });

    // Hook Friction
    if (frictionType === 'breathing') {
      this.initBreathingExercise();
    } else {
      this.initPledgeExercise();
    }
  }

  private initBreathingExercise(): void {
    const circle = this.element.querySelector('.aware-breath-circle') as HTMLElement;
    const statusText = this.element.querySelector('.aware-breath-status') as HTMLElement;
    const passBtn = this.element.querySelector('.aware-btn-pass') as HTMLButtonElement;

    if (!circle || !statusText || !passBtn) return;

    let countdown = 10;
    circle.classList.add('expanding');
    circle.textContent = 'Inhale...';

    this.intervalId = window.setInterval(() => {
      countdown -= 1;

      if (countdown === 5) {
        circle.classList.remove('expanding');
        circle.classList.add('contracting');
        circle.textContent = 'Exhale...';
      }

      if (countdown > 0) {
        statusText.textContent = `Mindful pause: ${countdown}s remaining...`;
        passBtn.textContent = `Unlock 5-min Pass (${countdown}s)`;
      } else {
        if (this.intervalId) clearInterval(this.intervalId);
        circle.classList.remove('contracting');
        circle.textContent = 'Clear';
        statusText.textContent = 'Mindfulness completed. Are you sure you wish to continue?';
        passBtn.disabled = false;
        passBtn.style.opacity = '1';
        passBtn.style.cursor = 'pointer';
        passBtn.textContent = 'Continue for 5 Minutes';
        passBtn.classList.remove('aware-btn-secondary');
        passBtn.classList.add('aware-btn-primary');

        passBtn.addEventListener('click', () => {
          this.options.onGrantPass(5);
        });
      }
    }, 1000);
  }

  private initPledgeExercise(): void {
    const input = this.element.querySelector('.aware-pledge-input') as HTMLInputElement;
    const passBtn = this.element.querySelector('.aware-btn-pass') as HTMLButtonElement;
    const target = 'I am choosing to stay intentionally';

    if (!input || !passBtn) return;

    input.addEventListener('input', () => {
      if (input.value.trim().toLowerCase() === target.toLowerCase()) {
        passBtn.disabled = false;
        passBtn.style.opacity = '1';
        passBtn.style.cursor = 'pointer';
        passBtn.classList.remove('aware-btn-secondary');
        passBtn.classList.add('aware-btn-primary');
      } else {
        passBtn.disabled = true;
        passBtn.style.opacity = '0.5';
        passBtn.style.cursor = 'not-allowed';
      }
    });

    passBtn.addEventListener('click', () => {
      if (!passBtn.disabled) {
        this.options.onGrantPass(5);
      }
    });
  }

  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.element.remove();
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
