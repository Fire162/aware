import { DistractionRule, UserSettings } from '../storage/types';

export function toChaosCase(str: string): string {
  let result = '';
  // Patterned irregular casing mixing single, double, and alternating caps
  const pattern = [1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0];
  let pIdx = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (/[a-zA-Z]/.test(ch)) {
      const upper = pattern[pIdx % pattern.length] === 1;
      result += upper ? ch.toUpperCase() : ch.toLowerCase();
      pIdx++;
    } else {
      result += ch;
    }
  }
  return result;
}

export const DEFAULT_PLEDGE_TEXT = `YeS, I aM fuLlY AwaRe ThAT bY doInG ThiS, i Am ACtIveLy WAstInG mY PoTenTiAL anD wIlLInG to RiSK my CaReER, mY edUcATioN, aNd MY lOng-TeRM fuTuRe FOr CheAp DIgiTaL dOPaMinE! i COnsCiOuSLy AdmIt THat EvErY SiNglE mINutE i SpENd ProCrAStiNaTiNG oN thIs WEbsItE iS A dEliBeRAte, ReCkLEsS chOiCE to BeTrAY mY owN aMBitIoNs. I AcKnoWlEDge ThAt SUcCesS dEManDs ReLEnTleSs DIscIpLiNE, iNteNsE ConCeNtRAtIon, AnD EmoTiOnAL mAtuRiTY, whErEaS MiNdlEsS ScrOlLiNG iS thE hALlmArK oF WeAknEsS, MedIoCrITy, And ReGRet. ThErE ArE no VaLId eXcUsES, nO juStIFiaBlE eXCePtiOnS, And No RaTIoNalIzATioNs WhATsOevEr: I Am cHoOsINg TemPoRAry EnTeRTaInmEnT OveR mY hIGhEst GoALs! bY cOnTInUinG pASt tHiS sCReEn, i OpENly AcCePT tHe bItTEr rEaLiTY oF miSsED opPoRtUNiTieS, bROkeN pRoMIsEs, aNd SElf-InFlICtEd fAiLUre. If I tRUlY reSpECteD mY tIMe, My iNtELleCt, AnD My FamIlY, I woUlD iMMeDiaTeLY clOsE tHIs Tab AnD RetUrN tO DeEp, fOcUSed WoRk WItHouT hESitAtIoN. KnOwiNg ALl oF tHiS WiTh aBsOLutE, uNfLInChiNg CLarItY, i COnFesS tHAt i Am TrADiNg mY gREatNeSs FOr FleEtINg dIsTrACtIonS. i TAke 100% PeRsONaL reSpONsiBiLiTY fOr tHe DEvaStAtINg ConSeQUenCeS oF SqUanDeRIng My MoST fIniTe, IRrePlAcEAbLe aSsET: my FoCuSEd AttEnTIon! NoW, i MUsT eiThER clOsE tHIs Tab RiGHt nOw, Or COnFroNt THe pAiNfUL tRutH oF WhaT i HaVE wIllInGLy aNd FoOLiShlY sACriFiCeD.`;

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
