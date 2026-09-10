import { DistractionRule } from '../storage/types';

export function extractHostname(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    return url.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function matchRule(urlStr: string, rules: DistractionRule[]): DistractionRule | null {
  try {
    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = url.pathname.toLowerCase();

    for (const rule of rules) {
      if (!rule.enabled) continue;

      const ruleDomain = rule.domain.toLowerCase().replace(/^www\./, '');
      const domainMatches = host === ruleDomain || host.endsWith('.' + ruleDomain);

      if (!domainMatches) continue;

      // If no path patterns specified, entire domain is matched
      if (!rule.pathPatterns || rule.pathPatterns.length === 0) {
        return rule;
      }

      // Check path patterns
      const pathMatched = rule.pathPatterns.some((pattern) => {
        const cleanPattern = pattern.toLowerCase();
        if (cleanPattern.endsWith('*')) {
          return pathname.startsWith(cleanPattern.slice(0, -1));
        }
        return pathname === cleanPattern || pathname.startsWith(cleanPattern + '/');
      });

      if (pathMatched) {
        return rule;
      }
    }
  } catch {
    return null;
  }

  return null;
}
