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
  focusSiteUrl: string; // URL to redirect when exiting distraction (e.g. https://github.com)
  maxPassSeconds: number; // Strictly max 15 seconds (default 15)
  blockShorts: boolean; // Cleanly purge YouTube Shorts
  customPledgeText: string;
  antiOcrEnabled: boolean;
  theme: 'auto' | 'dark' | 'light';
  notificationsEnabled: boolean;
}

export interface DayFocusStats {
  date: string; // YYYY-MM-DD
  totalDistractionSeconds: number;
  interventionsTriggered: number;
  roadblocksTriggered: number;
  tabsClosed: number;
  redirectsToFocus: number;
  domainBreakdown: Record<string, number>; // domain -> seconds
}

export interface AwarenessState {
  settings: UserSettings;
  rules: DistractionRule[];
  stats: Record<string, DayFocusStats>;
  activePasses: Record<string, number>; // domain -> timestamp expiry
}

export type ContentToBgMessage =
  | { type: 'GET_PAGE_STATUS'; url: string }
  | { type: 'CLOSE_TAB' }
  | { type: 'REDIRECT_TO_FOCUS' }
  | { type: 'RECORD_DWELL'; domain: string; seconds: number }
  | { type: 'EVENT_LOG'; event: 'nudge_shown' | 'roadblock_shown' | 'tab_closed' | 'friction_passed'; domain: string }
  | { type: 'GRANT_PASS'; domain: string; seconds: number };

export interface PageStatusResponse {
  isDistracting: boolean;
  rule?: DistractionRule;
  elapsedSeconds: number;
  mantra: string;
  focusSiteUrl: string;
  maxPassSeconds: number;
  blockShorts: boolean;
  pledgeText: string;
  antiOcrEnabled: boolean;
  isPassed: boolean;
  passRemainingSeconds: number;
}
