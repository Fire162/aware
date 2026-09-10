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

* **Zero-Network Loading Interception**: Intercepts navigation via `chrome.webNavigation.onBeforeNavigate` *before* the network request is initiated. Not a single byte of video, image, feed, or HTML is ever downloaded from the distracting site.
* **Dedicated Local Extension Guard Page (`guard/index.html`)**: The guard runs inside the local extension sandbox. Host website scripts (like YouTube's shortcuts or background audio) physically cannot execute.
* **Canvas Anti-OCR & Anti-Copy Protection**: The 203-word commitment pledge is rendered onto an HTML5 `<canvas>` with an anti-OCR geometric mesh. DOM text selection, clipboard copying, drag-and-drop, and context menus are completely blocked.
* **Brutal 203-Word Exact Typing Gate**: Requires character-by-character manual typing with zero typos, tracking live word count (`X / 203 words`) before unlock is enabled.
* **Productive Focus Site Redirection**: Pressing <kbd>Esc</kbd> or clicking *"Return to Focus Site"* instantly redirects the tab to your designated study/work site (e.g., `https://github.com` or `https://leetcode.com`).
* **Strict 15-Second Temporary Pass**: 100% pledge completion unlocks the site for **strictly at most 15 seconds** with a high-urgency countdown HUD before the guard re-intercepts and pulls the tab back to the guard page.
* **Integrated YouTube Shorts Purger**: Automatically strips Shorts carousels, shelves, and navigation links from YouTube and redirects Shorts URLs.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Browser Engine
        NavEvent["User navigates to distracting site (e.g., youtube.com)"]
        ServiceWorker["Background Service Worker (service-worker.ts)"]
        LocalGuard["Local Extension Guard Page (guard/index.html)"]
        FocusSite["Productive Focus Site (e.g., https://github.com)"]
        TargetSite["Target Site with 15s Countdown HUD"]
    end

    NavEvent -->|onBeforeNavigate before HTTP request| ServiceWorker
    ServiceWorker -->|Active pass exists?| PassCheck{Active Pass?}

    PassCheck -->|No Pass: Zero Data Loaded| LocalGuard
    PassCheck -->|Pass Active < 15s| TargetSite

    LocalGuard -->|Press Esc or 'Return to Focus'| FocusSite
    LocalGuard -->|100% 203w Pledge Completed| Unlock["Grant strictly max 15s pass"]
    Unlock --> TargetSite
    TargetSite -->|15s Expired| LocalGuard

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
