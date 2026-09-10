# Contributing to Aware

Thank you for your interest in contributing to **Aware**! We appreciate bug reports, feature suggestions, and pull requests that keep our focus tool minimal, effective, and reliable.

---

## 🛠️ Development Setup

### Prerequisites
* **Node.js**: >= 22.x
* **pnpm**: >= 10.x (`pnpm` is our preferred package manager; avoid using `npm` or `yarn`)

### Getting Started

```bash
# Clone your fork or branch
git clone https://github.com/Fire162/aware.git
cd aware

# Install dependencies
pnpm install

# Build the extension into dist/
pnpm run build

# Run unit tests
pnpm test

# Run strict TypeScript checks
pnpm run typecheck
```

---

## 🏗️ Architectural Guidelines

1. **Closed Shadow DOM Encapsulation**:
   * All in-page UI components (floating banner, roadblock modals) must remain strictly encapsulated inside the Closed Shadow DOM (`element.attachShadow({ mode: 'closed' })`).
   * Never inject global classes or stylesheets into the host page DOM to prevent collisions with third-party web apps.

2. **Single Responsibility & Minimal Dependencies**:
   * Prefer native browser APIs and built-in Node.js modules over heavy external packages.
   * Content script bundles must stay compact, fast, and self-contained.

3. **Privacy & Security**:
   * Aware operates 100% locally on-device. Do not add telemetry or remote tracking.
   * Never commit server IP addresses, credentials, or private keys.

---

## 📋 Pull Request Process

1. **Create a Branch**: Use a descriptive branch name (e.g. `feat/custom-grace-presets` or `fix/youtube-shorts-matching`).
2. **Write Focused Commits**: Keep commit messages concise, clear, and focused on the single logical change.
3. **Run Checks**: Ensure `pnpm run typecheck`, `pnpm test`, and `pnpm run build` all pass cleanly before opening your PR.
4. **Open a PR**: Describe what was changed, why it matters, and how you verified the fix or feature.
