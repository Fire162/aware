<div align="center">

<img src="./public/icons/icon128.png" width="96" height="96" alt="Aware Logo" />

# Aware

### Mindful Distraction Interventions & Focus Guard for Chrome

[![Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Bundled_with-Vite_6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Package Manager](https://img.shields.io/badge/pnpm-11.x-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<p align="center">
  <strong>Aware</strong> is an intentional browser extension that prevents mindless scrolling and restores your attention to what truly matters: your craft, study, and deep work.
</p>

</div>

---

## 🌟 Key Highlights

* **Immediate Fullscreen Barrier (`document_start`)**: Injected before target page DOM finishes rendering. The distracting website is 100% blocked behind an opaque guard screen with zero video or thumbnail flash.
* **Canvas Anti-OCR & Anti-Copy Protection**: The 203-word commitment pledge is rendered onto an HTML5 `<canvas>` with anti-OCR geometric mesh. DOM text selection, clipboard copying, drag-and-drop, and context menus are completely suppressed.
* **Brutal 203-Word Exact Typing Gate**: Requires character-by-character typing with zero typos, tracking real-time word progress (`X / 203 words`) before unlock is possible.
* **Productive Focus Site Redirection**: Pressing <kbd>Esc</kbd> or clicking *"Return to Work"* instantly redirects the tab to your designated study/work site (e.g. `https://github.com` or `https://leetcode.com`).
* **Strict 15-Second Session Ceiling**: Completing the pledge unlocks access for **strictly at most 15 seconds** with a high-urgency countdown HUD before the guard re-locks.
* **Integrated YouTube Shorts Purger**: Automatically strips Shorts carousels, shelves, and navigation links from YouTube and redirects Shorts URLs.
* **Closed Shadow DOM Isolation**: Guarantees zero CSS leaks or styling collisions with host web pages.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Browser Context
        UserTab["User navigates to distracting site"]
        ServiceWorker["Background Service Worker (service-worker.ts)"]
        ContentScript["Content Script (content.ts at document_start)"]
        ShortsFilter["Shorts DOM Purger"]
        ShadowRoot["Closed Shadow DOM Container"]
        Storage["chrome.storage.local (Rules, Settings & Stats)"]
    end

    UserTab -->|Navigation change| ServiceWorker
    ServiceWorker -->|Check domain rules| Storage
    Storage -->|Rule match detected| ServiceWorker
    ServiceWorker -->|Transmit hardcore guard status| ContentScript
    ContentScript -->|Purge Shorts elements| ShortsFilter
    ContentScript -->|Attach opaque barrier| ShadowRoot

    ShadowRoot -->|State: Guard Active| CanvasRoadblock["Canvas Anti-OCR Barrier\n• 203-word exact typing\n• Paste/drag blocked\n• Return to Focus Site (Esc)"]
    ShadowRoot -->|State: Unlocked| PassHUD["15s Temporary Pass HUD\n• Live countdown\n• Re-locks upon expiry"]

    CanvasRoadblock -->|Click Return or Esc| Redirect["Redirect tab to Focus Site\n(e.g., https://github.com)"]
    CanvasRoadblock -->|Type 203w 100%| GrantPass["Grant strictly max 15s access"]
    GrantPass --> PassHUD
    PassHUD -->|15s expires| CanvasRoadblock

---

## 🔄 Two-Tier Intervention Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Tab as Target Tab (e.g. reddit.com)
    participant Content as Content Script
    participant Worker as Background Worker
    participant Shadow as Shadow DOM UI

    User->>Tab: Opens distracting site
    Tab->>Worker: Navigation event
    Content->>Worker: Request page status
    Worker-->>Content: Status: Distracting (Grace: 120s)
    Content->>Shadow: Mount Tier 1 Gentle Nudge Pill
    Note over User,Shadow: Live stopwatch ticks dwell time

    alt User closes tab
        User->>Shadow: Clicks 'Close Tab' (or presses Esc)
        Shadow->>Worker: Close tab message
        Worker->>Tab: Close tab & record metric
    else User stays beyond grace period (120s)
        Content->>Shadow: Transition to Tier 2 Roadblock
        Shadow->>User: Fullscreen blur + 10s mindful breath
        User->>Shadow: Completes 10s mindfulness pause
        Shadow->>Worker: Grant 5-minute study pass
        Worker-->>Shadow: Pass granted, dismiss overlay
    end
```

---

## ⚡ Quick Start & Development

### 1. Prerequisites
* **Node.js** >= 22.x
* **pnpm** >= 10.x

### 2. Installation & Build

```bash
# Clone the repository
git clone https://github.com/Fire162/aware.git
cd aware

# Install dependencies
pnpm install

# Build extension into dist/
pnpm run build
```

### 3. Load into Chromium Browser
1. Open Google Chrome, Brave, or Microsoft Edge.
2. Navigate to `chrome://extensions`.
3. Toggle on **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the `/root/aware/dist` folder.
5. Pin **Aware** to your extension toolbar.

---

## 🛠️ CLI Scripts

| Command | Purpose |
| :--- | :--- |
| `pnpm run build` | Compiles the popup, content script (IIFE), and service worker (ES) into `dist/`. |
| `pnpm run typecheck` | Executes strict TypeScript compilation checks (`tsc --noEmit`). |
| `pnpm test` | Runs the automated domain and path matching test suite. |

---

## 💡 Feature Matrix

| Feature | Aware | Traditional Site Blockers |
| :--- | :---: | :---: |
| **Mindful Gentle Nudge (Tier 1)** | ✅ Yes (Subtle Pill) | ❌ Abrupt Block / Redirect |
| **Encapsulated Closed Shadow DOM** | ✅ Zero CSS Bleed | ⚠️ Often distorted by host CSS |
| **Intentional Friction Gates** | ✅ 10s Breath or Focus Pledge | ❌ Password or Hard Lockout |
| **Custom Focus Mantras** | ✅ Displayed on nudges & roadblocks | ❌ Generic block text |
| **1-Click Active Tab Guard** | ✅ In Popup | ❌ Manual settings input |
| **Local Privacy** | ✅ 100% on-device local storage | ⚠️ Cloud telemetry in some tools |

---

> [!NOTE]
> All metrics and custom rules are saved locally via `chrome.storage.local`. No personal browsing history or analytics are ever sent to external servers.

> [!TIP]
> You can press the <kbd>Esc</kbd> key at any time while the floating nudge or roadblock is visible to immediately close the distracting tab.

> [!IMPORTANT]
> If you need to access educational videos on YouTube, you can customize path rules in `src/utils/presets.ts` or grant yourself a 5-minute study pass via the mindful friction gate.

---

<details>
<summary><strong>Troubleshooting & FAQ</strong></summary>

### The nudge doesn't appear on a specific site
Ensure the site is added to your active rules in the extension popup. You can click **Add to Guard** while visiting the page to register it instantly.

### Why is Closed Shadow DOM used?
Major web platforms like YouTube and Twitter have aggressive style resets and CSS custom properties that break standard DOM overlays. Closed Shadow DOM encapsulates all styles and DOM elements so the extension looks pristine anywhere.

</details>

---

## 📄 License
This project is open-source software licensed under the [MIT License](LICENSE).
