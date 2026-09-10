import { matchRule, extractHostname } from '../src/utils/matcher';
import { DistractionRule } from '../src/storage/types';
import { DEFAULT_PRESET_RULES } from '../src/utils/presets';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('Running matcher tests...');

// Test 1: extractHostname
assert(extractHostname('https://www.youtube.com/watch?v=abc') === 'youtube.com', 'extractHostname youtube');
assert(extractHostname('https://old.reddit.com/r/javascript') === 'old.reddit.com', 'extractHostname old.reddit');
assert(extractHostname('https://twitter.com/home') === 'twitter.com', 'extractHostname twitter');
assert(extractHostname('invalid-url') === '', 'extractHostname invalid');

// Test 2: matchRule with default presets
const ytRule = matchRule('https://www.youtube.com/watch?v=123', DEFAULT_PRESET_RULES);
assert(ytRule !== null && ytRule.id === 'youtube', 'YouTube matches correctly');

const redditRule = matchRule('https://old.reddit.com/r/programming', DEFAULT_PRESET_RULES);
assert(redditRule !== null && redditRule.id === 'reddit', 'Reddit subdomain matches');

const twitterRule = matchRule('https://x.com/explore', DEFAULT_PRESET_RULES);
assert(twitterRule !== null && twitterRule.id === 'x_twitter', 'X.com matches');

// Test 3: non-distracting sites
const ghRule = matchRule('https://github.com/torvalds/linux', DEFAULT_PRESET_RULES);
assert(ghRule === null, 'GitHub should NOT be flagged as distracting');

const soRule = matchRule('https://stackoverflow.com/questions/12345', DEFAULT_PRESET_RULES);
assert(soRule === null, 'StackOverflow should NOT be flagged as distracting');

// Test 4: Path-specific rules
const customPathRules: DistractionRule[] = [
  {
    id: 'yt_shorts_only',
    domain: 'youtube.com',
    name: 'YouTube Shorts Only',
    enabled: true,
    category: 'video',
    pathPatterns: ['/shorts*'],
  },
];

const shortsMatch = matchRule('https://www.youtube.com/shorts/abc123', customPathRules);
assert(shortsMatch !== null, 'Shorts path should match');

const watchMatch = matchRule('https://www.youtube.com/watch?v=abc123', customPathRules);
assert(watchMatch === null, 'Watch path should NOT match when rule only restricts shorts');

// Test 5: Disabled rules
const disabledRules: DistractionRule[] = [
  {
    id: 'reddit_disabled',
    domain: 'reddit.com',
    name: 'Reddit',
    enabled: false,
    category: 'social',
  },
];
assert(matchRule('https://reddit.com', disabledRules) === null, 'Disabled rule should not match');

console.log('✓ All 8 matcher verification tests passed successfully!');
