export interface DistractionRule {
  id: string;
  domain: string;
  name: string;
  enabled: boolean;
  category: 'social' | 'video' | 'gaming' | 'news' | 'other';
  pathPatterns?: string[];
  isPreset?: boolean;
}

export interface UserSettings {
  focusMantra: string;
  gracePeriodSeconds: number; // e.g. 120s (2 minutes)
  frictionType: 'breathing' | 'pledge';
  theme: 'auto' | 'dark' | 'light';
  notificationsEnabled: boolean;
}

export interface DayFocusStats {
  date: string; // YYYY-MM-DD
  totalDistractionSeconds: number;
  interventionsTriggered: number;
  roadblocksTriggered: number;
  tabsClosed: number;
  domainBreakdown: Record<string, number>; // domain -> seconds
}

export interface AwarenessState {
  settings: UserSettings;
  rules: DistractionRule[];
  stats: Record<string, DayFocusStats>; // keyed by YYYY-MM-DD
  activePasses: Record<string, number>; // domain -> timestamp expiry
}

export type ContentToBgMessage =
  | { type: 'GET_PAGE_STATUS'; url: string }
  | { type: 'CLOSE_TAB' }
  | { type: 'RECORD_DWELL'; domain: string; seconds: number }
  | { type: 'EVENT_LOG'; event: 'nudge_shown' | 'roadblock_shown' | 'tab_closed' | 'friction_passed'; domain: string }
  | { type: 'GRANT_PASS'; domain: string; minutes: number };

export interface PageStatusResponse {
  isDistracting: boolean;
  rule?: DistractionRule;
  elapsedSeconds: number;
  mantra: string;
  gracePeriodSeconds: number;
  frictionType: 'breathing' | 'pledge';
  isPassed: boolean;
}
