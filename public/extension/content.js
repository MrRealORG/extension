(() => {
  if (globalThis.__dreamEngine) {
    globalThis.__dreamEngine.reload().catch(console.warn);
    return;
  }
  const api = globalThis.browser || globalThis.chrome,
    C = globalThis.DreamCore;
  let style = null,
    observer = null,
    active = false,
    theme = null,
    frame = 0,
    pending = new Set(),
    currentState = null,
    readVersion = 0,
    automationTimer = null;
  const systemPreference = matchMedia("(prefers-color-scheme: dark)");
  function stripMarks(el) {
    for (const a of ["bg", "fg", "border", "code", "link", "icon-font"])
      el.removeAttribute(`data-dream-${a}`);
  }
  const marked = new Set();
  const excluded =
    "svg, svg *, img, video, canvas, iframe, math, math *, [data-dream-ignore], [data-dream-ignore] *";
  function color(value) {
    const m = value.match(/[\d.]+/g);
    return m && m.length >= 3
      ? { r: +m[0], g: +m[1], b: +m[2], a: m[3] === undefined ? 1 : +m[3] }
      : null;
  }
  function saturated(c) {
    return c && Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b) > 65;
  }
  function scan(el) {
    if (
      !(el instanceof HTMLElement) ||
      el.matches(excluded) ||
      ["STYLE", "SCRIPT", "LINK", "META", "NOSCRIPT"].includes(el.tagName)
    )
      return;
    if (theme.preserveCode && el.closest("pre,code,kbd,samp")) {
      stripMarks(el);
      el.setAttribute("data-dream-code", "");
      marked.add(el);
      return;
    }
    if (el.hasAttribute("data-dream-bg") || el.hasAttribute("data-dream-fg")) {
      marked.add(el);
      return;
    }
    const css = getComputedStyle(el),
      bg = color(css.backgroundColor),
      fg = color(css.color);
    if (css.display === "none") return;
    if (
      /icon|symbol|fontawesome|font awesome|glyph|codicon|octicon/i.test(
        css.fontFamily,
      )
    )
      el.setAttribute("data-dream-icon-font", "");
    if (el.matches("a[href]")) el.setAttribute("data-dream-link", "");
    const isAction = el.matches('button,[role="button"],input[type="submit"]');
    if (bg && bg.a > 0.05 && css.backgroundImage === "none") {
      let role = "surface";
      if (
        el === document.body ||
        el === document.documentElement ||
        el.matches('main,[role="main"],#root,#__next,#app')
      )
        role = "bg";
      else if (
        el.matches(
          'aside,nav,[role="navigation"],[data-testid*="sidebar"],[class*="sidebar" i]',
        )
      )
        role = "sidebar";
      else if (saturated(bg) && isAction) role = "accent";
      el.setAttribute("data-dream-bg", role);
    }
    if (fg && fg.a > 0 && !saturated(fg)) {
      const faded =
        fg.a < 0.7 || /muted|secondary|placeholder/.test(el.className || "");
      el.setAttribute("data-dream-fg", faded ? "muted" : "text");
    }
    if (
      parseFloat(css.borderTopWidth) ||
      parseFloat(css.borderBottomWidth) ||
      parseFloat(css.borderLeftWidth) ||
      parseFloat(css.borderRightWidth)
    )
      el.setAttribute("data-dream-border", "");
    marked.add(el);
  }
  function schedule(root) {
    if (!active) return;
    if (root instanceof HTMLElement) {
      pending.add(root);
      root.querySelectorAll("*").forEach((el) => pending.add(el));
    }
    if (!frame) frame = requestAnimationFrame(flush);
  }
  function flush() {
    frame = 0;
    if (!active) return;
    let count = 0;
    // Read original site colors, not inherited colors from our previous batches.
    // No frame is painted while the sheet is temporarily disabled.
    if (style) style.disabled = true;
    try {
      for (const el of pending) {
        pending.delete(el);
        if (el.isConnected) scan(el);
        if (++count >= 250) break;
      }
    } finally {
      if (style) style.disabled = false;
    }
    if (pending.size) frame = requestAnimationFrame(flush);
    for (const el of marked)
      if (!el.isConnected) {
        stripMarks(el);
        marked.delete(el);
      }
  }
  function wallpaper(t) {
    return t.wallpaper === "custom"
      ? t.wallpaperData
      : t.wallpaper === "none"
        ? ""
        : api.runtime.getURL(
            `wallpapers/${t.wallpaper}.${t.wallpaper === "dunes" ? "jpg" : "svg"}`,
          );
  }
  function stylesheet(t) {
    const image = wallpaper(t),
      alpha = t.glass ? t.opacity / 100 : 1,
      font = C.FONT_MAP[t.font];
    // URLs are extension-owned or validated raster data, never arbitrary imported CSS.
    return `html[data-dream-active]{--dream-bg:${t.bg};--dream-surface:${C.rgba(t.surface, alpha)};--dream-sidebar:${C.rgba(t.sidebar, alpha)};--dream-text:${t.text};--dream-muted:${t.muted};--dream-accent:${t.accent};--dream-border:${t.border};color-scheme:${t.dark ? "dark" : "light"};background-color:${t.bg}!important;${image ? `background-image:linear-gradient(${C.rgba("#000000", t.dim / 100)},${C.rgba("#000000", t.dim / 100)}),url("${image}")!important;background-size:cover!important;background-position:center!important;background-attachment:fixed!important;` : ""}}
    html[data-dream-active] body {background:${image ? "transparent" : t.bg}!important;color:${t.text}!important;}
    html[data-dream-active] [data-dream-bg="bg"]{background-color:${image ? C.rgba(t.bg, 0.3) : t.bg}!important;}
    html[data-dream-active] [data-dream-bg="surface"]{background-color:var(--dream-surface)!important;}
    html[data-dream-active] [data-dream-bg="sidebar"]{background-color:var(--dream-sidebar)!important;}
    html[data-dream-active] [data-dream-bg="accent"][data-dream-bg]{background-color:var(--dream-accent)!important;color:${C.contrast(t.accent, "#ffffff") >= C.contrast(t.accent, "#15151a") ? "#ffffff" : "#15151a"}!important;}
    html[data-dream-active] [data-dream-bg="accent"] [data-dream-fg]{color:inherit!important;}
    html[data-dream-active] [data-dream-fg="text"]{color:var(--dream-text)!important;}
    html[data-dream-active] [data-dream-fg="muted"]{color:var(--dream-muted)!important;}
    html[data-dream-active] [data-dream-border]{border-color:var(--dream-border)!important;}
    html[data-dream-active] [data-dream-link]:not([role="button"]):not([data-dream-bg="accent"]){color:var(--dream-accent)!important;}
    html[data-dream-active] :is(input,textarea,[contenteditable="true"]){caret-color:var(--dream-accent)!important;}
    html[data-dream-active] ::placeholder{color:var(--dream-muted)!important;opacity:1!important;}
    html[data-dream-active] ::selection{background:${C.rgba(t.accent, 0.35)}!important;color:${t.text}!important;}
    html[data-dream-active] :where(body,p,span,a,button,input,textarea,select,h1,h2,h3,h4,h5,h6,li,label,[contenteditable="true"])[data-dream-fg]:not([data-dream-code]):not([data-dream-icon-font]){font-family:${font}!important;}
    ${t.preserveCode ? "html[data-dream-active] :is(pre,code,kbd,samp){font-family:monospace!important;}" : ""}
    ${t.glass ? `html[data-dream-active] :is(aside,nav,[role="navigation"],form,[role="dialog"])[data-dream-bg]{backdrop-filter:blur(${t.blur}px)!important;}` : ""}`;
  }
  function cleanup() {
    active = false;
    observer?.disconnect();
    observer = null;
    cancelAnimationFrame(frame);
    frame = 0;
    pending.clear();
    style?.remove();
    style = null;
    document.documentElement.removeAttribute("data-dream-active");
    for (const el of marked) stripMarks(el);
    clearInterval(automationTimer);
    automationTimer = null;
    marked.clear();
  }
  function applyState() {
    if (!currentState) return;
    const state = currentState,
      site = C.siteForHost(location.hostname, state);
    if (!state.enabled || !site || !state.sites[site]) {
      cleanup();
      return;
    }
    const next = C.resolveTheme(state, {
      site,
      systemDark: systemPreference.matches,
    });
    clearInterval(automationTimer);
    automationTimer = null;
    if (state.automation.mode === "schedule" && !state.siteThemes[site])
      automationTimer = setInterval(() => {
        if (document.visibilityState !== "hidden") applyState();
      }, 30000);
    if (active && theme?.preserveCode === next.preserveCode) {
      theme = next;
      style.textContent = stylesheet(theme);
      return;
    }
    cleanup();
    if (state.automation.mode === "schedule" && !state.siteThemes[site])
      automationTimer = setInterval(() => {
        if (document.visibilityState !== "hidden") applyState();
      }, 30000);
    theme = next;
    active = true;
    // Classify before adding our stylesheet, so original site colors remain the reference.
    document.querySelectorAll("body,body *").forEach((el) => pending.add(el));
    flush();
    style = document.createElement("style");
    style.id = "dream-colors";
    style.textContent = stylesheet(theme);
    (document.head || document.documentElement).append(style);
    document.documentElement.setAttribute("data-dream-active", "");
    observer = new MutationObserver((records) => {
      if (active && !style.isConnected)
        (document.head || document.documentElement).append(style);
      for (const record of records) {
        if (record.type === "childList")
          record.addedNodes.forEach((n) => {
            if (n !== style && n.parentElement !== style) schedule(n);
          });
        else {
          stripMarks(record.target);
          schedule(record.target);
        }
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "hidden", "style"],
    });
  }
  async function reload() {
    const version = ++readVersion;
    const saved = await api.storage.local.get("dream");
    if (version !== readVersion) return;
    currentState = C.sanitizeState(saved.dream);
    applyState();
  }
  globalThis.__dreamEngine = { reload, cleanup };
  api.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.dream) {
      ++readVersion;
      currentState = C.sanitizeState(changes.dream.newValue);
      applyState();
    }
  });
  systemPreference.addEventListener("change", () => applyState());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "hidden") applyState();
  });
  reload().catch(console.warn);
})();
