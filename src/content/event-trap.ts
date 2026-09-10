export class EventShield {
  private active: boolean = false;
  private mediaInterval: number | null = null;
  private onEscapeCallback: (() => void) | null = null;
  private originalHtmlOverflow: string = '';
  private originalBodyOverflow: string = '';

  public activate(onEscape: () => void): void {
    if (this.active) return;
    this.active = true;
    this.onEscapeCallback = onEscape;

    // Freeze page scroll
    this.originalHtmlOverflow = document.documentElement.style.overflow;
    this.originalBodyOverflow = document.body ? document.body.style.overflow : '';
    document.documentElement.style.overflow = 'hidden';
    if (document.body) {
      document.body.style.overflow = 'hidden';
    }

    // Immediately pause any playing media on host page
    this.silenceMedia();
    this.mediaInterval = window.setInterval(() => this.silenceMedia(), 600);

    // Register Capture-phase event traps at window level
    window.addEventListener('keydown', this.handleKeyDown, { capture: true, passive: false });
    window.addEventListener('keyup', this.handleKeyUp, { capture: true, passive: false });
    window.addEventListener('keypress', this.handleKeyPress, { capture: true, passive: false });
    window.addEventListener('click', this.handlePointer, { capture: true, passive: false });
    window.addEventListener('mousedown', this.handlePointer, { capture: true, passive: false });
    window.addEventListener('mouseup', this.handlePointer, { capture: true, passive: false });
    window.addEventListener('contextmenu', this.handlePointer, { capture: true, passive: false });
    window.addEventListener('wheel', this.handleWheel, { capture: true, passive: false });
    window.addEventListener('touchmove', this.handleWheel, { capture: true, passive: false });
  }

  public deactivate(): void {
    if (!this.active) return;
    this.active = false;
    this.onEscapeCallback = null;

    // Restore page scroll
    document.documentElement.style.overflow = this.originalHtmlOverflow;
    if (document.body) {
      document.body.style.overflow = this.originalBodyOverflow;
    }

    if (this.mediaInterval) {
      clearInterval(this.mediaInterval);
      this.mediaInterval = null;
    }

    window.removeEventListener('keydown', this.handleKeyDown, { capture: true });
    window.removeEventListener('keyup', this.handleKeyUp, { capture: true });
    window.removeEventListener('keypress', this.handleKeyPress, { capture: true });
    window.removeEventListener('click', this.handlePointer, { capture: true });
    window.removeEventListener('mousedown', this.handlePointer, { capture: true });
    window.removeEventListener('mouseup', this.handlePointer, { capture: true });
    window.removeEventListener('contextmenu', this.handlePointer, { capture: true });
    window.removeEventListener('wheel', this.handleWheel, { capture: true });
    window.removeEventListener('touchmove', this.handleWheel, { capture: true });
  }

  private silenceMedia(): void {
    try {
      const media = document.querySelectorAll<HTMLMediaElement>('video, audio');
      media.forEach((item) => {
        if (!item.paused) {
          item.pause();
        }
      });
    } catch {
      // Ignored
    }
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (!this.active) return;

    // Escape shortcut: redirect to focus site
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      this.onEscapeCallback?.();
      return;
    }

    const path = e.composedPath();
    const isInsideAware = path.some((el) => {
      const elId = (el as HTMLElement)?.id;
      return elId === 'aware-hardcore-root';
    });

    if (!isInsideAware) {
      // Background website shortcut intercepted (e.g. YouTube Space, K, J, L, F, M)
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return;
    }

    // Inside our Aware guard
    const target = path[0] as HTMLElement;
    if (target && target.tagName === 'TEXTAREA') {
      // Intercept and block paste shortcuts (Ctrl+V / Cmd+V)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }
      // Allow user typing, but stop propagation so the host page never sees the keystroke!
      e.stopPropagation();
      e.stopImmediatePropagation();
      return;
    }

    if (target && (target.tagName === 'BUTTON' || target.tagName === 'INPUT')) {
      e.stopPropagation();
      return;
    }

    // All other keystrokes neutralized
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    if (!this.active) return;
    const path = e.composedPath();
    const isInsideAware = path.some((el) => (el as HTMLElement)?.id === 'aware-hardcore-root');

    if (!isInsideAware) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    } else {
      e.stopPropagation();
    }
  };

  private handleKeyPress = (e: KeyboardEvent): void => {
    if (!this.active) return;
    const path = e.composedPath();
    const isInsideAware = path.some((el) => (el as HTMLElement)?.id === 'aware-hardcore-root');

    if (!isInsideAware) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    } else {
      e.stopPropagation();
    }
  };

  private handlePointer = (e: MouseEvent): void => {
    if (!this.active) return;
    const path = e.composedPath();
    const isInsideAware = path.some((el) => (el as HTMLElement)?.id === 'aware-hardcore-root');

    if (!isInsideAware) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return;
    }

    // Inside Aware: allow clicks on textarea, buttons, or canvas
    const target = path[0] as HTMLElement;
    if (
      target &&
      (target.tagName === 'BUTTON' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'INPUT' ||
        target.classList?.contains('aware-btn'))
    ) {
      e.stopPropagation();
      return;
    }
  };

  private handleWheel = (e: Event): void => {
    if (!this.active) return;
    const path = e.composedPath();
    // Allow scrolling only if scrolling inside our roadblock modal
    const isInsideModal = path.some(
      (el) =>
        (el as HTMLElement)?.classList?.contains('aware-roadblock-overlay') ||
        (el as HTMLElement)?.classList?.contains('aware-roadblock-modal')
    );

    if (!isInsideModal) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  };
}
