import styles from './styles.css?inline';
import { AwareBanner } from './banner';
import { AwareRoadblock } from './roadblock';
import { PageStatusResponse, ContentToBgMessage } from '../storage/types';

let hostElement: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let activeBanner: AwareBanner | null = null;
let activeRoadblock: AwareRoadblock | null = null;
let tickerId: number | null = null;
let currentElapsed = 0;
let currentDomain = '';
let currentGracePeriod = 120;
let currentMantra = '';
let currentFrictionType: 'breathing' | 'pledge' = 'breathing';

async function sendMsg<T = any>(msg: ContentToBgMessage): Promise<T> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(msg, (response) => {
      resolve(response);
    });
  });
}

function handleCloseTab(): void {
  sendMsg({ type: 'CLOSE_TAB' });
}

function handleGrantPass(minutes: number): void {
  sendMsg({ type: 'GRANT_PASS', domain: currentDomain, minutes }).then(() => {
    cleanupUI();
  });
}

function cleanupUI(): void {
  if (tickerId) {
    clearInterval(tickerId);
    tickerId = null;
  }
  if (activeBanner) {
    activeBanner.destroy();
    activeBanner = null;
  }
  if (activeRoadblock) {
    activeRoadblock.destroy();
    activeRoadblock = null;
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
    hostElement.id = 'aware-extension-root';
    hostElement.style.all = 'initial';
    document.documentElement.appendChild(hostElement);
    shadowRoot = hostElement.attachShadow({ mode: 'closed' });

    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    shadowRoot.appendChild(styleEl);
  }
  return shadowRoot!;
}

function showRoadblock(): void {
  if (activeRoadblock) return;
  if (activeBanner) {
    activeBanner.destroy();
    activeBanner = null;
  }

  const root = ensureShadowRoot();
  activeRoadblock = new AwareRoadblock({
    domain: currentDomain,
    mantra: currentMantra,
    elapsedSeconds: currentElapsed,
    frictionType: currentFrictionType,
    onCloseTab: handleCloseTab,
    onGrantPass: handleGrantPass,
  });

  root.appendChild(activeRoadblock.getElement());
  sendMsg({ type: 'EVENT_LOG', event: 'roadblock_shown', domain: currentDomain });
}

function startIntervention(status: PageStatusResponse): void {
  cleanupUI();

  if (!status.isDistracting || status.isPassed) {
    return;
  }

  currentElapsed = status.elapsedSeconds || 0;
  currentDomain = status.rule?.domain || window.location.hostname.replace(/^www\./, '');
  currentGracePeriod = status.gracePeriodSeconds || 120;
  currentMantra = status.mantra || 'Protect your focus and study.';
  currentFrictionType = status.frictionType || 'breathing';

  const root = ensureShadowRoot();

  // If already exceeded grace period, jump directly to roadblock
  if (currentElapsed >= currentGracePeriod) {
    showRoadblock();
  } else {
    // Show Tier 1 floating banner
    activeBanner = new AwareBanner({
      domain: currentDomain,
      mantra: currentMantra,
      initialElapsedSeconds: currentElapsed,
      onCloseTab: handleCloseTab,
    });
    root.appendChild(activeBanner.getElement());
    sendMsg({ type: 'EVENT_LOG', event: 'nudge_shown', domain: currentDomain });
  }

  // Ticker for tracking dwell time and escalation
  let heartbeatCounter = 0;
  tickerId = window.setInterval(() => {
    currentElapsed += 1;
    heartbeatCounter += 1;

    if (activeBanner) {
      activeBanner.updateTime(currentElapsed);
      if (currentElapsed >= currentGracePeriod) {
        showRoadblock();
      }
    }

    // Send heartbeat dwell every 10 seconds
    if (heartbeatCounter >= 10) {
      heartbeatCounter = 0;
      sendMsg({ type: 'RECORD_DWELL', domain: currentDomain, seconds: 10 });
    }
  }, 1000);
}

async function checkPage(): Promise<void> {
  try {
    const status: PageStatusResponse = await sendMsg({
      type: 'GET_PAGE_STATUS',
      url: window.location.href,
    });
    startIntervention(status);
  } catch (err) {
    console.debug('[Aware] Error checking page status:', err);
  }
}

// Global keyboard shortcut: Escape closes tab if banner or roadblock is present
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && (activeBanner || activeRoadblock)) {
    handleCloseTab();
  }
});

// Run check on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkPage);
} else {
  checkPage();
}

// Observe SPA URL transitions (YouTube, Twitter, Reddit)
let lastUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    checkPage();
  }
});
observer.observe(document, { subtree: true, childList: true });

// Listen to popstate
window.addEventListener('popstate', checkPage);
