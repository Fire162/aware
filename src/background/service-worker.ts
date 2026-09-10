import {
  initializeStorage,
  getRules,
  getSettings,
  recordStats,
  grantPass,
  getRemainingPassSeconds,
} from '../storage/store';
import { matchRule, extractHostname } from '../utils/matcher';
import { ContentToBgMessage, PageStatusResponse } from '../storage/types';

// In-memory active dwell tracker
interface ActiveSession {
  tabId: number;
  domain: string;
  startTime: number;
}

const activeSessions = new Map<number, ActiveSession>();

chrome.runtime.onInstalled.addListener(async () => {
  await initializeStorage();
  console.log('[Aware] Initialized storage, rules, and settings.');
});

// Zero-network interceptor: redirects tab BEFORE any HTTP request or data is loaded
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only intercept main frame top-level navigations
  if (details.frameId !== 0) return;
  const url = details.url;
  if (!url || !url.startsWith('http')) return;

  try {
    const rules = await getRules();
    const rule = matchRule(url, rules);
    if (!rule) return;

    const domain = extractHostname(url);
    const remainingPass = await getRemainingPassSeconds(domain);

    // If no active pass, redirect immediately to local extension guard page!
    if (remainingPass <= 0) {
      const guardUrl = chrome.runtime.getURL(
        `guard/index.html?target=${encodeURIComponent(url)}`
      );
      chrome.tabs.update(details.tabId, { url: guardUrl });
    }
  } catch (err) {
    console.error('[Aware] webNavigation error:', err);
  }
});

// Clean up sessions when tab is closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const session = activeSessions.get(tabId);
  if (session) {
    const elapsedSeconds = Math.round((Date.now() - session.startTime) / 1000);
    if (elapsedSeconds > 0) {
      await recordStats({}, session.domain, elapsedSeconds);
    }
    activeSessions.delete(tabId);
  }
});

// Track tab activation switches
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    handleTabNavigation(activeInfo.tabId, tab.url || '');
  } catch (err) {
    // Tab may be closing
  }
});

// Track tab updates (URL changes / navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    handleTabNavigation(tabId, tab.url);
  }
});

async function handleTabNavigation(tabId: number, url: string) {
  if (!url || !url.startsWith('http')) {
    chrome.action.setBadgeText({ tabId, text: '' });
    activeSessions.delete(tabId);
    return;
  }

  const rules = await getRules();
  const rule = matchRule(url, rules);
  const domain = extractHostname(url);

  if (rule) {
    const remainingPass = await getRemainingPassSeconds(domain);
    if (remainingPass > 0) {
      chrome.action.setBadgeText({ tabId, text: `${remainingPass}s` });
      chrome.action.setBadgeBackgroundColor({ tabId, color: '#10B981' });
    } else {
      chrome.action.setBadgeText({ tabId, text: '!' });
      chrome.action.setBadgeBackgroundColor({ tabId, color: '#EF4444' });
    }

    if (!activeSessions.has(tabId) || activeSessions.get(tabId)?.domain !== domain) {
      activeSessions.set(tabId, {
        tabId,
        domain,
        startTime: Date.now(),
      });
    }
  } else {
    chrome.action.setBadgeText({ tabId, text: '' });
    const existing = activeSessions.get(tabId);
    if (existing) {
      const elapsed = Math.round((Date.now() - existing.startTime) / 1000);
      if (elapsed > 0) {
        await recordStats({}, existing.domain, elapsed);
      }
      activeSessions.delete(tabId);
    }
  }
}

// Handle messages from content script & popup
chrome.runtime.onMessage.addListener((message: ContentToBgMessage, sender, sendResponse) => {
  (async () => {
    try {
      if (message.type === 'GET_PAGE_STATUS') {
        const rules = await getRules();
        const settings = await getSettings();
        const rule = matchRule(message.url, rules);
        const domain = extractHostname(message.url);

        if (!rule) {
          sendResponse({
            isDistracting: false,
            elapsedSeconds: 0,
            mantra: settings.focusMantra,
            focusSiteUrl: settings.focusSiteUrl,
            maxPassSeconds: settings.maxPassSeconds,
            blockShorts: settings.blockShorts,
            pledgeText: settings.customPledgeText,
            antiOcrEnabled: settings.antiOcrEnabled,
            isPassed: false,
            passRemainingSeconds: 0,
          } as PageStatusResponse);
          return;
        }

        const remainingPass = await getRemainingPassSeconds(domain);
        const tabId = sender.tab?.id;
        let elapsedSeconds = 0;

        if (tabId && activeSessions.has(tabId)) {
          const session = activeSessions.get(tabId)!;
          elapsedSeconds = Math.round((Date.now() - session.startTime) / 1000);
        } else if (tabId) {
          activeSessions.set(tabId, {
            tabId,
            domain,
            startTime: Date.now(),
          });
        }

        sendResponse({
          isDistracting: true,
          rule,
          elapsedSeconds,
          mantra: settings.focusMantra,
          focusSiteUrl: settings.focusSiteUrl,
          maxPassSeconds: settings.maxPassSeconds,
          blockShorts: settings.blockShorts,
          pledgeText: settings.customPledgeText,
          antiOcrEnabled: settings.antiOcrEnabled,
          isPassed: remainingPass > 0,
          passRemainingSeconds: remainingPass,
        } as PageStatusResponse);
        return;
      }

      if (message.type === 'REDIRECT_TO_FOCUS') {
        const settings = await getSettings();
        const tabId = sender.tab?.id;
        if (tabId) {
          const session = activeSessions.get(tabId);
          if (session) {
            const elapsed = Math.round((Date.now() - session.startTime) / 1000);
            await recordStats({ redirectsToFocus: 1, tabsClosed: 1 }, session.domain, elapsed);
            activeSessions.delete(tabId);
          } else {
            await recordStats({ redirectsToFocus: 1 });
          }
          await chrome.tabs.update(tabId, { url: settings.focusSiteUrl || 'https://github.com' });
        }
        sendResponse({ success: true });
        return;
      }

      if (message.type === 'CLOSE_TAB') {
        const tabId = sender.tab?.id;
        if (tabId) {
          const session = activeSessions.get(tabId);
          if (session) {
            const elapsed = Math.round((Date.now() - session.startTime) / 1000);
            await recordStats({ tabsClosed: 1 }, session.domain, elapsed);
            activeSessions.delete(tabId);
          } else {
            await recordStats({ tabsClosed: 1 });
          }
          await chrome.tabs.remove(tabId);
        }
        sendResponse({ success: true });
        return;
      }

      if (message.type === 'RECORD_DWELL') {
        await recordStats({}, message.domain, message.seconds);
        sendResponse({ success: true });
        return;
      }

      if (message.type === 'EVENT_LOG') {
        if (message.event === 'roadblock_shown') {
          await recordStats({ roadblocksTriggered: 1, interventionsTriggered: 1 }, message.domain);
        }
        sendResponse({ success: true });
        return;
      }

      if (message.type === 'GRANT_PASS') {
        const settings = await getSettings();
        // Strictly cap pass duration to maxPassSeconds (e.g. 15s)
        const duration = Math.min(message.seconds, settings.maxPassSeconds || 15);
        await grantPass(message.domain, duration);
        if (sender.tab?.id) {
          chrome.action.setBadgeText({ tabId: sender.tab.id, text: `${duration}s` });
          chrome.action.setBadgeBackgroundColor({ tabId: sender.tab.id, color: '#10B981' });
        }
        sendResponse({ success: true, duration });
        return;
      }
    } catch (error) {
      console.error('[Aware] Background worker error:', error);
      sendResponse({ error: String(error) });
    }
  })();

  return true;
});
