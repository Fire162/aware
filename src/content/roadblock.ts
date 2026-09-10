export interface HardcoreRoadblockOptions {
  domain: string;
  mantra: string;
  focusSiteUrl: string;
  pledgeText: string;
  maxPassSeconds: number;
  antiOcrEnabled: boolean;
  onRedirectToFocus: () => void;
  onCloseTab: () => void;
  onGrantPass: (seconds: number) => void;
}

export class AwareRoadblock {
  private element: HTMLElement;
  private options: HardcoreRoadblockOptions;
  private targetWords: string[];

  constructor(options: HardcoreRoadblockOptions) {
    this.options = options;
    this.targetWords = options.pledgeText.trim().split(/\s+/);
    this.element = document.createElement('div');
    this.element.className = 'aware-roadblock-overlay';

    this.render();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  private render(): void {
    const { domain, mantra, focusSiteUrl, pledgeText, maxPassSeconds, antiOcrEnabled } = this.options;
    const wordCount = this.targetWords.length;

    this.element.innerHTML = `
      <div class="aware-roadblock-modal">
        <!-- Top Focus Exit Header -->
        <div class="aware-header-bar">
          <div class="aware-shield-tag">
            <span class="aware-pulse-dot"></span>
            AWARE HARDCORE GUARD
          </div>
          <button class="aware-btn aware-btn-focus-redirect" title="Redirect to productive work (Esc)">
            ⚡ Return to Focus Site (${this.escapeHtml(this.getDomainOnly(focusSiteUrl))}) [Esc]
          </button>
        </div>

        <div class="aware-title-box">
          <h1 class="aware-roadblock-title">Access Blocked: ${this.escapeHtml(domain)}</h1>
          <p class="aware-roadblock-subtitle">
            This site is protected. To proceed, you must manually type the exact <strong>${wordCount}-word</strong> commitment pledge below.
          </p>
        </div>

        <!-- Personal Mantra -->
        <div class="aware-mantra-card">
          "${this.escapeHtml(mantra)}"
        </div>

        <!-- Anti-OCR / Anti-Copy Text Canvas -->
        <div class="aware-pledge-viewport">
          <div class="aware-pledge-meta">
            <span class="aware-meta-label">🔒 Anti-Copy Commitment Pledge (${wordCount} words)</span>
            <span class="aware-meta-tag">Pasting & OCR Disabled</span>
          </div>
          <canvas class="aware-pledge-canvas"></canvas>
        </div>

        <!-- Typing Arena -->
        <div class="aware-typing-arena">
          <div class="aware-typing-header">
            <span class="aware-progress-text">Progress: <strong>0</strong> / ${wordCount} words (0%)</span>
            <span class="aware-status-pill aware-status-idle">Awaiting typing...</span>
          </div>
          
          <div class="aware-progress-track">
            <div class="aware-progress-fill"></div>
          </div>

          <textarea
            class="aware-typing-input"
            rows="5"
            placeholder="Begin typing the exact pledge here (exact capitalization and punctuation required)..."
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          ></textarea>

          <div class="aware-warning-toast" style="display: none;">
            ⚠️ Pasting is strictly blocked! You must type each character manually.
          </div>
        </div>

        <!-- Bottom Action Row -->
        <div class="aware-bottom-actions">
          <button class="aware-btn aware-btn-close-direct" title="Close this tab">
            Close Tab
          </button>
          <button class="aware-btn aware-btn-unlock" disabled>
            🔒 Type full pledge to unlock (Max ${maxPassSeconds}s)
          </button>
        </div>
      </div>
    `;

    // Hook Exit Buttons
    const redirectBtn = this.element.querySelector('.aware-btn-focus-redirect');
    redirectBtn?.addEventListener('click', () => {
      this.options.onRedirectToFocus();
    });

    const closeBtn = this.element.querySelector('.aware-btn-close-direct');
    closeBtn?.addEventListener('click', () => {
      this.options.onCloseTab();
    });

    // Render Canvas Text with Anti-OCR gridlines
    const canvas = this.element.querySelector('.aware-pledge-canvas') as HTMLCanvasElement;
    if (canvas) {
      this.renderPledgeOnCanvas(canvas, pledgeText, antiOcrEnabled);
    }

    // Initialize strict anti-cheat and typing engine
    this.initTypingEngine();
  }

  private renderPledgeOnCanvas(canvas: HTMLCanvasElement, text: string, antiOcr: boolean): void {
    // Delay slightly to ensure element has width
    requestAnimationFrame(() => {
      const containerWidth = canvas.parentElement?.clientWidth || 700;
      const width = Math.max(600, containerWidth - 24);
      const fontSize = 13;
      const lineHeight = 21;
      const padding = 16;
      const maxTextWidth = width - padding * 2;

      // Temporary context to measure words
      const tempCtx = document.createElement('canvas').getContext('2d')!;
      tempCtx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace`;

      // Word wrapping
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = tempCtx.measureText(testLine).width;

        if (testWidth > maxTextWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }

      const height = padding * 2 + lines.length * lineHeight;

      // Configure high-DPI canvas
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d')!;
      ctx.scale(dpr, dpr);

      // Background
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, width, height);

      // Faint Anti-OCR Security Gridlines
      if (antiOcr) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
        ctx.lineWidth = 1;
        const step = 20;
        for (let x = 0; x < width; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      // Text Render
      ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace`;
      ctx.fillStyle = '#E2E8F0';
      ctx.textBaseline = 'top';

      let y = padding;
      for (const line of lines) {
        ctx.fillText(line, padding, y);
        y += lineHeight;
      }
    });
  }

  private initTypingEngine(): void {
    const input = this.element.querySelector('.aware-typing-input') as HTMLTextAreaElement;
    const progressText = this.element.querySelector('.aware-progress-text') as HTMLElement;
    const progressFill = this.element.querySelector('.aware-progress-fill') as HTMLElement;
    const statusPill = this.element.querySelector('.aware-status-pill') as HTMLElement;
    const warningToast = this.element.querySelector('.aware-warning-toast') as HTMLElement;
    const unlockBtn = this.element.querySelector('.aware-btn-unlock') as HTMLButtonElement;

    if (!input || !progressText || !progressFill || !statusPill || !unlockBtn) return;

    // Show warning toast for illegal paste / drag attempts
    const showWarning = (msg: string) => {
      warningToast.textContent = msg;
      warningToast.style.display = 'block';
      warningToast.classList.add('shake');
      setTimeout(() => {
        warningToast.style.display = 'none';
        warningToast.classList.remove('shake');
      }, 3000);
    };

    // 1. Anti-Paste Protection
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      showWarning('⚠️ Pasting is strictly blocked! You must type each character manually.');
    });

    input.addEventListener('drop', (e) => {
      e.preventDefault();
      showWarning('⚠️ Drag-and-drop is blocked.');
    });

    input.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Block keyboard paste shortcuts
    input.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        showWarning('⚠️ Paste shortcuts (Ctrl+V / Cmd+V) are disabled.');
      }
    });

    // 2. Real-time typing verification
    const target = this.options.pledgeText.trim();
    const totalWords = this.targetWords.length;

    input.addEventListener('input', () => {
      const typed = input.value;
      const isPrefixMatch = target.startsWith(typed);
      const typedWords = typed.trim() ? typed.trim().split(/\s+/).length : 0;
      const pct = Math.min(100, Math.round((typed.length / target.length) * 100));

      progressText.innerHTML = `Progress: <strong>${typedWords}</strong> / ${totalWords} words (${pct}%)`;
      progressFill.style.width = `${pct}%`;

      if (!typed) {
        statusPill.className = 'aware-status-pill aware-status-idle';
        statusPill.textContent = 'Awaiting typing...';
        input.classList.remove('typing-error');
        unlockBtn.disabled = true;
      } else if (!isPrefixMatch) {
        // Typo detected
        statusPill.className = 'aware-status-pill aware-status-error';
        statusPill.textContent = 'Typo detected! Check punctuation & capitals';
        input.classList.add('typing-error');
        unlockBtn.disabled = true;
      } else if (typed === target) {
        // 100% Exact match!
        statusPill.className = 'aware-status-pill aware-status-success';
        statusPill.textContent = '✓ 100% Perfect Match!';
        input.classList.remove('typing-error');
        unlockBtn.disabled = false;
        unlockBtn.classList.add('ready-to-unlock');
        unlockBtn.textContent = `🔓 Unlock Access for strictly ${this.options.maxPassSeconds}s`;
      } else {
        // Correct so far
        statusPill.className = 'aware-status-pill aware-status-typing';
        statusPill.textContent = 'Accuracy 100% • Keep going...';
        input.classList.remove('typing-error');
        unlockBtn.disabled = true;
      }
    });

    // 3. Unlock button handler
    unlockBtn.addEventListener('click', () => {
      if (input.value === target) {
        this.options.onGrantPass(this.options.maxPassSeconds);
      }
    });
  }

  private getDomainOnly(urlStr: string): string {
    try {
      return new URL(urlStr).hostname.replace(/^www\./, '');
    } catch {
      return 'Focus Site';
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
