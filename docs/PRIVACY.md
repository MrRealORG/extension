# Dream privacy

Dream does not collect telemetry, run analytics, send conversations, contact an AI API, or provide an account/cloud service. Application code, fonts, and built-in wallpapers are bundled. Opening a listed chat's external link visits that provider normally and is subject to that provider's policy.

Appearance settings, enabled site choices, profiles, and uploaded images are stored only in the current browser's local storage (`chrome.storage.local` / `browser.storage.local` for the extension; localStorage for the web preview). Exported JSON includes uploaded wallpaper data. Handle exports as personal files.

The color engine inspects element types and computed CSS on explicitly permitted pages. It does not read, save, or transmit conversation text. It adds removable data attributes and a stylesheet, never moves page elements or edits their text. No sites are enabled by default. HTTPS host access is requested only in response to the user's enable action.

Permissions: `storage` saves preferences. `scripting` registers/injects the local theme engine. Optional HTTPS host permissions allow users to choose supported or custom websites. No cookies, history, microphone, clipboard, or background network access is requested. Fonts and built-in wallpapers never load from remote CDNs.

Uninstalling the extension clears its stored preferences. To clear the web preview, remove site data through the browser. To keep a backup, export it first.
