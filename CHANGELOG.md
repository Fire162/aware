# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-09-11 02:06 IST

### Added
* Hardcore immediate fullscreen takeover at `document_start` completely blocking site rendering and thumbnail flashes.
* Canvas-rendered 203-word pledge with anti-OCR geometric mesh and text non-selection.
* Anti-cheat input protections blocking clipboard paste, drag-and-drop, context menus, and keyboard paste shortcuts.
* Real-time character-by-character validation engine with live word count tracking and zero-tolerance typo detection.
* Productive Focus Site redirection (redirecting directly to user-defined study/work URL upon pressing Esc or clicking Return to Work).
* Strict 15-second maximum session extension limit with live countdown HUD.
* Built-in YouTube Shorts purger removing Shorts shelves, sidebar entry links, and redirecting Shorts video URLs.
* Expanded dashboard customization with Focus Site manager, pledge editor, and security toggles.

## [1.0.0] - 2026-09-11 01:53 IST

### Added
* Manifest V3 extension core with background service worker and content script injection.
* Tier 1 non-intrusive floating nudge pill displaying dwell time, custom focus mantra, and quick tab exit action.
* Tier 2 full-screen mindful roadblock activating after a configurable grace period (default: 2 minutes).
* Intentional friction gates: 10-second guided breathing mindfulness pause and commitment pledge input to unlock timed 5-minute study passes.
* Closed Shadow DOM encapsulation preventing host website stylesheet bleed.
* Curated preset rules for major distraction platforms (YouTube, Reddit, X/Twitter, Instagram, TikTok, Netflix, Twitch, Facebook, Threads).
* Wildcard path pattern matching engine for granular rules (e.g. restricting YouTube Shorts while keeping lectures accessible).
* Extension action popup with 4 dedicated tabs: Rules Manager (including 1-click active tab guard), Focus Mantra Editor, Daily Focus Analytics, and Configuration.
* Programmatic multi-target Vite bundler producing self-contained IIFE content script and ES service worker in `dist/`.
* Automated test suite covering hostname extraction, preset rule matching, and path filtering.
* High-resolution minimalist extension icons (16px, 48px, 128px).
