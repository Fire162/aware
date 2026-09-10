import { DistractionRule, UserSettings } from '../storage/types';

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
  gracePeriodSeconds: 120, // 2 minutes before roadblock
  frictionType: 'breathing', // 10s breathing pause or pledge
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
