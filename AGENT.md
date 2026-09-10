# Aware — AI Agent Developer Guide (`AGENT.md`)

> **Project**: Aware (Manifest V3 Focus & Distraction Reminder Extension)  
> **Status**: Production-ready  
> **Target Environment**: Chromium-based browsers (Chrome, Edge, Brave, Opera)  
> **Package Manager**: `pnpm` (11.x)  
> **Runtime**: Node.js >= 22.x

---

## 1. Project Overview

**Aware** is a minimalist, intentional Manifest V3 Chromium browser extension designed to curb mindless digital distractions and protect focus during work and study sessions. It operates continuously (24/7) in the background without requiring manual session starts, applying a **two-tiered intervention model**:

1. **Immediate Fullscreen Takeover (`document_start`)**: Injected before page DOM finishes rendering. Distracting websites are immediately covered by a 100% solid opaque barrier (`#080C14`, z-index 2147483647).
2. **Canvas Anti-OCR & Anti-Copy Barrier**: The 203-word commitment pledge is rendered onto an HTML5 `<canvas>` with anti-OCR background mesh. Clipboard paste, drag-and-drop, context menus, and selection are blocked.
3. **Productive Focus Site Redirection**: Pressing <kbd>Esc</kbd> or clicking "Return to Focus Site" redirects the user to their configured productive workspace (e.g. `https://github.com` or `https://leetcode.com`).
4. **Strict 15-Second Temporary Pass**: Typing the exact 203 words with 100% accuracy unlocks access for **strictly at most 15 seconds**, monitored by a live countdown HUD that re-locks the screen upon expiry.
5. **Integrated YouTube Shorts Purger**: Strips YouTube Shorts shelves, reels, and sidebar entry points without external traces.

---

## 2. Directory Structure

```
/root/aware/
├── manifest.json            # Chrome MV3 manifest configuration (run_at: document_start)
├── package.json             # Scripts & dependencies (Vite, TypeScript, TSX)
├── tsconfig.json            # Strict TypeScript configuration
├── AGENT.md                 # Agent knowledge base & architecture guide
├── README.md                # Comprehensive documentation with diagrams & badges
├── CHANGELOG.md             # Keep a Changelog releases in IST
├── CONTRIBUTING.md          # Developer workflow guidelines
├── LICENSE                  # MIT License
├── scripts/
│   ├── build.ts             # Programmatic Vite compiler (bundles popup, content IIFE, worker ES)
│   └── generate-icons.ts    # Pure Node.js PNG icon generator for public/icons
├── public/
│   └── icons/               # Extension icons (icon16.png, icon48.png, icon128.png)
├── src/
│   ├── vite-env.d.ts        # Ambient typing for inline CSS imports
│   ├── background/
│   │   └── service-worker.ts # Tab tracking, session timer, focus redirects, strict 15s passes
│   ├── content/
│   │   ├── content.ts       # Content script entry (document_start), Shorts filter, HUD/guard lifecycle
│   │   ├── banner.ts        # 15-second temporary pass countdown HUD
│   │   ├── roadblock.ts     # Anti-OCR Canvas hardcore roadblock with real-time typing engine
│   │   └── styles.css       # Scoped Shadow Root styles (solid opaque barrier, zero leaks)
│   ├── popup/
│   │   ├── index.html       # Hardcore popup layout (Rules, 203w Pledge, Analytics, Settings)
│   │   ├── popup.ts         # Reactive popup controller & storage bindings
│   │   └── popup.css        # Popup theme styles
│   ├── storage/
│   │   ├── types.ts         # TypeScript definitions (rules, settings, stats, message protocol)
│   │   └── store.ts         # Chrome storage wrapper with fallback defaults
│   └── utils/
│       ├── presets.ts       # Default 203-word pledge & distraction presets
│       ├── shorts.ts        # YouTube Shorts DOM purger utility
│       └── matcher.ts       # Domain & wildcard path pattern matcher
└── tests/
    └── matcher.test.ts      # Unit tests for domain, subdomain, and path pattern rules
```

---

## 3. Key Architectural Decisions

### 3.1 Closed Shadow DOM Encapsulation
Host websites (such as YouTube, Twitter, or Reddit) apply heavy CSS resets, CSS variables, and dark/light mode stylesheets. To guarantee that **Aware's** banners and roadblock modals render identically on all websites without styling bleed or interference:
- Elements are attached to `document.documentElement` inside a dedicated `#aware-extension-root` host element.
- An isolated shadow root is initialized via `element.attachShadow({ mode: 'closed' })`.
- Styles from `src/content/styles.css` are imported as an inline string (`?inline`) and injected into a `<style>` tag within the shadow root.

### 3.2 Dual-Tier Escalation Protocol
- Dwell time is tracked per active tab in the service worker and synchronized with the content script ticker.
- When `elapsedSeconds < gracePeriodSeconds`, only the non-intrusive bottom pill banner is shown.
- When `elapsedSeconds >= gracePeriodSeconds`, the banner automatically transitions into the full-screen roadblock.
- Completing the friction gate (10s breathing countdown or typing pledge) grants a 5-minute study pass recorded in `chrome.storage.local`.

### 3.3 Zero-External-Dependency Bundling
- Content scripts run in the isolated world of target tabs and must not rely on external module loaders.
- `scripts/build.ts` uses Vite to compile `src/content/content.ts` into a single standalone IIFE (`dist/content.js`), and `src/background/service-worker.ts` into standard ES module (`dist/background.js`).

---

## 4. Development Workflow & Commands

| Command | Description |
| :--- | :--- |
| `pnpm install` | Installs developer dependencies. |
| `pnpm run build` | Bundles popup, content script, service worker, manifest, and icons into `dist/`. |
| `pnpm run typecheck` | Runs TypeScript compiler (`tsc --noEmit`) to verify strict typing. |
| `pnpm test` | Runs matcher verification unit tests (`tests/matcher.test.ts`). |

---

## 5. Loading Unpacked in Chromium

1. Open Chrome or any Chromium browser (Edge, Brave).
2. Navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in top-right corner).
4. Click **Load unpacked** and select the `/root/aware/dist` directory.

---

## 6. Coding Guidelines for Future Agents

- **Mandatory Version Synchronization**: Every code change, feature, bug fix, or refactor MUST strictly increment the project version following Semantic Versioning across all three files synchronously:
  1. `package.json` (`"version": "X.Y.Z"`)
  2. `manifest.json` (`"version": "X.Y.Z"`)
  3. `CHANGELOG.md` (add entry under `## [X.Y.Z] - YYYY-MM-DD HH:mm IST`)
  4. Always run `pnpm run build` so `dist/manifest.json` reflects the updated version before committing.
- **Encapsulation**: Never inject unencapsulated HTML or global styles into the host page's DOM. Always utilize the existing Shadow DOM wrapper.
- **Privacy & Sanitization**: Never commit host server IPs or private credentials. Use `192.0.2.1` or `<your-vps-ip>` placeholders for documentation examples.
- **Storage Safety**: Always access extension settings and rules via `src/storage/store.ts` to maintain schema consistency and reactive badge state.
