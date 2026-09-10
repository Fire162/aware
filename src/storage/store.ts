import {
  DistractionRule,
  DayFocusStats,
  UserSettings,
} from './types';
import { DEFAULT_PRESET_RULES, DEFAULT_SETTINGS } from '../utils/presets';

const STORAGE_KEYS = {
  SETTINGS: 'aware_settings',
  RULES: 'aware_rules',
  STATS: 'aware_stats',
  PASSES: 'aware_passes',
};

export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function initializeStorage(): Promise<void> {
  const data = await chrome.storage.local.get([
    STORAGE_KEYS.SETTINGS,
    STORAGE_KEYS.RULES,
    STORAGE_KEYS.STATS,
  ]);

  const updates: Record<string, any> = {};

  if (!data[STORAGE_KEYS.SETTINGS]) {
    updates[STORAGE_KEYS.SETTINGS] = DEFAULT_SETTINGS;
  } else {
    // Merge new setting defaults
    updates[STORAGE_KEYS.SETTINGS] = { ...DEFAULT_SETTINGS, ...data[STORAGE_KEYS.SETTINGS] };
  }

  if (!data[STORAGE_KEYS.RULES]) {
    updates[STORAGE_KEYS.RULES] = DEFAULT_PRESET_RULES;
  }
  if (!data[STORAGE_KEYS.STATS]) {
    updates[STORAGE_KEYS.STATS] = {};
  }

  if (Object.keys(updates).length > 0) {
    await chrome.storage.local.set(updates);
  }
}

export async function getSettings(): Promise<UserSettings> {
  const res = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  return { ...DEFAULT_SETTINGS, ...(res[STORAGE_KEYS.SETTINGS] || {}) };
}

export async function saveSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated });
  return updated;
}

export async function getRules(): Promise<DistractionRule[]> {
  const res = await chrome.storage.local.get(STORAGE_KEYS.RULES);
  if (!res[STORAGE_KEYS.RULES] || !Array.isArray(res[STORAGE_KEYS.RULES])) {
    await chrome.storage.local.set({ [STORAGE_KEYS.RULES]: DEFAULT_PRESET_RULES });
    return DEFAULT_PRESET_RULES;
  }
  return res[STORAGE_KEYS.RULES];
}

export async function saveRules(rules: DistractionRule[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.RULES]: rules });
}

export async function addRule(domain: string, name?: string): Promise<DistractionRule> {
  const rules = await getRules();
  const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '');
  
  const existing = rules.find((r) => r.domain.toLowerCase() === cleanDomain);
  if (existing) {
    existing.enabled = true;
    await saveRules(rules);
    return existing;
  }

  const newRule: DistractionRule = {
    id: `custom_${Date.now()}`,
    domain: cleanDomain,
    name: name || cleanDomain,
    enabled: true,
    category: 'other',
    isPreset: false,
  };

  rules.unshift(newRule);
  await saveRules(rules);
  return newRule;
}

export async function toggleRule(id: string, enabled: boolean): Promise<void> {
  const rules = await getRules();
  const rule = rules.find((r) => r.id === id);
  if (rule) {
    rule.enabled = enabled;
    await saveRules(rules);
  }
}

export async function deleteRule(id: string): Promise<void> {
  const rules = await getRules();
  const filtered = rules.filter((r) => r.id !== id);
  await saveRules(filtered);
}

export async function getStats(date: string = getTodayKey()): Promise<DayFocusStats> {
  const res = await chrome.storage.local.get(STORAGE_KEYS.STATS);
  const allStats: Record<string, DayFocusStats> = res[STORAGE_KEYS.STATS] || {};
  
  if (!allStats[date]) {
    allStats[date] = {
      date,
      totalDistractionSeconds: 0,
      interventionsTriggered: 0,
      roadblocksTriggered: 0,
      tabsClosed: 0,
      redirectsToFocus: 0,
      domainBreakdown: {},
    };
  }

  return allStats[date];
}

export async function recordStats(
  delta: Partial<DayFocusStats>,
  domain?: string,
  dwellSeconds?: number
): Promise<DayFocusStats> {
  const date = getTodayKey();
  const res = await chrome.storage.local.get(STORAGE_KEYS.STATS);
  const allStats: Record<string, DayFocusStats> = res[STORAGE_KEYS.STATS] || {};

  const current: DayFocusStats = allStats[date] || {
    date,
    totalDistractionSeconds: 0,
    interventionsTriggered: 0,
    roadblocksTriggered: 0,
    tabsClosed: 0,
    redirectsToFocus: 0,
    domainBreakdown: {},
  };

  if (delta.interventionsTriggered) current.interventionsTriggered += delta.interventionsTriggered;
  if (delta.roadblocksTriggered) current.roadblocksTriggered += delta.roadblocksTriggered;
  if (delta.tabsClosed) current.tabsClosed += delta.tabsClosed;
  if (delta.redirectsToFocus) current.redirectsToFocus += delta.redirectsToFocus;

  if (dwellSeconds && dwellSeconds > 0) {
    current.totalDistractionSeconds += dwellSeconds;
    if (domain) {
      current.domainBreakdown[domain] = (current.domainBreakdown[domain] || 0) + dwellSeconds;
    }
  }

  allStats[date] = current;
  await chrome.storage.local.set({ [STORAGE_KEYS.STATS]: allStats });
  return current;
}

export async function grantPass(domain: string, seconds: number): Promise<void> {
  const res = await chrome.storage.local.get(STORAGE_KEYS.PASSES);
  const passes: Record<string, number> = res[STORAGE_KEYS.PASSES] || {};
  passes[domain] = Date.now() + seconds * 1000;
  await chrome.storage.local.set({ [STORAGE_KEYS.PASSES]: passes });
}

export async function getRemainingPassSeconds(domain: string): Promise<number> {
  const res = await chrome.storage.local.get(STORAGE_KEYS.PASSES);
  const passes: Record<string, number> = res[STORAGE_KEYS.PASSES] || {};
  const expiry = passes[domain];
  if (!expiry) return 0;
  const remaining = Math.round((expiry - Date.now()) / 1000);
  if (remaining > 0) return remaining;

  delete passes[domain];
  await chrome.storage.local.set({ [STORAGE_KEYS.PASSES]: passes });
  return 0;
}
