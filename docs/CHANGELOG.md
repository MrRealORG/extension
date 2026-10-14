# Dream releases

## 1.1.0 — 2026-10-14

### Added

- Opt-in operating-system light/dark switching and local-time day/night schedules, including overnight intervals.
- Separate day/night palette or saved-profile choices, with pinned-site precedence and safe fallback when a profile is deleted.
- Live schedule status in Settings and a notice when automatic switching controls the editor.
- Profile rename and duplicate actions. Imported duplicate/empty profile identifiers are filtered.
- Solid-surface contrast improvement for primary text, secondary text, and links; mixed-surface limitations are reported.
- Confirmed exact-origin permission revocation and custom-site removal. Broader retained browser permissions produce an explicit warning.

### Fixed

- Accent-button text could lose its readable foreground to a later CSS rule.
- On large pages, later classification batches could mistake Dream's already-applied colors for original site colors. Each batch now reads with the Dream sheet synchronously disabled, restoring it before the next paint.
- Native class/inline-style changes are reclassified, and removed Dream stylesheets are restored while enabled.
- Detached elements lose Dream's metadata, avoiding stale markers when a site reuses DOM nodes.
- Code links and explicitly ignored text no longer receive the generic link/font overrides.
- Icon font families are exempt from font substitution so labels such as “menu” do not replace font-based icons.
- Superseded async storage reads no longer replace newer content-engine state.
- Default wallpaper dimming now consistently uses the configured default.

### Efficiency and compatibility

- Appearance-only saves no longer reregister and reinject scripts into every permitted tab. Registration changes or extension updates still trigger injection.
- Scheduling uses local document timers, media queries, and visibility events; it adds no extension permissions or background service.
- Existing version-1 settings and backups remain compatible; automatic switching defaults to manual.
- Chromium and Firefox developer packages rebuilt. These remain unsigned/unpublished development builds. Real provider-by-provider authenticated testing, Safari conversion, and store submission remain release tasks.
