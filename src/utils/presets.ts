import { DistractionRule, UserSettings } from '../storage/types';

export const DEFAULT_PLEDGE_TEXT = `Yes, I am fully aware that by doing this, I am actively wasting my potential and willing to risk my career, my education, and my long-term future for cheap digital dopamine! I consciously admit that every single minute I spend procrastinating on this website is a deliberate, reckless choice to betray my own ambitions. I acknowledge that success demands relentless discipline, intense concentration, and emotional maturity, whereas mindless scrolling is the hallmark of weakness, mediocrity, and regret. There are absolutely no valid excuses, no justifiable exceptions, and no rationalizations whatsoever: I am choosing temporary entertainment over my highest goals! By continuing past this screen, I openly accept the bitter reality of missed opportunities, broken promises, and self-inflicted failure. If I truly respected my time, my intellect, and my family, I would immediately close this tab and return to deep, focused work without hesitation. Knowing all of this with absolute, unflinching clarity, I confess that I am trading my greatness for fleeting distractions. I take 100% personal responsibility for the devastating consequences of squandering my most finite, irreplaceable asset: my focused attention! Now, I must either close this tab right now, or confront the painful truth of what I have willingly and foolishly sacrificed.`;

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
