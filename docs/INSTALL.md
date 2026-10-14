# Install Dream

## Chrome, Brave, Edge, Opera, Vivaldi (desktop Chromium)

1. Download `dream-chromium.zip` and extract it. Or build from source with `npm ci && npm run build`.
2. Open `chrome://extensions`, `brave://extensions`, or `edge://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked**, then choose the extracted folder that contains `manifest.json` (from source: `dist/chromium`).
5. Pin Dream in the toolbar. Click its icon to open the full-page studio.
6. Open **Your websites** and enable a website. Approve the browser's site-access prompt.
7. Open that website. Already open permitted tabs are also updated. If a website was not fully loaded, reload it once.
8. Customize your theme. Changes automatically update your enabled sites. Turning a site or Dream off restores the original page styles.

The full-page studio is intentional; tiny browser popups aren't a good fit for this editor.
Unpacked extensions require the extracted directory to stay on your computer.

## Firefox desktop 140+

Use `dream-firefox.zip`, not the Chromium build.
Extract it, open `about:debugging#/runtime/this-firefox`, select **Load Temporary Add-on**, and choose its `manifest.json` (source: `dist/firefox/manifest.json`).
This install disappears on restart. For permanent distribution, sign the Firefox package through Mozilla Add-ons. The repository does not include a signed release.

## Safari / mobile

Not packaged or tested for Safari. Safari needs Apple's Web Extension conversion tools, an Xcode project, testing, and signing. Chrome and Brave mobile do not support ordinary desktop extensions. Dream cannot modify browser settings pages, extension pages, browser stores, PDF viewers, or protected pages.

## Website access

No websites are granted by default. Each site requests only its associated HTTPS origins, at your click. Disabling a site stops customization but keeps the existing browser permission. Use its shield control in **Your websites** to revoke exact-host access, or remove permissions in browser settings. Removing a custom site also requests permission revocation. If broader all-site access was granted separately, Dream warns you to revoke it in browser settings; it still stops styling that site. Custom domains are exact hostnames, so `example.com` and `www.example.com` are different entries.

**Follow my theme** uses your current global appearance. **Pin current appearance** freezes a copy for that site; future global edits don't overwrite it. Choose Follow, then Pin again, to replace a pinned appearance.

## Backups and privacy

Use Settings → Export to save your profiles and appearance as JSON. Imports do not enable websites or request permissions. A preview opened as an ordinary website and an installed extension have separate storage; export/import to transfer the appearance.

Profiles store snapshots, including uploaded wallpapers. At most 50 profiles and 100 custom websites are supported. These aren't unlimited-storage promises: browser storage quotas still apply. Wallpaper uploads accept JPG/PNG/WebP, resize to a maximum 1920-pixel edge, and save an optimized JPEG locally. Remove oversized/repeated wallpaper profiles if local storage fills up.

## Visual compatibility

The live preview is illustrative, not an embedded or pixel-identical version of another company's UI. Live websites use the same appearance settings with a color-classification engine, preserving native layout and interaction. External pages can change at any time. Images, canvas, SVG, embedded frames, Shadow DOM, background-image surfaces, highly saturated semantic colors, and code (by default) are intentionally left alone. It is not possible to promise perfect coverage or zero bugs across arbitrary websites.

If colors look wrong: disable glass, pick a high-contrast palette, then disable the site to restore its original appearance. Dream never modifies conversations or replaces page HTML.

## Automatic appearance switching (1.1)

In **Settings → A rhythm of your own**, choose manual, follow your device, or a local-time schedule. Day and night can use any curated palette or saved profile. Curated palettes keep the current wallpaper, font, and glass settings; profiles restore a full snapshot. Schedules handle overnight intervals. Day and night start times must differ; identical times revert to 07:00 / 19:00.

Changes are checked every 30 seconds in awake tabs and on returning to a sleeping tab. System light/dark changes are observed directly. Pinned sites ignore automation. Pausing Dream overrides it. Editing appearance, using a profile, Reset, or Undo switches back to manual mode so edits take effect immediately. Reactivate automation in Settings when ready. Deleting a referenced profile falls back to the default day/night palette.

The **Improve text contrast** button compares text, secondary text, and links against the solid background, card, and sidebar colors. It never intentionally lowers their worst solid-surface contrast. Images and translucent glass can vary, so no automated wallpaper contrast guarantee is made. Strongly mixed surfaces may still need individual edits.

To update an existing unpacked installation, replace its extracted files with the new package, then use the browser's extension **Reload** button. Keep a backup first. Do not remove the extension unless you intend to clear its preferences.
