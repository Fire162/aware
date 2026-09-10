import { getSettings, grantPass, recordStats } from '../storage/store';
import { DEFAULT_PLEDGE_TEXT } from '../utils/presets';
import { extractHostname } from '../utils/matcher';

// Extract target URL from query parameter
const urlParams = new URLSearchParams(window.location.search);
const targetUrl = urlParams.get('target') || '';
const targetDomain = extractHostname(targetUrl) || 'Distracting Site';

// DOM Elements
const blockedDomainTitle = document.getElementById('blocked-domain-title') as HTMLElement;
const wordCountLabel = document.getElementById('word-count-label') as HTMLElement;
const mantraText = document.getElementById('mantra-text') as HTMLElement;
const canvas = document.getElementById('pledge-canvas') as HTMLCanvasElement;
const progressText = document.getElementById('progress-text') as HTMLElement;
const progressFill = document.getElementById('progress-fill') as HTMLElement;
const statusPill = document.getElementById('status-pill') as HTMLElement;
const typingInput = document.getElementById('typing-input') as HTMLTextAreaElement;
const warningToast = document.getElementById('warning-toast') as HTMLElement;
const btnFocusRedirect = document.getElementById('btn-focus-redirect') as HTMLButtonElement;
const btnCloseTab = document.getElementById('btn-close-tab') as HTMLButtonElement;
const btnUnlock = document.getElementById('btn-unlock') as HTMLButtonElement;

let pledge = DEFAULT_PLEDGE_TEXT;
let targetWords: string[] = [];
let focusSite = 'https://github.com';
let maxPassSeconds = 15;

function showWarning(msg: string): void {
  warningToast.textContent = msg;
  warningToast.style.display = 'block';
  warningToast.classList.add('shake');
  setTimeout(() => {
    warningToast.style.display = 'none';
    warningToast.classList.remove('shake');
  }, 3000);
}

function renderPledgeCanvas(text: string, antiOcr: boolean): void {
  const containerWidth = canvas.parentElement?.clientWidth || 800;
  const width = Math.max(600, containerWidth - 24);
  const fontSize = 13.5;
  const lineHeight = 22;
  const padding = 16;
  const maxTextWidth = width - padding * 2;

  const tempCtx = document.createElement('canvas').getContext('2d')!;
  tempCtx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace`;

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
  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  ctx.fillStyle = '#0B101E';
  ctx.fillRect(0, 0, width, height);

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

  ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace`;
  ctx.fillStyle = '#E2E8F0';
  ctx.textBaseline = 'top';

  let y = padding;
  for (const line of lines) {
    ctx.fillText(line, padding, y);
    y += lineHeight;
  }
}

async function redirectToFocus(): Promise<void> {
  await recordStats({ redirectsToFocus: 1, tabsClosed: 1 }, targetDomain);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await chrome.tabs.update(tab.id, { url: focusSite });
  } else {
    window.location.href = focusSite;
  }
}

async function closeCurrentTab(): Promise<void> {
  await recordStats({ tabsClosed: 1 }, targetDomain);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await chrome.tabs.remove(tab.id);
  } else {
    window.close();
  }
}

async function unlockTargetSite(): Promise<void> {
  // Grant pass for strictly maxPassSeconds
  await grantPass(targetDomain, maxPassSeconds);
  await recordStats({ interventionsTriggered: 1 }, targetDomain);

  // Redirect back to target URL
  if (targetUrl) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.tabs.update(tab.id, { url: targetUrl });
    } else {
      window.location.href = targetUrl;
    }
  }
}

function initTypingEngine(): void {
  // Anti-Paste & Anti-Drag
  typingInput.addEventListener('paste', (e) => {
    e.preventDefault();
    showWarning('⚠️ Pasting is strictly blocked! You must type each character manually.');
  });

  typingInput.addEventListener('drop', (e) => {
    e.preventDefault();
    showWarning('⚠️ Drag-and-drop is blocked.');
  });

  typingInput.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  typingInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
      e.preventDefault();
      showWarning('⚠️ Paste shortcuts (Ctrl+V / Cmd+V) are disabled.');
    }
  });

  // Verification
  const target = pledge.trim();
  const totalWords = targetWords.length;

  typingInput.addEventListener('input', () => {
    const typed = typingInput.value;
    const isPrefixMatch = target.startsWith(typed);
    const typedWords = typed.trim() ? typed.trim().split(/\s+/).length : 0;
    const pct = Math.min(100, Math.round((typed.length / target.length) * 100));

    progressText.innerHTML = `Progress: <strong>${typedWords}</strong> / ${totalWords} words (${pct}%)`;
    progressFill.style.width = `${pct}%`;

    if (!typed) {
      statusPill.className = 'status-pill status-idle';
      statusPill.textContent = 'Awaiting typing...';
      typingInput.classList.remove('typing-error');
      btnUnlock.disabled = true;
      btnUnlock.classList.remove('ready');
    } else if (!isPrefixMatch) {
      statusPill.className = 'status-pill status-error';
      statusPill.textContent = 'Typo detected! Check punctuation & capitals';
      typingInput.classList.add('typing-error');
      btnUnlock.disabled = true;
      btnUnlock.classList.remove('ready');
    } else if (typed === target) {
      statusPill.className = 'status-pill status-success';
      statusPill.textContent = '✓ 100% Perfect Match!';
      typingInput.classList.remove('typing-error');
      btnUnlock.disabled = false;
      btnUnlock.classList.add('ready');
      btnUnlock.textContent = `🔓 Unlock Access for strictly ${maxPassSeconds}s`;
    } else {
      statusPill.className = 'status-pill status-typing';
      statusPill.textContent = 'Accuracy 100% • Keep typing...';
      typingInput.classList.remove('typing-error');
      btnUnlock.disabled = true;
      btnUnlock.classList.remove('ready');
    }
  });

  btnUnlock.addEventListener('click', () => {
    if (typingInput.value === target) {
      unlockTargetSite();
    }
  });
}

// Global Escape Key Listener
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    redirectToFocus();
  }
});

btnFocusRedirect.addEventListener('click', redirectToFocus);
btnCloseTab.addEventListener('click', closeCurrentTab);

async function init(): Promise<void> {
  const settings = await getSettings();
  pledge = settings.customPledgeText || DEFAULT_PLEDGE_TEXT;
  targetWords = pledge.trim().split(/\s+/);
  focusSite = settings.focusSiteUrl || 'https://github.com';
  maxPassSeconds = settings.maxPassSeconds || 15;

  blockedDomainTitle.textContent = `Access Blocked: ${targetDomain}`;
  wordCountLabel.textContent = `${targetWords.length}-word`;
  mantraText.textContent = `"${settings.focusMantra || 'Protect your focus and study.'}"`;

  try {
    const focusDomain = new URL(focusSite).hostname.replace(/^www\./, '');
    btnFocusRedirect.textContent = `⚡ Return to Focus Site (${focusDomain}) [Esc]`;
  } catch {
    btnFocusRedirect.textContent = '⚡ Return to Focus Site [Esc]';
  }

  btnUnlock.textContent = `🔒 Type full pledge to unlock (Max ${maxPassSeconds}s)`;

  renderPledgeCanvas(pledge, settings.antiOcrEnabled !== false);
  initTypingEngine();

  // Focus textarea immediately
  typingInput.focus();

  // Log roadblock hit
  await recordStats({ roadblocksTriggered: 1 }, targetDomain);
}

document.addEventListener('DOMContentLoaded', init);
