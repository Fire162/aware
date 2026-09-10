import {
  getRules,
  addRule,
  toggleRule,
  deleteRule,
  getSettings,
  saveSettings,
  getStats,
} from '../storage/store';
import { SAMPLE_MANTRAS } from '../utils/presets';
import { extractHostname } from '../utils/matcher';
import { DistractionRule } from '../storage/types';

let currentTabDomain = '';

// DOM Elements
const tabBtns = document.querySelectorAll<HTMLButtonElement>('.tab-btn');
const tabPanes = document.querySelectorAll<HTMLElement>('.tab-pane');
const currentDomainText = document.getElementById('current-domain-text') as HTMLElement;
const btnQuickAdd = document.getElementById('btn-quick-add') as HTMLButtonElement;
const addRuleForm = document.getElementById('add-rule-form') as HTMLFormElement;
const inputNewDomain = document.getElementById('input-new-domain') as HTMLInputElement;
const rulesList = document.getElementById('rules-list') as HTMLElement;
const ruleCount = document.getElementById('rule-count') as HTMLElement;

const mantraInput = document.getElementById('mantra-input') as HTMLTextAreaElement;
const btnSaveMantra = document.getElementById('btn-save-mantra') as HTMLButtonElement;
const presetMantrasList = document.getElementById('preset-mantras-list') as HTMLElement;

const statTime = document.getElementById('stat-time') as HTMLElement;
const statNudges = document.getElementById('stat-nudges') as HTMLElement;
const statRoadblocks = document.getElementById('stat-roadblocks') as HTMLElement;
const statClosed = document.getElementById('stat-closed') as HTMLElement;
const breakdownList = document.getElementById('breakdown-list') as HTMLElement;

const selectGracePeriod = document.getElementById('select-grace-period') as HTMLSelectElement;
const selectFrictionType = document.getElementById('select-friction-type') as HTMLSelectElement;
const saveIndicator = document.getElementById('save-indicator') as HTMLElement;

function showSavedIndicator(msg: string = 'Saved ✓'): void {
  saveIndicator.textContent = msg;
  setTimeout(() => {
    saveIndicator.textContent = '';
  }, 2000);
}

// Format seconds into readable duration
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m`;
}

// Tab Switching
tabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetTab = btn.getAttribute('data-tab');
    tabBtns.forEach((b) => b.classList.remove('active'));
    tabPanes.forEach((p) => p.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(`tab-${targetTab}`)?.classList.add('active');

    if (targetTab === 'stats') {
      loadStats();
    }
  });
});

// Load Current Tab Information
async function loadCurrentTab(): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.startsWith('http')) {
      currentTabDomain = extractHostname(tab.url);
      currentDomainText.textContent = currentTabDomain;

      const rules = await getRules();
      const isGuarded = rules.some((r) => r.domain.toLowerCase() === currentTabDomain.toLowerCase());

      if (isGuarded) {
        btnQuickAdd.textContent = 'Guarded ✓';
        btnQuickAdd.disabled = true;
        btnQuickAdd.classList.remove('btn-primary');
        btnQuickAdd.classList.add('btn-secondary');
      } else {
        btnQuickAdd.textContent = 'Add to Guard';
        btnQuickAdd.disabled = false;
        btnQuickAdd.classList.remove('btn-secondary');
        btnQuickAdd.classList.add('btn-primary');
      }
    } else {
      currentDomainText.textContent = 'Non-web page';
      btnQuickAdd.style.display = 'none';
    }
  } catch (e) {
    currentDomainText.textContent = 'Unknown tab';
  }
}

// Render Distraction Rules List
async function renderRules(): Promise<void> {
  const rules = await getRules();
  ruleCount.textContent = String(rules.length);
  rulesList.innerHTML = '';

  rules.forEach((rule: DistractionRule) => {
    const item = document.createElement('div');
    item.className = 'rule-item';

    item.innerHTML = `
      <div class="rule-item-domain" title="${rule.domain}">
        ${rule.name || rule.domain}
        <span style="font-size: 10px; color: #64748B; margin-left: 4px;">(${rule.domain})</span>
      </div>
      <div class="rule-item-actions">
        <label class="switch">
          <input type="checkbox" ${rule.enabled ? 'checked' : ''} data-id="${rule.id}" />
          <span class="slider"></span>
        </label>
        ${
          !rule.isPreset
            ? `<button class="btn-del-rule" data-id="${rule.id}" title="Remove rule">×</button>`
            : ''
        }
      </div>
    `;

    const toggle = item.querySelector('input[type="checkbox"]') as HTMLInputElement;
    toggle?.addEventListener('change', async () => {
      await toggleRule(rule.id, toggle.checked);
      showSavedIndicator();
    });

    const delBtn = item.querySelector('.btn-del-rule');
    delBtn?.addEventListener('click', async () => {
      await deleteRule(rule.id);
      await renderRules();
      await loadCurrentTab();
      showSavedIndicator('Removed');
    });

    rulesList.appendChild(item);
  });
}

// Quick Add Handler
btnQuickAdd.addEventListener('click', async () => {
  if (!currentTabDomain) return;
  await addRule(currentTabDomain);
  await renderRules();
  await loadCurrentTab();
  showSavedIndicator('Added to Guard');
});

// Custom Domain Form
addRuleForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const domain = inputNewDomain.value.trim();
  if (domain) {
    await addRule(domain);
    inputNewDomain.value = '';
    await renderRules();
    await loadCurrentTab();
    showSavedIndicator('Rule Added');
  }
});

// Load Mantra & Presets
async function loadMantra(): Promise<void> {
  const settings = await getSettings();
  mantraInput.value = settings.focusMantra || '';

  presetMantrasList.innerHTML = '';
  SAMPLE_MANTRAS.forEach((preset) => {
    const pill = document.createElement('div');
    pill.className = 'preset-mantra-pill';
    pill.textContent = preset;
    pill.addEventListener('click', async () => {
      mantraInput.value = preset;
      await saveSettings({ focusMantra: preset });
      showSavedIndicator('Mantra updated');
    });
    presetMantrasList.appendChild(pill);
  });
}

btnSaveMantra.addEventListener('click', async () => {
  const text = mantraInput.value.trim();
  if (text) {
    await saveSettings({ focusMantra: text });
    showSavedIndicator('Mantra Saved');
  }
});

// Load Stats
async function loadStats(): Promise<void> {
  const stats = await getStats();
  statTime.textContent = formatDuration(stats.totalDistractionSeconds || 0);
  statNudges.textContent = String(stats.interventionsTriggered || 0);
  statRoadblocks.textContent = String(stats.roadblocksTriggered || 0);
  statClosed.textContent = String(stats.tabsClosed || 0);

  const breakdown = stats.domainBreakdown || {};
  const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    breakdownList.innerHTML = '<p class="empty-state">No distraction activity recorded today. Great job staying focused!</p>';
  } else {
    breakdownList.innerHTML = '';
    entries.forEach(([domain, secs]) => {
      const row = document.createElement('div');
      row.className = 'breakdown-row';
      row.innerHTML = `
        <span style="font-weight: 500; color: #FFFFFF;">${domain}</span>
        <span style="color: #F59E0B; font-weight: 600;">${formatDuration(secs)}</span>
      `;
      breakdownList.appendChild(row);
    });
  }
}

// Load & Save Settings
async function loadSettings(): Promise<void> {
  const settings = await getSettings();
  selectGracePeriod.value = String(settings.gracePeriodSeconds);
  selectFrictionType.value = settings.frictionType;
}

selectGracePeriod.addEventListener('change', async () => {
  const seconds = parseInt(selectGracePeriod.value, 10);
  await saveSettings({ gracePeriodSeconds: seconds });
  showSavedIndicator('Grace Period Updated');
});

selectFrictionType.addEventListener('change', async () => {
  const friction = selectFrictionType.value as 'breathing' | 'pledge';
  await saveSettings({ frictionType: friction });
  showSavedIndicator('Friction Gate Updated');
});

// Initialization
async function init(): Promise<void> {
  await loadCurrentTab();
  await renderRules();
  await loadMantra();
  await loadStats();
  await loadSettings();
}

document.addEventListener('DOMContentLoaded', init);
