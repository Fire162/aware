const SHORTS_SELECTORS = [
  'ytd-rich-shelf-renderer[is-shorts]',
  'ytd-reel-shelf-renderer',
  '#shorts-container',
  'ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])',
  'ytd-reel-video-renderer',
];

export class ShortsFilter {
  private observer: MutationObserver | null = null;
  private isActive: boolean = false;

  public start(): void {
    if (this.isActive) return;
    this.isActive = true;

    this.purge();

    this.observer = new MutationObserver(() => {
      if (this.isActive) {
        this.purge();
      }
    });

    if (document.body) {
      this.observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        if (this.isActive && document.body) {
          this.observer?.observe(document.body, { childList: true, subtree: true });
        }
      });
    }
  }

  public stop(): void {
    this.isActive = false;
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private purge(): void {
    if (!window.location.hostname.includes('youtube.com')) return;

    // Redirect away from Shorts video URLs to homepage
    if (window.location.pathname.startsWith('/shorts')) {
      window.location.replace('/');
      return;
    }

    const app = document.querySelector('ytd-app');
    if (app?.hasAttribute('is-shorts-page')) {
      window.location.replace('/');
      return;
    }

    // Remove shelves from feed
    for (const selector of SHORTS_SELECTORS) {
      const items = document.querySelectorAll(selector);
      for (let i = 0; i < items.length; i++) {
        items[i].remove();
      }
    }

    // Remove Shorts navigation tabs & sidebar buttons
    const navLinks = document.querySelectorAll('a[title="Shorts"], a[href^="/shorts"]');
    for (let i = 0; i < navLinks.length; i++) {
      const entry = navLinks[i].closest('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer');
      if (entry) {
        entry.remove();
      } else {
        navLinks[i].remove();
      }
    }
  }
}
