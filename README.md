# Dream

**Your internet. Your kind of beautiful.** A local-first browser extension and visual appearance studio for AI chats. Change colors, fonts, wallpapers, and glass—not the site's navigation or functionality.

## Run the studio

```sh
npm ci
npm run dev
```

The development preview is served on port 5173, binds to `0.0.0.0`, and accepts preview-proxy hosts. It runs without extension APIs, saves locally, and explicitly explains that live websites require installation. Its mock conversation never calls an AI service.

## Build and install

```sh
npm run build
```

This produces:

- `dist/chromium/` and `artifacts/dream-chromium.zip` — unpacked Chrome 120+, Brave, Edge, and other compatible Chromium browsers.
- `dist/firefox/` and `artifacts/dream-firefox.zip` — Firefox 140+, temporary/developer installation. Permanent distribution requires Mozilla signing.

In the studio, **Get the extension** offers downloads from the development server and installation instructions. Generated bundles, packages, test browsers, and screenshots are deliberately ignored by Git. Run the build before using the download buttons on a fresh checkout.

See [the installation guide](docs/INSTALL.md). No store submission, signing, or Safari package is included.

## Features

- Six curated palettes; edit seven individual semantic colors with a color picker or hex input.
- Live, illustrative chat previews for 13 AI providers; light/dark theme filters.
- Four local font stacks, without external font services or changing text sizes. Icon fonts retain their original family.
- Three bundled wallpapers and private JPG/PNG/WebP uploads (resized/optimized locally).
- Glass, opacity, blur, wallpaper dimming, and text contrast guidance.
- Named appearance profiles (up to 50), rename/duplicate controls, delete confirmation, reset, and a 20-step appearance undo history. Continuous slider adjustments are not individually added to history.
- Per-site opt-in permissions, explicit access revocation, global pause, pinned per-site appearances, and exact-host custom websites (up to 100, experimental).
- Manual, operating-system light/dark, or local-time day/night switching. Choose palettes or saved profiles for each period.
- One-click solid-surface text/link contrast improvement, with mixed-surface and wallpaper limitations explained.
- JSON backups; defensive validation on imports. Imports never grant permissions or activate new sites.
- Code and syntax-color preservation, reduced-motion support, keyboard-accessible dialogs, responsive navigation.
- No accounts, subscriptions, telemetry, remote code, conversation collection, or AI API calls.

## Site directory

ChatGPT, Gemini, Claude, DeepSeek, Arena, Qwen, Kimi, Z.ai / GLM, Grok, Perplexity, Copilot, Le Chat, and Poe. Canonical URLs and research are recorded in [docs/SITES.md](docs/SITES.md).

These are supported **directory entries**, not a claim of exhaustive testing on every authenticated live service. All use the same conservative color-classification engine. Website markup changes, Shadow DOM, iframes, images, SVG/canvas, browser-protected pages, and custom font layouts can limit coverage. Safari/mobile require separate work. No extension can honestly guarantee zero bugs or perfect customization on every website.

## How it works

```
src/main.jsx                 React studio and illustrative live preview
src/styles.css               Responsive studio styles
src/AutomationPanel.jsx      Scheduling controls and local appearance clock
public/extension/core.js     Shared configuration, validation, site registry
public/extension/background.js  Opt-in registrations, permissions, tab injection
public/extension/content.js  Batched DOM color classification and reversible CSS
public/wallpapers/           Self-contained background assets
scripts/package.mjs         Browser manifests, PNG icons, ZIP artifacts
```

The MV3 service worker registers bundled scripts only for enabled/granted hosts and injects into already open permitted tabs. The content engine classifies existing background/text/border colors, adds its own stylesheet and attributes, and observes dynamic content in bounded batches. It changes no page structure or conversation text. Disabling a site or globally pausing removes Dream's stylesheet and attributes. Permission revocation also disables the site in stored state so existing pages are restored.

A paused/disabled site keeps its browser permission until explicitly revoked with the shield control in Your websites or in browser settings. The UI warns if a broader browser-granted permission remains. Custom sites require HTTPS and exact hosts. The main editor runs as an extension options tab opened by the toolbar action, not a cramped popup.

Settings are stored in `storage.local`; preview settings use `localStorage`. Browser storage quotas still apply, particularly when many profiles contain uploaded images. No misleading “unlimited storage” claim is made. See [privacy](docs/PRIVACY.md).

## Verification

```sh
npm test               # configuration/security and mocked worker lifecycle tests
npm run build          # production build and both browser packages
npm run test:browser   # Playwright studio and real-DOM engine tests
npm run check          # unit tests + build
npm run format:check   # formatting
```

Browser tests cover theme persistence, live controls, uploads, profiles, undo/reset, import/export, permission messaging, ZIP downloads, viewport widths 360–1440, dynamic/streaming elements, code/SVG/native action preservation, per-site pinning, idempotent injection, and complete removal. The engine runs in Chromium on local page fixtures with a mocked extension storage bridge, **not live authenticated third-party chats**. Worker APIs are independently unit-tested with mocks. Scheduler boundaries, live OS changes, icon fonts, late-batch accent buttons, permission denials/revocation, and profile editing have regression coverage. Real Chrome/Brave/Edge/Firefox installation and provider-by-provider visual checks remain release tasks.

The Linux test browser is supplied through `@sparticuz/chromium` from npm. `scripts/browser-runtime.mjs` extracts required sandbox libraries to the OS temp directory. It does not alter extension runtime security. Set up a local Playwright browser/config if testing on a different operating system.

## Assets

The Inter font is bundled under the SIL Open Font License (see `public/fonts/OFL.txt`). UI icons are Lucide. The lavender-dunes image is AI-generated; the other wallpaper SVGs and Dream mark are original assets made for this project. Provider names/marks identify their respective services; Dream is independent and unaffiliated.

## Version 1.1

See [release notes](docs/CHANGELOG.md). Scheduling is opt-in and requires no new permissions. Saved version-1 backups remain compatible; their missing automation settings default to manual. Appearance edits (including Reset/Undo) pause automation; pinned sites take precedence over it. Timers use the device’s local time and recheck on tab visibility changes rather than keeping a service worker alive. No server, geolocation, or alarm permission is used.
