import { DistractionRule, UserSettings } from '../storage/types';

export const DEFAULT_PLEDGE_TEXT = `I, of sound mind and clear conscience, solemnly acknowledge that by opening this website right now, I am actively sabotaging my own future, procrastinating on my true priorities, and voluntarily surrendering my highest intellectual potential. I openly admit that every single minute I spend consuming mindless digital entertainment is a direct theft from my studies, my career, my personal growth, and the trust of those who believe in my abilities. I recognize that genuine self-discipline is the non-negotiable price of excellence, whereas cheap comfort is the deceptive currency of mediocrity, anxiety, and lifelong regret. There are absolutely no valid excuses, no emergency exceptions, and no rationalizations for succumbing to impulsive distractions when my meaningful work remains unfinished. I understand that temporary dopamine hijacks my cognitive clarity, erodes my deep attention span, and severely delays the realization of my grandest ambitions. Knowing this truth with complete and unflinching self-awareness, if I choose to bypass this guard, I take full, personal accountability for deliberately squandering my most finite, irreplaceable asset: my focused time. I pledge that I will either close this tab right now to pursue deep work, or confront the harsh reality that I chose instant gratification over my long-term dreams and professional success.`;

export const DEFAULT_PRESET_RULES: DistractionRule[] = [
  {
    id: 'youtube',
    domain: 'youtube.com',
    name: 'YouTube',
    enabled: true,
    category: 'video',
    isPreset: true,
  },
  {
    id: 'reddit',
    domain: 'reddit.com',
    name: 'Reddit',
    enabled: true,
    category: 'social',
    isPreset: true,
  },
  {
    id: 'x_twitter',
    domain: 'x.com',
    name: 'X (formerly Twitter)',
    enabled: true,
    category: 'social',
    isPreset: true,
  },
  {
    id: 'twitter',
    domain: 'twitter.com',
    name: 'Twitter',
    enabled: true,
    category: 'social',
    isPreset: true,
  },
  {
    id: 'instagram',
    domain: 'instagram.com',
    name: 'Instagram',
    enabled: true,
    category: 'social',
    isPreset: true,
  },
  {
    id: 'tiktok',
    domain: 'tiktok.com',
    name: 'TikTok',
    enabled: true,
    category: 'video',
    isPreset: true,
  },
  {
    id: 'netflix',
    domain: 'netflix.com',
    name: 'Netflix',
    enabled: true,
    category: 'video',
    isPreset: true,
  },
  {
    id: 'twitch',
    domain: 'twitch.tv',
    name: 'Twitch',
    enabled: true,
    category: 'gaming',
    isPreset: true,
  },
  {
    id: 'facebook',
    domain: 'facebook.com',
    name: 'Facebook',
    enabled: true,
    category: 'social',
    isPreset: true,
  },
  {
    id: 'threads',
    domain: 'threads.net',
    name: 'Threads',
    enabled: true,
    category: 'social',
    isPreset: true,
  },
];

export const DEFAULT_SETTINGS: UserSettings = {
  focusMantra: 'Protect your focus. Dedicate your energy to your goals and study.',
  focusSiteUrl: 'https://github.com',
  maxPassSeconds: 15, // strictly max 15 seconds extension
  blockShorts: true, // eliminate YouTube Shorts
  customPledgeText: DEFAULT_PLEDGE_TEXT,
  antiOcrEnabled: true,
  theme: 'auto',
  notificationsEnabled: true,
};

export const SAMPLE_MANTRAS: string[] = [
  'Protect your focus. Dedicate your energy to your goals and study.',
  'Small daily disciplines compound into massive long-term success.',
  'Will this scroll help you achieve what you set out to accomplish today?',
  'Notice the impulse, take a mindful breath, and return to your craft.',
  'Your future self is forged by the choices you make in this exact moment.',
];
