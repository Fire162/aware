import styles from './styles.css?inline';
import { AwarePassHud } from './banner';
import { AwareRoadblock } from './roadblock';
import { ShortsFilter } from '../utils/shorts';
import { EventShield } from './event-trap';
import { PageStatusResponse, ContentToBgMessage } from '../storage/types';

let hostElement: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let activeRoadblock: AwareRoadblock | null = null;
let activeHud: AwarePassHud | null = null;
const shortsFilter = new ShortsFilter();
const eventShield = new EventShield();

let currentStatus: PageStatusResponse | null = null;

async function sendMsg<T = any>(msg: ContentToBgMessage): Promise<T> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(msg, (response) => {
      resolve(response);
    });
  });
}

function handleRedirectToFocus(): void {
  eventShield.deactivate();
  sendMsg({ type: 'REDIRECT_TO_FOCUS' });
}

function handleCloseTab(): void {
  eventShield.deactivate();
  sendMsg({ type: 'CLOSE_TAB' });
}

function handleGrantPass(seconds: number): void {
  sendMsg({ type: 'GRANT_PASS', domain: currentStatus?.rule?.domain || window.location.hostname, seconds }).then(() => {
    cleanupRoadblock();
    // Show 15-second temporary HUD
    showPassHud(seconds, seconds);
  });
}

function cleanupRoadblock(): void {
  eventShield.deactivate();
  if (activeRoadblock) {
    activeRoadblock.destroy();
    activeRoadblock = null;
  }
}

function cleanupAll(): void {
  cleanupRoadblock();
  if (activeHud) {
    activeHud.destroy();
    activeHud = null;
  }
  if (hostElement) {
    hostElement.remove();
    hostElement = null;
    shadowRoot = null;
  }
}

function ensureShadowRoot(): ShadowRoot {
  if (!hostElement) {
    hostElement = document.createElement('div');
    hostElement.id = 'aware-hardcore-root';
    hostElement.style.all = 'initial';
    document.documentElement.appendChild(hostElement);
    shadowRoot = hostElement.attachShadow({ mode: 'closed' });

    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    shadowRoot.appendChild(styleEl);
  }
  return shadowRoot!;
}

function showHardcoreRoadblock(): void {
  if (activeRoadblock || !currentStatus) return;
  if (activeHud) {
    activeHud.destroy();
    activeHud = null;
  }

  const root = ensureShadowRoot();
  activeRoadblock = new AwareRoadblock({
    domain: currentStatus.rule?.domain || window.location.hostname.replace(/^www\./, ''),
    mantra: currentStatus.mantra,
    focusSiteUrl: currentStatus.focusSiteUrl || 'https://github.com',
    pledgeText: currentStatus.pledgeText,
    maxPassSeconds: currentStatus.maxPassSeconds || 15,
    antiOcrEnabled: currentStatus.antiOcrEnabled !== false,
    onRedirectToFocus: handleRedirectToFocus,
    onCloseTab: handleCloseTab,
    onGrantPass: handleGrantPass,
  });

  root.appendChild(activeRoadblock.getElement());
  eventShield.activate(handleRedirectToFocus);

  // Auto-focus the typing input inside the shadow root
  requestAnimationFrame(() => {
    const textarea = activeRoadblock?.getElement().querySelector('textarea');
    textarea?.focus();
  });

  sendMsg({ type: 'EVENT_LOG', event: 'roadblock_shown', domain: currentStatus.rule?.domain || window.location.hostname });
}

function showPassHud(totalSeconds: number, remainingSeconds: number): void {
  if (activeHud || !currentStatus) return;
  cleanupRoadblock();

  const root = ensureShadowRoot();
  activeHud = new AwarePassHud({
    domain: currentStatus.rule?.domain || window.location.hostname.replace(/^www\./, ''),
    totalSeconds,
    initialRemainingSeconds: remainingSeconds,
    onExpire: () => {
      // 15 seconds expired, immediately yank back to local guard page!
      const guardUrl = chrome.runtime.getURL('guard/index.html?target=' + encodeURIComponent(window.location.href));
      window.location.replace(guardUrl);
    },
    onRedirectToFocus: handleRedirectToFocus,
  });

  root.appendChild(activeHud.getElement());
}

async function checkPage(): Promise<void> {
  try {
    const status: PageStatusResponse = await sendMsg({
      type: 'GET_PAGE_STATUS',
      url: window.location.href,
    });

    currentStatus = status;

    // Run Shorts filter if applicable
    if (status.blockShorts) {
      shortsFilter.start();
    } else {
      shortsFilter.stop();
    }

    if (!status.isDistracting) {
      cleanupAll();
      return;
    }

    // Distracting domain
    if (status.isPassed && status.passRemainingSeconds > 0) {
      showPassHud(status.maxPassSeconds || 15, status.passRemainingSeconds);
    } else {
      // Redirect immediately to local guard page
      const guardUrl = chrome.runtime.getURL('guard/index.html?target=' + encodeURIComponent(window.location.href));
      window.location.replace(guardUrl);
    }
  } catch (err) {
    console.debug('[Aware] Error communicating status:', err);
  }
}

// Global shortcut: Escape triggers redirect to focus site
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && (activeRoadblock || activeHud)) {
    handleRedirectToFocus();
  }
});

// Run check immediately on document_start
checkPage();

// Observe SPA URL transitions (YouTube, Twitter, Reddit)
let lastUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    checkPage();
  }
});
observer.observe(document, { subtree: true, childList: true });
window.addEventListener('popstate', checkPage);
