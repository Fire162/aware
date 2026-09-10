import {
  initializeStorage,
  getRules,
  getSettings,
  recordStats,
  grantPass,
  isPassActive,
} from '../storage/store';
import { matchRule, extractHostname } from '../utils/matcher';
import { ContentToBgMessage, PageStatusResponse } from '../storage/types';

// In-memory active dwell tracker
interface ActiveSession {
  tabId: number;
  domain: string;
  startTime: number;
  lastHeartbeat: number;
}

const activeSessions = new Map<number, ActiveSession>();

chrome.runtime.onInstalled.addListener(async () => {
  await initializeStorage();
  console.log('[Aware] Initialized extension storage and rules.');
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
    // Tab might be closing
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
    const passed = await isPassActive(domain);
    if (passed) {
      chrome.action.setBadgeText({ tabId, text: 'PASS' });
      chrome.action.setBadgeBackgroundColor({ tabId, color: '#10B981' });
    } else {
      chrome.action.setBadgeText({ tabId, text: '!' });
      chrome.action.setBadgeBackgroundColor({ tabId, color: '#F59E0B' });
    }

    // Start or update active session
    if (!activeSessions.has(tabId) || activeSessions.get(tabId)?.domain !== domain) {
      activeSessions.set(tabId, {
        tabId,
        domain,
        startTime: Date.now(),
        lastHeartbeat: Date.now(),
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
            gracePeriodSeconds: settings.gracePeriodSeconds,
            frictionType: settings.frictionType,
            isPassed: false,
          } as PageStatusResponse);
          return;
        }

        const passed = await isPassActive(domain);
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
            lastHeartbeat: Date.now(),
          });
        }

        sendResponse({
          isDistracting: true,
          rule,
          elapsedSeconds,
          mantra: settings.focusMantra,
          gracePeriodSeconds: settings.gracePeriodSeconds,
          frictionType: settings.frictionType,
          isPassed: passed,
        } as PageStatusResponse);
        return;
      }

      if (message.type === 'CLOSE_TAB') {
        if (sender.tab?.id) {
          const tabId = sender.tab.id;
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
        if (message.event === 'nudge_shown') {
          await recordStats({ interventionsTriggered: 1 }, message.domain);
        } else if (message.event === 'roadblock_shown') {
          await recordStats({ roadblocksTriggered: 1 }, message.domain);
        } else if (message.event === 'tab_closed') {
          await recordStats({ tabsClosed: 1 }, message.domain);
        }
        sendResponse({ success: true });
        return;
      }

      if (message.type === 'GRANT_PASS') {
        await grantPass(message.domain, message.minutes);
        if (sender.tab?.id) {
          chrome.action.setBadgeText({ tabId: sender.tab.id, text: 'PASS' });
          chrome.action.setBadgeBackgroundColor({ tabId: sender.tab.id, color: '#10B981' });
        }
        sendResponse({ success: true });
        return;
      }
    } catch (error) {
      console.error('[Aware] Background handler error:', error);
      sendResponse({ error: String(error) });
    }
  })();

  return true; // Keep asynchronous channel open
});
